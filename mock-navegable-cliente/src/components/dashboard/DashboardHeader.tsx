"use client";

import Link from "next/link";
import React from "react";

interface DashboardHeaderProps {
  portalBadge: string;
  badgeColor?: string;
  searchPlaceholder?: string;
  userName: string;
  userRoleOrTag: string;
  userInitials: string;
  avatarBg?: string;
  onOpenMobileMenu?: () => void;
  homeLink?: string;
}

export default function DashboardHeader({
  portalBadge,
  badgeColor = "bg-[#C1272D]/10 border-[#C1272D]/20 text-[#C1272D]",
  searchPlaceholder = "Buscar en el panel...",
  userName,
  userRoleOrTag,
  userInitials,
  avatarBg = "bg-[#C1272D]",
  onOpenMobileMenu,
  homeLink = "/",
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-black/5 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-2xs font-inter">
      {/* Brand & Mobile Hamburger */}
      <div className="flex items-center gap-3">
        {/* Hamburger Mobile Toggle */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-[#111C2D] hover:bg-[#F0F3FF] rounded-xl transition"
          aria-label="Abrir menú de navegación"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>

        {/* Logo Lockup */}
        <Link href={homeLink} className="flex items-center gap-2.5 group">
          <div className="flex items-center gap-1 shrink-0">
            <div className="h-5 sm:h-6 w-1 bg-[#111C2D] rounded-full"></div>
            <div className="h-7 sm:h-8 w-1 bg-[#FBB03B] rounded-full"></div>
            <div className="h-4 sm:h-5 w-1 bg-[#0071BC] rounded-full"></div>
            <div className="h-6 sm:h-7 w-1 bg-[#111C2D] rounded-full"></div>
            <div className="h-4 w-1 bg-[#C1272D] rounded-full"></div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-montserrat text-xs sm:text-sm font-black tracking-tight text-[#111C2D] leading-none group-hover:text-[#0071BC] transition-colors">
                PIANO COLOMBIA
              </span>
              <span
                className={`text-[9px] px-1.5 py-0.5 border rounded font-montserrat font-black uppercase ${badgeColor}`}
              >
                {portalBadge}
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Search Input */}
      <div className="hidden md:flex flex-1 max-w-md mx-6 items-center">
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

      {/* User Badge Info */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <span className="text-xs font-bold text-[#111C2D] block font-montserrat">{userName}</span>
          <span className="text-[10px] text-[#0071BC] font-semibold">{userRoleOrTag}</span>
        </div>
        <div
          className={`w-9 h-9 rounded-full ${avatarBg} text-white flex items-center justify-center font-montserrat font-black text-xs shadow-2xs shrink-0`}
        >
          {userInitials}
        </div>
      </div>
    </header>
  );
}
