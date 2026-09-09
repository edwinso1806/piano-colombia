import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CUSTOMER_MODULE } from "../../../../../modules/customer"
import { COMPOSER_MODULE } from "../../../../../modules/composer"
import { generatePasswordResetOtp } from "../../../../../lib/otp-service"
import { sendEmail, generatePasswordResetEmailHTML } from "../../../../../lib/resend-mailer"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { email, role = "customer" } = (req.body as any) || {}

    if (!email) {
      return res.status(400).json({
        message: "El correo electrónico es obligatorio",
      })
    }

    const normalizedEmail = email.trim().toLowerCase()
    let foundUser = false
    let userName = normalizedEmail.split("@")[0]

    if (role === "composer") {
      try {
        const composerModuleService = req.scope.resolve(COMPOSER_MODULE)
        const [composers] = await composerModuleService.listAndCountComposers({
          email: normalizedEmail,
        })
        if (composers && composers.length > 0) {
          foundUser = true
          userName = composers[0].artistic_name || `${composers[0].first_name || ""} ${composers[0].last_name || ""}`.trim() || userName
        }
      } catch (err) {
        console.warn("Error buscando compositor para recuperación:", err)
      }
    } else {
      // Customer
      try {
        const customerModuleService = req.scope.resolve(CUSTOMER_MODULE)
        const [customers] = await customerModuleService.listAndCountCustomerAccounts({
          email: normalizedEmail,
        })
        if (customers && customers.length > 0) {
          foundUser = true
          userName = `${customers[0].first_name || ""} ${customers[0].last_name || ""}`.trim() || userName
        }
      } catch (err) {
        console.warn("Error buscando cliente para recuperación:", err)
      }
    }

    if (foundUser) {
      // 1. Generar código OTP de 6 dígitos con vigencia de 10 minutos
      const otpCode = generatePasswordResetOtp(normalizedEmail, role)

      // 2. Enviar correo seguro
      await sendEmail({
        to: normalizedEmail,
        subject: "Código para Restablecer tu Contraseña - Piano Colombia",
        html: generatePasswordResetEmailHTML({
          userName,
          otpCode,
          role,
        }),
      })

      console.log(`🔐 [PASSWORD RESET] Código OTP generado y enviado a ${normalizedEmail} (Role: ${role})`)
    } else {
      console.log(`ℹ️ [PASSWORD RESET] Solicitud para correo no registrado: ${normalizedEmail} (Role: ${role})`)
    }

    // Respuesta genérica de seguridad contra enumeración
    return res.status(200).json({
      success: true,
      message: "Si la cuenta está registrada, te hemos enviado un código de 6 dígitos a tu correo electrónico.",
      email: normalizedEmail,
    })
  } catch (error: any) {
    console.error("❌ Error en solicitud de recuperación de contraseña:", error)
    return res.status(500).json({
      message: "Error al procesar la solicitud de recuperación de contraseña",
      error: error.message,
    })
  }
}

export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  return res.status(204).end()
}

