"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MobileDrawer from "@/components/dashboard/MobileDrawer";
import { useAuth } from "@/context/AuthContext";
import { getAdminDashboardStats } from "@/lib/api-client";

export type AdminRole = "admin" | "super_admin" | "editor" | "moderator" | "payouts";

export interface AdminRouteConfig {
  href: string;
  label: string;
  icon: string;
  allowedRoles: AdminRole[];
  badge?: string;
  badgeColor?: string;
}

export const ADMIN_ROUTES: AdminRouteConfig[] = [
  {
    href: "/admin/dashboard",
    label: "Dashboard Global",
    icon: "analytics",
    allowedRoles: ["admin", "super_admin"],
  },
  {
    href: "/admin/compositores",
    label: "Compositores",
    icon: "person_check",
    allowedRoles: ["admin", "super_admin", "moderator"],
  },
  {
    href: "/admin/partituras",
    label: "Partituras",
    icon: "library_music",
    allowedRoles: ["admin", "super_admin", "moderator"],
  },
  {
    href: "/admin/cms",
    label: "Gestor CMS",
    icon: "web",
    allowedRoles: ["admin", "super_admin", "editor"],
  },
  {
    href: "/admin/blog",
    label: "Blog & Noticias",
    icon: "article",
    badge: "Bitácora",
    badgeColor: "bg-blue-100 text-blue-800",
    allowedRoles: ["admin", "super_admin", "editor"],
  },
  {
    href: "/admin/pagos",
    label: "Dispersión & Pagos",
    icon: "payments",
    badge: "Wompi API",
    badgeColor: "bg-emerald-100 text-emerald-800",
    allowedRoles: ["admin", "super_admin", "payouts"],
  },
  {
    href: "/admin/usuarios",
    label: "Usuarios & Roles",
    icon: "manage_accounts",
    allowedRoles: ["admin", "super_admin"],
  },
  {
    href: "/admin/emails",
    label: "Plantillas Email",
    icon: "mail",
    allowedRoles: ["admin", "super_admin", "editor"],
  },
];

function normalizeRole(role?: string): AdminRole {
  if (!role) return "editor";
  const r = role.toLowerCase().trim();
  if (r === "super_admin") return "super_admin";
  if (r === "admin") return "admin";
  if (r === "moderador" || r === "moderator") return "moderator";
  if (r === "editor_cms" || r === "editor") return "editor";
  if (r === "tesorero" || r === "payouts") return "payouts";
  return "editor";
}

function getRoleLabel(role: AdminRole): string {
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "admin":
      return "Administrador";
    case "moderator":
      return "Moderador de Obras & Compositores";
    case "editor":
      return "Editor de Contenido CMS";
    case "payouts":
      return "Tesorero / Pagos";
    default:
      return "Usuario Administrativo";
  }
}

function isUserAllowedForRoute(role: AdminRole, email: string, route: AdminRouteConfig): boolean {
  if (
    role === "admin" ||
    role === "super_admin" ||
    email.toLowerCase() === "admin@pianocolombia.com" ||
    email.toLowerCase() === "carlos.admin@pianocolombia.com"
  ) {
    return true;
  }
  return route.allowedRoles.includes(role);
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, logoutAdmin, isLoaded } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingComposers, setPendingComposers] = useState<number>(0);
  const [pendingScores, setPendingScores] = useState<number>(0);

  const activeName = admin?.name || "";
  const activeEmail = admin?.email || "";
  const activeRole = admin?.role || "";
  const userRole = normalizeRole(activeRole);

  const defaultHomeLink =
    userRole === "moderator"
      ? "/admin/partituras"
      : userRole === "editor"
      ? "/admin/cms"
      : userRole === "payouts"
      ? "/admin/pagos"
      : "/admin/dashboard";

  // Cargar estadísticas del dashboard
  useEffect(() => {
    if (admin) {
      getAdminDashboardStats().then((data) => {
        if (data && data.success) {
          setPendingComposers(data.composers?.pendingCount || 0);
          setPendingScores(data.scores?.pendingCount || 0);
        }
      });
    }
  }, [admin, pathname]);

  // Redirección automática si NO hay sesión activa de administrador
  useEffect(() => {
    if (isLoaded && !admin) {
      const redirectUrl = `/admin/login?redirect=${encodeURIComponent(pathname)}`;
      router.push(redirectUrl);
    }
  }, [isLoaded, admin, pathname, router]);

  // Redirección inteligente: si el rol NO tiene acceso al Dashboard Global y navega a /admin o /admin/dashboard
  useEffect(() => {
    if (isLoaded && admin) {
      const isSuper =
        userRole === "admin" ||
        userRole === "super_admin" ||
        activeEmail.toLowerCase() === "admin@pianocolombia.com" ||
        activeEmail.toLowerCase() === "carlos.admin@pianocolombia.com";

      if (!isSuper && (pathname === "/admin" || pathname === "/admin/dashboard")) {
        router.replace(defaultHomeLink);
      }
    }
  }, [isLoaded, admin, userRole, activeEmail, pathname, router, defaultHomeLink]);

  // 1. Estado de Carga
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#F9F9FF] text-[#111C2D] flex items-center justify-center font-inter p-6">
        <div className="flex items-center gap-3 text-xs font-bold text-[#111C2D] font-montserrat bg-white p-6 rounded-2xl border border-black/5 shadow-md">
          <span className="w-5 h-5 border-2 border-[#111C2D] border-t-transparent rounded-full animate-spin"></span>
          <span>Verificando credenciales de acceso administrativo...</span>
        </div>
      </div>
    );
  }

  // 2. Estado NO AUTENTICADO: Bloquear inmediatamente la consola
  if (!admin) {
    const redirectUrl = `/admin/login?redirect=${encodeURIComponent(pathname)}`;
    return (
      <div className="min-h-screen bg-[#F9F9FF] text-[#111C2D] flex items-center justify-center p-6 font-inter selection:bg-[#FBB03B]/30 selection:text-[#111C2D]">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-black/5 shadow-[0_20px_50px_rgba(0,0,0,0.06)] text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#111C2D] via-[#C1272D] to-[#FBB03B]"></div>
          
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#C1272D] flex items-center justify-center mx-auto border border-red-200">
            <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
          </div>
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#C1272D] text-[11px] font-extrabold uppercase tracking-wider font-montserrat border border-red-200">
              Acceso Restringido • Seguridad RBAC
            </div>
            <h1 className="text-2xl font-black font-montserrat text-[#111C2D] tracking-tight">
              Área Administrativa Privada
            </h1>
            <p className="text-xs sm:text-sm text-[#4C4546] leading-relaxed font-normal">
              Para acceder al panel global, moderar partituras, aprobar compositores o ejecutar dispersión de pagos, debes iniciar sesión con una cuenta institucional autorizada.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href={redirectUrl}
              className="w-full py-3.5 bg-[#111C2D] hover:bg-[#1a2b45] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg text-[#FBB03B]">login</span>
              Iniciar Sesión en Consola Admin
            </Link>
            <Link
              href="/"
              className="w-full py-3 bg-[#F0F3FF] hover:bg-[#111C2D] text-[#111C2D] hover:text-white font-bold text-xs rounded-xl transition font-montserrat flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Volver a la Tienda Pública
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Estado AUTENTICADO: Filtrar rutas y evaluar guardia de acceso por URL
  const initials = activeName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Filtrar exclusivamente los menús a los que el rol tiene acceso
  const navLinks = ADMIN_ROUTES.filter((route) =>
    isUserAllowedForRoute(userRole, activeEmail, route)
  ).map((route) => ({
    ...route,
    badge:
      route.href === "/admin/compositores" && pendingComposers > 0
        ? `${pendingComposers} nuevo${pendingComposers > 1 ? "s" : ""}`
        : route.href === "/admin/partituras" && pendingScores > 0
        ? `${pendingScores} pendiente${pendingScores > 1 ? "s" : ""}`
        : route.badge,
  }));

  // Evaluar guardia de acceso para la URL directa actual
  const matchedRoute = ADMIN_ROUTES.find(
    (r) => pathname === r.href || pathname.startsWith(`${r.href}/`)
  );
  const hasRouteAccess = !matchedRoute || isUserAllowedForRoute(userRole, activeEmail, matchedRoute);

  const handleLogout = () => {
    logoutAdmin();
    window.location.href = "/admin/login";
  };

  return (
    <div className="min-h-screen bg-[#F9F9FF] text-[#111C2D] flex flex-col font-inter selection:bg-[#FBB03B]/30 selection:text-[#111C2D] overflow-x-hidden">
      {/* Shared Dashboard Header */}
      <DashboardHeader
        portalBadge="ADMIN"
        badgeColor="bg-[#C1272D]/10 border-[#C1272D]/20 text-[#C1272D]"
        searchPlaceholder="Buscar compositores, partituras, órdenes, CMS..."
        userName={activeName}
        userRoleOrTag={`${activeEmail} (${activeRole.toUpperCase()})`}
        userInitials={initials}
        avatarBg="bg-[#C1272D]"
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        homeLink={defaultHomeLink}
        onLogout={handleLogout}
      />

      {/* Main Body with Sidebar & Content */}
      <div className="flex-1 flex max-w-[1600px] mx-auto w-full min-w-0">
        {/* Desktop Sidebar Nav (lg:flex) */}
        <aside className="w-64 border-r border-black/5 bg-white p-6 hidden lg:flex flex-col gap-6 shrink-0 shadow-2xs">
          <div className="space-y-6">
            <span className="text-[10px] font-extrabold text-[#4C4546] uppercase tracking-widest block font-montserrat">
              Panel Administrativo
            </span>

            <nav className="space-y-1.5 text-xs font-semibold">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl transition ${
                      isActive
                        ? "text-[#111C2D] bg-[#F0F3FF] border-l-4 border-[#0071BC] font-bold shadow-2xs"
                        : "text-[#4C4546] hover:text-[#111C2D] hover:bg-[#F0F3FF]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="material-symbols-outlined text-base shrink-0 text-[#0071BC]">
                        {link.icon}
                      </span>
                      <span className="truncate">{link.label}</span>
                    </div>
                    {link.badge && (
                      <span
                        className={`px-2 py-0.5 text-[9px] font-bold rounded-full font-montserrat whitespace-nowrap shrink-0 ${
                          link.badgeColor || "bg-[#FBB03B] text-[#111C2D]"
                        }`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="pt-6 border-t border-black/5 space-y-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs text-[#0071BC] hover:underline font-bold font-montserrat"
            >
              <span className="material-symbols-outlined text-sm">storefront</span>
              <span>Volver a la Tienda Pública</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs text-[#C1272D] hover:underline font-bold font-montserrat w-full text-left"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </aside>

        {/* Mobile Drawer */}
        <MobileDrawer
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          title="Navegación Admin"
        >
          <nav className="space-y-1.5 text-xs font-semibold py-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl transition ${
                    isActive
                      ? "text-[#111C2D] bg-[#F0F3FF] border-l-4 border-[#0071BC] font-bold shadow-2xs"
                      : "text-[#4C4546] hover:text-[#111C2D] hover:bg-[#F0F3FF]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="material-symbols-outlined text-base shrink-0 text-[#0071BC]">
                      {link.icon}
                    </span>
                    <span className="truncate">{link.label}</span>
                  </div>
                  {link.badge && (
                    <span
                      className={`px-2 py-0.5 text-[9px] font-bold rounded-full font-montserrat whitespace-nowrap shrink-0 ${
                        link.badgeColor || "bg-[#FBB03B] text-[#111C2D]"
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="pt-6 mt-6 border-t border-black/5 space-y-3">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 text-xs text-[#0071BC] hover:underline font-bold font-montserrat"
            >
              <span className="material-symbols-outlined text-sm">storefront</span>
              <span>Volver a la Tienda Pública</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-2 text-xs text-[#C1272D] hover:underline font-bold font-montserrat w-full text-left"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </MobileDrawer>

        {/* Dynamic Page Content with RBAC Protection */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0 overflow-y-auto">
          {!hasRouteAccess ? (
            <div className="max-w-xl mx-auto my-8 bg-white rounded-3xl border border-red-200 p-8 sm:p-10 shadow-[0_20px_50px_rgba(239,68,68,0.08)] text-center space-y-6 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-600 via-[#FBB03B] to-red-600"></div>

              <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200 shadow-xs">
                <span className="material-symbols-outlined text-3xl">shield_lock</span>
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-[11px] font-extrabold uppercase tracking-wider font-montserrat border border-red-200">
                  Acceso Restringido • Control RBAC
                </div>
                <h1 className="text-2xl font-black font-montserrat text-[#111C2D] tracking-tight">
                  Módulo No Autorizado
                </h1>
                <p className="text-xs sm:text-sm text-[#4C4546] leading-relaxed font-normal max-w-md mx-auto">
                  Tu perfil actual tiene el rol de{" "}
                  <strong className="text-[#111C2D] uppercase font-bold">
                    {getRoleLabel(userRole)}
                  </strong>{" "}
                  y no cuenta con privilegios para acceder al módulo{" "}
                  <strong className="text-[#111C2D]">
                    {matchedRoute?.label || pathname}
                  </strong>
                  . Esta sección está reservada exclusivamente para roles con permisos específicos.
                </p>
              </div>

              <div className="p-4 bg-[#F9F9FF] border border-black/5 rounded-2xl text-left space-y-2.5">
                <div className="text-[11px] font-bold text-[#111C2D] font-montserrat uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-[#0071BC]">verified_user</span>
                  Módulos Habilitados para tu Rol:
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {navLinks.map((vl) => (
                    <Link
                      key={vl.href}
                      href={vl.href}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-black/5 hover:border-[#0071BC] text-[#111C2D] text-xs font-bold rounded-xl transition shadow-2xs hover:text-[#0071BC]"
                    >
                      <span className="material-symbols-outlined text-sm text-[#0071BC]">{vl.icon}</span>
                      <span>{vl.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Link
                  href={defaultHomeLink}
                  className="w-full py-3.5 bg-[#111C2D] hover:bg-[#1a2b45] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg text-[#FBB03B]">arrow_back</span>
                  {userRole === "moderator"
                    ? "Ir a Moderación de Partituras"
                    : userRole === "editor"
                    ? "Ir al Gestor CMS"
                    : userRole === "payouts"
                    ? "Ir a Dispersión & Pagos"
                    : "Volver al Dashboard Global"}
                </Link>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
