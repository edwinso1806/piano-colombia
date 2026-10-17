import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { COMPOSER_MODULE } from "../../../../../modules/composer"
import { generateSessionToken } from "../../../../../lib/auth-security"
import { extractLanguage, sendEmail, generateWelcomeEmailHTML } from "../../../../../lib/resend-mailer"

export const AUTHENTICATE = false

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const composerModuleService = req.scope.resolve(COMPOSER_MODULE)
    const { email, name, google_id, picture } = (req.body as any) || {}
    const lang = extractLanguage(req)

    if (!email) {
      return res.status(400).json({
        message: lang === "en" ? "Google email is required" : "El correo electrónico de Google es obligatorio",
      })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const fullName = name ? name.trim() : normalizedEmail.split("@")[0]

    // 1. Buscar si el compositor ya existe en la base de datos
    const [composers] = await composerModuleService.listAndCountComposers(
      { email: normalizedEmail },
      { relations: ["bank_account"] }
    )

    if (composers && composers.length > 0) {
      const composer = composers[0]

      if (composer.status === "SUSPENDED") {
        return res.status(403).json({
          message: lang === "en"
            ? "This composer account is currently suspended by administration."
            : "Esta cuenta de compositor se encuentra suspendida por administración.",
        })
      }

      // Si no tenía foto y Google provee una, actualizarla
      if (picture && !composer.photo_url) {
        try {
          await composerModuleService.updateComposers({
            id: composer.id,
            photo_url: picture,
          })
          composer.photo_url = picture
        } catch (photoErr) {
          console.warn("No se pudo actualizar la foto de perfil desde Google:", photoErr)
        }
      }

      const sessionDuration = 7 * 24 * 60 * 60 * 1000 // 7 days
      const expires_at = Date.now() + sessionDuration

      const token = generateSessionToken({
        id: composer.id,
        email: composer.email,
        role: "composer",
      }, sessionDuration)

      console.log(`🔑 [COMPOSER GOOGLE AUTH] Login exitoso para ${normalizedEmail}`)

      return res.status(200).json({
        success: true,
        isNew: false,
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
          photo_url: composer.photo_url || picture || null,
          status: composer.status,
          rejection_reason: composer.rejection_reason,
          bankAccount: composer.bank_account || null,
        },
      })
    }

    // 2. Si no existe, crear la cuenta de compositor automáticamente
    const names = fullName.split(" ")
    const first_name = names[0] || fullName
    const last_name = names.slice(1).join(" ") || ""

    const baseSlug = `${first_name}-${last_name || ""}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
    const uniqueSlug = `${baseSlug || "compositor"}-${Date.now().toString().slice(-4)}`

    const newComposer = await composerModuleService.createComposers({
      first_name,
      last_name,
      artistic_name: fullName,
      slug: uniqueSlug,
      email: normalizedEmail,
      photo_url: picture || null,
      preferred_language: lang,
      status: "DRAFT",
      approval_attempts: 0,
    })

    const sessionDuration = 7 * 24 * 60 * 60 * 1000 // 7 days
    const expires_at = Date.now() + sessionDuration

    const token = generateSessionToken({
      id: newComposer.id,
      email: newComposer.email,
      role: "composer",
    }, sessionDuration)

    // Enviar correo de bienvenida al compositor
    try {
      await sendEmail({
        to: normalizedEmail,
        subject: lang === "en"
          ? "Welcome to Piano Colombia - Composer Portal"
          : "¡Bienvenido a Piano Colombia - Portal de Compositores!",
        html: generateWelcomeEmailHTML({
          userName: fullName,
          lang,
        }),
      })
    } catch (emailErr) {
      console.warn("⚠️ No se pudo enviar correo de bienvenida al nuevo compositor Google:", emailErr)
    }

    console.log(`✅ [COMPOSER GOOGLE AUTH] Nueva cuenta de compositor creada para ${normalizedEmail}`)

    return res.status(201).json({
      success: true,
      isNew: true,
      token,
      expires_at,
      composer: {
        id: newComposer.id,
        email: newComposer.email,
        first_name: newComposer.first_name,
        last_name: newComposer.last_name,
        artistic_name: newComposer.artistic_name || fullName,
        phone: newComposer.phone || null,
        region: newComposer.region || null,
        bio_es: newComposer.bio_es || null,
        bio_en: newComposer.bio_en || null,
        photo_url: newComposer.photo_url || picture || null,
        status: newComposer.status,
        rejection_reason: null,
        bankAccount: null,
      },
    })
  } catch (error: any) {
    console.error("❌ Error en autenticación de compositor con Google:", error)
    return res.status(500).json({
      message: "Error al procesar autenticación con Google para el compositor",
      error: error.message,
    })
  }
}
