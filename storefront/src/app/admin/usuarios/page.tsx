"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  getAdminUsersApi,
  createAdminUserApi,
  updateAdminUserApi,
  toggleAdminUserStatusApi,
  resendAdminUserInvitationApi,
} from "@/lib/api-client";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  roleId: "super_admin" | "editor_cms" | "moderador" | "tesorero";
  roleName: string;
  roleBadgeColor: string;
  roleIcon: string;
  status: "active" | "inactive";
  lastLogin: string;
  permissions: string[];
  avatarBg: string;
}

export default function AdminUsuariosPage() {
  const { admin, isLoaded } = useAuth();

  // Detección de Super Admin
  const currentRole = (admin?.role as string) || "";
  const currentEmail = (admin?.email || "").toLowerCase().trim();

  const isSuperAdmin =
    currentRole === "admin" ||
    currentRole === "super_admin" ||
    currentEmail === "admin@pianocolombia.com" ||
    currentEmail === "carlos.admin@pianocolombia.com";

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [resendingUserId, setResendingUserId] = useState<string | null>(null);

  const [notification, setNotification] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<AdminUser | null>(null);

  // Creation Form State
  const [createFormData, setCreateFormData] = useState({
    name: "",
    email: "",
    role: "editor_cms",
    permissions: ["cms.read", "cms.write"],
  });

  // Edit Form State
  const [editFormData, setEditFormData] = useState({
    id: "",
    name: "",
    email: "",
    role: "editor_cms",
    status: "active",
    permissions: [] as string[],
  });

  // Cargar lista real de usuarios desde PostgreSQL backend
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await getAdminUsersApi({ role: admin?.role, email: admin?.email });
      if (data && Array.isArray(data)) {
        setUsers(data);
      }
    } catch (err: any) {
      console.error("Error al cargar usuarios de la BD:", err);
      setNotification({
        type: "error",
        message: err.message || "Error al conectar con la base de datos de usuarios.",
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || u.roleId === roleFilter;
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Re-enviar correo de invitación
  const handleResendInvitation = async (userId: string, userEmail: string, userName: string) => {
    if (!isSuperAdmin) {
      setNotification({
        type: "warning",
        message: "🔒 Acceso Denegado: Únicamente el usuario Super Admin tiene permisos para reenviar invitaciones.",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setResendingUserId(userId);
      setNotification({
        type: "warning",
        message: `⏳ Enviando correo de invitación a ${userEmail}...`,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });

      const res = await resendAdminUserInvitationApi({
        userId,
        requesting_user_role: admin?.role,
        requesting_user_email: admin?.email,
      });

      setNotification({
        type: "success",
        message: res.message || `¡Invitación reenviada con éxito a ${userEmail}! (Recuerda revisar Spam / Correo no deseado)`,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      fetchUsers();
    } catch (err: any) {
      console.error("Error al reenviar invitación:", err);
      setNotification({
        type: "error",
        message: err.message || "Error al reenviar la invitación por correo electrónico.",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setResendingUserId(null);
    }
  };

  // Alternar Estado Activo / Inactivo
  const handleToggleStatus = async (id: string) => {
    if (!isSuperAdmin) {
      setNotification({
        type: "warning",
        message: "🔒 Acceso Denegado: Únicamente el usuario Super Admin tiene permisos para activar o inactivar cuentas.",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setIsSaving(true);
      const res = await toggleAdminUserStatusApi({
        id,
        requesting_user_role: admin?.role,
        requesting_user_email: admin?.email,
      });

      if (res.user) {
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, status: res.user.status } : u))
        );
        setNotification({
          type: "success",
          message: res.message || "Estado de usuario actualizado correctamente.",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err: any) {
      console.error("Error al alternar estado:", err);
      setNotification({
        type: "error",
        message: err.message || "Error al cambiar el estado del usuario.",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSaving(false);
    }
  };

  // Crear Nuevo Usuario
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      setNotification({
        type: "warning",
        message: "🔒 Acceso Denegado: Únicamente el usuario Super Admin tiene permisos para crear nuevos usuarios.",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!createFormData.name || !createFormData.email) return;

    try {
      setIsSaving(true);
      setNotification(null);

      const res = await createAdminUserApi({
        name: createFormData.name.trim(),
        email: createFormData.email.trim(),
        role: createFormData.role,
        permissions: createFormData.permissions,
        requesting_user_role: admin?.role,
        requesting_user_email: admin?.email,
      });

      if (res.user) {
        setUsers((prev) => [res.user, ...prev.filter((u) => u.id !== res.user.id)]);
        setIsCreateModalOpen(false);
        const createdEmail = createFormData.email.trim();
        setCreateFormData({
          name: "",
          email: "",
          role: "editor_cms",
          permissions: ["cms.read", "cms.write"],
        });
        setNotification({
          type: "success",
          message: res.message || `¡Usuario ${res.user.name} creado exitosamente! Se ha enviado la invitación por correo electrónico a ${createdEmail}.`,
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err: any) {
      console.error("Error al crear usuario:", err);
      setNotification({
        type: "error",
        message: err.message || "Error al crear el nuevo usuario administrativo.",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSaving(false);
    }
  };

  // Guardar Cambios en Edición de Usuario
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      setNotification({
        type: "warning",
        message: "🔒 Acceso Denegado: Únicamente el usuario Super Admin tiene permisos para editar información de usuarios.",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!editFormData.id || !editFormData.name || !editFormData.email) return;

    try {
      setIsSaving(true);
      setNotification(null);

      const res = await updateAdminUserApi({
        id: editFormData.id,
        name: editFormData.name.trim(),
        email: editFormData.email.trim(),
        role: editFormData.role,
        status: editFormData.status,
        permissions: editFormData.permissions,
        requesting_user_role: admin?.role,
        requesting_user_email: admin?.email,
      });

      if (res.user) {
        setUsers((prev) =>
          prev.map((u) => (u.id === res.user.id ? res.user : u))
        );
        setSelectedUserForEdit(null);
        setNotification({
          type: "success",
          message: res.message || "¡Datos y permisos actualizados correctamente!",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err: any) {
      console.error("Error al actualizar usuario:", err);
      setNotification({
        type: "error",
        message: err.message || "Error al guardar los cambios del usuario.",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoaded && !isSuperAdmin) {
    return (
      <div className="max-w-xl mx-auto my-8 bg-white rounded-3xl border border-red-200 p-8 sm:p-10 shadow-lg text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-600 via-[#FBB03B] to-red-600"></div>
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200 shadow-xs">
          <span className="material-symbols-outlined text-3xl">manage_accounts</span>
        </div>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-[11px] font-extrabold uppercase tracking-wider font-montserrat border border-red-200">
            Módulo Exclusivo Super Admin
          </div>
          <h1 className="text-2xl font-black font-montserrat text-[#111C2D] tracking-tight">
            Acceso Denegado
          </h1>
          <p className="text-xs sm:text-sm text-[#4C4546] leading-relaxed font-normal max-w-md mx-auto">
            Únicamente el usuario Super Admin tiene permisos para visualizar o gestionar las cuentas de usuario de la consola.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#111C2D] hover:bg-[#1a2b45] text-white rounded-xl text-xs font-bold font-montserrat transition shadow-md"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Volver al Dashboard Global
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-inter text-[#111C2D]">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-black/5 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#0071BC] font-montserrat font-bold mb-1">
            <span className="material-symbols-outlined text-sm">manage_accounts</span>
            <span>SEGURIDAD & ROLES GRANULARES RBAC</span>
          </div>
          <h1 className="text-2xl font-black text-[#111C2D] font-montserrat tracking-tight">
            Gestión de Usuarios Administrativos
          </h1>
          <p className="text-xs text-[#4C4546] mt-1 max-w-2xl">
            Control de acceso basado en roles (RBAC) para el personal interno de Piano Colombia: Super Admins, Editores CMS, Moderadores de contenido y Tesorería.
          </p>
        </div>

        <button
          onClick={() => {
            if (!isSuperAdmin) {
              setNotification({
                type: "warning",
                message: "🔒 Acceso Denegado: Únicamente el usuario Super Admin tiene permisos para crear nuevos usuarios.",
              });
              return;
            }
            setIsCreateModalOpen(true);
          }}
          disabled={!isSuperAdmin}
          title={!isSuperAdmin ? "Acceso Restringido • Requiere perfil Super Admin" : "Crear nuevo usuario"}
          className={`inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-montserrat font-extrabold rounded-xl shadow-md transition-all shrink-0 active:scale-95 ${
            isSuperAdmin
              ? "bg-[#0071BC] hover:bg-[#005996] text-white"
              : "bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300"
          }`}
        >
          <span className="material-symbols-outlined text-base">{isSuperAdmin ? "person_add" : "lock"}</span>
          <span>+ Crear Nuevo Usuario</span>
        </button>
      </div>

      {/* Alerta de Restricción RBAC para Usuarios que NO son Super Admin */}
      {!isSuperAdmin && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-2xl text-amber-600 shrink-0">lock</span>
            <div className="text-xs">
              <span className="font-extrabold font-montserrat uppercase tracking-wider block text-amber-950">
                🔒 Acceso de Solo Lectura (RBAC)
              </span>
              <span className="text-amber-900 font-medium leading-relaxed block">
                Sesión activa como <strong>{admin?.name || "Usuario Interno"}</strong> ({admin?.email}). Las funciones de <strong>Creación, Edición y Activación/Inactivación de usuarios</strong> están reservadas exclusivamente para el perfil <strong>Super Admin</strong>.
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase font-montserrat shrink-0">
            Modo Consulta
          </span>
        </div>
      )}

      {/* Notificación de Estado */}
      {notification && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold font-montserrat shadow-xs animate-in fade-in duration-200 ${
            notification.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : notification.type === "warning"
              ? "bg-amber-50 border border-amber-300 text-amber-900"
              : "bg-rose-50 border border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-lg shrink-0">
              {notification.type === "success" ? "check_circle" : notification.type === "warning" ? "warning" : "error"}
            </span>
            <span className="leading-relaxed">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-current opacity-70 hover:opacity-100 text-base"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      {/* Role Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Super Admin */}
        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-xs hover:border-[#C1272D]/30 transition">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#C1272D] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">shield_person</span>
            </div>
            <span className="text-xs font-montserrat font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
              {users.filter((u) => u.roleId === "super_admin" && u.status === "active").length} activo(s)
            </span>
          </div>
          <h3 className="font-montserrat font-extrabold text-sm text-[#111C2D]">Super Admin</h3>
          <p className="text-[11px] text-[#4C4546] mt-1 leading-snug">
            Acceso total irrestricto a la consola, API de pagos, creación y desactivación de usuarios.
          </p>
        </div>

        {/* Card 2: Editor CMS */}
        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-xs hover:border-[#0071BC]/30 transition">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0071BC] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">edit_note</span>
            </div>
            <span className="text-xs font-montserrat font-black text-[#0071BC] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              {users.filter((u) => u.roleId === "editor_cms" && u.status === "active").length} activo(s)
            </span>
          </div>
          <h3 className="font-montserrat font-extrabold text-sm text-[#111C2D]">Editor de Contenido</h3>
          <p className="text-[11px] text-[#4C4546] mt-1 leading-snug">
            Administración del CMS principal, imágenes Hero, banners promocionales y avisos institucionales.
          </p>
        </div>

        {/* Card 3: Moderador */}
        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-xs hover:border-[#FBB03B]/30 transition">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#FBB03B] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">verified</span>
            </div>
            <span className="text-xs font-montserrat font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
              {users.filter((u) => u.roleId === "moderador" && u.status === "active").length} activo(s)
            </span>
          </div>
          <h3 className="font-montserrat font-extrabold text-sm text-[#111C2D]">Moderador de Partituras</h3>
          <p className="text-[11px] text-[#4C4546] mt-1 leading-snug">
            Revisión técnica de PDFs subidos por compositores, validación DRM e ID de compositor.
          </p>
        </div>

        {/* Card 4: Tesorero */}
        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-xs hover:border-emerald-300 transition">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">payments</span>
            </div>
            <span className="text-xs font-montserrat font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              {users.filter((u) => u.roleId === "tesorero" && u.status === "active").length} activo(s)
            </span>
          </div>
          <h3 className="font-montserrat font-extrabold text-sm text-[#111C2D]">Tesorero / Pagos</h3>
          <p className="text-[11px] text-[#4C4546] mt-1 leading-snug">
            Ejecución de dispersiones de regalías vía Wompi Payouts API y certificados de retención DIAN.
          </p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#4C4546] text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#F0F3FF] border-none rounded-xl pl-9 pr-4 py-2 text-xs text-[#111C2D] placeholder-[#4C4546]/70 focus:ring-2 focus:ring-[#0071BC] outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#4C4546] font-semibold">Rol:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-[#F0F3FF] border-none rounded-xl px-3 py-2 text-xs font-semibold text-[#111C2D] focus:ring-2 focus:ring-[#0071BC] outline-none"
            >
              <option value="all">Todos los roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="editor_cms">Editor de Contenido</option>
              <option value="moderador">Moderador de Partituras</option>
              <option value="tesorero">Tesorero / Pagos</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#4C4546] font-semibold">Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#F0F3FF] border-none rounded-xl px-3 py-2 text-xs font-semibold text-[#111C2D] focus:ring-2 focus:ring-[#0071BC] outline-none"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-xs overflow-hidden">
        {loadingUsers ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-[#0071BC] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-bold text-[#4C4546] uppercase tracking-wider font-montserrat">
              Cargando usuarios desde PostgreSQL...
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto overscroll-x-contain">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F0F3FF]/70 border-b border-black/5 text-[11px] font-montserrat font-extrabold text-[#4C4546] uppercase tracking-wider">
                  <th className="py-3.5 px-6">Usuario Admin</th>
                  <th className="py-3.5 px-4">Rol Asignado</th>
                  <th className="py-3.5 px-4">Permisos Clave</th>
                  <th className="py-3.5 px-4">Última Actividad</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-6 text-right">Acciones (RBAC)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 text-xs text-[#111C2D]">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#4C4546]">
                      <span className="material-symbols-outlined text-4xl block mb-2 opacity-50">group_off</span>
                      <p className="font-montserrat font-bold">No se encontraron usuarios con los filtros seleccionados.</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-[#F9F9FF] transition-colors">
                      {/* User Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full ${user.avatarBg || "bg-[#0071BC]"} text-white flex items-center justify-center font-montserrat font-black text-xs shrink-0 shadow-2xs`}
                          >
                            {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                          </div>
                          <div>
                            <span className="font-montserrat font-extrabold text-[#111C2D] block">
                              {user.name}
                            </span>
                            <span className="text-[11px] text-[#4C4546] font-mono">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-montserrat font-bold border ${user.roleBadgeColor || "bg-blue-100 text-blue-700 border-blue-200"}`}
                        >
                          <span className="material-symbols-outlined text-sm">{user.roleIcon || "badge"}</span>
                          <span>{user.roleName || user.roleId}</span>
                        </span>
                      </td>

                      {/* Permissions */}
                      <td className="py-4 px-4 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {(user.permissions || []).slice(0, 2).map((perm, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-[#F0F3FF] text-[#111C2D] rounded text-[10px] font-semibold"
                            >
                              {perm}
                            </span>
                          ))}
                          {(user.permissions || []).length > 2 && (
                            <span className="px-1.5 py-0.5 bg-slate-100 text-[#4C4546] rounded text-[10px] font-bold">
                              +{(user.permissions || []).length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Last Login */}
                      <td className="py-4 px-4 text-[#4C4546] text-[11px]">
                        {user.lastLogin}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {user.status === "active" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-montserrat font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Activo</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-montserrat font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            <span>Inactivo</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleResendInvitation(user.id, user.email, user.name)}
                            disabled={!isSuperAdmin || resendingUserId === user.id}
                            title={
                              !isSuperAdmin
                                ? "Acceso Restringido • Requiere perfil Super Admin"
                                : `Re-enviar correo de invitación a ${user.email}`
                            }
                            className={`p-1.5 rounded-lg transition flex items-center justify-center ${
                              !isSuperAdmin
                                ? "text-slate-300 cursor-not-allowed opacity-50"
                                : "text-[#0071BC] hover:text-[#005996] hover:bg-blue-50"
                            }`}
                          >
                            <span className={`material-symbols-outlined text-lg ${resendingUserId === user.id ? "animate-spin" : ""}`}>
                              {!isSuperAdmin ? "lock" : resendingUserId === user.id ? "sync" : "forward_to_inbox"}
                            </span>
                          </button>

                          <button
                            onClick={() => {
                              if (!isSuperAdmin) {
                                setNotification({
                                  type: "warning",
                                  message: "🔒 Acceso Denegado: Solo el perfil Super Admin puede editar información y permisos de usuarios.",
                                });
                                window.scrollTo({ top: 0, behavior: "smooth" });
                                return;
                              }
                              setSelectedUserForEdit(user);
                              setEditFormData({
                                id: user.id,
                                name: user.name,
                                email: user.email,
                                role: user.roleId,
                                status: user.status,
                                permissions: user.permissions || [],
                              });
                            }}
                            disabled={!isSuperAdmin}
                            title={isSuperAdmin ? "Editar usuario y asignación de rol" : "Acceso Restringido • Requiere perfil Super Admin"}
                            className={`p-1.5 rounded-lg transition ${
                              isSuperAdmin
                                ? "text-[#4C4546] hover:text-[#0071BC] hover:bg-[#F0F3FF]"
                                : "text-slate-300 cursor-not-allowed opacity-50"
                            }`}
                          >
                            <span className="material-symbols-outlined text-lg">{isSuperAdmin ? "edit" : "lock"}</span>
                          </button>

                            <button
                              onClick={() => handleToggleStatus(user.id)}
                              disabled={!isSuperAdmin || isSaving}
                              title={
                                !isSuperAdmin
                                  ? "Acceso Restringido • Requiere perfil Super Admin"
                                  : user.status === "active"
                                  ? "Inactivar cuenta de usuario"
                                  : "Activar cuenta de usuario"
                              }
                            className={`p-1.5 rounded-lg transition ${
                              !isSuperAdmin
                                ? "text-slate-300 cursor-not-allowed opacity-50"
                                : user.status === "active"
                                ? "text-[#4C4546] hover:text-[#C1272D] hover:bg-red-50"
                                : "text-[#4C4546] hover:text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            <span className="material-symbols-outlined text-lg">
                              {!isSuperAdmin ? "lock" : user.status === "active" ? "block" : "check_circle"}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create User */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-black/10 space-y-6">
            <div className="flex items-center justify-between border-b border-black/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F0F3FF] text-[#0071BC] flex items-center justify-center">
                  <span className="material-symbols-outlined">person_add</span>
                </div>
                <div>
                  <h3 className="font-montserrat font-black text-lg text-[#111C2D]">
                    Crear Usuario Administrativo
                  </h3>
                  <p className="text-xs text-[#4C4546]">Asigna un correo corporativo y un rol inicial (Super Admin Only).</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#4C4546] hover:text-[#111C2D] p-1"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-montserrat font-bold text-[#111C2D] mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Ana Lucía Gómez"
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                  className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs text-[#111C2D] focus:ring-2 focus:ring-[#0071BC] outline-none"
                />
              </div>

              <div>
                <label className="block font-montserrat font-bold text-[#111C2D] mb-1">
                  Correo Electrónico Corporativo *
                </label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@pianocolombia.com"
                  value={createFormData.email}
                  onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                  className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs text-[#111C2D] focus:ring-2 focus:ring-[#0071BC] outline-none"
                />
              </div>

              <div>
                <label className="block font-montserrat font-bold text-[#111C2D] mb-1">
                  Rol Administrativo *
                </label>
                <select
                  value={createFormData.role}
                  onChange={(e) => setCreateFormData({ ...createFormData, role: e.target.value })}
                  className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs font-semibold text-[#111C2D] focus:ring-2 focus:ring-[#0071BC] outline-none"
                >
                  <option value="editor_cms">Editor de Contenido (Acceso al CMS)</option>
                  <option value="moderador">Moderador (Aprobar partituras y compositores)</option>
                  <option value="tesorero">Tesorero / Pagos (Ejecución Wompi API)</option>
                  <option value="super_admin">Super Admin (Acceso Total Irrestricto)</option>
                </select>
              </div>

              <div className="bg-[#F0F3FF]/70 p-4 rounded-xl space-y-2 border border-black/5">
                <span className="font-montserrat font-bold text-[#111C2D] block">
                  Permisos Incluidos por defecto:
                </span>
                {createFormData.role === "editor_cms" && (
                  <p className="text-[11px] text-[#4C4546] leading-relaxed">
                    ✓ Editar Banners Hero CMS<br />
                    ✓ Editar Textos Principales y Botones<br />
                    ✓ Administrar Partituras Destacadas
                  </p>
                )}
                {createFormData.role === "moderador" && (
                  <p className="text-[11px] text-[#4C4546] leading-relaxed">
                    ✓ Aprobar o Rechazar Partituras enviadas<br />
                    ✓ Aprobar Registros de Compositores<br />
                    ✓ Inspeccionar vista previa DRM
                  </p>
                )}
                {createFormData.role === "tesorero" && (
                  <p className="text-[11px] text-[#4C4546] leading-relaxed">
                    ✓ Ejecutar Dispersión Wompi Payouts API<br />
                    ✓ Generar Certificados de Retención Fiscal<br />
                    ✓ Ver Saldos Acumulados
                  </p>
                )}
                {createFormData.role === "super_admin" && (
                  <p className="text-[11px] text-[#C1272D] font-bold leading-relaxed">
                    ★ Acceso Total Irrestricto: Creación, edición e inactivación de usuarios, configuración global y API de pagos.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-montserrat font-bold text-[#4C4546] hover:bg-[#F0F3FF] rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-[#0071BC] hover:bg-[#005996] text-white text-xs font-montserrat font-extrabold rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">mail</span>
                  <span>{isSaving ? "Guardando..." : "Guardar y Enviar Invitación"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {selectedUserForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-black/10 space-y-6">
            <div className="flex items-center justify-between border-b border-black/5 pb-4">
              <div>
                <h3 className="font-montserrat font-black text-lg text-[#111C2D]">
                  Editar Usuario & Permisos RBAC
                </h3>
                <p className="text-xs text-[#4C4546] font-mono">{selectedUserForEdit.email}</p>
              </div>
              <button
                onClick={() => setSelectedUserForEdit(null)}
                className="text-[#4C4546] hover:text-[#111C2D] p-1"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-montserrat font-bold text-[#111C2D] mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs text-[#111C2D] focus:ring-2 focus:ring-[#0071BC] outline-none"
                />
              </div>

              <div>
                <label className="block font-montserrat font-bold text-[#111C2D] mb-1">
                  Correo Electrónico Corporativo *
                </label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs text-[#111C2D] focus:ring-2 focus:ring-[#0071BC] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-montserrat font-bold text-[#111C2D] mb-1">
                    Rol Administrativo *
                  </label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                    className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#111C2D] focus:ring-2 focus:ring-[#0071BC] outline-none"
                  >
                    <option value="super_admin">Super Admin (Acceso Total)</option>
                    <option value="editor_cms">Editor de Contenido</option>
                    <option value="moderador">Moderador de Partituras</option>
                    <option value="tesorero">Tesorero / Pagos</option>
                  </select>
                </div>

                <div>
                  <label className="block font-montserrat font-bold text-[#111C2D] mb-1">
                    Estado de la Cuenta *
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#111C2D] focus:ring-2 focus:ring-[#0071BC] outline-none"
                  >
                    <option value="active">Activo (Acceso Permitido)</option>
                    <option value="inactive">Inactivo (Acceso Bloqueado)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-montserrat font-bold text-[#111C2D] mb-2">
                  Permisos Específicos Granulares
                </label>
                <div className="space-y-2 bg-[#F0F3FF]/60 p-4 rounded-2xl border border-black/5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-[#0071BC]" />
                    <span className="font-semibold text-[#111C2D]">Acceso a Dashboard General & Métricas</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked={editFormData.role === "super_admin" || editFormData.role === "editor_cms"}
                      className="rounded text-[#0071BC]"
                    />
                    <span className="font-semibold text-[#111C2D]">Gestión CMS Componentes Principales</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked={editFormData.role === "super_admin" || editFormData.role === "moderador"}
                      className="rounded text-[#0071BC]"
                    />
                    <span className="font-semibold text-[#111C2D]">Aprobar o Rechazar Partituras / Compositores</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked={editFormData.role === "super_admin" || editFormData.role === "tesorero"}
                      className="rounded text-[#0071BC]"
                    />
                    <span className="font-semibold text-[#111C2D]">Ejecutar Dispersión Wompi Payouts API</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setSelectedUserForEdit(null)}
                  className="px-4 py-2.5 text-xs font-montserrat font-bold text-[#4C4546] hover:bg-[#F0F3FF] rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-[#0071BC] hover:bg-[#005996] text-white text-xs font-montserrat font-extrabold rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">save</span>
                  <span>{isSaving ? "Guardando..." : "Actualizar Datos & Permisos"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification for Immediate Visibility */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-[100] max-w-md w-full animate-in slide-in-from-bottom-5 duration-300">
          <div
            className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold font-montserrat shadow-2xl border ${
              notification.type === "success"
                ? "bg-emerald-900 text-emerald-50 border-emerald-700 shadow-emerald-900/30"
                : notification.type === "warning"
                ? "bg-amber-900 text-amber-50 border-amber-700 shadow-amber-900/30"
                : "bg-rose-900 text-rose-50 border-rose-700 shadow-rose-900/30"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-xl shrink-0">
                {notification.type === "success"
                  ? "check_circle"
                  : notification.type === "warning"
                  ? "warning"
                  : "error"}
              </span>
              <span className="leading-relaxed">{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-current opacity-70 hover:opacity-100 p-1 rounded-lg shrink-0"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


