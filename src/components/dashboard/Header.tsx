"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { brandConfig } from "@/lib/brand";

interface HeaderUser {
  name?: string | null;
  email?: string | null;
  role: string;
}

export function Header({ user }: { user: HeaderUser }) {
  const roleLabel =
    user.role === "CLIENT_ADMIN" ? "Administrador" : "Visualizador";

  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-[#F7F7F5]/90 px-8 py-5 backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-500">
            {brandConfig.clientName}
          </p>
          <h2 className="text-2xl font-semibold text-neutral-950">
            {brandConfig.appName}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-600">
            <span className="font-medium text-neutral-950">{user.name}</span>
            <span className="ml-2 text-neutral-400">·</span>
            <span className="ml-2 text-neutral-500">{roleLabel}</span>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
