import { Module } from "@medusajs/framework/utils"
import DownloadModuleService from "./service"

export const DOWNLOAD_MODULE = "download"

export default Module(DOWNLOAD_MODULE, {
  service: DownloadModuleService,
})
