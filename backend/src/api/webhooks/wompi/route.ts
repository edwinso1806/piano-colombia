import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DOWNLOAD_MODULE } from "../../../modules/download"
import { SCORE_MODULE } from "../../../modules/score"
import { COMPOSER_MODULE } from "../../../modules/composer"
import { generateWatermarkedScore } from "../../../lib/pdf-watermarker"
import { sendEmail, generateBuyerPurchaseHTML, extractLanguage, EMAIL_SUBJECTS } from "../../../lib/resend-mailer"
import { Client } from "pg"
import crypto from "crypto"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const downloadModuleService = req.scope.resolve(DOWNLOAD_MODULE)
    const scoreModuleService = req.scope.resolve(SCORE_MODULE)
    const composerModuleService = req.scope.resolve(COMPOSER_MODULE)

    const payload = req.body as any
    console.log("💳 [WOMPI WEBHOOK] Evento recibido:", payload?.event || "test_event")

    const transaction = payload?.data?.transaction || payload?.transaction || payload

    const status = transaction?.status || "APPROVED"
    const reference = transaction?.reference || `PC-${Date.now()}`
    const amountInCents = transaction?.amount_in_cents || 3500000
    const customerEmail = transaction?.customer_email || payload?.customer_email || "cliente@ejemplo.com"
    const customerName = transaction?.customer_data?.full_name || payload?.customer_name || "Cliente Piano Colombia"
    const scoreSlug = payload?.score_slug || "pasillo-colombiano-no-1"

    if (status === "APPROVED") {
      console.log(`✅ [WOMPI WEBHOOK] Transacción APROBADA: ${reference} ($${amountInCents / 100} COP)`)

      // Buscar partitura y compositor
      const scores = await scoreModuleService.listScores({ slug: scoreSlug }, { take: 1 })
      const score = scores && scores.length > 0 ? scores[0] : null
      let composerName = "Maestro Colombiano"

      if (score?.composer_id) {
        const composers = await composerModuleService.listComposers({ id: score.composer_id }, { take: 1 })
        if (composers && composers.length > 0) {
          composerName = composers[0].artistic_name || `${composers[0].first_name} ${composers[0].last_name}`
        }
      }

      const downloadToken = crypto.randomUUID()

      // Consultar límite configurado en plataforma desde el CMS
      let maxDownloadsAllowed = 5
      try {
        const pgClient = new Client({
          connectionString: process.env.DATABASE_URL || "postgres://postgres:Colombia-93@localhost:5432/piano_colombia_db"
        })
        await pgClient.connect()
        const limitRes = await pgClient.query("SELECT value FROM platform_settings WHERE key = 'max_downloads_per_purchase' LIMIT 1;")
        if (limitRes.rows.length > 0 && limitRes.rows[0].value) {
          maxDownloadsAllowed = parseInt(limitRes.rows[0].value, 10) || 5
        }
        await pgClient.end()
      } catch {
        maxDownloadsAllowed = 5
      }

      const buyerLang = (payload?.lang || payload?.language || payload?.customer_language || extractLanguage(req)) as "es" | "en"

      // Procesar todos los items del carrito o score individual
      const rawItems = Array.isArray(payload?.items) && payload.items.length > 0
        ? payload.items
        : [{
            score_slug: scoreSlug,
            score_id: payload?.score_id || "",
            quantity: Number(payload?.quantity) || 1,
            title: "Partitura Piano Colombia",
          }]

      let primaryDownloadToken = ""
      let primaryScoreTitle = "Partitura Piano Colombia"
      let primaryComposerName = "Maestro Colombiano"

      for (const item of rawItems) {
        const itemSlug = item.score_slug || scoreSlug
        const itemId = item.score_id || payload?.score_id || ""
        const qty = Math.max(1, Number(item.quantity) || 1)

        // Buscar partitura y compositor
        const scores = await scoreModuleService.listScores({ slug: itemSlug }, { take: 1 })
        const score = scores && scores.length > 0 ? scores[0] : null
        let composerName = "Maestro Colombiano"

        if (score?.composer_id) {
          const composers = await composerModuleService.listComposers({ id: score.composer_id }, { take: 1 })
          if (composers && composers.length > 0) {
            composerName = composers[0].artistic_name || `${composers[0].first_name} ${composers[0].last_name}`
          }
        }

        if (!primaryScoreTitle || primaryScoreTitle === "Partitura Piano Colombia") {
          primaryScoreTitle = score?.title || item.title || "Partitura Piano Colombia"
          primaryComposerName = composerName
        }

        for (let q = 0; q < qty; q++) {
          const downloadToken = crypto.randomUUID()
          if (!primaryDownloadToken) {
            primaryDownloadToken = downloadToken
          }

          // Registrar descarga protegida en PostgreSQL
          await downloadModuleService.createCustomerDownloads({
            order_id: reference,
            customer_id: customerEmail,
            score_id: score?.id || itemId || "score_default",
            score_title: score?.title || item.title || "Partitura Piano Colombia",
            composer_name: composerName,
            download_token: downloadToken,
            download_count: 0,
            max_downloads: maxDownloadsAllowed,
            wompi_transaction_id: transaction?.id || reference,
            buyer_name: customerName,
            buyer_email: customerEmail,
            buyer_tax_id: transaction?.customer_data?.legal_id || null,
            language: buyerLang,
            watermark_text: buyerLang === "en"
              ? `Official License Piano Colombia · Buyer: ${customerName} · Ref: ${reference}`
              : `Licencia Oficial Piano Colombia · Comprador: ${customerName} · Ref: ${reference}`,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
          })
        }
      }

      // Enviar correo de confirmación de compra y descarga nominativa
      const downloadUrl = `http://localhost:3000/mi-cuenta/descargas?token=${primaryDownloadToken}`
      const purchaseHTML = generateBuyerPurchaseHTML({
        buyerName: customerName,
        scoreTitle: primaryScoreTitle,
        composerName: primaryComposerName,
        downloadUrl,
        token: primaryDownloadToken,
        priceCop: Math.round(amountInCents / 100),
        lang: buyerLang,
      })

      await sendEmail({
        to: customerEmail,
        subject: EMAIL_SUBJECTS.buyerPurchase[buyerLang](primaryScoreTitle || (buyerLang === "en" ? "Urtext Sheet Music" : "Partitura Urtext")),
        html: purchaseHTML,
      })

      return res.status(200).json({
        received: true,
        status: "APPROVED",
        download_token: primaryDownloadToken,
        download_url: downloadUrl,
        message: "Pago procesado, descargas legales estampadas y correo de confirmación enviado con éxito.",
      })
    }

    return res.status(200).json({
      received: true,
      status,
      message: `Transacción recibida con estado: ${status}`,
    })
  } catch (error: any) {
    console.error("❌ [WOMPI WEBHOOK] Error procesando webhook:", error)
    return res.status(500).json({
      received: false,
      error: error.message,
    })
  }
}
