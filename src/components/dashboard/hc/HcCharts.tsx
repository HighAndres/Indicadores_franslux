"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface HcChartsProps {
  generoM: number;
  generoF: number;
  total: number;
  altas: number;
  bajas: number;
}

export function HcCharts({ generoM, generoF, total, altas, bajas }: HcChartsProps) {
  const pieData = [
    { name: "Masculino", value: generoM },
    { name: "Femenino", value: generoF },
  ];

  const movData = [
    { name: "Total", value: total },
    { name: "Altas", value: altas },
    { name: "Bajas", value: bajas },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-base font-semibold text-neutral-950">
          Distribución por género
        </h2>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
            >
              <Cell fill="#A9945D" />
              <Cell fill="#CBD5E1" />
            </Pie>
            <Tooltip
              formatter={(v: unknown) => [(v as number).toLocaleString("es-MX"), "Colaboradores"]}
              contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB" }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>

        <div className="mt-2 grid grid-cols-2 gap-4 border-t border-neutral-100 pt-4">
          <div className="text-center">
            <p className="text-2xl font-semibold text-neutral-950">
              {generoM.toLocaleString("es-MX")}
            </p>
            <p className="text-sm text-neutral-500">Masculino</p>
            <p className="text-xs text-neutral-400">
              {total > 0 ? ((generoM / total) * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-neutral-950">
              {generoF.toLocaleString("es-MX")}
            </p>
            <p className="text-sm text-neutral-500">Femenino</p>
            <p className="text-xs text-neutral-400">
              {total > 0 ? ((generoF / total) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-base font-semibold text-neutral-950">
          Movimiento de personal
        </h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={movData} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F1EF" />
            <XAxis dataKey="name" tick={{ fontSize: 13, fill: "#6B7280" }} />
            <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} />
            <Tooltip
              formatter={(v: unknown) => [(v as number).toLocaleString("es-MX"), "Personas"]}
              contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB" }}
            />
            <Bar dataKey="value" name="Personas" fill="#A9945D" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
