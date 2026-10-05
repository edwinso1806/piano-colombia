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

    // 1. Obtener comisión por defecto de la plataforma
    const settingRes = await client.query(
      "SELECT value FROM platform_settings WHERE key = 'default_commission_percentage' LIMIT 1;"
    )
    const defaultCommission = settingRes.rows.length > 0 ? Number(settingRes.rows[0].value) : 15

    // 2. Consultar ventas reales de partituras por compositor
    const salesQuery = `
      SELECT 
        c.id as composer_id,
        c.artistic_name,
        c.first_name,
        c.last_name,
        c.email,
        c.status as composer_status,
        c.commission_percentage,
        b.bank_name,
        b.account_type,
        b.account_number,
        b.document_number,
        b.document_type,
        COUNT(d.id)::int as total_sales_count,
        COALESCE(SUM(s.price_cop), 0)::int as gross_sales_cop
      FROM composer c
      LEFT JOIN composer_bank_account b ON b.composer_id = c.id
      JOIN score s ON s.composer_id = c.id
      JOIN customer_download d ON d.score_id = s.id
      GROUP BY c.id, c.artistic_name, c.first_name, c.last_name, c.email, c.status, c.commission_percentage,
               b.bank_name, b.account_type, b.account_number, b.document_number, b.document_type;
    `
    const salesRes = await client.query(salesQuery)

    // 3. Consultar montos ya liquidados y pagados previamente desde payout_item
    const paidQuery = `
      SELECT 
        composer_id,
        COALESCE(SUM(amount_gross_cop), 0)::int as paid_gross_cop,
        COALESCE(SUM(amount_net_cop), 0)::int as paid_net_cop
      FROM payout_item
      WHERE status != 'FAILED'
      GROUP BY composer_id;
    `
    const paidRes = await client.query(paidQuery)
    const paidMap = new Map<string, { paid_gross_cop: number; paid_net_cop: number }>()
    paidRes.rows.forEach((r: any) => paidMap.set(r.composer_id, r))

    // 4. Armar lista consolidada de liquidaciones pendientes
    const pendingPayouts = salesRes.rows
      .map((row: any) => {
        const commissionPct = row.commission_percentage !== null ? Number(row.commission_percentage) : defaultCommission
        const paidInfo = paidMap.get(row.composer_id) || { paid_gross_cop: 0, paid_net_cop: 0 }

        const pendingGrossCOP = Math.max(0, row.gross_sales_cop - paidInfo.paid_gross_cop)
        const platformFeeCOP = Math.round(pendingGrossCOP * (commissionPct / 100))
        const netEarningsCOP = pendingGrossCOP - platformFeeCOP

        const composerName = row.artistic_name || `${row.first_name || ""} ${row.last_name || ""}`.trim()
        const taxId = row.document_number
          ? `${row.document_type || "CC"} ${row.document_number}`
          : "Sin registrar"

        return {
          id: `pay-${row.composer_id}`,
          composerId: row.composer_id,
          composerName,
          email: row.email,
          bankName: row.bank_name || "Sin banco configurado",
          accountType: row.account_type || "AHORROS",
          accountNumber: row.account_number || "Sin cuenta",
          taxId,
          totalSalesCount: row.total_sales_count,
          grossSalesCOP: pendingGrossCOP,
          platformFeeCOP,
          netEarningsCOP,
          status: pendingGrossCOP > 0 ? "pending" : "paid",
          wompiVerified: !!(row.bank_name && row.account_number && row.document_number),
          commissionPercentage: commissionPct,
          lifetimePaidGrossCOP: paidInfo.paid_gross_cop,
          lifetimePaidNetCOP: paidInfo.paid_net_cop,
        }
      })
      .filter((p: any) => p.grossSalesCOP > 0) // Solo mostrar los que tienen saldo pendiente por liquidar

    // 5. Consultar historial de lotes ejecutados en PostgreSQL
    const batchesQuery = `
      SELECT 
        b.id,
        b.batch_number,
        b.period_start,
        b.period_end,
        b.status,
        b.total_gross_cop,
        b.total_commission_pc_cop,
        b.total_net_composers_cop,
        b.wompi_batch_id,
        b.executed_at,
        b.executed_by,
        COUNT(i.id)::int as composers_count
      FROM payout_batch b
      LEFT JOIN payout_item i ON i.batch_id = b.id
      GROUP BY b.id
      ORDER BY b.executed_at DESC;
    `
    const batchesRes = await client.query(batchesQuery)
    const batches = batchesRes.rows.map((b: any) => ({
      batchId: b.batch_number || b.id,
      date: new Date(b.executed_at).toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      composersCount: b.composers_count,
      totalAmountCOP: b.total_net_composers_cop,
      status: b.status.toLowerCase(),
      executedBy: b.executed_by || "Tesorero PC",
      wompiBatchTransactionId: b.wompi_batch_id || "TR-WOMPI-BATCH-000",
    }))

    await client.end()

    return res.status(200).json({
      success: true,
      pendingPayouts,
      batches,
    })
  } catch (error: any) {
    console.error("❌ Error en GET /admin/payouts:", error)
    if (client) {
      try { await client.end() } catch {}
    }
    return res.status(500).json({
      success: false,
      message: "Error consultando liquidaciones de pagos",
      error: error.message,
    })
  }
}
