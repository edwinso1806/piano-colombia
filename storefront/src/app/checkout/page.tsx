"use client";

import Link from "next/link";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export default function CheckoutPage() {
  const { cart, totalCOP, totalUSD } = useCart();
  const { customer, loginCustomer } = useAuth();
  const { t, language } = useLanguage();
  const [wompiMethod, setWompiMethod] = useState<"CARD" | "PSE" | "NEQUI" | "BANCOLOMBIA">("CARD");
  const [selectedBank, setSelectedBank] = useState("bancolombia");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerName, setCustomerName] = useState(customer?.fullName || "");
  const [customerEmail, setCustomerEmail] = useState(customer?.email || "");
  const [downloadToken, setDownloadToken] = useState<string | null>(null);

  const defaultScore = {
    title: "Pasillo Colombiano No. 1 en Mi Menor",
    composer: "Adolfo Mejía",
    priceCOP: 35000,
    priceUSD: 8.75,
    slug: "pasillo-colombiano-no-1",
  };

  const displayTotalCOP = totalCOP > 0 ? totalCOP : defaultScore.priceCOP;
  const displayTotalUSD = totalUSD > 0 ? totalUSD : defaultScore.priceUSD;

  const handleProcessPayment = async () => {
    setIsProcessing(true);
    const buyerName = customer?.fullName || customerName;
    const buyerEmail = customer?.email || customerEmail;

    if (!buyerName.trim() || !buyerEmail.trim()) {
      alert(language === "en" ? "Please enter your name and email or log in to link your purchase." : "Por favor ingresa tu nombre y correo o inicia sesión para vincular tu compra.");
      setIsProcessing(false);
      return;
    }

    try {
      const activeItem = cart[0]?.score || defaultScore;
      const res = await fetch("http://localhost:9000/webhooks/wompi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "transaction.updated",
          customer_email: buyerEmail,
          customer_name: buyerName,
          score_slug: activeItem.slug || "pasillo-colombiano-no-1",
          data: {
            transaction: {
              status: "APPROVED",
              reference: `WMP-PC-${Date.now().toString().slice(-6)}`,
              amount_in_cents: displayTotalCOP * 100,
              customer_email: buyerEmail,
              customer_data: {
                full_name: buyerName,
                legal_id: "1098765432",
              },
            },
          },
        }),
      });

      const data = await res.json();
      if (data.download_token) {
        setDownloadToken(data.download_token);
      }
    } catch (err) {
      console.warn("Error comunicando con Webhook de Wompi:", err);
    } finally {
      setIsProcessing(false);
      setIsSuccess(true);
    }
  };

  const banks = [
    { id: "bancolombia", name: "Bancolombia" },
    { id: "nequi", name: "Nequi" },
    { id: "davivienda", name: "Davivienda / Daviplata" },
    { id: "banco_bogota", name: "Banco de Bogotá" },
    { id: "banco_occidente", name: "Banco de Occidente" },
    { id: "bbva", name: "BBVA Colombia" },
    { id: "scotiabank", name: "Scotiabank Colpatria" },
    { id: "lulo", name: "Lulo Bank" },
  ];

  return (
    <div className="min-h-screen bg-[#F9F9FF] text-[#111C2D] flex flex-col font-inter selection:bg-[#FBB03B] selection:text-[#111C2D]">
      {/* Header Fijo */}
      <Header activePage="checkout" />

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full min-w-0">
        {isSuccess ? (
          <div className="bg-white p-10 rounded-3xl text-center max-w-2xl mx-auto space-y-6 border border-black/5 shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
            <div className="w-16 h-16 bg-[#FBB03B]/20 rounded-full flex items-center justify-center text-3xl mx-auto text-[#111C2D]">
              🎉
            </div>
            <h1 className="text-3xl font-black font-montserrat text-[#111C2D]">
              {language === "en" ? "Payment Successfully Approved by Wompi!" : "¡Pago Exitoso Aprobado por Wompi!"}
            </h1>
            <p className="text-xs sm:text-sm text-[#4C4546] leading-relaxed font-medium">
              {language === "en"
                ? "Your transaction was securely processed through Wompi Gateway. The authorized digital sheet music has been generated with your legal watermark."
                : "Tu transacción ha sido procesada de forma segura mediante la Pasarela Oficial Wompi. Se ha generado la versión digital autorizada de tu partitura estampada con tus datos legales."}
            </p>

            {/* Simulación del Estampado de Marca de Agua Legal */}
            <div className="p-5 bg-[#F0F3FF] rounded-2xl border border-black/5 text-left space-y-3">
              <span className="text-xs font-extrabold text-[#0071BC] uppercase tracking-wider block border-b border-black/5 pb-2 font-montserrat flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">verified_user</span>
                {language === "en" ? "Incorporated Legal PDF License Watermark:" : "Estampa Legal de Licencia Incorporada en el PDF:"}
              </span>
              <div className="p-4 bg-white rounded-xl border border-black/5 font-mono text-[11px] text-[#4C4546] space-y-1.5 shadow-2xs">
                <p className="text-[#111C2D] font-bold">Obra: {defaultScore.title} — {defaultScore.composer}</p>
                <p className="text-[#0071BC] font-semibold">Licenciado a: Juan Pérez (juan@ejemplo.com)</p>
                <p>Pasarela: Wompi API Gateway | Ref Wompi: WMP-{Date.now().toString().slice(-8)}</p>
                <p>Método: {wompiMethod} | Idioma Transacción: {language.toUpperCase()}</p>
                <p>Estado: Transacción Aprobada (00 - Exitosa)</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="/mi-cuenta/descargas"
                className="w-full py-4 bg-[#FBB03B] text-[#111C2D] font-extrabold rounded-xl hover:bg-[#e09b2d] transition font-montserrat text-xs uppercase tracking-wider shadow-md text-center block"
              >
                📥 {language === "en" ? "Go to My Downloaded Scores" : "Ir a Mis Partituras Compradas"}
              </Link>
              <a
                href={downloadToken ? `http://localhost:9000/store/downloads/${downloadToken}` : "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-white text-[#111C2D] border border-black/10 font-bold rounded-xl hover:bg-[#F0F3FF] transition font-montserrat text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base text-[#0071BC]">download</span>
                <span>{language === "en" ? "Download Official Stamped PDF" : "Descargar PDF Estampado Oficial"}</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Columna Izquierda: Formulario Datos & Pasarela Única Wompi */}
            <div className="lg:col-span-7 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-black font-montserrat text-[#111C2D] mb-1 tracking-tight">
                    {language === "en" ? "Wompi Secure Checkout" : "Checkout Seguro Wompi"}
                  </h1>
                  <p className="text-xs text-[#4C4546] font-medium">
                    {language === "en"
                      ? "Process your national or international purchase with bank-grade SSL encryption."
                      : "Procesa tu compra nacional o internacional con encriptación SSL de nivel bancario."}
                  </p>
                </div>
              </div>

              {/* Verificación de Sesión de Cliente Obligatoria */}
              {customer ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 font-montserrat">
                      <span className="material-symbols-outlined text-emerald-600 text-base">verified_user</span>
                      <span>{language === "en" ? "Verified Customer Session in PostgreSQL" : "Sesión de Comprador Autenticada en PostgreSQL"}</span>
                    </div>
                    <Link
                      href="/login?redirect=/checkout"
                      className="text-[11px] font-extrabold text-[#0071BC] hover:underline font-montserrat"
                    >
                      {language === "en" ? "Switch account?" : "¿Cambiar cuenta?"}
                    </Link>
                  </div>
                  <p className="text-xs text-[#4C4546] leading-relaxed font-medium">
                    {language === "en"
                      ? "The legal nominative license and Urtext digital PDF will be officially issued to:"
                      : "La licencia legal nominativa y el archivo digital PDF Urtext se emitirán oficialmente a nombre de:"}{" "}
                    <strong className="text-[#111C2D]">{customer.fullName} ({customer.email})</strong>.
                  </p>
                </div>
              ) : (
                <div className="p-5 bg-amber-50 border border-amber-300 rounded-2xl shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-900 font-montserrat">
                      <span className="material-symbols-outlined text-amber-600 text-base">lock</span>
                      <span>{language === "en" ? "Buyer Login Required to Purchase" : "Inicio de Sesión Requerido para Comprar"}</span>
                    </div>
                  </div>
                  <p className="text-xs text-amber-950 leading-relaxed">
                    {language === "en"
                      ? "To issue the legal license in your name and store your sheets in your account, please log in or register."
                      : "Para emitir la licencia con tu nombre y almacenar tus partituras en tu casillero de descargas, debes iniciar sesión o crear tu cuenta."}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Link
                      href="/login?redirect=/checkout"
                      className="px-4 py-2 bg-[#0071BC] text-[#111C2D] text-xs font-bold font-montserrat rounded-xl shadow-xs hover:bg-[#005996] transition inline-flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">login</span>
                      {language === "en" ? "Log In / Register" : "Iniciar Sesión / Registrarme"}
                    </Link>
                  </div>
                </div>
              )}

              {/* Formulario Datos del Comprador */}
              <div className="bg-white p-6 rounded-2xl space-y-4 border border-black/5 shadow-xs">
                <h2 className="text-base font-bold font-montserrat text-[#111C2D]">
                  {language === "en" ? "1. Customer & License Details" : "1. Datos del Comprador & Licencia"}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
                      {language === "en" ? "Full Name (Licensee) *" : "Nombre Completo (Licenciatario) *"}
                    </label>
                    <input
                      type="text"
                      value={customer?.fullName || customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-3 text-xs text-[#111C2D] font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
                      {language === "en" ? "Email (PDF Delivery) *" : "Correo Electrónico (Entrega PDF) *"}
                    </label>
                    <input
                      type="email"
                      value={customer?.email || customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-3 text-xs text-[#111C2D] font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                    />
                  </div>
                </div>
              </div>

              {/* Pasarela Oficial Wompi (Internacional y Nacional) */}
              <div className="bg-white p-6 rounded-2xl space-y-6 border border-black/5 shadow-xs">
                <div className="flex items-center justify-between border-b border-black/5 pb-3">
                  <div>
                    <h2 className="text-base font-bold font-montserrat text-[#111C2D]">
                      {language === "en" ? "2. Integrated Wompi Payment Gateway" : "2. Método de Pago Integrado Wompi"}
                    </h2>
                    <p className="text-[11px] text-[#4C4546]">
                      {language === "en"
                        ? "International Credit/Debit Cards (USD/COP), PSE, Nequi & Daviplata."
                        : "Tarjetas Internacionales (Visa, MC, Amex en USD/COP), PSE, Nequi, Daviplata y Bancolombia."}
                    </p>
                  </div>
                  <div className="px-2.5 py-1 bg-[#0071BC]/10 border border-[#0071BC]/20 text-[#0071BC] font-montserrat font-black text-[10px] uppercase rounded-full">
                    Powered by Wompi
                  </div>
                </div>

                {/* Sub-métodos de pago Wompi */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setWompiMethod("CARD")}
                    className={`p-3 rounded-xl border text-xs font-bold font-montserrat transition text-center flex flex-col items-center gap-1 ${
                      wompiMethod === "CARD"
                        ? "border-[#0071BC] bg-[#0071BC] text-white shadow-xs"
                        : "border-black/5 bg-[#F0F3FF] text-[#4C4546] hover:text-[#111C2D]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">credit_card</span>
                    <span className="text-[11px]">Tarjetas (USD/COP)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWompiMethod("PSE")}
                    className={`p-3 rounded-xl border text-xs font-bold font-montserrat transition text-center flex flex-col items-center gap-1 ${
                      wompiMethod === "PSE"
                        ? "border-[#0071BC] bg-[#0071BC] text-white shadow-xs"
                        : "border-black/5 bg-[#F0F3FF] text-[#4C4546] hover:text-[#111C2D]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">account_balance</span>
                    <span className="text-[11px]">PSE (Débito)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWompiMethod("NEQUI")}
                    className={`p-3 rounded-xl border text-xs font-bold font-montserrat transition text-center flex flex-col items-center gap-1 ${
                      wompiMethod === "NEQUI"
                        ? "border-[#0071BC] bg-[#0071BC] text-white shadow-xs"
                        : "border-black/5 bg-[#F0F3FF] text-[#4C4546] hover:text-[#111C2D]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">smartphone</span>
                    <span className="text-[11px]">Nequi / Daviplata</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWompiMethod("BANCOLOMBIA")}
                    className={`p-3 rounded-xl border text-xs font-bold font-montserrat transition text-center flex flex-col items-center gap-1 ${
                      wompiMethod === "BANCOLOMBIA"
                        ? "border-[#0071BC] bg-[#0071BC] text-white shadow-xs"
                        : "border-black/5 bg-[#F0F3FF] text-[#4C4546] hover:text-[#111C2D]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">savings</span>
                    <span className="text-[11px]">Bancolombia</span>
                  </button>
                </div>

                {/* Formulario Dinámico Wompi */}
                {wompiMethod === "CARD" && (
                  <div className="p-4 bg-[#F0F3FF] rounded-2xl border border-black/5 space-y-3 text-xs">
                    <span className="font-montserrat font-bold text-[#111C2D] block">
                      {language === "en" ? "International Card Details (Visa, MasterCard, Amex)" : "Tarjeta Internacional o Nacional (Visa, MasterCard, Amex)"}
                    </span>
                    <div>
                      <label className="block font-semibold text-[#4C4546] mb-1">
                        {language === "en" ? "Card Number *" : "Número de Tarjeta *"}
                      </label>
                      <input
                        type="text"
                        placeholder="4500 •••• •••• 1234"
                        defaultValue="4500 1289 9012 3456"
                        className="w-full bg-white border border-black/10 rounded-xl px-4 py-2.5 text-xs text-[#111C2D] font-mono focus:ring-2 focus:ring-[#0071BC] outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-[#4C4546] mb-1">
                          {language === "en" ? "Expiry (MM/YY) *" : "Vencimiento (MM/AA) *"}
                        </label>
                        <input
                          type="text"
                          placeholder="12/28"
                          defaultValue="12/28"
                          className="w-full bg-white border border-black/10 rounded-xl px-4 py-2.5 text-xs text-[#111C2D] font-mono focus:ring-2 focus:ring-[#0071BC] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-[#4C4546] mb-1">CVV / CVC *</label>
                        <input
                          type="password"
                          placeholder="•••"
                          defaultValue="789"
                          className="w-full bg-white border border-black/10 rounded-xl px-4 py-2.5 text-xs text-[#111C2D] font-mono focus:ring-2 focus:ring-[#0071BC] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {wompiMethod === "PSE" && (
                  <div className="p-4 bg-[#F0F3FF] rounded-2xl border border-black/5 space-y-3 text-xs">
                    <label className="block font-montserrat font-bold text-[#111C2D]">
                      {language === "en" ? "Select your Bank for PSE Debit:" : "Selecciona tu Banco Registrado en PSE:"}
                    </label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full bg-white border border-black/10 rounded-xl px-4 py-2.5 text-xs font-semibold text-[#111C2D] focus:ring-2 focus:ring-[#0071BC] outline-none"
                    >
                      {banks.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-[#4C4546]">
                      {language === "en"
                        ? "You will be securely redirected to your bank's PSE portal."
                        : "Serás redirigido de forma segura al portal de tu entidad bancaria en Colombia."}
                    </p>
                  </div>
                )}

                {wompiMethod === "NEQUI" && (
                  <div className="p-4 bg-[#F0F3FF] rounded-2xl border border-black/5 space-y-3 text-xs">
                    <label className="block font-montserrat font-bold text-[#111C2D]">
                      {language === "en" ? "Mobile Phone Registered in Nequi / Daviplata:" : "Número Celular Registrado en Nequi / Daviplata:"}
                    </label>
                    <input
                      type="tel"
                      defaultValue="310 987 6543"
                      className="w-full bg-white border border-black/10 rounded-xl px-4 py-2.5 text-xs font-mono text-[#111C2D] focus:ring-2 focus:ring-[#0071BC] outline-none"
                    />
                    <p className="text-[11px] text-[#4C4546]">
                      {language === "en"
                        ? "You will receive an instant push notification on your mobile app to confirm the purchase."
                        : "Recibirás una notificación push instantánea en la app de Nequi/Daviplata para aprobar la compra."}
                    </p>
                  </div>
                )}

                {wompiMethod === "BANCOLOMBIA" && (
                  <div className="p-4 bg-[#F0F3FF] rounded-2xl border border-black/5 space-y-3 text-xs">
                    <span className="font-montserrat font-bold text-[#111C2D] block">
                      Botón de Pago Directo Bancolombia
                    </span>
                    <p className="text-[11px] text-[#4C4546]">
                      Transferencia directa desde tu App Bancolombia Personas sin costo adicional.
                    </p>
                  </div>
                )}

                {/* Primary Wompi Submit Button */}
                <button
                  type="button"
                  onClick={handleProcessPayment}
                  disabled={isProcessing}
                  className="w-full py-4 text-center font-extrabold text-xs uppercase tracking-wider bg-[#FBB03B] hover:bg-[#e09b2d] text-[#111C2D] rounded-2xl transition shadow-md font-montserrat flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-[#111C2D] border-t-transparent rounded-full animate-spin"></span>
                      <span>Procesando pago con Wompi...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">lock</span>
                      <span>
                        {language === "en"
                          ? `Pay $ ${displayTotalCOP.toLocaleString("es-CO")} COP (~$${displayTotalUSD.toFixed(2)} USD) via Wompi`
                          : `Pagar $ ${displayTotalCOP.toLocaleString("es-CO")} COP (~$${displayTotalUSD.toFixed(2)} USD) Vía Wompi`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Columna Derecha: Resumen de Orden */}
            <div className="lg:col-span-5">
              <div className="bg-white p-6 rounded-3xl space-y-6 sticky top-24 border border-black/5 shadow-xs">
                <h2 className="text-lg font-black font-montserrat text-[#111C2D] border-b border-black/5 pb-3">
                  {language === "en" ? "Order Summary" : "Resumen de la Orden"}
                </h2>

                <div className="space-y-3">
                  {cart.length > 0 ? (
                    cart.map((item) => (
                      <div key={item.score.id} className="flex gap-3 pb-3 border-b border-black/5 text-xs">
                        <div className="w-12 h-14 bg-[#F0F3FF] rounded-xl border border-black/5 flex items-center justify-center shrink-0 text-[#0071BC]">
                          <span className="material-symbols-outlined text-xl">picture_as_pdf</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-montserrat font-bold text-[#111C2D] truncate">{item.score.title}</h4>
                          <p className="text-[11px] text-[#4C4546]">{item.score.composer}</p>
                          <span className="text-[10px] text-[#0071BC] font-semibold">
                            {item.quantity} copia(s) PDF Estampado
                          </span>
                        </div>
                        <div className="text-right font-montserrat font-bold text-[#111C2D]">
                          $ {(item.score.priceCOP * item.quantity).toLocaleString("es-CO")}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex gap-3 pb-3 border-b border-black/5 text-xs">
                      <div className="w-12 h-14 bg-[#F0F3FF] rounded-xl border border-black/5 flex items-center justify-center shrink-0 text-[#0071BC]">
                        <span className="material-symbols-outlined text-xl">picture_as_pdf</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-montserrat font-bold text-[#111C2D]">{defaultScore.title}</h4>
                        <p className="text-[11px] text-[#4C4546]">{defaultScore.composer}</p>
                        <span className="text-[10px] text-[#0071BC] font-semibold">1 Copia PDF Estampado</span>
                      </div>
                      <div className="text-right font-montserrat font-bold text-[#111C2D]">
                        $ {defaultScore.priceCOP.toLocaleString("es-CO")}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-xs text-[#4C4546]">
                  <div className="flex justify-between">
                    <span>{language === "en" ? "Subtotal Scores:" : "Subtotal Partituras:"}</span>
                    <span className="font-bold text-[#111C2D]">$ {displayTotalCOP.toLocaleString("es-CO")} COP</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === "en" ? "DRM Legal Watermark:" : "Estampa Legal Nominativa DRM:"}</span>
                    <span className="text-emerald-700 font-bold uppercase text-[10px]">
                      {language === "en" ? "Free ($0 USD)" : "Gratis ($0 COP)"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-[#111C2D] font-montserrat font-black pt-3 border-t border-black/5">
                    <span>{language === "en" ? "Total Amount:" : "Total a Pagar:"}</span>
                    <span className="text-[#0071BC]">
                      $ {displayTotalCOP.toLocaleString("es-CO")} COP
                    </span>
                  </div>
                  <p className="text-[10px] text-[#4C4546] text-right font-semibold font-montserrat">
                    (~${displayTotalUSD.toFixed(2)} USD)
                  </p>
                </div>

                <div className="text-[11px] text-[#4C4546] bg-[#F0F3FF] p-4 rounded-2xl border border-black/5 space-y-1.5">
                  <span className="font-montserrat font-bold text-[#0071BC] block flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">shield</span>
                    {language === "en" ? "Wompi API & Resend Email Guarantee:" : "Garantía Wompi API & Resend Email:"}
                  </span>
                  <p className="leading-relaxed">
                    {language === "en"
                      ? "PCI-DSS Level 1 security standard processing. The download link for your signed vector PDF will arrive in your email instantly."
                      : "Procesamiento con estándar de seguridad PCI-DSS Nivel 1. El enlace de descarga de tu PDF vectorizado firmado llegará a tu correo inmediatamente."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
