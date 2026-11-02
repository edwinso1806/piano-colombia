"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
  loginComposerApi,
  loginWithGoogleComposerApi,
  requestPasswordResetApi,
  confirmPasswordResetApi,
} from "@/lib/api-client";
import { localizeAuthMessage } from "@/lib/localize-messages";

export default function CompositorLoginPage() {
  const router = useRouter();
  const { composer, loginComposer, logoutComposer, isLoaded } = useAuth();
  const { t, language } = useLanguage();
  const isEn = language === "en";
  const [viewMode, setViewMode] = useState<"login" | "forgot_email" | "forgot_otp">("login");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Redirección automática si la sesión del compositor ya se encuentra abierta
  useEffect(() => {
    if (!isLoaded) return;
    if (composer && (composer.email || composer.id)) {
      const targetUrl = composer.status === "APPROVED" ? "/compositor/dashboard" : "/compositor/dashboard/perfil";
      router.replace(targetUrl);
    }
  }, [composer, isLoaded, router]);

  // Mensaje cuando la sesión ha expirado automáticamente
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("expired") === "true") {
        setErrorMessage(
          isEn
            ? "Your composer session has expired for security reasons. Please sign in again."
            : "Tu sesión de compositor ha expirado por motivos de seguridad. Por favor ingresa nuevamente."
        );
      }
    }
  }, [isEn]);

  // Google OAuth States
  const [googleClientId, setGoogleClientId] = useState<string>(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""
  );
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [isGsiLoaded, setIsGsiLoaded] = useState(false);
  const [showGoogleConfigModal, setShowGoogleConfigModal] = useState(false);
  const [customClientIdInput, setCustomClientIdInput] = useState("");

  // Cargar Google Identity Services Script
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ((window as any).google?.accounts) {
      setIsGsiLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsGsiLoaded(true);
    };
    script.onerror = () => {
      console.warn("No se pudo cargar el script de Google Identity Services.");
    };
    document.body.appendChild(script);
  }, []);

  const triggerGoogleOAuth = (clientIdToUse: string) => {
    if (typeof window === "undefined" || !(window as any).google?.accounts?.oauth2) {
      setErrorMessage(
        isEn
          ? "Google authentication service is still loading. Please try again in a moment."
          : "El servicio de autenticación de Google aún está cargando. Por favor intenta de nuevo en un segundo."
      );
      setIsGoogleSubmitting(false);
      return;
    }

    try {
      let safetyTimeout: NodeJS.Timeout | null = setTimeout(() => {
        setIsGoogleSubmitting(false);
      }, 30000);

      const handleWindowFocus = () => {
        setTimeout(() => {
          setIsGoogleSubmitting((prev) => (prev ? false : prev));
          window.removeEventListener("focus", handleWindowFocus);
        }, 1200);
      };
      window.addEventListener("focus", handleWindowFocus);

      const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: clientIdToUse,
        scope: "email profile openid",
        error_callback: (err: any) => {
          if (safetyTimeout) clearTimeout(safetyTimeout);
          console.warn("Google OAuth popup cerrado o cancelado por el usuario:", err);
          setIsGoogleSubmitting(false);
          window.removeEventListener("focus", handleWindowFocus);
        },
        callback: async (tokenResponse: any) => {
          if (safetyTimeout) clearTimeout(safetyTimeout);
          window.removeEventListener("focus", handleWindowFocus);

          if (tokenResponse.error) {
            console.error("Error en Google OAuth:", tokenResponse.error);
            setIsGoogleSubmitting(false);
            setErrorMessage(
              isEn
                ? `Error authenticating with Google: ${tokenResponse.error_description || tokenResponse.error}`
                : `Error al autenticar con Google: ${tokenResponse.error_description || tokenResponse.error}`
            );
            return;
          }

          try {
            // Obtener perfil verificado del usuario desde Google API
            const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
              headers: {
                Authorization: `Bearer ${tokenResponse.access_token}`,
              },
            });

            if (!userinfoRes.ok) {
              throw new Error(
                isEn
                  ? "Could not retrieve Google profile information."
                  : "No se pudo obtener la información de perfil de Google."
              );
            }

            const googleUser = await userinfoRes.json();
            const googleEmail = googleUser.email;
            const googleName = googleUser.name || googleUser.given_name || googleEmail.split("@")[0];
            const googleId = googleUser.sub;
            const googlePicture = googleUser.picture;

            // Enviar al backend de Medusa / PostgreSQL para compositores
            const res = await loginWithGoogleComposerApi({
              email: googleEmail,
              name: googleName,
              googleId,
              picture: googlePicture,
            });

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
            }, {
              token: res.token,
              rememberMe: true,
              expires_at: res.expires_at,
            });

            setSuccessMessage(
              res.isNew
                ? (isEn
                    ? `Welcome ${googleName}! Your composer account was created successfully.`
                    : `¡Bienvenido ${googleName}! Tu cuenta de compositor fue creada con éxito.`)
                : (isEn
                    ? `Welcome back ${googleName}! Successfully signed in with Google.`
                    : `¡Hola de nuevo ${googleName}! Inicio de sesión con Google exitoso.`)
            );

            setShowGoogleConfigModal(false);

            setTimeout(() => {
              if (res.composer.status !== "APPROVED") {
                router.push("/compositor/dashboard/perfil");
              } else {
                router.push("/compositor/dashboard");
              }
            }, 700);
          } catch (err: any) {
            console.error("Error procesando datos de Google:", err);
            setErrorMessage(
              localizeAuthMessage(err.message, isEn) ||
                (isEn
                  ? "Error synchronizing your Google account with Piano Colombia."
                  : (err.message || "Error al sincronizar tu cuenta de Google con Piano Colombia."))
            );
          } finally {
            setIsGoogleSubmitting(false);
          }
        },
      });

      tokenClient.requestAccessToken({ prompt: "select_account" });
    } catch (err: any) {
      console.error("Error inicializando cliente Google:", err);
      setIsGoogleSubmitting(false);
      setErrorMessage(
        isEn
          ? "Error opening Google Sign-In window."
          : (err.message || "Error al abrir la ventana de Google Sign-In.")
      );
    }
  };

  const handleGoogleAuth = () => {
    setIsGoogleSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const activeClientId = googleClientId.trim();

    if (!activeClientId) {
      setIsGoogleSubmitting(false);
      setShowGoogleConfigModal(true);
      return;
    }

    triggerGoogleOAuth(activeClientId);
  };

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
      }, {
        token: res.token,
        rememberMe,
        expires_at: res.expires_at,
      });

      // Si no está aprobado, se conduce directamente a completar su perfil
      if (res.composer.status !== "APPROVED") {
        router.push("/compositor/dashboard/perfil");
      } else {
        router.push("/compositor/dashboard");
      }
    } catch (err: any) {
      console.error("Fallo login de compositor en vivo:", err.message);
      setErrorMessage(
        localizeAuthMessage(err.message, isEn) ||
          (isEn
            ? "Incorrect email or password. Please verify your credentials."
            : "Correo o contraseña incorrectos. Por favor verifica tus credenciales.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes("@")) {
      setErrorMessage(
        isEn ? "Please enter a valid email address." : "Por favor ingresa un correo electrónico válido."
      );
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
      setSuccessMessage(
        isEn
          ? `6-digit OTP code successfully sent to ${forgotEmail}! (Please also check your Spam folder).`
          : (res.message || `Código enviado a ${forgotEmail}. Revisa tu bandeja de entrada o spam.`)
      );
    } catch (err: any) {
      console.error("Error al solicitar código:", err);
      setErrorMessage(
        localizeAuthMessage(err.message, isEn) ||
          (isEn ? "Error requesting password reset code." : "Error al solicitar el código de recuperación.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!forgotOtp || forgotOtp.trim().length !== 6) {
      setErrorMessage(
        isEn ? "Please enter the complete 6-digit code." : "Por favor ingresa el código completo de 6 dígitos."
      );
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage(
        isEn
          ? "The password must be at least 6 characters long for security."
          : "La contraseña debe tener al menos 6 caracteres por seguridad."
      );
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage(
        isEn ? "Passwords do not match. Please verify both fields." : "Las contraseñas no coinciden. Por favor verifica ambos campos."
      );
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

      setSuccessMessage(
        isEn
          ? "Password successfully reset! You can now log in."
          : (res.message || "¡Contraseña actualizada exitosamente! Ya puedes iniciar sesión.")
      );
      setEmail(forgotEmail.trim());
      setPassword("");
      setViewMode("login");
    } catch (err: any) {
      console.error("Error al restablecer contraseña de compositor:", err);
      setErrorMessage(
        localizeAuthMessage(err.message, isEn) ||
          (isEn ? "Incorrect or expired code. Please try again." : "Código incorrecto o expirado. Por favor intenta de nuevo.")
      );
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
      setSuccessMessage(
        isEn ? `New recovery code sent to ${forgotEmail}.` : `Nuevo código enviado a ${forgotEmail}.`
      );
    } catch (err: any) {
      setErrorMessage(
        localizeAuthMessage(err.message, isEn) || (isEn ? "Error resending code." : "Error al reenviar el código.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoaded && composer && (composer.email || composer.id)) {
    return (
      <div className="min-h-screen bg-[#F9F9FF] flex flex-col items-center justify-center p-6 text-center font-montserrat">
        <div className="w-12 h-12 border-4 border-[#FBB03B] border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-base font-extrabold text-[#111C2D]">
          {isEn ? "Session active. Redirecting to your panel..." : "Sesión activa. Accediendo a tu panel de compositor..."}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {composer.artistic_name || composer.email}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-inter antialiased relative flex flex-col justify-between overflow-x-hidden selection:bg-[#fbb03b] selection:text-slate-900">
      
      {/* Background Visuals */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,transparent_32px,rgba(15,23,42,0.035)_32px,rgba(15,23,42,0.035)_33px)] opacity-70"></div>
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-full max-w-[850px] h-[400px] bg-gradient-to-b from-amber-100/60 via-blue-50/40 to-transparent rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 inset-x-0 h-96 bg-[radial-gradient(circle_at_50%_110%,rgba(251,176,59,0.12)_0%,rgba(0,113,188,0.04)_40%,transparent_75%)]"></div>
      </div>

      {/* Header Fijo con Logo Stitch y Selector de Idioma */}
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
                {t("auth.brand_sub", "Archivo & Partituras")}
              </span>
            </div>
          </Link>

          {/* Acciones Derechas Header: Selector Idioma + Registro */}
          <div className="flex items-center gap-3 sm:gap-5">
            <LanguageSwitcher />

            <Link
              href="/compositor/registro"
              className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-amber-600 transition-all duration-200 flex items-center gap-1.5 group"
            >
              <span className="text-slate-500 hidden sm:inline font-normal">{t("auth.dont_have_account", "¿No tienes cuenta?")}</span>
              <span className="font-bold text-slate-900 group-hover:text-amber-600 underline underline-offset-4 decoration-amber-400 group-hover:decoration-amber-600">
                {t("auth.register_here", "Regístrate aquí")}
              </span>
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
                <span>{t("auth.restricted_badge", "Portal Exclusivo · Acceso Restringido")}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-[#0f172a] tracking-tight font-montserrat">
                {t("auth.composer_title", "Portal de Compositores")}
              </h1>
              <p className="mt-2.5 text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto font-normal">
                {t("auth.composer_subtitle", "Ingresa con tus credenciales registradas para gestionar tu catálogo, regalías y perfil artístico.")}
              </p>
            </div>

            {/* Mensajes de Notificación */}
            {errorMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-3">
                <span className="material-symbols-outlined text-base text-red-600 shrink-0">error</span>
                <span>{localizeAuthMessage(errorMessage, isEn)}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-3">
                <span className="material-symbols-outlined text-base text-emerald-600 shrink-0">check_circle</span>
                <span>{localizeAuthMessage(successMessage, isEn)}</span>
              </div>
            )}

            {/* =========================================================
                 VISTA 1: RECUPERAR CONTRASEÑA (SOLICITAR CÓDIGO)
               ========================================================= */}
            {viewMode === "forgot_email" ? (
              <form onSubmit={handleRequestForgotOtp} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 tracking-wide font-montserrat" htmlFor="forgotEmail">
                    {t("auth.forgot_email_label", "Correo Electrónico de Compositor")}
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
                      placeholder={t("auth.email_placeholder", "tu.correo@ejemplo.com")}
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
                      <span>{t("auth.sending_code", "Enviando Código...")}</span>
                    </>
                  ) : (
                    <>
                      <span>{t("auth.send_code_btn", "Enviar Código de Recuperación")}</span>
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
                    {t("auth.back_to_login", "Volver a Iniciar Sesión")}
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
                    {t("auth.security_code_label", "Código de Seguridad (6 Dígitos) *")}
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
                      {t("auth.expires_in", "⏱️ Expira en:")} <strong className="text-slate-800">{formatTimer(forgotTimer)}</strong>
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-montserrat">
                    {t("auth.new_password_label", "Nueva Contraseña *")}
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
                      placeholder={t("auth.min_chars", "Mínimo 6 caracteres")}
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
                    {t("auth.confirm_new_password_label", "Confirmar Nueva Contraseña *")}
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
                      placeholder={t("auth.repeat_password", "Repite tu contraseña")}
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
                      {t("auth.passwords_dont_match", "Las contraseñas no coinciden")}
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
                      <span>{t("auth.saving_password", "Guardando Contraseña...")}</span>
                    </>
                  ) : (
                    <>
                      <span>{t("auth.save_and_reset_btn", "Restablecer y Guardar")}</span>
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
                    {t("auth.change_email", "Cambiar Correo")}
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
                    {forgotCanResend ? t("auth.resend_code", "Reenviar Código") : `${t("auth.resend_in", "Reenviar en")} (${forgotResendCooldown}s)`}
                  </button>
                </div>
              </form>
            ) : (
              /* =========================================================
                   VISTA 3: LOGIN DE COMPOSITOR
                 ========================================================= */
              <div className="space-y-6">
                {/* Botón Google OAuth */}
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={isGoogleSubmitting || isSubmitting}
                  className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all duration-200 font-montserrat flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                >
                  {isGoogleSubmitting ? (
                    <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>
                    {t("auth.continue_with_google", isEn ? "Continue with Google" : "Continuar con Google")}
                  </span>
                </button>

                {/* Divisor "o con credenciales" */}
                <div className="relative flex items-center justify-center">
                  <div className="w-full border-t border-slate-200"></div>
                  <span className="absolute bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-montserrat">
                    {t("auth.or_with_credentials", isEn ? "or with credentials" : "o con credenciales")}
                  </span>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                
                {/* Campo Correo */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 tracking-wide font-montserrat" htmlFor="email">
                    {t("auth.email", "Correo Electrónico")}
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
                      placeholder={t("auth.email_placeholder", "tu.correo@ejemplo.com")}
                      className="block w-full pl-10 pr-4 py-3 bg-[#f8fafc] border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-500 transition duration-200"
                    />
                  </div>
                </div>

                {/* Campo Contraseña */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 tracking-wide font-montserrat" htmlFor="password">
                      {t("auth.password", "Contraseña")}
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
                      {t("auth.forgot_password", "¿Olvidaste tu contraseña?")}
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
                      placeholder={t("auth.password_placeholder", "Ingresa tu contraseña")}
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
                    {t("auth.keep_logged_in", "Mantener sesión iniciada de forma segura")}
                  </label>
                </div>

                {/* Botón Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 font-montserrat disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                      <span>{t("auth.signing_in", "Validando Credenciales...")}</span>
                    </>
                  ) : (
                    <>
                      <span>{t("auth.sign_in", "Ingresar al Panel")}</span>
                      <span className="material-symbols-outlined text-base">login</span>
                    </>
                  )}
                </button>

              </form>
              </div>
            )}

            {/* Footer de la Card */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
                <span className="material-symbols-outlined text-sm text-slate-400">verified_user</span>
                <span>{t("auth.security_notice", "Tus datos financieros y fiscales están protegidos")}</span>
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
              {t("auth.back_to_store", "Volver a la tienda principal")}
            </Link>
          </div>

        </div>

      {/* Modal de Configuración Google OAuth de Respaldo */}
      {showGoogleConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-black/10 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                  <span className="material-symbols-outlined text-xl">vpn_key</span>
                </div>
                <div>
                  <h3 className="font-montserrat font-black text-lg text-[#111C2D]">
                    {isEn ? "Configure Google OAuth Client ID" : "Configurar Google OAuth Client ID"}
                  </h3>
                  <p className="text-xs text-[#64748b]">
                    {isEn ? "Google Cloud Console credentials" : "Credenciales de Google Cloud Console"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleConfigModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#334155] leading-relaxed">
              <p>
                {isEn
                  ? "To enable Google Sign-In, enter your Google OAuth 2.0 Client ID from Google Cloud Console:"
                  : "Para activar el inicio de sesión con Google, ingresa tu Google OAuth 2.0 Client ID de Google Cloud Console:"}
              </p>

              <div>
                <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
                  {isEn ? "Paste your Google Client ID:" : "Pega tu Google Client ID:"}
                </label>
                <input
                  type="text"
                  placeholder="Ej: 123456789-abcdef.apps.googleusercontent.com"
                  value={customClientIdInput}
                  onChange={(e) => setCustomClientIdInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-black/10 rounded-xl text-xs font-mono text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <p className="text-[11px] text-[#64748b]">
                💡 Tip: {isEn ? "Save it permanently in" : "Puedes guardarlo permanentemente en"} <code className="font-mono font-bold text-[#111C2D]">storefront/.env.local</code> {isEn ? "as" : "como"} <code className="font-mono font-bold text-amber-600">NEXT_PUBLIC_GOOGLE_CLIENT_ID=tu_id</code>.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/5">
              <button
                type="button"
                onClick={() => setShowGoogleConfigModal(false)}
                className="px-4 py-2.5 rounded-xl border border-black/10 text-xs font-bold text-[#4C4546] hover:bg-slate-50 font-montserrat"
              >
                {isEn ? "Cancel" : "Cancelar"}
              </button>
              <button
                type="button"
                disabled={!customClientIdInput.trim()}
                onClick={() => {
                  const cleanedId = customClientIdInput.trim();
                  setGoogleClientId(cleanedId);
                  triggerGoogleOAuth(cleanedId);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 text-xs font-extrabold rounded-xl shadow-md transition font-montserrat flex items-center gap-2 cursor-pointer"
              >
                <span>{isEn ? "Connect with Google" : "Conectar con Google"}</span>
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </button>
            </div>
          </div>
        </div>
      )}
      </main>

      {/* Footer Minimalista */}
      <footer className="relative z-10 w-full border-t border-slate-200/80 bg-white/80 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Piano Colombia. {t("auth.rights_reserved", "Todos los derechos reservados. Ediciones Críticas y Urtext.")}
        </div>
      </footer>

    </div>
  );
}
