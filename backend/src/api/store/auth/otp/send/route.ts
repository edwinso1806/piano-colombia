import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CUSTOMER_MODULE } from "../../../../../modules/customer"
import { generateRegistrationOtp } from "../../../../../lib/otp-service"
import { sendEmail, generateOtpEmailHTML, extractLanguage, EMAIL_SUBJECTS } from "../../../../../lib/resend-mailer"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const customerModuleService = req.scope.resolve(CUSTOMER_MODULE)
    const { email, password, full_name, phone, tax_id } = (req.body as any) || {}
    const lang = extractLanguage(req)

    if (!email || !password || !full_name) {
      return res.status(400).json({
        message: lang === "en"
          ? "Email, password, and full name are required to start registration"
          : "Email, contraseña y nombre completo son obligatorios para iniciar el registro",
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // 1. Verificar si ya existe en PostgreSQL
    const [existing] = await customerModuleService.listAndCountCustomerAccounts({
      email: normalizedEmail,
    })

    if (existing && existing.length > 0) {
      return res.status(400).json({
        message: lang === "en"
          ? "An account is already registered with this email address"
          : "Ya existe una cuenta registrada con este correo electrónico",
      })
    }

    // 2. Generar código OTP de 6 dígitos
    const otpCode = generateRegistrationOtp(normalizedEmail, {
      fullName: full_name.trim(),
      email: normalizedEmail,
      password,
      phone,
      taxId: tax_id,
    })

    // 3. Enviar correo con el código de verificación
    const emailHtml = generateOtpEmailHTML({
      userName: full_name.trim(),
      otpCode,
      lang,
    })

    const emailResult = await sendEmail({
      to: normalizedEmail,
      subject: EMAIL_SUBJECTS.otpVerification[lang](otpCode),
      html: emailHtml,
    })

    console.log(`📨 [OTP SEND] Código generado para ${normalizedEmail}: ${otpCode} (Provider: ${emailResult.provider})`)

    return res.status(200).json({
      success: true,
      message: lang === "en"
        ? `We have sent a 6-digit verification code to ${normalizedEmail}`
        : `Hemos enviado un código de verificación de 6 dígitos a ${normalizedEmail}`,
      email: normalizedEmail,
    })
  } catch (error: any) {
    const lang = extractLanguage(req)
    console.error("❌ Error en envío de OTP de registro:", error)
    return res.status(500).json({
      message: lang === "en"
        ? "Error generating email verification code"
        : "Error al generar código de verificación de correo",
      error: error.message,
    })
  }
}
