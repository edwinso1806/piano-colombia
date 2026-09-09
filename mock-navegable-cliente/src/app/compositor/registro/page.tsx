"use client";

import Link from "next/link";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CompositorRegistroPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [fullName, setFullName] = useState("");
  const [stageName, setStageName] = useState("");
  const [country, setCountry] = useState("Colombia");
  const [department, setDepartment] = useState("Bolívar");
  const [city, setCity] = useState("Cartagena");
  const [docType, setDocType] = useState("CC");
  const [docNumber, setDocNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F9F9FF] text-[#111C2D] font-inter antialiased relative flex flex-col justify-between selection:bg-[#FBB03B]/30 selection:text-[#111C2D]">
      
      {/* Dynamic Background Overlay */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,transparent_32px,rgba(17,28,45,0.03)_32px,rgba(17,28,45,0.03)_33px)] opacity-70"></div>
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-full max-w-[850px] h-[400px] bg-gradient-to-b from-amber-100/50 via-blue-50/40 to-transparent rounded-full blur-[120px]"></div>
      </div>

      {/* Header Unificado Stitch */}
      <Header />

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="w-full max-w-3xl">
          
          {isSubmitted ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-black/5 shadow-[0_20px_40px_-10px_rgba(15,23,42,0.08)] text-center space-y-6 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#FBB03B] via-[#0071BC] to-[#C1272D]"></div>

              <div className="w-16 h-16 bg-[#FBB03B]/20 rounded-full flex items-center justify-center text-3xl mx-auto text-[#111C2D]">
                📋
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-extrabold uppercase tracking-wider font-montserrat">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                Estado: Solicitud Pendiente de Aprobación
              </div>

              <h1 className="text-3xl font-black font-montserrat text-[#111C2D]">
                ¡Solicitud de Registro Recibida!
              </h1>
              
              <p className="text-sm text-[#4C4546] leading-relaxed max-w-lg mx-auto font-normal">
                Gracias por postularte como compositor en <strong>Piano Colombia</strong>. Tu solicitud ha sido ingresada a nuestra mesa técnica de verificación de identidad y propiedad intelectual.
              </p>

              <div className="p-5 bg-[#F0F3FF] rounded-2xl border border-black/5 text-left text-xs space-y-2 max-w-md mx-auto">
                <p className="font-bold text-[#0071BC] font-montserrat flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">mail</span> Notificación & Proceso:
                </p>
                <p className="text-[#4C4546]">• Hemos enviado un correo de confirmación a <strong className="text-[#111C2D]">{email || "tu correo"}</strong>.</p>
                <p className="text-[#4C4546]">• Tiempo estimado de respuesta: <strong>24 a 48 horas hábiles</strong>.</p>
                <p className="text-[#4C4546]">• Recibirás tus credenciales activas una vez validada la documentación.</p>
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
                  Ir al Iniciar Sesión
                </Link>
              </div>
            </div>
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

              <form onSubmit={handleSubmit} className="space-y-8">
                
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

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">País *</label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-3 text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                      >
                        <option value="Colombia">Colombia</option>
                        <option value="Estados Unidos">Estados Unidos</option>
                        <option value="España">España</option>
                        <option value="México">México</option>
                        <option value="Otro">Otro país...</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">Departamento / Estado *</label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-3 text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                      >
                        <option value="Bolívar">Bolívar</option>
                        <option value="Cundinamarca">Cundinamarca</option>
                        <option value="Antioquia">Antioquia</option>
                        <option value="Valle del Cauca">Valle del Cauca</option>
                        <option value="Santander">Santander</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">Ciudad *</label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-3 text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                      >
                        <option value="Cartagena">Cartagena</option>
                        <option value="Bogotá">Bogotá</option>
                        <option value="Medellín">Medellín</option>
                        <option value="Cali">Cali</option>
                        <option value="Bucaramanga">Bucaramanga</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Bloque 2: Verificación de Identidad */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-black/5 pb-2">
                    <span className="w-6 h-6 rounded-full bg-[#0071BC] text-white text-xs font-bold flex items-center justify-center font-montserrat">2</span>
                    <h2 className="text-xs font-black uppercase text-[#111C2D] tracking-wider font-montserrat">
                      Identificación de Titular Legal
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">Tipo de Documento *</label>
                      <select
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                        className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-3 text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                      >
                        <option value="CC">Cédula de Ciudadanía (Colombia)</option>
                        <option value="PASSPORT">Pasaporte Internacional</option>
                        <option value="CE">Cédula de Extranjería</option>
                      </select>
                    </div>

                    <div>
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
                        <select className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-xs font-semibold text-[#111C2D]">
                          <option value="bancolombia">Bancolombia</option>
                          <option value="davivienda">Davivienda</option>
                          <option value="nequi">Nequi</option>
                          <option value="daviplata">Daviplata</option>
                          <option value="banco_bogota">Banco de Bogotá</option>
                          <option value="bbva">BBVA Colombia</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-[#111C2D] mb-1">Tipo de Cuenta *</label>
                        <select className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-xs font-semibold text-[#111C2D]">
                          <option value="ahorros">Cuenta de Ahorros</option>
                          <option value="corriente">Cuenta Corriente</option>
                          <option value="nequi">Bolsillo Nequi</option>
                          <option value="daviplata">Bolsillo Daviplata</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-[#111C2D] mb-1">Número de Cuenta / Celular *</label>
                        <input
                          type="text"
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">Correo Electrónico *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="compositor@pianocolombia.com"
                        className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-3 text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">Contraseña *</label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-3 text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                      />
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
                  className="w-full py-4 bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">send</span>
                  Enviar Solicitud de Registro de Compositor
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
