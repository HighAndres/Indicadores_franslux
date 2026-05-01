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

export function HistoricosClient({ forecast, hc, comercial }: Props) {
  const [tab, setTab] = useState<Tab>("forecast");

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-sm w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={[
              "rounded-xl px-5 py-2 text-sm font-medium transition",
              tab === t.key
                ? "bg-[#A9945D] text-white shadow-sm"
                : "text-neutral-500 hover:text-neutral-950",
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
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-sm font-semibold text-neutral-950">
          Gasto real vs presupuesto — tendencia mensual
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradReal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A9945D" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#A9945D" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradPres" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#CBD5E1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#CBD5E1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F1EF" />
            <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#6B7280" }} />
            <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(v: unknown) => [fmt(v as number)]}
              contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB" }}
            />
            <Legend />
            <Area type="monotone" dataKey="Real" stroke="#A9945D" strokeWidth={2} fill="url(#gradReal)" />
            <Area type="monotone" dataKey="Presupuesto" stroke="#94A3B8" strokeWidth={2} fill="url(#gradPres)" />
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
              <span key="pr" className="text-neutral-400">{fmt(d.presupuesto)}</span>,
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
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-sm font-semibold text-neutral-950">
          Colaboradores, altas y bajas — tendencia mensual
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F1EF" />
            <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#6B7280" }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#6B7280" }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#6B7280" }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB" }} />
            <Legend />
            <Bar yAxisId="right" dataKey="Altas" fill="#4ADE80" radius={[4,4,0,0]} />
            <Bar yAxisId="right" dataKey="Bajas" fill="#F87171" radius={[4,4,0,0]} />
            <Line yAxisId="left" type="monotone" dataKey="Total" stroke="#A9945D" strokeWidth={2} dot={{ r: 4, fill: "#A9945D" }} />
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
              <span key="a" className="font-medium text-emerald-600">+{d.altas}</span>,
              <span key="b" className="font-medium text-red-500">-{d.bajas}</span>,
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
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-sm font-semibold text-neutral-950">
          Comisiones real vs presupuesto — tendencia mensual
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F1EF" />
            <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#6B7280" }} />
            <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(v: unknown) => [fmt(v as number)]}
              contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB" }}
            />
            <Legend />
            <Bar dataKey="Real" fill="#A9945D" radius={[4,4,0,0]} />
            <Bar dataKey="Presupuesto" fill="#CBD5E1" radius={[4,4,0,0]} />
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
              <span key="pr" className="text-neutral-400">{fmt(d.presupuesto)}</span>,
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
      className="group inline-flex items-center gap-1.5 font-medium text-neutral-950 hover:text-[#A9945D]"
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
      good ? "text-emerald-600" : warn ? "text-amber-600" : "text-red-500",
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
    <div className="overflow-x-auto rounded-3xl border border-neutral-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-100">
            {headers.map((h) => (
              <th key={h} className="px-6 pb-3 pt-4 text-left font-medium text-neutral-500">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-50">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-neutral-50/50">
              {row.cells.map((cell, j) => (
                <td key={j} className="px-6 py-3">
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
    <div className="rounded-3xl border border-dashed border-neutral-200 bg-white p-12 text-center">
      <p className="text-neutral-400">No hay datos históricos para este módulo.</p>
    </div>
  );
}
