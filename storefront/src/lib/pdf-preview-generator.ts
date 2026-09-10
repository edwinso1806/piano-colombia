/**
 * Generador de Vistas Previas Protegidas para Partituras en PDF
 * Renderiza client-side en HTML5 Canvas las primeras 2 a 3 páginas del PDF,
 * estampando marcas de agua diagonales "Piano Colombia — Muestra Protegida"
 * y difuminando progresivamente la parte inferior de las páginas.
 */

interface PdfJsLibInstance {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (params: { data: ArrayBuffer }) => {
    promise: Promise<{
      numPages: number;
      getPage: (pageNum: number) => Promise<{
        getViewport: (params: { scale: number }) => { width: number; height: number };
        render: (params: { canvasContext: CanvasRenderingContext2D; viewport: unknown }) => { promise: Promise<void> };
      }>;
    }>;
  };
}

declare global {
  interface Window {
    pdfjsLib?: PdfJsLibInstance;
  }
}

// Cargar dinámicamente PDF.js si no está presente en window
async function loadPdfJsScript(): Promise<PdfJsLibInstance | null> {
  if (typeof window === "undefined") return null
  if (window.pdfjsLib) return window.pdfjsLib

  return new Promise((resolve, reject) => {
    // Si ya existe el script tag
    const existing = document.getElementById("pdfjs-cdn-script")
    if (existing) {
      existing.addEventListener("load", () => resolve(window.pdfjsLib || null))
      existing.addEventListener("error", () => reject(new Error("Error al cargar PDF.js")))
      return
    }

    const script = document.createElement("script")
    script.id = "pdfjs-cdn-script"
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
    script.async = true
    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
        resolve(window.pdfjsLib)
      } else {
        reject(new Error("pdfjsLib no se inicializó correctamente"))
      }
    }
    script.onerror = () => reject(new Error("No se pudo cargar la librería PDF.js"))
    document.head.appendChild(script)
  })
}

/**
 * Dibuja la marca de agua diagonal y el difuminado de protección en un canvas
 */
function applyProtectionWatermarkAndBlur(ctx: CanvasRenderingContext2D, width: number, height: number, pageNum: number) {
  // 1. Efecto de difuminado progresivo en la mitad inferior de la partitura
  // Para páginas 1 a 3: la parte superior (primeros compases) es nítida para apreciar la calidad;
  // desde el 45% de la altura hacia abajo se aplica un difuminado / frosted glass.
  const blurStartY = height * 0.45
  const blurHeight = height - blurStartY

  // Creamos un canvas temporal para el área difuminada
  const offscreen = document.createElement("canvas")
  offscreen.width = width
  offscreen.height = blurHeight
  const offCtx = offscreen.getContext("2d")

  if (offCtx) {
    offCtx.filter = "blur(10px)"
    offCtx.drawImage(ctx.canvas, 0, blurStartY, width, blurHeight, 0, 0, width, blurHeight)
    // Redibujamos la porción difuminada sobre el canvas original
    ctx.drawImage(offscreen, 0, blurStartY)
  }

  // Capa de velo semitransparente sobre la parte difuminada para mayor protección
  const gradient = ctx.createLinearGradient(0, blurStartY, 0, height)
  gradient.addColorStop(0, "rgba(255, 255, 255, 0.2)")
  gradient.addColorStop(0.3, "rgba(255, 255, 255, 0.75)")
  gradient.addColorStop(1, "rgba(255, 255, 255, 0.92)")
  ctx.fillStyle = gradient
  ctx.fillRect(0, blurStartY, width, blurHeight)

  // 2. Patrón de marcas de agua diagonales "PIANO COLOMBIA — MUESTRA PROTEGIDA"
  ctx.save()
  ctx.translate(width / 2, height / 2)
  ctx.rotate((-35 * Math.PI) / 180) // 35 grados de inclinación

  const textPrimary = "PIANO COLOMBIA"
  const textSecondary = "MUESTRA PROTEGIDA · PROHIBIDA SU COPIA O REPRODUCCIÓN"

  // Repetir a lo largo de varias filas inclinadas
  const stepY = 160
  const countY = Math.ceil(height / stepY) + 2

  for (let i = -countY; i <= countY; i++) {
    const yPos = i * stepY

    // Texto principal
    ctx.font = "900 32px 'Outfit', 'Inter', sans-serif"
    ctx.fillStyle = i % 2 === 0 ? "rgba(17, 28, 45, 0.16)" : "rgba(251, 176, 59, 0.28)"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(textPrimary, 0, yPos)

    // Subtítulo
    ctx.font = "bold 13px 'Inter', sans-serif"
    ctx.fillStyle = "rgba(17, 28, 45, 0.14)"
    ctx.fillText(textSecondary, 0, yPos + 26)
  }
  ctx.restore()

  // 3. Sello central en la parte difuminada con llamado a la acción
  const badgeWidth = Math.min(width * 0.75, 460)
  const badgeHeight = 72
  const badgeX = (width - badgeWidth) / 2
  const badgeY = blurStartY + (blurHeight - badgeHeight) / 2

  ctx.save()
  // Caja con esquinas redondeadas
  ctx.fillStyle = "rgba(17, 28, 45, 0.88)"
  ctx.shadowColor = "rgba(0, 0, 0, 0.25)"
  ctx.shadowBlur = 16
  ctx.shadowOffsetY = 6

  // Dibujar rectángulo redondeado
  ctx.beginPath()
  const r = 16
  ctx.moveTo(badgeX + r, badgeY)
  ctx.lineTo(badgeX + badgeWidth - r, badgeY)
  ctx.quadraticCurveTo(badgeX + badgeWidth, badgeY, badgeX + badgeWidth, badgeY + r)
  ctx.lineTo(badgeX + badgeWidth, badgeY + badgeHeight - r)
  ctx.quadraticCurveTo(badgeX + badgeWidth, badgeY + badgeHeight, badgeX + badgeWidth - r, badgeY + badgeHeight)
  ctx.lineTo(badgeX + r, badgeY + badgeHeight)
  ctx.quadraticCurveTo(badgeX, badgeY + badgeHeight, badgeX, badgeY + badgeHeight - r)
  ctx.lineTo(badgeX, badgeY + r)
  ctx.quadraticCurveTo(badgeX, badgeY, badgeX + r, badgeY)
  ctx.closePath()
  ctx.fill()

  // Borde dorado
  ctx.lineWidth = 2
  ctx.strokeStyle = "#FBB03B"
  ctx.stroke()

  // Textos del sello
  ctx.shadowColor = "transparent"
  ctx.textAlign = "center"
  ctx.fillStyle = "#FBB03B"
  ctx.font = "900 13px 'Inter', sans-serif"
  ctx.fillText(`PIANO COLOMBIA · MUESTRA EDITORIAL PROTEGIDA (PÁG. ${pageNum})`, width / 2, badgeY + 28)

  ctx.fillStyle = "#FFFFFF"
  ctx.font = "bold 11px 'Inter', sans-serif"
  ctx.fillText("Adquiere la partitura original para acceder al contenido completo y de alta resolución", width / 2, badgeY + 48)
  ctx.restore()
}

/**
 * Generador de vista previa fallback en caso de que el navegador no pueda procesar el PDF
 */
function generateFallbackPreview(pageNum: number, scoreTitle: string): string {
  const canvas = document.createElement("canvas")
  canvas.width = 900
  canvas.height = 1200
  const ctx = canvas.getContext("2d")
  if (!ctx) return ""

  // Fondo blanco marfil editorial
  ctx.fillStyle = "#FDFBF7"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Borde editorial
  ctx.strokeStyle = "#E2E8F0"
  ctx.lineWidth = 4
  ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80)

  // Cabecera de la partitura
  ctx.fillStyle = "#111C2D"
  ctx.font = "900 28px 'Outfit', serif"
  ctx.textAlign = "center"
  ctx.fillText(scoreTitle.toUpperCase(), canvas.width / 2, 120)

  ctx.font = "italic 16px 'Inter', serif"
  ctx.fillStyle = "#64748B"
  ctx.fillText("Edición Urtext · Piano Colombia", canvas.width / 2, 150)

  // Pentagramas simulados
  ctx.strokeStyle = "#111C2D"
  ctx.lineWidth = 1.2
  for (let system = 0; system < 5; system++) {
    const startY = 200 + system * 180
    for (let staff = 0; staff < 2; staff++) {
      const staffY = startY + staff * 55
      for (let line = 0; line < 5; line++) {
        ctx.beginPath()
        ctx.moveTo(80, staffY + line * 9)
        ctx.lineTo(canvas.width - 80, staffY + line * 9)
        ctx.stroke()
      }
    }
  }

  // Aplicar protección y marca de agua
  applyProtectionWatermarkAndBlur(ctx, canvas.width, canvas.height, pageNum)

  return canvas.toDataURL("image/jpeg", 0.65)
}

export interface GeneratedScorePreviewsResult {
  previewImages: string[] // Data URLs en base64 de 2 a 3 imágenes
  pagesCount: number
}

/**
 * Extrae de 2 a 3 imágenes difuminadas con marca de agua a partir de un archivo File PDF
 */
export async function generateScoreBlurredPreviews(
  file: File,
  scoreTitle: string = "Partitura"
): Promise<GeneratedScorePreviewsResult> {
  try {
    const pdfjs = await loadPdfJsScript()
    if (!pdfjs) {
      throw new Error("No se pudo inicializar PDF.js")
    }

    const arrayBuffer = await file.arrayBuffer()
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
    const pdfDoc = await loadingTask.promise
    const numPages: number = pdfDoc.numPages || 1

    // Determinar cuántas páginas procesar: de 2 a 3 (mínimo 2 si el PDF tiene 2+, o hasta 3)
    const pagesToRenderCount = Math.min(Math.max(numPages >= 2 ? 2 : 1, Math.min(numPages, 3)), 3)
    const targetPages: number[] = []

    for (let p = 1; p <= pagesToRenderCount; p++) {
      targetPages.push(p)
    }

    // Si solo tiene 1 página, repetimos con zoom o variación para garantizar al menos 2 imágenes
    if (targetPages.length === 1) {
      targetPages.push(1)
    }

    const previewImages: string[] = []

    for (let i = 0; i < targetPages.length; i++) {
      const pageIndex = targetPages[i]
      const page = await pdfDoc.getPage(pageIndex)

      // Escala optimizada para vista previa clara y ligera (700-900px de ancho)
      const viewport = page.getViewport({ scale: 1.1 })

      const canvas = document.createElement("canvas")
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext("2d")

      if (!ctx) continue

      // Renderizar la página PDF en el canvas
      const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
      }
      await page.render(renderContext).promise

      // Estampar la marca de agua y el difuminado protector
      applyProtectionWatermarkAndBlur(ctx, canvas.width, canvas.height, i + 1)

      const dataUrl = canvas.toDataURL("image/jpeg", 0.65)
      previewImages.push(dataUrl)
    }

    return {
      previewImages,
      pagesCount: numPages,
    }
  } catch (err) {
    console.warn("⚠️ PDF.js falló o no está disponible en este entorno. Generando vistas previas de protección alternativas:", err)
    // Generamos 3 imágenes fallback impecables
    const fallbacks = [
      generateFallbackPreview(1, scoreTitle),
      generateFallbackPreview(2, scoreTitle),
      generateFallbackPreview(3, scoreTitle),
    ]
    return {
      previewImages: fallbacks,
      pagesCount: 3,
    }
  }
}
