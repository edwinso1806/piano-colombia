import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Client } from "pg"

export const AUTHENTICATE = false

function getPgClient() {
  return new Client({
    connectionString: process.env.DATABASE_URL || "postgres://postgres:Colombia-93@localhost:5432/piano_colombia_db"
  })
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const client = getPgClient()
  try {
    await client.connect()
    const { status, limit = 50, offset = 0 } = req.query as Record<string, any>

    let queryText = `
      SELECT 
        c.id, c.first_name, c.last_name, c.artistic_name, c.slug, c.bio_es, c.bio_en, 
        c.region, c.era, c.photo_url, c.status, c.rejection_reason, c.approval_attempts, c.email, c.phone, 
        c.commission_percentage, c.created_at, c.submitted_at,
        b.bank_name, b.account_type, b.account_number, b.holder_name, 
        b.document_type, b.document_number, b.bank_code
      FROM composer c
      LEFT JOIN composer_bank_account b ON b.composer_id = c.id
    `
    const queryParams: any[] = []
    if (status) {
      queryParams.push(status)
      queryText += ` WHERE c.status = $${queryParams.length}`
    }
    queryText += ` ORDER BY c.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2};`
    queryParams.push(Number(limit), Number(offset))

    const countRes = await client.query(
      status ? "SELECT COUNT(*) FROM composer WHERE status = $1;" : "SELECT COUNT(*) FROM composer;",
      status ? [status] : []
    )
    const totalCount = Number(countRes.rows[0]?.count || 0)

    const result = await client.query(queryText, queryParams)

    const composers = result.rows.map((row: any) => ({
      id: row.id,
      first_name: row.first_name,
      last_name: row.last_name,
      artistic_name: row.artistic_name,
      slug: row.slug,
      bio_es: row.bio_es,
      bio_en: row.bio_en,
      region: row.region,
      era: row.era,
      photo_url: row.photo_url,
      status: row.status,
      rejection_reason: row.rejection_reason,
      approval_attempts: row.approval_attempts !== null ? Number(row.approval_attempts) : 0,
      submitted_at: row.submitted_at || null,
      email: row.email,
      phone: row.phone,
      commission_percentage: row.commission_percentage !== null ? Number(row.commission_percentage) : null,
      created_at: row.created_at,
      bank_account: row.bank_name ? {
        bank_name: row.bank_name,
        account_type: row.account_type,
        account_number: row.account_number,
        account_holder_name: row.holder_name,
        document_type: row.document_type,
        document_number: row.document_number,
        bank_code: row.bank_code,
      } : null
    }))

    return res.status(200).json({
      composers,
      count: totalCount,
    })
  } catch (error: any) {
    console.error("Error fetching admin composers:", error)
    return res.status(500).json({
      message: "Error fetching admin composers",
      error: error.message,
    })
  } finally {
    await client.end().catch(() => {})
  }
}
