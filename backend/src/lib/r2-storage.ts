import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { Readable } from "stream"

const R2_BUCKET = process.env.R2_BUCKET_NAME || "piano-colombia"
const R2_ENDPOINT = process.env.R2_ENDPOINT || "https://311aa6723ba3d2d7cc679857993ed4ca.r2.cloudflarestorage.com"
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "231cf76682855f0491ac7023790a3e70"
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "bd8d4943df1bcc83cbef0dfe8edd737e52d5db2bf83fe642d1ca24bf01ceb2f4"

export const r2Client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
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
 * Genera una URL presignada privada para descarga temporal de partituras (evita enlaces compartidos no autorizados)
 */
export async function getPresignedDownloadUrl(key: string, expiresInSeconds = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
  })

  return await getSignedUrl(r2Client, command, { expiresIn: expiresInSeconds })
}

