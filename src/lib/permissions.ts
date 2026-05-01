import type { Role } from "@/generated/prisma/client";

export function canAccessDashboard(role: Role) {
  return role === "CLIENT_ADMIN" || role === "CLIENT_USER";
}

export function canManageUsers(role: Role) {
  return role === "CLIENT_ADMIN";
}

export function canUploadData(role: Role) {
  return role === "CLIENT_ADMIN";
}

export function canViewData(role: Role) {
  return role === "CLIENT_ADMIN" || role === "CLIENT_USER";
}
