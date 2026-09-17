import Link from "next/link";
import { MOCK_SCORES } from "@/lib/mock-data";
import { getCatalogScores, getCmsCategories } from "@/lib/api-client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SaveScoreButton from "@/components/SaveScoreButton";

const DIFFICULTY_LEVELS = ["Principiante", "Intermedio", "Avanzado", "Virtuoso"] as const;
type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];

function normalizeDifficulty(diff?: string | null): DifficultyLevel {
  if (!diff) return "Intermedio";
  const str = diff.toLowerCase();
  if (str.includes("principi") || str.includes("beginner")) return "Principiante";
  if (str.includes("avanzad") || str.includes("advanced")) return "Avanzado";
  if (str.includes("virtuos")) return "Virtuoso";
  return "Intermedio";
}

export default async function TiendaPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const activeCategorySlug = (
    typeof resolvedParams?.categoria === "string" ? resolvedParams.categoria : ""
  ).toLowerCase().trim();

  // Extraer niveles activos seleccionados
  const rawNivel = resolvedParams?.nivel;
  const activeLevels: string[] = [];
  if (Array.isArray(rawNivel)) {
    rawNivel.forEach((n) => {
      n.split(",").forEach((sub) => {
        const trimmed = sub.trim().toLowerCase();
        if (trimmed && !activeLevels.includes(trimmed)) activeLevels.push(trimmed);
      });
    });
  } else if (typeof rawNivel === "string" && rawNivel.trim()) {
    rawNivel.split(",").forEach((sub) => {
      const trimmed = sub.trim().toLowerCase();
      if (trimmed && !activeLevels.includes(trimmed)) activeLevels.push(trimmed);
    });
  }

  // Función para construir URLs de filtros manteniendo o alternando parámetros
  const getFilterUrl = (options: {
    categorySlug?: string | null;
    toggleLevel?: string;
    removeLevel?: string;
  }) => {
    const q = new URLSearchParams();

    // Categoría
    const cat =
      options.categorySlug !== undefined
        ? options.categorySlug
        : activeCategorySlug;
    if (cat && cat !== "todas") {
      q.set("categoria", cat);
    }

    // Niveles de dificultad
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

  // Consultar partituras y categorías reales desde la base de datos
  const [liveScores, liveCategories] = await Promise.all([
    getCatalogScores(),
    getCmsCategories(),
  ]);

  const allScores = Array.isArray(liveScores) && liveScores.length > 0
    ? liveScores.map((s: any) => ({
        id: s.id,
        title: s.title,
        slug: s.slug || s.id,
        composer: s.composer?.artistic_name || `${s.composer?.first_name || ""} ${s.composer?.last_name || ""}`.trim() || "Compositor Colombiano",
        composerId: s.composer_id,
        level: normalizeDifficulty(s.difficulty),
        category: s.genre || "Piano Solo",
        tags: s.tags || [],
        priceCOP: Number(s.price_cop) || 45000,
        priceUSD: Number(s.price_usd) || 12,
        previewPages: s.preview_images || [],
        description: s.description || "Edición filológica y digital de alta calidad con licencias oficiales.",
      }))
    : MOCK_SCORES.map((s) => ({
        ...s,
        level: normalizeDifficulty(s.level),
      }));

  const categories = Array.isArray(liveCategories) && liveCategories.length > 0
    ? liveCategories
    : [
        { title: "Piano Solo", slug: "piano-solo", count: 3, display_count: "3 Obras", icon: "piano" },
        { title: "Piano a 4 Manos", slug: "piano-a-4-manos", count: 1, display_count: "1 Obra", icon: "group" },
        { title: "Piano y Orquesta", slug: "piano-y-orquesta", count: 0, display_count: "0 Conciertos", icon: "stadium" },
        { title: "Música de Cámara", slug: "musica-de-camara", count: 0, display_count: "0 Partituras", icon: "diversity_3" },
        { title: "Piezas Pedagógicas", slug: "piezas-pedagogicas", count: 0, display_count: "0 Cuadernos", icon: "school" },
        { title: "Piano y Electrónica", slug: "piano-y-electronica", count: 0, display_count: "0 Obras", icon: "graphic_eq" },
      ];

  // Contadores de obras por nivel de dificultad
  const difficultyCounts: Record<DifficultyLevel, number> = {
    Principiante: 0,
    Intermedio: 0,
    Avanzado: 0,
    Virtuoso: 0,
  };

  allScores.forEach((s: any) => {
    const lvl = normalizeDifficulty(s.level);
    if (difficultyCounts[lvl] !== undefined) {
      difficultyCounts[lvl]++;
    }
  });

  // Encontrar la categoría seleccionada si hay slug
  const activeCategory = categories.find((c: any) => {
    const cSlug = (c.slug || "").toLowerCase();
    const cTitle = (c.title || "").toLowerCase();
    return cSlug === activeCategorySlug || cTitle === activeCategorySlug;
  });

  // Filtrar partituras si hay categoría activa o niveles de dificultad
  const filteredScores = allScores.filter((score: any) => {
    // 1. Filtro por categoría
    if (activeCategorySlug && activeCategorySlug !== "todas") {
      let matchesCat = false;
      if (activeCategory) {
        const catTitleLower = activeCategory.title.toLowerCase();
        const scoreCatLower = (score.category || "").toLowerCase();
        const matching = (activeCategory.matching_genres || [activeCategory.title]).map((m: string) => m.toLowerCase());

        matchesCat = (
          scoreCatLower === catTitleLower ||
          scoreCatLower.includes(catTitleLower) ||
          catTitleLower.includes(scoreCatLower) ||
          matching.some((mg: string) => scoreCatLower === mg || scoreCatLower.includes(mg) || mg.includes(scoreCatLower))
        );
      } else {
        const scoreGenreSlug = (score.category || "").toLowerCase().replace(/\s+/g, "-");
        matchesCat = scoreGenreSlug.includes(activeCategorySlug) || activeCategorySlug.includes(scoreGenreSlug);
      }

      if (!matchesCat) return false;
    }

    // 2. Filtro por nivel de dificultad
    if (activeLevels.length > 0) {
      const scoreNormalizedLevel = normalizeDifficulty(score.level).toLowerCase();
      const matchesLevel = activeLevels.includes(scoreNormalizedLevel);
      if (!matchesLevel) return false;
    }

    return true;
  });

  const hasActiveFilters = Boolean(activeCategorySlug) || activeLevels.length > 0;

  return (
    <div className="min-h-screen bg-[#F9F9FF] text-[#111C2D] flex flex-col font-inter antialiased selection:bg-[#FBB03B]/30 selection:text-[#111C2D]">
      
      {/* Header Fijo con Estilo Stitch */}
      <Header activePage="tienda" />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 flex flex-col md:flex-row gap-8 min-w-0">
        
        {/* Sidebar Filtros */}
        <aside className="w-full md:w-64 space-y-6 shrink-0">
          <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-montserrat font-extrabold text-lg text-[#111C2D] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0071BC]">tune</span>
                Filtros
              </h3>
              {hasActiveFilters && (
                <Link
                  href="/tienda"
                  className="text-[11px] font-bold text-rose-600 hover:underline font-montserrat"
                >
                  Limpiar
                </Link>
              )}
            </div>

            {/* Categorías Dinámicas de BD */}
            <div className="mb-6">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#0071BC] block mb-3 font-montserrat">
                Categoría
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
                    <span>Todas las Obras</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">({allScores.length})</span>
                </Link>

                {/* Categorías dinámicas desde BD */}
                {categories.map((cat: any, i: number) => {
                  const isSelected = activeCategorySlug === (cat.slug || "").toLowerCase();
                  const catHref = getFilterUrl({
                    categorySlug: isSelected ? null : (cat.slug || cat.title),
                  });
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
                        <span className="truncate">{cat.title}</span>
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
                Nivel de Dificultad
              </label>
              <div className="space-y-1.5 text-xs text-[#4C4546] font-medium">
                {DIFFICULTY_LEVELS.map((lvl) => {
                  const lvlLower = lvl.toLowerCase();
                  const isChecked = activeLevels.includes(lvlLower);
                  const count = difficultyCounts[lvl] || 0;
                  const href = getFilterUrl({ toggleLevel: lvlLower });

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
                        <span className="truncate">{lvl}</span>
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
                <span className="material-symbols-outlined text-xs">verified</span> Edición Filológica & Urtext
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-montserrat text-[#111C2D]">
                {activeCategory ? `Catálogo: ${activeCategory.title}` : "Catálogo de Partituras"}
              </h1>
              <p className="text-xs text-[#4C4546] mt-1 font-medium">
                {activeCategory?.description || "Repertorio revisado con marcaciones de digitación y licencias legalmente firmadas."}
              </p>

              {/* Tags activos de filtrado */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="text-[11px] text-[#4C4546] font-semibold">Filtrado activo:</span>
                  
                  {/* Tag categoría */}
                  {activeCategory && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#0071BC]/10 text-[#0071BC] text-xs font-bold font-montserrat border border-[#0071BC]/20">
                      <span className="material-symbols-outlined text-sm">{activeCategory.icon || "piano"}</span>
                      <span>Categoría: {activeCategory.title}</span>
                      <Link
                        href={getFilterUrl({ categorySlug: null })}
                        className="hover:text-rose-600 transition ml-1 inline-flex items-center"
                        title="Quitar filtro de categoría"
                      >
                        <span className="material-symbols-outlined text-xs">close</span>
                      </Link>
                    </span>
                  )}

                  {/* Tags dificultad */}
                  {activeLevels.map((lvl) => {
                    const originalName = DIFFICULTY_LEVELS.find((d) => d.toLowerCase() === lvl) || lvl;
                    return (
                      <span
                        key={lvl}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FBB03B]/20 text-[#111C2D] text-xs font-bold font-montserrat border border-[#FBB03B]/40"
                      >
                        <span className="material-symbols-outlined text-sm">signal_cellular_alt</span>
                        <span>Nivel: {originalName}</span>
                        <Link
                          href={getFilterUrl({ removeLevel: lvl })}
                          className="hover:text-rose-600 transition ml-1 inline-flex items-center"
                          title={`Quitar filtro ${originalName}`}
                        >
                          <span className="material-symbols-outlined text-xs">close</span>
                        </Link>
                      </span>
                    );
                  })}

                  {/* Botón limpiar todos si hay más de 1 filtro activo */}
                  {((Boolean(activeCategory) && activeLevels.length > 0) || activeLevels.length > 1) && (
                    <Link
                      href="/tienda"
                      className="text-[11px] text-rose-600 hover:underline font-bold font-montserrat ml-1"
                    >
                      Limpiar todos
                    </Link>
                  )}
                </div>
              )}
            </div>
            
            <span className="text-xs text-[#4C4546] font-bold font-montserrat bg-[#F0F3FF] px-3.5 py-1.5 rounded-full shrink-0 border border-black/5">
              {filteredScores.length} {filteredScores.length === 1 ? "partitura disponible" : "partituras disponibles"}
            </span>
          </div>

          {/* Product Cards Grid */}
          {filteredScores.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredScores.map((score: any) => (
                <div key={score.id} className="group flex flex-col rounded-2xl bg-white border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden">
                  
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
                          {score.level}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-[#111C2D] font-montserrat group-hover:text-[#0071BC] transition-colors leading-snug">
                        {score.title}
                      </h3>
                      <p className="text-xs text-[#4C4546] font-semibold mt-1">Por {score.composer}</p>
                      <p className="text-xs text-[#4C4546] mt-2 line-clamp-2 leading-relaxed font-normal">
                        {score.description}
                      </p>
                    </div>

                    {/* Fila del Precio + Botón Ver Detalle */}
                    <div className="pt-3 border-t border-black/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-black text-[#111C2D] font-montserrat tracking-tight">
                            ${score.priceCOP.toLocaleString('es-CO')} <span className="text-xs text-[#4C4546] font-bold">COP</span>
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
                        <span>Ver Detalle</span>
                        <span className="material-symbols-outlined text-sm">north_east</span>
                      </Link>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-black/5 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#F0F3FF] text-[#0071BC] flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-3xl">
                  {activeCategory?.icon || "music_note"}
                </span>
              </div>
              <h3 className="text-base font-bold font-montserrat text-[#111C2D]">
                No hay partituras disponibles con los filtros seleccionados
              </h3>
              <p className="text-xs text-[#4C4546] max-w-md mx-auto leading-relaxed">
                Prueba cambiando o limpiando los filtros de categoría o nivel de dificultad.
              </p>
              <Link
                href="/tienda"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0071BC] text-white text-xs font-bold rounded-xl hover:bg-[#005a96] transition font-montserrat"
              >
                <span>Ver todo el catálogo disponible</span>
                <span className="material-symbols-outlined text-sm">east</span>
              </Link>
            </div>
          )}
        </section>

      </main>

      {/* Footer Elegante Stitch */}
      <Footer />

    </div>
  );
}
