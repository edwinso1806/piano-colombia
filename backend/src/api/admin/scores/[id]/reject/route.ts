import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SCORE_MODULE } from "../../../../../modules/score"
import { COMPOSER_MODULE } from "../../../../../modules/composer"
import { Client } from "pg"
import {
  sendEmail,
  generateScoreRejectedHTML,
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
  const { reason } = (req.body as { reason?: string }) || {}
  const rejectionNotes =
    reason?.trim() ||
    "La partitura no cumple con los estándares editoriales urtext requeridos o requiere ajustes en la edición."

  let existingScore: any = null
  let composerData: any = null
  let updatedScore: any = null
  let emailDispatched = false
  let recipientEmail = ""

  // 1. Obtener partitura y datos del compositor (con fallback directo PostgreSQL)
  try {
    const scoreModuleService = req.scope.resolve(SCORE_MODULE)
    existingScore = await scoreModuleService.retrieveScore(id).catch(() => null)
  } catch (err: any) {
    console.warn("⚠️ [REJECT SCORE] retrieveScore omitido, buscando por DB:", err.message)
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
    console.warn("⚠️ [REJECT SCORE] Error en consulta SQL auxiliar:", dbErr.message)
  } finally {
    await client.end().catch(() => {})
  }

  // Si aún no tenemos composerData, intentar vía módulo Medusa
  if (!composerData && existingScore?.composer_id) {
    try {
      const composerModuleService = req.scope.resolve(COMPOSER_MODULE)
      composerData = await composerModuleService
        .retrieveComposer(existingScore.composer_id)
        .catch(() => null)
    } catch (modErr: any) {
      console.warn("⚠️ [REJECT SCORE] Error en composerModuleService:", modErr.message)
    }
  }

  // 2. Actualizar estado de la partitura a REJECTED con las notas
  try {
    const scoreModuleService = req.scope.resolve(SCORE_MODULE)
    updatedScore = await scoreModuleService.updateScores({
      id: existingScore.id,
      status: "REJECTED",
      rejection_notes: rejectionNotes,
    })
  } catch (updateErr: any) {
    console.warn("⚠️ [REJECT SCORE] updateScores falló, ejecutando UPDATE directo en PostgreSQL:", updateErr.message)
    const updateClient = getPgClient()
    try {
      await updateClient.connect()
      const uRes = await updateClient.query(
        "UPDATE score SET status = 'REJECTED', rejection_notes = $1, updated_at = NOW() WHERE id = $2 RETURNING *;",
        [rejectionNotes, existingScore.id]
      )
      updatedScore = uRes.rows[0] || existingScore
    } catch (sqlErr: any) {
      console.error("❌ [REJECT SCORE] Error crítico al actualizar partitura en BD:", sqlErr.message)
      return res.status(500).json({
        success: false,
        message: "No fue posible actualizar el estado de la partitura en la base de datos.",
        error: sqlErr.message,
      })
    } finally {
      await updateClient.end().catch(() => {})
    }
  }

  // 3. Enviar correo transaccional con observaciones al compositor
  if (composerData && composerData.email) {
    recipientEmail = composerData.email.trim()
    const composerFullName = `${composerData.first_name || ""} ${composerData.last_name || ""}`.trim()
    const artisticName = composerData.artistic_name || composerFullName || "Estimado(a) Compositor(a)"
    const composerLang = composerData.preferred_language === "en" ? "en" : "es"

    try {
      const html = generateScoreRejectedHTML({
        composerName: composerFullName || artisticName,
        artisticName,
        scoreTitle: existingScore.title,
        observations: rejectionNotes,
        dashboardUrl: `${STOREFRONT_URL}/compositor/dashboard/partituras`,
        lang: composerLang,
      })

      const sendRes = await sendEmail({
        to: recipientEmail,
        bcc: [process.env.SUPPORT_EMAIL || "soporte@pianocolombia.com", "edwin.soto@globalbit.co"],
        subject: EMAIL_SUBJECTS.scoreRejected[composerLang](existingScore.title),
        html,
      })

      emailDispatched = !!sendRes?.success
      console.log(`📧 [SCORE REJECTED] Notificación de rechazo despachada a ${recipientEmail} (Resultado: ${emailDispatched ? "Éxito" : "Fallo"})`)
    } catch (emailErr: any) {
      console.error(`❌ [SCORE REJECTED] Error enviando correo de rechazo a ${recipientEmail}:`, emailErr.message)
    }
  } else {
    console.warn(`⚠️ [SCORE REJECTED] La partitura "${existingScore.title}" no tiene correo de compositor asociado. Se omite envío al autor.`)
  }

  return res.status(200).json({
    success: true,
    score: updatedScore || existingScore,
    email_sent: emailDispatched,
    recipient: recipientEmail || null,
    message: emailDispatched
      ? `Partitura rechazada y observaciones enviadas exitosamente al autor (${recipientEmail}).`
      : "Partitura rechazada y registrada en el sistema.",
  })
}

