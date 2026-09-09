import { Module } from "@medusajs/framework/utils"
import CustomerModuleService from "./service"

export const CUSTOMER_MODULE = "customer_module"

export default Module(CUSTOMER_MODULE, {
  service: CustomerModuleService,
})
