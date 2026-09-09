"use client";

import Link from "next/link";
import { useState } from "react";
import { MOCK_SCORES } from "@/lib/mock-data";

export default function CompositorDashboardPage() {
  const [activeMainTab, setActiveMainTab] = useState<"metricas" | "partituras">("metricas");
  const [scoreFilter, setScoreFilter] = useState<"todas" | "publicadas" | "revision" | "borradores">("todas");
  const [searchQuery, setSearchQuery] = useState("");

  const mockComposerScores = [
    {
      id: "score_1",
      slug: "bambuco-re-mayor",
      title: "Bambuco en Re Mayor",
      category: "Piano Solo",
      level: "Avanzado",
      ismn: "979-0-901314-02-1",
      format: "PDF Urtext A4 (24 págs)",
      priceCOP: 45000,
      priceUSD: 12,
      status: "published",
      salesCount: 42,
      grossEarnings: 1890000,
      netEarnings: 1512000, // 80%
      updatedAt: "10 Ene 2026",
    },
    {
      id: "score_2",
      slug: "malvaloca",
      title: "Malvaloca (Intermezzo Danza)",
      category: "Piano Solo",
      level: "Intermedio",
      ismn: "979-0-901314-18-2",
      format: "Edición Crítica (18 págs)",
      priceCOP: 55000,
      priceUSD: 14,
      status: "published",
      salesCount: 38,
      grossEarnings: 2090000,
      netEarnings: 1672000,
      updatedAt: "28 Dic 2025",
    },
    {
      id: "score_3",
      slug: "intermezzo-1",
      title: "Intermezzo No. 1",
      category: "Piano / Cámara",
      level: "Avanzado",
      ismn: "979-0-901314-07-6",
      format: "Con Particellas (32 págs)",
      priceCOP: 65000,
      priceUSD: 16,
      status: "published",
      salesCount: 29,
      grossEarnings: 1885000,
      netEarnings: 1508000,
      updatedAt: "14 Nov 2025",
    },
    {
      id: "score_4",
      slug: "pasillo-evocacion",
      title: "Pasillo No. 3 'Evocación en Fa menor'",
      category: "Piano Solo",
      level: "Concierto",
      ismn: "979-0-901314-22-9",
      format: "Manuscrito Revisado (16 págs)",
      priceCOP: 50000,
      priceUSD: 13,
      status: "review",
      salesCount: 0,
      grossEarnings: 0,
      netEarnings: 0,
      updatedAt: "Hace 2 días",
    },
    {
      id: "score_5",
      slug: "suite-andina",
      title: "Suite Andina Pianística - Mov. II Guabina",
      category: "Pedagógico",
      level: "Intermedio",
      ismn: "979-0-901314-30-4",
      format: "Borrador Incompleto",
      priceCOP: 40000,
      priceUSD: 10,
      status: "draft",
      salesCount: 0,
      grossEarnings: 0,
      netEarnings: 0,
      updatedAt: "Ayer",
    },
  ];

  const filteredScores = mockComposerScores.filter((score) => {
    const matchesQuery =
      score.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      score.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      score.ismn.includes(searchQuery);

    if (scoreFilter === "publicadas") return matchesQuery && score.status === "published";
    if (scoreFilter === "revision") return matchesQuery && score.status === "review";
    if (scoreFilter === "borradores") return matchesQuery && score.status === "draft";
    return matchesQuery;
  });

  return (
    <div className="space-y-8 text-[#111C2D]">
      
      {/* 1. Header Hero Compositor */}
      <section className="relative p-6 lg:p-8 bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="absolute -right-20 -top-24 w-96 h-96 bg-gradient-to-br from-[#FBB03B]/20 via-[#0071BC]/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-[#FBB03B] shadow-md bg-[#F0F3FF] flex items-center justify-center font-montserrat font-black text-2xl text-[#111C2D]">
                AM
              </div>
              <div className="absolute -bottom-1 -right-1 flex items-center justify-center p-1 bg-white rounded-full shadow-sm">
                <span className="material-symbols-outlined text-[#0071BC] text-xl">verified</span>
              </div>
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="font-montserrat text-2xl md:text-3xl font-black text-[#111C2D] tracking-tight">
                  Maestro Adolfo Mejía
                </h1>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F0F3FF] border border-[#0071BC]/10 rounded-full">
                  <div className="flex items-center gap-0.5">
                    <span className="h-3 w-1 bg-[#111C2D] rounded-full"></span>
                    <span className="h-3 w-1 bg-[#FBB03B] rounded-full"></span>
                    <span className="h-3 w-1 bg-[#0071BC] rounded-full"></span>
                  </div>
                  <span className="text-[11px] font-extrabold text-[#0071BC] font-montserrat uppercase tracking-wider">
                    Compositor Verificado
                  </span>
                </div>
              </div>

              <p className="text-xs md:text-sm text-[#4C4546] font-normal max-w-xl leading-relaxed">
                Obra para Piano Tradicional y Neoclásica Andina • Afiliado SAYCO-ACINPRO No. COL-8924
              </p>

              <div className="flex items-center gap-4 mt-2 text-xs text-[#4C4546] font-medium">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-[#0071BC]">schedule</span>
                  Última liquidación: 15 Ago 2026
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-bold text-[#111C2D]">
                  <span className="material-symbols-outlined text-sm text-[#FBB03B]">music_note</span>
                  14 Obras registradas
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto shrink-0">
            <Link
              href="/compositores/adolfo-mejia"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F0F3FF] hover:bg-slate-200/60 text-[#111C2D] font-bold text-xs rounded-xl transition border border-black/5 font-montserrat"
            >
              <span className="material-symbols-outlined text-base">visibility</span>
              <span>Ver perfil público</span>
            </Link>
            <Link
              href="/compositor/dashboard/partituras/nueva"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FBB03B] hover:bg-[#e09b2d] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition font-montserrat"
            >
              <span className="material-symbols-outlined text-base">upload_file</span>
              <span>Subir nueva partitura</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Navegación Principal de Pestañas (Segmented Switcher Adaptativo) */}
      <div className="bg-white p-2 rounded-2xl border border-black/5 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-2 font-montserrat">
        <button
          type="button"
          onClick={() => setActiveMainTab("metricas")}
          className={`flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl font-extrabold text-xs transition cursor-pointer ${
            activeMainTab === "metricas"
              ? "bg-[#111C2D] text-white shadow-sm"
              : "bg-[#F0F3FF] text-[#4C4546] hover:text-[#111C2D] hover:bg-slate-200/60"
          }`}
        >
          <span className="material-symbols-outlined text-base text-[#FBB03B]">analytics</span>
          <span className="truncate">Panel de Métricas & Ventas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab("partituras")}
          className={`flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl font-extrabold text-xs transition cursor-pointer ${
            activeMainTab === "partituras"
              ? "bg-[#111C2D] text-white shadow-sm"
              : "bg-[#F0F3FF] text-[#4C4546] hover:text-[#111C2D] hover:bg-slate-200/60"
          }`}
        >
          <span className="material-symbols-outlined text-base text-[#0071BC]">library_music</span>
          <span>Mis Partituras</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
            activeMainTab === "partituras" ? "bg-[#FBB03B] text-[#111C2D]" : "bg-white text-[#0071BC] border border-black/5"
          }`}>
            {mockComposerScores.length}
          </span>
        </button>

        <Link
          href="/compositor/dashboard/perfil"
          className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl font-extrabold text-xs bg-[#F0F3FF] text-[#4C4546] hover:text-[#111C2D] hover:bg-slate-200/60 transition"
        >
          <span className="material-symbols-outlined text-base text-[#C1272D]">badge</span>
          <span>Perfil & Biografía</span>
        </Link>
      </div>

      {/* ==========================================
             PESTAÑA 1: PANEL DE MÉTRICAS
             ========================================== */}
      {activeMainTab === "metricas" && (
        <div className="space-y-8">
          
          {/* KPI Cards (4 Bento Grid) */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between group hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4C4546] font-montserrat">
                  Ventas Totales Brutas
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#F0F3FF] flex items-center justify-center text-[#111C2D] group-hover:bg-[#111C2D] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-xl">query_stats</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-black font-montserrat text-[#111C2D] tracking-tight">
                  $5.865.000 <span className="text-xs font-bold text-[#4C4546]">COP</span>
                </div>
                <div className="flex items-center gap-1 mt-2 text-[#0071BC] text-xs font-bold font-montserrat">
                  <span className="material-symbols-outlined text-base">trending_up</span>
                  <span>+18.4% este trimestre</span>
                </div>
              </div>
              <div className="mt-4 pt-3 bg-[#F0F3FF]/60 -mx-6 -mb-6 px-6 pb-3 rounded-b-2xl border-t border-black/5 text-[11px] text-[#4C4546] font-medium">
                109 partituras licenciadas en 8 países
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between group hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4C4546] font-montserrat">
                    Regalías Netas Autor
                  </span>
                  <span className="px-2 py-0.5 bg-[#FBB03B]/20 text-[#111C2D] text-[10px] font-black rounded-md font-montserrat">
                    80% Net
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#F0F3FF] flex items-center justify-center text-[#0071BC] group-hover:bg-[#0071BC] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-black font-montserrat text-[#111C2D] tracking-tight">
                  $4.692.000 <span className="text-xs font-bold text-[#4C4546]">COP</span>
                </div>
                <div className="flex items-center gap-1 mt-2 text-[#111C2D] text-xs font-bold font-montserrat">
                  <span className="material-symbols-outlined text-base text-[#FBB03B]">verified</span>
                  <span>Fondo neto acreditado en PayPal</span>
                </div>
              </div>
              <div className="mt-4 pt-3 bg-[#F0F3FF]/60 -mx-6 -mb-6 px-6 pb-3 rounded-b-2xl border-t border-black/5 text-[11px] text-[#4C4546] font-medium">
                20% retenido para mantenimiento de la plataforma
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between group hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4C4546] font-montserrat">
                  Próximo Desembolso
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#FBB03B]/20 flex items-center justify-center text-[#111C2D]">
                  <span className="material-symbols-outlined text-xl">hourglass_top</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-black font-montserrat text-[#111C2D] tracking-tight">
                  $540.000 <span className="text-xs font-bold text-[#4C4546]">COP</span>
                </div>
                <div className="flex items-center gap-1 mt-2 text-[#4C4546] text-xs font-medium">
                  <span className="material-symbols-outlined text-sm text-[#0071BC]">event_repeat</span>
                  <span>Programado: 15 de Sept. 2026</span>
                </div>
              </div>
              <div className="mt-4 pt-3 bg-[#F0F3FF]/60 -mx-6 -mb-6 px-6 pb-3 rounded-b-2xl border-t border-black/5 flex items-center justify-between text-[11px] text-[#4C4546] font-medium">
                <span>PayPal (adolfo.mejia@...)</span>
                <span className="material-symbols-outlined text-xs text-[#0071BC]">lock</span>
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between group hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4C4546] font-montserrat">
                  Histórico Transferido
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#F0F3FF] flex items-center justify-center text-[#111C2D] group-hover:bg-[#111C2D] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-xl">receipt_long</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-black font-montserrat text-[#111C2D] tracking-tight">
                  $1.440.000 <span className="text-xs font-bold text-[#4C4546]">COP</span>
                </div>
                <div className="flex items-center gap-1 mt-2 text-[#4C4546] text-xs font-medium">
                  <span className="material-symbols-outlined text-sm text-emerald-600">done_all</span>
                  <span>3 lotes PayPal liquidados</span>
                </div>
              </div>
              <div className="mt-4 pt-3 bg-[#F0F3FF]/60 -mx-6 -mb-6 px-6 pb-3 rounded-b-2xl border-t border-black/5 flex items-center justify-between text-[11px]">
                <Link href="/compositor/dashboard/pagos" className="font-bold text-[#0071BC] hover:underline">
                  Ver detalle de dispersiones →
                </Link>
              </div>
            </div>

          </section>

          {/* Gráfico y Alcance Global */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-8 p-6 lg:p-8 bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-black font-montserrat text-[#111C2D]">Rendimiento de Ventas & Descargas</h2>
                  <p className="text-xs text-[#4C4546] font-normal mt-0.5">Evolución mensual de copias digitales licenciadas</p>
                </div>
              </div>

              <div className="w-full h-56 relative flex items-end my-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 700 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0071BC" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#0071BC" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <line x1="0" y1="40" x2="700" y2="40" stroke="#F0F3FF" strokeWidth="1" strokeDasharray="4,4" />
                  <line x1="0" y1="100" x2="700" y2="100" stroke="#F0F3FF" strokeWidth="1" strokeDasharray="4,4" />
                  <line x1="0" y1="190" x2="700" y2="190" stroke="#E2E8F0" strokeWidth="1" />

                  <path d="M 30,160 Q 140,140 250,110 T 470,75 T 670,30 L 670,190 L 30,190 Z" fill="url(#trendGradient)" />
                  <path d="M 30,160 Q 140,140 250,110 T 470,75 T 670,30" fill="none" stroke="#0071BC" strokeWidth="3.5" strokeLinecap="round" />

                  <circle cx="670" cy="30" r="6" fill="#FBB03B" stroke="#111C2D" strokeWidth="2.5" />
                  <circle cx="470" cy="75" r="4.5" fill="#0071BC" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="250" cy="110" r="4.5" fill="#0071BC" stroke="#ffffff" strokeWidth="2" />
                </svg>
              </div>

              <div className="flex justify-between items-center text-xs font-mono text-[#4C4546] pt-2 border-t border-black/5">
                <span>May ($450k)</span>
                <span>Jun ($680k)</span>
                <span>Jul ($890k)</span>
                <span>Ago ($1.150k)</span>
                <span className="font-bold text-[#0071BC]">Sep ($1.890k)</span>
              </div>
            </div>

            <div className="lg:col-span-4 p-6 lg:p-8 bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-black font-montserrat text-[#111C2D]">Alcance Internacional</h2>
                  <span className="material-symbols-outlined text-[#0071BC]">public</span>
                </div>
                <p className="text-xs text-[#4C4546] mb-6 leading-relaxed">
                  Distribución geográfica de pianistas que han adquirido tu catálogo.
                </p>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1 text-[#111C2D]">
                      <span className="flex items-center gap-1.5">🇨🇴 Colombia</span>
                      <span className="font-bold">52%</span>
                    </div>
                    <div className="w-full h-2 bg-[#F0F3FF] rounded-full overflow-hidden">
                      <div className="h-full bg-[#111C2D] rounded-full" style={{ width: "52%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1 text-[#111C2D]">
                      <span className="flex items-center gap-1.5">🇺🇸 Estados Unidos</span>
                      <span className="font-bold">24%</span>
                    </div>
                    <div className="w-full h-2 bg-[#F0F3FF] rounded-full overflow-hidden">
                      <div className="h-full bg-[#0071BC] rounded-full" style={{ width: "24%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1 text-[#111C2D]">
                      <span className="flex items-center gap-1.5">🇪🇸 España</span>
                      <span className="font-bold">14%</span>
                    </div>
                    <div className="w-full h-2 bg-[#F0F3FF] rounded-full overflow-hidden">
                      <div className="h-full bg-[#FBB03B] rounded-full" style={{ width: "14%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </section>

        </div>
      )}

      {/* ==========================================
             PESTAÑA 2: MIS PARTITURAS
             ========================================== */}
      {activeMainTab === "partituras" && (
        <div className="space-y-6">
          
          {/* Header de Mis Partituras */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
            <div className="space-y-1">
              <h2 className="text-2xl font-black font-montserrat text-[#111C2D]">
                Gestión de Partituras Publicadas
              </h2>
              <p className="text-xs text-[#4C4546]">
                Administra tus obras cargadas, revisa el estado de aprobación musicológica y monitorea las ventas individuales.
              </p>
            </div>

            <Link
              href="/compositor/dashboard/partituras/nueva"
              className="px-5 py-3 bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center justify-center gap-2 shrink-0"
            >
              <span className="material-symbols-outlined text-lg">add_circle</span>
              Subir Nueva Partitura
            </Link>
          </div>

          {/* Toolbar de Búsqueda y Filtros */}
          <div className="p-4 bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Buscador */}
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4C4546] text-lg">search</span>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrar obras por título, categoría o ISMN..."
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#F0F3FF] border border-black/5 rounded-xl text-[#111C2D] placeholder-[#4C4546]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
              />
            </div>

            {/* Selector de Estado */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <button
                onClick={() => setScoreFilter("todas")}
                className={`px-3.5 py-2 rounded-xl text-xs font-montserrat font-bold transition whitespace-nowrap ${
                  scoreFilter === "todas"
                    ? "bg-[#111C2D] text-white shadow-2xs"
                    : "bg-[#F0F3FF] text-[#4C4546] hover:text-[#111C2D]"
                }`}
              >
                Todas ({mockComposerScores.length})
              </button>
              <button
                onClick={() => setScoreFilter("publicadas")}
                className={`px-3.5 py-2 rounded-xl text-xs font-montserrat font-bold transition whitespace-nowrap ${
                  scoreFilter === "publicadas"
                    ? "bg-[#111C2D] text-white shadow-2xs"
                    : "bg-[#F0F3FF] text-[#4C4546] hover:text-[#111C2D]"
                }`}
              >
                Publicadas (3)
              </button>
              <button
                onClick={() => setScoreFilter("revision")}
                className={`px-3.5 py-2 rounded-xl text-xs font-montserrat font-bold transition whitespace-nowrap ${
                  scoreFilter === "revision"
                    ? "bg-[#111C2D] text-white shadow-2xs"
                    : "bg-[#F0F3FF] text-[#4C4546] hover:text-[#111C2D]"
                }`}
              >
                En Revisión (1)
              </button>
              <button
                onClick={() => setScoreFilter("borradores")}
                className={`px-3.5 py-2 rounded-xl text-xs font-montserrat font-bold transition whitespace-nowrap ${
                  scoreFilter === "borradores"
                    ? "bg-[#111C2D] text-white shadow-2xs"
                    : "bg-[#F0F3FF] text-[#4C4546] hover:text-[#111C2D]"
                }`}
              >
                Borradores (1)
              </button>
            </div>

          </div>

          {/* Tabla & Cards de Partituras */}
          <div className="bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="w-full overflow-x-auto overscroll-x-contain">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F0F3FF] text-[#4C4546] font-montserrat text-[11px] font-extrabold uppercase tracking-wider border-b border-black/5">
                    <th className="py-4 px-6">Partitura & Formato</th>
                    <th className="py-4 px-6">ISMN / Categoría</th>
                    <th className="py-4 px-6">PVP Publicado</th>
                    <th className="py-4 px-6">Estado Editorial</th>
                    <th className="py-4 px-6">Ventas</th>
                    <th className="py-4 px-6">Ganancia Neta (80%)</th>
                    <th className="py-4 px-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-xs text-[#111C2D]">
                  {filteredScores.map((score) => (
                    <tr key={score.id} className="hover:bg-[#F0F3FF]/40 transition group">
                      
                      {/* Partitura & Formato */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#111C2D] text-[#FBB03B] flex items-center justify-center shrink-0 font-bold">
                            <span className="material-symbols-outlined text-xl">music_note</span>
                          </div>
                          <div>
                            <h3 className="font-bold font-montserrat text-sm text-[#111C2D] group-hover:text-[#0071BC] transition-colors">
                              {score.title}
                            </h3>
                            <span className="text-[11px] text-[#4C4546] block">{score.format}</span>
                          </div>
                        </div>
                      </td>

                      {/* ISMN / Categoría */}
                      <td className="py-4 px-6">
                        <span className="font-mono text-xs font-bold text-[#111C2D] block">{score.ismn}</span>
                        <span className="inline-block px-2 py-0.5 bg-[#F0F3FF] text-[#0071BC] text-[10px] font-bold rounded mt-0.5 font-montserrat">
                          {score.category} • {score.level}
                        </span>
                      </td>

                      {/* PVP */}
                      <td className="py-4 px-6 font-mono font-bold">
                        <div>${score.priceCOP.toLocaleString('es-CO')} COP</div>
                        <span className="text-[10px] text-[#4C4546]">(${score.priceUSD} USD)</span>
                      </td>

                      {/* Estado Editorial */}
                      <td className="py-4 px-6">
                        {score.status === "published" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-extrabold font-montserrat border border-emerald-200">
                            <span className="material-symbols-outlined text-xs">verified</span>
                            Publicada & Protegida
                          </span>
                        )}
                        {score.status === "review" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 rounded-full text-[10px] font-extrabold font-montserrat border border-amber-200">
                            <span className="material-symbols-outlined text-xs">hourglass_top</span>
                            En Revisión Musicológica
                          </span>
                        )}
                        {score.status === "draft" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-[10px] font-extrabold font-montserrat border border-slate-200">
                            <span className="material-symbols-outlined text-xs">edit_note</span>
                            Borrador Incompleto
                          </span>
                        )}
                      </td>

                      {/* Ventas */}
                      <td className="py-4 px-6 font-montserrat font-bold text-sm">
                        {score.salesCount} <span className="text-xs font-normal text-[#4C4546]">copias</span>
                      </td>

                      {/* Ganancia Neta */}
                      <td className="py-4 px-6 font-mono font-black text-sm text-emerald-700">
                        ${score.netEarnings.toLocaleString('es-CO')} COP
                      </td>

                      {/* Acciones */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {score.status === "published" && (
                            <Link
                              href={`/partitura/${score.slug}`}
                              className="px-3 py-1.5 bg-[#F0F3FF] hover:bg-slate-200/60 text-[#0071BC] rounded-xl font-bold text-xs transition font-montserrat inline-flex items-center gap-1 border border-black/5"
                            >
                              <span className="material-symbols-outlined text-sm">visibility</span>
                              Visor Muestra
                            </Link>
                          )}
                          <button
                            onClick={() => alert(`Editando metadatos de ${score.title}...`)}
                            className="p-2 text-[#4C4546] hover:text-[#111C2D] hover:bg-[#F0F3FF] rounded-xl transition"
                            title="Editar Metadatos"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Infobox de Seguridad y Derechos de Autor */}
          <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#F0F3FF] text-[#0071BC] rounded-2xl shrink-0 border border-black/5">
                <span className="material-symbols-outlined text-2xl">shield</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold font-montserrat text-[#111C2D]">
                  Protección de Marcas de Agua & Visor al 40%
                </h3>
                <p className="text-xs text-[#4C4546] leading-relaxed">
                  Tus archivos PDF originales son resguardados en servidores cifrados. La tienda pública solo exhibe una muestra protegida con opacidad reducida al 40%, desenfoque progresivo y marca diagonal anti-copia.
                </p>
              </div>
            </div>

            <Link
              href="/compositor/dashboard/partituras/nueva"
              className="px-4 py-2.5 rounded-xl border border-black/10 text-[#111C2D] bg-[#F0F3FF] hover:bg-slate-200/60 font-bold text-xs transition shadow-2xs font-montserrat shrink-0 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base text-[#0071BC]">cloud_upload</span>
              Subir Nueva Obra
            </Link>
          </div>

        </div>
      )}

    </div>
  );
}
