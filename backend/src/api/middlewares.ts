import { defineMiddlewares, MedusaRequest, MedusaResponse, MedusaNextFunction } from "@medusajs/framework/http"

const DEFAULT_PUBLISHABLE_KEY = process.env.MEDUSA_PUBLISHABLE_KEY || "pk_0372bd6f8b5885e7dcfd759e152d7a9db36782d5eaace95f07e707f2e9f68ce3"

function customCorsMiddleware(req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "http://localhost:3000")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-publishable-api-key")
  res.setHeader("Access-Control-Allow-Credentials", "true")

  if (req.method === "OPTIONS") {
    return res.status(204).end()
  }

  // Si no viene x-publishable-api-key (ej: tags <img>, descargas directas), inyectar clave pública
  if (!req.headers["x-publishable-api-key"]) {
    req.headers["x-publishable-api-key"] = DEFAULT_PUBLISHABLE_KEY
  }

  next()
}

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/media*",
      middlewares: [customCorsMiddleware],
    },
    {
      matcher: "/store/uploads*",
      bodyParser: {
        sizeLimit: "30mb",
      },
      middlewares: [customCorsMiddleware],
    },
    {
      matcher: "/store/composers*",
      bodyParser: {
        sizeLimit: "30mb",
      },
      middlewares: [customCorsMiddleware],
    },
    {
      matcher: "/store/scores*",
      middlewares: [customCorsMiddleware],
    },
    {
      matcher: "/store/cms*",
      middlewares: [customCorsMiddleware],
    },
    {
      matcher: "/store/auth*",
      middlewares: [customCorsMiddleware],
    },
  ],
})
