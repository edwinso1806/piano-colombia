"use client";

import { useState } from "react";
import Link from "next/link";

interface ComposerPayout {
  id: string;
  composerName: string;
  bankName: string;
  accountType: "Ahorros" | "Corriente" | "Bolsillo Nequi" | "Bolsillo Daviplata";
  accountNumber: string;
  taxId: string; // CC / NIT
  totalSalesCount: number;
  grossSalesCOP: number;
  platformFeeCOP: number; // 20%
  netEarningsCOP: number; // 80%
  status: "pending" | "paid" | "processing";
  wompiVerified: boolean;
}

interface DisbursementBatch {
  batchId: string;
  date: string;
  composersCount: number;
  totalAmountCOP: number;
  status: "completed" | "processing";
  executedBy: string;
  wompiBatchTransactionId: string;
}

export default function AdminPagosPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [isDispersionModalOpen, setIsDispersionModalOpen] = useState(false);
  const [isProcessingDispersion, setIsProcessingDispersion] = useState(false);
  const [dispersionComplete, setDispersionComplete] = useState(false);

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");

  const [payouts, setPayouts] = useState<ComposerPayout[]>([
    {
      id: "pay-101",
      composerName: "Guillermo Rendón",
      bankName: "Bancolombia",
      accountType: "Ahorros",
      accountNumber: "582-910284-12",
      taxId: "CC 19.482.910",
      totalSalesCount: 42,
      grossSalesCOP: 5200000,
      platformFeeCOP: 1040000,
      netEarningsCOP: 4160000,
      status: "pending",
      wompiVerified: true,
    },
    {
      id: "pay-102",
      composerName: "Alba Lucía Potes",
      bankName: "Davivienda",
      accountType: "Ahorros",
      accountNumber: "0092-4819-0192",
      taxId: "CC 31.902.841",
      totalSalesCount: 35,
      grossSalesCOP: 4375000,
      platformFeeCOP: 875000,
      netEarningsCOP: 3500000,
      status: "pending",
      wompiVerified: true,
    },
    {
      id: "pay-103",
      composerName: "Lucas Saboya",
      bankName: "Nequi",
      accountType: "Bolsillo Nequi",
      accountNumber: "312 489 0192",
      taxId: "CC 1.094.820.192",
      totalSalesCount: 29,
      grossSalesCOP: 3625000,
      platformFeeCOP: 725000,
      netEarningsCOP: 2900000,
      status: "pending",
      wompiVerified: true,
    },
    {
      id: "pay-104",
      composerName: "Germán Darío Pérez",
      bankName: "Bancolombia",
      accountType: "Corriente",
      accountNumber: "102-009182-99",
      taxId: "CC 79.102.840",
      totalSalesCount: 51,
      grossSalesCOP: 6375000,
      platformFeeCOP: 1275000,
      netEarningsCOP: 5100000,
      status: "pending",
      wompiVerified: true,
    },
    {
      id: "pay-105",
      composerName: "Blanca Uribe",
      bankName: "Daviplata",
      accountType: "Bolsillo Daviplata",
      accountNumber: "300 482 1092",
      taxId: "CC 41.902.112",
      totalSalesCount: 18,
      grossSalesCOP: 2250000,
      platformFeeCOP: 450000,
      netEarningsCOP: 1800000,
      status: "pending",
      wompiVerified: true,
    },
  ]);

  const [history] = useState<DisbursementBatch[]>([
    {
      batchId: "WOMPI-DISPERSION-20260815-01",
      date: "15 de Agosto, 2026",
      composersCount: 12,
      totalAmountCOP: 21680000,
      status: "completed",
      executedBy: "Mariana Valencia (Tesorera)",
      wompiBatchTransactionId: "WMP-TX-8472910482",
    },
    {
      batchId: "WOMPI-DISPERSION-20260715-01",
      date: "15 de Julio, 2026",
      composersCount: 10,
      totalAmountCOP: 16720000,
      status: "completed",
      executedBy: "Carlos Mario Restrepo (Super Admin)",
      wompiBatchTransactionId: "WMP-TX-7361920472",
    },
  ]);

  const totalGrossCOP = payouts.reduce((acc, curr) => acc + curr.grossSalesCOP, 0);
  const totalPlatformFeeCOP = payouts.reduce((acc, curr) => acc + curr.platformFeeCOP, 0);
  const totalPendingCOP = payouts.reduce((acc, curr) => acc + curr.netEarningsCOP, 0);

  const filteredPayouts = payouts.filter((p) =>
    p.composerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.taxId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExecuteDispersion = () => {
    setIsProcessingDispersion(true);
    setTimeout(() => {
      setIsProcessingDispersion(false);
      setDispersionComplete(true);
      setPayouts((prev) =>
        prev.map((item) => ({ ...item, status: "paid" }))
      );
    }, 2200);
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
            Dispersión Masiva Vía Wompi API
          </h1>
          <p className="text-xs text-[#4C4546] mt-1 max-w-2xl">
            Gestión centralizada de regalías (80% netos para compositores / 20% comisión Piano Colombia). Transferencia directa a cuentas bancarias nacionales, Nequi y Daviplata vía la API de Wompi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setDispersionComplete(false);
              setIsDispersionModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#0071BC] hover:bg-[#005996] text-white text-xs font-montserrat font-extrabold rounded-xl shadow-md transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-base">bolt</span>
            <span>Ejecutar Dispersión Wompi API</span>
          </button>
        </div>
      </div>

      {/* Financial KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Recaudado Bruto */}
        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-xs">
          <span className="text-[11px] font-extrabold text-[#4C4546] uppercase font-montserrat tracking-wider block mb-1">
            Recaudado Bruto (Mes)
          </span>
          <div className="text-2xl font-black text-[#111C2D] font-montserrat">
            $ {totalGrossCOP.toLocaleString()} COP
          </div>
          <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-2">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>+18.4% vs mes anterior</span>
          </span>
        </div>

        {/* KPI 2: Comisión 20% */}
        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-xs border-l-4 border-l-[#0071BC]">
          <span className="text-[11px] font-extrabold text-[#4C4546] uppercase font-montserrat tracking-wider block mb-1">
            Comisión Piano Colombia (20%)
          </span>
          <div className="text-2xl font-black text-[#0071BC] font-montserrat">
            $ {totalPlatformFeeCOP.toLocaleString()} COP
          </div>
          <span className="text-[11px] text-[#4C4546] font-medium block mt-2">
            Mantenimiento & Licencias DRM
          </span>
        </div>

        {/* KPI 3: Saldo Pendiente 80% */}
        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-xs border-l-4 border-l-[#FBB03B]">
          <span className="text-[11px] font-extrabold text-[#4C4546] uppercase font-montserrat tracking-wider block mb-1">
            Saldo Pendiente Compositores (80%)
          </span>
          <div className="text-2xl font-black text-[#111C2D] font-montserrat">
            $ {totalPendingCOP.toLocaleString()} COP
          </div>
          <span className="text-[11px] text-[#FBB03B] font-bold font-montserrat block mt-2">
            Equivalente: ~${(totalPendingCOP / 4000).toLocaleString()} USD
          </span>
        </div>

        {/* KPI 4: Próximo Ciclo */}
        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-xs">
          <span className="text-[11px] font-extrabold text-[#4C4546] uppercase font-montserrat tracking-wider block mb-1">
            Próximo Ciclo de Pago Wompi
          </span>
          <div className="text-xl font-black text-[#111C2D] font-montserrat">
            15 Septiembre, 2026
          </div>
          <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-2">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            <span>API Wompi Dispersión Conectada</span>
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
              Historial de Dispersiones Wompi ({history.length})
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
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F0F3FF]/70 border-b border-black/5 text-[11px] font-montserrat font-extrabold text-[#4C4546] uppercase tracking-wider">
                  <th className="py-3 px-4">Compositor</th>
                  <th className="py-3 px-4">Cuenta Registrada Wompi / Banco</th>
                  <th className="py-3 px-4">Documento Identidad</th>
                  <th className="py-3 px-4 text-center">Ventas</th>
                  <th className="py-3 px-4 text-right">Bruto (100%)</th>
                  <th className="py-3 px-4 text-right">Comisión PC (20%)</th>
                  <th className="py-3 px-4 text-right">Neto a Transferir (80%)</th>
                  <th className="py-3 px-4 text-center">Estado Wompi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 text-xs text-[#111C2D]">
                {filteredPayouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-[#F9F9FF] transition-colors">
                    {/* Compositor */}
                    <td className="py-3.5 px-4 font-montserrat font-extrabold text-[#111C2D]">
                      {payout.composerName}
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
                      $ {payout.grossSalesCOP.toLocaleString()} COP
                    </td>

                    {/* Platform Fee */}
                    <td className="py-3.5 px-4 text-right text-[#C1272D] font-mono">
                      -$ {payout.platformFeeCOP.toLocaleString()} COP
                    </td>

                    {/* Net Earnings */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-montserrat font-black text-sm text-[#111C2D] block">
                        $ {payout.netEarningsCOP.toLocaleString()} COP
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
                          <span>Pendiente Wompi</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab Content 2: History */}
        {activeTab === "history" && (
          <div className="w-full overflow-x-auto overscroll-x-contain">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F0F3FF]/70 border-b border-black/5 text-[11px] font-montserrat font-extrabold text-[#4C4546] uppercase tracking-wider">
                  <th className="py-3 px-4">Lote / Wompi Batch ID</th>
                  <th className="py-3 px-4">Fecha Ejecución</th>
                  <th className="py-3 px-4 text-center">Compositores Pagados</th>
                  <th className="py-3 px-4 text-right">Monto Total COP</th>
                  <th className="py-3 px-4">Ejecutado Por</th>
                  <th className="py-3 px-4 text-center">Comprobante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 text-xs text-[#111C2D]">
                {history.map((batch) => (
                  <tr key={batch.batchId} className="hover:bg-[#F9F9FF] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0071BC]">
                      {batch.batchId}
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
                      <button
                        onClick={() => alert(`Descargando comprobante de dispersión Wompi ${batch.batchId}...`)}
                        className="inline-flex items-center gap-1 text-[11px] font-montserrat font-bold text-[#0071BC] hover:underline"
                      >
                        <span className="material-symbols-outlined text-sm">download</span>
                        <span>Comprobante</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                    Dispersión Masiva Vía Wompi API
                  </h3>
                  <p className="text-xs text-[#4C4546]">Lote de Pago Directo: Septiembre 2026</p>
                </div>
              </div>
              <button
                onClick={() => setIsDispersionModalOpen(false)}
                className="text-[#4C4546] hover:text-[#111C2D] p-1"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {!dispersionComplete ? (
              <div className="space-y-4 text-xs">
                <div className="bg-[#F0F3FF] p-4 rounded-2xl border border-black/5 space-y-2">
                  <div className="flex justify-between font-montserrat font-bold text-[#111C2D]">
                    <span>Compositores a Liquidar:</span>
                    <span>{payouts.length} cuentas bancarias/Nequi verificadas</span>
                  </div>
                  <div className="flex justify-between font-montserrat font-bold text-[#111C2D]">
                    <span>Monto Total a Dispersar:</span>
                    <span className="text-emerald-800 text-sm">$ {totalPendingCOP.toLocaleString()} COP</span>
                  </div>
                </div>

                {/* List preview */}
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 border border-black/5 rounded-xl p-3 bg-slate-50">
                  {payouts.map((p) => (
                    <div key={p.id} className="flex justify-between text-[11px] text-[#4C4546]">
                      <span className="font-semibold text-[#111C2D]">
                        {p.composerName} ({p.bankName})
                      </span>
                      <span className="font-mono text-emerald-700 font-bold">
                        $ {p.netEarningsCOP.toLocaleString()} COP
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                  <span className="material-symbols-outlined text-base text-amber-700 shrink-0 mt-0.5">
                    warning
                  </span>
                  <p>
                    <strong>Atención Tesorería:</strong> Esta acción ordenará la dispersión electrónica masiva a través del servicio de transacciones API de Wompi hacia las cuentas registradas.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/5">
                  <button
                    type="button"
                    onClick={() => setIsDispersionModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-montserrat font-bold text-[#4C4546] hover:bg-[#F0F3FF] rounded-xl transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={isProcessingDispersion}
                    onClick={handleExecuteDispersion}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-montserrat font-extrabold rounded-xl shadow-md transition disabled:opacity-50"
                  >
                    {isProcessingDispersion ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Procesando API Wompi...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">send</span>
                        <span>Confirmar & Dispersar Vía Wompi API</span>
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
                    Dispersión Wompi API Exitosa
                  </h4>
                  <p className="text-xs text-[#4C4546] mt-1 max-w-sm mx-auto">
                    Se han transferido <strong>$ {totalPendingCOP.toLocaleString()} COP</strong> a través del servicio de dispersiones Wompi. Se generaron las notificaciones automáticas por correo electrónico a todos los compositores.
                  </p>
                </div>
                <button
                  onClick={() => setIsDispersionModalOpen(false)}
                  className="px-6 py-2.5 bg-[#0071BC] text-white font-montserrat font-extrabold text-xs rounded-xl shadow-xs hover:bg-[#005996] transition"
                >
                  Entendido / Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
