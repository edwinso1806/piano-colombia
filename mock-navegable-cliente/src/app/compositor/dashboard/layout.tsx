"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MobileDrawer from "@/components/dashboard/MobileDrawer";

export default function CompositorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/compositor/dashboard", label: "Métricas & Obras", icon: "analytics" },
    { href: "/compositor/dashboard/partituras/nueva", label: "Subir Partitura", icon: "upload_file" },
    { href: "/compositor/dashboard/pagos", label: "Liquidaciones Wompi", icon: "payments" },
    { href: "/compositor/dashboard/perfil", label: "Perfil & Biografía", icon: "badge" },
    { href: "/", label: "Ver Tienda Pública", icon: "storefront" },
  ];

  return (
    <div className="min-h-screen bg-[#F9F9FF] text-[#111C2D] flex flex-col font-inter selection:bg-[#FBB03B]/30 selection:text-[#111C2D] overflow-x-hidden">
      {/* Shared Dashboard Header */}
      <DashboardHeader
        portalBadge="COMPOSITOR"
        badgeColor="bg-[#FBB03B]/20 border-[#FBB03B]/40 text-[#111C2D]"
        searchPlaceholder="Buscar obras, métricas, liquidaciones..."
        userName="Adolfo Mejía"
        userRoleOrTag="Autor Verificado"
        userInitials="AM"
        avatarBg="bg-[#FBB03B] text-[#111C2D]"
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        homeLink="/compositor/dashboard"
      />

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex max-w-[1600px] mx-auto w-full min-w-0">
        {/* Desktop Sidebar Nav (lg:flex) */}
        <aside className="w-64 border-r border-black/5 bg-white p-6 hidden lg:flex flex-col gap-6 shrink-0 shadow-2xs">
          <div className="space-y-6">
            <span className="text-[10px] font-extrabold text-[#4C4546] uppercase tracking-widest block font-montserrat">
              Menú del Compositor
            </span>

            <nav className="space-y-1.5 text-xs font-semibold">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
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
            </nav>
          </div>

          <div className="pt-6 border-t border-black/5">
            <Link
              href="/compositor/login"
              className="flex items-center gap-2 text-xs text-[#C1272D] hover:underline font-bold font-montserrat"
            >
              <span className="material-symbols-outlined text-sm">logout</span> Cerrar Sesión
            </Link>
          </div>
        </aside>

        {/* Mobile Drawer (Accessible overlay for < lg screens) */}
        <MobileDrawer
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          title="Portal Compositor"
        >
          <nav className="space-y-1.5 text-xs font-semibold py-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
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
          </nav>

          <div className="pt-6 mt-6 border-t border-black/5">
            <Link
              href="/compositor/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 text-xs text-[#C1272D] hover:underline font-bold font-montserrat"
            >
              <span className="material-symbols-outlined text-sm">logout</span> Cerrar Sesión
            </Link>
          </div>
        </MobileDrawer>

        {/* Dynamic Page Content with min-w-0 to prevent horizontal overflow */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
