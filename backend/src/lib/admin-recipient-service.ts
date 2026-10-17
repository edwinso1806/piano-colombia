import { MedusaRequest } from "@medusajs/framework/http"
import { Client } from "pg"

export interface AdminUserRecipient {
  email: string
  name: string
  role: "super_admin" | "admin" | "moderator"
}

function getPgClient() {
  return new Client({
    connectionString: process.env.DATABASE_URL || "postgres://postgres:Colombia-93@localhost:5432/piano_colombia_db"
  })
}

/**
 * Consulta en la base de datos PostgreSQL la lista dinámica de correos pertenecientes a los roles
 * Super Administrador (super_admin / admin) y Moderador (moderator / moderador) en la tabla admin_user.
 * También incluye los correos definidos en la variable de entorno ADMIN_NOTIFICATION_EMAILS.
 */
export async function getAdminAndModeratorEmailsFromDB(req?: MedusaRequest): Promise<AdminUserRecipient[]> {
  const recipientsMap = new Map<string, AdminUserRecipient>()
  const client = getPgClient()

  try {
    await client.connect()
    // 1. Consultar usuarios activos con rol de super_admin o moderador en la tabla admin_user
    const query = `
      SELECT id, name, email, role_id, status 
      FROM admin_user 
      WHERE status = 'active' 
        AND role_id IN ('super_admin', 'admin', 'moderador', 'moderator');
    `
    const res = await client.query(query)
    for (const row of res.rows) {
      const email = row.email?.toLowerCase().trim()
      if (!email) continue
      const role: "super_admin" | "admin" | "moderator" = 
        row.role_id === "super_admin" || row.role_id === "admin" ? "super_admin" : "moderator"
      recipientsMap.set(email, {
        email,
        name: row.name || "Equipo Administrativo PC",
        role,
      })
    }
  } catch (err: any) {
    console.warn("⚠️ Error consultando tabla admin_user para destinatarios:", err.message)
  } finally {
    await client.end().catch(() => {})
  }

  // 2. Correos adicionales configurados en variables de entorno (ej: ADMIN_NOTIFICATION_EMAILS)
  const envEmails = process.env.ADMIN_NOTIFICATION_EMAILS
  if (envEmails) {
    const list = envEmails.split(",").map(e => e.trim().toLowerCase()).filter(Boolean)
    for (const email of list) {
      if (!recipientsMap.has(email)) {
        recipientsMap.set(email, {
          email,
          name: "Administrador / Notificaciones",
          role: "super_admin",
        })
      }
    }
  }

  return Array.from(recipientsMap.values())
}

