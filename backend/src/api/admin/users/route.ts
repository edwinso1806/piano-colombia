import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Client } from "pg"
import crypto from "crypto"
import { sendEmail, generateNewAdminUserInvitationHTML, extractLanguage, EMAIL_SUBJECTS } from "../../../lib/resend-mailer"

export const AUTHENTICATE = false

function getPgClient() {
  return new Client({
    connectionString: process.env.DATABASE_URL || "postgres://postgres:Alex%242020@localhost:5432/piano_colombia_db"
  })
}

async function ensureAdminUserTableExists(client: Client) {
  const tableCheck = await client.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = 'admin_user'
    );
  `)

  if (!tableCheck.rows[0].exists) {
    await client.query(`
      CREATE TABLE admin_user (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        role_id TEXT NOT NULL,
        role_name TEXT NOT NULL,
        role_badge_color TEXT NOT NULL,
        role_icon TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        last_login TEXT NOT NULL DEFAULT 'Nunca',
        permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
        avatar_bg TEXT NOT NULL DEFAULT 'bg-[#0071BC]',
        activation_token TEXT,
        password_hash TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `)
  } else {
    await client.query(`
      ALTER TABLE admin_user ADD COLUMN IF NOT EXISTS activation_token TEXT;
      ALTER TABLE admin_user ADD COLUMN IF NOT EXISTS password_hash TEXT;
    `)
  }

    // Seed inicial por defecto
    const seedUsers = [
      {
        id: "usr-001",
        name: "Carlos Mario Restrepo",
        email: "carlos.admin@pianocolombia.com",
        role_id: "super_admin",
        role_name: "Super Admin",
        role_badge_color: "bg-red-100 text-red-700 border-red-200",
        role_icon: "shield_person",
        status: "active",
        last_login: "Hoy, 10:45 AM (IP: 190.157.12.4)",
        permissions: JSON.stringify(["Acceso Total", "Gestión de Usuarios", "CMS", "Aprobaciones", "Dispersión Pagos"]),
        avatar_bg: "bg-[#C1272D]",
      },
      {
        id: "usr-002",
        name: "Laura Sofia Benítez",
        email: "laura.cms@pianocolombia.com",
        role_id: "editor_cms",
        role_name: "Editor de Contenido",
        role_badge_color: "bg-blue-100 text-blue-700 border-blue-200",
        role_icon: "edit_note",
        status: "active",
        last_login: "Ayer, 04:20 PM (IP: 181.132.45.10)",
        permissions: JSON.stringify(["Edición CMS Hero", "Gestión de Banners", "FAQ & Artículos"]),
        avatar_bg: "bg-[#0071BC]",
      },
      {
        id: "usr-003",
        name: "Santiago Bermúdez",
        email: "santiago.moderacion@pianocolombia.com",
        role_id: "moderador",
        role_name: "Moderador de Partituras",
        role_badge_color: "bg-amber-100 text-amber-800 border-amber-200",
        role_icon: "verified",
        status: "active",
        last_login: "02 Sep 2026, 11:15 AM (IP: 190.24.18.99)",
        permissions: JSON.stringify(["Aprobar Partituras", "Verificar Compositores", "Revisión DRM PDF"]),
        avatar_bg: "bg-[#FBB03B] text-[#111C2D]",
      },
      {
        id: "usr-004",
        name: "Mariana Valencia Giraldo",
        email: "mariana.tesoreria@pianocolombia.com",
        role_id: "tesorero",
        role_name: "Tesorero / Pagos",
        role_badge_color: "bg-emerald-100 text-emerald-800 border-emerald-200",
        role_icon: "payments",
        status: "active",
        last_login: "Hoy, 09:10 AM (IP: 200.21.140.2)",
        permissions: JSON.stringify(["Ejecutar Dispersión Wompi", "Exportar Certificados Fiscales", "Reportes DIAN"]),
        avatar_bg: "bg-emerald-700",
      },
      {
        id: "usr-005",
        name: "Felipe Osorio Cardona",
        email: "felipe.editor@pianocolombia.com",
        role_id: "editor_cms",
        role_name: "Editor de Contenido",
        role_badge_color: "bg-blue-100 text-blue-700 border-blue-200",
        role_icon: "edit_note",
        status: "inactive",
        last_login: "15 Ago 2026, 03:30 PM",
        permissions: JSON.stringify(["Edición CMS Hero", "Gestión de Banners"]),
        avatar_bg: "bg-slate-600",
      },
    ]

    for (const u of seedUsers) {
      await client.query(`
        INSERT INTO admin_user (id, name, email, role_id, role_name, role_badge_color, role_icon, status, last_login, permissions, avatar_bg, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
        ON CONFLICT (email) DO NOTHING;
      `, [u.id, u.name, u.email, u.role_id, u.role_name, u.role_badge_color, u.role_icon, u.status, u.last_login, u.permissions, u.avatar_bg])
    }
  }

function isUserSuperAdmin(requestingRole?: string, requestingEmail?: string) {
  if (!requestingRole && !requestingEmail) return true
  const normalizedRole = (requestingRole || "").toLowerCase().trim()
  const normalizedEmail = (requestingEmail || "").toLowerCase().trim()

  return (
    normalizedRole === "admin" ||
    normalizedRole === "super_admin" ||
    normalizedEmail === "admin@pianocolombia.com" ||
    normalizedEmail === "carlos.admin@pianocolombia.com"
  )
}

function getRoleMetadata(roleId: string) {
  switch (roleId) {
    case "super_admin":
      return {
        roleName: "Super Admin",
        roleBadgeColor: "bg-red-100 text-red-700 border-red-200",
        roleIcon: "shield_person",
        avatarBg: "bg-[#C1272D]",
        defaultPermissions: ["Acceso Total", "Gestión de Usuarios", "CMS", "Aprobaciones", "Dispersión Pagos"],
      }
    case "moderador":
      return {
        roleName: "Moderador de Partituras",
        roleBadgeColor: "bg-amber-100 text-amber-800 border-amber-200",
        roleIcon: "verified",
        avatarBg: "bg-[#FBB03B] text-[#111C2D]",
        defaultPermissions: ["Aprobar Partituras", "Verificar Compositores", "Revisión DRM PDF"],
      }
    case "tesorero":
      return {
        roleName: "Tesorero / Pagos",
        roleBadgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
        roleIcon: "payments",
        avatarBg: "bg-emerald-700",
        defaultPermissions: ["Ejecutar Dispersión Wompi", "Exportar Certificados Fiscales", "Reportes DIAN"],
      }
    case "editor_cms":
    default:
      return {
        roleName: "Editor de Contenido",
        roleBadgeColor: "bg-blue-100 text-blue-700 border-blue-200",
        roleIcon: "edit_note",
        avatarBg: "bg-[#0071BC]",
        defaultPermissions: ["Edición CMS Hero", "Gestión de Banners", "FAQ & Artículos"],
      }
  }
}

// 1. GET: Consultar lista completa de usuarios administrativos
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const client = getPgClient()
  try {
    const { requesting_user_role, requesting_user_email } = (req.query as any) || {}
    if (requesting_user_role || requesting_user_email) {
      if (!isUserSuperAdmin(requesting_user_role, requesting_user_email)) {
        return res.status(403).json({
          success: false,
          message: "Acceso Denegado: Únicamente el usuario Super Admin tiene permisos para consultar el directorio de usuarios.",
        })
      }
    }

    await client.connect()
    await ensureAdminUserTableExists(client)

    const result = await client.query("SELECT * FROM admin_user ORDER BY created_at DESC;")

    const users = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      roleId: row.role_id,
      roleName: row.role_name,
      roleBadgeColor: row.role_badge_color,
      roleIcon: row.role_icon,
      status: row.status,
      lastLogin: row.last_login,
      permissions: typeof row.permissions === "string" ? JSON.parse(row.permissions) : row.permissions,
      avatarBg: row.avatar_bg,
      created_at: row.created_at,
    }))

    return res.status(200).json({
      success: true,
      users,
    })
  } catch (error: any) {
    console.error("❌ Error al obtener usuarios administrativos:", error)
    return res.status(500).json({
      success: false,
      message: "Error al obtener lista de usuarios administrativos.",
      error: error.message,
    })
  } finally {
    await client.end().catch(() => {})
  }
}

// 2. POST: Crear un nuevo usuario administrativo (Requiere Super Admin)
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const client = getPgClient()
  try {
    const {
      name,
      email,
      role = "editor_cms",
      permissions,
      requesting_user_role,
      requesting_user_email,
    } = (req.body as any) || {}

    // Validar RBAC
    if (!isUserSuperAdmin(requesting_user_role, requesting_user_email)) {
      return res.status(403).json({
        success: false,
        message: "Acceso Denegado: Únicamente el usuario Super Admin tiene permisos para crear nuevos usuarios de la consola.",
      })
    }

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "El nombre completo y el correo corporativo son obligatorios.",
      })
    }

    const normalizedEmail = email.trim().toLowerCase()
    await client.connect()
    await ensureAdminUserTableExists(client)

    // Verificar duplicado
    const checkDup = await client.query("SELECT id FROM admin_user WHERE LOWER(email) = LOWER($1) LIMIT 1;", [normalizedEmail])
    if (checkDup.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Ya existe un usuario administrativo registrado con el correo ${normalizedEmail}.`,
      })
    }

    const meta = getRoleMetadata(role)
    const newId = `usr-${Date.now().toString().slice(-4)}`
    const finalPermissions = permissions && Array.isArray(permissions) && permissions.length > 0 ? permissions : meta.defaultPermissions
    const activationToken = crypto.randomBytes(24).toString("hex")

    const insertQuery = `
      INSERT INTO admin_user (
        id, name, email, role_id, role_name, role_badge_color, role_icon, status, last_login, permissions, avatar_bg, activation_token, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      RETURNING *;
    `
    const insertRes = await client.query(insertQuery, [
      newId,
      name.trim(),
      normalizedEmail,
      role,
      meta.roleName,
      meta.roleBadgeColor,
      meta.roleIcon,
      "active",
      "Nunca (Invitación enviada)",
      JSON.stringify(finalPermissions),
      meta.avatarBg,
      activationToken,
    ])

    const row = insertRes.rows[0]
    const newUser = {
      id: row.id,
      name: row.name,
      email: row.email,
      roleId: row.role_id,
      roleName: row.role_name,
      roleBadgeColor: row.role_badge_color,
      roleIcon: row.role_icon,
      status: row.status,
      lastLogin: row.last_login,
      permissions: typeof row.permissions === "string" ? JSON.parse(row.permissions) : row.permissions,
      avatarBg: row.avatar_bg,
    }

    // Enviar notificación de bienvenida / invitación por correo bilingüe
    try {
      const lang = extractLanguage(req)
      await sendEmail({
        to: normalizedEmail,
        subject: EMAIL_SUBJECTS.adminInvitation[lang],
        html: generateNewAdminUserInvitationHTML({
          userName: name.trim(),
          userEmail: normalizedEmail,
          roleName: meta.roleName,
          permissions: finalPermissions,
          createdByName: requesting_user_email || (lang === "en" ? "Super Administration PC" : "Super Administración PC"),
          activationToken,
          lang,
        }),
      })
    } catch (mailErr) {
      console.warn("⚠️ Advertencia enviando invitación de usuario por correo:", mailErr)
    }

    return res.status(201).json({
      success: true,
      message: `¡Usuario ${name.trim()} creado exitosamente! Se ha enviado la invitación por correo electrónico a ${normalizedEmail}.`,
      user: newUser,
    })
  } catch (error: any) {
    console.error("❌ Error al crear usuario administrativo:", error)
    return res.status(500).json({
      success: false,
      message: "Error al crear el usuario administrativo.",
      error: error.message,
    })
  } finally {
    await client.end().catch(() => {})
  }
}

// 3. PUT: Editar usuario administrativo (Nombre, Email, Rol, Permisos, Estado) (Requiere Super Admin)
export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  const client = getPgClient()
  try {
    const {
      id,
      name,
      email,
      role,
      permissions,
      status,
      requesting_user_role,
      requesting_user_email,
    } = (req.body as any) || {}

    // Validar RBAC
    if (!isUserSuperAdmin(requesting_user_role, requesting_user_email)) {
      return res.status(403).json({
        success: false,
        message: "Acceso Denegado: Únicamente el usuario Super Admin puede editar la información o permisos de los usuarios.",
      })
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "El ID del usuario es obligatorio para actualizar sus datos.",
      })
    }

    await client.connect()
    await ensureAdminUserTableExists(client)

    const findUser = await client.query("SELECT * FROM admin_user WHERE id = $1 LIMIT 1;", [id])
    if (findUser.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" })
    }

    const current = findUser.rows[0]
    const targetRole = role || current.role_id
    const meta = getRoleMetadata(targetRole)

    const updateQuery = `
      UPDATE admin_user
      SET 
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        role_id = $3,
        role_name = $4,
        role_badge_color = $5,
        role_icon = $6,
        avatar_bg = $7,
        permissions = $8,
        status = COALESCE($9, status),
        updated_at = NOW()
      WHERE id = $10
      RETURNING *;
    `
    const finalPermissions = permissions && Array.isArray(permissions) ? permissions : meta.defaultPermissions

    const updateRes = await client.query(updateQuery, [
      name ? name.trim() : null,
      email ? email.trim().toLowerCase() : null,
      targetRole,
      meta.roleName,
      meta.roleBadgeColor,
      meta.roleIcon,
      meta.avatarBg,
      JSON.stringify(finalPermissions),
      status || null,
      id,
    ])

    const row = updateRes.rows[0]
    const updatedUser = {
      id: row.id,
      name: row.name,
      email: row.email,
      roleId: row.role_id,
      roleName: row.role_name,
      roleBadgeColor: row.role_badge_color,
      roleIcon: row.role_icon,
      status: row.status,
      lastLogin: row.last_login,
      permissions: typeof row.permissions === "string" ? JSON.parse(row.permissions) : row.permissions,
      avatarBg: row.avatar_bg,
    }

    return res.status(200).json({
      success: true,
      message: `¡Datos y permisos de ${updatedUser.name} actualizados correctamente!`,
      user: updatedUser,
    })
  } catch (error: any) {
    console.error("❌ Error al editar usuario administrativo:", error)
    return res.status(500).json({
      success: false,
      message: "Error al actualizar la información del usuario.",
      error: error.message,
    })
  } finally {
    await client.end().catch(() => {})
  }
}

// 4. PATCH: Alternar Estado Activo / Inactivo (Requiere Super Admin)
export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  const client = getPgClient()
  try {
    const { id, requesting_user_role, requesting_user_email } = (req.body as any) || {}

    // Validar RBAC
    if (!isUserSuperAdmin(requesting_user_role, requesting_user_email)) {
      return res.status(403).json({
        success: false,
        message: "Acceso Denegado: Únicamente el usuario Super Admin puede activar o inactivar cuentas de usuario.",
      })
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "El ID del usuario es obligatorio.",
      })
    }

    await client.connect()
    await ensureAdminUserTableExists(client)

    const toggleRes = await client.query(`
      UPDATE admin_user
      SET 
        status = CASE WHEN status = 'active' THEN 'inactive' ELSE 'active' END,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *;
    `, [id])

    if (toggleRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" })
    }

    const row = toggleRes.rows[0]
    const updatedUser = {
      id: row.id,
      name: row.name,
      email: row.email,
      roleId: row.role_id,
      roleName: row.role_name,
      roleBadgeColor: row.role_badge_color,
      roleIcon: row.role_icon,
      status: row.status,
      lastLogin: row.last_login,
      permissions: typeof row.permissions === "string" ? JSON.parse(row.permissions) : row.permissions,
      avatarBg: row.avatar_bg,
    }

    return res.status(200).json({
      success: true,
      message: `El usuario ${updatedUser.name} ahora se encuentra ${updatedUser.status === "active" ? "Activo" : "Inactivo"}.`,
      user: updatedUser,
    })
  } catch (error: any) {
    console.error("❌ Error al alternar estado de usuario:", error)
    return res.status(500).json({
      success: false,
      message: "Error al cambiar el estado del usuario.",
      error: error.message,
    })
  } finally {
    await client.end().catch(() => {})
  }
}
