import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

type SheetData = Record<string, unknown>[];

async function getForecastRows(clientId: string, anio: number, mes: number): Promise<SheetData> {
  const data = await prisma.forecastGasto.findMany({
    where: { clientId, anio, mes },
    orderBy: { forecast: "desc" },
  });
  return data.map((r) => ({
    Año: r.anio,
    Mes: r.mes,
    Dirección: r.direccion,
    Área: r.area,
    Budget: r.budget,
    Forecast: r.forecast,
    "% Var.": r.budget > 0 ? ((r.forecast / r.budget) * 100).toFixed(1) + "%" : "N/A",
    "HC Budget": r.hcBudget,
    "HC Forecast": r.hcForecast,
  }));
}

async function getHcRows(clientId: string, anio: number, mes: number): Promise<SheetData> {
  const data = await prisma.historicoData.findMany({
    where: { clientId, anio, mes },
  });
  return data.map((r) => ({
    Año: r.anio,
    Mes: r.mes,
    Población: r.poblacion,
    "HC Presupuestado": r.hcPresupuesto,
    "HC Real": r.hcReal,
    Forecast: r.forecast,
    Real: r.real,
    Budget: r.budget,
    Altas: r.altas,
    Bajas: r.bajas,
    "% Rotación": r.hcReal > 0 ? ((r.bajas / r.hcReal) * 100).toFixed(1) + "%" : "N/A",
  }));
}

async function getComercialRows(clientId: string, anio: number, mes: number): Promise<SheetData> {
  const data = await prisma.comisionMensual.findMany({
    where: { clientId, anio },
    orderBy: { mes: "asc" },
  });
  return data.map((r) => ({
    Año: r.anio,
    Mes: r.mes,
    "HC Proyectado": r.hcProyectado,
    Presupuestado: r.presupuestado,
    "HC Real": r.realHc,
    "Costo Real": r.realCosto,
    "Var HC": r.realHc - r.hcProyectado,
    "% Ejecución": r.presupuestado > 0 ? ((r.realCosto / r.presupuestado) * 100).toFixed(1) + "%" : "N/A",
  }));
}

function addSheet(wb: XLSX.WorkBook, rows: SheetData, name: string) {
  const ws = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{}]);
  XLSX.utils.book_append_sheet(wb, ws, name);
}

function toResponse(wb: XLSX.WorkBook, fileName: string) {
  const buffer: Buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ module: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { module } = await params;
  const anio = parseInt(req.nextUrl.searchParams.get("anio") ?? "2026");
  const mes = parseInt(req.nextUrl.searchParams.get("mes") ?? "4");
  const clientId = session.user.clientId;
  const pad = (n: number) => String(n).padStart(2, "0");

  const wb = XLSX.utils.book_new();

  if (module === "forecast") {
    addSheet(wb, await getForecastRows(clientId, anio, mes), "Forecast");
    return toResponse(wb, `forecast_${anio}_${pad(mes)}.xlsx`);
  }

  if (module === "hc") {
    addSheet(wb, await getHcRows(clientId, anio, mes), "Headcount");
    return toResponse(wb, `headcount_${anio}_${pad(mes)}.xlsx`);
  }

  if (module === "comercial") {
    addSheet(wb, await getComercialRows(clientId, anio, mes), "Comisiones");
    return toResponse(wb, `comisiones_${anio}.xlsx`);
  }

  if (module === "all") {
    const [forecast, hc, comercial] = await Promise.all([
      getForecastRows(clientId, anio, mes),
      getHcRows(clientId, anio, mes),
      getComercialRows(clientId, anio, mes),
    ]);
    addSheet(wb, forecast, "Forecast");
    addSheet(wb, hc, "Headcount");
    addSheet(wb, comercial, "Comisiones");
    return toResponse(wb, `reporte_completo_${anio}_${pad(mes)}.xlsx`);
  }

  return NextResponse.json({ error: "Módulo inválido" }, { status: 400 });
}
