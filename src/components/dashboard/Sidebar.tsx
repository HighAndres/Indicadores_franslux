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
        "fixed left-0 top-0 z-50 h-screen w-72 border-r border-neutral-200 bg-white transition-transform duration-300 ease-in-out",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
      ].join(" ")}
    >
      <div className="flex h-full flex-col">
        {/* Logo + close button */}
        <div className="border-b border-neutral-200 px-6 py-6">
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={brandConfig.logo}
                alt={brandConfig.clientName}
                className="h-10 w-auto"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-400">
                  {brandConfig.clientName}
                </p>
                <h1 className="text-lg font-semibold text-neutral-900">
                  {brandConfig.appName}
                </h1>
              </div>
            </div>

            {/* Close button — mobile only */}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-100 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="mt-3 text-sm leading-5 text-neutral-500">
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
                    ? "bg-[#A9945D]/10 text-[#7A673A]"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950",
                ].join(" ")}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-neutral-200 px-6 py-5">
          <p className="text-xs text-neutral-400">Desarrollado por</p>
          <p className="text-sm font-semibold text-neutral-800">Mirmibug</p>
        </div>
      </div>
    </aside>
  );
}
