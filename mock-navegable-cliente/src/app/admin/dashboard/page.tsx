"use client";

import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8 text-[#111C2D]">
      
      {/* Header Principal de la Consola */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F3FF] border border-[#0071BC]/10 text-[#0071BC] text-[11px] font-extrabold uppercase tracking-wider mb-2 font-montserrat">
            <span className="material-symbols-outlined text-xs">admin_panel_settings</span>
            Consola Global • Panel Administrativo
          </div>
          <h1 className="text-3xl font-black font-montserrat text-[#111C2D] tracking-tight">
            Tablero General de Administración
          </h1>
          <p className="text-xs md:text-sm text-[#4C4546] font-medium max-w-2xl leading-relaxed">
            Consola de supervisión integral de ventas del catálogo, liquidación de comisiones de plataforma (20%) y moderación de contenidos.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin/compositores"
            className="px-4 py-2.5 bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">person_check</span>
            1 Solicitud Pendiente
          </Link>
        </div>
      </div>

      {/* Grid Indicadores Globales (4 Bento Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between group hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4C4546] font-montserrat">
              Ventas Totales Plataforma
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#F0F3FF] flex items-center justify-center text-[#111C2D] group-hover:bg-[#111C2D] group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-xl">payments</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black font-montserrat text-[#111C2D] tracking-tight">
              $8.450.000 <span className="text-xs font-bold text-[#4C4546]">COP</span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-emerald-700 text-xs font-bold font-montserrat">
              <span className="material-symbols-outlined text-base">trending_up</span>
              <span>188 Transacciones Exitosas</span>
            </div>
          </div>
          <div className="mt-4 pt-3 bg-[#F0F3FF]/60 -mx-6 -mb-6 px-6 pb-3 rounded-b-2xl border-t border-black/5 text-[11px] text-[#4C4546] font-medium">
            Procesadas vía PSE Wompi y PayPal
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between group hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4C4546] font-montserrat">
                Comisión Neta PC
              </span>
              <span className="px-2 py-0.5 bg-[#FBB03B]/20 text-[#111C2D] text-[10px] font-black rounded-md font-montserrat">
                20% Fee
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#F0F3FF] flex items-center justify-center text-[#0071BC] group-hover:bg-[#0071BC] group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-xl">account_balance</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black font-montserrat text-[#111C2D] tracking-tight">
              $1.690.000 <span className="text-xs font-bold text-[#4C4546]">COP</span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-[#0071BC] text-xs font-bold font-montserrat">
              <span className="material-symbols-outlined text-base">verified</span>
              <span>Ingresos retenidos de plataforma</span>
            </div>
          </div>
          <div className="mt-4 pt-3 bg-[#F0F3FF]/60 -mx-6 -mb-6 px-6 pb-3 rounded-b-2xl border-t border-black/5 text-[11px] text-[#4C4546] font-medium">
            Fondo de mantenimiento y servidores
          </div>
        </div>

        <Link
          href="/admin/compositores"
          className="p-6 bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between group hover:shadow-lg transition-all relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#FBB03B]"></div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4C4546] font-montserrat">
              Compositores Pendientes
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#FBB03B] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-xl">person_add</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black font-montserrat text-[#111C2D] tracking-tight">
              1 <span className="text-xs font-bold text-[#4C4546]">Solicitud</span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-[#0071BC] text-xs font-bold font-montserrat">
              <span>Revisar aprobación de identidad →</span>
            </div>
          </div>
          <div className="mt-4 pt-3 bg-[#F0F3FF]/60 -mx-6 -mb-6 px-6 pb-3 rounded-b-2xl border-t border-black/5 text-[11px] text-[#4C4546] font-medium">
            Guillermo Uribe Holguín (CC 19283746)
          </div>
        </Link>

        <Link
          href="/admin/partituras"
          className="p-6 bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between group hover:shadow-lg transition-all relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#0071BC]"></div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4C4546] font-montserrat">
              Partituras Pendientes
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#F0F3FF] text-[#0071BC] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-xl">library_music</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black font-montserrat text-[#111C2D] tracking-tight">
              2 <span className="text-xs font-bold text-[#4C4546]">Partituras</span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-[#0071BC] text-xs font-bold font-montserrat">
              <span>Inspeccionar PDFs y opacidad 40% →</span>
            </div>
          </div>
          <div className="mt-4 pt-3 bg-[#F0F3FF]/60 -mx-6 -mb-6 px-6 pb-3 rounded-b-2xl border-t border-black/5 text-[11px] text-[#4C4546] font-medium">
            Suite Fantasía Colombiana (Mvt. 1)
          </div>
        </Link>

      </div>

      {/* Accesos Rápidos Módulos Administrativos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-4 hover:shadow-lg transition-all">
          <div className="w-12 h-12 rounded-2xl bg-[#F0F3FF] text-[#0071BC] flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">web</span>
          </div>
          <div>
            <h2 className="text-base font-bold font-montserrat text-[#111C2D]">Gestor de Banners Hero</h2>
            <p className="text-xs text-[#4C4546] mt-1 leading-relaxed">
              Administra las diapositivas del carrusel de la página de inicio, subtítulos y botones de llamada a la acción.
            </p>
          </div>
          <Link
            href="/admin/cms"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#0071BC] hover:underline font-montserrat"
          >
            Gestionar Banners <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-4 hover:shadow-lg transition-all">
          <div className="w-12 h-12 rounded-2xl bg-[#F0F3FF] text-[#FBB03B] flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">folder_open</span>
          </div>
          <div>
            <h2 className="text-base font-bold font-montserrat text-[#111C2D]">Categorías & Menús</h2>
            <p className="text-xs text-[#4C4546] mt-1 leading-relaxed">
              Modifica las familias pianísticas del catálogo, menús del Header y textos de las páginas legales (T&C).
            </p>
          </div>
          <Link
            href="/admin/cms"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#0071BC] hover:underline font-montserrat"
          >
            Gestionar Categorías <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-4 hover:shadow-lg transition-all">
          <div className="w-12 h-12 rounded-2xl bg-[#F0F3FF] text-[#C1272D] flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">mail</span>
          </div>
          <div>
            <h2 className="text-base font-bold font-montserrat text-[#111C2D]">Notificaciones por Email</h2>
            <p className="text-xs text-[#4C4546] mt-1 leading-relaxed">
              Inspecciona las plantillas HTML transaccionales del motor de correos Resend para compradores y autores.
            </p>
          </div>
          <Link
            href="/admin/emails"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#0071BC] hover:underline font-montserrat"
          >
            Ver Plantillas de Email <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

      </div>

    </div>
  );
}
