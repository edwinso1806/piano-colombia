import nodemailer from "nodemailer"

interface MailPayload {
  to: string
  subject: string
  html: string
}

let smtpTransporter: any = null

function getSmtpTransporter() {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || "587", 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const secure = port === 587 ? false : (process.env.SMTP_SECURE === "true" || port === 465)

  if (!host || !user || !pass) {
    return null
  }

  if (!smtpTransporter) {
    smtpTransporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    })
  }

  return smtpTransporter
}

export async function sendEmail({ to, subject, html }: MailPayload) {
  const transporter = getSmtpTransporter()

  // 1. Prioridad: Servidor SMTP con Nodemailer
  if (transporter) {
    try {
      const from = process.env.SMTP_FROM || process.env.SMTP_USER || "Piano Colombia <notificaciones@pianocolombia.com>"
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html,
      })
      console.log(`✅ [SMTP] Correo enviado con éxito a ${to} (MessageID: ${info.messageId})`)
      return { success: true, messageId: info.messageId, provider: "smtp" }
    } catch (error: any) {
      console.error(`❌ [SMTP] Error enviando correo a ${to}:`, error.message)
      return { success: false, error: error.message, provider: "smtp" }
    }
  }

  // 2. Resend API
  const apiKey = process.env.RESEND_API_KEY
  if (apiKey && !apiKey.startsWith("re_demo")) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || "Piano Colombia <notificaciones@pianocolombia.com>",
          to: [to],
          subject,
          html,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        console.warn("Fallo enviando correo vía Resend API:", err)
        return { success: false, error: err, provider: "resend" }
      }

      const data = await res.json()
      console.log(`✅ [Resend API] Correo enviado a ${to} (ID: ${data.id})`)
      return { success: true, id: data.id, provider: "resend" }
    } catch (error: any) {
      console.warn("Error en la conexión con Resend API:", error.message)
      return { success: false, error: error.message, provider: "resend" }
    }
  }

  // 3. Simulación informativa local si aún no hay credenciales configuradas
  console.info(`ℹ️ [Email Simulado] Correo a '${to}' | Asunto: '${subject}'`)
  return { success: true, simulated: true, to, subject, provider: "simulation" }
}

export function generateBuyerPurchaseHTML({
  buyerName,
  scoreTitle,
  composerName,
  downloadUrl,
  token,
  priceCop,
}: {
  buyerName: string
  scoreTitle: string
  composerName: string
  downloadUrl: string
  token: string
  priceCop: number
}) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Tu Partitura de Piano Colombia</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #F9F9FF; margin: 0; padding: 24px; color: #111C2D;">
    <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px;">
      <div style="text-align: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px;">
        <h1 style="font-size: 20px; font-weight: 900; margin: 0; color: #111C2D; letter-spacing: -0.5px;">PIANO COLOMBIA</h1>
        <p style="font-size: 10px; text-transform: uppercase; color: #64748b; margin-top: 4px; font-weight: bold; letter-spacing: 1px;">Marketplace & Archivo Digital Urtext</p>
      </div>
      
      <div style="padding: 24px 0;">
        <h2 style="font-size: 18px; color: #111C2D; margin-top: 0;">¡Gracias por tu compra, ${buyerName}!</h2>
        <p style="font-size: 13px; color: #475569; line-height: 1.6;">Tu pago a través de Wompi ha sido aprobado exitosamente. Ya puedes descargar tu partitura oficial en formato PDF Urtext con tu <strong>licencia legal nominativa estampada</strong>.</p>
        
        <div style="background: #F0F3FF; border: 1px solid #dbeafe; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 12px;">
          <p style="margin: 4px 0; color: #0071BC; font-weight: bold;">🎼 Obra: ${scoreTitle}</p>
          <p style="margin: 4px 0; color: #334155;">🎹 Compositor: ${composerName}</p>
          <p style="margin: 4px 0; color: #334155;">💳 Valor Pagado: $${Number(priceCop).toLocaleString("es-CO")} COP</p>
          <p style="margin: 4px 0; color: #64748b; font-family: monospace; font-size: 11px;">Token de Descarga: ${token}</p>
        </div>

        <p style="font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.5;">Esta licencia es nominal e intransferible. Incluye 1 copia impresa autorizada para estudio o concierto.</p>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; text-align: center; font-size: 10px; color: #94a3b8;">
        © 2026 Piano Colombia · Obra, Patrimonio y Música Pianística Colombiana
      </div>
    </div>
  </body>
  </html>
  `
}

export function generateOtpEmailHTML({
  userName,
  otpCode,
}: {
  userName: string
  otpCode: string
}) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Código de Verificación - Piano Colombia</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #F9F9FF; margin: 0; padding: 24px; color: #111C2D;">
    <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px;">
      <div style="text-align: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px;">
        <h1 style="font-size: 20px; font-weight: 900; margin: 0; color: #111C2D; letter-spacing: -0.5px;">PIANO COLOMBIA</h1>
        <p style="font-size: 10px; text-transform: uppercase; color: #64748b; margin-top: 4px; font-weight: bold; letter-spacing: 1px;">Archivo & Editorial de Partituras</p>
      </div>
      
      <div style="padding: 24px 0; text-align: center;">
        <div style="width: 56px; height: 56px; background-color: #F0F3FF; border-radius: 16px; margin: 0 auto 16px; line-height: 56px; font-size: 24px;">
          🔐
        </div>
        
        <h2 style="font-size: 18px; color: #111C2D; margin-top: 0;">Verifica tu correo electrónico</h2>
        <p style="font-size: 13px; color: #475569; line-height: 1.6; max-width: 420px; margin: 0 auto 20px;">
          Hola <strong>${userName}</strong>, estás a un paso de crear tu cuenta en Piano Colombia. Ingresa el siguiente código de seguridad de 6 dígitos en la pantalla de registro:
        </p>
        
        <div style="background: #F0F3FF; border: 2px dashed #0071BC; border-radius: 14px; padding: 18px; margin: 24px auto; max-width: 280px; letter-spacing: 8px; font-size: 32px; font-weight: 900; color: #0071BC; font-family: monospace;">
          ${otpCode}
        </div>

        <p style="font-size: 11px; color: #64748b; margin-top: 20px; line-height: 1.5;">
          ⏱️ Este código es válido durante los próximos <strong>10 minutos</strong>. Si tú no solicitaste esta cuenta, puedes ignorar este mensaje de forma segura.
        </p>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; text-align: center; font-size: 10px; color: #94a3b8;">
        © 2026 Piano Colombia · Seguridad y Autenticación de Usuarios
      </div>
    </div>
  </body>
  </html>
  `
}

export function generatePasswordResetEmailHTML({
  userName,
  otpCode,
  role = "cliente",
}: {
  userName: string
  otpCode: string
  role?: string
}) {
  const roleLabel = role === "composer" ? "Compositor" : role === "admin" ? "Administrador" : "Cliente"
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Recuperación de Contraseña - Piano Colombia</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #F9F9FF; margin: 0; padding: 24px; color: #111C2D;">
    <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px;">
      <div style="text-align: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px;">
        <h1 style="font-size: 20px; font-weight: 900; margin: 0; color: #111C2D; letter-spacing: -0.5px;">PIANO COLOMBIA</h1>
        <p style="font-size: 10px; text-transform: uppercase; color: #64748b; margin-top: 4px; font-weight: bold; letter-spacing: 1px;">Seguridad de Cuenta · ${roleLabel}</p>
      </div>
      
      <div style="padding: 24px 0; text-align: center;">
        <div style="width: 56px; height: 56px; background-color: #FFF7ED; border-radius: 16px; margin: 0 auto 16px; line-height: 56px; font-size: 24px;">
          🔑
        </div>
        
        <h2 style="font-size: 18px; color: #111C2D; margin-top: 0;">Restablece tu Contraseña</h2>
        <p style="font-size: 13px; color: #475569; line-height: 1.6; max-width: 420px; margin: 0 auto 20px;">
          Hola <strong>${userName}</strong>, hemos recibido una solicitud para cambiar la contraseña de tu cuenta en Piano Colombia. Ingresa este código de seguridad de 6 dígitos:
        </p>
        
        <div style="background: #FFF7ED; border: 2px dashed #EA580C; border-radius: 14px; padding: 18px; margin: 24px auto; max-width: 280px; letter-spacing: 8px; font-size: 32px; font-weight: 900; color: #C2410C; font-family: monospace;">
          ${otpCode}
        </div>

        <p style="font-size: 11px; color: #64748b; margin-top: 20px; line-height: 1.5;">
          ⏱️ Este código expirará en <strong>10 minutos</strong>. Si tú no realizaste esta solicitud, puedes ignorar este correo; tu contraseña actual permanecerá segura.
        </p>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; text-align: center; font-size: 10px; color: #94a3b8;">
        © 2026 Piano Colombia · Plataforma Segura de Partituras
      </div>
    </div>
  </body>
  </html>
  `
}

export function generatePasswordChangedEmailHTML({
  userName,
}: {
  userName: string
}) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Contraseña Actualizada - Piano Colombia</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #F9F9FF; margin: 0; padding: 24px; color: #111C2D;">
    <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px;">
      <div style="text-align: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px;">
        <h1 style="font-size: 20px; font-weight: 900; margin: 0; color: #111C2D;">PIANO COLOMBIA</h1>
      </div>
      
      <div style="padding: 24px 0; text-align: center;">
        <div style="width: 56px; height: 56px; background-color: #ECFDF5; border-radius: 16px; margin: 0 auto 16px; line-height: 56px; font-size: 24px;">
          ✅
        </div>
        
        <h2 style="font-size: 18px; color: #111C2D; margin-top: 0;">Tu contraseña ha sido cambiada</h2>
        <p style="font-size: 13px; color: #475569; line-height: 1.6; max-width: 420px; margin: 0 auto 20px;">
          Hola <strong>${userName}</strong>, te informamos que la contraseña de tu cuenta en Piano Colombia ha sido modificada exitosamente.
        </p>
        <p style="font-size: 12px; color: #64748b;">
          Si no reconoces esta acción, por favor ponte en contacto con nuestro equipo de soporte inmediatamente a <strong>soporte@pianocolombia.com</strong>.
        </p>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; text-align: center; font-size: 10px; color: #94a3b8;">
        © 2026 Piano Colombia · Seguridad y Autenticación de Usuarios
      </div>
    </div>
  </body>
  </html>
  `
}

export function generateNewComposerAdminNotificationHTML({
  adminName,
  composerName,
  artisticName,
  email,
  phone,
  region,
  documentType,
  documentNumber,
  bankName,
  accountType,
  accountNumber,
}: {
  adminName: string
  composerName: string
  artisticName: string
  email: string
  phone?: string
  region?: string
  documentType?: string
  documentNumber?: string
  bankName?: string
  accountType?: string
  accountNumber?: string
}) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>🚨 Nueva Solicitud de Compositor Pendiente - Piano Colombia</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #F9F9FF; margin: 0; padding: 24px; color: #111C2D;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
      
      <div style="text-align: center; border-bottom: 2px solid #F0F3FF; padding-bottom: 20px;">
        <span style="display: inline-block; padding: 4px 12px; background: #FEF3C7; color: #92400E; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
          Módulo de Moderación & Administración RBAC
        </span>
        <h1 style="font-size: 22px; font-weight: 900; margin: 12px 0 4px; color: #111C2D; letter-spacing: -0.5px;">PIANO COLOMBIA</h1>
        <p style="font-size: 11px; color: #64748b; margin: 0; font-weight: bold;">Notificación Automática de Nueva Solicitud Pendiente</p>
      </div>

      <div style="padding: 24px 0;">
        <p style="font-size: 14px; color: #111C2D; font-weight: bold; margin-top: 0;">
          Estimado/a ${adminName},
        </p>
        <p style="font-size: 13px; color: #475569; line-height: 1.6;">
          Un nuevo maestro ha verificado su correo electrónico y completado la postulación para unirse al catálogo oficial de autores de <strong>Piano Colombia</strong>. Su perfil se encuentra en estado <strong>PENDIENTE DE APROBACIÓN</strong> (<code>PENDING_APPROVAL</code>).
        </p>

        <div style="background: #F0F3FF; border: 1px solid #CBD5E1; border-radius: 16px; padding: 20px; margin: 24px 0;">
          <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #0071BC; margin-top: 0; margin-bottom: 12px; font-weight: 900; border-b: 1px solid #E2E8F0; padding-bottom: 8px;">
            📋 Ficha Técnica de la Solicitud
          </h3>

          <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #111C2D;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; width: 40%; color: #475569;">Nombre Completo Legal:</td>
              <td style="padding: 6px 0; font-weight: 800;">${composerName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #475569;">Nombre Artístico / Firma:</td>
              <td style="padding: 6px 0; font-weight: 800; color: #0071BC;">${artisticName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #475569;">Correo Verificado:</td>
              <td style="padding: 6px 0; font-mono; font-weight: bold;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #475569;">Teléfono Celular:</td>
              <td style="padding: 6px 0;">${phone || "No especificado"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #475569;">Ubicación Geográfica:</td>
              <td style="padding: 6px 0;">${region || "No especificada"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #475569;">Documento de Identidad:</td>
              <td style="padding: 6px 0; font-mono; font-weight: bold;">${documentType || "CC"} ${documentNumber || "No registrado"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #475569;">Cuenta para Regalías (80%):</td>
              <td style="padding: 6px 0; font-mono;">${bankName || "Bancolombia"} (${accountType || "AHORROS"} ${accountNumber || ""})</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin: 28px 0 12px;">
          <a href="http://localhost:3000/admin/compositores" target="_blank" style="display: inline-block; padding: 14px 28px; background: #FBB03B; color: #111C2D; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(251,176,59,0.3);">
            👉 Ir al Módulo de Aprobación de Compositores
          </a>
        </div>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 18px; text-align: center; font-size: 10px; color: #94a3b8;">
        © 2026 Piano Colombia · Notificación de Seguridad & Control Administrativo
      </div>
    </div>
  </body>
  </html>
  `
}



