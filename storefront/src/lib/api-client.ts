const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "pk_0372bd6f8b5885e7dcfd759e152d7a9db36782d5eaace95f07e707f2e9f68ce3"

const defaultHeaders: HeadersInit = {
  "x-publishable-api-key": PUBLISHABLE_KEY,
  "Content-Type": "application/json",
}

// ----------------------------------------------------------------------
// 1. Catálogo de Partituras (Scores)
// ----------------------------------------------------------------------

export async function getCatalogScores(filters?: {
  genre?: string
  difficulty?: string
  is_featured?: boolean
  limit?: number
}) {
  try {
    const params = new URLSearchParams()
    if (filters?.genre && filters.genre !== "all") params.append("genre", filters.genre.toUpperCase())
    if (filters?.difficulty && filters.difficulty !== "all") params.append("difficulty", filters.difficulty.toUpperCase())
    if (filters?.is_featured) params.append("is_featured", "true")
    if (filters?.limit) params.append("limit", filters.limit.toString())

    const res = await fetch(`${MEDUSA_URL}/store/scores?${params.toString()}`, {
      headers: defaultHeaders,
      next: { revalidate: 30 },
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return data.scores || []
  } catch (err) {
    console.warn("[Medusa API] Fallback a datos locales para catálogo:", err)
    return null
  }
}

export async function getComposerScoresApi(composerId: string, status?: string) {
  try {
    const params = new URLSearchParams()
    params.append("composer_id", composerId)
    if (status && status !== "todas") params.append("status", status)

    const res = await fetch(`${MEDUSA_URL}/store/scores?${params.toString()}`, {
      headers: defaultHeaders,
      cache: "no-store",
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return data.scores || []
  } catch (err) {
    console.warn("Error consultando partituras del compositor:", err)
    return []
  }
}

// ----------------------------------------------------------------------
// 2. Directorio de Compositores
// ----------------------------------------------------------------------

export async function getComposersList(filters?: { is_featured?: boolean }) {
  try {
    const params = new URLSearchParams()
    if (filters?.is_featured) params.append("is_featured", "true")

    const res = await fetch(`${MEDUSA_URL}/store/composers?${params.toString()}`, {
      headers: defaultHeaders,
      next: { revalidate: 60 },
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return data.composers || []
  } catch (err) {
    console.warn("[Medusa API] Fallback a datos locales para compositores:", err)
    return null
  }
}

export async function getComposerBySlug(slug: string) {
  try {
    const res = await fetch(`${MEDUSA_URL}/store/composers/${slug}`, {
      next: { revalidate: 30 },
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return data.composer || null
  } catch (err) {
    console.warn("[Medusa API] Fallback a compositor local:", err)
    return null
  }
}

// ----------------------------------------------------------------------
// 3. CMS Hero Banner
// ----------------------------------------------------------------------

export async function getHeroCms() {
  try {
    const res = await fetch(`${MEDUSA_URL}/store/cms/hero`, {
      next: { revalidate: 10 },
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn("[Medusa API] Fallback a Hero CMS local:", err)
    return null
  }
}

export async function updateHeroCmsAdmin(heroData: any) {
  const res = await fetch(`${MEDUSA_URL}/admin/cms/hero`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(heroData),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || "Error al actualizar CMS")
  }
  return await res.json()
}

// ----------------------------------------------------------------------
// 4. Portal de Compositores (Registro & Moderación)
// ----------------------------------------------------------------------

export async function registerComposerApplication(composerData: any) {
  const res = await fetch(`${MEDUSA_URL}/store/composers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(composerData),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || "Error al enviar solicitud de compositor")
  }
  return data
}

export async function sendComposerOtpApi(composerData: any) {
  const res = await fetch(`${MEDUSA_URL}/store/composers/otp/send`, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify(composerData),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || "Error al enviar código de verificación")
  }
  return data
}

export async function verifyComposerOtpApi(payload: { email: string; code: string }) {
  const res = await fetch(`${MEDUSA_URL}/store/composers/otp/verify`, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || "Código de verificación inválido")
  }
  return data
}

export async function getAdminComposersQueue(status?: string) {
  try {
    const params = new URLSearchParams()
    if (status) params.append("status", status)

    const res = await fetch(`${MEDUSA_URL}/admin/composers?${params.toString()}`, {
      cache: "no-store",
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return data.composers || []
  } catch (err) {
    console.warn("[Medusa Admin] Fallback a cola de compositores local:", err)
    return null
  }
}

export async function approveComposerAdmin(id: string) {
  const res = await fetch(`${MEDUSA_URL}/admin/composers/${id}/approve`, {
    method: "POST",
  })
  if (!res.ok) throw new Error("Error al aprobar compositor")
  return await res.json()
}

export async function rejectComposerAdmin(id: string, reason: string, isPermanentBlock: boolean = false) {
  const res = await fetch(`${MEDUSA_URL}/admin/composers/${id}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason, is_permanent_block: isPermanentBlock }),
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.message || "Error al procesar la solicitud de moderación")
  }
  return await res.json()
}

// ----------------------------------------------------------------------
// 5. Moderación de Partituras (Admin)
// ----------------------------------------------------------------------

export async function getAdminScoresQueue(status?: string) {
  try {
    const params = new URLSearchParams()
    if (status) params.append("status", status)

    const res = await fetch(`${MEDUSA_URL}/admin/scores?${params.toString()}`, {
      cache: "no-store",
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return data.scores || []
  } catch (err) {
    console.warn("[Medusa Admin] Fallback a moderación de partituras local:", err)
    return null
  }
}

export async function approveScoreAdmin(id: string) {
  const res = await fetch(`${MEDUSA_URL}/admin/scores/${id}/approve`, {
    method: "POST",
  })
  if (!res.ok) throw new Error("Error al aprobar partitura")
  return await res.json()
}

export async function rejectScoreAdmin(id: string, reason: string) {
  const res = await fetch(`${MEDUSA_URL}/admin/scores/${id}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  })
  if (!res.ok) throw new Error("Error al rechazar partitura")
  return await res.json()
}

// ----------------------------------------------------------------------
// 5.1 Estadísticas del Tablero General & Gestión de Comisiones (BD Real)
// ----------------------------------------------------------------------

export async function getAdminDashboardStats() {
  try {
    const res = await fetch(`${MEDUSA_URL}/admin/dashboard/stats`, {
      cache: "no-store",
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    console.error("[Medusa Admin] Error al obtener estadísticas del tablero:", err)
    return null
  }
}

export async function getCommissionSettings() {
  try {
    const res = await fetch(`${MEDUSA_URL}/admin/settings/commission`, {
      cache: "no-store",
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    console.error("[Medusa Admin] Error al obtener configuración de comisiones:", err)
    return null
  }
}

export async function updateGeneralCommission(defaultCommission: number) {
  const res = await fetch(`${MEDUSA_URL}/admin/settings/commission`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "general",
      defaultCommission,
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || "Error al actualizar comisión general")
  }
  return data
}

export async function updateComposerCommission(composerId: string, customCommission: number | null) {
  const res = await fetch(`${MEDUSA_URL}/admin/settings/commission`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "composer",
      composerId,
      customCommission,
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || "Error al actualizar comisión del compositor")
  }
  return data
}

// ----------------------------------------------------------------------
// 6. Autenticación Real de Usuarios (PostgreSQL + Medusa)
// ----------------------------------------------------------------------


export async function loginCustomerApi(email: string, password: string) {
  try {
    const res = await fetch(`${MEDUSA_URL}/store/auth/login`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.message || "Correo o contraseña incorrectos. Por favor verifica tus credenciales.")
    }
    return data
  } catch (err: any) {
    if (err.message === "Failed to fetch" || err.message?.includes("fetch") || err.name === "TypeError") {
      throw new Error("No se pudo conectar con el servidor de autenticación. Por favor intenta de nuevo.")
    }
    throw err
  }
}

export async function sendOtpRegisterApi(payload: {
  fullName: string
  email: string
  password: string
  phone?: string
  taxId?: string
}) {
  try {
    const res = await fetch(`${MEDUSA_URL}/store/auth/otp/send`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify({
        full_name: payload.fullName,
        email: payload.email,
        password: payload.password,
        phone: payload.phone,
        tax_id: payload.taxId,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.message || "Error al enviar código de verificación")
    return data
  } catch (err: any) {
    if (err.message === "Failed to fetch" || err.message?.includes("fetch") || err.name === "TypeError") {
      throw new Error("No se pudo conectar con el servidor de autenticación. Por favor intenta de nuevo.")
    }
    throw err
  }
}

export async function verifyOtpRegisterApi(payload: {
  email: string
  code: string
}) {
  try {
    const res = await fetch(`${MEDUSA_URL}/store/auth/otp/verify`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify({
        email: payload.email,
        code: payload.code,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.message || "Código de verificación inválido")
    return data
  } catch (err: any) {
    if (err.message === "Failed to fetch" || err.message?.includes("fetch") || err.name === "TypeError") {
      throw new Error("No se pudo conectar con el servidor de autenticación. Por favor intenta de nuevo.")
    }
    throw err
  }
}

export async function loginWithGoogleApi(payload: {
  email: string
  name: string
  googleId?: string
  picture?: string
}) {
  try {
    const res = await fetch(`${MEDUSA_URL}/store/auth/google`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify({
        email: payload.email,
        name: payload.name,
        google_id: payload.googleId,
        picture: payload.picture,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.message || "Error en autenticación con Google")
    return data
  } catch (err: any) {
    if (err.message === "Failed to fetch" || err.message?.includes("fetch") || err.name === "TypeError") {
      throw new Error("No se pudo conectar con el servidor de autenticación. Por favor intenta de nuevo.")
    }
    throw err
  }
}

export async function registerCustomerApi(payload: {
  fullName: string
  email: string
  password: string
  phone?: string
  taxId?: string
}) {
  try {
    const res = await fetch(`${MEDUSA_URL}/store/auth/register`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify({
        full_name: payload.fullName,
        email: payload.email,
        password: payload.password,
        phone: payload.phone,
        tax_id: payload.taxId,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.message || "Error al registrar cliente")
    return data
  } catch (err: any) {
    if (err.message === "Failed to fetch" || err.message?.includes("fetch") || err.name === "TypeError") {
      throw new Error("No se pudo conectar con el servidor. Por favor intenta de nuevo.")
    }
    throw err
  }
}

export async function loginComposerApi(email: string, password: string) {
  try {
    const res = await fetch(`${MEDUSA_URL}/store/auth/composer/login`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.message || "Correo o contraseña incorrectos. Por favor verifica tus credenciales.")
    return data
  } catch (err: any) {
    if (err.message === "Failed to fetch" || err.message?.includes("fetch") || err.name === "TypeError") {
      throw new Error("No se pudo conectar con el servidor. Por favor intenta de nuevo.")
    }
    throw err
  }
}

export async function loginAdminApi(email: string, password: string, role?: string) {
  try {
    const res = await fetch(`${MEDUSA_URL}/admin/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, role }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      if (res.status === 403 && data.password_expired) {
        const err: any = new Error(data.message || "Tu contraseña de administración ha expirado.")
        err.password_expired = true
        throw err
      }
      if (res.status === 401 || data.message === "Unauthorized") {
        throw new Error(data.message || "El correo institucional o la contraseña ingresada son incorrectos. Por favor verifica tus credenciales institucionales o utiliza la opción de recuperar contraseña.")
      }
      throw new Error(data.message || "Credenciales administrativas incorrectas.")
    }
    return data
  } catch (err: any) {
    if (err.password_expired || (err.message && !err.message.includes("fetch") && err.name !== "TypeError")) {
      throw err
    }
    if (err.message === "Failed to fetch" || err.message?.includes("fetch") || err.name === "TypeError") {
      throw new Error("No se pudo conectar con el servidor. Por favor intenta de nuevo.")
    }
    throw err
  }
}

// ----------------------------------------------------------------------
// 7. Recuperación de Contraseña (Password Reset OTP)
// ----------------------------------------------------------------------

export async function requestPasswordResetApi(payload: {
  email: string
  role?: "customer" | "composer" | "admin"
  token?: string
}) {
  try {
    const res = await fetch(`${MEDUSA_URL}/auth/password-reset/request`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify({
        email: payload.email,
        role: payload.role || "customer",
        token: payload.token,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.message || "Error al solicitar código de recuperación")
    return data
  } catch (err: any) {
    if (err.message === "Failed to fetch" || err.message?.includes("fetch") || err.name === "TypeError") {
      throw new Error("No se pudo conectar con el servidor de autenticación. Por favor intenta de nuevo.")
    }
    throw err
  }
}

export async function confirmPasswordResetApi(payload: {
  email: string
  code: string
  newPassword: string
  role?: "customer" | "composer" | "admin"
  token?: string
}) {
  try {
    const res = await fetch(`${MEDUSA_URL}/auth/password-reset/confirm`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify({
        email: payload.email,
        code: payload.code,
        new_password: payload.newPassword,
        role: payload.role || "customer",
        token: payload.token,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.message || "Error al restablecer la contraseña")
    return data
  } catch (err: any) {
    if (err.message === "Failed to fetch" || err.message?.includes("fetch") || err.name === "TypeError") {
      throw new Error("No se pudo conectar con el servidor de autenticación. Por favor intenta de nuevo.")
    }
    throw err
  }
}

// ----------------------------------------------------------------------
// 8. Almacenamiento Cloudflare R2 & Perfil de Compositor
// ----------------------------------------------------------------------

export async function uploadFileApi(payload: {
  base64: string
  fileName: string
  fileType: string
  folder?: string
}) {
  const res = await fetch(`${MEDUSA_URL}/store/uploads`, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || "Error al subir archivo a Cloudflare R2")
  return data
}

export async function getComposerProfileApi(idOrEmail: string) {
  const queryParam = idOrEmail.includes("@") ? `email=${encodeURIComponent(idOrEmail)}` : `id=${encodeURIComponent(idOrEmail)}`
  const res = await fetch(`${MEDUSA_URL}/store/composers/profile?${queryParam}`, {
    headers: defaultHeaders,
    cache: "no-store",
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || "Error al consultar perfil del compositor")
  return data.composer
}

export async function updateComposerProfileApi(payload: any) {
  const res = await fetch(`${MEDUSA_URL}/store/composers/profile`, {
    method: "PUT",
    headers: defaultHeaders,
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || "Error al guardar perfil de compositor")
  return data
}

// 7. Gestión de Usuarios Administrativos RBAC
export async function getAdminUsersApi(requestingUser?: { role?: string; email?: string }) {
  const params = new URLSearchParams()
  if (requestingUser?.role) params.append("requesting_user_role", requestingUser.role)
  if (requestingUser?.email) params.append("requesting_user_email", requestingUser.email)
  const qs = params.toString() ? `?${params.toString()}` : ""
  const res = await fetch(`${MEDUSA_URL}/admin/users${qs}`, {
    method: "GET",
    headers: defaultHeaders,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || "Error al consultar usuarios administrativos")
  return data.users || []
}

export async function createAdminUserApi(payload: {
  name: string
  email: string
  role: string
  permissions?: string[]
  requesting_user_role?: string
  requesting_user_email?: string
}) {
  const res = await fetch(`${MEDUSA_URL}/admin/users`, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || "Error al crear usuario administrativo")
  return data
}

export async function updateAdminUserApi(payload: {
  id: string
  name?: string
  email?: string
  role?: string
  permissions?: string[]
  status?: string
  requesting_user_role?: string
  requesting_user_email?: string
}) {
  const res = await fetch(`${MEDUSA_URL}/admin/users`, {
    method: "PUT",
    headers: defaultHeaders,
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || "Error al actualizar usuario administrativo")
  return data
}

export async function toggleAdminUserStatusApi(payload: {
  id: string
  requesting_user_role?: string
  requesting_user_email?: string
}) {
  const res = await fetch(`${MEDUSA_URL}/admin/users`, {
    method: "PATCH",
    headers: defaultHeaders,
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || "Error al cambiar estado de usuario")
  return data
}

export async function resendAdminUserInvitationApi(payload: {
  userId: string
  requesting_user_role?: string
  requesting_user_email?: string
}) {
  const res = await fetch(`${MEDUSA_URL}/admin/users/resend-invitation`, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || "Error al reenviar invitación de usuario")
  return data
}

// ----------------------------------------------------------------------
// 9. Metadatos Dinámicos del Catálogo (Categorías & Dificultades CMS)
// ----------------------------------------------------------------------

export async function getStoreCatalogMetadata() {
  try {
    const res = await fetch(`${MEDUSA_URL}/store/settings/metadata`, {
      headers: defaultHeaders,
      cache: "no-store",
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn("Fallback a metadatos locales:", err)
    return {
      categories: ["Pasillo", "Bambuco", "Danza", "Guabina", "Vals", "Cumbia", "Porro", "Joropo", "Contradanza", "Estudio"],
      difficulties: ["Iniciación / Fácil", "Intermedio", "Avanzado", "Virtuoso / Concierto"],
    }
  }
}

export async function getAdminCatalogMetadata() {
  try {
    const res = await fetch(`${MEDUSA_URL}/admin/settings/metadata`, {
      headers: defaultHeaders,
      cache: "no-store",
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn("Fallback a metadatos admin locales:", err)
    return {
      categories: ["Pasillo", "Bambuco", "Danza", "Guabina", "Vals", "Cumbia", "Porro", "Joropo", "Contradanza", "Estudio"],
      difficulties: ["Iniciación / Fácil", "Intermedio", "Avanzado", "Virtuoso / Concierto"],
    }
  }
}

export async function updateAdminCatalogMetadata(payload: { categories?: string[]; difficulties?: string[] }) {
  const res = await fetch(`${MEDUSA_URL}/admin/settings/metadata`, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || "Error al actualizar metadatos del catálogo")
  return data
}

// ----------------------------------------------------------------------
// 10. Gestión de Partituras por el Compositor (Creación & Edición)
// ----------------------------------------------------------------------

export async function createScoreApi(scoreData: Record<string, unknown>) {
  const res = await fetch(`${MEDUSA_URL}/store/scores`, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify(scoreData),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || "Error al enviar la partitura")
  return data
}

export async function updateScoreApi(slugOrId: string, scoreData: Record<string, unknown>) {
  const res = await fetch(`${MEDUSA_URL}/store/scores/${slugOrId}`, {
    method: "PUT",
    headers: defaultHeaders,
    body: JSON.stringify(scoreData),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || "Error al actualizar la partitura")
  return data
}
