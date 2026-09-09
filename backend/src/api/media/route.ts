import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getFileStreamFromR2 } from "../../lib/r2-storage"

export const AUTHENTICATE = false

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const fileKey = req.query.key as string

    if (!fileKey) {
      return res.status(400).json({ message: "Parámetro 'key' no especificado" })
    }

    const { stream, contentType, contentLength } = await getFileStreamFromR2(fileKey)

    res.setHeader("Content-Type", contentType)
    if (contentLength) {
      res.setHeader("Content-Length", contentLength.toString())
    }
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable")
    res.setHeader("Access-Control-Allow-Origin", "*")

    stream.pipe(res as any)
  } catch (error: any) {
    return res.status(404).json({
      message: "Archivo no encontrado en Cloudflare R2",
      error: error.message,
    })
  }
}
