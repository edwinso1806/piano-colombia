import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SCORE_MODULE } from "../../../../../modules/score"
import { COMPOSER_MODULE } from "../../../../../modules/composer"
import { sendEmail, generateScoreApprovedHTML, EMAIL_SUBJECTS } from "../../../../../lib/resend-mailer"

export const AUTHENTICATE = false

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const scoreModuleService = req.scope.resolve(SCORE_MODULE)
    const composerModuleService = req.scope.resolve(COMPOSER_MODULE)
    const { id } = req.params

    const existingScore = await scoreModuleService.retrieveScore(id)
    if (!existingScore) {
      return res.status(404).json({ message: "Partitura no encontrada" })
    }

    const updated = await scoreModuleService.updateScores({
      id,
      status: "APPROVED",
      rejection_notes: null,
    })

    // Enviar correo de felicitación y confirmación al compositor
    try {
      if (existingScore.composer_id) {
        const composer: any = await composerModuleService.retrieveComposer(existingScore.composer_id).catch(() => null)
        if (composer && composer.email) {
          const composerLang = composer.preferred_language === "en" ? "en" : "es"
          const html = generateScoreApprovedHTML({
            composerName: composer.full_name || composer.artistic_name || "Estimado Compositor",
            artisticName: composer.artistic_name || composer.full_name,
            scoreTitle: existingScore.title,
            storeUrl: `http://localhost:3000/partitura/${existingScore.slug}`,
            lang: composerLang,
          })

          await sendEmail({
            to: composer.email,
            subject: EMAIL_SUBJECTS.scoreApproved[composerLang](existingScore.title),
            html,
          }).catch((err) => console.warn(`Error enviando correo de aprobación al compositor ${composer.email}:`, err.message))
        }
      }
    } catch (emailErr: any) {
      console.warn("Error enviando correo de aprobación de partitura:", emailErr.message)
    }

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

