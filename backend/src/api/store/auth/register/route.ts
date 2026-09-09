import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CUSTOMER_MODULE } from "../../../../modules/customer"
import { hashPassword, generateSessionToken } from "../../../../lib/auth-security"
import { sendEmail } from "../../../../lib/resend-mailer"

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

    const newCustomer = await customerModuleService.createCustomerAccounts({
      email: normalizedEmail,
      first_name,
      last_name,
      password_hash: hash,
      salt,
      phone: phone || null,
      tax_id: tax_id || null,
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
      subject: "¡Bienvenido a Piano Colombia! Tu cuenta ha sido creada",
      html: `
        <div style="font-family: Arial, sans-serif; background: #F9F9FF; padding: 24px; color: #111C2D;">
          <div style="max-width: 540px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #e2e8f0;">
            <h1 style="font-size: 20px; font-weight: 900; margin-top: 0; color: #111C2D;">PIANO COLOMBIA</h1>
            <p style="font-size: 14px; color: #334155;">Hola <strong>${full_name}</strong>,</p>
            <p style="font-size: 13px; color: #475569; line-height: 1.6;">Tu cuenta de cliente ha sido creada exitosamente. Ahora puedes explorar el catálogo urtext, comprar partituras con licencias legales emitidas a tu nombre y descargarlas en cualquier momento.</p>
            <div style="margin: 24px 0; text-align: center;">
              <a href="http://localhost:3000/tienda" style="background: #FBB03B; color: #111C2D; font-weight: bold; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-size: 13px; text-transform: uppercase;">Explorar Catálogo de Partituras</a>
            </div>
            <p style="font-size: 11px; color: #94a3b8; text-align: center;">© 2026 Piano Colombia — Archivo Editorial de Partituras</p>
          </div>
        </div>
      `,
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
