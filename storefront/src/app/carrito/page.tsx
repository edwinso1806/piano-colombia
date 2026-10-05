"use client";

import Link from "next/link";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

export default function CarritoPage() {
  const { cart, removeFromCart, updateQuantity, totalCOP, totalUSD, clearCart } = useCart();
  const { t, language } = useLanguage();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0); // percentage
  const [couponMessage, setCouponMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const applyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === "PIANO2026") {
      setDiscount(15);
      setCouponMessage({
        text: language === "en" ? "15% discount coupon applied!" : "¡Cupón del 15% de descuento aplicado!",
        type: "success",
      });
    } else if (couponCode.toUpperCase() === "ESTUDIANTE") {
      setDiscount(20);
      setCouponMessage({
        text: language === "en" ? "20% academic discount applied!" : "¡Descuento académico del 20% aplicado!",
        type: "success",
      });
    } else {
      setCouponMessage({
        text: language === "en" ? "Invalid or expired coupon." : "Cupón no válido o expirado.",
        type: "error",
      });
    }
  };

  const discountAmountCOP = (totalCOP * discount) / 100;
  const finalTotalCOP = totalCOP - discountAmountCOP;

  const discountAmountUSD = (totalUSD * discount) / 100;
  const finalTotalUSD = totalUSD - discountAmountUSD;

  return (
    <div className="min-h-screen bg-[#F9F9FF] text-[#111C2D] flex flex-col font-inter antialiased selection:bg-[#FBB03B]/30 selection:text-[#111C2D]">
      {/* Header Fijo */}
      <Header activePage="carrito" />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-8 min-w-0">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#4C4546] font-medium font-montserrat">
          <Link href="/" className="hover:text-[#0071BC] transition">
            {t("nav.home", "Inicio")}
          </Link>
          <span>/</span>
          <Link href="/tienda" className="hover:text-[#0071BC] transition">
            {t("nav.catalog", "Tienda")}
          </Link>
          <span>/</span>
          <span className="text-[#111C2D] font-bold">{t("cart.title", "Carrito de Compras")}</span>
        </nav>

        {/* Title & Header Banner */}
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F3FF] text-[10px] font-extrabold text-[#0071BC] uppercase tracking-wider font-montserrat mb-2 border border-[#0071BC]/10">
              <span className="material-symbols-outlined text-xs">shopping_cart</span>{" "}
              {t("cart.badge", "COMPRA DIRECTA CON LICENCIA OFICIAL")}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-montserrat text-[#111C2D] tracking-tight">
              {t("cart.main_heading", "Tu Carrito de Compras Digital")}
            </h1>
            <p className="text-xs text-[#4C4546] mt-1 font-medium">
              {t(
                "cart.subheading",
                "Partituras en PDF vectorial de alta resolución estampadas con tu nombre y cédula para protección legal."
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {cart.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  const confirmMsg =
                    language === "en"
                      ? "¿Are you sure you want to empty your shopping cart?"
                      : "¿Estás seguro de que deseas vaciar todos los elementos de tu carrito?";
                  if (window.confirm(confirmMsg)) {
                    clearCart();
                  }
                }}
                className="text-xs font-montserrat font-bold text-[#C1272D] hover:text-[#931D21] bg-red-50 hover:bg-red-100/80 border border-red-200 px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                title={t("cart.clear_btn", "Vaciar Carrito")}
              >
                <span className="material-symbols-outlined text-base">delete_sweep</span>
                <span>{t("cart.clear_btn", "Vaciar Carrito")}</span>
              </button>
            )}
          </div>
        </div>

        {cart.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-12 text-center border border-black/5 shadow-xs max-w-xl mx-auto space-y-6 my-8">
            <div className="w-20 h-20 bg-[#F0F3FF] rounded-full flex items-center justify-center mx-auto text-[#0071BC]">
              <span className="material-symbols-outlined text-4xl">shopping_cart_off</span>
            </div>
            <div>
              <h2 className="text-xl font-black font-montserrat text-[#111C2D]">
                {t("cart.empty_title", "Tu carrito está vacío")}
              </h2>
              <p className="text-xs text-[#4C4546] mt-2 leading-relaxed">
                {t(
                  "cart.empty_desc",
                  "Aún no has agregado partituras a tu carrito. Explora nuestro archivo digital urtext del patrimonio pianístico colombiano."
                )}
              </p>
            </div>
            <Link
              href="/tienda"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0071BC] hover:bg-[#005996] text-white font-montserrat font-extrabold text-xs rounded-xl shadow-md transition"
            >
              <span className="material-symbols-outlined text-base">storefront</span>
              <span>{t("cart.explore_btn", "Explorar Catálogo de Partituras")}</span>
            </Link>
          </div>
        ) : (
          /* Main Cart Content Grid */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List (2 Cols) */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.score.id}
                  className="bg-white p-5 rounded-2xl border border-black/5 shadow-xs hover:border-[#0071BC]/20 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  {/* Left: Score Details */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-14 h-16 bg-[#F0F3FF] border border-black/10 rounded-xl flex items-center justify-center shrink-0 text-[#0071BC]">
                      <span className="material-symbols-outlined text-2xl">picture_as_pdf</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-[#FBB03B]/20 text-[#111C2D] font-montserrat font-black text-[9px] uppercase">
                          {item.score.category}
                        </span>
                        <span className="text-[10px] text-[#4C4546] font-semibold">
                          {item.score.level}
                        </span>
                      </div>
                      <h3 className="font-montserrat font-bold text-base text-[#111C2D] leading-snug">
                        {item.score.title}
                      </h3>
                      <p className="text-xs text-[#4C4546] font-medium">
                        {t("score.composer", "Compositor")}: <strong>{item.score.composer}</strong>
                      </p>
                      <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">verified</span>
                        {t("cart.legal_stamp_notice", "Estampa legal nominativa + Licencia Urtext")}
                      </p>
                    </div>
                  </div>

                  {/* Right: Quantity & Price */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-black/5">
                    {/* Quantity Switcher */}
                    <div className="flex items-center border border-black/10 rounded-xl bg-[#F0F3FF] overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.score.id, item.quantity - 1)}
                        className="px-3 py-1 text-xs text-[#111C2D] hover:bg-slate-200 transition font-bold"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-montserrat font-black text-[#111C2D]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.score.id, item.quantity + 1)}
                        className="px-3 py-1 text-xs text-[#111C2D] hover:bg-slate-200 transition font-bold"
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <div className="font-montserrat font-black text-base text-[#111C2D]">
                        $ {(item.score.priceCOP * item.quantity).toLocaleString(language === "en" ? "en-US" : "es-CO")} COP
                      </div>
                      <div className="text-[10px] text-[#4C4546] font-semibold">
                        ~${(item.score.priceUSD * item.quantity).toFixed(2)} USD
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => removeFromCart(item.score.id)}
                      title={t("cart.delete_item", "Eliminar de carrito")}
                      className="p-2 text-[#4C4546] hover:text-[#C1272D] hover:bg-red-50 rounded-xl transition cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
              ))}

              {/* Guarantees Box */}
              <div className="bg-[#F0F3FF]/70 p-5 rounded-2xl border border-black/5 text-xs text-[#4C4546] space-y-2">
                <span className="font-montserrat font-extrabold text-[#111C2D] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-[#0071BC]">verified_user</span>
                  {t("cart.guarantee_title", "Garantía de Descarga Inmediata & Marca de Agua DRM")}
                </span>
                <p className="leading-relaxed text-[11px]">
                  {t(
                    "cart.guarantee_desc",
                    "Al completar el pago en el Checkout recibirás acceso instantáneo a los archivos en PDF vectorial sin restricción de impresión. Cada partitura incluye el código legal de licencia a tu nombre."
                  )}
                </p>
              </div>
            </div>

            {/* Order Summary Sidebar (1 Col) */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-[0_12px_40px_rgba(0,0,0,0.06)] space-y-6">
                <h3 className="font-montserrat font-black text-lg text-[#111C2D] border-b border-black/5 pb-3 flex items-center justify-between">
                  <span>{t("cart.summary_title", "Resumen de Compra")}</span>
                  <span className="text-xs font-normal text-[#4C4546] font-mono">
                    ({cart.length} {cart.length === 1 ? t("cart.item_singular", "ítem") : t("cart.item_plural", "ítems")})
                  </span>
                </h3>

                {/* Subtotals */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-[#4C4546] font-medium">
                    <span>{t("cart.subtotal_cop", "Subtotal Partituras (COP)")}:</span>
                    <span className="font-bold text-[#111C2D]">
                      $ {totalCOP.toLocaleString(language === "en" ? "en-US" : "es-CO")} COP
                    </span>
                  </div>

                  <div className="flex justify-between text-[#4C4546] font-medium">
                    <span>{t("cart.subtotal_usd", "Subtotal en Dólares (USD)")}:</span>
                    <span className="font-bold text-[#111C2D]">
                      ~${totalUSD.toFixed(2)} USD
                    </span>
                  </div>

                  <div className="flex justify-between text-[#4C4546] font-medium">
                    <span>{t("cart.legal_stamp_label", "Estampa Legal Digital")}:</span>
                    <span className="text-emerald-700 font-bold uppercase text-[10px]">
                      {t("cart.included_free", "Incluida (Gratis)")}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-800 font-bold bg-emerald-50 p-2 rounded-lg">
                      <span>{t("cart.discount_label", "Descuento")} ({discount}%):</span>
                      <span>-$ {discountAmountCOP.toLocaleString(language === "en" ? "en-US" : "es-CO")} COP</span>
                    </div>
                  )}
                </div>

                {/* Coupon Input */}
                <form onSubmit={applyCoupon} className="space-y-2 pt-2 border-t border-black/5">
                  <label className="block text-[11px] font-montserrat font-bold text-[#111C2D]">
                    {t("cart.coupon_label", "¿Tienes un Cupón de Descuento?")}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ej. PIANO2026"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 bg-[#F0F3FF] border-none rounded-xl px-3 py-2 text-xs text-[#111C2D] font-mono uppercase focus:ring-2 focus:ring-[#0071BC] outline-none"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-[#111C2D] hover:bg-[#0071BC] text-white text-xs font-montserrat font-bold rounded-xl transition shrink-0 cursor-pointer"
                    >
                      {t("cart.apply_btn", "Aplicar")}
                    </button>
                  </div>
                  {couponMessage && (
                    <p
                      className={`text-[11px] font-bold ${
                        couponMessage.type === "success" ? "text-emerald-700" : "text-[#C1272D]"
                      }`}
                    >
                      {couponMessage.text}
                    </p>
                  )}
                </form>

                {/* Total */}
                <div className="bg-[#F0F3FF] p-4 rounded-2xl border border-black/5 space-y-1">
                  <div className="text-[11px] font-extrabold uppercase font-montserrat tracking-wider text-[#4C4546]">
                    {t("cart.total_to_pay", "Total a Pagar")}:
                  </div>
                  <div className="text-2xl font-black font-montserrat text-[#111C2D]">
                    $ {finalTotalCOP.toLocaleString(language === "en" ? "en-US" : "es-CO")} COP
                  </div>
                  <div className="text-xs text-[#0071BC] font-extrabold font-montserrat">
                    ~${finalTotalUSD.toFixed(2)} USD
                  </div>
                </div>

                {/* Checkout CTA */}
                <Link
                  href="/checkout"
                  className="w-full py-4 bg-[#FBB03B] hover:bg-[#e09b2d] text-[#111C2D] font-montserrat font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <span>{t("cart.proceed_checkout", "Proceder al Checkout Seguro")}</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </Link>

                {/* Payment Methods Badges */}
                <div className="pt-2 text-center space-y-2">
                  <span className="text-[10px] text-[#4C4546] font-semibold block font-montserrat">
                    {t("cart.payment_methods_title", "PASARELAS DE PAGO DISPONIBLES:")}
                  </span>
                  <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-[#4C4546]">
                    <span className="px-2 py-1 bg-slate-100 rounded border border-black/5">Wompi (PSE)</span>
                    <span className="px-2 py-1 bg-slate-100 rounded border border-black/5">Bancolombia</span>
                    <span className="px-2 py-1 bg-slate-100 rounded border border-black/5">Nequi</span>
                    <span className="px-2 py-1 bg-slate-100 rounded border border-black/5">PayPal</span>
                  </div>
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
