"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line,
} from "recharts";

export interface ComercialRow {
  mes: number;
  hcProyectado: number;
  presupuestado: number;
  realHc: number;
  realCosto: number;
}

const CHART_COLORS = ["#238D80", "#00859B", "#003057", "#205C40"];
const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const fmt = (v: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(v);

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #222222",
  backgroundColor: "#111111",
  color: "#F1BE48",
};

export function ComercialCharts({ data, selectedMes }: { data: ComercialRow[]; selectedMes: number }) {
  const chartData = data.map((d) => ({
    mes: MESES[d.mes - 1],
    Presupuestado: d.presupuestado,
    "Costo Real": d.realCosto,
    "HC Proy.": d.hcProyectado,
    "HC Real": d.realHc,
    isSelected: d.mes === selectedMes,
  }));

  const axisProps = { fontSize: 11, fill: "#9A9A9A" };

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-[#222222] bg-[#111111] p-6">
          <h2 className="mb-6 text-base font-semibold text-[#F1BE48]">
            Costo Presupuestado vs Real
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
              <XAxis dataKey="mes" tick={axisProps} />
              <YAxis tick={axisProps} tickFormatter={(v) => `$${(v / 1_000_000).toFixed(1)}M`} />
              <Tooltip formatter={(v: unknown) => [fmt(v as number)]} contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="Presupuestado" fill={CHART_COLORS[2]} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Costo Real" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-3xl border border-[#222222] bg-[#111111] p-6">
          <h2 className="mb-6 text-base font-semibold text-[#F1BE48]">
            HC Proyectado vs Real
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
              <XAxis dataKey="mes" tick={axisProps} />
              <YAxis tick={axisProps} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="HC Proy." fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="HC Real" stroke={CHART_COLORS[0]} strokeWidth={2} dot={{ r: 4, fill: CHART_COLORS[0] }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-[#222222] bg-[#111111] p-6">
        <h2 className="mb-4 text-base font-semibold text-[#F1BE48]">Detalle mensual</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#222222]">
              <th className="pb-3 text-left font-medium text-[#9A9A9A]">Mes</th>
              <th className="pb-3 text-right font-medium text-[#9A9A9A]">HC Proy.</th>
              <th className="pb-3 text-right font-medium text-[#9A9A9A]">HC Real</th>
              <th className="pb-3 text-right font-medium text-[#9A9A9A]">Var HC</th>
              <th className="pb-3 text-right font-medium text-[#9A9A9A]">Presupuestado</th>
              <th className="pb-3 text-right font-medium text-[#9A9A9A]">Costo Real</th>
              <th className="pb-3 text-right font-medium text-[#9A9A9A]">% Ejec.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A1A1A]">
            {data.map((row) => {
              const varHc = row.realHc - row.hcProyectado;
              const pct = row.presupuestado > 0 ? (row.realCosto / row.presupuestado) * 100 : 0;
              return (
                <tr
                  key={row.mes}
                  className={row.mes === selectedMes ? "bg-[#238D80]/5" : "hover:bg-white/5"}
                >
                  <td className="py-3 font-medium text-[#F1BE48]">{MESES[row.mes - 1]}</td>
                  <td className="py-3 text-right text-[#9A9A9A]">{row.hcProyectado.toLocaleString("es-MX")}</td>
                  <td className="py-3 text-right text-[#F1BE48]">{row.realHc.toLocaleString("es-MX")}</td>
                  <td className={`py-3 text-right font-semibold ${varHc >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {varHc >= 0 ? "+" : ""}{varHc}
                  </td>
                  <td className="py-3 text-right text-[#9A9A9A]">{fmt(row.presupuestado)}</td>
                  <td className="py-3 text-right text-[#F1BE48]">{fmt(row.realCosto)}</td>
                  <td
                    className={`py-3 text-right font-semibold ${
                      pct > 100 ? "text-amber-400" : "text-emerald-400"
                    }`}
                  >
                    {pct.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
