import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SCORE_MODULE } from "../../../../../modules/score"
import { COMPOSER_MODULE } from "../../../../../modules/composer"
import { Client } from "pg"
import {
  sendEmail,
  generateScoreApprovedHTML,
  EMAIL_SUBJECTS,
  STOREFRONT_URL,
} from "../../../../../lib/resend-mailer"

export const AUTHENTICATE = false

function getPgClient() {
  return new Client({
    connectionString:
      process.env.DATABASE_URL ||
      "postgres://postgres:Colombia-93@localhost:5432/piano_colombia_db",
  })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params

  let existingScore: any = null
  let composerData: any = null
  let updatedScore: any = null
  let emailDispatched = false
  let recipientEmail = ""

  // 1. Obtener partitura y datos del autor con fallback a PostgreSQL
  try {
    const scoreModuleService = req.scope.resolve(SCORE_MODULE)
    existingScore = await scoreModuleService.retrieveScore(id).catch(() => null)
  } catch (err: any) {
    console.warn("⚠️ [APPROVE SCORE] retrieveScore omitido, buscando por DB:", err.message)
  }

  const client = getPgClient()
  try {
    await client.connect()

    if (!existingScore) {
      const sRes = await client.query(
        "SELECT * FROM score WHERE id = $1 OR slug = $1 LIMIT 1;",
        [id]
      )
      if (sRes.rows.length > 0) {
        existingScore = sRes.rows[0]
      }
    }

    if (!existingScore) {
      await client.end().catch(() => {})
      return res.status(404).json({
        success: false,
        message: `Partitura con identificador "${id}" no encontrada.`,
      })
    }

    // Buscar información del compositor en la base de datos
    if (existingScore.composer_id) {
      const cRes = await client.query(
        "SELECT id, first_name, last_name, artistic_name, email, preferred_language FROM composer WHERE id = $1 LIMIT 1;",
        [existingScore.composer_id]
      )
      if (cRes.rows.length > 0) {
        composerData = cRes.rows[0]
      }
    }

    if (!composerData) {
      const cByScoreRes = await client.query(
        `SELECT c.id, c.first_name, c.last_name, c.artistic_name, c.email, c.preferred_language
         FROM score s
         JOIN composer c ON s.composer_id = c.id
         WHERE s.id = $1 OR s.slug = $1
         LIMIT 1;`,
        [id]
      )
      if (cByScoreRes.rows.length > 0) {
        composerData = cByScoreRes.rows[0]
      }
    }
  } catch (dbErr: any) {
    console.warn("⚠️ [APPROVE SCORE] Error en consulta SQL auxiliar:", dbErr.message)
  } finally {
    await client.end().catch(() => {})
  }

  if (!composerData && existingScore?.composer_id) {
    try {
      const composerModuleService = req.scope.resolve(COMPOSER_MODULE)
      composerData = await composerModuleService
        .retrieveComposer(existingScore.composer_id)
        .catch(() => null)
    } catch (modErr: any) {
      console.warn("⚠️ [APPROVE SCORE] Error en composerModuleService:", modErr.message)
    }
  }

  // 2. Actualizar estado a APPROVED y limpiar notas de rechazo
  try {
    const scoreModuleService = req.scope.resolve(SCORE_MODULE)
    updatedScore = await scoreModuleService.updateScores({
      id: existingScore.id,
      status: "APPROVED",
      rejection_notes: null,
    })
  } catch (updateErr: any) {
    console.warn("⚠️ [APPROVE SCORE] updateScores falló, ejecutando UPDATE directo en PostgreSQL:", updateErr.message)
    const updateClient = getPgClient()
    try {
      await updateClient.connect()
      const uRes = await updateClient.query(
        "UPDATE score SET status = 'APPROVED', rejection_notes = NULL, updated_at = NOW() WHERE id = $1 RETURNING *;",
        [existingScore.id]
      )
      updatedScore = uRes.rows[0] || existingScore
    } catch (sqlErr: any) {
      console.error("❌ [APPROVE SCORE] Error crítico al actualizar partitura en BD:", sqlErr.message)
      return res.status(500).json({
        success: false,
        message: "No fue posible actualizar el estado de aprobación en la base de datos.",
        error: sqlErr.message,
      })
    } finally {
      await updateClient.end().catch(() => {})
    }
  }

  // 3. Enviar correo de felicitación y confirmación al compositor
  if (composerData && composerData.email) {
    recipientEmail = composerData.email.trim()
    const composerFullName = `${composerData.first_name || ""} ${composerData.last_name || ""}`.trim()
    const artisticName = composerData.artistic_name || composerFullName || "Estimado(a) Maestro(a)"
    const composerLang = composerData.preferred_language === "en" ? "en" : "es"

    try {
      const html = generateScoreApprovedHTML({
        composerName: composerFullName || artisticName,
        artisticName,
        scoreTitle: existingScore.title,
        storeUrl: `${STOREFRONT_URL}/partitura/${existingScore.slug}`,
        lang: composerLang,
      })

      const sendRes = await sendEmail({
        to: recipientEmail,
        bcc: [process.env.SUPPORT_EMAIL || "soporte@pianocolombia.com", "edwin.soto@globalbit.co"],
        subject: EMAIL_SUBJECTS.scoreApproved[composerLang](existingScore.title),
        html,
      })

      emailDispatched = !!sendRes?.success
      console.log(`📧 [SCORE APPROVED] Notificación de aprobación despachada a ${recipientEmail} (Resultado: ${emailDispatched ? "Éxito" : "Fallo"})`)
    } catch (emailErr: any) {
      console.error(`❌ [SCORE APPROVED] Error enviando correo de aprobación a ${recipientEmail}:`, emailErr.message)
    }
  } else {
    console.warn(`⚠️ [SCORE APPROVED] La partitura "${existingScore.title}" no tiene correo de compositor asociado.`)
  }

  return res.status(200).json({
    success: true,
    score: updatedScore || existingScore,
    email_sent: emailDispatched,
    recipient: recipientEmail || null,
    message: emailDispatched
      ? `Partitura aprobada y publicada. Se notificó al autor (${recipientEmail}).`
      : "Partitura aprobada y publicada en el catálogo.",
  })
}

