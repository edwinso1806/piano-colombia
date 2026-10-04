import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getBlogCategories, createBlogCategory, deleteBlogCategory } from "../../../../lib/blog-service"

export const AUTHENTICATE = false

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const categories = await getBlogCategories()
    return res.status(200).json({ success: true, categories })
  } catch (error: any) {
    console.error("[Admin Blog Categories API] Error en GET:", error)
    return res.status(500).json({ success: false, message: "Error al consultar categorías", error: error.message })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = req.body as any
    if (!body || !body.name || !body.name.trim()) {
      return res.status(400).json({ success: false, message: "El nombre de la categoría es obligatorio." })
    }

    const category = await createBlogCategory(body.name)
    return res.status(201).json({
      success: true,
      message: "Categoría creada exitosamente",
      category,
    })
  } catch (error: any) {
    console.error("[Admin Blog Categories API] Error en POST:", error)
    return res.status(500).json({ success: false, message: "Error al crear categoría", error: error.message })
  }
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  try {
    const id = req.query.id as string || (req.body as any)?.id
    if (!id) {
      return res.status(400).json({ success: false, message: "ID de categoría no especificado" })
    }

    const deleted = await deleteBlogCategory(id)
    return res.status(200).json({
      success: true,
      message: deleted ? "Categoría eliminada" : "Categoría no encontrada",
    })
  } catch (error: any) {
    console.error("[Admin Blog Categories API] Error en DELETE:", error)
    return res.status(500).json({ success: false, message: "Error al eliminar categoría", error: error.message })
  }
}
