import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { canUploadData } from "@/lib/permissions";
import type { Role } from "@/generated/prisma/client";
import { UploadForm } from "@/components/dashboard/carga-datos/UploadForm";
import { FileSpreadsheet } from "lucide-react";

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
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#238D80]">
          Carga de datos
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-[#F1BE48]">
          Importar archivo Excel
        </h1>
        <p className="mt-2 text-[#9A9A9A]">
          Sube el archivo de indicadores. Se procesarán automáticamente las hojas Budget, Forecast, Histórico y Comisiones.
        </p>
      </div>

      <div className="rounded-3xl border border-[#222222] bg-[#111111] p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-[#238D80]/10 p-3 text-[#205C40]">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#F1BE48]">Nuevo archivo</h2>
            <p className="text-sm text-[#555555]">
              Los datos existentes del año seleccionado serán reemplazados.
            </p>
          </div>
        </div>

        <UploadForm />

        <div className="mt-6 rounded-2xl border border-[#222222] bg-[#1A1A1A] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#555555]">
            Hojas esperadas en el Excel
          </p>
          <div className="grid gap-3 text-xs text-[#9A9A9A] sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="font-medium text-[#9A9A9A]">Budget</p>
              <p>Detalle por empleado con costo total</p>
            </div>
            <div>
              <p className="font-medium text-[#9A9A9A]">Forecast</p>
              <p>Proyección por empleado con costo total</p>
            </div>
            <div>
              <p className="font-medium text-[#9A9A9A]">Histórico</p>
              <p>HC, forecast, real, budget, altas, bajas por población</p>
            </div>
            <div>
              <p className="font-medium text-[#9A9A9A]">Comisiones</p>
              <p>HC proyectado, presupuestado, real HC y costo</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-[#222222] bg-[#111111] p-6">
        <h2 className="mb-4 text-base font-semibold text-[#F1BE48]">
          Historial de cargas
        </h2>

        {history.length === 0 ? (
          <p className="text-sm text-[#555555]">Aún no hay cargas registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#222222]">
                  <th className="pb-3 text-left font-medium text-[#9A9A9A]">Fecha</th>
                  <th className="pb-3 text-left font-medium text-[#9A9A9A]">Año</th>
                  <th className="pb-3 text-left font-medium text-[#9A9A9A]">Archivo</th>
                  <th className="pb-3 text-right font-medium text-[#9A9A9A]">Hojas</th>
                  <th className="pb-3 text-left font-medium text-[#9A9A9A]">Usuario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-white/5">
                    <td className="py-3 text-[#9A9A9A]">
                      {h.createdAt.toLocaleDateString("es-MX", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 font-medium text-[#F1BE48]">{h.anio}</td>
                    <td className="max-w-[200px] truncate py-3 text-[#9A9A9A]">
                      {h.fileName}
                    </td>
                    <td className="py-3 text-right font-medium text-[#F1BE48]">
                      {h.sheets}
                    </td>
                    <td className="py-3 text-[#9A9A9A]">{h.user.name}</td>
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
