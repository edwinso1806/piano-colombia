"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function CustomerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/mi-cuenta/descargas";

  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("juan@ejemplo.com");
  const [password, setPassword] = useState("••••••••");
  const [fullName, setFullName] = useState("Juan Pérez");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      if (typeof window !== "undefined") {
        localStorage.setItem("piano_colombia_customer", JSON.stringify({ email, fullName }));
      }
      router.push(redirectPath);
    }, 800);
  };

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        
        {/* Encabezado del Formulario */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F3FF] border border-[#0071BC]/10 text-[#0071BC] text-[11px] font-extrabold uppercase tracking-wider mb-2 font-montserrat">
            <span className="material-symbols-outlined text-xs">account_circle</span>
            Área de Clientes • Piano Colombia
          </div>

          <h1 className="text-3xl font-black font-montserrat text-[#111C2D] tracking-tight">
            {mode === "login" ? "Bienvenido de Nuevo" : "Crea tu Cuenta de Cliente"}
          </h1>
          <p className="text-xs sm:text-sm text-[#4C4546] font-medium leading-relaxed">
            {mode === "login"
              ? "Ingresa a tu cuenta para gestionar tus partituras adquiridas y licencias oficiales."
              : "Regístrate para descargar ediciones digitales Urtext y almacenar tus partituras preferidas."}
          </p>
        </div>

        {/* Notificación si viene de Checkout */}
        {redirectPath.includes("checkout") && (
          <div className="p-3.5 bg-[#F0F3FF] border border-[#0071BC]/20 rounded-2xl flex items-center gap-3 text-xs text-[#0071BC] font-medium">
            <span className="material-symbols-outlined text-lg shrink-0">shopping_cart_checkout</span>
            <span>
              Inicia sesión o regístrate para vincular tu compra a tu <strong>licencia legal nominativa</strong>.
            </span>
          </div>
        )}

        {/* Card Principal de Login/Registro */}
        <div className="bg-white rounded-2xl border border-black/5 shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-7 sm:p-8 space-y-6">
          
          {/* Selector de Pestañas (Ingresar / Registro) */}
          <div className="flex bg-[#F0F3FF] p-1 rounded-xl font-montserrat text-xs font-bold border border-black/5">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 py-2.5 rounded-lg transition ${
                mode === "login"
                  ? "bg-white text-[#111C2D] shadow-2xs font-extrabold"
                  : "text-[#4C4546] hover:text-[#111C2D]"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 py-2.5 rounded-lg transition ${
                mode === "register"
                  ? "bg-white text-[#111C2D] shadow-2xs font-extrabold"
                  : "text-[#4C4546] hover:text-[#111C2D]"
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          {/* Botón de Autenticación Rápida con Google */}
          <button
            type="button"
            onClick={() => {
              setIsSubmitting(true);
              setTimeout(() => {
                if (typeof window !== "undefined") {
                  localStorage.setItem("piano_colombia_customer", JSON.stringify({ email: "juan@ejemplo.com", fullName: "Juan Pérez" }));
                }
                router.push(redirectPath);
              }, 600);
            }}
            className="w-full py-3 px-4 bg-white border border-black/10 hover:bg-[#F0F3FF]/70 text-[#111C2D] font-bold text-xs rounded-xl transition flex items-center justify-center gap-3 font-montserrat shadow-2xs"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.74-2.1-6.68-4.93H1.21v3.15C3.21 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.32 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.21C.44 8.11 0 9.99 0 12s.44 3.89 1.21 5.42l4.11-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.21 2.64 1.21 6.58l4.11 3.15c.94-2.83 3.57-4.98 6.68-4.98z"
              />
            </svg>
            Continuar con Google
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-black/10 w-full"></div>
            <span className="bg-white px-3 text-[11px] font-bold text-[#4C4546] uppercase font-montserrat relative">
              o con tu correo
            </span>
          </div>

          {/* Formulario Principal */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {mode === "register" && (
              <div>
                <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
                  Nombre Completo *
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
                    placeholder="Ej: Juan Pérez"
                    className="w-full pl-10 pr-4 py-3 bg-[#F0F3FF] border border-black/5 rounded-xl text-xs text-[#111C2D] placeholder-[#4C4546]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
                Correo Electrónico *
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
                  placeholder="juan@ejemplo.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#F0F3FF] border border-black/5 rounded-xl text-xs text-[#111C2D] placeholder-[#4C4546]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#111C2D] font-montserrat">
                  Contraseña *
                </label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => alert("Se ha enviado un enlace de recuperación a tu correo.")}
                    className="text-[11px] font-bold text-[#0071BC] hover:underline font-montserrat"
                  >
                    ¿Olvidaste tu contraseña?
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
                  placeholder="••••••••"
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
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-black/20 text-[#0071BC] focus:ring-[#0071BC]"
                />
                <label htmlFor="terms" className="text-[11px] text-[#4C4546] leading-snug">
                  Acepto los <span className="text-[#0071BC] font-semibold underline">Términos de Servicio</span> y la{" "}
                  <span className="text-[#0071BC] font-semibold underline">Política de Privacidad</span> de Piano Colombia.
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
                  Iniciando Sesión...
                </>
              ) : mode === "login" ? (
                <>
                  <span className="material-symbols-outlined text-lg">login</span>
                  Ingresar a Mi Cuenta
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">person_add</span>
                  Crear Cuenta de Cliente
                </>
              )}
            </button>

          </form>

        </div>

        {/* Box de llamada a Compositores */}
        <div className="p-4 bg-white rounded-2xl border border-black/5 shadow-2xs text-center space-y-1">
          <span className="text-xs text-[#4C4546] font-medium">¿Eres compositor y deseas publicar tus obras?</span>
          <br />
          <Link
            href="/compositor/login"
            className="text-xs font-bold text-[#0071BC] hover:underline inline-flex items-center gap-1 font-montserrat"
          >
            Acceder al Portal del Compositor
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

      </div>
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
