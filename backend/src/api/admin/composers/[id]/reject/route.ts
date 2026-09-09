import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { COMPOSER_MODULE } from "../../../../../modules/composer"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const composerModuleService = req.scope.resolve(COMPOSER_MODULE)
    const { id } = req.params
    const { reason } = req.body as { reason?: string }

    const updated = await composerModuleService.updateComposers({
      id,
      status: "REJECTED",
      rejection_reason: reason || "No cumple con los requisitos del catálogo",
    })

    return res.status(200).json({
      composer: updated,
      message: "Solicitud de compositor rechazada.",
    })
  } catch (error: any) {
    return res.status(500).json({
      message: "Error rejecting composer",
      error: error.message,
    })
  }
}
