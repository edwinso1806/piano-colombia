import { Module } from "@medusajs/framework/utils"
import ComposerModuleService from "./service"

export const COMPOSER_MODULE = "composer"

export default Module(COMPOSER_MODULE, {
  service: ComposerModuleService,
})
