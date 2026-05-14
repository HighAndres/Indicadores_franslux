"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
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

interface HcRow {
  poblacion: string;
  hcPresupuesto: number;
  hcReal: number;
  altas: number;
  bajas: number;
}

interface MonthlyRow {
  mes: number;
  hcPresupuesto: number;
  hcReal: number;
  altas: number;
  bajas: number;
}

interface HcChartsProps {
  currentMonthData: HcRow[];
  monthlyData: MonthlyRow[];
  poblaciones: string[];
  selectedPoblacion: string;
  totalHcPresup: number;
  totalHcReal: number;
}

const CHART_COLORS = ["#238D80", "#00859B", "#003057", "#205C40", "#F1BE48"];
const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #222222",
  backgroundColor: "#111111",
  color: "#F1BE48",
};

export function HcCharts({
  currentMonthData,
  monthlyData,
  poblaciones,
  selectedPoblacion,
  totalHcPresup,
  totalHcReal,
}: HcChartsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updatePoblacion(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("poblacion", value);
    } else {
      params.delete("poblacion");
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  const pieData = currentMonthData.map((d) => ({
    name: d.poblacion,
    value: d.hcReal,
  }));

  const barData = currentMonthData.map((d) => ({
    name: d.poblacion,
    "HC Presup.": d.hcPresupuesto,
    "HC Real": d.hcReal,
    Altas: d.altas,
    Bajas: d.bajas,
  }));

  const monthlyChartData = monthlyData.map((d) => ({
    mes: MESES[d.mes - 1],
    "HC Presup.": d.hcPresupuesto,
    "HC Real": d.hcReal,
  }));

  const axisProps = { fontSize: 11, fill: "#9A9A9A" };

  return (
    <div className="space-y-5">
      {/* Filtro por población */}
      <div className={`flex items-center gap-3 ${isPending ? "opacity-60" : ""}`}>
        <label className="text-sm font-medium text-[#9A9A9A]">Población:</label>
        <select
          value={selectedPoblacion}
          onChange={(e) => updatePoblacion(e.target.value)}
          className="rounded-xl border border-[#222222] bg-[#111111] px-3 py-2 text-sm font-medium text-[#9A9A9A] outline-none focus:border-[#238D80] focus:ring-2 focus:ring-[#238D80]/20"
        >
          <option value="">Todas las poblaciones</option>
          {poblaciones.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        {isPending && <span className="text-sm text-[#555555]">Cargando…</span>}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-[#222222] bg-[#111111] p-6">
          <h2 className="mb-6 text-base font-semibold text-[#F1BE48]">
            Distribución por población
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
                {pieData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
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
                {totalHcPresup.toLocaleString("es-MX")}
              </p>
              <p className="text-sm text-[#9A9A9A]">HC Presupuestado</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-[#F1BE48]">
                {totalHcReal.toLocaleString("es-MX")}
              </p>
              <p className="text-sm text-[#9A9A9A]">HC Real</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-[#222222] bg-[#111111] p-6">
          <h2 className="mb-6 text-base font-semibold text-[#F1BE48]">
            HC Presupuestado vs Real por población
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
              <XAxis dataKey="name" tick={axisProps} />
              <YAxis tick={axisProps} />
              <Tooltip
                formatter={(v: unknown) => [(v as number).toLocaleString("es-MX"), "Personas"]}
                contentStyle={tooltipStyle}
              />
              <Legend />
              <Bar dataKey="HC Presup." fill={CHART_COLORS[2]} radius={[4, 4, 0, 0]} />
              <Bar dataKey="HC Real" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfica mensual HC Presupuestado vs Real */}
      <div className="rounded-3xl border border-[#222222] bg-[#111111] p-6">
        <h2 className="mb-6 text-base font-semibold text-[#F1BE48]">
          HC Presupuestado vs Real — Evolución mensual
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthlyChartData} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
            <XAxis dataKey="mes" tick={axisProps} />
            <YAxis tick={axisProps} />
            <Tooltip
              formatter={(v: unknown) => [(v as number).toLocaleString("es-MX"), "Personas"]}
              contentStyle={tooltipStyle}
            />
            <Legend />
            <Bar dataKey="HC Presup." fill={CHART_COLORS[2]} radius={[4, 4, 0, 0]} />
            <Bar dataKey="HC Real" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabla mensual Ene-Dic */}
      <div className="overflow-x-auto rounded-3xl border border-[#222222] bg-[#111111] p-6">
        <h2 className="mb-4 text-base font-semibold text-[#F1BE48]">
          {selectedPoblacion
            ? `Detalle mensual — ${selectedPoblacion}`
            : "Detalle mensual (todas las poblaciones)"}
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#222222]">
              <th className="pb-3 text-left font-medium text-[#9A9A9A]">Mes</th>
              <th className="pb-3 text-right font-medium text-[#9A9A9A]">HC Presup.</th>
              <th className="pb-3 text-right font-medium text-[#9A9A9A]">HC Real</th>
              <th className="pb-3 text-right font-medium text-[#9A9A9A]">Variación</th>
              <th className="pb-3 text-right font-medium text-[#9A9A9A]">Altas</th>
              <th className="pb-3 text-right font-medium text-[#9A9A9A]">Bajas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A1A1A]">
            {monthlyData.map((row) => {
              const diff = row.hcReal - row.hcPresupuesto;
              const hasData = row.hcPresupuesto > 0 || row.hcReal > 0 || row.altas > 0 || row.bajas > 0;
              return (
                <tr key={row.mes} className="hover:bg-white/5">
                  <td className="py-3 font-medium text-[#F1BE48]">{MESES[row.mes - 1]}</td>
                  <td className="py-3 text-right text-[#9A9A9A]">
                    {hasData ? row.hcPresupuesto.toLocaleString("es-MX") : "0"}
                  </td>
                  <td className="py-3 text-right text-[#F1BE48]">
                    {hasData ? row.hcReal.toLocaleString("es-MX") : "0"}
                  </td>
                  <td className={`py-3 text-right font-semibold ${
                    diff > 0 ? "text-emerald-400" : diff < 0 ? "text-red-400" : "text-[#9A9A9A]"
                  }`}>
                    {diff > 0 ? "+" : ""}{diff}
                  </td>
                  <td className="py-3 text-right text-emerald-400">
                    {row.altas > 0 ? `+${row.altas}` : "0"}
                  </td>
                  <td className="py-3 text-right text-red-400">
                    {row.bajas > 0 ? `-${row.bajas}` : "0"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detalle por población del mes seleccionado */}
      {!selectedPoblacion && currentMonthData.length > 0 && (
        <div className="overflow-x-auto rounded-3xl border border-[#222222] bg-[#111111] p-6">
          <h2 className="mb-4 text-base font-semibold text-[#F1BE48]">Detalle por población</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#222222]">
                <th className="pb-3 text-left font-medium text-[#9A9A9A]">Población</th>
                <th className="pb-3 text-right font-medium text-[#9A9A9A]">HC Presup.</th>
                <th className="pb-3 text-right font-medium text-[#9A9A9A]">HC Real</th>
                <th className="pb-3 text-right font-medium text-[#9A9A9A]">Var.</th>
                <th className="pb-3 text-right font-medium text-[#9A9A9A]">Altas</th>
                <th className="pb-3 text-right font-medium text-[#9A9A9A]">Bajas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]">
              {currentMonthData.map((row, i) => {
                const diff = row.hcReal - row.hcPresupuesto;
                return (
                  <tr key={i} className="hover:bg-white/5">
                    <td className="py-3 font-medium text-[#F1BE48]">{row.poblacion}</td>
                    <td className="py-3 text-right text-[#9A9A9A]">{row.hcPresupuesto.toLocaleString("es-MX")}</td>
                    <td className="py-3 text-right text-[#F1BE48]">{row.hcReal.toLocaleString("es-MX")}</td>
                    <td className={`py-3 text-right font-semibold ${diff >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {diff >= 0 ? "+" : ""}{diff}
                    </td>
                    <td className="py-3 text-right text-emerald-400">+{row.altas}</td>
                    <td className="py-3 text-right text-red-400">-{row.bajas}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
