import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { COMPOSER_MODULE } from "../../../../../modules/composer"
import { generateSessionToken, verifyPassword } from "../../../../../lib/auth-security"
import { extractLanguage } from "../../../../../lib/resend-mailer"

export const AUTHENTICATE = false

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const composerModuleService = req.scope.resolve(COMPOSER_MODULE)
    const { email, password } = (req.body as any) || {}
    const lang = extractLanguage(req)

    if (!email || !password) {
      return res.status(400).json({
        message: lang === "en" ? "Email and password are required" : "Email y contraseña son obligatorios",
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const [composers] = await composerModuleService.listAndCountComposers(
      { email: normalizedEmail },
      { relations: ["bank_account"] }
    )

    if (!composers || composers.length === 0) {
      return res.status(401).json({
        message: lang === "en"
          ? "Incorrect email or password. Please verify your credentials."
          : "Correo o contraseña incorrectos. Por favor verifica tus credenciales.",
      })
    }

    const composer = composers[0]

    // Validar contraseña criptográfica (pbkdf2 + salt)
    if (!composer.password_hash || !composer.salt) {
      return res.status(401).json({
        message: lang === "en"
          ? "This composer account does not have a configured password. Please use 'Forgot password' or register."
          : "Esta cuenta de compositor no tiene una contraseña configurada. Por favor utiliza 'Olvidé mi contraseña' o regístrate.",
      })
    }

    const isPasswordValid = verifyPassword(password, composer.password_hash, composer.salt)
    if (!isPasswordValid) {
      return res.status(401).json({
        message: lang === "en"
          ? "Incorrect email or password. Please verify your credentials."
          : "Correo o contraseña incorrectos. Por favor verifica tus credenciales.",
      })
    }

    // Las cuentas suspendidas se bloquean, pero PENDING_APPROVAL y REJECTED pueden ingresar para completar/corregir su perfil
    if (composer.status === "SUSPENDED") {
      return res.status(403).json({
        message: lang === "en"
          ? "This composer account is currently suspended by administration."
          : "Esta cuenta de compositor se encuentra suspendida por administración.",
      })
    }

    const { remember_me } = (req.body as any) || {}
    const sessionDuration = remember_me ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
    const expires_at = Date.now() + sessionDuration

    const token = generateSessionToken({
      id: composer.id,
      email: composer.email,
      role: "composer",
    }, sessionDuration)

    return res.status(200).json({
      success: true,
      token,
      expires_at,
      composer: {
        id: composer.id,
        email: composer.email,
        first_name: composer.first_name,
        last_name: composer.last_name,
        artistic_name: composer.artistic_name || `${composer.first_name} ${composer.last_name}`,
        phone: composer.phone,
        region: composer.region,
        bio_es: composer.bio_es,
        bio_en: composer.bio_en,
        photo_url: composer.photo_url,
        status: composer.status,
        rejection_reason: composer.rejection_reason,
        bankAccount: composer.bank_account || null,
      },
    })
  } catch (error: any) {
    const lang = extractLanguage(req)
    console.error("❌ Error al autenticar compositor:", error)
    return res.status(500).json({
      message: lang === "en" ? "Error authenticating composer" : "Error al autenticar compositor",
      error: error.message,
    })
  }
}
