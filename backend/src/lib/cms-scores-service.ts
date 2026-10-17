import { Client } from "pg"

export interface EnrichedFeaturedScore {
  id: string
  title: string
  slug: string
  composer_id: string
  composer_name: string
  composer_slug: string
  genre: string
  difficulty: string
  description_es: string | null
  description_en: string | null
  pages_count: number
  duration_approx: string | null
  tonality: string | null
  price_cop: number
  price_usd: number
  original_pdf_url: string | null
  preview_pdf_url: string | null
  preview_images: any
  audio_sample_url: string | null
  is_featured: boolean
}

export interface FeaturedScoresResponse {
  scores: EnrichedFeaturedScore[]
  count: number
  max_allowed: number
}

function getPgClient() {
  return new Client({
    connectionString:
      process.env.DATABASE_URL || "postgres://postgres:Colombia-93@localhost:5432/piano_colombia_db",
  })
}

export async function getCmsHomeFeaturedScores(): Promise<FeaturedScoresResponse> {
  const client = getPgClient()
  try {
    await client.connect()

    // 1. Consultar configuración guardada en platform_settings
    const settingsRes = await client.query(
      `SELECT value FROM platform_settings WHERE key = 'home_featured_scores' LIMIT 1;`
    )

    let scoreIds: string[] = []
    let hasCustomSetting = false

    if (settingsRes.rows.length > 0 && settingsRes.rows[0].value) {
      hasCustomSetting = true
      try {
        const raw = settingsRes.rows[0].value
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw
        if (Array.isArray(parsed)) {
          scoreIds = parsed.filter((id) => typeof id === "string" && id.trim().length > 0).slice(0, 6)
        } else if (parsed && Array.isArray(parsed.score_ids)) {
          scoreIds = parsed.score_ids.filter((id: any) => typeof id === "string" && id.trim().length > 0).slice(0, 6)
        }
      } catch (err) {
        console.warn("[cms-scores-service] Error parseando home_featured_scores:", err)
      }
    }

    // Si aún no hay configuración guardada (primera vez), usar como fallback inicial las partituras marcadas con is_featured = true
    if (!hasCustomSetting) {
      const defaultRes = await client.query(`
        SELECT id FROM score
        WHERE status = 'APPROVED' AND is_featured = true
        ORDER BY created_at DESC
        LIMIT 6;
      `)
      scoreIds = defaultRes.rows.map((r) => r.id)
    }

    // Si no hay IDs seleccionados o el admin guardó array vacío, retornar lista vacía
    if (scoreIds.length === 0) {
      return {
        scores: [],
        count: 0,
        max_allowed: 6,
      }
    }

    // 2. Consultar las partituras con sus compositores en una sola consulta
    const scoresRes = await client.query(
      `
      SELECT 
        s.id, s.title, s.slug, s.composer_id, s.genre, s.difficulty,
        s.description_es, s.description_en, s.pages_count, s.duration_approx,
        s.tonality, s.price_cop, s.price_usd, s.original_pdf_url, s.preview_pdf_url,
        s.preview_images, s.audio_sample_url, s.is_featured, s.status,
        c.artistic_name, c.first_name, c.last_name, c.slug as composer_slug
      FROM score s
      LEFT JOIN composer c ON c.id = s.composer_id
      WHERE s.id = ANY($1) AND s.status = 'APPROVED';
    `,
      [scoreIds]
    )

    const scoreMap = new Map<string, any>()
    for (const row of scoresRes.rows) {
      const composerName =
        row.artistic_name || `${row.first_name || ""} ${row.last_name || ""}`.trim() || "Compositor Desconocido"
      scoreMap.set(row.id, {
        id: row.id,
        title: row.title,
        slug: row.slug,
        composer_id: row.composer_id,
        composer_name: composerName,
        composer_slug: row.composer_slug || "",
        genre: row.genre || "PASILLO",
        difficulty: row.difficulty || "INTERMEDIO",
        description_es: row.description_es,
        description_en: row.description_en,
        pages_count: row.pages_count || 1,
        duration_approx: row.duration_approx,
        tonality: row.tonality,
        price_cop: Number(row.price_cop) || 0,
        price_usd: Number(row.price_usd) || 0,
        original_pdf_url: row.original_pdf_url,
        preview_pdf_url: row.preview_pdf_url,
        preview_images: row.preview_images,
        audio_sample_url: row.audio_sample_url,
        is_featured: Boolean(row.is_featured),
      })
    }

    // Preservar exactamente el orden definido en scoreIds por el administrador
    const orderedScores: EnrichedFeaturedScore[] = []
    for (const id of scoreIds) {
      const item = scoreMap.get(id)
      if (item) {
        orderedScores.push(item)
      }
    }

    return {
      scores: orderedScores,
      count: orderedScores.length,
      max_allowed: 6,
    }
  } catch (err: any) {
    console.error("[cms-scores-service] Error consultando PostgreSQL:", err.message)
    throw err
  } finally {
    await client.end().catch(() => {})
  }
}

export async function saveCmsHomeFeaturedScores(scoreIds: string[]): Promise<FeaturedScoresResponse> {
  const client = getPgClient()
  try {
    await client.connect()

    // Validar máximo 6
    const cleanIds = Array.isArray(scoreIds)
      ? scoreIds.filter((id) => typeof id === "string" && id.trim().length > 0).slice(0, 6)
      : []

    // 1. Guardar en platform_settings
    await client.query(
      `INSERT INTO platform_settings (key, value, updated_at)
       VALUES ('home_featured_scores', $1, NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();`,
      [JSON.stringify(cleanIds)]
    )

    // 2. Sincronizar columna is_featured en la tabla score
    if (cleanIds.length > 0) {
      await client.query(`UPDATE score SET is_featured = FALSE WHERE id != ALL($1);`, [cleanIds])
      await client.query(`UPDATE score SET is_featured = TRUE WHERE id = ANY($1);`, [cleanIds])
    } else {
      await client.query(`UPDATE score SET is_featured = FALSE;`)
    }

    // Retornar lista actualizada
    return await getCmsHomeFeaturedScores()
  } catch (err: any) {
    console.error("[cms-scores-service] Error guardando en PostgreSQL:", err.message)
    throw err
  } finally {
    await client.end().catch(() => {})
  }
}

export async function getAllActiveApprovedScores(): Promise<any[]> {
  const client = getPgClient()
  try {
    await client.connect()

    const res = await client.query(`
      SELECT 
        s.id, s.title, s.slug, s.genre, s.difficulty, s.price_cop, s.price_usd, s.is_featured,
        c.artistic_name, c.first_name, c.last_name
      FROM score s
      LEFT JOIN composer c ON c.id = s.composer_id
      WHERE s.status = 'APPROVED'
      ORDER BY s.title ASC;
    `)

    return res.rows.map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      genre: row.genre,
      difficulty: row.difficulty,
      price_cop: Number(row.price_cop) || 0,
      price_usd: Number(row.price_usd) || 0,
      composer_name:
        row.artistic_name || `${row.first_name || ""} ${row.last_name || ""}`.trim() || "Compositor",
      is_featured: Boolean(row.is_featured),
    }))
  } catch (err: any) {
    console.error("[cms-scores-service] Error consultando lista de partituras:", err.message)
    return []
  } finally {
    await client.end().catch(() => {})
  }
}
