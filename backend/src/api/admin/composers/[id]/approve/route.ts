import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { COMPOSER_MODULE } from "../../../../../modules/composer"
import { Client } from "pg"
import { sendEmail, generateComposerApprovedHTML } from "../../../../../lib/resend-mailer"

function getPgClient() {
  return new Client({
    connectionString: process.env.DATABASE_URL || "postgres://postgres:Alex%242020@localhost:5432/piano_colombia_db"
  })
}

export const AUTHENTICATE = false

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const client = getPgClient()
  try {
    const composerModuleService = req.scope.resolve(COMPOSER_MODULE)
    const { id } = req.params

    const updated = await composerModuleService.updateComposers({
      id,
      status: "APPROVED",
      rejection_reason: null,
    })

    // Reactivar partituras que estaban en revisión por edición de perfil
    try {
      await client.connect()
      await client.query(
        "UPDATE score SET status = 'APPROVED' WHERE composer_id = $1 AND status = 'IN_REVIEW';",
        [id]
      )
      console.log(`✅ [SCORES REACTIVATED] Partituras del compositor ${id} reactivadas en la tienda tras aprobación.`)
    } catch (dbErr) {
      console.warn("⚠️ Error reactivando partituras al aprobar compositor:", dbErr)
    } finally {
      await client.end().catch(() => {})
    }

    // Enviar correo de felicitación y aprobación al compositor
    try {
      const composerData = await composerModuleService.retrieveComposer(id)
      if (composerData && composerData.email) {
        const composerFullName = `${composerData.first_name || ""} ${composerData.last_name || ""}`.trim()
        const artisticName = composerData.artistic_name || composerFullName

        await sendEmail({
          to: composerData.email,
          subject: "🎉 ¡Tu perfil de compositor ha sido aprobado en Piano Colombia!",
          html: generateComposerApprovedHTML({
            composerName: composerFullName,
            artisticName,
            loginUrl: "http://localhost:3000/compositor/login",
          }),
        })
        console.log(`📧 Correo de aprobación enviado exitosamente a ${composerData.email}`)
      }
    } catch (emailErr: any) {
      console.warn("⚠️ Error enviando correo de aprobación al compositor:", emailErr.message)
    }

    return res.status(200).json({
      composer: updated,
      message: "Compositor aprobado exitosamente y su catálogo ha sido reactivado en la tienda.",
    })
  } catch (error: any) {
    return res.status(500).json({
      message: "Error approving composer",
      error: error.message,
    })
  }
}
