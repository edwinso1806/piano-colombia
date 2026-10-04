import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import crypto from "crypto"

export const AUTHENTICATE = false

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = req.body as any
    const amountInCents = Number(body?.amount_in_cents) || 3500000
    const currency = (body?.currency || "COP").toUpperCase()
    const customerEmail = body?.customer_email || "cliente@ejemplo.com"
    const customerName = body?.customer_name || "Cliente Piano Colombia"
    const customerPhone = body?.customer_phone || ""
    const customerLegalId = body?.customer_legal_id || ""
    const customerLegalIdType = body?.customer_legal_id_type || "CC"
    const scoreSlug = body?.score_slug || "pasillo-colombiano-no-1"
    const scoreId = body?.score_id || ""

    // Generar referencia única de pedido
    const reference = body?.reference || `PC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`

    // Llaves y secretos Wompi
    const publicKey = process.env.WOMPI_PUBLIC_KEY || process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || "pub_test_Q5yDA9xoKdePzhSGeVe9KStXTIkoIOJR"
    const integritySecret = process.env.WOMPI_INTEGRITY_SECRET || "test_integrity_WompiPianoCol2026SecretKey"

    // Calcular firma de integridad SHA-256 según estándar de Wompi:
    // Cadena: <referencia><montoEnCentavos><moneda><secretoIntegridad>
    const integrityRaw = `${reference}${amountInCents}${currency}${integritySecret}`
    const signature = crypto.createHash("sha256").update(integrityRaw).digest("hex")

    console.log(`💳 [WOMPI SESSION] Sesión creada para ${customerEmail} - Ref: ${reference} - Monto: $${amountInCents / 100} ${currency}`)

    return res.status(200).json({
      success: true,
      reference,
      amount_in_cents: amountInCents,
      currency,
      public_key: publicKey,
      signature: {
        integrity: signature,
      },
      customer_data: {
        email: customerEmail,
        full_name: customerName,
        phone_number: customerPhone,
        legal_id: customerLegalId,
        legal_id_type: customerLegalIdType,
      },
      redirect_url: process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https://")
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/checkout?status=result&ref=${reference}`
        : undefined,
    })
  } catch (error: any) {
    console.error("❌ [WOMPI SESSION] Error generando sesión Wompi:", error)
    return res.status(500).json({
      success: false,
      message: "Error al generar sesión segura de Wompi",
      error: error.message,
    })
  }
}
