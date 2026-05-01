import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { HistoricosClient } from "@/components/dashboard/historicos/HistoricosClient";

export default async function HistoricosPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const clientId = session.user.clientId;

  const [forecastRaw, hcRaw, comercialRaw] = await Promise.all([
    prisma.forecastGasto.groupBy({
      by: ["anio", "mes"],
      where: { clientId },
      _sum: { real: true, presupuesto: true },
      orderBy: [{ anio: "asc" }, { mes: "asc" }],
    }),
    prisma.hcColaboradores.findMany({
      where: { clientId },
      orderBy: [{ anio: "asc" }, { mes: "asc" }],
      select: {
        anio: true, mes: true, total: true, altas: true,
        bajas: true, generoM: true, generoF: true, diasLaborados: true,
      },
    }),
    prisma.comercialComision.groupBy({
      by: ["anio", "mes"],
      where: { clientId },
      _sum: { real: true, presupuesto: true },
      orderBy: [{ anio: "asc" }, { mes: "asc" }],
    }),
  ]);

  const forecast = forecastRaw.map((r) => ({
    anio: r.anio,
    mes: r.mes,
    real: r._sum.real ?? 0,
    presupuesto: r._sum.presupuesto ?? 0,
  }));

  const comercial = comercialRaw.map((r) => ({
    anio: r.anio,
    mes: r.mes,
    real: r._sum.real ?? 0,
    presupuesto: r._sum.presupuesto ?? 0,
  }));

  const totalPeriodos = new Set([
    ...forecast.map((r) => `${r.anio}-${r.mes}`),
    ...hcRaw.map((r) => `${r.anio}-${r.mes}`),
    ...comercial.map((r) => `${r.anio}-${r.mes}`),
  ]).size;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#238D80]">
            Históricos
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[#F1BE48]">
            Consulta por período
          </h1>
          <p className="mt-2 text-[#9A9A9A]">
            Evolución mensual de los tres módulos.{" "}
            {totalPeriodos > 0 && (
              <span className="font-medium text-[#9A9A9A]">
                {totalPeriodos} período{totalPeriodos !== 1 ? "s" : ""} con datos.
              </span>
            )}
          </p>
        </div>
      </div>

      <HistoricosClient
        forecast={forecast}
        hc={hcRaw}
        comercial={comercial}
      />
    </div>
  );
}
