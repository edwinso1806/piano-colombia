import { Client } from "pg"

export interface FeaturedComposersTabConfig {
  id: "historico" | "contemporaneo" | "mujeres"
  name: string
  icon: string
  composer_ids: string[] // máximo 8 IDs de compositores
}

export interface EnrichedComposer {
  id: string
  name: string
  slug: string
  first_name: string
  last_name: string
  photo_url: string | null
  image_url?: string | null
  initials: string
  era: string | null
  period?: string | null
  region: string | null
  origin?: string | null
  bio_es: string | null
  bio?: string | null
  short_bio?: string | null
  scoreCount: number
  category_icon: string
  tab_id: string
}

export interface FeaturedTabOutput {
  id: string
  name: string
  icon: string
  composers: EnrichedComposer[]
  count: number
}

export interface FeaturedComposersResponse {
  tabs: FeaturedTabOutput[]
  all_composers: EnrichedComposer[]
  active_tabs_count: number
  total_composers: number
  total_registered_composers: number
  recent_composers: {
    id: string
    name: string
    slug: string
    era: string | null
    photo_url: string | null
  }[]
}

function getPgClient() {
  return new Client({
    connectionString:
      process.env.DATABASE_URL || "postgres://postgres:Alex%242020@localhost:5432/piano_colombia_db",
  })
}

export const DEFAULT_FEATURED_COMPOSERS_TABS: FeaturedComposersTabConfig[] = [
  {
    id: "historico",
    name: "Patrimonio Histórico",
    icon: "piano",
    composer_ids: [],
  },
  {
    id: "contemporaneo",
    name: "Contemporáneos",
    icon: "music_note",
    composer_ids: [],
  },
  {
    id: "mujeres",
    name: "Mujeres Compositoras",
    icon: "star",
    composer_ids: [],
  },
]

export async function getCmsHomeFeaturedComposers(options: { onlyActiveTabs?: boolean } = {}): Promise<FeaturedComposersResponse> {
  const { onlyActiveTabs = true } = options
  const client = getPgClient()

  try {
    await client.connect()

    // 1. Obtener configuración guardada en platform_settings
    const settingsRes = await client.query(
      `SELECT value FROM platform_settings WHERE key = 'home_featured_composers' LIMIT 1;`
    )

    let tabsConfig: FeaturedComposersTabConfig[] = DEFAULT_FEATURED_COMPOSERS_TABS

    if (settingsRes.rows.length > 0 && settingsRes.rows[0].value) {
      try {
        const raw = settingsRes.rows[0].value
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Fusionar con los 3 tabs permitidos asegurando ids fijos
          tabsConfig = DEFAULT_FEATURED_COMPOSERS_TABS.map((def) => {
            const found = parsed.find((p: any) => p.id === def.id)
            if (found) {
              return {
                id: def.id,
                name: (found.name || def.name).trim(),
                icon: (found.icon || def.icon).trim(),
                composer_ids: Array.isArray(found.composer_ids) ? found.composer_ids.slice(0, 8) : [],
              }
            }
            return def
          })
        }
      } catch (err) {
        console.warn("[cms-composers-service] Error parseando home_featured_composers:", err)
      }
    } else {
      // Intentar auto-asignar compositores existentes por defecto si está vacío
      try {
        const autoRes = await client.query(
          `SELECT id, slug FROM composer WHERE status = 'APPROVED' ORDER BY first_name ASC LIMIT 8;`
        )
        if (autoRes.rows.length > 0) {
          const calvo = autoRes.rows.find((r) => r.slug.includes("calvo"))
          const morales = autoRes.rows.find((r) => r.slug.includes("morales"))
          const mejia = autoRes.rows.find((r) => r.slug.includes("mejia"))

          const historicoIds = [calvo?.id, morales?.id, mejia?.id].filter(Boolean) as string[]
          tabsConfig[0].composer_ids = historicoIds

          // Guardar configuración inicial en platform_settings
          await client.query(
            `INSERT INTO platform_settings (key, value, updated_at)
             VALUES ('home_featured_composers', $1, NOW())
             ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();`,
            [JSON.stringify(tabsConfig)]
          )
        }
      } catch (e: any) {
        console.warn("[cms-composers-service] Error auto-inicializando compositores:", e.message)
      }
    }

    // 2. Consultar todos los compositores aprobados en PostgreSQL
    const composersRes = await client.query(`
      SELECT 
        id, first_name, last_name, artistic_name, slug, era, region, bio_es, photo_url, status
      FROM composer
      WHERE status = 'APPROVED';
    `)

    // Mapa de compositores activos por ID
    const activeComposersMap = new Map<string, any>()
    for (const comp of composersRes.rows) {
      activeComposersMap.set(comp.id, comp)
    }

    // 3. Consultar conteo de partituras aprobadas por compositor
    const scoresCountRes = await client.query(`
      SELECT composer_id, COUNT(*) AS approved_count
      FROM score
      WHERE status = 'APPROVED' AND composer_id IS NOT NULL
      GROUP BY composer_id;
    `)

    const scoreCountMap = new Map<string, number>()
    for (const sc of scoresCountRes.rows) {
      scoreCountMap.set(sc.composer_id, parseInt(sc.approved_count, 10) || 0)
    }

    // 4. Mapear y enriquecer compositores por pestaña
    const outputTabs: FeaturedTabOutput[] = []
    const allUniqueComposersMap = new Map<string, EnrichedComposer>()

    for (const tab of tabsConfig) {
      const tabComposers: EnrichedComposer[] = []

      for (const composerId of tab.composer_ids) {
        const comp = activeComposersMap.get(composerId)
        if (!comp) continue // Si no existe o se inactivó, se excluye automáticamente

        const fullName = comp.artistic_name || `${comp.first_name || ""} ${comp.last_name || ""}`.trim()
        const initials = `${(comp.first_name || "").charAt(0)}${(comp.last_name || "").charAt(0)}`.toUpperCase() || "PC"

        const bioText = comp.bio_es || comp.bio_en || ""
        const enriched: EnrichedComposer = {
          id: comp.id,
          name: fullName,
          slug: comp.slug,
          first_name: comp.first_name,
          last_name: comp.last_name,
          photo_url: comp.photo_url || null,
          image_url: comp.photo_url || null,
          initials,
          era: comp.era || null,
          period: comp.era || null,
          region: comp.region || null,
          origin: comp.region || null,
          bio_es: comp.bio_es || null,
          bio: bioText,
          short_bio: bioText,
          scoreCount: scoreCountMap.get(comp.id) || 0,
          category_icon: tab.icon || "piano",
          tab_id: tab.id,
        }

        tabComposers.push(enriched)

        if (!allUniqueComposersMap.has(comp.id)) {
          allUniqueComposersMap.set(comp.id, enriched)
        }
      }

      // Si se solicitan solo tabs activos y este tab tiene 0 compositores, se omite
      if (!onlyActiveTabs || tabComposers.length > 0) {
        outputTabs.push({
          id: tab.id,
          name: tab.name,
          icon: tab.icon,
          composer_ids: tabComposers.map((c) => c.id),
          composers: tabComposers,
          count: tabComposers.length,
        })
      }
    }

    const allComposers = Array.from(allUniqueComposersMap.values())

    // 5. Consultar los últimos 4 compositores aprobados registrados para el footer
    const recentRes = await client.query(`
      SELECT id, first_name, last_name, artistic_name, slug, era, photo_url, created_at
      FROM composer
      WHERE status = 'APPROVED'
      ORDER BY created_at DESC
      LIMIT 4;
    `)
    const recentComposers = recentRes.rows.map((r) => ({
      id: r.id,
      name: r.artistic_name || `${r.first_name || ""} ${r.last_name || ""}`.trim(),
      slug: r.slug,
      era: r.era || null,
      photo_url: r.photo_url || null,
    }))

    // 6. Consultar total real de compositores registrados y aprobados
    const totalCountRes = await client.query(`
      SELECT COUNT(*) as total FROM composer WHERE status = 'APPROVED';
    `)
    const totalApprovedComposers = parseInt(totalCountRes.rows[0]?.total, 10) || allComposers.length

    return {
      tabs: outputTabs,
      all_composers: allComposers,
      active_tabs_count: outputTabs.length,
      total_composers: allComposers.length,
      total_registered_composers: totalApprovedComposers,
      recent_composers: recentComposers,
    }
  } catch (err: any) {
    console.error("[cms-composers-service] Error consultando PostgreSQL:", err.message)
    throw err
  } finally {
    await client.end().catch(() => {})
  }
}

export async function saveCmsHomeFeaturedComposers(
  tabs: { id: string; name: string; icon?: string; composer_ids: string[] }[]
): Promise<FeaturedComposersResponse> {
  const client = getPgClient()

  try {
    await client.connect()

    const validTabs: FeaturedComposersTabConfig[] = DEFAULT_FEATURED_COMPOSERS_TABS.map((def) => {
      const incoming = tabs.find((t) => t.id === def.id)
      if (incoming) {
        return {
          id: def.id,
          name: (incoming.name || def.name).trim(),
          icon: (incoming.icon || def.icon).trim(),
          composer_ids: Array.isArray(incoming.composer_ids)
            ? incoming.composer_ids.filter((id) => typeof id === "string" && id.trim().length > 0).slice(0, 8)
            : [],
        }
      }
      return def
    })

    await client.query(
      `INSERT INTO platform_settings (key, value, updated_at)
       VALUES ('home_featured_composers', $1, NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();`,
      [JSON.stringify(validTabs)]
    )

    // Devolver la estructura completa enriquecida
    return await getCmsHomeFeaturedComposers({ onlyActiveTabs: false })
  } catch (err: any) {
    console.error("[cms-composers-service] Error guardando en PostgreSQL:", err.message)
    throw err
  } finally {
    await client.end().catch(() => {})
  }
}

export async function getAllActiveApprovedComposers(): Promise<any[]> {
  const client = getPgClient()
  try {
    await client.connect()

    const res = await client.query(`
      SELECT 
        c.id, c.first_name, c.last_name, c.artistic_name, c.slug, c.era, c.region, c.photo_url, c.status,
        COALESCE(s.approved_count, 0) as approved_scores_count
      FROM composer c
      LEFT JOIN (
        SELECT composer_id, COUNT(*) as approved_count
        FROM score
        WHERE status = 'APPROVED'
        GROUP BY composer_id
      ) s ON s.composer_id = c.id
      WHERE c.status = 'APPROVED'
      ORDER BY c.first_name ASC;
    `)

    return res.rows.map((c) => ({
      id: c.id,
      name: c.artistic_name || `${c.first_name || ""} ${c.last_name || ""}`.trim(),
      slug: c.slug,
      era: c.era,
      region: c.region,
      photo_url: c.photo_url,
      scoreCount: parseInt(c.approved_scores_count, 10) || 0,
    }))
  } catch (err: any) {
    console.error("[cms-composers-service] Error consultando lista de compositores activos:", err.message)
    return []
  } finally {
    await client.end().catch(() => {})
  }
}
