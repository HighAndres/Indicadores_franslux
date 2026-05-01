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

  const data = await prisma.comercialComision.findMany({
    where: { clientId: session.user.clientId, anio, mes },
    orderBy: { real: "desc" },
  });

  const totalReal = data.reduce((s, r) => s + r.real, 0);
  const totalPresupuesto = data.reduce((s, r) => s + r.presupuesto, 0);
  const pctEjecucion =
    totalPresupuesto > 0 ? (totalReal / totalPresupuesto) * 100 : 0;

  const cadenas = new Set(data.map((r) => r.cadena)).size;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#238D80]">
            Comercial
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[#F1BE48]">
            Indicadores de comisiones
          </h1>
          <p className="mt-2 text-[#9A9A9A]">
            Real vs presupuesto por cadena, KAM y tienda.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Suspense>
            <PeriodSelector anio={anio} mes={mes} />
          </Suspense>
          <DownloadButton module="comercial" anio={anio} mes={mes} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
        <KpiCard
          label="Comisiones reales"
          value={fmt(totalReal)}
          subtitle={`${cadenas} cadenas`}
        />
        <KpiCard label="Presupuesto" value={fmt(totalPresupuesto)} />
        <KpiCard
          label="% Ejecución"
          value={`${pctEjecucion.toFixed(1)}%`}
          highlight
        />
        <KpiCard label="Registros" value={data.length.toString()} />
      </div>

      {data.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#222222] bg-[#111111] p-12 text-center">
          <p className="text-[#555555]">Sin datos para el período seleccionado.</p>
        </div>
      ) : (
        <ComercialCharts
          data={data.map((r) => ({
            cadena: r.cadena,
            kam: r.kam,
            tienda: r.tienda,
            real: r.real,
            presupuesto: r.presupuesto,
          }))}
        />
      )}
    </div>
  );
}
