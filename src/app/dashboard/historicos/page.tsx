import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { HistoricosClient } from "@/components/dashboard/historicos/HistoricosClient";

export default async function HistoricosPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const clientId = session.user.clientId;

  const [historicoRaw, comisionRaw] = await Promise.all([
    prisma.historicoData.findMany({
      where: { clientId },
      orderBy: [{ anio: "asc" }, { mes: "asc" }],
    }),
    prisma.comisionMensual.findMany({
      where: { clientId },
      orderBy: [{ anio: "asc" }, { mes: "asc" }],
    }),
  ]);

  const historicoByPeriod = new Map<string, {
    anio: number; mes: number;
    hcPresupuesto: number; hcReal: number;
    forecast: number; real: number; budget: number;
    altas: number; bajas: number;
  }>();

  for (const r of historicoRaw) {
    const key = `${r.anio}-${r.mes}`;
    const existing = historicoByPeriod.get(key);
    if (existing) {
      existing.hcPresupuesto += r.hcPresupuesto;
      existing.hcReal += r.hcReal;
      existing.forecast += r.forecast;
      existing.real += r.real;
      existing.budget += r.budget;
      existing.altas += r.altas;
      existing.bajas += r.bajas;
    } else {
      historicoByPeriod.set(key, {
        anio: r.anio, mes: r.mes,
        hcPresupuesto: r.hcPresupuesto, hcReal: r.hcReal,
        forecast: r.forecast, real: r.real, budget: r.budget,
        altas: r.altas, bajas: r.bajas,
      });
    }
  }

  const historico = Array.from(historicoByPeriod.values());

  const comisiones = comisionRaw.map((r) => ({
    anio: r.anio, mes: r.mes,
    hcProyectado: r.hcProyectado, presupuestado: r.presupuestado,
    realHc: r.realHc, realCosto: r.realCosto,
  }));

  const totalPeriodos = new Set([
    ...historico.map((r) => `${r.anio}-${r.mes}`),
    ...comisiones.map((r) => `${r.anio}-${r.mes}`),
  ]).size;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#238D80]">
          Históricos
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-[#F1BE48]">
          Consulta por período
        </h1>
        <p className="mt-2 text-[#9A9A9A]">
          Evolución mensual de indicadores.{" "}
          {totalPeriodos > 0 && (
            <span className="font-medium text-[#9A9A9A]">
              {totalPeriodos} período{totalPeriodos !== 1 ? "s" : ""} con datos.
            </span>
          )}
        </p>
      </div>

      <HistoricosClient historico={historico} comisiones={comisiones} />
    </div>
  );
}
