import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Client } from "pg"
import { sendEmail } from "../../../../../lib/resend-mailer"

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

    if (!email || !email.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "Por favor proporciona un correo electrónico válido.",
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
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>🔑 Código OTP de Verificación - Piano Colombia</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #F9F9FF; margin: 0; padding: 24px; color: #111C2D;">
      <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); text-align: center;">
        
        <span style="display: inline-block; padding: 4px 14px; background: #EFF6FF; color: #0071BC; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
          Seguridad & Verificación OTP
        </span>

        <h1 style="font-size: 22px; font-weight: 900; margin: 16px 0 6px; color: #111C2D;">PIANO COLOMBIA</h1>
        <p style="font-size: 13px; color: #475569; margin-bottom: 24px;">Código de activación y asignación de contraseña</p>

        <div style="background: #F0F3FF; border: 2px dashed #0071BC; border-radius: 16px; padding: 24px; margin: 20px 0;">
          <p style="margin: 0 0 8px; font-size: 11px; font-weight: bold; color: #475569; text-transform: uppercase; letter-spacing: 1px;">
            Tu Código de Seguridad OTP:
          </p>
          <span style="font-family: monospace; font-size: 36px; font-weight: 900; color: #111C2D; letter-spacing: 8px; display: inline-block; background: #ffffff; padding: 10px 24px; border-radius: 12px; border: 1px solid #CBD5E1;">
            ${otpCode}
          </span>
          <p style="margin: 12px 0 0; font-size: 11px; color: #64748B;">
            ⏱️ Este código expira en <strong>10 minutos</strong>.
          </p>
        </div>

        <p style="font-size: 12px; color: #64748B; line-height: 1.5; text-align: left; margin-top: 20px;">
          Si tú no solicitaste este código, puedes ignorar este mensaje de seguridad.
        </p>

        <div style="border-top: 1px solid #f1f5f9; margin-top: 28px; padding-top: 16px; font-size: 10px; color: #94a3b8;">
          © 2026 Piano Colombia · Notificación de Seguridad
        </div>
      </div>
    </body>
    </html>
    `

    const mailRes = await sendEmail({
      to: normalizedEmail,
      subject: `🔑 Código OTP: ${otpCode} - Activación & Seguridad Piano Colombia`,
      html: htmlContent,
    })

    if (!mailRes.success) {
      console.warn("⚠️ Advertencia enviando correo OTP:", mailRes.error)
    }

    return res.status(200).json({
      success: true,
      message: `¡Código OTP de 6 dígitos enviado exitosamente a ${normalizedEmail}! (Verifica también tu carpeta de Spam).`,
    })
  } catch (error: any) {
    console.error("❌ Error al generar código OTP:", error)
    return res.status(500).json({
      success: false,
      message: "Error al generar código de seguridad OTP.",
      error: error.message,
    })
  } finally {
    await client.end().catch(() => {})
  }
}

export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  return res.status(204).end()
}
