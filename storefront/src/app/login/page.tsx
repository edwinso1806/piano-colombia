"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  loginCustomerApi,
  sendOtpRegisterApi,
  verifyOtpRegisterApi,
  loginWithGoogleApi,
  requestPasswordResetApi,
  confirmPasswordResetApi,
} from "@/lib/api-client";
import { localizeAuthMessage } from "@/lib/localize-messages";

function CustomerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/mi-cuenta/descargas";
  const { loginCustomer, customer, isLoaded } = useAuth();
  const { t, language } = useLanguage();
  const isEn = language === "en";

  // Redirección si la sesión del cliente ya se encuentra activa
  useEffect(() => {
    if (!isLoaded) return;
    if (customer && (customer.email || customer.id)) {
      router.replace(redirectPath);
    }
  }, [customer, isLoaded, redirectPath, router]);

  const [mode, setMode] = useState<"login" | "register" | "forgot_email" | "forgot_otp">("login");

  const [registerStep, setRegisterStep] = useState<"form" | "otp">("form");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);

  // OTP Verification States (Registro)
  const [otpCode, setOtpCode] = useState("");
  const [timerSeconds, setTimerSeconds] = useState(600); // 10 min
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);

  // Password Reset States (Recuperación)
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [forgotTimer, setForgotTimer] = useState(600); // 10 min
  const [forgotCanResend, setForgotCanResend] = useState(false);
  const [forgotResendCooldown, setForgotResendCooldown] = useState(60);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // Mensaje cuando la sesión ha expirado
  useEffect(() => {
    if (searchParams.get("expired") === "true") {
      setNotification({
        type: "error",
        message: isEn
          ? "Your customer session has expired for security reasons. Please sign in again."
          : "Tu sesión ha expirado por límite de tiempo o inactividad. Por favor ingresa nuevamente.",
      });
    }
  }, [searchParams, isEn]);

  // Countdown timer for Registration OTP
  useEffect(() => {
    let interval: any = null;
    if (registerStep === "otp" && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [registerStep, timerSeconds]);

  // Resend cooldown timer for Registration OTP
  useEffect(() => {
    let interval: any = null;
    if (registerStep === "otp" && resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [registerStep, resendCooldown]);

  // Countdown timer for Password Reset OTP
  useEffect(() => {
    let interval: any = null;
    if (mode === "forgot_otp" && forgotTimer > 0) {
      interval = setInterval(() => {
        setForgotTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mode, forgotTimer]);

  // Resend cooldown timer for Password Reset OTP
  useEffect(() => {
    let interval: any = null;
    if (mode === "forgot_otp" && forgotResendCooldown > 0) {
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
  }, [mode, forgotResendCooldown]);

  // A. Manejador de Solicitud de Código de Recuperación
  const handleRequestForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes("@")) {
      setNotification({
        type: "error",
        message: isEn ? "Please enter a valid email address." : "Por favor ingresa un correo electrónico válido.",
      });
      return;
    }

    setIsSubmitting(true);
    setNotification(null);

    try {
      const res = await requestPasswordResetApi({
        email: forgotEmail.trim(),
        role: "customer",
      });

      setMode("forgot_otp");
      setForgotTimer(600);
      setForgotResendCooldown(60);
      setForgotCanResend(false);
      setForgotOtp("");
      setNewPassword("");
      setConfirmNewPassword("");
      setNotification({
        type: "info",
        message: isEn
          ? `6-digit OTP code successfully sent to ${forgotEmail}! (Please also check your Spam folder).`
          : (res.message || `Hemos enviado un código de 6 dígitos a ${forgotEmail}. Revisa tu bandeja de entrada o spam.`),
      });
    } catch (err: any) {
      console.error("Error al solicitar código de recuperación:", err);
      setNotification({
        type: "error",
        message: isEn
          ? "Error requesting password reset code."
          : (err.message || "Error al solicitar el código de recuperación."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // B. Manejador de Confirmación y Cambio de Contraseña
  const handleConfirmForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!forgotOtp || forgotOtp.trim().length !== 6) {
      setNotification({
        type: "error",
        message: isEn ? "Please enter the complete 6-digit code." : "Por favor ingresa el código de 6 dígitos completo.",
      });
      return;
    }

    if (newPassword.length < 6) {
      setNotification({
        type: "error",
        message: isEn
          ? "The new password must be at least 6 characters long for security."
          : "La nueva contraseña debe tener al menos 6 caracteres por seguridad.",
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setNotification({
        type: "error",
        message: isEn
          ? "Passwords do not match. Please verify both fields."
          : "Las contraseñas no coinciden. Por favor verifica ambos campos.",
      });
      return;
    }

    setIsSubmitting(true);
    setNotification(null);

    try {
      const res = await confirmPasswordResetApi({
        email: forgotEmail.trim(),
        code: forgotOtp.trim(),
        newPassword,
        role: "customer",
      });

      setNotification({
        type: "success",
        message: isEn
          ? "Password successfully reset! You can now log in."
          : (res.message || "¡Contraseña actualizada con éxito! Ya puedes iniciar sesión."),
      });

      setEmail(forgotEmail.trim());
      setPassword("");
      setMode("login");
    } catch (err: any) {
      console.error("Error al restablecer contraseña:", err);
      setNotification({
        type: "error",
        message: isEn
          ? "Invalid or expired code. Please try again."
          : (err.message || "Código incorrecto o expirado. Por favor intenta de nuevo."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // C. Reenviar Código de Recuperación
  const handleResendForgotOtp = async () => {
    if (!forgotCanResend) return;
    setIsSubmitting(true);
    setNotification(null);

    try {
      await requestPasswordResetApi({
        email: forgotEmail.trim(),
        role: "customer",
      });
      setForgotTimer(600);
      setForgotResendCooldown(60);
      setForgotCanResend(false);
      setForgotOtp("");
      setNotification({
        type: "info",
        message: isEn ? `New recovery code sent to ${forgotEmail}.` : `Nuevo código de recuperación enviado a ${forgotEmail}.`,
      });
    } catch (err: any) {
      setNotification({
        type: "error",
        message: isEn ? "Error resending code." : (err.message || "Error al reenviar el código."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Manejador de Login o Enviar OTP en Registro
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotification(null);

    try {
      if (mode === "register") {
        if (password !== confirmPassword) {
          setNotification({
            type: "error",
            message: isEn ? "Passwords do not match. Please verify both fields." : "Las contraseñas no coinciden. Por favor verifica ambos campos.",
          });
          setIsSubmitting(false);
          return;
        }

        if (password.length < 6) {
          setNotification({
            type: "error",
            message: isEn ? "Password must be at least 6 characters long for security." : "La contraseña debe tener al menos 6 caracteres por seguridad.",
          });
          setIsSubmitting(false);
          return;
        }

        // Enviar OTP al correo del usuario
        const res = await sendOtpRegisterApi({
          fullName,
          email,
          password,
          phone: phone.trim() || undefined,
        });

        setRegisterStep("otp");
        setTimerSeconds(600);
        setResendCooldown(60);
        setCanResend(false);
        setNotification({
          type: "info",
          message: isEn
            ? `We have sent a 6-digit verification code to ${email}. Check your inbox or spam folder.`
            : (res.message || `Hemos enviado un código de 6 dígitos a ${email}. Revisa tu bandeja de entrada o spam.`),
        });
      } else {
        // Login estándar contra PostgreSQL
        const res = await loginCustomerApi(email, password);
        loginCustomer({
          id: res.customer?.id,
          email: res.customer.email,
          fullName: res.customer.fullName,
          phone: res.customer.phone || undefined,
          taxId: res.customer.taxId || undefined,
        }, {
          token: res.token,
          expires_at: res.expires_at,
        });
        setNotification({
          type: "success",
          message: isEn ? "Authentication successful! Redirecting..." : "¡Autenticación exitosa! Redirigiendo...",
        });

        setTimeout(() => {
          router.push(redirectPath);
        }, 500);
      }
    } catch (err: any) {
      console.error("Error en autenticación:", err.message);
      setNotification({
        type: "error",
        message: localizeAuthMessage(err.message, isEn) || (isEn ? "Incorrect email or password. Please check your credentials." : "Correo o contraseña incorrectos. Por favor verifica tus credenciales."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Manejador de Verificación de Código OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setNotification({
        type: "error",
        message: isEn ? "Please enter the complete 6-digit numeric verification code." : "Por favor ingresa el código completo de 6 dígitos numéricos.",
      });
      return;
    }

    setIsSubmitting(true);
    setNotification(null);

    try {
      const res = await verifyOtpRegisterApi({
        email,
        code: otpCode.trim(),
      });

      loginCustomer({
        id: res.customer?.id,
        email: res.customer.email,
        fullName: res.customer.fullName,
        phone: res.customer.phone || phone.trim() || undefined,
        taxId: res.customer.taxId || undefined,
      }, {
        token: res.token,
        expires_at: res.expires_at,
      });

      setNotification({
        type: "success",
        message: isEn ? "Email verified and account created successfully! Redirecting..." : "¡Correo verificado y cuenta creada con éxito en base de datos! Redirigiendo...",
      });

      setTimeout(() => {
        router.push(redirectPath);
      }, 700);
    } catch (err: any) {
      console.error("Error al validar OTP:", err.message);
      setNotification({
        type: "error",
        message: localizeAuthMessage(err.message, isEn) || (isEn ? "Incorrect or expired code. Please try again." : "Código incorrecto o expirado. Por favor intenta de nuevo."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Reenviar Código OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    setIsSubmitting(true);
    setNotification(null);

    try {
      await sendOtpRegisterApi({
        fullName,
        email,
        password,
      });
      setTimerSeconds(600);
      setResendCooldown(60);
      setCanResend(false);
      setOtpCode("");
      setNotification({
        type: "info",
        message: isEn ? `New code generated and sent to ${email}.` : `Nuevo código generado y enviado a ${email}.`,
      });
    } catch (err: any) {
      setNotification({
        type: "error",
        message: isEn ? "Error resending code." : (err.message || "Error al reenviar el código."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const [googleClientId, setGoogleClientId] = useState<string>(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""
  );
  const [showGoogleConfigModal, setShowGoogleConfigModal] = useState(false);
  const [customClientIdInput, setCustomClientIdInput] = useState("");
  const [isGsiLoaded, setIsGsiLoaded] = useState(false);

  // Load Google Identity Services Script
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

    return () => {
      // cleanup script if component unmounts before loading
    };
  }, []);

  // 4. Inicio de Sesión y Registro REAL con Google OAuth 2.0
  const triggerGoogleOAuth = (clientIdToUse: string) => {
    if (typeof window === "undefined" || !(window as any).google?.accounts?.oauth2) {
      setNotification({
        type: "error",
        message: isEn
          ? "Google authentication service is still loading. Please try again in a moment."
          : "El servicio de autenticación de Google aún está cargando. Por favor intenta de nuevo en un segundo.",
      });
      setIsGoogleSubmitting(false);
      return;
    }

    try {
      let safetyTimeout: NodeJS.Timeout | null = setTimeout(() => {
        setIsGoogleSubmitting(false);
      }, 30000);

      // Fallback: Si el usuario cierra el popup de Google manualmente o hace clic fuera
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
            setNotification({
              type: "error",
              message: isEn
                ? `Error authenticating with Google: ${tokenResponse.error_description || tokenResponse.error}`
                : `Error al autenticar con Google: ${tokenResponse.error_description || tokenResponse.error}`,
            });
            return;
          }

          console.log("🟢 [Google OAuth] Token recibido de Google:", tokenResponse);
          setNotification({
            type: "info",
            message: isEn ? "Connecting to Piano Colombia server..." : "Conectando con el servidor de Piano Colombia...",
          });

          try {
            // Obtener perfil verificado del usuario desde Google API
            const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
              headers: {
                Authorization: `Bearer ${tokenResponse.access_token}`,
              },
            });

            if (!userinfoRes.ok) {
              throw new Error(isEn ? "Could not retrieve Google profile information." : "No se pudo obtener la información de perfil de Google.");
            }

            const googleUser = await userinfoRes.json();
            console.log("👤 [Google OAuth] Perfil Google verificado:", googleUser.email);
            const email = googleUser.email;
            const name = googleUser.name || googleUser.given_name || email.split("@")[0];
            const googleId = googleUser.sub;
            const picture = googleUser.picture;

            // Enviar al backend de Medusa / PostgreSQL
            const res = await loginWithGoogleApi({
              email,
              name,
              googleId,
              picture,
            });

            loginCustomer({
              id: res.customer?.id,
              email: res.customer.email,
              fullName: res.customer.fullName,
              phone: res.customer.phone || undefined,
              taxId: res.customer.taxId || undefined,
            }, {
              token: res.token,
              expires_at: res.expires_at,
              rememberMe: true,
            });

            setNotification({
              type: "success",
              message: res.isNew
                ? (isEn ? `Welcome ${name}! Your Google account was linked and created successfully.` : `¡Bienvenido ${name}! Tu cuenta de Google fue vinculada y creada con éxito.`)
                : (isEn ? `Welcome back ${name}! Successfully signed in with Google.` : `¡Hola de nuevo ${name}! Inicio de sesión con Google exitoso.`),
            });

            setShowGoogleConfigModal(false);

            setTimeout(() => {
              router.push(redirectPath);
            }, 700);
          } catch (err: any) {
            console.error("Error procesando datos de Google:", err);
            setNotification({
              type: "error",
              message: isEn
                ? "Error synchronizing your Google account with Piano Colombia."
                : (err.message || "Error al sincronizar tu cuenta de Google con Piano Colombia."),
            });
          } finally {
            setIsGoogleSubmitting(false);
          }
        },
      });

      tokenClient.requestAccessToken({ prompt: "select_account" });
    } catch (err: any) {
      console.error("Error inicializando cliente Google:", err);
      setIsGoogleSubmitting(false);
      setNotification({
        type: "error",
        message: isEn ? "Error opening Google Sign-In window." : (err.message || "Error al abrir la ventana de Google Sign-In."),
      });
    }
  };

  const handleGoogleAuth = () => {
    setIsGoogleSubmitting(true);
    setNotification(null);

    const activeClientId = googleClientId.trim();

    if (!activeClientId) {
      setIsGoogleSubmitting(false);
      setShowGoogleConfigModal(true);
      return;
    }

    triggerGoogleOAuth(activeClientId);
  };

  // Formato minutos:segundos
  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (isLoaded && customer && (customer.email || customer.id)) {
    return (
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-20 flex items-center justify-center">
        <div className="text-center font-montserrat space-y-4">
          <div className="w-12 h-12 border-4 border-[#0071BC] border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-base font-extrabold text-[#111C2D]">
            {isEn ? "Session active. Redirecting..." : "Sesión activa. Redirigiendo a tu cuenta..."}
          </h2>
          <p className="text-xs text-slate-500">{customer.fullName || customer.email}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        
        {/* Encabezado del Formulario */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F3FF] border border-[#0071BC]/10 text-[#0071BC] text-[11px] font-extrabold uppercase tracking-wider mb-2 font-montserrat">
            <span className="material-symbols-outlined text-xs">account_circle</span>
            {isEn ? "Customer Area • Piano Colombia" : "Área de Clientes • Piano Colombia"}
          </div>

          <h1 className="text-3xl font-black font-montserrat text-[#111C2D] tracking-tight">
            {registerStep === "otp"
              ? (isEn ? "Verify Your Email" : "Verifica tu Correo")
              : mode === "login"
              ? (isEn ? "Welcome Back" : "Bienvenido de Nuevo")
              : (isEn ? "Create Your Customer Account" : "Crea tu Cuenta de Cliente")}
          </h1>
          <p className="text-xs sm:text-sm text-[#4C4546] font-medium leading-relaxed">
            {registerStep === "otp"
              ? (isEn ? "Enter the 6-digit OTP code sent to your inbox to verify your email." : "Ingresa el código OTP de 6 dígitos que enviamos a tu bandeja para validar tu correo.")
              : mode === "login"
              ? (isEn ? "Enter your registered credentials to manage your scores and official downloads." : "Ingresa tus credenciales registradas para gestionar tus partituras y descargas oficiales.")
              : (isEn ? "Sign up with email or Google to download official authorized Urtext editions." : "Regístrate con tu correo o Google para descargar ediciones digitales Urtext autorizadas.")}
          </p>
        </div>

        {/* Notificación si viene de Checkout */}
        {redirectPath.includes("checkout") && registerStep === "form" && (
          <div className="p-3.5 bg-[#F0F3FF] border border-[#0071BC]/20 rounded-2xl flex items-center gap-3 text-xs text-[#0071BC] font-medium">
            <span className="material-symbols-outlined text-lg shrink-0">shopping_cart_checkout</span>
            <span>
              {isEn
                ? <>Sign in or register to link your purchase to your <strong>nominative legal license</strong>.</>
                : <>Inicia sesión o regístrate para vincular tu compra a tu <strong>licencia legal nominativa</strong>.</>}
            </span>
          </div>
        )}

        {/* Notificación Dinámica de Error o Éxito */}
        {notification && (
          <div
            className={`p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-medium animate-in fade-in duration-200 ${
              notification.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : notification.type === "info"
                ? "bg-[#F0F3FF] border border-[#0071BC]/20 text-[#0071BC]"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            <span className="material-symbols-outlined text-base shrink-0">
              {notification.type === "success" ? "check_circle" : notification.type === "info" ? "info" : "error"}
            </span>
            <span>{localizeAuthMessage(notification.message, isEn)}</span>
          </div>
        )}

        {/* Card Principal de Login/Registro */}
        <div className="bg-white rounded-2xl border border-black/5 shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-7 sm:p-8 space-y-6">

          {/* =========================================================
                 VISTA OTP: VERIFICACIÓN DE CÓDIGO DE 6 DÍGITOS
             ========================================================= */}
          {registerStep === "otp" ? (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-[#F0F3FF] text-[#0071BC] rounded-2xl flex items-center justify-center mx-auto border border-[#0071BC]/10">
                  <span className="material-symbols-outlined text-2xl">mark_email_read</span>
                </div>
                <p className="text-xs text-[#4C4546]">
                  {isEn ? "Code sent to:" : "Código enviado a:"} <strong className="text-[#111C2D]">{email}</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111C2D] mb-2 font-montserrat text-center">
                  {isEn ? "Security Code (6 Digits) *" : "Código de Seguridad (6 Dígitos) *"}
                </label>
                <div className="relative max-w-xs mx-auto">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    className="w-full py-3.5 bg-[#F0F3FF] border-2 border-[#0071BC]/30 rounded-2xl text-center text-2xl font-mono font-black text-[#0071BC] tracking-[10px] focus:bg-white focus:outline-none focus:border-[#0071BC] shadow-inner"
                  />
                </div>
                <div className="text-center mt-2">
                  <span className="text-[11px] font-mono text-[#64748b]">
                    {isEn ? "⏱️ Expires in:" : "⏱️ Expira en:"} <strong className="text-[#111C2D]">{formatTimer(timerSeconds)}</strong>
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || otpCode.length !== 6}
                className="w-full py-3.5 bg-[#FBB03B] hover:bg-[#e09b2e] disabled:opacity-60 disabled:cursor-not-allowed text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#111C2D] border-t-transparent rounded-full animate-spin"></span>
                    {isEn ? "Verifying Code..." : "Verificando Código..."}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">verified_user</span>
                    {isEn ? "Verify and Create Account" : "Verificar y Crear Cuenta"}
                  </>
                )}
              </button>

              <div className="pt-2 border-t border-black/5 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setRegisterStep("form");
                    setNotification(null);
                  }}
                  className="font-bold text-[#4C4546] hover:text-[#111C2D] flex items-center gap-1 font-montserrat cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  {isEn ? "Change Email" : "Cambiar Correo"}
                </button>

                <button
                  type="button"
                  disabled={!canResend || isSubmitting}
                  onClick={handleResendOtp}
                  className={`font-bold font-montserrat ${
                    canResend
                      ? "text-[#0071BC] hover:underline cursor-pointer"
                      : "text-[#94a3b8] cursor-not-allowed"
                  }`}
                >
                  {canResend
                    ? (isEn ? "Resend Code" : "Reenviar Código")
                    : (isEn ? `Resend in (${resendCooldown}s)` : `Reenviar en (${resendCooldown}s)`)}
                </button>
              </div>
            </form>
          ) : mode === "forgot_email" ? (
            <form onSubmit={handleRequestForgotOtp} className="space-y-5">
              <div className="text-center space-y-1.5 pb-2 border-b border-black/5">
                <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center mx-auto border border-amber-200/80">
                  <span className="material-symbols-outlined text-2xl">lock_reset</span>
                </div>
                <h2 className="font-montserrat font-extrabold text-base text-[#111C2D]">
                  {isEn ? "Reset Password" : "Recuperar Contraseña"}
                </h2>
                <p className="text-xs text-[#4C4546] max-w-xs mx-auto">
                  {isEn
                    ? "Enter your registered email address and we will send you a security code to reset your password."
                    : "Ingresa tu correo electrónico registrado y te enviaremos un código de seguridad para restablecer tu clave."}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
                  {isEn ? "Registered Email Address *" : "Correo Electrónico Registrado *"}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4C4546] text-lg">
                    mail
                  </span>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="tu.correo@ejemplo.com"
                    className="w-full pl-10 pr-4 py-3 bg-[#F0F3FF] border border-black/5 rounded-xl text-xs text-[#111C2D] placeholder-[#4C4546]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#111C2D] border-t-transparent rounded-full animate-spin"></span>
                    {isEn ? "Sending Code..." : "Enviando Código..."}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">send</span>
                    {isEn ? "Send Reset Code" : "Enviar Código de Recuperación"}
                  </>
                )}
              </button>

              <div className="pt-2 border-t border-black/5 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setNotification(null);
                  }}
                  className="text-xs font-bold text-[#0071BC] hover:underline font-montserrat inline-flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  {isEn ? "Back to Sign In" : "Volver a Iniciar Sesión"}
                </button>
              </div>
            </form>
          ) : mode === "forgot_otp" ? (

                /* =========================================================
                     VISTA RECUPERAR CONTRASEÑA: PASO 2 (VALIDAR Y NUEVA CLAVE)
                   ========================================================= */
                <form onSubmit={handleConfirmForgotOtp} className="space-y-4">
                  <div className="text-center space-y-1.5 pb-2 border-b border-black/5">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
                      <span className="material-symbols-outlined text-2xl">key</span>
                    </div>
                    <h2 className="font-montserrat font-extrabold text-base text-[#111C2D]">
                      {isEn ? "Create New Password" : "Crear Nueva Contraseña"}
                    </h2>
                    <p className="text-xs text-[#4C4546]">
                      {isEn ? "Code sent to: " : "Código enviado a: "}
                      <strong className="text-[#111C2D]">{forgotEmail}</strong>
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat text-center">
                      {isEn ? "Security Code (6 Digits) *" : "Código de Seguridad (6 Dígitos) *"}
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
                        className="w-full py-3 bg-[#F0F3FF] border-2 border-[#0071BC]/30 rounded-xl text-center text-xl font-mono font-black text-[#0071BC] tracking-[8px] focus:bg-white focus:outline-none focus:border-[#0071BC]"
                      />
                    </div>
                    <div className="text-center mt-1">
                      <span className="text-[11px] font-mono text-[#64748b]">
                        {isEn ? "⏱️ Expires in: " : "⏱️ Expira en: "}
                        <strong className="text-[#111C2D]">{formatTimer(forgotTimer)}</strong>
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
                      {isEn ? "New Password *" : "Nueva Contraseña *"}
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4C4546] text-lg">
                        lock
                      </span>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={isEn ? "Minimum 6 characters" : "Mínimo 6 caracteres"}
                        className="w-full pl-10 pr-10 py-3 bg-[#F0F3FF] border border-black/5 rounded-xl text-xs text-[#111C2D] placeholder-[#4C4546]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4C4546] hover:text-[#111C2D]"
                      >
                        <span className="material-symbols-outlined text-lg">
                          {showNewPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
                      {isEn ? "Confirm New Password *" : "Confirmar Nueva Contraseña *"}
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4C4546] text-lg">
                        lock_reset
                      </span>
                      <input
                        type={showConfirmNewPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder={isEn ? "Repeat your new password" : "Repite tu nueva contraseña"}
                        className={`w-full pl-10 pr-10 py-3 bg-[#F0F3FF] border rounded-xl text-xs text-[#111C2D] placeholder-[#4C4546]/60 focus:bg-white focus:outline-none focus:ring-2 ${
                          confirmNewPassword && confirmNewPassword !== newPassword
                            ? "border-red-400 focus:ring-red-400"
                            : confirmNewPassword && confirmNewPassword === newPassword
                            ? "border-emerald-400 focus:ring-emerald-400"
                            : "border-black/5 focus:ring-[#0071BC]"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4C4546] hover:text-[#111C2D]"
                      >
                        <span className="material-symbols-outlined text-lg">
                          {showConfirmNewPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                    {confirmNewPassword && confirmNewPassword !== newPassword && (
                      <p className="text-[11px] text-red-600 font-medium mt-1">
                        {isEn ? "Passwords do not match" : "Las contraseñas no coinciden"}
                      </p>
                    )}
                    {confirmNewPassword && confirmNewPassword === newPassword && (
                      <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">check</span>
                        {isEn ? "Passwords match" : "Las contraseñas coinciden"}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || forgotOtp.length !== 6 || newPassword.length < 6}
                    className="w-full py-3.5 bg-[#FBB03B] hover:bg-[#e09b2e] disabled:opacity-60 disabled:cursor-not-allowed text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-[#111C2D] border-t-transparent rounded-full animate-spin"></span>
                        {isEn ? "Updating Password..." : "Actualizando Contraseña..."}
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                        {isEn ? "Reset and Save Password" : "Restablecer y Guardar Contraseña"}
                      </>
                    )}
                  </button>

                  <div className="pt-2 border-t border-black/5 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgot_email");
                        setNotification(null);
                      }}
                      className="font-bold text-[#4C4546] hover:text-[#111C2D] flex items-center gap-1 font-montserrat"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_back</span>
                      {isEn ? "Change Email" : "Cambiar Correo"}
                    </button>

                    <button
                      type="button"
                      disabled={!forgotCanResend || isSubmitting}
                      onClick={handleResendForgotOtp}
                      className={`font-bold font-montserrat ${
                        forgotCanResend
                          ? "text-[#0071BC] hover:underline"
                          : "text-[#94a3b8] cursor-not-allowed"
                      }`}
                    >
                      {forgotCanResend
                        ? (isEn ? "Resend Code" : "Reenviar Código")
                        : (isEn ? `Resend in (${forgotResendCooldown}s)` : `Reenviar en (${forgotResendCooldown}s)`)}
                    </button>
                  </div>
                </form>
              ) : (
                /* =========================================================
                     VISTA FORMULARIO: LOGIN / REGISTRO
                   ========================================================= */
                <>
                  {/* Botón Google Sign-In */}
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={isGoogleSubmitting}
                    className="w-full py-3 bg-white hover:bg-slate-50 text-[#111C2D] font-bold text-xs rounded-xl border border-black/10 shadow-2xs transition font-montserrat flex items-center justify-center gap-2.5 hover:border-black/20"
                  >
                    {isGoogleSubmitting ? (
                      <span className="w-4 h-4 border-2 border-[#111C2D] border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                      {mode === "login"
                        ? (isEn ? "Continue with Google" : "Continuar con Google")
                        : (isEn ? "Sign up with Google" : "Registrarme con Google")}
                    </span>
                  </button>

                  <div className="relative flex items-center justify-center">
                    <div className="w-full border-t border-black/10"></div>
                    <span className="absolute bg-white px-3 text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider font-montserrat">
                      {isEn ? "or with email" : "o con correo"}
                    </span>
                  </div>

                  {/* Selector de Pestañas (Ingresar / Registro) */}
                  <div className="flex bg-[#F0F3FF] p-1 rounded-xl font-montserrat text-xs font-bold border border-black/5">
                    <button
                      type="button"
                      onClick={() => {
                        setMode("login");
                        setNotification(null);
                        setConfirmPassword("");
                      }}
                      className={`flex-1 py-2.5 rounded-lg transition ${
                        mode === "login"
                          ? "bg-white text-[#111C2D] shadow-2xs font-extrabold"
                          : "text-[#4C4546] hover:text-[#111C2D]"
                      }`}
                    >
                      {isEn ? "Sign In" : "Iniciar Sesión"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("register");
                        setNotification(null);
                        setConfirmPassword("");
                      }}
                      className={`flex-1 py-2.5 rounded-lg transition ${
                        mode === "register"
                          ? "bg-white text-[#111C2D] shadow-2xs font-extrabold"
                          : "text-[#4C4546] hover:text-[#111C2D]"
                      }`}
                    >
                      {isEn ? "Create Account" : "Crear Cuenta"}
                    </button>
                  </div>

                  {/* Formulario de Login / Registro */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {mode === "register" && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
                            {isEn ? "Full Name *" : "Nombre Completo *"}
                          </label>
                          <div className="relative">
                            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4C4546] text-lg">
                              person
                            </span>
                            <input
                              type="text"
                              required
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              placeholder={isEn ? "e.g. John Doe" : "Ej: Juan Pérez"}
                              className="w-full pl-10 pr-4 py-3 bg-[#F0F3FF] border border-black/5 rounded-xl text-xs text-[#111C2D] placeholder-[#4C4546]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat flex items-center justify-between">
                            <span>{isEn ? "Mobile Phone" : "Teléfono Móvil Celular"}</span>
                            <span className="text-[10px] text-[#0071BC] font-semibold">
                              {isEn ? "For SMS & Checkout" : "Para SMS y Checkout"}
                            </span>
                          </label>
                          <div className="relative">
                            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4C4546] text-lg">
                              phone
                            </span>
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="+57 310 123 4567"
                              className="w-full pl-10 pr-4 py-3 bg-[#F0F3FF] border border-black/5 rounded-xl text-xs text-[#111C2D] placeholder-[#4C4546]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                            />
                          </div>
                        </div>
                      </>
                    )}

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
                          placeholder={isEn ? "your.email@example.com" : "tu.correo@ejemplo.com"}
                          className="w-full pl-10 pr-4 py-3 bg-[#F0F3FF] border border-black/5 rounded-xl text-xs text-[#111C2D] placeholder-[#4C4546]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-[#111C2D] font-montserrat">
                          {isEn ? "Password *" : "Contraseña *"}
                        </label>
                        {mode === "login" && (
                          <button
                            type="button"
                            onClick={() => {
                              setMode("forgot_email");
                              setNotification(null);
                              setForgotEmail(email);
                            }}
                            className="text-[11px] font-bold text-[#0071BC] hover:underline font-montserrat"
                          >
                            {isEn ? "Forgot your password?" : "¿Olvidaste tu contraseña?"}
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4C4546] text-lg">
                          lock
                        </span>
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={isEn ? "Enter your password" : "Ingresa tu contraseña"}
                          className="w-full pl-10 pr-10 py-3 bg-[#F0F3FF] border border-black/5 rounded-xl text-xs text-[#111C2D] placeholder-[#4C4546]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
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

                {mode === "register" && (
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
                        className={`w-full pl-10 pr-10 py-3 bg-[#F0F3FF] border rounded-xl text-xs text-[#111C2D] placeholder-[#4C4546]/60 focus:bg-white focus:outline-none focus:ring-2 ${
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
                        <span className="material-symbols-outlined text-xs">check</span>
                        {isEn ? "Passwords match" : "Las contraseñas coinciden"}
                      </p>
                    )}
                  </div>
                )}

                {mode === "register" && (
                  <div className="flex items-start gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded border-black/20 text-[#0071BC] focus:ring-[#0071BC]"
                    />
                    <label htmlFor="terms" className="text-[11px] text-[#4C4546] leading-snug">
                      {isEn ? "I accept the " : "Acepto los "}
                      <span className="text-[#0071BC] font-semibold underline">
                        {isEn ? "Terms of Service" : "Términos de Servicio"}
                      </span>
                      {isEn ? " and the " : " y la "}
                      <span className="text-[#0071BC] font-semibold underline">
                        {isEn ? "Privacy Policy" : "Política de Privacidad"}
                      </span>
                      {" " + (isEn ? "of Piano Colombia." : "de Piano Colombia.")}
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-[#111C2D] border-t-transparent rounded-full animate-spin"></span>
                      {mode === "login"
                        ? (isEn ? "Validating Credentials..." : "Validando Credenciales...")
                        : (isEn ? "Sending Verification Code..." : "Enviando Código de Verificación...")}
                    </>
                  ) : mode === "login" ? (
                    <>
                      <span className="material-symbols-outlined text-lg">login</span>
                      {isEn ? "Sign In to My Account" : "Ingresar a Mi Cuenta"}
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">send</span>
                      {isEn ? "Continue & Verify Email" : "Continuar y Verificar Correo"}
                    </>
                  )}
                </button>

                {/* Separador O */}
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-black/10"></div>
                  <span className="flex-shrink mx-3 text-[11px] font-bold text-[#4C4546] uppercase font-montserrat tracking-wider">
                    {isEn ? "Or" : "O"}
                  </span>
                  <div className="flex-grow border-t border-black/10"></div>
                </div>

                {/* Botón de Google OAuth para Iniciar Sesión o Registrarse */}
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={isGoogleSubmitting || isSubmitting}
                  className="w-full py-3.5 px-4 bg-white hover:bg-[#F0F3FF] text-[#111C2D] font-bold text-xs rounded-xl border border-black/10 transition font-montserrat flex items-center justify-center gap-3 shadow-2xs cursor-pointer disabled:opacity-60"
                >
                  {isGoogleSubmitting ? (
                    <span className="w-4 h-4 border-2 border-[#111C2D] border-t-transparent rounded-full animate-spin"></span>
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
                    {mode === "register"
                      ? (isEn ? "Sign up with Google" : "Registro con Google")
                      : (isEn ? "Sign in with Google" : "Iniciar sesión con Google")}
                  </span>
                </button>

              </form>
            </>
          )}

        </div>

        {/* Box de llamada a Compositores */}
        <div className="p-4 bg-white rounded-2xl border border-black/5 shadow-2xs text-center space-y-1">
          <span className="text-xs text-[#4C4546] font-medium">
            {isEn ? "Are you a composer looking to publish your works?" : "¿Eres compositor y deseas publicar tus obras?"}
          </span>
          <br />
          <Link
            href="/compositor/login"
            className="text-xs font-bold text-[#0071BC] hover:underline inline-flex items-center gap-1 font-montserrat"
          >
            {isEn ? "Access Composer Portal" : "Acceder al Portal del Compositor"}
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

      </div>

      {/* Modal de Configuración Google OAuth Client ID */}
      {showGoogleConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-black/10 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0071BC] flex items-center justify-center border border-blue-100">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-[#111C2D] font-montserrat">
                    Configurar Google Sign-In
                  </h3>
                  <p className="text-[11px] text-[#64748b]">Integración oficial Google Identity Services</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleConfigModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-[#4C4546] flex items-center justify-center text-sm font-bold transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#334155] leading-relaxed">
              <p>
                Para activar la ventana emergente real de cuentas de Google, ingresa tu <strong>Google OAuth 2.0 Client ID</strong> de Google Cloud Console:
              </p>
              
              <div className="bg-[#F0F3FF] p-3.5 rounded-2xl border border-[#0071BC]/15 space-y-1.5 text-[11px]">
                <div className="font-bold text-[#0071BC] flex items-center gap-1.5 font-montserrat">
                  <span className="material-symbols-outlined text-sm">settings_suggest</span>
                  Pasos para obtener tu Client ID en 2 minutos:
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[#475569]">
                  <li>Ingresa a <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-[#0071BC] underline font-semibold">Google Cloud Console &gt; Credenciales</a>.</li>
                  <li>Crea un <strong>ID de cliente de OAuth</strong> de tipo <em>Aplicación Web</em>.</li>
                  <li>En <strong>Orígenes de JavaScript autorizados</strong> agrega: <code className="bg-white px-1.5 py-0.5 rounded text-[#111C2D] font-mono border border-black/5">http://localhost:3000</code>.</li>
                  <li>Copia tu Client ID (ej: <code className="bg-white px-1 py-0.5 rounded text-[#111C2D] font-mono border border-black/5">...apps.googleusercontent.com</code>).</li>
                </ol>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
                  Pega tu Google Client ID para probar de inmediato:
                </label>
                <input
                  type="text"
                  placeholder="Ej: 123456789-abcdef.apps.googleusercontent.com"
                  value={customClientIdInput}
                  onChange={(e) => setCustomClientIdInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-black/10 rounded-xl text-xs font-mono text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                />
              </div>

              <p className="text-[11px] text-[#64748b]">
                💡 Tip permanente: Puedes guardarlo en <code className="font-mono font-bold text-[#111C2D]">storefront/.env.local</code> como <code className="font-mono font-bold text-[#0071BC]">NEXT_PUBLIC_GOOGLE_CLIENT_ID=tu_id</code>.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/5">
              <button
                type="button"
                onClick={() => setShowGoogleConfigModal(false)}
                className="px-4 py-2.5 rounded-xl border border-black/10 text-xs font-bold text-[#4C4546] hover:bg-slate-50 font-montserrat"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!customClientIdInput.trim()}
                onClick={() => {
                  const cleanedId = customClientIdInput.trim();
                  setGoogleClientId(cleanedId);
                  triggerGoogleOAuth(cleanedId);
                }}
                className="px-5 py-2.5 bg-[#0071BC] hover:bg-[#005a96] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-extrabold rounded-xl shadow-md transition font-montserrat flex items-center gap-2"
              >
                <span>Conectar con Google</span>
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function CustomerLoginPage() {
  return (
    <div className="min-h-screen bg-[#F9F9FF] text-[#111C2D] flex flex-col font-inter selection:bg-[#FBB03B]/30 selection:text-[#111C2D]">
      <Header />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center p-12">Cargando...</div>}>
        <CustomerLoginForm />
      </Suspense>
      <Footer />
    </div>
  );
}
