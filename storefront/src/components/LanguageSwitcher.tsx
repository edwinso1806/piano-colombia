"use client"

import React from "react"
import { useLanguage } from "@/context/LanguageContext"

interface LanguageSwitcherProps {
  className?: string
  variant?: "light" | "dark" | "pill"
  mode?: "auto" | "compact" | "pill"
}

export default function LanguageSwitcher({
  className = "",
  variant = "pill",
  mode = "auto",
}: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage()

  // 1. Botón táctil compacto para móviles (1 solo botón que conmuta en 1 toque)
  const renderCompact = (extraClass: string) => (
    <button
      type="button"
      onClick={() => setLanguage(language === "es" ? "en" : "es")}
      className={`items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95 shrink-0 ${
        variant === "dark"
          ? "bg-[#111C2D] border-slate-700 text-slate-300"
          : "bg-[#F0F3FF] border-black/5 text-[#111C2D] hover:bg-slate-200/70"
      } ${extraClass}`}
      title={language === "es" ? "Cambiar a Inglés (EN)" : "Switch to Spanish (ES)"}
      aria-label="Cambiar idioma"
    >
      <span className="text-xs leading-none">{language === "es" ? "🇨🇴" : "🇺🇸"}</span>
      <span className="font-montserrat font-extrabold text-[11px] leading-none">{language.toUpperCase()}</span>
      <span className="material-symbols-outlined text-[13px] text-[#0071BC]">sync_alt</span>
    </button>
  )

  // 2. Píldora doble completa (para tablet/desktop o menú drawer)
  const renderPill = (extraClass: string) => (
    <div
      className={`items-center rounded-full p-1 border text-xs font-bold transition-all shadow-sm shrink-0 ${
        variant === "dark"
          ? "bg-[#111C2D] border-slate-700 text-slate-300"
          : "bg-white/90 backdrop-blur-md border-slate-200 text-slate-700"
      } ${extraClass}`}
    >
      <button
        type="button"
        onClick={() => setLanguage("es")}
        className={`px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-all cursor-pointer ${
          language === "es"
            ? "bg-[#0071BC] text-white shadow-sm font-extrabold"
            : "hover:text-[#0071BC] opacity-70 hover:opacity-100"
        }`}
        title="Español"
      >
        <span className="text-[11px]">🇨🇴</span>
        <span>ES</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-all cursor-pointer ${
          language === "en"
            ? "bg-[#0071BC] text-white shadow-sm font-extrabold"
            : "hover:text-[#0071BC] opacity-70 hover:opacity-100"
        }`}
        title="English"
      >
        <span className="text-[11px]">🇺🇸</span>
        <span>EN</span>
      </button>
    </div>
  )

  if (mode === "compact") {
    return renderCompact(`flex ${className}`)
  }

  if (mode === "pill") {
    return renderPill(`inline-flex ${className}`)
  }

  // mode === "auto":
  // En móviles (< sm): se renderiza EXCLUSIVAMENTE el botón compacto (el pill queda oculto con display:none)
  // En tablet/desktop (>= sm): se renderiza EXCLUSIVAMENTE la píldora (el compacto queda oculto con display:none)
  return (
    <div className={`flex items-center shrink-0 ${className}`}>
      {renderCompact("flex sm:hidden")}
      {renderPill("hidden sm:inline-flex")}
    </div>
  )
}


