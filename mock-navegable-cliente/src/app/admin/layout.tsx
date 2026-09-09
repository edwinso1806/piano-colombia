"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MobileDrawer from "@/components/dashboard/MobileDrawer";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/admin/dashboard", label: "Dashboard Global", icon: "analytics" },
    { href: "/admin/compositores", label: "Compositores", icon: "person_check", badge: "1 nuevo" },
    { href: "/admin/partituras", label: "Partituras", icon: "library_music", badge: "2 pendientes" },
    { href: "/admin/cms", label: "Gestor CMS", icon: "web" },
    { href: "/admin/pagos", label: "Dispersión & Pagos", icon: "payments", badge: "Wompi API", badgeColor: "bg-emerald-100 text-emerald-800" },
    { href: "/admin/usuarios", label: "Usuarios & Roles", icon: "manage_accounts" },
    { href: "/admin/emails", label: "Plantillas Email", icon: "mail" },
  ];

  return (
    <div className="min-h-screen bg-[#F9F9FF] text-[#111C2D] flex flex-col font-inter selection:bg-[#FBB03B]/30 selection:text-[#111C2D] overflow-x-hidden">
      {/* Shared Dashboard Header */}
      <DashboardHeader
        portalBadge="ADMIN"
        badgeColor="bg-[#C1272D]/10 border-[#C1272D]/20 text-[#C1272D]"
        searchPlaceholder="Buscar compositores, partituras, órdenes, CMS..."
        userName="Super Admin PC"
        userRoleOrTag="admin@pianocolombia.com"
        userInitials="PC"
        avatarBg="bg-[#C1272D]"
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        homeLink="/admin/dashboard"
      />

      {/* Main Body with Sidebar & Content */}
      <div className="flex-1 flex max-w-[1600px] mx-auto w-full min-w-0">
        {/* Desktop Sidebar Nav (lg:flex) */}
        <aside className="w-64 border-r border-black/5 bg-white p-6 hidden lg:flex flex-col justify-between shrink-0 shadow-2xs">
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

          <div className="pt-6 border-t border-black/5">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs text-[#0071BC] hover:underline font-bold font-montserrat"
            >
              <span className="material-symbols-outlined text-sm">storefront</span>
              <span>Volver a la Tienda Pública</span>
            </Link>
          </div>
        </aside>

        {/* Mobile Drawer (Accessible overlay for < lg screens) */}
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

          <div className="pt-6 mt-6 border-t border-black/5">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 text-xs text-[#0071BC] hover:underline font-bold font-montserrat"
            >
              <span className="material-symbols-outlined text-sm">storefront</span>
              <span>Volver a la Tienda Pública</span>
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
