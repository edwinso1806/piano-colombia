import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { uploadFileToR2 } from "../../../lib/r2-storage"

export const AUTHENTICATE = false

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { base64, fileName, fileType, folder = "uploads" } = (req.body as any) || {}

    if (!base64 || !fileName || !fileType) {
      return res.status(400).json({
        success: false,
        message: "Los campos 'base64', 'fileName' y 'fileType' son requeridos.",
      })
    }

    // Limpiar base64 si contiene el prefijo data:...;base64,
    const cleanBase64 = base64.replace(/^data:[^;]+;base64,/, "")
    const buffer = Buffer.from(cleanBase64, "base64")

    // Validación de tipos permitidos
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf",
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/ogg",
      "audio/m4a",
      "audio/aac",
      "audio/x-m4a",
    ]

    if (!allowedTypes.includes(fileType.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Tipo de archivo no permitido: ${fileType}. Se admiten imágenes (JPG, PNG, WEBP), PDF y archivos de audio (MP3, WAV, OGG, M4A).`,
      })
    }


    // Tamaño máximo 25MB
    if (buffer.length > 25 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: "El archivo supera el tamaño máximo permitido de 25MB.",
      })
    }

    const cleanFileName = fileName.toLowerCase().replace(/[^a-z0-9.]+/g, "-")
    const key = `${folder}/${Date.now()}-${cleanFileName}`

    await uploadFileToR2({
      key,
      body: buffer,
      contentType: fileType,
    })

    const backendUrl = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
    const fileUrl = `${backendUrl}/media?key=${encodeURIComponent(key)}`

    return res.status(200).json({
      success: true,
      url: fileUrl,
      key,
      fileName,
      size: buffer.length,
      contentType: fileType,
    })
  } catch (error: any) {
    console.error("❌ Error en subida a Cloudflare R2:", error)
    return res.status(500).json({
      success: false,
      message: "Error al guardar archivo en Cloudflare R2",
      error: error.message,
    })
  }
}

export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  return res.status(204).end()
}
