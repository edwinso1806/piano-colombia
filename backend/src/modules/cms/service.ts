import { MedusaService } from "@medusajs/framework/utils"
import { HeroContent } from "./models/hero-content"

export default class CmsModuleService extends MedusaService({
  HeroContent,
}) {}
