import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getBlogPostBySlug } from "../../../../lib/blog-service"

export const AUTHENTICATE = false

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const slug = req.params.slug
    if (!slug) {
      return res.status(400).json({ success: false, message: "Slug no proporcionado" })
    }

    const post = await getBlogPostBySlug(slug, true)
    if (!post) {
      return res.status(404).json({ success: false, message: "Artículo no encontrado o inactivo" })
    }

    return res.status(200).json({
      success: true,
      post,
    })
  } catch (error: any) {
    console.error("[Store Blog Slug API] Error en GET:", error)
    return res.status(500).json({
      success: false,
      message: "Error al consultar el artículo",
      error: error.message,
    })
  }
}
