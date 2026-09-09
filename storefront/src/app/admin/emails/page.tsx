"use client";

import { useState } from "react";
import Link from "next/link";

export default function AdminEmailsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<"compra_comprador" | "venta_compositor" | "payout_compositor" | "aprobacion_compositor">("compra_comprador");
  const [testEmail, setTestEmail] = useState("admin@pianocolombia.com");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const handleSendTestEmail = () => {
    setIsSendingTest(true);
    setSendSuccess(false);

    setTimeout(() => {
      setIsSendingTest(false);
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 4000);
    }, 900);
  };

  return (
    <div className="space-y-8 text-[#111C2D]">
      
      {/* Header Módulo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-black/5 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F3FF] border border-[#0071BC]/10 text-[#0071BC] text-[11px] font-extrabold uppercase tracking-wider mb-2 font-montserrat">
            <span className="material-symbols-outlined text-xs">mail</span>
            Notificaciones Transaccionales • Motor Resend API & Wompi
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-montserrat text-[#111C2D] tracking-tight">
            Inspector de Plantillas de Email
          </h1>
          <p className="text-xs md:text-sm text-[#4C4546] font-medium max-w-2xl leading-relaxed mt-1">
            Inspecciona, valida y prueba el envío de las plantillas HTML enviadas automáticamente a compradores y compositores en cada evento de la plataforma.
          </p>
        </div>

        {/* Formulario de envío de prueba */}
        <div className="flex items-center gap-2 bg-[#F0F3FF] p-2 rounded-xl border border-black/5 shrink-0">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="correo@destino.com"
            className="px-3 py-2 bg-white rounded-lg text-xs text-[#111C2D] font-mono border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#0071BC] w-48 sm:w-56"
          />
          <button
            type="button"
            disabled={isSendingTest}
            onClick={handleSendTestEmail}
            className="px-4 py-2 bg-[#0071BC] hover:bg-[#005996] text-white text-xs font-bold font-montserrat rounded-lg transition shadow-2xs flex items-center gap-1.5 shrink-0 disabled:opacity-50"
          >
            {isSendingTest ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span className="material-symbols-outlined text-sm">send</span>
            )}
            <span>Enviar Prueba</span>
          </button>
        </div>
      </div>

      {sendSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-medium flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-emerald-600">check_circle</span>
          <span>¡Correo de prueba despachado con éxito hacia <strong>{testEmail}</strong> mediante el motor Resend API!</span>
        </div>
      )}

      {/* Selector de Plantillas (Grid 4 Módulos) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-montserrat">
        <button
          onClick={() => setSelectedTemplate("compra_comprador")}
          className={`p-4 rounded-2xl border text-xs font-extrabold text-left transition flex items-center gap-3 ${
            selectedTemplate === "compra_comprador"
              ? "border-[#0071BC] bg-[#F0F3FF] text-[#0071BC] shadow-2xs"
              : "border-black/5 bg-white text-[#4C4546] hover:text-[#111C2D] shadow-2xs"
          }`}
        >
          <span className="material-symbols-outlined text-xl shrink-0">shopping_cart</span>
          <div>
            <span className="block text-[#111C2D]">Comprador</span>
            <span className="text-[10px] font-normal text-[#4C4546]">Confirmación & Descarga PDF</span>
          </div>
        </button>

        <button
          onClick={() => setSelectedTemplate("venta_compositor")}
          className={`p-4 rounded-2xl border text-xs font-extrabold text-left transition flex items-center gap-3 ${
            selectedTemplate === "venta_compositor"
              ? "border-[#0071BC] bg-[#F0F3FF] text-[#0071BC] shadow-2xs"
              : "border-black/5 bg-white text-[#4C4546] hover:text-[#111C2D] shadow-2xs"
          }`}
        >
          <span className="material-symbols-outlined text-xl shrink-0 text-[#FBB03B]">payments</span>
          <div>
            <span className="block text-[#111C2D]">Compositor</span>
            <span className="text-[10px] font-normal text-[#4C4546]">Alerta de Nueva Venta (80%)</span>
          </div>
        </button>

        <button
          onClick={() => setSelectedTemplate("payout_compositor")}
          className={`p-4 rounded-2xl border text-xs font-extrabold text-left transition flex items-center gap-3 ${
            selectedTemplate === "payout_compositor"
              ? "border-[#0071BC] bg-[#F0F3FF] text-[#0071BC] shadow-2xs"
              : "border-black/5 bg-white text-[#4C4546] hover:text-[#111C2D] shadow-2xs"
          }`}
        >
          <span className="material-symbols-outlined text-xl shrink-0 text-emerald-600">account_balance</span>
          <div>
            <span className="block text-[#111C2D]">Compositor</span>
            <span className="text-[10px] font-normal text-[#4C4546]">Liquidación Wompi Transfer</span>
          </div>
        </button>

        <button
          onClick={() => setSelectedTemplate("aprobacion_compositor")}
          className={`p-4 rounded-2xl border text-xs font-extrabold text-left transition flex items-center gap-3 ${
            selectedTemplate === "aprobacion_compositor"
              ? "border-[#0071BC] bg-[#F0F3FF] text-[#0071BC] shadow-2xs"
              : "border-black/5 bg-white text-[#4C4546] hover:text-[#111C2D] shadow-2xs"
          }`}
        >
          <span className="material-symbols-outlined text-base text-[#0071BC]">verified_user</span>
          <div>
            <span className="block text-[#111C2D]">Compositor</span>
            <span className="text-[10px] font-normal text-[#4C4546]">Cuenta Aprobada por Mesa</span>
          </div>
        </button>
      </div>

      {/* Visor de Previsualización HTML del Email */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-black/5 pb-4 text-xs font-montserrat">
          <div>
            <span className="text-[#4C4546]">Remitente Oficial: </span>
            <strong className="text-[#111C2D]">Piano Colombia &lt;notificaciones@pianocolombia.com&gt;</strong>
          </div>
          <span className="px-3 py-1 bg-[#F0F3FF] text-[#0071BC] font-mono font-bold rounded-full border border-black/5">
            Motor: Resend API Cifrado 256-bit • Wompi
          </span>
        </div>

        {/* Mockup de Email Renderizado */}
        <div className="bg-[#F9F9FF] p-8 sm:p-12 rounded-2xl border border-black/5 max-w-xl mx-auto space-y-6 text-[#111C2D] shadow-sm">
          
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
              Marketplace & Archivo Editorial de Partituras
            </p>
          </div>

          {/* Cuerpo del Email */}
          {selectedTemplate === "compra_comprador" && (
            <div className="space-y-4 text-xs leading-relaxed">
              <h3 className="text-lg font-bold font-montserrat text-[#111C2D]">¡Gracias por tu compra, Juan!</h3>
              <p className="text-[#4C4546]">
                Tu transacción a través de la pasarela Wompi ha sido procesada exitosamente. Ponemos a tu disposición la descarga directa de tu partitura en formato PDF Urtext con tu <strong>estampa legal nominativa incorporada</strong>.
              </p>
              <div className="p-4 bg-white rounded-xl border border-black/5 space-y-1 font-mono text-[11px] shadow-2xs">
                <p className="text-[#0071BC] font-bold">📄 Obra: Bambuco en Re Mayor — Adolfo Mejía</p>
                <p className="text-[#4C4546]">Licencia: 1 Copia Impresa Autorizada</p>
                <p className="text-[#4C4546]">ISMN: 979-0-901314-02-1</p>
                <p className="text-[#4C4546]">Referencia Wompi: WMP-TX-8472910482</p>
              </div>
              <div className="text-center pt-2">
                <Link
                  href="/mi-cuenta/descargas"
                  className="inline-block px-6 py-3.5 bg-[#FBB03B] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl font-montserrat shadow-md hover:bg-[#e09b2d] transition"
                >
                  Descargar Partitura PDF Firmada
                </Link>
              </div>
            </div>
          )}

          {selectedTemplate === "venta_compositor" && (
            <div className="space-y-4 text-xs leading-relaxed">
              <h3 className="text-lg font-bold font-montserrat text-[#111C2D]">🎉 ¡Felicidades, Adolfo! Has vendido una partitura</h3>
              <p className="text-[#4C4546]">
                Un pianista acaba de adquirir una licencia digital de tu obra <strong className="text-[#111C2D]">"Bambuco en Re Mayor"</strong> vía Wompi.
              </p>
              <div className="p-4 bg-white rounded-xl border border-black/5 space-y-1 font-mono text-[11px] shadow-2xs">
                <p>Monto PVP de Venta: <strong className="text-[#111C2D]">$45.000 COP</strong></p>
                <p>Comisión Mantenimiento PC (20%): <span className="text-[#C1272D]">$9.000 COP</span></p>
                <p className="text-[#0071BC] font-bold">Tu Ganancia Neta Acreditada (80%): $36.000 COP</p>
              </div>
              <p className="text-[11px] text-[#4C4546]">
                Este saldo ha sido sumado a tu acumulado para la próxima dispersión quincenal por Wompi Transfer API hacia tu cuenta bancaria registrada.
              </p>
            </div>
          )}

          {selectedTemplate === "payout_compositor" && (
            <div className="space-y-4 text-xs leading-relaxed">
              <h3 className="text-lg font-bold font-montserrat text-[#111C2D]">💰 Transferencia de Regalías Wompi Ejecutada</h3>
              <p className="text-[#4C4546]">
                Hemos transferido tus regalías netas del periodo (80% autor) directamente a tu cuenta bancaria registrada mediante Wompi Transfer API.
              </p>
              <div className="p-4 bg-white rounded-xl border border-black/5 space-y-1 font-mono text-[11px] shadow-2xs">
                <p>Lote de Dispersión Wompi: <strong className="text-[#0071BC]">BATCH-2026-09-101</strong></p>
                <p>Monto Transferido: <strong className="text-emerald-800 font-bold">$1.512.000 COP</strong></p>
                <p className="text-[#4C4546]">Entidad Destino: Bancolombia (Ahorros ***28412)</p>
                <p className="text-[#4C4546]">Titular: Adolfo Mejía (CC 19.482.910)</p>
              </div>
            </div>
          )}

          {selectedTemplate === "aprobacion_compositor" && (
            <div className="space-y-4 text-xs leading-relaxed">
              <h3 className="text-lg font-bold font-montserrat text-[#111C2D]">¡Bienvenido a Piano Colombia! Cuenta Aprobada</h3>
              <p className="text-[#4C4546]">
                Nos complace informarte que tu solicitud de registro como compositor ha sido verificada y <strong className="text-emerald-700 font-bold">Aprobada por nuestra Mesa Técnica</strong>.
              </p>
              <p className="text-[#4C4546]">
                Tu cuenta bancaria ha sido validada para transferencias de regalías vía Wompi. Ya puedes ingresar al portal con tus credenciales autorizadas para empezar a cargar y gestionar tu catálogo de partituras.
              </p>
              <div className="text-center pt-2">
                <Link
                  href="/compositor/login"
                  className="inline-block px-6 py-3.5 bg-[#FBB03B] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl font-montserrat shadow-md hover:bg-[#e09b2d] transition"
                >
                  Acceder a mi Portal de Compositor
                </Link>
              </div>
            </div>
          )}

          {/* Footer Email */}
          <div className="text-center border-t border-black/5 pt-4 text-[10px] text-[#4C4546] font-montserrat">
            <p>© 2026 Piano Colombia — Obra, Patrimonio y Música Pianística Colombiana.</p>
          </div>

        </div>
      </div>

    </div>
  );
}
