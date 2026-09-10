"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { getComposerProfileApi, updateComposerProfileApi } from "@/lib/api-client";

export default function CompositorPagosPage() {
  const { composer } = useAuth();
  const { t, language } = useLanguage();

  const [bankName, setBankName] = useState("Bancolombia");
  const [accountType, setAccountType] = useState("AHORROS");
  const [accountNumber, setAccountNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const [documentType, setDocumentType] = useState("CC");
  const [documentNumber, setDocumentNumber] = useState("");

  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Cargar datos bancarios reales de la base de datos PostgreSQL
  useEffect(() => {
    async function loadBankData() {
      if (!composer?.id && !composer?.email) return;
      try {
        const data = await getComposerProfileApi(composer.id || composer.email);
        if (data?.bank_account) {
          setBankName(data.bank_account.bank_name || "Bancolombia");
          setAccountType(data.bank_account.account_type || "AHORROS");
          setAccountNumber(data.bank_account.account_number || "");
          setHolderName(data.bank_account.holder_name || "");
          setDocumentType(data.bank_account.document_type || "CC");
          setDocumentNumber(data.bank_account.document_number || "");
        }
      } catch (err) {
        console.warn("Error cargando cuenta bancaria del compositor:", err);
      }
    }
    loadBankData();
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
            {t(
              "payouts.subtitle",
              "Consulte las dispersiones automáticas por concepto de ventas de partituras (80% neto para el autor / 20% comisión de la plataforma) transferidas directamente a tu banco o cuenta Wompi."
            )}
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
              <label className="block font-bold text-[#111C2D] mb-1 font-montserrat">{t("profile.bank_name", "Entidad Bancaria *")}</label>
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
              <label className="block font-bold text-[#111C2D] mb-1 font-montserrat">{t("profile.account_type", "Tipo de Cuenta *")}</label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#111C2D] outline-none"
              >
                <option value="AHORROS">{t("profile.account_type_savings", "Cuenta de Ahorros")}</option>
                <option value="CORRIENTE">{t("profile.account_type_checking", "Cuenta Corriente")}</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#111C2D] mb-1 font-montserrat">{t("profile.account_number", "Número de Cuenta *")}</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="10312813181"
                className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-3 py-2.5 text-xs text-[#111C2D] font-mono outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
            <div>
              <label className="block font-bold text-[#111C2D] mb-1 font-montserrat">{t("profile.document_number", "Documento de Identificación *")}</label>
              <input
                type="text"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="CC 1020304050"
                className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-3 py-2.5 text-xs text-[#111C2D] font-mono outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-[#111C2D] mb-1 font-montserrat">{t("profile.holder_name", "Titular de la Cuenta *")}</label>
              <input
                type="text"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                placeholder="Nombre completo"
                className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-3 py-2.5 text-xs text-[#111C2D] outline-none"
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-black/5">
            <p className="text-[11px] text-[#4C4546]">
              {t(
                "payouts.disbursement_notice",
                "Las dispersiones se transfieren automáticamente cada 15 días mediante la pasarela de Wompi."
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

      {/* Grid KPI Cards Resumen Financiero */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-xs space-y-2 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#0071BC]"></div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4C4546] font-montserrat">
            {t("payouts.lifetime_disbursed", "Total Dispersado Histórico")}
          </span>
          <div className="text-2xl sm:text-3xl font-black font-montserrat text-[#111C2D]">
            $0 <span className="text-xs font-bold text-[#4C4546]">COP</span>
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
            $0 <span className="text-xs font-bold text-[#4C4546]">COP</span>
          </div>
          <p className="text-[11px] text-[#4C4546]">
            {t("payouts.pending_desc", "Será dispersado en el próximo ciclo de corte")}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-xs space-y-2 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600"></div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4C4546] font-montserrat">
            {t("payouts.share_rate", "Porcentaje de Participación")}
          </span>
          <div className="text-2xl sm:text-3xl font-black font-montserrat text-emerald-700">
            80% <span className="text-xs font-bold text-[#4C4546]">{t("payouts.net_per_score", "Neto por obra")}</span>
          </div>
          <p className="text-[11px] text-[#4C4546]">
            {t("payouts.platform_fee", "20% retención administrativa Piano Colombia")}
          </p>
        </div>
      </div>

      {/* Historial de Liquidaciones */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-black/5 flex items-center justify-between">
          <h2 className="text-base font-bold font-montserrat text-[#111C2D]">
            {t("payouts.records_title", "Registro de Liquidaciones")}
          </h2>
          <span className="text-xs font-bold text-[#0071BC] bg-[#F0F3FF] px-3 py-1 rounded-full font-mono">
            {t("payouts.active_period", "Período Activo")}
          </span>
        </div>
        <div className="p-12 text-center text-xs text-[#4C4546] space-y-2">
          <span className="material-symbols-outlined text-4xl text-[#0071BC]/40 block mx-auto">receipt_long</span>
          <p className="font-semibold font-montserrat">{t("payouts.no_payouts", "Sin liquidaciones registradas en este período.")}</p>
          <p className="text-[11px] text-[#4C4546]">
            {t(
              "payouts.empty_desc",
              "A medida que tus partituras aprobadas sean adquiridas en la tienda, las ventas se reflejarán aquí automáticamente."
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
