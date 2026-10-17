import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Client } from "pg"
import { sendEmail, generatePasswordResetEmailHTML, extractLanguage, EMAIL_SUBJECTS } from "../../../../lib/resend-mailer"

export const AUTHENTICATE = false

function getPgClient() {
  return new Client({
    connectionString: process.env.DATABASE_URL || "postgres://postgres:Colombia-93@localhost:5432/piano_colombia_db"
  })
}

async function ensureOtpTableExists(client: Client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS password_reset_otp (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      attempts INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)
  await client.query(`
    ALTER TABLE password_reset_otp ADD COLUMN IF NOT EXISTS attempts INT NOT NULL DEFAULT 0;
    DO $$ 
    BEGIN
      IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admin_user') THEN
        ALTER TABLE admin_user ADD COLUMN IF NOT EXISTS activation_token TEXT;
        ALTER TABLE admin_user ADD COLUMN IF NOT EXISTS password_hash TEXT;
      END IF;
    END $$;
  `)
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const client = getPgClient()
  try {
    const { email, role, token } = (req.body as any) || {}
    const lang = extractLanguage(req)

    if (!email || !email.includes("@")) {
      return res.status(400).json({
        success: false,
        message: lang === "en" ? "Please provide a valid email address." : "Por favor proporciona un correo electrónico válido.",
      })
    }

    const normalizedEmail = email.trim().toLowerCase()
    await client.connect()
    await ensureOtpTableExists(client)

    // Validaciones estrictas de seguridad para perfiles de administración
    if (role === "admin" || normalizedEmail.includes("@pianocolombia.com") || token) {
      // 1. Verificar si la tabla admin_user existe y si el usuario está registrado
      const adminCheck = await client.query(
        "SELECT * FROM admin_user WHERE LOWER(email) = LOWER($1) LIMIT 1;",
        [normalizedEmail]
      )

      if (adminCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          security_alert: true,
          message: lang === "en" 
            ? "Security Alert: No authorized administrative account exists for the provided email."
            : "Alerta de Seguridad: No existe ninguna cuenta administrativa autorizada para el correo proporcionado.",
        })
      }

      const adminUser = adminCheck.rows[0]

      if (adminUser.status === "inactive") {
        return res.status(403).json({
          success: false,
          security_alert: true,
          message: lang === "en"
            ? "This administrative account is suspended or inactive. Unable to generate OTP codes."
            : "Esta cuenta administrativa se encuentra suspendida o inactiva. No es posible generar códigos OTP.",
        })
      }

      // 2. Validación criptográfica estricta de token de activación
      if (token) {
        if (!adminUser.activation_token || adminUser.activation_token !== token.trim()) {
          console.warn(`🚨 [SEGURIDAD] Intento de manipulación de URL/Token para ${normalizedEmail}.`)
          return res.status(403).json({
            success: false,
            security_alert: true,
            message: lang === "en"
              ? "Critical Security Alert: URL parameters were manipulated or the token does not match this email address. Request rejected."
              : "Alerta de Seguridad Crítica: Los parámetros de la URL han sido manipulados o el token no corresponde a esta dirección de correo. Solicitud rechazada.",
          })
        }
      } else if (adminUser.activation_token) {
        return res.status(403).json({
          success: false,
          security_alert: true,
          message: lang === "en"
            ? "Security Alert: To activate this administrative account you must use the original secure invitation link with its cryptographic token."
            : "Alerta de Seguridad: Para activar esta cuenta administrativa es obligatorio utilizar el enlace seguro de invitación con su token criptográfico original.",
        })
      }
    }

    // Generar código OTP de 6 dígitos aleatorio
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // Expira en 10 minutos

    // Eliminar códigos anteriores para el mismo email
    await client.query("DELETE FROM password_reset_otp WHERE LOWER(email) = LOWER($1);", [normalizedEmail])

    // Guardar nuevo código OTP
    await client.query(`
      INSERT INTO password_reset_otp (email, code, expires_at, attempts, created_at)
      VALUES ($1, $2, $3, 0, NOW());
    `, [normalizedEmail, otpCode, expiresAt])

    // Plantilla de Correo HTML con el Código OTP
    const htmlContent = generatePasswordResetEmailHTML({
      userName: normalizedEmail.split("@")[0],
      otpCode,
      role: role || "admin",
      lang,
    })

    const mailRes = await sendEmail({
      to: normalizedEmail,
      subject: EMAIL_SUBJECTS.passwordReset[lang](otpCode),
      html: htmlContent,
    })

    if (!mailRes.success) {
      console.warn("⚠️ Advertencia enviando correo OTP:", mailRes.error)
    }

    return res.status(200).json({
      success: true,
      message: lang === "en"
        ? `6-digit OTP code successfully sent to ${normalizedEmail}! (Please also check your Spam folder).`
        : `¡Código OTP de 6 dígitos enviado exitosamente a ${normalizedEmail}! (Verifica también tu carpeta de Spam).`,
    })
  } catch (error: any) {
    const lang = extractLanguage(req)
    console.error("❌ Error al generar código OTP:", error)
    return res.status(500).json({
      success: false,
      message: lang === "en" ? "Error generating security OTP code." : "Error al generar código de seguridad OTP.",
      error: error.message,
    })
  } finally {
    await client.end().catch(() => {})
  }
}

export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  return res.status(204).end()
}
