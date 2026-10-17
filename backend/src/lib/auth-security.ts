import crypto from "crypto"

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")
  return { hash, salt }
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const checkHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")
  return checkHash === hash
}

export function generateSessionToken(payload: Record<string, any>, expiresInMs: number = 7 * 24 * 60 * 60 * 1000): string {
  const exp = payload.exp || (Date.now() + expiresInMs)
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url")
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString("base64url")
  const secret = process.env.JWT_SECRET || "piano_colombia_jwt_key_2026"
  const signature = crypto.createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url")
  return `${header}.${body}.${signature}`
}

export function verifySessionToken(token: string): { valid: boolean; payload?: any; reason?: string; error?: string } {
  if (!token || typeof token !== "string") {
    return { valid: false, reason: "missing_token" }
  }
  const parts = token.split(".")
  if (parts.length !== 3) {
    return { valid: false, reason: "malformed_token" }
  }
  const [header, body, signature] = parts
  const secret = process.env.JWT_SECRET || "piano_colombia_jwt_key_2026"
  const expectedSignature = crypto.createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url")

  try {
    const sigBuf = Buffer.from(signature)
    const expBuf = Buffer.from(expectedSignature)
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return { valid: false, reason: "invalid_signature" }
    }

    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"))
    if (payload.exp && Date.now() > payload.exp) {
      return { valid: false, reason: "expired", payload }
    }
    return { valid: true, payload }
  } catch (err: any) {
    return { valid: false, reason: "invalid_payload", error: err.message }
  }
}

