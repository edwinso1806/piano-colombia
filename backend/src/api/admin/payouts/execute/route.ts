import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PAYOUT_MODULE } from "../../../../modules/payout"
import { PayoutBatchStatus } from "../../../../modules/payout/models/payout-batch"
import { PayoutItemStatus } from "../../../../modules/payout/models/payout-item"
import {
  executeWompiPayoutTransfer,
  generateBancolombiaPAB,
  maskAccountNumber,
} from "../../../../lib/wompi-payout-service"
import {
  sendEmail,
  generateComposerPayoutNotificationHTML,
} from "../../../../lib/resend-mailer"

export const AUTHENTICATE = false

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const payoutModuleService = req.scope.resolve(PAYOUT_MODULE)
    const { items, executedBy = "Tesorero PC" } = (req.body as any) || {}

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No se enviaron ítems para procesar dispersión de fondos",
      })
    }

    const now = new Date()
    const batchNumber = `BATCH-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${Math.floor(100 + Math.random() * 900)}`
    const wompiBatchId = `WMP-DISP-BATCH-${Date.now()}`

    let totalGross = 0
    let totalCommission = 0
    let totalNet = 0

    items.forEach((item: any) => {
      totalGross += Number(item.grossSalesCOP) || 0
      totalCommission += Number(item.platformFeeCOP) || 0
      totalNet += Number(item.netEarningsCOP) || 0
    })

    // 1. Crear el lote principal en PostgreSQL
    const batch = await payoutModuleService.createPayoutBatches({
      batch_number: batchNumber,
      period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      period_end: now,
      status: PayoutBatchStatus.COMPLETED,
      total_gross_cop: totalGross,
      total_commission_pc_cop: totalCommission,
      total_net_composers_cop: totalNet,
      wompi_batch_id: wompiBatchId,
      executed_at: now,
      executed_by: executedBy,
    })

    // 2. Procesar dispersión de cada compositor y registrar payout_item
    const processedItems = await Promise.all(
      items.map(async (item: any) => {
        // Ejecución de la transferencia vía Wompi API
        const transferResult = await executeWompiPayoutTransfer({
          composerId: item.composerId || "comp_unknown",
          composerName: item.composerName || "Compositor",
          email: item.email || "",
          amountNetCOP: Number(item.netEarningsCOP) || 0,
          amountGrossCOP: Number(item.grossSalesCOP) || 0,
          platformFeeCOP: Number(item.platformFeeCOP) || 0,
          destination: {
            bankName: item.bankName || "Bancolombia",
            accountType: item.accountType || "AHORROS",
            accountNumber: item.accountNumber || "0000000000",
            documentType: item.taxId?.split(" ")[0] || "CC",
            documentNumber: item.taxId?.split(" ")[1] || item.taxId || "00000000",
            holderName: item.composerName,
          },
          batchNumber,
        })

        // Guardar registro en base de datos
        const createdItem = await payoutModuleService.createPayoutItems({
          composer_id: item.composerId || "comp_unknown",
          composer_name: item.composerName || "Compositor",
          bank_name: item.bankName || "Bancolombia",
          account_type: item.accountType || "AHORROS",
          account_number: item.accountNumber || "0000000000",
          document_number: item.taxId || "CC 00000000",
          amount_gross_cop: Number(item.grossSalesCOP) || 0,
          commission_pc_cop: Number(item.platformFeeCOP) || 0,
          amount_net_cop: Number(item.netEarningsCOP) || 0,
          wompi_transfer_id: transferResult.wompiTransferId,
          status:
            transferResult.status === "FAILED"
              ? PayoutItemStatus.FAILED
              : PayoutItemStatus.TRANSFERRED,
          error_message: transferResult.success ? null : transferResult.message,
          batch_id: batch.id,
        })

        // Notificación automática por correo electrónico al compositor (solo si la transferencia fue exitosa)
        if (transferResult.success && transferResult.status !== "FAILED" && item.email && item.email.includes("@")) {
          try {
            const emailHtml = generateComposerPayoutNotificationHTML({
              composerName: item.composerName,
              batchNumber,
              amountNetCOP: Number(item.netEarningsCOP) || 0,
              amountGrossCOP: Number(item.grossSalesCOP) || 0,
              platformFeeCOP: Number(item.platformFeeCOP) || 0,
              commissionPercentage: item.commissionPercentage ?? 15,
              bankName: item.bankName || "Bancolombia",
              accountType: item.accountType || "AHORROS",
              accountNumberMasked: maskAccountNumber(item.accountNumber || ""),
              wompiTransferId: transferResult.wompiTransferId,
              salesCount: item.totalSalesCount || 1,
            })

            await sendEmail({
              to: item.email,
              subject: `💰 [Piano Colombia] Liquidación de Regalías Procesada - ${batchNumber}`,
              html: emailHtml,
            })
            console.log(`📧 Notificación de liquidación enviada al compositor: ${item.email}`)
          } catch (mailErr: any) {
            console.warn(`⚠️ No se pudo enviar correo al compositor ${item.email}:`, mailErr.message)
          }
        }

        return {
          id: createdItem.id,
          composerId: item.composerId,
          composerName: item.composerName,
          wompiTransferId: transferResult.wompiTransferId,
          amountNetCOP: Number(item.netEarningsCOP) || 0,
          status: createdItem.status,
          destination: transferResult.destinationSummary,
        }
      })
    )

    // 3. Generar archivo plano bancario Bancolombia PAB para tesorería
    const pabContent = generateBancolombiaPAB(batchNumber, items)

    return res.status(200).json({
      success: true,
      message: `Dispersión de fondos procesada exitosamente (${processedItems.length} giros a cuentas bancarias)`,
      batch: {
        id: batch.id,
        batchNumber,
        wompiBatchId,
        totalGross,
        totalCommission,
        totalNet,
        itemsCount: processedItems.length,
        executedAt: now.toISOString(),
        executedBy,
      },
      items: processedItems,
      pabContent,
    })
  } catch (error: any) {
    console.error("❌ Error ejecutando dispersión de fondos:", error)
    return res.status(500).json({
      success: false,
      message: "Error ejecutando dispersión de fondos masiva",
      error: error.message,
    })
  }
}
