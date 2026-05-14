"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { ExternalLink } from "lucide-react";

interface HistoricoPeriod {
  anio: number; mes: number;
  hcPresupuesto: number; hcReal: number;
  forecast: number; real: number; budget: number;
  altas: number; bajas: number;
}

interface ComisionPeriod {
  anio: number; mes: number;
  hcProyectado: number; presupuestado: number;
  realHc: number; realCosto: number;
}

interface Props {
  historico: HistoricoPeriod[];
  comisiones: ComisionPeriod[];
}

type Tab = "costos" | "hc" | "comisiones";

const CHART_COLORS = ["#238D80", "#00859B", "#003057", "#205C40"];
const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

const fmt = (v: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(v);

function toChartKey(anio: number, mes: number) {
  return `${MESES[mes - 1]}\n${anio}`;
}

function periodLabel(anio: number, mes: number) {
  return `${MESES[mes - 1]} ${anio}`;
}

const TABS = [
  { key: "costos" as Tab, label: "Costos" },
  { key: "hc" as Tab, label: "Headcount" },
  { key: "comisiones" as Tab, label: "Comisiones" },
];

const tooltipStyle = {
  borderRadius: 12, border: "1px solid #222222",
  backgroundColor: "#111111", color: "#F1BE48",
};

const axisProps = { fontSize: 11, fill: "#9A9A9A" };

export function HistoricosClient({ historico, comisiones }: Props) {
  const [tab, setTab] = useState<Tab>("costos");

  return (
    <div className="space-y-6">
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

      {tab === "costos" && <CostosView data={historico} />}
      {tab === "hc" && <HcView data={historico} />}
      {tab === "comisiones" && <ComisionesView data={comisiones} />}
    </div>
  );
}

function CostosView({ data }: { data: HistoricoPeriod[] }) {
  if (data.length === 0) return <Empty />;

  const chartData = data.map((d) => ({
    period: toChartKey(d.anio, d.mes),
    Real: d.real, Budget: d.budget,
  }));

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-[#222222] bg-[#111111] p-6">
        <h3 className="mb-5 text-sm font-semibold text-[#F1BE48]">
          Real vs Budget — tendencia mensual
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradReal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
            <XAxis dataKey="period" tick={axisProps} />
            <YAxis tick={axisProps} tickFormatter={(v) => `$${(v/1_000_000).toFixed(1)}M`} />
            <Tooltip formatter={(v: unknown) => [fmt(v as number)]} contentStyle={tooltipStyle} />
            <Legend />
            <Area type="monotone" dataKey="Real" stroke={CHART_COLORS[0]} strokeWidth={2} fill="url(#gradReal)" />
            <Area type="monotone" dataKey="Budget" stroke={CHART_COLORS[2]} strokeWidth={2} fill="transparent" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <PeriodTable
        headers={["Período", "Real", "Budget"]}
        rows={data.map((d) => ({
          cells: [
            <PeriodLink key="p" anio={d.anio} mes={d.mes} module="forecast" />,
            fmt(d.real),
            <span key="b" className="text-[#9A9A9A]">{fmt(d.budget)}</span>,
          ],
        }))}
      />
    </div>
  );
}

function HcView({ data }: { data: HistoricoPeriod[] }) {
  if (data.length === 0) return <Empty />;

  const chartData = data.map((d) => ({
    period: toChartKey(d.anio, d.mes),
    "HC Real": d.hcReal, "HC Presup.": d.hcPresupuesto,
    Altas: d.altas, Bajas: d.bajas,
  }));

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-[#222222] bg-[#111111] p-6">
        <h3 className="mb-5 text-sm font-semibold text-[#F1BE48]">
          HC y movimientos — tendencia mensual
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
            <Line yAxisId="left" type="monotone" dataKey="HC Real" stroke={CHART_COLORS[1]} strokeWidth={2} dot={{ r: 4, fill: CHART_COLORS[1] }} />
            <Line yAxisId="left" type="monotone" dataKey="HC Presup." stroke={CHART_COLORS[3]} strokeWidth={2} strokeDasharray="5 5" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <PeriodTable
        headers={["Período", "HC Presup.", "HC Real", "Altas", "Bajas", "Rotación"]}
        rows={data.map((d) => {
          const rot = d.hcReal > 0 ? (d.bajas / d.hcReal) * 100 : 0;
          return {
            cells: [
              <PeriodLink key="p" anio={d.anio} mes={d.mes} module="hc" />,
              d.hcPresupuesto.toLocaleString("es-MX"),
              d.hcReal.toLocaleString("es-MX"),
              <span key="a" className="font-medium text-emerald-400">+{d.altas}</span>,
              <span key="b" className="font-medium text-red-400">-{d.bajas}</span>,
              <Pct key="r" value={rot} invert />,
            ],
          };
        })}
      />
    </div>
  );
}

function ComisionesView({ data }: { data: ComisionPeriod[] }) {
  if (data.length === 0) return <Empty />;

  const chartData = data.map((d) => ({
    period: toChartKey(d.anio, d.mes),
    Presupuestado: d.presupuestado,
    "Costo Real": d.realCosto,
  }));

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-[#222222] bg-[#111111] p-6">
        <h3 className="mb-5 text-sm font-semibold text-[#F1BE48]">
          Costo presupuestado vs real — tendencia mensual
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
            <XAxis dataKey="period" tick={axisProps} />
            <YAxis tick={axisProps} tickFormatter={(v) => `$${(v/1_000_000).toFixed(1)}M`} />
            <Tooltip formatter={(v: unknown) => [fmt(v as number)]} contentStyle={tooltipStyle} />
            <Legend />
            <Bar dataKey="Presupuestado" fill={CHART_COLORS[2]} radius={[4,4,0,0]} />
            <Bar dataKey="Costo Real" fill={CHART_COLORS[0]} radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <PeriodTable
        headers={["Período", "HC Proy.", "HC Real", "Presupuestado", "Costo Real", "% Ejec."]}
        rows={data.map((d) => {
          const pct = d.presupuestado > 0 ? (d.realCosto / d.presupuestado) * 100 : 0;
          return {
            cells: [
              <PeriodLink key="p" anio={d.anio} mes={d.mes} module="comercial" />,
              d.hcProyectado.toLocaleString("es-MX"),
              d.realHc.toLocaleString("es-MX"),
              <span key="pr" className="text-[#9A9A9A]">{fmt(d.presupuestado)}</span>,
              fmt(d.realCosto),
              <Pct key="pct" value={pct} />,
            ],
          };
        })}
      />
    </div>
  );
}

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

function PeriodTable({ headers, rows }: { headers: string[]; rows: { cells: React.ReactNode[] }[] }) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-[#222222] bg-[#111111]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#222222]">
            {headers.map((h) => (
              <th key={h} className="px-6 pb-3 pt-4 text-left font-medium text-[#9A9A9A]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1A1A1A]">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-white/5">
              {row.cells.map((cell, j) => (
                <td key={j} className="px-6 py-3 text-[#F1BE48]">{cell}</td>
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
      <p className="text-[#9A9A9A]">No hay datos históricos.</p>
    </div>
  );
}
