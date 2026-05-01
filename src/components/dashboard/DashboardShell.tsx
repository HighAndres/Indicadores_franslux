"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { ReactNode } from "react";
import { signOut } from "next-auth/react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";

const IDLE_MS = 7 * 60 * 1000; // 7 minutos
const WARN_MS = 60 * 1000;      // aviso 1 minuto antes

const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];

interface ShellUser {
  name?: string | null;
  email?: string | null;
  role: string;
}

export function DashboardShell({
  user,
  children,
}: {
  user: ShellUser;
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const logout = useCallback(() => {
    signOut({ callbackUrl: "/login" });
  }, []);

  const resetTimers = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (warnTimer.current) clearTimeout(warnTimer.current);
    setShowWarning(false);

    warnTimer.current = setTimeout(() => {
      setShowWarning(true);
    }, IDLE_MS - WARN_MS);

    idleTimer.current = setTimeout(() => {
      logout();
    }, IDLE_MS);
  }, [logout]);

  useEffect(() => {
    resetTimers();
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, resetTimers, { passive: true }));
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (warnTimer.current) clearTimeout(warnTimer.current);
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, resetTimers));
    };
  }, [resetTimers]);

  return (
    <div className="min-h-screen bg-black">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        role={user.role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="min-h-screen lg:ml-72">
        <Header user={user} onMenuClick={() => setSidebarOpen(true)} />
        <section className="p-4 sm:p-6 lg:p-8">{children}</section>
      </main>

      {/* Idle warning */}
      {showWarning && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 px-4">
          <div className="flex items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 shadow-lg">
            <p className="text-sm font-medium text-amber-800">
              Tu sesión cerrará en 1 minuto por inactividad.
            </p>
            <button
              onClick={resetTimers}
              className="shrink-0 rounded-xl bg-amber-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-amber-700"
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
