import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getCmsHomeCategories } from "../../../../lib/cms-categories-service"

export const AUTHENTICATE = false

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const result = await getCmsHomeCategories({ onlyActive: true })
    return res.status(200).json({
      success: true,
      categories: result.categories,
      total_active: result.active_categories_count,
    })
  } catch (error: any) {
    console.error("[store/cms/categories] Error:", error.message)
    return res.status(500).json({
      success: false,
      message: "Error al consultar las categorías del Home",
      error: error.message,
    })
  }
}

export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  return res.status(204).end()
}
