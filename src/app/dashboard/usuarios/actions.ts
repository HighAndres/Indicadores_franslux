"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageUsers } from "@/lib/permissions";
import type { Role } from "@/generated/prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

export type ActionState = { success: boolean; message: string } | null;

const createSchema = z.object({
  name: z.string().min(2, "El nombre es muy corto"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  role: z.enum(["CLIENT_ADMIN", "CLIENT_USER"]),
});

const updateSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(2, "El nombre es muy corto"),
  email: z.string().email("Email inválido"),
  role: z.enum(["CLIENT_ADMIN", "CLIENT_USER"]),
  isActive: z.string().optional(),
});

const passwordSchema = z.object({
  userId: z.string().min(1),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

async function requireAdmin() {
  const session = await auth();
  if (!session || !canManageUsers(session.user.role as Role)) return null;
  return session;
}

export async function createUser(formData: FormData): Promise<ActionState> {
  const session = await requireAdmin();
  if (!session) return { success: false, message: "No autorizado." };

  const parsed = createSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const { name, email, password, role } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { success: false, message: "Ya existe un usuario con ese email." };

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      clientId: session.user.clientId,
      name,
      email,
      passwordHash,
      role: role as Role,
      isActive: true,
    },
  });

  return { success: true, message: "Usuario creado correctamente." };
}

export async function updateUser(formData: FormData): Promise<ActionState> {
  const session = await requireAdmin();
  if (!session) return { success: false, message: "No autorizado." };

  const parsed = updateSchema.safeParse({
    userId: formData.get("userId"),
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    isActive: formData.get("isActive"),
  });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const { userId, name, email, role, isActive } = parsed.data;

  const user = await prisma.user.findFirst({
    where: { id: userId, clientId: session.user.clientId },
  });
  if (!user) return { success: false, message: "Usuario no encontrado." };

  const duplicate = await prisma.user.findFirst({
    where: { email, NOT: { id: userId } },
  });
  if (duplicate) return { success: false, message: "Ese email ya está en uso por otro usuario." };

  await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      email,
      role: role as Role,
      isActive: isActive === "on",
    },
  });

  return { success: true, message: "Usuario actualizado." };
}

export async function changePassword(formData: FormData): Promise<ActionState> {
  const session = await requireAdmin();
  if (!session) return { success: false, message: "No autorizado." };

  const parsed = passwordSchema.safeParse({
    userId: formData.get("userId"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const { userId, password } = parsed.data;

  const user = await prisma.user.findFirst({
    where: { id: userId, clientId: session.user.clientId },
  });
  if (!user) return { success: false, message: "Usuario no encontrado." };

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  return { success: true, message: "Contraseña actualizada." };
}

export async function toggleUserStatus(userId: string): Promise<ActionState> {
  const session = await requireAdmin();
  if (!session) return { success: false, message: "No autorizado." };

  if (userId === session.user.id) {
    return { success: false, message: "No puedes desactivar tu propia cuenta." };
  }

  const user = await prisma.user.findFirst({
    where: { id: userId, clientId: session.user.clientId },
  });
  if (!user) return { success: false, message: "Usuario no encontrado." };

  await prisma.user.update({ where: { id: userId }, data: { isActive: !user.isActive } });

  return {
    success: true,
    message: user.isActive ? "Usuario desactivado." : "Usuario activado.",
  };
}
