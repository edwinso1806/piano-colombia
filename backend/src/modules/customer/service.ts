import { MedusaService } from "@medusajs/framework/utils"
import { CustomerAccount } from "./models/customer-account"

export default class CustomerModuleService extends MedusaService({
  CustomerAccount,
}) {}
