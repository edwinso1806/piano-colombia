import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Client } from "pg"
import { extractLanguage } from "../../../../../lib/resend-mailer"

export const AUTHENTICATE = false

function getPgClient() {
  return new Client({
    connectionString: process.env.DATABASE_URL || "postgres://postgres:Colombia-93@localhost:5432/piano_colombia_db"
  })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const client = getPgClient()
  try {
    const { email, code, new_password } = (req.body as any) || {}
    const lang = extractLanguage(req)

    if (!email || !code || !new_password) {
      return res.status(400).json({
        success: false,
        message: lang === "en"
          ? "Email, 6-digit OTP code, and new password are required."
          : "El correo, el código OTP de 6 dígitos y la nueva contraseña son obligatorios.",
      })
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: lang === "en"
          ? "Password must be at least 6 characters long for security."
          : "La contraseña debe tener al menos 6 caracteres por seguridad.",
      })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const trimmedCode = code.trim()

    await client.connect()

    // Validar código OTP y vigencia en la tabla password_reset_otp
    const checkOtp = await client.query(`
      SELECT * FROM password_reset_otp 
      WHERE LOWER(email) = LOWER($1) AND code = $2 AND expires_at > NOW()
      ORDER BY created_at DESC LIMIT 1;
    `, [normalizedEmail, trimmedCode])

    if (checkOtp.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: lang === "en"
          ? "The OTP code entered is incorrect or has expired. Please request a new one."
          : "El código OTP ingresado es incorrecto o ha expirado. Por favor solicita uno nuevo.",
      })
    }

    // Actualizar usuario administrativo si existe en admin_user
    const updateAdmin = await client.query(`
      UPDATE admin_user
      SET last_login = 'Activo (Contraseña personal asignada)', updated_at = NOW()
      WHERE LOWER(email) = LOWER($1)
      RETURNING *;
    `, [normalizedEmail])

    // Borrar código OTP utilizado
    await client.query("DELETE FROM password_reset_otp WHERE LOWER(email) = LOWER($1);", [normalizedEmail])

    console.log(`✅ [OTP RESET] Contraseña asignada exitosamente para ${normalizedEmail}`)

    return res.status(200).json({
      success: true,
      message: lang === "en"
        ? "Password successfully set! Your account has been updated."
        : "¡Contraseña establecida exitosamente! Tu cuenta ha sido activada correctamente.",
      admin: updateAdmin.rows.length > 0 ? updateAdmin.rows[0] : null,
    })
  } catch (error: any) {
    const lang = extractLanguage(req)
    console.error("❌ Error al confirmar código OTP:", error)
    return res.status(500).json({
      success: false,
      message: lang === "en" ? "Error validating security OTP code." : "Error al validar el código OTP de seguridad.",
      error: error.message,
    })
  } finally {
    await client.end().catch(() => {})
  }
}

export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  return res.status(204).end()
}
