import { Client } from "pg"
import fs from "fs"
import path from "path"
import { Readable } from "stream"
import { getFileBufferFromR2 } from "./r2-storage"

function getPgClient() {
  return new Client({
    connectionString: process.env.DATABASE_URL || "postgres://postgres:Colombia-93@localhost:5432/piano_colombia_db",
  })
}

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of stream) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

/**
 * Carga el buffer del PDF maestro original de una partitura dada su ID en PostgreSQL.
 * Busca primero en Cloudflare R2 y luego en el sistema de archivos local.
 */
export async function getScoreMasterPdfBuffer(scoreId: string): Promise<Buffer | null> {
  if (!scoreId) return null

  const client = getPgClient()
  try {
    await client.connect()

    const scoreRes = await client.query(
      "SELECT id, title, original_pdf_url, preview_pdf_url FROM score WHERE id = $1 LIMIT 1;",
      [scoreId]
    )

    if (scoreRes.rows.length === 0) {
      console.warn(`[score-pdf-loader] Partitura ID ${scoreId} no encontrada en base de datos.`)
      return null
    }

    const score = scoreRes.rows[0]
    const fileUrl = score.original_pdf_url || score.preview_pdf_url
    if (!fileUrl) {
      console.warn(`[score-pdf-loader] Partitura "${score.title}" (${scoreId}) no tiene original_pdf_url.`)
      return null
    }

    let cleanKey = decodeURIComponent(fileUrl)
      .replace(/^https?:\/\/[^\/]+/, "")
      .replace(/^\/store\/media\?key=/, "")
      .replace(/^\/media\?key=/, "")
      .replace(/^\//, "")

    // 1. Intentar descargar desde Cloudflare R2
    try {
      const { buffer: buf } = await getFileBufferFromR2(cleanKey)
      if (buf && buf.length > 0) {
        console.log(`✅ [score-pdf-loader] PDF maestro obtenido de R2 (${buf.length} bytes): ${cleanKey}`)
        return buf
      }
    } catch (r2Err: any) {
      console.warn(`⚠️ [score-pdf-loader] Clave "${cleanKey}" no hallada en R2 (${r2Err.message}), probando local...`)
    }

    // 2. Intentar buscar en disco local
    const localCandidates = [
      path.join(process.cwd(), cleanKey),
      path.join(process.cwd(), "public", cleanKey),
      path.join(process.cwd(), "uploads", cleanKey),
      path.join(process.cwd(), "..", "storefront", "public", cleanKey),
    ]

    for (const p of localCandidates) {
      if (fs.existsSync(p) && fs.statSync(p).isFile()) {
        const buf = fs.readFileSync(p)
        console.log(`✅ [score-pdf-loader] PDF maestro obtenido de disco local: ${p}`)
        return buf
      }
    }

    // 3. Si es una URL externa válida (http/https)
    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
      try {
        const fetchRes = await fetch(fileUrl)
        if (fetchRes.ok) {
          const arrBuf = await fetchRes.arrayBuffer()
          const buf = Buffer.from(arrBuf)
          console.log(`✅ [score-pdf-loader] PDF maestro descargado de URL externa: ${fileUrl}`)
          return buf
        }
      } catch (fErr: any) {
        console.warn(`⚠️ [score-pdf-loader] Error descargando URL externa "${fileUrl}":`, fErr.message)
      }
    }

    return null
  } catch (err: any) {
    console.error(`❌ [score-pdf-loader] Error consultando partitura ID ${scoreId}:`, err.message)
    return null
  } finally {
    await client.end()
  }
}
