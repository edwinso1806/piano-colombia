import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Client } from "pg"

export const AUTHENTICATE = false

function getPgClient() {
  return new Client({
    connectionString: process.env.DATABASE_URL || "postgres://postgres:Colombia-93@localhost:5432/piano_colombia_db"
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

    // 6. Resumen de Ventas y Transacciones Reales (customer_download)
    let totalSalesCop = 0
    let totalCommissionCop = 0
    let transactionsCount = 0
    let recentTransactions: any[] = []

    try {
      const salesRes = await client.query(`
        SELECT 
          COALESCE(SUM(COALESCE(s.price_cop, 40000)), 0) as total_sales,
          COUNT(cd.id) as count
        FROM customer_download cd
        LEFT JOIN score s ON cd.score_id = s.id;
      `)
      if (salesRes.rows.length > 0) {
        totalSalesCop = Number(salesRes.rows[0].total_sales) || 0
        transactionsCount = Number(salesRes.rows[0].count) || 0
        totalCommissionCop = Math.round(totalSalesCop * (defaultCommission / 100))
      }

      const recentRes = await client.query(`
        SELECT 
          cd.id,
          cd.order_id,
          cd.score_title,
          cd.composer_name,
          cd.buyer_name,
          cd.buyer_email,
          cd.created_at,
          cd.wompi_transaction_id,
          cd.download_token,
          COALESCE(s.price_cop, 40000) as amount_cop
        FROM customer_download cd
        LEFT JOIN score s ON cd.score_id = s.id
        ORDER BY cd.created_at DESC
        LIMIT 10;
      `)
      recentTransactions = recentRes.rows
    } catch (err) {
      console.warn("Error consultando ventas de customer_download:", err)
    }

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
        recentTransactions,
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
