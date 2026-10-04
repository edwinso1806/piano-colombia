import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  getCmsHomeFeaturedScores,
  saveCmsHomeFeaturedScores,
  getAllActiveApprovedScores,
} from "../../../../lib/cms-scores-service"

export const AUTHENTICATE = false

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const [featured, availableScores] = await Promise.all([
      getCmsHomeFeaturedScores(),
      getAllActiveApprovedScores(),
    ])

    return res.status(200).json({
      success: true,
      featured_scores: featured.scores,
      featured_score_ids: featured.scores.map((s) => s.id),
      count: featured.count,
      max_allowed: featured.max_allowed,
      available_scores: availableScores,
      total_available: availableScores.length,
    })
  } catch (error: any) {
    console.error("[admin/cms/featured-scores] Error GET:", error.message)
    return res.status(500).json({
      success: false,
      message: "Error consultando partituras destacadas CMS",
      error: error.message,
    })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = (req.body as any) || {}
    const scoreIds = body.score_ids

    if (!Array.isArray(scoreIds)) {
      return res.status(400).json({
        success: false,
        message: "Se requiere un arreglo 'score_ids'",
      })
    }

    if (scoreIds.length > 6) {
      return res.status(400).json({
        success: false,
        message: "Se permite un máximo de 6 partituras destacadas",
      })
    }

    const result = await saveCmsHomeFeaturedScores(scoreIds)

    return res.status(200).json({
      success: true,
      message: "Partituras destacadas actualizadas exitosamente en la base de datos.",
      scores: result.scores,
      count: result.count,
      max_allowed: result.max_allowed,
    })
  } catch (error: any) {
    console.error("[admin/cms/featured-scores] Error POST:", error.message)
    return res.status(500).json({
      success: false,
      message: "Error guardando partituras destacadas CMS",
      error: error.message,
    })
  }
}

export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  return res.status(204).end()
}
