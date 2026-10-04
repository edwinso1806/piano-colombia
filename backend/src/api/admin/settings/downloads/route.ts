import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Client } from "pg"

export const AUTHENTICATE = false

function getPgClient() {
  return new Client({
    connectionString: process.env.DATABASE_URL || "postgres://postgres:Alex%242020@localhost:5432/piano_colombia_db"
  })
}

// 1. GET: Consultar límite máximo de descargas configurado en plataforma
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const client = getPgClient()
  try {
    await client.connect()

    const settingRes = await client.query(
      "SELECT value FROM platform_settings WHERE key = 'max_downloads_per_purchase' LIMIT 1;"
    )

    const maxDownloads = settingRes.rows.length > 0 && settingRes.rows[0].value
      ? parseInt(settingRes.rows[0].value, 10)
      : 5

    return res.status(200).json({
      success: true,
      maxDownloads: isNaN(maxDownloads) || maxDownloads < 1 ? 5 : maxDownloads,
    })
  } catch (error: any) {
    console.error("❌ Error en GET /admin/settings/downloads:", error)
    return res.status(500).json({
      success: false,
      message: "Error al consultar configuración de límite de descargas",
      error: error.message,
    })
  } finally {
    await client.end()
  }
}

// 2. POST: Actualizar límite máximo de descargas
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const client = getPgClient()
  try {
    const { maxDownloads, updateExisting } = (req.body as any) || {}
    const parsedLimit = parseInt(maxDownloads, 10)

    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      return res.status(400).json({
        success: false,
        message: "El límite de descargas debe ser un número entero válido entre 1 y 100.",
      })
    }

    await client.connect()

    // Guardar en platform_settings
    await client.query(`
      INSERT INTO platform_settings (key, value, updated_at)
      VALUES ('max_downloads_per_purchase', $1, NOW())
      ON CONFLICT (key) DO UPDATE
      SET value = $1, updated_at = NOW();
    `, [parsedLimit.toString()])

    let updatedRecordsCount = 0
    if (updateExisting) {
      const updateRes = await client.query(`
        UPDATE customer_download
        SET max_downloads = $1;
      `, [parsedLimit])
      updatedRecordsCount = updateRes.rowCount || 0
    }

    return res.status(200).json({
      success: true,
      message: `Límite de descargas actualizado a ${parsedLimit} descargas por licencia.`,
      maxDownloads: parsedLimit,
      updatedRecordsCount,
    })
  } catch (error: any) {
    console.error("❌ Error en POST /admin/settings/downloads:", error)
    return res.status(500).json({
      success: false,
      message: "Error al actualizar límite de descargas",
      error: error.message,
    })
  } finally {
    await client.end()
  }
}
