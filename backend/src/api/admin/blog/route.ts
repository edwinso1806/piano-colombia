import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getAllAdminBlogPosts, createBlogPost } from "../../../lib/blog-service"

export const AUTHENTICATE = false

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const data = await getAllAdminBlogPosts()
    return res.status(200).json({
      success: true,
      posts: data.posts,
      total: data.total,
      categories: data.categories,
    })
  } catch (error: any) {
    console.error("[Admin Blog API] Error en GET:", error)
    return res.status(500).json({
      success: false,
      message: "Error al consultar los artículos administrativos",
      error: error.message,
    })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = req.body as any
    if (!body || !body.title || !body.content) {
      return res.status(400).json({
        success: false,
        message: "El título y el contenido son obligatorios.",
      })
    }

    const post = await createBlogPost({
      title: body.title,
      title_en: body.title_en,
      slug: body.slug,
      category: body.category || "Actualidad",
      category_en: body.category_en,
      author: body.author || "Equipo Piano Colombia",
      published_at: body.published_at,
      read_time: body.read_time,
      cover_image: body.cover_image,
      excerpt: body.excerpt,
      excerpt_en: body.excerpt_en,
      content: body.content,
      content_en: body.content_en,
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : true,
    })

    return res.status(201).json({
      success: true,
      message: "Artículo creado exitosamente",
      post,
    })
  } catch (error: any) {
    console.error("[Admin Blog API] Error en POST:", error)
    return res.status(500).json({
      success: false,
      message: "Error al crear el artículo",
      error: error.message,
    })
  }
}
