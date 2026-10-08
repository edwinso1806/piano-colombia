import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getCmsWhatsAppSettings } from "../../../../lib/cms-whatsapp-service"

export const AUTHENTICATE = false

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const whatsapp = await getCmsWhatsAppSettings()
    return res.status(200).json({
      success: true,
      whatsapp,
    })
  } catch (error: any) {
    console.error("[store/cms/whatsapp] Error GET:", error.message)
    return res.status(500).json({
      success: false,
      message: "Error consultando configuración de WhatsApp de la plataforma",
      error: error.message,
    })
  }
}

export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  return res.status(204).end()
}
