import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { Readable } from "stream"

function cleanConfig(val?: string, fallback: string = ""): string {
  if (!val) return fallback
  const cleaned = val.trim().replace(/^["']|["']$/g, "").trim()
  return cleaned || fallback
}

export const R2_BUCKET = cleanConfig(process.env.R2_BUCKET_NAME || process.env.R2_BUCKET, "piano-colombia")
export const R2_ENDPOINT = cleanConfig(process.env.R2_ENDPOINT, "https://311aa6723ba3d2d7cc679857993ed4ca.r2.cloudflarestorage.com").replace(/\/$/, "")
export const R2_ACCESS_KEY_ID = cleanConfig(process.env.R2_ACCESS_KEY_ID, "231cf76682855f0491ac7023790a3e70")
export const R2_SECRET_ACCESS_KEY = cleanConfig(process.env.R2_SECRET_ACCESS_KEY, "bd8d4943df1bcc83cbef0dfe8edd737e52d5db2bf83fe642d1ca24bf01ceb2f4")

export const r2Client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
})

export interface UploadOptions {
  key: string
  body: Buffer | Uint8Array | string
  contentType: string
  metadata?: Record<string, string>
}

/**
 * Sube un archivo directamente a Cloudflare R2
 */
export async function uploadFileToR2({ key, body, contentType, metadata }: UploadOptions): Promise<{ key: string; bucket: string }> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
    Metadata: metadata,
  })

  await r2Client.send(command)
  return { key, bucket: R2_BUCKET }
}

/**
 * Elimina un archivo de Cloudflare R2 dado su key o URL
 */
export async function deleteFileFromR2(fileKeyOrUrl: string): Promise<boolean> {
  try {
    if (!fileKeyOrUrl) return false

    let key = decodeURIComponent(fileKeyOrUrl)
      .replace(/^https?:\/\/[^\/]+/, "")
      .replace(/^\/store\/media\?key=/, "")
      .replace(/^\/media\?key=/, "")
      .replace(/^\//, "")

    if (!key) return false

    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    })

    await r2Client.send(command)
    console.log(`🗑️ [R2 Storage] Archivo eliminado con éxito de R2: ${key}`)
    return true
  } catch (err: any) {
    console.warn(`⚠️ [R2 Storage] Error intentando eliminar archivo key="${fileKeyOrUrl}":`, err.message)
    return false
  }
}

/**
 * Obtiene el stream de lectura de un archivo almacenado en Cloudflare R2 con soporte opcional de Range (streaming)
 */
export async function getFileStreamFromR2(
  key: string,
  range?: string
): Promise<{
  stream: Readable
  contentType: string
  contentLength?: number
  contentRange?: string
  acceptRanges?: string
  statusCode?: number
}> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Range: range,
  })

  const response = await r2Client.send(command)
  return {
    stream: response.Body as Readable,
    contentType: response.ContentType || "application/octet-stream",
    contentLength: response.ContentLength,
    contentRange: response.ContentRange,
    acceptRanges: response.AcceptRanges || "bytes",
    statusCode: range && response.ContentRange ? 206 : 200,
  }
}

/**
 * Obtiene el buffer binario completo de un archivo en Cloudflare R2 sin dependencia de streams
 */
export async function getFileBufferFromR2(key: string): Promise<{
  buffer: Buffer
  contentType: string
  contentLength: number
}> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
  })

  const response = await r2Client.send(command)
  if (!response.Body) {
    throw new Error(`Objeto R2 "${key}" no devolvió contenido`)
  }

  let buffer: Buffer
  if (typeof (response.Body as any).transformToByteArray === "function") {
    const bytes = await (response.Body as any).transformToByteArray()
    buffer = Buffer.from(bytes)
  } else {
    const chunks: Buffer[] = []
    for await (const chunk of response.Body as Readable) {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk)
    }
    buffer = Buffer.concat(chunks)
  }

  return {
    buffer,
    contentType: response.ContentType || "application/octet-stream",
    contentLength: buffer.length,
  }
}

/**
 * Genera una URL presignada privada para descarga temporal de partituras (evita enlaces compartidos no autorizados)
 */
export async function getPresignedDownloadUrl(key: string, expiresInSeconds = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
  })

  return await getSignedUrl(r2Client, command, { expiresIn: expiresInSeconds })
}


