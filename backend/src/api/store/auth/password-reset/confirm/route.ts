import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CUSTOMER_MODULE } from "../../../../../modules/customer"
import { COMPOSER_MODULE } from "../../../../../modules/composer"
import { consumePasswordResetOtp } from "../../../../../lib/otp-service"
import { hashPassword } from "../../../../../lib/auth-security"
import { sendEmail, generatePasswordChangedEmailHTML } from "../../../../../lib/resend-mailer"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { email, code, new_password, role = "customer" } = (req.body as any) || {}

    if (!email || !code || !new_password) {
      return res.status(400).json({
        message: "El correo, el código de 6 dígitos y la nueva contraseña son obligatorios",
      })
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        message: "La nueva contraseña debe tener al menos 6 caracteres por seguridad",
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // 1. Validar y consumir código OTP
    const verification = consumePasswordResetOtp(normalizedEmail, code, role)
    if (!verification.valid) {
      return res.status(400).json({
        message: verification.error || "El código ingresado es incorrecto o ha expirado.",
      })
    }

    // 2. Hashear nueva contraseña con salt criptográfico
    const { hash, salt } = hashPassword(new_password)
    let userName = normalizedEmail.split("@")[0]

    if (role === "composer") {
      const composerModuleService = req.scope.resolve(COMPOSER_MODULE)
      const [composers] = await composerModuleService.listAndCountComposers({
        email: normalizedEmail,
      })

      if (!composers || composers.length === 0) {
        return res.status(404).json({
          message: "No se encontró el perfil de compositor.",
        })
      }

      const composer = composers[0]
      userName = composer.artistic_name || `${composer.first_name || ""} ${composer.last_name || ""}`.trim() || userName

      // Actualizar compositor con la nueva contraseña hasheada y salt
      await composerModuleService.updateComposers({
        id: composer.id,
        password_hash: hash,
        salt,
      })
    } else {
      // Customer
      const customerModuleService = req.scope.resolve(CUSTOMER_MODULE)
      const [customers] = await customerModuleService.listAndCountCustomerAccounts({
        email: normalizedEmail,
      })

      if (!customers || customers.length === 0) {
        return res.status(404).json({
          message: "No se encontró una cuenta de cliente con este correo electrónico.",
        })
      }

      const customer = customers[0]
      userName = `${customer.first_name || ""} ${customer.last_name || ""}`.trim() || userName

      // Actualizar en PostgreSQL
      await customerModuleService.updateCustomerAccounts({
        id: customer.id,
        password_hash: hash,
        salt,
      })
    }

    // 3. Enviar notificación de seguridad por correo
    await sendEmail({
      to: normalizedEmail,
      subject: "Tu contraseña de Piano Colombia ha sido actualizada",
      html: generatePasswordChangedEmailHTML({
        userName,
      }),
    })

    if (role === "admin") {
      const { recordAdminPasswordChange } = await import("../../../../admin/auth/login/route")
      recordAdminPasswordChange(normalizedEmail)
    }

    console.log(`✅ [PASSWORD RESET] Contraseña actualizada exitosamente para ${normalizedEmail} (Role: ${role})`)

    return res.status(200).json({
      success: true,
      message: "Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tus nuevas credenciales.",
    })
  } catch (error: any) {
    console.error("❌ Error al confirmar restablecimiento de contraseña:", error)
    return res.status(500).json({
      message: "Error al actualizar la contraseña",
      error: error.message,
    })
  }
}

export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  return res.status(204).end()
}

