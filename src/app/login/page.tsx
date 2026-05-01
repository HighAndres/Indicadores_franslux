"use client";

import { Suspense, useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { brandConfig } from "@/lib/brand";
import { Eye, EyeOff, LogIn } from "lucide-react";

function LoginForm() {
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
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm">

        <div className="mb-8 text-center">
          <div className="mb-5 flex justify-center">
            <img
              src={brandConfig.logoDark}
              alt={brandConfig.clientName}
              className={[
                "h-20 w-auto transition-all duration-700",
                isPending ? "animate-spin" : "",
              ].join(" ")}
            />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#9A9A9A]">
            {brandConfig.clientName}
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-[#F1BE48]">
            {brandConfig.appName}
          </h1>
          <p className="mt-1 text-sm text-[#9A9A9A]">
            {brandConfig.tagline}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-[#222222] bg-[#111111] p-8"
        >
          <div className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-[#9A9A9A]"
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
                className="w-full rounded-xl border border-[#333333] bg-[#1A1A1A] px-4 py-2.5 text-sm text-[#F1BE48] outline-none transition placeholder:text-[#555555] focus:border-[#F1BE48] focus:ring-2 focus:ring-[#F1BE48]/20"
                placeholder="usuario@empresa.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-[#9A9A9A]"
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
                  className="w-full rounded-xl border border-[#333333] bg-[#1A1A1A] px-4 py-2.5 pr-11 text-sm text-[#F1BE48] outline-none transition placeholder:text-[#555555] focus:border-[#F1BE48] focus:ring-2 focus:ring-[#F1BE48]/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A9A] hover:text-[#F1BE48]"
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
              <p className="rounded-xl bg-red-950 px-4 py-2.5 text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#F1BE48] px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-[#D4A520] disabled:opacity-60"
            >
              <LogIn className="h-4 w-4" />
              {isPending ? "Verificando..." : "Ingresar"}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-[#555555]">
          Desarrollado por{" "}
          <span className="font-semibold text-[#9A9A9A]">Mirmibug</span>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
