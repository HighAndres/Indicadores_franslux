import type { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: string;
  subtitle?: string;
  icon?: ReactNode;
  highlight?: boolean;
}

export function KpiCard({ label, value, subtitle, icon, highlight }: KpiCardProps) {
  return (
    <div
      className={[
        "rounded-3xl border p-6",
        highlight
          ? "border-[#F1BE48]/20 bg-[#F1BE48]/5"
          : "border-[#222222] bg-[#111111]",
      ].join(" ")}
    >
      {icon && (
        <div className="mb-4 inline-flex rounded-2xl bg-[#F1BE48]/10 p-3 text-[#F1BE48]">
          {icon}
        </div>
      )}
      <p className="text-sm font-medium text-[#9A9A9A]">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-[#F1BE48]">{value}</p>
      {subtitle && <p className="mt-1 text-sm text-[#9A9A9A]">{subtitle}</p>}
    </div>
  );
}
