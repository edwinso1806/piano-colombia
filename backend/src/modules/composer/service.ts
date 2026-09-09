import { MedusaService } from "@medusajs/framework/utils"
import { Composer } from "./models/composer"
import { ComposerBankAccount } from "./models/composer-bank-account"

export default class ComposerModuleService extends MedusaService({
  Composer,
  ComposerBankAccount,
}) {}
