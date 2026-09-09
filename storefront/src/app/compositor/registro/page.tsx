"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { sendComposerOtpApi, verifyComposerOtpApi } from "@/lib/api-client";
import {
  getCountries,
  getStatesByCountry,
  getCitiesByState,
  CountryItem,
  StateItem,
  CityItem,
  WORLD_COUNTRIES,
} from "@/lib/location-service";

export default function CompositorRegistroPage() {
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

  // Paso 1: Validar Formulario & Solicitar Código OTP
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (password !== confirmPassword) {
      setValidationError("Las contraseñas no coinciden. Por favor verifica ambos campos.");
      return;
    }

    if (password.length < 6) {
      setValidationError("La contraseña debe tener al menos 6 caracteres por seguridad.");
      return;
    }

    if (!docNumber.trim()) {
      setValidationError("El número de documento de identidad es obligatorio.");
      return;
    }

    if (!phone.trim()) {
      setValidationError("El teléfono celular de contacto es obligatorio.");
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

      setSuccessInfo(res.message || `Hemos enviado un código de 6 dígitos a ${email}.`);
      setStepMode("otp");
      setOtpTimerSeconds(600);
      setResendCooldown(60);
      setCanResendOtp(false);
      setOtpCode("");
    } catch (err: any) {
      console.error("Error al enviar código para compositor:", err);
      setValidationError(err.message || "Error al procesar la solicitud de registro.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Paso 2: Verificar Código OTP de 6 dígitos
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!otpCode || otpCode.trim().length !== 6) {
      setValidationError("Por favor ingresa el código completo de 6 dígitos.");
      return;
    }

    setIsSubmitting(true);

    try {
      await verifyComposerOtpApi({
        email: email.trim(),
        code: otpCode.trim(),
      });

      setStepMode("submitted");
    } catch (err: any) {
      console.error("Error al verificar código OTP de compositor:", err);
      setValidationError(err.message || "Código incorrecto o expirado. Intenta de nuevo.");
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
      setSuccessInfo(`Nuevo código de verificación enviado a ${email}.`);
    } catch (err: any) {
      setValidationError(err.message || "Error al reenviar el código.");
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
                Estado: Correo Verificado • Solicitud Registrada en Base de Datos
              </div>

              <h1 className="text-3xl font-black font-montserrat text-[#111C2D]">
                ¡Correo Verificado & Solicitud Recibida!
              </h1>
              
              <p className="text-sm text-[#4C4546] leading-relaxed max-w-lg mx-auto font-normal">
                Tu correo electrónico <strong>{email}</strong> ha sido verificado con éxito y tu postulación como compositor ha quedado ingresada a la base de datos de <strong>Piano Colombia</strong> para revisión técnica y legal.
              </p>

              <div className="p-5 bg-[#F0F3FF] rounded-2xl border border-black/5 text-left text-xs space-y-2 max-w-md mx-auto">
                <p className="font-bold text-[#0071BC] font-montserrat flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">check_circle</span> Proceso de Aprobación Editorial:
                </p>
                <p className="text-[#4C4546]">• Comprobación de identidad (Documento N° <strong className="text-[#111C2D]">{docNumber}</strong>).</p>
                <p className="text-[#4C4546]">• Tiempo de evaluación estimado: <strong>24 a 48 horas hábiles</strong>.</p>
                <p className="text-[#4C4546]">• Recibirás tus credenciales activas una vez aprobada tu cuenta.</p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <Link
                  href="/"
                  className="w-full py-3.5 bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat text-center block"
                >
                  Volver al Inicio
                </Link>
                <Link
                  href="/compositor/login"
                  className="w-full py-3.5 bg-white border border-black/10 hover:bg-[#F0F3FF] text-[#111C2D] font-bold text-xs rounded-xl transition font-montserrat text-center block"
                >
                  Ir a Iniciar Sesión
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
                  Verifica tu Correo Electrónico
                </h1>
                <p className="text-xs text-[#4C4546] leading-relaxed">
                  Hemos enviado un código de seguridad de 6 dígitos a <strong className="text-[#111C2D]">{email}</strong>. Ingrésalo a continuación para activar tu perfil de compositor.
                </p>
              </div>

              {validationError && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-2.5 text-xs font-medium">
                  <span className="material-symbols-outlined text-lg shrink-0">error</span>
                  <span>{validationError}</span>
                </div>
              )}

              {successInfo && (
                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center gap-2.5 text-xs font-medium">
                  <span className="material-symbols-outlined text-lg shrink-0">info</span>
                  <span>{successInfo}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtpSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat text-center">
                    Código de Seguridad (6 dígitos) *
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
                    El código expira en: {Math.floor(otpTimerSeconds / 60)}:{(otpTimerSeconds % 60).toString().padStart(2, "0")} minutos
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
                      <span>Verificando Código...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">check_circle</span>
                      <span>Verificar Correo & Completar Registro</span>
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
                    Editar Datos
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
                    {canResendOtp ? "Reenviar Código" : `Reenviar en (${resendCooldown}s)`}
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
                  Únete a la Red de Autores & Editorial
                </div>

                <h1 className="text-3xl sm:text-4xl font-black font-montserrat text-[#111C2D] tracking-tight">
                  Registro de Compositor
                </h1>
                <p className="text-xs sm:text-sm text-[#4C4546] max-w-lg mx-auto leading-relaxed font-normal">
                  Publica y vende tus partituras digitales en formato Urtext con protección legal antifraude, trazabilidad Sayco/DNDA y liquidación del 80% neto de regalías.
                </p>
              </div>

              {/* Alerta de Error de Validación */}
              {validationError && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3 text-xs font-medium">
                  <span className="material-symbols-outlined text-lg shrink-0">error</span>
                  <span>{validationError}</span>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-8">
                
                {/* Bloque 1: Información Personal & Artística */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-black/5 pb-2">
                    <span className="w-6 h-6 rounded-full bg-[#111C2D] text-white text-xs font-bold flex items-center justify-center font-montserrat">1</span>
                    <h2 className="text-xs font-black uppercase text-[#111C2D] tracking-wider font-montserrat">
                      Información Personal & Nombre Artístico
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
                        Nombre Completo Legal *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ej: Maestro Adolfo Mejía"
                        className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-3 text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
                        Nombre Artístico / Pseudónimo
                      </label>
                      <input
                        type="text"
                        value={stageName}
                        onChange={(e) => setStageName(e.target.value)}
                        placeholder="Como figurará en las portadas"
                        className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-3 text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                      />
                    </div>
                  </div>

                  {/* Teléfono de contacto con Indicativo Internacional */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">Indicativo País *</label>
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
                      <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">Teléfono Celular / Contacto *</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ej: 313 752 9693"
                        className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-3 text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                      />
                    </div>
                  </div>

                  {/* Cascada de Ubicación Mundial */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">País *</label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-3 py-3 text-xs font-bold text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                      >
                        {countriesList.map((c) => (
                          <option key={c.code} value={c.name}>
                            {c.flag} {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">Departamento / Estado *</label>
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
                      <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">Ciudad / Municipio *</label>
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
                      Identificación Legal & Regalías
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">Tipo de Documento *</label>
                      <select
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                        className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-3 text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                      >
                        <option value="CC">Cédula de Ciudadanía (CC)</option>
                        <option value="CE">Cédula de Extranjería (CE)</option>
                        <option value="NIT">NIT Persona Jurídica</option>
                        <option value="PASAPORTE">Pasaporte</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">Número de Documento *</label>
                      <input
                        type="text"
                        required
                        value={docNumber}
                        onChange={(e) => setDocNumber(e.target.value)}
                        placeholder="Ej: 1098765432"
                        className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-3 text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                      />
                    </div>
                  </div>

                  {/* Campos de Cuenta para Dispersión Wompi */}
                  <div className="p-4 bg-[#F0F3FF]/70 rounded-2xl border border-black/5 space-y-3">
                    <span className="text-xs font-montserrat font-bold text-[#0071BC] block flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">account_balance</span>
                      Cuenta Bancaria / Bolsillo Nequi para Dispersión de Regalías (Wompi API)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block font-bold text-[#111C2D] mb-1">Banco / Plataforma *</label>
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
                          <option value="Transferencia Internacional (SWIFT / IBAN)">Transferencia Internacional (SWIFT / IBAN)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-[#111C2D] mb-1">Tipo de Cuenta *</label>
                        <select 
                          value={accountType}
                          onChange={(e) => setAccountType(e.target.value)}
                          className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-xs font-semibold text-[#111C2D]"
                        >
                          <option value="AHORROS">Cuenta de Ahorros</option>
                          <option value="CORRIENTE">Cuenta Corriente</option>
                          <option value="NEQUI">Bolsillo Nequi</option>
                          <option value="DAVIPLATA">Bolsillo Daviplata</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-[#111C2D] mb-1">Número de Cuenta / Celular *</label>
                        <input
                          type="text"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          placeholder="Ej: 582-910284-12"
                          className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-xs font-mono text-[#111C2D]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bloque 3: Datos de Cuenta & Credenciales */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-black/5 pb-2">
                    <span className="w-6 h-6 rounded-full bg-[#FBB03B] text-[#111C2D] text-xs font-bold flex items-center justify-center font-montserrat">3</span>
                    <h2 className="text-xs font-black uppercase text-[#111C2D] tracking-wider font-montserrat">
                      Credenciales del Portal
                    </h2>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">Correo Electrónico *</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4C4546] text-lg">
                        mail
                      </span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="compositor@pianocolombia.com"
                        className="w-full pl-10 pr-4 py-3 bg-[#F0F3FF] border border-black/5 rounded-xl text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">Contraseña *</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4C4546] text-lg">
                          lock
                        </span>
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Mínimo 6 caracteres"
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
                      <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">Confirmar Contraseña *</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4C4546] text-lg">
                          lock_reset
                        </span>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repite tu contraseña"
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
                          Las contraseñas no coinciden
                        </p>
                      )}
                      {confirmPassword && confirmPassword === password && (
                        <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">check</span> Las contraseñas coinciden
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Términos & Privacidad */}
                <div className="space-y-3 pt-2 bg-[#F0F3FF]/60 p-4 rounded-2xl border border-black/5">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#4C4546] font-medium">
                    <input
                      type="checkbox"
                      required
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded border-black/20 text-[#0071BC] focus:ring-[#0071BC]"
                    />
                    <span>
                      Acepto los <Link href="#" className="text-[#0071BC] font-bold hover:underline font-montserrat">Términos y Condiciones para Compositores</Link> de Piano Colombia (liquidación 80% neto autor / 20% plataforma).
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#4C4546] font-medium">
                    <input
                      type="checkbox"
                      required
                      checked={agreePrivacy}
                      onChange={(e) => setAgreePrivacy(e.target.checked)}
                      className="mt-0.5 rounded border-black/20 text-[#0071BC] focus:ring-[#0071BC]"
                    />
                    <span>
                      Autorizo la <Link href="#" className="text-[#0071BC] font-bold hover:underline font-montserrat">Política de Tratamiento de Datos Personales</Link> y verificación de obras.
                    </span>
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
                      <span>Validando datos y enviando código...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">send</span>
                      <span>Continuar y Verificar Correo por Código OTP</span>
                    </>
                  )}
                </button>

                <div className="text-center text-xs text-[#4C4546]">
                  ¿Ya estás registrado como compositor?{" "}
                  <Link href="/compositor/login" className="text-[#0071BC] font-bold hover:underline font-montserrat">
                    Inicia Sesión Aquí
                  </Link>
                </div>

              </form>

            </div>
          )}

        </div>
      </main>

      {/* Footer Unificado Stitch */}
      <Footer />

      {/* Flotante WhatsApp Support */}
      <aside aria-label="Soporte WhatsApp" className="fixed bottom-6 right-6 z-50">
        <a
          href="https://wa.me/573137529693"
          target="_blank"
          rel="noopener noreferrer"
          title="Atención directa a compositores vía WhatsApp"
          className="flex items-center gap-2.5 bg-white hover:bg-emerald-50 text-[#111C2D] border border-emerald-500/40 rounded-full px-4 py-2.5 shadow-lg backdrop-blur-md transition-all duration-200 group hover:scale-105"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="material-symbols-outlined text-emerald-600 text-lg group-hover:scale-110 transition-transform">chat</span>
          <span className="text-xs font-bold hidden md:inline font-montserrat">Soporte Compositores</span>
        </a>
      </aside>

    </div>
  );
}
