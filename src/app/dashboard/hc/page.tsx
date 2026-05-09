import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import { DownloadButton } from "@/components/dashboard/DownloadButton";
import { HcCharts } from "@/components/dashboard/hc/HcCharts";

export default async function HcPage({
  searchParams,
}: {
  searchParams: Promise<{ anio?: string; mes?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { anio: anioStr, mes: mesStr } = await searchParams;
  const anio = parseInt(anioStr ?? "2026");
  const mes = parseInt(mesStr ?? "4");

  const data = await prisma.historicoData.findMany({
    where: { clientId: session.user.clientId, anio, mes },
  });

  const totalHcReal = data.reduce((s, r) => s + r.hcReal, 0);
  const totalHcPresup = data.reduce((s, r) => s + r.hcPresupuesto, 0);
  const totalAltas = data.reduce((s, r) => s + r.altas, 0);
  const totalBajas = data.reduce((s, r) => s + r.bajas, 0);
  const rotacion = totalHcReal > 0 ? (totalBajas / totalHcReal) * 100 : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#238D80]">
            Headcount
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[#F1BE48]">
            Métricas de colaboradores
          </h1>
          <p className="mt-2 text-[#9A9A9A]">
            HC presupuestado vs real, altas, bajas y rotación por población.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Suspense>
            <PeriodSelector anio={anio} mes={mes} />
          </Suspense>
          <DownloadButton module="hc" anio={anio} mes={mes} />
        </div>
      </div>

      {data.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#222222] bg-[#111111] p-12 text-center">
          <p className="text-[#555555]">Sin datos para el período seleccionado.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="HC Real"
              value={totalHcReal.toLocaleString("es-MX")}
            />
            <KpiCard label="Altas" value={`+${totalAltas}`} />
            <KpiCard label="Bajas" value={`-${totalBajas}`} />
            <KpiCard
              label="% Rotación"
              value={`${rotacion.toFixed(1)}%`}
              highlight
            />
          </div>

          <HcCharts
            data={data.map((r) => ({
              poblacion: r.poblacion,
              hcPresupuesto: r.hcPresupuesto,
              hcReal: r.hcReal,
              altas: r.altas,
              bajas: r.bajas,
            }))}
            totalHcPresup={totalHcPresup}
            totalHcReal={totalHcReal}
          />
        </>
      )}
    </div>
  );
}
