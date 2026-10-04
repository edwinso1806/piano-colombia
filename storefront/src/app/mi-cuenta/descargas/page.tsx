"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useSavedScores } from "@/context/SavedScoresContext";

export default function MisDescargasPage() {
  const { customer, logoutCustomer, isLoaded } = useAuth();
  const {
    savedScores,
    collections,
    removeSavedScore,
    clearAllSavedScores,
    createCollection,
    deleteCollection,
    moveScoreToCollection,
  } = useSavedScores();

  const [activeTab, setActiveTab] = useState<"descargas" | "pedidos" | "colecciones">("descargas");
  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("todas");
  const [scoresList, setScoresList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingToken, setDownloadingToken] = useState<string | null>(null);
  const [downloadFeedback, setDownloadFeedback] = useState<{ token: string; type: "success" | "error"; message: string } | null>(null);

  const handleDownloadPdf = async (score: any) => {
    if (score.downloadsLeft <= 0) {
      alert(`Has alcanzado el límite máximo de ${score.downloadsTotal} descargas permitidas para esta licencia digital.`);
      return;
    }

    setDownloadingToken(score.token);
    setDownloadFeedback(null);

    try {
      // Descargar a través del proxy seguro de descargas de Next.js
      const res = await fetch(`/api/downloads/${score.token}`, {
        method: "GET",
      });

      if (res.status === 403) {
        const errData = await res.json().catch(() => ({}));
        alert(errData.message || `Has alcanzado el límite máximo de descargas (${score.downloadsTotal}) permitidas para esta licencia.`);
        setScoresList((prev) =>
          prev.map((s) => (s.id === score.id ? { ...s, downloadsLeft: 0, progressPercent: 0 } : s))
        );
        return;
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Error al procesar la descarga (HTTP ${res.status})`);
      }

      // Convertir a blob para forzar descarga segura en el navegador
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const tempLink = document.createElement("a");
      tempLink.href = blobUrl;
      const safeTitle = (score.title || "Partitura")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_");
      tempLink.download = `PianoColombia_${safeTitle}_Estampada.pdf`;
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      window.URL.revokeObjectURL(blobUrl);

      // Obtener conteo restante desde encabezados de respuesta
      const remainingHeader = res.headers.get("X-Downloads-Remaining");
      const nextRemaining =
        remainingHeader !== null ? parseInt(remainingHeader, 10) : Math.max(0, score.downloadsLeft - 1);

      setScoresList((prev) =>
        prev.map((s) => {
          if (s.id === score.id) {
            const safeLeft = isNaN(nextRemaining) ? Math.max(0, s.downloadsLeft - 1) : nextRemaining;
            return {
              ...s,
              downloadsLeft: safeLeft,
              progressPercent: (safeLeft / s.downloadsTotal) * 100,
            };
          }
          return s;
        })
      );

      setDownloadFeedback({
        token: score.token,
        type: "success",
        message: `¡Partitura descargada con éxito! Te quedan ${nextRemaining} descargas disponibles.`,
      });
    } catch (err: any) {
      console.error("Error al descargar:", err);
      alert(err.message || "Error al generar tu partitura con estampa legal. Por favor intenta de nuevo.");
    } finally {
      setDownloadingToken(null);
    }
  };

  // Sincronizar pestaña con query params y permitir navegación directa
  const handleTabChange = (tab: "descargas" | "pedidos" | "colecciones") => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (tab === "colecciones") {
        url.searchParams.set("tab", "colecciones");
      } else if (tab === "pedidos") {
        url.searchParams.set("tab", "pedidos");
      } else {
        url.searchParams.delete("tab");
      }
      window.history.replaceState({}, "", url.toString());
    }
  };

  useEffect(() => {
    const updateFromUrl = () => {
      if (typeof window !== "undefined") {
        const p = new URLSearchParams(window.location.search).get("tab");
        if (p === "colecciones" || p === "guardadas") {
          setActiveTab("colecciones");
        } else if (p === "pedidos") {
          setActiveTab("pedidos");
        }
      }
    };
    updateFromUrl();
    window.addEventListener("popstate", updateFromUrl);
    return () => window.removeEventListener("popstate", updateFromUrl);
  }, []);

  // Estados para colecciones y guardadas
  const [collectionFilter, setCollectionFilter] = useState<string>("todas");
  const [savedSearchQuery, setSavedSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [newColDesc, setNewColDesc] = useState("");

  useEffect(() => {
    if (!customer?.email) {
      setLoading(false);
      return;
    }

    async function loadDownloads() {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:9000/store/downloads?email=${encodeURIComponent(customer!.email)}`, {
          headers: {
            "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "pk_0372bd6f8b5885e7dcfd759e152d7a9db36782d5eaace95f07e707f2e9f68ce3",
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.downloads && Array.isArray(data.downloads) && data.downloads.length > 0) {
            const mapped = data.downloads.map((d: any) => ({
              id: d.id,
              token: d.download_token,
              title: d.score_title,
              composer: d.composer_name,
              category: "Piano Solo",
              format: "Formato A4 Urtext",
              ismn: "979-0-901314-02-1",
              license: "Licencia Activa",
              userStamp: `${d.buyer_name || customer!.fullName} (${d.buyer_email || customer!.email})`,
              copies: "1 Copia Impresa Autorizada",
              downloadsLeft: Math.max(0, (d.max_downloads || 5) - (d.download_count || 0)),
              downloadsTotal: d.max_downloads || 5,
              progressPercent: (((d.max_downloads || 5) - (d.download_count || 0)) / (d.max_downloads || 5)) * 100,
              iconColor: "text-amber-400",
            }));
            setScoresList(mapped);
          } else {
            setScoresList([]);
          }
        } else {
          setScoresList([]);
        }
      } catch (err) {
        console.warn("Fallo consultando descargas en vivo de PostgreSQL:", err);
        setScoresList([]);
      } finally {
        setLoading(false);
      }
    }

    loadDownloads();
  }, [customer?.email]);

  const filteredSavedScores = savedScores.filter((score) => {
    const matchesSearch =
      score.title.toLowerCase().includes(savedSearchQuery.toLowerCase()) ||
      score.composer.toLowerCase().includes(savedSearchQuery.toLowerCase());
    const matchesCollection =
      collectionFilter === "todas" || score.collectionId === collectionFilter;
    return matchesSearch && matchesCollection;
  });

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    createCollection(newColName.trim(), newColDesc.trim());
    setNewColName("");
    setNewColDesc("");
    setShowCreateModal(false);
  };

  const filteredScores = scoresList.filter((score) => {
    const matchesSearch =
      score.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      score.composer.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCat =
      categoryFilter === "todas" ||
      (categoryFilter === "solo" && score.category.includes("Piano Solo")) ||
      (categoryFilter === "camara" && (score.category.includes("Trío") || score.category.includes("Cámara")));
    return matchesSearch && matchesCat;
  });

  // 1. Estado de carga de sesión
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#F9F9FF] text-[#111C2D] flex flex-col font-inter">
        <Header activePage="tienda" />
        <main className="flex-1 flex items-center justify-center p-12">
          <div className="flex items-center gap-3 text-xs font-bold text-[#111C2D] font-montserrat">
            <span className="w-5 h-5 border-2 border-[#111C2D] border-t-transparent rounded-full animate-spin"></span>
            <span>Verificando sesión segura...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 2. Estado NO AUTENTICADO: Bloquear acceso y requerir Login Real
  if (!customer) {
    return (
      <div className="min-h-screen bg-[#F9F9FF] text-[#111C2D] flex flex-col font-inter selection:bg-[#FBB03B]/30 selection:text-[#111C2D]">
        <Header activePage="tienda" />
        <main className="flex-1 max-w-lg w-full mx-auto px-6 py-16 flex items-center justify-center">
          <div className="w-full bg-white rounded-3xl p-8 sm:p-10 border border-black/5 shadow-[0_20px_50px_rgba(0,0,0,0.06)] text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#F0F3FF] border border-[#0071BC]/20 text-[#0071BC] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">lock</span>
            </div>
            
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F3FF] text-[#0071BC] text-[11px] font-extrabold uppercase tracking-wider font-montserrat">
                Área Restringida de Clientes
              </div>
              <h1 className="text-2xl font-black font-montserrat text-[#111C2D] tracking-tight">
                Inicia Sesión para Ver tus Partituras
              </h1>
              <p className="text-xs sm:text-sm text-[#4C4546] leading-relaxed font-normal">
                Debes identificarte con tu cuenta registrada en Piano Colombia para acceder a tus partituras adquiridas, descargar tus copias oficiales estampadas y consultar facturas.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href="/login?redirect=/mi-cuenta/descargas"
                className="w-full py-3.5 bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">login</span>
                Iniciar Sesión / Crear Cuenta
              </Link>
              <Link
                href="/"
                className="w-full py-3 bg-[#F0F3FF] hover:bg-[#111C2D] text-[#111C2D] hover:text-white font-bold text-xs rounded-xl transition font-montserrat flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Volver a la Tienda Principal
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 3. Estado AUTENTICADO: Mostrar interfaz del cliente
  return (
    <div className="min-h-screen bg-[#F9F9FF] text-[#111C2D] flex flex-col font-inter selection:bg-[#FBB03B]/30 selection:text-[#111C2D]">
      
      {/* Header Unificado Stitch */}
      <Header activePage="tienda" />

      {/* Customer Navigation Tabs Bar */}
      <section className="bg-white border-b border-black/5">
        <div className="max-w-7xl mx-auto px-6">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="py-3 flex items-center justify-between text-xs text-[#4C4546] font-medium">
            <div className="flex items-center space-x-2">
              <Link href="/" className="hover:text-[#0071BC] transition">Inicio</Link>
              <span>/</span>
              <span className="text-[#111C2D] font-bold">Mi Cuenta</span>
              <span>/</span>
              <span aria-current="page" className="text-[#0071BC] font-bold">
                {activeTab === "descargas" && "Mis Partituras Compradas"}
                {activeTab === "pedidos" && "Historial de Pedidos & Facturas"}
                {activeTab === "colecciones" && "Colecciones Guardadas"}
              </span>
            </div>

            {/* Badge Usuario Activo */}
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-bold text-[#111C2D] font-montserrat">{customer.fullName}</span>
              <span className="text-[#4C4546]">({customer.email})</span>
            </div>
          </nav>

          {/* Account Navigation Pills */}
          <div className="flex items-center space-x-2 w-full overflow-x-auto overscroll-x-contain scrollbar-none pt-1 pb-3 text-xs font-semibold border-t border-black/5">
            <button
              type="button"
              onClick={() => handleTabChange("descargas")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-montserrat font-bold whitespace-nowrap transition cursor-pointer ${
                activeTab === "descargas"
                  ? "bg-[#111C2D] text-white shadow-sm"
                  : "bg-slate-100/80 text-[#4C4546] hover:text-[#111C2D] hover:bg-slate-200/80"
              }`}
            >
              <span className="material-symbols-outlined text-base text-[#FBB03B]">description</span>
              Mis Partituras Compradas
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeTab === "descargas" ? "bg-white/20 text-white" : "bg-[#FBB03B]/25 text-[#111C2D]"
              }`}>
                {scoresList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("pedidos")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-montserrat font-bold whitespace-nowrap transition cursor-pointer ${
                activeTab === "pedidos"
                  ? "bg-[#111C2D] text-white shadow-sm"
                  : "bg-slate-100/80 text-[#4C4546] hover:text-[#111C2D] hover:bg-slate-200/80"
              }`}
            >
              <span className="material-symbols-outlined text-base text-[#0071BC]">receipt_long</span>
              Historial de Pedidos & Facturas
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeTab === "pedidos" ? "bg-white/20 text-white" : "bg-[#0071BC]/15 text-[#0071BC]"
              }`}>
                {scoresList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("colecciones")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-montserrat font-bold whitespace-nowrap transition cursor-pointer ${
                activeTab === "colecciones"
                  ? "bg-[#C1272D] text-white shadow-sm"
                  : "bg-slate-100/80 text-[#4C4546] hover:text-[#111C2D] hover:bg-slate-200/80"
              }`}
            >
              <span className={`material-symbols-outlined text-base ${activeTab === "colecciones" ? "text-white" : "text-[#C1272D]"}`}>bookmark</span>
              Colecciones Guardadas
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeTab === "colecciones" ? "bg-white/25 text-white" : "bg-[#C1272D]/15 text-[#C1272D]"
              }`}>
                {savedScores.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                logoutCustomer();
                window.location.href = "/";
              }}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition font-montserrat whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span>Cerrar Sesión</span>
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
                Gestiona tus licencias adquiridas, descarga tus archivos PDF oficiales con estampado de seguridad antifraude de alta fidelidad y accede a grabaciones de referencia.
              </p>

              {/* Toolbar de Filtros & Búsqueda */}
              {scoresList.length > 0 && (
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
                      Todas ({scoresList.length})
                    </button>
                    <button
                      onClick={() => setCategoryFilter("solo")}
                      className={`px-3.5 py-2 rounded-xl text-xs font-montserrat font-bold transition ${
                        categoryFilter === "solo"
                          ? "bg-[#111C2D] text-white shadow-2xs"
                          : "bg-[#F0F3FF] text-[#4C4546] hover:text-[#111C2D]"
                      }`}
                    >
                      Piano Solo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Lista de Partituras o Empty State Real */}
            {loading ? (
              <div className="bg-white rounded-3xl border border-black/5 p-12 text-center space-y-3 shadow-xs">
                <span className="w-6 h-6 border-2 border-[#111C2D] border-t-transparent rounded-full animate-spin inline-block"></span>
                <p className="text-xs font-bold text-[#4C4546] font-montserrat">Consultando tus licencias en base de datos...</p>
              </div>
            ) : filteredScores.length > 0 ? (
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

                          {score.downloadsLeft > 0 ? (
                            <button
                              onClick={() => handleDownloadPdf(score)}
                              disabled={downloadingToken === score.token}
                              className="px-5 py-3 rounded-xl bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition font-montserrat flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                            >
                              {downloadingToken === score.token ? (
                                <>
                                  <span className="w-4 h-4 border-2 border-[#111C2D] border-t-transparent rounded-full animate-spin"></span>
                                  <span>Estampando Licencia...</span>
                                </>
                              ) : (
                                <>
                                  <span className="material-symbols-outlined text-lg">download</span>
                                  <span>Descargar PDF Firmado</span>
                                </>
                              )}
                            </button>
                          ) : (
                            <button
                              disabled
                              title="Has alcanzado el límite máximo de descargas para esta compra"
                              className="px-5 py-3 rounded-xl bg-slate-100 text-slate-400 font-extrabold text-xs uppercase tracking-wider font-montserrat flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200"
                            >
                              <span className="material-symbols-outlined text-lg text-slate-400">lock</span>
                              <span>Descargas Agotadas (0/{score.downloadsTotal})</span>
                            </button>
                          )}
                        </div>

                        {downloadFeedback && downloadFeedback.token === score.token && (
                          <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5 mt-2 self-stretch lg:self-end">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            <span>{downloadFeedback.message}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-black/5 p-12 text-center space-y-4 shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-[#F0F3FF] text-[#0071BC] flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-3xl">library_music</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold font-montserrat text-[#111C2D]">Aún no tienes partituras compradas</h3>
                  <p className="text-xs sm:text-sm text-[#4C4546] max-w-md mx-auto leading-relaxed">
                    Explora nuestro catálogo de partituras Urtext y adquiere obras de compositores colombianos con tu licencia legal nominativa.
                  </p>
                </div>
                <div className="pt-2 flex flex-col items-center gap-3">
                  <Link
                    href="/tienda"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider font-montserrat shadow-md transition"
                  >
                    <span className="material-symbols-outlined text-lg">storefront</span>
                    Explorar Catálogo de Partituras
                  </Link>

                  {savedScores.length > 0 && (
                    <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50/70 border border-red-200/60 rounded-2xl text-xs text-[#111C2D]">
                      <span className="material-symbols-outlined text-base text-[#C1272D]">bookmark</span>
                      <span>
                        Tienes <strong className="font-bold text-[#C1272D]">{savedScores.length} partitura{savedScores.length > 1 ? "s" : ""}</strong> guardada{savedScores.length > 1 ? "s" : ""} para comprar más adelante.
                      </span>
                      <button
                        type="button"
                        onClick={() => handleTabChange("colecciones")}
                        className="ml-1 text-xs font-bold text-[#C1272D] hover:underline cursor-pointer"
                      >
                        Ver mis guardadas ({savedScores.length}) →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

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
                      Tus partituras son generadas en tiempo real y personalizadas con tu nombre completo y correo en el margen inferior de cada página. Este sello digital garantiza la legitimidad jurídica de tu copia ante audiciones y auditorías de derechos de autor.
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
                Facturación & Historial de Compras
              </div>
              <h1 className="text-3xl sm:text-4xl font-black font-montserrat text-[#111C2D] tracking-tight mb-2">
                Historial de Pedidos & Facturas
              </h1>
              <p className="text-sm md:text-base text-[#4C4546] max-w-3xl leading-relaxed font-normal">
                Consulta el desglose de tus transacciones realizadas y comprobantes de pago de la pasarela oficial Wompi.
              </p>
            </div>

            {scoresList.length > 0 ? (
              <div className="bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="p-6 border-b border-black/5 flex items-center justify-between">
                  <h3 className="text-base font-bold font-montserrat text-[#111C2D]">Registro de Compras</h3>
                  <span className="text-xs text-[#0071BC] font-bold font-montserrat">{scoresList.length} Transacciones</span>
                </div>

                <div className="w-full overflow-x-auto overscroll-x-contain">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F0F3FF] text-[#4C4546] font-montserrat text-[11px] font-extrabold uppercase tracking-wider border-b border-black/5">
                        <th className="py-3 px-6">ID Descarga</th>
                        <th className="py-3 px-6">Obra Adquirida</th>
                        <th className="py-3 px-6">Compositor</th>
                        <th className="py-3 px-6">Estado</th>
                        <th className="py-3 px-6 text-right">Descarga</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 text-xs text-[#111C2D]">
                      {scoresList.map((score) => (
                        <tr key={score.id} className="hover:bg-[#F0F3FF]/40 transition">
                          <td className="py-4 px-6 font-mono font-bold">
                            <div className="text-[#111C2D]">{score.id}</div>
                          </td>
                          <td className="py-4 px-6 font-bold font-montserrat max-w-xs">
                            {score.title}
                          </td>
                          <td className="py-4 px-6 font-medium text-[#4C4546]">
                            {score.composer}
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-extrabold font-montserrat border border-emerald-200">
                              <span className="material-symbols-outlined text-xs">check_circle</span>
                              Aprobado por Wompi
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <a
                              href={`/api/downloads/${score.token}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-[#F0F3FF] hover:bg-slate-200/60 text-[#0071BC] rounded-xl font-extrabold text-xs transition font-montserrat inline-flex items-center gap-1 border border-black/5"
                            >
                              <span className="material-symbols-outlined text-sm">download</span>
                              PDF
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-black/5 p-12 text-center space-y-3 shadow-xs">
                <div className="w-12 h-12 rounded-xl bg-[#F0F3FF] text-[#0071BC] flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-2xl">receipt_long</span>
                </div>
                <h3 className="text-base font-bold font-montserrat text-[#111C2D]">No registras pedidos recientes</h3>
                <p className="text-xs text-[#4C4546]">Tus transacciones y facturas aparecerán aquí una vez realices compras en la tienda.</p>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
               PESTAÑA 3: PARTITURAS GUARDADAS & COLECCIONES
               ========================================== */}
        {activeTab === "colecciones" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F3FF] border border-[#C1272D]/10 text-[#C1272D] text-[11px] font-extrabold uppercase tracking-wider mb-3 font-montserrat">
                  <span className="material-symbols-outlined text-xs">bookmark</span>
                  Listas & Repertorios Guardados
                </div>
                <h1 className="text-3xl sm:text-4xl font-black font-montserrat text-[#111C2D] tracking-tight mb-2">
                  Mis Partituras Guardadas
                </h1>
                <p className="text-sm md:text-base text-[#4C4546] max-w-3xl leading-relaxed font-normal">
                  Aquí se almacenan tus partituras preferidas guardadas desde la tienda para estudio, recitales o repertorio pedagógico.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(!showCreateModal)}
                className="px-5 py-3 bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center gap-2 shrink-0 self-start sm:self-auto"
              >
                <span className="material-symbols-outlined text-base">
                  {showCreateModal ? "close" : "create_new_folder"}
                </span>
                {showCreateModal ? "Cancelar" : "Nueva Colección"}
              </button>
            </div>

            {/* Modal / Formulario para Crear Colección */}
            {showCreateModal && (
              <div className="p-6 bg-white rounded-2xl border border-[#0071BC]/20 shadow-md space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-sm font-bold text-[#0071BC] font-montserrat border-b border-black/5 pb-2">
                  <span className="material-symbols-outlined text-lg">folder_special</span>
                  <span>Crear Nueva Carpeta / Colección Temática</span>
                </div>
                <form onSubmit={handleCreateCollection} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat">
                        Nombre de la Colección *
                      </label>
                      <input
                        type="text"
                        required
                        value={newColName}
                        onChange={(e) => setNewColName(e.target.value)}
                        placeholder="Ej: Pasillos para Recital de Grado"
                        className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat">
                        Descripción o Notas (Opcional)
                      </label>
                      <input
                        type="text"
                        value={newColDesc}
                        onChange={(e) => setNewColDesc(e.target.value)}
                        placeholder="Ej: Obras andinas de nivel intermedio a avanzado"
                        className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 text-xs font-bold text-[#4C4546] hover:bg-slate-100 rounded-xl transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#0071BC] hover:bg-[#005996] text-white font-extrabold text-xs font-montserrat rounded-xl shadow-xs transition"
                    >
                      Guardar Colección
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Filtros de Colecciones y Acciones */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setCollectionFilter("todas")}
                  className={`px-4 py-2 rounded-xl text-xs font-montserrat font-bold transition ${
                    collectionFilter === "todas"
                      ? "bg-[#111C2D] text-white shadow-2xs"
                      : "bg-white text-[#4C4546] border border-black/5 hover:text-[#111C2D]"
                  }`}
                >
                  Todas las Guardadas ({savedScores.length})
                </button>

                {collections.map((col) => {
                  const count = savedScores.filter((s) => s.collectionId === col.id).length;
                  return (
                    <div
                      key={col.id}
                      className={`inline-flex items-center gap-1 rounded-xl text-xs font-montserrat font-bold transition border ${
                        collectionFilter === col.id
                          ? "bg-[#0071BC] text-white border-[#0071BC] shadow-2xs"
                          : "bg-white text-[#4C4546] border-black/5 hover:text-[#111C2D]"
                      }`}
                    >
                      <button
                        onClick={() => setCollectionFilter(col.id)}
                        className="px-3.5 py-2 flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">{col.icon || "folder"}</span>
                        <span>{col.name}</span>
                        <span className="text-[10px] opacity-80">({count})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`¿Deseas eliminar la colección "${col.name}"?`)) {
                            deleteCollection(col.id);
                            if (collectionFilter === col.id) setCollectionFilter("todas");
                          }
                        }}
                        title="Eliminar colección"
                        className="pr-2.5 pl-1 py-2 text-xs opacity-60 hover:opacity-100 hover:text-red-300 transition"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>

              {savedScores.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("¿Estás seguro de que deseas eliminar todas las partituras de tu lista de guardadas?")) {
                      clearAllSavedScores();
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-montserrat font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition flex items-center gap-1.5 cursor-pointer shrink-0"
                  title="Eliminar todas las obras guardadas"
                >
                  <span className="material-symbols-outlined text-base">delete_sweep</span>
                  Vaciar todas ({savedScores.length})
                </button>
              )}
            </div>

            {/* Grid de Partituras Guardadas o Empty State */}
            {filteredSavedScores.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSavedScores.map((score) => (
                  <div
                    key={score.id || score.slug}
                    className="bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 flex flex-col justify-between p-6 relative overflow-hidden group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full bg-[#FBB03B]/20 text-[#111C2D] font-montserrat font-extrabold text-[10px] uppercase">
                          {score.category || "Piano Solo"}
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => removeSavedScore(score)}
                          title="Quitar de guardadas"
                          className="w-8 h-8 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition border border-red-200/50 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>

                      <div>
                        <h2 className="text-lg font-bold font-montserrat text-[#111C2D] group-hover:text-[#0071BC] transition-colors leading-snug">
                          <Link href={`/partitura/${score.slug}`}>
                            {score.title}
                          </Link>
                        </h2>
                        <p className="text-xs text-[#4C4546] font-semibold mt-1">Por {score.composer}</p>
                        {score.level && (
                          <span className="inline-block text-[10px] font-bold text-[#4C4546] bg-[#F0F3FF] px-2 py-0.5 rounded mt-2">
                            Nivel: {score.level}
                          </span>
                        )}
                      </div>

                      {score.description && (
                        <p className="text-xs text-[#4C4546] line-clamp-2 leading-relaxed font-normal pt-1">
                          {score.description}
                        </p>
                      )}

                      {/* Selector de Colección para mover */}
                      {collections.length > 0 && (
                        <div className="pt-2 border-t border-black/5">
                          <label className="block text-[10px] font-extrabold text-[#4C4546] uppercase tracking-wider mb-1 font-montserrat">
                            Carpeta / Colección:
                          </label>
                          <select
                            value={score.collectionId || ""}
                            onChange={(e) => moveScoreToCollection(score.slug || score.id, e.target.value || undefined)}
                            className="w-full bg-[#F0F3FF] border border-black/10 rounded-lg px-2.5 py-1.5 text-xs text-[#111C2D] font-medium"
                          >
                            <option value="">Sin carpeta asignada</option>
                            {collections.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="pt-5 mt-5 border-t border-black/5 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-sm font-black text-[#111C2D] font-montserrat block">
                          ${(score.priceCOP || 35000).toLocaleString("es-CO")} COP
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/partitura/${score.slug}`}
                          className="px-3 py-2 bg-[#F0F3FF] hover:bg-slate-200/60 text-[#111C2D] font-bold text-xs rounded-xl transition font-montserrat flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">visibility</span>
                          Ver
                        </Link>
                        <Link
                          href={`/checkout`}
                          className="px-3.5 py-2 bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl transition font-montserrat shadow-xs flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">shopping_cart</span>
                          Comprar
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-black/5 p-12 text-center space-y-4 shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-[#F0F3FF] text-[#0071BC] flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-3xl">bookmark_border</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold font-montserrat text-[#111C2D]">
                    {collectionFilter !== "todas"
                      ? "No hay partituras en esta colección"
                      : "Aún no tienes partituras guardadas"}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4C4546] max-w-md mx-auto leading-relaxed">
                    {collectionFilter !== "todas"
                      ? "Asigna partituras a esta carpeta seleccionándola en la tarjeta de cada obra."
                      : "Explora la tienda y haz clic en el ícono de marcador en cualquier partitura para guardarla en tu perfil de cliente."}
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/tienda"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider font-montserrat shadow-md transition"
                  >
                    <span className="material-symbols-outlined text-lg">storefront</span>
                    Explorar Tienda de Partituras
                  </Link>
                </div>
              </div>
            )}
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
