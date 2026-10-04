import { NextRequest, NextResponse } from "next/server"

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "pk_0372bd6f8b5885e7dcfd759e152d7a9db36782d5eaace95f07e707f2e9f68ce3"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    if (!token) {
      return NextResponse.json({ message: "Token de descarga requerido" }, { status: 400 })
    }

    // Consultar endpoint público de descarga protegida en Medusa
    const backendRes = await fetch(`${MEDUSA_URL}/downloads/${token}`, {
      method: "GET",
      headers: {
        "x-publishable-api-key": PUBLISHABLE_KEY,
      },
      cache: "no-store",
    })

    if (backendRes.status === 403) {
      const errData = await backendRes.json().catch(() => ({}))
      return NextResponse.json(
        {
          message: errData.message || "Has alcanzado el límite máximo de descargas permitidas para esta licencia.",
          limitReached: true,
        },
        { status: 403 }
      )
    }

    if (!backendRes.ok) {
      const errData = await backendRes.json().catch(() => ({}))
      return NextResponse.json(
        { message: errData.message || `Error al procesar la descarga (${backendRes.status})` },
        { status: backendRes.status }
      )
    }

    const contentType = backendRes.headers.get("content-type") || "application/pdf"
    const contentDisposition = backendRes.headers.get("content-disposition") || `attachment; filename="PianoColombia_Partitura_Estampada.pdf"`
    const downloadsRemaining = backendRes.headers.get("x-downloads-remaining") || "0"
    const downloadsTotal = backendRes.headers.get("x-downloads-total") || "5"

    const pdfBuffer = await backendRes.arrayBuffer()

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": contentDisposition,
        "X-Downloads-Remaining": downloadsRemaining,
        "X-Downloads-Total": downloadsTotal,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error: any) {
    console.error("❌ Error en proxy de descargas:", error)
    return NextResponse.json(
      { message: "Error interno al procesar la descarga de la partitura", error: error.message },
      { status: 500 }
    )
  }
}
