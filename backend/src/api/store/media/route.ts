import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getFileStreamFromR2 } from "../../../lib/r2-storage"
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

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    let fileKey = (req.query.key as string) || (req.query.url as string) || ""

    if (!fileKey) {
      return res.status(400).json({ message: "Parámetro 'key' de archivo no especificado" })
    }

    let cleanKey = decodeURIComponent(fileKey)
      .replace(/^https?:\/\/[^\/]+/, "")
      .replace(/^\/store\/media\?key=/, "")
      .replace(/^\/media\?key=/, "")
      .replace(/^\//, "")

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
      console.warn(`[Store Media API] Archivo key="${cleanKey}" no hallado en R2, intentando disco local:`, r2Err)
    }

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
