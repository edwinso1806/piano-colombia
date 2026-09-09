import { model } from "@medusajs/framework/utils"
import { Composer } from "./composer"

export const AccountType = {
  AHORROS: "AHORROS",
  CORRIENTE: "CORRIENTE",
  NEQUI: "NEQUI",
  DAVIPLATA: "DAVIPLATA",
} as const

export const ComposerBankAccount = model.define("composer_bank_account", {
  id: model.id().primaryKey(),
  account_type: model.enum(Object.values(AccountType)).default(AccountType.AHORROS),
  bank_code: model.text().nullable(),
  bank_name: model.text(),
  account_number: model.text(),
  holder_name: model.text(),
  document_type: model.text().default("CC"), // CC, CE, NIT, PASAPORTE
  document_number: model.text(),
  composer: model.belongsTo(() => Composer, {
    mappedBy: "bank_account",
  }),
})
