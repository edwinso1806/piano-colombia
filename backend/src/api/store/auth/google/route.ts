import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CUSTOMER_MODULE } from "../../../../modules/customer"
import { hashPassword, generateSessionToken } from "../../../../lib/auth-security"
import { sendEmail, generateWelcomeEmailHTML, extractLanguage, EMAIL_SUBJECTS } from "../../../../lib/resend-mailer"
import crypto from "crypto"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const customerModuleService = req.scope.resolve(CUSTOMER_MODULE)
    const { email, name, google_id, picture } = (req.body as any) || {}

    if (!email) {
      return res.status(400).json({
        message: "El correo electrónico de Google es obligatorio",
      })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const fullName = name ? name.trim() : normalizedEmail.split("@")[0]

    // 1. Buscar si el usuario ya existe en PostgreSQL
    const [existing] = await customerModuleService.listAndCountCustomerAccounts({
      email: normalizedEmail,
    })

    if (existing && existing.length > 0) {
      const customer = existing[0]
      const token = generateSessionToken({
        id: customer.id,
        email: customer.email,
        role: "customer",
      })

      console.log(`🔑 [GOOGLE AUTH] Login exitoso para ${normalizedEmail}`)

      return res.status(200).json({
        success: true,
        isNew: false,
        token,
        customer: {
          id: customer.id,
          email: customer.email,
          fullName: `${customer.first_name} ${customer.last_name}`,
          phone: customer.phone,
          taxId: customer.tax_id,
        },
      })
    }

    // 2. Si no existe, crear la cuenta automáticamente con Google
    const names = fullName.split(" ")
    const first_name = names[0] || fullName
    const last_name = names.slice(1).join(" ") || "Google User"

    const randomSecret = crypto.randomBytes(24).toString("hex")
    const { hash, salt } = hashPassword(randomSecret)

    const lang = extractLanguage(req)

    const newCustomer = await customerModuleService.createCustomerAccounts({
      email: normalizedEmail,
      first_name,
      last_name,
      password_hash: hash,
      salt,
      preferred_language: lang,
      is_active: true,
    })

    const token = generateSessionToken({
      id: newCustomer.id,
      email: newCustomer.email,
      role: "customer",
    })

    // Enviar correo de bienvenida bilingüe
    await sendEmail({
      to: normalizedEmail,
      subject: EMAIL_SUBJECTS.welcomeCustomer[lang],
      html: generateWelcomeEmailHTML({
        userName: fullName,
        lang,
      }),
    })

    console.log(`✅ [GOOGLE AUTH] Nueva cuenta creada en PostgreSQL para ${normalizedEmail}`)

    return res.status(201).json({
      success: true,
      isNew: true,
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
    console.error("❌ Error en autenticación con Google:", error)
    return res.status(500).json({
      message: "Error al procesar autenticación con Google",
      error: error.message,
    })
  }
}
