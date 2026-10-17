"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAdminPayoutsApi, executeAdminDispersionApi } from "@/lib/api-client";

interface ComposerPayout {
  id: string;
  composerId?: string;
  composerName: string;
  email?: string;
  bankName: string;
  accountType: "Ahorros" | "Corriente" | "Bolsillo Nequi" | "Bolsillo Daviplata" | string;
  accountNumber: string;
  taxId: string; // CC / NIT
  totalSalesCount: number;
  grossSalesCOP: number;
  platformFeeCOP: number;
  netEarningsCOP: number;
  status: "pending" | "paid" | "processing";
  wompiVerified: boolean;
  commissionPercentage?: number;
  lifetimePaidGrossCOP?: number;
  lifetimePaidNetCOP?: number;
}

interface DisbursementBatch {
  batchId: string;
  date: string;
  composersCount: number;
  totalAmountCOP: number;
  status: "completed" | "processing" | string;
  executedBy: string;
  wompiBatchTransactionId: string;
}

export default function AdminPagosPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [isDispersionModalOpen, setIsDispersionModalOpen] = useState(false);
  const [isProcessingDispersion, setIsProcessingDispersion] = useState(false);
  const [dispersionComplete, setDispersionComplete] = useState(false);
  const [lastExecutedBatch, setLastExecutedBatch] = useState<any>(null);
  const [lastExecutedItems, setLastExecutedItems] = useState<any[]>([]);
  const [lastPabContent, setLastPabContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dispersionError, setDispersionError] = useState<string | null>(null);

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");

  const formatCOP = (val: number) => (val || 0).toLocaleString("es-CO");

  const [payouts, setPayouts] = useState<ComposerPayout[]>([]);
  const [history, setHistory] = useState<DisbursementBatch[]>([]);

  const loadLivePayouts = async () => {
    setIsLoading(true);
    try {
      const data = await getAdminPayoutsApi();
      if (data && data.success) {
        setPayouts(data.pendingPayouts || []);
        setHistory(data.batches || []);
      }
    } catch (err) {
      console.warn("Fallo cargando liquidaciones en vivo de Medusa:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLivePayouts();
  }, []);

  const totalGrossCOP = payouts.reduce((acc, curr) => acc + curr.grossSalesCOP, 0);
  const totalPlatformFeeCOP = payouts.reduce((acc, curr) => acc + curr.platformFeeCOP, 0);
  const totalPendingCOP = payouts.reduce((acc, curr) => acc + curr.netEarningsCOP, 0);
  const totalDisbursedHistoricCOP = history.reduce((acc, curr) => acc + (curr.totalAmountCOP || 0), 0);

  const filteredPayouts = payouts.filter((p) =>
    p.composerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.taxId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExecuteDispersion = async () => {
    if (payouts.length === 0) return;
    setIsProcessingDispersion(true);
    setDispersionError(null);

    try {
      const itemsToDisperse = [...payouts];
      const data = await executeAdminDispersionApi(itemsToDisperse, "Super Admin PC");
      if (data && data.success) {
        setLastExecutedBatch(data.batch);
        setLastExecutedItems(itemsToDisperse);
        setLastPabContent(data.pabContent || null);
        setDispersionComplete(true);
        await loadLivePayouts();
      } else {
        setDispersionError(data?.message || "No se pudo completar la dispersión.");
      }
    } catch (err: any) {
      console.error("Fallo al ejecutar dispersión masiva:", err);
      setDispersionError(err.message || "Error al conectar con la API de dispersión");
    } finally {
      setIsProcessingDispersion(false);
    }
  };

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

  const handleDownloadPAB = (batchId?: string) => {
    const bId = (typeof batchId === "string" ? batchId : null) || lastExecutedBatch?.batchNumber || lastExecutedBatch?.id || "BATCH-2026-10-243";
    window.location.href = `${MEDUSA_URL}/admin/payouts/download?batch_id=${encodeURIComponent(bId)}&format=pab`;
  };

  const handleDownloadCSV = (batchId?: string) => {
    const bId = (typeof batchId === "string" ? batchId : null) || lastExecutedBatch?.batchNumber || lastExecutedBatch?.id || "BATCH-2026-10-243";
    window.location.href = `${MEDUSA_URL}/admin/payouts/download?batch_id=${encodeURIComponent(bId)}&format=csv`;
  };

  return (
    <div className="space-y-8 font-inter">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-black/5 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#0071BC] font-montserrat font-bold mb-1">
            <span className="material-symbols-outlined text-sm">payments</span>
            <span>MÓDULO FINANCIERO & TESORERÍA</span>
          </div>
          <h1 className="text-2xl font-black text-[#111C2D] font-montserrat tracking-tight">
            Dispersión Masiva de Regalías
          </h1>
          <p className="text-xs text-[#4C4546] mt-1 max-w-2xl">
            Liquidación centralizada de regalías para compositores y comisión Piano Colombia. Transferencia directa a cuentas bancarias nacionales, Nequi y Daviplata vía Wompi con notificación por correo y soporte de plano bancario PAB.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => loadLivePayouts()}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-3 bg-[#F0F3FF] hover:bg-[#e4ebfc] text-[#0071BC] text-xs font-montserrat font-bold rounded-xl transition"
            title="Refrescar datos en vivo de la base de datos"
          >
            <span className={`material-symbols-outlined text-base ${isLoading ? "animate-spin" : ""}`}>
              sync
            </span>
            <span>Actualizar</span>
          </button>

          <button
            onClick={() => {
              setDispersionError(null);
              setDispersionComplete(false);
              setIsDispersionModalOpen(true);
            }}
            disabled={payouts.length === 0 || isLoading}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#0071BC] hover:bg-[#005996] disabled:bg-slate-300 text-white text-xs font-montserrat font-extrabold rounded-xl shadow-md transition-all active:scale-95 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-base">bolt</span>
            <span>Ejecutar Dispersión Wompi ({payouts.length})</span>
          </button>
        </div>
      </div>

      {/* Financial KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Ventas Brutas Pendientes */}
        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-xs">
          <span className="text-[11px] font-extrabold text-[#4C4546] uppercase font-montserrat tracking-wider block mb-1">
            Ventas Pendientes de Giro
          </span>
          <div className="text-2xl font-black text-[#111C2D] font-montserrat">
            $ {formatCOP(totalGrossCOP)} COP
          </div>
          <span className="text-[11px] text-[#4C4546] font-medium block mt-2">
            {payouts.reduce((acc, curr) => acc + curr.totalSalesCount, 0)} partituras vendidas pendientes
          </span>
        </div>

        {/* KPI 2: Comisión Piano Colombia */}
        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-xs border-l-4 border-l-[#0071BC]">
          <span className="text-[11px] font-extrabold text-[#4C4546] uppercase font-montserrat tracking-wider block mb-1">
            Comisión Piano Colombia
          </span>
          <div className="text-2xl font-black text-[#0071BC] font-montserrat">
            $ {formatCOP(totalPlatformFeeCOP)} COP
          </div>
          <span className="text-[11px] text-[#4C4546] font-medium block mt-2">
            Mantenimiento & Licencias DRM
          </span>
        </div>

        {/* KPI 3: Saldo Neto Pendiente Compositores */}
        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-xs border-l-4 border-l-[#FBB03B]">
          <span className="text-[11px] font-extrabold text-[#4C4546] uppercase font-montserrat tracking-wider block mb-1">
            Saldo Neto Compositores
          </span>
          <div className="text-2xl font-black text-[#111C2D] font-montserrat">
            $ {formatCOP(totalPendingCOP)} COP
          </div>
          <span className="text-[11px] text-[#FBB03B] font-bold font-montserrat block mt-2">
            {payouts.length} compositores con saldo pendiente
          </span>
        </div>

        {/* KPI 4: Histórico Dispersado */}
        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-xs border-l-4 border-l-emerald-600">
          <span className="text-[11px] font-extrabold text-[#4C4546] uppercase font-montserrat tracking-wider block mb-1">
            Total Dispersado Histórico
          </span>
          <div className="text-xl font-black text-emerald-800 font-montserrat">
            $ {formatCOP(totalDisbursedHistoricCOP)} COP
          </div>
          <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-2">
            <span className="material-symbols-outlined text-sm">history</span>
            <span>{history.length} lotes procesados en total</span>
          </span>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-black/5 pb-3">
          {/* Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-2 rounded-xl text-xs font-montserrat font-bold transition ${
                activeTab === "pending"
                  ? "bg-[#0071BC] text-white shadow-xs"
                  : "bg-[#F0F3FF] text-[#4C4546] hover:text-[#111C2D]"
              }`}
            >
              Compositores Pendientes por Pago ({payouts.filter((p) => p.status === "pending").length})
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 rounded-xl text-xs font-montserrat font-bold transition ${
                activeTab === "history"
                  ? "bg-[#0071BC] text-white shadow-xs"
                  : "bg-[#F0F3FF] text-[#4C4546] hover:text-[#111C2D]"
              }`}
            >
              Historial de Dispersiones ({history.length})
            </button>
          </div>

          {/* Search bar */}
          {activeTab === "pending" && (
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-2 text-[#4C4546] text-base">
                search
              </span>
              <input
                type="text"
                placeholder="Buscar por nombre, banco o CC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#F0F3FF] border-none rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#111C2D] placeholder-[#4C4546]/70 focus:ring-2 focus:ring-[#0071BC] outline-none"
              />
            </div>
          )}
        </div>

        {/* Tab Content 1: Pending Payouts */}
        {activeTab === "pending" && (
          <div className="w-full overflow-x-auto overscroll-x-contain">
            {isLoading ? (
              <div className="py-16 text-center space-y-3">
                <span className="w-8 h-8 border-3 border-[#0071BC] border-t-transparent rounded-full animate-spin inline-block"></span>
                <p className="text-xs text-[#4C4546] font-montserrat">
                  Calculando liquidaciones reales de ventas...
                </p>
              </div>
            ) : filteredPayouts.length === 0 ? (
              payouts.length > 0 ? (
                <div className="py-16 text-center space-y-4 max-w-md mx-auto">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-2xl">search_off</span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold font-montserrat text-[#111C2D]">
                      Sin coincidencias en liquidaciones pendientes
                    </h4>
                    {searchTerm.trim() && (
                      <div className="pt-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#0071BC]/10 text-[#0071BC] text-[11px] font-bold">
                          Búsqueda: "{searchTerm.trim()}"
                        </span>
                      </div>
                    )}
                    <p className="text-xs text-[#4C4546] leading-relaxed pt-1">
                      Hay {payouts.length} liquidación{payouts.length > 1 ? "es" : ""} pendiente{payouts.length > 1 ? "s" : ""} registrada{payouts.length > 1 ? "s" : ""}, pero ninguna coincide con el término buscado.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0071BC] hover:bg-[#005a96] text-white font-bold text-xs font-montserrat transition cursor-pointer shadow-2xs active:scale-95"
                  >
                    <span className="material-symbols-outlined text-sm">restart_alt</span>
                    <span>Limpiar búsqueda ({payouts.length})</span>
                  </button>
                </div>
              ) : (
                <div className="py-16 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-2xl">check_circle</span>
                  </div>
                  <h4 className="text-sm font-bold font-montserrat text-[#111C2D]">
                    No hay saldos pendientes por dispersar
                  </h4>
                  <p className="text-xs text-[#4C4546] max-w-sm mx-auto">
                    Todas las compras registradas han sido dispersadas o aún no hay nuevas ventas pendientes de liquidación.
                  </p>
                </div>
              )
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F0F3FF]/70 border-b border-black/5 text-[11px] font-montserrat font-extrabold text-[#4C4546] uppercase tracking-wider">
                    <th className="py-3 px-4">Compositor</th>
                    <th className="py-3 px-4">Cuenta Bancaria Registrada</th>
                    <th className="py-3 px-4">Documento Identidad</th>
                    <th className="py-3 px-4 text-center">Partituras</th>
                    <th className="py-3 px-4 text-right">Venta Bruta</th>
                    <th className="py-3 px-4 text-right">Comisión PC</th>
                    <th className="py-3 px-4 text-right">Neto a Transferir</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-xs text-[#111C2D]">
                  {filteredPayouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-[#F9F9FF] transition-colors">
                      {/* Compositor */}
                      <td className="py-3.5 px-4 font-montserrat font-extrabold text-[#111C2D]">
                        <div>{payout.composerName}</div>
                        {payout.email && (
                          <div className="text-[11px] font-normal text-[#4C4546]">{payout.email}</div>
                        )}
                      </td>

                      {/* Bank Account / Wompi */}
                      <td className="py-3.5 px-4">
                        <div className="font-montserrat text-xs text-[#0071BC] font-bold">
                          {payout.bankName} ({payout.accountType})
                        </div>
                        <div className="text-[11px] font-mono text-[#4C4546]">{payout.accountNumber}</div>
                      </td>

                      {/* Tax ID */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#4C4546]">
                        {payout.taxId}
                      </td>

                      {/* Ventas Count */}
                      <td className="py-3.5 px-4 text-center font-bold">
                        {payout.totalSalesCount}
                      </td>

                      {/* Gross */}
                      <td className="py-3.5 px-4 text-right text-[#4C4546]">
                        $ {formatCOP(payout.grossSalesCOP)} COP
                      </td>

                      {/* Platform Fee */}
                      <td className="py-3.5 px-4 text-right text-[#C1272D] font-mono">
                        -$ {formatCOP(payout.platformFeeCOP)} COP
                        <span className="block text-[10px] text-[#4C4546]">
                          ({payout.commissionPercentage ?? 15}%)
                        </span>
                      </td>

                      {/* Net Earnings */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-montserrat font-black text-sm text-[#111C2D] block">
                          $ {formatCOP(payout.netEarningsCOP)} COP
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {payout.status === "paid" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-montserrat font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="material-symbols-outlined text-xs">done_all</span>
                            <span>Transferido</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-montserrat font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            <span>Pendiente</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab Content 2: History */}
        {activeTab === "history" && (
          <div className="w-full overflow-x-auto overscroll-x-contain">
            {history.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-[#4C4546] flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-2xl">history_toggle_off</span>
                </div>
                <h4 className="text-sm font-bold font-montserrat text-[#111C2D]">
                  No se han registrado dispersiones previas
                </h4>
                <p className="text-xs text-[#4C4546] max-w-sm mx-auto">
                  Cuando ejecutes un lote de pago vía Wompi, el registro de la transacción y sus comprobantes aparecerán aquí.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F0F3FF]/70 border-b border-black/5 text-[11px] font-montserrat font-extrabold text-[#4C4546] uppercase tracking-wider">
                    <th className="py-3 px-4">Lote / Wompi Batch ID</th>
                    <th className="py-3 px-4">Fecha Ejecución</th>
                    <th className="py-3 px-4 text-center">Compositores Pagados</th>
                    <th className="py-3 px-4 text-right">Monto Total Neto COP</th>
                    <th className="py-3 px-4">Ejecutado Por</th>
                    <th className="py-3 px-4 text-center">Archivos de Descarga</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-xs text-[#111C2D]">
                  {history.map((batch) => (
                    <tr key={batch.batchId} className="hover:bg-[#F9F9FF] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#0071BC]">
                        {batch.batchId}
                        <div className="text-[10px] text-[#4C4546] font-normal">{batch.wompiBatchTransactionId}</div>
                      </td>
                      <td className="py-3.5 px-4 text-[#4C4546]">{batch.date}</td>
                      <td className="py-3.5 px-4 text-center font-bold">
                        {batch.composersCount} compositores
                      </td>
                      <td className="py-3.5 px-4 text-right font-montserrat font-extrabold text-emerald-800">
                        $ {batch.totalAmountCOP.toLocaleString()} COP
                      </td>
                      <td className="py-3.5 px-4 text-[#4C4546] text-[11px]">{batch.executedBy}</td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDownloadPAB(batch.batchId)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#111C2D] text-[11px] font-montserrat font-bold transition cursor-pointer"
                            title="Descargar Plano Bancario PAB (.txt)"
                          >
                            <span className="material-symbols-outlined text-xs">description</span>
                            <span>Plano PAB</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadCSV(batch.batchId)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#F0F3FF] hover:bg-[#e4ebfc] text-[#0071BC] text-[11px] font-montserrat font-bold transition cursor-pointer"
                            title="Descargar Reporte CSV (.csv)"
                          >
                            <span className="material-symbols-outlined text-xs">table_view</span>
                            <span>Comprobante</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Wompi Dispersión Modal */}
      {isDispersionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl border border-black/10 animate-fade-in space-y-6">
            <div className="flex items-center justify-between border-b border-black/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <div>
                  <h3 className="font-montserrat font-black text-lg text-[#111C2D]">
                    Dispersión de Fondos a Compositores
                  </h3>
                  <p className="text-xs text-[#4C4546]">Lote de Pago Directo a Cuentas Bancarias / Nequi</p>
                </div>
              </div>
              <button
                onClick={() => setIsDispersionModalOpen(false)}
                className="text-[#4C4546] hover:text-[#111C2D] p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {!dispersionComplete ? (
              <div className="space-y-4 text-xs">
                {dispersionError && (
                  <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-700 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">error</span>
                    <span>{dispersionError}</span>
                  </div>
                )}

                <div className="bg-[#F0F3FF] p-4 rounded-2xl border border-black/5 space-y-2">
                  <div className="flex justify-between font-montserrat font-bold text-[#111C2D]">
                    <span>Compositores a Liquidar:</span>
                    <span>{payouts.length} cuentas registradas</span>
                  </div>
                  <div className="flex justify-between font-montserrat font-bold text-[#111C2D]">
                    <span>Monto Total a Dispersar:</span>
                    <span className="text-emerald-800 text-sm">$ {formatCOP(totalPendingCOP)} COP</span>
                  </div>
                </div>

                {/* List preview */}
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 border border-black/5 rounded-xl p-3 bg-slate-50">
                  {payouts.map((p) => (
                    <div key={p.id} className="flex justify-between text-[11px] text-[#4C4546]">
                      <span className="font-semibold text-[#111C2D]">
                        {p.composerName} ({p.bankName} - {p.accountNumber})
                      </span>
                      <span className="font-mono text-emerald-700 font-bold">
                        $ {formatCOP(p.netEarningsCOP)} COP
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                  <span className="material-symbols-outlined text-base text-amber-700 shrink-0 mt-0.5">
                    warning
                  </span>
                  <p>
                    <strong>Confirmación de Tesorería:</strong> Esta acción creará un lote oficial de liquidación (`payout_batch`) en PostgreSQL, procesará la transferencia electrónica masiva a través de Wompi y enviará comprobantes de pago por correo a los compositores.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/5">
                  <button
                    type="button"
                    onClick={() => setIsDispersionModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-montserrat font-bold text-[#4C4546] hover:bg-[#F0F3FF] rounded-xl transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={isProcessingDispersion || payouts.length === 0}
                    onClick={handleExecuteDispersion}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-montserrat font-extrabold rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
                  >
                    {isProcessingDispersion ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Procesando Dispersión...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">send</span>
                        <span>Confirmar & Dispersar Fondos</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-md">
                  <span className="material-symbols-outlined text-3xl">check_circle</span>
                </div>
                <div>
                  <h4 className="font-montserrat font-black text-lg text-[#111C2D]">
                    Dispersión Procesada Exitosamente
                  </h4>
                  <p className="text-xs text-[#4C4546] mt-1 max-w-sm mx-auto">
                    Se registró el lote <strong>{lastExecutedBatch?.batchNumber || "BATCH-OK"}</strong> por un valor total neto de <strong>$ {formatCOP(lastExecutedBatch?.totalNet ?? totalPendingCOP)} COP</strong>. Se enviaron las notificaciones automáticas por correo electrónico a todos los compositores.
                  </p>
                </div>

                {/* Botones de Descarga */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => handleDownloadPAB()}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#111C2D] font-montserrat font-bold text-xs rounded-xl transition cursor-pointer"
                    title="Plano Bancario para Bancolombia Sucursal Virtual Empresas"
                  >
                    <span className="material-symbols-outlined text-sm">description</span>
                    <span>Descargar Plano PAB (.txt)</span>
                  </button>
                  <button
                    onClick={() => handleDownloadCSV()}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#F0F3FF] hover:bg-[#e4ebfc] text-[#0071BC] font-montserrat font-bold text-xs rounded-xl transition cursor-pointer"
                    title="Reporte contable en Excel / CSV"
                  >
                    <span className="material-symbols-outlined text-sm">table_view</span>
                    <span>Descargar Reporte (.csv)</span>
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setIsDispersionModalOpen(false)}
                    className="px-6 py-2.5 bg-[#0071BC] text-white font-montserrat font-extrabold text-xs rounded-xl shadow-xs hover:bg-[#005996] transition cursor-pointer"
                  >
                    Entendido / Cerrar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
