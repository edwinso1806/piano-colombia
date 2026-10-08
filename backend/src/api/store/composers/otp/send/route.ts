import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { COMPOSER_MODULE } from "../../../../../modules/composer"
import { generateComposerRegistrationOtp } from "../../../../../lib/otp-service"
import { sendEmail, generateOtpEmailHTML, extractLanguage, EMAIL_SUBJECTS } from "../../../../../lib/resend-mailer"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const composerModuleService = req.scope.resolve(COMPOSER_MODULE)
    const body = req.body as any

    const {
      first_name,
      last_name,
      artistic_name,
      email,
      phone,
      phone_code,
      country,
      department,
      city,
      password,
      bank_account,
    } = body || {}

    const lang = extractLanguage(req)

    if (!email || !first_name) {
      return res.status(400).json({
        message: lang === "en"
          ? "Full name and email address are required"
          : "El nombre y el correo electrónico son obligatorios",
      })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const docNumber = bank_account?.document_number?.trim()

    // 1. Validar si ya existe un compositor con el mismo correo
    const [existingComposers] = await composerModuleService.listAndCountComposers({
      email: normalizedEmail,
    })

    if (existingComposers && existingComposers.length > 0) {
      return res.status(400).json({
        message: lang === "en"
          ? `A composer profile is already registered with email ${normalizedEmail}. If you are a client you may use the same email, but you are already registered as a composer.`
          : `Ya existe un perfil de compositor registrado con el correo ${normalizedEmail}. Si eres cliente puedes usar el mismo correo, pero como compositor ya te encuentras registrado.`,
      })
    }

    // 2. Validar si ya existe un compositor con el mismo número de documento
    if (docNumber) {
      const [existingAccounts] = await composerModuleService.listAndCountComposerBankAccounts({
        document_number: docNumber,
      })

      if (existingAccounts && existingAccounts.length > 0) {
        return res.status(400).json({
          message: lang === "en"
            ? `A composer profile is already registered with document number ${docNumber}.`
            : `Ya existe un registro de compositor con el número de documento ${docNumber}.`,
        })
      }
    }

    const fullName = `${first_name} ${last_name || ""}`.trim()
    const fullPhone = phone ? `${phone_code || "+57"} ${phone}`.trim() : null
    const region = `${city || ""}, ${department || ""}, ${country || ""}`.replace(/^,\s*|,\s*$/g, "")

    const payload = {
      first_name,
      last_name: last_name || "",
      artistic_name: artistic_name || fullName,
      email: normalizedEmail,
      phone: fullPhone,
      region,
      country,
      department,
      city,
      password,
      bank_account,
      preferred_language: lang,
    }

    // 3. Generar OTP de 6 dígitos
    const otpCode = generateComposerRegistrationOtp(normalizedEmail, payload)

    // 4. Enviar correo seguro por Resend
    await sendEmail({
      to: normalizedEmail,
      subject: EMAIL_SUBJECTS.composerOtpVerification[lang](otpCode),
      html: generateOtpEmailHTML({
        userName: fullName,
        otpCode,
        lang,
      }),
    })

    console.log(`🔐 [COMPOSER REGISTRATION OTP] Código generado para ${normalizedEmail}: ${otpCode}`)

    return res.status(200).json({
      success: true,
      message: lang === "en"
        ? `6-digit verification code sent to ${normalizedEmail}.`
        : `Código de verificación de 6 dígitos enviado a ${normalizedEmail}.`,
      email: normalizedEmail,
    })
  } catch (error: any) {
    const lang = extractLanguage(req)
    console.error("❌ Error enviando OTP de registro para compositor:", error)
    return res.status(500).json({
      message: lang === "en"
        ? "Error processing composer verification code"
        : (error.message || "Error al procesar el código de verificación para compositor"),
    })
  }
}
