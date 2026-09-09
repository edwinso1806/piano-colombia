"use client";

import Link from "next/link";
import { useState } from "react";

export default function CompositorPerfilPage() {
  const [activeTab, setActiveTab] = useState<"es" | "en">("es");
  const [isSaved, setIsSaved] = useState(false);

  const [artistName, setArtistName] = useState("Maestro Adolfo Mejía");
  const [saycoCode, setSaycoCode] = useState("COL-8924");
  const [chairInfo, setChairInfo] = useState("Cátedra de Composición • Obra para Piano Tradicional y Neoclásica Andina");
  const [bioEs, setBioEs] = useState(
    "El Maestro Adolfo Mejía es uno de los máximos exponentes de la composición e instrumentación para la música andina colombiana del siglo XXI. Condecorado con el Gran Premio Mono Núñez en múltiples ediciones y Profesor Emérito de Composición, su obra integra el rigor polifónico universal con las cadencias rítmicas del pasillo, el bambuco fiestero y la danza cundiboyacense."
  );
  const [bioEn, setBioEn] = useState(
    "Maestro Adolfo Mejía is widely acclaimed as one of the preeminent figures of contemporary Colombian Andean piano literature. Recipient of the prestigious Gran Premio Mono Núñez, his catalogue gracefully intertwines rigorous classical counterpoint with the syncopated poetry of the Colombian Pasillo and Danza."
  );
  const [spotifyUrl, setSpotifyUrl] = useState("spotify.com/artist/adolfomejia");
  const [youtubeUrl, setYoutubeUrl] = useState("youtube.com/@MaestroAdolfoMejia");
  const [websiteUrl, setWebsiteUrl] = useState("patrimoniomusical.unal.edu.co");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-8">
      
      {/* Header Principal de la Sección */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F3FF] border border-[#0071BC]/10 text-[#0071BC] text-[11px] font-extrabold uppercase tracking-wider mb-2 font-montserrat">
            <span className="material-symbols-outlined text-xs">badge</span>
            Ficha de Autor • Proyección Global
          </div>
          <h1 className="text-3xl font-black font-montserrat text-[#111C2D] tracking-tight">
            Perfil & Biografía Bilingüe
          </h1>
          <p className="text-xs md:text-sm text-[#4C4546] font-medium max-w-2xl leading-relaxed">
            Administre su información pública de autor, fotografía oficial, derechos morales y la versión en inglés enviada a conservatorios internacionales.
          </p>
        </div>

        <Link
          href="/compositores/adolfo-mejia"
          className="px-5 py-3 bg-[#F0F3FF] hover:bg-slate-200/60 text-[#111C2D] font-bold text-xs rounded-xl transition font-montserrat flex items-center justify-center gap-2 border border-black/5 shrink-0"
        >
          <span className="material-symbols-outlined text-base text-[#0071BC]">visibility</span>
          <span>Ver Ficha Pública en Tienda</span>
        </Link>
      </div>

      {/* Alerta de Éxito al Guardar */}
      {isSaved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-xs font-bold font-montserrat shadow-2xs">
          <span className="material-symbols-outlined text-emerald-600">check_circle</span>
          <span>¡Perfil y biografía artística actualizados correctamente en el catálogo público!</span>
        </div>
      )}

      {/* Formulario Principal de Administración de Perfil */}
      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Card 1: Fotografía & Datos Institucionales */}
        <div className="bg-white p-6 lg:p-8 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-6">
          <h2 className="text-lg font-black font-montserrat text-[#111C2D] border-b border-black/5 pb-3">
            1. Fotografía Oficial & Registro de Autor
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Foto de Autor */}
            <div className="lg:col-span-4 flex flex-col items-center text-center p-6 bg-[#F0F3FF]/50 rounded-2xl border border-black/5">
              <span className="text-xs font-bold font-montserrat text-[#111C2D] mb-1">Fotografía de Retrato</span>
              <p className="text-[11px] text-[#4C4546] mb-4">Resolución recomendada: 1200x1200px (JPG/PNG)</p>
              
              <div className="relative w-36 h-36 rounded-full overflow-hidden shadow-md mb-4 group cursor-pointer border-2 border-[#FBB03B] bg-[#111C2D] flex items-center justify-center text-3xl font-montserrat font-black text-white">
                AM
                <div className="absolute inset-0 bg-[#111C2D]/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                  <span className="material-symbols-outlined text-2xl">photo_camera</span>
                  <span className="text-[10px] font-bold mt-1">Cambiar Foto</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => alert("Seleccionando nueva fotografía de autor de tu dispositivo...")}
                className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-200/60 text-[#111C2D] text-xs font-bold rounded-xl transition border border-black/10 shadow-xs font-montserrat"
              >
                <span className="material-symbols-outlined text-base text-[#0071BC]">cloud_upload</span>
                <span>Cargar Nueva Foto</span>
              </button>
            </div>

            {/* Campos Institucionales */}
            <div className="lg:col-span-8 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">Nombre Artístico Público *</label>
                  <input
                    type="text"
                    required
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-3 text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">Afiliación SAYCO-ACINPRO / Registro DNDA</label>
                  <input
                    type="text"
                    value={saycoCode}
                    onChange={(e) => setSaycoCode(e.target.value)}
                    className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-3 text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">Cátedra / Resumen Profesional *</label>
                <input
                  type="text"
                  required
                  value={chairInfo}
                  onChange={(e) => setChairInfo(e.target.value)}
                  className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-3 text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Card 2: Biografía Bilingüe (Español & English) */}
        <div className="bg-white p-6 lg:p-8 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 pb-3">
            <h2 className="text-lg font-black font-montserrat text-[#111C2D]">
              2. Redacción Biográfica Bilingüe
            </h2>

            {/* Switch de Idiomas */}
            <div className="inline-flex p-1 bg-[#F0F3FF] rounded-xl self-start sm:self-auto border border-black/5">
              <button
                type="button"
                onClick={() => setActiveTab("es")}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-montserrat font-bold transition-all ${
                  activeTab === "es"
                    ? "bg-[#111C2D] text-white shadow-2xs"
                    : "text-[#4C4546] hover:text-[#111C2D]"
                }`}
              >
                <span>🇨🇴</span> Español
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("en")}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-montserrat font-bold transition-all ${
                  activeTab === "en"
                    ? "bg-[#111C2D] text-white shadow-2xs"
                    : "text-[#4C4546] hover:text-[#111C2D]"
                }`}
              >
                <span>🇺🇸</span> English
              </button>
            </div>
          </div>

          {activeTab === "es" ? (
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#111C2D] font-montserrat flex items-center gap-1">
                <span>Biografía en Español</span> <span className="text-[#C1272D]">*</span>
              </label>
              <textarea
                rows={7}
                value={bioEs}
                onChange={(e) => setBioEs(e.target.value)}
                className="w-full p-4 rounded-xl bg-[#F0F3FF]/50 border border-black/5 text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC] transition-all resize-none shadow-2xs leading-relaxed"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#111C2D] font-montserrat flex items-center gap-1">
                <span>Composer Biography in English</span> <span className="text-[#0071BC]">(Muestra Internacional)</span>
              </label>
              <textarea
                rows={7}
                value={bioEn}
                onChange={(e) => setBioEn(e.target.value)}
                className="w-full p-4 rounded-xl bg-[#F0F3FF]/50 border border-black/5 text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC] transition-all resize-none shadow-2xs leading-relaxed"
              />
            </div>
          )}
        </div>

        {/* Card 3: Reproductores & Enlaces Oficiales */}
        <div className="bg-white p-6 lg:p-8 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-4">
          <h2 className="text-lg font-black font-montserrat text-[#111C2D] border-b border-black/5 pb-3">
            3. Enlaces Oficiales & Reproductores
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat">Perfil de Spotify</label>
              <input
                type="text"
                value={spotifyUrl}
                onChange={(e) => setSpotifyUrl(e.target.value)}
                placeholder="spotify.com/artist/..."
                className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs text-[#111C2D] focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat">Canal de YouTube</label>
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="youtube.com/@..."
                className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs text-[#111C2D] focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat">Web Oficial / Archivo</label>
              <input
                type="text"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="misitio.com"
                className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs text-[#111C2D] focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
              />
            </div>
          </div>
        </div>

        {/* Card 4: Cuenta Bancaria Wompi */}
        <div className="bg-white p-6 lg:p-8 rounded-2xl border border-black/5 shadow-xs space-y-4">
          <h2 className="text-lg font-black font-montserrat text-[#111C2D] border-b border-black/5 pb-3 flex items-center justify-between">
            <span>4. Cuenta Registrada para Dispersión Wompi</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              ✓ Cuenta Verificada Wompi
            </span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-[#111C2D] mb-1 font-montserrat">Banco / Entidad *</label>
              <select className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#111C2D]">
                <option value="bancolombia">Bancolombia</option>
                <option value="davivienda">Davivienda</option>
                <option value="nequi">Nequi</option>
                <option value="daviplata">Daviplata</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#111C2D] mb-1 font-montserrat">Tipo de Cuenta *</label>
              <select className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#111C2D]">
                <option value="ahorros">Cuenta de Ahorros</option>
                <option value="corriente">Cuenta Corriente</option>
                <option value="nequi">Bolsillo Nequi</option>
                <option value="daviplata">Bolsillo Daviplata</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#111C2D] mb-1 font-montserrat">Número de Cuenta / Nequi *</label>
              <input
                type="text"
                defaultValue="582-910284-12"
                className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs text-[#111C2D] font-mono"
              />
            </div>
          </div>
        </div>

        {/* CTA Guardar Cambios */}
        <div className="flex items-center justify-end gap-4 pt-2">
          <Link
            href="/compositor/dashboard"
            className="px-5 py-3 text-xs font-bold text-[#4C4546] hover:bg-[#F0F3FF] rounded-xl transition font-montserrat"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="px-7 py-3.5 bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] text-xs font-extrabold uppercase tracking-wider rounded-xl transition shadow-md font-montserrat flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">save</span>
            Guardar Ficha Biográfica
          </button>
        </div>

      </form>

    </div>
  );
}
