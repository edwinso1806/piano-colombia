"use client";

import { useState } from "react";
import Link from "next/link";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<AdminUser | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "editor_cms",
    permissions: ["cms.read", "cms.write"],
  });

  const [users, setUsers] = useState<AdminUser[]>([
    {
      id: "usr-001",
      name: "Carlos Mario Restrepo",
      email: "carlos.admin@pianocolombia.com",
      roleId: "super_admin",
      roleName: "Super Admin",
      roleBadgeColor: "bg-red-100 text-red-700 border-red-200",
      roleIcon: "shield_person",
      status: "active",
      lastLogin: "Hoy, 10:45 AM (IP: 190.157.12.4)",
      permissions: ["Acceso Total", "Gestión de Usuarios", "CMS", "Aprobaciones", "Dispersión Pagos"],
      avatarBg: "bg-[#C1272D]",
    },
    {
      id: "usr-002",
      name: "Laura Sofia Benítez",
      email: "laura.cms@pianocolombia.com",
      roleId: "editor_cms",
      roleName: "Editor de Contenido",
      roleBadgeColor: "bg-blue-100 text-blue-700 border-blue-200",
      roleIcon: "edit_note",
      status: "active",
      lastLogin: "Ayer, 04:20 PM (IP: 181.132.45.10)",
      permissions: ["Edición CMS Hero", "Gestión de Banners", "FAQ & Artículos"],
      avatarBg: "bg-[#0071BC]",
    },
    {
      id: "usr-003",
      name: "Santiago Bermúdez",
      email: "santiago.moderacion@pianocolombia.com",
      roleId: "moderador",
      roleName: "Moderador de Partituras",
      roleBadgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      roleIcon: "verified",
      status: "active",
      lastLogin: "02 Sep 2026, 11:15 AM (IP: 190.24.18.99)",
      permissions: ["Aprobar Partituras", "Verificar Compositores", "Revisión DRM PDF"],
      avatarBg: "bg-[#FBB03B] text-[#111C2D]",
    },
    {
      id: "usr-004",
      name: "Mariana Valencia Giraldo",
      email: "mariana.tesoreria@pianocolombia.com",
      roleId: "tesorero",
      roleName: "Tesorero / Pagos",
      roleBadgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      roleIcon: "payments",
      status: "active",
      lastLogin: "Hoy, 09:10 AM (IP: 200.21.140.2)",
      permissions: ["Ejecutar Dispersión PayPal", "Exportar Certificados Fiscales", "Reportes DIAN"],
      avatarBg: "bg-emerald-700",
    },
    {
      id: "usr-005",
      name: "Felipe Osorio Cardona",
      email: "felipe.editor@pianocolombia.com",
      roleId: "editor_cms",
      roleName: "Editor de Contenido",
      roleBadgeColor: "bg-blue-100 text-blue-700 border-blue-200",
      roleIcon: "edit_note",
      status: "inactive",
      lastLogin: "15 Ago 2026, 03:30 PM",
      permissions: ["Edición CMS Hero", "Gestión de Banners"],
      avatarBg: "bg-slate-600",
    },
  ]);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || u.roleId === roleFilter;
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleToggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id === id) {
          return {
            ...user,
            status: user.status === "active" ? "inactive" : "active",
          };
        }
        return user;
      })
    );
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    let roleName = "Editor de Contenido";
    let roleBadgeColor = "bg-blue-100 text-blue-700 border-blue-200";
    let roleIcon = "edit_note";
    let avatarBg = "bg-[#0071BC]";

    if (formData.role === "super_admin") {
      roleName = "Super Admin";
      roleBadgeColor = "bg-red-100 text-red-700 border-red-200";
      roleIcon = "shield_person";
      avatarBg = "bg-[#C1272D]";
    } else if (formData.role === "moderador") {
      roleName = "Moderador de Partituras";
      roleBadgeColor = "bg-amber-100 text-amber-800 border-amber-200";
      roleIcon = "verified";
      avatarBg = "bg-[#FBB03B] text-[#111C2D]";
    } else if (formData.role === "tesorero") {
      roleName = "Tesorero / Pagos";
      roleBadgeColor = "bg-emerald-100 text-emerald-800 border-emerald-200";
      roleIcon = "payments";
      avatarBg = "bg-emerald-700";
    }

    const newUser: AdminUser = {
      id: `usr-${Date.now().toString().slice(-3)}`,
      name: formData.name,
      email: formData.email,
      roleId: formData.role as any,
      roleName,
      roleBadgeColor,
      roleIcon,
      status: "active",
      lastLogin: "Nunca (Invitación enviada)",
      permissions: formData.permissions,
      avatarBg,
    };

    setUsers([newUser, ...users]);
    setIsCreateModalOpen(false);
    setFormData({
      name: "",
      email: "",
      role: "editor_cms",
      permissions: ["cms.read", "cms.write"],
    });
  };

  return (
    <div className="space-y-8 font-inter">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-black/5 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#0071BC] font-montserrat font-bold mb-1">
            <span className="material-symbols-outlined text-sm">manage_accounts</span>
            <span>SEGURIDAD & ROLES GRANULARES</span>
          </div>
          <h1 className="text-2xl font-black text-[#111C2D] font-montserrat tracking-tight">
            Gestión de Usuarios Administrativos
          </h1>
          <p className="text-xs text-[#4C4546] mt-1 max-w-2xl">
            Control de acceso basado en roles (RBAC) para el personal interno de Piano Colombia: Super Admins, Editores CMS, Moderadores de contenido y Tesorería.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#0071BC] hover:bg-[#005996] text-white text-xs font-montserrat font-extrabold rounded-xl shadow-md transition-all shrink-0 active:scale-95"
        >
          <span className="material-symbols-outlined text-base">person_add</span>
          <span>+ Crear Nuevo Usuario</span>
        </button>
      </div>

      {/* Role Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Super Admin */}
        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-xs hover:border-[#C1272D]/30 transition">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#C1272D] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">shield_person</span>
            </div>
            <span className="text-xs font-montserrat font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
              1 activo
            </span>
          </div>
          <h3 className="font-montserrat font-extrabold text-sm text-[#111C2D]">Super Admin</h3>
          <p className="text-[11px] text-[#4C4546] mt-1 leading-snug">
            Acceso total irrestricto a la consola, API de pagos, logs de auditoría y creación de roles.
          </p>
        </div>

        {/* Card 2: Editor CMS */}
        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-xs hover:border-[#0071BC]/30 transition">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0071BC] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">edit_note</span>
            </div>
            <span className="text-xs font-montserrat font-black text-[#0071BC] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              2 activos
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
              1 activo
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
              1 activo
            </span>
          </div>
          <h3 className="font-montserrat font-extrabold text-sm text-[#111C2D]">Tesorero / Pagos</h3>
          <p className="text-[11px] text-[#4C4546] mt-1 leading-snug">
            Ejecución de dispersiones de regalías vía PayPal Payouts API y certificados de retención DIAN.
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
          {/* Role Filter */}
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

          {/* Status Filter */}
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
        <div className="w-full overflow-x-auto overscroll-x-contain">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F0F3FF]/70 border-b border-black/5 text-[11px] font-montserrat font-extrabold text-[#4C4546] uppercase tracking-wider">
                <th className="py-3.5 px-6">Usuario Admin</th>
                <th className="py-3.5 px-4">Rol Asignado</th>
                <th className="py-3.5 px-4">Permisos Clave</th>
                <th className="py-3.5 px-4">Última Actividad</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-6 text-right">Acciones</th>
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
                          className={`w-9 h-9 rounded-full ${user.avatarBg} text-white flex items-center justify-center font-montserrat font-black text-xs shrink-0 shadow-2xs`}
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
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-montserrat font-bold border ${user.roleBadgeColor}`}
                      >
                        <span className="material-symbols-outlined text-sm">{user.roleIcon}</span>
                        <span>{user.roleName}</span>
                      </span>
                    </td>

                    {/* Permissions */}
                    <td className="py-4 px-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {user.permissions.slice(0, 2).map((perm, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-[#F0F3FF] text-[#111C2D] rounded text-[10px] font-semibold"
                          >
                            {perm}
                          </span>
                        ))}
                        {user.permissions.length > 2 && (
                          <span className="px-1.5 py-0.5 bg-slate-100 text-[#4C4546] rounded text-[10px] font-bold">
                            +{user.permissions.length - 2}
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
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedUserForEdit(user)}
                          title="Editar rol y permisos"
                          className="p-1.5 text-[#4C4546] hover:text-[#0071BC] hover:bg-[#F0F3FF] rounded-lg transition"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          title={user.status === "active" ? "Desactivar acceso" : "Activar acceso"}
                          className={`p-1.5 rounded-lg transition ${
                            user.status === "active"
                              ? "text-[#4C4546] hover:text-[#C1272D] hover:bg-red-50"
                              : "text-[#4C4546] hover:text-emerald-700 hover:bg-emerald-50"
                          }`}
                        >
                          <span className="material-symbols-outlined text-lg">
                            {user.status === "active" ? "block" : "check_circle"}
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
      </div>

      {/* Modal: Create User */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-black/10 animate-fade-in space-y-6">
            <div className="flex items-center justify-between border-b border-black/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F0F3FF] text-[#0071BC] flex items-center justify-center">
                  <span className="material-symbols-outlined">person_add</span>
                </div>
                <div>
                  <h3 className="font-montserrat font-black text-lg text-[#111C2D]">
                    Crear Usuario Administrativo
                  </h3>
                  <p className="text-xs text-[#4C4546]">Asigna un correo corporativo y un rol inicial.</p>
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
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#F0F3FF] border-none rounded-xl px-4 py-2.5 text-xs text-[#111C2D] focus:ring-2 focus:ring-[#0071BC] outline-none"
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
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#F0F3FF] border-none rounded-xl px-4 py-2.5 text-xs text-[#111C2D] focus:ring-2 focus:ring-[#0071BC] outline-none"
                />
              </div>

              <div>
                <label className="block font-montserrat font-bold text-[#111C2D] mb-1">
                  Rol Administrativo *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-[#F0F3FF] border-none rounded-xl px-4 py-2.5 text-xs font-semibold text-[#111C2D] focus:ring-2 focus:ring-[#0071BC] outline-none"
                >
                  <option value="editor_cms">Editor de Contenido (Acceso al CMS)</option>
                  <option value="moderador">Moderador (Aprobar partituras y compositores)</option>
                  <option value="tesorero">Tesorero / Pagos (Ejecución PayPal API)</option>
                  <option value="super_admin">Super Admin (Acceso Total)</option>
                </select>
              </div>

              <div className="bg-[#F0F3FF]/70 p-4 rounded-xl space-y-2">
                <span className="font-montserrat font-bold text-[#111C2D] block">
                  Permisos Incluidos por defecto:
                </span>
                {formData.role === "editor_cms" && (
                  <p className="text-[11px] text-[#4C4546]">
                    ✓ Editar Banners Hero CMS<br />
                    ✓ Editar Textos Principales y Botones<br />
                    ✓ Administrar Partituras Destacadas
                  </p>
                )}
                {formData.role === "moderador" && (
                  <p className="text-[11px] text-[#4C4546]">
                    ✓ Aprobar o Rechazar Partituras enviadas<br />
                    ✓ Aprobar Registros de Compositores<br />
                    ✓ Inspeccionar vista previa DRM
                  </p>
                )}
                {formData.role === "tesorero" && (
                  <p className="text-[11px] text-[#4C4546]">
                    ✓ Ejecutar Dispersión PayPal Payouts API<br />
                    ✓ Generar Certificados de Retención Fiscal<br />
                    ✓ Ver Saldos Acumulados
                  </p>
                )}
                {formData.role === "super_admin" && (
                  <p className="text-[11px] text-[#C1272D] font-bold">
                    ★ Acceso Total Irrestricto a todos los módulos y configuración global.
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
                  className="px-5 py-2.5 bg-[#0071BC] hover:bg-[#005996] text-white text-xs font-montserrat font-extrabold rounded-xl shadow-md transition"
                >
                  Guardar y Enviar Invitación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {selectedUserForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-black/10 animate-fade-in space-y-6">
            <div className="flex items-center justify-between border-b border-black/5 pb-4">
              <div>
                <h3 className="font-montserrat font-black text-lg text-[#111C2D]">
                  Editar Permisos de {selectedUserForEdit.name}
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

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-montserrat font-bold text-[#111C2D] mb-1">
                  Rol Actual
                </label>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-montserrat font-bold border ${selectedUserForEdit.roleBadgeColor}`}
                >
                  <span className="material-symbols-outlined text-sm">{selectedUserForEdit.roleIcon}</span>
                  <span>{selectedUserForEdit.roleName}</span>
                </span>
              </div>

              <div>
                <label className="block font-montserrat font-bold text-[#111C2D] mb-2">
                  Permisos Específicos
                </label>
                <div className="space-y-2 bg-[#F0F3FF]/60 p-4 rounded-2xl border border-black/5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-[#0071BC]" />
                    <span className="font-semibold text-[#111C2D]">Acceso a Dashboard General</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked={selectedUserForEdit.roleId === "super_admin" || selectedUserForEdit.roleId === "editor_cms"} className="rounded text-[#0071BC]" />
                    <span className="font-semibold text-[#111C2D]">Gestión CMS Componentes Principales</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked={selectedUserForEdit.roleId === "super_admin" || selectedUserForEdit.roleId === "moderador"} className="rounded text-[#0071BC]" />
                    <span className="font-semibold text-[#111C2D]">Aprobar o Rechazar Partituras / Compositores</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked={selectedUserForEdit.roleId === "super_admin" || selectedUserForEdit.roleId === "tesorero"} className="rounded text-[#0071BC]" />
                    <span className="font-semibold text-[#111C2D]">Ejecutar Dispersión PayPal Payouts API</span>
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
                  type="button"
                  onClick={() => setSelectedUserForEdit(null)}
                  className="px-5 py-2.5 bg-[#0071BC] hover:bg-[#005996] text-white text-xs font-montserrat font-extrabold rounded-xl shadow-md transition"
                >
                  Actualizar Permisos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
