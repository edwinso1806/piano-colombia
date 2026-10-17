import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Client } from "pg"
import { getScoreMasterPdfBuffer } from "./score-pdf-loader"
import { generateWatermarkedScore } from "./pdf-watermarker"

function getPgClient() {
  return new Client({
    connectionString: process.env.DATABASE_URL || "postgres://postgres:Colombia-93@localhost:5432/piano_colombia_db",
  })
}

export async function handleSecureDownload(token: string, req: MedusaRequest, res: MedusaResponse) {
  const client = getPgClient()
  try {
    if (!token) {
      return res.status(400).json({ message: "Token de descarga no proporcionado" })
    }

    await client.connect()

    // 1. Consultar registro de descarga en PostgreSQL
    const downloadRes = await client.query(
      `SELECT id, order_id, customer_id, score_id, score_title, composer_name,
              download_token, download_count, max_downloads, buyer_name,
              buyer_email, buyer_tax_id, wompi_transaction_id, created_at
       FROM customer_download
       WHERE download_token = $1
       LIMIT 1;`,
      [token]
    )

    if (downloadRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Enlace de descarga no válido, expirado o inexistente.",
      })
    }

    const download = downloadRes.rows[0]

    // 2. Consultar límite configurado en plataforma por si max_downloads es nulo
    let maxAllowed = download.max_downloads
    if (!maxAllowed || maxAllowed < 1) {
      const settingRes = await client.query(
        "SELECT value FROM platform_settings WHERE key = 'max_downloads_per_purchase' LIMIT 1;"
      )
      maxAllowed = settingRes.rows.length > 0 && settingRes.rows[0].value
        ? parseInt(settingRes.rows[0].value, 10)
        : 5
    }

    const currentCount = Number(download.download_count) || 0

    // 3. Validar límite estricto de descargas
    if (currentCount >= maxAllowed) {
      return res.status(403).json({
        success: false,
        limitReached: true,
        message: `Has alcanzado el límite máximo de ${maxAllowed} descargas permitidas para esta licencia digital.`,
        downloadCount: currentCount,
        maxDownloads: maxAllowed,
      })
    }

    // 4. Cargar buffer del PDF maestro original (Cloudflare R2 o local)
    const masterBuffer = await getScoreMasterPdfBuffer(download.score_id)

    // 5. Generar PDF estampado en memoria con la licencia nominativa del comprador
    const pdfBytes = await generateWatermarkedScore({
      buyerName: download.buyer_name,
      buyerEmail: download.buyer_email,
      buyerTaxId: download.buyer_tax_id || undefined,
      wompiTransactionId: download.wompi_transaction_id || download.order_id,
      scoreTitle: download.score_title,
      composerName: download.composer_name,
      masterPdfBuffer: masterBuffer || undefined,
    })

    // 6. Incrementar atómicamente el contador de descargas en PostgreSQL
    const updateRes = await client.query(
      `UPDATE customer_download
       SET download_count = download_count + 1
       WHERE id = $1
       RETURNING download_count, max_downloads;`,
      [download.id]
    )

    const updatedCount = updateRes.rows[0]?.download_count ?? (currentCount + 1)
    console.log(`📥 [Descarga Exitosa] Partitura "${download.score_title}" para ${download.buyer_name}. Descarga #${updatedCount}/${maxAllowed}.`)

    // 7. Servir el archivo PDF al cliente
    const safeTitle = (download.score_title || "Partitura")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename="PianoColombia_${safeTitle}_Estampada.pdf"`)
    res.setHeader("Content-Length", pdfBytes.length.toString())
    res.setHeader("X-Downloads-Remaining", Math.max(0, maxAllowed - updatedCount).toString())
    res.setHeader("X-Downloads-Total", maxAllowed.toString())
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate")

    return res.status(200).send(Buffer.from(pdfBytes))
  } catch (error: any) {
    console.error("❌ Error en handleSecureDownload:", error)
    return res.status(500).json({
      success: false,
      message: "Error generando el archivo PDF de partitura con estampa legal",
      error: error.message,
    })
  } finally {
    await client.end()
  }
}
