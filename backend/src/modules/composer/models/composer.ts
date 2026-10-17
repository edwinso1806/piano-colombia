import { model } from "@medusajs/framework/utils"
import { ComposerBankAccount } from "./composer-bank-account"

export const ComposerStatus = {
  DRAFT: "DRAFT",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  SUSPENDED: "SUSPENDED",
  BLOCKED: "BLOCKED",
} as const

export const Composer = model.define("composer", {
  id: model.id().primaryKey(),
  first_name: model.text(),
  last_name: model.text(),
  artistic_name: model.text().nullable(),
  slug: model.text().unique(),
  bio_es: model.text().nullable(),
  bio_en: model.text().nullable(),
  region: model.text().nullable(),
  era: model.text().nullable(),
  photo_url: model.text().nullable(),
  status: model.enum(Object.values(ComposerStatus)).default(ComposerStatus.DRAFT),
  rejection_reason: model.text().nullable(),
  approval_attempts: model.number().default(0),
  submitted_at: model.dateTime().nullable(),
  user_id: model.text().nullable(), // Reference to Auth / Customer ID
  email: model.text(),
  phone: model.text().nullable(),
  password_hash: model.text().nullable(),
  salt: model.text().nullable(),
  is_featured: model.boolean().default(false),
  commission_percentage: model.number().nullable(), // Porcentaje personalizado (ej: 15 para 15%). Si es null, aplica el general.
  preferred_language: model.text().default("es"),
  bank_account: model.hasOne(() => ComposerBankAccount, {
    mappedBy: "composer",
  }).nullable(),
})

