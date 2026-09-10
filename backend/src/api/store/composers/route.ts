import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { COMPOSER_MODULE } from "../../../modules/composer"
import { SCORE_MODULE } from "../../../modules/score"
import { hashPassword } from "../../../lib/auth-security"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const composerModuleService = req.scope.resolve(COMPOSER_MODULE)
    const scoreModuleService = req.scope.resolve(SCORE_MODULE)
    const { is_featured } = req.query

    // Requisito estricto de tienda: El compositor SOLO debe aparecer en la tienda cuando tenga mínimo una partitura aprobada
    const approvedScores = await scoreModuleService.listScores({ status: "APPROVED" })

    const approvedScoresCountMap = new Map<string, number>()
    for (const score of approvedScores) {
      if (score.composer_id) {
        approvedScoresCountMap.set(score.composer_id, (approvedScoresCountMap.get(score.composer_id) || 0) + 1)
      }
    }

    const eligibleComposerIds = Array.from(approvedScoresCountMap.keys())

    if (eligibleComposerIds.length === 0) {
      return res.status(200).json({
        composers: [],
        count: 0,
      })
    }

    const filters: Record<string, any> = {
      status: "APPROVED",
      id: eligibleComposerIds,
    }
    if (is_featured !== undefined) filters.is_featured = is_featured === "true"

    const [composers, count] = await composerModuleService.listAndCountComposers(filters, {
      relations: ["bank_account"],
      order: { first_name: "ASC" },
    })

    const enrichedComposers = composers.map((c: any) => ({
      ...c,
      scoreCount: approvedScoresCountMap.get(c.id) || 0,
      approved_scores_count: approvedScoresCountMap.get(c.id) || 0,
    }))

    return res.status(200).json({
      composers: enrichedComposers,
      count,
    })
  } catch (error: any) {
    return res.status(500).json({
      message: "Error fetching composers",
      error: error.message,
    })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const composerModuleService = req.scope.resolve(COMPOSER_MODULE)
    const body = req.body as any

    if (!body.email || !body.first_name) {
      return res.status(400).json({
        message: "El nombre y el correo electrónico son obligatorios",
      })
    }

    const normalizedEmail = body.email.trim().toLowerCase()
    const docNumber = body.bank_account?.document_number?.trim()

    // 1. Validar si ya existe un compositor con el mismo correo electrónico
    const [existingComposers] = await composerModuleService.listAndCountComposers({
      email: normalizedEmail,
    })

    if (existingComposers && existingComposers.length > 0) {
      return res.status(400).json({
        message: `Ya existe un perfil de compositor registrado con el correo electrónico ${normalizedEmail}. Por favor inicia sesión o utiliza otro correo.`,
      })
    }

    // 2. Validar si ya existe un compositor con el mismo número de documento
    if (docNumber) {
      const [existingAccounts] = await composerModuleService.listAndCountComposerBankAccounts({
        document_number: docNumber,
      })

      if (existingAccounts && existingAccounts.length > 0) {
        return res.status(400).json({
          message: `Ya existe una solicitud de compositor registrada con el número de documento ${docNumber}.`,
        })
      }
    }

    let password_hash: string | undefined = undefined
    let salt: string | undefined = undefined
    if (body.password) {
      const security = hashPassword(body.password)
      password_hash = security.hash
      salt = security.salt
    }

    const baseSlug = `${body.first_name}-${body.last_name || ""}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`

    const composer = await composerModuleService.createComposers({
      first_name: body.first_name,
      last_name: body.last_name || "",
      artistic_name: body.artistic_name || `${body.first_name} ${body.last_name || ""}`.trim(),
      slug: body.slug || uniqueSlug,
      bio_es: body.bio_es || null,
      bio_en: body.bio_en || null,
      region: body.region || null,
      era: body.era || null,
      email: normalizedEmail,
      phone: body.phone || null,
      photo_url: body.photo_url || null,
      password_hash: password_hash || null,
      salt: salt || null,
      status: "PENDING_APPROVAL",
    })

    if (body.bank_account) {
      await composerModuleService.createComposerBankAccounts({
        ...body.bank_account,
        composer_id: composer.id,
      })
    }

    return res.status(201).json({
      composer,
      message: "Solicitud de compositor registrada exitosamente (Pendiente de Aprobación)",
    })
  } catch (error: any) {
    console.error("❌ Error creando solicitud de compositor:", error)
    return res.status(500).json({
      message: error.message || "Error al procesar la solicitud de registro de compositor",
    })
  }
}
