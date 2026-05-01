"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { brandConfig } from "@/lib/brand";
import { Eye, EyeOff, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Credenciales incorrectas. Verifica tu email y contraseña.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F7F5] px-4">
      <div className="w-full max-w-sm">

        <div className="mb-8 text-center">
          <div className="mb-5 flex justify-center">
            <img
              src={brandConfig.logo}
              alt={brandConfig.clientName}
              className={[
                "h-20 w-auto transition-all duration-700",
                isPending ? "animate-spin" : "",
              ].join(" ")}
            />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-400">
            {brandConfig.clientName}
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-950">
            {brandConfig.appName}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {brandConfig.tagline}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm"
        >
          <div className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-neutral-700"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-950 outline-none transition focus:border-[#A9945D] focus:bg-white focus:ring-2 focus:ring-[#A9945D]/20"
                placeholder="usuario@empresa.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-neutral-700"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 pr-11 text-sm text-neutral-950 outline-none transition focus:border-[#A9945D] focus:bg-white focus:ring-2 focus:ring-[#A9945D]/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#A9945D] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#7A673A] disabled:opacity-60"
            >
              <LogIn className="h-4 w-4" />
              {isPending ? "Verificando..." : "Ingresar"}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-neutral-400">
          Desarrollado por{" "}
          <span className="font-semibold text-neutral-600">Mirmibug</span>
        </p>
      </div>
    </div>
  );
}
