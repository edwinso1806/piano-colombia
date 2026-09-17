"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import MobileDrawer from "@/components/dashboard/MobileDrawer";

import { useAuth } from "@/context/AuthContext";
import { useSavedScores } from "@/context/SavedScoresContext";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface HeaderProps {
  activePage?: "inicio" | "tienda" | "compositores" | "blog" | "carrito" | "checkout";
}

export default function Header({ activePage }: HeaderProps) {
  const router = useRouter();
  const { totalItems } = useCart();
  const { customer, logoutCustomer } = useAuth();
  const { savedScores } = useSavedScores();
  const { t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Menú de navegación para Escritorio
  const desktopNav = [
    { href: "/tienda", label: t("nav.catalog", "Tienda de Partituras"), activeKey: "tienda" },
    { href: "/compositores", label: t("nav.composers", "Compositores"), activeKey: "compositores" },
    { href: "/blog", label: t("nav.blog", "Blog & Artículos"), activeKey: "blog" },
  ];

  // Menú de navegación para Móvil
  const mobileNav = [
    { href: "/", label: "Inicio", activeKey: "inicio", icon: "home" },
    { href: "/tienda", label: t("nav.catalog", "Tienda de Partituras"), activeKey: "tienda", icon: "storefront" },
    { href: "/compositores", label: t("nav.composers", "Compositores"), activeKey: "compositores", icon: "groups" },
    { href: "/blog", label: t("nav.blog", "Blog & Artículos"), activeKey: "blog", icon: "article" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-black/5 px-4 sm:px-8 py-3.5 flex justify-between items-center gap-6 w-full shadow-2xs">
        {/* Left Cluster: Logo Brand + Desktop Navigation */}
        <div className="flex items-center gap-6 lg:gap-10 shrink-0">
          {/* Hamburger Mobile Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-[#111C2D] hover:bg-[#F0F3FF] active:bg-slate-200 rounded-xl transition shrink-0 cursor-pointer"
            aria-label="Abrir menú de navegación"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>

          {/* Logo Stitch con enlace a Inicio */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0" title="Piano Colombia - Inicio">
            <div className="flex items-center gap-1 shrink-0">
              <div className="h-6 w-1 bg-[#111C2D] rounded-full"></div>
              <div className="h-8 w-1 bg-[#FBB03B] rounded-full"></div>
              <div className="h-5 w-1 bg-[#0071BC] rounded-full"></div>
              <div className="h-7 w-1 bg-[#111C2D] rounded-full"></div>
              <div className="h-4.5 w-1 bg-[#C1272D] rounded-full"></div>
            </div>
            <div className="flex flex-col shrink-0">
              <span className="font-montserrat text-sm sm:text-base font-black tracking-tight text-[#111C2D] leading-none group-hover:text-[#0071BC] transition-colors whitespace-nowrap">
                PIANO COLOMBIA
              </span>
              <span className="text-[9px] font-extrabold text-[#4C4546] uppercase tracking-wider font-montserrat mt-0.5 hidden sm:block whitespace-nowrap">
                Archivo & Partituras
              </span>
            </div>
          </Link>

          {/* Navegación Principal Escritorio */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-8 text-sm font-semibold tracking-wide text-[#4C4546] shrink-0">
            {desktopNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition hover:text-[#0071BC] whitespace-nowrap ${
                  activePage === item.activeKey ? "text-[#0071BC] font-bold" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Cluster: Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <LanguageSwitcher />

          {/* Botón Carrito de Compras */}
          <Link
            href="/carrito"
            className={`relative px-3 sm:px-3.5 py-2 rounded-xl border text-xs font-bold font-montserrat flex items-center gap-1.5 transition ${
              activePage === "carrito"
                ? "bg-[#0071BC] text-white border-[#0071BC] shadow-xs"
                : "bg-[#F0F3FF] text-[#111C2D] border-black/5 hover:bg-slate-200/60"
            }`}
            aria-label="Ver Carrito de Compras"
          >
            <span className="material-symbols-outlined text-lg">shopping_cart</span>
            <span className="hidden md:inline">{t("nav.cart", "Carrito")}</span>
            {totalItems > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#C1272D] text-white text-[10px] font-black flex items-center justify-center font-montserrat shadow-2xs">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Mi Cuenta (Escritorio) - Con sesión inteligente */}
          {customer ? (
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#F0F3FF] hover:bg-slate-200/70 border border-black/5 rounded-xl text-xs font-bold font-montserrat transition"
              >
                <span className="w-6 h-6 rounded-full bg-[#0071BC] text-white flex items-center justify-center text-[11px] font-black">
                  {customer.fullName.charAt(0)}
                </span>
                <span className="text-[#111C2D] max-w-[100px] truncate">{customer.fullName.split(" ")[0]}</span>
                <span className="material-symbols-outlined text-sm text-[#4C4546]">expand_more</span>
              </button>

              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsUserMenuOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-black/10 shadow-xl py-2 z-40 text-xs font-inter space-y-1">
                    <div className="px-4 py-2 border-b border-black/5">
                      <span className="font-bold text-[#111C2D] block font-montserrat truncate">{customer.fullName}</span>
                      <span className="text-[11px] text-[#4C4546] truncate block">{customer.email}</span>
                    </div>
                    <Link
                      href="/mi-cuenta/descargas"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-[#111C2D] hover:bg-[#F0F3FF] transition font-semibold"
                    >
                      <span className="material-symbols-outlined text-base text-[#0071BC]">cloud_download</span>
                      <span>Mis Partituras & Descargas</span>
                    </Link>
                    <Link
                      href="/mi-cuenta/descargas?tab=colecciones"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-2 text-[#111C2D] hover:bg-[#F0F3FF] transition font-semibold"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-base text-[#C1272D]">bookmark</span>
                        <span>Partituras Guardadas</span>
                      </div>
                      {savedScores.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-[#C1272D] text-[10px] font-black font-montserrat">
                          {savedScores.length}
                        </span>
                      )}
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        logoutCustomer();
                        setIsUserMenuOpen(false);
                        router.push("/");
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-red-600 hover:bg-red-50 transition font-semibold text-left"
                    >
                      <span className="material-symbols-outlined text-base text-red-500">logout</span>
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:flex px-3.5 py-2 text-xs font-bold bg-[#F0F3FF] hover:bg-[#111C2D] text-[#111C2D] hover:text-white transition rounded-xl font-montserrat items-center gap-1.5 border border-black/5"
            >
              <span className="material-symbols-outlined text-base text-[#0071BC]">person</span>
              <span>{t("nav.my_account", "Mi Cuenta")}</span>
            </Link>
          )}

          {/* Portal Compositor (Escritorio) */}
          <Link
            href="/compositor/login"
            className="hidden md:flex px-4 py-2 text-xs font-extrabold uppercase tracking-wider bg-[#FBB03B] text-[#111C2D] rounded-xl hover:bg-[#e09b2d] transition shadow-md font-montserrat items-center gap-1.5"
            title="Acceder al Portal del Compositor"
          >
            <span className="material-symbols-outlined text-sm">music_note</span>
            <span>{t("nav.composer_portal", "Portal Compositor")}</span>
          </Link>
        </div>
      </header>

      {/* Mobile Drawer (Menú lateral deslizable) */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="Navegación Piano Colombia"
      >
        <div className="space-y-6 py-1">
          {/* Header Interno de Marca */}
          <div className="flex items-center gap-2.5 pb-3 border-b border-black/5">
            <div className="flex items-center gap-1 shrink-0">
              <div className="h-5 w-1 bg-[#111C2D] rounded-full"></div>
              <div className="h-7 w-1 bg-[#FBB03B] rounded-full"></div>
              <div className="h-4 w-1 bg-[#0071BC] rounded-full"></div>
              <div className="h-6 w-1 bg-[#111C2D] rounded-full"></div>
              <div className="h-3.5 w-1 bg-[#C1272D] rounded-full"></div>
            </div>
            <div>
              <span className="font-montserrat text-xs font-black tracking-tight text-[#111C2D] block leading-none">
                PIANO COLOMBIA
              </span>
              <span className="text-[9px] font-extrabold text-[#4C4546] uppercase tracking-wider font-montserrat block mt-0.5">
                Archivo Digital Urtext
              </span>
            </div>
          </div>

          {/* Enlaces Principales de Navegación */}
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-[#4C4546] uppercase tracking-widest block font-montserrat px-1 mb-2">
              Explorar Tienda
            </span>
            <nav className="space-y-1 text-xs font-semibold">
              {mobileNav.map((item) => {
                const isActive = activePage === item.activeKey;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl transition ${
                      isActive
                        ? "text-[#111C2D] bg-[#F0F3FF] border-l-4 border-[#0071BC] font-bold shadow-2xs"
                        : "text-[#4C4546] hover:text-[#111C2D] hover:bg-[#F0F3FF]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-lg shrink-0 text-[#0071BC]">
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    <span className="material-symbols-outlined text-sm text-[#4C4546]/50">chevron_right</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Área de Compras & Usuario */}
          <div className="space-y-2 pt-3 border-t border-black/5">
            <span className="text-[10px] font-extrabold text-[#4C4546] uppercase tracking-widest block font-montserrat px-1 mb-1">
              Mi Cuenta & Carrito
            </span>

            {/* Link al Carrito */}
            <Link
              href="/carrito"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#F0F3FF] text-xs font-bold text-[#111C2D] hover:bg-slate-200 transition font-montserrat border border-black/5"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-lg text-[#0071BC]">shopping_cart</span>
                <span>Mi Carrito de Compras</span>
              </div>
              {totalItems > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-[#C1272D] text-white text-[10px] font-black">
                  {totalItems} ítems
                </span>
              ) : (
                <span className="text-[10px] text-[#4C4546] font-normal">Vacío</span>
              )}
            </Link>

            {/* Link a Mi Cuenta / Pedidos o Sesión Activa */}
            {customer ? (
              <div className="space-y-1.5">
                <div className="p-3 bg-[#F0F3FF] rounded-xl border border-black/5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-[#0071BC] text-white flex items-center justify-center font-montserrat font-bold text-xs">
                      {customer.fullName.charAt(0)}
                    </span>
                    <div className="truncate">
                      <span className="font-bold text-xs text-[#111C2D] block truncate font-montserrat">{customer.fullName}</span>
                      <span className="text-[10px] text-[#4C4546] truncate block">{customer.email}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      logoutCustomer();
                      setIsMobileMenuOpen(false);
                      router.push("/");
                    }}
                    className="px-2.5 py-1 bg-white border border-red-200 text-red-600 rounded-lg text-[10px] font-bold hover:bg-red-50"
                  >
                    Salir
                  </button>
                </div>
                <Link
                  href="/mi-cuenta/descargas"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white border border-black/5 text-xs font-bold text-[#111C2D] hover:bg-[#F0F3FF] transition font-montserrat"
                >
                  <div className="flex items-center gap-2.5 text-[#0071BC]">
                    <span className="material-symbols-outlined text-base">cloud_download</span>
                    <span>Mis Partituras & Licencias</span>
                  </div>
                  <span className="material-symbols-outlined text-sm text-[#4C4546]/50">chevron_right</span>
                </Link>
                <Link
                  href="/mi-cuenta/descargas?tab=colecciones"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white border border-black/5 text-xs font-bold text-[#111C2D] hover:bg-[#F0F3FF] transition font-montserrat"
                >
                  <div className="flex items-center gap-2.5 text-[#C1272D]">
                    <span className="material-symbols-outlined text-base">bookmark</span>
                    <span>Partituras Guardadas</span>
                  </div>
                  {savedScores.length > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-[#C1272D] text-[10px] font-black font-montserrat">
                      {savedScores.length}
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-sm text-[#4C4546]/50">chevron_right</span>
                  )}
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#F0F3FF] text-xs font-bold text-[#111C2D] hover:bg-slate-200 transition font-montserrat border border-black/5"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg text-[#0071BC]">person</span>
                  <span>Mi Cuenta / Iniciar Sesión</span>
                </div>
                <span className="material-symbols-outlined text-sm text-[#4C4546]/50">chevron_right</span>
              </Link>
            )}
          </div>

          {/* Tarjeta del Portal Compositor */}
          <div className="bg-gradient-to-br from-[#111C2D] to-[#1E293B] text-white p-4 rounded-2xl shadow-md border border-white/10 space-y-3 font-montserrat">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#FBB03B]">
                <span className="material-symbols-outlined text-xl">music_note</span>
                <span className="text-xs font-black uppercase tracking-wider">Espacio Compositor</span>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#FBB03B]/20 text-[#FBB03B] font-bold border border-[#FBB03B]/30 uppercase">
                Wompi API
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
              Publica tus partituras, gestiona derechos de autor y recibe pagos de regalías directo a tu banco.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href="/compositor/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 bg-[#FBB03B] hover:bg-[#e09b2d] text-[#111C2D] text-[11px] font-extrabold uppercase tracking-wider rounded-xl transition text-center shadow-xs block"
              >
                Ingresar
              </Link>
              <Link
                href="/compositor/registro"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[11px] font-bold uppercase tracking-wider rounded-xl transition text-center block"
              >
                Registrarme
              </Link>
            </div>
          </div>

          {/* Configuración Adicional & Soporte */}
          <div className="pt-2 text-[11px] text-[#4C4546] space-y-2 font-montserrat">
            <div className="flex items-center justify-between p-2.5 bg-[#F0F3FF]/60 rounded-xl border border-black/5">
              <span className="font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-[#0071BC]">language</span> Moneda & Idioma:
              </span>
              <span className="font-extrabold text-[#111C2D]">ES | COP ($)</span>
            </div>
            <div className="text-center pt-1 text-[10px] text-[#4C4546]">
              Soporte: <strong className="text-[#0071BC]">soporte@pianocolombia.com</strong>
            </div>
          </div>
        </div>
      </MobileDrawer>
    </>
  );
}
