import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { COMPOSER_MODULE } from "../../../../../modules/composer"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const composerModuleService = req.scope.resolve(COMPOSER_MODULE)
    const { id } = req.params

    const updated = await composerModuleService.updateComposers({
      id,
      status: "APPROVED",
      rejection_reason: null,
    })

    return res.status(200).json({
      composer: updated,
      message: "Compositor aprobado exitosamente.",
    })
  } catch (error: any) {
    return res.status(500).json({
      message: "Error approving composer",
      error: error.message,
    })
  }
}
