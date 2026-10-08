import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Client } from "pg"
import { generateSessionToken, hashPassword } from "../../../../lib/auth-security"
import { extractLanguage } from "../../../../lib/resend-mailer"

export const AUTHENTICATE = false

function getPgClient() {
  return new Client({
    connectionString: process.env.DATABASE_URL || "postgres://postgres:Alex%242020@localhost:5432/piano_colombia_db"
  })
}

function mapRoleToAuthRole(roleId?: string): "admin" | "editor" | "moderator" | "payouts" {
  switch (roleId) {
    case "super_admin":
    case "admin":
      return "admin"
    case "moderador":
    case "moderator":
      return "moderator"
    case "tesorero":
    case "payouts":
      return "payouts"
    case "editor_cms":
    case "editor":
    default:
      return "editor"
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const client = getPgClient()
  try {
    const { email, code, new_password, token } = (req.body as any) || {}
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

    await client.query(`
      DO $$ 
      BEGIN
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admin_user') THEN
          ALTER TABLE admin_user ADD COLUMN IF NOT EXISTS activation_token TEXT;
          ALTER TABLE admin_user ADD COLUMN IF NOT EXISTS password_hash TEXT;
        END IF;
      END $$;
    `)

    // 1. Validar existencia y vigencia de OTP para ESTE CORREO ESPECÍFICO (Strict Email Binding)
    const checkOtp = await client.query(`
      SELECT * FROM password_reset_otp 
      WHERE LOWER(email) = LOWER($1)
      ORDER BY created_at DESC LIMIT 1;
    `, [normalizedEmail])

    if (checkOtp.rows.length === 0) {
      return res.status(400).json({
        success: false,
        security_alert: true,
        message: lang === "en"
          ? "Security Alert: No active OTP request exists for this email address. If you changed the email after receiving the code, the operation is blocked."
          : "Alerta de Seguridad: No existe ninguna solicitud OTP activa para este correo electrónico. Si cambiaste el correo tras recibir el código, la operación queda bloqueada.",
      })
    }

    const otpRecord = checkOtp.rows[0]
    const attempts = otpRecord.attempts || 0

    // Validar expiración (10 minutos)
    if (new Date(otpRecord.expires_at) <= new Date()) {
      await client.query("DELETE FROM password_reset_otp WHERE id = $1;", [otpRecord.id])
      return res.status(400).json({
        success: false,
        message: lang === "en"
          ? "The OTP code has expired (10-minute validity). Please request a new one."
          : "El código OTP ha expirado (validez de 10 minutos). Por favor solicita uno nuevo.",
      })
    }

    // Validar límite de intentos (Máximo 5)
    if (attempts >= 5) {
      await client.query("DELETE FROM password_reset_otp WHERE id = $1;", [otpRecord.id])
      return res.status(429).json({
        success: false,
        security_alert: true,
        message: lang === "en"
          ? "You have exceeded the limit of 5 failed attempts. The OTP code has been revoked for security. You must request a new code."
          : "Has superado el límite de 5 intentos fallidos. Por seguridad el código OTP ha sido revocado. Debes solicitar un nuevo código.",
      })
    }

    // Validar si el código OTP coincide
    if (otpRecord.code !== trimmedCode) {
      const newAttempts = attempts + 1
      await client.query("UPDATE password_reset_otp SET attempts = $1 WHERE id = $2;", [newAttempts, otpRecord.id])
      const remaining = 5 - newAttempts

      if (remaining <= 0) {
        await client.query("DELETE FROM password_reset_otp WHERE id = $1;", [otpRecord.id])
        return res.status(429).json({
          success: false,
          security_alert: true,
          message: lang === "en"
            ? "Incorrect OTP code. 5-attempt limit reached. The code has been revoked for security. Request a new one."
            : "Código OTP incorrecto. Límite de 5 intentos superado. El código ha sido destruido por seguridad. Solicita uno nuevo.",
        })
      }

      return res.status(400).json({
        success: false,
        message: lang === "en"
          ? `Incorrect OTP code. You have ${remaining} attempt(s) left before being revoked for security.`
          : `Código OTP incorrecto. Te quedan ${remaining} intento(s) antes de ser revocado por seguridad.`,
      })
    }

    // 2. Generar hash criptográfico seguro PBKDF2 (salt + hash)
    const { hash, salt } = hashPassword(new_password)
    const combinedHash = `${salt}:${hash}`

    // 3. Si es usuario administrativo, validar estado y quemar el activation_token
    const adminCheck = await client.query(
      "SELECT * FROM admin_user WHERE LOWER(email) = LOWER($1) LIMIT 1;",
      [normalizedEmail]
    )

    let activatedAdmin: any = null
    if (adminCheck.rows.length > 0) {
      const existingAdmin = adminCheck.rows[0]
      if (token) {
        if (!existingAdmin.activation_token || existingAdmin.activation_token !== token.trim()) {
          return res.status(403).json({
            success: false,
            security_alert: true,
            message: lang === "en"
              ? "Critical Security Alert: The cryptographic activation token is invalid or does not match this user account."
              : "Alerta de Seguridad Crítica: El token criptográfico de activación es inválido o no corresponde a esta cuenta de usuario.",
          })
        }
      } else if (existingAdmin.activation_token) {
        return res.status(403).json({
          success: false,
          security_alert: true,
          message: lang === "en"
            ? "Security Alert: This account requires the original activation token to confirm the password."
            : "Alerta de Seguridad: Esta cuenta requiere el token de activación original para confirmar la contraseña.",
        })
      }

      const updateAdmin = await client.query(`
        UPDATE admin_user
        SET 
          status = 'active', 
          password_hash = $1, 
          activation_token = NULL,
          last_login = 'Activo (Contraseña asignada por OTP)', 
          updated_at = NOW()
        WHERE LOWER(email) = LOWER($2)
        RETURNING *;
      `, [combinedHash, normalizedEmail])

      activatedAdmin = updateAdmin.rows.length > 0 ? updateAdmin.rows[0] : null
    }

    // 4. Borrar código OTP utilizado de forma irreversible
    await client.query("DELETE FROM password_reset_otp WHERE LOWER(email) = LOWER($1);", [normalizedEmail])

    const roleMapped = mapRoleToAuthRole(activatedAdmin ? activatedAdmin.role_id : undefined)
    const nameUser = activatedAdmin ? activatedAdmin.name : "Usuario Admin"

    const sessionJwt = generateSessionToken({
      email: normalizedEmail,
      role: roleMapped,
    })

    console.log(`✅ [OTP CONFIRM] Contraseña y cuenta activadas exitosamente para ${normalizedEmail}`)

    return res.status(200).json({
      success: true,
      message: lang === "en"
        ? "Password successfully set! Your account has been activated."
        : "¡Contraseña establecida exitosamente! Tu cuenta ha sido activada correctamente.",
      token: sessionJwt,
      admin: {
        email: normalizedEmail,
        role: roleMapped,
        name: nameUser,
      },
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
