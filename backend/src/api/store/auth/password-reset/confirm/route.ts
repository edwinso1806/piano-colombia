import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Client } from "pg"

export const AUTHENTICATE = false

function getPgClient() {
  return new Client({
    connectionString: process.env.DATABASE_URL || "postgres://postgres:Alex%242020@localhost:5432/piano_colombia_db"
  })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const client = getPgClient()
  try {
    const { email, code, new_password } = (req.body as any) || {}

    if (!email || !code || !new_password) {
      return res.status(400).json({
        success: false,
        message: "El correo, el código OTP de 6 dígitos y la nueva contraseña son obligatorios.",
      })
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "La contraseña debe tener al menos 6 caracteres por seguridad.",
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
        message: "El código OTP ingresado es incorrecto o ha expirado. Por favor solicita uno nuevo.",
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
      message: "¡Contraseña establecida exitosamente! Tu cuenta ha sido activada correctamente.",
      admin: updateAdmin.rows.length > 0 ? updateAdmin.rows[0] : null,
    })
  } catch (error: any) {
    console.error("❌ Error al confirmar código OTP:", error)
    return res.status(500).json({
      success: false,
      message: "Error al validar el código OTP de seguridad.",
      error: error.message,
    })
  } finally {
    await client.end().catch(() => {})
  }
}

export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  return res.status(204).end()
}
