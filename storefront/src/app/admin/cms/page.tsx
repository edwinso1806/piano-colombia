"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getAdminCatalogMetadata,
  updateAdminCatalogMetadata,
  getHeroCms,
  updateHeroCmsAdmin,
} from "@/lib/api-client";

export default function AdminCMSPage() {
  const [activeTab, setActiveTab] = useState<"hero" | "featured_score" | "metadata" | "legals">("hero");
  const [isSaved, setIsSaved] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Estado del Hero Principal
  const [heroTitle, setHeroTitle] = useState("La tradición del piano colombiano y latinoamericano en tus manos.");
  const [heroSubtitle, setHeroSubtitle] = useState(
    "Un proyecto cultural con enfoque musical riguroso en pro del rescate, edición filológica y difusión de obras patrimoniales y contemporáneas para teclado."
  );
  const [btn1Text, setBtn1Text] = useState("EXPLORAR PARTITURAS");
  const [btn1Url, setBtn1Url] = useState("/tienda");
  const [btn2Text, setBtn2Text] = useState("Conocer Compositores");
  const [btn2Url, setBtn2Url] = useState("/compositores");
  const [footerNotice, setFooterNotice] = useState(
    "Edición revisada con digitaciones de concierto y notas históricas bilingües (ES/EN)."
  );

  // Estado de la Partitura Destacada (Card Hero Derecha)
  const [featuredGenre, setFeaturedGenre] = useState("PASILLO LÍRICO");
  const [featuredTitle, setFeaturedTitle] = useState("Malvaloca");
  const [featuredAuthor, setFeaturedAuthor] = useState("Luis A. Calvo (1882–1945) - Op. 12");
  const [featuredTempo, setFeaturedTempo] = useState("Andante cantabile ♩ = 68");
  const [featuredIsmn, setFeaturedIsmn] = useState("ISMN 979-0-901314-18-2");
  const [featuredAudioSample, setFeaturedAudioSample] = useState("Pasillo No. 1 — L. A. Calvo");
  const [featuredBadgeText, setFeaturedBadgeText] = useState("GRABADO URTEXT 100% Alta Resolución");
  const [featuredLinkUrl, setFeaturedLinkUrl] = useState("/partitura/malvaloca");

  // Estado de Metadatos Administrables desde la BD PostgreSQL
  const [categories, setCategories] = useState<string[]>([
    "Pasillo", "Bambuco", "Danza", "Guabina", "Vals", "Cumbia", "Porro", "Joropo", "Contradanza", "Estudio", "Piano Solo"
  ]);
  const [difficulties, setDifficulties] = useState<string[]>([
    "Iniciación / Fácil", "Intermedio", "Avanzado", "Virtuoso / Concierto"
  ]);

  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [newDifficultyInput, setNewDifficultyInput] = useState("");
  const [isSavingMetadata, setIsSavingMetadata] = useState(false);
  const [isSavingHero, setIsSavingHero] = useState(false);

  // Cargar Hero CMS y metadatos reales de la BD
  useEffect(() => {
    async function loadCMSData() {
      try {
        const heroRes = await getHeroCms();
        if (heroRes && heroRes.hero) {
          const h = heroRes.hero;
          if (h.hero_title || h.title_part1) setHeroTitle(h.hero_title || `${h.title_part1} ${h.title_part2_highlight || ""}`);
          if (h.hero_subtitle || h.description) setHeroSubtitle(h.hero_subtitle || h.description);
          if (h.btn1_text || h.button1_text) setBtn1Text(h.btn1_text || h.button1_text);
          if (h.btn1_url || h.button1_url) setBtn1Url(h.btn1_url || h.button1_url);
          if (h.btn2_text || h.button2_text) setBtn2Text(h.btn2_text || h.button2_text);
          if (h.btn2_url || h.button2_url) setBtn2Url(h.btn2_url || h.button2_url);
          if (h.footer_notice || h.urtext_badge_text) setFooterNotice(h.footer_notice || h.urtext_badge_text);

          if (h.featured_genre) setFeaturedGenre(h.featured_genre);
          if (h.featured_title) setFeaturedTitle(h.featured_title);
          if (h.featured_author) setFeaturedAuthor(h.featured_author);
          if (h.featured_tempo) setFeaturedTempo(h.featured_tempo);
          if (h.featured_ismn) setFeaturedIsmn(h.featured_ismn);
          if (h.featured_audio_sample) setFeaturedAudioSample(h.featured_audio_sample);
          if (h.featured_badge_text) setFeaturedBadgeText(h.featured_badge_text);
          if (h.featured_link_url) setFeaturedLinkUrl(h.featured_link_url);
        }

        const res = await getAdminCatalogMetadata();
        if (res.categories && Array.isArray(res.categories)) {
          const normalizedCats = res.categories
            .map((c: any) => (typeof c === "string" ? c : (c.title_es || c.title || c.name || c.id)))
            .filter(Boolean);
          setCategories(normalizedCats);
        }
        if (res.difficulties && Array.isArray(res.difficulties)) {
          const normalizedDiffs = res.difficulties
            .map((d: any) => (typeof d === "string" ? d : (d.title_es || d.title || d.name || d.code || d.id)))
            .filter(Boolean);
          setDifficulties(normalizedDiffs);
        }
      } catch (err: any) {
        console.warn("Error cargando metadatos o CMS de BD:", err.message);
      }
    }
    loadCMSData();
  }, []);

  const handleSaveCMS = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingHero(true);
    setFeedback(null);
    try {
      await updateHeroCmsAdmin({
        hero_title: heroTitle,
        hero_subtitle: heroSubtitle,
        btn1_text: btn1Text,
        btn1_url: btn1Url,
        btn2_text: btn2Text,
        btn2_url: btn2Url,
        footer_notice: footerNotice,
        // Compatibilidad con campos del backend
        title_part1: heroTitle,
        description: heroSubtitle,
        button1_text: btn1Text,
        button1_url: btn1Url,
        button2_text: btn2Text,
        button2_url: btn2Url,
        urtext_badge_text: footerNotice,

        featured_genre: featuredGenre,
        featured_title: featuredTitle,
        featured_author: featuredAuthor,
        featured_tempo: featuredTempo,
        featured_ismn: featuredIsmn,
        featured_audio_sample: featuredAudioSample,
        featured_badge_text: featuredBadgeText,
        featured_link_url: featuredLinkUrl,
      });

      setIsSaved(true);
      setFeedback({
        type: "success",
        message: "✅ ¡Configuración del Hero y Partitura Destacada guardada exitosamente en la base de datos PostgreSQL y publicada!",
      });
      setTimeout(() => setIsSaved(false), 4000);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Error al guardar la información del Hero CMS.",
      });
    } finally {
      setIsSavingHero(false);
    }
  };

  const handleSaveMetadata = async () => {
    setIsSavingMetadata(true);
    setFeedback(null);
    try {
      await updateAdminCatalogMetadata({ categories, difficulties });
      setFeedback({
        type: "success",
        message: "✅ Categorías y Niveles de Dificultad guardados exitosamente en la base de datos PostgreSQL.",
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Error al guardar metadatos en la base de datos.",
      });
    } finally {
      setIsSavingMetadata(false);
    }
  };

  const handleAddCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    if (categories.includes(trimmed)) return;
    setCategories([...categories, trimmed]);
    setNewCategoryInput("");
  };

  const handleRemoveCategory = (cat: string) => {
    setCategories(categories.filter((c) => c !== cat));
  };

  const handleAddDifficulty = () => {
    const trimmed = newDifficultyInput.trim();
    if (!trimmed) return;
    if (difficulties.includes(trimmed)) return;
    setDifficulties([...difficulties, trimmed]);
    setNewDifficultyInput("");
  };

  const handleRemoveDifficulty = (diff: string) => {
    setDifficulties(difficulties.filter((d) => d !== diff));
  };

  return (
    <div className="space-y-8 text-[#111C2D]">
      
      {/* Header Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F3FF] border border-[#0071BC]/10 text-[#0071BC] text-[11px] font-extrabold uppercase tracking-wider mb-2 font-montserrat">
            <span className="material-symbols-outlined text-xs">web</span>
            Gestor CMS • Contenido Administrable de la Homepage
          </div>
          <h1 className="text-3xl font-black font-montserrat text-[#111C2D] tracking-tight">
            Gestión de Portada & Hero Principal
          </h1>
          <p className="text-xs md:text-sm text-[#4C4546] font-medium max-w-2xl leading-relaxed">
            Administre los textos principales, botones de navegación, avisos de garantía y la partitura destacada visible en la cabecera de la tienda.
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          className="px-4 py-2.5 bg-[#F0F3FF] hover:bg-slate-200/60 text-[#111C2D] font-bold text-xs rounded-xl transition font-montserrat flex items-center justify-center gap-2 border border-black/5 shrink-0"
        >
          <span className="material-symbols-outlined text-base text-[#0071BC]">open_in_new</span>
          <span>Ver Homepage Pública</span>
        </Link>
      </div>

      {/* Feedback Banner Global */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold font-montserrat shadow-xs ${
            feedback.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
              : "bg-rose-50 border border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg shrink-0">
              {feedback.type === "success" ? "check_circle" : "error"}
            </span>
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-700 transition"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Selector de Pestañas CMS */}
      <div className="flex border-b border-black/5 gap-2 w-full overflow-x-auto overscroll-x-contain scrollbar-none font-montserrat">
        <button
          onClick={() => setActiveTab("hero")}
          className={`flex items-center gap-2 px-5 py-3 font-extrabold text-xs rounded-t-xl transition border-b-2 whitespace-nowrap ${
            activeTab === "hero"
              ? "bg-white text-[#111C2D] border-[#FBB03B] shadow-2xs"
              : "text-[#4C4546] hover:text-[#111C2D] border-transparent hover:bg-white/60"
          }`}
        >
          <span className="material-symbols-outlined text-base text-[#0071BC]">title</span>
          Hero: Textos & Botones
        </button>

        <button
          onClick={() => setActiveTab("featured_score")}
          className={`flex items-center gap-2 px-5 py-3 font-extrabold text-xs rounded-t-xl transition border-b-2 whitespace-nowrap ${
            activeTab === "featured_score"
              ? "bg-white text-[#111C2D] border-[#FBB03B] shadow-2xs"
              : "text-[#4C4546] hover:text-[#111C2D] border-transparent hover:bg-white/60"
          }`}
        >
          <span className="material-symbols-outlined text-base text-[#FBB03B]">music_note</span>
          Partitura Destacada (Card Hero)
        </button>

        <button
          onClick={() => setActiveTab("metadata")}
          className={`flex items-center gap-2 px-5 py-3 font-extrabold text-xs rounded-t-xl transition border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === "metadata"
              ? "bg-white text-[#111C2D] border-[#FBB03B] shadow-2xs"
              : "text-[#4C4546] hover:text-[#111C2D] border-transparent hover:bg-white/60"
          }`}
        >
          <span className="material-symbols-outlined text-base text-[#0071BC]">tune</span>
          Categorías & Dificultades (BD)
        </button>

        <button
          onClick={() => setActiveTab("legals")}
          className={`flex items-center gap-2 px-5 py-3 font-extrabold text-xs rounded-t-xl transition border-b-2 whitespace-nowrap ${
            activeTab === "legals"
              ? "bg-white text-[#111C2D] border-[#FBB03B] shadow-2xs"
              : "text-[#4C4546] hover:text-[#111C2D] border-transparent hover:bg-white/60"
          }`}
        >
          <span className="material-symbols-outlined text-base text-[#C1272D]">gavel</span>
          Páginas Legales & T&C
        </button>
      </div>

      {/* Formulario Principal CMS */}
      <form onSubmit={handleSaveCMS} className="space-y-8">
        
        {/* ==========================================
               TAB 1: HERO TEXTOS Y BOTONES
               ========================================== */}
        {activeTab === "hero" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Formulario Izquierda (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-5">
                <h2 className="text-base font-bold font-montserrat text-[#111C2D] border-b border-black/5 pb-3">
                  1. Titular Principal & Mensaje del Hero
                </h2>

                <div>
                  <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
                    Texto Principal (Encabezado H1) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    className="w-full p-3.5 bg-[#F0F3FF] border border-black/5 rounded-xl text-xs text-[#111C2D] font-black font-montserrat focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                  />
                  <p className="text-[11px] text-[#4C4546] mt-1">Sugerido: Mantener bajo 80 caracteres para óptimo impacto visual.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
                    Texto Secundario (Bajada / Descripción Cultural) *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    className="w-full p-3.5 bg-[#F0F3FF] border border-black/5 rounded-xl text-xs text-[#111C2D] leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                  />
                </div>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-5">
                <h2 className="text-base font-bold font-montserrat text-[#111C2D] border-b border-black/5 pb-3">
                  2. Botones de Llamada a la Acción (CTA Buttons)
                </h2>

                {/* Botón 1 Principal */}
                <div className="p-4 bg-[#F0F3FF]/70 rounded-xl border border-black/5 space-y-3">
                  <span className="text-xs font-extrabold text-[#0071BC] uppercase tracking-wider block font-montserrat">
                    Botón 1 (Principal Amarillo Gold)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#111C2D] mb-1">Texto del Botón 1 *</label>
                      <input
                        type="text"
                        required
                        value={btn1Text}
                        onChange={(e) => setBtn1Text(e.target.value)}
                        className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-xs text-[#111C2D] font-bold font-montserrat"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#111C2D] mb-1">URL / Enlace Destino *</label>
                      <input
                        type="text"
                        required
                        value={btn1Url}
                        onChange={(e) => setBtn1Url(e.target.value)}
                        className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-xs font-mono text-[#0071BC]"
                      />
                    </div>
                  </div>
                </div>

                {/* Botón 2 Secundario */}
                <div className="p-4 bg-[#F0F3FF]/70 rounded-xl border border-black/5 space-y-3">
                  <span className="text-xs font-extrabold text-[#4C4546] uppercase tracking-wider block font-montserrat">
                    Botón 2 (Secundario Blanco)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#111C2D] mb-1">Texto del Botón 2 *</label>
                      <input
                        type="text"
                        required
                        value={btn2Text}
                        onChange={(e) => setBtn2Text(e.target.value)}
                        className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-xs text-[#111C2D] font-bold font-montserrat"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#111C2D] mb-1">URL / Enlace Destino *</label>
                      <input
                        type="text"
                        required
                        value={btn2Url}
                        onChange={(e) => setBtn2Url(e.target.value)}
                        className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-xs font-mono text-[#0071BC]"
                      />
                    </div>
                  </div>
                </div>

                {/* Aviso Inferior de Garantía */}
                <div>
                  <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
                    Aviso / Badge de Garantía en Pie de Hero
                  </label>
                  <input
                    type="text"
                    value={footerNotice}
                    onChange={(e) => setFooterNotice(e.target.value)}
                    className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs text-[#111C2D]"
                  />
                </div>

              </div>

            </div>

            {/* Previsualización en Vivo Derecha (5 Cols) */}
            <div className="lg:col-span-5">
              <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-4 sticky top-24">
                <span className="text-[10px] font-extrabold text-[#0071BC] uppercase tracking-wider block font-montserrat border-b border-black/5 pb-2">
                  👁️ Previsualización en Vivo de la Portada
                </span>

                <div className="p-5 bg-[#F9F9FF] rounded-2xl border border-black/5 space-y-4">
                  <h3 className="text-xl font-black font-montserrat text-[#111C2D] leading-tight">
                    {heroTitle}
                  </h3>
                  <p className="text-xs text-[#4C4546] leading-relaxed">
                    {heroSubtitle}
                  </p>

                  <div className="flex flex-wrap gap-2.5 pt-2">
                    <button type="button" className="px-4 py-2.5 bg-[#FBB03B] text-[#111C2D] font-extrabold text-[11px] uppercase tracking-wider rounded-xl font-montserrat shadow-2xs">
                      {btn1Text} →
                    </button>
                    <button type="button" className="px-4 py-2.5 bg-white border border-black/10 text-[#111C2D] font-bold text-[11px] rounded-xl font-montserrat">
                      📖 {btn2Text}
                    </button>
                  </div>

                  <div className="pt-3 border-t border-black/5 text-[10px] text-[#4C4546] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-xs text-[#0071BC]">verified</span>
                    <span>{footerNotice}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingHero}
                  className="w-full py-3.5 bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingHero ? (
                    <>
                      <span className="w-4 h-4 border-2 border-[#111C2D] border-t-transparent rounded-full animate-spin"></span>
                      <span>Guardando Cambios en BD...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">save</span>
                      <span>Guardar & Publicar Cambios del Hero</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ==========================================
               TAB 2: PARTITURA DESTACADA (CARD HERO DERECHA)
               ========================================== */}
        {activeTab === "featured_score" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Campos de la Partitura Destacada */}
            <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-5">
              <h2 className="text-base font-bold font-montserrat text-[#111C2D] border-b border-black/5 pb-3">
                Configuración de la Partitura Destacada (Card Hero Derecha)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">Género / Etiqueta Superior *</label>
                  <input
                    type="text"
                    required
                    value={featuredGenre}
                    onChange={(e) => setFeaturedGenre(e.target.value)}
                    placeholder="Ej: PASILLO LÍRICO"
                    className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs text-[#111C2D] font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">Código ISMN *</label>
                  <input
                    type="text"
                    required
                    value={featuredIsmn}
                    onChange={(e) => setFeaturedIsmn(e.target.value)}
                    placeholder="ISMN 979-0-901314-18-2"
                    className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs font-mono text-[#0071BC]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">Título de la Obra Destacada *</label>
                <input
                  type="text"
                  required
                  value={featuredTitle}
                  onChange={(e) => setFeaturedTitle(e.target.value)}
                  placeholder="Ej: Malvaloca"
                  className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs text-[#111C2D] font-black font-montserrat"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">Autor & Opus *</label>
                  <input
                    type="text"
                    required
                    value={featuredAuthor}
                    onChange={(e) => setFeaturedAuthor(e.target.value)}
                    placeholder="Luis A. Calvo (1882–1945) - Op. 12"
                    className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs text-[#111C2D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">Tempo / Indicación *</label>
                  <input
                    type="text"
                    required
                    value={featuredTempo}
                    onChange={(e) => setFeaturedTempo(e.target.value)}
                    placeholder="Andante cantabile ♩ = 68"
                    className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs text-[#111C2D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">Etiqueta de Muestra de Audio *</label>
                  <input
                    type="text"
                    required
                    value={featuredAudioSample}
                    onChange={(e) => setFeaturedAudioSample(e.target.value)}
                    placeholder="Pasillo No. 1 — L. A. Calvo"
                    className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs text-[#111C2D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">Badge de Calidad Editorial *</label>
                  <input
                    type="text"
                    required
                    value={featuredBadgeText}
                    onChange={(e) => setFeaturedBadgeText(e.target.value)}
                    placeholder="GRABADO URTEXT 100% Alta Resolución"
                    className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs text-[#111C2D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">URL / Enlace Ver Partitura *</label>
                <input
                  type="text"
                  required
                  value={featuredLinkUrl}
                  onChange={(e) => setFeaturedLinkUrl(e.target.value)}
                  placeholder="/partitura/malvaloca"
                  className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs font-mono text-[#0071BC]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center justify-center gap-2 mt-4"
              >
                <span className="material-symbols-outlined text-lg">save</span>
                Guardar Partitura Destacada
              </button>
            </div>

            {/* Card Preview Derecha */}
            <div className="lg:col-span-5">
              <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-4 sticky top-24">
                <span className="text-[10px] font-extrabold text-[#0071BC] uppercase tracking-wider block font-montserrat border-b border-black/5 pb-2">
                  🎼 Previsualización Card Hero Partitura
                </span>

                <div className="bg-white p-6 rounded-3xl border border-black/10 shadow-lg space-y-4 relative overflow-hidden">
                  <div className="flex justify-between items-center text-[10px] font-mono text-[#4C4546]">
                    <div className="flex gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block"></span>
                    </div>
                    <span className="font-bold text-[#0071BC]">{featuredIsmn}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0071BC] font-montserrat block">
                      {featuredGenre}
                    </span>
                    <h4 className="text-xl font-black font-montserrat text-[#111C2D]">{featuredTitle}</h4>
                    <p className="text-xs text-[#4C4546]">{featuredAuthor}</p>
                  </div>

                  {/* Pentagrama Mock */}
                  <div className="p-3 bg-[#F0F3FF]/70 rounded-xl border border-black/5 text-center font-mono text-xs text-[#0071BC]">
                    🎼 [ Muestra de Pentagrama Urtext ]
                  </div>

                  {/* Audio Player Mock */}
                  <div className="p-3 bg-[#F0F3FF] rounded-xl flex items-center justify-between border border-black/5">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="material-symbols-outlined text-[#0071BC]">play_circle</span>
                      <span className="font-bold text-[#111C2D] text-[11px]">{featuredAudioSample}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#4C4546]">01:42</span>
                  </div>

                  <div className="pt-2 flex justify-between items-center text-xs border-t border-black/5">
                    <span className="px-2.5 py-1 bg-[#FBB03B]/20 text-[#111C2D] font-extrabold rounded-md text-[10px]">
                      {featuredBadgeText}
                    </span>
                    <span className="font-bold text-[#0071BC] flex items-center gap-1 font-montserrat">
                      Ver Partitura <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ==========================================
               TAB 3: METADATOS DEL CATÁLOGO (CATEGORÍAS & DIFICULTADES BD)
               ========================================== */}
        {activeTab === "metadata" && (
          <div className="space-y-8">
            {/* Feedback Banner */}
            {feedback && (
              <div
                className={`p-4 rounded-2xl flex items-center justify-between text-xs font-medium ${
                  feedback.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
                    : "bg-rose-50 border border-rose-200 text-rose-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base shrink-0">
                    {feedback.type === "success" ? "check_circle" : "error"}
                  </span>
                  <span>{feedback.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFeedback(null)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            )}

            {/* SECCIÓN 1: CATEGORÍAS PIANÍSTICAS */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5 pb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold font-montserrat text-[#111C2D]">
                    1. Categorías Musicales / Géneros del Catálogo
                  </h2>
                  <p className="text-xs text-[#4C4546] mt-0.5">
                    Estas categorías se listan en los filtros de la tienda pública y en el formulario de subida de partituras de los compositores.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#0071BC] bg-[#F0F3FF] px-3 py-1 rounded-full border border-black/5 font-mono shrink-0">
                  {categories.length} categorías activas
                </span>
              </div>

              {/* Formulario Añadir Categoría */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCategory();
                    }
                  }}
                  placeholder="Ej: Pasillo, Bambuco, Danza, Estudio de Concierto..."
                  className="flex-1 bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-4 py-2.5 bg-[#0071BC] hover:bg-[#005a96] text-white font-bold text-xs rounded-xl transition font-montserrat flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  <span>Añadir Categoría</span>
                </button>
              </div>

              {/* Lista de Categorías Actuales */}
              <div className="flex flex-wrap gap-2.5 pt-2">
                {categories.map((cat: any, idx) => {
                  const label = typeof cat === "string" ? cat : (cat.title_es || cat.title || cat.name || String(cat));
                  return (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#F0F3FF] border border-black/5 rounded-xl text-xs font-bold text-[#111C2D] shadow-2xs font-montserrat"
                    >
                      <span>{label}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(cat)}
                        className="text-slate-400 hover:text-red-600 transition"
                        title="Eliminar categoría"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECCIÓN 2: NIVELES DE DIFICULTAD */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5 pb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold font-montserrat text-[#111C2D]">
                    2. Niveles de Dificultad Técnicos
                  </h2>
                  <p className="text-xs text-[#4C4546] mt-0.5">
                    Niveles pedagógicos y concertísticos configurados en la base de datos (se despliegan dinámicamente en el formulario del compositor).
                  </p>
                </div>
                <span className="text-xs font-bold text-[#0071BC] bg-[#F0F3FF] px-3 py-1 rounded-full border border-black/5 font-mono shrink-0">
                  {difficulties.length} niveles activos
                </span>
              </div>

              {/* Formulario Añadir Nivel */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newDifficultyInput}
                  onChange={(e) => setNewDifficultyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddDifficulty();
                    }
                  }}
                  placeholder="Ej: Principiante, Intermedio, Avanzado, Virtuoso..."
                  className="flex-1 bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                />
                <button
                  type="button"
                  onClick={handleAddDifficulty}
                  className="px-4 py-2.5 bg-[#0071BC] hover:bg-[#005a96] text-white font-bold text-xs rounded-xl transition font-montserrat flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  <span>Añadir Nivel</span>
                </button>
              </div>

              {/* Lista de Niveles de Dificultad Actuales */}
              <div className="flex flex-wrap gap-2.5 pt-2">
                {difficulties.map((diff: any, idx) => {
                  const label = typeof diff === "string" ? diff : (diff.title_es || diff.title || diff.name || diff.code || String(diff));
                  return (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-2 px-3.5 py-2 bg-amber-50 border border-amber-200/70 rounded-xl text-xs font-bold text-amber-950 shadow-2xs font-montserrat"
                    >
                      <span>{label}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDifficulty(diff)}
                        className="text-amber-500 hover:text-red-600 transition"
                        title="Eliminar nivel"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BARRA DE ACCIÓN DE GUARDADO EN BD */}
            <div className="bg-[#111C2D] text-white p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div>
                <span className="text-xs font-bold text-[#FBB03B] font-montserrat block uppercase tracking-wider">
                  Sincronización con PostgreSQL
                </span>
                <p className="text-xs text-slate-300 mt-0.5">
                  Los cambios se almacenan en la tabla <code>platform_settings</code> y se reflejan al instante en la tienda y el panel del compositor.
                </p>
              </div>

              <button
                type="button"
                disabled={isSavingMetadata}
                onClick={handleSaveMetadata}
                className="w-full sm:w-auto px-6 py-3 bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isSavingMetadata ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#111C2D] border-t-transparent rounded-full animate-spin"></span>
                    <span>Guardando en BD...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">save</span>
                    <span>Guardar Metadatos en Base de Datos</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ==========================================
               TAB 4: PÁGINAS LEGALES Y T&C
               ========================================== */}
        {activeTab === "legals" && (
          <div className="space-y-6">
            <h2 className="text-base font-bold font-montserrat text-[#111C2D]">Editor de Páginas Legales & Informativas</h2>
            <div className="space-y-4">
              
              <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-base font-bold font-montserrat text-[#111C2D]">Términos y Condiciones para Compositores</h3>
                  <p className="text-xs text-[#4C4546]">Última versión: 2 de Septiembre, 2026</p>
                </div>
                <button
                  type="button"
                  onClick={() => alert("Abriendo editor Rich-Text...")}
                  className="px-4 py-2 bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-base">edit_note</span> Editar Documento
                </button>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-base font-bold font-montserrat text-[#111C2D]">Política de Tratamiento de Datos Personales</h3>
                  <p className="text-xs text-[#4C4546]">Última versión: 2 de Septiembre, 2026</p>
                </div>
                <button
                  type="button"
                  onClick={() => alert("Abriendo editor Rich-Text...")}
                  className="px-4 py-2 bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-base">edit_note</span> Editar Documento
                </button>
              </div>

            </div>
          </div>
        )}

      </form>

    </div>
  );
}
