import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SCORE_MODULE } from "../../../../../modules/score"
import { COMPOSER_MODULE } from "../../../../../modules/composer"
import { sendEmail, generateScoreRejectedHTML } from "../../../../../lib/resend-mailer"

export const AUTHENTICATE = false

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const scoreModuleService = req.scope.resolve(SCORE_MODULE)
    const composerModuleService = req.scope.resolve(COMPOSER_MODULE)
    const { id } = req.params
    const { reason } = (req.body as { reason?: string }) || {}

    const existingScore = await scoreModuleService.retrieveScore(id)
    if (!existingScore) {
      return res.status(404).json({ message: "Partitura no encontrada" })
    }

    const rejectionNotes = reason || "La partitura no cumple con los estándares editoriales urtext requeridos."

    const updated = await scoreModuleService.updateScores({
      id,
      status: "REJECTED",
      rejection_notes: rejectionNotes,
    })

    // Enviar correo con observaciones al compositor
    try {
      if (existingScore.composer_id) {
        const composer: any = await composerModuleService.retrieveComposer(existingScore.composer_id).catch(() => null)
        if (composer && composer.email) {
          const html = generateScoreRejectedHTML({
            composerName: composer.full_name || composer.artistic_name || "Estimado Compositor",
            artisticName: composer.artistic_name || composer.full_name,
            scoreTitle: existingScore.title,
            observations: rejectionNotes,
            dashboardUrl: "http://localhost:3000/compositor/dashboard/partituras",
          })

          await sendEmail({
            to: composer.email,
            subject: `⚠️ Observaciones de Revisión en tu Partitura "${existingScore.title}" - Piano Colombia`,
            html,
          }).catch((err) => console.warn(`Error enviando correo de rechazo al compositor ${composer.email}:`, err.message))
        }
      }
    } catch (emailErr: any) {
      console.warn("Error enviando correo de rechazo de partitura:", emailErr.message)
    }

    return res.status(200).json({
      score: updated,
      message: "Partitura rechazada y observaciones enviadas al autor.",
    })
  } catch (error: any) {
    return res.status(500).json({
      message: "Error rejecting score",
      error: error.message,
    })
  }
}

