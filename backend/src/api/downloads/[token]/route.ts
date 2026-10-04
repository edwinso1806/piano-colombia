import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { handleSecureDownload } from "../../../lib/secure-download-handler"

export const AUTHENTICATE = false

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { token } = req.params
  return handleSecureDownload(token as string, req, res)
}
