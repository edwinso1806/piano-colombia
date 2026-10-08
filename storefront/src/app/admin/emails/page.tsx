"use client";

import { useState } from "react";
import Link from "next/link";

type TemplateKey =
  | "compra_comprador"
  | "venta_compositor"
  | "payout_compositor"
  | "aprobacion_compositor"
  | "rechazo_compositor"
  | "otp_verificacion"
  | "password_reset"
  | "partitura_aprobada";

export default function AdminEmailsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>("compra_comprador");
  const [previewLang, setPreviewLang] = useState<"es" | "en">("es");
  const [testEmail, setTestEmail] = useState("admin@pianocolombia.com");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const isEn = previewLang === "en";

  const handleSendTestEmail = () => {
    setIsSendingTest(true);
    setSendSuccess(false);

    setTimeout(() => {
      setIsSendingTest(false);
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 4500);
    }, 900);
  };

  // Asuntos según plantilla e idioma
  const emailSubjects: Record<TemplateKey, { es: string; en: string }> = {
    compra_comprador: {
      es: '🎹 Tu Partitura: "Bambuco en Re Mayor" ya está disponible para descarga',
      en: '🎹 Your Sheet Music: "Bambuco in D Major" is ready for download',
    },
    venta_compositor: {
      es: '🎉 ¡Felicidades Adolfo! Has vendido una partitura en Piano Colombia',
      en: '🎉 Congratulations Adolfo! You sold a score on Piano Colombia',
    },
    payout_compositor: {
      es: "💰 [Piano Colombia] Liquidación de Regalías Procesada - BATCH-2026-09-101",
      en: "💰 [Piano Colombia] Royalty Payout Processed - BATCH-2026-09-101",
    },
    aprobacion_compositor: {
      es: "🎉 ¡Tu perfil de compositor ha sido aprobado en Piano Colombia!",
      en: "🎉 Your composer profile has been approved on Piano Colombia!",
    },
    rechazo_compositor: {
      es: "⚠️ Observaciones a tu solicitud de Compositor - Piano Colombia",
      en: "⚠️ Information Review Required - Piano Colombia Composer Application",
    },
    otp_verificacion: {
      es: "🔐 Tu código de verificación de Piano Colombia: 849201",
      en: "🔐 Your Piano Colombia verification code: 849201",
    },
    password_reset: {
      es: "🔑 Código OTP: 519284 - Restablecimiento de Contraseña Piano Colombia",
      en: "🔑 OTP Code: 519284 - Password Reset Piano Colombia",
    },
    partitura_aprobada: {
      es: '🎉 ¡Tu Partitura "Bambuco en Re Mayor" ha sido Aprobada! - Piano Colombia',
      en: '🎉 Your Sheet Music "Bambuco in D Major" has been Approved! - Piano Colombia',
    },
  };

  return (
    <div className="space-y-8 text-[#111C2D]">
      
      {/* Header Módulo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-black/5 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F3FF] border border-[#0071BC]/10 text-[#0071BC] text-[11px] font-extrabold uppercase tracking-wider mb-2 font-montserrat">
            <span className="material-symbols-outlined text-xs">translate</span>
            Plantillas Bilingües Dinámicas (ES / EN) • Motor Resend API & Wompi
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-montserrat text-[#111C2D] tracking-tight">
            Inspector de Plantillas de Email
          </h1>
          <p className="text-xs md:text-sm text-[#4C4546] font-medium max-w-2xl leading-relaxed mt-1">
            Inspecciona las plantillas HTML transaccionales en tiempo real en español o inglés, con detección automática según el idioma de navegación o perfil del usuario.
          </p>
        </div>

        {/* Barra superior de controles: Idioma y Prueba */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Switcher de Idioma para el Inspector */}
          <div className="flex items-center bg-[#F0F3FF] p-1 rounded-xl border border-black/5 font-montserrat text-xs font-bold">
            <button
              type="button"
              onClick={() => setPreviewLang("es")}
              className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                previewLang === "es"
                  ? "bg-[#0071BC] text-white shadow-2xs"
                  : "text-[#4C4546] hover:text-[#111C2D]"
              }`}
            >
              <span>🇪🇸</span>
              <span>Español</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewLang("en")}
              className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                previewLang === "en"
                  ? "bg-[#0071BC] text-white shadow-2xs"
                  : "text-[#4C4546] hover:text-[#111C2D]"
              }`}
            >
              <span>🇺🇸</span>
              <span>English</span>
            </button>
          </div>

          {/* Formulario de envío de prueba */}
          <div className="flex items-center gap-2 bg-[#F0F3FF] p-1.5 rounded-xl border border-black/5 shrink-0">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="correo@destino.com"
              className="px-3 py-2 bg-white rounded-lg text-xs text-[#111C2D] font-mono border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#0071BC] w-44 sm:w-52"
            />
            <button
              type="button"
              disabled={isSendingTest}
              onClick={handleSendTestEmail}
              className="px-3.5 py-2 bg-[#0071BC] hover:bg-[#005996] text-white text-xs font-bold font-montserrat rounded-lg transition shadow-2xs flex items-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              {isSendingTest ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <span className="material-symbols-outlined text-sm">send</span>
              )}
              <span>Probar ({previewLang.toUpperCase()})</span>
            </button>
          </div>
        </div>
      </div>

      {sendSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-medium flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-emerald-600">check_circle</span>
          <span>
            ¡Correo de prueba despachado en <strong>{isEn ? "Inglés (EN)" : "Español (ES)"}</strong> hacia <strong>{testEmail}</strong> mediante el motor Resend API!
          </span>
        </div>
      )}

      {/* Selector de Plantillas (Grid 8 Módulos) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-montserrat">
        
        {/* 1. Compra */}
        <button
          onClick={() => setSelectedTemplate("compra_comprador")}
          className={`p-3.5 rounded-2xl border text-xs font-extrabold text-left transition flex items-center gap-3 ${
            selectedTemplate === "compra_comprador"
              ? "border-[#0071BC] bg-[#F0F3FF] text-[#0071BC] shadow-2xs"
              : "border-black/5 bg-white text-[#4C4546] hover:text-[#111C2D] shadow-2xs"
          }`}
        >
          <span className="material-symbols-outlined text-xl shrink-0 text-[#0071BC]">shopping_cart</span>
          <div>
            <span className="block text-[#111C2D] font-black">{isEn ? "Buyer Purchase" : "Compra Comprador"}</span>
            <span className="text-[10px] font-normal text-[#4C4546]">{isEn ? "PDF License & Download" : "Confirmación & Descarga PDF"}</span>
          </div>
        </button>

        {/* 2. Venta Compositor */}
        <button
          onClick={() => setSelectedTemplate("venta_compositor")}
          className={`p-3.5 rounded-2xl border text-xs font-extrabold text-left transition flex items-center gap-3 ${
            selectedTemplate === "venta_compositor"
              ? "border-[#0071BC] bg-[#F0F3FF] text-[#0071BC] shadow-2xs"
              : "border-black/5 bg-white text-[#4C4546] hover:text-[#111C2D] shadow-2xs"
          }`}
        >
          <span className="material-symbols-outlined text-xl shrink-0 text-[#FBB03B]">payments</span>
          <div>
            <span className="block text-[#111C2D] font-black">{isEn ? "Score Sold Alert" : "Alerta de Venta"}</span>
            <span className="text-[10px] font-normal text-[#4C4546]">{isEn ? "Composer royalty credited" : "Compositor (80% acreditado)"}</span>
          </div>
        </button>

        {/* 3. Payout */}
        <button
          onClick={() => setSelectedTemplate("payout_compositor")}
          className={`p-3.5 rounded-2xl border text-xs font-extrabold text-left transition flex items-center gap-3 ${
            selectedTemplate === "payout_compositor"
              ? "border-[#0071BC] bg-[#F0F3FF] text-[#0071BC] shadow-2xs"
              : "border-black/5 bg-white text-[#4C4546] hover:text-[#111C2D] shadow-2xs"
          }`}
        >
          <span className="material-symbols-outlined text-xl shrink-0 text-emerald-600">account_balance</span>
          <div>
            <span className="block text-[#111C2D] font-black">{isEn ? "Royalty Payout" : "Liquidación Regalías"}</span>
            <span className="text-[10px] font-normal text-[#4C4546]">{isEn ? "Wompi ACH Disbursement" : "Dispersión Wompi Transfer"}</span>
          </div>
        </button>

        {/* 4. Aprobación Compositor */}
        <button
          onClick={() => setSelectedTemplate("aprobacion_compositor")}
          className={`p-3.5 rounded-2xl border text-xs font-extrabold text-left transition flex items-center gap-3 ${
            selectedTemplate === "aprobacion_compositor"
              ? "border-[#0071BC] bg-[#F0F3FF] text-[#0071BC] shadow-2xs"
              : "border-black/5 bg-white text-[#4C4546] hover:text-[#111C2D] shadow-2xs"
          }`}
        >
          <span className="material-symbols-outlined text-base text-[#0071BC]">verified_user</span>
          <div>
            <span className="block text-[#111C2D] font-black">{isEn ? "Composer Approved" : "Compositor Aprobado"}</span>
            <span className="text-[10px] font-normal text-[#4C4546]">{isEn ? "Catalog onboarding welcome" : "Bienvenida al catálogo"}</span>
          </div>
        </button>

        {/* 5. Observaciones Rechazo Compositor */}
        <button
          onClick={() => setSelectedTemplate("rechazo_compositor")}
          className={`p-3.5 rounded-2xl border text-xs font-extrabold text-left transition flex items-center gap-3 ${
            selectedTemplate === "rechazo_compositor"
              ? "border-[#0071BC] bg-[#F0F3FF] text-[#0071BC] shadow-2xs"
              : "border-black/5 bg-white text-[#4C4546] hover:text-[#111C2D] shadow-2xs"
          }`}
        >
          <span className="material-symbols-outlined text-base text-[#C1272D]">rate_review</span>
          <div>
            <span className="block text-[#111C2D] font-black">{isEn ? "Composer Review" : "Observaciones Autor"}</span>
            <span className="text-[10px] font-normal text-[#4C4546]">{isEn ? "Feedback & correction" : "Revisión curatorial requerida"}</span>
          </div>
        </button>

        {/* 6. Partitura Aprobada */}
        <button
          onClick={() => setSelectedTemplate("partitura_aprobada")}
          className={`p-3.5 rounded-2xl border text-xs font-extrabold text-left transition flex items-center gap-3 ${
            selectedTemplate === "partitura_aprobada"
              ? "border-[#0071BC] bg-[#F0F3FF] text-[#0071BC] shadow-2xs"
              : "border-black/5 bg-white text-[#4C4546] hover:text-[#111C2D] shadow-2xs"
          }`}
        >
          <span className="material-symbols-outlined text-base text-emerald-600">music_note</span>
          <div>
            <span className="block text-[#111C2D] font-black">{isEn ? "Score Approved" : "Partitura Aprobada"}</span>
            <span className="text-[10px] font-normal text-[#4C4546]">{isEn ? "Published to store" : "Publicada en la tienda"}</span>
          </div>
        </button>

        {/* 7. Código OTP */}
        <button
          onClick={() => setSelectedTemplate("otp_verificacion")}
          className={`p-3.5 rounded-2xl border text-xs font-extrabold text-left transition flex items-center gap-3 ${
            selectedTemplate === "otp_verificacion"
              ? "border-[#0071BC] bg-[#F0F3FF] text-[#0071BC] shadow-2xs"
              : "border-black/5 bg-white text-[#4C4546] hover:text-[#111C2D] shadow-2xs"
          }`}
        >
          <span className="material-symbols-outlined text-base text-[#0071BC]">lock</span>
          <div>
            <span className="block text-[#111C2D] font-black">{isEn ? "OTP Verification" : "Código OTP"}</span>
            <span className="text-[10px] font-normal text-[#4C4546]">{isEn ? "6-digit registration code" : "Validación de registro"}</span>
          </div>
        </button>

        {/* 8. Restablecimiento Contraseña */}
        <button
          onClick={() => setSelectedTemplate("password_reset")}
          className={`p-3.5 rounded-2xl border text-xs font-extrabold text-left transition flex items-center gap-3 ${
            selectedTemplate === "password_reset"
              ? "border-[#0071BC] bg-[#F0F3FF] text-[#0071BC] shadow-2xs"
              : "border-black/5 bg-white text-[#4C4546] hover:text-[#111C2D] shadow-2xs"
          }`}
        >
          <span className="material-symbols-outlined text-base text-amber-600">key</span>
          <div>
            <span className="block text-[#111C2D] font-black">{isEn ? "Password Reset" : "Reset Contraseña"}</span>
            <span className="text-[10px] font-normal text-[#4C4546]">{isEn ? "Security recovery OTP" : "Recuperación de clave"}</span>
          </div>
        </button>

      </div>

      {/* Visor de Previsualización HTML del Email */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-6">
        
        {/* Cabecera Técnica del Inspector */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-black/5 pb-4 text-xs font-montserrat">
          <div className="space-y-1">
            <div>
              <span className="text-[#4C4546]">Remitente: </span>
              <strong className="text-[#111C2D]">Piano Colombia &lt;notificaciones@pianocolombia.com&gt;</strong>
            </div>
            <div>
              <span className="text-[#4C4546]">Asunto / Subject: </span>
              <strong className="text-[#0071BC] font-mono">{emailSubjects[selectedTemplate][previewLang]}</strong>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#F0F3FF] text-[#0071BC] font-mono font-bold rounded-full border border-black/5 text-[11px]">
              Idioma Activo: {isEn ? "🇺🇸 EN (English)" : "🇪🇸 ES (Español)"}
            </span>
          </div>
        </div>

        {/* Mockup de Email Renderizado */}
        <div className="bg-[#F9F9FF] p-6 sm:p-10 rounded-2xl border border-black/5 max-w-xl mx-auto space-y-6 text-[#111C2D] shadow-sm">
          
          {/* Top Brand Logo Lockup */}
          <div className="text-center border-b border-black/5 pb-6">
            <div className="flex items-center justify-center gap-1 mb-2">
              <div className="h-5 w-1 bg-[#111C2D] rounded-full"></div>
              <div className="h-7 w-1 bg-[#FBB03B] rounded-full"></div>
              <div className="h-4 w-1 bg-[#0071BC] rounded-full"></div>
              <div className="h-6 w-1 bg-[#111C2D] rounded-full"></div>
              <div className="h-3.5 w-1 bg-[#C1272D] rounded-full"></div>
            </div>
            <h2 className="text-xl font-black font-montserrat text-[#111C2D] tracking-tight">PIANO COLOMBIA</h2>
            <p className="text-[10px] font-extrabold text-[#4C4546] uppercase tracking-widest mt-0.5 font-montserrat">
              {isEn ? "Marketplace & Digital Urtext Archive" : "Marketplace & Archivo Digital Urtext"}
            </p>
          </div>

          {/* 1. Compra Comprador */}
          {selectedTemplate === "compra_comprador" && (
            <div className="space-y-4 text-xs leading-relaxed">
              <h3 className="text-lg font-bold font-montserrat text-[#111C2D]">
                {isEn ? "Thank you for your purchase, Juan!" : "¡Gracias por tu compra, Juan!"}
              </h3>
              <p className="text-[#4C4546]">
                {isEn
                  ? "Your payment via Wompi has been successfully approved. Your official sheet music in Urtext PDF format is now ready for download with your personalized legal license watermark."
                  : "Tu pago a través de Wompi ha sido aprobado exitosamente. Ya puedes descargar tu partitura oficial en formato PDF Urtext con tu licencia legal nominativa estampada."}
              </p>
              <div className="p-4 bg-white rounded-xl border border-black/5 space-y-1 font-mono text-[11px] shadow-2xs">
                <p className="text-[#0071BC] font-bold">
                  {isEn ? "🎼 Piece: Bambuco in D Major — Adolfo Mejía" : "🎼 Obra: Bambuco en Re Mayor — Adolfo Mejía"}
                </p>
                <p className="text-[#4C4546]">{isEn ? "🎹 Composer: Adolfo Mejía" : "🎹 Compositor: Adolfo Mejía"}</p>
                <p className="text-[#4C4546]">{isEn ? "💳 Amount Paid: $45.000 COP" : "💳 Valor Pagado: $45.000 COP"}</p>
                <p className="text-[#64748b]">{isEn ? "Token: wmp-dl-9812-ad82-411" : "Token de Descarga: wmp-dl-9812-ad82-411"}</p>
              </div>
              <div className="text-center pt-2">
                <Link
                  href="/mi-cuenta/descargas"
                  className="inline-block px-6 py-3.5 bg-[#FBB03B] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl font-montserrat shadow-md hover:bg-[#e09b2d] transition"
                >
                  {isEn ? "📥 Download Watermarked PDF" : "📥 Descargar Partitura PDF Firmada"}
                </Link>
              </div>
              <p className="text-[11px] text-[#94a3b8] text-center pt-2 leading-relaxed">
                {isEn
                  ? "This license is personal and non-transferable. Includes 1 authorized print copy for individual study or concert performance."
                  : "Esta licencia es nominal e intransferible. Incluye 1 copia impresa autorizada para estudio o concierto."}
              </p>
            </div>
          )}

          {/* 2. Venta Compositor */}
          {selectedTemplate === "venta_compositor" && (
            <div className="space-y-4 text-xs leading-relaxed">
              <h3 className="text-lg font-bold font-montserrat text-[#111C2D]">
                {isEn ? "🎉 Congratulations, Adolfo! You sold a score" : "🎉 ¡Felicidades, Adolfo! Has vendido una partitura"}
              </h3>
              <p className="text-[#4C4546]">
                {isEn
                  ? "A pianist just purchased a digital Urtext license for your work \"Bambuco in D Major\" via Wompi."
                  : 'Un pianista acaba de adquirir una licencia digital de tu obra "Bambuco en Re Mayor" vía Wompi.'}
              </p>
              <div className="p-4 bg-white rounded-xl border border-black/5 space-y-1 font-mono text-[11px] shadow-2xs">
                <p>{isEn ? "Retail Price (100%):" : "Monto PVP de Venta:"} <strong className="text-[#111C2D]">$45.000 COP</strong></p>
                <p>{isEn ? "Platform Fee (20%):" : "Comisión Mantenimiento PC (20%):"} <span className="text-[#C1272D]">-$9.000 COP</span></p>
                <p className="text-[#0071BC] font-bold">{isEn ? "Your Net Royalty (80%): $36.000 COP" : "Tu Ganancia Neta Acreditada (80%): $36.000 COP"}</p>
              </div>
              <p className="text-[11px] text-[#4C4546]">
                {isEn
                  ? "This balance has been credited to your accumulated total for the upcoming bi-weekly disbursement via Wompi Transfer to your registered bank account."
                  : "Este saldo ha sido sumado a tu acumulado para la próxima dispersión quincenal por Wompi Transfer hacia tu cuenta bancaria registrada."}
              </p>
            </div>
          )}

          {/* 3. Payout Compositor */}
          {selectedTemplate === "payout_compositor" && (
            <div className="space-y-4 text-xs leading-relaxed">
              <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 font-extrabold text-[11px] rounded-full uppercase tracking-wider">
                {isEn ? "💰 Royalty Payout Processed" : "💰 Liquidación de Regalías Procesada"}
              </div>
              <h3 className="text-lg font-bold font-montserrat text-[#111C2D]">
                {isEn ? "Dear Maestro Adolfo Mejía," : "Estimado(a) Maestro Adolfo Mejía,"}
              </h3>
              <p className="text-[#4C4546]">
                {isEn
                  ? "We have processed the royalty disbursement for the sales of your musical works on Piano Colombia."
                  : "Nos complace informarte que hemos procesado la dispersión de regalías por las ventas de tus obras musicales en la plataforma Piano Colombia."}
              </p>
              <div className="bg-gradient-to-r from-[#0071BC] to-[#005996] p-4 rounded-xl text-white text-center">
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-85">
                  {isEn ? "Net Transferred Amount" : "Valor Neto Transferido"}
                </span>
                <div className="text-2xl font-black font-mono mt-1">$1.512.000 COP</div>
                <span className="text-[10px] opacity-75">{isEn ? "Batch: BATCH-2026-09-101" : "Lote Oficial: BATCH-2026-09-101"}</span>
              </div>
              <div className="p-4 bg-white rounded-xl border border-black/5 space-y-1 font-mono text-[11px] shadow-2xs">
                <p>{isEn ? "Destination Bank:" : "Cuenta Destino:"} <strong>Bancolombia (Ahorros ***28412)</strong></p>
                <p>{isEn ? "Account Holder:" : "Titular:"} Adolfo Mejía (CC 19.482.910)</p>
                <p>{isEn ? "Wompi Transfer Ref:" : "Ref. Wompi:"} WMP-TR-8472910482</p>
              </div>
              <div className="text-center pt-2">
                <Link
                  href="/compositor/dashboard/pagos"
                  className="inline-block px-6 py-3 bg-[#0071BC] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl font-montserrat shadow-md hover:bg-[#005996] transition"
                >
                  {isEn ? "View My Payout Dashboard" : "Ver Mi Tablero de Pagos"}
                </Link>
              </div>
            </div>
          )}

          {/* 4. Aprobación Compositor */}
          {selectedTemplate === "aprobacion_compositor" && (
            <div className="space-y-4 text-xs leading-relaxed">
              <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 font-extrabold text-[11px] rounded-full uppercase tracking-wider">
                {isEn ? "Application Approved" : "Solicitud Aprobada"}
              </div>
              <h3 className="text-lg font-bold font-montserrat text-[#111C2D]">
                {isEn ? "Welcome to Piano Colombia! Profile Approved 🎹" : "¡Felicitaciones, maestro(a) Adolfo Mejía! 🎹"}
              </h3>
              <p className="text-[#4C4546]">
                {isEn
                  ? "We are pleased to inform you that the Piano Colombia curation and moderation team has reviewed and successfully approved your composer profile."
                  : "Nos complace informarte que el equipo de moderación y administración de Piano Colombia ha revisado y aprobado satisfactoriamente tu perfil de compositor."}
              </p>
              <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl text-emerald-900 space-y-1 text-xs">
                <strong className="block font-bold">
                  {isEn ? "✨ Next step: Publishing your scores" : "✨ Próximo paso: Publicación de tus Obras"}
                </strong>
                <p className="text-[11px]">
                  {isEn
                    ? "Remember that for your official profile to become visible to the public in the store, you must have at least one approved sheet music piece."
                    : "Recuerda que para que tu perfil oficial de compositor sea visible al público en la tienda de Piano Colombia, debes tener al menos una partitura aprobada."}
                </p>
              </div>
              <div className="text-center pt-2">
                <Link
                  href="/compositor/login"
                  className="inline-block px-6 py-3.5 bg-[#FBB03B] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl font-montserrat shadow-md hover:bg-[#e09b2d] transition"
                >
                  {isEn ? "🚀 Access Composer Portal" : "🚀 Ingresar a mi Panel de Compositor"}
                </Link>
              </div>
            </div>
          )}

          {/* 5. Observaciones Rechazo Compositor */}
          {selectedTemplate === "rechazo_compositor" && (
            <div className="space-y-4 text-xs leading-relaxed">
              <div className="inline-block px-3 py-1 bg-amber-50 text-amber-900 font-extrabold text-[11px] rounded-full uppercase tracking-wider">
                {isEn ? "Information Review Required" : "Revisión de Información Requerida"}
              </div>
              <h3 className="text-lg font-bold font-montserrat text-[#111C2D]">
                {isEn ? "Dear Adolfo Mejía," : "Estimado(a) Adolfo Mejía,"}
              </h3>
              <p className="text-[#4C4546]">
                {isEn
                  ? "Our curation team has reviewed your application to join the Piano Colombia authors catalog. In order for your application to be approved, please review and adjust the following details:"
                  : "El equipo de moderación ha revisado tu postulación para unirte al catálogo de autores de Piano Colombia. Para que tu solicitud pueda ser aprobada formalmente, requerimos que organices y ajustes la siguiente información:"}
              </p>
              <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-red-900 space-y-1 text-xs">
                <strong className="block font-bold">
                  {isEn ? "📝 Moderator / Admin Observations:" : "📝 Observaciones del Administrador / Moderador:"}
                </strong>
                <p className="text-[11px] italic bg-white p-2.5 rounded-lg border border-red-200">
                  {isEn
                    ? '"Please provide a high-resolution author portrait photo and complete the biographical summary with academic background."'
                    : '"Por favor suministra una fotografía de autor en alta resolución y completa la reseña biográfica con trayectoria académica."'}
                </p>
              </div>
              <div className="text-center pt-2">
                <Link
                  href="/compositor/dashboard/perfil"
                  className="inline-block px-6 py-3.5 bg-[#0071BC] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl font-montserrat shadow-md hover:bg-[#005996] transition"
                >
                  {isEn ? "✏️ Update Information & Re-submit Profile" : "✏️ Corregir Información y Reenviar Perfil"}
                </Link>
              </div>
            </div>
          )}

          {/* 6. Partitura Aprobada */}
          {selectedTemplate === "partitura_aprobada" && (
            <div className="space-y-4 text-xs leading-relaxed">
              <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 font-extrabold text-[11px] rounded-full uppercase tracking-wider">
                {isEn ? "🎉 Sheet Music Approved & Published" : "🎉 Obra Aprobada & Publicada"}
              </div>
              <h3 className="text-lg font-bold font-montserrat text-[#111C2D]">
                {isEn ? "Congratulations, Adolfo Mejía!" : "¡Felicitaciones, Adolfo Mejía!"}
              </h3>
              <p className="text-[#4C4546]">
                {isEn
                  ? 'We are pleased to inform you that your piece "Bambuco in D Major" has successfully passed our technical and musicological review.'
                  : 'Nos complace informarte que tu obra "Bambuco en Re Mayor" ha superado con éxito la revisión técnica y musicológica.'}
              </p>
              <p className="text-[#4C4546]">
                {isEn
                  ? "Your sheet music is now published and active in the Piano Colombia store catalog, with protected previews, ready to be purchased and studied worldwide."
                  : "Tu partitura ya se encuentra publicada y visible en el catálogo de la tienda de Piano Colombia, con sus muestras protegidas y lista para ser adquirida por pianistas de todo el mundo."}
              </p>
              <div className="text-center pt-2">
                <Link
                  href="/tienda"
                  className="inline-block px-6 py-3.5 bg-[#10B981] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl font-montserrat shadow-md hover:bg-[#059669] transition"
                >
                  {isEn ? "View in Store Catalog" : "Ver Catálogo en la Tienda"}
                </Link>
              </div>
            </div>
          )}

          {/* 7. Código OTP */}
          {selectedTemplate === "otp_verificacion" && (
            <div className="space-y-4 text-xs leading-relaxed text-center">
              <div className="w-12 h-12 bg-[#F0F3FF] rounded-2xl mx-auto flex items-center justify-center text-2xl">
                🔐
              </div>
              <h3 className="text-lg font-bold font-montserrat text-[#111C2D]">
                {isEn ? "Verify your email address" : "Verifica tu correo electrónico"}
              </h3>
              <p className="text-[#4C4546] max-w-sm mx-auto">
                {isEn
                  ? "Hello Juan, you are one step away from completing your account on Piano Colombia. Enter the following 6-digit security code:"
                  : "Hola Juan, estás a un paso de crear tu cuenta en Piano Colombia. Ingresa el siguiente código de seguridad de 6 dígitos:"}
              </p>
              <div className="p-4 bg-[#F0F3FF] border-2 border-dashed border-[#0071BC] rounded-2xl max-w-xs mx-auto text-2xl font-black font-mono text-[#0071BC] tracking-[8px]">
                849201
              </div>
              <p className="text-[11px] text-[#64748b]">
                {isEn
                  ? "⏱️ This code is valid for the next 10 minutes. If you did not request this account, you can safely ignore this email."
                  : "⏱️ Este código es válido durante los próximos 10 minutos. Si tú no solicitaste esta cuenta, puedes ignorar este mensaje."}
              </p>
            </div>
          )}

          {/* 8. Password Reset */}
          {selectedTemplate === "password_reset" && (
            <div className="space-y-4 text-xs leading-relaxed text-center">
              <div className="w-12 h-12 bg-[#FFF7ED] rounded-2xl mx-auto flex items-center justify-center text-2xl">
                🔑
              </div>
              <h3 className="text-lg font-bold font-montserrat text-[#111C2D]">
                {isEn ? "Reset your Password" : "Restablece tu Contraseña"}
              </h3>
              <p className="text-[#4C4546] max-w-sm mx-auto">
                {isEn
                  ? "Hello Juan, we received a request to reset the password for your Piano Colombia account. Enter this 6-digit security code:"
                  : "Hola Juan, hemos recibido una solicitud para cambiar la contraseña de tu cuenta en Piano Colombia. Ingresa este código de seguridad de 6 dígitos:"}
              </p>
              <div className="p-4 bg-[#FFF7ED] border-2 border-dashed border-[#EA580C] rounded-2xl max-w-xs mx-auto text-2xl font-black font-mono text-[#C2410C] tracking-[8px]">
                519284
              </div>
              <p className="text-[11px] text-[#64748b]">
                {isEn
                  ? "⏱️ This code will expire in 10 minutes. If you did not make this request, you can safely ignore this email."
                  : "⏱️ Este código expirará en 10 minutos. Si tú no realizaste esta solicitud, puedes ignorar este correo."}
              </p>
            </div>
          )}

          {/* Footer Email */}
          <div className="text-center border-t border-black/5 pt-4 text-[10px] text-[#4C4546] font-montserrat">
            <p>
              {isEn
                ? "© 2026 Piano Colombia — Colombian Piano Heritage & Urtext Repertoire."
                : "© 2026 Piano Colombia — Obra, Patrimonio y Música Pianística Colombiana."}
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
