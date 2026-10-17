"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  loginAdminApi,
  requestPasswordResetApi,
  confirmPasswordResetApi,
} from "@/lib/api-client";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/admin/dashboard";
  const { loginAdmin, admin, isLoaded } = useAuth();

  // Redirección si la sesión administrativa ya se encuentra activa
  useEffect(() => {
    if (!isLoaded) return;
    if (admin && admin.email) {
      router.replace(redirectPath);
    }
  }, [admin, isLoaded, redirectPath, router]);

  // Mensaje cuando la sesión administrativa ha expirado
  useEffect(() => {
    if (searchParams.get("expired") === "true") {
      setNotification({
        type: "warning",
        message: "Tu sesión administrativa ha expirado por políticas de seguridad institucional (8 horas). Por favor ingresa tus credenciales.",
      });
    }
  }, [searchParams]);

  const [mode, setMode] = useState<"login" | "forgot_email" | "forgot_otp" | "expired_password">("login");

  // Login States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password States
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
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info" | "warning";
    message: string;
  } | null>(null);

  // Auto-fill email & activar cuenta desde link de invitación por correo
  useEffect(() => {
    const urlEmail = searchParams.get("email");
    const urlMode = searchParams.get("mode");

    if (urlMode === "activate" && urlEmail) {
      router.push(`/admin/activar-cuenta?email=${encodeURIComponent(urlEmail)}`);
      return;
    }

    if (urlEmail) {
      setEmail(urlEmail);
      setForgotEmail(urlEmail);
    }
  }, [searchParams, router]);

  // Countdown timers para OTP
  useEffect(() => {
    let interval: any = null;
    if (mode === "forgot_otp" && forgotTimer > 0) {
      interval = setInterval(() => {
        setForgotTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mode, forgotTimer]);

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

  // A. Iniciar Sesión de Administrador
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotification(null);

    try {
      const res = await loginAdminApi(email.trim(), password);

      loginAdmin({
        email: res.admin.email,
        role: res.admin.role,
        name: res.admin.name,
      }, {
        token: res.token,
        expires_at: res.expires_at,
      });

      let destination = redirectPath;
      if (!searchParams.get("redirect") || destination === "/admin/dashboard" || destination === "/admin") {
        if (res.admin.role === "moderator" || res.admin.role === "moderador") {
          destination = "/admin/partituras";
        } else if (res.admin.role === "editor" || res.admin.role === "editor_cms") {
          destination = "/admin/cms";
        } else if (res.admin.role === "payouts" || res.admin.role === "tesorero") {
          destination = "/admin/pagos";
        } else {
          destination = "/admin/dashboard";
        }
      }

      router.push(destination);
    } catch (err: any) {
      console.error("Fallo autenticación admin:", err);

      // Si la contraseña ha expirado (política de 30 días)
      if (err.password_expired || err.message?.includes("expirado") || err.message?.includes("30 días")) {
        setForgotEmail(email.trim());
        setMode("expired_password");
        setNotification({
          type: "warning",
          message: err.message || "Por políticas de seguridad de la consola de administración, debes renovar tu contraseña cada 30 días.",
        });
      } else {
        setNotification({
          type: "error",
          message: err.message || "El correo institucional o la contraseña ingresada son incorrectos. Por favor verifica tus credenciales.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // B. Solicitar Código OTP de Recuperación
  const handleRequestForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes("@")) {
      setNotification({
        type: "error",
        message: "Por favor ingresa un correo electrónico institucional válido.",
      });
      return;
    }

    setIsSubmitting(true);
    setNotification(null);

    try {
      const res = await requestPasswordResetApi({
        email: forgotEmail.trim(),
        role: "admin",
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
        message: res.message || `Hemos enviado un código de 6 dígitos a ${forgotEmail}.`,
      });
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "Error al solicitar el código de recuperación.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // C. Confirmar OTP y Establecer Nueva Contraseña
  const handleConfirmForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!forgotOtp || forgotOtp.trim().length !== 6) {
      setNotification({
        type: "error",
        message: "Por favor ingresa el código de 6 dígitos completo.",
      });
      return;
    }

    if (newPassword.length < 6) {
      setNotification({
        type: "error",
        message: "La nueva contraseña debe tener al menos 6 caracteres por seguridad.",
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setNotification({
        type: "error",
        message: "Las contraseñas no coinciden. Por favor verifica ambos campos.",
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
        role: "admin",
      });

      setNotification({
        type: "success",
        message: res.message || "¡Contraseña actualizada con éxito! Ya puedes ingresar a la consola.",
      });

      setEmail(forgotEmail.trim());
      setPassword("");
      setMode("login");
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "Código incorrecto o expirado. Por favor intenta de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoaded && admin && admin.email) {
    return (
      <div className="w-full max-w-md py-16 text-center font-montserrat space-y-4">
        <div className="w-12 h-12 border-4 border-[#0071BC] border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-base font-extrabold text-[#111C2D]">
          Sesión institucional activa. Redirigiendo a consola...
        </h2>
        <p className="text-xs text-slate-500">{admin.email}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <Link href="/" className="inline-flex items-center justify-center gap-3 group">
          <div className="flex items-center gap-1 shrink-0">
            <div className="h-7 w-1.5 bg-[#111C2D] rounded-full"></div>
            <div className="h-9 w-1.5 bg-[#FBB03B] rounded-full"></div>
            <div className="h-6 w-1.5 bg-[#0071BC] rounded-full"></div>
            <div className="h-8 w-1.5 bg-[#111C2D] rounded-full"></div>
            <div className="h-5 w-1.5 bg-[#C1272D] rounded-full"></div>
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <span className="font-montserrat text-lg font-black tracking-tight text-[#111C2D] leading-none">
                PIANO COLOMBIA
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-[#C1272D] text-white rounded font-montserrat font-black uppercase tracking-wider">
                ADMIN
              </span>
            </div>
            <span className="text-[10px] font-extrabold text-[#4C4546] uppercase tracking-widest font-montserrat mt-0.5">
              Consola de Administración RBAC
            </span>
          </div>
        </Link>

        <p className="text-xs text-[#4C4546] font-medium max-w-xs mx-auto leading-relaxed pt-1">
          Acceso seguro para el equipo de moderación de obras, edición CMS y dispersión de pagos.
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-3xl border border-black/5 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-7 sm:p-8 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#111C2D] via-[#0071BC] to-[#C1272D]"></div>

        {/* Notificaciones de Estado */}
        {notification && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-medium flex items-center gap-2.5 ${
              notification.type === "error"
                ? "bg-red-50 border border-red-200 text-red-800"
                : notification.type === "warning"
                ? "bg-amber-50 border border-amber-200 text-amber-900"
                : notification.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-blue-50 border border-blue-200 text-blue-800"
            }`}
          >
            <span className="material-symbols-outlined text-lg shrink-0">
              {notification.type === "error"
                ? "error"
                : notification.type === "warning"
                ? "warning"
                : notification.type === "success"
                ? "check_circle"
                : "info"}
            </span>
            <span>{notification.message}</span>
          </div>
        )}

        {/* MODOS DE INTERFAZ */}
        {mode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
                Correo Institucional *
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
                  placeholder="admin@pianocolombia.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#F0F3FF] border border-black/5 rounded-xl text-xs text-[#111C2D] font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#111C2D] font-montserrat">
                  Contraseña de Acceso *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setMode("forgot_email");
                    setNotification(null);
                  }}
                  className="text-[11px] font-bold text-[#0071BC] hover:underline font-montserrat"
                >
                  ¿Olvidaste tu contraseña?
                </button>
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
                  placeholder="Ingresa tu contraseña"
                  className="w-full pl-10 pr-10 py-3 bg-[#F0F3FF] border border-black/5 rounded-xl text-xs text-[#111C2D] font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
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

            {/* Política de Seguridad */}
            <div className="p-3 bg-[#F0F3FF]/70 rounded-xl border border-black/5 text-[11px] text-[#4C4546] flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-[#0071BC]">shield</span>
              <span>Política de seguridad: Rotación de contraseña obligatoria cada 30 días.</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#111C2D] hover:bg-[#1a2b45] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition font-montserrat flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Validando Acceso Seguro...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg text-[#FBB03B]">key</span>
                  Ingresar a Consola
                </>
              )}
            </button>
          </form>
        ) : mode === "forgot_email" || mode === "expired_password" ? (
          <form onSubmit={handleRequestForgotOtp} className="space-y-5">
            <div className="text-center space-y-1.5 pb-2 border-b border-black/5">
              <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center mx-auto border border-amber-200/80">
                <span className="material-symbols-outlined text-2xl">lock_reset</span>
              </div>
              <h2 className="font-montserrat font-extrabold text-base text-[#111C2D]">
                {mode === "expired_password" ? "Renovación Obligatoria de Contraseña" : "Recuperar Contraseña Institucional"}
              </h2>
              <p className="text-xs text-[#4C4546] max-w-xs mx-auto">
                {mode === "expired_password"
                  ? "Tu clave ha superado los 30 días de vigencia. Ingresa tu correo institucional para enviarte un código de renovación."
                  : "Ingresa tu correo institucional registrado y te enviaremos un código de seguridad para restablecer tu clave."}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
                Correo Institucional *
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
                  placeholder="admin@pianocolombia.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#F0F3FF] border border-black/5 rounded-xl text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#111C2D] border-t-transparent rounded-full animate-spin"></span>
                  Enviando Código...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">send</span>
                  Enviar Código de Recuperación
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
                className="text-xs font-bold text-[#0071BC] hover:underline font-montserrat inline-flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Volver a Iniciar Sesión
              </button>
            </div>
          </form>
        ) : (
          /* MODO FORGOT_OTP: INGRESO DE CÓDIGO Y NUEVA CLAVE */
          <form onSubmit={handleConfirmForgotOtp} className="space-y-4">
            <div className="text-center space-y-1 pb-2 border-b border-black/5">
              <h2 className="font-montserrat font-extrabold text-base text-[#111C2D]">
                Ingresa el Código & Nueva Clave
              </h2>
              <p className="text-xs text-[#4C4546]">
                Revisa el código de 6 dígitos enviado a <strong>{forgotEmail}</strong>.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat text-center">
                Código de Seguridad (6 dígitos) *
              </label>
              <input
                type="text"
                required
                maxLength={6}
                autoFocus
                value={forgotOtp}
                onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full text-center text-xl font-mono font-bold tracking-widest py-3 bg-[#F0F3FF] border border-black/10 rounded-xl text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
              />
              <span className="block text-[10px] text-[#4C4546] text-center mt-1 font-mono">
                Expira en: {Math.floor(forgotTimer / 60)}:{(forgotTimer % 60).toString().padStart(2, "0")} minutos
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat">
                Nueva Contraseña Institucional *
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-4 pr-10 py-2.5 bg-[#F0F3FF] border border-black/10 rounded-xl text-xs text-[#111C2D] font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4C4546]"
                >
                  <span className="material-symbols-outlined text-base">
                    {showNewPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat">
                Confirmar Nueva Contraseña *
              </label>
              <div className="relative">
                <input
                  type={showConfirmNewPassword ? "text" : "password"}
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                  className="w-full pl-4 pr-10 py-2.5 bg-[#F0F3FF] border border-black/10 rounded-xl text-xs text-[#111C2D] font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4C4546]"
                >
                  <span className="material-symbols-outlined text-base">
                    {showConfirmNewPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#111C2D] hover:bg-[#1a2b45] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition font-montserrat flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Actualizando Contraseña...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg text-[#FBB03B]">check_circle</span>
                  Actualizar Contraseña & Entrar
                </>
              )}
            </button>

            <div className="pt-2 border-t border-black/5 text-center">
              <button
                type="button"
                onClick={() => setMode("forgot_email")}
                className="text-xs font-bold text-[#0071BC] hover:underline font-montserrat"
              >
                Volver a solicitar código
              </button>
            </div>
          </form>
        )}

        <div className="pt-2 text-center border-t border-black/5">
          <Link
            href="/"
            className="text-xs font-bold text-[#0071BC] hover:underline inline-flex items-center gap-1 font-montserrat"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Volver a la Tienda Pública
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#F9F9FF] text-[#111C2D] flex items-center justify-center px-4 py-12 font-inter selection:bg-[#FBB03B] selection:text-[#111C2D]">
      <Suspense fallback={<div className="p-8 text-center text-xs font-bold font-montserrat">Cargando consola segura...</div>}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
