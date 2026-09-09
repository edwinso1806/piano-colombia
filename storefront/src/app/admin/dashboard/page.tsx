"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAdminDashboardStats, updateGeneralCommission } from "@/lib/api-client";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commissionInput, setCommissionInput] = useState<number>(20);
  const [isUpdatingCommission, setIsUpdatingCommission] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    const data = await getAdminDashboardStats();
    if (data && data.success) {
      setStats(data);
      setCommissionInput(data.defaultCommission || 20);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSaveGeneralCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingCommission(true);
    setNotification(null);
    try {
      const res = await updateGeneralCommission(commissionInput);
      setNotification({
        type: "success",
        message: res.message || `Comisión general actualizada exitosamente al ${commissionInput}%.`,
      });
      fetchStats();
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "Error al actualizar la comisión general.",
      });
    } finally {
      setIsUpdatingCommission(false);
    }
  };

  const pendingComposersCount = stats?.composers?.pendingCount ?? 0;
  const pendingScoresCount = stats?.scores?.pendingCount ?? 0;
  const defaultCommission = stats?.defaultCommission ?? 20;
  const totalSalesCop = stats?.financials?.totalSalesCop ?? 0;
  const totalCommissionCop = stats?.financials?.totalCommissionCop ?? 0;
  const transactionsCount = stats?.financials?.transactionsCount ?? 0;

  const firstPendingComposer = stats?.composers?.pendingList?.[0];
  const firstPendingScore = stats?.scores?.pendingList?.[0];

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
            Consola de supervisión integral de ventas del catálogo, liquidación de comisiones de plataforma ({defaultCommission}%) y moderación de contenidos en tiempo real desde PostgreSQL.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin/compositores"
            className="px-4 py-2.5 bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">person_check</span>
            {pendingComposersCount} {pendingComposersCount === 1 ? "Solicitud Pendiente" : "Solicitudes Pendientes"}
          </Link>
        </div>
      </div>

      {/* Notificación de actualización */}
      {notification && (
        <div
          className={`p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-medium animate-in fade-in duration-200 ${
            notification.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          <span className="material-symbols-outlined text-base shrink-0">
            {notification.type === "success" ? "check_circle" : "error"}
          </span>
          <span>{notification.message}</span>
        </div>
      )}

      {/* Grid Indicadores Globales (4 Bento Cards Conectadas a PostgreSQL) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* 1. Ventas Totales */}
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
              ${totalSalesCop.toLocaleString("es-CO")} <span className="text-xs font-bold text-[#4C4546]">COP</span>
            </div>
            <div className={`flex items-center gap-1 mt-2 text-xs font-bold font-montserrat ${transactionsCount > 0 ? "text-emerald-700" : "text-[#4C4546]"}`}>
              <span className="material-symbols-outlined text-base">
                {transactionsCount > 0 ? "trending_up" : "hourglass_empty"}
              </span>
              <span>
                {transactionsCount > 0
                  ? `${transactionsCount} Transacciones Registradas`
                  : "0 Ventas (Módulo de Pagos en preparación)"}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 bg-[#F0F3FF]/60 -mx-6 -mb-6 px-6 pb-3 rounded-b-2xl border-t border-black/5 text-[11px] text-[#4C4546] font-medium">
            {transactionsCount > 0 ? "Procesadas vía PSE Wompi y Pasarela" : "Catálogo activo • Sin transacciones cobradas aún"}
          </div>
        </div>

        {/* 2. Comisión Neta PC */}
        <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between group hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4C4546] font-montserrat">
                Comisión Neta PC
              </span>
              <span className="px-2 py-0.5 bg-[#FBB03B]/20 text-[#111C2D] text-[10px] font-black rounded-md font-montserrat">
                {defaultCommission}% Fee
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#F0F3FF] flex items-center justify-center text-[#0071BC] group-hover:bg-[#0071BC] group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-xl">account_balance</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black font-montserrat text-[#111C2D] tracking-tight">
              ${totalCommissionCop.toLocaleString("es-CO")} <span className="text-xs font-bold text-[#4C4546]">COP</span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-[#0071BC] text-xs font-bold font-montserrat">
              <span className="material-symbols-outlined text-base">verified</span>
              <span>{totalCommissionCop > 0 ? "Ingresos retenidos de plataforma" : "Sin comisiones liquidadas aún"}</span>
            </div>
          </div>
          <div className="mt-4 pt-3 bg-[#F0F3FF]/60 -mx-6 -mb-6 px-6 pb-3 rounded-b-2xl border-t border-black/5 text-[11px] text-[#4C4546] font-medium">
            Fondo de mantenimiento y servidores
          </div>
        </div>

        {/* 3. Compositores Pendientes */}
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
              {loading ? "..." : pendingComposersCount}{" "}
              <span className="text-xs font-bold text-[#4C4546]">
                {pendingComposersCount === 1 ? "Solicitud" : "Solicitudes"}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-[#0071BC] text-xs font-bold font-montserrat">
              <span>Revisar aprobación de identidad →</span>
            </div>
          </div>
          <div className="mt-4 pt-3 bg-[#F0F3FF]/60 -mx-6 -mb-6 px-6 pb-3 rounded-b-2xl border-t border-black/5 text-[11px] text-[#4C4546] font-medium truncate">
            {firstPendingComposer
              ? `${firstPendingComposer.artistic_name || `${firstPendingComposer.first_name} ${firstPendingComposer.last_name}`} (${firstPendingComposer.email})`
              : "No hay solicitudes pendientes en este momento"}
          </div>
        </Link>

        {/* 4. Partituras Pendientes */}
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
              {loading ? "..." : pendingScoresCount}{" "}
              <span className="text-xs font-bold text-[#4C4546]">
                {pendingScoresCount === 1 ? "Partitura" : "Partituras"}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-[#0071BC] text-xs font-bold font-montserrat">
              <span>Inspeccionar PDFs y opacidad 40% →</span>
            </div>
          </div>
          <div className="mt-4 pt-3 bg-[#F0F3FF]/60 -mx-6 -mb-6 px-6 pb-3 rounded-b-2xl border-t border-black/5 text-[11px] text-[#4C4546] font-medium truncate">
            {firstPendingScore
              ? `${firstPendingScore.title} (${firstPendingScore.composer_name || "Autor"})`
              : "Catálogo al día (sin partituras por moderar)"}
          </div>
        </Link>

      </div>

      {/* SECCIÓN ADMINISTRABLE: GESTIÓN DEL PORCENTAJE DE COMISIÓN DE PLATAFORMA */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#FBB03B] flex items-center justify-center border border-amber-200">
              <span className="material-symbols-outlined text-2xl">percent</span>
            </div>
            <div>
              <h2 className="text-lg font-black font-montserrat text-[#111C2D]">
                Gestión de Comisiones de Plataforma
              </h2>
              <p className="text-xs text-[#4C4546] font-medium">
                Configura el porcentaje general de retención por venta o personaliza acuerdos individuales por compositor.
              </p>
            </div>
          </div>

          <Link
            href="/admin/compositores"
            className="px-4 py-2 bg-[#F0F3FF] hover:bg-[#0071BC] text-[#0071BC] hover:text-white text-xs font-bold rounded-xl transition font-montserrat inline-flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-sm">tune</span>
            Configurar por Compositor
          </Link>
        </div>

        <form onSubmit={handleSaveGeneralCommission} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1 w-full sm:w-auto">
            <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
              Comisión General de Plataforma (%)
            </label>
            <div className="relative max-w-xs">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                required
                value={commissionInput}
                onChange={(e) => setCommissionInput(parseFloat(e.target.value) || 0)}
                className="w-full pl-4 pr-12 py-3 bg-[#F0F3FF] border border-black/10 rounded-xl text-base font-mono font-bold text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#4C4546]">
                %
              </span>
            </div>
            <p className="text-[11px] text-[#4C4546] mt-1.5">
              Este valor se aplica a todos los compositores que no cuenten con una tasa preferencial pactada.
            </p>
          </div>

          <button
            type="submit"
            disabled={isUpdatingCommission}
            className="mt-2 sm:mt-5 px-6 py-3.5 bg-[#111C2D] hover:bg-[#1a2b45] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center gap-2 disabled:opacity-50"
          >
            {isUpdatingCommission ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Guardando en BD...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base text-[#FBB03B]">save</span>
                Actualizar Comisión General
              </>
            )}
          </button>
        </form>
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
