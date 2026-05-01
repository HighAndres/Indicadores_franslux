"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Edit2, Key, UserX, UserCheck, X, Eye, EyeOff,
} from "lucide-react";
import {
  createUser, updateUser, changePassword, toggleUserStatus,
} from "@/app/dashboard/usuarios/actions";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

interface UsersClientProps {
  users: UserRow[];
  currentUserId: string;
}

type ModalMode = "create" | "edit" | "password" | null;

const ROLE_LABEL: Record<string, string> = {
  CLIENT_ADMIN: "Administrador",
  CLIENT_USER: "Visualizador",
};

export function UsersClient({ users, currentUserId }: UsersClientProps) {
  const router = useRouter();
  const [mode, setMode] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<UserRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [createPending, startCreate] = useTransition();
  const [updatePending, startUpdate] = useTransition();
  const [passwordPending, startPassword] = useTransition();
  const [togglePending, startToggle] = useTransition();

  function open(m: ModalMode, user?: UserRow) {
    setError(null);
    setSelected(user ?? null);
    setMode(m);
  }

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startCreate(async () => {
      const result = await createUser(fd);
      if (result?.success) { setMode(null); router.refresh(); }
      else setError(result?.message ?? "Error.");
    });
  }

  function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startUpdate(async () => {
      const result = await updateUser(fd);
      if (result?.success) { setMode(null); router.refresh(); }
      else setError(result?.message ?? "Error.");
    });
  }

  function handlePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startPassword(async () => {
      const result = await changePassword(fd);
      if (result?.success) { setMode(null); router.refresh(); }
      else setError(result?.message ?? "Error.");
    });
  }

  function handleToggle(user: UserRow) {
    startToggle(async () => {
      await toggleUserStatus(user.id);
      router.refresh();
    });
  }

  return (
    <>
      <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5">
          <h2 className="text-base font-semibold text-neutral-950">
            Usuarios ({users.length})
          </h2>
          <button
            onClick={() => open("create")}
            className="flex items-center gap-2 rounded-xl bg-[#A9945D] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#7A673A]"
          >
            <Plus className="h-4 w-4" />
            Nuevo usuario
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="px-6 pb-3 pt-4 text-left font-medium text-neutral-500">Nombre</th>
                <th className="pb-3 pt-4 text-left font-medium text-neutral-500">Email</th>
                <th className="pb-3 pt-4 text-left font-medium text-neutral-500">Rol</th>
                <th className="pb-3 pt-4 text-left font-medium text-neutral-500">Estado</th>
                <th className="pr-6 pb-3 pt-4 text-right font-medium text-neutral-500">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50/50">
                  <td className="px-6 py-4 font-medium text-neutral-950">
                    {user.name}
                    {user.id === currentUserId && (
                      <span className="ml-2 text-xs font-normal text-neutral-400">(tú)</span>
                    )}
                  </td>
                  <td className="py-4 text-neutral-500">{user.email}</td>
                  <td className="py-4">
                    <span
                      className={[
                        "rounded-full px-3 py-1 text-xs font-medium",
                        user.role === "CLIENT_ADMIN"
                          ? "bg-[#A9945D]/10 text-[#7A673A]"
                          : "bg-neutral-100 text-neutral-600",
                      ].join(" ")}
                    >
                      {ROLE_LABEL[user.role] ?? user.role}
                    </span>
                  </td>
                  <td className="py-4">
                    <span
                      className={[
                        "rounded-full px-3 py-1 text-xs font-medium",
                        user.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-600",
                      ].join(" ")}
                    >
                      {user.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="pr-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <IconBtn
                        icon={<Edit2 className="h-4 w-4" />}
                        title="Editar"
                        onClick={() => open("edit", user)}
                      />
                      <IconBtn
                        icon={<Key className="h-4 w-4" />}
                        title="Cambiar contraseña"
                        onClick={() => open("password", user)}
                      />
                      {user.id !== currentUserId && (
                        <IconBtn
                          icon={
                            user.isActive
                              ? <UserX className="h-4 w-4" />
                              : <UserCheck className="h-4 w-4" />
                          }
                          title={user.isActive ? "Desactivar" : "Activar"}
                          onClick={() => handleToggle(user)}
                          disabled={togglePending}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create modal */}
      {mode === "create" && (
        <Modal title="Nuevo usuario" onClose={() => setMode(null)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <Field label="Nombre" name="name" placeholder="Nombre completo" required />
            <Field label="Email" name="email" type="email" placeholder="correo@empresa.com" required />
            <PasswordField label="Contraseña" name="password" />
            <RoleField />
            {error && <ErrMsg text={error} />}
            <SubmitBtn pending={createPending} label="Crear usuario" />
          </form>
        </Modal>
      )}

      {/* Edit modal */}
      {mode === "edit" && selected && (
        <Modal title="Editar usuario" onClose={() => setMode(null)}>
          <form onSubmit={handleUpdate} className="space-y-4">
            <input type="hidden" name="userId" value={selected.id} />
            <Field label="Nombre" name="name" defaultValue={selected.name} required />
            <Field label="Email" name="email" type="email" defaultValue={selected.email} required />
            <RoleField defaultValue={selected.role} />
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                value="on"
                defaultChecked={selected.isActive}
                className="h-4 w-4 rounded accent-[#A9945D]"
              />
              <span className="text-sm font-medium text-neutral-700">Usuario activo</span>
            </label>
            {error && <ErrMsg text={error} />}
            <SubmitBtn pending={updatePending} label="Guardar cambios" />
          </form>
        </Modal>
      )}

      {/* Password modal */}
      {mode === "password" && selected && (
        <Modal title={`Cambiar contraseña — ${selected.name}`} onClose={() => setMode(null)}>
          <form onSubmit={handlePassword} className="space-y-4">
            <input type="hidden" name="userId" value={selected.id} />
            <PasswordField label="Nueva contraseña" name="password" />
            {error && <ErrMsg text={error} />}
            <SubmitBtn pending={passwordPending} label="Actualizar contraseña" />
          </form>
        </Modal>
      )}
    </>
  );
}

/* ── small reusable pieces ── */

function Modal({
  title, onClose, children,
}: {
  title: string; onClose: () => void; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-950">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function IconBtn({
  icon, title, onClick, disabled,
}: {
  icon: React.ReactNode; title: string; onClick: () => void; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-40"
    >
      {icon}
    </button>
  );
}

function Field({
  label, name, type = "text", placeholder, defaultValue, required,
}: {
  label: string; name: string; type?: string;
  placeholder?: string; defaultValue?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-neutral-700">{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-950 outline-none focus:border-[#A9945D] focus:bg-white focus:ring-2 focus:ring-[#A9945D]/20"
      />
    </div>
  );
}

function PasswordField({ label, name }: { label: string; name: string }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-neutral-700">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          name={name}
          required
          minLength={8}
          placeholder="Mínimo 8 caracteres"
          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 pr-11 text-sm text-neutral-950 outline-none focus:border-[#A9945D] focus:bg-white focus:ring-2 focus:ring-[#A9945D]/20"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function RoleField({ defaultValue }: { defaultValue?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-neutral-700">Rol</label>
      <select
        name="role"
        defaultValue={defaultValue ?? "CLIENT_USER"}
        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-950 outline-none focus:border-[#A9945D] focus:bg-white focus:ring-2 focus:ring-[#A9945D]/20"
      >
        <option value="CLIENT_USER">Visualizador</option>
        <option value="CLIENT_ADMIN">Administrador</option>
      </select>
    </div>
  );
}

function ErrMsg({ text }: { text: string }) {
  return (
    <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{text}</p>
  );
}

function SubmitBtn({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-[#A9945D] py-2.5 text-sm font-semibold text-white transition hover:bg-[#7A673A] disabled:opacity-60"
    >
      {pending ? "Procesando…" : label}
    </button>
  );
}
