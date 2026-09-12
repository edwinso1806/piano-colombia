import nodemailer from "nodemailer"
import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.join(__dirname, "../.env") })

async function sendTest() {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || "465", 10)
  const secure = process.env.SMTP_SECURE === "true" || port === 465
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM

  console.log("=== PROBANDO ENVÍO CON CONFIGURACIÓN DEL .ENV ===")
  console.log("Host:", host)
  console.log("Port:", port)
  console.log("Secure:", secure)
  console.log("User:", user)
  console.log("From:", from)

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  })

  try {
    const info = await transporter.sendMail({
      from,
      to: "edwinsou@gmail.com",
      subject: "Prueba de Envío Resend SMTP - Piano Colombia",
      html: `
        <div style="font-family: sans-serif; padding: 24px; color: #111C2D; max-width: 580px; border: 1px solid #e2e8f0; border-radius: 16px;">
          <h2 style="color: #0071BC; margin-top: 0;">¡Hola Edwin! 🎹</h2>
          <p>Este es un correo de prueba enviado exitosamente usando las credenciales SMTP actualizadas de tu archivo <code>.env</code>.</p>
          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">
            📅 Fecha de envío: ${new Date().toLocaleString("es-CO")}<br/>
            ✉️ Destinatario: edwinsou@gmail.com
          </p>
        </div>
      `,
    })

    console.log("\n✅ ¡Correo enviado exitosamente!")
    console.log("Message ID:", info.messageId)
    console.log("Respuesta servidor:", info.response)
  } catch (error: any) {
    console.error("\n❌ Error enviando correo:", error.message)
  }
}

sendTest()
