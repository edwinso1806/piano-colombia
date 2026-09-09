import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SCORE_MODULE } from "../../../../../modules/score"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const scoreModuleService = req.scope.resolve(SCORE_MODULE)
    const { id } = req.params

    const updated = await scoreModuleService.updateScores({
      id,
      status: "APPROVED",
      rejection_notes: null,
    })

    return res.status(200).json({
      score: updated,
      message: "Partitura aprobada y publicada en el catálogo.",
    })
  } catch (error: any) {
    return res.status(500).json({
      message: "Error approving score",
      error: error.message,
    })
  }
}
