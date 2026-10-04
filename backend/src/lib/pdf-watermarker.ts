import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib"
import fs from "fs"

export interface WatermarkOptions {
  buyerName: string
  buyerEmail: string
  buyerTaxId?: string
  wompiTransactionId: string
  scoreTitle: string
  composerName: string
  masterPdfPath?: string
  masterPdfBuffer?: Buffer | Uint8Array
}

export async function generateWatermarkedScore(options: WatermarkOptions): Promise<Uint8Array> {
  let pdfDoc: PDFDocument

  // 1. Cargar archivo maestro si se proporcionó un Buffer o una ruta válida
  if (options.masterPdfBuffer && options.masterPdfBuffer.length > 0) {
    try {
      pdfDoc = await PDFDocument.load(options.masterPdfBuffer, { ignoreEncryption: true })
    } catch (loadErr: any) {
      console.warn("⚠️ [PDF Watermarker] Error al cargar masterPdfBuffer, generando fallback:", loadErr.message)
      pdfDoc = await createDemoUrtextDoc(options)
    }
  } else if (options.masterPdfPath && fs.existsSync(options.masterPdfPath)) {
    try {
      const existingPdfBytes = fs.readFileSync(options.masterPdfPath)
      pdfDoc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true })
    } catch (loadErr: any) {
      console.warn("⚠️ [PDF Watermarker] Error al cargar masterPdfPath, generando fallback:", loadErr.message)
      pdfDoc = await createDemoUrtextDoc(options)
    }
  } else {
    // Si no existe archivo físico en disco/R2, creamos documento Urtext demo de alta fidelidad
    pdfDoc = await createDemoUrtextDoc(options)
  }

  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const pages = pdfDoc.getPages()
  const nowStr = new Date().toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  const safeBuyerName = (options.buyerName || "Cliente Piano Colombia").trim()
  const safeBuyerEmail = (options.buyerEmail || "").trim()
  const safeRef = (options.wompiTransactionId || "LCN-OFICIAL").trim()
  const safeTaxId = options.buyerTaxId ? ` · ID: ${options.buyerTaxId}` : ""

  // 2. Estampar cada página con la licencia legal oficial y marca de agua
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]
    const { width, height } = page.getSize()

    // A. Barra de fondo inferior con contraste suave
    const barHeight = 18
    const margin = 20
    page.drawRectangle({
      x: margin,
      y: 10,
      width: width - margin * 2,
      height: barHeight,
      color: rgb(0.96, 0.97, 0.99),
      borderWidth: 0.5,
      borderColor: rgb(0.82, 0.86, 0.92),
    })

    // B. Texto de estampa legal inferior
    const watermarkText = `PIANO COLOMBIA · LICENCIA LEGAL · Comprador: ${safeBuyerName} (${safeBuyerEmail})${safeTaxId} · Ref: ${safeRef} · ${nowStr} · Pág. ${i + 1}/${pages.length}`

    page.drawText(watermarkText, {
      x: margin + 8,
      y: 15,
      size: 6.8,
      font: helveticaBoldFont,
      color: rgb(0.07, 0.11, 0.18),
    })

    // C. Marca de agua diagonal sutil central (anti-plagio / reventa no autorizada)
    const diagonalText = `Licencia Exclusiva: ${safeBuyerName} · Piano Colombia`
    const textWidth = helveticaBoldFont.widthOfTextAtSize(diagonalText, 14)
    page.drawText(diagonalText, {
      x: Math.max(30, (width - textWidth) / 2 - 40),
      y: height * 0.45,
      size: 14,
      font: helveticaBoldFont,
      color: rgb(0.65, 0.7, 0.78),
      opacity: 0.08,
      rotate: degrees(35),
    })
  }

  return await pdfDoc.save()
}

async function createDemoUrtextDoc(options: WatermarkOptions): Promise<PDFDocument> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595.28, 841.89]) // A4
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)

  // Título y encabezado
  page.drawText(options.scoreTitle.toUpperCase(), {
    x: 50,
    y: 780,
    size: 18,
    font: helveticaBold,
    color: rgb(0.07, 0.11, 0.18),
  })

  page.drawText(`Compositor: ${options.composerName}`, {
    x: 50,
    y: 755,
    size: 12,
    font: helvetica,
    color: rgb(0, 0.44, 0.74),
  })

  page.drawText("Edición Crítica y Urtext Oficial — Piano Colombia", {
    x: 50,
    y: 735,
    size: 10,
    font: helvetica,
    color: rgb(0.3, 0.3, 0.3),
  })

  // Líneas de pentagrama estilizadas
  for (let system = 0; system < 4; system++) {
    const startY = 660 - system * 140
    for (let line = 0; line < 5; line++) {
      page.drawLine({
        start: { x: 50, y: startY - line * 10 },
        end: { x: 545, y: startY - line * 10 },
        thickness: 1,
        color: rgb(0.2, 0.2, 0.2),
      })
    }
  }

  return pdfDoc
}
