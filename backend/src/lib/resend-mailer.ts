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
      const from = process.env.SMTP_FROM || process.env.SMTP_USER || "Piano Colombia <prestamosrm2026@gmail.com>"
      const replyTo = process.env.SMTP_REPLY_TO || "Piano Colombia <soporte@pianocolombia.com>"
      console.log(`📤 [SMTP] Enviando correo a: ${to} | Remitente: ${from} | Asunto: "${subject}"`)
      const info = await transporter.sendMail({
        from,
        replyTo,
        to,
        subject,
        html,
      })
      console.log(`✅ [SMTP] Correo enviado y aceptado por servidor SMTP para ${to} (MessageID: ${info.messageId})`)
      return { success: true, messageId: info.messageId, provider: "smtp" }
    } catch (error: any) {
      console.error(`❌ [SMTP] Error enviando correo a ${to}:`, error.message, error.stack)
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

export function generateComposerProfileUpdatedAdminNotificationHTML({
  adminName,
  composerName,
  artisticName,
  email,
  phone,
  region,
  previousStatus,
  wasApproved,
  approvalAttempts,
}: {
  adminName: string
  composerName: string
  artisticName: string
  email: string
  phone?: string
  region?: string
  previousStatus: string
  wasApproved: boolean
  approvalAttempts?: number
}) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>🚨 Modificación de Perfil de Compositor - Piano Colombia</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #F9F9FF; margin: 0; padding: 24px; color: #111C2D;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
      
      <div style="text-align: center; border-bottom: 2px solid #F0F3FF; padding-bottom: 20px;">
        <span style="display: inline-block; padding: 4px 12px; background: ${wasApproved ? "#FEE2E2" : "#FEF3C7"}; color: ${wasApproved ? "#991B1B" : "#92400E"}; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
          ${wasApproved ? "⚠️ Perfil Activo Modificado • Inactivación de Obras" : `Módulo de Moderación & Revisión • Intento #${approvalAttempts || 1}`}
        </span>
        <h1 style="font-size: 22px; font-weight: 900; margin: 12px 0 4px; color: #111C2D; letter-spacing: -0.5px;">PIANO COLOMBIA</h1>
        <p style="font-size: 11px; color: #64748b; margin: 0; font-weight: bold;">Alerta de Actualización de Perfil de Autor</p>
      </div>

      <div style="padding: 24px 0;">
        <p style="font-size: 14px; color: #111C2D; font-weight: bold; margin-top: 0;">
          Estimado/a ${adminName},
        </p>
        <p style="font-size: 13px; color: #475569; line-height: 1.6;">
          El compositor <strong>${artisticName}</strong> (${composerName}) ha realizado modificaciones en su información de perfil (fotografía, biografía o datos institucionales) y las ha enviado a revisión técnica para ser aceptado en el catálogo.
        </p>

        ${
          wasApproved
            ? `
        <div style="background: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 14px; padding: 16px; margin: 20px 0; font-size: 12px; color: #991B1B;">
          <p style="margin: 0; font-weight: 800; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">⚠️ Acciones automáticas aplicadas en la tienda:</p>
          <ul style="margin: 8px 0 0 18px; padding: 0; line-height: 1.6;">
            <li>El perfil del compositor cambió de <code>APPROVED</code> a <code>PENDING_APPROVAL</code>.</li>
            <li><strong>Todas sus partituras fueron inactivadas</strong> del catálogo público hasta que un administrador valide y apruebe las modificaciones.</li>
          </ul>
        </div>
        `
            : ""
        }

        <div style="background: #F0F3FF; border: 1px solid #CBD5E1; border-radius: 16px; padding: 20px; margin: 24px 0;">
          <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #0071BC; margin-top: 0; margin-bottom: 12px; font-weight: 900; border-b: 1px solid #E2E8F0; padding-bottom: 8px;">
            📋 Datos del Compositor
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
              <td style="padding: 6px 0; font-weight: bold; color: #475569;">Correo Electrónico:</td>
              <td style="padding: 6px 0; font-mono; font-weight: bold;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #475569;">Número de Intentos de Envío:</td>
              <td style="padding: 6px 0; font-weight: 900; color: #C1272D;">Intento #${approvalAttempts || 1}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #475569;">Estado Anterior:</td>
              <td style="padding: 6px 0; font-mono; font-weight: bold; color: ${wasApproved ? "#15803D" : "#B45309"};">${previousStatus}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #475569;">Teléfono:</td>
              <td style="padding: 6px 0;">${phone || "No especificado"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #475569;">Ubicación:</td>
              <td style="padding: 6px 0;">${region || "No especificada"}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin: 28px 0 12px;">
          <a href="http://localhost:3000/admin/compositores" target="_blank" style="display: inline-block; padding: 14px 28px; background: #FBB03B; color: #111C2D; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(251,176,59,0.3);">
            👉 Revisar y Aprobar Perfil en Consola Admin
          </a>
        </div>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 18px; text-align: center; font-size: 10px; color: #94a3b8;">
        © 2026 Piano Colombia · Notificación de Moderación de Autores
      </div>
    </div>
  </body>
  </html>
  `
}

export function generateNewAdminUserInvitationHTML({
  userName,
  userEmail,
  roleName,
  permissions,
  createdByName,
  activationToken,
}: {
  userName: string
  userEmail: string
  roleName: string
  permissions: string[]
  createdByName?: string
  activationToken?: string
}) {
  const activationUrl = activationToken
    ? `http://localhost:3000/admin/activar-cuenta?email=${encodeURIComponent(userEmail)}&token=${encodeURIComponent(activationToken)}`
    : `http://localhost:3000/admin/activar-cuenta?email=${encodeURIComponent(userEmail)}`

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>🔐 Invitación a Consola Administrativa - Piano Colombia</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #F9F9FF; margin: 0; padding: 24px; color: #111C2D;">
    <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
      
      <div style="text-align: center; border-bottom: 2px solid #F0F3FF; padding-bottom: 20px;">
        <span style="display: inline-block; padding: 4px 12px; background: #EFF6FF; color: #1E40AF; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
          Seguridad & Control de Acceso RBAC
        </span>
        <h1 style="font-size: 22px; font-weight: 900; margin: 12px 0 4px; color: #111C2D; letter-spacing: -0.5px;">PIANO COLOMBIA</h1>
        <p style="font-size: 11px; color: #64748b; margin: 0; font-weight: bold;">Invitación a la Consola Administrativa</p>
      </div>

      <div style="padding: 24px 0;">
        <p style="font-size: 14px; color: #111C2D; font-weight: bold; margin-top: 0;">
          Hola, ${userName},
        </p>
        <p style="font-size: 13px; color: #475569; line-height: 1.6;">
          Te informamos que <strong>${createdByName || "el equipo de Super Administración"}</strong> te ha creado un usuario con perfil institucional en la consola administrativa de <strong>Piano Colombia</strong>.
        </p>

        <div style="background: #F0F3FF; border: 1px solid #CBD5E1; border-radius: 16px; padding: 20px; margin: 24px 0;">
          <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #0071BC; margin-top: 0; margin-bottom: 12px; font-weight: 900; border-b: 1px solid #E2E8F0; padding-bottom: 8px;">
            🔑 Detalles de tu Cuenta Administrativa
          </h3>

          <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #111C2D;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; width: 45%; color: #475569;">Usuario:</td>
              <td style="padding: 6px 0; font-weight: 800;">${userName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #475569;">Correo Corporativo:</td>
              <td style="padding: 6px 0; font-mono; font-weight: bold; color: #0071BC;">${userEmail}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #475569;">Rol Asignado:</td>
              <td style="padding: 6px 0; font-weight: 800; color: #C1272D;">${roleName}</td>
            </tr>
          </table>

          <div style="margin-top: 14px; padding-top: 12px; border-t: 1px dashed #CBD5E1;">
            <p style="margin: 0 0 6px; font-size: 11px; font-weight: bold; color: #475569;">Permisos asignados:</p>
            <div style="font-size: 11px; color: #334155; line-height: 1.5;">
              ${permissions.map((p) => `• ${p}`).join("<br/>")}
            </div>
          </div>
        </div>

        <div style="background: #EFF6FF; border: 1px solid #93C5FD; border-radius: 14px; padding: 16px; margin: 20px 0; font-size: 12px; color: #1E3A8A; line-height: 1.6;">
          <strong style="display: block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; font-size: 11px; color: #1E40AF;">🔒 Proceso de Activación Segura (OTP):</strong>
          1. Haz clic en el botón inferior <strong>"Activar Cuenta y Definir Contraseña"</strong>.<br/>
          2. Se validará tu enlace criptográfico y se enviará un <strong>código OTP de 6 dígitos</strong> a tu correo para validar tu identidad.<br/>
          3. Ingresa el código recibido y define tu contraseña personal privada para ingresar a la consola.
        </div>

        <div style="text-align: center; margin: 28px 0 12px;">
          <a href="${activationUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; background: #0071BC; color: #ffffff; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,113,188,0.3);">
            🔑 Activar Cuenta y Definir Contraseña Segura
          </a>
        </div>
      </div>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 18px; text-align: center; font-size: 10px; color: #94a3b8;">
        © 2026 Piano Colombia · Control de Usuarios y Seguridad RBAC
      </div>
    </div>
  </body>
  </html>
  `
}

export function generateComposerApprovedHTML({
  composerName,
  artisticName,
  loginUrl = "http://localhost:3000/compositor/login",
}: {
  composerName: string
  artisticName?: string
  loginUrl?: string
}) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>🎉 ¡Tu perfil ha sido aprobado en Piano Colombia!</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #F9F9FF; margin: 0; padding: 24px; color: #111C2D;">
    <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
      
      <div style="text-align: center; border-bottom: 2px solid #F0F3FF; padding-bottom: 20px;">
        <span style="display: inline-block; padding: 4px 12px; background: #ECFDF5; color: #047857; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
          Solicitud Aprobada
        </span>
        <h1 style="font-size: 24px; font-weight: 900; margin: 12px 0 4px; color: #111C2D; letter-spacing: -0.5px;">PIANO COLOMBIA</h1>
        <p style="font-size: 12px; color: #0071BC; margin: 0; font-weight: bold;">Plataforma Oficial de Música para Piano</p>
      </div>

      <div style="padding: 24px 0;">
        <p style="font-size: 15px; color: #111C2D; font-weight: bold; margin-top: 0;">
          ¡Felicitaciones, maestro(a) ${artisticName || composerName}! 🎹
        </p>
        <p style="font-size: 13px; color: #475569; line-height: 1.6;">
          Nos complace informarte que el equipo de moderación y administración de <strong>Piano Colombia</strong> ha revisado y <strong>aprobado satisfactoriamente</strong> tu perfil de compositor.
        </p>

        <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 16px; padding: 20px; margin: 24px 0;">
          <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #15803D; margin-top: 0; margin-bottom: 8px; font-weight: 900;">
            ✨ Próximo paso: Publicación de tus Obras
          </h3>
          <p style="font-size: 12px; color: #166534; line-height: 1.5; margin: 0;">
            Recuerda que para que tu perfil oficial de compositor sea visible al público en la tienda de <strong>Piano Colombia</strong>, debes tener al menos <strong>una partitura aprobada</strong>. Ya puedes ingresar a tu panel de autor y cargar tus obras para revisión técnica.
          </p>
        </div>

        <div style="text-align: center; margin: 28px 0 12px;">
          <a href="${loginUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; background: #FBB03B; color: #111C2D; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(251,176,59,0.3);">
            🚀 Ingresar a mi Panel de Compositor
          </a>
        </div>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 18px; text-align: center; font-size: 10px; color: #94a3b8;">
        © 2026 Piano Colombia · Conservación y Difusión del Patrimonio Musical
      </div>
    </div>
  </body>
  </html>
  `
}

export function generateComposerRejectedHTML({
  composerName,
  artisticName,
  observations,
  dashboardUrl = "http://localhost:3000/compositor/login",
}: {
  composerName: string
  artisticName?: string
  observations: string
  dashboardUrl?: string
}) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>⚠️ Observaciones a tu solicitud de Compositor - Piano Colombia</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #F9F9FF; margin: 0; padding: 24px; color: #111C2D;">
    <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
      
      <div style="text-align: center; border-bottom: 2px solid #F0F3FF; padding-bottom: 20px;">
        <span style="display: inline-block; padding: 4px 12px; background: #FFFBEB; color: #B45309; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
          Revisión de Información Requerida
        </span>
        <h1 style="font-size: 24px; font-weight: 900; margin: 12px 0 4px; color: #111C2D; letter-spacing: -0.5px;">PIANO COLOMBIA</h1>
        <p style="font-size: 12px; color: #C1272D; margin: 0; font-weight: bold;">Comité de Moderación y Curaduría</p>
      </div>

      <div style="padding: 24px 0;">
        <p style="font-size: 15px; color: #111C2D; font-weight: bold; margin-top: 0;">
          Estimado(a) ${artisticName || composerName},
        </p>
        <p style="font-size: 13px; color: #475569; line-height: 1.6;">
          El equipo de moderación ha revisado tu postulación para unirte al catálogo de autores de <strong>Piano Colombia</strong>. Para que tu solicitud pueda ser aprobada formalmente, requerimos que organices y ajustes la siguiente información:
        </p>

        <div style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: 16px; padding: 20px; margin: 24px 0;">
          <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #991B1B; margin-top: 0; margin-bottom: 10px; font-weight: 900;">
            📝 Observaciones del Administrador / Moderador:
          </h3>
          <div style="font-size: 13px; color: #7F1D1D; line-height: 1.6; font-style: italic; white-space: pre-line; background: #ffffff; padding: 14px; border-radius: 10px; border: 1px solid #FCA5A5;">
            "${observations || "Por favor revisa la fotografía de autor, la precisión biográfica o los datos bancarios ingresados."}"
          </div>
        </div>

        <div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 14px; padding: 16px; margin: 20px 0; font-size: 12px; color: #1E40AF; line-height: 1.6;">
          <strong style="display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; font-size: 11px;">🔄 Puedes volver a postularte:</strong>
          Ingresa a tu panel de perfil, actualiza los campos señalados en las observaciones y haz clic en <strong>"Enviar Perfil a Revisión"</strong>. Tan pronto lo hagas, nuestros administradores y moderadores recibirán una notificación para reevaluar tu perfil.
        </div>

        <div style="text-align: center; margin: 28px 0 12px;">
          <a href="${dashboardUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; background: #0071BC; color: #ffffff; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,113,188,0.3);">
            ✏️ Corregir Información y Reenviar Perfil
          </a>
        </div>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 18px; text-align: center; font-size: 10px; color: #94a3b8;">
        © 2026 Piano Colombia · Notificación de Moderación de Autores
      </div>
    </div>
  </body>
  </html>
  `
}

export function generateComposerBlockedHTML({
  composerName,
  artisticName,
  reason,
}: {
  composerName: string
  artisticName?: string
  reason?: string
}) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Notificación Oficial - Piano Colombia</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #F9F9FF; margin: 0; padding: 24px; color: #111C2D;">
    <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
      
      <div style="text-align: center; border-bottom: 2px solid #F0F3FF; padding-bottom: 20px;">
        <span style="display: inline-block; padding: 4px 12px; background: #FEE2E2; color: #991B1B; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
          Resolución Definitiva
        </span>
        <h1 style="font-size: 24px; font-weight: 900; margin: 12px 0 4px; color: #111C2D; letter-spacing: -0.5px;">PIANO COLOMBIA</h1>
        <p style="font-size: 12px; color: #64748b; margin: 0; font-weight: bold;">Dirección General de Curaduría y Moderación</p>
      </div>

      <div style="padding: 24px 0;">
        <p style="font-size: 15px; color: #111C2D; font-weight: bold; margin-top: 0;">
          Estimado(a) ${artisticName || composerName},
        </p>
        <p style="font-size: 13px; color: #475569; line-height: 1.6;">
          Te informamos que tras evaluar tus solicitudes e intentos reiterados de postulación a la plataforma, la administración de <strong>Piano Colombia</strong> ha determinado <strong>no aceptar tu solicitud de forma definitiva</strong> para formar parte de nuestro catálogo de autores.
        </p>

        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 20px; margin: 24px 0;">
          <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; margin-top: 0; margin-bottom: 10px; font-weight: 900;">
            Motivo de la Decisión Definitiva:
          </h3>
          <p style="font-size: 13px; color: #334155; line-height: 1.6; margin: 0; font-style: italic;">
            "${reason || "Se ha superado el límite de intentos permitidos para subsanar los requisitos curatoriales o documentales de la plataforma."}"
          </p>
        </div>

        <p style="font-size: 12px; color: #64748b; line-height: 1.6;">
          Agradecemos tu interés en Piano Colombia. El acceso a tu cuenta de compositor ha sido suspendido definitivamente.
        </p>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 18px; text-align: center; font-size: 10px; color: #94a3b8;">
        © 2026 Piano Colombia · Notificación Oficial de Administración
      </div>
    </div>
  </body>
  </html>
  `
}

export function generateScoreSubmittedAdminNotificationHTML({
  adminName,
  composerName,
  artisticName,
  scoreTitle,
  genre,
  difficulty,
  priceCop,
  adminDashboardUrl = "http://localhost:3000/admin/partituras",
}: {
  adminName?: string
  composerName: string
  artisticName?: string
  scoreTitle: string
  genre?: string
  difficulty?: string
  priceCop?: number
  adminDashboardUrl?: string
}) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Nueva Partitura en Cola de Revisión - Piano Colombia</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #F9F9FF; margin: 0; padding: 24px; color: #111C2D;">
    <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
      <div style="text-align: center; border-bottom: 2px solid #F0F3FF; padding-bottom: 20px;">
        <span style="display: inline-block; padding: 4px 12px; background: #FEF3C7; color: #92400E; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
          🎼 Mesa de Curaduría & Revisión
        </span>
        <h1 style="font-size: 24px; font-weight: 900; margin: 12px 0 4px; color: #111C2D;">PIANO COLOMBIA</h1>
        <p style="font-size: 12px; color: #64748b; margin: 0; font-weight: bold;">Notificación a Moderadores y Administradores</p>
      </div>

      <div style="padding: 24px 0;">
        <p style="font-size: 15px; color: #111C2D; font-weight: bold; margin-top: 0;">
          Hola, ${adminName || "Equipo de Moderación"},
        </p>
        <p style="font-size: 13px; color: #475569; line-height: 1.6;">
          El compositor <strong>${artisticName || composerName}</strong> ha subido una obra para revisión técnica y musical.
        </p>

        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 20px; margin: 20px 0;">
          <h3 style="font-size: 14px; color: #111C2D; margin-top: 0; margin-bottom: 12px; font-weight: 900;">
            Ficha de la Partitura:
          </h3>
          <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #334155; line-height: 1.8;">
            <li><strong>Título de la Obra:</strong> ${scoreTitle}</li>
            <li><strong>Compositor:</strong> ${artisticName || composerName}</li>
            <li><strong>Categoría / Género:</strong> ${genre || "Piano Solo"}</li>
            <li><strong>Nivel de Dificultad:</strong> ${difficulty || "Intermedio"}</li>
            <li><strong>Precio Sugerido:</strong> $${(priceCop || 0).toLocaleString("es-CO")} COP</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 28px;">
          <a href="${adminDashboardUrl}" style="background-color: #0071BC; color: #ffffff; padding: 14px 28px; font-size: 13px; font-weight: 900; text-decoration: none; border-radius: 12px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px;">
            Inspeccionar y Moderar Partitura
          </a>
        </div>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 18px; text-align: center; font-size: 10px; color: #94a3b8;">
        © 2026 Piano Colombia · Plataforma de Curaduría Editorial
      </div>
    </div>
  </body>
  </html>
  `
}

export function generateScoreApprovedHTML({
  composerName,
  artisticName,
  scoreTitle,
  storeUrl = "http://localhost:3000/tienda",
}: {
  composerName: string
  artisticName?: string
  scoreTitle: string
  storeUrl?: string
}) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>¡Tu Partitura ha sido Aprobada! - Piano Colombia</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #F9F9FF; margin: 0; padding: 24px; color: #111C2D;">
    <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
      <div style="text-align: center; border-bottom: 2px solid #F0F3FF; padding-bottom: 20px;">
        <span style="display: inline-block; padding: 4px 12px; background: #ECFDF5; color: #065F46; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
          🎉 Obra Aprobada & Publicada
        </span>
        <h1 style="font-size: 24px; font-weight: 900; margin: 12px 0 4px; color: #111C2D;">PIANO COLOMBIA</h1>
        <p style="font-size: 12px; color: #64748b; margin: 0; font-weight: bold;">Comité Editorial y Musicología</p>
      </div>

      <div style="padding: 24px 0;">
        <p style="font-size: 15px; color: #111C2D; font-weight: bold; margin-top: 0;">
          ¡Felicitaciones, ${artisticName || composerName}!
        </p>
        <p style="font-size: 13px; color: #475569; line-height: 1.6;">
          Nos complace informarte que tu obra <strong>"${scoreTitle}"</strong> ha superado con éxito la revisión técnica y musicológica.
        </p>
        <p style="font-size: 13px; color: #475569; line-height: 1.6;">
          Tu partitura ya se encuentra <strong>publicada y visible en el catálogo de la tienda de Piano Colombia</strong>, con sus muestras protegidas y lista para ser adquirida por pianistas y estudiantes de todo el mundo.
        </p>

        <div style="text-align: center; margin-top: 28px;">
          <a href="${storeUrl}" style="background-color: #10B981; color: #ffffff; padding: 14px 28px; font-size: 13px; font-weight: 900; text-decoration: none; border-radius: 12px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px;">
            Ver Catálogo en la Tienda
          </a>
        </div>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 18px; text-align: center; font-size: 10px; color: #94a3b8;">
        © 2026 Piano Colombia · Difusión y Conservación del Repertorio Pianístico
      </div>
    </div>
  </body>
  </html>
  `
}

export function generateScoreRejectedHTML({
  composerName,
  artisticName,
  scoreTitle,
  observations,
  dashboardUrl = "http://localhost:3000/compositor/dashboard",
}: {
  composerName: string
  artisticName?: string
  scoreTitle: string
  observations: string
  dashboardUrl?: string
}) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Observaciones a tu Partitura - Piano Colombia</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #F9F9FF; margin: 0; padding: 24px; color: #111C2D;">
    <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
      <div style="text-align: center; border-bottom: 2px solid #F0F3FF; padding-bottom: 20px;">
        <span style="display: inline-block; padding: 4px 12px; background: #FEF3C7; color: #92400E; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
          ⚠️ Observaciones de Moderación
        </span>
        <h1 style="font-size: 24px; font-weight: 900; margin: 12px 0 4px; color: #111C2D;">PIANO COLOMBIA</h1>
        <p style="font-size: 12px; color: #64748b; margin: 0; font-weight: bold;">Comité Editorial de Partituras</p>
      </div>

      <div style="padding: 24px 0;">
        <p style="font-size: 15px; color: #111C2D; font-weight: bold; margin-top: 0;">
          Estimado(a) ${artisticName || composerName},
        </p>
        <p style="font-size: 13px; color: #475569; line-height: 1.6;">
          El comité editorial revisó tu obra <strong>"${scoreTitle}"</strong> y ha identificado algunos puntos que requieren tu ajuste antes de autorizar su publicación en la tienda:
        </p>

        <div style="background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 16px; padding: 20px; margin: 20px 0;">
          <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #92400E; margin-top: 0; margin-bottom: 8px; font-weight: 900;">
            Observaciones del Moderador:
          </h3>
          <p style="font-size: 13px; color: #78350F; line-height: 1.6; margin: 0; font-style: italic;">
            "${observations || "Por favor verifica la legibilidad del PDF, la inclusión de armadura/compás claros o la correcta numeración de compases."}"
          </p>
        </div>

        <p style="font-size: 13px; color: #475569; line-height: 1.6;">
          Puedes ingresar a tu panel de compositor, corregir tu archivo o información y <strong>volver a enviar la partitura a revisión</strong>. Una vez resueltas las observaciones, evaluaremos de inmediato su publicación.
        </p>

        <div style="text-align: center; margin-top: 28px;">
          <a href="${dashboardUrl}" style="background-color: #0071BC; color: #ffffff; padding: 14px 28px; font-size: 13px; font-weight: 900; text-decoration: none; border-radius: 12px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px;">
            Ir al Panel de Compositor
          </a>
        </div>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 18px; text-align: center; font-size: 10px; color: #94a3b8;">
        © 2026 Piano Colombia · Mesa Editorial
      </div>
    </div>
  </body>
  </html>
  `
}

