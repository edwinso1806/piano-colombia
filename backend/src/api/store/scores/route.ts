import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SCORE_MODULE } from "../../../modules/score"
import { COMPOSER_MODULE } from "../../../modules/composer"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const scoreModuleService = req.scope.resolve(SCORE_MODULE)
    const composerModuleService = req.scope.resolve(COMPOSER_MODULE)

    const { difficulty, genre, is_featured, limit = 50, offset = 0 } = req.query

    const filters: Record<string, any> = {
      status: "APPROVED",
    }
    if (difficulty) filters.difficulty = difficulty
    if (genre) filters.genre = genre
    if (is_featured !== undefined) filters.is_featured = is_featured === "true"

    const [scores, count] = await scoreModuleService.listAndCountScores(filters, {
      take: Number(limit),
      skip: Number(offset),
      order: { title: "ASC" },
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
    } = (req.body as any) || {}

    if (!title) {
      return res.status(400).json({
        message: "El título de la partitura es obligatorio",
      })
    }

    // Resolve or find composer
    let finalComposerId = composer_id
    if (!finalComposerId) {
      const [composers] = await composerModuleService.listAndCountComposers({}, { take: 1 })
      if (composers && composers.length > 0) {
        finalComposerId = composers[0].id
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
      pages_count: 8,
      tonality: tonality || "Mi menor",
      status: "IN_REVIEW" as any,
      is_featured: false,
      preview_pdf_url: `/preview-scores/${slug}.pdf`,
      original_pdf_url: `/master-scores/${slug}-master.pdf`,
    })

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
