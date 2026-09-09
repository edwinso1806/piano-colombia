import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DOWNLOAD_MODULE } from "../../../../modules/download"
import { generateWatermarkedScore } from "../../../../lib/pdf-watermarker"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const downloadModuleService = req.scope.resolve(DOWNLOAD_MODULE)
    const { token } = req.params

    const downloads = await downloadModuleService.listCustomerDownloads({ download_token: token }, { take: 1 })

    if (!downloads || downloads.length === 0) {
      return res.status(404).json({ message: "Enlace de descarga no válido o expirado" })
    }

    const download = downloads[0]

    if (download.download_count >= download.max_downloads) {
      return res.status(403).json({
        message: "Has alcanzado el límite máximo de 5 descargas permitidas para esta licencia.",
      })
    }

    // Generar PDF estampado en memoria
    const pdfBytes = await generateWatermarkedScore({
      buyerName: download.buyer_name,
      buyerEmail: download.buyer_email,
      buyerTaxId: download.buyer_tax_id || undefined,
      wompiTransactionId: download.wompi_transaction_id || download.order_id,
      scoreTitle: download.score_title,
      composerName: download.composer_name,
    })

    // Incrementar contador de descargas
    await downloadModuleService.updateCustomerDownloads({
      id: download.id,
      download_count: download.download_count + 1,
    })

    const safeTitle = download.score_title.replace(/[^a-zA-Z0-9_-]/g, "_")
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename="PianoColombia_${safeTitle}_Estampada.pdf"`)
    res.setHeader("Content-Length", pdfBytes.length)

    return res.status(200).send(Buffer.from(pdfBytes))
  } catch (error: any) {
    console.error("❌ Error generando descarga de partitura:", error)
    return res.status(500).json({
      message: "Error generando el archivo PDF de partitura",
      error: error.message,
    })
  }
}
