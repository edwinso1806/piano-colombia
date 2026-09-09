import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SCORE_MODULE } from "../../../../../modules/score"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const scoreModuleService = req.scope.resolve(SCORE_MODULE)
    const { id } = req.params
    const { reason } = req.body as { reason?: string }

    const updated = await scoreModuleService.updateScores({
      id,
      status: "REJECTED",
      rejection_notes: reason || "La partitura no cumple con los estándares editoriales urtext",
    })

    return res.status(200).json({
      score: updated,
      message: "Partitura rechazada.",
    })
  } catch (error: any) {
    return res.status(500).json({
      message: "Error rejecting score",
      error: error.message,
    })
  }
}
