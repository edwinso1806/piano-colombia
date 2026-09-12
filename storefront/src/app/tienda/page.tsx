import Link from "next/link";
import { MOCK_SCORES } from "@/lib/mock-data";
import { getCatalogScores, getCmsCategories } from "@/lib/api-client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SaveScoreButton from "@/components/SaveScoreButton";

export default async function TiendaPage({
  searchParams,
}: {
  searchParams?: Promise<{ categoria?: string; nivel?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const activeCategorySlug = (resolvedParams?.categoria || "").toLowerCase().trim();

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
        level: s.difficulty || "Intermedio",
        category: s.genre || "Piano Solo",
        tags: s.tags || [],
        priceCOP: Number(s.price_cop) || 45000,
        priceUSD: Number(s.price_usd) || 12,
        previewPages: s.preview_images || [],
        description: s.description || "Edición filológica y digital de alta calidad con licencias oficiales.",
      }))
    : MOCK_SCORES;

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

  // Encontrar la categoría seleccionada si hay slug
  const activeCategory = categories.find((c: any) => {
    const cSlug = (c.slug || "").toLowerCase();
    const cTitle = (c.title || "").toLowerCase();
    return cSlug === activeCategorySlug || cTitle === activeCategorySlug;
  });

  // Filtrar partituras si hay categoría activa
  const filteredScores = allScores.filter((score: any) => {
    if (!activeCategorySlug || activeCategorySlug === "todas") return true;

    if (activeCategory) {
      const catTitleLower = activeCategory.title.toLowerCase();
      const scoreCatLower = (score.category || "").toLowerCase();
      const matching = (activeCategory.matching_genres || [activeCategory.title]).map((m: string) => m.toLowerCase());

      return (
        scoreCatLower === catTitleLower ||
        scoreCatLower.includes(catTitleLower) ||
        catTitleLower.includes(scoreCatLower) ||
        matching.some((mg: string) => scoreCatLower === mg || scoreCatLower.includes(mg) || mg.includes(scoreCatLower))
      );
    }

    const scoreGenreSlug = (score.category || "").toLowerCase().replace(/\s+/g, "-");
    return scoreGenreSlug.includes(activeCategorySlug) || activeCategorySlug.includes(scoreGenreSlug);
  });

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
              {activeCategorySlug && (
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
                  href="/tienda"
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
                  return (
                    <Link
                      key={cat.id || i}
                      href={`/tienda?categoria=${cat.slug || encodeURIComponent(cat.title)}`}
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

            {/* Nivel */}
            <div className="mb-6 pt-4 border-t border-black/5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#0071BC] block mb-3 font-montserrat">
                Nivel de Dificultad
              </label>
              <div className="space-y-2.5 text-xs text-[#4C4546] font-medium">
                {["Principiante", "Intermedio", "Avanzado", "Virtuoso"].map((lvl, i) => (
                  <label key={i} className="flex items-center gap-2.5 cursor-pointer hover:text-[#111C2D] transition">
                    <input type="checkbox" className="w-4 h-4 rounded accent-[#0071BC] border-black/10" />
                    <span>{lvl}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rango de precio */}
            <div className="pt-4 border-t border-black/5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#0071BC] block mb-3 font-montserrat">
                Precio COP
              </label>
              <input type="range" min="10000" max="150000" step="5000" className="w-full accent-[#0071BC]" />
              <div className="flex justify-between text-xs text-[#4C4546] mt-2 font-bold font-montserrat">
                <span>$10.000</span>
                <span>$150.000+</span>
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

              {/* Tag activo de categoría si aplica */}
              {activeCategory && (
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-[11px] text-[#4C4546] font-semibold">Filtrado activo:</span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#0071BC]/10 text-[#0071BC] text-xs font-bold font-montserrat">
                    <span className="material-symbols-outlined text-sm">{activeCategory.icon || "piano"}</span>
                    <span>{activeCategory.title}</span>
                    <Link href="/tienda" className="hover:text-rose-600 transition ml-1" title="Quitar filtro">
                      <span className="material-symbols-outlined text-xs">close</span>
                    </Link>
                  </span>
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
                No hay partituras aprobadas aún en "{activeCategory?.title || activeCategorySlug}"
              </h3>
              <p className="text-xs text-[#4C4546] max-w-md mx-auto leading-relaxed">
                Actualmente se están preparando y editando filológicamente nuevas obras para esta categoría.
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
