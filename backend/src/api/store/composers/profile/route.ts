import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Client } from "pg"

export const AUTHENTICATE = false

function getPgClient() {
  return new Client({
    connectionString: process.env.DATABASE_URL || "postgres://postgres:Alex%242020@localhost:5432/piano_colombia_db"
  })
}

// 1. GET: Consultar información completa del perfil del compositor
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const client = getPgClient()
  try {
    const { id, email } = req.query as Record<string, string>

    if (!id && !email) {
      return res.status(400).json({
        success: false,
        message: "Se requiere el 'id' o 'email' del compositor",
      })
    }

    await client.connect()

    const query = `
      SELECT 
        c.id, c.first_name, c.last_name, c.artistic_name, c.slug, c.email, c.phone,
        c.region, c.era, c.bio_es, c.bio_en, c.photo_url, c.status, c.rejection_reason,
        c.commission_percentage, c.created_at, c.updated_at,
        b.bank_name, b.account_type, b.account_number, b.holder_name,
        b.document_type, b.document_number, b.bank_code
      FROM composer c
      LEFT JOIN composer_bank_account b ON b.composer_id = c.id
      WHERE ${id ? "c.id = $1" : "LOWER(c.email) = LOWER($1)"}
      LIMIT 1;
    `
    const result = await client.query(query, [id || email])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Compositor no encontrado",
      })
    }

    const row = result.rows[0]
    const composer = {
      id: row.id,
      first_name: row.first_name,
      last_name: row.last_name,
      artistic_name: row.artistic_name || `${row.first_name} ${row.last_name}`.trim(),
      slug: row.slug,
      email: row.email,
      phone: row.phone,
      region: row.region,
      era: row.era,
      bio_es: row.bio_es,
      bio_en: row.bio_en,
      photo_url: row.photo_url,
      status: row.status,
      rejection_reason: row.rejection_reason,
      commission_percentage: row.commission_percentage !== null ? Number(row.commission_percentage) : null,
      created_at: row.created_at,
      updated_at: row.updated_at,
      bank_account: row.bank_name ? {
        bank_name: row.bank_name,
        account_type: row.account_type,
        account_number: row.account_number,
        holder_name: row.holder_name,
        document_type: row.document_type,
        document_number: row.document_number,
        bank_code: row.bank_code,
      } : null,
    }

    return res.status(200).json({
      success: true,
      composer,
    })
  } catch (error: any) {
    console.error("❌ Error al obtener perfil de compositor:", error)
    return res.status(500).json({
      success: false,
      message: "Error al consultar perfil de compositor",
      error: error.message,
    })
  } finally {
    await client.end().catch(() => {})
  }
}

// 2. PUT: Actualizar perfil de compositor y datos bancarios (con opción submit_for_review)
export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  const client = getPgClient()
  try {
    const {
      id,
      email,
      first_name,
      last_name,
      artistic_name,
      phone,
      region,
      bio_es,
      bio_en,
      photo_url,
      bank_account,
      submit_for_review,
    } = (req.body as any) || {}

    if (!id && !email) {
      return res.status(400).json({
        success: false,
        message: "Se requiere el 'id' o 'email' del compositor para actualizar su perfil",
      })
    }

    await client.connect()

    // 1. Obtener ID del compositor si solo se envió email
    let composerId = id
    if (!composerId) {
      const findRes = await client.query("SELECT id FROM composer WHERE LOWER(email) = LOWER($1) LIMIT 1;", [email])
      if (findRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Compositor no encontrado" })
      }
      composerId = findRes.rows[0].id
    }

    // 2. Determinar nuevo estado si se envía a revisión
    let statusUpdateClause = ""
    const params: any[] = [
      first_name,
      last_name,
      artistic_name,
      phone,
      region,
      bio_es,
      bio_en,
      photo_url,
      composerId,
    ]

    if (submit_for_review) {
      statusUpdateClause = ", status = 'PENDING_APPROVAL', rejection_reason = NULL"
    }

    const updateQuery = `
      UPDATE composer
      SET 
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        artistic_name = COALESCE($3, artistic_name),
        phone = COALESCE($4, phone),
        region = COALESCE($5, region),
        bio_es = $6,
        bio_en = $7,
        photo_url = COALESCE($8, photo_url),
        updated_at = NOW()
        ${statusUpdateClause}
      WHERE id = $9
      RETURNING *;
    `
    const updatedComposerRes = await client.query(updateQuery, params)

    // 3. Actualizar o insertar cuenta bancaria si se suministró
    if (bank_account) {
      const checkBankRes = await client.query(
        "SELECT id FROM composer_bank_account WHERE composer_id = $1 LIMIT 1;",
        [composerId]
      )

      if (checkBankRes.rows.length > 0) {
        await client.query(`
          UPDATE composer_bank_account
          SET 
            bank_name = COALESCE($1, bank_name),
            account_type = COALESCE($2, account_type),
            account_number = COALESCE($3, account_number),
            holder_name = COALESCE($4, holder_name),
            document_type = COALESCE($5, document_type),
            document_number = COALESCE($6, document_number),
            updated_at = NOW()
          WHERE composer_id = $7;
        `, [
          bank_account.bank_name,
          bank_account.account_type,
          bank_account.account_number,
          bank_account.holder_name,
          bank_account.document_type,
          bank_account.document_number,
          composerId,
        ])
      } else {
        const bankId = `cba_${Date.now().toString(36)}`
        await client.query(`
          INSERT INTO composer_bank_account (
            id, composer_id, bank_name, account_type, account_number, holder_name, document_type, document_number, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW());
        `, [
          bankId,
          composerId,
          bank_account.bank_name,
          bank_account.account_type,
          bank_account.account_number,
          bank_account.holder_name,
          bank_account.document_type,
          bank_account.document_number,
        ])
      }
    }

    const updatedRow = updatedComposerRes.rows[0]

    return res.status(200).json({
      success: true,
      message: submit_for_review
        ? "¡Tu perfil y fotografía oficial han sido guardados y enviados a revisión técnica por Piano Colombia!"
        : "Perfil actualizado correctamente.",
      composer: {
        id: updatedRow.id,
        email: updatedRow.email,
        first_name: updatedRow.first_name,
        last_name: updatedRow.last_name,
        artistic_name: updatedRow.artistic_name,
        phone: updatedRow.phone,
        region: updatedRow.region,
        bio_es: updatedRow.bio_es,
        bio_en: updatedRow.bio_en,
        photo_url: updatedRow.photo_url,
        status: updatedRow.status,
      }
    })
  } catch (error: any) {
    console.error("❌ Error al actualizar perfil de compositor:", error)
    return res.status(500).json({
      success: false,
      message: "Error al guardar perfil de compositor",
      error: error.message,
    })
  } finally {
    await client.end().catch(() => {})
  }
}
