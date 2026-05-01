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

const fmt = (v: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(v);

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

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-base font-semibold text-neutral-950">
            Real vs Presupuesto por Cadena
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byCadena} {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F1EF" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#6B7280" }}
                angle={-35}
                textAnchor="end"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6B7280" }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(v: unknown) => [fmt(v as number)]}
                contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB" }}
              />
              <Legend />
              <Bar dataKey="real" name="Real" fill="#A9945D" radius={[4, 4, 0, 0]} />
              <Bar dataKey="presupuesto" name="Presupuesto" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-base font-semibold text-neutral-950">
            Real vs Presupuesto por KAM
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byKam} {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F1EF" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#6B7280" }}
                angle={-35}
                textAnchor="end"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6B7280" }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(v: unknown) => [fmt(v as number)]}
                contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB" }}
              />
              <Legend />
              <Bar dataKey="real" name="Real" fill="#A9945D" radius={[4, 4, 0, 0]} />
              <Bar dataKey="presupuesto" name="Presupuesto" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-neutral-950">Detalle por tienda</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100">
              <th className="pb-3 text-left font-medium text-neutral-500">Cadena</th>
              <th className="pb-3 text-left font-medium text-neutral-500">KAM</th>
              <th className="pb-3 text-left font-medium text-neutral-500">Tienda</th>
              <th className="pb-3 text-right font-medium text-neutral-500">Real</th>
              <th className="pb-3 text-right font-medium text-neutral-500">Presupuesto</th>
              <th className="pb-3 text-right font-medium text-neutral-500">% Ejec.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {data.map((row, i) => {
              const pct = row.presupuesto > 0 ? (row.real / row.presupuesto) * 100 : 0;
              return (
                <tr key={i} className="hover:bg-neutral-50/50">
                  <td className="py-3 text-neutral-600">{row.cadena}</td>
                  <td className="py-3 text-neutral-600">{row.kam}</td>
                  <td className="py-3 font-medium text-neutral-950">{row.tienda}</td>
                  <td className="py-3 text-right text-neutral-950">{fmt(row.real)}</td>
                  <td className="py-3 text-right text-neutral-400">{fmt(row.presupuesto)}</td>
                  <td
                    className={`py-3 text-right font-semibold ${
                      pct > 100 ? "text-emerald-600" : "text-amber-600"
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
