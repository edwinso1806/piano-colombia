import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { updateBlogPost, toggleBlogPostStatus, deleteBlogPost } from "../../../../lib/blog-service"

export const AUTHENTICATE = false

export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  try {
    const id = req.params.id
    const body = req.body as any

    if (!id) {
      return res.status(400).json({ success: false, message: "ID no proporcionado" })
    }

    const updated = await updateBlogPost(id, {
      title: body.title,
      title_en: body.title_en,
      slug: body.slug,
      category: body.category,
      category_en: body.category_en,
      author: body.author,
      published_at: body.published_at,
      read_time: body.read_time,
      cover_image: body.cover_image,
      excerpt: body.excerpt,
      excerpt_en: body.excerpt_en,
      content: body.content,
      content_en: body.content_en,
      is_active: body.is_active,
    })

    if (!updated) {
      return res.status(404).json({ success: false, message: "Artículo no encontrado" })
    }

    return res.status(200).json({
      success: true,
      message: "Artículo actualizado correctamente",
      post: updated,
    })
  } catch (error: any) {
    console.error("[Admin Blog ID API] Error en PUT:", error)
    return res.status(500).json({
      success: false,
      message: "Error al actualizar el artículo",
      error: error.message,
    })
  }
}

export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  try {
    const id = req.params.id
    const body = req.body as any

    if (!id || body.is_active === undefined) {
      return res.status(400).json({ success: false, message: "ID o estado is_active no proporcionado" })
    }

    const updated = await toggleBlogPostStatus(id, Boolean(body.is_active))
    if (!updated) {
      return res.status(404).json({ success: false, message: "Artículo no encontrado" })
    }

    return res.status(200).json({
      success: true,
      message: `Artículo ${updated.is_active ? "activado" : "desactivado"} correctamente`,
      post: updated,
    })
  } catch (error: any) {
    console.error("[Admin Blog ID API] Error en PATCH:", error)
    return res.status(500).json({
      success: false,
      message: "Error al cambiar el estado del artículo",
      error: error.message,
    })
  }
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  try {
    const id = req.params.id
    if (!id) {
      return res.status(400).json({ success: false, message: "ID no proporcionado" })
    }

    const deleted = await deleteBlogPost(id)
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Artículo no encontrado o ya eliminado" })
    }

    return res.status(200).json({
      success: true,
      message: "Artículo eliminado exitosamente",
    })
  } catch (error: any) {
    console.error("[Admin Blog ID API] Error en DELETE:", error)
    return res.status(500).json({
      success: false,
      message: "Error al eliminar el artículo",
      error: error.message,
    })
  }
}
