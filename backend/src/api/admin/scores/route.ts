import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SCORE_MODULE } from "../../../modules/score"
import { COMPOSER_MODULE } from "../../../modules/composer"

export const AUTHENTICATE = false

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const scoreModuleService = req.scope.resolve(SCORE_MODULE)
    const composerModuleService = req.scope.resolve(COMPOSER_MODULE)
    const { status, limit = 50, offset = 0 } = req.query

    const filters: Record<string, any> = {}
    if (status) filters.status = status

    const [scores, count] = await scoreModuleService.listAndCountScores(filters, {
      take: Number(limit),
      skip: Number(offset),
      order: { created_at: "DESC" },
    })

    // Enriquecer con nombres de autores
    const composerIds = Array.from(new Set(scores.map((s: any) => s.composer_id)))
    const composers = await composerModuleService.listComposers({
      id: composerIds,
    })
    const composerMap = new Map(composers.map((c: any) => [c.id, c]))

    const enriched = scores.map((s: any) => ({
      ...s,
      composer: composerMap.get(s.composer_id) || null,
    }))

    return res.status(200).json({
      scores: enriched,
      count,
    })
  } catch (error: any) {
    return res.status(500).json({
      message: "Error fetching admin scores",
      error: error.message,
    })
  }
}
