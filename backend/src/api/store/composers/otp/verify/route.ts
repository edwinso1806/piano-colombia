import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { COMPOSER_MODULE } from "../../../../../modules/composer"
import { verifyComposerRegistrationOtp } from "../../../../../lib/otp-service"
import { hashPassword } from "../../../../../lib/auth-security"
import { getAdminAndModeratorEmailsFromDB } from "../../../../../lib/admin-recipient-service"
import { sendEmail, generateWelcomeEmailHTML, generateNewComposerAdminNotificationHTML, extractLanguage } from "../../../../../lib/resend-mailer"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const composerModuleService = req.scope.resolve(COMPOSER_MODULE)
    const { email, code } = (req.body as any) || {}
    const lang = extractLanguage(req)

    if (!email || !code) {
      return res.status(400).json({
        message: lang === "en"
          ? "Email and 6-digit code are required"
          : "El correo electrónico y el código de 6 dígitos son obligatorios",
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // 1. Validar código OTP
    const verification = verifyComposerRegistrationOtp(normalizedEmail, code)
    if (!verification.valid || !verification.payload) {
      return res.status(400).json({
        message: lang === "en"
          ? "Invalid or expired verification code."
          : (verification.error || "Código de verificación inválido o expirado."),
      })
    }

    const data = verification.payload
    const docNumber = data.bank_account?.document_number?.trim()

    // 2. Re-verificar que no exista duplicado en DB justo antes de insertar
    const [existingComposers] = await composerModuleService.listAndCountComposers({
      email: normalizedEmail,
    })

    if (existingComposers && existingComposers.length > 0) {
      return res.status(400).json({
        message: lang === "en"
          ? "This email address was already registered as a composer."
          : "Este correo electrónico ya fue registrado previamente como compositor.",
      })
    }

    if (docNumber) {
      const [existingAccounts] = await composerModuleService.listAndCountComposerBankAccounts({
        document_number: docNumber,
      })

      if (existingAccounts && existingAccounts.length > 0) {
        return res.status(400).json({
          message: lang === "en"
            ? "This identification document number was already registered by another composer."
            : "Este número de documento ya fue registrado previamente por otro compositor.",
        })
      }
    }

    // Hash de contraseña si aplica
    let password_hash: string | undefined = undefined
    let salt: string | undefined = undefined
    if (data.password) {
      const security = hashPassword(data.password)
      password_hash = security.hash
      salt = security.salt
    }

    const baseSlug = `${data.first_name}-${data.last_name || ""}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`

    // 3. Crear perfil de compositor en PostgreSQL DB en estado DRAFT (Borrador inicial)
    const composer = await composerModuleService.createComposers({
      first_name: data.first_name,
      last_name: data.last_name || "",
      artistic_name: data.artistic_name || `${data.first_name} ${data.last_name || ""}`.trim(),
      slug: uniqueSlug,
      email: normalizedEmail,
      phone: data.phone || null,
      region: data.region || null,
      password_hash: password_hash || null,
      salt: salt || null,
      preferred_language: data.preferred_language || lang,
      status: "DRAFT",
      approval_attempts: 0,
    })

    // 4. Crear cuenta bancaria vinculada
    if (data.bank_account) {
      await composerModuleService.createComposerBankAccounts({
        ...data.bank_account,
        holder_name: data.bank_account.holder_name || `${data.first_name} ${data.last_name || ""}`.trim(),
        composer_id: composer.id,
      })
    }

    console.log(`✅ [COMPOSER VERIFIED] Cuenta de compositor creada en estado DRAFT para ${normalizedEmail}`)

    // 5. Enviar correo de bienvenida al compositor
    try {
      const composerFullName = `${data.first_name} ${data.last_name || ""}`.trim()
      await sendEmail({
        to: normalizedEmail,
        subject: lang === "en"
          ? "Welcome to Piano Colombia - Composer Portal"
          : "¡Bienvenido a Piano Colombia - Portal de Compositores!",
        html: generateWelcomeEmailHTML({
          userName: composerFullName,
          lang,
        }),
      })
    } catch (emailErr) {
      console.warn("⚠️ Advertencia enviando correo de bienvenida al compositor:", emailErr)
    }

    return res.status(201).json({
      success: true,
      composer,
      message: lang === "en"
        ? "Email successfully verified! Your composer profile has been created. Please complete your profile and submit it for review."
        : "¡Correo electrónico verificado exitosamente! Tu cuenta de compositor ha sido creada. Ahora puedes completar tu biografía y fotografía y enviarla a revisión.",
    })
  } catch (error: any) {
    const lang = extractLanguage(req)
    console.error("❌ Error verificando OTP de compositor:", error)
    return res.status(500).json({
      message: lang === "en"
        ? "Error completing composer registration"
        : (error.message || "Error al completar el registro del compositor"),
    })
  }
}
