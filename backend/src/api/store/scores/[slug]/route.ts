import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SCORE_MODULE } from "../../../../modules/score"
import { COMPOSER_MODULE } from "../../../../modules/composer"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const scoreModuleService = req.scope.resolve(SCORE_MODULE)
    const composerModuleService = req.scope.resolve(COMPOSER_MODULE)
    const { slug } = req.params

    const scores = await scoreModuleService.listScores({ slug }, { take: 1 })

    if (!scores || scores.length === 0) {
      return res.status(404).json({ message: "Partitura no encontrada" })
    }

    const score = scores[0]
    let composer: any = null

    if (score.composer_id) {
      const composers = await composerModuleService.listComposers({ id: score.composer_id }, { take: 1 })
      composer = composers && composers.length > 0 ? composers[0] : null
    }

    return res.status(200).json({
      score: {
        ...score,
        composer,
      },
    })
  } catch (error: any) {
    return res.status(500).json({
      message: "Error fetching score details",
      error: error.message,
    })
  }
}
