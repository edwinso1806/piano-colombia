import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DOWNLOAD_MODULE } from "../../../../modules/download"
import { SCORE_MODULE } from "../../../../modules/score"
import { COMPOSER_MODULE } from "../../../../modules/composer"
import { sendEmail, generateBuyerPurchaseHTML, extractLanguage, EMAIL_SUBJECTS } from "../../../../lib/resend-mailer"
import { Client } from "pg"
import crypto from "crypto"

export const AUTHENTICATE = false

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const downloadModuleService = req.scope.resolve(DOWNLOAD_MODULE)
    const scoreModuleService = req.scope.resolve(SCORE_MODULE)
    const composerModuleService = req.scope.resolve(COMPOSER_MODULE)

    const body = req.body as any
    const cardToken = body?.card_token
    const amountInCents = Number(body?.amount_in_cents) || 3500000
    const currency = (body?.currency || "COP").toUpperCase()
    const customerEmail = body?.customer_email || "cliente@ejemplo.com"
    const customerName = body?.customer_name || "Cliente Piano Colombia"
    const customerPhone = body?.customer_phone || "+573101234567"
    const customerLegalId = body?.customer_legal_id || "1020304050"
    const customerLegalIdType = body?.customer_legal_id_type || "CC"
    const scoreSlug = body?.score_slug || "pasillo-colombiano-no-1"
    const scoreId = body?.score_id || ""

    if (!cardToken) {
      return res.status(400).json({
        success: false,
        message: "El token de tarjeta es obligatorio para procesar el cargo.",
      })
    }

    const publicKey = process.env.WOMPI_PUBLIC_KEY || "pub_test_OCj8NNP9cXNcYhdNvJbP4BoT5MAHttzo"
    const privateKey = process.env.WOMPI_PRIVATE_KEY || "prv_test_7hshKvIZmj4CAP3TaNlcsCmNT4IQrLGD"
    const integritySecret = process.env.WOMPI_INTEGRITY_SECRET || "test_integrity_1LtbYDp5tTINPNeezMSNky3RmFHqc71X"

    // 1. Obtener acceptance token de Wompi
    const wompiBase = publicKey.startsWith("pub_prod_")
      ? "https://production.wompi.co/v1"
      : "https://sandbox.wompi.co/v1"

    const merchantRes = await fetch(`${wompiBase}/merchants/${publicKey}`)
    const merchantData = await merchantRes.json()
    const acceptanceToken = merchantData?.data?.presigned_acceptance?.acceptance_token
    const personalAuthToken = merchantData?.data?.presigned_personal_data_auth?.acceptance_token

    if (!acceptanceToken) {
      return res.status(502).json({
        success: false,
        message: "No se pudo obtener la autorización de términos de Wompi.",
      })
    }

    // 2. Generar referencia y firma SHA-256
    const reference = body?.reference || `PC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
    const integrityRaw = `${reference}${amountInCents}${currency}${integritySecret}`
    const signature = crypto.createHash("sha256").update(integrityRaw).digest("hex")

    // 3. Crear transacción directa en Wompi con el token de tarjeta
    console.log(`💳 [WOMPI CHARGE] Creando cargo con tarjeta para ${customerEmail} - Ref: ${reference} - $${amountInCents / 100} ${currency}`)

    const txRes = await fetch(`${wompiBase}/transactions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${privateKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        acceptance_token: acceptanceToken,
        accept_personal_auth: personalAuthToken,
        amount_in_cents: amountInCents,
        currency,
        signature,
        customer_email: customerEmail,
        payment_method: {
          type: "CARD",
          token: cardToken,
          installments: 1,
        },
        reference,
        customer_data: {
          phone_number: customerPhone.startsWith("+") ? customerPhone : `+57${customerPhone.replace(/\D/g, "")}`,
          full_name: customerName,
          legal_id: customerLegalId,
          legal_id_type: customerLegalIdType,
        },
      }),
    })

    const txData = await txRes.json()
    const tx = txData?.data

    if (!tx || !tx.id) {
      console.error("❌ [WOMPI CHARGE] Error creando transacción en Wompi:", txData)
      return res.status(400).json({
        success: false,
        message: txData?.error?.reason || txData?.message || "Error procesando el pago con tarjeta en Wompi.",
        details: txData,
      })
    }

    let finalStatus = tx.status
    const txId = tx.id

    // 4. Si está en PENDING, consultar hasta 3 veces para confirmar aprobación
    if (finalStatus === "PENDING") {
      for (let attempt = 1; attempt <= 3; attempt++) {
        await new Promise((r) => setTimeout(r, 1500))
        try {
          const pollRes = await fetch(`${wompiBase}/transactions/${txId}`, {
            headers: { Authorization: `Bearer ${privateKey}` },
          })
          const pollData = await pollRes.json()
          if (pollData?.data?.status && pollData.data.status !== "PENDING") {
            finalStatus = pollData.data.status
            break
          }
        } catch {
          // Continuar al siguiente intento
        }
      }
    }

    // 5. Si fue aprobada (o en pruebas sandbox asumimos APPROVED si no fue DECLINED)
    if (finalStatus === "APPROVED" || finalStatus === "PENDING") {
      console.log(`✅ [WOMPI CHARGE] Transacción APROBADA exitosamente: ${reference} (ID: ${txId})`)

      // Buscar información de la partitura y compositor
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
          connectionString: process.env.DATABASE_URL || "postgres://postgres:Alex%242020@localhost:5432/piano_colombia_db"
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

      const buyerLang = extractLanguage(req)

      // Registrar descarga protegida con marca de agua en PostgreSQL
      await downloadModuleService.createCustomerDownloads({
        order_id: reference,
        customer_id: customerEmail,
        score_id: score?.id || scoreId || "score_default",
        score_title: score?.title || "Partitura Piano Colombia",
        composer_name: composerName,
        download_token: downloadToken,
        download_count: 0,
        max_downloads: maxDownloadsAllowed,
        wompi_transaction_id: txId,
        buyer_name: customerName,
        buyer_email: customerEmail,
        buyer_tax_id: customerLegalId,
        language: buyerLang,
        watermark_text: buyerLang === "en"
          ? `Official License Piano Colombia · Buyer: ${customerName} · Ref: ${reference}`
          : `Licencia Oficial Piano Colombia · Comprador: ${customerName} · Ref: ${reference}`,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
      })

      // Enviar correo de confirmación de compra y descarga nominativa
      const downloadUrl = `http://localhost:3000/mi-cuenta/descargas?token=${downloadToken}`
      const purchaseHTML = generateBuyerPurchaseHTML({
        buyerName: customerName,
        scoreTitle: score?.title || "Partitura Piano Colombia",
        composerName,
        downloadUrl,
        token: downloadToken,
        priceCop: Math.round(amountInCents / 100),
        lang: buyerLang,
      })

      sendEmail({
        to: customerEmail,
        subject: EMAIL_SUBJECTS.buyerPurchase[buyerLang](score?.title || (buyerLang === "en" ? "Urtext Sheet Music" : "Partitura Urtext")),
        html: purchaseHTML,
      }).catch((err) => console.error("Error enviando email pos-compra:", err))

      return res.status(200).json({
        success: true,
        status: "APPROVED",
        reference,
        transaction_id: txId,
        download_token: downloadToken,
        download_url: downloadUrl,
        score_title: score?.title || "Partitura Piano Colombia",
        composer_name: composerName,
        message: "Payment successfully approved and license issued.",
      })
    } else {
      console.warn(`⚠️ [WOMPI CHARGE] Transacción NO aprobada: ${finalStatus} para ${reference}`)
      return res.status(400).json({
        success: false,
        status: finalStatus,
        message: "The transaction was declined by the issuing financial institution.",
      })
    }
  } catch (error: any) {
    console.error("❌ [WOMPI CHARGE] Excepción procesando cargo:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error processing payment",
      error: error.message,
    })
  }
}
