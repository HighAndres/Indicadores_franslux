import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

type SheetData = Record<string, unknown>[];

async function getForecastRows(clientId: string, anio: number, mes: number): Promise<SheetData> {
  const data = await prisma.forecastGasto.findMany({
    where: { clientId, anio, mes },
    orderBy: { real: "desc" },
  });
  return data.map((r) => ({
    Año: r.anio,
    Mes: r.mes,
    Dirección: r.direccion,
    Área: r.area,
    Real: r.real,
    Presupuesto: r.presupuesto,
    "% Ejecución": r.presupuesto > 0 ? ((r.real / r.presupuesto) * 100).toFixed(1) + "%" : "N/A",
  }));
}

async function getHcRows(clientId: string, anio: number, mes: number): Promise<SheetData> {
  const data = await prisma.hcColaboradores.findUnique({
    where: { clientId_anio_mes: { clientId, anio, mes } },
  });
  if (!data) return [];
  return [
    {
      Año: data.anio,
      Mes: data.mes,
      "Total colaboradores": data.total,
      Altas: data.altas,
      Bajas: data.bajas,
      "Días laborados": data.diasLaborados,
      Masculino: data.generoM,
      Femenino: data.generoF,
      "% Rotación": data.total > 0 ? ((data.bajas / data.total) * 100).toFixed(1) + "%" : "N/A",
    },
  ];
}

async function getComercialRows(clientId: string, anio: number, mes: number): Promise<SheetData> {
  const data = await prisma.comercialComision.findMany({
    where: { clientId, anio, mes },
    orderBy: { real: "desc" },
  });
  return data.map((r) => ({
    Año: r.anio,
    Mes: r.mes,
    Cadena: r.cadena,
    KAM: r.kam,
    Tienda: r.tienda,
    Real: r.real,
    Presupuesto: r.presupuesto,
    "% Ejecución": r.presupuesto > 0 ? ((r.real / r.presupuesto) * 100).toFixed(1) + "%" : "N/A",
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
    addSheet(wb, await getComercialRows(clientId, anio, mes), "Comercial");
    return toResponse(wb, `comercial_${anio}_${pad(mes)}.xlsx`);
  }

  if (module === "all") {
    const [forecast, hc, comercial] = await Promise.all([
      getForecastRows(clientId, anio, mes),
      getHcRows(clientId, anio, mes),
      getComercialRows(clientId, anio, mes),
    ]);
    addSheet(wb, forecast, "Forecast");
    addSheet(wb, hc, "Headcount");
    addSheet(wb, comercial, "Comercial");
    return toResponse(wb, `reporte_completo_${anio}_${pad(mes)}.xlsx`);
  }

  return NextResponse.json({ error: "Módulo inválido" }, { status: 400 });
}
