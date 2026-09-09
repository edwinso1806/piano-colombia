import { MedusaService } from "@medusajs/framework/utils"
import { PayoutBatch } from "./models/payout-batch"
import { PayoutItem } from "./models/payout-item"

export default class PayoutModuleService extends MedusaService({
  PayoutBatch,
  PayoutItem,
}) {}
