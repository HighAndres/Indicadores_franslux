import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { canManageUsers } from "@/lib/permissions";
import type { Role } from "@/generated/prisma/client";
import { UsersClient } from "@/components/dashboard/usuarios/UsersClient";

export default async function UsuariosPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (!canManageUsers(session.user.role as Role)) redirect("/dashboard");

  const users = await prisma.user.findMany({
    where: { clientId: session.user.clientId },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#238D80]">
          Administración
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-[#F1BE48]">
          Gestión de usuarios
        </h1>
        <p className="mt-2 text-[#9A9A9A]">
          Crea, edita y gestiona los accesos al sistema.
        </p>
      </div>

      <UsersClient users={users} currentUserId={session.user.id} />
    </div>
  );
}
