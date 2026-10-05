"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  getComposerProfileApi,
  updateComposerProfileApi,
  getComposerPayoutsApi,
} from "@/lib/api-client";

interface SaleItem {
  id: string;
  orderId: string;
  scoreTitle: string;
  buyerName: string;
  buyerEmail: string;
  wompiTransactionId: string;
  createdAt: string;
  grossPriceCOP: number;
  platformFeeCOP: number;
  netRoyaltyCOP: number;
  status: string;
  payoutStatus?: "PAID" | "PENDING";
  payoutBatch?: string | null;
  payoutExecutedAt?: string | null;
}

interface PayoutRecord {
  id: string;
  batchNumber: string;
  amountNetCOP: number;
  amountGrossCOP: number;
  commissionPcCop: number;
  wompiTransferId: string;
  status: string;
  executedAt: string;
  executedBy: string;
}

export default function CompositorPagosPage() {
  const { composer } = useAuth();
  const { t, language } = useLanguage();

  const isEn = language === "en";

  const [bankName, setBankName] = useState("Bancolombia");
  const [accountType, setAccountType] = useState("AHORROS");
  const [accountNumber, setAccountNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const [documentType, setDocumentType] = useState("CC");
  const [documentNumber, setDocumentNumber] = useState("");

  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPayouts, setIsLoadingPayouts] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Datos financieros reales
  const [summary, setSummary] = useState({
    totalSalesCount: 0,
    totalGrossSalesCOP: 0,
    totalNetRoyaltiesCOP: 0,
    lifetimeDisbursedCOP: 0,
    pendingBalanceCOP: 0,
  });
  const [commissionPercentage, setCommissionPercentage] = useState(15);
  const [salesHistory, setSalesHistory] = useState<SaleItem[]>([]);
  const [payoutHistory, setPayoutHistory] = useState<PayoutRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"pending_sales" | "disbursements">("pending_sales");

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // Cargar datos bancarios y resumen financiero real
  useEffect(() => {
    async function loadData() {
      if (!composer?.id && !composer?.email) return;
      setIsLoadingPayouts(true);

      try {
        const composerIdOrEmail = composer.id || composer.email;

        // 1. Perfil y cuenta bancaria
        const profile = await getComposerProfileApi(composerIdOrEmail);
        if (profile?.bank_account) {
          setBankName(profile.bank_account.bank_name || "Bancolombia");
          setAccountType(profile.bank_account.account_type || "AHORROS");
          setAccountNumber(profile.bank_account.account_number || "");
          setHolderName(profile.bank_account.holder_name || "");
          setDocumentType(profile.bank_account.document_type || "CC");
          setDocumentNumber(profile.bank_account.document_number || "");
        }

        // 2. Resumen financiero real de ventas y regalías
        const payoutsData = await getComposerPayoutsApi(composerIdOrEmail);
        if (payoutsData && payoutsData.success) {
          if (payoutsData.summary) {
            setSummary(payoutsData.summary);
          }
          if (payoutsData.composer?.commissionPercentage !== undefined) {
            setCommissionPercentage(payoutsData.composer.commissionPercentage);
          }
          if (payoutsData.salesHistory) {
            setSalesHistory(payoutsData.salesHistory);
          }
          if (payoutsData.payoutHistory) {
            setPayoutHistory(payoutsData.payoutHistory);
          }
        }
      } catch (err) {
        console.warn("Error cargando finanzas del compositor:", err);
      } finally {
        setIsLoadingPayouts(false);
      }
    }

    loadData();
  }, [composer?.id, composer?.email]);

  const handleSaveAccount = async () => {
    if (!composer?.id && !composer?.email) return;
    setIsSaving(true);
    setFeedback(null);
    try {
      await updateComposerProfileApi({
        id: composer.id,
        email: composer.email,
        bank_account: {
          bank_name: bankName,
          account_type: accountType,
          account_number: accountNumber,
          holder_name: holderName,
          document_type: documentType,
          document_number: documentNumber,
        },
      });
      setIsEditingAccount(false);
      setFeedback({
        type: "success",
        message:
          language === "en"
            ? "Wompi disbursement account updated successfully in database."
            : "Cuenta de dispersión Wompi actualizada exitosamente en la base de datos.",
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Error al actualizar cuenta bancaria.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const composerParticipationPercentage = 100 - commissionPercentage;

  return (
    <div className="space-y-8 font-inter text-[#111C2D]">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F3FF] border border-[#0071BC]/10 text-[#0071BC] text-[11px] font-extrabold uppercase tracking-wider mb-2 font-montserrat">
            <span className="material-symbols-outlined text-xs">account_balance_wallet</span>
            {t("payouts.badge", "Liquidaciones & Dispersión Wompi API")}
          </div>
          <h1 className="text-3xl font-black font-montserrat text-[#111C2D] tracking-tight">
            {t("payouts.title", "Historial de Regalías & Cuenta Wompi")}
          </h1>
          <p className="text-xs md:text-sm text-[#4C4546] font-medium max-w-2xl leading-relaxed">
            {isEn
              ? `Check your net royalties from digital score sales (${composerParticipationPercentage}% net for you / ${commissionPercentage}% platform fee) transferred via Wompi disbursement.`
              : `Consulta las regalías generadas por las ventas de tus partituras (${composerParticipationPercentage}% neto para ti / ${commissionPercentage}% comisión de la plataforma) transferidas vía dispersión Wompi.`}
          </p>
        </div>

        {/* Card Estado de Cuenta Configurada */}
        <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-xs flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F0F3FF] text-[#0071BC] flex items-center justify-center font-bold text-lg">
              <span className="material-symbols-outlined">account_balance</span>
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase text-[#4C4546] block font-montserrat">
                {t("payouts.registered_account", "Cuenta Registrada para Dispersión Wompi")}
              </span>
              <span className="text-xs font-bold text-[#111C2D] font-montserrat">
                {bankName} ({accountType})
              </span>
              <span className="text-[11px] font-mono text-[#0071BC] block">
                {accountNumber ? accountNumber : t("payouts.no_account", "Sin cuenta configurada")}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsEditingAccount(!isEditingAccount)}
            className="px-3 py-1.5 text-[11px] font-bold text-[#0071BC] bg-[#F0F3FF] hover:bg-slate-200/60 rounded-xl transition font-montserrat border border-black/5 cursor-pointer"
          >
            {isEditingAccount ? t("payouts.cancel", "Cancelar") : t("payouts.edit_account", "Editar")}
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold font-montserrat shadow-xs flex items-center gap-2 animate-in fade-in duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <span className="material-symbols-outlined text-base">
            {feedback.type === "success" ? "check_circle" : "error"}
          </span>
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Formulario desplegable para cambiar cuenta en vivo */}
      {isEditingAccount && (
        <div className="bg-white p-6 rounded-2xl border border-[#0071BC]/20 shadow-xs space-y-4 animate-in fade-in duration-200">
          <h3 className="text-sm font-bold font-montserrat text-[#111C2D]">
            {t("payouts.update_account_title", "Actualizar Cuenta Bancaria Wompi")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-[#111C2D] mb-1 font-montserrat">
                {t("profile.bank_name", "Entidad Bancaria *")}
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#111C2D] outline-none"
              >
                <option value="Bancolombia">Bancolombia</option>
                <option value="Davivienda">Davivienda</option>
                <option value="Nequi">Nequi</option>
                <option value="Daviplata">Daviplata</option>
                <option value="Banco de Bogotá">Banco de Bogotá</option>
                <option value="BBVA">BBVA Colombia</option>
                <option value="Colpatria">Scotiabank Colpatria</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#111C2D] mb-1 font-montserrat">
                {t("profile.account_type", "Tipo de Cuenta *")}
              </label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#111C2D] outline-none"
              >
                <option value="AHORROS">{t("profile.account_type_savings", "Cuenta de Ahorros")}</option>
                <option value="CORRIENTE">{t("profile.account_type_checking", "Cuenta Corriente")}</option>
                <option value="NEQUI">Nequi</option>
                <option value="DAVIPLATA">Daviplata</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#111C2D] mb-1 font-montserrat">
                {t("profile.account_number", "Número de Cuenta o Celular *")}
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Ej: 3156123283"
                className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-3 py-2.5 text-xs text-[#111C2D] font-mono outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
            <div>
              <label className="block font-bold text-[#111C2D] mb-1 font-montserrat">
                {t("profile.document_number", "Documento de Identificación *")}
              </label>
              <div className="flex gap-2">
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-24 bg-[#F0F3FF] border border-black/5 rounded-xl px-2.5 py-2.5 text-xs font-semibold text-[#111C2D] outline-none"
                >
                  <option value="CC">CC</option>
                  <option value="CE">CE</option>
                  <option value="NIT">NIT</option>
                  <option value="PP">PP</option>
                </select>
                <input
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="Número de documento"
                  className="flex-1 bg-[#F0F3FF] border border-black/5 rounded-xl px-3 py-2.5 text-xs text-[#111C2D] font-mono outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block font-bold text-[#111C2D] mb-1 font-montserrat">
                {t("profile.holder_name", "Titular de la Cuenta *")}
              </label>
              <input
                type="text"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                placeholder="Nombre del titular"
                className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-3 py-2.5 text-xs text-[#111C2D] outline-none"
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-black/5">
            <p className="text-[11px] text-[#4C4546]">
              {t(
                "payouts.disbursement_notice",
                "Las dispersiones se transfieren automáticamente en cada ciclo de corte quincenal de Piano Colombia."
              )}
            </p>
            <button
              onClick={handleSaveAccount}
              disabled={isSaving}
              className="px-5 py-2.5 bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat shrink-0 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? t("profile.saving", "Guardando...") : t("profile.save_draft_btn", "Guardar Cambios")}
            </button>
          </div>
        </div>
      )}

      {/* Grid KPI Cards Resumen Financiero Real */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-xs space-y-2 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#0071BC]"></div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4C4546] font-montserrat">
            {t("payouts.lifetime_disbursed", "Total Dispersado Histórico")}
          </span>
          <div className="text-2xl sm:text-3xl font-black font-montserrat text-[#111C2D]">
            {formatCOP(summary.lifetimeDisbursedCOP)}
          </div>
          <p className="text-[11px] text-[#4C4546]">
            {t("payouts.lifetime_desc", "Regalías netas transferidas a tu cuenta")}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-xs space-y-2 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#FBB03B]"></div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4C4546] font-montserrat">
            {t("payouts.pending_balance", "Saldo Pendiente por Liquidar")}
          </span>
          <div className="text-2xl sm:text-3xl font-black font-montserrat text-[#0071BC]">
            {formatCOP(summary.pendingBalanceCOP)}
          </div>
          <p className="text-[11px] text-[#4C4546]">
            {summary.totalSalesCount > 0
              ? `${summary.totalSalesCount} ${summary.totalSalesCount === 1 ? "partitura vendida" : "partituras vendidas"} pendientes de pago`
              : t("payouts.pending_desc", "Será dispersado en el próximo ciclo de corte")}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-xs space-y-2 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600"></div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4C4546] font-montserrat">
            {t("payouts.share_rate", "Porcentaje de Participación")}
          </span>
          <div className="text-2xl sm:text-3xl font-black font-montserrat text-emerald-700">
            {composerParticipationPercentage}%{" "}
            <span className="text-xs font-bold text-[#4C4546]">{t("payouts.net_per_score", "Neto por obra")}</span>
          </div>
          <p className="text-[11px] text-[#4C4546]">
            {commissionPercentage}% {t("payouts.platform_fee", "retención administrativa Piano Colombia")}
          </p>
        </div>
      </div>

      {/* Selector de Pestañas: Ventas Pendientes vs Historial de Dispersiones */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex bg-[#F0F3FF] p-1 rounded-xl text-xs font-bold font-montserrat">
            <button
              onClick={() => setActiveTab("pending_sales")}
              className={`px-4 py-2 rounded-lg transition cursor-pointer ${
                activeTab === "pending_sales"
                  ? "bg-white text-[#111C2D] shadow-2xs font-extrabold"
                  : "text-[#4C4546] hover:text-[#111C2D]"
              }`}
            >
              🛒 {isEn ? "Sales & Royalties Details" : "Ventas de Partituras & Regalías"} ({salesHistory.length})
            </button>
            <button
              onClick={() => setActiveTab("disbursements")}
              className={`px-4 py-2 rounded-lg transition cursor-pointer ${
                activeTab === "disbursements"
                  ? "bg-white text-[#111C2D] shadow-2xs font-extrabold"
                  : "text-[#4C4546] hover:text-[#111C2D]"
              }`}
            >
              🏦 {isEn ? "Disbursement Transfers" : "Dispersiones Recibidas"} ({payoutHistory.length})
            </button>
          </div>

          <span className="text-xs font-bold text-[#0071BC] bg-[#F0F3FF] px-3 py-1 rounded-full font-mono self-start sm:self-auto">
            {t("payouts.active_period", "Período Activo Octubre 2026")}
          </span>
        </div>

        {/* Tab 1: Ventas de Partituras Reales */}
        {activeTab === "pending_sales" && (
          <div>
            {isLoadingPayouts ? (
              <div className="p-12 text-center text-xs text-[#4C4546]">
                <span className="w-6 h-6 border-2 border-[#0071BC] border-t-transparent rounded-full animate-spin inline-block mb-2"></span>
                <p>Cargando ventas y liquidación de regalías...</p>
              </div>
            ) : salesHistory.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#4C4546] space-y-2">
                <span className="material-symbols-outlined text-4xl text-[#0071BC]/40 block mx-auto">receipt_long</span>
                <p className="font-semibold font-montserrat">
                  {t("payouts.no_payouts", "Sin ventas registradas en este período.")}
                </p>
                <p className="text-[11px] text-[#4C4546]">
                  {t(
                    "payouts.empty_desc",
                    "A medida que tus partituras aprobadas sean adquiridas en la tienda, las ventas se reflejarán aquí automáticamente."
                  )}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F0F3FF] text-[10px] font-extrabold font-montserrat uppercase tracking-wider text-[#4C4546] border-b border-black/5">
                    <tr>
                      <th className="py-3.5 px-4 sm:px-6">Fecha</th>
                      <th className="py-3.5 px-4">Partitura Vendida</th>
                      <th className="py-3.5 px-4">Comprador</th>
                      <th className="py-3.5 px-4">Ref. Pedido</th>
                      <th className="py-3.5 px-4 text-right">Venta Bruta</th>
                      <th className="py-3.5 px-4 text-right">Comisión PC ({commissionPercentage}%)</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right font-black text-[#0071BC]">
                        Tu Regalía ({composerParticipationPercentage}%)
                      </th>
                      <th className="py-3.5 px-4 text-center">Estado de Pago</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 font-medium">
                    {salesHistory.map((sale) => (
                      <tr key={sale.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap text-[#4C4546]">
                          {new Date(sale.createdAt).toLocaleDateString("es-CO", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#111C2D]">
                          {sale.scoreTitle}
                        </td>
                        <td className="py-3.5 px-4 text-[#4C4546]">
                          <span className="font-semibold text-[#111C2D] block">{sale.buyerName}</span>
                          <span className="text-[10px] font-mono text-slate-500">{sale.buyerEmail}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-[#0071BC]">
                          {sale.orderId}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-[#111C2D]">
                          {formatCOP(sale.grossPriceCOP)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-rose-700">
                          -{formatCOP(sale.platformFeeCOP)}
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-right font-mono font-bold text-emerald-700">
                          +{formatCOP(sale.netRoyaltyCOP)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {sale.payoutStatus === "PAID" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-montserrat font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <span className="material-symbols-outlined text-xs">done_all</span>
                              <span>Liquidado ({sale.payoutBatch || "Transferido"})</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-montserrat font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                              <span>Pendiente de Giro</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#F9F9FF] font-montserrat font-bold text-xs border-t border-black/10 divide-y divide-black/5">
                    <tr>
                      <td colSpan={4} className="py-3 px-4 sm:px-6 text-right uppercase tracking-wider text-[#4C4546]">
                        Total Ventas Acumuladas:
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[#111C2D]">
                        {formatCOP(summary.totalGrossSalesCOP)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-rose-700">
                        -{formatCOP(summary.totalGrossSalesCOP - summary.totalNetRoyaltiesCOP)}
                      </td>
                      <td className="py-3 px-4 sm:px-6 text-right font-mono text-emerald-800 text-sm font-black">
                        {formatCOP(summary.totalNetRoyaltiesCOP)}
                      </td>
                      <td></td>
                    </tr>
                    {summary.lifetimeDisbursedCOP > 0 && (
                      <tr className="text-emerald-800">
                        <td colSpan={6} className="py-2.5 px-4 sm:px-6 text-right uppercase tracking-wider text-xs">
                          Total Ya Transferido a Tu Cuenta:
                        </td>
                        <td className="py-2.5 px-4 sm:px-6 text-right font-mono font-black">
                          {formatCOP(summary.lifetimeDisbursedCOP)}
                        </td>
                        <td></td>
                      </tr>
                    )}
                    <tr className="bg-amber-50/60 text-[#111C2D]">
                      <td colSpan={6} className="py-3 px-4 sm:px-6 text-right uppercase tracking-wider text-xs font-black text-amber-900">
                        Saldo Neto Pendiente por Dispersar:
                      </td>
                      <td className="py-3 px-4 sm:px-6 text-right font-mono font-black text-amber-900 text-sm">
                        {formatCOP(summary.pendingBalanceCOP)}
                      </td>
                      <td className="text-center text-[10px] text-amber-800 font-bold">
                        {summary.pendingBalanceCOP > 0 ? "Próximo Lote Wompi" : "Al día"}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Historial de Giros / Dispersiones Realizadas */}
        {activeTab === "disbursements" && (
          <div>
            {payoutHistory.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#4C4546] space-y-2">
                <span className="material-symbols-outlined text-4xl text-[#0071BC]/40 block mx-auto">account_balance</span>
                <p className="font-semibold font-montserrat">
                  {isEn ? "No disbursements executed yet." : "Aún no se han ejecutado giros de dispersión."}
                </p>
                <p className="text-[11px] text-[#4C4546]">
                  {isEn
                    ? "When platform admin executes the bi-weekly payout batch, bank transfer confirmations will be listed here."
                    : "Cuando administración procese el lote de liquidación quincenal, los comprobantes de transferencia Wompi aparecerán aquí."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F0F3FF] text-[10px] font-extrabold font-montserrat uppercase tracking-wider text-[#4C4546] border-b border-black/5">
                    <tr>
                      <th className="py-3.5 px-4 sm:px-6">Lote #</th>
                      <th className="py-3.5 px-4">Fecha de Giro</th>
                      <th className="py-3.5 px-4">Ref. Wompi Transfer</th>
                      <th className="py-3.5 px-4">Ejecutado Por</th>
                      <th className="py-3.5 px-4 text-center">Estado</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right font-black">Monto Transferido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 font-medium">
                    {payoutHistory.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-[#111C2D]">
                          {p.batchNumber}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-[#4C4546]">
                          {new Date(p.executedAt).toLocaleDateString("es-CO", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-[#0071BC]">
                          {p.wompiTransferId}
                        </td>
                        <td className="py-3.5 px-4 text-[#4C4546]">
                          {p.executedBy}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase font-montserrat">
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-right font-mono font-bold text-emerald-700 text-sm">
                          {formatCOP(p.amountNetCOP)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
