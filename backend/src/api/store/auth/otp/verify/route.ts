import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CUSTOMER_MODULE } from "../../../../../modules/customer"
import { verifyRegistrationOtp } from "../../../../../lib/otp-service"
import { hashPassword, generateSessionToken } from "../../../../../lib/auth-security"
import { sendEmail } from "../../../../../lib/resend-mailer"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const customerModuleService = req.scope.resolve(CUSTOMER_MODULE)
    const { email, code } = (req.body as any) || {}

    if (!email || !code) {
      return res.status(400).json({
        message: "Email y código de verificación son obligatorios",
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // 1. Validar OTP en el servicio
    const verification = verifyRegistrationOtp(normalizedEmail, code)
    if (!verification.valid || !verification.payload) {
      return res.status(400).json({
        message: verification.error || "Código de verificación incorrecto o expirado",
      })
    }

    const { fullName, password, phone, taxId } = verification.payload

    // 2. Comprobar que no haya sido creado mientras tanto
    const [existing] = await customerModuleService.listAndCountCustomerAccounts({
      email: normalizedEmail,
    })

    if (existing && existing.length > 0) {
      return res.status(400).json({
        message: "Ya existe una cuenta registrada con este correo electrónico",
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
      is_active: true,
    })

    const token = generateSessionToken({
      id: newCustomer.id,
      email: newCustomer.email,
      role: "customer",
    })

    // 4. Enviar correo de bienvenida oficial
    await sendEmail({
      to: normalizedEmail,
      subject: "¡Bienvenido a Piano Colombia! Tu cuenta ha sido verificada",
      html: `
        <div style="font-family: Arial, sans-serif; background: #F9F9FF; padding: 24px; color: #111C2D;">
          <div style="max-width: 540px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #e2e8f0;">
            <h1 style="font-size: 20px; font-weight: 900; margin-top: 0; color: #111C2D;">PIANO COLOMBIA</h1>
            <p style="font-size: 14px; color: #334155;">Hola <strong>${fullName}</strong>,</p>
            <p style="font-size: 13px; color: #475569; line-height: 1.6;">Tu correo ha sido verificado con éxito y tu cuenta de cliente en Piano Colombia está activa. Ya puedes explorar el catálogo urtext y comprar partituras con licencias legales emitidas a tu nombre.</p>
            <div style="margin: 24px 0; text-align: center;">
              <a href="http://localhost:3000/tienda" style="background: #FBB03B; color: #111C2D; font-weight: bold; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-size: 13px; text-transform: uppercase;">Explorar Catálogo de Partituras</a>
            </div>
            <p style="font-size: 11px; color: #94a3b8; text-align: center;">© 2026 Piano Colombia — Archivo Editorial de Partituras</p>
          </div>
        </div>
      `,
    })

    console.log(`✅ [OTP VERIFIED] Cuenta creada en PostgreSQL para ${normalizedEmail}`)

    return res.status(201).json({
      success: true,
      message: "¡Cuenta verificada y creada exitosamente!",
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
    console.error("❌ Error verificando OTP de registro:", error)
    return res.status(500).json({
      message: "Error al verificar código de registro",
      error: error.message,
    })
  }
}
