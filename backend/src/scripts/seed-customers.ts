import { ExecArgs } from "@medusajs/framework/types"
import { CUSTOMER_MODULE } from "../modules/customer"
import { hashPassword } from "../lib/auth-security"

export default async function seedCustomers({ container }: ExecArgs) {
  const customerModuleService = container.resolve(CUSTOMER_MODULE)
  console.log("🌱 Inicializando cuentas de clientes reales en PostgreSQL...")

  const initialCustomers = [
    {
      email: "juan@ejemplo.com",
      first_name: "Juan",
      last_name: "Pérez",
      password: "piano2026",
      phone: "+57 300 123 4567",
      tax_id: "CC 19.482.910",
    },
    {
      email: "maria@conservatorio.edu.co",
      first_name: "María",
      last_name: "Gómez",
      password: "piano2026",
      phone: "+57 312 987 6543",
      tax_id: "CC 52.819.021",
    },
    {
      email: "carlos.restrepo@pianocolombia.com",
      first_name: "Carlos",
      last_name: "Restrepo",
      password: "piano2026",
      phone: "+57 310 555 8899",
      tax_id: "CC 79.481.092",
    },
  ]

  for (const c of initialCustomers) {
    const [existing] = await customerModuleService.listAndCountCustomerAccounts({ email: c.email })
    if (existing.length === 0) {
      const { hash, salt } = hashPassword(c.password)
      await customerModuleService.createCustomerAccounts({
        email: c.email,
        first_name: c.first_name,
        last_name: c.last_name,
        password_hash: hash,
        salt,
        phone: c.phone,
        tax_id: c.tax_id,
        is_active: true,
      })
      console.log(`✅ Cliente creado en PostgreSQL: ${c.first_name} ${c.last_name} (${c.email})`)
    } else {
      console.log(`ℹ️ Cliente ya existe: ${c.email}`)
    }
  }

  console.log("🏁 Cuentas de clientes inicializadas con éxito.")
}
