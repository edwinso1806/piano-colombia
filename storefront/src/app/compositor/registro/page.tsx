"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";
import {
  sendComposerOtpApi,
  verifyComposerOtpApi,
  getCmsLegalsApi,
  CmsLegalSettings,
  CmsLegalDocument,
  DEFAULT_CMS_LEGAL_SETTINGS,
} from "@/lib/api-client";
import {
  getCountries,
  getStatesByCountry,
  getCitiesByState,
  CountryItem,
  StateItem,
  CityItem,
  WORLD_COUNTRIES,
} from "@/lib/location-service";
import { localizeAuthMessage } from "@/lib/localize-messages";

const COUNTRY_NAME_EN: Record<string, string> = {
  "Colombia": "Colombia",
  "Estados Unidos": "United States",
  "España": "Spain",
  "México": "Mexico",
  "Argentina": "Argentina",
  "Chile": "Chile",
  "Perú": "Peru",
  "Ecuador": "Ecuador",
  "Venezuela": "Venezuela",
  "Bolivia": "Bolivia",
  "Uruguay": "Uruguay",
  "Paraguay": "Paraguay",
  "Costa Rica": "Costa Rica",
  "Panamá": "Panama",
  "República Dominicana": "Dominican Republic",
  "Guatemala": "Guatemala",
  "Honduras": "Honduras",
  "El Salvador": "El Salvador",
  "Alemania": "Germany",
  "Francia": "France",
  "Italia": "Italy",
  "Reino Unido": "United Kingdom",
  "Canadá": "Canada",
  "Brasil": "Brazil",
  "Japón": "Japan",
};

function translateBackendError(msg: string, isEn: boolean): string {
  if (!isEn || !msg) return msg;
  const base = localizeAuthMessage(msg, isEn);
  if (base !== msg) return base;
  const lower = msg.toLowerCase();
  if (lower.includes("ya existe un perfil") || lower.includes("ya fue registrado previamente como compositor")) {
    return "A composer profile with this email address is already registered. If you are a client you may use the same email, but you are already registered as a composer.";
  }
  if (lower.includes("número de documento") || lower.includes("documento ya fue registrado")) {
    return "A composer profile with this identification document number is already registered.";
  }
  if (lower.includes("inválido o expirado") || lower.includes("código incorrecto") || lower.includes("código de verificación inválido")) {
    return "Invalid or expired verification code. Please try again.";
  }
  if (lower.includes("código de 6 dígitos son obligatorios") || lower.includes("completo de 6 dígitos")) {
    return "Please enter the complete 6-digit verification code.";
  }
  if (lower.includes("nombre y el correo electrónico son obligatorios")) {
    return "Full name and email address are required.";
  }
  return msg;
}

export default function CompositorRegistroPage() {
  const router = useRouter();
  const { loginComposer, composer, isLoaded } = useAuth();
  const { showAlert } = useAlert();
  const { t, language } = useLanguage();
  const isEn = language === "en";

  // Redirección si la sesión del compositor ya se encuentra abierta
  useEffect(() => {
    if (!isLoaded) return;
    if (composer && (composer.email || composer.id)) {
      const target = composer.status === "APPROVED" ? "/compositor/dashboard" : "/compositor/dashboard/perfil";
      router.replace(target);
    }
  }, [composer, isLoaded, router]);

  const [stepMode, setStepMode] = useState<"form" | "otp" | "submitted">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Datos Formulario
  const [fullName, setFullName] = useState("");
  const [stageName, setStageName] = useState("");

  // Ubicación Mundial & Cascada
  const [countriesList, setCountriesList] = useState<CountryItem[]>(WORLD_COUNTRIES);
  const [statesList, setStatesList] = useState<StateItem[]>([]);
  const [citiesList, setCitiesList] = useState<CityItem[]>([]);

  const [country, setCountry] = useState("Colombia");
  const [phoneCode, setPhoneCode] = useState("+57");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("Bolívar");
  const [city, setCity] = useState("Cartagena");

  // Identificación & regalía
  const [docType, setDocType] = useState("CC");
  const [docNumber, setDocNumber] = useState("");
  const [bankName, setBankName] = useState("Bancolombia");
  const [accountType, setAccountType] = useState("AHORROS");
  const [accountNumber, setAccountNumber] = useState("");

  // Credenciales & Seguridad
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  // Páginas y Textos Legales Administrables desde el CMS
  const [cmsLegals, setCmsLegals] = useState<CmsLegalSettings>(DEFAULT_CMS_LEGAL_SETTINGS);
  const [legalModalDoc, setLegalModalDoc] = useState<CmsLegalDocument | null>(null);

  useEffect(() => {
    getCmsLegalsApi()
      .then((data) => {
        if (data && data.composer_terms) setCmsLegals(data);
      })
      .catch(() => {});
  }, []);

  // OTP Verification States
  const [otpCode, setOtpCode] = useState("");
  const [otpTimerSeconds, setOtpTimerSeconds] = useState(600); // 10 min
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  // 1. Cargar Países Mundiales al iniciar
  useEffect(() => {
    async function loadAllCountries() {
      const list = await getCountries();
      setCountriesList(list);
    }
    loadAllCountries();
  }, []);

  // 2. Cargar Departamentos/Estados en Cascada según País seleccionado
  useEffect(() => {
    async function updateStates() {
      const states = await getStatesByCountry(country);
      setStatesList(states);
      if (states.length > 0) {
        setDepartment(states[0].name);
      } else {
        setDepartment("");
      }

      // Actualizar indicativo telefónico automáticamente según el país
      const matched = countriesList.find(
        (c) => c.name.toLowerCase() === country.toLowerCase()
      );
      if (matched && matched.dialCode) {
        setPhoneCode(matched.dialCode);
      }
    }
    updateStates();
  }, [country, countriesList]);

  // 3. Cargar Ciudades/Municipios en Cascada según Departamento/Estado seleccionado
  useEffect(() => {
    async function updateCities() {
      if (!department) {
        setCitiesList([]);
        setCity("");
        return;
      }
      const cities = await getCitiesByState(country, department);
      setCitiesList(cities);
      if (cities.length > 0) {
        setCity(cities[0].name);
      } else {
        setCity(department);
      }
    }
    updateCities();
  }, [country, department]);

  // 4. Timers de Verificación OTP
  useEffect(() => {
    let interval: any = null;
    if (stepMode === "otp" && otpTimerSeconds > 0) {
      interval = setInterval(() => {
        setOtpTimerSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [stepMode, otpTimerSeconds]);

  useEffect(() => {
    let interval: any = null;
    if (stepMode === "otp" && resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            setCanResendOtp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [stepMode, resendCooldown]);

  // Helper para interpolar la comisión estándar de la plataforma desde el CMS
  const formatCommissionText = (text: string) => {
    if (!text) return text;
    const platformCommission = cmsLegals.default_commission_percentage ?? 20;
    const authorCommission = cmsLegals.author_percentage ?? (100 - platformCommission);
    return text
      .replace(/\{author_percent\}/g, String(authorCommission))
      .replace(/\{platform_percent\}/g, String(platformCommission))
      .replace(
        /\b\d+%\s*neto\s*autor\s*\/\s*\d+%\s*plataforma\b/gi,
        `${authorCommission}% neto autor / ${platformCommission}% plataforma`
      )
      .replace(
        /\b\d+%\s*net\s*author\s*\/\s*\d+%\s*platform\b/gi,
        `${authorCommission}% net author / ${platformCommission}% platform`
      )
      .replace(/percibirá el \d+% del valor neto/gi, `percibirá el ${authorCommission}% del valor neto`)
      .replace(/retendrá el \d+% restante/gi, `retendrá el ${platformCommission}% restante`)
      .replace(/receives \d+% net of the retail price/gi, `receives ${authorCommission}% net of the retail price`)
      .replace(/retains \d+% covering payment/gi, `retains ${platformCommission}% covering payment`);
  };

  // Helper para renderizar el texto de las casillas legales administrables
  const renderLegalCheckboxLabel = (doc: CmsLegalDocument) => {
    const rawTemplate = isEn ? doc.checkbox_text_en : doc.checkbox_text_es;
    const rawText = formatCommissionText(rawTemplate);
    const linkText = isEn ? doc.link_text_en : doc.link_text_es;

    if (rawText.includes("{link}")) {
      const parts = rawText.split("{link}");
      return (
        <span>
          {parts[0]}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setLegalModalDoc(doc);
            }}
            className="text-[#0071BC] font-bold hover:underline font-montserrat inline text-left cursor-pointer"
          >
            {linkText}
          </button>
          {parts[1]}
        </span>
      );
    }

    return (
      <span>
        {rawText}{" "}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setLegalModalDoc(doc);
          }}
          className="text-[#0071BC] font-bold hover:underline font-montserrat inline text-left cursor-pointer"
        >
          ({linkText})
        </button>
      </span>
    );
  };

  // Paso 1: Validar Formulario & Solicitar Código OTP
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (password !== confirmPassword) {
      setValidationError(
        isEn
          ? "Passwords do not match. Please verify both fields."
          : "Las contraseñas no coinciden. Por favor verifica ambos campos."
      );
      return;
    }

    if (password.length < 6) {
      setValidationError(
        isEn
          ? "Password must be at least 6 characters long for security."
          : "La contraseña debe tener al menos 6 caracteres por seguridad."
      );
      return;
    }

    if (!docNumber.trim()) {
      setValidationError(
        isEn
          ? "Identity document number is required."
          : "El número de documento de identidad es obligatorio."
      );
      return;
    }

    if (!phone.trim()) {
      setValidationError(
        isEn
          ? "Contact mobile phone number is required."
          : "El teléfono celular de contacto es obligatorio."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const names = fullName.trim().split(" ");
      const first_name = names[0] || fullName;
      const last_name = names.slice(1).join(" ") || "";

      const res = await sendComposerOtpApi({
        first_name,
        last_name,
        artistic_name: stageName || fullName,
        email: email.trim(),
        phone: phone.trim(),
        phone_code: phoneCode,
        country,
        department,
        city,
        password,
        bank_account: {
          account_type: accountType,
          bank_name: bankName,
          account_number: accountNumber || "000-000000-00",
          holder_name: fullName,
          document_type: docType,
          document_number: docNumber.trim(),
        },
      });

      setSuccessInfo(
        isEn
          ? `We have sent a 6-digit verification code to ${email}.`
          : (res.message || `Hemos enviado un código de 6 dígitos a ${email}.`)
      );
      setStepMode("otp");
      setOtpTimerSeconds(600);
      setResendCooldown(60);
      setCanResendOtp(false);
      setOtpCode("");
    } catch (err: any) {
      console.error("Error al enviar código para compositor:", err);
      setValidationError(
        translateBackendError(
          err.message || (isEn ? "Error processing registration request." : "Error al procesar la solicitud de registro."),
          isEn
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Paso 2: Verificar Código OTP de 6 dígitos
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!otpCode || otpCode.trim().length !== 6) {
      setValidationError(
        isEn
          ? "Please enter the complete 6-digit code."
          : "Por favor ingresa el código completo de 6 dígitos."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await verifyComposerOtpApi({
        email: email.trim(),
        code: otpCode.trim(),
      });

      if (res.composer) {
        loginComposer({
          id: res.composer.id,
          artistic_name: res.composer.artistic_name,
          email: res.composer.email,
          first_name: res.composer.first_name,
          last_name: res.composer.last_name,
          phone: res.composer.phone,
          region: res.composer.region,
          status: res.composer.status,
          photo_url: res.composer.photo_url,
          bio_es: res.composer.bio_es,
          bio_en: res.composer.bio_en,
        }, {
          token: res.token,
          rememberMe: true,
          expires_at: res.expires_at,
        });
      }

      showAlert({
        type: "success",
        title: isEn ? "Account Verified!" : "¡Cuenta Verificada!",
        message: isEn
          ? "Your composer account was verified successfully. Redirecting automatically to your Composer Portal..."
          : "Tu cuenta de compositor ha sido verificada con éxito. Redirigiendo automáticamente a tu Portal del Compositor...",
        duration: 3500,
      });

      setStepMode("submitted");

      // Redirigir automáticamente al portal (home) del compositor
      setTimeout(() => {
        router.push("/compositor/dashboard");
      }, 1200);
    } catch (err: any) {
      console.error("Error al verificar código OTP de compositor:", err);
      setValidationError(
        translateBackendError(
          err.message || (isEn ? "Incorrect or expired code. Please try again." : "Código incorrecto o expirado. Intenta de nuevo."),
          isEn
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reenviar Código OTP
  const handleResendOtp = async () => {
    if (!canResendOtp) return;
    setIsSubmitting(true);
    setValidationError(null);

    try {
      const names = fullName.trim().split(" ");
      const first_name = names[0] || fullName;
      const last_name = names.slice(1).join(" ") || "";

      await sendComposerOtpApi({
        first_name,
        last_name,
        artistic_name: stageName || fullName,
        email: email.trim(),
        phone: phone.trim(),
        phone_code: phoneCode,
        country,
        department,
        city,
        password,
        bank_account: {
          account_type: accountType,
          bank_name: bankName,
          account_number: accountNumber || "000-000000-00",
          holder_name: fullName,
          document_type: docType,
          document_number: docNumber.trim(),
        },
      });

      setOtpTimerSeconds(600);
      setResendCooldown(60);
      setCanResendOtp(false);
      setOtpCode("");
      setSuccessInfo(
        isEn
          ? `New verification code sent to ${email}.`
          : `Nuevo código de verificación enviado a ${email}.`
      );
    } catch (err: any) {
      setValidationError(
        translateBackendError(
          err.message || (isEn ? "Error resending verification code." : "Error al reenviar el código."),
          isEn
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9FF] text-[#111C2D] font-inter antialiased relative flex flex-col justify-between selection:bg-[#FBB03B]/30 selection:text-[#111C2D]">
      
      {/* Background Subtle Gradient */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,transparent_32px,rgba(17,28,45,0.03)_32px,rgba(17,28,45,0.03)_33px)] opacity-70"></div>
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-full max-w-[850px] h-[400px] bg-gradient-to-b from-amber-100/50 via-blue-50/40 to-transparent rounded-full blur-[120px]"></div>
      </div>

      {/* Header Unificado Stitch */}
      <Header />

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="w-full max-w-3xl">
          
          {/* PANTALLA 3: SOLICITUD COMPLETADA Y REGISTRADA EN BASE DE DATOS */}
          {stepMode === "submitted" ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-black/5 shadow-[0_20px_40px_-10px_rgba(15,23,42,0.08)] text-center space-y-6 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#FBB03B] via-[#0071BC] to-[#C1272D]"></div>

              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-3xl mx-auto border border-emerald-300">
                <span className="material-symbols-outlined text-3xl">verified</span>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-extrabold uppercase tracking-wider font-montserrat">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {isEn
                  ? "Status: Email Verified • Application Registered in Database"
                  : "Estado: Correo Verificado • Solicitud Registrada en Base de Datos"}
              </div>

              <h1 className="text-3xl font-black font-montserrat text-[#111C2D]">
                {isEn ? "Email Verified & Application Received!" : "¡Correo Verificado & Solicitud Recibida!"}
              </h1>
              
              <p className="text-sm text-[#4C4546] leading-relaxed max-w-lg mx-auto font-normal">
                {isEn ? (
                  <>Your email <strong>{email}</strong> has been successfully verified, and your composer application has been registered in the <strong>Piano Colombia</strong> database for technical and editorial review.</>
                ) : (
                  <>Tu correo electrónico <strong>{email}</strong> ha sido verificado con éxito y tu postulación como compositor ha quedado ingresada a la base de datos de <strong>Piano Colombia</strong> para revisión técnica y legal.</>
                )}
              </p>

              <div className="p-5 bg-[#F0F3FF] rounded-2xl border border-black/5 text-left text-xs space-y-2 max-w-md mx-auto">
                <p className="font-bold text-[#0071BC] font-montserrat flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  {isEn ? "Editorial Approval Process:" : "Proceso de Aprobación Editorial:"}
                </p>
                <p className="text-[#4C4546]">
                  {isEn ? "• Identity verification (ID No. " : "• Comprobación de identidad (Documento N° "}
                  <strong className="text-[#111C2D]">{docNumber}</strong>).
                </p>
                <p className="text-[#4C4546]">
                  {isEn ? "• Estimated review time: " : "• Tiempo de evaluación estimado: "}
                  <strong>{isEn ? "24 to 48 business hours" : "24 a 48 horas hábiles"}</strong>.
                </p>
                <p className="text-[#4C4546]">
                  {isEn
                    ? "• You will receive your active credentials once your account is approved."
                    : "• Recibirás tus credenciales activas una vez aprobada tu cuenta."}
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <Link
                  href="/"
                  className="w-full py-3.5 bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat text-center block"
                >
                  {isEn ? "Back to Home" : "Volver al Inicio"}
                </Link>
                <Link
                  href="/compositor/login"
                  className="w-full py-3.5 bg-white border border-black/10 hover:bg-[#F0F3FF] text-[#111C2D] font-bold text-xs rounded-xl transition font-montserrat text-center block"
                >
                  {isEn ? "Go to Sign In" : "Ir a Iniciar Sesión"}
                </Link>
              </div>
            </div>

          /* PANTALLA 2: VERIFICACIÓN OTP DE CORREO ELECTRONICO */
          ) : stepMode === "otp" ? (
            <div className="bg-white rounded-3xl p-7 sm:p-10 border border-black/5 shadow-[0_20px_40px_-10px_rgba(15,23,42,0.08)] relative overflow-hidden space-y-6 max-w-lg mx-auto">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#FBB03B] via-[#0071BC] to-[#C1272D]"></div>

              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-[#F0F3FF] text-[#0071BC] rounded-2xl flex items-center justify-center mx-auto border border-[#0071BC]/20">
                  <span className="material-symbols-outlined text-3xl">mark_email_read</span>
                </div>
                <h1 className="text-2xl font-black font-montserrat text-[#111C2D]">
                  {isEn ? "Verify Your Email Address" : "Verifica tu Correo Electrónico"}
                </h1>
                <p className="text-xs text-[#4C4546] leading-relaxed">
                  {isEn ? (
                    <>We have sent a 6-digit security code to <strong className="text-[#111C2D]">{email}</strong>. Enter it below to activate your composer profile.</>
                  ) : (
                    <>Hemos enviado un código de seguridad de 6 dígitos a <strong className="text-[#111C2D]">{email}</strong>. Ingrésalo a continuación para activar tu perfil de compositor.</>
                  )}
                </p>
              </div>

              {validationError && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-2.5 text-xs font-medium">
                  <span className="material-symbols-outlined text-lg shrink-0">error</span>
                  <span>{translateBackendError(validationError, isEn)}</span>
                </div>
              )}

              {successInfo && (
                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center gap-2.5 text-xs font-medium">
                  <span className="material-symbols-outlined text-lg shrink-0">info</span>
                  <span>{translateBackendError(successInfo, isEn)}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtpSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat text-center">
                    {isEn ? "Security Code (6 digits) *" : "Código de Seguridad (6 dígitos) *"}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full text-center text-2xl font-mono font-black tracking-[0.5em] py-3.5 bg-[#F0F3FF] border border-black/10 rounded-2xl text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                  />
                  <span className="block text-[11px] text-[#4C4546] text-center mt-2 font-mono">
                    {isEn ? "The code expires in: " : "El código expira en: "}
                    {Math.floor(otpTimerSeconds / 60)}:{(otpTimerSeconds % 60).toString().padStart(2, "0")}
                    {isEn ? " minutes" : " minutos"}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || otpCode.length !== 6}
                  className="w-full py-4 bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-[#111C2D] border-t-transparent rounded-full animate-spin"></span>
                      <span>{isEn ? "Verifying Code..." : "Verificando Código..."}</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">check_circle</span>
                      <span>{isEn ? "Verify Email & Complete Registration" : "Verificar Correo & Completar Registro"}</span>
                    </>
                  )}
                </button>

                <div className="pt-3 border-t border-black/5 text-center flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setStepMode("form");
                      setValidationError(null);
                    }}
                    className="text-[#0071BC] font-bold hover:underline font-montserrat flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    {isEn ? "Edit Details" : "Editar Datos"}
                  </button>

                  <button
                    type="button"
                    disabled={!canResendOtp || isSubmitting}
                    onClick={handleResendOtp}
                    className={`font-bold font-montserrat ${
                      canResendOtp
                        ? "text-[#0071BC] hover:underline cursor-pointer"
                        : "text-[#94a3b8] cursor-not-allowed"
                    }`}
                  >
                    {canResendOtp
                      ? (isEn ? "Resend Code" : "Reenviar Código")
                      : (isEn ? `Resend in (${resendCooldown}s)` : `Reenviar en (${resendCooldown}s)`)}
                  </button>
                </div>
              </form>
            </div>

          /* PANTALLA 1: FORMULARIO PRINCIPAL DE REGISTRO */
          ) : (
            <div className="bg-white rounded-3xl p-7 sm:p-10 border border-black/5 shadow-[0_20px_40px_-10px_rgba(15,23,42,0.08)] relative overflow-hidden space-y-8">
              
              {/* Barra Tríada de Acento Stitch */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#FBB03B] via-[#0071BC] to-[#C1272D]"></div>

              {/* Header del Formulario */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F0F3FF] border border-[#0071BC]/10 text-[#0071BC] text-[11px] font-extrabold uppercase tracking-wider font-montserrat">
                  <span className="material-symbols-outlined text-xs">music_note</span>
                  {isEn ? "Join the Author & Editorial Network" : "Únete a la Red de Autores & Editorial"}
                </div>

                <h1 className="text-3xl sm:text-4xl font-black font-montserrat text-[#111C2D] tracking-tight">
                  {isEn ? "Composer Registration" : "Registro de Compositor"}
                </h1>
                <p className="text-xs sm:text-sm text-[#4C4546] max-w-lg mx-auto leading-relaxed font-normal">
                  {isEn
                    ? "Publish and sell your digital scores in Urtext format with legal anti-fraud protection, Sayco/DNDA traceability, and 80% net royalty settlement."
                    : "Publica y vende tus partituras digitales en formato Urtext con protección legal antifraude, trazabilidad Sayco/DNDA y liquidación del 80% neto de regalías."}
                </p>
              </div>

              {/* Alerta de Error de Validación */}
              {validationError && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3 text-xs font-medium">
                  <span className="material-symbols-outlined text-lg shrink-0">error</span>
                  <span>{translateBackendError(validationError, isEn)}</span>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-8">
                
                {/* Bloque 1: Información Personal & Artística */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-black/5 pb-2">
                    <span className="w-6 h-6 rounded-full bg-[#111C2D] text-white text-xs font-bold flex items-center justify-center font-montserrat">1</span>
                    <h2 className="text-xs font-black uppercase text-[#111C2D] tracking-wider font-montserrat">
                      {isEn ? "Personal Information & Stage Name" : "Información Personal & Nombre Artístico"}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
                        {isEn ? "Full Legal Name *" : "Nombre Completo Legal *"}
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={isEn ? "e.g.: Maestro Adolfo Mejía" : "Ej: Maestro Adolfo Mejía"}
                        className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-3 text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
                        {isEn ? "Stage Name / Alias" : "Nombre Artístico / Pseudónimo"}
                      </label>
                      <input
                        type="text"
                        value={stageName}
                        onChange={(e) => setStageName(e.target.value)}
                        placeholder={isEn ? "As it will appear on score covers" : "Como figurará en las portadas"}
                        className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-3 text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                      />
                    </div>
                  </div>

                  {/* Teléfono de contacto con Indicativo Internacional */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
                        {isEn ? "Country Dial Code *" : "Indicativo País *"}
                      </label>
                      <select
                        value={phoneCode}
                        onChange={(e) => setPhoneCode(e.target.value)}
                        className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-3 py-3 text-xs font-mono font-bold text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                      >
                        {countriesList.map((c) => (
                          <option key={`${c.code}-${c.dialCode}`} value={c.dialCode}>
                            {c.flag} {c.code} ({c.dialCode})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
                        {isEn ? "Mobile / Contact Phone *" : "Teléfono Celular / Contacto *"}
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={isEn ? "e.g.: +57 313 752 9693" : "Ej: 313 752 9693"}
                        className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-3 text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                      />
                    </div>
                  </div>

                  {/* Cascada de Ubicación Mundial */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
                        {isEn ? "Country *" : "País *"}
                      </label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-3 py-3 text-xs font-bold text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                      >
                        {countriesList.map((c) => (
                          <option key={c.code} value={c.name}>
                            {c.flag} {isEn ? (COUNTRY_NAME_EN[c.name] || c.name) : c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
                        {isEn ? "State / Department *" : "Departamento / Estado *"}
                      </label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-3 py-3 text-xs font-semibold text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                      >
                        {statesList.map((s) => (
                          <option key={s.name} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
                        {isEn ? "City / Municipality *" : "Ciudad / Municipio *"}
                      </label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-3 py-3 text-xs font-semibold text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                      >
                        {citiesList.map((ct) => (
                          <option key={ct.name} value={ct.name}>
                            {ct.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Bloque 2: Identificación & Datos Bancarios */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-black/5 pb-2">
                    <span className="w-6 h-6 rounded-full bg-[#0071BC] text-white text-xs font-bold flex items-center justify-center font-montserrat">2</span>
                    <h2 className="text-xs font-black uppercase text-[#111C2D] tracking-wider font-montserrat">
                      {isEn ? "Legal Identification & Royalties" : "Identificación Legal & Regalías"}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
                        {isEn ? "Document Type *" : "Tipo de Documento *"}
                      </label>
                      <select
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                        className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-3 text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                      >
                        <option value="CC">{isEn ? "National ID (CC - Colombia)" : "Cédula de Ciudadanía (CC)"}</option>
                        <option value="CE">{isEn ? "Foreigner ID (CE)" : "Cédula de Extranjería (CE)"}</option>
                        <option value="NIT">{isEn ? "Corporate / Tax ID (NIT)" : "NIT Persona Jurídica"}</option>
                        <option value="PASAPORTE">{isEn ? "Passport" : "Pasaporte"}</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
                        {isEn ? "Document Number *" : "Número de Documento *"}
                      </label>
                      <input
                        type="text"
                        required
                        value={docNumber}
                        onChange={(e) => setDocNumber(e.target.value)}
                        placeholder={isEn ? "e.g.: 1098765432" : "Ej: 1098765432"}
                        className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-3 text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                      />
                    </div>
                  </div>

                  {/* Campos de Cuenta para Dispersión Wompi */}
                  <div className="p-4 bg-[#F0F3FF]/70 rounded-2xl border border-black/5 space-y-3">
                    <span className="text-xs font-montserrat font-bold text-[#0071BC] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">account_balance</span>
                      {isEn
                        ? "Bank Account / Digital Pocket for Royalty Payouts (Wompi API)"
                        : "Cuenta Bancaria / Bolsillo Nequi para Dispersión de Regalías (Wompi API)"}
                    </span>

                    {/* AVISO CLAVE SOBRE CUENTA COLOMBIANA */}
                    <div className="p-3.5 bg-amber-50 border border-amber-200/90 rounded-xl text-amber-950 text-xs flex items-start gap-2.5 shadow-sm">
                      <span className="material-symbols-outlined text-lg text-amber-600 shrink-0 mt-0.5">warning</span>
                      <div className="space-y-1">
                        <p className="font-extrabold text-[#111C2D] font-montserrat text-[12px]">
                          {isEn
                            ? "Mandatory Colombian Account Requirement"
                            : "Requisito Indispensable: Cuenta o Bolsillo Colombiano"}
                        </p>
                        <p className="text-[#4C4546] text-[11px] leading-relaxed">
                          {isEn
                            ? "Please note: Your savings account or digital pocket (Nequi / Daviplata) must belong to a Colombian financial institution in Colombian Pesos (COP). Automated royalty disbursements are processed through the Colombian national banking clearing system (Wompi)."
                            : "Ten en cuenta: La cuenta de ahorros o bolsillo digital (Nequi / Daviplata) debe pertenecer a una entidad financiera colombiana en pesos (COP). Los giros automáticos de regalías se dispersan a través de la red de compensación bancaria nacional con Wompi."}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block font-bold text-[#111C2D] mb-1">
                          {isEn ? "Bank / Platform *" : "Banco / Plataforma *"}
                        </label>
                        <select 
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-xs font-semibold text-[#111C2D]"
                        >
                          <option value="Bancolombia">Bancolombia</option>
                          <option value="Davivienda">Davivienda</option>
                          <option value="Nequi">Nequi</option>
                          <option value="Daviplata">Daviplata</option>
                          <option value="Banco de Bogotá">Banco de Bogotá</option>
                          <option value="BBVA Colombia">BBVA Colombia</option>
                          <option value="Transferencia Internacional (SWIFT / IBAN)">
                            {isEn ? "International Wire (SWIFT / IBAN - Colombian Bank)" : "Transferencia Internacional (SWIFT / IBAN)"}
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-[#111C2D] mb-1">
                          {isEn ? "Account Type *" : "Tipo de Cuenta *"}
                        </label>
                        <select 
                          value={accountType}
                          onChange={(e) => setAccountType(e.target.value)}
                          className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-xs font-semibold text-[#111C2D]"
                        >
                          <option value="AHORROS">{isEn ? "Savings Account (Colombia)" : "Cuenta de Ahorros"}</option>
                          <option value="CORRIENTE">{isEn ? "Checking Account (Colombia)" : "Cuenta Corriente"}</option>
                          <option value="NEQUI">{isEn ? "Nequi Pocket (Colombia)" : "Bolsillo Nequi"}</option>
                          <option value="DAVIPLATA">{isEn ? "Daviplata Pocket (Colombia)" : "Bolsillo Daviplata"}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-[#111C2D] mb-1">
                          {isEn ? "Account / Mobile Number *" : "Número de Cuenta / Celular *"}
                        </label>
                        <input
                          type="text"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          placeholder={isEn ? "e.g.: 582-910284-12" : "Ej: 582-910284-12"}
                          className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-xs font-mono text-[#111C2D]"
                        />
                        <p className="text-[10px] text-[#4C4546] mt-1 font-medium">
                          {isEn
                            ? "* Colombian bank account or active phone number."
                            : "* Cuenta bancaria colombiana o celular activo."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bloque 3: Datos de Cuenta & Credenciales */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-black/5 pb-2">
                    <span className="w-6 h-6 rounded-full bg-[#FBB03B] text-[#111C2D] text-xs font-bold flex items-center justify-center font-montserrat">3</span>
                    <h2 className="text-xs font-black uppercase text-[#111C2D] tracking-wider font-montserrat">
                      {isEn ? "Portal Credentials" : "Credenciales del Portal"}
                    </h2>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
                      {isEn ? "Email Address *" : "Correo Electrónico *"}
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4C4546] text-lg">
                        mail
                      </span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={isEn ? "composer@pianocolombia.com" : "compositor@pianocolombia.com"}
                        className="w-full pl-10 pr-4 py-3 bg-[#F0F3FF] border border-black/5 rounded-xl text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
                        {isEn ? "Password *" : "Contraseña *"}
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4C4546] text-lg">
                          lock
                        </span>
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={isEn ? "Minimum 6 characters" : "Mínimo 6 caracteres"}
                          className="w-full pl-10 pr-10 py-3 bg-[#F0F3FF] border border-black/5 rounded-xl text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4C4546] hover:text-[#111C2D]"
                        >
                          <span className="material-symbols-outlined text-lg">
                            {showPassword ? "visibility_off" : "visibility"}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
                        {isEn ? "Confirm Password *" : "Confirmar Contraseña *"}
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4C4546] text-lg">
                          lock_reset
                        </span>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder={isEn ? "Repeat your password" : "Repite tu contraseña"}
                          className={`w-full pl-10 pr-10 py-3 bg-[#F0F3FF] border rounded-xl text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 ${
                            confirmPassword && confirmPassword !== password
                              ? "border-red-400 focus:ring-red-400"
                              : confirmPassword && confirmPassword === password
                              ? "border-emerald-400 focus:ring-emerald-400"
                              : "border-black/5 focus:ring-[#0071BC]"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4C4546] hover:text-[#111C2D]"
                        >
                          <span className="material-symbols-outlined text-lg">
                            {showConfirmPassword ? "visibility_off" : "visibility"}
                          </span>
                        </button>
                      </div>
                      {confirmPassword && confirmPassword !== password && (
                        <p className="text-[11px] text-red-600 font-medium mt-1">
                          {isEn ? "Passwords do not match" : "Las contraseñas no coinciden"}
                        </p>
                      )}
                      {confirmPassword && confirmPassword === password && (
                        <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">check</span>{" "}
                          {isEn ? "Passwords match" : "Las contraseñas coinciden"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Términos & Privacidad Administrables desde el CMS */}
                <div className="space-y-3 pt-2 bg-[#F0F3FF]/60 p-4 rounded-2xl border border-black/5">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#4C4546] font-medium">
                    <input
                      type="checkbox"
                      required
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded border-black/20 text-[#0071BC] focus:ring-[#0071BC]"
                    />
                    {renderLegalCheckboxLabel(cmsLegals.composer_terms)}
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#4C4546] font-medium">
                    <input
                      type="checkbox"
                      required
                      checked={agreePrivacy}
                      onChange={(e) => setAgreePrivacy(e.target.checked)}
                      className="mt-0.5 rounded border-black/20 text-[#0071BC] focus:ring-[#0071BC]"
                    />
                    {renderLegalCheckboxLabel(cmsLegals.privacy_policy)}
                  </label>
                </div>

                {/* CTA Botón Principal */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-[#111C2D] border-t-transparent rounded-full animate-spin"></span>
                      <span>
                        {isEn
                          ? "Validating details and sending code..."
                          : "Validando datos y enviando código..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">send</span>
                      <span>
                        {isEn
                          ? "Continue & Verify Email via OTP Code"
                          : "Continuar y Verificar Correo por Código OTP"}
                      </span>
                    </>
                  )}
                </button>

                <div className="text-center text-xs text-[#4C4546]">
                  {isEn ? "Already registered as a composer? " : "¿Ya estás registrado como compositor? "}
                  <Link href="/compositor/login" className="text-[#0071BC] font-bold hover:underline font-montserrat">
                    {isEn ? "Sign In Here" : "Inicia Sesión Aquí"}
                  </Link>
                </div>

              </form>

            </div>
          )}

        </div>
      </main>

      {/* Modal Interactivo de Lectura de Documentos Legales */}
      {legalModalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-black/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-black/5 flex items-center justify-between bg-[#F0F3FF]/70">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold font-montserrat text-[#0071BC] uppercase tracking-wider">
                  {isEn ? "Legal Document • Piano Colombia" : "Documento Legal • Piano Colombia"}
                </span>
                <h3 className="text-base sm:text-lg font-black font-montserrat text-[#111C2D]">
                  {isEn ? legalModalDoc.title_en : legalModalDoc.title_es}
                </h3>
                <p className="text-[11px] text-[#4C4546]">
                  {isEn ? legalModalDoc.updated_at_text_en : legalModalDoc.updated_at_text_es}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLegalModalDoc(null)}
                className="w-9 h-9 rounded-full bg-white hover:bg-black/5 text-[#111C2D] flex items-center justify-center transition border border-black/10 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-[#4C4546] leading-relaxed whitespace-pre-line font-normal">
              {formatCommissionText(isEn ? legalModalDoc.content_en : legalModalDoc.content_es)}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-black/5 flex justify-end bg-slate-50">
              <button
                type="button"
                onClick={() => setLegalModalDoc(null)}
                className="px-6 py-2.5 bg-[#111C2D] hover:bg-[#0071BC] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition font-montserrat cursor-pointer"
              >
                {isEn ? "Close" : "Entendido y Cerrar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Unificado Stitch */}
      <Footer />

    </div>
  );
}
