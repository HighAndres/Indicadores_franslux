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
      className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-[#A9945D]/30 hover:bg-[#A9945D]/5 hover:text-[#7A673A]"
    >
      <Download className="h-4 w-4" />
      Descargar Excel
    </a>
  );
}
