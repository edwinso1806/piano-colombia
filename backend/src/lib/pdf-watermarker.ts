import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import fs from "fs"
import path from "path"

export interface WatermarkOptions {
  buyerName: string
  buyerEmail: string
  buyerTaxId?: string
  wompiTransactionId: string
  scoreTitle: string
  composerName: string
  masterPdfPath?: string
}

export async function generateWatermarkedScore(options: WatermarkOptions): Promise<Uint8Array> {
  let pdfDoc: PDFDocument

  // Si existe un archivo maestro en disco, lo cargamos
  if (options.masterPdfPath && fs.existsSync(options.masterPdfPath)) {
    const existingPdfBytes = fs.readFileSync(options.masterPdfPath)
    pdfDoc = await PDFDocument.load(existingPdfBytes)
  } else {
    // Si no existe, creamos un documento de partitura Urtext demo
    pdfDoc = await PDFDocument.create()
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
  }

  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const pages = pdfDoc.getPages()
  const nowStr = new Date().toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

  // Estampar cada página con la licencia legal oficial
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]
    const { width } = page.getSize()

    const watermarkText = `Licencia Legal Piano Colombia · Comprador: ${options.buyerName} · ID: ${options.buyerTaxId || "N/A"} · Ref Wompi: ${options.wompiTransactionId} · Fecha: ${nowStr} · Página ${i + 1}/${pages.length}`

    // Barra de fondo discreta
    page.drawRectangle({
      x: 30,
      y: 15,
      width: width - 60,
      height: 18,
      color: rgb(0.96, 0.96, 0.98),
      borderWidth: 0.5,
      borderColor: rgb(0.9, 0.9, 0.9),
    })

    // Texto de estampa legal
    page.drawText(watermarkText, {
      x: 40,
      y: 20,
      size: 7.5,
      font: helveticaFont,
      color: rgb(0.07, 0.11, 0.18),
    })
  }

  return await pdfDoc.save()
}
