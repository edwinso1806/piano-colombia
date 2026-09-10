"use client";

import Link from "next/link";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  requestPasswordResetApi,
  confirmPasswordResetApi,
  loginAdminApi,
} from "@/lib/api-client";

function AdminActivarCuentaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlEmail = searchParams.get("email") || "";
  const urlToken = searchParams.get("token") || "";
  const isLockedEmail = Boolean(urlEmail);

  const { loginAdmin } = useAuth();
  const otpRequestedRef = useRef(false);

  const [email, setEmail] = useState(urlEmail);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(600); // 10 min
  const [cooldown, setCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isSecurityBlocked, setIsSecurityBlocked] = useState(false);

  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info" | "warning";
    message: string;
  } | null>(null);

  // Solicitar o Re-enviar Código OTP con Token de Activación Criptográfico
  const handleSendOtp = async (targetEmail: string) => {
    if (!targetEmail || !targetEmail.includes("@")) {
      setNotification({
        type: "error",
        message: "Por favor ingresa un correo electrónico institucional válido.",
      });
      return;
    }

    try {
      setIsSendingOtp(true);
      setNotification(null);

      const res = await requestPasswordResetApi({
        email: targetEmail.trim(),
        role: "admin",
        token: urlToken,
      });

      setOtpSent(true);
      setTimer(600);
      setCooldown(60);
      setCanResend(false);
      setNotification({
        type: "info",
        message: res.message || `Hemos enviado un código OTP de 6 dígitos a ${targetEmail}. Revisa tu bandeja de entrada o Spam.`,
      });
    } catch (err: any) {
      console.error("Error enviando OTP:", err);
      const isTamper =
        err.message?.toLowerCase().includes("seguridad") ||
        err.message?.toLowerCase().includes("token") ||
        err.message?.toLowerCase().includes("manipulados");

      if (isTamper) {
        setIsSecurityBlocked(true);
      }

      setNotification({
        type: "error",
        message: err.message || "Error al generar el código OTP de verificación.",
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Auto-enviar OTP una sola vez al cargar si viene el email en la URL
  useEffect(() => {
    if (urlEmail && urlEmail.includes("@") && !otpRequestedRef.current) {
      otpRequestedRef.current = true;
      setEmail(urlEmail);
      handleSendOtp(urlEmail);
    }
  }, [urlEmail]);

  // Timers de expiración y cooldown de re-envío
  useEffect(() => {
    let interval: any = null;
    if (otpSent && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  useEffect(() => {
    let interval: any = null;
    if (otpSent && cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, cooldown]);

  // Confirmar OTP y Establecer Contraseña
  const handleActivateAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || code.trim().length !== 6) {
      setNotification({
        type: "error",
        message: "Por favor ingresa el código OTP de 6 dígitos completo.",
      });
      return;
    }

    if (newPassword.length < 6) {
      setNotification({
        type: "error",
        message: "La contraseña debe tener al menos 6 caracteres por seguridad.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setNotification({
        type: "error",
        message: "Las contraseñas ingresadas no coinciden.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setNotification(null);

      // 1. Confirmar restablecimiento y guardar nueva clave en PostgreSQL
      const resConfirm = await confirmPasswordResetApi({
        email: email.trim(),
        code: code.trim(),
        newPassword,
        role: "admin",
        token: urlToken,
      });

      if (resConfirm.admin) {
        loginAdmin({
          email: resConfirm.admin.email,
          role: resConfirm.admin.role,
          name: resConfirm.admin.name,
        });
        router.push("/admin/dashboard");
        return;
      }

      // 2. Autenticar con la nueva clave creada como fallback
      const resLogin = await loginAdminApi(email.trim(), newPassword);

      loginAdmin({
        email: resLogin.admin.email,
        role: resLogin.admin.role,
        name: resLogin.admin.name,
      });

      router.push("/admin/dashboard");
    } catch (err: any) {
      console.error("Error al activar cuenta:", err);
      const isTamper =
        err.message?.toLowerCase().includes("seguridad") ||
        err.message?.toLowerCase().includes("token") ||
        err.message?.toLowerCase().includes("bloqueada");

      if (isTamper) {
        setIsSecurityBlocked(true);
      }

      setNotification({
        type: "error",
        message: err.message || "Código OTP incorrecto o expirado. Inténtalo de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Header Marca */}
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
              <span className="text-[10px] px-2 py-0.5 bg-[#0071BC] text-white rounded font-montserrat font-black uppercase tracking-wider">
                SEGURIDAD OTP
              </span>
            </div>
            <span className="text-[10px] font-extrabold text-[#4C4546] uppercase tracking-widest font-montserrat mt-0.5">
              Activación Segura de Cuenta Admin
            </span>
          </div>
        </Link>

        <h2 className="text-xl font-black text-[#111C2D] font-montserrat tracking-tight pt-2">
          Asignar Contraseña de Acceso
        </h2>
        <p className="text-xs text-[#4C4546] max-w-xs mx-auto leading-relaxed">
          Verifica tu código OTP e ingresa tu contraseña personal privada para activar tu perfil institucional.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl border border-black/5 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-7 sm:p-8 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#0071BC] via-[#FBB03B] to-[#C1272D]"></div>

        {/* Notificación de Bloqueo Crítico de Seguridad */}
        {isSecurityBlocked ? (
          <div className="p-6 rounded-2xl bg-red-50 border-2 border-red-300 text-red-950 space-y-4 text-center">
            <div className="w-12 h-12 bg-red-100 border border-red-300 rounded-full flex items-center justify-center mx-auto text-red-600">
              <span className="material-symbols-outlined text-2xl">gpp_bad</span>
            </div>
            <div>
              <h3 className="font-black text-sm text-red-900 font-montserrat uppercase tracking-wider">
                Alerta de Seguridad: Enlace No Válido
              </h3>
              <p className="text-xs text-red-800 mt-2 leading-relaxed font-medium">
                {notification?.message || "Los parámetros de la URL o el correo electrónico han sido alterados o no coinciden con el token de activación criptográfico emitido. Por protección de la consola, esta solicitud ha sido bloqueada."}
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-bold font-montserrat transition shadow-md"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Ir al Inicio de Sesión
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Notificaciones estándar */}
            {notification && (
              <div
                className={`p-4 rounded-2xl text-xs font-semibold leading-relaxed flex items-start gap-3 ${
                  notification.type === "error"
                    ? "bg-red-50 border border-red-200 text-red-800"
                    : notification.type === "warning"
                    ? "bg-amber-50 border border-amber-200 text-amber-900"
                    : notification.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-blue-50 border border-blue-200 text-blue-900"
                }`}
              >
                <span className="material-symbols-outlined text-xl shrink-0">
                  {notification.type === "error"
                    ? "error"
                    : notification.type === "warning"
                    ? "warning"
                    : notification.type === "success"
                    ? "check_circle"
                    : "mark_email_read"}
                </span>
                <div>{notification.message}</div>
              </div>
            )}

            <form onSubmit={handleActivateAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat">
                  Correo Institucional *
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4C4546] text-lg">
                    mail
                  </span>
                  <input
                    type="email"
                    required
                    readOnly={isLockedEmail}
                    value={email}
                    onChange={(e) => {
                      if (!isLockedEmail) setEmail(e.target.value);
                    }}
                    placeholder="usuario@pianocolombia.com"
                    className={`w-full pl-10 pr-10 py-3 rounded-xl text-xs font-bold outline-none transition ${
                      isLockedEmail
                        ? "bg-slate-100 border border-slate-300 text-slate-800 cursor-not-allowed select-none"
                        : "bg-[#F0F3FF] border border-black/5 text-[#111C2D] focus:ring-2 focus:ring-[#0071BC]"
                    }`}
                  />
                  {isLockedEmail && (
                    <span
                      title="Correo bloqueado por token de seguridad institucional"
                      className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-700 text-lg"
                    >
                      lock
                    </span>
                  )}
                </div>

                {isLockedEmail && (
                  <div className="flex items-center gap-1.5 mt-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200/70 rounded-lg">
                    <span className="material-symbols-outlined text-emerald-700 text-sm">verified_user</span>
                    <span className="text-[10px] font-bold text-emerald-800">
                      Correo verificado institucionalmente · Inmutable
                    </span>
                  </div>
                )}
              </div>

          {!otpSent && (
            <button
              type="button"
              onClick={() => handleSendOtp(email)}
              disabled={isSendingOtp || !email}
              className="w-full py-3 bg-[#0071BC] hover:bg-[#005996] text-white font-montserrat font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSendingOtp ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Generando Código OTP...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">send</span>
                  Solicitar Código OTP de Verificación
                </>
              )}
            </button>
          )}

          {otpSent && (
            <>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#111C2D] font-montserrat">
                    Código de Seguridad OTP (6 dígitos) *
                  </label>
                  <span className="text-[10px] text-[#4C4546] font-mono">
                    Expira en: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")} min
                  </span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="w-full text-center text-2xl font-mono font-black tracking-widest py-3 bg-[#F0F3FF] border border-black/10 rounded-xl text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat">
                  Nueva Contraseña Segura *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-4 pr-10 py-3 bg-[#F0F3FF] border border-black/10 rounded-xl text-xs text-[#111C2D] font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4C4546]"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat">
                  Confirmar Contraseña Segura *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la contraseña"
                    className="w-full pl-4 pr-10 py-3 bg-[#F0F3FF] border border-black/10 rounded-xl text-xs text-[#111C2D] font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4C4546]"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showConfirmPassword ? "visibility_off" : "visibility"}
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
                    Activando Cuenta & Guardando Clave...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg text-[#FBB03B]">key_visualizer</span>
                    Activar Cuenta y Guardar Contraseña
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-black/5">
                <button
                  type="button"
                  disabled={!canResend || isSendingOtp}
                  onClick={() => handleSendOtp(email)}
                  className="font-montserrat font-bold text-[#0071BC] hover:underline disabled:opacity-50"
                >
                  {canResend ? "Re-enviar código OTP" : `Re-enviar en (${cooldown}s)`}
                </button>

                <Link href="/admin/login" className="font-montserrat font-bold text-[#4C4546] hover:underline">
                  Ir al Login
                </Link>
              </div>
            </>
          )}
        </form>

        <div className="pt-2 text-center border-t border-black/5">
          <Link
            href="/admin/login"
            className="text-xs font-bold text-[#0071BC] hover:underline inline-flex items-center gap-1 font-montserrat"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Volver a Iniciar Sesión en la Consola
          </Link>
        </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminActivarCuentaPage() {
  return (
    <div className="min-h-screen bg-[#F9F9FF] text-[#111C2D] flex items-center justify-center px-4 py-12 font-inter selection:bg-[#FBB03B] selection:text-[#111C2D]">
      <Suspense fallback={<div className="p-8 text-center text-xs font-bold font-montserrat">Cargando activación segura...</div>}>
        <AdminActivarCuentaForm />
      </Suspense>
    </div>
  );
}
