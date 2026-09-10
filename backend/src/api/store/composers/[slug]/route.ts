import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { COMPOSER_MODULE } from "../../../../modules/composer"
import { SCORE_MODULE } from "../../../../modules/score"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const composerModuleService = req.scope.resolve(COMPOSER_MODULE)
    const scoreModuleService = req.scope.resolve(SCORE_MODULE)
    const { slug } = req.params

    const composers = await composerModuleService.listComposers({ slug }, {
      take: 1,
    })

    if (!composers || composers.length === 0) {
      return res.status(404).json({ message: "Compositor no encontrado" })
    }

    const composer = composers[0]

    // Validar estado del compositor
    if (composer.status !== "APPROVED") {
      return res.status(404).json({ message: "Compositor no disponible en la tienda pública" })
    }

    // Obtener partituras publicadas del compositor
    const scores = await scoreModuleService.listScores({
      composer_id: composer.id,
      status: "APPROVED",
    })

    // Requisito estricto: Debe tener mínimo una partitura aprobada para aparecer en la tienda
    if (!scores || scores.length === 0) {
      return res.status(404).json({ message: "El compositor aún no cuenta con partituras publicadas y aprobadas en el catálogo público" })
    }

    return res.status(200).json({
      composer: {
        ...composer,
        scores,
        scoreCount: scores.length,
      },
    })
  } catch (error: any) {
    return res.status(500).json({
      message: "Error fetching composer details",
      error: error.message,
    })
  }
}
