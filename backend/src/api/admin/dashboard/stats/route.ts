import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Client } from "pg"

export const AUTHENTICATE = false

function getPgClient() {
  return new Client({
    connectionString: process.env.DATABASE_URL || "postgres://postgres:Alex%242020@localhost:5432/piano_colombia_db"
  })
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const client = getPgClient()
  try {
    await client.connect()

    // 1. Obtener comisión general de plataforma
    const commissionSettingRes = await client.query(
      "SELECT value FROM platform_settings WHERE key = 'default_commission_percentage' LIMIT 1;"
    )
    const defaultCommission = commissionSettingRes.rows.length > 0
      ? Number(commissionSettingRes.rows[0].value)
      : 20

    // 2. Conteo y lista de Compositores Pendientes
    const pendingComposersRes = await client.query(`
      SELECT id, first_name, last_name, artistic_name, email, phone, status, commission_percentage, created_at
      FROM composer
      WHERE status = 'PENDING_APPROVAL'
      ORDER BY created_at DESC;
    `)

    // 3. Conteo total de compositores
    const totalComposersRes = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'PENDING_APPROVAL' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected
      FROM composer;
    `)

    // 4. Conteo y lista de Partituras Pendientes
    const pendingScoresRes = await client.query(`
      SELECT s.id, s.title, s.genre, s.difficulty, s.price_cop, s.status, s.created_at,
             c.artistic_name as composer_name
      FROM score s
      LEFT JOIN composer c ON s.composer_id = c.id
      WHERE s.status = 'IN_REVIEW'
      ORDER BY s.created_at DESC;
    `)

    // 5. Conteo total de partituras
    const totalScoresRes = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'IN_REVIEW' THEN 1 END) as in_review,
        COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected
      FROM score;
    `)

    // 6. Resumen de Ventas / Pagos si existen
    let totalSalesCop = 0
    let totalCommissionCop = 0
    let transactionsCount = 0

    try {
      const payoutItemsRes = await client.query(`
        SELECT 
          COALESCE(SUM(amount_gross_cop), 0) as total_gross,
          COALESCE(SUM(commission_pc_cop), 0) as total_commission,
          COUNT(*) as count
        FROM payout_item;
      `)
      if (payoutItemsRes.rows.length > 0) {
        totalSalesCop = Number(payoutItemsRes.rows[0].total_gross) || 0
        totalCommissionCop = Number(payoutItemsRes.rows[0].total_commission) || 0
        transactionsCount = Number(payoutItemsRes.rows[0].count) || 0
      }
    } catch (err) {
      console.warn("Tabla payout_item no disponible:", err)
    }

    // Si aún no hay ventas procesadas en payout_item, los valores permanecen en 0
    // (Módulo de transacciones / ventas real)

    return res.status(200).json({
      success: true,
      defaultCommission,
      composers: {
        pendingCount: Number(totalComposersRes.rows[0]?.pending || 0),
        approvedCount: Number(totalComposersRes.rows[0]?.approved || 0),
        rejectedCount: Number(totalComposersRes.rows[0]?.rejected || 0),
        totalCount: Number(totalComposersRes.rows[0]?.total || 0),
        pendingList: pendingComposersRes.rows,
      },
      scores: {
        pendingCount: Number(totalScoresRes.rows[0]?.in_review || 0),
        approvedCount: Number(totalScoresRes.rows[0]?.approved || 0),
        rejectedCount: Number(totalScoresRes.rows[0]?.rejected || 0),
        totalCount: Number(totalScoresRes.rows[0]?.total || 0),
        pendingList: pendingScoresRes.rows,
      },
      financials: {
        totalSalesCop,
        totalCommissionCop,
        commissionFeePercentage: defaultCommission,
        transactionsCount,
      }
    })
  } catch (error: any) {
    console.error("❌ Error en GET /admin/dashboard/stats:", error)
    return res.status(500).json({
      success: false,
      message: "Error al consultar indicadores de la base de datos",
      error: error.message,
    })
  } finally {
    await client.end()
  }
}
