import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getCmsWhatsAppSettings, saveCmsWhatsAppSettings } from "../../../../lib/cms-whatsapp-service"

export const AUTHENTICATE = false

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const whatsapp = await getCmsWhatsAppSettings()
    return res.status(200).json({
      success: true,
      whatsapp,
    })
  } catch (error: any) {
    console.error("[admin/cms/whatsapp] Error GET:", error.message)
    return res.status(500).json({
      success: false,
      message: "Error consultando configuración de WhatsApp del CMS",
      error: error.message,
    })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = (req.body as any) || {}
    const whatsappPayload = body.whatsapp || body

    const updated = await saveCmsWhatsAppSettings(whatsappPayload)

    return res.status(200).json({
      success: true,
      message: "Configuración de WhatsApp guardada exitosamente en la base de datos",
      whatsapp: updated,
    })
  } catch (error: any) {
    console.error("[admin/cms/whatsapp] Error POST:", error.message)
    return res.status(500).json({
      success: false,
      message: "Error guardando configuración de WhatsApp en BD",
      error: error.message,
    })
  }
}

export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  return res.status(204).end()
}
