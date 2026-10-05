import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CUSTOMER_MODULE } from "../../../../modules/customer"

export const AUTHENTICATE = false

// 1. GET: Consultar datos del cliente por email
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const customerModuleService = req.scope.resolve(CUSTOMER_MODULE)
    const { email } = req.query as Record<string, string>

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email es obligatorio",
      })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const [customers] = await customerModuleService.listAndCountCustomerAccounts({
      email: normalizedEmail,
    })

    if (!customers || customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado",
      })
    }

    const customer = customers[0]
    return res.status(200).json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        fullName: `${customer.first_name || ""} ${customer.last_name || ""}`.trim(),
        phone: customer.phone || null,
        taxId: customer.tax_id || null,
      },
    })
  } catch (error: any) {
    console.error("❌ Error al consultar perfil de cliente:", error)
    return res.status(500).json({
      success: false,
      message: error.message || "Error al consultar perfil del cliente",
    })
  }
}

// 2. PUT: Actualizar datos de contacto (teléfono, cédula/taxId) del cliente
export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  try {
    const customerModuleService = req.scope.resolve(CUSTOMER_MODULE)
    const { email, phone, taxId, fullName } = (req.body as any) || {}

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email es obligatorio",
      })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const [customers] = await customerModuleService.listAndCountCustomerAccounts({
      email: normalizedEmail,
    })

    if (!customers || customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado",
      })
    }

    const customer = customers[0]
    const updateData: Record<string, any> = {}

    if (phone !== undefined) {
      updateData.phone = phone ? phone.trim() : null
    }

    if (taxId !== undefined) {
      updateData.tax_id = taxId ? taxId.trim() : null
    }

    if (fullName) {
      const names = fullName.trim().split(" ")
      updateData.first_name = names[0] || fullName
      updateData.last_name = names.slice(1).join(" ") || ""
    }

    const updated = await (customerModuleService as any).updateCustomerAccounts(customer.id, updateData)

    return res.status(200).json({
      success: true,
      customer: {
        id: updated.id,
        email: updated.email,
        fullName: `${updated.first_name || ""} ${updated.last_name || ""}`.trim(),
        phone: updated.phone || null,
        taxId: updated.tax_id || null,
      },
    })
  } catch (error: any) {
    console.error("❌ Error al actualizar datos de cliente:", error)
    return res.status(500).json({
      success: false,
      message: error.message || "Error al actualizar datos del cliente",
    })
  }
}
