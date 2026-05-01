"use client";

import { useActionState, useRef, useState } from "react";
import { Upload, CheckCircle, XCircle, FileSpreadsheet } from "lucide-react";
import { uploadData } from "@/app/dashboard/carga-datos/actions";
import type { UploadState } from "@/app/dashboard/carga-datos/actions";

const MODULOS = [
  { value: "FORECAST", label: "Forecast — Gasto mensual" },
  { value: "HC", label: "Headcount — Colaboradores" },
  { value: "COMERCIAL", label: "Comercial — Comisiones" },
];

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const ANIOS = [2024, 2025, 2026];

const now = new Date();

export function UploadForm() {
  const [state, action, isPending] = useActionState<UploadState, FormData>(
    uploadData,
    null
  );
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setFileName(f?.name ?? null);
  }

  function handleReset() {
    setFileName(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#9A9A9A]">
            Módulo
          </label>
          <select
            name="module"
            required
            className="w-full rounded-xl border border-[#222222] bg-[#1A1A1A] px-4 py-2.5 text-sm text-[#F1BE48] outline-none focus:border-[#238D80] focus:bg-[#111111] focus:ring-2 focus:ring-[#238D80]/20"
          >
            {MODULOS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#9A9A9A]">
            Año
          </label>
          <select
            name="anio"
            defaultValue={now.getFullYear()}
            required
            className="w-full rounded-xl border border-[#222222] bg-[#1A1A1A] px-4 py-2.5 text-sm text-[#F1BE48] outline-none focus:border-[#238D80] focus:bg-[#111111] focus:ring-2 focus:ring-[#238D80]/20"
          >
            {ANIOS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#9A9A9A]">
            Mes
          </label>
          <select
            name="mes"
            defaultValue={now.getMonth() + 1}
            required
            className="w-full rounded-xl border border-[#222222] bg-[#1A1A1A] px-4 py-2.5 text-sm text-[#F1BE48] outline-none focus:border-[#238D80] focus:bg-[#111111] focus:ring-2 focus:ring-[#238D80]/20"
          >
            {MESES.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#9A9A9A]">
          Archivo Excel
        </label>
        <label
          htmlFor="file-input"
          className={[
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 transition",
            fileName
              ? "border-[#238D80]/40 bg-[#238D80]/5"
              : "border-[#222222] bg-[#1A1A1A] hover:border-[#238D80]/40 hover:bg-[#238D80]/5",
          ].join(" ")}
        >
          {fileName ? (
            <>
              <FileSpreadsheet className="h-8 w-8 text-[#238D80]" />
              <div className="text-center">
                <p className="text-sm font-medium text-[#F1BE48]">{fileName}</p>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); handleReset(); }}
                  className="mt-1 text-xs text-[#555555] hover:text-red-500"
                >
                  Cambiar archivo
                </button>
              </div>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-neutral-300" />
              <div className="text-center">
                <p className="text-sm font-medium text-[#9A9A9A]">
                  Arrastra tu archivo aquí o{" "}
                  <span className="text-[#238D80]">haz clic para buscar</span>
                </p>
                <p className="mt-1 text-xs text-[#555555]">
                  Solo archivos .xlsx o .xls
                </p>
              </div>
            </>
          )}
          <input
            id="file-input"
            ref={fileRef}
            type="file"
            name="file"
            accept=".xlsx,.xls"
            required
            onChange={handleFileChange}
            className="sr-only"
          />
        </label>
      </div>

      {state && (
        <div
          className={[
            "flex items-start gap-3 rounded-2xl px-4 py-3 text-sm",
            state.success
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-600",
          ].join(" ")}
        >
          {state.success ? (
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <span>{state.message}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || !fileName}
        className="flex items-center gap-2 rounded-xl bg-[#238D80] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#205C40] disabled:opacity-50"
      >
        <Upload className="h-4 w-4" />
        {isPending ? "Procesando…" : "Cargar datos"}
      </button>
    </form>
  );
}
