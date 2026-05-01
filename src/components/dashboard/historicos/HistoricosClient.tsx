"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { ExternalLink } from "lucide-react";

export interface ForecastPeriod {
  anio: number; mes: number; real: number; presupuesto: number;
}
export interface HcPeriod {
  anio: number; mes: number; total: number; altas: number;
  bajas: number; generoM: number; generoF: number; diasLaborados: number;
}
export interface ComercialPeriod {
  anio: number; mes: number; real: number; presupuesto: number;
}

interface Props {
  forecast: ForecastPeriod[];
  hc: HcPeriod[];
  comercial: ComercialPeriod[];
}

type Tab = "forecast" | "hc" | "comercial";

const CHART_COLORS = ["#238D80", "#00859B", "#003057", "#205C40"];

const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

const fmt = (v: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(v);

function periodLabel(anio: number, mes: number) {
  return `${MESES[mes - 1]} ${anio}`;
}

function toChartKey(anio: number, mes: number) {
  return `${MESES[mes - 1]}\n${anio}`;
}

const TABS = [
  { key: "forecast" as Tab, label: "Forecast" },
  { key: "hc" as Tab,       label: "Headcount" },
  { key: "comercial" as Tab, label: "Comercial" },
];

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #222222",
  backgroundColor: "#111111",
  color: "#F1BE48",
};

const axisProps = { fontSize: 11, fill: "#9A9A9A" };

export function HistoricosClient({ forecast, hc, comercial }: Props) {
  const [tab, setTab] = useState<Tab>("forecast");

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl border border-[#222222] bg-[#111111] p-1.5 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={[
              "rounded-xl px-5 py-2 text-sm font-medium transition",
              tab === t.key
                ? "bg-[#F1BE48] text-black shadow-sm"
                : "text-[#9A9A9A] hover:text-[#F1BE48]",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "forecast" && <ForecastView data={forecast} />}
      {tab === "hc"       && <HcView data={hc} />}
      {tab === "comercial" && <ComercialView data={comercial} />}
    </div>
  );
}

/* ── FORECAST ── */
function ForecastView({ data }: { data: ForecastPeriod[] }) {
  if (data.length === 0) return <Empty />;

  const chartData = data.map((d) => ({
    period: toChartKey(d.anio, d.mes),
    Real: d.real,
    Presupuesto: d.presupuesto,
    pct: d.presupuesto > 0 ? +((d.real / d.presupuesto) * 100).toFixed(1) : 0,
    anio: d.anio,
    mes: d.mes,
  }));

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-[#222222] bg-[#111111] p-6">
        <h3 className="mb-5 text-sm font-semibold text-[#F1BE48]">
          Gasto real vs presupuesto — tendencia mensual
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradReal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradPres" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS[1]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS[1]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
            <XAxis dataKey="period" tick={axisProps} />
            <YAxis tick={axisProps} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: unknown) => [fmt(v as number)]} contentStyle={tooltipStyle} />
            <Legend />
            <Area type="monotone" dataKey="Real" stroke={CHART_COLORS[0]} strokeWidth={2} fill="url(#gradReal)" />
            <Area type="monotone" dataKey="Presupuesto" stroke={CHART_COLORS[1]} strokeWidth={2} fill="url(#gradPres)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <PeriodTable
        headers={["Período", "Real", "Presupuesto", "% Ejec."]}
        rows={data.map((d) => {
          const pct = d.presupuesto > 0 ? (d.real / d.presupuesto) * 100 : 0;
          return {
            anio: d.anio, mes: d.mes,
            module: "forecast",
            cells: [
              <PeriodLink key="p" anio={d.anio} mes={d.mes} module="forecast" />,
              fmt(d.real),
              <span key="pr" className="text-[#9A9A9A]">{fmt(d.presupuesto)}</span>,
              <Pct key="pct" value={pct} />,
            ],
          };
        })}
      />
    </div>
  );
}

/* ── HEADCOUNT ── */
function HcView({ data }: { data: HcPeriod[] }) {
  if (data.length === 0) return <Empty />;

  const chartData = data.map((d) => ({
    period: toChartKey(d.anio, d.mes),
    Total: d.total,
    Altas: d.altas,
    Bajas: d.bajas,
    anio: d.anio,
    mes: d.mes,
  }));

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-[#222222] bg-[#111111] p-6">
        <h3 className="mb-5 text-sm font-semibold text-[#F1BE48]">
          Colaboradores, altas y bajas — tendencia mensual
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
            <XAxis dataKey="period" tick={axisProps} />
            <YAxis yAxisId="left" tick={axisProps} />
            <YAxis yAxisId="right" orientation="right" tick={axisProps} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Bar yAxisId="right" dataKey="Altas" fill={CHART_COLORS[0]} radius={[4,4,0,0]} />
            <Bar yAxisId="right" dataKey="Bajas" fill={CHART_COLORS[2]} radius={[4,4,0,0]} />
            <Line yAxisId="left" type="monotone" dataKey="Total" stroke={CHART_COLORS[1]} strokeWidth={2} dot={{ r: 4, fill: CHART_COLORS[1] }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <PeriodTable
        headers={["Período", "Total", "Altas", "Bajas", "Rotación", "Días lab."]}
        rows={data.map((d) => {
          const rot = d.total > 0 ? (d.bajas / d.total) * 100 : 0;
          return {
            anio: d.anio, mes: d.mes,
            module: "hc",
            cells: [
              <PeriodLink key="p" anio={d.anio} mes={d.mes} module="hc" />,
              d.total.toLocaleString("es-MX"),
              <span key="a" className="font-medium text-emerald-400">+{d.altas}</span>,
              <span key="b" className="font-medium text-red-400">-{d.bajas}</span>,
              <Pct key="r" value={rot} invert />,
              d.diasLaborados,
            ],
          };
        })}
      />
    </div>
  );
}

/* ── COMERCIAL ── */
function ComercialView({ data }: { data: ComercialPeriod[] }) {
  if (data.length === 0) return <Empty />;

  const chartData = data.map((d) => ({
    period: toChartKey(d.anio, d.mes),
    Real: d.real,
    Presupuesto: d.presupuesto,
    pct: d.presupuesto > 0 ? +((d.real / d.presupuesto) * 100).toFixed(1) : 0,
    anio: d.anio,
    mes: d.mes,
  }));

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-[#222222] bg-[#111111] p-6">
        <h3 className="mb-5 text-sm font-semibold text-[#F1BE48]">
          Comisiones real vs presupuesto — tendencia mensual
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
            <XAxis dataKey="period" tick={axisProps} />
            <YAxis tick={axisProps} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: unknown) => [fmt(v as number)]} contentStyle={tooltipStyle} />
            <Legend />
            <Bar dataKey="Real" fill={CHART_COLORS[0]} radius={[4,4,0,0]} />
            <Bar dataKey="Presupuesto" fill={CHART_COLORS[1]} radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <PeriodTable
        headers={["Período", "Real", "Presupuesto", "% Ejec."]}
        rows={data.map((d) => {
          const pct = d.presupuesto > 0 ? (d.real / d.presupuesto) * 100 : 0;
          return {
            anio: d.anio, mes: d.mes,
            module: "comercial",
            cells: [
              <PeriodLink key="p" anio={d.anio} mes={d.mes} module="comercial" />,
              fmt(d.real),
              <span key="pr" className="text-[#9A9A9A]">{fmt(d.presupuesto)}</span>,
              <Pct key="pct" value={pct} />,
            ],
          };
        })}
      />
    </div>
  );
}

/* ── shared sub-components ── */

function PeriodLink({ anio, mes, module }: { anio: number; mes: number; module: string }) {
  return (
    <Link
      href={`/dashboard/${module}?anio=${anio}&mes=${mes}`}
      className="group inline-flex items-center gap-1.5 font-medium text-[#F1BE48] hover:text-[#D4A520]"
    >
      {periodLabel(anio, mes)}
      <ExternalLink className="h-3 w-3 opacity-0 transition group-hover:opacity-100" />
    </Link>
  );
}

function Pct({ value, invert }: { value: number; invert?: boolean }) {
  const good = invert ? value <= 5 : value >= 90;
  const warn = invert ? value <= 10 : value >= 70;
  return (
    <span className={[
      "font-semibold",
      good ? "text-emerald-400" : warn ? "text-amber-400" : "text-red-400",
    ].join(" ")}>
      {value.toFixed(1)}%
    </span>
  );
}

interface TableRow {
  anio: number;
  mes: number;
  module: string;
  cells: React.ReactNode[];
}

function PeriodTable({ headers, rows }: { headers: string[]; rows: TableRow[] }) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-[#222222] bg-[#111111]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#222222]">
            {headers.map((h) => (
              <th key={h} className="px-6 pb-3 pt-4 text-left font-medium text-[#9A9A9A]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1A1A1A]">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-white/5">
              {row.cells.map((cell, j) => (
                <td key={j} className="px-6 py-3 text-[#F1BE48]">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Empty() {
  return (
    <div className="rounded-3xl border border-dashed border-[#222222] bg-[#111111] p-12 text-center">
      <p className="text-[#9A9A9A]">No hay datos históricos para este módulo.</p>
    </div>
  );
}
