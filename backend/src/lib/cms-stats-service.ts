import { Client } from "pg"
import { SCORE_MODULE } from "../modules/score"
import { COMPOSER_MODULE } from "../modules/composer"

export interface StatCard {
  id: string
  mode: "auto" | "custom"
  auto_value: string
  custom_value: string
  display_value: string
  title: string
  subtitle: string
  has_bolt?: boolean
}

export interface CmsStatsResponse {
  live_counts: {
    approved_scores: number
    total_scores: number
    approved_composers: number
    total_composers: number
    genres_count: number
    genres_sample: string
  }
  cards: StatCard[]
}

function getPgClient() {
  return new Client({
    connectionString: process.env.DATABASE_URL || "postgres://postgres:Alex%242020@localhost:5432/piano_colombia_db",
  })
}

/**
 * Obtiene las estadísticas en vivo de la base de datos y las tarjetas formateadas
 */
export async function getCmsHomeStats(scope: any): Promise<CmsStatsResponse> {
  let approvedScores = 0
  let totalScores = 0
  let approvedComposers = 0
  let totalComposers = 0

  // 1. Conteos de módulos de Medusa
  try {
    const scoreModuleService = scope.resolve(SCORE_MODULE)
    const [, approvedS] = await scoreModuleService.listAndCountScores({ status: "APPROVED" })
    const [, totalS] = await scoreModuleService.listAndCountScores({})
    approvedScores = approvedS || 0
    totalScores = totalS || 0
  } catch (e: any) {
    console.warn("[CmsStatsService] Fallo consultando módulo de partituras:", e.message)
  }

  try {
    const composerModuleService = scope.resolve(COMPOSER_MODULE)
    const [, approvedC] = await composerModuleService.listAndCountComposers({ status: "APPROVED" })
    const [, totalC] = await composerModuleService.listAndCountComposers({})
    approvedComposers = approvedC || 0
    totalComposers = totalC || 0
  } catch (e: any) {
    console.warn("[CmsStatsService] Fallo consultando módulo de compositores:", e.message)
  }

  // 2. Metadatos y tarjetas personalizadas desde platform_settings en PostgreSQL
  let categoriesList: string[] = []
  let customStatsCards: StatCard[] | null = null

  const client = getPgClient()
  try {
    await client.connect()
    const res = await client.query(
      "SELECT key, value FROM platform_settings WHERE key IN ('catalog_categories', 'home_stats_cards');"
    )

    for (const row of res.rows) {
      if (row.key === "catalog_categories" && row.value) {
        try {
          const parsed = JSON.parse(row.value)
          if (Array.isArray(parsed)) {
            categoriesList = parsed
              .map((item: any) => (typeof item === "string" ? item : item.title_es || item.name || ""))
              .filter(Boolean)
          }
        } catch {}
      }
      if (row.key === "home_stats_cards" && row.value) {
        try {
          customStatsCards = JSON.parse(row.value)
        } catch {}
      }
    }
  } catch (e: any) {
    console.warn("[CmsStatsService] Fallo consultando platform_settings:", e.message)
  } finally {
    await client.end().catch(() => {})
  }

  // Si no hay categorías en settings, usar defaults
  if (categoriesList.length === 0) {
    categoriesList = ["Pasillo", "Bambuco", "Danza", "Guabina", "Vals", "Cumbia"]
  }

  const genresCount = categoriesList.length
  const genresSample =
    categoriesList.slice(0, 4).join(", ") + (categoriesList.length > 4 ? "..." : "")

  // Valores automáticos en vivo calculados de la BD
  const autoScoresVal = `${approvedScores > 0 ? approvedScores : (totalScores > 0 ? totalScores : 0)}+`
  const autoComposersVal = `${approvedComposers > 0 ? approvedComposers : (totalComposers > 0 ? totalComposers : 0)}+`
  const autoGenresVal = `${genresCount}`

  // Default cards si aún no hay configuración guardada
  const defaultCards: StatCard[] = [
    {
      id: "card_scores",
      mode: "auto",
      auto_value: autoScoresVal,
      custom_value: "",
      display_value: autoScoresVal,
      title: "Partituras Digitales",
      subtitle: "Editadas bajo rigurosa musicología",
    },
    {
      id: "card_composers",
      mode: "auto",
      auto_value: autoComposersVal,
      custom_value: "",
      display_value: autoComposersVal,
      title: "Compositores",
      subtitle: "Desde el siglo XIX hasta hoy",
    },
    {
      id: "card_genres",
      mode: "auto",
      auto_value: autoGenresVal,
      custom_value: "",
      display_value: autoGenresVal,
      title: "Ritmos Tradicionales",
      subtitle: genresSample,
    },
    {
      id: "card_format",
      mode: "custom",
      auto_value: "PDF",
      custom_value: "PDF",
      display_value: "PDF",
      has_bolt: true,
      title: "Descarga Inmediata",
      subtitle: "Con licencia legal autorizada",
    },
  ]

  const cardsToProcess = customStatsCards && customStatsCards.length === 4 ? customStatsCards : defaultCards

  // Garantizar que display_value y auto_value reflejen los datos reales de la BD
  const finalCards: StatCard[] = cardsToProcess.map((c) => {
    if (c.id === "card_scores") {
      const isCustom = c.mode === "custom" && Boolean(c.custom_value?.trim())
      return {
        ...c,
        auto_value: autoScoresVal,
        display_value: isCustom ? c.custom_value : autoScoresVal,
        title: c.title || "Partituras Digitales",
        subtitle: c.subtitle || "Editadas bajo rigurosa musicología",
      }
    }
    if (c.id === "card_composers") {
      const isCustom = c.mode === "custom" && Boolean(c.custom_value?.trim())
      return {
        ...c,
        auto_value: autoComposersVal,
        display_value: isCustom ? c.custom_value : autoComposersVal,
        title: c.title || "Compositores",
        subtitle: c.subtitle || "Desde el siglo XIX hasta hoy",
      }
    }
    if (c.id === "card_genres") {
      const isCustom = c.mode === "custom" && Boolean(c.custom_value?.trim())
      return {
        ...c,
        auto_value: autoGenresVal,
        display_value: isCustom ? c.custom_value : autoGenresVal,
        title: c.title || "Ritmos Tradicionales",
        subtitle: c.subtitle && c.subtitle !== "Pasillo, Bambuco, Danza, Guabina..." ? c.subtitle : genresSample,
      }
    }
    if (c.id === "card_format") {
      return {
        ...c,
        has_bolt: true,
        display_value: c.custom_value || "PDF",
        title: c.title || "Descarga Inmediata",
        subtitle: c.subtitle || "Con licencia legal autorizada",
      }
    }
    return c
  })

  return {
    live_counts: {
      approved_scores: approvedScores,
      total_scores: totalScores,
      approved_composers: approvedComposers,
      total_composers: totalComposers,
      genres_count: genresCount,
      genres_sample: genresSample,
    },
    cards: finalCards,
  }
}

/**
 * Guarda la configuración de las tarjetas de estadísticas en platform_settings
 */
export async function saveCmsHomeStatsCards(cards: StatCard[]): Promise<void> {
  const client = getPgClient()
  try {
    await client.connect()
    await client.query(
      `INSERT INTO platform_settings (key, value, updated_at)
       VALUES ('home_stats_cards', $1, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW();`,
      [JSON.stringify(cards)]
    )
  } finally {
    await client.end().catch(() => {})
  }
}
