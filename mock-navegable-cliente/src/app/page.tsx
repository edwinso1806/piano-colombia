"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MOCK_COMPOSERS, MOCK_SCORES } from "@/lib/mock-data";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  const [isPlayingHero, setIsPlayingHero] = useState(false);
  const [currency, setCurrency] = useState<"COP" | "USD">("COP");
  const [activeComposerFilter, setActiveComposerFilter] = useState("todos");

  return (
    <div className="min-h-screen bg-[#F9F9FF] text-[#111C2D] flex flex-col font-inter antialiased selection:bg-[#FBB03B]/30 selection:text-[#111C2D]">
      
      {/* Header Fijo con Estilo Stitch */}
      <Header activePage="inicio" />

      {/* Main Container */}
      <main className="flex-1 w-full bg-[#F9F9FF]">
        
        {/* ==========================================
               SECCIÓN 1: HERO PORTADA INMERSIVA STITCH
               ========================================== */}
        <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#F0F3FF]/70 via-[#F9F9FF] to-[#F9F9FF] py-12 lg:py-20 border-b border-black/5">
          {/* Ambient Acoustic Orbs */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#FBB03B]/20 blur-3xl pointer-events-none"></div>
          <div className="absolute top-1/2 -left-28 w-80 h-80 rounded-full bg-[#0071BC]/20 blur-3xl pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Columna Izquierda: Copywriting & CTAs */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                
                {/* Overline Badge con Motivo Rítmico Tricolor */}
                <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-white border border-black/5 shadow-xs">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-3.5 bg-[#111C2D] rounded-full"></span>
                    <span className="w-1.5 h-4.5 bg-[#FBB03B] rounded-full"></span>
                    <span className="w-1.5 h-3 bg-[#0071BC] rounded-full"></span>
                    <span className="w-1.5 h-4 bg-[#C1272D] rounded-full"></span>
                  </span>
                  <span className="font-montserrat text-xs text-[#111C2D] uppercase tracking-wider font-extrabold">Archivo Urtext & Editorial Digital</span>
                </div>

                {/* Gran Título Hero */}
                <h1 className="font-montserrat text-4xl sm:text-5xl lg:text-[56px] font-black text-[#111C2D] leading-[1.08] tracking-tight">
                  La tradición del piano <span className="relative inline-block text-[#111C2D] underline decoration-[#FBB03B] decoration-4 underline-offset-8">colombiano</span> y latinoamericano en tus manos.
                </h1>

                {/* Subtítulo Descriptor */}
                <p className="font-inter text-base sm:text-lg text-[#4C4546] max-w-xl leading-relaxed">
                  Un proyecto cultural con enfoque musical riguroso en pro del rescate, edición filológica y difusión de obras patrimoniales y contemporáneas para teclado.
                </p>

                {/* Botones CTA Principales */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href="/tienda"
                    className="group flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#FBB03B] text-[#111C2D] font-montserrat font-extrabold text-sm uppercase tracking-wider shadow-md hover:shadow-xl hover:bg-[#e09b2d] hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <span>Explorar Partituras</span>
                    <span className="material-symbols-outlined text-lg text-[#111C2D] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </Link>

                  <Link
                    href="/compositores"
                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/90 backdrop-blur-md text-[#111C2D] border border-black/10 font-montserrat font-bold text-sm shadow-xs hover:bg-[#F0F3FF] hover:shadow-md transition-all"
                  >
                    <span className="material-symbols-outlined text-[#0071BC]">library_music</span>
                    <span>Conocer Compositores</span>
                  </Link>
                </div>

                {/* Trust notation badge */}
                <div className="flex items-center gap-2 pt-2 text-[#4C4546]">
                  <span className="material-symbols-outlined text-[#0071BC] text-lg">verified</span>
                  <span className="text-xs font-medium">Edición revisada con digitaciones de concierto y notas históricas bilingües (ES/EN).</span>
                </div>
              </div>

              {/* Columna Derecha: Tarjeta Interactiva Urtext de Partitura */}
              <div className="lg:col-span-5 relative">
                <div className="relative bg-white rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-6 border border-black/5 overflow-hidden">
                  
                  {/* Internal Bar */}
                  <div className="flex items-center justify-between pb-4 border-b border-black/5">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#C1272D]/70"></span>
                      <span className="w-3 h-3 rounded-full bg-[#FBB03B]"></span>
                      <span className="w-3 h-3 rounded-full bg-[#0071BC]"></span>
                      <span className="ml-2 text-[10px] font-bold text-[#4C4546] uppercase tracking-widest font-montserrat">Urtext Edición No. 042</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#F0F3FF] text-[10px] font-bold text-[#0071BC] font-montserrat">ISMN 979-0-901</span>
                  </div>

                  {/* Showcase Content */}
                  <div className="relative rounded-2xl bg-[#F9F9FF] p-5 shadow-inner mt-4 overflow-hidden border border-black/5">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-extrabold text-[#0071BC] uppercase tracking-wider block font-montserrat">Pasillo Lírico</span>
                        <h3 className="text-xl font-black font-montserrat text-[#111C2D]">Malvaloca</h3>
                        <p className="text-xs text-[#4C4546] font-medium">Luis A. Calvo (1882–1945) · Op. 12</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FBB03B]/30 text-[#111C2D] font-montserrat">Andante cantabile</span>
                        <span className="text-[10px] text-[#4C4546] font-semibold mt-1">♩ = 68</span>
                      </div>
                    </div>

                    {/* SVG Engraved Staff Notation */}
                    <div className="mt-4 py-3 bg-white rounded-xl px-3 shadow-2xs border border-black/5">
                      <svg className="w-full text-[#111C2D]" fill="currentColor" viewBox="0 0 460 110">
                        <path d="M10 18 h440 M10 24 h440 M10 30 h440 M10 36 h440 M10 42 h440" fill="none" opacity="0.3" stroke="currentColor" strokeWidth="0.8"></path>
                        <path d="M10 68 h440 M10 74 h440 M10 80 h440 M10 86 h440 M10 92 h440" fill="none" opacity="0.3" stroke="currentColor" strokeWidth="0.8"></path>
                        <path d="M10 18 v74 M16 18 v74" fill="none" stroke="currentColor" strokeWidth="1.6"></path>
                        <text fontFamily="serif" fontSize="28" x="22" y="38">𝄞</text>
                        <text fontFamily="serif" fontSize="22" x="24" y="85">𝄢</text>
                        <text fontFamily="serif" fontSize="14" fontStyle="italic" x="50" y="29">♭</text>
                        <text fontFamily="serif" fontSize="14" fontStyle="italic" x="58" y="23">♭</text>
                        <text fontFamily="Montserrat" fontSize="13" fontWeight="bold" x="74" y="27">3</text>
                        <text fontFamily="Montserrat" fontSize="13" fontWeight="bold" x="74" y="39">4</text>
                        <text fontFamily="Montserrat" fontSize="13" fontWeight="bold" x="74" y="77">3</text>
                        <text fontFamily="Montserrat" fontSize="13" fontWeight="bold" x="74" y="89">4</text>
                        <circle cx="108" cy="30" r="3.2"></circle>
                        <path d="M111 30 v-16 h28 v16" fill="none" stroke="currentColor" strokeWidth="1.4"></path>
                        <circle cx="138" cy="24" r="3.2"></circle>
                        <path d="M141 24 v-10" stroke="currentColor" strokeWidth="1.4"></path>
                        <ellipse cx="118" cy="80" rx="3.5" ry="2.5"></ellipse>
                        <ellipse cx="148" cy="74" rx="3.5" ry="2.5"></ellipse>
                        <path d="M190 18 v74" fill="none" opacity="0.4" stroke="currentColor" strokeWidth="0.8"></path>
                        <circle cx="218" cy="20" r="3.2"></circle>
                        <circle cx="242" cy="26" r="3.2"></circle>
                        <circle cx="266" cy="32" r="3.2"></circle>
                        <path d="M221 20 v-12 h48 v16" fill="none" stroke="currentColor" strokeWidth="1.6"></path>
                        <path d="M320 20 q3 4 0 8 t0 8 t0 8 t0 8" fill="none" stroke="currentColor" strokeWidth="1.2"></path>
                        <ellipse cx="330" cy="22" rx="3.2" ry="2.4"></ellipse>
                        <ellipse cx="330" cy="30" rx="3.2" ry="2.4"></ellipse>
                        <path d="M370 18 v74" fill="none" opacity="0.4" stroke="currentColor" strokeWidth="0.8"></path>
                        <ellipse cx="400" cy="26" fill="none" rx="4.5" ry="3" stroke="currentColor" strokeWidth="1.4"></ellipse>
                      </svg>
                    </div>

                    {/* Reproductor de Audio Demo Flotante */}
                    <div className="mt-4 flex items-center justify-between gap-3 p-3 rounded-xl bg-white shadow-xs border border-black/5">
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => setIsPlayingHero(!isPlayingHero)}
                          className="w-10 h-10 shrink-0 rounded-full bg-[#111C2D] text-[#FBB03B] flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all"
                        >
                          <span className="material-symbols-outlined text-xl">{isPlayingHero ? "pause" : "play_arrow"}</span>
                        </button>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] font-extrabold text-[#0071BC] uppercase tracking-wider font-montserrat">Muestra en Vivo</span>
                          <span className="text-xs font-bold text-[#111C2D] truncate font-montserrat">Pasillo No. 1 — L. A. Calvo</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className={`h-2 w-1 bg-[#0071BC] rounded-full ${isPlayingHero ? 'animate-pulse' : ''}`}></span>
                        <span className={`h-4 w-1 bg-[#0071BC] rounded-full ${isPlayingHero ? 'animate-pulse' : ''}`}></span>
                        <span className={`h-6 w-1 bg-[#FBB03B] rounded-full ${isPlayingHero ? 'animate-pulse' : ''}`}></span>
                        <span className={`h-3 w-1 bg-[#C1272D] rounded-full ${isPlayingHero ? 'animate-pulse' : ''}`}></span>
                        <span className="text-[10px] text-[#4C4546] font-semibold ml-1">01:42</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-4 flex items-center justify-between text-[#4C4546] text-xs">
                    <span className="flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-sm text-[#0071BC]">picture_as_pdf</span>
                      Formato Vectorial · 8 Páginas
                    </span>
                    <Link href="/partitura/score_1" className="text-xs font-bold text-[#111C2D] hover:underline flex items-center gap-0.5 font-montserrat">
                      Ver Partitura <span className="material-symbols-outlined text-xs">north_east</span>
                    </Link>
                  </div>
                </div>

                {/* Overlapping Badge Accent */}
                <div className="absolute -bottom-4 -left-4 hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white shadow-xl border border-black/5">
                  <div className="w-9 h-9 rounded-xl bg-[#FBB03B]/20 flex items-center justify-center text-[#111C2D]">
                    <span className="material-symbols-outlined text-lg">piano</span>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-[#4C4546] leading-tight font-montserrat">Grabado Urtext</p>
                    <p className="text-xs text-[#111C2D] font-black font-montserrat">100% Alta Resolución</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Quick Stats Counter Strip (Bento Pattern) */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-white shadow-xs border border-black/5">
              <div className="flex flex-col p-4 rounded-xl hover:bg-[#F0F3FF] transition-colors">
                <span className="text-3xl font-black font-montserrat text-[#111C2D] tracking-tight">350+</span>
                <span className="text-xs font-bold text-[#111C2D] font-montserrat mt-1">Partituras Digitales</span>
                <span className="text-[11px] text-[#4C4546] mt-0.5">Editadas bajo rigurosa musicología</span>
              </div>
              <div className="flex flex-col p-4 rounded-xl hover:bg-[#F0F3FF] transition-colors">
                <span className="text-3xl font-black font-montserrat text-[#0071BC] tracking-tight">85+</span>
                <span className="text-xs font-bold text-[#111C2D] font-montserrat mt-1">Compositores</span>
                <span className="text-[11px] text-[#4C4546] mt-0.5">Desde el siglo XIX hasta hoy</span>
              </div>
              <div className="flex flex-col p-4 rounded-xl hover:bg-[#F0F3FF] transition-colors">
                <span className="text-3xl font-black font-montserrat text-[#111C2D] tracking-tight">12</span>
                <span className="text-xs font-bold text-[#111C2D] font-montserrat mt-1">Ritmos Tradicionales</span>
                <span className="text-[11px] text-[#4C4546] mt-0.5">Pasillo, Bambuco, Danza, Guabina...</span>
              </div>
              <div className="flex flex-col p-4 rounded-xl hover:bg-[#F0F3FF] transition-colors">
                <div className="flex items-center gap-1">
                  <span className="text-3xl font-black font-montserrat text-[#111C2D] tracking-tight">PDF</span>
                  <span className="material-symbols-outlined text-[#0071BC] text-xl">bolt</span>
                </div>
                <span className="text-xs font-bold text-[#111C2D] font-montserrat mt-1">Descarga Inmediata</span>
                <span className="text-[11px] text-[#4C4546] mt-0.5">Con licencia legal autorizada</span>
              </div>
            </div>

          </div>
        </section>

        {/* ==========================================
               SECCIÓN 2: CATEGORÍAS PRINCIPALES (BENTO GRID 6)
               ========================================== */}
        <section className="w-full py-16 bg-[#F0F3FF]/40 border-b border-black/5" id="categorias">
          <div className="max-w-7xl mx-auto px-6">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0071BC]"></span>
                  <span className="text-xs uppercase tracking-widest text-[#0071BC] font-extrabold font-montserrat">Clasificación Orgánica</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black font-montserrat text-[#111C2D]">Categorías Principales</h2>
                <p className="text-sm text-[#4C4546] max-w-xl mt-1 leading-relaxed">
                  Explora la riqueza del repertorio pianístico colombiano según su configuración instrumental y propósito escénico.
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-[#4C4546] font-semibold">
                <span>6 Formatos Disponibles</span>
                <span>•</span>
                <span>Actualización Semanal</span>
              </div>
            </div>

            {/* 6-Card Non-Carousel Responsive Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* 1. Piano Solo */}
              <Link href="/tienda" className="group flex flex-col justify-between p-6 rounded-2xl bg-white border border-black/5 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#F0F3FF] flex items-center justify-center text-[#111C2D] group-hover:bg-[#111C2D] group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-3xl">piano</span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FBB03B]/20 text-[#111C2D] font-montserrat">
                      210 Obras
                    </span>
                  </div>
                  <h3 className="text-xl font-bold font-montserrat text-[#111C2D] group-hover:text-[#0071BC] transition-colors">Piano Solo</h3>
                  <p className="text-xs text-[#4C4546] mt-2 leading-relaxed">
                    Obras maestras para recital, concurso y profundización técnica individual. Pasillos virtuosos, bambucos de concierto e intermezzos líricos.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-between text-xs font-bold text-[#0071BC] font-montserrat group-hover:text-[#111C2D]">
                  <span>Explorar piezas solistas</span>
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">east</span>
                </div>
              </Link>

              {/* 2. Piano a 4 Manos */}
              <Link href="/tienda" className="group flex flex-col justify-between p-6 rounded-2xl bg-white border border-black/5 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#F0F3FF] flex items-center justify-center text-[#111C2D] group-hover:bg-[#0071BC] group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-3xl">group</span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F0F3FF] text-[#0071BC] font-montserrat">
                      48 Obras
                    </span>
                  </div>
                  <h3 className="text-xl font-bold font-montserrat text-[#111C2D] group-hover:text-[#0071BC] transition-colors">Piano a 4 Manos</h3>
                  <p className="text-xs text-[#4C4546] mt-2 leading-relaxed">
                    Dúos concertantes y reducciones orquestales a cuatro manos. Ideal para cátedras de música de cámara y recitales colaborativos a dos intérpretes.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-between text-xs font-bold text-[#0071BC] font-montserrat group-hover:text-[#111C2D]">
                  <span>Ver dúos de piano</span>
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">east</span>
                </div>
              </Link>

              {/* 3. Piano y Orquesta */}
              <Link href="/tienda" className="group flex flex-col justify-between p-6 rounded-2xl bg-white border border-black/5 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#F0F3FF] flex items-center justify-center text-[#111C2D] group-hover:bg-[#111C2D] group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-3xl">stadium</span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#C1272D]/10 text-[#C1272D] font-montserrat">
                      22 Conciertos
                    </span>
                  </div>
                  <h3 className="text-xl font-bold font-montserrat text-[#111C2D] group-hover:text-[#0071BC] transition-colors">Piano y Orquesta</h3>
                  <p className="text-xs text-[#4C4546] mt-2 leading-relaxed">
                    Partituras de dirección, guiones generales y reducciones a segundo piano de conciertos para piano y orquesta sinfónica colombiana.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-between text-xs font-bold text-[#0071BC] font-montserrat group-hover:text-[#111C2D]">
                  <span>Catálogo orquestal</span>
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">east</span>
                </div>
              </Link>

              {/* 4. Música de Cámara */}
              <Link href="/tienda" className="group flex flex-col justify-between p-6 rounded-2xl bg-white border border-black/5 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#F0F3FF] flex items-center justify-center text-[#111C2D] group-hover:bg-[#111C2D] group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-3xl">diversity_3</span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F0F3FF] text-[#111C2D] font-montserrat">
                      39 Partituras
                    </span>
                  </div>
                  <h3 className="text-xl font-bold font-montserrat text-[#111C2D] group-hover:text-[#0071BC] transition-colors">Música de Cámara</h3>
                  <p className="text-xs text-[#4C4546] mt-2 leading-relaxed">
                    Tríos con violín y violonchelo, sonatas para instrumentos solistas con acompañamiento de piano y ensambles folclóricos de cámara.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-between text-xs font-bold text-[#0071BC] font-montserrat group-hover:text-[#111C2D]">
                  <span>Explorar cámara</span>
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">east</span>
                </div>
              </Link>

              {/* 5. Piezas Pedagógicas */}
              <Link href="/tienda" className="group flex flex-col justify-between p-6 rounded-2xl bg-white border border-black/5 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#F0F3FF] flex items-center justify-center text-[#111C2D] group-hover:bg-[#0071BC] group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-3xl">school</span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FBB03B]/20 text-[#111C2D] font-montserrat">
                      64 Cuadernos
                    </span>
                  </div>
                  <h3 className="text-xl font-bold font-montserrat text-[#111C2D] group-hover:text-[#0071BC] transition-colors">Piezas Pedagógicas</h3>
                  <p className="text-xs text-[#4C4546] mt-2 leading-relaxed">
                    Metodologías progresivas, iniciación al teclado y repertorio graduado por niveles (Preparatorio al Nivel 6) con canciones tradicionales colombianas.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-between text-xs font-bold text-[#0071BC] font-montserrat group-hover:text-[#111C2D]">
                  <span>Ver repertorio didáctico</span>
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">east</span>
                </div>
              </Link>

              {/* 6. Piano y Electrónica */}
              <Link href="/tienda" className="group flex flex-col justify-between p-6 rounded-2xl bg-white border border-black/5 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#F0F3FF] flex items-center justify-center text-[#111C2D] group-hover:bg-[#111C2D] group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-3xl">graphic_eq</span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F0F3FF] text-[#0071BC] font-montserrat">
                      15 Obras
                    </span>
                  </div>
                  <h3 className="text-xl font-bold font-montserrat text-[#111C2D] group-hover:text-[#0071BC] transition-colors">Piano y Electrónica</h3>
                  <p className="text-xs text-[#4C4546] mt-2 leading-relaxed">
                    Vanguardia contemporánea, obras para piano preparado con cinta magnética, procesamiento digital en vivo (Max/MSP) y paisajes bio-acústicos.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-between text-xs font-bold text-[#0071BC] font-montserrat group-hover:text-[#111C2D]">
                  <span>Explorar vanguardia</span>
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">east</span>
                </div>
              </Link>

            </div>
          </div>
        </section>

        {/* ==========================================
               SECCIÓN 3: COMPOSITORES DESTACADOS
               ========================================== */}
        <section className="w-full py-16 bg-white border-b border-black/5" id="compositores">
          <div className="max-w-7xl mx-auto px-6">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FBB03B]"></span>
                  <span className="text-xs font-extrabold text-[#111C2D] tracking-widest uppercase font-montserrat">Biografías & Archivo Sonoro</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black font-montserrat text-[#111C2D]">Compositores Destacados</h2>
                <p className="text-sm text-[#4C4546] max-w-xl mt-1 leading-relaxed">
                  Los creadores y creadoras que forjaron la identidad rítmica, melódica y polifónica del teclado en Colombia.
                </p>
              </div>

              {/* Filter Pills Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-[#F0F3FF] self-start md:self-auto border border-black/5">
                {[
                  { id: "todos", label: "Todos" },
                  { id: "historico", label: "Patrimonio Histórico" },
                  { id: "contemporaneo", label: "Contemporáneos" },
                  { id: "mujeres", label: "Mujeres Compositoras" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveComposerFilter(tab.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-montserrat font-bold transition-colors ${
                      activeComposerFilter === tab.id
                        ? "bg-[#111C2D] text-white shadow-xs"
                        : "text-[#4C4546] hover:text-[#111C2D]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid 4 Profiles with circular portraits & golden glow */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* 1. Luis A. Calvo */}
              <div className="group flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-black/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="relative w-28 h-28 mb-4">
                  <div className="absolute inset-0 rounded-full bg-[#FBB03B]/40 blur-md group-hover:blur-lg group-hover:scale-110 transition-all"></div>
                  <div className="relative w-28 h-28 rounded-full bg-[#F0F3FF] border-2 border-white flex items-center justify-center text-3xl font-montserrat font-black text-[#111C2D] shadow-md">
                    LC
                  </div>
                  <span className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#111C2D] text-white flex items-center justify-center text-xs shadow">
                    <span className="material-symbols-outlined text-sm">piano</span>
                  </span>
                </div>
                <h4 className="text-lg font-bold font-montserrat text-[#111C2D] group-hover:text-[#0071BC] transition-colors">Luis A. Calvo</h4>
                <span className="text-[11px] font-bold text-[#4C4546] uppercase tracking-wider mt-0.5 font-montserrat">1882 – 1945 · Boyacá</span>
                <p className="text-xs text-[#4C4546] mt-2 line-clamp-2 leading-relaxed">
                  El máximo maestro de la poesía romántica para piano. Creador de pasillos inmortales como Malvaloca y Lejano Azul.
                </p>
                <div className="mt-6 pt-3 flex items-center justify-between w-full border-t border-black/5 text-xs">
                  <span className="font-bold text-[#0071BC]">42 Partituras</span>
                  <Link href="/compositores/luis-a-calvo" className="font-bold text-[#111C2D] hover:underline flex items-center font-montserrat">
                    Ver perfil <span className="material-symbols-outlined text-xs ml-0.5">chevron_right</span>
                  </Link>
                </div>
              </div>

              {/* 2. Pedro Morales Pino */}
              <div className="group flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-black/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="relative w-28 h-28 mb-4">
                  <div className="absolute inset-0 rounded-full bg-[#0071BC]/40 blur-md group-hover:blur-lg group-hover:scale-110 transition-all"></div>
                  <div className="relative w-28 h-28 rounded-full bg-[#F0F3FF] border-2 border-white flex items-center justify-center text-3xl font-montserrat font-black text-[#0071BC] shadow-md">
                    PM
                  </div>
                  <span className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#0071BC] text-white flex items-center justify-center text-xs shadow">
                    <span className="material-symbols-outlined text-sm">music_note</span>
                  </span>
                </div>
                <h4 className="text-lg font-bold font-montserrat text-[#111C2D] group-hover:text-[#0071BC] transition-colors">Pedro Morales Pino</h4>
                <span className="text-[11px] font-bold text-[#4C4546] uppercase tracking-wider mt-0.5 font-montserrat">1863 – 1926 · Cartago</span>
                <p className="text-xs text-[#4C4546] mt-2 line-clamp-2 leading-relaxed">
                  Pionero de la notación musical andina. Sistematizó el bambuco y el pasillo para piano y ensambles instrumentales.
                </p>
                <div className="mt-6 pt-3 flex items-center justify-between w-full border-t border-black/5 text-xs">
                  <span className="font-bold text-[#0071BC]">28 Partituras</span>
                  <Link href="/compositores/pedro-morales-pino" className="font-bold text-[#111C2D] hover:underline flex items-center font-montserrat">
                    Ver perfil <span className="material-symbols-outlined text-xs ml-0.5">chevron_right</span>
                  </Link>
                </div>
              </div>

              {/* 3. Teresa Tanco de H. */}
              <div className="group flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-black/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="relative w-28 h-28 mb-4">
                  <div className="absolute inset-0 rounded-full bg-[#FBB03B]/40 blur-md group-hover:blur-lg group-hover:scale-110 transition-all"></div>
                  <div className="relative w-28 h-28 rounded-full bg-[#F0F3FF] border-2 border-white flex items-center justify-center text-3xl font-montserrat font-black text-[#111C2D] shadow-md">
                    TT
                  </div>
                  <span className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#FBB03B] text-[#111C2D] flex items-center justify-center text-xs shadow">
                    <span className="material-symbols-outlined text-sm">star</span>
                  </span>
                </div>
                <h4 className="text-lg font-bold font-montserrat text-[#111C2D] group-hover:text-[#0071BC] transition-colors">Teresa Tanco de H.</h4>
                <span className="text-[11px] font-bold text-[#4C4546] uppercase tracking-wider mt-0.5 font-montserrat">1859 – 1946 · Bogotá</span>
                <p className="text-xs text-[#4C4546] mt-2 line-clamp-2 leading-relaxed">
                  Gran pionera de la composición académica y pianística en Colombia. Primera autora de zarzuelas y polkas de salón.
                </p>
                <div className="mt-6 pt-3 flex items-center justify-between w-full border-t border-black/5 text-xs">
                  <span className="font-bold text-[#0071BC]">14 Partituras</span>
                  <Link href="/compositores" className="font-bold text-[#111C2D] hover:underline flex items-center font-montserrat">
                    Ver perfil <span className="material-symbols-outlined text-xs ml-0.5">chevron_right</span>
                  </Link>
                </div>
              </div>

              {/* 4. Adolfo Mejía */}
              <div className="group flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-black/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="relative w-28 h-28 mb-4">
                  <div className="absolute inset-0 rounded-full bg-[#0071BC]/40 blur-md group-hover:blur-lg group-hover:scale-110 transition-all"></div>
                  <div className="relative w-28 h-28 rounded-full bg-[#F0F3FF] border-2 border-white flex items-center justify-center text-3xl font-montserrat font-black text-[#111C2D] shadow-md">
                    AM
                  </div>
                  <span className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#111C2D] text-white flex items-center justify-center text-xs shadow">
                    <span className="material-symbols-outlined text-sm">waves</span>
                  </span>
                </div>
                <h4 className="text-lg font-bold font-montserrat text-[#111C2D] group-hover:text-[#0071BC] transition-colors">Adolfo Mejía</h4>
                <span className="text-[11px] font-bold text-[#4C4546] uppercase tracking-wider mt-0.5 font-montserrat">1905 – 1973 · Cartagena</span>
                <p className="text-xs text-[#4C4546] mt-2 line-clamp-2 leading-relaxed">
                  Impresionismo caribeño en su máxima expresión. Fusión magistral entre el influjo francés de Ravel y los ritmos del litoral.
                </p>
                <div className="mt-6 pt-3 flex items-center justify-between w-full border-t border-black/5 text-xs">
                  <span className="font-bold text-[#0071BC]">19 Partituras</span>
                  <Link href="/compositores/adolfo-mejia" className="font-bold text-[#111C2D] hover:underline flex items-center font-montserrat">
                    Ver perfil <span className="material-symbols-outlined text-xs ml-0.5">chevron_right</span>
                  </Link>
                </div>
              </div>

            </div>

            {/* Extended Composers Chips Row & Link */}
            <div className="mt-10 p-4 rounded-2xl bg-[#F0F3FF] border border-black/5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start text-xs">
                <span className="font-bold text-[#111C2D] uppercase tracking-wider font-montserrat mr-1">Otros autores:</span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-[#111C2D] font-medium shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-[#111C2D]"></span> Oriol Rangel (1916–1977)
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-[#111C2D] font-medium shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-[#FBB03B]"></span> Blas Emilio Atehortúa (1943–2020)
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-[#111C2D] font-medium shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-[#0071BC]"></span> Antonio María Valencia (1902–1952)
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-[#111C2D] font-medium shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-[#C1272D]"></span> Guillermo Uribe Holguín (1880–1971)
                </span>
              </div>
              <Link href="/compositores" className="shrink-0 flex items-center gap-1 text-xs font-bold text-[#0071BC] hover:underline font-montserrat">
                <span>Ver los 85+ Compositores</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>

          </div>
        </section>

        {/* ==========================================
               SECCIÓN 4: PARTITURAS DESTACADAS (STOREFRONT)
               ========================================== */}
        <section className="w-full py-16 bg-[#F9F9FF]" id="catalogo">
          <div className="max-w-7xl mx-auto px-6">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C1272D]"></span>
                  <span className="text-xs font-extrabold text-[#C1272D] tracking-widest uppercase font-montserrat">Edición Digital Urtext</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black font-montserrat text-[#111C2D]">Partituras Destacadas</h2>
                <p className="text-sm text-[#4C4546] max-w-xl mt-1 leading-relaxed">
                  Grabados limpios a 1200 DPI con digitaciones de concierto, comentarios críticos y descarga inmediata en PDF.
                </p>
              </div>

              {/* Currency Toggle Switch */}
              <div className="flex items-center gap-2 bg-[#F0F3FF] p-1 rounded-xl border border-black/5 self-start md:self-auto">
                <span className="text-xs font-bold text-[#4C4546] px-2 font-montserrat">Moneda:</span>
                <button
                  onClick={() => setCurrency("COP")}
                  className={`px-3 py-1 rounded-lg text-xs font-montserrat font-bold transition-colors ${
                    currency === "COP" ? "bg-[#111C2D] text-white shadow-xs" : "text-[#4C4546] hover:text-[#111C2D]"
                  }`}
                >
                  COP
                </button>
                <button
                  onClick={() => setCurrency("USD")}
                  className={`px-3 py-1 rounded-lg text-xs font-montserrat font-bold transition-colors ${
                    currency === "USD" ? "bg-[#111C2D] text-white shadow-xs" : "text-[#4C4546] hover:text-[#111C2D]"
                  }`}
                >
                  USD
                </button>
              </div>
            </div>

            {/* Grid 3 Curated Sheet Music Product Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {MOCK_SCORES.map((score) => (
                <div key={score.id} className="group flex flex-col rounded-2xl bg-white border border-black/5 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden">
                  
                  {/* Sheet Miniature Top (4:5 Aspect Ratio feel) */}
                  <div className="relative aspect-[4/3] sm:aspect-[4/5] bg-[#F9F9FF] p-5 flex flex-col justify-between overflow-hidden border-b border-black/5">
                    <div className="flex items-center justify-between z-10">
                      <span className="px-2.5 py-1 rounded-full bg-[#FBB03B]/20 text-[#111C2D] font-montserrat font-extrabold text-[10px] uppercase">
                        {score.category}
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-1 bg-white border border-black/10 text-[#4C4546] rounded-full shadow-2xs font-montserrat">
                        {score.level}
                      </span>
                    </div>

                    {/* Stylized Miniature Score Staves */}
                    <div className="py-2 opacity-50 select-none">
                      <div className="h-0.5 w-full bg-slate-300 my-1.5"></div>
                      <div className="h-0.5 w-full bg-slate-300 my-1.5"></div>
                      <div className="h-0.5 w-full bg-slate-300 my-1.5"></div>
                      <div className="h-0.5 w-full bg-slate-300 my-1.5"></div>
                      <div className="h-0.5 w-full bg-slate-300 my-1.5"></div>
                      <div className="mt-3 font-serif text-center italic text-[#111C2D] font-bold text-base">{score.title}</div>
                    </div>

                    {/* Hover Action Overlay */}
                    <div className="absolute inset-0 bg-[#111C2D]/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-20">
                      <Link
                        href={`/partitura/${score.slug}`}
                        className="w-12 h-12 rounded-full bg-[#FBB03B] text-[#111C2D] shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                      >
                        <span className="material-symbols-outlined text-2xl">visibility</span>
                      </Link>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#4C4546] font-medium z-10">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-[#0071BC]">picture_as_pdf</span>
                        Formato Vectorial
                      </span>
                      <span className="text-[#0071BC] font-bold">Edición Urtext</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-[#111C2D] font-montserrat group-hover:text-[#0071BC] transition-colors leading-snug">
                        {score.title}
                      </h3>
                      <p className="text-xs text-[#4C4546] font-semibold mt-1">{score.composer}</p>
                      <p className="text-xs text-[#4C4546] mt-3 line-clamp-2 leading-relaxed font-normal">
                        {score.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-black/5 flex justify-between items-center">
                      <div>
                        <span className="text-lg font-black text-[#111C2D] font-montserrat">
                          {currency === "COP" ? `$${score.priceCOP.toLocaleString('es-CO')} COP` : `$${score.priceUSD} USD`}
                        </span>
                        <span className="text-[10px] text-[#4C4546] block font-medium">
                          {currency === "COP" ? `~$${score.priceUSD} USD` : `~$${score.priceCOP.toLocaleString('es-CO')} COP`}
                        </span>
                      </div>
                      <Link
                        href={`/partitura/${score.slug}`}
                        className="p-3 rounded-xl bg-[#111C2D] text-white hover:bg-[#FBB03B] hover:text-[#111C2D] transition-all shadow-xs flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
                      </Link>
                    </div>
                  </div>

                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ==========================================
               SECCIÓN 5: BITÁCORA & NOTICIAS
               ========================================== */}
        <section className="w-full py-16 bg-[#F0F3FF]/40 border-t border-black/5">
          <div className="max-w-7xl mx-auto px-6">
            
            <div className="flex justify-between items-end mb-10">
              <div>
                <span className="text-xs font-extrabold text-[#0071BC] tracking-widest uppercase font-montserrat">Bitácora Pianística</span>
                <h2 className="text-3xl font-black font-montserrat mt-1 text-[#111C2D]">Actualidad Musical & Noticias</h2>
              </div>
              <Link href="/blog" className="text-xs font-bold text-[#0071BC] hover:underline font-montserrat flex items-center gap-1">
                <span>Ver todos los artículos</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "El Bambuco en el Piano: Rítmica y Articulación para Concierto",
                  cat: "Pedagogía",
                  date: "1 Sept, 2026",
                  slug: "el-bambuco-en-el-piano-ritmica-y-articulacion",
                },
                {
                  title: "Luis A. Calvo y el Intermezzo Romántico en Colombia",
                  cat: "Historia",
                  date: "28 Ago, 2026",
                  slug: "luis-a-calvo-y-el-intermezzo-romantico",
                },
                {
                  title: "Nuevas Ediciones Críticas Revisadas en Piano Colombia",
                  cat: "Actualidad",
                  date: "20 Ago, 2026",
                  slug: "nuevas-ediciones-criticas-revisadas-piano-colombia",
                },
              ].map((post, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="px-3 py-1 bg-[#F0F3FF] text-[#0071BC] rounded-full font-bold">{post.cat}</span>
                      <span className="text-[#4C4546] font-medium">{post.date}</span>
                    </div>
                    <h3 className="text-lg font-bold font-montserrat text-[#111C2D] group-hover:text-[#0071BC] transition-colors leading-snug">{post.title}</h3>
                  </div>
                  <Link href={`/blog/${post.slug}`} className="text-xs font-bold text-[#0071BC] hover:text-[#111C2D] transition font-montserrat pt-4 inline-flex items-center gap-1">
                    <span>Leer noticia</span>
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </Link>
                </div>
              ))}
            </div>

          </div>
        </section>

      </main>

      {/* Footer Elegante Stitch */}
      <Footer />

    </div>
  );
}



