import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getFileStreamFromR2, getFileBufferFromR2, getPresignedDownloadUrl } from "../../lib/r2-storage"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import fs from "fs"
import path from "path"

export const AUTHENTICATE = false

async function generateFallbackPdfBuffer(filename: string): Promise<Buffer> {
  try {
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([612, 792])
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)

    const { height } = page.getSize()

    page.drawText("PIANO COLOMBIA · EDITORIAL DE MUSICA ACADEMICA", {
      x: 50,
      y: height - 60,
      size: 11,
      font: fontBold,
      color: rgb(0, 0.44, 0.73),
    })

    page.drawText("DOCUMENTO MAESTRO EN CURADURIA EDITORIAL", {
      x: 50,
      y: height - 100,
      size: 16,
      font: fontBold,
      color: rgb(0.06, 0.11, 0.17),
    })

    const cleanName = filename.replace(/\.pdf.*$/, ".pdf")
    page.drawText(`Referencia: ${cleanName}`, {
      x: 50,
      y: height - 130,
      size: 11,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    })

    page.drawText("Nota tecnica para el Administrador / Curador:", {
      x: 50,
      y: height - 180,
      size: 12,
      font: fontBold,
      color: rgb(0.8, 0.2, 0.2),
    })

    page.drawText("Esta partitura fue registrada como prueba o maqueta previa a la conexion de Cloudflare R2.", {
      x: 50,
      y: height - 205,
      size: 10,
      font: fontItalic,
      color: rgb(0.3, 0.3, 0.3),
    })

    page.drawText("Las partituras cargadas por compositores desde el panel nuevo se almacenan directamente", {
      x: 50,
      y: height - 225,
      size: 10,
      font: fontItalic,
      color: rgb(0.3, 0.3, 0.3),
    })

    page.drawText("en el almacenamiento seguro en la nube de Cloudflare R2.", {
      x: 50,
      y: height - 245,
      size: 10,
      font: fontItalic,
      color: rgb(0.3, 0.3, 0.3),
    })

    const pdfBytes = await pdfDoc.save()
    return Buffer.from(pdfBytes)
  } catch {
    return Buffer.from("%PDF-1.4 %EOF")
  }
}

export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Range, Authorization, x-publishable-api-key")
  res.setHeader("Access-Control-Expose-Headers", "Content-Range, Accept-Ranges, Content-Length, Content-Type")
  return res.status(204).end()
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    // Headers CORS permisivos para streaming multimedia
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Range, Authorization, x-publishable-api-key")
    res.setHeader("Access-Control-Expose-Headers", "Content-Range, Accept-Ranges, Content-Length, Content-Type")
    res.setHeader("Accept-Ranges", "bytes")

    let fileKey = (req.query.key as string) || (req.query.url as string) || ""

    if (!fileKey) {
      return res.status(400).json({ message: "Parámetro 'key' de archivo no especificado" })
    }

    let cleanKey = decodeURIComponent(fileKey.trim())
      .replace(/^https?:\/\/[^\/]+/, "")
      .replace(/^\/store\/media\?key=/, "")
      .replace(/^\/media\?key=/, "")
      .replace(/^\//, "")
      .trim()

    if (cleanKey.includes("%")) {
      try { cleanKey = decodeURIComponent(cleanKey) } catch {}
    }

    const ext = path.extname(cleanKey).toLowerCase()
    const isAudio = [".mp3", ".wav", ".ogg", ".m4a", ".aac"].includes(ext)
    const isImage = [".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(ext)
    const rangeHeader = req.headers.range as string | undefined

    let lastR2Error: any = null

    // 1. Si se solicita explícitamente redirección 302 a URL presignada directa en Cloudflare R2:
    if (req.query.redirect === "true") {
      try {
        const presignedUrl = await getPresignedDownloadUrl(cleanKey, 86400)
        if (presignedUrl) {
          res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400")
          return res.redirect(302, presignedUrl)
        }
      } catch (presignErr: any) {
        console.warn(`[Media API] Falló redirect presignado para key="${cleanKey}":`, presignErr.message)
      }
    }

    // 2. Intentar obtener el archivo directamente desde Cloudflare R2 (en buffer o stream)
    try {
      if (!rangeHeader) {
        const { buffer, contentType } = await getFileBufferFromR2(cleanKey)
        const mimeType =
          ext === ".mp3" ? "audio/mpeg" :
          ext === ".wav" ? "audio/wav" :
          ext === ".ogg" ? "audio/ogg" :
          ext === ".m4a" ? "audio/mp4" :
          ext === ".aac" ? "audio/aac" :
          ext === ".png" ? "image/png" :
          ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" :
          ext === ".webp" ? "image/webp" :
          (contentType && contentType !== "application/octet-stream" ? contentType : (isAudio ? "audio/mpeg" : "application/pdf"))

        res.setHeader("Content-Type", mimeType)
        res.setHeader("Content-Length", buffer.length.toString())
        res.setHeader("Content-Disposition", `inline; filename="${path.basename(cleanKey)}"`)
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable")
        return res.status(200).send(buffer as any)
      } else {
        const { stream, contentType, contentLength, contentRange, statusCode } = await getFileStreamFromR2(cleanKey, rangeHeader)

        const mimeType =
          ext === ".mp3" ? "audio/mpeg" :
          ext === ".wav" ? "audio/wav" :
          ext === ".ogg" ? "audio/ogg" :
          ext === ".m4a" ? "audio/mp4" :
          ext === ".aac" ? "audio/aac" :
          ext === ".png" ? "image/png" :
          ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" :
          ext === ".webp" ? "image/webp" :
          (contentType && contentType !== "application/octet-stream" ? contentType : (isAudio ? "audio/mpeg" : "application/pdf"))

        res.setHeader("Content-Type", mimeType)
        res.setHeader("Content-Disposition", `inline; filename="${path.basename(cleanKey)}"`)
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable")

        if (statusCode === 206 && contentRange) {
          res.setHeader("Content-Range", contentRange)
          if (contentLength) res.setHeader("Content-Length", contentLength.toString())
          res.status(206)
        } else {
          if (contentLength) res.setHeader("Content-Length", contentLength.toString())
          res.status(200)
        }
        return stream.pipe(res as any)
      }
    } catch (r2Err: any) {
      lastR2Error = r2Err.message
      console.warn(`[Media API] Archivo key="${cleanKey}" no hallado en R2, intentando local:`, r2Err.message)
    }

    // 2. Fallback local: Buscar en el sistema de archivos de la aplicación
    const localCandidates = [
      path.join(process.cwd(), cleanKey),
      path.join(process.cwd(), "public", cleanKey),
      path.join(process.cwd(), "uploads", cleanKey),
    ]

    for (const localPath of localCandidates) {
      if (fs.existsSync(localPath) && fs.statSync(localPath).isFile()) {
        const stat = fs.statSync(localPath)
        const totalSize = stat.size

        const mimeType =
          ext === ".mp3" ? "audio/mpeg" :
          ext === ".wav" ? "audio/wav" :
          ext === ".ogg" ? "audio/ogg" :
          ext === ".m4a" ? "audio/mp4" :
          ext === ".aac" ? "audio/aac" :
          ext === ".pdf" ? "application/pdf" :
          ext === ".png" ? "image/png" : "image/jpeg"

        res.setHeader("Content-Type", mimeType)
        res.setHeader("Content-Disposition", `inline; filename="${path.basename(localPath)}"`)
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable")

        if (rangeHeader) {
          const parts = rangeHeader.replace(/bytes=/, "").split("-")
          const start = parseInt(parts[0], 10)
          const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1
          const chunksize = end - start + 1

          res.setHeader("Content-Range", `bytes ${start}-${end}/${totalSize}`)
          res.setHeader("Content-Length", chunksize.toString())
          res.status(206)
          return fs.createReadStream(localPath, { start, end }).pipe(res as any)
        } else {
          res.setHeader("Content-Length", totalSize.toString())
          res.status(200)
          return fs.createReadStream(localPath).pipe(res as any)
        }
      }
    }

    // Si es audio o imagen y no existe, no devolver PDF como fallback
    if (isAudio || isImage) {
      return res.status(404).json({
        message: `El recurso multimedia solicitado (${cleanKey}) no fue encontrado en R2 ni en local.`,
        r2_error: lastR2Error,
      })
    }

    // 3. Fallback dinámico exclusivo para partituras PDF de prueba previas
    const fallbackBuffer = await generateFallbackPdfBuffer(path.basename(cleanKey))
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Length", fallbackBuffer.length.toString())
    res.setHeader("Content-Disposition", `inline; filename="${path.basename(cleanKey)}"`)

    return res.status(200).send(fallbackBuffer as any)
  } catch (error: any) {
    return res.status(500).json({
      message: "Error al procesar la transmisión del archivo",
      error: error.message,
    })
  }
}
