"use client";

import React from "react";
import { useSavedScores } from "@/context/SavedScoresContext";

interface SaveScoreButtonProps {
  score: {
    id: string;
    slug?: string;
    title: string;
    composer: string;
    category?: string;
    level?: string;
    priceCOP: number;
    priceUSD: number;
    description?: string;
  };
  className?: string;
  variant?: "icon" | "button" | "pill";
  showText?: boolean;
}

export default function SaveScoreButton({
  score,
  className = "",
  variant = "icon",
  showText = false,
}: SaveScoreButtonProps) {
  const { isSaved, toggleSaveScore } = useSavedScores();
  const saved = isSaved(score.slug || score.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSaveScore(score);
  };

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={handleClick}
        title={saved ? "Quitar de mis partituras guardadas" : "Guardar en mis partituras"}
        className={`px-4 py-3 rounded-xl font-bold text-xs font-montserrat flex items-center justify-center gap-2 transition-all duration-200 border ${
          saved
            ? "bg-[#F0F3FF] border-[#0071BC]/40 text-[#0071BC] hover:bg-red-50 hover:border-red-200 hover:text-red-700"
            : "bg-white border-black/10 text-[#4C4546] hover:text-[#111C2D] hover:bg-[#F0F3FF]/70"
        } ${className}`}
      >
        <span
          className={`material-symbols-outlined text-base transition-transform ${
            saved ? "text-[#0071BC] fill-current scale-110" : ""
          }`}
          style={{ fontVariationSettings: saved ? "'FILL' 1" : "'FILL' 0" }}
        >
          {saved ? "bookmark_added" : "bookmark_add"}
        </span>
        <span>{saved ? "Partitura Guardada" : "Guardar en Favoritos"}</span>
      </button>
    );
  }

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={handleClick}
        title={saved ? "Quitar de guardadas" : "Guardar partitura"}
        className={`px-3 py-1.5 rounded-full font-bold text-[11px] font-montserrat flex items-center gap-1.5 transition-all duration-200 border ${
          saved
            ? "bg-[#0071BC] text-white border-[#0071BC] shadow-xs"
            : "bg-white text-[#4C4546] border-black/10 hover:border-[#0071BC]/30 hover:text-[#0071BC]"
        } ${className}`}
      >
        <span
          className="material-symbols-outlined text-sm"
          style={{ fontVariationSettings: saved ? "'FILL' 1" : "'FILL' 0" }}
        >
          {saved ? "bookmark" : "bookmark_border"}
        </span>
        {showText && <span>{saved ? "Guardada" : "Guardar"}</span>}
      </button>
    );
  }

  // Default "icon" variant
  return (
    <button
      type="button"
      onClick={handleClick}
      title={saved ? "Quitar de mis partituras guardadas" : "Guardar en mi lista"}
      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 backdrop-blur-md ${
        saved
          ? "bg-[#0071BC] text-white shadow-md hover:bg-red-600 scale-105"
          : "bg-white/90 text-[#4C4546] border border-black/10 hover:bg-white hover:text-[#0071BC] hover:scale-105 shadow-2xs"
      } ${className}`}
    >
      <span
        className="material-symbols-outlined text-lg"
        style={{ fontVariationSettings: saved ? "'FILL' 1" : "'FILL' 0" }}
      >
        {saved ? "bookmark" : "bookmark_border"}
      </span>
    </button>
  );
}
