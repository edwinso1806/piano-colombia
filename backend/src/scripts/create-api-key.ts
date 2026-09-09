import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function createPublishableKey({ container }: ExecArgs) {
  const apiKeyModule = container.resolve(Modules.API_KEY)
  const salesChannelModule = container.resolve(Modules.SALES_CHANNEL)

  console.log("🔑 Creando Publishable API Key para Piano Colombia...")

  const [channels] = await salesChannelModule.listAndCountSalesChannels({})
  let defaultChannel = channels[0]

  if (!defaultChannel) {
    defaultChannel = await salesChannelModule.createSalesChannels({
      name: "Piano Colombia Storefront",
    })
  }

  const existingKeys = await apiKeyModule.listApiKeys({ type: "publishable" })
  let keyToken = ""

  if (existingKeys.length > 0) {
    keyToken = existingKeys[0].token
    console.log(`🔑 Publishable Key existente: ${keyToken}`)
  } else {
    const key = await apiKeyModule.createApiKeys({
      title: "Storefront Web Key",
      type: "publishable",
      created_by: "system",
    })
    keyToken = key.token
    console.log(`✅ Nueva Publishable Key creada: ${keyToken}`)
  }

  console.log(`\n=========================================\nNEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${keyToken}\n=========================================\n`)
}
