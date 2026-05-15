import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import { DownloadButton } from "@/components/dashboard/DownloadButton";
import { ForecastCharts } from "@/components/dashboard/forecast/ForecastCharts";

const fmt = (v: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(v);

export default async function ForecastPage({
  searchParams,
}: {
  searchParams: Promise<{ anio?: string; mes?: string; direccion?: string; estatus?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { anio: anioStr, mes: mesStr, direccion, estatus } = await searchParams;
  const anio = parseInt(anioStr ?? "2026");
  const mes = parseInt(mesStr ?? "4");
  const selectedEstatus = estatus ?? "Activo";

  const allData = await prisma.forecastGasto.findMany({
    where: {
      clientId: session.user.clientId, anio, mes,
      ...(selectedEstatus !== "Todos" ? { estatus: selectedEstatus } : {}),
    },
    orderBy: { forecast: "desc" },
  });

  const estatuses = await prisma.forecastGasto.findMany({
    where: { clientId: session.user.clientId, anio, mes },
    select: { estatus: true },
    distinct: ["estatus"],
  });
  const estatusList = estatuses.map((e) => e.estatus).sort();

  const direcciones = [...new Set(allData.map((r) => r.direccion))].sort();

  const data = direccion
    ? allData.filter((r) => r.direccion === direccion)
    : allData;

  const totalBudget = data.reduce((s, r) => s + r.budget, 0);
  const totalReal = data.reduce((s, r) => s + r.forecast, 0);
  const pctVar = totalBudget > 0 ? (totalReal / totalBudget) * 100 : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#238D80]">
            Real
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[#F1BE48]">
            Budget vs Real mensual
          </h1>
          <p className="mt-2 text-[#9A9A9A]">
            Comparativa por dirección y área.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Suspense>
            <PeriodSelector anio={anio} mes={mes} />
          </Suspense>
          <DownloadButton module="forecast" anio={anio} mes={mes} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <KpiCard label="Budget" value={fmt(totalBudget)} subtitle={`${data.length} áreas`} />
        <KpiCard label="Real" value={fmt(totalReal)} />
        <KpiCard
          label="% Variación"
          value={`${pctVar.toFixed(1)}%`}
          subtitle={pctVar > 100 ? "Sobre presupuesto" : "Dentro del presupuesto"}
          highlight
        />
      </div>

      {allData.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#222222] bg-[#111111] p-12 text-center">
          <p className="text-[#555555]">Sin datos para el período seleccionado.</p>
        </div>
      ) : (
        <ForecastCharts
          data={allData.map((r) => ({
            area: r.area,
            direccion: r.direccion,
            budget: r.budget,
            forecast: r.forecast,
            hcBudget: r.hcBudget,
            hcForecast: r.hcForecast,
          }))}
          direcciones={direcciones}
          selectedDireccion={direccion ?? ""}
          estatuses={estatusList}
          selectedEstatus={selectedEstatus}
        />
      )}
    </div>
  );
}
