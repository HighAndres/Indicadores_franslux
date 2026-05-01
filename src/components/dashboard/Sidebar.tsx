"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { brandConfig } from "@/lib/brand";
import { dashboardMenu } from "@/lib/menu";

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();

  const visibleItems = dashboardMenu.filter((item) =>
    (item.roles as readonly string[]).includes(role)
  );

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 border-r border-neutral-200 bg-white">
      <div className="flex h-full flex-col">
        <div className="border-b border-neutral-200 px-6 py-6">
          <div className="mb-4 flex items-center gap-3">
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

          <p className="text-sm leading-5 text-neutral-500">
            {brandConfig.tagline}
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-5">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "bg-[#A9945D]/10 text-[#7A673A]"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950",
                ].join(" ")}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-neutral-200 px-6 py-5">
          <p className="text-xs text-neutral-400">Desarrollado por</p>
          <p className="text-sm font-semibold text-neutral-800">Mirmibug</p>
        </div>
      </div>
    </aside>
  );
}
