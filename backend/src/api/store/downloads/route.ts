import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DOWNLOAD_MODULE } from "../../../modules/download"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const downloadModuleService = req.scope.resolve(DOWNLOAD_MODULE)
    const { email } = req.query

    const filters: Record<string, any> = {}
    if (email) filters.buyer_email = email

    const [downloads, count] = await downloadModuleService.listAndCountCustomerDownloads(filters, {
      order: { createdAt: "DESC" },
    })

    return res.status(200).json({
      downloads,
      count,
    })
  } catch (error: any) {
    return res.status(500).json({
      message: "Error fetching customer downloads",
      error: error.message,
    })
  }
}
