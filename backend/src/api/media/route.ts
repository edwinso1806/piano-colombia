import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getFileStreamFromR2 } from "../../lib/r2-storage"
import fs from "fs"
import path from "path"

export const AUTHENTICATE = false

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    let fileKey = (req.query.key as string) || (req.query.url as string) || ""

    if (!fileKey) {
      return res.status(400).json({ message: "Parámetro 'key' de archivo no especificado" })
    }

    // Limpiar el key recibido
    let cleanKey = decodeURIComponent(fileKey)
      .replace(/^https?:\/\/[^\/]+/, "")
      .replace(/^\/store\/media\?key=/, "")
      .replace(/^\/media\?key=/, "")
      .replace(/^\//, "")

    // 1. Intentar obtener el stream directamente desde Cloudflare R2 en la nube
    try {
      const { stream, contentType, contentLength } = await getFileStreamFromR2(cleanKey)

      res.setHeader("Content-Type", contentType || "application/pdf")
      if (contentLength) {
        res.setHeader("Content-Length", contentLength.toString())
      }
      res.setHeader("Content-Disposition", `inline; filename="${path.basename(cleanKey)}"`)
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable")

      return stream.pipe(res as any)
    } catch (r2Err) {
      console.warn(`[Media API] Archivo key="${cleanKey}" no hallado en R2, intentando almacenamiento local:`, r2Err)
    }

    // 2. Fallback local: Buscar en el sistema de archivos de la aplicación
    const localCandidates = [
      path.join(process.cwd(), cleanKey),
      path.join(process.cwd(), "public", cleanKey),
      path.join(process.cwd(), "uploads", cleanKey),
    ]

    for (const localPath of localCandidates) {
      if (fs.existsSync(localPath) && fs.statSync(localPath).isFile()) {
        const ext = path.extname(localPath).toLowerCase()
        const mimeType = ext === ".pdf" ? "application/pdf" : ext === ".png" ? "image/png" : "image/jpeg"

        res.setHeader("Content-Type", mimeType)
        res.setHeader("Content-Disposition", `inline; filename="${path.basename(localPath)}"`)
        return fs.createReadStream(localPath).pipe(res as any)
      }
    }

    return res.status(404).json({
      message: `El archivo con clave '${cleanKey}' no se encontró en Cloudflare R2 ni en disco local.`,
    })
  } catch (error: any) {
    return res.status(500).json({
      message: "Error al procesar la transmisión del archivo",
      error: error.message,
    })
  }
}
