import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CUSTOMER_MODULE } from "../../../../modules/customer"
import { hashPassword, generateSessionToken } from "../../../../lib/auth-security"
import { sendEmail, generateWelcomeEmailHTML, extractLanguage, EMAIL_SUBJECTS } from "../../../../lib/resend-mailer"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const customerModuleService = req.scope.resolve(CUSTOMER_MODULE)
    const { email, password, full_name, phone, tax_id } = (req.body as any) || {}

    if (!email || !password || !full_name) {
      return res.status(400).json({
        message: "Email, contraseña y nombre completo son obligatorios para el registro",
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Check if user already exists
    const [existing] = await customerModuleService.listAndCountCustomerAccounts({
      email: normalizedEmail,
    })

    if (existing && existing.length > 0) {
      return res.status(400).json({
        message: "Ya existe una cuenta registrada con este correo electrónico",
      })
    }

    const names = full_name.trim().split(" ")
    const first_name = names[0] || full_name
    const last_name = names.slice(1).join(" ") || "Cliente"

    const { hash, salt } = hashPassword(password)

    const lang = extractLanguage(req)

    const newCustomer = await customerModuleService.createCustomerAccounts({
      email: normalizedEmail,
      first_name,
      last_name,
      password_hash: hash,
      salt,
      phone: phone || null,
      tax_id: tax_id || null,
      preferred_language: lang,
      is_active: true,
    })

    const token = generateSessionToken({
      id: newCustomer.id,
      email: newCustomer.email,
      role: "customer",
    })

    // Send Welcome Email
    await sendEmail({
      to: normalizedEmail,
      subject: EMAIL_SUBJECTS.welcomeCustomer[lang],
      html: generateWelcomeEmailHTML({
        userName: full_name,
        lang,
      }),
    })

    return res.status(201).json({
      success: true,
      message: "Cuenta creada exitosamente",
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
    return res.status(500).json({
      message: "Error al registrar cliente",
      error: error.message,
    })
  }
}
