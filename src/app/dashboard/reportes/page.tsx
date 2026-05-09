import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BarChart3, LineChart, UserRound, FileDown, PackageOpen } from "lucide-react";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function fmtDate(d: Date) {
  return d.toLocaleDateString("es-MX", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: Promise<{ anio?: string; mes?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { anio: anioStr, mes: mesStr } = await searchParams;
  const anio = parseInt(anioStr ?? "2026");
  const mes = parseInt(mesStr ?? "4");
  const clientId = session.user.clientId;

  const [forecastCount, historicoData, comisionData, lastUpload] = await Promise.all([
    prisma.forecastGasto.count({ where: { clientId, anio, mes } }),
    prisma.historicoData.findMany({
      where: { clientId, anio, mes },
      select: { hcReal: true },
    }),
    prisma.comisionMensual.findUnique({
      where: { clientId_anio_mes: { clientId, anio, mes } },
      select: { realCosto: true },
    }),
    prisma.dataUpload.findFirst({
      where: { clientId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true, fileName: true, sheets: true },
    }),
  ]);

  const totalHc = historicoData.reduce((s, r) => s + r.hcReal, 0);

  const periodo = `${MESES[mes - 1]} ${anio}`;

  const modules = [
    {
      key: "forecast",
      label: "Forecast",
      desc: "Budget vs Forecast por dirección y área",
      icon: LineChart,
      count: forecastCount,
      countLabel: forecastCount === 1 ? "registro" : "registros",
      href: `/api/download/forecast?anio=${anio}&mes=${mes}`,
    },
    {
      key: "hc",
      label: "Headcount",
      desc: "HC presupuestado vs real, altas y bajas por población",
      icon: UserRound,
      count: historicoData.length,
      countLabel: totalHc > 0 ? `${totalHc} colaboradores` : "sin datos",
      href: `/api/download/hc?anio=${anio}&mes=${mes}`,
    },
    {
      key: "comercial",
      label: "Comisiones",
      desc: "HC proyectado vs real y costos mensuales",
      icon: BarChart3,
      count: comisionData ? 1 : 0,
      countLabel: comisionData ? "datos disponibles" : "sin datos",
      href: `/api/download/comercial?anio=${anio}&mes=${mes}`,
    },
  ];

  const hasAnyData = forecastCount > 0 || historicoData.length > 0 || comisionData !== null;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#238D80]">
            Reportes
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[#F1BE48]">
            Descarga de datos
          </h1>
          <p className="mt-2 text-[#9A9A9A]">
            Exporta los indicadores del período seleccionado en formato Excel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Suspense>
            <PeriodSelector anio={anio} mes={mes} />
          </Suspense>
          {hasAnyData && (
            <a
              href={`/api/download/all?anio=${anio}&mes=${mes}`}
              className="flex items-center gap-2 rounded-xl bg-[#238D80] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#205C40]"
            >
              <FileDown className="h-4 w-4" />
              Descargar todo
            </a>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-[#9A9A9A]">
        <span className="rounded-full border border-[#222222] bg-[#111111] px-3 py-1 font-medium text-[#9A9A9A]">
          {periodo}
        </span>
        {lastUpload && (
          <span className="text-[#555555]">
            Última carga: {fmtDate(lastUpload.createdAt)} · {lastUpload.fileName}
          </span>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        {modules.map((m) => {
          const Icon = m.icon;
          const empty = m.count === 0;

          return (
            <div
              key={m.key}
              className={[
                "rounded-3xl border p-6 transition",
                empty
                  ? "border-dashed border-[#222222] bg-[#1A1A1A]"
                  : "border-[#222222] bg-[#111111]",
              ].join(" ")}
            >
              <div className="mb-5 flex items-start justify-between">
                <div
                  className={[
                    "rounded-2xl p-3",
                    empty ? "bg-white/5 text-neutral-300" : "bg-[#238D80]/10 text-[#205C40]",
                  ].join(" ")}
                >
                  <Icon className="h-5 w-5" />
                </div>
                {!empty && (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    Con datos
                  </span>
                )}
              </div>

              <h3 className="text-base font-semibold text-[#F1BE48]">{m.label}</h3>
              <p className="mt-1 text-sm text-[#9A9A9A]">{m.desc}</p>

              <div className="mt-4 border-t border-[#222222] pt-4">
                {empty ? (
                  <div className="flex items-center gap-2 text-sm text-[#555555]">
                    <PackageOpen className="h-4 w-4" />
                    Sin datos para {periodo}
                  </div>
                ) : (
                  <p className="text-sm text-[#9A9A9A]">
                    <span className="font-medium text-[#F1BE48]">{m.count}</span>{" "}
                    {m.countLabel}
                  </p>
                )}
              </div>

              <a
                href={m.href}
                className={[
                  "mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition",
                  empty
                    ? "cursor-not-allowed border border-[#222222] text-neutral-300"
                    : "border border-[#238D80]/30 bg-[#238D80]/5 text-[#205C40] hover:bg-[#238D80]/10",
                ].join(" ")}
                aria-disabled={empty}
                onClick={empty ? (e) => e.preventDefault() : undefined}
              >
                <FileDown className="h-4 w-4" />
                Descargar Excel
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
