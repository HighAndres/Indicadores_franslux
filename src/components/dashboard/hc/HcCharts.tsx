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

const CHART_COLORS = ["#238D80", "#00859B", "#003057", "#205C40"];

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #222222",
  backgroundColor: "#111111",
  color: "#F1BE48",
};

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

  const axisProps = { fontSize: 11, fill: "#9A9A9A" };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-3xl border border-[#222222] bg-[#111111] p-6">
        <h2 className="mb-6 text-base font-semibold text-[#F1BE48]">
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
              <Cell fill={CHART_COLORS[0]} />
              <Cell fill={CHART_COLORS[1]} />
            </Pie>
            <Tooltip
              formatter={(v: unknown) => [(v as number).toLocaleString("es-MX"), "Colaboradores"]}
              contentStyle={tooltipStyle}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>

        <div className="mt-2 grid grid-cols-2 gap-4 border-t border-[#222222] pt-4">
          <div className="text-center">
            <p className="text-2xl font-semibold text-[#F1BE48]">
              {generoM.toLocaleString("es-MX")}
            </p>
            <p className="text-sm text-[#9A9A9A]">Masculino</p>
            <p className="text-xs text-[#9A9A9A]">
              {total > 0 ? ((generoM / total) * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-[#F1BE48]">
              {generoF.toLocaleString("es-MX")}
            </p>
            <p className="text-sm text-[#9A9A9A]">Femenino</p>
            <p className="text-xs text-[#9A9A9A]">
              {total > 0 ? ((generoF / total) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-[#222222] bg-[#111111] p-6">
        <h2 className="mb-6 text-base font-semibold text-[#F1BE48]">
          Movimiento de personal
        </h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={movData} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
            <XAxis dataKey="name" tick={axisProps} />
            <YAxis tick={axisProps} />
            <Tooltip
              formatter={(v: unknown) => [(v as number).toLocaleString("es-MX"), "Personas"]}
              contentStyle={tooltipStyle}
            />
            <Bar dataKey="value" name="Personas" fill={CHART_COLORS[0]} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
