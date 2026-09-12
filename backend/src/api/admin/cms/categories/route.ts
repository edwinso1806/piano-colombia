import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getCmsHomeCategories, saveCmsHomeCategories } from "../../../../lib/cms-categories-service"

export const AUTHENTICATE = false

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const result = await getCmsHomeCategories({ onlyActive: false })
    return res.status(200).json({
      success: true,
      categories: result.categories,
      total_categories: result.total_categories,
      active_categories_count: result.active_categories_count,
    })
  } catch (error: any) {
    console.error("[admin/cms/categories] Error GET:", error.message)
    return res.status(500).json({
      success: false,
      message: "Error consultando categorías CMS",
      error: error.message,
    })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = (req.body as any) || {}
    const categories = body.categories

    if (!Array.isArray(categories)) {
      return res.status(400).json({
        success: false,
        message: "Se requiere un arreglo 'categories'",
      })
    }

    const result = await saveCmsHomeCategories(categories)

    return res.status(200).json({
      success: true,
      message: "Categorías del Home actualizadas y sincronizadas con la base de datos",
      categories: result.categories,
    })
  } catch (error: any) {
    console.error("[admin/cms/categories] Error POST:", error.message)
    return res.status(500).json({
      success: false,
      message: "Error guardando categorías CMS",
      error: error.message,
    })
  }
}

export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  return res.status(204).end()
}
