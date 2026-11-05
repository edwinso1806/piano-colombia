"use client";

import Link from "next/link";
import React from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";
import { resolveMediaUrl } from "@/lib/api-client";

interface DashboardHeaderProps {
  portalBadge: string;
  badgeColor?: string;
  searchPlaceholder?: string;
  userName: string;
  userRoleOrTag: string;
  userInitials: string;
  userPhotoUrl?: string | null;
  avatarBg?: string;
  onOpenMobileMenu?: () => void;
  homeLink?: string;
  onLogout?: () => void;
}

export default function DashboardHeader({
  portalBadge,
  badgeColor = "bg-[#C1272D]/10 border-[#C1272D]/20 text-[#C1272D]",
  searchPlaceholder = "Buscar en el panel...",
  userName,
  userRoleOrTag,
  userInitials,
  userPhotoUrl,
  avatarBg = "bg-[#C1272D]",
  onOpenMobileMenu,
  homeLink = "/",
  onLogout,
}: DashboardHeaderProps) {
  const { t } = useLanguage();
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-black/5 px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between shadow-2xs font-inter w-full max-w-full overflow-hidden">
      {/* Brand & Mobile Hamburger */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 shrink">
        {/* Hamburger Mobile Toggle */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 sm:p-2 text-[#111C2D] hover:bg-[#F0F3FF] rounded-xl transition shrink-0"
          aria-label="Abrir menú de navegación"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>

        {/* Logo Lockup */}
        <Link href={homeLink} className="flex items-center gap-1.5 sm:gap-2.5 group min-w-0">
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            <div className="h-4 sm:h-6 w-1 bg-[#111C2D] rounded-full"></div>
            <div className="h-6 sm:h-8 w-1 bg-[#FBB03B] rounded-full"></div>
            <div className="h-3.5 sm:h-5 w-1 bg-[#0071BC] rounded-full"></div>
            <div className="h-5 sm:h-7 w-1 bg-[#111C2D] rounded-full"></div>
            <div className="h-3.5 sm:h-4 w-1 bg-[#C1272D] rounded-full"></div>
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-montserrat text-xs sm:text-sm font-black tracking-tight text-[#111C2D] leading-none group-hover:text-[#0071BC] transition-colors whitespace-nowrap">
              PIANO COLOMBIA
            </span>
            <span
              className={`hidden md:inline-block text-[9px] px-1.5 py-0.5 border rounded font-montserrat font-black uppercase shrink-0 ${badgeColor}`}
            >
              {portalBadge}
            </span>
          </div>
        </Link>
      </div>

      {/* Quick Search Input */}
      <div className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-6 items-center">
        <div className="w-full flex items-center bg-[#F0F3FF] px-4 py-2 rounded-xl text-[#4C4546] shadow-2xs focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0071BC] transition-all">
          <span className="material-symbols-outlined text-[#4C4546] mr-2 text-lg">search</span>
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="bg-transparent border-none text-xs text-[#111C2D] placeholder-[#4C4546]/70 focus:outline-none w-full"
          />
          <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 font-mono text-[10px] bg-slate-200/60 text-[#4C4546] rounded ml-2">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* User Badge Info, Language Switcher & Logout */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <LanguageSwitcher />

        <div className="text-right hidden md:block">
          <span className="text-xs font-bold text-[#111C2D] block font-montserrat truncate max-w-[140px]">{userName}</span>
          <span className="text-[10px] text-[#0071BC] font-semibold truncate max-w-[140px] block">{userRoleOrTag}</span>
        </div>

        {/* User Avatar (Circle with photo or initials) */}
        <div
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full ${avatarBg} text-white flex items-center justify-center font-montserrat font-black text-xs shadow-2xs shrink-0 overflow-hidden border border-black/10`}
          title={userName}
        >
          {userPhotoUrl ? (
            <img src={resolveMediaUrl(userPhotoUrl)} alt={userName} className="w-full h-full object-cover" />
          ) : (
            userInitials
          )}
        </div>

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition text-xs font-bold font-montserrat shrink-0 shadow-2xs"
            title={t("dashboard.nav_logout", "Cerrar Sesión")}
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span className="hidden md:inline">{t("dashboard.nav_logout", "Cerrar Sesión")}</span>
          </button>
        )}
      </div>
    </header>
  );
}
