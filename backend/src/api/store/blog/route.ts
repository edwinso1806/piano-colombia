import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getActiveStoreBlogPosts, getBlogCategories } from "../../../lib/blog-service"

export const AUTHENTICATE = false

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const category = req.query.category as string | undefined
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined

    const [postsData, categories] = await Promise.all([
      getActiveStoreBlogPosts({ category, limit }),
      getBlogCategories(),
    ])

    return res.status(200).json({
      success: true,
      posts: postsData.posts,
      count: postsData.count,
      categories,
    })
  } catch (error: any) {
    console.error("[Store Blog API] Error en GET:", error)
    return res.status(500).json({
      success: false,
      message: "Error al consultar los artículos del blog",
      error: error.message,
    })
  }
}
