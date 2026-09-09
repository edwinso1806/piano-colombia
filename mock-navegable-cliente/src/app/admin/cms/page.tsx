"use client";

import { useState } from "react";
import Link from "next/link";

export default function AdminCMSPage() {
  const [activeTab, setActiveTab] = useState<"hero" | "featured_score" | "categories" | "legals">("hero");
  const [isSaved, setIsSaved] = useState(false);

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

  // Estado de Categorías
  const [categories, setCategories] = useState([
    { id: "cat_1", title: "Piano Solo", count: 45, status: "VISIBLE" },
    { id: "cat_2", title: "Piano a 4 Manos", count: 12, status: "VISIBLE" },
    { id: "cat_3", title: "Piano y Orquesta", count: 8, status: "VISIBLE" },
    { id: "cat_4", title: "Música de Cámara", count: 15, status: "VISIBLE" },
    { id: "cat_5", title: "Piezas Pedagógicas", count: 30, status: "VISIBLE" },
    { id: "cat_6", title: "Piano y Electrónica", count: 6, status: "VISIBLE" },
  ]);

  const handleSaveCMS = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
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

      {/* Alerta de Éxito al Guardar */}
      {isSaved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-xs font-bold font-montserrat shadow-2xs">
          <span className="material-symbols-outlined text-emerald-600">check_circle</span>
          <span>¡Cambios del CMS guardados y publicados exitosamente en la portada de Piano Colombia!</span>
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
          onClick={() => setActiveTab("categories")}
          className={`flex items-center gap-2 px-5 py-3 font-extrabold text-xs rounded-t-xl transition border-b-2 whitespace-nowrap ${
            activeTab === "categories"
              ? "bg-white text-[#111C2D] border-[#FBB03B] shadow-2xs"
              : "text-[#4C4546] hover:text-[#111C2D] border-transparent hover:bg-white/60"
          }`}
        >
          <span className="material-symbols-outlined text-base text-[#0071BC]">folder_open</span>
          Categorías Pianísticas
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
                  className="w-full py-3.5 bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">save</span>
                  Guardar & Publicar Cambios del Hero
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
               TAB 3: CATEGORÍAS PIANÍSTICAS
               ========================================== */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold font-montserrat text-[#111C2D]">Categorías del Catálogo de la Tienda</h2>
              <button
                type="button"
                onClick={() => alert("Creando nueva categoría...")}
                className="px-4 py-2 bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">create_new_folder</span>
                Nueva Categoría
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {categories.map((c) => (
                <div key={c.id} className="bg-white p-6 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-bold font-montserrat text-[#111C2D]">{c.title}</h3>
                    <span className="text-xs font-bold text-[#0071BC] bg-[#F0F3FF] px-2.5 py-0.5 rounded-full border border-black/5 font-mono">
                      {c.count} obras
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-black/5 text-xs">
                    <span className="text-emerald-700 font-bold font-montserrat flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">visibility</span> {c.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => alert("Editar categoría...")}
                      className="text-[#0071BC] font-bold hover:underline font-montserrat"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              ))}
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
