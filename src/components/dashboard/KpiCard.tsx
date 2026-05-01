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
          ? "border-[#A9945D]/20 bg-[#A9945D]/5"
          : "border-neutral-200 bg-white shadow-sm",
      ].join(" ")}
    >
      {icon && (
        <div className="mb-4 inline-flex rounded-2xl bg-[#A9945D]/10 p-3 text-[#7A673A]">
          {icon}
        </div>
      )}
      <p className="text-sm font-medium text-neutral-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-neutral-950">{value}</p>
      {subtitle && <p className="mt-1 text-sm text-neutral-400">{subtitle}</p>}
    </div>
  );
}
