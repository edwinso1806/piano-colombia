"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CompositorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("adolfo.mejia@pianocolombia.com");
  const [password, setPassword] = useState("demo1234");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/compositor/dashboard");
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
            <div className="hidden sm:flex items-center text-xs font-bold tracking-wider text-slate-500 bg-slate-100/90 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="text-amber-600 font-extrabold cursor-pointer">ES</span>
              <span className="mx-2 text-slate-300">|</span>
              <a href="#" className="hover:text-slate-900 transition-colors font-semibold">EN</a>
            </div>

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
                Ingresa con tus credenciales autorizadas para gestionar tu catálogo, regalías y perfil artístico.
              </p>
            </div>

            {/* Formulario de Login */}
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
                    placeholder="compositor@pianocolombia.com"
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
                  <a href="#" className="text-xs font-bold text-[#0071bc] hover:underline transition-colors">
                    ¿Olvidaste tu clave?
                  </a>
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
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-11 py-3 bg-[#f8fafc] border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-500 transition duration-200 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                  >
                    <span className="material-symbols-outlined text-base">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Checkbox Recordar Sesión */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2.5 block text-xs font-medium text-slate-600 cursor-pointer select-none">
                  Recordar este dispositivo
                </label>
              </div>

              {/* Demo Access Callout */}
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 text-left shadow-2xs">
                <div className="flex items-start gap-3">
                  <span className="text-amber-500 text-lg leading-none mt-0.5">💡</span>
                  <div className="text-xs text-slate-700 leading-relaxed font-body">
                    <span className="font-bold text-amber-900 block mb-0.5 font-montserrat">Demo de Acceso Directo:</span>
                    Haz clic en <span className="text-slate-900 font-bold">"Iniciar Sesión"</span> para ingresar directamente al Dashboard con la cuenta aprobada de prueba de <strong className="text-slate-900 font-bold">Adolfo Mejía</strong>.
                  </div>
                </div>
              </div>

              {/* CTA Iniciar Sesión */}
              <button
                type="submit"
                className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#fbb03b] via-[#f59e0b] to-[#ea580c] hover:from-[#f59e0b] hover:to-[#fbb03b] text-slate-950 font-black text-sm uppercase tracking-wider shadow-md hover:shadow-lg active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2.5 group font-montserrat"
              >
                <span>Iniciar Sesión</span>
                <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-1">arrow_forward</span>
              </button>
            </form>

            {/* Soporte Técnico */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-[12px] text-slate-500 leading-relaxed">
                ¿Problemas técnicos para acceder? Contacta a la <br className="hidden sm:inline" />
                <a href="#" className="text-slate-800 font-bold hover:text-amber-600 underline decoration-slate-300 hover:decoration-amber-500 transition-colors">
                  Dirección Musical & Soporte de Compositores
                </a>
              </p>
            </div>

          </section>

          {/* Badges de Confianza */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-emerald-600 text-base">verified_user</span>
              Conexión Cifrada SSL 256-bit
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-amber-600 text-base">music_note</span>
              SAYCO / DNDA Protegido
            </span>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 bg-white/80 backdrop-blur-sm py-5 px-4 sm:px-6 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© 2026 PianoColombia.com — Obra, Patrimonio y Música Pianística Colombiana.</p>
          <div className="flex items-center gap-4 text-xs font-medium">
            <a href="#" className="hover:text-slate-800 transition-colors">Términos del Catálogo</a>
            <span className="text-slate-300">·</span>
            <a href="#" className="hover:text-slate-800 transition-colors">Privacidad y Regalías</a>
          </div>
        </div>
      </footer>

      {/* Flotante WhatsApp Support */}
      <aside aria-label="Soporte WhatsApp" className="fixed bottom-5 right-5 z-20">
        <a
          href="https://wa.me/573137529693"
          target="_blank"
          rel="noopener noreferrer"
          title="Atención directa a compositores vía WhatsApp"
          className="flex items-center gap-2.5 bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-emerald-500/40 rounded-full px-4 py-2.5 shadow-lg backdrop-blur-md transition-all duration-200 group hover:scale-105"
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
