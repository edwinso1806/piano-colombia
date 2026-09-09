"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/admin/dashboard";

  const [email, setEmail] = useState("admin@pianocolombia.com");
  const [password, setPassword] = useState("••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"admin" | "editor" | "moderator" | "payouts">("admin");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "piano_colombia_admin_user",
          JSON.stringify({
            email,
            role: selectedRole,
            name:
              selectedRole === "admin"
                ? "Super Admin PC"
                : selectedRole === "editor"
                ? "Editor de Contenido"
                : selectedRole === "moderator"
                ? "Moderador de Obras"
                : "Tesorero de Pagos",
          })
        );
      }
      router.push(redirectPath);
    }, 600);
  };

  const setRoleCredentials = (role: "admin" | "editor" | "moderator" | "payouts") => {
    setSelectedRole(role);
    if (role === "admin") {
      setEmail("admin@pianocolombia.com");
    } else if (role === "editor") {
      setEmail("editor.cms@pianocolombia.com");
    } else if (role === "moderator") {
      setEmail("moderador@pianocolombia.com");
    } else {
      setEmail("tesorero@pianocolombia.com");
    }
  };

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
              Consola de Administración
            </span>
          </div>
        </Link>

        <p className="text-xs text-[#4C4546] font-medium max-w-xs mx-auto leading-relaxed pt-1">
          Ingresa tus credenciales autorizadas para acceder al CMS, moderación de obras y dispersión de pagos.
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-3xl border border-black/5 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-7 sm:p-8 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#111C2D] via-[#0071BC] to-[#C1272D]"></div>

        {/* Selector de Roles Demo */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4C4546] font-montserrat flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-[#0071BC]">shield_person</span>
              Selecciona Rol para Demo:
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-montserrat font-bold">
            <button
              type="button"
              onClick={() => setRoleCredentials("admin")}
              className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                selectedRole === "admin"
                  ? "bg-[#111C2D] text-white border-[#111C2D] shadow-2xs"
                  : "bg-[#F0F3FF] text-[#4C4546] border-black/5 hover:text-[#111C2D]"
              }`}
            >
              <span className="material-symbols-outlined text-base text-[#FBB03B]">crown</span>
              <span>Super Admin</span>
            </button>

            <button
              type="button"
              onClick={() => setRoleCredentials("editor")}
              className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                selectedRole === "editor"
                  ? "bg-[#0071BC] text-white border-[#0071BC] shadow-2xs"
                  : "bg-[#F0F3FF] text-[#4C4546] border-black/5 hover:text-[#111C2D]"
              }`}
            >
              <span className="material-symbols-outlined text-base">edit_note</span>
              <span>Editor CMS</span>
            </button>

            <button
              type="button"
              onClick={() => setRoleCredentials("moderator")}
              className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                selectedRole === "moderator"
                  ? "bg-[#FBB03B] text-[#111C2D] border-[#FBB03B] shadow-2xs"
                  : "bg-[#F0F3FF] text-[#4C4546] border-black/5 hover:text-[#111C2D]"
              }`}
            >
              <span className="material-symbols-outlined text-base">verified</span>
              <span>Moderador</span>
            </button>

            <button
              type="button"
              onClick={() => setRoleCredentials("payouts")}
              className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                selectedRole === "payouts"
                  ? "bg-[#C1272D] text-white border-[#C1272D] shadow-2xs"
                  : "bg-[#F0F3FF] text-[#4C4546] border-black/5 hover:text-[#111C2D]"
              }`}
            >
              <span className="material-symbols-outlined text-base">payments</span>
              <span>Tesorero</span>
            </button>
          </div>
        </div>

        {/* Formulario */}
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
                className="w-full pl-10 pr-4 py-3 bg-[#F0F3FF] border border-black/5 rounded-xl text-xs text-[#111C2D] font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
              Contraseña de Acceso *
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-[#111C2D] hover:bg-[#0071BC] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center justify-center gap-2 mt-4 active:scale-98"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Iniciando Sesión...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">login</span>
                <span>Ingresar a Consola Admin</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer Back Link */}
      <div className="text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#0071BC] hover:underline font-montserrat font-bold"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Volver a la Tienda Pública de Piano Colombia</span>
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#F9F9FF] text-[#111C2D] flex flex-col justify-center items-center p-6 font-inter selection:bg-[#FBB03B]/30 selection:text-[#111C2D]">
      <Suspense fallback={<div className="text-xs font-bold text-[#4C4546]">Cargando acceso...</div>}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
