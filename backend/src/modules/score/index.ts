import { Module } from "@medusajs/framework/utils"
import ScoreModuleService from "./service"

export const SCORE_MODULE = "score"

export default Module(SCORE_MODULE, {
  service: ScoreModuleService,
})
