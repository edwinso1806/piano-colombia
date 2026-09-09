import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CUSTOMER_MODULE } from "../../../../modules/customer"
import { verifyPassword, generateSessionToken } from "../../../../lib/auth-security"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const customerModuleService = req.scope.resolve(CUSTOMER_MODULE)
    const { email, password } = (req.body as any) || {}

    if (!email || !password) {
      return res.status(400).json({
        message: "Email y contraseña son obligatorios",
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const [customers] = await customerModuleService.listAndCountCustomerAccounts({
      email: normalizedEmail,
    })

    if (!customers || customers.length === 0) {
      return res.status(401).json({
        message: "Correo o contraseña incorrectos. Por favor verifica tus credenciales.",
      })
    }

    const customer = customers[0]

    // Verify hashed password against PostgreSQL
    const isValid = verifyPassword(password, customer.password_hash, customer.salt)

    if (!isValid) {
      return res.status(401).json({
        message: "Correo o contraseña incorrectos. Por favor verifica tus credenciales.",
      })
    }

    const token = generateSessionToken({
      id: customer.id,
      email: customer.email,
      role: "customer",
    })

    return res.status(200).json({
      success: true,
      token,
      customer: {
        id: customer.id,
        email: customer.email,
        fullName: `${customer.first_name} ${customer.last_name}`,
        phone: customer.phone,
        taxId: customer.tax_id,
      },
    })
  } catch (error: any) {
    return res.status(500).json({
      message: "Error al autenticar cliente",
      error: error.message,
    })
  }
}
