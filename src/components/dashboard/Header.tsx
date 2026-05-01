"use client";

import { signOut } from "next-auth/react";
import { LogOut, Menu } from "lucide-react";
import { brandConfig } from "@/lib/brand";

interface HeaderUser {
  name?: string | null;
  email?: string | null;
  role: string;
}

interface HeaderProps {
  user: HeaderUser;
  onMenuClick: () => void;
}

export function Header({ user, onMenuClick }: HeaderProps) {
  const roleLabel =
    user.role === "CLIENT_ADMIN" ? "Administrador" : "Visualizador";

  const initials = (user.name ?? "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-10 border-b border-[#222222] bg-black/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        {/* Left: hamburger (mobile) + title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="rounded-xl p-2 text-[#9A9A9A] transition hover:bg-white/5 lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden sm:block">
            <p className="text-xs font-medium text-[#9A9A9A]">
              {brandConfig.clientName}
            </p>
            <h2 className="text-xl font-semibold text-[#F1BE48] lg:text-2xl">
              {brandConfig.appName}
            </h2>
          </div>

          {/* App name only on mobile (very compact) */}
          <h2 className="text-base font-semibold text-[#F1BE48] sm:hidden">
            {brandConfig.appName}
          </h2>
        </div>

        {/* Right: user info + logout */}
        <div className="flex items-center gap-2">
          {/* Full name + role — desktop only */}
          <div className="hidden items-center gap-3 rounded-full border border-[#222222] bg-[#111111] px-4 py-2 lg:flex">
            <span className="text-sm font-medium text-[#F1BE48]">
              {user.name}
            </span>
            <span className="text-[#444444]">·</span>
            <span className="text-sm text-[#9A9A9A]">{roleLabel}</span>
          </div>

          {/* Initials avatar — mobile/tablet only */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#222222] bg-[#111111] text-xs font-semibold text-[#F1BE48] lg:hidden">
            {initials}
          </div>

          {/* Logout */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 rounded-full border border-[#222222] bg-[#111111] px-3 py-2 text-sm text-[#9A9A9A] transition hover:border-red-800 hover:bg-red-950 hover:text-red-400"
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
}
