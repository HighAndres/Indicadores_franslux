"use client";

import { Download } from "lucide-react";

interface DownloadButtonProps {
  module: "forecast" | "hc" | "comercial";
  anio: number;
  mes: number;
}

export function DownloadButton({ module, anio, mes }: DownloadButtonProps) {
  return (
    <a
      href={`/api/download/${module}?anio=${anio}&mes=${mes}`}
      className="flex items-center gap-2 rounded-xl border border-[#222222] bg-[#111111] px-4 py-2 text-sm font-medium text-[#9A9A9A] transition hover:border-[#238D80]/30 hover:bg-[#238D80]/5 hover:text-[#205C40]"
    >
      <Download className="h-4 w-4" />
      Descargar Excel
    </a>
  );
}
