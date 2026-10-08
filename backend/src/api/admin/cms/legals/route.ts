import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getCmsLegalSettings, saveCmsLegalSettings } from "../../../../lib/cms-legals-service"

export const AUTHENTICATE = false

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const legals = await getCmsLegalSettings()
    return res.status(200).json({
      success: true,
      legals,
    })
  } catch (error: any) {
    console.error("[admin/cms/legals] Error GET:", error.message)
    return res.status(500).json({
      success: false,
      message: "Error consultando textos legales del CMS",
      error: error.message,
    })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = (req.body as any) || {}
    const legalsPayload = body.legals || body

    const updated = await saveCmsLegalSettings(legalsPayload)

    return res.status(200).json({
      success: true,
      message: "Textos legales actualizados exitosamente en la base de datos",
      legals: updated,
    })
  } catch (error: any) {
    console.error("[admin/cms/legals] Error POST:", error.message)
    return res.status(500).json({
      success: false,
      message: "Error guardando textos legales del CMS",
      error: error.message,
    })
  }
}

export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  return res.status(204).end()
}
