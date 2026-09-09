import crypto from "crypto"

interface OtpEntry {
  code: string
  payload: {
    fullName: string
    email: string
    password: string
    phone?: string
    taxId?: string
  }
  expiresAt: number
  attempts: number
}

// In-memory store for registration OTPs (keyed by normalized email)
const otpStore = new Map<string, OtpEntry>()

// Clean up expired OTPs periodically
setInterval(() => {
  const now = Date.now()
  for (const [email, entry] of otpStore.entries()) {
    if (entry.expiresAt < now) {
      otpStore.delete(email)
    }
  }
}, 60 * 1000)

export function generateRegistrationOtp(
  email: string,
  payload: {
    fullName: string
    email: string
    password: string
    phone?: string
    taxId?: string
  }
): string {
  const normalized = email.trim().toLowerCase()
  // Generate random 6-digit code (e.g. 482910)
  const code = crypto.randomInt(100000, 999999).toString()

  const entry: OtpEntry = {
    code,
    payload: {
      ...payload,
      email: normalized,
    },
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    attempts: 0,
  }

  otpStore.set(normalized, entry)
  return code
}

export function verifyRegistrationOtp(
  email: string,
  inputCode: string
): { valid: boolean; payload?: OtpEntry["payload"]; error?: string } {
  const normalized = email.trim().toLowerCase()
  const entry = otpStore.get(normalized)

  if (!entry) {
    return {
      valid: false,
      error: "No se encontró una solicitud de registro activa o el código ha expirado.",
    }
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(normalized)
    return {
      valid: false,
      error: "El código de verificación ha expirado (vigencia de 10 minutos). Por favor solicita uno nuevo.",
    }
  }

  entry.attempts += 1
  if (entry.attempts > 5) {
    otpStore.delete(normalized)
    return {
      valid: false,
      error: "Has superado el número máximo de intentos permitidos. Por favor solicita un nuevo código.",
    }
  }

  if (entry.code !== inputCode.trim()) {
    return {
      valid: false,
      error: "El código ingresado es incorrecto. Por favor verifica e intenta de nuevo.",
    }
  }

  // Valid OTP! Retrieve payload and clear entry
  const payload = entry.payload
  otpStore.delete(normalized)

  return {
    valid: true,
    payload,
  }
}

// ======================================================================
// COMPOSER REGISTRATION OTP STORE
// ======================================================================

interface ComposerOtpEntry {
  code: string
  payload: any
  expiresAt: number
  attempts: number
}

const composerOtpStore = new Map<string, ComposerOtpEntry>()

setInterval(() => {
  const now = Date.now()
  for (const [email, entry] of composerOtpStore.entries()) {
    if (entry.expiresAt < now) {
      composerOtpStore.delete(email)
    }
  }
}, 60 * 1000)

export function generateComposerRegistrationOtp(email: string, payload: any): string {
  const normalized = email.trim().toLowerCase()
  const code = crypto.randomInt(100000, 999999).toString()

  const entry: ComposerOtpEntry = {
    code,
    payload: {
      ...payload,
      email: normalized,
    },
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    attempts: 0,
  }

  composerOtpStore.set(normalized, entry)
  return code
}

export function verifyComposerRegistrationOtp(
  email: string,
  inputCode: string
): { valid: boolean; payload?: any; error?: string } {
  const normalized = email.trim().toLowerCase()
  const entry = composerOtpStore.get(normalized)

  if (!entry) {
    return {
      valid: false,
      error: "No se encontró una solicitud de registro activa o el código de verificación ha expirado.",
    }
  }

  if (Date.now() > entry.expiresAt) {
    composerOtpStore.delete(normalized)
    return {
      valid: false,
      error: "El código de verificación ha expirado. Por favor solicita uno nuevo.",
    }
  }

  entry.attempts += 1
  if (entry.attempts > 5) {
    composerOtpStore.delete(normalized)
    return {
      valid: false,
      error: "Has superado los intentos permitidos. Por favor solicita un nuevo código.",
    }
  }

  if (entry.code !== inputCode.trim()) {
    return {
      valid: false,
      error: "El código de 6 dígitos ingresado es incorrecto.",
    }
  }

  const payload = entry.payload
  composerOtpStore.delete(normalized)

  return {
    valid: true,
    payload,
  }
}

// ======================================================================
// PASSWORD RESET OTP STORE
// ======================================================================

interface PasswordResetOtpEntry {
  code: string
  role: string
  expiresAt: number
  attempts: number
}

const passwordResetStore = new Map<string, PasswordResetOtpEntry>()

// Clean up expired reset OTPs periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of passwordResetStore.entries()) {
    if (entry.expiresAt < now) {
      passwordResetStore.delete(key)
    }
  }
}, 60 * 1000)

export function generatePasswordResetOtp(email: string, role = "customer"): string {
  const normalized = email.trim().toLowerCase()
  const key = `${role}:${normalized}`
  const code = crypto.randomInt(100000, 999999).toString()

  const entry: PasswordResetOtpEntry = {
    code,
    role,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    attempts: 0,
  }

  passwordResetStore.set(key, entry)
  return code
}

export function consumePasswordResetOtp(
  email: string,
  inputCode: string,
  role = "customer"
): { valid: boolean; role?: string; error?: string } {
  const normalized = email.trim().toLowerCase()
  const key = `${role}:${normalized}`
  const entry = passwordResetStore.get(key)

  if (!entry) {
    return {
      valid: false,
      error: "No se encontró una solicitud activa de recuperación de contraseña o el código ha expirado.",
    }
  }

  if (Date.now() > entry.expiresAt) {
    passwordResetStore.delete(key)
    return {
      valid: false,
      error: "El código de recuperación ha expirado (vigencia de 10 minutos). Por favor solicita uno nuevo.",
    }
  }

  entry.attempts += 1
  if (entry.attempts > 5) {
    passwordResetStore.delete(key)
    return {
      valid: false,
      error: "Has superado el número máximo de intentos permitidos. Por favor solicita un nuevo código.",
    }
  }

  if (entry.code !== inputCode.trim()) {
    return {
      valid: false,
      error: "El código de recuperación ingresado es incorrecto. Por favor verifica e intenta de nuevo.",
    }
  }

  // Valid OTP! Clear entry and return success
  passwordResetStore.delete(key)

  return {
    valid: true,
    role: entry.role,
  }
}

