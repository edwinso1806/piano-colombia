import { Client } from "pg"

export interface CmsLegalDocument {
  id: "composer_terms" | "privacy_policy"
  title_es: string
  title_en: string
  checkbox_text_es: string
  checkbox_text_en: string
  link_text_es: string
  link_text_en: string
  content_es: string
  content_en: string
  updated_at_text_es: string
  updated_at_text_en: string
}

export interface CmsLegalSettings {
  composer_terms: CmsLegalDocument
  privacy_policy: CmsLegalDocument
  default_commission_percentage?: number
  author_percentage?: number
}

function getPgClient() {
  return new Client({
    connectionString: process.env.DATABASE_URL || "postgres://postgres:Alex%242020@localhost:5432/piano_colombia_db",
  })
}

export function interpolateCommission(
  text: string,
  authorPct: number,
  platformPct: number
): string {
  if (!text) return text
  let result = text
    .replace(/\{author_percent\}/g, String(authorPct))
    .replace(/\{platform_percent\}/g, String(platformPct))

  // Reemplazo dinámico de cualquier porcentaje preexistente o estático en la frase de liquidación
  result = result.replace(
    /\b\d+%\s*neto\s*autor\s*\/\s*\d+%\s*plataforma\b/gi,
    `${authorPct}% neto autor / ${platformPct}% plataforma`
  )
  result = result.replace(
    /\b\d+%\s*net\s*author\s*\/\s*\d+%\s*platform\b/gi,
    `${authorPct}% net author / ${platformPct}% platform`
  )

  // Reemplazo en las cláusulas de texto extenso (ej. Cláusula 3 de regalías)
  result = result.replace(
    /percibirá el \d+% del valor neto/gi,
    `percibirá el ${authorPct}% del valor neto`
  )
  result = result.replace(
    /retendrá el \d+% restante/gi,
    `retendrá el ${platformPct}% restante`
  )
  result = result.replace(
    /receives \d+% net of the retail price/gi,
    `receives ${authorPct}% net of the retail price`
  )
  result = result.replace(
    /retains \d+% covering payment/gi,
    `retains ${platformPct}% covering payment`
  )

  return result
}

export const DEFAULT_CMS_LEGAL_SETTINGS: CmsLegalSettings = {
  default_commission_percentage: 20,
  author_percentage: 80,
  composer_terms: {
    id: "composer_terms",
    title_es: "Términos y Condiciones para Compositores",
    title_en: "Terms & Conditions for Composers",
    checkbox_text_es: "Acepto los {link} de Piano Colombia (liquidación {author_percent}% neto autor / {platform_percent}% plataforma).",
    checkbox_text_en: "I accept the {link} of Piano Colombia ({author_percent}% net author / {platform_percent}% platform royalty settlement).",
    link_text_es: "Términos y Condiciones para Compositores",
    link_text_en: "Terms & Conditions for Composers",
    updated_at_text_es: "Última versión: 2 de Septiembre, 2026",
    updated_at_text_en: "Last updated: September 2, 2026",
    content_es: `1. OBJETO Y REGISTRO DE OBRAS
El presente acuerdo regula la relación editorial entre Piano Colombia y el Compositor para la catalogación, publicación y distribución digital de partituras en formato Urtext y ediciones críticas.

2. DERECHOS DE AUTOR Y PROPIEDAD INTELECTUAL
El compositor conserva en todo momento el 100% de la titularidad sobre sus derechos morales y patrimoniales de autor, amparados por la Ley 23 de 1982 de la República de Colombia y los tratados internacionales de la OMPI. El compositor concede a Piano Colombia una licencia no exclusiva para la comercialización digital, estampado de sellos DRM nominales y custodia en servidores de alta disponibilidad.

3. ESQUEMA DE REGALÍAS Y LIQUIDACIÓN
El compositor percibirá el {author_percent}% del valor neto recaudado por cada venta individual de sus obras en la plataforma. Piano Colombia retendrá el {platform_percent}% restante, destinado a costos operativos, procesamiento en pasarela de pagos Wompi/Bancolombia, almacenamiento en la nube y soporte técnico a usuarios.

4. DISPERSIÓN AUTOMÁTICA DE FONDOS
Las regalías se liquidarán periódicamente de acuerdo con los ciclos oficiales de corte y se transferirán directamente a la cuenta bancaria colombiana o billetera digital certificada (Bancolombia, Davivienda, Nequi, Daviplata) registrada en el perfil del compositor.

5. COMITÉ EDITORIAL Y CURADURÍA
Toda obra postulada ingresará a una etapa de revisión técnica y musicológica. Piano Colombia se reserva el derecho de solicitar ajustes formales de grabado musical previo a su publicación en la tienda pública.`,
    content_en: `1. PURPOSE AND WORK REGISTRATION
This agreement governs the editorial partnership between Piano Colombia and the Composer for the cataloging, publication, and digital distribution of sheet music in Urtext and critical editions.

2. COPYRIGHT AND INTELLECTUAL PROPERTY
The composer retains 100% of moral and economic copyrights under Colombian Copyright Law (Law 23 of 1982) and WIPO international conventions. The composer grants Piano Colombia a non-exclusive license for digital distribution, personalized DRM watermarking, and secure cloud storage.

3. ROYALTIES AND SETTLEMENT STRUCTURE
The composer receives {author_percent}% net of the retail price for each score sold on the platform. Piano Colombia retains {platform_percent}% covering payment processing via Wompi/Bancolombia, server infrastructure, cloud hosting, and continuous technical support.

4. AUTOMATED DISBURSEMENT
Royalties are calculated per settlement cycle and disbursed directly to the Colombian bank account or authorized digital pocket (Bancolombia, Davivienda, Nequi, Daviplata) registered in the composer portal.

5. EDITORIAL BOARD AND CURATION
All submitted pieces undergo technical and musicological review. Piano Colombia reserves the right to request engraving corrections before publishing scores in the public catalog.`,
  },
  privacy_policy: {
    id: "privacy_policy",
    title_es: "Política de Tratamiento de Datos Personales",
    title_en: "Personal Data Processing Policy",
    checkbox_text_es: "Autorizo la {link} y verificación de obras.",
    checkbox_text_en: "I authorize the {link} and score verification.",
    link_text_es: "Política de Tratamiento de Datos Personales",
    link_text_en: "Personal Data Processing Policy",
    updated_at_text_es: "Última versión: 2 de Septiembre, 2026",
    updated_at_text_en: "Last updated: September 2, 2026",
    content_es: `De conformidad con la Ley Estatutaria 1581 de 2012 y el Decreto Reglamentario 1377 de 2013 de Colombia, Piano Colombia garantiza la protección y confidencialidad de los datos personales suministrados.

FINALIDADES DEL TRATAMIENTO:
1. Creación, autenticación y gestión del perfil artístico y comercial del compositor.
2. Tramitación de giros de regalías, certificados de retención y liquidaciones vía Wompi Bancolombia.
3. Generación del certificado de licencia nominativa estampado en las partituras digitales vendidas.
4. Notificaciones editoriales, estados de aprobación de obras y comunicaciones de soporte.

DERECHOS DEL TITULAR:
El titular de los datos podrá en cualquier momento ejercer sus derechos de conocer, actualizar, rectificar y revocar la autorización de sus datos personales a través de los canales oficiales de Piano Colombia.`,
    content_en: `In accordance with Colombian Statutory Law 1581 of 2012 and Decree 1377 of 2013 regarding Personal Data Protection (Habeas Data), Piano Colombia ensures the security and confidential treatment of personal records.

PURPOSES OF PROCESSING:
1. Registration, authentication, and management of the composer artistic profile.
2. Processing of royalty payouts, tax certificates, and disbursements via Wompi Bancolombia.
3. Generation of custom personalized license watermarks on purchased sheet music.
4. Editorial status updates, score review alerts, and customer service communication.

DATA SUBJECT RIGHTS:
You have the right to access, update, rectify, and request the deletion of your personal information at any time through our official support channels.`,
  },
}

export async function getCmsLegalSettings(): Promise<CmsLegalSettings> {
  const client = getPgClient()
  try {
    await client.connect()

    // 1. Consultar comisión por defecto en platform_settings
    const commRes = await client.query(
      "SELECT value FROM platform_settings WHERE key = 'default_commission_percentage' LIMIT 1;"
    )
    const defaultCommission = commRes.rows.length > 0 && commRes.rows[0].value
      ? Number(commRes.rows[0].value)
      : 20
    const authorPercentage = 100 - defaultCommission

    const res = await client.query(
      "SELECT value FROM platform_settings WHERE key = 'cms_legal_settings' LIMIT 1;"
    )

    let settings: CmsLegalSettings = {
      ...DEFAULT_CMS_LEGAL_SETTINGS,
      default_commission_percentage: defaultCommission,
      author_percentage: authorPercentage,
    }

    if (res.rows.length > 0 && res.rows[0].value) {
      try {
        const parsed = JSON.parse(res.rows[0].value)
        settings = {
          composer_terms: {
            ...DEFAULT_CMS_LEGAL_SETTINGS.composer_terms,
            ...(parsed.composer_terms || {}),
          },
          privacy_policy: {
            ...DEFAULT_CMS_LEGAL_SETTINGS.privacy_policy,
            ...(parsed.privacy_policy || {}),
          },
          default_commission_percentage: defaultCommission,
          author_percentage: authorPercentage,
        }
      } catch (err) {
        console.warn("[cms-legals-service] Error parseando cms_legal_settings:", err)
      }
    } else {
      // Guardar defaults en base de datos si no existe
      try {
        await client.query(`
          INSERT INTO platform_settings (key, value, updated_at)
          VALUES ('cms_legal_settings', $1, NOW())
          ON CONFLICT (key) DO NOTHING;
        `, [JSON.stringify(DEFAULT_CMS_LEGAL_SETTINGS)])
      } catch (e: any) {
        console.warn("[cms-legals-service] Error inicializando cms_legal_settings en DB:", e.message)
      }
    }

    // Interpolar las comisiones en los textos y documentos
    settings.composer_terms.checkbox_text_es = interpolateCommission(
      settings.composer_terms.checkbox_text_es,
      authorPercentage,
      defaultCommission
    )
    settings.composer_terms.checkbox_text_en = interpolateCommission(
      settings.composer_terms.checkbox_text_en,
      authorPercentage,
      defaultCommission
    )
    settings.composer_terms.content_es = interpolateCommission(
      settings.composer_terms.content_es,
      authorPercentage,
      defaultCommission
    )
    settings.composer_terms.content_en = interpolateCommission(
      settings.composer_terms.content_en,
      authorPercentage,
      defaultCommission
    )

    return settings
  } catch (error: any) {
    console.error("[cms-legals-service] Fallo al consultar configuración legal:", error.message)
    return {
      ...DEFAULT_CMS_LEGAL_SETTINGS,
      default_commission_percentage: 20,
      author_percentage: 80,
    }
  } finally {
    await client.end().catch(() => {})
  }
}

export async function saveCmsLegalSettings(payload: Partial<CmsLegalSettings>): Promise<CmsLegalSettings> {
  const client = getPgClient()
  try {
    await client.connect()

    // Si se pasa comisión estándar desde el CMS, actualizar en platform_settings
    if (typeof payload.default_commission_percentage === "number") {
      await client.query(`
        INSERT INTO platform_settings (key, value, updated_at)
        VALUES ('default_commission_percentage', $1, NOW())
        ON CONFLICT (key) DO UPDATE
        SET value = EXCLUDED.value, updated_at = NOW();
      `, [String(payload.default_commission_percentage)])
    }

    const current = await getCmsLegalSettings()

    const updated = {
      composer_terms: {
        ...current.composer_terms,
        ...(payload.composer_terms || {}),
      },
      privacy_policy: {
        ...current.privacy_policy,
        ...(payload.privacy_policy || {}),
      },
    }

    await client.query(`
      INSERT INTO platform_settings (key, value, updated_at)
      VALUES ('cms_legal_settings', $1, NOW())
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = NOW();
    `, [JSON.stringify(updated)])

    return await getCmsLegalSettings()
  } finally {
    await client.end().catch(() => {})
  }
}
