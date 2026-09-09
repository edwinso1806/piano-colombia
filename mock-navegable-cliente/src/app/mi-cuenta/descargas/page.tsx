"use client";

import Link from "next/link";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function MisDescargasPage() {
  const [activeTab, setActiveTab] = useState<"descargas" | "pedidos" | "colecciones">("descargas");
  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("todas");

  const purchasedScores = [
    {
      id: "score_1",
      title: "Bambuco en Re Mayor",
      composer: "Adolfo Mejía",
      category: "Piano Solo",
      format: "Formato A4 Urtext",
      ismn: "979-0-901314-02-1",
      license: "Licencia Activa",
      userStamp: "Juan Pérez (juan@ejemplo.com)",
      copies: "1 Copia Impresa Autorizada para Concierto/Estudio",
      downloadsLeft: 3,
      downloadsTotal: 5,
      progressPercent: 60,
      iconColor: "text-cyan-400",
    },
    {
      id: "score_2",
      title: "Malvaloca (Intermezzo Danza)",
      composer: "Luis A. Calvo",
      category: "Piano Solo",
      format: "Edición Crítica",
      ismn: "979-0-901314-18-2",
      license: "Licencia Activa",
      userStamp: "Juan Pérez (juan@ejemplo.com)",
      copies: "1 Copia Impresa Autorizada",
      downloadsLeft: 4,
      downloadsTotal: 5,
      progressPercent: 80,
      iconColor: "text-emerald-400",
    },
    {
      id: "score_3",
      title: "Intermezzo No. 1",
      composer: "Luis A. Calvo",
      category: "Piano Solo / Trío",
      format: "Incluye Particellas",
      ismn: "979-0-901314-07-6",
      license: "Licencia Activa",
      userStamp: "Juan Pérez (juan@ejemplo.com)",
      copies: "1 Copia Impresa Autorizada",
      downloadsLeft: 5,
      downloadsTotal: 5,
      progressPercent: 100,
      iconColor: "text-amber-400",
    },
  ];

  const orders = [
    {
      id: "PCM-98472",
      date: "28 Ago 2026",
      item: "Bambuco en Re Mayor — Adolfo Mejía",
      gateway: "Wompi (PSE Bancolombia)",
      totalCOP: 45000,
      status: "Aprobado & Entregado",
      invoiceNumber: "FE-2026-00412",
    },
    {
      id: "PCM-84721",
      date: "14 Ago 2026",
      item: "Malvaloca (Intermezzo Danza) — Luis A. Calvo",
      gateway: "Wompi (Nequi)",
      totalCOP: 55000,
      status: "Aprobado & Entregado",
      invoiceNumber: "FE-2026-00389",
    },
    {
      id: "PCM-73910",
      date: "02 Jul 2026",
      item: "Intermezzo No. 1 — Luis A. Calvo",
      gateway: "PayPal ($16 USD / COP)",
      totalCOP: 65000,
      status: "Aprobado & Entregado",
      invoiceNumber: "FE-2026-00245",
    },
  ];

  const collections = [
    {
      id: "col_1",
      name: "Pasillos & Danzas de la Zona Andina",
      count: 4,
      items: ["Pasillo No. 3 Evocación", "Bambuco en Re Mayor", "Danse Créole", "Pasillo de Concierto"],
      updated: "Hace 2 días",
      icon: "piano",
    },
    {
      id: "col_2",
      name: "Repertorio Neoclásico Colombiano",
      count: 5,
      items: ["Sonatina No. 1", "Preludio y Fuga sobre Tema Colombiano", "Intermezzo No. 2"],
      updated: "Hace 1 semana",
      icon: "library_music",
    },
    {
      id: "col_3",
      name: "Cuadernos Pedagógicos Grado 4-6",
      count: 3,
      items: ["Iniciación Pianística Colombiana Vol. II", "Estudios Rítmicos Andinos"],
      updated: "Hace 3 semanas",
      icon: "school",
    },
  ];

  const filteredScores = purchasedScores.filter((score) => {
    const matchesSearch =
      score.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      score.composer.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCat =
      categoryFilter === "todas" ||
      (categoryFilter === "solo" && score.category.includes("Piano Solo")) ||
      (categoryFilter === "camara" && (score.category.includes("Trío") || score.category.includes("Cámara")));
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-[#F9F9FF] text-[#111C2D] flex flex-col font-inter selection:bg-[#FBB03B]/30 selection:text-[#111C2D]">
      
      {/* Header Unificado Stitch */}
      <Header activePage="tienda" />

      {/* Customer Navigation Tabs Bar */}
      <section className="bg-white border-b border-black/5">
        <div className="max-w-7xl mx-auto px-6">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="py-3 flex items-center text-xs text-[#4C4546] font-medium space-x-2">
            <Link href="/" className="hover:text-[#0071BC] transition">Inicio</Link>
            <span>/</span>
            <span className="hover:text-[#0071BC] cursor-pointer">Mi Cuenta</span>
            <span>/</span>
            <span aria-current="page" className="text-[#111C2D] font-bold">
              {activeTab === "descargas" && "Mis Partituras Compradas"}
              {activeTab === "pedidos" && "Historial de Pedidos & Facturas"}
              {activeTab === "colecciones" && "Colecciones Guardadas"}
            </span>
          </nav>

          {/* Account Navigation Pills */}
          <div className="flex items-center space-x-2 w-full overflow-x-auto overscroll-x-contain scrollbar-none pt-1 pb-3 text-xs font-semibold border-t border-black/5">
            <button
              onClick={() => setActiveTab("descargas")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-montserrat font-bold whitespace-nowrap transition ${
                activeTab === "descargas"
                  ? "text-[#111C2D] border-b-2 border-[#FBB03B] font-black bg-[#F0F3FF]/60"
                  : "text-[#4C4546] hover:text-[#111C2D] hover:bg-[#F0F3FF]/40"
              }`}
            >
              <span className="material-symbols-outlined text-base text-[#FBB03B]">description</span>
              Mis Partituras Compradas
              <span className="bg-[#FBB03B]/20 text-[#111C2D] text-[10px] px-2 py-0.5 rounded-full font-black">3</span>
            </button>

            <button
              onClick={() => setActiveTab("pedidos")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-montserrat font-bold whitespace-nowrap transition ${
                activeTab === "pedidos"
                  ? "text-[#111C2D] border-b-2 border-[#FBB03B] font-black bg-[#F0F3FF]/60"
                  : "text-[#4C4546] hover:text-[#111C2D] hover:bg-[#F0F3FF]/40"
              }`}
            >
              <span className="material-symbols-outlined text-base text-[#0071BC]">receipt_long</span>
              Historial de Pedidos & Facturas
              <span className="bg-[#F0F3FF] text-[#0071BC] text-[10px] px-2 py-0.5 rounded-full font-black border border-[#0071BC]/10">3</span>
            </button>

            <button
              onClick={() => setActiveTab("colecciones")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-montserrat font-bold whitespace-nowrap transition ${
                activeTab === "colecciones"
                  ? "text-[#111C2D] border-b-2 border-[#FBB03B] font-black bg-[#F0F3FF]/60"
                  : "text-[#4C4546] hover:text-[#111C2D] hover:bg-[#F0F3FF]/40"
              }`}
            >
              <span className="material-symbols-outlined text-base text-[#C1272D]">bookmark</span>
              Colecciones Guardadas
              <span className="bg-[#F0F3FF] text-[#C1272D] text-[10px] px-2 py-0.5 rounded-full font-black border border-[#C1272D]/10">3</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 md:py-12 space-y-8">
        
        {/* ==========================================
               PESTAÑA 1: MIS PARTITURAS COMPRADAS
               ========================================== */}
        {activeTab === "descargas" && (
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F3FF] border border-[#0071BC]/10 text-[#0071BC] text-[11px] font-extrabold uppercase tracking-wider mb-3 font-montserrat">
                <span className="w-2 h-2 rounded-full bg-[#0071BC] animate-pulse"></span>
                Área de Cliente • Licencias Digitales
              </div>
              <h1 className="text-3xl sm:text-4xl font-black font-montserrat text-[#111C2D] tracking-tight mb-2">
                Mis Partituras Compradas
              </h1>
              <p className="text-sm md:text-base text-[#4C4546] max-w-3xl leading-relaxed font-normal">
                Gestiona tus licencias adquiridas, descarga tus archivos PDF oficiales con estampado de seguridad antifraude de alta fidelidad y accede a grabaciones y materiales de referencia.
              </p>

              {/* Toolbar de Filtros & Búsqueda */}
              <div className="mt-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4C4546] text-lg">search</span>
                  <input
                    type="search"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Filtrar por obra o compositor..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#F0F3FF] border border-black/5 rounded-xl text-[#111C2D] placeholder-[#4C4546]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className="text-[#4C4546] hidden sm:inline">Filtrar:</span>
                  <button
                    onClick={() => setCategoryFilter("todas")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-montserrat font-bold transition ${
                      categoryFilter === "todas"
                        ? "bg-[#111C2D] text-white shadow-2xs"
                        : "bg-[#F0F3FF] text-[#4C4546] hover:text-[#111C2D]"
                    }`}
                  >
                    Todas ({purchasedScores.length})
                  </button>
                  <button
                    onClick={() => setCategoryFilter("solo")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-montserrat font-bold transition ${
                      categoryFilter === "solo"
                        ? "bg-[#111C2D] text-white shadow-2xs"
                        : "bg-[#F0F3FF] text-[#4C4546] hover:text-[#111C2D]"
                    }`}
                  >
                    Piano Solo (2)
                  </button>
                  <button
                    onClick={() => setCategoryFilter("camara")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-montserrat font-bold transition ${
                      categoryFilter === "camara"
                        ? "bg-[#111C2D] text-white shadow-2xs"
                        : "bg-[#F0F3FF] text-[#4C4546] hover:text-[#111C2D]"
                    }`}
                  >
                    Música de Cámara (1)
                  </button>
                </div>
              </div>
            </div>

            {/* Lista de Partituras */}
            <div className="space-y-6">
              {filteredScores.map((score) => (
                <article
                  key={score.id}
                  className="bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 p-6 sm:p-7 relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FBB03B] via-[#0071BC] to-[#C1272D]"></div>

                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 flex-1">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-[#111C2D] rounded-2xl flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                        <span className={`material-symbols-outlined text-4xl ${score.iconColor}`}>
                          music_note
                        </span>
                        <span className="absolute -bottom-2 bg-[#1C1917] text-[10px] font-bold text-slate-300 px-2 py-0.5 rounded border border-black/10 tracking-wider font-mono">
                          PDF
                        </span>
                      </div>

                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 font-montserrat">
                            <span className="material-symbols-outlined text-xs">verified</span>
                            {score.license}
                          </span>
                          <span className="text-xs font-mono text-[#4C4546]">ISMN: {score.ismn}</span>
                        </div>

                        <h2 className="text-xl sm:text-2xl font-black font-montserrat text-[#111C2D] hover:text-[#0071BC] cursor-pointer transition-colors">
                          {score.title}
                        </h2>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#4C4546] font-medium">
                          <span>Compositor: <strong className="text-[#111C2D] font-bold">{score.composer}</strong></span>
                          <span>•</span>
                          <span className="px-2 py-0.5 bg-[#F0F3FF] text-[#111C2D] rounded font-bold text-[10px]">{score.category}</span>
                          <span>•</span>
                          <span className="text-[11px]">{score.format}</span>
                        </div>

                        <div className="pt-2 text-xs text-[#4C4546] flex flex-wrap items-center gap-x-2 gap-y-1 bg-[#F0F3FF]/70 p-2.5 rounded-xl border border-black/5">
                          <span className="font-bold text-[#111C2D] flex items-center gap-1 font-montserrat">
                            <span className="material-symbols-outlined text-sm text-[#0071BC]">shield</span>
                            Estampa de Seguridad:
                          </span>
                          <span className="font-mono text-[#111C2D] bg-white px-2 py-0.5 rounded border border-black/5 text-[11px]">
                            {score.userStamp}
                          </span>
                          <span>|</span>
                          <span className="font-medium text-[#111C2D]">{score.copies}</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end justify-between gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-black/5">
                      <div className="text-left lg:text-right">
                        <span className="text-xs font-bold text-[#4C4546] block mb-0.5 font-montserrat">Descargas restantes:</span>
                        <div className="flex items-center lg:justify-end gap-2">
                          <span className="text-sm font-black font-montserrat text-[#0071BC]">
                            {score.downloadsLeft} de {score.downloadsTotal} permitidas
                          </span>
                        </div>
                        <div className="w-44 lg:ml-auto h-2 bg-[#F0F3FF] rounded-full mt-1.5 overflow-hidden border border-black/5">
                          <div className="h-full bg-[#FBB03B] rounded-full" style={{ width: `${score.progressPercent}%` }}></div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
                        <button
                          onClick={() => alert(`Reproduciendo audio de referencia de ${score.title}...`)}
                          className="px-3.5 py-2.5 text-xs font-bold text-[#111C2D] bg-[#F0F3FF] hover:bg-slate-200/60 rounded-xl flex items-center justify-center gap-1.5 transition font-montserrat border border-black/5"
                        >
                          <span className="material-symbols-outlined text-base text-[#0071BC]">play_circle</span>
                          Audio Referencia
                        </button>

                        <button
                          onClick={() => alert(`Descargando partitura oficial firmada de ${score.title} con marca de agua personal...`)}
                          className="px-5 py-3 rounded-xl bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition font-montserrat flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-lg">download</span>
                          Descargar PDF Firmado
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Box Informativo de Seguridad */}
            <div className="bg-white rounded-2xl border border-black/5 p-6 md:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-start gap-4 max-w-3xl">
                  <div className="p-3 bg-[#F0F3FF] text-[#0071BC] rounded-2xl shrink-0 border border-black/5">
                    <span className="material-symbols-outlined text-2xl">verified_user</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold font-montserrat text-[#111C2D]">
                      ¿Cómo funciona el estampado de seguridad legal?
                    </h3>
                    <p className="text-xs sm:text-sm text-[#4C4546] leading-relaxed">
                      Tus partituras son generadas en tiempo real y personalizadas con tu nombre completo y correo en el margen inferior de cada página. Este sello digital garantiza la legitimidad jurídica de tu copia ante audiciones, concursos y auditorías de derechos de autor (SAYCO / DNDA).
                    </p>
                  </div>
                </div>
                
                <div className="shrink-0">
                  <a
                    href="https://wa.me/573137529693"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-black/10 text-[#111C2D] bg-[#F0F3FF] hover:bg-slate-200/60 font-bold text-xs transition shadow-2xs font-montserrat"
                  >
                    <span className="material-symbols-outlined text-base text-emerald-600">chat</span>
                    Soporte de Descarga
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
               PESTAÑA 2: HISTORIAL DE PEDIDOS & FACTURAS
               ========================================== */}
        {activeTab === "pedidos" && (
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F3FF] border border-[#0071BC]/10 text-[#0071BC] text-[11px] font-extrabold uppercase tracking-wider mb-3 font-montserrat">
                <span className="material-symbols-outlined text-xs">receipt_long</span>
                Facturación Electrónica DIAN & Historial
              </div>
              <h1 className="text-3xl sm:text-4xl font-black font-montserrat text-[#111C2D] tracking-tight mb-2">
                Historial de Pedidos & Facturas
              </h1>
              <p className="text-sm md:text-base text-[#4C4546] max-w-3xl leading-relaxed font-normal">
                Consulta el desglose de tus transacciones realizadas, comprobantes de pago de pasarela (Wompi / PayPal) y obtén tus facturas electrónicas oficiales en PDF.
              </p>
            </div>

            {/* KPI Cards Resumen Facturación */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4C4546] font-montserrat">
                  Total Invertido en Catálogo
                </span>
                <div className="text-2xl font-black font-montserrat text-[#111C2D]">
                  $165.000 <span className="text-xs font-bold text-[#4C4546]">COP</span>
                </div>
                <span className="text-xs text-[#0071BC] font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">verified</span> 3 Compras autorizadas
                </span>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4C4546] font-montserrat">
                  Pasarelas Utilizadas
                </span>
                <div className="text-lg font-bold font-montserrat text-[#111C2D] flex items-center gap-2">
                  <span>🏦 PSE Wompi</span> • <span>🅿️ PayPal</span>
                </div>
                <span className="text-xs text-[#4C4546]">Transacciones 100% Cifradas</span>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4C4546] font-montserrat">
                  Estado Tributario DIAN
                </span>
                <div className="text-lg font-bold font-montserrat text-emerald-700 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xl">verified_user</span> Facturas Emitidas
                </div>
                <span className="text-xs text-[#4C4546]">Con firma digital y código CUFE</span>
              </div>
            </div>

            {/* Tabla de Pedidos */}
            <div className="bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="p-6 border-b border-black/5 flex items-center justify-between">
                <h3 className="text-base font-bold font-montserrat text-[#111C2D]">Registro de Pedidos</h3>
                <span className="text-xs text-[#0071BC] font-bold font-montserrat">3 Transacciones</span>
              </div>

              <div className="w-full overflow-x-auto overscroll-x-contain">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F0F3FF] text-[#4C4546] font-montserrat text-[11px] font-extrabold uppercase tracking-wider border-b border-black/5">
                      <th className="py-3 px-6">ID Pedido / Factura</th>
                      <th className="py-3 px-6">Fecha</th>
                      <th className="py-3 px-6">Detalle Obra</th>
                      <th className="py-3 px-6">Pasarela / Método</th>
                      <th className="py-3 px-6">Total COP</th>
                      <th className="py-3 px-6">Estado</th>
                      <th className="py-3 px-6 text-right">Comprobante DIAN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 text-xs text-[#111C2D]">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-[#F0F3FF]/40 transition">
                        <td className="py-4 px-6 font-mono font-bold">
                          <div className="text-[#111C2D]">{order.id}</div>
                          <span className="text-[10px] text-[#0071BC] font-semibold block">{order.invoiceNumber}</span>
                        </td>
                        <td className="py-4 px-6 font-medium text-[#4C4546]">
                          {order.date}
                        </td>
                        <td className="py-4 px-6 font-bold font-montserrat max-w-xs">
                          {order.item}
                        </td>
                        <td className="py-4 px-6 font-medium text-[#4C4546]">
                          {order.gateway}
                        </td>
                        <td className="py-4 px-6 font-mono font-bold text-sm">
                          ${order.totalCOP.toLocaleString('es-CO')} COP
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-extrabold font-montserrat border border-emerald-200">
                            <span className="material-symbols-outlined text-xs">check_circle</span>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => alert(`Generando y descargando Factura Electrónica en PDF (${order.invoiceNumber})...`)}
                            className="px-3 py-1.5 bg-[#F0F3FF] hover:bg-slate-200/60 text-[#0071BC] rounded-xl font-extrabold text-xs transition font-montserrat inline-flex items-center gap-1 border border-black/5"
                          >
                            <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                            PDF Factura
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
               PESTAÑA 3: COLECCIONES GUARDADAS
               ========================================== */}
        {activeTab === "colecciones" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F3FF] border border-[#C1272D]/10 text-[#C1272D] text-[11px] font-extrabold uppercase tracking-wider mb-3 font-montserrat">
                  <span className="material-symbols-outlined text-xs">bookmark</span>
                  Listas & Repertorios Favoritos
                </div>
                <h1 className="text-3xl sm:text-4xl font-black font-montserrat text-[#111C2D] tracking-tight mb-2">
                  Mis Colecciones Guardadas
                </h1>
                <p className="text-sm md:text-base text-[#4C4546] max-w-3xl leading-relaxed font-normal">
                  Organiza tus partituras preferidas por carpetas temáticas para estudio, recitales o repertorio pedagógico.
                </p>
              </div>

              <button
                onClick={() => alert("Crear nueva colección personalizada...")}
                className="px-5 py-3 bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center gap-2 shrink-0 self-start sm:self-auto"
              >
                <span className="material-symbols-outlined text-base">create_new_folder</span>
                Nueva Colección
              </button>
            </div>

            {/* Grid Colecciones */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {collections.map((col) => (
                <div
                  key={col.id}
                  className="bg-white rounded-2xl p-6 border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-[#F0F3FF] flex items-center justify-center text-[#111C2D] group-hover:bg-[#111C2D] group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-2xl">{col.icon}</span>
                      </div>
                      <span className="px-3 py-1 bg-[#F0F3FF] text-[#0071BC] text-xs font-extrabold rounded-full font-montserrat">
                        {col.count} obras
                      </span>
                    </div>

                    <div>
                      <h2 className="text-xl font-bold font-montserrat text-[#111C2D] group-hover:text-[#0071BC] transition-colors leading-snug">
                        {col.name}
                      </h2>
                      <span className="text-[11px] text-[#4C4546] mt-1 block">Actualizado: {col.updated}</span>
                    </div>

                    <div className="pt-2 border-t border-black/5 space-y-1.5">
                      <span className="text-[11px] font-extrabold text-[#4C4546] uppercase tracking-wider block font-montserrat">
                        Obras en la lista:
                      </span>
                      <ul className="space-y-1 text-xs text-[#111C2D] font-medium">
                        {col.items.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-xs text-[#FBB03B]">music_note</span>
                            <span className="truncate">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-black/5 flex items-center justify-between gap-2">
                    <button
                      onClick={() => alert(`Abriendo carpeta ${col.name}...`)}
                      className="px-3.5 py-2 bg-[#F0F3FF] hover:bg-slate-200/60 text-[#111C2D] font-bold text-xs rounded-xl transition font-montserrat flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">folder_open</span>
                      Ver Obras
                    </button>

                    <button
                      onClick={() => alert(`Añadiendo obras de ${col.name} al carrito...`)}
                      className="px-3.5 py-2 bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl transition font-montserrat shadow-xs flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">shopping_cart</span>
                      Añadir Todo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Footer Unificado Stitch */}
      <Footer />

      {/* Flotante WhatsApp Support */}
      <aside aria-label="Soporte WhatsApp" className="fixed bottom-6 right-6 z-50">
        <a
          href="https://wa.me/573137529693"
          target="_blank"
          rel="noopener noreferrer"
          title="Atención directa a clientes vía WhatsApp"
          className="flex items-center gap-2.5 bg-white hover:bg-emerald-50 text-[#111C2D] border border-emerald-500/40 rounded-full px-4 py-2.5 shadow-lg backdrop-blur-md transition-all duration-200 group hover:scale-105"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="material-symbols-outlined text-emerald-600 text-lg group-hover:scale-110 transition-transform">chat</span>
          <span className="text-xs font-bold hidden md:inline font-montserrat">¿Ayuda con tu cuenta?</span>
        </a>
      </aside>

    </div>
  );
}
