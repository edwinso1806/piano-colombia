import { model } from "@medusajs/framework/utils"
import { PayoutItem } from "./payout-item"

export const PayoutBatchStatus = {
  DRAFT: "DRAFT",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const

export const PayoutBatch = model.define("payout_batch", {
  id: model.id().primaryKey(),
  batch_number: model.text().unique(),
  period_start: model.dateTime(),
  period_end: model.dateTime(),
  status: model.enum(Object.values(PayoutBatchStatus)).default(PayoutBatchStatus.DRAFT),
  total_gross_cop: model.number().default(0),
  total_commission_pc_cop: model.number().default(0), // 20%
  total_net_composers_cop: model.number().default(0), // 80%
  wompi_batch_id: model.text().nullable(),
  executed_at: model.dateTime().nullable(),
  executed_by: model.text().nullable(),
  items: model.hasMany(() => PayoutItem, {
    mappedBy: "batch",
  }),
})
