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
    const { id, email } = req.query as Record<string, string>

    if (!id && !email) {
      return res.status(400).json({
        success: false,
        message: "Se requiere el 'id' o 'email' del compositor",
      })
    }

    await client.connect()

    // 1. Obtener compositor
    const composerQuery = `
      SELECT 
        c.id, c.first_name, c.last_name, c.artistic_name, c.email, c.commission_percentage,
        b.bank_name, b.account_type, b.account_number, b.holder_name, b.document_number, b.document_type
      FROM composer c
      LEFT JOIN composer_bank_account b ON b.composer_id = c.id
      WHERE ${id ? "c.id = $1" : "LOWER(c.email) = LOWER($1)"}
      LIMIT 1;
    `
    const compRes = await client.query(composerQuery, [id || email])

    if (compRes.rows.length === 0) {
      await client.end()
      return res.status(404).json({
        success: false,
        message: "Compositor no encontrado",
      })
    }

    const composer = compRes.rows[0]

    // 2. Comisión de plataforma
    const settingRes = await client.query(
      "SELECT value FROM platform_settings WHERE key = 'default_commission_percentage' LIMIT 1;"
    )
    const defaultCommission = settingRes.rows.length > 0 ? Number(settingRes.rows[0].value) : 15
    const commissionPercentage = composer.commission_percentage !== null
      ? Number(composer.commission_percentage)
      : defaultCommission
    const composerParticipationPercentage = 100 - commissionPercentage

    // 3. Historial de dispersiones realizadas a este compositor desde payout_item
    const payoutsQuery = `
      SELECT 
        i.id,
        i.amount_gross_cop,
        i.commission_pc_cop,
        i.amount_net_cop,
        i.wompi_transfer_id,
        i.status,
        i.created_at,
        b.batch_number,
        b.executed_at,
        b.executed_by
      FROM payout_item i
      JOIN payout_batch b ON b.id = i.batch_id
      WHERE i.composer_id = $1 AND i.status != 'FAILED'
      ORDER BY b.executed_at ASC;
    `
    const payoutsRes = await client.query(payoutsQuery, [composer.id])

    let lifetimeDisbursedCOP = 0
    const payoutHistoryAsc = payoutsRes.rows.map((row: any) => {
      const net = Number(row.amount_net_cop) || 0
      lifetimeDisbursedCOP += net
      return {
        id: row.id,
        batchNumber: row.batch_number,
        amountNetCOP: net,
        amountGrossCOP: Number(row.amount_gross_cop) || 0,
        commissionPcCop: Number(row.commission_pc_cop) || 0,
        wompiTransferId: row.wompi_transfer_id,
        status: row.status,
        executedAt: row.executed_at || row.created_at,
        executedBy: row.executed_by || "Tesorero PC",
      }
    })

    // 4. Ventas reales de las partituras de este compositor
    const salesQuery = `
      SELECT 
        d.id as download_id,
        d.order_id,
        d.score_id,
        d.score_title,
        d.buyer_name,
        d.buyer_email,
        d.wompi_transaction_id,
        d.created_at,
        s.price_cop
      FROM customer_download d
      JOIN score s ON s.id = d.score_id
      WHERE s.composer_id = $1
      ORDER BY d.created_at DESC;
    `
    const salesRes = await client.query(salesQuery, [composer.id])

    let totalGrossSalesCOP = 0
    let totalNetRoyaltiesCOP = 0

    const salesHistory = salesRes.rows.map((row: any) => {
      const grossPrice = Number(row.price_cop) || 0
      const platformFee = Math.round(grossPrice * (commissionPercentage / 100))
      const netRoyalty = grossPrice - platformFee

      totalGrossSalesCOP += grossPrice
      totalNetRoyaltiesCOP += netRoyalty

      const saleTime = new Date(row.created_at).getTime()
      // Identificar si esta venta ya fue liquidada en un lote existente
      const matchingBatch = payoutHistoryAsc.find(
        (b: any) => new Date(b.executedAt).getTime() >= saleTime
      )

      return {
        id: row.download_id,
        orderId: row.order_id,
        scoreTitle: row.score_title,
        buyerName: row.buyer_name || "Cliente Urtext",
        buyerEmail: row.buyer_email,
        wompiTransactionId: row.wompi_transaction_id,
        createdAt: row.created_at,
        grossPriceCOP: grossPrice,
        platformFeeCOP: platformFee,
        netRoyaltyCOP: netRoyalty,
        status: "COMPLETED",
        payoutStatus: matchingBatch ? "PAID" : "PENDING",
        payoutBatch: matchingBatch ? matchingBatch.batchNumber : null,
        payoutExecutedAt: matchingBatch ? matchingBatch.executedAt : null,
      }
    })

    const pendingBalanceCOP = Math.max(0, totalNetRoyaltiesCOP - lifetimeDisbursedCOP)
    const payoutHistory = [...payoutHistoryAsc].reverse()

    await client.end()

    return res.status(200).json({
      success: true,
      composer: {
        id: composer.id,
        name: composer.artistic_name || `${composer.first_name || ""} ${composer.last_name || ""}`.trim(),
        email: composer.email,
        commissionPercentage,
        composerParticipationPercentage,
        bankAccount: {
          bankName: composer.bank_name || null,
          accountType: composer.account_type || null,
          accountNumber: composer.account_number || null,
          holderName: composer.holder_name || null,
          documentNumber: composer.document_number || null,
          documentType: composer.document_type || "CC",
        },
      },
      summary: {
        totalSalesCount: salesHistory.length,
        totalGrossSalesCOP,
        totalNetRoyaltiesCOP,
        lifetimeDisbursedCOP,
        pendingBalanceCOP,
      },
      salesHistory,
      payoutHistory,
    })
  } catch (error: any) {
    console.error("❌ Error en GET /store/composers/payouts:", error)
    if (client) {
      try { await client.end() } catch {}
    }
    return res.status(500).json({
      success: false,
      message: "Error al consultar liquidaciones del compositor",
      error: error.message,
    })
  }
}
