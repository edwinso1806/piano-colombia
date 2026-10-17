import Link from "next/link";
import { MOCK_SCORES } from "@/lib/mock-data";
import { getCatalogScores, getCmsCategories } from "@/lib/api-client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SaveScoreButton from "@/components/SaveScoreButton";
import TiendaClient from "@/components/TiendaClient";

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
        description: s.description_es || s.description || "Edición filológica y digital de alta calidad con licencias oficiales.",
        description_es: s.description_es || s.description,
        description_en: s.description_en || null,
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

  const slugify = (text: string) =>
    (text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  // Filtrar partituras si hay categoría activa o niveles de dificultad
  const filteredScores = allScores.filter((score: any) => {
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

      {/* Main Content Bilingüe */}
      <TiendaClient
        allScores={allScores}
        categories={categories}
        activeCategorySlug={activeCategorySlug}
        activeLevels={activeLevels}
        activeCategory={activeCategory}
        difficultyCounts={difficultyCounts}
      />

      {/* Footer Elegante Stitch */}
      <Footer />
    </div>
  );
}
