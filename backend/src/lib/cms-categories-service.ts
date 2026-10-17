import { Client } from "pg"

export interface HomeCategory {
  id: string
  title: string
  slug: string
  description: string
  icon: string
  cta_text: string
  link: string
  is_active: boolean
  order: number
  count_unit?: string
  count_unit_singular?: string
  matching_genres?: string[]
  // Campos calculados en vivo desde PostgreSQL:
  count?: number
  display_count?: string
}

export function slugifyCategory(title: string): string {
  if (!title) return "categoria"
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita tildes: á->a, é->e, etc.
    .replace(/[^a-z0-9]+/g, "-") // convierte espacios y símbolos en guiones
    .replace(/^-+|-+$/g, "") // elimina guiones al inicio o fin
    || "categoria"
}

function getPgClient() {
  return new Client({
    connectionString: process.env.DATABASE_URL || "postgres://postgres:Colombia-93@localhost:5432/piano_colombia_db",
  })
}

export const DEFAULT_HOME_CATEGORIES: HomeCategory[] = [
  {
    id: "cat_piano_solo",
    title: "Piano Solo",
    slug: "piano-solo",
    description: "Obras maestras para recital, concurso y profundización técnica individual. Pasillos virtuosos, bambucos de concierto e intermezzos líricos.",
    icon: "piano",
    cta_text: "Explorar piezas solistas",
    link: "/tienda?categoria=piano-solo",
    is_active: true,
    order: 1,
    count_unit: "Obras",
    count_unit_singular: "Obra",
    matching_genres: ["Piano Solo", "PASILLO", "CLASICO", "BAMBUCO", "DANZA", "VALS", "Pasillo", "Bambuco", "Danza"],
  },
  {
    id: "cat_piano_4_manos",
    title: "Piano a 4 Manos",
    slug: "piano-a-4-manos",
    description: "Dúos concertantes y reducciones orquestales a cuatro manos. Ideal para cátedras de música de cámara y recitales colaborativos a dos intérpretes.",
    icon: "group",
    cta_text: "Ver dúos de piano",
    link: "/tienda?categoria=piano-a-4-manos",
    is_active: true,
    order: 2,
    count_unit: "Obras",
    count_unit_singular: "Obra",
    matching_genres: ["Piano a 4 Manos", "Piano 4 Manos", "4 Manos"],
  },
  {
    id: "cat_piano_orquesta",
    title: "Piano y Orquesta",
    slug: "piano-y-orquesta",
    description: "Partituras de dirección, guiones generales y reducciones a segundo piano de conciertos para piano y orquesta sinfónica colombiana.",
    icon: "stadium",
    cta_text: "Catálogo orquestal",
    link: "/tienda?categoria=piano-y-orquesta",
    is_active: true,
    order: 3,
    count_unit: "Conciertos",
    count_unit_singular: "Concierto",
    matching_genres: ["Piano y Orquesta", "Orquesta", "Concierto"],
  },
  {
    id: "cat_musica_camara",
    title: "Música de Cámara",
    slug: "musica-de-camara",
    description: "Tríos con violín y violonchelo, sonatas para instrumentos solistas con acompañamiento de piano y ensambles folclóricos de cámara.",
    icon: "diversity_3",
    cta_text: "Explorar cámara",
    link: "/tienda?categoria=musica-de-camara",
    is_active: true,
    order: 4,
    count_unit: "Partituras",
    count_unit_singular: "Partitura",
    matching_genres: ["Música de Cámara", "Cámara", "Trío", "Cuarteto"],
  },
  {
    id: "cat_piezas_pedagogicas",
    title: "Piezas Pedagógicas",
    slug: "piezas-pedagogicas",
    description: "Metodologías progresivas, iniciación al teclado y repertorio graduado por niveles (Preparatorio al Nivel 6) con canciones tradicionales colombianas.",
    icon: "school",
    cta_text: "Ver repertorio didáctico",
    link: "/tienda?categoria=piezas-pedagogicas",
    is_active: true,
    order: 5,
    count_unit: "Cuadernos",
    count_unit_singular: "Cuaderno",
    matching_genres: ["Piezas Pedagógicas", "Pedagógico", "Método", "Estudio", "Iniciación"],
  },
  {
    id: "cat_piano_electronica",
    title: "Piano y Electrónica",
    slug: "piano-y-electronica",
    description: "Vanguardia contemporánea, obras para piano preparado con cinta magnética, procesamiento digital en vivo (Max/MSP) y paisajes bio-acústicos.",
    icon: "graphic_eq",
    cta_text: "Explorar vanguardia",
    link: "/tienda?categoria=piano-y-electronica",
    is_active: true,
    order: 6,
    count_unit: "Obras",
    count_unit_singular: "Obra",
    matching_genres: ["Piano y Electrónica", "Electrónica", "Electroacústico", "Vanguardia"],
  },
]

/**
 * Consulta las categorías de la base de datos y calcula los contadores en tiempo real
 * a partir de las partituras aprobadas en la tabla score.
 */
export async function getCmsHomeCategories(options?: { onlyActive?: boolean }): Promise<{
  categories: HomeCategory[]
  total_categories: number
  active_categories_count: number
}> {
  const client = getPgClient()
  let storedCategories: any[] = []
  let approvedScores: Array<{ id: string; genre: string; title: string }> = []

  try {
    await client.connect()

    // 1. Obtener configuración almacenada en platform_settings
    const resSettings = await client.query(
      "SELECT value FROM platform_settings WHERE key = 'home_categories' LIMIT 1;"
    )

    if (resSettings.rows.length > 0 && resSettings.rows[0].value) {
      try {
        const parsed = JSON.parse(resSettings.rows[0].value)
        if (Array.isArray(parsed) && parsed.length > 0) {
          storedCategories = parsed
        }
      } catch (err) {
        console.warn("[cms-categories-service] Error parseando home_categories:", err)
      }
    }

    // Si no hay categorías en la base de datos, inicializar con los defaults
    if (storedCategories.length === 0) {
      storedCategories = [...DEFAULT_HOME_CATEGORIES]
      try {
        await client.query(`
          INSERT INTO platform_settings (key, value, updated_at)
          VALUES ('home_categories', $1, NOW())
          ON CONFLICT (key) DO UPDATE
          SET value = EXCLUDED.value, updated_at = NOW();
        `, [JSON.stringify(storedCategories)])
      } catch (e: any) {
        console.warn("[cms-categories-service] Error guardando defaults en platform_settings:", e.message)
      }
    }

    // 2. Consultar partituras aprobadas para calcular contadores reales
    const resScores = await client.query(
      "SELECT id, genre, title FROM score WHERE status = 'APPROVED' AND deleted_at IS NULL;"
    )
    approvedScores = resScores.rows.map((row) => ({
      id: row.id,
      genre: (row.genre || "").trim(),
      title: (row.title || "").trim(),
    }))
  } catch (err: any) {
    console.error("[cms-categories-service] Error consultando PostgreSQL:", err.message)
    storedCategories = [...DEFAULT_HOME_CATEGORIES]
  } finally {
    await client.end().catch(() => {})
  }

  // 3. Normalizar slugs y URLs automáticas, y calcular conteo real para cada categoría
  const processed: HomeCategory[] = storedCategories.map((cat, idx) => {
    const title = (cat.title || "Categoría").trim()
    const slug = cat.slug || slugifyCategory(title)
    const autoLink = `/tienda?categoria=${slug}`

    const titleLower = title.toLowerCase()
    const slugLower = slug.toLowerCase()
    const matching = (cat.matching_genres || [title]).map((g: string) => g.toLowerCase().trim())

    // Contar cuántas partituras aprobadas coinciden con esta categoría
    const matchedScores = approvedScores.filter((score) => {
      const scoreGenre = score.genre.toLowerCase()
      if (!scoreGenre) return false

      // Coincidencia exacta o parcial con el título o slug
      if (
        scoreGenre === titleLower ||
        scoreGenre.includes(titleLower) ||
        titleLower.includes(scoreGenre) ||
        slugifyCategory(scoreGenre) === slugLower
      ) {
        return true
      }

      // Coincidencia con la lista de géneros/formatos asociados
      return matching.some(
        (mg: string) => mg && (scoreGenre === mg || scoreGenre.includes(mg) || mg.includes(scoreGenre))
      )
    })

    const count = matchedScores.length
    const unitSingular = cat.count_unit_singular || "Obra"
    const unitPlural = cat.count_unit || "Obras"
    const displayCount = `${count} ${count === 1 ? unitSingular : unitPlural}`

    return {
      id: cat.id || `cat_${idx + 1}`,
      title,
      slug,
      description: cat.description || "",
      icon: cat.icon || "piano",
      cta_text: cat.cta_text || "Explorar repertorio",
      link: autoLink,
      order: typeof cat.order === "number" ? cat.order : idx + 1,
      is_active: cat.is_active !== false,
      count_unit: unitPlural,
      count_unit_singular: unitSingular,
      matching_genres: cat.matching_genres || [title],
      count,
      display_count: displayCount,
    }
  })

  // Ordenar según el orden configurado
  processed.sort((a, b) => a.order - b.order)

  const activeCategories = processed.filter((c) => c.is_active)

  return {
    categories: options?.onlyActive ? activeCategories : processed,
    total_categories: processed.length,
    active_categories_count: activeCategories.length,
  }
}

/**
 * Guarda las categorías administradas en la tabla platform_settings
 * calculando automáticamente el slug y la URL sin requerir intervención del usuario.
 */
export async function saveCmsHomeCategories(
  categories: Partial<HomeCategory>[]
): Promise<{ success: boolean; categories: HomeCategory[] }> {
  if (!Array.isArray(categories)) {
    throw new Error("El formato de categorías debe ser un arreglo.")
  }

  // Normalizar con slug y link generados 100% automáticamente
  const normalized: HomeCategory[] = categories.map((c, index) => {
    const title = (c.title || "Nueva Categoría").trim()
    const slug = slugifyCategory(title)
    const autoLink = `/tienda?categoria=${slug}`

    return {
      id: c.id || `cat_${Date.now()}_${index}`,
      title,
      slug,
      description: (c.description || "").trim(),
      icon: (c.icon || "piano").trim(),
      cta_text: (c.cta_text || "Explorar repertorio").trim(),
      link: autoLink,
      is_active: c.is_active !== false,
      order: typeof c.order === "number" ? c.order : index + 1,
      count_unit: c.count_unit || "Obras",
      count_unit_singular: c.count_unit_singular || "Obra",
      matching_genres: Array.isArray(c.matching_genres) && c.matching_genres.length > 0
        ? c.matching_genres
        : [title],
    }
  })

  const client = getPgClient()
  try {
    await client.connect()

    // 1. Guardar en home_categories
    await client.query(`
      INSERT INTO platform_settings (key, value, updated_at)
      VALUES ('home_categories', $1, NOW())
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = NOW();
    `, [JSON.stringify(normalized)])

    // 2. Sincronizar catálogo general (catalog_categories)
    const catalogCats = normalized.map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      title_es: cat.title,
      title_en: cat.title,
      status: cat.is_active ? "VISIBLE" : "HIDDEN",
    }))

    await client.query(`
      INSERT INTO platform_settings (key, value, updated_at)
      VALUES ('catalog_categories', $1, NOW())
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = NOW();
    `, [JSON.stringify(catalogCats)])

  } finally {
    await client.end().catch(() => {})
  }

  // Retornar la lista actualizada con contadores reales y slugs
  const result = await getCmsHomeCategories({ onlyActive: false })
  return {
    success: true,
    categories: result.categories,
  }
}
