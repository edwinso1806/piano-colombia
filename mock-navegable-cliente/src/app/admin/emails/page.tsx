"use client";

import { useState } from "react";
import Link from "next/link";

export default function AdminEmailsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<"compra_comprador" | "venta_compositor" | "payout_compositor" | "aprobacion_compositor">("compra_comprador");

  return (
    <div className="space-y-8 text-[#111C2D]">
      
      {/* Header Módulo */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F3FF] border border-[#0071BC]/10 text-[#0071BC] text-[11px] font-extrabold uppercase tracking-wider mb-2 font-montserrat">
          <span className="material-symbols-outlined text-xs">mail</span>
          Notificaciones Transaccionales • Motor Resend API
        </div>
        <h1 className="text-3xl font-black font-montserrat text-[#111C2D] tracking-tight">
          Inspector de Plantillas de Email
        </h1>
        <p className="text-xs md:text-sm text-[#4C4546] font-medium max-w-2xl leading-relaxed">
          Inspecciona y valida las plantillas HTML enviadas automáticamente a compradores y compositores en cada evento de la plataforma.
        </p>
      </div>

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
            <span className="text-[10px] font-normal text-[#4C4546]">Confirmación & Descarga</span>
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
            <span className="text-[10px] font-normal text-[#4C4546]">Alerta de Nueva Venta</span>
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
            <span className="text-[10px] font-normal text-[#4C4546]">Pago Recibido (PayPal)</span>
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
            <span className="text-[10px] font-normal text-[#4C4546]">Cuenta Aprobada</span>
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
            Motor: Resend API Cifrado 256-bit
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
                Tu transacción ha sido procesada exitosamente. Adjuntamos y ponemos a tu disposición la descarga directa de tu partitura en formato PDF Urtext con tu estampa legal nominativa incorporada.
              </p>
              <div className="p-4 bg-white rounded-xl border border-black/5 space-y-1 font-mono text-[11px] shadow-2xs">
                <p className="text-[#0071BC] font-bold">📄 Obra: Bambuco en Re Mayor — Adolfo Mejía</p>
                <p className="text-[#4C4546]">Licencia: 1 Copia Impresa Autorizada</p>
                <p className="text-[#4C4546]">ISMN: 979-0-901314-02-1</p>
              </div>
              <div className="text-center pt-2">
                <a
                  href="#"
                  className="inline-block px-6 py-3.5 bg-[#FBB03B] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl font-montserrat shadow-md"
                >
                  Descargar Partitura PDF Firmada
                </a>
              </div>
            </div>
          )}

          {selectedTemplate === "venta_compositor" && (
            <div className="space-y-4 text-xs leading-relaxed">
              <h3 className="text-lg font-bold font-montserrat text-[#111C2D]">🎉 ¡Felicidades, Adolfo! Has vendido una partitura</h3>
              <p className="text-[#4C4546]">
                Un pianista acaba de adquirir una licencia digital de tu obra <strong className="text-[#111C2D]">"Bambuco en Re Mayor"</strong>.
              </p>
              <div className="p-4 bg-white rounded-xl border border-black/5 space-y-1 font-mono text-[11px] shadow-2xs">
                <p>Monto PVP de Venta: <strong className="text-[#111C2D]">$45.000 COP</strong></p>
                <p>Comisión Mantenimiento PC (20%): <span className="text-[#C1272D]">$9.000 COP</span></p>
                <p className="text-[#0071BC] font-bold">Tu Ganancia Neta Acreditada (80%): $36.000 COP</p>
              </div>
              <p className="text-[11px] text-[#4C4546]">
                Este saldo ha sido sumado a tu acumulado para la próxima dispersión quincenal por PayPal Payouts.
              </p>
            </div>
          )}

          {selectedTemplate === "payout_compositor" && (
            <div className="space-y-4 text-xs leading-relaxed">
              <h3 className="text-lg font-bold font-montserrat text-[#111C2D]">💰 Transferencia de Regalías Ejecutada</h3>
              <p className="text-[#4C4546]">
                Hemos transferido tus ganancias acumuladas del periodo a tu cuenta registrada en PayPal Payouts.
              </p>
              <div className="p-4 bg-white rounded-xl border border-black/5 space-y-1 font-mono text-[11px] shadow-2xs">
                <p>Lote de Dispersión ID: <strong className="text-[#0071BC]">PO-98402</strong></p>
                <p>Monto Depositado: <strong className="text-[#111C2D]">$504.000 COP ($126 USD)</strong></p>
                <p className="text-[#4C4546]">Cuenta Destino: adolfo.mejia@paypal.com</p>
              </div>
            </div>
          )}

          {selectedTemplate === "aprobacion_compositor" && (
            <div className="space-y-4 text-xs leading-relaxed">
              <h3 className="text-lg font-bold font-montserrat text-[#111C2D]">¡Bienvenido a Piano Colombia! Cuenta Aprobada</h3>
              <p className="text-[#4C4546]">
                Nos complace informarte que tu solicitud de registro como compositor ha sido verificada y <strong className="text-emerald-700 font-bold">Aprobada</strong>.
              </p>
              <p className="text-[#4C4546]">
                Ya puedes ingresar al portal con tus credenciales autorizadas para empezar a cargar y gestionar tu catálogo de partituras.
              </p>
              <div className="text-center pt-2">
                <a
                  href="#"
                  className="inline-block px-6 py-3.5 bg-[#FBB03B] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl font-montserrat shadow-md"
                >
                  Acceder a mi Dashboard de Compositor
                </a>
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
