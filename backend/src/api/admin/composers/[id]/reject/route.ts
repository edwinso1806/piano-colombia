import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { COMPOSER_MODULE } from "../../../../../modules/composer"
import { Client } from "pg"
import {
  sendEmail,
  generateComposerRejectedHTML,
  generateComposerBlockedHTML,
  EMAIL_SUBJECTS,
} from "../../../../../lib/resend-mailer"

function getPgClient() {
  return new Client({
    connectionString: process.env.DATABASE_URL || "postgres://postgres:Colombia-93@localhost:5432/piano_colombia_db"
  })
}

export const AUTHENTICATE = false

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const client = getPgClient()
  try {
    const composerModuleService = req.scope.resolve(COMPOSER_MODULE)
    const { id } = req.params
    const { reason, is_permanent_block } = (req.body as { reason?: string; is_permanent_block?: boolean }) || {}

    const newStatus = is_permanent_block ? "BLOCKED" : "REJECTED"
    const rejectionReason = reason?.trim() || (is_permanent_block 
      ? "Solicitud no aceptada de forma definitiva en Piano Colombia." 
      : "Se requiere ajustar la información biográfica, fotografía o datos bancarios.")

    const updated = await composerModuleService.updateComposers({
      id,
      status: newStatus,
      rejection_reason: rejectionReason,
    })

    // Si es bloqueo definitivo o rechazo, desactivar cualquier partitura que esté pública
    try {
      await client.connect()
      await client.query(
        "UPDATE score SET status = 'IN_REVIEW' WHERE composer_id = $1 AND status = 'APPROVED';",
        [id]
      )
      console.log(`🔒 Partituras del compositor ${id} inactivadas tras cambio de estado a ${newStatus}.`)
    } catch (dbErr: any) {
      console.warn("⚠️ Error actualizando estado de partituras en BD:", dbErr.message)
    } finally {
      await client.end().catch(() => {})
    }

    // Notificar al compositor por correo electrónico
    try {
      const composerData = await composerModuleService.retrieveComposer(id)
      if (composerData && composerData.email) {
        const composerFullName = `${composerData.first_name || ""} ${composerData.last_name || ""}`.trim()
        const artisticName = composerData.artistic_name || composerFullName
        const composerLang = (composerData as any).preferred_language === "en" ? "en" : "es"

        if (is_permanent_block) {
          await sendEmail({
            to: composerData.email,
            subject: EMAIL_SUBJECTS.composerBlocked[composerLang],
            html: generateComposerBlockedHTML({
              composerName: composerFullName,
              artisticName,
              reason: rejectionReason,
              lang: composerLang,
            }),
          })
          console.log(`📧 Correo de bloqueo definitivo enviado a ${composerData.email} (Idioma: ${composerLang})`)
        } else {
          await sendEmail({
            to: composerData.email,
            subject: EMAIL_SUBJECTS.composerRejected[composerLang],
            html: generateComposerRejectedHTML({
              composerName: composerFullName,
              artisticName,
              observations: rejectionReason,
              dashboardUrl: "http://localhost:3000/compositor/dashboard/perfil",
              lang: composerLang,
            }),
          })
          console.log(`📧 Correo con observaciones de rechazo enviado a ${composerData.email} (Idioma: ${composerLang})`)
        }
      }
    } catch (emailErr: any) {
      console.warn("⚠️ Error enviando correo al compositor:", emailErr.message)
    }

    return res.status(200).json({
      composer: updated,
      is_permanent_block: !!is_permanent_block,
      message: is_permanent_block 
        ? "Compositor bloqueado definitivamente. Se le ha notificado por correo electrónico."
        : "Sugerencias y observaciones enviadas al compositor exitosamente. Se ha habilitado su botón para volver a enviar a revisión.",
    })
  } catch (error: any) {
    return res.status(500).json({
      message: "Error rejecting composer",
      error: error.message,
    })
  }
}
