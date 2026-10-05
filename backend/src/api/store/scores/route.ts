import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SCORE_MODULE } from "../../../modules/score"
import { COMPOSER_MODULE } from "../../../modules/composer"
import { getAdminAndModeratorEmailsFromDB } from "../../../lib/admin-recipient-service"
import { sendEmail, generateScoreSubmittedAdminNotificationHTML } from "../../../lib/resend-mailer"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const scoreModuleService = req.scope.resolve(SCORE_MODULE)
    const composerModuleService = req.scope.resolve(COMPOSER_MODULE)

    const { difficulty, genre, is_featured, limit = 50, offset = 0, composer_id, status } = req.query as Record<string, any>

    const filters: Record<string, any> = {}
    if (composer_id) {
      filters.composer_id = composer_id
      if (status && status !== "all") {
        filters.status = status
      }
    } else {
      filters.status = "APPROVED"
    }

    if (difficulty && difficulty !== "all") filters.difficulty = difficulty
    if (genre && genre !== "all") filters.genre = genre
    if (is_featured !== undefined) filters.is_featured = is_featured === "true"

    const [scores, count] = await scoreModuleService.listAndCountScores(filters, {
      take: Number(limit),
      skip: Number(offset),
      order: { created_at: "DESC" },
    })

    // Enriquecer con datos del compositor
    const composerIds = Array.from(new Set(scores.map((s: any) => s.composer_id)))
    const composers = await composerModuleService.listComposers({
      id: composerIds,
    })
    const composerMap = new Map(composers.map((c: any) => [c.id, c]))

    const enrichedScores = scores.map((s: any) => ({
      ...s,
      composer: composerMap.get(s.composer_id) || null,
    }))

    return res.status(200).json({
      scores: enrichedScores,
      count,
    })
  } catch (error: any) {
    return res.status(500).json({
      message: "Error fetching catalog scores",
      error: error.message,
    })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const scoreModuleService = req.scope.resolve(SCORE_MODULE)
    const composerModuleService = req.scope.resolve(COMPOSER_MODULE)

    const {
      title,
      composer_id,
      composer_name,
      genre = "Pasillo",
      difficulty = "INTERMEDIATE",
      price_cop = 45000,
      price_usd = 12,
      audio_preview_url,
      description,
      tonality,
      tags,
      pages_count,
      preview_images,
      preview_pdf_url,
      original_pdf_url,
    } = (req.body as any) || {}

    if (!title) {
      return res.status(400).json({
        message: "El título de la partitura es obligatorio",
      })
    }

    // Resolve or find composer
    let finalComposerId = composer_id
    let composerInfo: any = null

    if (finalComposerId) {
      const composers = await composerModuleService.listComposers({ id: finalComposerId }, { take: 1 })
      if (composers && composers.length > 0) {
        composerInfo = composers[0]
      }
    }

    if (!finalComposerId) {
      const [composers] = await composerModuleService.listAndCountComposers({}, { take: 1 })
      if (composers && composers.length > 0) {
        finalComposerId = composers[0].id
        composerInfo = composers[0]
      } else {
        finalComposerId = "comp_adolfo"
      }
    }

    const baseSlug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
    const slug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`

    const ismn = `979-0-901314-${Math.floor(10 + Math.random() * 90)}-${Math.floor(1 + Math.random() * 9)}`

    const newScore = await scoreModuleService.createScores({
      title,
      slug,
      composer_id: finalComposerId,
      genre: (genre || "PASILLO") as any,
      difficulty: (difficulty || "INTERMEDIO") as any,
      price_cop: Number(price_cop),
      price_usd: Number(price_usd),
      audio_sample_url: audio_preview_url || null,
      description_es: description || null,
      pages_count: Number(pages_count) || 4,
      tonality: tonality || "Mi menor",
      status: "IN_REVIEW" as any,
      is_featured: false,
      preview_images: (Array.isArray(preview_images) ? preview_images : []) as any,
      preview_pdf_url: preview_pdf_url || `/preview-scores/${slug}.pdf`,
      original_pdf_url: original_pdf_url || `/master-scores/${slug}-master.pdf`,
    })

    // Enviar notificación por correo a Administradores y Moderadores
    try {
      const adminRecipients = await getAdminAndModeratorEmailsFromDB(req)
      const composerDisplayName = composerInfo?.artistic_name || composerInfo?.full_name || composer_name || "Compositor PC"
      
      for (const admin of adminRecipients) {
        const html = generateScoreSubmittedAdminNotificationHTML({
          adminName: admin.name,
          composerName: composerInfo?.full_name || composerDisplayName,
          artisticName: composerDisplayName,
          scoreTitle: title,
          genre,
          difficulty,
          priceCop: Number(price_cop),
          adminDashboardUrl: "http://localhost:3000/admin/partituras",
        })

        await sendEmail({
          to: admin.email,
          subject: `🎼 Nueva Partitura en Revisión: "${title}" - Piano Colombia`,
          html,
        }).catch((err) => console.warn(`Error enviando correo de partitura a ${admin.email}:`, err.message))
      }
    } catch (emailErr: any) {
      console.warn("Error en despacho de notificaciones de partitura a administradores:", emailErr.message)
    }

    return res.status(201).json({
      success: true,
      message: "Partitura recibida exitosamente e ingresada a la mesa técnica de revisión.",
      score: newScore,
    })
  } catch (error: any) {
    return res.status(500).json({
      message: "Error al registrar la partitura en el catálogo",
      error: error.message,
    })
  }
}
