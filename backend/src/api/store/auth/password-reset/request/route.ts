import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Client } from "pg"
import { sendEmail, generatePasswordResetEmailHTML, extractLanguage, EMAIL_SUBJECTS } from "../../../../../lib/resend-mailer"

export const AUTHENTICATE = false

function getPgClient() {
  return new Client({
    connectionString: process.env.DATABASE_URL || "postgres://postgres:Alex%242020@localhost:5432/piano_colombia_db"
  })
}

async function ensureOtpTableExists(client: Client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS password_reset_otp (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const client = getPgClient()
  try {
    const { email } = (req.body as any) || {}
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

    // Generar código OTP de 6 dígitos aleatorio
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // Expira en 10 minutos

    // Eliminar códigos anteriores para el mismo email
    await client.query("DELETE FROM password_reset_otp WHERE LOWER(email) = LOWER($1);", [normalizedEmail])

    // Guardar nuevo código OTP
    await client.query(`
      INSERT INTO password_reset_otp (email, code, expires_at, created_at)
      VALUES ($1, $2, $3, NOW());
    `, [normalizedEmail, otpCode, expiresAt])

    // Plantilla de Correo HTML con el Código OTP
    const htmlContent = generatePasswordResetEmailHTML({
      userName: normalizedEmail.split("@")[0],
      otpCode,
      role: "cliente",
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
