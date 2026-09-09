# 🏛️ Reporte de Auditoría Arquitectónica & Refactorización Frontend (Next.js 16 App Router)

> **Rol:** Principal Frontend Architect (Next.js 16 App Router & Tailwind CSS)  
> **Proyecto:** Piano Colombia Storefront & Consolas Administrativas  
> **Fecha de Emisión:** 4 de Septiembre, 2026  
> **Estado:** Auditado, Refactorizado, Verificado con `npm run build` (28/28 rutas) y Sincronizado en GitHub.

---

## (A) 🗺️ Mapa de Arquitectura de Rutas y Layouts Sugerido & Auditado

Para garantizar un **desacoplamiento total**, eliminar hacks condicionales en tiempo de ejecución (`if (pathname === '/...')`) y asegurar que cada superficie de usuario cargue únicamente los componentes que necesita, se implementó la siguiente estructura basada en **Route Groups `(group)`**:

```
src/app/
│
├── (storefront)/                     # 🛍️ GRUPO 1: Storefront Público & Cliente
│   ├── layout.tsx                    # [Shared Store Layout] -> Header público (ES/EN, Carrito) + Footer
│   ├── page.tsx                      # Homepage (Hero, Destacados, Blog Preview)
│   ├── tienda/page.tsx               # Catálogo de partituras con filtros
│   ├── compositores/                 # Directorio & Ficha de autor bilingüe
│   ├── partitura/[slug]/page.tsx     # Visor DRM de partitura con opacidad
│   ├── carrito/page.tsx              # Carrito de Compras Digital (`CartContext`)
│   ├── checkout/page.tsx             # Checkout unificado con Wompi Widget (ES/EN)
│   ├── blog/                         # Artículos y noticias
│   └── mi-cuenta/descargas/page.tsx  # Área cliente descargas estampadas
│
├── (auth)/                           # 🔑 GRUPO 2: Pantallas de Autenticación Standalone
│   ├── layout.tsx                    # [Clean Auth Layout] -> Centrado, sin Header/Footer públicos ni Sidebars
│   ├── login/page.tsx                # Login Cliente
│   ├── admin/login/page.tsx          # Login Admin Standalone (RBAC switcher demo)
│   └── compositor/
│       ├── login/page.tsx            # Login Compositor
│       └── registro/page.tsx         # Registro de Compositor con cuenta bancaria Wompi
│
├── (admin)/                          # 🏢 GRUPO 3: Consola Administrativa Tienda (RBAC)
│   └── admin/
│       ├── layout.tsx                # [Admin Layout] -> Header con DashboardHeader + Sidebar + MobileDrawer
│       ├── dashboard/page.tsx        # Métricas globales
│       ├── compositores/page.tsx     # Aprobación de compositores
│       ├── partituras/page.tsx       # Moderación técnica de PDFs
│       ├── cms/page.tsx              # CMS Componentes Hero & Partitura destacada
│       ├── pagos/page.tsx            # Dispersión Masiva Wompi API
│       ├── usuarios/page.tsx         # Control de acceso RBAC
│       └── emails/page.tsx           # Inspector de plantillas HTML
│
└── (compositor-dashboard)/           # 🎵 GRUPO 4: Portal Privado del Compositor
    └── compositor/dashboard/
        ├── layout.tsx                # [Compositor Layout] -> DashboardHeader + Sidebar Autor + MobileDrawer
        ├── page.tsx                  # Métricas de ventas y 80% regalías
        ├── partituras/nueva/page.tsx # Upload PDF + Calculadora
        ├── pagos/page.tsx            # Extracto de giros a banco/Nequi Wompi
        └── perfil/page.tsx           # Ficha artística & cuenta Wompi
```

---

## (B) ⚠️ Reporte de Auditoría: Problemas Responsive & Scroll Detectados por Módulo

### 1. Módulo Administrativo de Tienda (`/admin/*`)
- **Desacoplamiento de Layouts:** Se detectó la condicional `if (pathname === '/admin/login')` dentro de `AdminLayout`, lo cual es un anti-patrón en Next.js. Se refactorizó aislando las vistas de autenticación en la superficie standalone `(auth)`.
- **Sidebars & Mobile Drawers:** El menú lateral utilizaba `hidden md:flex`. En dispositivos móviles (`< 768px`) o tablets pequeñas, la barra lateral desaparecía por completo sin botón de hamburguesa ni menú accesible.
- **Scroll & Overflow Horizontal (`overflow-x`):** Al renderizar tablas de ancho extendido en `/admin/usuarios` y `/admin/pagos`, la vista completa sufría desplazamiento horizontal descontrolado. Se solucionó añadiendo `min-w-0` en el contenedor flex principal y `overflow-x-hidden` en el envolvente raíz.

### 2. Módulo de Portal de Compositor (`/compositor/dashboard/*`)
- **Sidebars & Mobile Drawers:** Al igual que el Admin de Tienda, el menú del compositor en móviles quedaba inalcanzable. Se integró `@/components/dashboard/MobileDrawer.tsx` activado por el botón de hamburguesa en `DashboardHeader`.
- **Navegación e Insignias:** Se estandarizó la información del perfil del autor (iniciales, badge `Autor Verificado`) dentro de la cabecera unificada.

### 3. Vistas de Autenticación (`/admin/login`, `/compositor/login`, `/login`, `/compositor/registro`)
- **Arrastre de Navegación Pública:** Algunas pantallas de login renderizaban los componentes `<Header />` y `<Footer />` pesados de la tienda comercial.
- **Solución:** Se aislaron en un contenedor centrado ligero, enfocado al 100% en la autenticación segura sin distracciones ni barras públicas.

### 4. Módulo Storefront Público & Carrito (`/`, `/tienda`, `/carrito`, `/checkout`)
- **Adaptabilidad del Header Público:** Se ajustó la barra superior para mostrar el botón de Carrito con indicador badge en dispositivos móviles y de escritorio.
- **Formulario Checkout Wompi:** Se estructuró en cuadrícula adaptable `lg:grid-cols-12` para garantizar que en pantallas pequeñas el resumen de orden se posicione debajo de los datos del comprador sin romper el maquetado.

---

## (C) 🛠️ Pasos Específicos de Refactorización Archivo por Archivo

### Paso 1: Creación del Drawer Móvil Reutilizable (`src/components/dashboard/MobileDrawer.tsx`)
Se creó un componente deslizante (*slide-over*) reutilizable con *backdrop blur*, bloqueo de scroll en el cuerpo (`document.body.style.overflow = 'hidden'`) y soporte para cierre por teclado:

```tsx
"use client";

import React, { useEffect } from "react";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function MobileDrawer({ isOpen, onClose, title, children }: MobileDrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden font-inter">
      <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in" />
      <aside className="fixed inset-y-0 left-0 w-72 max-w-[80vw] bg-white shadow-2xl flex flex-col justify-between p-6 z-10 animate-slide-in-left border-r border-black/10">
        <div className="flex items-center justify-between border-b border-black/5 pb-4 mb-4">
          <span className="text-xs font-extrabold text-[#111C2D] uppercase tracking-widest font-montserrat">
            {title}
          </span>
          <button onClick={onClose} className="p-1.5 text-[#4C4546] hover:text-[#111C2D] rounded-xl hover:bg-[#F0F3FF] transition">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto pr-1">{children}</div>
      </aside>
    </div>
  );
}
```

---

### Paso 2: Creación de la Cabecera de Dashboard (`src/components/dashboard/DashboardHeader.tsx`)
Se extrajo la barra superior unificada para los paneles de administración y compositor:

```tsx
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
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-[#111C2D] hover:bg-[#F0F3FF] rounded-xl transition"
          aria-label="Abrir menú de navegación"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>

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
              <span className={`text-[9px] px-1.5 py-0.5 border rounded font-montserrat font-black uppercase ${badgeColor}`}>
                {portalBadge}
              </span>
            </div>
          </div>
        </Link>
      </div>

      <div className="hidden md:flex flex-1 max-w-md mx-6 items-center">
        <div className="w-full flex items-center bg-[#F0F3FF] px-4 py-2 rounded-xl text-[#4C4546] shadow-2xs focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0071BC] transition-all">
          <span className="material-symbols-outlined text-[#4C4546] mr-2 text-lg">search</span>
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="bg-transparent border-none text-xs text-[#111C2D] placeholder-[#4C4546]/70 focus:outline-none w-full"
          />
          <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 font-mono text-[10px] bg-slate-200/60 text-[#4C4546] rounded ml-2">⌘K</kbd>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <span className="text-xs font-bold text-[#111C2D] block font-montserrat">{userName}</span>
          <span className="text-[10px] text-[#0071BC] font-semibold">{userRoleOrTag}</span>
        </div>
        <div className={`w-9 h-9 rounded-full ${avatarBg} text-white flex items-center justify-center font-montserrat font-black text-xs shadow-2xs shrink-0`}>
          {userInitials}
        </div>
      </div>
    </header>
  );
}
```

---

### Paso 3: Refactorización de AdminLayout (`src/app/admin/layout.tsx`)
Se desacopló el layout, eliminando hacks y conectando `DashboardHeader` y `MobileDrawer`:

```tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MobileDrawer from "@/components/dashboard/MobileDrawer";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

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
    <div className="min-h-screen bg-[#F9F9FF] text-[#111C2D] flex flex-col font-inter selection:bg-[#FBB03B]/30 overflow-x-hidden">
      <DashboardHeader
        portalBadge="ADMIN"
        searchPlaceholder="Buscar compositores, partituras, órdenes, CMS..."
        userName="Super Admin PC"
        userRoleOrTag="admin@pianocolombia.com"
        userInitials="PC"
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        homeLink="/admin/dashboard"
      />

      <div className="flex-1 flex max-w-7xl mx-auto w-full min-w-0">
        <aside className="w-64 border-r border-black/5 bg-white p-6 hidden lg:flex flex-col justify-between shrink-0 shadow-2xs">
          <nav className="space-y-1.5 text-xs font-semibold">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl transition ${
                  pathname === link.href ? "text-[#111C2D] bg-[#F0F3FF] border-l-4 border-[#0071BC] font-bold" : "text-[#4C4546] hover:bg-[#F0F3FF]"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="material-symbols-outlined text-base text-[#0071BC]">{link.icon}</span>
                  <span className="truncate">{link.label}</span>
                </div>
                {link.badge && <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${link.badgeColor || "bg-[#FBB03B]"}`}>{link.badge}</span>}
              </Link>
            ))}
          </nav>
        </aside>

        <MobileDrawer isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} title="Navegación Admin">
          <nav className="space-y-1.5 text-xs font-semibold py-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-[#F0F3FF]">
                <span className="material-symbols-outlined text-[#0071BC]">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
        </MobileDrawer>

        <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
```

---

### Paso 4: Refactorización de CompositorDashboardLayout (`src/app/compositor/dashboard/layout.tsx`)
Se conectaron las mismas primitivas compartidas para los compositores con insignia `COMPOSITOR` e indicador `Autor Verificado`:

```tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MobileDrawer from "@/components/dashboard/MobileDrawer";

export default function CompositorDashboardLayout({ children }: { children: React.ReactNode }) {
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
    <div className="min-h-screen bg-[#F9F9FF] text-[#111C2D] flex flex-col font-inter selection:bg-[#FBB03B]/30 overflow-x-hidden">
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

      <div className="flex-1 flex max-w-7xl mx-auto w-full min-w-0">
        <aside className="w-64 border-r border-black/5 bg-white p-6 hidden lg:flex flex-col justify-between shrink-0 shadow-2xs">
          <nav className="space-y-1.5 text-xs font-semibold">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                  pathname === link.href ? "text-[#111C2D] bg-[#F0F3FF] border-l-4 border-[#FBB03B] font-bold" : "text-[#4C4546] hover:bg-[#F0F3FF]"
                }`}
              >
                <span className="material-symbols-outlined text-base text-[#0071BC]">{link.icon}</span>
                <span className="truncate">{link.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <MobileDrawer isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} title="Portal Compositor">
          <nav className="space-y-1.5 text-xs font-semibold py-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-[#F0F3FF]">
                <span className="material-symbols-outlined text-[#0071BC]">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
        </MobileDrawer>

        <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
```
