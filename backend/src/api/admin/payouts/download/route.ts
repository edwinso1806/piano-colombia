import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Client } from "pg"
import { generateBancolombiaPAB } from "../../../../lib/wompi-payout-service"

export const AUTHENTICATE = false

function getPgClient() {
  return new Client({
    connectionString: process.env.DATABASE_URL || "postgres://postgres:Alex%242020@localhost:5432/piano_colombia_db"
  })
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const client = getPgClient()
  try {
    const { batch_id, format = "pab" } = req.query as Record<string, string>

    await client.connect()

    // 1. Obtener lote (por id o por batch_number)
    const batchQuery = batch_id
      ? `SELECT * FROM payout_batch WHERE id = $1 OR batch_number = $1 LIMIT 1;`
      : `SELECT * FROM payout_batch ORDER BY executed_at DESC LIMIT 1;`
    
    const batchRes = await client.query(batchQuery, batch_id ? [batch_id] : [])

    if (batchRes.rows.length === 0) {
      await client.end()
      return res.status(404).json({
        success: false,
        message: "No se encontró el lote de dispersión solicitado",
      })
    }

    const batch = batchRes.rows[0]

    // 2. Obtener ítems del lote
    const itemsQuery = `
      SELECT * FROM payout_item 
      WHERE batch_id = $1 
      ORDER BY created_at ASC;
    `
    const itemsRes = await client.query(itemsQuery, [batch.id])
    const items = itemsRes.rows

    await client.end()

    const batchNumber = batch.batch_number || `BATCH-${batch.id.slice(-6)}`

    // 3. Formato PAB (Plano Bancolombia Pagos a Terceros)
    if (format.toLowerCase() === "pab" || format.toLowerCase() === "txt") {
      const pabText = generateBancolombiaPAB(batchNumber, items)
      
      res.setHeader("Content-Type", "text/plain; charset=utf-8")
      res.setHeader("Content-Disposition", `attachment; filename="PLANO_BANCARIO_PAB_${batchNumber}.txt"`)
      return res.status(200).send(pabText)
    }

    // 4. Formato CSV (Reporte Contable)
    const csvHeaders = "Lote,Compositor,Banco,Tipo Cuenta,Numero Cuenta,Documento,Venta Bruta COP,Comision PC COP,Neto Transferido COP,ID Transaccion Wompi,Estado\n"
    const csvRows = items.map((i: any) => {
      const doc = `"${i.document_number || ""}"`
      const name = `"${i.composer_name || ""}"`
      const bank = `"${i.bank_name || ""}"`
      const accType = `"${i.account_type || ""}"`
      const accNum = `"${i.account_number || ""}"`
      const trxId = `"${i.wompi_transfer_id || ""}"`
      const status = `"${i.status || ""}"`

      return `"${batchNumber}",${name},${bank},${accType},${accNum},${doc},${i.amount_gross_cop},${i.commission_pc_cop},${i.amount_net_cop},${trxId},${status}`
    }).join("\n")

    const fullCsv = "\uFEFF" + csvHeaders + csvRows // Incluye BOM UTF-8 para que Excel lo abra perfecto

    res.setHeader("Content-Type", "text/csv; charset=utf-8")
    res.setHeader("Content-Disposition", `attachment; filename="REPORTE_DISPERSION_${batchNumber}.csv"`)
    return res.status(200).send(fullCsv)
  } catch (error: any) {
    console.error("❌ Error en GET /admin/payouts/download:", error)
    if (client) {
      try { await client.end() } catch {}
    }
    return res.status(500).json({
      success: false,
      message: "Error al generar archivo de descarga",
      error: error.message,
    })
  }
}
