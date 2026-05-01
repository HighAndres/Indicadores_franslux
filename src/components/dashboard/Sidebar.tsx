"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { brandConfig } from "@/lib/brand";
import { dashboardMenu } from "@/lib/menu";

interface SidebarProps {
  role: string;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const visibleItems = dashboardMenu.filter((item) =>
    (item.roles as readonly string[]).includes(role)
  );

  return (
    <aside
      className={[
        "fixed left-0 top-0 z-50 h-screen w-72 border-r border-[#222222] bg-black transition-transform duration-300 ease-in-out",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
      ].join(" ")}
    >
      <div className="flex h-full flex-col">
        {/* Logo + close button */}
        <div className="border-b border-[#222222] px-6 py-6">
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={brandConfig.logoDark}
                alt={brandConfig.clientName}
                className="h-10 w-auto"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#9A9A9A]">
                  {brandConfig.clientName}
                </p>
                <h1 className="text-lg font-semibold text-[#F1BE48]">
                  {brandConfig.appName}
                </h1>
              </div>
            </div>

            {/* Close button — mobile only */}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-[#9A9A9A] transition hover:bg-white/5 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="mt-3 text-sm leading-5 text-[#9A9A9A]">
            {brandConfig.tagline}
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={[
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "bg-[#F1BE48]/10 text-[#F1BE48]"
                    : "text-[#9A9A9A] hover:bg-white/5 hover:text-[#F1BE48]",
                ].join(" ")}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-[#222222] px-6 py-5">
          <p className="text-xs text-[#9A9A9A]">Desarrollado por</p>
          <p className="text-sm font-semibold text-[#F1BE48]">Mirmibug</p>
        </div>
      </div>
    </aside>
  );
}
