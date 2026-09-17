import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  getCmsHomeFeaturedComposers,
  saveCmsHomeFeaturedComposers,
  getAllActiveApprovedComposers,
} from "../../../../lib/cms-composers-service"

export const AUTHENTICATE = false

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const [result, activeComposers] = await Promise.all([
      getCmsHomeFeaturedComposers({ onlyActiveTabs: false }),
      getAllActiveApprovedComposers(),
    ])

    return res.status(200).json({
      success: true,
      tabs: result.tabs,
      all_composers: result.all_composers,
      active_composers_directory: activeComposers,
      total_active_composers: activeComposers.length,
    })
  } catch (error: any) {
    console.error("[admin/cms/featured-composers] Error GET:", error.message)
    return res.status(500).json({
      success: false,
      message: "Error consultando compositores destacados CMS",
      error: error.message,
    })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = (req.body as any) || {}
    const tabs = body.tabs

    if (!Array.isArray(tabs)) {
      return res.status(400).json({
        success: false,
        message: "Se requiere un arreglo 'tabs'",
      })
    }

    const result = await saveCmsHomeFeaturedComposers(tabs)

    return res.status(200).json({
      success: true,
      message: "Configuración de compositores destacados actualizada exitosamente en la base de datos.",
      tabs: result.tabs,
      all_composers: result.all_composers,
    })
  } catch (error: any) {
    console.error("[admin/cms/featured-composers] Error POST:", error.message)
    return res.status(500).json({
      success: false,
      message: "Error guardando compositores destacados CMS",
      error: error.message,
    })
  }
}

export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  return res.status(204).end()
}
