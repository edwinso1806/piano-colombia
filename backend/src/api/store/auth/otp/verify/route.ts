import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CUSTOMER_MODULE } from "../../../../../modules/customer"
import { verifyRegistrationOtp } from "../../../../../lib/otp-service"
import { hashPassword, generateSessionToken } from "../../../../../lib/auth-security"
import { sendEmail, generateWelcomeEmailHTML, extractLanguage, EMAIL_SUBJECTS } from "../../../../../lib/resend-mailer"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const customerModuleService = req.scope.resolve(CUSTOMER_MODULE)
    const { email, code } = (req.body as any) || {}
    const lang = extractLanguage(req)

    if (!email || !code) {
      return res.status(400).json({
        message: lang === "en"
          ? "Email and verification code are required"
          : "Email y código de verificación son obligatorios",
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // 1. Validar OTP en el servicio
    const verification = verifyRegistrationOtp(normalizedEmail, code)
    if (!verification.valid || !verification.payload) {
      return res.status(400).json({
        message: lang === "en"
          ? "Incorrect or expired verification code"
          : (verification.error || "Código de verificación incorrecto o expirado"),
      })
    }

    const { fullName, password, phone, taxId } = verification.payload

    // 2. Comprobar que no haya sido creado mientras tanto
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

    // 3. Hashear contraseña y persistir en PostgreSQL
    const names = fullName.trim().split(" ")
    const first_name = names[0] || fullName
    const last_name = names.slice(1).join(" ") || "Cliente"

    const { hash, salt } = hashPassword(password)

    const newCustomer = await customerModuleService.createCustomerAccounts({
      email: normalizedEmail,
      first_name,
      last_name,
      password_hash: hash,
      salt,
      phone: phone || null,
      tax_id: taxId || null,
      preferred_language: lang,
      is_active: true,
    })

    const token = generateSessionToken({
      id: newCustomer.id,
      email: newCustomer.email,
      role: "customer",
    })

    // 4. Enviar correo de bienvenida oficial bilingüe
    await sendEmail({
      to: normalizedEmail,
      subject: EMAIL_SUBJECTS.welcomeCustomer[lang],
      html: generateWelcomeEmailHTML({
        userName: fullName,
        lang,
      }),
    })

    console.log(`✅ [OTP VERIFIED] Cuenta creada en PostgreSQL para ${normalizedEmail}`)

    return res.status(201).json({
      success: true,
      message: lang === "en"
        ? "Account verified and created successfully!"
        : "¡Cuenta verificada y creada exitosamente!",
      token,
      customer: {
        id: newCustomer.id,
        email: newCustomer.email,
        fullName: `${newCustomer.first_name} ${newCustomer.last_name}`,
        phone: newCustomer.phone,
        taxId: newCustomer.tax_id,
      },
    })
  } catch (error: any) {
    const lang = extractLanguage(req)
    console.error("❌ Error verificando OTP de registro:", error)
    return res.status(500).json({
      message: lang === "en"
        ? "Error verifying registration code"
        : "Error al verificar código de registro",
      error: error.message,
    })
  }
}
