import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { canUploadData } from "@/lib/permissions";
import type { Role } from "@/generated/prisma/client";
import { UploadForm } from "@/components/dashboard/carga-datos/UploadForm";
import { FileSpreadsheet } from "lucide-react";

const MESES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

const MODULE_LABEL: Record<string, string> = {
  FORECAST: "Forecast",
  HC: "Headcount",
  COMERCIAL: "Comercial",
};

export default async function CargaDatosPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (!canUploadData(session.user.role as Role)) redirect("/dashboard");

  const history = await prisma.dataUpload.findMany({
    where: { clientId: session.user.clientId },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { user: { select: { name: true } } },
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#A9945D]">
          Carga de datos
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-neutral-950">
          Importar archivo Excel
        </h1>
        <p className="mt-2 text-neutral-500">
          Sube un archivo .xlsx para actualizar los indicadores de cualquier módulo y período.
        </p>
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-[#A9945D]/10 p-3 text-[#7A673A]">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-neutral-950">Nuevo archivo</h2>
            <p className="text-sm text-neutral-400">
              Los datos existentes del período seleccionado serán reemplazados.
            </p>
          </div>
        </div>

        <UploadForm />

        <div className="mt-6 rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Formato esperado por módulo
          </p>
          <div className="grid gap-3 text-xs text-neutral-500 sm:grid-cols-3">
            <div>
              <p className="font-medium text-neutral-700">Forecast</p>
              <p>Dirección, Área, Real, Presupuesto</p>
            </div>
            <div>
              <p className="font-medium text-neutral-700">Headcount (1 fila)</p>
              <p>Total, Altas, Bajas, Días Laborados, Masculino, Femenino</p>
            </div>
            <div>
              <p className="font-medium text-neutral-700">Comercial</p>
              <p>Cadena, KAM, Tienda, Real, Presupuesto</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-neutral-950">
          Historial de cargas
        </h2>

        {history.length === 0 ? (
          <p className="text-sm text-neutral-400">Aún no hay cargas registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="pb-3 text-left font-medium text-neutral-500">Fecha</th>
                  <th className="pb-3 text-left font-medium text-neutral-500">Módulo</th>
                  <th className="pb-3 text-left font-medium text-neutral-500">Período</th>
                  <th className="pb-3 text-left font-medium text-neutral-500">Archivo</th>
                  <th className="pb-3 text-right font-medium text-neutral-500">Registros</th>
                  <th className="pb-3 text-left font-medium text-neutral-500">Usuario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-neutral-50/50">
                    <td className="py-3 text-neutral-500">
                      {h.createdAt.toLocaleDateString("es-MX", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3">
                      <span className="rounded-full bg-[#A9945D]/10 px-3 py-1 text-xs font-medium text-[#7A673A]">
                        {MODULE_LABEL[h.module] ?? h.module}
                      </span>
                    </td>
                    <td className="py-3 text-neutral-700">
                      {MESES[h.mes - 1]} {h.anio}
                    </td>
                    <td className="max-w-[200px] truncate py-3 text-neutral-500">
                      {h.fileName}
                    </td>
                    <td className="py-3 text-right font-medium text-neutral-950">
                      {h.rows.toLocaleString("es-MX")}
                    </td>
                    <td className="py-3 text-neutral-500">{h.user.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
