"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SaveScoreButton from "@/components/SaveScoreButton";

interface PartituraDetailClientProps {
  score: {
    id: string;
    title: string;
    slug?: string;
    genre?: string;
    category?: string;
    difficulty?: string;
    level?: string;
    priceCOP: number;
    priceUSD: number;
    description?: string;
    tonality?: string;
    pages_count?: number;
    audio_sample_url?: string;
    preview_images?: string[];
    composer?: {
      id?: string;
      name?: string;
      artistic_name?: string;
      full_name?: string;
      slug?: string;
      bio_es?: string;
      photo_url?: string;
    };
  };
}

export default function PartituraDetailClient({ score }: PartituraDetailClientProps) {
  const { t, language } = useLanguage();
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);

  const previews = score.preview_images && score.preview_images.length > 0
    ? score.preview_images
    : [];

  const composerName =
    score.composer?.artistic_name ||
    score.composer?.name ||
    score.composer?.full_name ||
    "Maestro Piano Colombia";

  const composerSlug = score.composer?.slug || score.composer?.id || "maestros";

  return (
    <div className="min-h-screen bg-[#F9F9FF] text-[#111C2D] flex flex-col font-inter selection:bg-[#FBB03B] selection:text-[#111C2D]">
      <Header activePage="tienda" />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Columna Izquierda: Visor Interactivo de Muestras Protegidas */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          
          {/* Barra superior de estado de la muestra */}
          <div className="flex flex-wrap justify-between items-center bg-white p-4 rounded-2xl border border-black/5 shadow-2xs gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0071BC] text-lg">verified_user</span>
              <span className="text-xs font-bold font-montserrat text-[#111C2D]">
                {t("score.preview_sample", "Muestras Protegidas de la Partitura")}
              </span>
            </div>

            {/* Paginador si hay múltiples previews generados */}
            {previews.length > 1 && (
              <div className="flex items-center gap-1.5">
                {previews.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedPageIndex(idx)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer font-montserrat ${
                      selectedPageIndex === idx
                        ? "bg-[#0071BC] text-white shadow-xs"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    {language === "en" ? `Page ${idx + 1}` : `Pág. ${idx + 1}`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Contenedor del Preview */}
          <div className="relative w-full aspect-[1/1.414] bg-white rounded-2xl overflow-hidden border border-slate-300 shadow-[0_12px_40px_rgba(0,0,0,0.08)] flex flex-col justify-between">
            {previews.length > 0 ? (
              <img
                src={previews[selectedPageIndex]}
                alt={`${score.title} - Página ${selectedPageIndex + 1}`}
                className="w-full h-full object-contain select-none pointer-events-none"
              />
            ) : (
              /* Visualizador Urtext Simulado Fallback */
              <div className="relative w-full h-full flex flex-col justify-between p-8 text-[#111C2D] select-none">
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[3px] pointer-events-none z-10"></div>
                <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center rotate-[-35deg] opacity-20">
                  <span className="text-4xl md:text-5xl font-black tracking-widest text-[#C1272D] uppercase whitespace-nowrap font-montserrat">
                    PIANO COLOMBIA — MUESTRA PROTEGIDA
                  </span>
                </div>
                <div className="relative z-0 opacity-40 filter blur-[1px]">
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-bold font-serif tracking-widest uppercase">{score.title}</h3>
                    <p className="text-xs font-serif italic mt-1">Para Piano Solo — {composerName}</p>
                  </div>
                  <div className="space-y-6">
                    {[1, 2, 3, 4].map((p) => (
                      <div key={p} className="space-y-1">
                        <div className="h-0.5 bg-[#111C2D] w-full"></div>
                        <div className="h-0.5 bg-[#111C2D] w-full"></div>
                        <div className="h-0.5 bg-[#111C2D] w-full"></div>
                        <div className="h-0.5 bg-[#111C2D] w-full"></div>
                        <div className="h-0.5 bg-[#111C2D] w-full"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Aviso inferior de protección editorial */}
            <div className="absolute inset-x-0 bottom-0 bg-[#111C2D]/95 backdrop-blur-md p-3.5 text-center border-t border-[#FBB03B]/30 text-white z-30">
              <p className="text-[11px] font-medium text-slate-200 flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-[#FBB03B]">lock</span>
                {t(
                  "score.preview_disclaimer",
                  "Las páginas mostradas contienen difuminado y marca de agua como medida de protección editorial. Al comprar, recibirás el archivo PDF completo en alta definición sin marcas de agua."
                )}
              </p>
            </div>
          </div>

          {/* Audio Preview si existe */}
          {score.audio_sample_url && (
            <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F0F3FF] flex items-center justify-center text-[#0071BC]">
                  <span className="material-symbols-outlined text-xl">headphones</span>
                </div>
                <div>
                  <span className="text-xs font-bold font-montserrat text-[#111C2D] block">
                    {t("score.listen_sample", "Escuchar Muestra de Audio")}
                  </span>
                  <span className="text-[11px] text-slate-500">Grabación de referencia disponible</span>
                </div>
              </div>
              <a
                href={score.audio_sample_url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-[#0071BC] text-white text-xs font-bold rounded-xl hover:bg-[#005a96] transition flex items-center gap-1.5 font-montserrat"
              >
                <span>Reproducir</span>
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </a>
            </div>
          )}
        </div>

        {/* Columna Derecha: Ficha de Compra e Información Musicológica */}
        <div className="lg:col-span-5 flex flex-col justify-start">
          <div className="bg-white p-7 sm:p-8 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-6">
            
            <div>
              <span className="text-xs font-extrabold text-[#0071BC] tracking-wider uppercase bg-[#F0F3FF] px-3 py-1 rounded-full border border-[#0071BC]/10 inline-block mb-2 font-montserrat">
                {score.genre || score.category || "Piano Solo"}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black font-montserrat text-[#111C2D] tracking-tight">
                {score.title}
              </h1>
              <p className="text-sm text-[#4C4546] mt-2">
                {t("score.composer", "Compositor")}:{" "}
                <Link href={`/compositores/${composerSlug}`} className="text-[#0071BC] hover:underline font-bold">
                  {composerName}
                </Link>
              </p>
            </div>

            {/* Precio y Nivel */}
            <div className="border-t border-b border-black/5 py-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-[#4C4546] font-medium block">{t("catalog.price", "Precio")}</span>
                <div className="text-2xl font-black font-montserrat text-[#111C2D]">
                  ${(score.priceCOP || 45000).toLocaleString("es-CO")} COP{" "}
                  <span className="text-xs font-semibold text-[#4C4546]">(${score.priceUSD || 12} USD)</span>
                </div>
              </div>
              <span className="text-xs px-3 py-1.5 bg-[#FBB03B]/20 text-[#111C2D] border border-[#FBB03B]/40 rounded-full font-extrabold font-montserrat">
                {score.difficulty || score.level || "Intermedio"}
              </span>
            </div>

            {/* Ficha Técnica */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#F0F3FF]/60 rounded-xl border border-black/5">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">{t("score.tonality", "Tonalidad")}</span>
                <span className="font-bold text-slate-800">{score.tonality || "Do mayor"}</span>
              </div>
              <div className="p-3 bg-[#F0F3FF]/60 rounded-xl border border-black/5">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">{t("score.pages", "Páginas")}</span>
                <span className="font-bold text-slate-800">{score.pages_count || 4} págs</span>
              </div>
            </div>

            {/* Descripción / Notas al Programa */}
            <div>
              <h3 className="text-sm font-bold font-montserrat text-[#111C2D] mb-2">
                {t("score.description", "Reseña Musicológica")}
              </h3>
              <p className="text-xs sm:text-sm text-[#4C4546] font-normal leading-relaxed">
                {score.description ||
                  "Obra académica revisada y transcrita con los más rigurosos estándares de edición urtext para piano solo, con digitaciones sugeridas y notas críticas."}
              </p>
            </div>

            {/* Botones de Compra */}
            <div className="space-y-3 pt-2">
              <Link
                href="/checkout"
                className="w-full py-4 text-center block font-extrabold text-sm uppercase tracking-wider bg-[#FBB03B] hover:bg-[#e09b2d] text-[#111C2D] rounded-xl transition shadow-md hover:shadow-lg font-montserrat flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">shopping_cart</span>
                <span>{t("score.buy_now", "Comprar Ahora & Descargar PDF")}</span>
              </Link>
              
              <SaveScoreButton
                score={{
                  id: score.id,
                  title: score.title,
                  composer: composerName,
                  category: score.genre || score.category || "Piano Solo",
                  level: score.difficulty || score.level || "Intermedio",
                  priceCOP: score.priceCOP || 45000,
                  priceUSD: score.priceUSD || 12,
                }}
                variant="button"
                className="w-full py-3.5"
              />

              <p className="text-[11px] text-center text-[#4C4546] font-medium flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-xs text-[#0071BC]">bolt</span>
                <span>Descarga digital inmediata post-pago con marca de agua personalizada con tu nombre.</span>
              </p>
            </div>

          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
