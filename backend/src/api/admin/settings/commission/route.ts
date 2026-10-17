import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Client } from "pg"

export const AUTHENTICATE = false

function getPgClient() {
  return new Client({
    connectionString: process.env.DATABASE_URL || "postgres://postgres:Colombia-93@localhost:5432/piano_colombia_db"
  })
}

// 1. GET: Consultar comisión general y lista de compositores con su comisión individual
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const client = getPgClient()
  try {
    await client.connect()

    // Comisión general de plataforma
    const settingRes = await client.query(
      "SELECT value FROM platform_settings WHERE key = 'default_commission_percentage' LIMIT 1;"
    )
    const defaultCommission = settingRes.rows.length > 0
      ? Number(settingRes.rows[0].value)
      : 20

    // Compositores con su comisión personalizada o nula
    const composersRes = await client.query(`
      SELECT id, artistic_name, first_name, last_name, email, status, commission_percentage
      FROM composer
      ORDER BY first_name ASC;
    `)

    return res.status(200).json({
      success: true,
      defaultCommission,
      composers: composersRes.rows.map((c: any) => ({
        id: c.id,
        name: c.artistic_name || `${c.first_name} ${c.last_name}`,
        email: c.email,
        status: c.status,
        customCommission: c.commission_percentage !== null ? Number(c.commission_percentage) : null,
        effectiveCommission: c.commission_percentage !== null ? Number(c.commission_percentage) : defaultCommission,
      }))
    })
  } catch (error: any) {
    console.error("❌ Error en GET /admin/settings/commission:", error)
    return res.status(500).json({
      success: false,
      message: "Error al consultar configuraciones de comisión",
      error: error.message,
    })
  } finally {
    await client.end()
  }
}

// 2. POST: Actualizar comisión general O comisión específica de un compositor
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const client = getPgClient()
  try {
    const {
      type, // 'general' | 'composer'
      defaultCommission, // number si type === 'general'
      composerId, // string si type === 'composer'
      customCommission, // number | null si type === 'composer'
    } = (req.body as any) || {}

    await client.connect()

    if (type === "general") {
      const percentage = Number(defaultCommission)
      if (isNaN(percentage) || percentage < 0 || percentage > 100) {
        return res.status(400).json({
          message: "El porcentaje de comisión general debe ser un número válido entre 0 y 100."
        })
      }

      await client.query(`
        INSERT INTO platform_settings (key, value, updated_at)
        VALUES ('default_commission_percentage', $1, NOW())
        ON CONFLICT (key) DO UPDATE
        SET value = $1, updated_at = NOW();
      `, [percentage.toString()])

      return res.status(200).json({
        success: true,
        message: `Comisión general de plataforma actualizada exitosamente al ${percentage}%.`,
        defaultCommission: percentage,
      })
    } else if (type === "composer") {
      if (!composerId) {
        return res.status(400).json({
          message: "El ID del compositor es obligatorio para actualizar su comisión.",
        })
      }

      let newPercentage: number | null = null
      if (customCommission !== null && customCommission !== undefined && customCommission !== "") {
        newPercentage = Number(customCommission)
        if (isNaN(newPercentage) || newPercentage < 0 || newPercentage > 100) {
          return res.status(400).json({
            message: "El porcentaje de comisión personalizado debe estar entre 0 y 100.",
          })
        }
      }

      await client.query(`
        UPDATE composer
        SET commission_percentage = $1
        WHERE id = $2;
      `, [newPercentage, composerId])

      return res.status(200).json({
        success: true,
        message: newPercentage !== null
          ? `Comisión individual asignada al ${newPercentage}% para el compositor.`
          : `El compositor ahora heredará el porcentaje general de la plataforma.`,
        composerId,
        customCommission: newPercentage,
      })
    } else {
      return res.status(400).json({
        message: "Tipo de actualización no válido. Debe ser 'general' o 'composer'."
      })
    }
  } catch (error: any) {
    console.error("❌ Error en POST /admin/settings/commission:", error)
    return res.status(500).json({
      success: false,
      message: "Error al actualizar comisión",
      error: error.message,
    })
  } finally {
    await client.end()
  }
}
