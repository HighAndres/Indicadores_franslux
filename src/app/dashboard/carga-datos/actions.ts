"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canUploadData } from "@/lib/permissions";
import type { Role } from "@/generated/prisma/client";
import * as XLSX from "xlsx";

export type UploadState = {
  success: boolean;
  message: string;
} | null;

const MES_MAP: Record<string, number> = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
};

function parseMes(raw: string): number {
  return MES_MAP[raw.trim().toLowerCase()] ?? 0;
}

function toNum(v: unknown): number {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

function toInt(v: unknown): number {
  return Math.round(toNum(v));
}

function toStr(v: unknown): string {
  return v == null ? "" : String(v).trim();
}

function getVal(row: Record<string, unknown>, key: string): unknown {
  const normKey = key.toLowerCase().replace(/\s+/g, "");
  for (const [k, v] of Object.entries(row)) {
    if (k.trim().toLowerCase().replace(/\s+/g, "") === normKey) return v;
  }
  return undefined;
}

function parseBudgetForecast(
  rows: Record<string, unknown>[],
  tipo: "budget" | "forecast"
) {
  const agg = new Map<string, { direccion: string; area: string; mes: number; estatus: string; costo: number; hc: number }>();

  for (const row of rows) {
    const mesStr = toStr(getVal(row, "MES"));
    const mes = parseMes(mesStr);
    if (mes === 0) continue;

    const direccion = toStr(getVal(row, "DIRECCION"));
    const area = toStr(getVal(row, "AREA FORECAST") ?? getVal(row, "AREAFORECAST"));
    if (!direccion || !area) continue;

    const estatus = toStr(getVal(row, "ESTATUS")) || "Activo";

    const costoTotal = toNum(
      getVal(row, "COSTO TOTAL") ?? getVal(row, "COSTOTOTAL")
    );

    const key = `${direccion}|${area}|${mes}|${estatus}`;
    const existing = agg.get(key);
    if (existing) {
      existing.costo += costoTotal;
      existing.hc += 1;
    } else {
      agg.set(key, { direccion, area, mes, estatus, costo: costoTotal, hc: 1 });
    }
  }

  return { tipo, data: Array.from(agg.values()) };
}

function parseHistorico(rows: Record<string, unknown>[]) {
  const agg = new Map<string, {
    anio: number; mes: number; poblacion: string;
    hcPresupuesto: number; hcReal: number;
    forecast: number; real: number; budget: number;
    altas: number; bajas: number;
  }>();

  for (const r of rows) {
    const mesStr = toStr(getVal(r, "MES"));
    const mes = parseMes(mesStr);
    if (mes === 0) continue;

    const anio = toInt(getVal(r, "AÑO") ?? getVal(r, "ANO"));
    if (anio <= 0) continue;

    const poblacion = toStr(getVal(r, "POBLACION"));
    const key = `${anio}|${mes}|${poblacion}`;

    const existing = agg.get(key);
    const hcP = toInt(getVal(r, "HC P") ?? getVal(r, "HCP"));
    const hcR = toInt(getVal(r, "HC R") ?? getVal(r, "HCR"));
    const forecast = toNum(getVal(r, "FORECAST"));
    const real = toNum(getVal(r, "REAL"));
    const budget = toNum(getVal(r, "BUDGET"));
    const altas = toInt(getVal(r, "ALTAS"));
    const bajas = toInt(getVal(r, "BAJAS"));

    if (existing) {
      existing.hcPresupuesto += hcP;
      existing.hcReal += hcR;
      existing.forecast += forecast;
      existing.real += real;
      existing.budget += budget;
      existing.altas += altas;
      existing.bajas += bajas;
    } else {
      agg.set(key, { anio, mes, poblacion, hcPresupuesto: hcP, hcReal: hcR, forecast, real, budget, altas, bajas });
    }
  }

  return Array.from(agg.values());
}

function parseComisiones(rows: Record<string, unknown>[], anio: number) {
  const byLabel = new Map<string, Record<string, unknown>>();
  for (const row of rows) {
    const label = toStr(row["__EMPTY"] ?? row[""] ?? Object.values(row)[0])
      .toUpperCase()
      .replace(/\s+/g, " ")
      .trim();
    if (label) byLabel.set(label, row);
  }

  const hcProy = byLabel.get("HC PROYECTADO");
  const presup = byLabel.get("PRESUPUESTADO");
  const realHc = byLabel.get("REAL HC");
  const realCosto = byLabel.get("REAL COSTO ($)");

  const result: {
    anio: number; mes: number; hcProyectado: number;
    presupuestado: number; realHc: number; realCosto: number;
  }[] = [];

  for (const [mesName, mesNum] of Object.entries(MES_MAP)) {
    const findCol = (row: Record<string, unknown> | undefined) => {
      if (!row) return 0;
      for (const [k, v] of Object.entries(row)) {
        if (k.trim().toLowerCase().startsWith(mesName.slice(0, 3))) return toNum(v);
      }
      return 0;
    };

    result.push({
      anio,
      mes: mesNum,
      hcProyectado: toInt(findCol(hcProy)),
      presupuestado: findCol(presup),
      realHc: toInt(findCol(realHc)),
      realCosto: findCol(realCosto),
    });
  }

  return result.filter((r) => r.hcProyectado > 0 || r.presupuestado > 0 || r.realHc > 0 || r.realCosto > 0);
}

export async function uploadData(
  _prev: UploadState,
  formData: FormData
): Promise<UploadState> {
  const session = await auth();
  if (!session || !canUploadData(session.user.role as Role)) {
    return { success: false, message: "No tienes permisos para cargar datos." };
  }

  const anio = parseInt(toStr(formData.get("anio")));
  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) {
    return { success: false, message: "Selecciona un archivo Excel (.xlsx)." };
  }
  if (file.size > 20 * 1024 * 1024) {
    return { success: false, message: "El archivo no debe superar 20 MB." };
  }
  if (isNaN(anio) || anio < 2000 || anio > 2100) {
    return { success: false, message: "Año inválido." };
  }

  let buffer: ArrayBuffer;
  try {
    buffer = await file.arrayBuffer();
  } catch {
    return { success: false, message: "No se pudo leer el archivo." };
  }

  let wb: XLSX.WorkBook;
  try {
    wb = XLSX.read(buffer, { type: "array" });
  } catch {
    return { success: false, message: "Error al parsear el archivo Excel." };
  }

  const clientId = session.user.clientId;
  const userId = session.user.id;
  let sheetsProcessed = 0;
  const summary: string[] = [];

  try {
    await prisma.$transaction(async (tx) => {
      // Budget sheet
      const budgetSheet = wb.SheetNames.find((n) => n.toLowerCase().includes("budget"));
      const forecastSheet = wb.SheetNames.find((n) => n.toLowerCase().includes("forecast"));

      if (budgetSheet || forecastSheet) {
        await tx.forecastGasto.deleteMany({ where: { clientId, anio } });

        const mergedMap = new Map<string, {
          direccion: string; area: string; mes: number; estatus: string;
          budget: number; forecast: number; hcBudget: number; hcForecast: number;
        }>();

        if (budgetSheet) {
          const rows = XLSX.utils.sheet_to_json(wb.Sheets[budgetSheet]) as Record<string, unknown>[];
          const parsed = parseBudgetForecast(rows, "budget");
          for (const item of parsed.data) {
            const key = `${item.direccion}|${item.area}|${item.mes}|${item.estatus}`;
            const existing = mergedMap.get(key) ?? {
              direccion: item.direccion, area: item.area, mes: item.mes, estatus: item.estatus,
              budget: 0, forecast: 0, hcBudget: 0, hcForecast: 0,
            };
            existing.budget = item.costo;
            existing.hcBudget = item.hc;
            mergedMap.set(key, existing);
          }
          sheetsProcessed++;
          summary.push(`Budget: ${rows.length} filas`);
        }

        if (forecastSheet) {
          const rows = XLSX.utils.sheet_to_json(wb.Sheets[forecastSheet]) as Record<string, unknown>[];
          const parsed = parseBudgetForecast(rows, "forecast");
          for (const item of parsed.data) {
            const key = `${item.direccion}|${item.area}|${item.mes}|${item.estatus}`;
            const existing = mergedMap.get(key) ?? {
              direccion: item.direccion, area: item.area, mes: item.mes, estatus: item.estatus,
              budget: 0, forecast: 0, hcBudget: 0, hcForecast: 0,
            };
            existing.forecast = item.costo;
            existing.hcForecast = item.hc;
            mergedMap.set(key, existing);
          }
          sheetsProcessed++;
          summary.push(`Forecast: ${rows.length} filas`);
        }

        const forecastData = Array.from(mergedMap.values());
        if (forecastData.length > 0) {
          await tx.forecastGasto.createMany({
            data: forecastData.map((d) => ({
              clientId, anio, mes: d.mes,
              direccion: d.direccion, area: d.area, estatus: d.estatus,
              budget: d.budget, forecast: d.forecast,
              hcBudget: d.hcBudget, hcForecast: d.hcForecast,
            })),
          });
        }
      }

      // Historico sheet
      const historicoSheet = wb.SheetNames.find((n) => n.toLowerCase().includes("histori"));
      if (historicoSheet) {
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[historicoSheet]) as Record<string, unknown>[];
        const parsed = parseHistorico(rows);

        const years = [...new Set(parsed.map((r) => r.anio))];
        for (const y of years) {
          await tx.historicoData.deleteMany({ where: { clientId, anio: y } });
        }

        if (parsed.length > 0) {
          await tx.historicoData.createMany({
            data: parsed.map((r) => ({ clientId, ...r })),
          });
        }
        sheetsProcessed++;
        summary.push(`Histórico: ${parsed.length} filas`);
      }

      // Comisiones sheet
      const comisionesSheet = wb.SheetNames.find((n) => n.toLowerCase().includes("comisi"));
      if (comisionesSheet) {
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[comisionesSheet]) as Record<string, unknown>[];
        const parsed = parseComisiones(rows, anio);

        await tx.comisionMensual.deleteMany({ where: { clientId, anio } });

        if (parsed.length > 0) {
          await tx.comisionMensual.createMany({
            data: parsed.map((r) => ({ clientId, ...r })),
          });
        }
        sheetsProcessed++;
        summary.push(`Comisiones: ${parsed.length} meses`);
      }

      await tx.dataUpload.create({
        data: {
          clientId, userId, anio,
          fileName: file.name,
          sheets: sheetsProcessed,
        },
      });
    });
  } catch (err) {
    console.error("Upload error:", err);
    return { success: false, message: "Error al guardar los datos. Revisa el formato del archivo." };
  }

  if (sheetsProcessed === 0) {
    return { success: false, message: "No se encontraron hojas válidas (Budget, Forecast, Historico, Comisiones)." };
  }

  return {
    success: true,
    message: `${sheetsProcessed} hoja${sheetsProcessed !== 1 ? "s" : ""} procesada${sheetsProcessed !== 1 ? "s" : ""}. ${summary.join(" · ")}`,
  };
}
