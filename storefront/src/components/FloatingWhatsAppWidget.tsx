"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import {
  getCmsWhatsAppApi,
  CmsWhatsAppSettings,
  DEFAULT_CMS_WHATSAPP_SETTINGS,
} from "@/lib/api-client";

export default function FloatingWhatsAppWidget() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const isEn = language === "en";

  const [settings, setSettings] = useState<CmsWhatsAppSettings>(DEFAULT_CMS_WHATSAPP_SETTINGS);
  const [isOpen, setIsOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState<"customer" | "composer">("customer");
  const [customMessage, setCustomMessage] = useState("");

  // Cargar configuración de WhatsApp desde el CMS
  useEffect(() => {
    getCmsWhatsAppApi()
      .then((data) => {
        if (data && data.customer_support && data.composer_support) {
          setSettings(data);
        }
      })
      .catch(() => {});
  }, []);

  // Seleccionar automáticamente el canal adecuado según la ruta activa
  useEffect(() => {
    if (pathname?.startsWith("/compositor")) {
      setActiveChannel("composer");
    } else {
      setActiveChannel("customer");
    }
  }, [pathname]);

  // Si estamos en cualquier página administrativa de /admin, ocultar el widget
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const channel = activeChannel === "composer" ? settings.composer_support : settings.customer_support;

  // Si el canal actual está desactivado y el otro también, no mostrar nada
  if (!channel.is_active && !settings.customer_support.is_active && !settings.composer_support.is_active) {
    return null;
  }

  const label = isEn ? channel.label_en : channel.label_es;
  const agentName = isEn ? channel.agent_name_en : channel.agent_name_es;
  const responseTime = isEn ? channel.response_time_en : channel.response_time_es;
  const welcomeBubble = isEn ? channel.welcome_bubble_en : channel.welcome_bubble_es;
  const defaultMsg = isEn ? channel.default_message_en : channel.default_message_es;

  // Limpiar el teléfono para que solo contenga dígitos numéricos
  const cleanPhone = (channel.phone || "").replace(/\D/g, "");

  const handleOpenChat = () => {
    const textToSend = customMessage.trim() || defaultMsg;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(textToSend)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <aside
      aria-label={label}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 font-sans max-w-[calc(100vw-2rem)]"
    >
      {/* VENTANA EMERGENTE DE CHAT WHATSAPP ("LA VENTANA PARA EL CLIENTE") */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2.5rem)] sm:w-96 bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Cabecera de la Ventana */}
          <div className="bg-[#111C2D] text-white p-4 sm:p-5 relative">
            {/* Botón Cerrar Ventana */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              title={isEn ? "Close chat window" : "Cerrar ventana de atención"}
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>

            {/* Selector de Canal / Pestañas (si ambos están activos) */}
            {settings.customer_support.is_active && settings.composer_support.is_active && (
              <div className="flex items-center gap-1.5 p-1 bg-white/10 rounded-xl mb-3.5 max-w-[280px]">
                <button
                  type="button"
                  onClick={() => {
                    setActiveChannel("customer");
                    setCustomMessage("");
                  }}
                  className={`flex-1 py-1 px-2.5 rounded-lg text-[11px] font-bold transition font-montserrat flex items-center justify-center gap-1.5 ${
                    activeChannel === "customer"
                      ? "bg-[#0071BC] text-white shadow-xs"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  <span className="material-symbols-outlined text-xs">storefront</span>
                  <span>{isEn ? "Store / Customer" : "Tienda / Clientes"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveChannel("composer");
                    setCustomMessage("");
                  }}
                  className={`flex-1 py-1 px-2.5 rounded-lg text-[11px] font-bold transition font-montserrat flex items-center justify-center gap-1.5 ${
                    activeChannel === "composer"
                      ? "bg-[#FBB03B] text-[#111C2D] shadow-xs"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  <span className="material-symbols-outlined text-xs">music_note</span>
                  <span>{isEn ? "Composers" : "Compositores"}</span>
                </button>
              </div>
            )}

            {/* Perfil del Agente */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-emerald-400 font-bold">
                  <span className="material-symbols-outlined text-2xl">chat</span>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#111C2D]"></span>
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold font-montserrat text-white truncate">
                    Piano Colombia
                  </h4>
                  <span className="material-symbols-outlined text-xs text-blue-400" title="Canal Verificado">
                    verified
                  </span>
                </div>
                <p className="text-xs text-emerald-400 font-semibold truncate font-montserrat">
                  {agentName}
                </p>
                <p className="text-[10px] text-white/60 truncate">
                  {responseTime}
                </p>
              </div>
            </div>
          </div>

          {/* Cuerpo del Chat (Burbuja de Saludo WhatsApp) */}
          <div className="p-4 bg-[#ECE5DD]/40 space-y-3 max-h-60 overflow-y-auto">
            <div className="flex justify-center">
              <span className="text-[10px] bg-black/10 text-slate-600 px-2.5 py-0.5 rounded-full font-medium">
                {isEn ? "Official WhatsApp Support" : "Canal Oficial WhatsApp"}
              </span>
            </div>

            <div className="flex items-start gap-2 max-w-[90%]">
              <div className="bg-white rounded-2xl rounded-tl-xs p-3.5 shadow-xs text-xs text-[#111C2D] space-y-1.5 leading-relaxed">
                <p className="font-bold text-[#0071BC] text-[11px] font-montserrat">
                  Piano Colombia • {label}
                </p>
                <p>{welcomeBubble}</p>
                <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 pt-1">
                  <span>En línea</span>
                  <span className="material-symbols-outlined text-xs text-blue-500">done_all</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pie de la Ventana: Redacción y Lanzamiento a WhatsApp */}
          <div className="p-4 bg-white border-t border-black/5 space-y-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 font-montserrat">
                {isEn ? "Your message (preview or custom):" : "Tu mensaje (personalizable):"}
              </label>
              <textarea
                rows={2}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder={defaultMsg}
                className="w-full bg-[#F0F3FF] border border-black/10 rounded-xl px-3 py-2 text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC] resize-none"
              ></textarea>
            </div>

            <button
              type="button"
              onClick={handleOpenChat}
              className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.99] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">send</span>
              <span>{isEn ? "Open WhatsApp & Chat" : "Iniciar Chat en WhatsApp"}</span>
            </button>
          </div>
        </div>
      )}

      {/* BOTÓN FLOTANTE PRINCIPAL (PÍLDORA CON ESTADO ACTIVO) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? (isEn ? "Minimize support" : "Minimizar soporte") : `${label} - Piano Colombia`}
        className="flex items-center gap-2 sm:gap-2.5 bg-white hover:bg-emerald-50 text-[#111C2D] border border-emerald-500/40 rounded-full px-3 sm:px-4 py-2 sm:py-2.5 shadow-lg backdrop-blur-md transition-all duration-200 group hover:scale-105 cursor-pointer"
      >
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="material-symbols-outlined text-emerald-600 text-lg group-hover:scale-110 transition-transform shrink-0">
          {isOpen ? "close" : "chat"}
        </span>
        <span className="text-xs font-bold font-montserrat truncate max-w-[150px] sm:max-w-none">
          {label}
        </span>
      </button>
    </aside>
  );
}
