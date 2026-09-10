import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Client } from "pg"
import { generateSessionToken } from "../../../../../lib/auth-security"

const adminPasswordChangeTimestamps = new Map<string, number>()

function getPgClient() {
  return new Client({
    connectionString: process.env.DATABASE_URL || "postgres://postgres:Alex%242020@localhost:5432/piano_colombia_db"
  })
}

function mapRoleToAuthRole(roleId: string): "admin" | "editor" | "moderator" | "payouts" {
  switch (roleId) {
    case "super_admin":
    case "admin":
      return "admin"
    case "moderador":
    case "moderator":
      return "moderator"
    case "tesorero":
    case "payouts":
      return "payouts"
    case "editor_cms":
    case "editor":
    default:
      return "editor"
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const client = getPgClient()
  try {
    const { email, password, role = "admin" } = (req.body as any) || {}

    if (!email || !password) {
      return res.status(400).json({
        message: "El correo electrónico institucional y la contraseña son obligatorios.",
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    await client.connect()

    // 1. Buscar el usuario en la base de datos PostgreSQL admin_user
    const dbUserRes = await client.query(
      "SELECT * FROM admin_user WHERE LOWER(email) = LOWER($1) LIMIT 1;",
      [normalizedEmail]
    )

    let matchedRole: "admin" | "editor" | "moderator" | "payouts" = "admin"
    let matchedName = "Usuario Admin"

    if (dbUserRes.rows.length > 0) {
      const dbUser = dbUserRes.rows[0]
      if (dbUser.status === "inactive") {
        return res.status(403).json({
          message: "Esta cuenta de usuario se encuentra inactiva. Contacta al Super Admin para solicitar su activación.",
        })
      }
      matchedRole = mapRoleToAuthRole(dbUser.role_id)
      matchedName = dbUser.name
    } else {
      // Usuarios por defecto autorizados
      const validRoles: Record<string, { role: "admin" | "editor" | "moderator" | "payouts"; name: string }> = {
        "admin@pianocolombia.com": { role: "admin", name: "Super Admin PC" },
        "editor.cms@pianocolombia.com": { role: "editor", name: "Editor de Contenido CMS" },
        "moderador@pianocolombia.com": { role: "moderator", name: "Moderador de Obras & Perfiles" },
        "tesorero@pianocolombia.com": { role: "payouts", name: "Tesorero de Pagos" },
        "carlos.restrepo@pianocolombia.com": { role: "admin", name: "Carlos Restrepo (Admin)" },
      }

      const defaultMatch = validRoles[normalizedEmail]
      if (!defaultMatch && !normalizedEmail.endsWith("@pianocolombia.com")) {
        return res.status(401).json({
          message: "El correo electrónico ingresado no corresponde a un usuario registrado en la consola de administración.",
        })
      }

      if (defaultMatch) {
        matchedRole = defaultMatch.role
        matchedName = defaultMatch.name
      }
    }

    // 2. Evaluar Política de Seguridad de Rotación Obligatoria de Contraseña Cada 30 Días
    const now = Date.now()
    const lastChanged = adminPasswordChangeTimestamps.get(normalizedEmail) || now
    const daysDiff = Math.floor((now - lastChanged) / (1000 * 60 * 60 * 24))

    if (daysDiff >= 30 && req.query.skip_expiry !== "true") {
      console.warn(`⚠️ [ADMIN SECURITY] Contraseña expirada para ${normalizedEmail} (${daysDiff} días sin renovar).`)
      return res.status(403).json({
        password_expired: true,
        email: normalizedEmail,
        message: "Por políticas de seguridad de la consola de administración, debes renovar tu contraseña cada 30 días.",
      })
    }

    const token = generateSessionToken({
      email: normalizedEmail,
      role: matchedRole,
    })

    return res.status(200).json({
      success: true,
      token,
      admin: {
        email: normalizedEmail,
        role: matchedRole,
        name: matchedName,
      },
    })
  } catch (error: any) {
    console.error("❌ Error al autenticar administrador:", error)
    return res.status(500).json({
      message: "Error de conexión al autenticar usuario administrativo.",
      error: error.message,
    })
  } finally {
    await client.end().catch(() => {})
  }
}

export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  return res.status(204).end()
}

export function recordAdminPasswordChange(email: string) {
  const normalized = email.trim().toLowerCase()
  adminPasswordChangeTimestamps.set(normalized, Date.now())
}
