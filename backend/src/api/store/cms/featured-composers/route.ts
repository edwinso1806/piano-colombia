import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getCmsHomeFeaturedComposers } from "../../../../lib/cms-composers-service"

export const AUTHENTICATE = false

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const result = await getCmsHomeFeaturedComposers({ onlyActiveTabs: true })
    return res.status(200).json({
      success: true,
      tabs: result.tabs,
      all_composers: result.all_composers,
      active_tabs_count: result.active_tabs_count,
      total_composers: result.total_composers,
    })
  } catch (error: any) {
    console.error("[store/cms/featured-composers] Error:", error.message)
    return res.status(500).json({
      success: false,
      message: "Error al consultar los compositores destacados del Home",
      error: error.message,
    })
  }
}

export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  return res.status(204).end()
}
