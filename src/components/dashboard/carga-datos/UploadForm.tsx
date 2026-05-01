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
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Módulo
          </label>
          <select
            name="module"
            required
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-950 outline-none focus:border-[#A9945D] focus:bg-white focus:ring-2 focus:ring-[#A9945D]/20"
          >
            {MODULOS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Año
          </label>
          <select
            name="anio"
            defaultValue={now.getFullYear()}
            required
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-950 outline-none focus:border-[#A9945D] focus:bg-white focus:ring-2 focus:ring-[#A9945D]/20"
          >
            {ANIOS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Mes
          </label>
          <select
            name="mes"
            defaultValue={now.getMonth() + 1}
            required
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-950 outline-none focus:border-[#A9945D] focus:bg-white focus:ring-2 focus:ring-[#A9945D]/20"
          >
            {MESES.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">
          Archivo Excel
        </label>
        <label
          htmlFor="file-input"
          className={[
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 transition",
            fileName
              ? "border-[#A9945D]/40 bg-[#A9945D]/5"
              : "border-neutral-200 bg-neutral-50 hover:border-[#A9945D]/40 hover:bg-[#A9945D]/5",
          ].join(" ")}
        >
          {fileName ? (
            <>
              <FileSpreadsheet className="h-8 w-8 text-[#A9945D]" />
              <div className="text-center">
                <p className="text-sm font-medium text-neutral-950">{fileName}</p>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); handleReset(); }}
                  className="mt-1 text-xs text-neutral-400 hover:text-red-500"
                >
                  Cambiar archivo
                </button>
              </div>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-neutral-300" />
              <div className="text-center">
                <p className="text-sm font-medium text-neutral-700">
                  Arrastra tu archivo aquí o{" "}
                  <span className="text-[#A9945D]">haz clic para buscar</span>
                </p>
                <p className="mt-1 text-xs text-neutral-400">
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
        className="flex items-center gap-2 rounded-xl bg-[#A9945D] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#7A673A] disabled:opacity-50"
      >
        <Upload className="h-4 w-4" />
        {isPending ? "Procesando…" : "Cargar datos"}
      </button>
    </form>
  );
}
