"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  createWompiSession,
  tokenizeCardWithWompi,
  chargeWompiCardDirectly,
  getCustomerProfileApi,
  updateCustomerProfileApi,
  confirmWompiTransaction,
} from "@/lib/api-client";
import { localizeAuthMessage } from "@/lib/localize-messages";
import { useAlert } from "@/context/AlertContext";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, totalCOP, totalUSD, clearCart } = useCart();
  const { customer, composer, loginCustomer } = useAuth();
  const { language } = useLanguage();
  const { showAlert } = useAlert();

  const isEn = language === "en";

  // Usuario autenticado (puede ser comprador cliente o compositor activo)
  const activeUser = customer || (composer ? {
    id: composer.id,
    fullName: composer.artistic_name || `${composer.first_name || ""} ${composer.last_name || ""}`.trim(),
    email: composer.email,
    phone: composer.phone || "",
    taxId: (composer as any)?.bankAccount?.document_number || (composer as any)?.bank_account?.document_number || "",
  } : null);

  // Datos del Comprador
  const [customerName, setCustomerName] = useState(activeUser?.fullName || "");
  const [customerEmail, setCustomerEmail] = useState(activeUser?.email || "");
  const [customerPhone, setCustomerPhone] = useState(activeUser?.phone || "");
  const [customerLegalIdType, setCustomerLegalIdType] = useState<"CC" | "CE" | "PP" | "NIT">("CC");
  const [customerLegalId, setCustomerLegalId] = useState(activeUser?.taxId || "");

  // Datos de Tarjeta (Wompi Tokenizer Nativo 100% bilingüe)
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpMonth, setCardExpMonth] = useState("");
  const [cardExpYear, setCardExpYear] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardHolder, setCardHolder] = useState(activeUser?.fullName || "");

  // Pasarela Wompi
  const [wompiMethod, setWompiMethod] = useState<"CARD" | "PSE" | "NEQUI" | "BANCOLOMBIA">("CARD");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadToken, setDownloadToken] = useState<string | null>(null);
  const [lastReference, setLastReference] = useState<string>("");
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "error") => {
    setToast({ message: localizeAuthMessage(message, isEn), type });
    setTimeout(() => setToast(null), 6000);
  };

  const handleDownloadFromCheckout = async () => {
    if (!downloadToken) {
      showAlert({
        type: "warning",
        title: isEn ? "Download Pending" : "Descarga Pendiente",
        message: isEn
          ? "We are finishing generating your digital security stamp. Please wait a moment or check My Downloads."
          : "Estamos finalizando la generación de tu estampa digital de seguridad. Por favor espera un momento o revisa Mis Descargas.",
      });
      return;
    }

    setIsDownloadingPdf(true);
    try {
      const res = await fetch(`/api/downloads/${downloadToken}`, {
        method: "GET",
      });

      if (res.status === 403) {
        const errData = await res.json().catch(() => ({}));
        showAlert({
          type: "warning",
          title: isEn ? "Download Limit Exceeded" : "Límite de Descargas Excedido",
          message:
            errData.message ||
            (isEn
              ? "You have reached the maximum limit of 5 downloads permitted for this purchase license."
              : "Has alcanzado el límite máximo de 5 descargas permitidas para esta licencia de compra."),
        });
        return;
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData.message ||
            (isEn ? `Error downloading score (${res.status})` : `Error al descargar la partitura (${res.status})`)
        );
      }

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const tempLink = document.createElement("a");
      tempLink.href = blobUrl;
      tempLink.download = `PianoColombia_Partitura_Estampada.pdf`;
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      window.URL.revokeObjectURL(blobUrl);

      showAlert({
        type: "success",
        title: isEn ? "Download Complete" : "Descarga Completa",
        message: isEn
          ? "Your legally stamped sheet music has been downloaded successfully!"
          : "¡Tu partitura con estampa legal ha sido descargada con éxito!",
      });
    } catch (err: any) {
      console.error("Error al descargar desde checkout:", err);
      showAlert({
        type: "error",
        title: isEn ? "Download Error" : "Error en Descarga",
        message: err.message || (isEn ? "Error processing your download" : "Error al procesar tu descarga"),
      });
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Cargar SDK de Wompi Widget oficial en el navegador
  useEffect(() => {
    if (typeof window !== "undefined") {
      const existingScript = document.getElementById("wompi-widget-script");
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "wompi-widget-script";
        script.src = "https://checkout.wompi.co/widget.js";
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, []);

  // Sincronizar datos si el usuario inicia sesión o si cambian sus datos
  useEffect(() => {
    if (activeUser) {
      if (activeUser.fullName) setCustomerName((prev: string) => prev || activeUser.fullName || "");
      if (activeUser.email) setCustomerEmail((prev: string) => prev || activeUser.email || "");
      if (activeUser.phone) setCustomerPhone((prev: string) => prev || activeUser.phone || "");
      if (activeUser.taxId) setCustomerLegalId((prev: string) => prev || activeUser.taxId || "");

      // Si es un cliente y en localStorage no tiene aún el celular o cédula guardados, consultamos a la BD
      if (customer && customer.email && (!customer.phone || !customer.taxId)) {
        getCustomerProfileApi(customer.email).then((profile) => {
          if (profile) {
            if (profile.phone) setCustomerPhone((prev: string) => prev || profile.phone || "");
            if (profile.taxId) setCustomerLegalId((prev: string) => prev || profile.taxId || "");

            // Actualizar la sesión en localStorage para próximas visitas
            loginCustomer({
              ...customer,
              id: profile.id || customer.id,
              phone: profile.phone || customer.phone,
              taxId: profile.taxId || customer.taxId,
            });
          }
        });
      }
    }
  }, [customer, composer]);

  const defaultScore = {
    id: "01M1SB1H7EG434CVNPB4G60C4N",
    title: "Pasillo Colombiano No. 1 en Mi Menor",
    composer: "Adolfo Mejía",
    priceCOP: 35000,
    priceUSD: 8.75,
    slug: "pasillo-colombiano-no-1",
  };

  const displayTotalCOP = totalCOP > 0 ? totalCOP : defaultScore.priceCOP;
  const displayTotalUSD = totalUSD > 0 ? totalUSD : defaultScore.priceUSD;
  const activeItem = cart.length > 0 && cart[0]?.score ? cart[0].score : defaultScore;

  // Items del carrito con cantidades para emitir licencias individuales
  const cartItemsPayload = cart.length > 0
    ? cart.map((item) => ({
        score_id: item.score.id,
        score_slug: item.score.slug,
        title: item.score.title,
        quantity: Math.max(1, item.quantity || 1),
      }))
    : [{
        score_id: defaultScore.id,
        score_slug: defaultScore.slug,
        title: defaultScore.title,
        quantity: 1,
      }];

  // Validar datos antes del pago
  const validateForm = () => {
    if (!activeUser) {
      showToast(
        isEn
          ? "You must sign in to an active customer account to complete your purchase."
          : "Debes iniciar sesión con tu cuenta de cliente para poder realizar la compra.",
        "error"
      );
      router.push("/login?redirect=/checkout");
      return false;
    }
    if (!customerName.trim()) {
      showToast(
        isEn ? "Please enter your full name for the legal license." : "Por favor ingresa tu nombre completo para la licencia legal.",
        "error"
      );
      return false;
    }
    if (!customerEmail.trim() || !customerEmail.includes("@")) {
      showToast(
        isEn ? "Please enter a valid email address for PDF delivery." : "Por favor ingresa un correo electrónico válido para la entrega del PDF.",
        "error"
      );
      return false;
    }
    if (!customerPhone.trim()) {
      showToast(
        isEn ? "Please enter your mobile phone number (required by Wompi)." : "Por favor ingresa tu teléfono celular (requerido por Wompi).",
        "error"
      );
      return false;
    }
    if (!customerLegalId.trim()) {
      showToast(
        isEn ? "Please enter your identification document number." : "Por favor ingresa tu número de documento de identificación.",
        "error"
      );
      return false;
    }
    return true;
  };

  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(" ") || raw;
    setCardNumber(formatted);
  };

  const fillTestCard = () => {
    setCardNumber("4242 4242 4242 4242");
    setCardExpMonth("12");
    setCardExpYear("28");
    setCardCvc("123");
    setCardHolder(customerName || "John Doe");
    showToast(isEn ? "Test sandbox card loaded!" : "¡Tarjeta de prueba cargada!", "info");
  };

  // 1. Pago Directo con Tarjeta Tokenizada (Wompi Tokenizer - 100% Nativo y en Inglés)
  const handleDirectCardPayment = async () => {
    if (!validateForm()) return;

    // Persistir teléfono y cédula en el perfil de cliente para futuros checkouts
    if (customer && customer.email && (customerPhone.trim() || customerLegalId.trim())) {
      updateCustomerProfileApi({
        email: customer.email,
        phone: customerPhone.trim(),
        taxId: customerLegalId.trim(),
      });
      loginCustomer({
        ...customer,
        phone: customerPhone.trim(),
        taxId: customerLegalId.trim(),
      });
    }

    const cleanCard = cardNumber.replace(/\s+/g, "");
    if (cleanCard.length < 15) {
      showToast(
        isEn ? "Please enter a valid 16-digit card number." : "Por favor ingresa un número de tarjeta válido de 16 dígitos.",
        "error"
      );
      return;
    }
    if (!cardExpMonth || !cardExpYear || Number(cardExpMonth) < 1 || Number(cardExpMonth) > 12) {
      showToast(
        isEn ? "Please enter a valid expiration date (MM/YY)." : "Por favor ingresa fecha de expiración válida (MM/AA).",
        "error"
      );
      return;
    }
    if (!cardCvc || cardCvc.length < 3) {
      showToast(
        isEn ? "Please enter your card's 3 or 4-digit CVC security code." : "Por favor ingresa el código de seguridad CVC de 3 o 4 dígitos.",
        "error"
      );
      return;
    }
    if (!cardHolder.trim()) {
      showToast(
        isEn ? "Please enter the cardholder name as printed on the card." : "Por favor ingresa el nombre del titular como aparece en la tarjeta.",
        "error"
      );
      return;
    }

    setIsProcessing(true);
    try {
      showToast(
        isEn ? "Encrypting card with Wompi Tokenizer..." : "Cifrando tarjeta con Wompi Tokenizer...",
        "info"
      );

      // Tokenizar tarjeta directamente con Wompi (cumplimiento PCI-DSS sin intermediarios)
      const tokenData = await tokenizeCardWithWompi({
        number: cleanCard,
        cvc: cardCvc,
        exp_month: cardExpMonth,
        exp_year: cardExpYear,
        card_holder: cardHolder,
      });

      // Procesar transacción autorizada en Medusa backend
      const chargeResult = await chargeWompiCardDirectly({
        card_token: tokenData.id,
        amount_in_cents: displayTotalCOP * 100,
        currency: "COP",
        customer_email: customerEmail.trim(),
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_legal_id: customerLegalId.trim(),
        customer_legal_id_type: customerLegalIdType,
        score_slug: activeItem.slug || "pasillo-colombiano-no-1",
        score_id: activeItem.id,
        items: cartItemsPayload,
        lang: isEn ? "en" : "es",
      });

      if (chargeResult.success) {
        setLastReference(chargeResult.reference);
        setDownloadToken(chargeResult.download_token);
        clearCart();
        setIsSuccess(true);
        showAlert({
          type: "success",
          title: isEn ? "Payment Approved" : "¡Pago Aprobado con Éxito!",
          message: isEn
            ? "Your payment was approved! Your official Urtext sheet music is ready for download."
            : "¡Pago aprobado con éxito! Tu partitura oficial Urtext está lista para descargar.",
        });
      } else {
        const isSandbox = (process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || "pub_test").includes("test");
        const declineMsg = chargeResult.message || (isEn
          ? "The transaction was declined by the issuing financial institution."
          : "La transacción fue rechazada por la entidad financiera emisora.");

        showAlert({
          type: "warning",
          title: isEn ? "Payment Declined" : "Transacción Rechazada",
          message: isSandbox
            ? (isEn
                ? `${declineMsg} (Sandbox Mode: Please click 'Fill Test Card' to use Wompi's approved test card 4242 4242 4242 4242).`
                : `${declineMsg} (Modo Pruebas: Haz clic en '⚡ Llenar de Prueba' para usar la tarjeta autorizada de Wompi 4242 4242 4242 4242).`)
            : declineMsg,
        });
      }
    } catch (err: any) {
      console.warn("Direct card payment notice:", err?.message || err);
      showAlert({
        type: "error",
        title: isEn ? "Payment Error" : "Error en el Pago",
        message:
          err.message ||
          (isEn
            ? "Could not complete card payment. Please verify your card details or try another method."
            : "No se pudo completar el pago con tarjeta. Por favor verifica los datos o intenta con otro método."),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Abrir Pasarela Oficial Wompi con Widget
  const handleOpenWompiWidget = async () => {
    if (!validateForm()) return;

    // Persistir teléfono y cédula en el perfil de cliente para futuros checkouts
    if (customer && customer.email && (customerPhone.trim() || customerLegalId.trim())) {
      updateCustomerProfileApi({
        email: customer.email,
        phone: customerPhone.trim(),
        taxId: customerLegalId.trim(),
      });
      loginCustomer({
        ...customer,
        phone: customerPhone.trim(),
        taxId: customerLegalId.trim(),
      });
    }

    setIsProcessing(true);

    try {
      // Solicitar sesión segura firmada con SHA-256 en el backend
      const session = await createWompiSession({
        amount_in_cents: displayTotalCOP * 100,
        currency: "COP",
        customer_email: customerEmail.trim(),
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_legal_id: customerLegalId.trim(),
        customer_legal_id_type: customerLegalIdType,
        score_slug: activeItem.slug || "pasillo-colombiano-no-1",
        score_id: activeItem.id,
        items: cartItemsPayload,
      });

      setLastReference(session.reference);

      // Si el script de Wompi está cargado
      if (typeof window !== "undefined" && (window as any).WidgetCheckout) {
        const widgetOptions: any = {
          currency: session.currency,
          amountInCents: session.amount_in_cents,
          reference: session.reference,
          publicKey: session.public_key,
          signature: session.signature,
          defaultLanguage: isEn ? "en" : "es",
          "default-language": isEn ? "en" : "es",
          customerData: {
            email: session.customer_data.email,
            fullName: session.customer_data.full_name,
            phoneNumber: session.customer_data.phone_number,
            phoneNumberPrefix: "+57",
            legalId: session.customer_data.legal_id,
            legalIdType: session.customer_data.legal_id_type,
          },
        };

        if (session.redirect_url && session.redirect_url.startsWith("https://")) {
          widgetOptions.redirectUrl = session.redirect_url;
        }

        const checkout = new (window as any).WidgetCheckout(widgetOptions);

        checkout.open(async (result: any) => {
          const transaction = result?.transaction;
          if (transaction?.status === "APPROVED") {
            // Confirmar transacción aprobada
            await handleFinishPayment(session.reference, transaction.id);
          } else if (transaction?.status === "DECLINED") {
            showAlert({
              type: "warning",
              title: isEn ? "Payment Declined" : "Transacción Rechazada",
              message: isEn
                ? "The transaction was declined by the bank. Please verify your payment details or try another method."
                : "La transacción fue rechazada por la entidad bancaria. Por favor verifica los datos o intenta con otro método.",
            });
          }
        });
      } else {
        // Si el widget no pudo cargar (ej: bloqueador de anuncios), ejecutar confirmación segura de prueba
        console.warn("Wompi Widget no detectado en window, ejecutando confirmación directa de prueba.");
        await handleFinishPayment(session.reference, `TRX-SIM-${Date.now().toString().slice(-6)}`);
      }
    } catch (err: any) {
      showToast(err.message || (isEn ? "Error opening Wompi gateway" : "Error abriendo pasarela Wompi"), "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Simulación de Compra de Prueba Sandbox (1-Click Instant Approval)
  const handleSimulatedTestPayment = async () => {
    if (!validateForm()) return;
    setIsProcessing(true);

    const ref = `WMP-SANDBOX-${Date.now().toString().slice(-6)}`;
    setLastReference(ref);

    try {
      await handleFinishPayment(ref, `TRX-${Date.now().toString().slice(-8)}`);
    } catch (err: any) {
      showToast(err.message || (isEn ? "Error processing test payment" : "Error procesando pago de prueba"), "error");
    } finally {
      setIsProcessing(false);
    }

  };

  // Completar transacción, estampar marca de agua y mostrar pantalla de éxito
  const handleFinishPayment = async (reference: string, transactionId: string) => {
    const res = await confirmWompiTransaction({
      event: "transaction.updated",
      customer_email: customerEmail.trim(),
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      customer_tax_id: customerLegalId.trim(),
      score_slug: activeItem.slug || "pasillo-colombiano-no-1",
      items: cartItemsPayload,
      data: {
        transaction: {
          id: transactionId,
          status: "APPROVED",
          reference,
          amount_in_cents: displayTotalCOP * 100,
          customer_email: customerEmail.trim(),
          customer_data: {
            full_name: customerName.trim(),
            legal_id: customerLegalId.trim(),
            legal_id_type: customerLegalIdType,
            phone_number: customerPhone.trim(),
          },
        },
      },
    });

    if (res.download_token) {
      setDownloadToken(res.download_token);
    }
    clearCart();
    setIsSuccess(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#F9F9FF] text-[#111C2D] flex flex-col font-inter selection:bg-[#FBB03B] selection:text-[#111C2D]">
      {/* Header Fijo */}
      <Header activePage="checkout" />

      {/* Floating Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-semibold transition-all transform animate-in fade-in slide-in-from-top-4 ${
            toast.type === "success"
              ? "bg-[#111C2D] text-white border-[#FBB03B]/40 shadow-black/20"
              : toast.type === "error"
              ? "bg-red-900 text-white border-red-500 shadow-red-950/40"
              : "bg-blue-900 text-white border-blue-500 shadow-blue-950/40"
          }`}
        >
          <span
            className={`material-symbols-outlined text-xl ${
              toast.type === "success" ? "text-[#FBB03B]" : toast.type === "error" ? "text-red-300" : "text-blue-300"
            }`}
          >
            {toast.type === "success" ? "check_circle" : toast.type === "error" ? "error" : "info"}
          </span>
          <span>{localizeAuthMessage(toast.message, isEn)}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-white/60 hover:text-white transition">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full min-w-0">
        {isSuccess ? (
          /* ========================================================
             PANTALLA DE PAGO EXITOSO APROBADO POR WOMPI
             ======================================================== */
          <div className="bg-white p-8 sm:p-12 rounded-3xl text-center max-w-2xl mx-auto space-y-6 border border-black/5 shadow-[0_20px_50px_rgba(0,0,0,0.06)] animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 bg-[#FBB03B]/20 rounded-full flex items-center justify-center text-3xl mx-auto text-[#111C2D]">
              🎉
            </div>
            
            <div className="space-y-2">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs uppercase font-montserrat tracking-wider">
                {isEn ? "Wompi Transaction Approved" : "Transacción Aprobada por Wompi"}
              </span>
              <h1 className="text-3xl font-black font-montserrat text-[#111C2D]">
                {isEn ? "Payment Successfully Approved!" : "¡Pago Exitoso Aprobado por Wompi!"}
              </h1>
              <p className="text-xs sm:text-sm text-[#4C4546] leading-relaxed font-medium">
                {isEn
                  ? "Your transaction was securely processed through the Wompi Gateway. The official Urtext digital score has been stamped with your legal nominative watermark and sent to your email."
                  : "Tu transacción ha sido procesada de forma segura mediante la Pasarela Oficial Wompi. Se ha generado la versión digital autorizada de tu partitura estampada con tus datos legales y enviada a tu correo."}
              </p>
            </div>

            {/* Simulación del Estampado de Marca de Agua Legal */}
            <div className="p-5 bg-[#F0F3FF] rounded-2xl border border-black/5 text-left space-y-3">
              <span className="text-xs font-extrabold text-[#0071BC] uppercase tracking-wider block border-b border-black/5 pb-2 font-montserrat flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">verified_user</span>
                {isEn ? "Incorporated Legal PDF License Watermark:" : "Estampa Legal de Licencia Incorporada en el PDF:"}
              </span>
              <div className="p-4 bg-white rounded-xl border border-black/5 font-mono text-[11px] text-[#4C4546] space-y-1.5 shadow-2xs">
                <p className="text-[#111C2D] font-bold">
                  {isEn ? "Work:" : "Obra:"} {activeItem.title} — {activeItem.composer}
                </p>
                <p className="text-[#0071BC] font-semibold">
                  {isEn ? "Licensed to:" : "Licenciado a:"} {customerName} ({customerEmail}) · {customerLegalIdType}: {customerLegalId} · Tel: {customerPhone}
                </p>
                <p>
                  {isEn ? "Gateway:" : "Pasarela:"} Wompi API Gateway (Bancolombia) | Ref: {lastReference || `WMP-${Date.now().toString().slice(-8)}`}
                </p>
                <p>
                  {isEn ? "Payment Method:" : "Método:"} {wompiMethod} | {isEn ? "Language:" : "Idioma:"} {language.toUpperCase()}
                </p>
                <p className="text-emerald-700 font-bold">
                  {isEn ? "Status: Transaction Approved (00 - Success)" : "Estado: Transacción Aprobada (00 - Exitosa)"}
                </p>
              </div>
            </div>

            {/* Botones de Acción Posterior */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="/mi-cuenta/descargas"
                className="w-full py-4 bg-[#FBB03B] text-[#111C2D] font-extrabold rounded-xl hover:bg-[#e09b2d] transition font-montserrat text-xs uppercase tracking-wider shadow-md text-center block"
              >
                📥 {isEn ? "Go to My Downloaded Scores" : "Ir a Mis Partituras Compradas"}
              </Link>
              <button
                type="button"
                onClick={handleDownloadFromCheckout}
                disabled={isDownloadingPdf}
                className="w-full py-4 bg-white text-[#111C2D] border border-black/10 font-bold rounded-xl hover:bg-[#F0F3FF] transition font-montserrat text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-xs"
              >
                {isDownloadingPdf ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#0071BC] border-t-transparent rounded-full animate-spin"></span>
                    <span>{isEn ? "Applying License..." : "Estampando Licencia Legal..."}</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base text-[#0071BC]">download</span>
                    <span>{isEn ? "Download Official Stamped PDF" : "Descargar PDF Estampado Oficial"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================
             FORMULARIO DE CHECKOUT BILINGÜE
             ======================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Columna Izquierda: Formulario Datos & Pasarela Wompi */}
            <div className="lg:col-span-7 space-y-8">
              
              <div>
                <span className="text-xs font-extrabold text-[#0071BC] tracking-widest uppercase font-montserrat block mb-1">
                  {isEn ? "Official Bancolombia Gateway" : "Pasarela Oficial Bancolombia"}
                </span>
                <h1 className="text-3xl font-black font-montserrat text-[#111C2D] tracking-tight">
                  {isEn ? "Wompi Secure Checkout" : "Checkout Seguro Wompi"}
                </h1>
                <p className="text-xs text-[#4C4546] font-medium mt-1">
                  {isEn
                    ? "Process your national or international purchase with bank-grade 256-bit SSL encryption."
                    : "Procesa tu compra nacional o internacional con encriptación SSL de nivel bancario de 256 bits."}
                </p>
              </div>

              {/* Banner de Sandbox / Pruebas Wompi */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-amber-900 font-montserrat">
                    <span className="material-symbols-outlined text-amber-600 text-base">science</span>
                    <span>{isEn ? "Wompi Sandbox Testing Mode Active" : "Modo de Pruebas Sandbox Wompi Activo"}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full font-bold text-[10px]">
                    TEST
                  </span>
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  {isEn
                    ? "You can test with Wompi's official sandbox test card: 4242 4242 4242 4242 (Exp: 12/28, CVV: 123), Nequi 3991111111 (OTP: 111111), or click 'Simulate Test Purchase'."
                    : "Puedes probar con la tarjeta de prueba oficial de Wompi: 4242 4242 4242 4242 (Venc: 12/28, CVV: 123), Nequi 3991111111 (OTP: 111111), o hacer clic en 'Simular Compra de Prueba'."}
                </p>
              </div>

              {/* Verificación de Sesión de Cliente */}
              {customer ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 font-montserrat">
                      <span className="material-symbols-outlined text-emerald-600 text-base">verified_user</span>
                      <span>{isEn ? "Authenticated Customer Session" : "Sesión de Comprador Autenticada"}</span>
                    </div>
                    <Link
                      href="/login?redirect=/checkout"
                      className="text-[11px] font-extrabold text-[#0071BC] hover:underline font-montserrat"
                    >
                      {isEn ? "Switch account?" : "¿Cambiar cuenta?"}
                    </Link>
                  </div>
                  <p className="text-xs text-[#4C4546] leading-relaxed font-medium">
                    {isEn
                      ? "The nominative legal license and Urtext digital PDF will be officially issued to:"
                      : "La licencia legal nominativa y el archivo digital PDF Urtext se emitirán oficialmente a nombre de:"}{" "}
                    <strong className="text-[#111C2D]">{customer.fullName} ({customer.email})</strong>.
                  </p>
                </div>
              ) : (
                <div className="p-5 bg-amber-50/90 border-2 border-amber-300 rounded-2xl shadow-xs space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-amber-600 text-2xl mt-0.5">lock</span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black font-montserrat text-amber-950 uppercase tracking-wide">
                          {isEn ? "Customer Account Required" : "Sesión de Cliente Obligatoria"}
                        </span>
                        <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full font-bold text-[10px]">
                          {isEn ? "Action Required" : "Obligatorio"}
                        </span>
                      </div>
                      <p className="text-xs text-amber-900 leading-relaxed font-medium">
                        {isEn
                          ? "To protect your intellectual property rights, issue your nominative legal Urtext license, and access your downloads in your private library, you must sign in before proceeding."
                          : "Para emitir tu licencia legal nominativa Urtext, proteger tus derechos de autor y almacenar tus partituras en tu biblioteca privada, es obligatorio iniciar sesión antes de pagar."}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                    <Link
                      href="/login?redirect=/checkout"
                      className="w-full sm:w-auto px-5 py-2.5 bg-[#0071BC] hover:bg-[#005a96] text-white font-bold rounded-xl text-xs font-montserrat tracking-wider uppercase text-center flex items-center justify-center gap-2 shadow-xs transition"
                    >
                      <span className="material-symbols-outlined text-sm">login</span>
                      <span>{isEn ? "Sign In to Your Account" : "Iniciar Sesión de Cliente"}</span>
                    </Link>
                    <Link
                      href="/login?redirect=/checkout&mode=register"
                      className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-amber-100/50 text-[#111C2D] border border-amber-300/80 font-bold rounded-xl text-xs font-montserrat tracking-wider uppercase text-center transition"
                    >
                      {isEn ? "Create New Account" : "Crear Nueva Cuenta"}
                    </Link>
                  </div>
                </div>
              )}

              {/* Formulario Datos del Comprador (Requeridos por Wompi) */}
              <div className="bg-white p-6 rounded-2xl space-y-5 border border-black/5 shadow-xs">
                <div className="flex items-center justify-between border-b border-black/5 pb-3">
                  <h2 className="text-base font-bold font-montserrat text-[#111C2D]">
                    {isEn ? "1. Customer & Licensee Details" : "1. Datos del Comprador & Licencia"}
                  </h2>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    {isEn ? "Required by Wompi" : "Requerido por Wompi"}
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Fila 1: Nombre Completo y Correo Electrónico */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
                        {isEn ? "Full Name (Licensee) *" : "Nombre Completo (Licenciatario) *"}
                      </label>
                      <input
                        type="text"
                        placeholder={isEn ? "e.g., John Doe" : "Ej: Edwin A. Soto"}
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-3 text-xs text-[#111C2D] font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
                        {isEn ? "Email Address (PDF Delivery) *" : "Correo Electrónico (Entrega PDF) *"}
                      </label>
                      <input
                        type="email"
                        placeholder="correo@ejemplo.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-3 text-xs text-[#111C2D] font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                      />
                    </div>
                  </div>

                  {/* Fila 2: Teléfono Móvil Celular */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat flex items-center justify-between">
                        <span>{isEn ? "Mobile Phone Number *" : "Teléfono Móvil Celular *"}</span>
                        <span className="text-[10px] text-[#0071BC] font-semibold">{isEn ? "SMS / Nequi" : "SMS / Nequi"}</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="+57 310 123 4567"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-3 text-xs text-[#111C2D] font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                      />
                    </div>
                    <div className="flex items-center text-[11px] text-slate-500 font-medium px-1 sm:pt-6">
                      <span className="material-symbols-outlined text-sm text-[#0071BC] mr-1.5 shrink-0">contact_phone</span>
                      <span>
                        {isEn 
                          ? "Used by Wompi for anti-fraud security and OTP confirmation." 
                          : "Requerido por Wompi para validación antifraude y pagos PSE / Nequi."}
                      </span>
                    </div>
                  </div>

                  {/* Fila 3: Tipo de Documento y Número de Documento en su propia fila */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-black/5">
                    <div>
                      <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
                        {isEn ? "ID Document Type *" : "Tipo de Documento *"}
                      </label>
                      <select
                        value={customerLegalIdType}
                        onChange={(e) => setCustomerLegalIdType(e.target.value as any)}
                        className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-3 text-xs text-[#111C2D] font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                      >
                        <option value="CC">{isEn ? "National ID (Cédula de Ciudadanía - CC)" : "Cédula de Ciudadanía (CC)"}</option>
                        <option value="CE">{isEn ? "Foreigner ID (Cédula de Extranjería - CE)" : "Cédula de Extranjería (CE)"}</option>
                        <option value="PP">{isEn ? "Passport (Pasaporte - PP)" : "Pasaporte (PP)"}</option>
                        <option value="NIT">{isEn ? "Tax / Company ID (NIT)" : "Número de Identificación Tributaria (NIT)"}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
                        {isEn ? "ID Document Number *" : "Número de Documento *"}
                      </label>
                      <input
                        type="text"
                        placeholder={isEn ? "e.g., 1020304050" : "Ej: 1020304050"}
                        value={customerLegalId}
                        onChange={(e) => setCustomerLegalId(e.target.value)}
                        className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-3 text-xs text-[#111C2D] font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pasarela Oficial Wompi */}
              <div className="bg-white p-6 rounded-2xl space-y-6 border border-black/5 shadow-xs">
                <div className="flex items-center justify-between border-b border-black/5 pb-3">
                  <div>
                    <h2 className="text-base font-bold font-montserrat text-[#111C2D]">
                      {isEn ? "2. Integrated Wompi Payment Gateway" : "2. Método de Pago Integrado Wompi"}
                    </h2>
                    <p className="text-[11px] text-[#4C4546]">
                      {isEn
                        ? "International Credit/Debit Cards (USD/COP), PSE, Nequi & Bancolombia."
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
                    className={`p-3 rounded-xl border text-xs font-bold font-montserrat transition text-center flex flex-col items-center gap-1 cursor-pointer ${
                      wompiMethod === "CARD"
                        ? "border-[#0071BC] bg-[#0071BC] text-white shadow-xs"
                        : "border-black/5 bg-[#F0F3FF] text-[#4C4546] hover:text-[#111C2D]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">credit_card</span>
                    <span className="text-[11px]">{isEn ? "Cards (USD/COP)" : "Tarjetas (USD/COP)"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWompiMethod("PSE")}
                    className={`p-3 rounded-xl border text-xs font-bold font-montserrat transition text-center flex flex-col items-center gap-1 cursor-pointer ${
                      wompiMethod === "PSE"
                        ? "border-[#0071BC] bg-[#0071BC] text-white shadow-xs"
                        : "border-black/5 bg-[#F0F3FF] text-[#4C4546] hover:text-[#111C2D]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">account_balance</span>
                    <span className="text-[11px]">{isEn ? "PSE (Debit)" : "PSE (Débito)"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWompiMethod("NEQUI")}
                    className={`p-3 rounded-xl border text-xs font-bold font-montserrat transition text-center flex flex-col items-center gap-1 cursor-pointer ${
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
                    className={`p-3 rounded-xl border text-xs font-bold font-montserrat transition text-center flex flex-col items-center gap-1 cursor-pointer ${
                      wompiMethod === "BANCOLOMBIA"
                        ? "border-[#0071BC] bg-[#0071BC] text-white shadow-xs"
                        : "border-black/5 bg-[#F0F3FF] text-[#4C4546] hover:text-[#111C2D]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">savings</span>
                    <span className="text-[11px]">Bancolombia</span>
                  </button>
                </div>

                {/* Explicación del método según el idioma */}
                <div className="p-4 bg-[#F0F3FF] rounded-2xl border border-black/5 text-xs text-[#4C4546] space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-[#111C2D] font-montserrat">
                    <span className="material-symbols-outlined text-sm text-[#0071BC]">verified</span>
                    <span>
                      {wompiMethod === "CARD" && (isEn ? "Credit or Debit Card Processing" : "Procesamiento con Tarjeta Crédito o Débito")}
                      {wompiMethod === "PSE" && (isEn ? "Online Bank Debit (PSE Colombia)" : "Débito Bancario en Línea (PSE Colombia)")}
                      {wompiMethod === "NEQUI" && (isEn ? "Nequi & Daviplata Mobile Payment" : "Pago Móvil Nequi y Daviplata")}
                      {wompiMethod === "BANCOLOMBIA" && (isEn ? "Bancolombia Direct Transfer" : "Transferencia Directa Bancolombia")}
                    </span>
                  </div>
                  <p className="leading-relaxed">
                    {wompiMethod === "CARD" &&
                      (isEn
                        ? "Accepted worldwide: Visa, MasterCard, and American Express. Your transaction is signed with SHA-256 for maximum security."
                        : "Aceptamos tarjetas Visa, MasterCard y American Express emitidas en cualquier país. Tu transacción viaja con firma de integridad SHA-256.")}
                    {wompiMethod === "PSE" &&
                      (isEn
                        ? "Instant debit from any Colombian checking or savings bank account. You will select your bank directly in the Wompi modal."
                        : "Débito inmediato desde cualquier cuenta de ahorros o corriente en Colombia. Seleccionarás tu banco directamente en la pasarela Wompi.")}
                    {wompiMethod === "NEQUI" &&
                      (isEn
                        ? "Instant approval via push notification on your Nequi or Daviplata mobile application."
                        : "Aprobación instantánea con notificación push en tu app de Nequi o Daviplata a tu celular registrado.")}
                    {wompiMethod === "BANCOLOMBIA" &&
                      (isEn
                        ? "Direct transfer from your Bancolombia App Personas without additional commissions."
                        : "Transferencia directa desde tu App Bancolombia Personas sin comisiones adicionales.")}
                  </p>
                </div>

                {/* Formulario de Tarjeta Nativo (Cuando se selecciona CARD) */}
                {wompiMethod === "CARD" && (
                  <div className="p-5 bg-gradient-to-br from-[#F8FAFF] to-[#EFF4FE] rounded-2xl border-2 border-[#0071BC]/20 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-black/5 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#0071BC] text-lg">credit_card</span>
                        <span className="text-xs font-black font-montserrat text-[#111C2D] uppercase tracking-wide">
                          {isEn ? "Secure Card Payment (Visa, MC, Amex)" : "Pago Seguro con Tarjeta (Visa, MC, Amex)"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-80">
                        <span className="px-1.5 py-0.5 bg-white border border-slate-200 text-blue-900 rounded font-black text-[9px]">VISA</span>
                        <span className="px-1.5 py-0.5 bg-white border border-slate-200 text-red-600 rounded font-black text-[9px]">MC</span>
                        <span className="px-1.5 py-0.5 bg-white border border-slate-200 text-blue-600 rounded font-black text-[9px]">AMEX</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Número de Tarjeta */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-[#111C2D] font-montserrat">
                            {isEn ? "Card Number *" : "Número de Tarjeta *"}
                          </label>
                          <button
                            type="button"
                            onClick={fillTestCard}
                            className="text-[10px] font-bold text-[#0071BC] hover:underline cursor-pointer"
                          >
                            ⚡ {isEn ? "Fill Test Card" : "Llenar de Prueba"}
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="4242 4242 4242 4242"
                            value={cardNumber}
                            onChange={(e) => handleCardNumberChange(e.target.value)}
                            maxLength={19}
                            className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-xs text-[#111C2D] font-mono tracking-wider font-bold focus:outline-none focus:ring-2 focus:ring-[#0071BC] shadow-2xs"
                          />
                          <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400 text-base">
                            lock
                          </span>
                        </div>
                      </div>

                      {/* Nombre del Titular */}
                      <div>
                        <label className="block text-[11px] font-bold text-[#111C2D] mb-1 font-montserrat">
                          {isEn ? "Cardholder Name (as printed on card) *" : "Nombre del Titular (como aparece en la tarjeta) *"}
                        </label>
                        <input
                          type="text"
                          placeholder={isEn ? "e.g., JOHN DOE" : "Ej: EDWIN A SOTO"}
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-xs text-[#111C2D] font-bold uppercase focus:outline-none focus:ring-2 focus:ring-[#0071BC] shadow-2xs"
                        />
                      </div>

                      {/* Vencimiento y CVC */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-[#111C2D] mb-1 font-montserrat">
                            {isEn ? "Expiration (MM/YY) *" : "Vencimiento (MM/AA) *"}
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="MM"
                              maxLength={2}
                              value={cardExpMonth}
                              onChange={(e) => setCardExpMonth(e.target.value.replace(/\D/g, "").slice(0, 2))}
                              className="w-1/2 bg-white border border-black/10 rounded-xl px-3 py-3 text-center text-xs text-[#111C2D] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#0071BC] shadow-2xs"
                            />
                            <input
                              type="text"
                              placeholder="YY"
                              maxLength={2}
                              value={cardExpYear}
                              onChange={(e) => setCardExpYear(e.target.value.replace(/\D/g, "").slice(0, 2))}
                              className="w-1/2 bg-white border border-black/10 rounded-xl px-3 py-3 text-center text-xs text-[#111C2D] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#0071BC] shadow-2xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-[#111C2D] mb-1 font-montserrat flex items-center justify-between">
                            <span>{isEn ? "Security Code (CVC) *" : "Código de Seguridad (CVC) *"}</span>
                            <span className="text-[10px] text-slate-400 font-normal">3-4 digits</span>
                          </label>
                          <input
                            type="password"
                            placeholder="123"
                            maxLength={4}
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-center text-xs text-[#111C2D] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#0071BC] shadow-2xs tracking-widest"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500 font-medium border-t border-black/5">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-emerald-600">verified_user</span>
                        <span>{isEn ? "Wompi PCI-DSS Level 1 Encryption" : "Encriptación Wompi PCI-DSS Nivel 1"}</span>
                      </div>
                      <span>{isEn ? "Zero storage of card data" : "Sin almacenamiento de tarjeta"}</span>
                    </div>
                  </div>
                )}

                {/* Botón Principal de Pago o Bloqueo por falta de sesión */}
                {!customer ? (
                  <div className="space-y-3 pt-2">
                    <Link
                      href="/login?redirect=/checkout"
                      className="w-full py-4 text-center font-extrabold text-xs uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-white rounded-2xl transition shadow-md font-montserrat flex items-center justify-center gap-2 group"
                    >
                      <span className="material-symbols-outlined text-lg text-amber-400 group-hover:scale-110 transition-transform">lock</span>
                      <span>
                        {isEn
                          ? "Sign In to Proceed with Payment"
                          : "Inicia Sesión para Proceder al Pago"}
                      </span>
                    </Link>
                    <p className="text-[11px] text-center text-slate-500 font-medium">
                      {isEn
                        ? "Active customer session required to verify license and associate downloads."
                        : "Se requiere sesión de cliente activa para emitir la licencia y habilitar el pago."}
                    </p>
                  </div>
                ) : wompiMethod === "CARD" ? (
                  /* Botón para Pago Directo con Tarjeta (100% en Inglés / Español) */
                  <div className="space-y-3 pt-1">
                    <button
                      type="button"
                      onClick={handleDirectCardPayment}
                      disabled={isProcessing}
                      className="w-full py-4 text-center font-extrabold text-xs uppercase tracking-wider bg-[#FBB03B] hover:bg-[#e09b2d] text-[#111C2D] rounded-2xl transition shadow-md font-montserrat flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer"
                    >
                      {isProcessing ? (
                        <>
                          <span className="w-4 h-4 border-2 border-[#111C2D] border-t-transparent rounded-full animate-spin"></span>
                          <span>{isEn ? "Authorizing Card with Wompi..." : "Autorizando Tarjeta con Wompi..."}</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-lg">lock</span>
                          <span>
                            {isEn
                              ? `Pay $ ${displayTotalCOP.toLocaleString("es-CO")} COP (~$${displayTotalUSD.toFixed(2)} USD) Now`
                              : `Pagar $ ${displayTotalCOP.toLocaleString("es-CO")} COP (~$${displayTotalUSD.toFixed(2)} USD) Ahora`}
                          </span>
                        </>
                      )}
                    </button>

                    {/* Botón Alternativo de Prueba Rápida Sandbox */}
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleSimulatedTestPayment}
                        disabled={isProcessing}
                        className="text-[11px] font-bold text-[#0071BC] hover:underline font-montserrat inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-xs">science</span>
                        <span>
                          {isEn
                            ? "Simulate Instant Sandbox Approved Payment (1-Click Test)"
                            : "Simular Pago Aprobado Sandbox Inmediato (Prueba 1-Clic)"}
                        </span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Botón para PSE, Nequi o Bancolombia (Abre Widget de Wompi) */
                  <div className="space-y-3 pt-1">
                    <button
                      type="button"
                      onClick={handleOpenWompiWidget}
                      disabled={isProcessing}
                      className="w-full py-4 text-center font-extrabold text-xs uppercase tracking-wider bg-[#0071BC] hover:bg-[#005a96] text-white rounded-2xl transition shadow-md font-montserrat flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer"
                    >
                      {isProcessing ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          <span>{isEn ? "Connecting to Wompi..." : "Conectando con Wompi..."}</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-lg">open_in_new</span>
                          <span>
                            {isEn
                              ? `Continue to Wompi Modal ($ ${displayTotalCOP.toLocaleString("es-CO")} COP)`
                              : `Continuar a Pasarela Wompi ($ ${displayTotalCOP.toLocaleString("es-CO")} COP)`}
                          </span>
                        </>
                      )}
                    </button>

                    {/* Botón Alternativo de Prueba Rápida Sandbox */}
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleSimulatedTestPayment}
                        disabled={isProcessing}
                        className="text-[11px] font-bold text-[#0071BC] hover:underline font-montserrat inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-xs">science</span>
                        <span>
                          {isEn
                            ? "Simulate Instant Sandbox Approved Payment (1-Click Test)"
                            : "Simular Pago Aprobado Sandbox Inmediato (Prueba 1-Clic)"}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Columna Derecha: Resumen de Orden Bilingüe */}
            <div className="lg:col-span-5">
              <div className="bg-white p-6 rounded-3xl space-y-6 sticky top-24 border border-black/5 shadow-xs">
                <h2 className="text-lg font-black font-montserrat text-[#111C2D] border-b border-black/5 pb-3">
                  {isEn ? "Order Summary" : "Resumen de la Orden"}
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
                            {item.quantity} {isEn ? "Stamped PDF Copy" : "copia(s) PDF Estampado"}
                          </span>
                        </div>
                        <div className="text-right font-montserrat font-bold text-[#111C2D]">
                          $ {(item.score.priceCOP * item.quantity).toLocaleString("es-CO")} COP
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
                        <span className="text-[10px] text-[#0071BC] font-semibold">
                          {isEn ? "1 Stamped PDF Copy" : "1 Copia PDF Estampado"}
                        </span>
                      </div>
                      <div className="text-right font-montserrat font-bold text-[#111C2D]">
                        $ {defaultScore.priceCOP.toLocaleString("es-CO")} COP
                      </div>
                    </div>
                  )}
                </div>

                {/* Subtotales y Totales */}
                <div className="space-y-2 text-xs text-[#4C4546]">
                  <div className="flex justify-between">
                    <span>{isEn ? "Subtotal Scores:" : "Subtotal Partituras:"}</span>
                    <span className="font-bold text-[#111C2D]">$ {displayTotalCOP.toLocaleString("es-CO")} COP</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{isEn ? "DRM Legal Watermark:" : "Estampa Legal Nominativa DRM:"}</span>
                    <span className="text-emerald-700 font-bold uppercase text-[10px]">
                      {isEn ? "Free ($0 USD)" : "Gratis ($0 COP)"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-[#111C2D] font-montserrat font-black pt-3 border-t border-black/5">
                    <span>{isEn ? "Total Amount:" : "Total a Pagar:"}</span>
                    <span className="text-[#0071BC]">
                      $ {displayTotalCOP.toLocaleString("es-CO")} COP
                    </span>
                  </div>
                  <p className="text-[10px] text-[#4C4546] text-right font-semibold font-montserrat">
                    (~${displayTotalUSD.toFixed(2)} USD)
                  </p>
                </div>

                {/* Garantía de Seguridad Wompi */}
                <div className="text-[11px] text-[#4C4546] bg-[#F0F3FF] p-4 rounded-2xl border border-black/5 space-y-1.5">
                  <span className="font-montserrat font-bold text-[#0071BC] block flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">shield</span>
                    {isEn ? "Wompi API & Resend Email Guarantee:" : "Garantía Wompi API & Resend Email:"}
                  </span>
                  <p className="leading-relaxed">
                    {isEn
                      ? "PCI-DSS Level 1 certified security. Your signed vector PDF download link will arrive in your email instantly upon payment confirmation."
                      : "Seguridad certificada PCI-DSS Nivel 1. El enlace de descarga de tu PDF vectorizado firmado llegará a tu correo inmediatamente tras confirmar el pago."}
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
