"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const ANIOS = [2024, 2025, 2026];

interface PeriodSelectorProps {
  anio: number;
  mes: number;
}

export function PeriodSelector({ anio, mes }: PeriodSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function update(key: "anio" | "mes", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className={`flex items-center gap-2 ${isPending ? "opacity-60" : ""}`}>
      <select
        value={anio}
        onChange={(e) => update("anio", e.target.value)}
        className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 outline-none focus:border-[#A9945D] focus:ring-2 focus:ring-[#A9945D]/20"
      >
        {ANIOS.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
      <select
        value={mes}
        onChange={(e) => update("mes", e.target.value)}
        className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 outline-none focus:border-[#A9945D] focus:ring-2 focus:ring-[#A9945D]/20"
      >
        {MESES.map((m, i) => (
          <option key={i + 1} value={i + 1}>{m}</option>
        ))}
      </select>
      {isPending && <span className="text-sm text-neutral-400">Cargando…</span>}
    </div>
  );
}
