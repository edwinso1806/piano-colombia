"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
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
    description_es?: string;
    description_en?: string;
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
      bio_en?: string;
      photo_url?: string;
    };
  };
}

const SCORE_DESCRIPTIONS_EN_FALLBACK: Record<string, string> = {
  "les-patineurs-el-vals-de-los-patinadores-909":
    "Waldteufel was inspired by watching people glide elegantly across the ice rink of the Cercle des Patineurs in the Bois de Boulogne (the famous forest of Paris). The low temperatures of those harsh Parisian winters turned ice skating into one of high society's favorite recreational pastimes.",
  "obertura-fantasia-romeo-438":
    "Pyotr Ilyich Tchaikovsky's Romeo and Juliet Fantasy-Overture is a programmatic masterpiece structured in free sonata form, conceived for a large romantic orchestra where timbral and dynamic contrasts directly narrate William Shakespeare's tragedy: it begins with a solemn and reflective woodwind chorale embodying Friar Laurence, suddenly bursts into syncopated rhythms and ferocious clashes of percussion and brass illustrating the violent struggle between the Montagues and Capulets, and ascends to one of the most celebrated lyrical passages in music history through a heartbreaking love theme introduced by the English horn and muted violas, finally resolving into a funeral march of timpani that transmutes tragic grief into a deeply moving redemption in B major.",
  "malvaloca":
    "Critical edition of Luis A. Calvo's lyrical masterpiece Op. 12. Marked Andante cantabile, this pasillo encapsulates the romantic elegance and nostalgic intimacy of early 20th-century Colombian piano heritage.",
  "intermezzo-no-1-lejano-azul":
    "The pinnacle of Colombian romantic piano literature. A deeply expressive, lyrical work featuring exquisite cantabile melodies and refined harmonic colors.",
  "pasillo-colombiano-no-1":
    "A benchmark work of Colombian musical impressionism with distinct syncopated rhythms, brilliant keyboard figurations, and vibrant rhythmic drive.",
  "bambuco-el-fusagasugueno":
    "A refined salon bambuco featuring traditional 6/8 vs 3/4 polyrhythms, rich syncopations, and charming regional melodic phrasing.",
};

function formatTonality(tonality?: string, isEn?: boolean): string {
  if (!tonality) return isEn ? "C major" : "Do mayor";
  if (!isEn) return tonality;
  
  const map: Record<string, string> = {
    "do mayor": "C major",
    "do menor": "C minor",
    "do sostenido menor": "C# minor",
    "do# menor": "C# minor",
    "re mayor": "D major",
    "re menor": "D minor",
    "re bemol mayor": "Db major",
    "mi mayor": "E major",
    "mi menor": "E minor",
    "mi bemol mayor": "Eb major",
    "mi bemol menor": "Eb minor",
    "fa mayor": "F major",
    "fa menor": "F minor",
    "fa sostenido menor": "F# minor",
    "fa# menor": "F# minor",
    "sol mayor": "G major",
    "sol menor": "G minor",
    "la mayor": "A major",
    "la menor": "A minor",
    "la bemol mayor": "Ab major",
    "si mayor": "B major",
    "si menor": "B minor",
    "si bemol mayor": "Bb major",
    "si bemol menor": "Bb minor",
  };
  
  const lower = tonality.trim().toLowerCase();
  return map[lower] || tonality;
}

function formatDifficulty(diff?: string, isEn?: boolean): string {
  if (!diff) return isEn ? "Intermediate" : "Intermedio";
  if (!isEn) return diff;
  
  let formatted = diff;
  formatted = formatted.replace(/principiante/gi, "Beginner");
  formatted = formatted.replace(/intermedio/gi, "Intermediate");
  formatted = formatted.replace(/avanzado/gi, "Advanced");
  formatted = formatted.replace(/virtuoso/gi, "Virtuoso");
  formatted = formatted.replace(/nivel/gi, "Level");
  return formatted;
}

export default function PartituraDetailClient({ score }: PartituraDetailClientProps) {
  const { t, language } = useLanguage();
  const isEn = language === "en";
  const { addToCart } = useCart();
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [clientTranslatedDesc, setClientTranslatedDesc] = useState<string | null>(null);

  useEffect(() => {
    if (isEn && !score.description_en && (score.description_es || score.description)) {
      const sourceText = score.description_es || score.description || "";
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=es&tl=en&dt=t&q=${encodeURIComponent(sourceText)}`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && Array.isArray(data[0])) {
            const trans = data[0].map((s: any) => s[0]).join("");
            setClientTranslatedDesc(trans);
          }
        })
        .catch(console.warn);
    }
  }, [isEn, score.description_en, score.description_es, score.description]);

  const previews = score.preview_images && score.preview_images.length > 0
    ? score.preview_images
    : [];

  const composerName =
    score.composer?.artistic_name ||
    score.composer?.name ||
    score.composer?.full_name ||
    "Maestro Piano Colombia";

  const composerSlug = score.composer?.slug || score.composer?.id || "maestros";

  const description = isEn
    ? (score.description_en ||
       clientTranslatedDesc ||
       (score.slug && SCORE_DESCRIPTIONS_EN_FALLBACK[score.slug]) ||
       SCORE_DESCRIPTIONS_EN_FALLBACK[score.id] ||
       score.description ||
       "Academic work revised and transcribed with the most rigorous Urtext edition standards for solo piano, featuring suggested fingerings and critical notes.")
    : (score.description_es ||
       score.description ||
       "Obra académica revisada y transcrita con los más rigurosos estándares de edición urtext para piano solo, con digitaciones sugeridas y notas críticas.");

  const tonalityLabel = formatTonality(score.tonality, isEn);
  const difficultyLabel = formatDifficulty(score.difficulty || score.level, isEn);

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

          {/* Contenedor del Preview Proporcional */}
          <div className="relative w-full max-w-xl mx-auto bg-[#F8F9FA] rounded-2xl overflow-hidden border border-black/10 shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex flex-col justify-between">
            {previews.length > 0 ? (
              <div className="relative w-full p-4 sm:p-6 bg-slate-100/50 flex items-center justify-center min-h-[380px] max-h-[600px]">
                <img
                  src={previews[selectedPageIndex]}
                  alt={`${score.title} - Página ${selectedPageIndex + 1}`}
                  className="max-h-[550px] w-auto h-auto max-w-full object-contain rounded shadow-md select-none pointer-events-none"
                />
              </div>
            ) : (
              /* Visualizador Urtext Simulado Fallback */
              <div className="relative w-full aspect-[3/4] max-h-[520px] flex flex-col justify-between p-6 sm:p-8 text-[#111C2D] select-none bg-white">
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[3px] pointer-events-none z-10"></div>
                <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center rotate-[-35deg] opacity-20">
                  <span className="text-3xl sm:text-4xl font-black tracking-widest text-[#C1272D] uppercase whitespace-nowrap font-montserrat">
                    PIANO COLOMBIA — MUESTRA PROTEGIDA
                  </span>
                </div>
                <div className="relative z-0 opacity-40 filter blur-[1px]">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-bold font-serif tracking-widest uppercase">{score.title}</h3>
                    <p className="text-xs font-serif italic mt-1">Para Piano Solo — {composerName}</p>
                  </div>
                  <div className="space-y-4">
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
            <div className="bg-[#111C2D]/95 backdrop-blur-md p-3 text-center border-t border-[#FBB03B]/30 text-white z-30">
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
                  <span className="text-[11px] text-slate-500">
                    {isEn ? "Reference recording available" : "Grabación de referencia disponible"}
                  </span>
                </div>
              </div>
              <a
                href={score.audio_sample_url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-[#0071BC] text-white text-xs font-bold rounded-xl hover:bg-[#005a96] transition flex items-center gap-1.5 font-montserrat"
              >
                <span>{isEn ? "Play" : "Reproducir"}</span>
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
                {difficultyLabel}
              </span>
            </div>

            {/* Ficha Técnica */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#F0F3FF]/60 rounded-xl border border-black/5">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">{t("score.tonality", "Tonalidad")}</span>
                <span className="font-bold text-slate-800">{tonalityLabel}</span>
              </div>
              <div className="p-3 bg-[#F0F3FF]/60 rounded-xl border border-black/5">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">{t("score.pages", "Páginas")}</span>
                <span className="font-bold text-slate-800">
                  {score.pages_count || 4} {isEn ? "pages" : "págs"}
                </span>
              </div>
            </div>

            {/* Descripción / Notas al Programa */}
            <div>
              <h3 className="text-sm font-bold font-montserrat text-[#111C2D] mb-2">
                {t("score.description", "Reseña Musicológica")}
              </h3>
              <p className="text-xs sm:text-sm text-[#4C4546] font-normal leading-relaxed">
                {description}
              </p>
            </div>

            {/* Botones de Compra y Carrito */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  addToCart({
                    id: score.id,
                    title: score.title,
                    composer: composerName,
                    composerId: score.composer?.id || "",
                    category: (score.genre || score.category || "Piano Solo") as any,
                    level: (score.difficulty || score.level || "Intermedio") as any,
                    priceCOP: score.priceCOP || 45000,
                    priceUSD: score.priceUSD || 12,
                    slug: score.slug || score.id,
                    previewPages: previews,
                    mediaUrl: score.audio_sample_url || "",
                    description: score.description || "",
                    tags: [],
                  });
                  setAddedToCart(true);
                  setTimeout(() => setAddedToCart(false), 2500);
                }}
                className={`w-full py-3.5 text-center font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-sm font-montserrat flex items-center justify-center gap-2 cursor-pointer border ${
                  addedToCart
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-[#0071BC] hover:bg-[#005a96] text-white border-[#0071BC]"
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {addedToCart ? "check_circle" : "add_shopping_cart"}
                </span>
                <span>
                  {addedToCart
                    ? t("catalog.added_to_cart_success", "¡Agregado al Carrito!")
                    : t("catalog.add_to_cart", "Añadir al Carrito")}
                </span>
              </button>

              <Link
                href="/checkout"
                onClick={() => {
                  addToCart({
                    id: score.id,
                    title: score.title,
                    composer: composerName,
                    composerId: score.composer?.id || "",
                    category: (score.genre || score.category || "Piano Solo") as any,
                    level: (score.difficulty || score.level || "Intermedio") as any,
                    priceCOP: score.priceCOP || 45000,
                    priceUSD: score.priceUSD || 12,
                    slug: score.slug || score.id,
                    previewPages: previews,
                    mediaUrl: score.audio_sample_url || "",
                    description: score.description || "",
                    tags: [],
                  });
                }}
                className="w-full py-3.5 text-center block font-extrabold text-xs uppercase tracking-wider bg-[#FBB03B] hover:bg-[#e09b2d] text-[#111C2D] rounded-xl transition shadow-md hover:shadow-lg font-montserrat flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">shopping_bag</span>
                <span>{t("score.buy_now", "Comprar Ahora & Descargar PDF")}</span>
              </Link>
              
              <SaveScoreButton
                score={{
                  id: score.id,
                  slug: score.slug,
                  title: score.title,
                  composer: composerName,
                  category: score.genre || score.category || "Piano Solo",
                  level: score.difficulty || score.level || "Intermedio",
                  priceCOP: score.priceCOP || 45000,
                  priceUSD: score.priceUSD || 12,
                }}
                variant="button"
                className="w-full py-3"
              />

              <p className="text-[11px] text-center text-[#4C4546] font-medium flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-xs text-[#0071BC]">bolt</span>
                <span>{t("score.instant_download_notice", "Descarga digital inmediata post-pago con marca de agua personalizada con tu nombre.")}</span>
              </p>
            </div>

          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
