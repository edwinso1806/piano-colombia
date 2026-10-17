import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DOWNLOAD_MODULE } from "../../../modules/download"
import { Client } from "pg"

function getPgClient() {
  return new Client({
    connectionString: process.env.DATABASE_URL || "postgres://postgres:Colombia-93@localhost:5432/piano_colombia_db",
  })
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const downloadModuleService = req.scope.resolve(DOWNLOAD_MODULE)
    const { email } = req.query

    const filters: Record<string, any> = {}
    if (email) filters.buyer_email = email

    const [downloads, count] = await downloadModuleService.listAndCountCustomerDownloads(filters, {
      order: { created_at: "DESC" },
    })

    // Enriquecer cada descarga con su categoría/género real desde la tabla score
    let enrichedDownloads = downloads
    try {
      const client = getPgClient()
      await client.connect()
      const scoreRes = await client.query("SELECT id, title, slug, genre, difficulty FROM score;")
      await client.end()

      const scoresById: Record<string, any> = {}
      const scoresByTitle: Record<string, any> = {}
      for (const s of scoreRes.rows) {
        if (s.id) scoresById[s.id] = s
        if (s.title) scoresByTitle[s.title.toLowerCase().trim()] = s
      }

      enrichedDownloads = downloads.map((d: any) => {
        const match =
          scoresById[d.score_id] ||
          scoresByTitle[(d.score_title || "").toLowerCase().trim()]
        const rawGenre = match?.genre || d.category || "Piano Solo"
        return {
          ...d,
          category: rawGenre,
          genre: rawGenre,
          difficulty: match?.difficulty || null,
        }
      })
    } catch (dbErr) {
      console.warn("⚠️ [DOWNLOADS] No se pudo conectar a score para enriquecer categorías:", dbErr)
    }

    return res.status(200).json({
      downloads: enrichedDownloads,
      count,
    })
  } catch (error: any) {
    return res.status(500).json({
      message: "Error fetching customer downloads",
      error: error.message,
    })
  }
}
