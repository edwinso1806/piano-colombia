import { model } from "@medusajs/framework/utils"

export const CustomerAccount = model.define("customer_account", {
  id: model.id().primaryKey(),
  email: model.text().unique(),
  first_name: model.text(),
  last_name: model.text(),
  password_hash: model.text(),
  salt: model.text(),
  phone: model.text().nullable(),
  tax_id: model.text().nullable(),
  preferred_language: model.text().default("es"),
  is_active: model.boolean().default(true),
})
