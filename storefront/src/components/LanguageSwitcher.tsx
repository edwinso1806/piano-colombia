"use client"

import React from "react"
import { useLanguage } from "@/context/LanguageContext"

interface LanguageSwitcherProps {
  className?: string
  variant?: "light" | "dark" | "pill"
}

export default function LanguageSwitcher({ className = "", variant = "pill" }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage()

  return (
    <div
      className={`inline-flex items-center rounded-full p-1 border text-xs font-bold transition-all shadow-sm ${
        variant === "dark"
          ? "bg-[#111C2D] border-slate-700 text-slate-300"
          : "bg-white/90 backdrop-blur-md border-slate-200 text-slate-700"
      } ${className}`}
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
}
