"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MobileDrawer from "@/components/dashboard/MobileDrawer";
import { getComposerProfileApi } from "@/lib/api-client";

import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export default function CompositorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { composer, loginComposer, logoutComposer, isLoaded } = useAuth();
  const { t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sincronización automática del estado del compositor con la base de datos
  useEffect(() => {
    if (!composer) return;
    const currentComposer = composer;
    const targetId = currentComposer.id || currentComposer.email;
    if (!targetId) return;

    let isMounted = true;
    async function syncComposerStatus() {
      try {
        const freshData = await getComposerProfileApi(targetId);
        if (freshData && isMounted) {
          if (
            freshData.status !== currentComposer.status ||
            freshData.rejection_reason !== currentComposer.rejection_reason ||
            freshData.artistic_name !== currentComposer.artistic_name
          ) {
            loginComposer({
              ...currentComposer,
              ...freshData,
              status: freshData.status,
              rejection_reason: freshData.rejection_reason,
            });
          }
        }
      } catch (err) {
        console.warn("Error al sincronizar estado del compositor:", err);
      }
    }

    syncComposerStatus();
    return () => {
      isMounted = false;
    };
  }, [composer?.id, composer?.email, composer?.status]);

  const activeName = composer?.artistic_name || (composer?.first_name ? `${composer.first_name} ${composer.last_name || ""}`.trim() : "Compositor");
  const activeEmail = composer?.email || "";
  const initials = (activeName || "PC")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isApproved = composer?.status === "APPROVED";

  const handleLogout = () => {
    logoutComposer();
    router.replace("/compositor/login");
  };

  // Guardia de Autenticación y Redirección Forzada
  useEffect(() => {
    if (!isLoaded) return;

    if (!composer) {
      router.replace("/compositor/login");
      return;
    }

    if (!isApproved && pathname !== "/compositor/dashboard/perfil") {
      router.replace("/compositor/dashboard/perfil");
    }
  }, [composer, isApproved, isLoaded, pathname, router]);

  // Si no está cargado o no hay sesión de compositor, mostramos loader y bloqueamos la renderización
  if (!isLoaded || !composer) {
    return (
      <div className="min-h-screen bg-[#F9F9FF] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-4 border-[#0071BC] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-[#111C2D] font-montserrat">{t("dashboard.verifying_session", "Verificando sesión de compositor...")}</p>
      </div>
    );
  }

  const navLinks = [
    { href: "/compositor/dashboard", label: t("dashboard.nav_overview", "Métricas & Obras"), icon: "analytics", locked: !isApproved },
    { href: "/compositor/dashboard/partituras/nueva", label: t("dashboard.nav_new_score", "Subir Partitura"), icon: "upload_file", locked: !isApproved },
    { href: "/compositor/dashboard/pagos", label: t("dashboard.nav_royalties", "Liquidaciones Wompi"), icon: "payments", locked: !isApproved },
    { href: "/compositor/dashboard/perfil", label: t("dashboard.nav_profile", "Perfil & Biografía"), icon: "badge", locked: false },
    { href: "/", label: t("dashboard.nav_public_store", "Ver Tienda Pública"), icon: "storefront", locked: false },
  ];

  return (
    <div className="min-h-screen bg-[#F9F9FF] text-[#111C2D] flex flex-col font-inter selection:bg-[#FBB03B]/30 selection:text-[#111C2D] overflow-x-hidden">
      {/* Shared Dashboard Header */}
      <DashboardHeader
        portalBadge={t("dashboard.portal_badge", "COMPOSITOR")}
        badgeColor="bg-[#FBB03B]/20 border-[#FBB03B]/40 text-[#111C2D]"
        searchPlaceholder={t("dashboard.search_placeholder", "Buscar obras, métricas, liquidaciones...")}
        userName={activeName}
        userRoleOrTag={activeEmail}
        userInitials={initials}
        avatarBg="bg-[#FBB03B] text-[#111C2D]"
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        homeLink="/compositor/dashboard"
        onLogout={handleLogout}
      />

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex max-w-[1600px] mx-auto w-full min-w-0">
        {/* Desktop Sidebar Nav (lg:flex) */}
        <aside className="w-64 border-r border-black/5 bg-white p-6 hidden lg:flex flex-col shrink-0 shadow-2xs">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-[#4C4546] uppercase tracking-widest block font-montserrat">
                {t("dashboard.menu_title", "Menú del Compositor")}
              </span>
              {!isApproved && (
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[9px] font-black uppercase font-montserrat">
                  {t("dashboard.in_review", "En Revisión")}
                </span>
              )}
            </div>

            <nav className="space-y-1.5 text-xs font-semibold">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                if (link.locked) {
                  return (
                    <div
                      key={link.href}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[#4C4546]/50 bg-slate-50 cursor-not-allowed select-none"
                      title={t("dashboard.locked_tooltip", "Módulo bloqueado hasta que tu perfil sea aprobado por administración")}
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-base shrink-0 text-[#4C4546]/40">
                          {link.icon}
                        </span>
                        <span className="truncate">{link.label}</span>
                      </div>
                      <span className="material-symbols-outlined text-xs text-amber-600">lock</span>
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                      isActive
                        ? "text-[#111C2D] bg-[#F0F3FF] border-l-4 border-[#FBB03B] font-bold shadow-2xs"
                        : "text-[#4C4546] hover:text-[#111C2D] hover:bg-[#F0F3FF]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-base shrink-0 text-[#0071BC]">
                      {link.icon}
                    </span>
                    <span className="truncate">{link.label}</span>
                  </Link>
                );
              })}

              {/* Cerrar Sesión inmediatamente después del último item del menú */}
              <div className="pt-3 mt-3 border-t border-black/5">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[#C1272D] hover:bg-red-50 hover:text-red-800 transition font-bold font-montserrat w-full text-left"
                >
                  <span className="material-symbols-outlined text-base shrink-0 text-[#C1272D]">logout</span>
                  <span className="truncate">{t("dashboard.nav_logout", "Cerrar Sesión")}</span>
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Mobile Drawer (Accessible overlay for < lg screens) */}
        <MobileDrawer
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          title={t("dashboard.portal_badge", "Portal Compositor")}
        >
          <nav className="space-y-1.5 text-xs font-semibold py-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              if (link.locked) {
                return (
                  <div
                    key={link.href}
                    className="flex items-center justify-between px-3.5 py-3 rounded-xl text-[#4C4546]/50 bg-slate-50 cursor-not-allowed select-none"
                    title={t("dashboard.locked_tooltip", "Módulo bloqueado hasta que tu perfil sea aprobado por administración")}
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-base shrink-0 text-[#4C4546]/40">
                        {link.icon}
                      </span>
                      <span className="truncate">{link.label}</span>
                    </div>
                    <span className="material-symbols-outlined text-xs text-amber-600">lock</span>
                  </div>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition ${
                    isActive
                      ? "text-[#111C2D] bg-[#F0F3FF] border-l-4 border-[#FBB03B] font-bold shadow-2xs"
                      : "text-[#4C4546] hover:text-[#111C2D] hover:bg-[#F0F3FF]"
                  }`}
                >
                  <span className="material-symbols-outlined text-base shrink-0 text-[#0071BC]">
                    {link.icon}
                  </span>
                  <span className="truncate">{link.label}</span>
                </Link>
              );
            })}

            <div className="pt-3 mt-3 border-t border-black/5">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-[#C1272D] hover:bg-red-50 hover:text-red-800 transition font-bold font-montserrat w-full text-left"
              >
                <span className="material-symbols-outlined text-base shrink-0 text-[#C1272D]">logout</span>
                <span className="truncate">{t("dashboard.nav_logout", "Cerrar Sesión")}</span>
              </button>
            </div>
          </nav>
        </MobileDrawer>

        {/* Dynamic Page Content with min-w-0 to prevent horizontal overflow */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0 overflow-y-auto">
          {!isApproved && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 flex items-start sm:items-center gap-3.5 shadow-xs animate-in fade-in duration-200">
              <span className="material-symbols-outlined text-2xl text-[#FBB03B] shrink-0">hourglass_top</span>
              <div className="text-xs">
                <span className="font-extrabold font-montserrat uppercase tracking-wider block text-[#111C2D]">
                  {t("dashboard.restricted_access_title", "Acceso Restringido • Perfil en Construcción")}
                </span>
                <span className="text-[#4C4546] font-medium">
                  {t("dashboard.restricted_access_desc", "Tu cuenta se encuentra pendiente de aprobación. Completa tu biografía, fotografía oficial de retrato y datos bancarios, y haz clic en \"Guardar y enviar a revisión\" para habilitar las demás funciones del portal.")}
                </span>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
