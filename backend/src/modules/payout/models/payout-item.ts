import { model } from "@medusajs/framework/utils"
import { PayoutBatch } from "./payout-batch"

export const PayoutItemStatus = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  TRANSFERRED: "TRANSFERRED",
  FAILED: "FAILED",
} as const

export const PayoutItem = model.define("payout_item", {
  id: model.id().primaryKey(),
  composer_id: model.text(),
  composer_name: model.text(),
  bank_name: model.text(),
  account_type: model.text(),
  account_number: model.text(),
  document_number: model.text(),
  amount_gross_cop: model.number().default(0),
  commission_pc_cop: model.number().default(0),
  amount_net_cop: model.number().default(0),
  wompi_transfer_id: model.text().nullable(),
  status: model.enum(Object.values(PayoutItemStatus)).default(PayoutItemStatus.PENDING),
  error_message: model.text().nullable(),
  batch: model.belongsTo(() => PayoutBatch, {
    mappedBy: "items",
  }),
})
