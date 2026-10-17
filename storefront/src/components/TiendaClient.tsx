"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import SaveScoreButton from "@/components/SaveScoreButton";

const DIFFICULTY_LEVELS = ["Principiante", "Intermedio", "Avanzado", "Virtuoso"] as const;
type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];

const DIFFICULTY_EN_MAP: Record<DifficultyLevel, string> = {
  Principiante: "Beginner",
  Intermedio: "Intermediate",
  Avanzado: "Advanced",
  Virtuoso: "Virtuoso",
};

interface TiendaClientProps {
  allScores: any[];
  categories: any[];
  activeCategorySlug: string;
  activeLevels: string[];
  activeCategory: any;
  difficultyCounts: Record<DifficultyLevel, number>;
}

export default function TiendaClient({
  allScores,
  categories,
  activeCategorySlug,
  activeLevels,
  activeCategory,
  difficultyCounts,
}: TiendaClientProps) {
  const { t, language } = useLanguage();
  const isEn = language === "en";

  const [searchQuery, setSearchQuery] = useState("");

  const getFilterUrl = (options: {
    categorySlug?: string | null;
    toggleLevel?: string;
    removeLevel?: string;
  }) => {
    const q = new URLSearchParams();

    const cat =
      options.categorySlug !== undefined
        ? options.categorySlug
        : activeCategorySlug;
    if (cat && cat !== "todas") {
      q.set("categoria", cat);
    }

    let levels = [...activeLevels];
    if (options.toggleLevel) {
      const target = options.toggleLevel.toLowerCase();
      if (levels.includes(target)) {
        levels = levels.filter((l) => l !== target);
      } else {
        levels.push(target);
      }
    } else if (options.removeLevel) {
      const target = options.removeLevel.toLowerCase();
      levels = levels.filter((l) => l !== target);
    }

    if (levels.length > 0) {
      q.set("nivel", levels.join(","));
    }

    const qs = q.toString();
    return qs ? `/tienda?${qs}` : "/tienda";
  };

  const slugify = (text: string) =>
    (text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  const filteredScores = allScores.filter((score: any) => {
    // 0. Filtro por término de búsqueda en tiempo real
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const title = (score.title || "").toLowerCase();
      const composer = (score.composer || score.composerName || score.composer_name || "").toLowerCase();
      const category = (score.category || "").toLowerCase();
      const genre = (score.genre || "").toLowerCase();
      const key = (score.keySignature || score.key || "").toLowerCase();

      const matchesSearch =
        title.includes(q) ||
        composer.includes(q) ||
        category.includes(q) ||
        genre.includes(q) ||
        key.includes(q);

      if (!matchesSearch) return false;
    }

    // 1. Filtro estricto por categoría (Exact Match)
    if (activeCategorySlug && activeCategorySlug !== "todas") {
      const scoreCatSlug = slugify(score.category || "");
      const targetCatSlug = slugify(activeCategory ? activeCategory.title : activeCategorySlug);
      const targetDirectSlug = slugify(activeCategorySlug);
      const activeObjSlug = activeCategory?.slug ? slugify(activeCategory.slug) : "";

      const matchesCat =
        scoreCatSlug === targetCatSlug ||
        scoreCatSlug === targetDirectSlug ||
        (activeObjSlug !== "" && scoreCatSlug === activeObjSlug);

      if (!matchesCat) return false;
    }

    if (activeLevels.length > 0) {
      const scoreNormalizedLevel = (score.level || "").toLowerCase();
      const matchesLevel = activeLevels.includes(scoreNormalizedLevel);
      if (!matchesLevel) return false;
    }

    return true;
  });

  const hasActiveFilters = Boolean(activeCategorySlug) || activeLevels.length > 0 || Boolean(searchQuery.trim());

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 flex flex-col md:flex-row gap-8 min-w-0">
      {/* Sidebar Filtros */}
      <aside className="w-full md:w-64 space-y-6 shrink-0">
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-montserrat font-extrabold text-lg text-[#111C2D] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0071BC]">tune</span>
              {isEn ? "Filters" : "Filtros"}
            </h3>
            {hasActiveFilters && (
              <Link
                href="/tienda"
                className="text-[11px] font-bold text-rose-600 hover:underline font-montserrat"
              >
                {isEn ? "Reset" : "Limpiar"}
              </Link>
            )}
          </div>

          {/* Categorías Dinámicas de BD */}
          <div className="mb-6">
            <label className="text-xs font-extrabold uppercase tracking-wider text-[#0071BC] block mb-3 font-montserrat">
              {t("store.categories", "Categoría")}
            </label>
            <div className="space-y-2 text-xs text-[#4C4546] font-medium">
              {/* Opción Todas */}
              <Link
                href={getFilterUrl({ categorySlug: null })}
                className={`flex items-center justify-between p-2 rounded-xl transition ${
                  !activeCategorySlug
                    ? "bg-[#F0F3FF] text-[#0071BC] font-bold"
                    : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="categoria_filter"
                    checked={!activeCategorySlug}
                    readOnly
                    className="w-3.5 h-3.5 accent-[#0071BC]"
                  />
                  <span>{isEn ? "All Works" : "Todas las Obras"}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">({allScores.length})</span>
              </Link>

              {/* Categorías dinámicas */}
              {categories.map((cat: any, i: number) => {
                const isSelected = activeCategorySlug === (cat.slug || "").toLowerCase();
                const catHref = getFilterUrl({
                  categorySlug: isSelected ? null : (cat.slug || cat.title),
                });
                const catTitle = isEn
                  ? (cat.slug === "piano-solo" ? "Piano Solo" : cat.slug === "piano-a-4-manos" ? "Piano 4-Hands" : cat.slug === "piano-y-orquesta" ? "Piano & Orchestra" : cat.slug === "musica-de-camara" ? "Chamber Music" : cat.slug === "piezas-pedagogicas" ? "Pedagogical Pieces" : cat.slug === "piano-y-electronica" ? "Piano & Electronics" : (cat.title_en || cat.title))
                  : cat.title;

                return (
                  <Link
                    key={cat.id || i}
                    href={catHref}
                    className={`flex items-center justify-between p-2 rounded-xl transition ${
                      isSelected
                        ? "bg-[#F0F3FF] text-[#0071BC] font-bold border border-[#0071BC]/20"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <input
                        type="radio"
                        name="categoria_filter"
                        checked={isSelected}
                        readOnly
                        className="w-3.5 h-3.5 accent-[#0071BC]"
                      />
                      <span className="truncate">{catTitle}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-1">
                      ({cat.count ?? 0})
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Nivel de Dificultad */}
          <div className="pt-4 border-t border-black/5">
            <label className="text-xs font-extrabold uppercase tracking-wider text-[#0071BC] block mb-3 font-montserrat">
              {t("store.difficulty", "Nivel de Dificultad")}
            </label>
            <div className="space-y-1.5 text-xs text-[#4C4546] font-medium">
              {DIFFICULTY_LEVELS.map((lvl) => {
                const lvlLower = lvl.toLowerCase();
                const isChecked = activeLevels.includes(lvlLower);
                const count = difficultyCounts[lvl] || 0;
                const href = getFilterUrl({ toggleLevel: lvlLower });
                const label = isEn ? DIFFICULTY_EN_MAP[lvl] : lvl;

                return (
                  <Link
                    key={lvl}
                    href={href}
                    className={`flex items-center justify-between p-2 rounded-xl transition cursor-pointer select-none ${
                      isChecked
                        ? "bg-[#F0F3FF] text-[#0071BC] font-bold border border-[#0071BC]/20 shadow-xs"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center transition-colors border ${
                          isChecked
                            ? "bg-[#0071BC] border-[#0071BC] text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isChecked && (
                          <span className="material-symbols-outlined text-xs font-bold leading-none select-none">
                            check
                          </span>
                        )}
                      </div>
                      <span className="truncate">{label}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-1">
                      ({count})
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* Catalog Grid */}
      <section className="flex-1 min-w-0">
        {/* Header Banner del Catálogo */}
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F3FF] text-[10px] font-extrabold text-[#0071BC] uppercase tracking-wider font-montserrat mb-2 border border-[#0071BC]/10">
              <span className="material-symbols-outlined text-xs">verified</span>{" "}
              {isEn ? "Philological & Urtext Editions" : "Edición Filológica & Urtext"}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-montserrat text-[#111C2D]">
              {activeCategory
                ? `${isEn ? "Catalog:" : "Catálogo:"} ${activeCategory.title}`
                : t("store.title", "Catálogo de Partituras")}
            </h1>
            <p className="text-xs text-[#4C4546] mt-1 font-medium">
              {activeCategory?.description ||
                (isEn
                  ? "Repertoire vetted with concert fingerings and authorized personal digital licenses."
                  : "Repertorio revisado con marcaciones de digitación y licencias legalmente firmadas.")}
            </p>

            {/* Tags activos de filtrado */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="text-[11px] text-[#4C4546] font-semibold">
                  {isEn ? "Active filters:" : "Filtrado activo:"}
                </span>

                {/* Tag búsqueda */}
                {searchQuery.trim() && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#0071BC]/10 text-[#0071BC] text-xs font-bold font-montserrat border border-[#0071BC]/20">
                    <span className="material-symbols-outlined text-sm">search</span>
                    <span>{isEn ? "Search:" : "Búsqueda:"} "{searchQuery.trim()}"</span>
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="hover:text-rose-600 transition ml-1 inline-flex items-center cursor-pointer"
                      title={isEn ? "Clear search" : "Quitar filtro de búsqueda"}
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </span>
                )}

                {/* Tag categoría */}
                {activeCategory && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#0071BC]/10 text-[#0071BC] text-xs font-bold font-montserrat border border-[#0071BC]/20">
                    <span className="material-symbols-outlined text-sm">{activeCategory.icon || "piano"}</span>
                    <span>{isEn ? "Category:" : "Categoría:"} {activeCategory.title}</span>
                    <Link
                      href={getFilterUrl({ categorySlug: null })}
                      className="hover:text-rose-600 transition ml-1 inline-flex items-center"
                      title={isEn ? "Remove category filter" : "Quitar filtro de categoría"}
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                    </Link>
                  </span>
                )}

                {/* Tags dificultad */}
                {activeLevels.map((lvl) => {
                  const originalName = DIFFICULTY_LEVELS.find((d) => d.toLowerCase() === lvl) || lvl;
                  const displayName = isEn ? (DIFFICULTY_EN_MAP[originalName as DifficultyLevel] || originalName) : originalName;
                  return (
                    <span
                      key={lvl}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FBB03B]/20 text-[#111C2D] text-xs font-bold font-montserrat border border-[#FBB03B]/40"
                    >
                      <span className="material-symbols-outlined text-sm">signal_cellular_alt</span>
                      <span>{isEn ? "Level:" : "Nivel:"} {displayName}</span>
                      <Link
                        href={getFilterUrl({ removeLevel: lvl })}
                        className="hover:text-rose-600 transition ml-1 inline-flex items-center"
                        title={`${isEn ? "Remove filter" : "Quitar filtro"} ${displayName}`}
                      >
                        <span className="material-symbols-outlined text-xs">close</span>
                      </Link>
                    </span>
                  );
                })}

                {/* Botón limpiar todos */}
                {hasActiveFilters && (
                  <Link
                    href="/tienda"
                    onClick={() => setSearchQuery("")}
                    className="text-[11px] text-rose-600 hover:underline font-bold font-montserrat ml-1"
                  >
                    {isEn ? "Reset all" : "Limpiar todos"}
                  </Link>
                )}
              </div>
            )}
          </div>

          <span className="text-xs text-[#4C4546] font-bold font-montserrat bg-[#F0F3FF] px-3.5 py-1.5 rounded-full shrink-0 border border-black/5">
            {filteredScores.length}{" "}
            {filteredScores.length === 1
              ? (isEn ? "score available" : "partitura disponible")
              : (isEn ? "scores available" : "partituras disponibles")}
          </span>
        </div>

        {/* Buscador de Partituras en Tiempo Real */}
        <div className="relative mb-6">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4C4546] text-lg pointer-events-none">
            search
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("store.search_placeholder", isEn ? "Search by title, composer, genre, or key..." : "Buscar por título, compositor, género o tonalidad...")}
            className="w-full pl-10 pr-10 py-3 bg-white border border-black/5 rounded-2xl text-xs sm:text-sm text-[#111C2D] placeholder-[#4C4546]/60 shadow-[0_10px_30px_rgba(0,0,0,0.03)] focus:outline-none focus:ring-2 focus:ring-[#0071BC] transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
              title={isEn ? "Clear search" : "Borrar búsqueda"}
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          )}
        </div>

        {/* Product Cards Grid */}
        {filteredScores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScores.map((score: any) => (
              <div
                key={score.id}
                className="group flex flex-col rounded-2xl bg-white border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden"
              >
                {/* Miniature Preview Container */}
                <div className="relative aspect-[4/3] bg-slate-100/70 p-3 overflow-hidden border-b border-black/5 flex items-center justify-center">
                  {score.previewPages && score.previewPages.length > 0 ? (
                    <img
                      src={score.previewPages[0]}
                      alt={score.title}
                      className="w-full h-full object-contain filter group-hover:scale-105 transition-transform duration-500 rounded shadow-xs"
                    />
                  ) : (
                    <div className="py-6 opacity-30 select-none text-center flex flex-col justify-center px-4 w-full">
                      <div className="h-0.5 w-full bg-slate-300 my-1"></div>
                      <div className="h-0.5 w-full bg-slate-300 my-1"></div>
                      <div className="h-0.5 w-full bg-slate-300 my-1"></div>
                      <div className="h-0.5 w-full bg-slate-300 my-1"></div>
                      <div className="mt-2 font-serif italic text-[#111C2D] font-bold text-sm truncate">{score.title}</div>
                    </div>
                  )}
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Badges de Género & Dificultad */}
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FBB03B]/20 text-[#111C2D] font-montserrat font-extrabold text-[10px] uppercase">
                        {score.category}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#F0F3FF] text-[#0071BC] font-montserrat font-extrabold text-[10px]">
                        {isEn ? (DIFFICULTY_EN_MAP[score.level as DifficultyLevel] || score.level) : score.level}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#111C2D] font-montserrat group-hover:text-[#0071BC] transition-colors leading-snug">
                      {score.title}
                    </h3>
                    <p className="text-xs text-[#4C4546] font-semibold mt-1">
                      {isEn ? "By" : "Por"} {score.composer}
                    </p>
                    <p className="text-xs text-[#4C4546] mt-2 line-clamp-2 leading-relaxed font-normal">
                      {isEn ? (score.description_en || score.description) : (score.description_es || score.description)}
                    </p>
                  </div>

                  {/* Fila del Precio + Botón Ver Detalle */}
                  <div className="pt-3 border-t border-black/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-black text-[#111C2D] font-montserrat tracking-tight">
                          ${score.priceCOP.toLocaleString("es-CO")}{" "}
                          <span className="text-xs text-[#4C4546] font-bold">COP</span>
                        </div>
                        <span className="text-[11px] text-[#4C4546] font-medium block">
                          (~${score.priceUSD} USD)
                        </span>
                      </div>

                      <SaveScoreButton score={score} variant="icon" />
                    </div>

                    <Link
                      href={`/partitura/${score.slug}`}
                      className="w-full py-2.5 bg-[#FBB03B] hover:bg-[#e09b2d] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-xs font-montserrat flex items-center justify-center gap-1.5"
                    >
                      <span>{isEn ? "View Details" : "Ver Detalle"}</span>
                      <span className="material-symbols-outlined text-sm">north_east</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : allScores.length > 0 ? (
          /* Filtros activos o búsqueda sin resultados pero el catálogo sí tiene obras */
          <div className="bg-white rounded-3xl border border-black/5 p-12 sm:p-16 text-center max-w-xl mx-auto space-y-5 shadow-xs animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">search_off</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black font-montserrat text-[#111C2D]">
                {isEn ? "No sheet music matches your search criteria" : "Sin coincidencias para los filtros aplicados"}
              </h3>

              {/* Badges de filtros activos */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1 pb-1">
                {searchQuery.trim() && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0071BC]/10 text-[#0071BC] text-xs font-bold font-montserrat border border-[#0071BC]/20">
                    <span className="material-symbols-outlined text-sm">search</span>
                    <span>{isEn ? "Search:" : "Búsqueda:"} "{searchQuery.trim()}"</span>
                  </span>
                )}
                {activeCategory && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBB03B]/20 text-[#111C2D] text-xs font-bold font-montserrat border border-[#FBB03B]/40">
                    <span className="material-symbols-outlined text-sm">{activeCategory.icon || "piano"}</span>
                    <span>{isEn ? "Category:" : "Categoría:"} {activeCategory.title}</span>
                  </span>
                )}
                {activeLevels.map((lvl) => {
                  const originalName = DIFFICULTY_LEVELS.find((d) => d.toLowerCase() === lvl) || lvl;
                  const displayName = isEn ? (DIFFICULTY_EN_MAP[originalName as DifficultyLevel] || originalName) : originalName;
                  return (
                    <span
                      key={lvl}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBB03B]/20 text-[#111C2D] text-xs font-bold font-montserrat border border-[#FBB03B]/40"
                    >
                      <span className="material-symbols-outlined text-sm">signal_cellular_alt</span>
                      <span>{isEn ? "Level:" : "Nivel:"} {displayName}</span>
                    </span>
                  );
                })}
              </div>

              <p className="text-xs sm:text-sm text-[#4C4546] leading-relaxed max-w-md mx-auto">
                {isEn
                  ? `There are ${allScores.length} score${allScores.length > 1 ? "s" : ""} available in our catalog, but none match the current search or filters. Try adjusting your query or reset the filters.`
                  : `Contamos con ${allScores.length} partitura${allScores.length > 1 ? "s" : ""} disponible${allScores.length > 1 ? "s" : ""} en el catálogo general, pero ninguna coincide con la búsqueda o filtros aplicados. Intenta con otro término o limpia los filtros.`}
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/tienda"
                onClick={() => setSearchQuery("")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0071BC] hover:bg-[#005a96] text-white font-extrabold text-xs uppercase tracking-wider font-montserrat shadow-md transition cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-base">restart_alt</span>
                <span>
                  {isEn
                    ? `Clear filters and view all (${allScores.length})`
                    : `Limpiar filtros y ver todas (${allScores.length})`}
                </span>
              </Link>
            </div>
          </div>
        ) : (
          /* Catálogo completamente vacío en BD */
          <div className="p-12 text-center bg-white rounded-2xl border border-black/5 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#F0F3FF] text-[#0071BC] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">music_note</span>
            </div>
            <h3 className="text-base font-bold font-montserrat text-[#111C2D]">
              {isEn ? "No sheet music in the catalog yet" : "Catálogo en proceso de curaduría"}
            </h3>
            <p className="text-xs text-[#4C4546] max-w-md mx-auto leading-relaxed">
              {isEn
                ? "Scores are currently being edited and verified. Check back soon!"
                : "Actualmente se están preparando y verificando las ediciones Urtext. ¡Vuelve pronto!"}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
