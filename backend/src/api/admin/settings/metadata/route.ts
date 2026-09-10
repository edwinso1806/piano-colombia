import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Client } from "pg"

export const AUTHENTICATE = false

function getPgClient() {
  return new Client({
    connectionString: process.env.DATABASE_URL || "postgres://postgres:Alex%242020@localhost:5432/piano_colombia_db",
  })
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const client = getPgClient()
  try {
    await client.connect()
    const result = await client.query(
      "SELECT key, value FROM platform_settings WHERE key IN ('catalog_categories', 'catalog_difficulties');"
    )

    let categories = []
    let difficulties = []

    for (const row of result.rows) {
      if (row.key === "catalog_categories") {
        try {
          categories = JSON.parse(row.value)
        } catch {
          categories = []
        }
      } else if (row.key === "catalog_difficulties") {
        try {
          difficulties = JSON.parse(row.value)
        } catch {
          difficulties = []
        }
      }
    }

    return res.status(200).json({
      success: true,
      categories,
      difficulties,
    })
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error consultando metadatos",
      error: error.message,
    })
  } finally {
    await client.end().catch(() => {})
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const client = getPgClient()
  try {
    const { categories, difficulties } = (req.body as any) || {}

    await client.connect()

    if (categories !== undefined) {
      await client.query(`
        INSERT INTO platform_settings (key, value, updated_at)
        VALUES ('catalog_categories', $1, NOW())
        ON CONFLICT (key) DO UPDATE
        SET value = EXCLUDED.value, updated_at = NOW();
      `, [JSON.stringify(categories)])
    }

    if (difficulties !== undefined) {
      await client.query(`
        INSERT INTO platform_settings (key, value, updated_at)
        VALUES ('catalog_difficulties', $1, NOW())
        ON CONFLICT (key) DO UPDATE
        SET value = EXCLUDED.value, updated_at = NOW();
      `, [JSON.stringify(difficulties)])
    }

    return res.status(200).json({
      success: true,
      message: "Metadatos del catálogo (categorías y dificultades) guardados exitosamente.",
    })
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error guardando metadatos",
      error: error.message,
    })
  } finally {
    await client.end().catch(() => {})
  }
}

export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  return res.status(204).end()
}
