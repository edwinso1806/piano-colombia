import { MedusaRequest } from "@medusajs/framework/http"
import { CUSTOMER_MODULE } from "../modules/customer"

export interface AdminUserRecipient {
  email: string
  name: string
  role: "super_admin" | "admin" | "moderator"
}

// Cuentas Administrativas Iniciales / Registradas en DB para Moderación y Super Administración
const DEFAULT_ADMIN_USERS: AdminUserRecipient[] = [
  {
    email: "admin@pianocolombia.com",
    name: "Super Administrador PC",
    role: "super_admin",
  },
  {
    email: "moderador@pianocolombia.com",
    name: "Moderador de Obras & Perfiles",
    role: "moderator",
  },
]

/**
 * Consulta en la base de datos PostgreSQL la lista dinámica de correos pertenecientes a los roles
 * Super Administrador (super_admin / admin) y Moderador (moderator / moderador).
 */
export async function getAdminAndModeratorEmailsFromDB(req: MedusaRequest): Promise<AdminUserRecipient[]> {
  const recipientsMap = new Map<string, AdminUserRecipient>()

  // 1. Agregar cuentas base del sistema
  for (const user of DEFAULT_ADMIN_USERS) {
    recipientsMap.set(user.email.toLowerCase(), user)
  }

  // 2. Consultar en el módulo de clientes/cuentas de la BD si existen cuentas administrativas asignadas
  try {
    const customerModuleService = req.scope.resolve(CUSTOMER_MODULE)
    const [accounts] = await customerModuleService.listAndCountCustomerAccounts({
      is_active: true,
    })

    if (accounts && accounts.length > 0) {
      for (const acc of accounts) {
        const email = acc.email?.toLowerCase().trim()
        if (!email) continue

        // Filtrar cuentas con rol o identificador administrativo o de moderación
        if (
          email.includes("admin") ||
          email.includes("moderador") ||
          email.includes("moderacion") ||
          email.endsWith("@pianocolombia.com")
        ) {
          const role = email.includes("moderador") ? "moderator" : "super_admin"
          recipientsMap.set(email, {
            email,
            name: `${acc.first_name || ""} ${acc.last_name || ""}`.trim() || "Administrador PC",
            role,
          })
        }
      }
    }
  } catch (err) {
    console.warn("ℹ️ Consulta de usuarios admin en BD utilizando lista activa:", err)
  }

  return Array.from(recipientsMap.values())
}
