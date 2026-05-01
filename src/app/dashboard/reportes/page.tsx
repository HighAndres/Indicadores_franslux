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
    day: "2-digit",
    month: "short",
    year: "numeric",
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

  const [forecastCount, hcRecord, comercialCount, lastUploads] = await Promise.all([
    prisma.forecastGasto.count({ where: { clientId, anio, mes } }),
    prisma.hcColaboradores.findUnique({
      where: { clientId_anio_mes: { clientId, anio, mes } },
      select: { total: true },
    }),
    prisma.comercialComision.count({ where: { clientId, anio, mes } }),
    prisma.dataUpload.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
      distinct: ["module"],
      select: { module: true, createdAt: true, fileName: true, rows: true },
    }),
  ]);

  const lastByModule = Object.fromEntries(
    lastUploads.map((u) => [u.module, u])
  );

  const periodo = `${MESES[mes - 1]} ${anio}`;

  const modules = [
    {
      key: "forecast",
      label: "Forecast",
      desc: "Gasto real vs presupuesto por dirección y área",
      icon: LineChart,
      count: forecastCount,
      countLabel: forecastCount === 1 ? "registro" : "registros",
      last: lastByModule["FORECAST"],
      href: `/api/download/forecast?anio=${anio}&mes=${mes}`,
    },
    {
      key: "hc",
      label: "Headcount",
      desc: "Colaboradores, altas, bajas, rotación y género",
      icon: UserRound,
      count: hcRecord ? 1 : 0,
      countLabel: hcRecord ? `${hcRecord.total} colaboradores` : "sin datos",
      last: lastByModule["HC"],
      href: `/api/download/hc?anio=${anio}&mes=${mes}`,
    },
    {
      key: "comercial",
      label: "Comercial",
      desc: "Comisiones por cadena, KAM y tienda",
      icon: BarChart3,
      count: comercialCount,
      countLabel: comercialCount === 1 ? "registro" : "registros",
      last: lastByModule["COMERCIAL"],
      href: `/api/download/comercial?anio=${anio}&mes=${mes}`,
    },
  ];

  const hasAnyData = forecastCount > 0 || hcRecord !== null || comercialCount > 0;

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

      {/* Period label */}
      <div className="flex items-center gap-2 text-sm text-[#9A9A9A]">
        <span className="rounded-full border border-[#222222] bg-[#111111] px-3 py-1 font-medium text-[#9A9A9A]">
          {periodo}
        </span>
        {hasAnyData ? (
          <span>
            {[
              forecastCount > 0 && `${forecastCount} filas de Forecast`,
              hcRecord && "HC disponible",
              comercialCount > 0 && `${comercialCount} filas de Comercial`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
        ) : (
          <span className="text-[#555555]">Sin datos para este período</span>
        )}
      </div>

      {/* Module cards */}
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
                  : "border-[#222222] bg-[#111111] ",
              ].join(" ")}
            >
              <div className="mb-5 flex items-start justify-between">
                <div
                  className={[
                    "rounded-2xl p-3",
                    empty
                      ? "bg-white/5 text-neutral-300"
                      : "bg-[#238D80]/10 text-[#205C40]",
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
                  <div className="space-y-1">
                    <p className="text-sm text-[#9A9A9A]">
                      <span className="font-medium text-[#F1BE48]">{m.count}</span>{" "}
                      {m.countLabel}
                    </p>
                    {m.last && (
                      <p className="text-xs text-[#555555]">
                        Última carga: {fmtDate(m.last.createdAt)}
                      </p>
                    )}
                  </div>
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

      {/* Recent uploads summary */}
      {lastUploads.length > 0 && (
        <div className="rounded-3xl border border-[#222222] bg-[#111111] p-6 ">
          <h2 className="mb-4 text-base font-semibold text-[#F1BE48]">
            Última carga por módulo
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {(["FORECAST", "HC", "COMERCIAL"] as const).map((mod) => {
              const u = lastByModule[mod];
              const labels: Record<string, string> = {
                FORECAST: "Forecast",
                HC: "Headcount",
                COMERCIAL: "Comercial",
              };
              return (
                <div
                  key={mod}
                  className="rounded-2xl border border-[#222222] bg-[#1A1A1A] p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#555555]">
                    {labels[mod]}
                  </p>
                  {u ? (
                    <>
                      <p className="mt-1 text-sm font-medium text-[#F1BE48]">
                        {fmtDate(u.createdAt)}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-[#555555]">
                        {u.fileName} · {u.rows} filas
                      </p>
                    </>
                  ) : (
                    <p className="mt-1 text-sm text-[#555555]">Sin cargas</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
