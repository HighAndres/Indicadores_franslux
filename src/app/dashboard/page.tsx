import Link from "next/link";
import { ArrowRight, BarChart3, LineChart, UsersRound } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const fmt = (v: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(v);

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const clientId = session.user.clientId;

  const latestForecastPeriod = await prisma.forecastGasto.findFirst({
    where: { clientId },
    orderBy: [{ anio: "desc" }, { mes: "desc" }],
    select: { anio: true, mes: true },
  });

  const latestHcPeriod = await prisma.hcColaboradores.findFirst({
    where: { clientId },
    orderBy: [{ anio: "desc" }, { mes: "desc" }],
    select: { anio: true, mes: true },
  });

  const latestComercialPeriod = await prisma.comercialComision.findFirst({
    where: { clientId },
    orderBy: [{ anio: "desc" }, { mes: "desc" }],
    select: { anio: true, mes: true },
  });

  const [forecastAgg, hcData, comercialAgg] = await Promise.all([
    latestForecastPeriod
      ? prisma.forecastGasto.aggregate({
          where: { clientId, anio: latestForecastPeriod.anio, mes: latestForecastPeriod.mes },
          _sum: { real: true },
        })
      : null,
    latestHcPeriod
      ? prisma.hcColaboradores.findUnique({
          where: {
            clientId_anio_mes: {
              clientId,
              anio: latestHcPeriod.anio,
              mes: latestHcPeriod.mes,
            },
          },
          select: { total: true },
        })
      : null,
    latestComercialPeriod
      ? prisma.comercialComision.aggregate({
          where: {
            clientId,
            anio: latestComercialPeriod.anio,
            mes: latestComercialPeriod.mes,
          },
          _sum: { real: true },
        })
      : null,
  ]);

  const cards = [
    {
      title: "Gasto real",
      value: forecastAgg?._sum.real ? fmt(forecastAgg._sum.real) : "—",
      subtitle: "Forecast del mes actual",
      href: "/dashboard/forecast",
      icon: LineChart,
    },
    {
      title: "Total colaboradores",
      value: hcData?.total ? hcData.total.toLocaleString("es-MX") : "—",
      subtitle: "Headcount actualizado",
      href: "/dashboard/hc",
      icon: UsersRound,
    },
    {
      title: "Comisiones reales",
      value: comercialAgg?._sum.real ? fmt(comercialAgg._sum.real) : "—",
      subtitle: "Indicador comercial mensual",
      href: "/dashboard/comercial",
      icon: BarChart3,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#238D80]">
          Resumen ejecutivo
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-[#F1BE48]">
          Indicadores del mes
        </h1>
        <p className="mt-2 max-w-2xl text-[#9A9A9A]">
          Vista general de Forecast, Headcount y Comercial para seguimiento directivo.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="group rounded-3xl border border-[#222222] bg-[#111111] p-6  transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="rounded-2xl bg-[#238D80]/10 p-3 text-[#205C40]">
                  <Icon className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 text-neutral-300 transition group-hover:translate-x-1 group-hover:text-[#238D80]" />
              </div>
              <p className="text-sm font-medium text-[#9A9A9A]">{card.title}</p>
              <h2 className="mt-2 text-3xl font-semibold text-[#F1BE48]">{card.value}</h2>
              <p className="mt-2 text-sm text-[#9A9A9A]">{card.subtitle}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
