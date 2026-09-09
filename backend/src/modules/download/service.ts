import { MedusaService } from "@medusajs/framework/utils"
import { CustomerDownload } from "./models/customer-download"

export default class DownloadModuleService extends MedusaService({
  CustomerDownload,
}) {}
