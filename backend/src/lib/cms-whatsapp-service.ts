import { Client } from "pg"

export interface WhatsAppChannelSettings {
  phone: string
  label_es: string
  label_en: string
  default_message_es: string
  default_message_en: string
  agent_name_es: string
  agent_name_en: string
  response_time_es: string
  response_time_en: string
  welcome_bubble_es: string
  welcome_bubble_en: string
  is_active: boolean
}

export interface CmsWhatsAppSettings {
  customer_support: WhatsAppChannelSettings
  composer_support: WhatsAppChannelSettings
}

export const DEFAULT_CMS_WHATSAPP_SETTINGS: CmsWhatsAppSettings = {
  customer_support: {
    phone: "573137529693",
    label_es: "Atención al Cliente",
    label_en: "Customer Support",
    default_message_es: "¡Hola Piano Colombia! Necesito asesoría con la compra de partituras o descargas en la tienda.",
    default_message_en: "Hello Piano Colombia! I need assistance with sheet music purchases or downloads in the store.",
    agent_name_es: "Asesoría Comercial & Soporte",
    agent_name_en: "Sales & Customer Support",
    response_time_es: "Responde habitualmente en pocos minutos",
    response_time_en: "Usually replies in a few minutes",
    welcome_bubble_es: "¡Hola! 👋 Bienvenido a la tienda oficial de Piano Colombia. ¿Tienes dudas con alguna partitura, formato Urtext o proceso de pago? Escríbenos y te ayudamos de inmediato.",
    welcome_bubble_en: "Hello! 👋 Welcome to the official Piano Colombia store. Do you have questions about sheet music, Urtext editions, or payments? Chat with us and we'll help right away.",
    is_active: true,
  },
  composer_support: {
    phone: "573137529693",
    label_es: "Soporte Compositores",
    label_en: "Composer Support",
    default_message_es: "¡Hola Piano Colombia! Requiero soporte sobre mi registro de compositor o liquidación de obras.",
    default_message_en: "Hello Piano Colombia! I need support regarding my composer registration or royalty settlements.",
    agent_name_es: "Comité Editorial & Regalías",
    agent_name_en: "Editorial Board & Royalties",
    response_time_es: "Responde habitualmente en horario hábil",
    response_time_en: "Replies during business hours",
    welcome_bubble_es: "¡Hola Maestro! 🎼 Este es el canal exclusivo para compositores y autores afiliados. Si tienes consultas sobre registro, carga de partituras o liquidación de regalías, estamos aquí para apoyarte.",
    welcome_bubble_en: "Hello Maestro! 🎼 This is our dedicated channel for affiliated composers. If you have inquiries regarding registration, score uploads, or royalty payouts, we are here to assist.",
    is_active: true,
  },
}

function getPgClient() {
  return new Client({
    connectionString: process.env.DATABASE_URL || "postgres://postgres:Colombia-93@localhost:5432/piano_colombia_db",
  })
}

export async function getCmsWhatsAppSettings(): Promise<CmsWhatsAppSettings> {
  const client = getPgClient()
  try {
    await client.connect()

    const res = await client.query(
      "SELECT value FROM platform_settings WHERE key = 'cms_whatsapp_settings' LIMIT 1;"
    )

    if (res.rows.length > 0 && res.rows[0].value) {
      try {
        const parsed = JSON.parse(res.rows[0].value)
        return {
          customer_support: {
            ...DEFAULT_CMS_WHATSAPP_SETTINGS.customer_support,
            ...(parsed.customer_support || {}),
          },
          composer_support: {
            ...DEFAULT_CMS_WHATSAPP_SETTINGS.composer_support,
            ...(parsed.composer_support || {}),
          },
        }
      } catch (err) {
        console.warn("[cms-whatsapp-service] Error parseando cms_whatsapp_settings:", err)
      }
    } else {
      // Guardar defaults si no existe
      try {
        await client.query(`
          INSERT INTO platform_settings (key, value, updated_at)
          VALUES ('cms_whatsapp_settings', $1, NOW())
          ON CONFLICT (key) DO NOTHING;
        `, [JSON.stringify(DEFAULT_CMS_WHATSAPP_SETTINGS)])
      } catch (e: any) {
        console.warn("[cms-whatsapp-service] Error inicializando cms_whatsapp_settings en DB:", e.message)
      }
    }

    return DEFAULT_CMS_WHATSAPP_SETTINGS
  } catch (error: any) {
    console.error("[cms-whatsapp-service] Fallo al consultar configuración de WhatsApp:", error.message)
    return DEFAULT_CMS_WHATSAPP_SETTINGS
  } finally {
    await client.end().catch(() => {})
  }
}

export async function saveCmsWhatsAppSettings(payload: Partial<CmsWhatsAppSettings>): Promise<CmsWhatsAppSettings> {
  const client = getPgClient()
  try {
    const current = await getCmsWhatsAppSettings()

    const updated: CmsWhatsAppSettings = {
      customer_support: {
        ...current.customer_support,
        ...(payload.customer_support || {}),
      },
      composer_support: {
        ...current.composer_support,
        ...(payload.composer_support || {}),
      },
    }

    await client.connect()

    await client.query(`
      INSERT INTO platform_settings (key, value, updated_at)
      VALUES ('cms_whatsapp_settings', $1, NOW())
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = NOW();
    `, [JSON.stringify(updated)])

    return updated
  } finally {
    await client.end().catch(() => {})
  }
}
