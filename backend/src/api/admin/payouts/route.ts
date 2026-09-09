import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { COMPOSER_MODULE } from "../../../modules/composer"
import { PAYOUT_MODULE } from "../../../modules/payout"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const composerModuleService = req.scope.resolve(COMPOSER_MODULE)
    const payoutModuleService = req.scope.resolve(PAYOUT_MODULE)

    // 1. Fetch approved composers with bank account details
    const [composers] = await composerModuleService.listAndCountComposers(
      { status: "APPROVED" },
      { relations: ["bank_account"], take: 100 }
    )

    // 2. Mock or compute real accrued sales for pending period
    const mockPendingSales = [
      { email: "guillermo.rendon@pianocolombia.com", salesCount: 42, gross: 5200000 },
      { email: "alba.potes@pianocolombia.com", salesCount: 35, gross: 4375000 },
      { email: "lucas.saboya@pianocolombia.com", salesCount: 29, gross: 3625000 },
      { email: "german.perez@pianocolombia.com", salesCount: 51, gross: 6375000 },
      { email: "blanca.uribe@pianocolombia.com", salesCount: 18, gross: 2250000 },
      { email: "adolfo.mejia@pianocolombia.com", salesCount: 48, gross: 6000000 },
      { email: "luis.calvo@pianocolombia.com", salesCount: 30, gross: 3750000 },
      { email: "pedro.morales@pianocolombia.com", salesCount: 22, gross: 2750000 },
    ]

    const pendingPayouts = composers.map((comp: any, idx: number) => {
      const matched = mockPendingSales.find((s) => s.email === comp.email) || {
        salesCount: 15 + ((idx * 7) % 25),
        gross: 2000000 + ((idx * 650000) % 4000000),
      }
      const grossSalesCOP = matched.gross
      const platformFeeCOP = Math.round(grossSalesCOP * 0.20) // 20%
      const netEarningsCOP = Math.round(grossSalesCOP * 0.80) // 80%

      const bank = comp.bank_account || {}

      return {
        id: `pay-${comp.id}`,
        composerId: comp.id,
        composerName: comp.artistic_name || `${comp.first_name} ${comp.last_name}`,
        email: comp.email,
        bankName: bank.bank_name || "Bancolombia",
        accountType: bank.account_type || "Ahorros",
        accountNumber: bank.account_number || "582-910284-12",
        taxId: bank.document_number ? `${bank.document_type || "CC"} ${bank.document_number}` : "CC 19.482.910",
        totalSalesCount: matched.salesCount,
        grossSalesCOP,
        platformFeeCOP,
        netEarningsCOP,
        status: "pending",
        wompiVerified: true,
      }
    })

    // 3. Fetch past batches from DB
    let batches: any[] = []
    try {
      const [dbBatches] = await payoutModuleService.listAndCountPayoutBatches(
        {},
        { relations: ["items"], order: { createdAt: "DESC" }, take: 20 }
      )
      batches = dbBatches.map((b: any) => ({
        batchId: b.batch_number || b.id,
        date: new Date(b.executed_at || b.createdAt).toLocaleDateString("es-CO", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        composersCount: b.items ? b.items.length : 0,
        totalAmountCOP: b.total_net_composers_cop,
        status: b.status.toLowerCase(),
        executedBy: b.executed_by || "Tesorero PC",
        wompiBatchTransactionId: b.wompi_batch_id || "TR-WOMPI-BATCH-000",
      }))
    } catch (batchErr) {
      console.warn("No se pudieron listar batches de payouts:", batchErr)
    }

    return res.status(200).json({
      pendingPayouts,
      batches,
    })
  } catch (error: any) {
    return res.status(500).json({
      message: "Error consultando liquidaciones de pagos",
      error: error.message,
    })
  }
}
