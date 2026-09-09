"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  loginComposerApi,
  requestPasswordResetApi,
  confirmPasswordResetApi,
} from "@/lib/api-client";

export default function CompositorLoginPage() {
  const router = useRouter();
  const { composer, loginComposer, logoutComposer } = useAuth();
  const [viewMode, setViewMode] = useState<"login" | "forgot_email" | "forgot_otp">("login");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Password Reset States
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [forgotTimer, setForgotTimer] = useState(600); // 10 min
  const [forgotCanResend, setForgotCanResend] = useState(false);
  const [forgotResendCooldown, setForgotResendCooldown] = useState(60);

  // Timer countdown for password reset
  useEffect(() => {
    let interval: any = null;
    if (viewMode === "forgot_otp" && forgotTimer > 0) {
      interval = setInterval(() => {
        setForgotTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [viewMode, forgotTimer]);

  // Resend cooldown timer
  useEffect(() => {
    let interval: any = null;
    if (viewMode === "forgot_otp" && forgotResendCooldown > 0) {
      interval = setInterval(() => {
        setForgotResendCooldown((prev) => {
          if (prev <= 1) {
            setForgotCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [viewMode, forgotResendCooldown]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await loginComposerApi(email, password);
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
        rejection_reason: res.composer.rejection_reason,
      });

      // Si no está aprobado, se conduce directamente a completar su perfil
      if (res.composer.status !== "APPROVED") {
        router.push("/compositor/dashboard/perfil");
      } else {
        router.push("/compositor/dashboard");
      }
    } catch (err: any) {
      console.error("Fallo login de compositor en vivo:", err.message);
      setErrorMessage(err.message || "Correo o contraseña incorrectos. Por favor verifica tus credenciales.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes("@")) {
      setErrorMessage("Por favor ingresa un correo electrónico válido.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await requestPasswordResetApi({
        email: forgotEmail.trim(),
        role: "composer",
      });

      setViewMode("forgot_otp");
      setForgotTimer(600);
      setForgotResendCooldown(60);
      setForgotCanResend(false);
      setForgotOtp("");
      setNewPassword("");
      setConfirmNewPassword("");
      setSuccessMessage(res.message || `Código enviado a ${forgotEmail}. Revisa tu bandeja de entrada o spam.`);
    } catch (err: any) {
      console.error("Error al solicitar código:", err);
      setErrorMessage(err.message || "Error al solicitar el código de recuperación.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!forgotOtp || forgotOtp.trim().length !== 6) {
      setErrorMessage("Por favor ingresa el código completo de 6 dígitos.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("La contraseña debe tener al menos 6 caracteres por seguridad.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage("Las contraseñas no coinciden. Por favor verifica ambos campos.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await confirmPasswordResetApi({
        email: forgotEmail.trim(),
        code: forgotOtp.trim(),
        newPassword,
        role: "composer",
      });

      setSuccessMessage(res.message || "¡Contraseña actualizada exitosamente! Ya puedes iniciar sesión.");
      setEmail(forgotEmail.trim());
      setPassword("");
      setViewMode("login");
    } catch (err: any) {
      console.error("Error al restablecer contraseña de compositor:", err);
      setErrorMessage(err.message || "Código incorrecto o expirado. Por favor intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendForgotOtp = async () => {
    if (!forgotCanResend) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await requestPasswordResetApi({
        email: forgotEmail.trim(),
        role: "composer",
      });
      setForgotTimer(600);
      setForgotResendCooldown(60);
      setForgotCanResend(false);
      setForgotOtp("");
      setSuccessMessage(`Nuevo código enviado a ${forgotEmail}.`);
    } catch (err: any) {
      setErrorMessage(err.message || "Error al reenviar el código.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-inter antialiased relative flex flex-col justify-between overflow-x-hidden selection:bg-[#fbb03b] selection:text-slate-900">
      
      {/* Background Visuals */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,transparent_32px,rgba(15,23,42,0.035)_32px,rgba(15,23,42,0.035)_33px)] opacity-70"></div>
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-full max-w-[850px] h-[400px] bg-gradient-to-b from-amber-100/60 via-blue-50/40 to-transparent rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 inset-x-0 h-96 bg-[radial-gradient(circle_at_50%_110%,rgba(251,176,59,0.12)_0%,rgba(0,113,188,0.04)_40%,transparent_75%)]"></div>
      </div>

      {/* Header Fijo con Logo Stitch */}
      <header className="relative z-10 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo Brand Stitch Unificado */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center gap-1 shrink-0">
              <div className="h-6 w-1 bg-[#111C2D] rounded-full"></div>
              <div className="h-8 w-1 bg-[#FBB03B] rounded-full"></div>
              <div className="h-5 w-1 bg-[#0071BC] rounded-full"></div>
              <div className="h-7 w-1 bg-[#111C2D] rounded-full"></div>
              <div className="h-4.5 w-1 bg-[#C1272D] rounded-full"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-montserrat text-sm font-black tracking-tight text-[#111C2D] leading-none group-hover:text-[#0071BC] transition-colors">
                PIANO COLOMBIA
              </span>
              <span className="text-[9px] font-extrabold text-[#4C4546] uppercase tracking-wider font-montserrat mt-0.5">
                Archivo & Partituras
              </span>
            </div>
          </Link>

          {/* Acciones Derechas Header */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/compositor/registro"
              className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-amber-600 transition-all duration-200 flex items-center gap-1.5 group"
            >
              <span className="text-slate-500 hidden sm:inline font-normal">¿No tienes cuenta?</span>
              <span className="font-bold text-slate-900 group-hover:text-amber-600 underline underline-offset-4 decoration-amber-400 group-hover:decoration-amber-600">Regístrate aquí</span>
              <span className="material-symbols-outlined text-xs text-amber-500 transition-transform group-hover:translate-x-1">arrow_forward</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="w-full max-w-[470px]">
          
          {/* Card Iniciar Sesión Elegante */}
          <section className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-7 sm:p-10 shadow-[0_20px_40px_-10px_rgba(15,23,42,0.08)] relative overflow-hidden transition-all duration-300 ring-1 ring-slate-900/5">
            
            {/* Barra de acento tricolor */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#fbb03b] via-[#0071bc] to-[#c1272d]"></div>

            {/* Header del Formulario */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-[11px] font-bold tracking-wider uppercase mb-4 shadow-2xs font-montserrat">
                <span className="material-symbols-outlined text-xs text-amber-600">shield</span>
                <span>Portal Exclusivo · Acceso Restringido</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-[#0f172a] tracking-tight font-montserrat">
                Portal de Compositores
              </h1>
              <p className="mt-2.5 text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto font-normal">
                Ingresa con tus credenciales registradas para gestionar tu catálogo, regalías y perfil artístico.
              </p>
            </div>

            {/* Mensajes de Notificación */}
            {errorMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-3">
                <span className="material-symbols-outlined text-base text-red-600 shrink-0">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-3">
                <span className="material-symbols-outlined text-base text-emerald-600 shrink-0">check_circle</span>
                <span>{successMessage}</span>
              </div>
            )}

            {/* =========================================================
                 VISTA 1: RECUPERAR CONTRASEÑA (SOLICITAR CÓDIGO)
               ========================================================= */}
            {viewMode === "forgot_email" ? (
              <form onSubmit={handleRequestForgotOtp} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 tracking-wide font-montserrat" htmlFor="forgotEmail">
                    Correo Electrónico de Compositor
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <span className="material-symbols-outlined text-base">mail</span>
                    </div>
                    <input
                      id="forgotEmail"
                      type="email"
                      required
                      autoFocus
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="compositor@ejemplo.com"
                      className="block w-full pl-10 pr-4 py-3 bg-[#f8fafc] border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-500 transition duration-200"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 font-montserrat disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                      <span>Enviando Código...</span>
                    </>
                  ) : (
                    <>
                      <span>Enviar Código de Recuperación</span>
                      <span className="material-symbols-outlined text-base">send</span>
                    </>
                  )}
                </button>

                <div className="pt-3 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode("login");
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-xs font-bold text-slate-600 hover:text-amber-600 inline-flex items-center gap-1 font-montserrat transition"
                  >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Volver a Iniciar Sesión
                  </button>
                </div>
              </form>
            ) : viewMode === "forgot_otp" ? (
              /* =========================================================
                   VISTA 2: RESTABLECER CONTRASEÑA CON OTP
                 ========================================================= */
              <form onSubmit={handleConfirmForgotOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 text-center font-montserrat">
                    Código de Seguridad (6 Dígitos) *
                  </label>
                  <div className="relative max-w-xs mx-auto">
                    <input
                      type="text"
                      required
                      maxLength={6}
                      autoFocus
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000"
                      className="w-full py-3 bg-[#f8fafc] border-2 border-amber-500/40 rounded-xl text-center text-xl font-mono font-black text-amber-700 tracking-[8px] focus:bg-white focus:outline-none focus:border-amber-500 shadow-inner"
                    />
                  </div>
                  <div className="text-center mt-1">
                    <span className="text-[11px] font-mono text-slate-500">
                      ⏱️ Expira en: <strong className="text-slate-800">{formatTimer(forgotTimer)}</strong>
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-montserrat">
                    Nueva Contraseña *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <span className="material-symbols-outlined text-base">lock</span>
                    </div>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="block w-full pl-10 pr-11 py-3 bg-[#f8fafc] border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                    >
                      <span className="material-symbols-outlined text-base">
                        {showNewPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-montserrat">
                    Confirmar Nueva Contraseña *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <span className="material-symbols-outlined text-base">lock_reset</span>
                    </div>
                    <input
                      type={showConfirmNewPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Repite tu contraseña"
                      className={`block w-full pl-10 pr-11 py-3 bg-[#f8fafc] border rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition ${
                        confirmNewPassword && confirmNewPassword !== newPassword
                          ? "border-red-400 focus:ring-red-400/50"
                          : confirmNewPassword && confirmNewPassword === newPassword
                          ? "border-emerald-400 focus:ring-emerald-400/50"
                          : "border-slate-200 focus:ring-amber-400/50 focus:border-amber-500"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                    >
                      <span className="material-symbols-outlined text-base">
                        {showConfirmNewPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                  {confirmNewPassword && confirmNewPassword !== newPassword && (
                    <p className="text-[11px] text-red-600 font-medium mt-1">
                      Las contraseñas no coinciden
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || forgotOtp.length !== 6 || newPassword.length < 6}
                  className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 font-montserrat disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                      <span>Guardando Contraseña...</span>
                    </>
                  ) : (
                    <>
                      <span>Restablecer y Guardar</span>
                      <span className="material-symbols-outlined text-base">check_circle</span>
                    </>
                  )}
                </button>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode("forgot_email");
                      setErrorMessage(null);
                    }}
                    className="font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 font-montserrat"
                  >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Cambiar Correo
                  </button>

                  <button
                    type="button"
                    disabled={!forgotCanResend || isSubmitting}
                    onClick={handleResendForgotOtp}
                    className={`font-bold font-montserrat ${
                      forgotCanResend
                        ? "text-amber-600 hover:underline"
                        : "text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {forgotCanResend ? "Reenviar Código" : `Reenviar en (${forgotResendCooldown}s)`}
                  </button>
                </div>
              </form>
            ) : (
              /* =========================================================
                   VISTA 3: LOGIN DE COMPOSITOR
                 ========================================================= */
              <form onSubmit={handleLogin} className="space-y-5">
                
                {/* Campo Correo */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 tracking-wide font-montserrat" htmlFor="email">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <span className="material-symbols-outlined text-base">mail</span>
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="tu.correo@ejemplo.com"
                      className="block w-full pl-10 pr-4 py-3 bg-[#f8fafc] border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-500 transition duration-200"
                    />
                  </div>
                </div>

                {/* Campo Contraseña */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 tracking-wide font-montserrat" htmlFor="password">
                      Contraseña
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setViewMode("forgot_email");
                        setForgotEmail(email);
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="text-xs font-bold text-[#0071bc] hover:underline transition-colors font-montserrat"
                    >
                      ¿Olvidaste tu clave?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <span className="material-symbols-outlined text-base">lock</span>
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Ingresa tu contraseña"
                      className="block w-full pl-10 pr-11 py-3 bg-[#f8fafc] border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-500 transition duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                    >
                      <span className="material-symbols-outlined text-base">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Recordar Sesión */}
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-600 font-medium cursor-pointer select-none">
                    Mantener sesión iniciada de forma segura
                  </label>
                </div>

                {/* Botón Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 font-montserrat disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                      <span>Validando Credenciales...</span>
                    </>
                  ) : (
                    <>
                      <span>Ingresar al Portal</span>
                      <span className="material-symbols-outlined text-base">login</span>
                    </>
                  )}
                </button>

              </form>
            )}

            {/* Footer de la Card */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
                <span className="material-symbols-outlined text-sm text-slate-400">verified_user</span>
                <span>Tus datos financieros y fiscales están protegidos</span>
              </div>
            </div>

          </section>

          {/* Enlace Volver a la Tienda */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Volver a la tienda principal
            </Link>
          </div>

        </div>
      </main>

      {/* Footer Minimalista */}
      <footer className="relative z-10 w-full border-t border-slate-200/80 bg-white/80 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Piano Colombia. Todos los derechos reservados. Ediciones Críticas y Urtext.
        </div>
      </footer>

    </div>
  );
}
