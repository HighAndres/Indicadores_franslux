"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canUploadData } from "@/lib/permissions";
import type { Role, DataModule } from "@/generated/prisma/client";
import * as XLSX from "xlsx";

export type UploadState = {
  success: boolean;
  message: string;
  rows?: number;
} | null;

function norm(key: string) {
  return key
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "");
}

function getVal(row: Record<string, unknown>, aliases: string[]): unknown {
  const normalized = aliases.map(norm);
  for (const [k, v] of Object.entries(row)) {
    if (normalized.includes(norm(k))) return v;
  }
  return undefined;
}

function toNum(v: unknown): number {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

function toStr(v: unknown): string {
  return v == null ? "" : String(v).trim();
}

export async function uploadData(
  _prev: UploadState,
  formData: FormData
): Promise<UploadState> {
  const session = await auth();
  if (!session || !canUploadData(session.user.role as Role)) {
    return { success: false, message: "No tienes permisos para cargar datos." };
  }

  const module = toStr(formData.get("module")) as DataModule;
  const anio = parseInt(toStr(formData.get("anio")));
  const mes = parseInt(toStr(formData.get("mes")));
  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) {
    return { success: false, message: "Selecciona un archivo Excel (.xlsx)." };
  }
  if (!["FORECAST", "HC", "COMERCIAL"].includes(module)) {
    return { success: false, message: "Módulo inválido." };
  }
  if (isNaN(anio) || isNaN(mes) || mes < 1 || mes > 12) {
    return { success: false, message: "Año o mes inválido." };
  }

  let buffer: ArrayBuffer;
  try {
    buffer = await file.arrayBuffer();
  } catch {
    return { success: false, message: "No se pudo leer el archivo." };
  }

  let rows: Record<string, unknown>[];
  try {
    const wb = XLSX.read(buffer, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json(ws) as Record<string, unknown>[];
  } catch {
    return { success: false, message: "Error al parsear el archivo Excel." };
  }

  if (rows.length === 0) {
    return { success: false, message: "El archivo no contiene datos." };
  }

  const clientId = session.user.clientId;
  const userId = session.user.id;

  try {
    await prisma.$transaction(async (tx) => {
      if (module === "FORECAST") {
        await tx.forecastGasto.deleteMany({ where: { clientId, anio, mes } });
        await tx.forecastGasto.createMany({
          data: rows.map((r) => ({
            clientId,
            anio,
            mes,
            direccion: toStr(getVal(r, ["Dirección", "Direccion", "direccion", "DIRECCION"])),
            area: toStr(getVal(r, ["Área", "Area", "area", "AREA"])),
            real: toNum(getVal(r, ["Real", "real", "REAL"])),
            presupuesto: toNum(getVal(r, ["Presupuesto", "presupuesto", "PRESUPUESTO"])),
          })),
        });
      } else if (module === "HC") {
        const r = rows[0];
        await tx.hcColaboradores.upsert({
          where: { clientId_anio_mes: { clientId, anio, mes } },
          update: {
            total: toNum(getVal(r, ["Total", "total", "TOTAL"])),
            altas: toNum(getVal(r, ["Altas", "altas", "ALTAS"])),
            bajas: toNum(getVal(r, ["Bajas", "bajas", "BAJAS"])),
            diasLaborados: toNum(getVal(r, ["Días Laborados", "DiasLaborados", "diaslaborados", "Dias Laborados"])),
            generoM: toNum(getVal(r, ["Masculino", "masculino", "GeneroM", "generom", "M"])),
            generoF: toNum(getVal(r, ["Femenino", "femenino", "GeneroF", "generof", "F"])),
          },
          create: {
            clientId,
            anio,
            mes,
            total: toNum(getVal(r, ["Total", "total", "TOTAL"])),
            altas: toNum(getVal(r, ["Altas", "altas", "ALTAS"])),
            bajas: toNum(getVal(r, ["Bajas", "bajas", "BAJAS"])),
            diasLaborados: toNum(getVal(r, ["Días Laborados", "DiasLaborados", "diaslaborados", "Dias Laborados"])),
            generoM: toNum(getVal(r, ["Masculino", "masculino", "GeneroM", "generom", "M"])),
            generoF: toNum(getVal(r, ["Femenino", "femenino", "GeneroF", "generof", "F"])),
          },
        });
      } else if (module === "COMERCIAL") {
        await tx.comercialComision.deleteMany({ where: { clientId, anio, mes } });
        await tx.comercialComision.createMany({
          data: rows.map((r) => ({
            clientId,
            anio,
            mes,
            cadena: toStr(getVal(r, ["Cadena", "cadena", "CADENA"])),
            kam: toStr(getVal(r, ["KAM", "kam", "Kam"])),
            tienda: toStr(getVal(r, ["Tienda", "tienda", "TIENDA"])),
            real: toNum(getVal(r, ["Real", "real", "REAL"])),
            presupuesto: toNum(getVal(r, ["Presupuesto", "presupuesto", "PRESUPUESTO"])),
          })),
        });
      }

      await tx.dataUpload.create({
        data: {
          clientId,
          userId,
          module,
          anio,
          mes,
          fileName: file.name,
          rows: rows.length,
        },
      });
    });
  } catch (err) {
    console.error("Upload error:", err);
    return { success: false, message: "Error al guardar los datos. Revisa el formato del archivo." };
  }

  return {
    success: true,
    message: `${rows.length} registro${rows.length !== 1 ? "s" : ""} cargado${rows.length !== 1 ? "s" : ""} correctamente.`,
    rows: rows.length,
  };
}
