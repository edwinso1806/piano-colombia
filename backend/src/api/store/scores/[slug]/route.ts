import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SCORE_MODULE } from "../../../../modules/score"
import { COMPOSER_MODULE } from "../../../../modules/composer"
import { getAdminAndModeratorEmailsFromDB } from "../../../../lib/admin-recipient-service"
import { sendEmail, generateScoreSubmittedAdminNotificationHTML } from "../../../../lib/resend-mailer"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const scoreModuleService = req.scope.resolve(SCORE_MODULE)
    const composerModuleService = req.scope.resolve(COMPOSER_MODULE)
    const { slug } = req.params

    let scores = await scoreModuleService.listScores({ slug }, { take: 1 })
    if (!scores || scores.length === 0) {
      // Intentar buscar por id
      scores = await scoreModuleService.listScores({ id: slug }, { take: 1 })
    }

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

export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  try {
    const scoreModuleService = req.scope.resolve(SCORE_MODULE)
    const composerModuleService = req.scope.resolve(COMPOSER_MODULE)
    const { slug } = req.params

    let scores = await scoreModuleService.listScores({ slug }, { take: 1 })
    if (!scores || scores.length === 0) {
      scores = await scoreModuleService.listScores({ id: slug }, { take: 1 })
    }

    if (!scores || scores.length === 0) {
      return res.status(404).json({ message: "Partitura no encontrada" })
    }

    const existing = scores[0]
    const body = (req.body as any) || {}

    const wasApproved = existing.status === "APPROVED"

    const updatePayload: Record<string, any> = {
      id: existing.id,
      status: "IN_REVIEW", // Inactivar inmediatamente si se edita para revisión técnica
      rejection_notes: null,
    }

    if (body.title) updatePayload.title = body.title
    if (body.genre) updatePayload.genre = body.genre
    if (body.difficulty) updatePayload.difficulty = body.difficulty
    if (body.price_cop !== undefined) updatePayload.price_cop = Number(body.price_cop)
    if (body.price_usd !== undefined) updatePayload.price_usd = Number(body.price_usd)
    if (body.audio_preview_url || body.audio_sample_url) {
      updatePayload.audio_sample_url = body.audio_preview_url || body.audio_sample_url
    }
    if (body.description || body.description_es) {
      updatePayload.description_es = body.description || body.description_es
    }
    if (body.tonality) updatePayload.tonality = body.tonality
    if (body.pages_count) updatePayload.pages_count = Number(body.pages_count)
    if (body.preview_images) updatePayload.preview_images = body.preview_images
    if (body.preview_pdf_url) updatePayload.preview_pdf_url = body.preview_pdf_url
    if (body.original_pdf_url) updatePayload.original_pdf_url = body.original_pdf_url

    const updatedScore = await scoreModuleService.updateScores(updatePayload)

    // Notificar a moderadores y administradores de la modificación
    try {
      let composerInfo: any = null
      if (existing.composer_id) {
        composerInfo = await composerModuleService.retrieveComposer(existing.composer_id).catch(() => null)
      }
      const adminRecipients = await getAdminAndModeratorEmailsFromDB(req)
      const composerDisplayName = composerInfo?.artistic_name || composerInfo?.full_name || "Compositor PC"

      for (const admin of adminRecipients) {
        const html = generateScoreSubmittedAdminNotificationHTML({
          adminName: admin.name,
          composerName: composerInfo?.full_name || composerDisplayName,
          artisticName: composerDisplayName,
          scoreTitle: updatePayload.title || existing.title,
          genre: updatePayload.genre || existing.genre,
          difficulty: updatePayload.difficulty || existing.difficulty,
          priceCop: updatePayload.price_cop || existing.price_cop,
          adminDashboardUrl: "http://localhost:3000/admin/partituras",
        })

        await sendEmail({
          to: admin.email,
          subject: `🎼 Partitura Modificada en Revisión: "${updatePayload.title || existing.title}" - Piano Colombia`,
          html,
        }).catch((err) => console.warn(`Error enviando notificación de partitura editada a ${admin.email}:`, err.message))
      }
    } catch (emailErr: any) {
      console.warn("Error enviando notificaciones de edición de partitura:", emailErr.message)
    }

    return res.status(200).json({
      success: true,
      message: wasApproved 
        ? "La partitura ha sido actualizada. Debido a los cambios, ha pasado a estado EN REVISIÓN y no será visible en la tienda hasta que sea aprobada nuevamente." 
        : "Partitura actualizada y enviada a revisión técnica.",
      score: updatedScore,
    })
  } catch (error: any) {
    return res.status(500).json({
      message: "Error updating score",
      error: error.message,
    })
  }
}

