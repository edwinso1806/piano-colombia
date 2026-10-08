import nodemailer from "nodemailer"

export type EmailLanguage = "es" | "en"

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

/**
 * Extrae de forma inteligente el idioma solicitado ("es" | "en") a partir de una solicitud HTTP:
 * 1. Body: req.body?.lang o req.body?.language o req.body?.preferred_language
 * 2. Query: req.query?.lang o req.query?.language
 * 3. Headers: "x-language", "x-lang"
 * 4. Header estándar: "accept-language"
 */
export function extractLanguage(req?: any, fallback: EmailLanguage = "es"): EmailLanguage {
  if (!req) return fallback

  const bodyLang = req.body?.lang || req.body?.language || req.body?.preferred_language
  if (bodyLang === "en" || bodyLang === "es") return bodyLang

  const queryLang = req.query?.lang || req.query?.language
  if (queryLang === "en" || queryLang === "es") return queryLang

  const customHeader = req.headers?.["x-language"] || req.headers?.["x-lang"]
  if (customHeader === "en" || customHeader === "es") return customHeader

  const acceptLang = req.headers?.["accept-language"]
  if (typeof acceptLang === "string") {
    const lower = acceptLang.toLowerCase()
    if (lower.startsWith("en") || (lower.includes("en") && !lower.includes("es"))) {
      return "en"
    }
  }

  return fallback
}

/**
 * Catálogo bilingüe de asuntos de correo transaccionales
 */
export const EMAIL_SUBJECTS = {
  buyerPurchase: {
    es: (scoreTitle: string) => `🎹 Tu Partitura: "${scoreTitle}" ya está disponible para descarga`,
    en: (scoreTitle: string) => `🎹 Your Sheet Music: "${scoreTitle}" is ready for download`,
  },
  otpVerification: {
    es: (code: string) => `🔐 Tu código de verificación de Piano Colombia: ${code}`,
    en: (code: string) => `🔐 Your Piano Colombia verification code: ${code}`,
  },
  composerOtpVerification: {
    es: (code: string) => `🔐 Código de Verificación - Registro de Compositor Piano Colombia: ${code}`,
    en: (code: string) => `🔐 Verification Code - Piano Colombia Composer Registration: ${code}`,
  },
  passwordReset: {
    es: (code: string) => `🔑 Código OTP: ${code} - Restablecimiento de Contraseña Piano Colombia`,
    en: (code: string) => `🔑 OTP Code: ${code} - Password Reset Piano Colombia`,
  },
  passwordChanged: {
    es: "Tu contraseña ha sido actualizada - Piano Colombia",
    en: "Your password has been updated - Piano Colombia",
  },
  composerApproved: {
    es: "🎉 ¡Tu perfil de compositor ha sido aprobado en Piano Colombia!",
    en: "🎉 Your composer profile has been approved on Piano Colombia!",
  },
  composerRejected: {
    es: "⚠️ Observaciones a tu solicitud de Compositor - Piano Colombia",
    en: "⚠️ Information Review Required - Piano Colombia Composer Application",
  },
  composerBlocked: {
    es: "🚫 Notificación Oficial: Solicitud No Aceptada - Piano Colombia",
    en: "🚫 Official Notice: Application Declined - Piano Colombia",
  },
  scoreApproved: {
    es: (scoreTitle: string) => `🎉 ¡Tu Partitura "${scoreTitle}" ha sido Aprobada! - Piano Colombia`,
    en: (scoreTitle: string) => `🎉 Your Sheet Music "${scoreTitle}" has been Approved! - Piano Colombia`,
  },
  scoreRejected: {
    es: (scoreTitle: string) => `⚠️ Observaciones de Revisión en tu Partitura "${scoreTitle}" - Piano Colombia`,
    en: (scoreTitle: string) => `⚠️ Editorial Review Observations for "${scoreTitle}" - Piano Colombia`,
  },
  composerPayout: {
    es: (batchNumber: string) => `💰 [Piano Colombia] Liquidación de Regalías Procesada - ${batchNumber}`,
    en: (batchNumber: string) => `💰 [Piano Colombia] Royalty Payout Processed - ${batchNumber}`,
  },
  adminInvitation: {
    es: "🔐 Invitación a Consola Administrativa - Piano Colombia",
    en: "🔐 Invitation to Admin Console - Piano Colombia",
  },
  adminNewComposer: {
    es: (artisticName: string) => `🚨 Nueva Solicitud de Compositor Pendiente de Aprobación - ${artisticName}`,
    en: (artisticName: string) => `🚨 New Composer Application Pending Approval - ${artisticName}`,
  },
  adminProfileUpdated: {
    es: (artisticName: string) => `🚨 Modificación de Perfil de Compositor - ${artisticName}`,
    en: (artisticName: string) => `🚨 Composer Profile Modification - ${artisticName}`,
  },
  adminScoreSubmitted: {
    es: (scoreTitle: string) => `🎼 Nueva Partitura en Cola de Revisión: "${scoreTitle}"`,
    en: (scoreTitle: string) => `🎼 New Sheet Music in Review Queue: "${scoreTitle}"`,
  },
  welcomeCustomer: {
    es: "¡Bienvenido a Piano Colombia! Tu cuenta ha sido creada",
    en: "Welcome to Piano Colombia! Your account has been created",
  },
}

// -------------------------------------------------------------------------------------------
// 1. COMPRA DE PARTITURA POR COMPRADOR (BUYER PURCHASE NOTIFICATION)
// -------------------------------------------------------------------------------------------
export function generateBuyerPurchaseHTML({
  buyerName,
  scoreTitle,
  composerName,
  downloadUrl,
  token,
  priceCop,
  lang = "es",
}: {
  buyerName: string
  scoreTitle: string
  composerName: string
  downloadUrl: string
  token: string
  priceCop: number
  lang?: EmailLanguage
}) {
  const isEn = lang === "en"
  const formattedPrice = `$${Number(priceCop).toLocaleString(isEn ? "en-US" : "es-CO")} COP`

  const texts = isEn
    ? {
        docTitle: "Your Sheet Music - Piano Colombia",
        badge: "Marketplace & Digital Urtext Archive",
        greeting: `Thank you for your purchase, ${buyerName}!`,
        intro: "Your payment via Wompi has been successfully approved. Your official sheet music in Urtext PDF format is now ready for download with your <strong>personal legal license watermark</strong>.",
        pieceLabel: "🎼 Piece:",
        composerLabel: "🎹 Composer:",
        paidLabel: "💳 Amount Paid:",
        tokenLabel: "Download Token:",
        ctaButton: "📥 Download Watermarked PDF",
        legalNote: "This license is personal and non-transferable. It includes 1 authorized print copy for individual study or concert performance.",
        footer: "© 2026 Piano Colombia · Colombian Piano Heritage & Urtext Repertoire",
      }
    : {
        docTitle: "Tu Partitura de Piano Colombia",
        badge: "Marketplace & Archivo Digital Urtext",
        greeting: `¡Gracias por tu compra, ${buyerName}!`,
        intro: "Tu pago a través de Wompi ha sido aprobado exitosamente. Ya puedes descargar tu partitura oficial en formato PDF Urtext con tu <strong>licencia legal nominativa estampada</strong>.",
        pieceLabel: "🎼 Obra:",
        composerLabel: "🎹 Compositor:",
        paidLabel: "💳 Valor Pagado:",
        tokenLabel: "Token de Descarga:",
        ctaButton: "📥 Descargar Partitura PDF Firmada",
        legalNote: "Esta licencia es nominal e intransferible. Incluye 1 copia impresa autorizada para estudio o concierto.",
        footer: "© 2026 Piano Colombia · Obra, Patrimonio y Música Pianística Colombiana",
      }

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>${texts.docTitle}</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #F9F9FF; margin: 0; padding: 24px; color: #111C2D;">
    <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px;">
      <div style="text-align: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px;">
        <h1 style="font-size: 20px; font-weight: 900; margin: 0; color: #111C2D; letter-spacing: -0.5px;">PIANO COLOMBIA</h1>
        <p style="font-size: 10px; text-transform: uppercase; color: #64748b; margin-top: 4px; font-weight: bold; letter-spacing: 1px;">${texts.badge}</p>
      </div>
      
      <div style="padding: 24px 0;">
        <h2 style="font-size: 18px; color: #111C2D; margin-top: 0;">${texts.greeting}</h2>
        <p style="font-size: 13px; color: #475569; line-height: 1.6;">${texts.intro}</p>
        
        <div style="background: #F0F3FF; border: 1px solid #dbeafe; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 12px;">
          <p style="margin: 4px 0; color: #0071BC; font-weight: bold;">${texts.pieceLabel} ${scoreTitle}</p>
          <p style="margin: 4px 0; color: #334155;">${texts.composerLabel} ${composerName}</p>
          <p style="margin: 4px 0; color: #334155;">${texts.paidLabel} ${formattedPrice}</p>
          <p style="margin: 4px 0; color: #64748b; font-family: monospace; font-size: 11px;">${texts.tokenLabel} ${token}</p>
        </div>

        <div style="text-align: center; margin: 24px 0 16px;">
          <a href="${downloadUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; background: #FBB03B; color: #111C2D; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(251,176,59,0.35);">
            ${texts.ctaButton}
          </a>
        </div>

        <p style="font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.5; margin-top: 20px;">
          ${texts.legalNote}
        </p>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; text-align: center; font-size: 10px; color: #94a3b8;">
        ${texts.footer}
      </div>
    </div>
  </body>
  </html>
  `
}

// -------------------------------------------------------------------------------------------
// 2. CÓDIGO OTP DE VERIFICACIÓN (OTP REGISTRATION / AUTH)
// -------------------------------------------------------------------------------------------
export function generateOtpEmailHTML({
  userName,
  otpCode,
  lang = "es",
}: {
  userName: string
  otpCode: string
  lang?: EmailLanguage
}) {
  const isEn = lang === "en"
  const texts = isEn
    ? {
        docTitle: "Verification Code - Piano Colombia",
        badge: "Sheet Music Archive & Publisher",
        heading: "Verify your email address",
        intro: `Hello <strong>${userName}</strong>, you are one step away from completing your account on Piano Colombia. Enter the following 6-digit security code on the verification screen:`,
        expiry: "⏱️ This code is valid for the next <strong>10 minutes</strong>. If you did not request this account, you can safely ignore this email.",
        footer: "© 2026 Piano Colombia · Security & User Authentication",
      }
    : {
        docTitle: "Código de Verificación - Piano Colombia",
        badge: "Archivo & Editorial de Partituras",
        heading: "Verifica tu correo electrónico",
        intro: `Hola <strong>${userName}</strong>, estás a un paso de crear tu cuenta en Piano Colombia. Ingresa el siguiente código de seguridad de 6 dígitos en la pantalla de registro:`,
        expiry: "⏱️ Este código es válido durante los próximos <strong>10 minutos</strong>. Si tú no solicitaste esta cuenta, puedes ignorar este mensaje de forma segura.",
        footer: "© 2026 Piano Colombia · Seguridad y Autenticación de Usuarios",
      }

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>${texts.docTitle}</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #F9F9FF; margin: 0; padding: 24px; color: #111C2D;">
    <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px;">
      <div style="text-align: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px;">
        <h1 style="font-size: 20px; font-weight: 900; margin: 0; color: #111C2D; letter-spacing: -0.5px;">PIANO COLOMBIA</h1>
        <p style="font-size: 10px; text-transform: uppercase; color: #64748b; margin-top: 4px; font-weight: bold; letter-spacing: 1px;">${texts.badge}</p>
      </div>
      
      <div style="padding: 24px 0; text-align: center;">
        <div style="width: 56px; height: 56px; background-color: #F0F3FF; border-radius: 16px; margin: 0 auto 16px; line-height: 56px; font-size: 24px;">
          🔐
        </div>
        
        <h2 style="font-size: 18px; color: #111C2D; margin-top: 0;">${texts.heading}</h2>
        <p style="font-size: 13px; color: #475569; line-height: 1.6; max-width: 420px; margin: 0 auto 20px;">
          ${texts.intro}
        </p>
        
        <div style="background: #F0F3FF; border: 2px dashed #0071BC; border-radius: 14px; padding: 18px; margin: 24px auto; max-width: 280px; letter-spacing: 8px; font-size: 32px; font-weight: 900; color: #0071BC; font-family: monospace;">
          ${otpCode}
        </div>

        <p style="font-size: 11px; color: #64748b; margin-top: 20px; line-height: 1.5;">
          ${texts.expiry}
        </p>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; text-align: center; font-size: 10px; color: #94a3b8;">
        ${texts.footer}
      </div>
    </div>
  </body>
  </html>
  `
}

// -------------------------------------------------------------------------------------------
// 3. RECUPERACIÓN DE CONTRASEÑA (PASSWORD RESET OTP)
// -------------------------------------------------------------------------------------------
export function generatePasswordResetEmailHTML({
  userName,
  otpCode,
  role = "cliente",
  lang = "es",
}: {
  userName: string
  otpCode: string
  role?: string
  lang?: EmailLanguage
}) {
  const isEn = lang === "en"
  const roleLabelEs = role === "composer" ? "Compositor" : role === "admin" ? "Administrador" : "Cliente"
  const roleLabelEn = role === "composer" ? "Composer" : role === "admin" ? "Administrator" : "Customer"

  const texts = isEn
    ? {
        docTitle: "Password Reset - Piano Colombia",
        badge: `Account Security · ${roleLabelEn}`,
        heading: "Reset your Password",
        intro: `Hello <strong>${userName}</strong>, we received a request to reset the password for your account on Piano Colombia. Enter the following 6-digit security code:`,
        expiry: "⏱️ This code will expire in <strong>10 minutes</strong>. If you did not make this request, you can safely ignore this email; your current password remains secure.",
        footer: "© 2026 Piano Colombia · Secure Sheet Music Platform",
      }
    : {
        docTitle: "Recuperación de Contraseña - Piano Colombia",
        badge: `Seguridad de Cuenta · ${roleLabelEs}`,
        heading: "Restablece tu Contraseña",
        intro: `Hola <strong>${userName}</strong>, hemos recibido una solicitud para cambiar la contraseña de tu cuenta en Piano Colombia. Ingresa este código de seguridad de 6 dígitos:`,
        expiry: "⏱️ Este código expirará en <strong>10 minutos</strong>. Si tú no realizaste esta solicitud, puedes ignorar este correo; tu contraseña actual permanecerá segura.",
        footer: "© 2026 Piano Colombia · Plataforma Segura de Partituras",
      }

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>${texts.docTitle}</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #F9F9FF; margin: 0; padding: 24px; color: #111C2D;">
    <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px;">
      <div style="text-align: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px;">
        <h1 style="font-size: 20px; font-weight: 900; margin: 0; color: #111C2D; letter-spacing: -0.5px;">PIANO COLOMBIA</h1>
        <p style="font-size: 10px; text-transform: uppercase; color: #64748b; margin-top: 4px; font-weight: bold; letter-spacing: 1px;">${texts.badge}</p>
      </div>
      
      <div style="padding: 24px 0; text-align: center;">
        <div style="width: 56px; height: 56px; background-color: #FFF7ED; border-radius: 16px; margin: 0 auto 16px; line-height: 56px; font-size: 24px;">
          🔑
        </div>
        
        <h2 style="font-size: 18px; color: #111C2D; margin-top: 0;">${texts.heading}</h2>
        <p style="font-size: 13px; color: #475569; line-height: 1.6; max-width: 420px; margin: 0 auto 20px;">
          ${texts.intro}
        </p>
        
        <div style="background: #FFF7ED; border: 2px dashed #EA580C; border-radius: 14px; padding: 18px; margin: 24px auto; max-width: 280px; letter-spacing: 8px; font-size: 32px; font-weight: 900; color: #C2410C; font-family: monospace;">
          ${otpCode}
        </div>

        <p style="font-size: 11px; color: #64748b; margin-top: 20px; line-height: 1.5;">
          ${texts.expiry}
        </p>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; text-align: center; font-size: 10px; color: #94a3b8;">
        ${texts.footer}
      </div>
    </div>
  </body>
  </html>
  `
}

// -------------------------------------------------------------------------------------------
// 4. CONFIRMACIÓN DE CONTRASEÑA ACTUALIZADA (PASSWORD CHANGED)
// -------------------------------------------------------------------------------------------
export function generatePasswordChangedEmailHTML({
  userName,
  lang = "es",
}: {
  userName: string
  lang?: EmailLanguage
}) {
  const isEn = lang === "en"
  const texts = isEn
    ? {
        docTitle: "Password Updated - Piano Colombia",
        heading: "Your password has been changed",
        body: `Hello <strong>${userName}</strong>, we are letting you know that the password for your Piano Colombia account has been successfully modified.`,
        securityNote: "If you did not perform this action, please contact our support team immediately at <strong>soporte@pianocolombia.com</strong>.",
        footer: "© 2026 Piano Colombia · User Security & Authentication",
      }
    : {
        docTitle: "Contraseña Actualizada - Piano Colombia",
        heading: "Tu contraseña ha sido cambiada",
        body: `Hola <strong>${userName}</strong>, te informamos que la contraseña de tu cuenta en Piano Colombia ha sido modificada exitosamente.`,
        securityNote: "Si no reconoces esta acción, por favor ponte en contacto con nuestro equipo de soporte inmediatamente a <strong>soporte@pianocolombia.com</strong>.",
        footer: "© 2026 Piano Colombia · Seguridad y Autenticación de Usuarios",
      }

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>${texts.docTitle}</title>
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
        
        <h2 style="font-size: 18px; color: #111C2D; margin-top: 0;">${texts.heading}</h2>
        <p style="font-size: 13px; color: #475569; line-height: 1.6; max-width: 420px; margin: 0 auto 20px;">
          ${texts.body}
        </p>
        <p style="font-size: 12px; color: #64748b;">
          ${texts.securityNote}
        </p>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; text-align: center; font-size: 10px; color: #94a3b8;">
        ${texts.footer}
      </div>
    </div>
  </body>
  </html>
  `
}

// -------------------------------------------------------------------------------------------
// 5. COMPOSITOR APROBADO (COMPOSER APPROVED)
// -------------------------------------------------------------------------------------------
export function generateComposerApprovedHTML({
  composerName,
  artisticName,
  loginUrl = "http://localhost:3000/compositor/login",
  lang = "es",
}: {
  composerName: string
  artisticName?: string
  loginUrl?: string
  lang?: EmailLanguage
}) {
  const isEn = lang === "en"
  const name = artisticName || composerName

  const texts = isEn
    ? {
        docTitle: "🎉 Your composer profile has been approved on Piano Colombia!",
        badge: "Application Approved",
        platformTag: "Official Colombian Piano Music Platform",
        salutation: `Congratulations, Maestro ${name}! 🎹`,
        body: "We are pleased to inform you that the Piano Colombia curation and moderation team has reviewed and <strong>successfully approved</strong> your composer profile.",
        nextStepTitle: "✨ Next Step: Publishing Your Sheet Music",
        nextStepBody: "Please remember that for your official composer profile to become visible to the public in the Piano Colombia catalog, you must have at least <strong>one approved sheet music score</strong>. You can now access your author dashboard and upload your scores for technical review.",
        ctaButton: "🚀 Log into Composer Portal",
        footer: "© 2026 Piano Colombia · Preservation & Diffusion of Musical Heritage",
      }
    : {
        docTitle: "🎉 ¡Tu perfil ha sido aprobado en Piano Colombia!",
        badge: "Solicitud Aprobada",
        platformTag: "Plataforma Oficial de Música para Piano",
        salutation: `¡Felicitaciones, maestro(a) ${name}! 🎹`,
        body: "Nos complace informarte que el equipo de moderación y administración de <strong>Piano Colombia</strong> ha revisado y <strong>aprobado satisfactoriamente</strong> tu perfil de compositor.",
        nextStepTitle: "✨ Próximo paso: Publicación de tus Obras",
        nextStepBody: "Recuerda que para que tu perfil oficial de compositor sea visible al público en la tienda de <strong>Piano Colombia</strong>, debes tener al menos <strong>una partitura aprobada</strong>. Ya puedes ingresar a tu panel de autor y cargar tus obras para revisión técnica.",
        ctaButton: "🚀 Ingresar a mi Panel de Compositor",
        footer: "© 2026 Piano Colombia · Conservación y Difusión del Patrimonio Musical",
      }

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>${texts.docTitle}</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #F9F9FF; margin: 0; padding: 24px; color: #111C2D;">
    <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
      
      <div style="text-align: center; border-bottom: 2px solid #F0F3FF; padding-bottom: 20px;">
        <span style="display: inline-block; padding: 4px 12px; background: #ECFDF5; color: #047857; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
          ${texts.badge}
        </span>
        <h1 style="font-size: 24px; font-weight: 900; margin: 12px 0 4px; color: #111C2D; letter-spacing: -0.5px;">PIANO COLOMBIA</h1>
        <p style="font-size: 12px; color: #0071BC; margin: 0; font-weight: bold;">${texts.platformTag}</p>
      </div>

      <div style="padding: 24px 0;">
        <p style="font-size: 15px; color: #111C2D; font-weight: bold; margin-top: 0;">
          ${texts.salutation}
        </p>
        <p style="font-size: 13px; color: #475569; line-height: 1.6;">
          ${texts.body}
        </p>

        <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 16px; padding: 20px; margin: 24px 0;">
          <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #15803D; margin-top: 0; margin-bottom: 8px; font-weight: 900;">
            ${texts.nextStepTitle}
          </h3>
          <p style="font-size: 12px; color: #166534; line-height: 1.5; margin: 0;">
            ${texts.nextStepBody}
          </p>
        </div>

        <div style="text-align: center; margin: 28px 0 12px;">
          <a href="${loginUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; background: #FBB03B; color: #111C2D; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(251,176,59,0.3);">
            ${texts.ctaButton}
          </a>
        </div>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 18px; text-align: center; font-size: 10px; color: #94a3b8;">
        ${texts.footer}
      </div>
    </div>
  </body>
  </html>
  `
}

// -------------------------------------------------------------------------------------------
// 6. OBSERVACIONES / RECHAZO TEMPORAL DE COMPOSITOR (COMPOSER REJECTED / REVIEW)
// -------------------------------------------------------------------------------------------
export function generateComposerRejectedHTML({
  composerName,
  artisticName,
  observations,
  dashboardUrl = "http://localhost:3000/compositor/login",
  lang = "es",
}: {
  composerName: string
  artisticName?: string
  observations: string
  dashboardUrl?: string
  lang?: EmailLanguage
}) {
  const isEn = lang === "en"
  const name = artisticName || composerName

  const texts = isEn
    ? {
        docTitle: "⚠️ Information Review Required - Piano Colombia Composer Application",
        badge: "Information Review Required",
        committee: "Moderation & Curation Committee",
        salutation: `Dear ${name},`,
        body: "Our curation team has reviewed your application to join the <strong>Piano Colombia</strong> authors catalog. In order for your application to be approved, please review and adjust the following details:",
        obsTitle: "📝 Moderator / Admin Observations:",
        resubmitBox: "<strong>🔄 You can re-submit your profile:</strong> Log into your profile dashboard, update the requested fields, and click <strong>\"Submit Profile for Review\"</strong>. Our administrators will be immediately notified to re-evaluate your profile.",
        ctaButton: "✏️ Update Information & Re-submit Profile",
        footer: "© 2026 Piano Colombia · Author Moderation Notification",
      }
    : {
        docTitle: "⚠️ Observaciones a tu solicitud de Compositor - Piano Colombia",
        badge: "Revisión de Información Requerida",
        committee: "Comité de Moderación y Curaduría",
        salutation: `Estimado(a) ${name},`,
        body: "El equipo de moderación ha revisado tu postulación para unirte al catálogo de autores de <strong>Piano Colombia</strong>. Para que tu solicitud pueda ser aprobada formalmente, requerimos que organices y ajustes la siguiente información:",
        obsTitle: "📝 Observaciones del Administrador / Moderador:",
        resubmitBox: "<strong>🔄 Puedes volver a postularte:</strong> Ingresa a tu panel de perfil, actualiza los campos señalados en las observaciones y haz clic en <strong>\"Enviar Perfil a Revisión\"</strong>. Tan pronto lo hagas, nuestros administradores y moderadores recibirán una notificación para reevaluar tu perfil.",
        ctaButton: "✏️ Corregir Información y Reenviar Perfil",
        footer: "© 2026 Piano Colombia · Notificación de Moderación de Autores",
      }

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>${texts.docTitle}</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #F9F9FF; margin: 0; padding: 24px; color: #111C2D;">
    <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
      
      <div style="text-align: center; border-bottom: 2px solid #F0F3FF; padding-bottom: 20px;">
        <span style="display: inline-block; padding: 4px 12px; background: #FFFBEB; color: #B45309; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
          ${texts.badge}
        </span>
        <h1 style="font-size: 24px; font-weight: 900; margin: 12px 0 4px; color: #111C2D; letter-spacing: -0.5px;">PIANO COLOMBIA</h1>
        <p style="font-size: 12px; color: #C1272D; margin: 0; font-weight: bold;">${texts.committee}</p>
      </div>

      <div style="padding: 24px 0;">
        <p style="font-size: 15px; color: #111C2D; font-weight: bold; margin-top: 0;">
          ${texts.salutation}
        </p>
        <p style="font-size: 13px; color: #475569; line-height: 1.6;">
          ${texts.body}
        </p>

        <div style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: 16px; padding: 20px; margin: 24px 0;">
          <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #991B1B; margin-top: 0; margin-bottom: 10px; font-weight: 900;">
            ${texts.obsTitle}
          </h3>
          <div style="font-size: 13px; color: #7F1D1D; line-height: 1.6; font-style: italic; white-space: pre-line; background: #ffffff; padding: 14px; border-radius: 10px; border: 1px solid #FCA5A5;">
            "${observations || (isEn ? "Please review author photo, biography accuracy, or entered banking details." : "Por favor revisa la fotografía de autor, la precisión biográfica o los datos bancarios ingresados.")}"
          </div>
        </div>

        <div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 14px; padding: 16px; margin: 20px 0; font-size: 12px; color: #1E40AF; line-height: 1.6;">
          ${texts.resubmitBox}
        </div>

        <div style="text-align: center; margin: 28px 0 12px;">
          <a href="${dashboardUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; background: #0071BC; color: #ffffff; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,113,188,0.3);">
            ${texts.ctaButton}
          </a>
        </div>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 18px; text-align: center; font-size: 10px; color: #94a3b8;">
        ${texts.footer}
      </div>
    </div>
  </body>
  </html>
  `
}

// -------------------------------------------------------------------------------------------
// 7. COMPOSITOR BLOQUEADO DEFINITIVAMENTE (COMPOSER BLOCKED)
// -------------------------------------------------------------------------------------------
export function generateComposerBlockedHTML({
  composerName,
  artisticName,
  reason,
  lang = "es",
}: {
  composerName: string
  artisticName?: string
  reason?: string
  lang?: EmailLanguage
}) {
  const isEn = lang === "en"
  const name = artisticName || composerName

  const texts = isEn
    ? {
        docTitle: "Official Notice - Piano Colombia",
        badge: "Final Decision",
        directorate: "General Directorate of Curation & Moderation",
        salutation: `Dear ${name},`,
        body: "We inform you that following the review of your submissions, the <strong>Piano Colombia</strong> administration has made a final determination <strong>not to approve your application</strong> to join our authors catalog.",
        reasonTitle: "Reason for Final Determination:",
        defaultReason: "The maximum number of attempts allowed to meet editorial, curatorial, or documentation standards has been reached.",
        closing: "We appreciate your interest in Piano Colombia. Access to your composer account has been permanently disabled.",
        footer: "© 2026 Piano Colombia · Official Administration Notice",
      }
    : {
        docTitle: "Notificación Oficial - Piano Colombia",
        badge: "Resolución Definitiva",
        directorate: "Dirección General de Curaduría y Moderación",
        salutation: `Estimado(a) ${name},`,
        body: "Te informamos que tras evaluar tus solicitudes e intentos reiterados de postulación a la plataforma, la administración de <strong>Piano Colombia</strong> ha determinado <strong>no aceptar tu solicitud de forma definitiva</strong> para formar parte de nuestro catálogo de autores.",
        reasonTitle: "Motivo de la Decisión Definitiva:",
        defaultReason: "Se ha superado el límite de intentos permitidos para subsanar los requisitos curatoriales o documentales de la plataforma.",
        closing: "Agradecemos tu interés en Piano Colombia. El acceso a tu cuenta de compositor ha sido suspendido definitivamente.",
        footer: "© 2026 Piano Colombia · Notificación Oficial de Administración",
      }

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>${texts.docTitle}</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #F9F9FF; margin: 0; padding: 24px; color: #111C2D;">
    <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
      
      <div style="text-align: center; border-bottom: 2px solid #F0F3FF; padding-bottom: 20px;">
        <span style="display: inline-block; padding: 4px 12px; background: #FEE2E2; color: #991B1B; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
          ${texts.badge}
        </span>
        <h1 style="font-size: 24px; font-weight: 900; margin: 12px 0 4px; color: #111C2D; letter-spacing: -0.5px;">PIANO COLOMBIA</h1>
        <p style="font-size: 12px; color: #64748b; margin: 0; font-weight: bold;">${texts.directorate}</p>
      </div>

      <div style="padding: 24px 0;">
        <p style="font-size: 15px; color: #111C2D; font-weight: bold; margin-top: 0;">
          ${texts.salutation}
        </p>
        <p style="font-size: 13px; color: #475569; line-height: 1.6;">
          ${texts.body}
        </p>

        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 20px; margin: 24px 0;">
          <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; margin-top: 0; margin-bottom: 10px; font-weight: 900;">
            ${texts.reasonTitle}
          </h3>
          <p style="font-size: 13px; color: #334155; line-height: 1.6; margin: 0; font-style: italic;">
            "${reason || texts.defaultReason}"
          </p>
        </div>

        <p style="font-size: 12px; color: #64748b; line-height: 1.6;">
          ${texts.closing}
        </p>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 18px; text-align: center; font-size: 10px; color: #94a3b8;">
        ${texts.footer}
      </div>
    </div>
  </body>
  </html>
  `
}

// -------------------------------------------------------------------------------------------
// 8. PARTITURA APROBADA (SCORE APPROVED)
// -------------------------------------------------------------------------------------------
export function generateScoreApprovedHTML({
  composerName,
  artisticName,
  scoreTitle,
  storeUrl = "http://localhost:3000/tienda",
  lang = "es",
}: {
  composerName: string
  artisticName?: string
  scoreTitle: string
  storeUrl?: string
  lang?: EmailLanguage
}) {
  const isEn = lang === "en"
  const name = artisticName || composerName

  const texts = isEn
    ? {
        docTitle: `Your Sheet Music has been Approved! - Piano Colombia`,
        badge: "🎉 Sheet Music Approved & Published",
        committee: "Editorial Board & Musicology",
        salutation: `Congratulations, ${name}!`,
        p1: `We are pleased to inform you that your piece <strong>"${scoreTitle}"</strong> has successfully passed our technical and musicological review.`,
        p2: "Your sheet music is now <strong>published and active in the Piano Colombia store catalog</strong>, with protected previews, ready to be purchased and studied by pianists worldwide.",
        ctaButton: "View in Store Catalog",
        footer: "© 2026 Piano Colombia · Diffusion & Preservation of Piano Repertoire",
      }
    : {
        docTitle: "¡Tu Partitura ha sido Aprobada! - Piano Colombia",
        badge: "🎉 Obra Aprobada & Publicada",
        committee: "Comité Editorial y Musicología",
        salutation: `¡Felicitaciones, ${name}!`,
        p1: `Nos complace informarte que tu obra <strong>"${scoreTitle}"</strong> ha superado con éxito la revisión técnica y musicológica.`,
        p2: "Tu partitura ya se encuentra <strong>publicada y visible en el catálogo de la tienda de Piano Colombia</strong>, con sus muestras protegidas y lista para ser adquirida por pianistas y estudiantes de todo el mundo.",
        ctaButton: "Ver Catálogo en la Tienda",
        footer: "© 2026 Piano Colombia · Difusión y Conservación del Repertorio Pianístico",
      }

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>${texts.docTitle}</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #F9F9FF; margin: 0; padding: 24px; color: #111C2D;">
    <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
      <div style="text-align: center; border-bottom: 2px solid #F0F3FF; padding-bottom: 20px;">
        <span style="display: inline-block; padding: 4px 12px; background: #ECFDF5; color: #065F46; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
          ${texts.badge}
        </span>
        <h1 style="font-size: 24px; font-weight: 900; margin: 12px 0 4px; color: #111C2D;">PIANO COLOMBIA</h1>
        <p style="font-size: 12px; color: #64748b; margin: 0; font-weight: bold;">${texts.committee}</p>
      </div>

      <div style="padding: 24px 0;">
        <p style="font-size: 15px; color: #111C2D; font-weight: bold; margin-top: 0;">
          ${texts.salutation}
        </p>
        <p style="font-size: 13px; color: #475569; line-height: 1.6;">
          ${texts.p1}
        </p>
        <p style="font-size: 13px; color: #475569; line-height: 1.6;">
          ${texts.p2}
        </p>

        <div style="text-align: center; margin-top: 28px;">
          <a href="${storeUrl}" style="background-color: #10B981; color: #ffffff; padding: 14px 28px; font-size: 13px; font-weight: 900; text-decoration: none; border-radius: 12px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px;">
            ${texts.ctaButton}
          </a>
        </div>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 18px; text-align: center; font-size: 10px; color: #94a3b8;">
        ${texts.footer}
      </div>
    </div>
  </body>
  </html>
  `
}

// -------------------------------------------------------------------------------------------
// 9. OBSERVACIONES / RECHAZO DE PARTITURA (SCORE REJECTED / REVIEW)
// -------------------------------------------------------------------------------------------
export function generateScoreRejectedHTML({
  composerName,
  artisticName,
  scoreTitle,
  observations,
  dashboardUrl = "http://localhost:3000/compositor/dashboard",
  lang = "es",
}: {
  composerName: string
  artisticName?: string
  scoreTitle: string
  observations: string
  dashboardUrl?: string
  lang?: EmailLanguage
}) {
  const isEn = lang === "en"
  const name = artisticName || composerName

  const texts = isEn
    ? {
        docTitle: "Editorial Observations - Piano Colombia",
        badge: "⚠️ Editorial Review Observations",
        committee: "Sheet Music Editorial Committee",
        salutation: `Dear ${name},`,
        p1: `Our editorial board reviewed your piece <strong>"${scoreTitle}"</strong> and identified elements requiring adjustment before approving store publication:`,
        obsTitle: "Moderator Observations:",
        defaultObs: "Please verify PDF engraving clarity, explicit key and meter signatures, and sequential measure numbers.",
        p2: "You can access your composer panel, adjust your score or metadata, and <strong>re-submit the sheet music for review</strong>. Once resolved, we will immediately process its publication.",
        ctaButton: "Go to Composer Dashboard",
        footer: "© 2026 Piano Colombia · Editorial Board",
      }
    : {
        docTitle: "Observaciones a tu Partitura - Piano Colombia",
        badge: "⚠️ Observaciones de Moderación",
        committee: "Comité Editorial de Partituras",
        salutation: `Estimado(a) ${name},`,
        p1: `El comité editorial revisó tu obra <strong>"${scoreTitle}"</strong> y ha identificado algunos puntos que requieren tu ajuste antes de autorizar su publicación en la tienda:`,
        obsTitle: "Observaciones del Moderador:",
        defaultObs: "Por favor verifica la legibilidad del PDF, la inclusión de armadura/compás claros o la correcta numeración de compases.",
        p2: "Puedes ingresar a tu panel de compositor, corregir tu archivo o información y <strong>volver a enviar la partitura a revisión</strong>. Una vez resueltas las observaciones, evaluaremos de inmediato su publicación.",
        ctaButton: "Ir al Panel de Compositor",
        footer: "© 2026 Piano Colombia · Mesa Editorial",
      }

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>${texts.docTitle}</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #F9F9FF; margin: 0; padding: 24px; color: #111C2D;">
    <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
      <div style="text-align: center; border-bottom: 2px solid #F0F3FF; padding-bottom: 20px;">
        <span style="display: inline-block; padding: 4px 12px; background: #FEF3C7; color: #92400E; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
          ${texts.badge}
        </span>
        <h1 style="font-size: 24px; font-weight: 900; margin: 12px 0 4px; color: #111C2D;">PIANO COLOMBIA</h1>
        <p style="font-size: 12px; color: #64748b; margin: 0; font-weight: bold;">${texts.committee}</p>
      </div>

      <div style="padding: 24px 0;">
        <p style="font-size: 15px; color: #111C2D; font-weight: bold; margin-top: 0;">
          ${texts.salutation}
        </p>
        <p style="font-size: 13px; color: #475569; line-height: 1.6;">
          ${texts.p1}
        </p>

        <div style="background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 16px; padding: 20px; margin: 20px 0;">
          <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #92400E; margin-top: 0; margin-bottom: 8px; font-weight: 900;">
            ${texts.obsTitle}
          </h3>
          <p style="font-size: 13px; color: #78350F; line-height: 1.6; margin: 0; font-style: italic;">
            "${observations || texts.defaultObs}"
          </p>
        </div>

        <p style="font-size: 13px; color: #475569; line-height: 1.6;">
          ${texts.p2}
        </p>

        <div style="text-align: center; margin-top: 28px;">
          <a href="${dashboardUrl}" style="background-color: #0071BC; color: #ffffff; padding: 14px 28px; font-size: 13px; font-weight: 900; text-decoration: none; border-radius: 12px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px;">
            ${texts.ctaButton}
          </a>
        </div>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 18px; text-align: center; font-size: 10px; color: #94a3b8;">
        ${texts.footer}
      </div>
    </div>
  </body>
  </html>
  `
}

// -------------------------------------------------------------------------------------------
// 10. LIQUIDACIÓN Y PAGO DE REGALÍAS A COMPOSITOR (COMPOSER PAYOUT NOTIFICATION)
// -------------------------------------------------------------------------------------------
export function generateComposerPayoutNotificationHTML({
  composerName,
  artisticName,
  batchNumber,
  amountNetCOP,
  amountGrossCOP,
  platformFeeCOP,
  commissionPercentage,
  bankName,
  accountType,
  accountNumberMasked,
  wompiTransferId,
  salesCount,
  dashboardUrl = "http://localhost:3000/compositor/dashboard/pagos",
  lang = "es",
}: {
  composerName: string
  artisticName?: string
  batchNumber: string
  amountNetCOP: number
  amountGrossCOP: number
  platformFeeCOP: number
  commissionPercentage: number
  bankName: string
  accountType: string
  accountNumberMasked: string
  wompiTransferId: string
  salesCount: number
  dashboardUrl?: string
  lang?: EmailLanguage
}) {
  const isEn = lang === "en"
  const name = artisticName || composerName

  const formatCOP = (val: number) =>
    new Intl.NumberFormat(isEn ? "en-US" : "es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(val || 0)

  const texts = isEn
    ? {
        docTitle: "Royalty Payout Receipt - Piano Colombia",
        badge: "💰 Royalty Payout Processed",
        dept: "Treasury & Funds Disbursement",
        salutation: `Dear ${name},`,
        intro: "We are pleased to inform you that we have processed the royalty disbursement for the sales of your musical works on Piano Colombia.",
        netTitle: "Net Value Transferred",
        batchLabel: `Official Batch: ${batchNumber}`,
        detailsTitle: "Disbursement Breakdown",
        soldLabel: "Sheet Music Sold in Period:",
        soldValue: `${salesCount} score(s)`,
        grossLabel: "Total Gross Sales (100%):",
        feeLabel: `Platform Fee (${commissionPercentage}%):`,
        netLabel: `Net to Your Account (${100 - commissionPercentage}%):`,
        bankTitle: "🏦 Destination Bank Account:",
        accountNum: "Number:",
        transferRef: "Wompi Transfer Ref:",
        achNote: "Depending on your banking entity (ACH), funds may reflect immediately or within 1 business day. You can review your full history and download tax vouchers anytime.",
        ctaButton: "View My Payout Dashboard",
        footer: "© 2026 Piano Colombia · Royalties & Musician Payments · Support: soporte@pianocolombia.com",
      }
    : {
        docTitle: "Comprobante de Dispersión de Regalías - Piano Colombia",
        badge: "💰 Liquidación de Regalías Procesada",
        dept: "Tesorería & Dispersión de Fondos",
        salutation: `Estimado(a) ${name},`,
        intro: "Nos complace informarte que hemos procesado la dispersión de regalías por las ventas de tus obras musicales en la plataforma Piano Colombia.",
        netTitle: "Valor Neto Transferido",
        batchLabel: `Lote Oficial: ${batchNumber}`,
        detailsTitle: "Detalle de Liquidación",
        soldLabel: "Partituras Vendidas en el Corte:",
        soldValue: `${salesCount} obra(s)`,
        grossLabel: "Venta Bruta Total (100%):",
        feeLabel: `Comisión Plataforma (${commissionPercentage}%):`,
        netLabel: `Neto a Tu Cuenta (${100 - commissionPercentage}%):`,
        bankTitle: "🏦 Cuenta Destino de Transferencia:",
        accountNum: "Número:",
        transferRef: "Ref. Transferencia Wompi:",
        achNote: "Dependiendo de tu entidad bancaria (ACH), los fondos pueden reflejarse inmediatamente o en el transcurso del día hábil. Puedes consultar el histórico completo y descargar tus comprobantes en cualquier momento.",
        ctaButton: "Ver Mi Tablero de Pagos",
        footer: "© 2026 Piano Colombia · Pagos & Regalías Musicales · Soporte: soporte@pianocolombia.com",
      }

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>${texts.docTitle}</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #F9F9FF; margin: 0; padding: 24px; color: #111C2D;">
    <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
      <div style="text-align: center; border-bottom: 2px solid #F0F3FF; padding-bottom: 20px;">
        <span style="display: inline-block; padding: 4px 12px; background: #ECFDF5; color: #047857; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
          ${texts.badge}
        </span>
        <h1 style="font-size: 24px; font-weight: 900; margin: 12px 0 4px; color: #111C2D;">PIANO COLOMBIA</h1>
        <p style="font-size: 12px; color: #64748b; margin: 0; font-weight: bold;">${texts.dept}</p>
      </div>

      <div style="padding: 24px 0;">
        <p style="font-size: 15px; color: #111C2D; font-weight: bold; margin-top: 0;">
          ${texts.salutation}
        </p>
        <p style="font-size: 13px; color: #475569; line-height: 1.6;">
          ${texts.intro}
        </p>

        <!-- Monto Principal -->
        <div style="background: linear-gradient(135deg, #0071BC 0%, #005996 100%); border-radius: 16px; padding: 24px; text-align: center; color: #ffffff; margin: 20px 0;">
          <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9;">
            ${texts.netTitle}
          </span>
          <div style="font-size: 32px; font-weight: 900; margin: 8px 0 4px; font-family: monospace;">
            ${formatCOP(amountNetCOP)} COP
          </div>
          <span style="font-size: 11px; opacity: 0.85;">
            ${texts.batchLabel}
          </span>
        </div>

        <!-- Desglose Financiero -->
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 20px; margin: 20px 0;">
          <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; margin-top: 0; margin-bottom: 12px; font-weight: 900;">
            ${texts.detailsTitle}
          </h3>
          <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748B;">${texts.soldLabel}</td>
              <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #111C2D;">${texts.soldValue}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748B;">${texts.grossLabel}</td>
              <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #111C2D;">${formatCOP(amountGrossCOP)} COP</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748B;">${texts.feeLabel}</td>
              <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #C1272D;">-${formatCOP(platformFeeCOP)} COP</td>
            </tr>
            <tr style="border-top: 1px solid #CBD5E1;">
              <td style="padding: 8px 0; font-weight: bold; color: #111C2D;">${texts.netLabel}</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 900; color: #047857; font-size: 13px;">${formatCOP(amountNetCOP)} COP</td>
            </tr>
          </table>
        </div>

        <!-- Datos de Destino -->
        <div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 16px; padding: 16px; margin: 20px 0; font-size: 12px;">
          <div style="font-weight: bold; color: #1E40AF; margin-bottom: 6px;">
            ${texts.bankTitle}
          </div>
          <div style="color: #1E3A8A; line-height: 1.5;">
            <strong>${bankName}</strong> (${accountType})<br>
            ${texts.accountNum} <span style="font-family: monospace;">${accountNumberMasked}</span><br>
            ${texts.transferRef} <span style="font-family: monospace; font-size: 11px;">${wompiTransferId}</span>
          </div>
        </div>

        <p style="font-size: 12px; color: #64748b; line-height: 1.5;">
          ${texts.achNote}
        </p>

        <div style="text-align: center; margin-top: 28px;">
          <a href="${dashboardUrl}" style="background-color: #0071BC; color: #ffffff; padding: 14px 28px; font-size: 13px; font-weight: 900; text-decoration: none; border-radius: 12px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px;">
            ${texts.ctaButton}
          </a>
        </div>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 18px; text-align: center; font-size: 10px; color: #94a3b8;">
        ${texts.footer}
      </div>
    </div>
  </body>
  </html>
  `
}

// -------------------------------------------------------------------------------------------
// 11. INVITACIÓN A ADMINISTRADOR / COLABORADOR (ADMIN USER INVITATION)
// -------------------------------------------------------------------------------------------
export function generateNewAdminUserInvitationHTML({
  userName,
  userEmail,
  roleName,
  permissions,
  createdByName,
  activationToken,
  lang = "es",
}: {
  userName: string
  userEmail: string
  roleName: string
  permissions: string[]
  createdByName?: string
  activationToken?: string
  lang?: EmailLanguage
}) {
  const isEn = lang === "en"
  const activationUrl = activationToken
    ? `http://localhost:3000/admin/activar-cuenta?email=${encodeURIComponent(userEmail)}&token=${encodeURIComponent(activationToken)}`
    : `http://localhost:3000/admin/activar-cuenta?email=${encodeURIComponent(userEmail)}`

  const texts = isEn
    ? {
        docTitle: "🔐 Invitation to Admin Console - Piano Colombia",
        badge: "RBAC Security & Access Control",
        subtitle: "Admin Console Invitation",
        salutation: `Hello, ${userName},`,
        body: `We notify you that <strong>${createdByName || "the Super Admin Team"}</strong> has provisioned a user account for you on the <strong>Piano Colombia</strong> administration console.`,
        detailsTitle: "🔑 Admin Account Details",
        userLabel: "User:",
        emailLabel: "Work Email:",
        roleLabel: "Assigned Role:",
        permsLabel: "Assigned permissions:",
        stepsTitle: "🔒 Secure Activation Process (OTP):",
        step1: "1. Click the button below <strong>\"Activate Account & Set Password\"</strong>.",
        step2: "2. Your token will be validated and a <strong>6-digit OTP code</strong> will be sent to your email to verify your identity.",
        step3: "3. Enter the code and set your private personal password.",
        ctaButton: "🔑 Activate Account & Set Secure Password",
        footer: "© 2026 Piano Colombia · RBAC Security & User Management",
      }
    : {
        docTitle: "🔐 Invitación a Consola Administrativa - Piano Colombia",
        badge: "Seguridad & Control de Acceso RBAC",
        subtitle: "Invitación a la Consola Administrativa",
        salutation: `Hola, ${userName},`,
        body: `Te informamos que <strong>${createdByName || "el equipo de Super Administración"}</strong> te ha creado un usuario con perfil institucional en la consola administrativa de <strong>Piano Colombia</strong>.`,
        detailsTitle: "🔑 Detalles de tu Cuenta Administrativa",
        userLabel: "Usuario:",
        emailLabel: "Correo Corporativo:",
        roleLabel: "Rol Asignado:",
        permsLabel: "Permisos asignados:",
        stepsTitle: "🔒 Proceso de Activación Segura (OTP):",
        step1: "1. Haz clic en el botón inferior <strong>\"Activar Cuenta y Definir Contraseña\"</strong>.",
        step2: "2. Se validará tu enlace criptográfico y se enviará un <strong>código OTP de 6 dígitos</strong> a tu correo para validar tu identidad.",
        step3: "3. Ingresa el código recibido y define tu contraseña personal privada para ingresar a la consola.",
        ctaButton: "🔑 Activar Cuenta y Definir Contraseña Segura",
        footer: "© 2026 Piano Colombia · Control de Usuarios y Seguridad RBAC",
      }

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>${texts.docTitle}</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #F9F9FF; margin: 0; padding: 24px; color: #111C2D;">
    <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
      
      <div style="text-align: center; border-bottom: 2px solid #F0F3FF; padding-bottom: 20px;">
        <span style="display: inline-block; padding: 4px 12px; background: #EFF6FF; color: #1E40AF; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
          ${texts.badge}
        </span>
        <h1 style="font-size: 22px; font-weight: 900; margin: 12px 0 4px; color: #111C2D; letter-spacing: -0.5px;">PIANO COLOMBIA</h1>
        <p style="font-size: 11px; color: #64748b; margin: 0; font-weight: bold;">${texts.subtitle}</p>
      </div>

      <div style="padding: 24px 0;">
        <p style="font-size: 14px; color: #111C2D; font-weight: bold; margin-top: 0;">
          ${texts.salutation}
        </p>
        <p style="font-size: 13px; color: #475569; line-height: 1.6;">
          ${texts.body}
        </p>

        <div style="background: #F0F3FF; border: 1px solid #CBD5E1; border-radius: 16px; padding: 20px; margin: 24px 0;">
          <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #0071BC; margin-top: 0; margin-bottom: 12px; font-weight: 900; border-bottom: 1px solid #E2E8F0; padding-bottom: 8px;">
            ${texts.detailsTitle}
          </h3>

          <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #111C2D;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; width: 45%; color: #475569;">${texts.userLabel}</td>
              <td style="padding: 6px 0; font-weight: 800;">${userName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #475569;">${texts.emailLabel}</td>
              <td style="padding: 6px 0; font-family: monospace; font-weight: bold; color: #0071BC;">${userEmail}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #475569;">${texts.roleLabel}</td>
              <td style="padding: 6px 0; font-weight: 800; color: #C1272D;">${roleName}</td>
            </tr>
          </table>

          <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #CBD5E1;">
            <p style="margin: 0 0 6px; font-size: 11px; font-weight: bold; color: #475569;">${texts.permsLabel}</p>
            <div style="font-size: 11px; color: #334155; line-height: 1.5;">
              ${permissions.map((p) => `• ${p}`).join("<br/>")}
            </div>
          </div>
        </div>

        <div style="background: #EFF6FF; border: 1px solid #93C5FD; border-radius: 14px; padding: 16px; margin: 20px 0; font-size: 12px; color: #1E3A8A; line-height: 1.6;">
          <strong style="display: block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; font-size: 11px; color: #1E40AF;">${texts.stepsTitle}</strong>
          ${texts.step1}<br/>
          ${texts.step2}<br/>
          ${texts.step3}
        </div>

        <div style="text-align: center; margin: 28px 0 12px;">
          <a href="${activationUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; background: #0071BC; color: #ffffff; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,113,188,0.3);">
            ${texts.ctaButton}
          </a>
        </div>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 18px; text-align: center; font-size: 10px; color: #94a3b8;">
        ${texts.footer}
      </div>
    </div>
  </body>
  </html>
  `
}

// -------------------------------------------------------------------------------------------
// 12. NOTIFICACIÓN A ADMINS: NUEVO COMPOSITOR REGISTRADO (NEW COMPOSER SIGNUP)
// -------------------------------------------------------------------------------------------
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
  lang = "es",
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
  lang?: EmailLanguage
}) {
  const isEn = lang === "en"
  const texts = isEn
    ? {
        docTitle: "🚨 New Composer Application Pending - Piano Colombia",
        badge: "Moderation & RBAC Administration Module",
        subtitle: "Automatic Notification: New Pending Application",
        salutation: `Dear ${adminName},`,
        body: "A new composer has verified their email and completed application to join the official catalog of <strong>Piano Colombia</strong>. Their profile is in status <strong>PENDING_APPROVAL</strong>.",
        cardTitle: "📋 Application Technical Sheet",
        legalName: "Legal Full Name:",
        artisticNameLabel: "Artistic Name / Signature:",
        verifiedEmail: "Verified Email:",
        phoneLabel: "Phone:",
        regionLabel: "Location:",
        docLabel: "ID Document:",
        bankLabel: "Royalty Account:",
        ctaButton: "👉 Go to Composer Approval Module",
        footer: "© 2026 Piano Colombia · Security & Administrative Control Notification",
      }
    : {
        docTitle: "🚨 Nueva Solicitud de Compositor Pendiente - Piano Colombia",
        badge: "Módulo de Moderación & Administración RBAC",
        subtitle: "Notificación Automática de Nueva Solicitud Pendiente",
        salutation: `Estimado/a ${adminName},`,
        body: "Un nuevo maestro ha verificado su correo electrónico y completado la postulación para unirse al catálogo oficial de autores de <strong>Piano Colombia</strong>. Su perfil se encuentra en estado <strong>PENDIENTE DE APROBACIÓN</strong> (<code>PENDING_APPROVAL</code>).",
        cardTitle: "📋 Ficha Técnica de la Solicitud",
        legalName: "Nombre Completo Legal:",
        artisticNameLabel: "Nombre Artístico / Firma:",
        verifiedEmail: "Correo Verificado:",
        phoneLabel: "Teléfono Celular:",
        regionLabel: "Ubicación Geográfica:",
        docLabel: "Documento de Identidad:",
        bankLabel: "Cuenta para Regalías:",
        ctaButton: "👉 Ir al Módulo de Aprobación de Compositores",
        footer: "© 2026 Piano Colombia · Notificación de Seguridad & Control Administrativo",
      }

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>${texts.docTitle}</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #F9F9FF; margin: 0; padding: 24px; color: #111C2D;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
      
      <div style="text-align: center; border-bottom: 2px solid #F0F3FF; padding-bottom: 20px;">
        <span style="display: inline-block; padding: 4px 12px; background: #FEF3C7; color: #92400E; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
          ${texts.badge}
        </span>
        <h1 style="font-size: 22px; font-weight: 900; margin: 12px 0 4px; color: #111C2D; letter-spacing: -0.5px;">PIANO COLOMBIA</h1>
        <p style="font-size: 11px; color: #64748b; margin: 0; font-weight: bold;">${texts.subtitle}</p>
      </div>

      <div style="padding: 24px 0;">
        <p style="font-size: 14px; color: #111C2D; font-weight: bold; margin-top: 0;">
          ${texts.salutation}
        </p>
        <p style="font-size: 13px; color: #475569; line-height: 1.6;">
          ${texts.body}
        </p>

        <div style="background: #F0F3FF; border: 1px solid #CBD5E1; border-radius: 16px; padding: 20px; margin: 24px 0;">
          <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #0071BC; margin-top: 0; margin-bottom: 12px; font-weight: 900; border-bottom: 1px solid #E2E8F0; padding-bottom: 8px;">
            ${texts.cardTitle}
          </h3>

          <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #111C2D;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; width: 40%; color: #475569;">${texts.legalName}</td>
              <td style="padding: 6px 0; font-weight: 800;">${composerName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #475569;">${texts.artisticNameLabel}</td>
              <td style="padding: 6px 0; font-weight: 800; color: #0071BC;">${artisticName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #475569;">${texts.verifiedEmail}</td>
              <td style="padding: 6px 0; font-family: monospace; font-weight: bold;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #475569;">${texts.phoneLabel}</td>
              <td style="padding: 6px 0;">${phone || "—"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #475569;">${texts.regionLabel}</td>
              <td style="padding: 6px 0;">${region || "—"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #475569;">${texts.docLabel}</td>
              <td style="padding: 6px 0; font-family: monospace; font-weight: bold;">${documentType || "CC"} ${documentNumber || "—"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #475569;">${texts.bankLabel}</td>
              <td style="padding: 6px 0; font-family: monospace;">${bankName || "Bancolombia"} (${accountType || "AHORROS"} ${accountNumber || ""})</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin: 28px 0 12px;">
          <a href="http://localhost:3000/admin/compositores" target="_blank" style="display: inline-block; padding: 14px 28px; background: #FBB03B; color: #111C2D; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(251,176,59,0.3);">
            ${texts.ctaButton}
          </a>
        </div>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 18px; text-align: center; font-size: 10px; color: #94a3b8;">
        ${texts.footer}
      </div>
    </div>
  </body>
  </html>
  `
}

// -------------------------------------------------------------------------------------------
// 13. NOTIFICACIÓN A ADMINS: PERFIL DE COMPOSITOR MODIFICADO (COMPOSER PROFILE UPDATED)
// -------------------------------------------------------------------------------------------
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
  lang = "es",
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
  lang?: EmailLanguage
}) {
  const isEn = lang === "en"
  const texts = isEn
    ? {
        docTitle: "🚨 Composer Profile Modification - Piano Colombia",
        badgeApproved: "⚠️ Active Profile Modified • Sheet Music Inactivated",
        badgePending: `Moderation & Review Module • Attempt #${approvalAttempts || 1}`,
        subtitle: "Composer Profile Update Alert",
        salutation: `Dear ${adminName},`,
        body: `The composer <strong>${artisticName}</strong> (${composerName}) has modified profile information (photo, biography, or data) and submitted it for technical review.`,
        actionsTitle: "⚠️ Automatic actions applied to the store:",
        action1: "The composer profile changed from APPROVED to PENDING_APPROVAL.",
        action2: "All associated sheet music scores were inactivated from the public catalog pending validation.",
        detailsTitle: "📋 Composer Information",
        legalName: "Legal Full Name:",
        artisticNameLabel: "Artistic Name / Signature:",
        emailLabel: "Email:",
        attemptsLabel: "Submission Attempt:",
        prevStatusLabel: "Previous Status:",
        phoneLabel: "Phone:",
        regionLabel: "Location:",
        ctaButton: "👉 Review & Moderate Profile in Admin Console",
        footer: "© 2026 Piano Colombia · Author Moderation Notification",
      }
    : {
        docTitle: "🚨 Modificación de Perfil de Compositor - Piano Colombia",
        badgeApproved: "⚠️ Perfil Activo Modificado • Inactivación de Obras",
        badgePending: `Módulo de Moderación & Revisión • Intento #${approvalAttempts || 1}`,
        subtitle: "Alerta de Actualización de Perfil de Autor",
        salutation: `Estimado/a ${adminName},`,
        body: `El compositor <strong>${artisticName}</strong> (${composerName}) ha realizado modificaciones en su información de perfil (fotografía, biografía o datos institucionales) y las ha enviado a revisión técnica.`,
        actionsTitle: "⚠️ Acciones automáticas aplicadas en la tienda:",
        action1: "El perfil del compositor cambió de APPROVED a PENDING_APPROVAL.",
        action2: "Todas sus partituras fueron inactivadas del catálogo público hasta que un administrador valide y apruebe las modificaciones.",
        detailsTitle: "📋 Datos del Compositor",
        legalName: "Nombre Completo Legal:",
        artisticNameLabel: "Nombre Artístico / Firma:",
        emailLabel: "Correo Electrónico:",
        attemptsLabel: "Número de Intentos de Envío:",
        prevStatusLabel: "Estado Anterior:",
        phoneLabel: "Teléfono:",
        regionLabel: "Ubicación:",
        ctaButton: "👉 Revisar y Aprobar Perfil en Consola Admin",
        footer: "© 2026 Piano Colombia · Notificación de Moderación de Autores",
      }

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>${texts.docTitle}</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #F9F9FF; margin: 0; padding: 24px; color: #111C2D;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
      
      <div style="text-align: center; border-bottom: 2px solid #F0F3FF; padding-bottom: 20px;">
        <span style="display: inline-block; padding: 4px 12px; background: ${wasApproved ? "#FEE2E2" : "#FEF3C7"}; color: ${wasApproved ? "#991B1B" : "#92400E"}; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
          ${wasApproved ? texts.badgeApproved : texts.badgePending}
        </span>
        <h1 style="font-size: 22px; font-weight: 900; margin: 12px 0 4px; color: #111C2D; letter-spacing: -0.5px;">PIANO COLOMBIA</h1>
        <p style="font-size: 11px; color: #64748b; margin: 0; font-weight: bold;">${texts.subtitle}</p>
      </div>

      <div style="padding: 24px 0;">
        <p style="font-size: 14px; color: #111C2D; font-weight: bold; margin-top: 0;">
          ${texts.salutation}
        </p>
        <p style="font-size: 13px; color: #475569; line-height: 1.6;">
          ${texts.body}
        </p>

        ${
          wasApproved
            ? `
        <div style="background: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 14px; padding: 16px; margin: 20px 0; font-size: 12px; color: #991B1B;">
          <p style="margin: 0; font-weight: 800; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">${texts.actionsTitle}</p>
          <ul style="margin: 8px 0 0 18px; padding: 0; line-height: 1.6;">
            <li>${texts.action1}</li>
            <li><strong>${texts.action2}</strong></li>
          </ul>
        </div>
        `
            : ""
        }

        <div style="background: #F0F3FF; border: 1px solid #CBD5E1; border-radius: 16px; padding: 20px; margin: 24px 0;">
          <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #0071BC; margin-top: 0; margin-bottom: 12px; font-weight: 900; border-bottom: 1px solid #E2E8F0; padding-bottom: 8px;">
            ${texts.detailsTitle}
          </h3>

          <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #111C2D;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; width: 40%; color: #475569;">${texts.legalName}</td>
              <td style="padding: 6px 0; font-weight: 800;">${composerName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #475569;">${texts.artisticNameLabel}</td>
              <td style="padding: 6px 0; font-weight: 800; color: #0071BC;">${artisticName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #475569;">${texts.emailLabel}</td>
              <td style="padding: 6px 0; font-family: monospace; font-weight: bold;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #475569;">${texts.attemptsLabel}</td>
              <td style="padding: 6px 0; font-weight: 900; color: #C1272D;">#${approvalAttempts || 1}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #475569;">${texts.prevStatusLabel}</td>
              <td style="padding: 6px 0; font-family: monospace; font-weight: bold; color: ${wasApproved ? "#15803D" : "#B45309"};">${previousStatus}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #475569;">${texts.phoneLabel}</td>
              <td style="padding: 6px 0;">${phone || "—"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #475569;">${texts.regionLabel}</td>
              <td style="padding: 6px 0;">${region || "—"}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin: 28px 0 12px;">
          <a href="http://localhost:3000/admin/compositores" target="_blank" style="display: inline-block; padding: 14px 28px; background: #FBB03B; color: #111C2D; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(251,176,59,0.3);">
            ${texts.ctaButton}
          </a>
        </div>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 18px; text-align: center; font-size: 10px; color: #94a3b8;">
        ${texts.footer}
      </div>
    </div>
  </body>
  </html>
  `
}

// -------------------------------------------------------------------------------------------
// 14. NOTIFICACIÓN A ADMINS: NUEVA PARTITURA CARGADA (SCORE SUBMITTED)
// -------------------------------------------------------------------------------------------
export function generateScoreSubmittedAdminNotificationHTML({
  adminName,
  composerName,
  artisticName,
  scoreTitle,
  genre,
  difficulty,
  priceCop,
  adminDashboardUrl = "http://localhost:3000/admin/partituras",
  lang = "es",
}: {
  adminName?: string
  composerName: string
  artisticName?: string
  scoreTitle: string
  genre?: string
  difficulty?: string
  priceCop?: number
  adminDashboardUrl?: string
  lang?: EmailLanguage
}) {
  const isEn = lang === "en"
  const author = artisticName || composerName

  const texts = isEn
    ? {
        docTitle: "New Sheet Music in Review Queue - Piano Colombia",
        badge: "🎼 Editorial & Review Desk",
        subtitle: "Moderator & Administrator Notification",
        salutation: `Hello, ${adminName || "Moderation Team"},`,
        body: `Composer <strong>${author}</strong> has uploaded a new work for technical and musicological review.`,
        sheetTitle: "Score Details:",
        titleLabel: "Piece Title:",
        composerLabel: "Composer:",
        genreLabel: "Category / Genre:",
        diffLabel: "Difficulty Level:",
        priceLabel: "Suggested Price:",
        ctaButton: "Inspect & Moderate Sheet Music",
        footer: "© 2026 Piano Colombia · Editorial Curation Platform",
      }
    : {
        docTitle: "Nueva Partitura en Cola de Revisión - Piano Colombia",
        badge: "🎼 Mesa de Curaduría & Revisión",
        subtitle: "Notificación a Moderadores y Administradores",
        salutation: `Hola, ${adminName || "Equipo de Moderación"},`,
        body: `El compositor <strong>${author}</strong> ha subido una obra para revisión técnica y musical.`,
        sheetTitle: "Ficha de la Partitura:",
        titleLabel: "Título de la Obra:",
        composerLabel: "Compositor:",
        genreLabel: "Categoría / Género:",
        diffLabel: "Nivel de Dificultad:",
        priceLabel: "Precio Sugerido:",
        ctaButton: "Inspeccionar y Moderar Partitura",
        footer: "© 2026 Piano Colombia · Plataforma de Curaduría Editorial",
      }

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>${texts.docTitle}</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #F9F9FF; margin: 0; padding: 24px; color: #111C2D;">
    <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
      <div style="text-align: center; border-bottom: 2px solid #F0F3FF; padding-bottom: 20px;">
        <span style="display: inline-block; padding: 4px 12px; background: #FEF3C7; color: #92400E; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
          ${texts.badge}
        </span>
        <h1 style="font-size: 24px; font-weight: 900; margin: 12px 0 4px; color: #111C2D;">PIANO COLOMBIA</h1>
        <p style="font-size: 12px; color: #64748b; margin: 0; font-weight: bold;">${texts.subtitle}</p>
      </div>

      <div style="padding: 24px 0;">
        <p style="font-size: 15px; color: #111C2D; font-weight: bold; margin-top: 0;">
          ${texts.salutation}
        </p>
        <p style="font-size: 13px; color: #475569; line-height: 1.6;">
          ${texts.body}
        </p>

        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 20px; margin: 20px 0;">
          <h3 style="font-size: 14px; color: #111C2D; margin-top: 0; margin-bottom: 12px; font-weight: 900;">
            ${texts.sheetTitle}
          </h3>
          <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #334155; line-height: 1.8;">
            <li><strong>${texts.titleLabel}</strong> ${scoreTitle}</li>
            <li><strong>${texts.composerLabel}</strong> ${author}</li>
            <li><strong>${texts.genreLabel}</strong> ${genre || "Piano Solo"}</li>
            <li><strong>${texts.diffLabel}</strong> ${difficulty || "Intermedio"}</li>
            <li><strong>${texts.priceLabel}</strong> $${(priceCop || 0).toLocaleString(isEn ? "en-US" : "es-CO")} COP</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 28px;">
          <a href="${adminDashboardUrl}" style="background-color: #0071BC; color: #ffffff; padding: 14px 28px; font-size: 13px; font-weight: 900; text-decoration: none; border-radius: 12px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px;">
            ${texts.ctaButton}
          </a>
        </div>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 18px; text-align: center; font-size: 10px; color: #94a3b8;">
        ${texts.footer}
      </div>
    </div>
  </body>
  </html>
  `
}

// -------------------------------------------------------------------------------------------
// 15. BIENVENIDA A CLIENTE (WELCOME CUSTOMER ACCOUNT)
// -------------------------------------------------------------------------------------------
export function generateWelcomeEmailHTML({
  userName,
  catalogUrl = "http://localhost:3000/tienda",
  lang = "es",
}: {
  userName: string
  catalogUrl?: string
  lang?: EmailLanguage
}) {
  const isEn = lang === "en"
  const texts = isEn
    ? {
        docTitle: "Welcome to Piano Colombia!",
        badge: "Digital Urtext Sheet Music Archive",
        salutation: `Welcome, ${userName}! 🎹`,
        body: "Your Piano Colombia account has been successfully created. You can now explore our curated catalog of Colombian piano works, save favorites, and purchase official licensed Urtext editions.",
        ctaButton: "Explore Sheet Music Catalog",
        footer: "© 2026 Piano Colombia · Colombian Piano Heritage & Academic Publishing",
      }
    : {
        docTitle: "¡Bienvenido a Piano Colombia!",
        badge: "Archivo Digital de Partituras Urtext",
        salutation: `¡Bienvenido/a, ${userName}! 🎹`,
        body: "Tu cuenta en Piano Colombia ha sido creada exitosamente. Ya puedes explorar nuestro catálogo curado de música pianística colombiana, guardar favoritos y adquirir licencias oficiales Urtext con descarga protegida.",
        ctaButton: "Explorar Catálogo de Partituras",
        footer: "© 2026 Piano Colombia · Patrimonio Pianístico Colombiano & Edición Académica",
      }

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>${texts.docTitle}</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #F9F9FF; margin: 0; padding: 24px; color: #111C2D;">
    <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); text-align: center;">
      <h1 style="font-size: 22px; font-weight: 900; margin-top: 0; color: #111C2D;">PIANO COLOMBIA</h1>
      <p style="font-size: 10px; text-transform: uppercase; color: #64748b; margin-top: 4px; font-weight: bold; letter-spacing: 1px;">${texts.badge}</p>

      <div style="padding: 20px 0; text-align: left;">
        <h2 style="font-size: 18px; color: #111C2D; margin-top: 0;">${texts.salutation}</h2>
        <p style="font-size: 13px; color: #475569; line-height: 1.6;">
          ${texts.body}
        </p>

        <div style="margin: 28px 0; text-align: center;">
          <a href="${catalogUrl}" style="background: #FBB03B; color: #111C2D; font-weight: 900; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">
            ${texts.ctaButton}
          </a>
        </div>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 18px; text-align: center; font-size: 10px; color: #94a3b8;">
        ${texts.footer}
      </div>
    </div>
  </body>
  </html>
  `
}
