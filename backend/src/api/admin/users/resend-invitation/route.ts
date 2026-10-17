import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Client } from "pg"
import crypto from "crypto"
import { sendEmail, generateNewAdminUserInvitationHTML, extractLanguage, EMAIL_SUBJECTS } from "../../../../lib/resend-mailer"

export const AUTHENTICATE = false

function getPgClient() {
  return new Client({
    connectionString: process.env.DATABASE_URL || "postgres://postgres:Colombia-93@localhost:5432/piano_colombia_db"
  })
}

function isUserSuperAdmin(requestingRole?: string, requestingEmail?: string) {
  if (!requestingRole && !requestingEmail) return true
  const normalizedRole = (requestingRole || "").toLowerCase().trim()
  const normalizedEmail = (requestingEmail || "").toLowerCase().trim()

  return (
    normalizedRole === "admin" ||
    normalizedRole === "super_admin" ||
    normalizedEmail === "admin@pianocolombia.com" ||
    normalizedEmail === "carlos.admin@pianocolombia.com"
  )
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const client = getPgClient()
  try {
    const { userId, requesting_user_role, requesting_user_email } = (req.body as any) || {}

    // Validar RBAC
    if (!isUserSuperAdmin(requesting_user_role, requesting_user_email)) {
      return res.status(403).json({
        success: false,
        message: "Acceso Denegado: Únicamente el usuario Super Admin puede reenviar invitaciones.",
      })
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "El ID de usuario es requerido para reenviar la invitación.",
      })
    }

    await client.connect()
    const findRes = await client.query("SELECT * FROM admin_user WHERE id = $1 LIMIT 1;", [userId])
    if (findRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado.",
      })
    }

    const user = findRes.rows[0]
    const permissions = typeof user.permissions === "string" ? JSON.parse(user.permissions) : user.permissions
    const activationToken = crypto.randomBytes(24).toString("hex")

    const lang = extractLanguage(req)

    const emailRes = await sendEmail({
      to: user.email,
      subject: `${EMAIL_SUBJECTS.adminInvitation[lang]} (${lang === "en" ? "Resend" : "Reenvío"})`,
      html: generateNewAdminUserInvitationHTML({
        userName: user.name,
        userEmail: user.email,
        roleName: user.role_name || user.role_id,
        permissions: Array.isArray(permissions) ? permissions : [],
        createdByName: requesting_user_email || (lang === "en" ? "Super Administration PC" : "Super Administración PC"),
        activationToken,
        lang,
      }),
    })

    if (!emailRes.success) {
      return res.status(500).json({
        success: false,
        message: `No se pudo enviar el correo a ${user.email}: ${emailRes.error || "Error de SMTP/Resend"}`,
      })
    }

    // Actualizar último reenvío y guardar activation_token
    await client.query(`
      UPDATE admin_user 
      SET activation_token = $1, last_login = 'Invitación reenviada recientemente', updated_at = NOW() 
      WHERE id = $2;
    `, [activationToken, userId])

    return res.status(200).json({
      success: true,
      message: `¡Invitación reenviada exitosamente por correo electrónico a ${user.email}! (Por favor verificar la carpeta de Spam / Correo no deseado).`,
    })
  } catch (error: any) {
    console.error("❌ Error al reenviar invitación:", error)
    return res.status(500).json({
      success: false,
      message: "Error al reenviar la invitación.",
      error: error.message,
    })
  } finally {
    await client.end().catch(() => {})
  }
}
