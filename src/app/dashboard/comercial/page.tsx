import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import { DownloadButton } from "@/components/dashboard/DownloadButton";
import { ComercialCharts } from "@/components/dashboard/comercial/ComercialCharts";

const fmt = (v: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(v);

export default async function ComercialPage({
  searchParams,
}: {
  searchParams: Promise<{ anio?: string; mes?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { anio: anioStr, mes: mesStr } = await searchParams;
  const anio = parseInt(anioStr ?? "2026");
  const mes = parseInt(mesStr ?? "4");

  const data = await prisma.comisionMensual.findMany({
    where: { clientId: session.user.clientId, anio },
    orderBy: { mes: "asc" },
  });

  const current = data.find((d) => d.mes === mes);
  const pctEjecucion =
    current && current.presupuestado > 0
      ? (current.realCosto / current.presupuestado) * 100
      : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#238D80]">
            Comercial
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[#F1BE48]">
            Comisiones y Headcount
          </h1>
          <p className="mt-2 text-[#9A9A9A]">
            HC proyectado vs real y costos presupuestados vs reales.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Suspense>
            <PeriodSelector anio={anio} mes={mes} />
          </Suspense>
          <DownloadButton module="comercial" anio={anio} mes={mes} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <KpiCard
          label="Costo Real"
          value={current ? fmt(current.realCosto) : "—"}
        />
        <KpiCard
          label="Presupuestado"
          value={current ? fmt(current.presupuestado) : "—"}
        />
        <KpiCard
          label="% Ejecución"
          value={current ? `${pctEjecucion.toFixed(1)}%` : "—"}
          highlight
        />
      </div>

      {data.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#222222] bg-[#111111] p-12 text-center">
          <p className="text-[#555555]">Sin datos para el año seleccionado.</p>
        </div>
      ) : (
        <ComercialCharts
          data={data.map((r) => ({
            mes: r.mes,
            hcProyectado: r.hcProyectado,
            presupuestado: r.presupuestado,
            realHc: r.realHc,
            realCosto: r.realCosto,
          }))}
          selectedMes={mes}
        />
      )}
    </div>
  );
}
