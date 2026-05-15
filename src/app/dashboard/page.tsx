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

  const latestForecast = await prisma.forecastGasto.findFirst({
    where: { clientId },
    orderBy: [{ anio: "desc" }, { mes: "desc" }],
    select: { anio: true, mes: true },
  });

  const latestHistorico = await prisma.historicoData.findFirst({
    where: { clientId },
    orderBy: [{ anio: "desc" }, { mes: "desc" }],
    select: { anio: true, mes: true },
  });

  const latestComision = await prisma.comisionMensual.findFirst({
    where: { clientId },
    orderBy: [{ anio: "desc" }, { mes: "desc" }],
    select: { anio: true, mes: true },
  });

  const [gastoRealAgg, hcAgg, comisionData] = await Promise.all([
    latestForecast
      ? prisma.forecastGasto.aggregate({
          where: { clientId, anio: latestForecast.anio, mes: latestForecast.mes, estatus: "Activo" },
          _sum: { forecast: true },
        })
      : null,
    latestHistorico
      ? prisma.historicoData.aggregate({
          where: { clientId, anio: latestHistorico.anio, mes: latestHistorico.mes },
          _sum: { hcReal: true },
        })
      : null,
    latestComision
      ? prisma.comisionMensual.findUnique({
          where: { clientId_anio_mes: { clientId, anio: latestComision.anio, mes: latestComision.mes } },
          select: { realCosto: true },
        })
      : null,
  ]);

  const cards = [
    {
      title: "Gasto real",
      value: gastoRealAgg?._sum.forecast ? fmt(gastoRealAgg._sum.forecast) : "—",
      subtitle: "Dato del último mes",
      href: "/dashboard/forecast",
      icon: LineChart,
    },
    {
      title: "Total colaboradores",
      value: hcAgg?._sum.hcReal ? hcAgg._sum.hcReal.toLocaleString("es-MX") : "—",
      subtitle: "Headcount actualizado",
      href: "/dashboard/hc",
      icon: UsersRound,
    },
    {
      title: "Costo real comisiones",
      value: comisionData?.realCosto ? fmt(comisionData.realCosto) : "—",
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
          Vista general de Real, Headcount y Comercial para seguimiento directivo.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="group rounded-3xl border border-[#222222] bg-[#111111] p-6 transition hover:-translate-y-1 hover:shadow-md"
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
