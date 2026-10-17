import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { COMPOSER_MODULE } from "../../../../modules/composer"
import { CUSTOMER_MODULE } from "../../../../modules/customer"
import { verifySessionToken } from "../../../../lib/auth-security"
import { Client } from "pg"

export const AUTHENTICATE = false

function getPgClient() {
  return new Client({
    connectionString: process.env.DATABASE_URL || "postgres://postgres:Colombia-93@localhost:5432/piano_colombia_db",
  })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const authHeader = req.headers["authorization"] || req.headers["Authorization"]
    let tokenFromHeader = ""
    if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
      tokenFromHeader = authHeader.slice(7).trim()
    }

    const { token: tokenFromBody, role, email, id } = (req.body as any) || {}
    const token = tokenFromHeader || tokenFromBody

    // 1. Validar token si se proporciona
    let tokenPayload: any = null
    if (token) {
      const verification = verifySessionToken(token)
      if (!verification.valid) {
        return res.status(200).json({
          valid: false,
          expired: verification.reason === "expired",
          reason: verification.reason === "expired" ? "Sesión expirada" : "Token inválido o manipulado",
        })
      }
      tokenPayload = verification.payload
    }

    const effectiveRole = role || tokenPayload?.role
    const effectiveEmail = (email || tokenPayload?.email || "").trim().toLowerCase()
    const effectiveId = id || tokenPayload?.id

    if (!effectiveRole || (!effectiveEmail && !effectiveId)) {
      return res.status(400).json({
        valid: false,
        reason: "Datos de sesión insuficientes para validación",
      })
    }

    // 2. Validación de Compositor
    if (effectiveRole === "composer") {
      const composerModuleService = req.scope.resolve(COMPOSER_MODULE)
      const filters: any = {}
      if (effectiveId) filters.id = effectiveId
      else if (effectiveEmail) filters.email = effectiveEmail

      const [composers] = await composerModuleService.listAndCountComposers(filters, {
        relations: ["bank_account"],
      })

      if (!composers || composers.length === 0) {
        return res.status(200).json({
          valid: false,
          reason: "Perfil de compositor no encontrado o eliminado",
        })
      }

      const composer = composers[0]
      if (composer.status === "SUSPENDED") {
        return res.status(200).json({
          valid: false,
          suspended: true,
          reason: "Esta cuenta de compositor se encuentra suspendida por administración.",
        })
      }

      return res.status(200).json({
        valid: true,
        role: "composer",
        expires_at: tokenPayload?.exp || null,
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
    }

    // 3. Validación de Cliente (Customer)
    if (effectiveRole === "customer") {
      const customerModuleService = req.scope.resolve(CUSTOMER_MODULE)
      const filters: any = {}
      if (effectiveId) filters.id = effectiveId
      else if (effectiveEmail) filters.email = effectiveEmail

      const [customers] = await customerModuleService.listAndCountCustomerAccounts(filters)

      if (!customers || customers.length === 0) {
        return res.status(200).json({
          valid: false,
          reason: "Cuenta de cliente no encontrada o eliminada",
        })
      }

      const customer = customers[0]
      return res.status(200).json({
        valid: true,
        role: "customer",
        expires_at: tokenPayload?.exp || null,
        customer: {
          id: customer.id,
          email: customer.email,
          fullName: `${customer.first_name} ${customer.last_name}`,
          phone: customer.phone,
          taxId: customer.tax_id,
        },
      })
    }

    // 4. Validación de Administrador
    if (effectiveRole === "admin" || effectiveRole === "editor" || effectiveRole === "moderator" || effectiveRole === "payouts") {
      const client = getPgClient()
      try {
        await client.connect()
        const dbUserRes = await client.query(
          "SELECT * FROM admin_user WHERE LOWER(email) = LOWER($1) LIMIT 1;",
          [effectiveEmail]
        )

        if (dbUserRes.rows.length > 0) {
          const dbUser = dbUserRes.rows[0]
          if (dbUser.status === "inactive") {
            return res.status(200).json({
              valid: false,
              reason: "Esta cuenta administrativa ha sido desactivada por el Super Admin.",
            })
          }

          return res.status(200).json({
            valid: true,
            role: "admin",
            expires_at: tokenPayload?.exp || null,
            admin: {
              email: dbUser.email,
              role: dbUser.role_id,
              name: dbUser.name,
            },
          })
        } else {
          // Usuarios institucionales estáticos
          if (effectiveEmail.endsWith("@pianocolombia.com")) {
            return res.status(200).json({
              valid: true,
              role: "admin",
              expires_at: tokenPayload?.exp || null,
              admin: {
                email: effectiveEmail,
                role: effectiveRole,
                name: "Admin Institucional",
              },
            })
          }

          return res.status(200).json({
            valid: false,
            reason: "Usuario administrativo no encontrado",
          })
        }
      } finally {
        await client.end().catch(() => {})
      }
    }

    return res.status(400).json({
      valid: false,
      reason: "Rol de usuario no reconocido",
    })
  } catch (error: any) {
    console.error("❌ Error validando sesión:", error)
    return res.status(500).json({
      valid: false,
      reason: "Error interno al verificar sesión",
      error: error.message,
    })
  }
}

export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  return res.status(204).end()
}
