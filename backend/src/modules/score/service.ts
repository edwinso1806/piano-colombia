import { MedusaService } from "@medusajs/framework/utils"
import { Score } from "./models/score"

export default class ScoreModuleService extends MedusaService({
  Score,
}) {}
