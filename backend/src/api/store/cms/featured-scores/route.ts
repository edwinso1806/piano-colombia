import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getCmsHomeFeaturedScores } from "../../../../lib/cms-scores-service"

export const AUTHENTICATE = false

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const result = await getCmsHomeFeaturedScores()
    return res.status(200).json({
      success: true,
      scores: result.scores,
      count: result.count,
      max_allowed: result.max_allowed,
    })
  } catch (error: any) {
    console.error("[store/cms/featured-scores] Error:", error.message)
    return res.status(500).json({
      success: false,
      message: "Error al consultar las partituras destacadas del Home",
      error: error.message,
    })
  }
}

export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  return res.status(204).end()
}
