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
} from "recharts";

export interface ComercialRow {
  cadena: string;
  kam: string;
  tienda: string;
  real: number;
  presupuesto: number;
}

const CHART_COLORS = ["#238D80", "#00859B", "#003057", "#205C40"];

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

function aggregate(
  data: ComercialRow[],
  key: keyof Pick<ComercialRow, "cadena" | "kam">
) {
  return Object.values(
    data.reduce<Record<string, { name: string; real: number; presupuesto: number }>>(
      (acc, row) => {
        const k = row[key];
        if (!acc[k]) acc[k] = { name: k, real: 0, presupuesto: 0 };
        acc[k].real += row.real;
        acc[k].presupuesto += row.presupuesto;
        return acc;
      },
      {}
    )
  ).sort((a, b) => b.real - a.real);
}

export function ComercialCharts({ data }: { data: ComercialRow[] }) {
  const byCadena = aggregate(data, "cadena");
  const byKam = aggregate(data, "kam");

  const chartProps = {
    margin: { top: 4, right: 4, left: 0, bottom: 60 },
  };

  const axisProps = { fontSize: 11, fill: "#9A9A9A" };

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-[#222222] bg-[#111111] p-6">
          <h2 className="mb-6 text-base font-semibold text-[#F1BE48]">
            Real vs Presupuesto por Cadena
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byCadena} {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
              <XAxis dataKey="name" tick={axisProps} angle={-35} textAnchor="end" />
              <YAxis tick={axisProps} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: unknown) => [fmt(v as number)]} contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="real" name="Real" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
              <Bar dataKey="presupuesto" name="Presupuesto" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-3xl border border-[#222222] bg-[#111111] p-6">
          <h2 className="mb-6 text-base font-semibold text-[#F1BE48]">
            Real vs Presupuesto por KAM
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byKam} {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
              <XAxis dataKey="name" tick={axisProps} angle={-35} textAnchor="end" />
              <YAxis tick={axisProps} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: unknown) => [fmt(v as number)]} contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="real" name="Real" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
              <Bar dataKey="presupuesto" name="Presupuesto" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-[#222222] bg-[#111111] p-6">
        <h2 className="mb-4 text-base font-semibold text-[#F1BE48]">Detalle por tienda</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#222222]">
              <th className="pb-3 text-left font-medium text-[#9A9A9A]">Cadena</th>
              <th className="pb-3 text-left font-medium text-[#9A9A9A]">KAM</th>
              <th className="pb-3 text-left font-medium text-[#9A9A9A]">Tienda</th>
              <th className="pb-3 text-right font-medium text-[#9A9A9A]">Real</th>
              <th className="pb-3 text-right font-medium text-[#9A9A9A]">Presupuesto</th>
              <th className="pb-3 text-right font-medium text-[#9A9A9A]">% Ejec.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A1A1A]">
            {data.map((row, i) => {
              const pct = row.presupuesto > 0 ? (row.real / row.presupuesto) * 100 : 0;
              return (
                <tr key={i} className="hover:bg-white/5">
                  <td className="py-3 text-[#9A9A9A]">{row.cadena}</td>
                  <td className="py-3 text-[#9A9A9A]">{row.kam}</td>
                  <td className="py-3 font-medium text-[#F1BE48]">{row.tienda}</td>
                  <td className="py-3 text-right text-[#F1BE48]">{fmt(row.real)}</td>
                  <td className="py-3 text-right text-[#9A9A9A]">{fmt(row.presupuesto)}</td>
                  <td
                    className={`py-3 text-right font-semibold ${
                      pct > 100 ? "text-emerald-400" : "text-amber-400"
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
