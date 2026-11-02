"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useSavedScores } from "@/context/SavedScoresContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAlert } from "@/context/AlertContext";

function formatCategoryName(cat: string): string {
  if (!cat) return "Piano Solo";
  const trimmed = cat.trim();
  const lower = trimmed.toLowerCase();
  if (lower === "bambuco") return "Bambuco";
  if (lower === "pasillo") return "Pasillo";
  if (lower === "danza") return "Danza";
  if (lower === "guabina") return "Guabina";
  if (lower === "joropo") return "Joropo";
  if (lower === "clasico" || lower === "clásico") return "Clásico";
  if (lower === "contemporaneo" || lower === "contemporáneo") return "Contemporáneo";
  if (lower === "piano solo" || lower === "solo") return "Piano Solo";
  if (lower === "piano a 4 manos" || lower === "piano 4 manos" || lower === "4 manos") return "Piano a 4 Manos";
  if (lower === "camara" || lower === "cámara") return "Cámara";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export default function MisDescargasPage() {
  const { customer, logoutCustomer, isLoaded } = useAuth();
  const { t, language } = useLanguage();
  const isEn = language === "en";
  const { showAlert, showConfirm } = useAlert();

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
      showAlert({
        type: "warning",
        title: isEn ? "Download Limit Reached" : "Límite de Descargas Alcanzado",
        message: isEn
          ? `You have reached the maximum limit of ${score.downloadsTotal} downloads permitted for this digital license.`
          : `Has alcanzado el límite máximo de ${score.downloadsTotal} descargas permitidas para esta licencia digital.`,
      });
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
        showAlert({
          type: "warning",
          title: isEn ? "Download Limit Reached" : "Límite de Descargas Alcanzado",
          message:
            errData.message ||
            (isEn
              ? `You have reached the maximum limit of downloads (${score.downloadsTotal}) permitted for this license.`
              : `Has alcanzado el límite máximo de descargas (${score.downloadsTotal}) permitidas para esta licencia.`),
        });
        setScoresList((prev) =>
          prev.map((s) => (s.id === score.id ? { ...s, downloadsLeft: 0, progressPercent: 0 } : s))
        );
        return;
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData.message ||
            (isEn
              ? `Error processing download (HTTP ${res.status})`
              : `Error al procesar la descarga (HTTP ${res.status})`)
        );
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

      showAlert({
        type: "success",
        title: isEn ? "Download Successful" : "Descarga Exitosa",
        message: isEn
          ? `Sheet music downloaded successfully! You have ${nextRemaining} downloads remaining.`
          : `¡Partitura descargada con éxito! Te quedan ${nextRemaining} descargas disponibles.`,
      });
    } catch (err: any) {
      console.error("Error al descargar:", err);
      showAlert({
        type: "error",
        title: isEn ? "Download Error" : "Error en Descarga",
        message:
          err.message ||
          (isEn
            ? "Error generating your legally stamped score. Please try again."
            : "Error al generar tu partitura con estampa legal. Por favor intenta de nuevo."),
      });
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

  // Categorías dinámicas disponibles en las descargas del usuario con su conteo
  const availableCategories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of scoresList) {
      const cat = s.category || "Piano Solo";
      counts.set(cat, (counts.get(cat) || 0) + 1);
    }
    return Array.from(counts.entries()).map(([name, count]) => ({
      name,
      count,
    }));
  }, [scoresList]);

  // Consolidar compras repetidas de una misma partitura sumando cantidades y licencias
  const consolidatedPurchases = useMemo(() => {
    const map = new Map<string, any>();
    for (const s of scoresList) {
      const key = (s.title || s.id).trim().toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          ...s,
          quantity: 1,
          tokens: [s.token],
          downloadsLeft: s.downloadsLeft !== undefined ? s.downloadsLeft : 5,
          downloadsTotal: s.downloadsTotal || 5,
          activeScores: [s],
        });
      } else {
        const existing = map.get(key);
        existing.quantity += 1;
        existing.tokens.push(s.token);
        existing.downloadsTotal += (s.downloadsTotal || 5);
        existing.downloadsLeft += (s.downloadsLeft !== undefined ? s.downloadsLeft : 5);
        existing.activeScores.push(s);

        // Si la ficha activa no tiene descargas pero otra de las compras sí tiene, usar su token para el botón de descarga
        const validScore = existing.activeScores.find((item: any) => item.downloadsLeft > 0);
        if (validScore) {
          existing.token = validScore.token;
          existing.id = validScore.id;
        }
      }
    }
    return Array.from(map.values());
  }, [scoresList]);

  useEffect(() => {
    if (!customer?.email) {
      setLoading(false);
      return;
    }

    async function loadDownloads() {
      setLoading(true);
      try {
        const backendUrl = (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000").replace(/\/$/, "");
        const res = await fetch(`${backendUrl}/store/downloads?email=${encodeURIComponent(customer!.email)}`, {
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
              category: formatCategoryName(d.category || d.genre || "Piano Solo"),
              format: "Formato A4 Urtext",
              ismn: "979-0-901314-02-1",
              license: "Licencia Activa",
              userStamp: `${d.buyer_name || customer!.fullName} (${d.buyer_email || customer!.email})`,
              copies: "1 Copia Impresa Autorizada",
              audioUrl: d.audio_sample_url || d.audio_url || d.audioUrl || null,
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
      score.category.toLowerCase().trim() === categoryFilter.toLowerCase().trim();
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
            <span>{isEn ? "Verifying secure session..." : "Verificando sesión segura..."}</span>
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
                {isEn ? "Customer Restricted Area" : "Área Restringida de Clientes"}
              </div>
              <h1 className="text-2xl font-black font-montserrat text-[#111C2D] tracking-tight">
                {isEn ? "Sign In to Access Your Sheet Music" : "Inicia Sesión para Ver tus Partituras"}
              </h1>
              <p className="text-xs sm:text-sm text-[#4C4546] leading-relaxed font-normal">
                {isEn
                  ? "You must sign in with your registered Piano Colombia account to access your purchased scores, download your official stamped copies, and view invoices."
                  : "Debes identificarte con tu cuenta registrada en Piano Colombia para acceder a tus partituras adquiridas, descargar tus copias oficiales estampadas y consultar facturas."}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href="/login?redirect=/mi-cuenta/descargas"
                className="w-full py-3.5 bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">login</span>
                {isEn ? "Sign In / Register" : "Iniciar Sesión / Crear Cuenta"}
              </Link>
              <Link
                href="/"
                className="w-full py-3 bg-[#F0F3FF] hover:bg-[#111C2D] text-[#111C2D] hover:text-white font-bold text-xs rounded-xl transition font-montserrat flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                {isEn ? "Back to Main Store" : "Volver a la Tienda Principal"}
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Breadcrumbs & User / Logout Header */}
          <nav aria-label="Breadcrumb" className="py-2.5 sm:py-3 flex items-center justify-between gap-2 text-xs text-[#4C4546] font-medium border-b border-black/5">
            <div className="flex items-center space-x-1.5 sm:space-x-2 truncate">
              <Link href="/" className="hover:text-[#0071BC] transition shrink-0">{t("nav.home", "Inicio")}</Link>
              <span className="shrink-0 text-slate-300">/</span>
              <span className="text-[#111C2D] font-bold shrink-0">{t("nav.my_account", "Mi Cuenta")}</span>
              <span className="shrink-0 text-slate-300">/</span>
              <span aria-current="page" className="text-[#0071BC] font-bold truncate">
                {activeTab === "descargas" && (isEn ? "Purchased Scores" : "Partituras")}
                {activeTab === "pedidos" && (isEn ? "Orders & Invoices" : "Pedidos & Facturas")}
                {activeTab === "colecciones" && (isEn ? "Saved Collections" : "Guardadas")}
              </span>
            </div>

            {/* User Session & Logout - Always Visible, Never Overflowed */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="font-bold text-[#111C2D] font-montserrat truncate max-w-[85px] sm:max-w-[140px] md:max-w-none">
                  {customer.fullName}
                </span>
                <span className="hidden md:inline text-[#4C4546] text-[11px]">({customer.email})</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  logoutCustomer();
                  window.location.href = "/";
                }}
                className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition font-montserrat shrink-0 cursor-pointer shadow-2xs active:scale-95"
                title={t("nav.logout", "Cerrar Sesión")}
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                <span className="hidden sm:inline">{t("nav.logout", "Cerrar Sesión")}</span>
                <span className="inline sm:hidden">{isEn ? "Exit" : "Salir"}</span>
              </button>
            </div>
          </nav>

          {/* Account Navigation Tabs - 3 column responsive segmented grid, 100% visible on any screen */}
          <div className="py-2.5 sm:py-3">
            <div className="grid grid-cols-3 gap-1 sm:gap-2 p-1 sm:p-1.5 bg-slate-100/90 rounded-2xl border border-black/5 w-full">
              {/* Tab 1: Partituras Compradas */}
              <button
                type="button"
                onClick={() => handleTabChange("descargas")}
                className={`flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 px-1.5 sm:px-3 rounded-xl font-montserrat font-bold text-xs transition cursor-pointer select-none ${
                  activeTab === "descargas"
                    ? "bg-[#111C2D] text-white shadow-sm"
                    : "text-[#4C4546] hover:text-[#111C2D] hover:bg-white/70"
                }`}
              >
                <span className={`material-symbols-outlined text-base sm:text-lg shrink-0 ${
                  activeTab === "descargas" ? "text-[#FBB03B]" : "text-[#4C4546]"
                }`}>
                  description
                </span>
                <span className="hidden lg:inline whitespace-nowrap">
                  {isEn ? "My Purchased Scores" : "Mis Partituras Compradas"}
                </span>
                <span className="hidden sm:inline lg:hidden whitespace-nowrap">
                  {isEn ? "Purchased Scores" : "Mis Partituras"}
                </span>
                <span className="inline sm:hidden whitespace-nowrap text-[11px]">
                  {isEn ? "Scores" : "Partituras"}
                </span>
                <span
                  className={`text-[10px] px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full font-black shrink-0 ${
                    activeTab === "descargas"
                      ? "bg-white/20 text-white"
                      : "bg-[#FBB03B]/25 text-[#111C2D]"
                  }`}
                >
                  {scoresList.length}
                </span>
              </button>

              {/* Tab 2: Historial de Pedidos */}
              <button
                type="button"
                onClick={() => handleTabChange("pedidos")}
                className={`flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 px-1.5 sm:px-3 rounded-xl font-montserrat font-bold text-xs transition cursor-pointer select-none ${
                  activeTab === "pedidos"
                    ? "bg-[#111C2D] text-white shadow-sm"
                    : "text-[#4C4546] hover:text-[#111C2D] hover:bg-white/70"
                }`}
              >
                <span className={`material-symbols-outlined text-base sm:text-lg shrink-0 ${
                  activeTab === "pedidos" ? "text-[#0071BC]" : "text-[#4C4546]"
                }`}>
                  receipt_long
                </span>
                <span className="hidden lg:inline whitespace-nowrap">
                  {isEn ? "Order History & Invoices" : "Historial de Pedidos & Facturas"}
                </span>
                <span className="hidden sm:inline lg:hidden whitespace-nowrap">
                  {isEn ? "Order History" : "Pedidos & Facturas"}
                </span>
                <span className="inline sm:hidden whitespace-nowrap text-[11px]">
                  {isEn ? "Orders" : "Pedidos"}
                </span>
                <span
                  className={`text-[10px] px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full font-black shrink-0 ${
                    activeTab === "pedidos"
                      ? "bg-white/20 text-white"
                      : "bg-[#0071BC]/15 text-[#0071BC]"
                  }`}
                >
                  {scoresList.length}
                </span>
              </button>

              {/* Tab 3: Colecciones Guardadas */}
              <button
                type="button"
                onClick={() => handleTabChange("colecciones")}
                className={`flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 px-1.5 sm:px-3 rounded-xl font-montserrat font-bold text-xs transition cursor-pointer select-none ${
                  activeTab === "colecciones"
                    ? "bg-[#C1272D] text-white shadow-sm"
                    : "text-[#4C4546] hover:text-[#111C2D] hover:bg-white/70"
                }`}
              >
                <span className={`material-symbols-outlined text-base sm:text-lg shrink-0 ${
                  activeTab === "colecciones" ? "text-white" : "text-[#C1272D]"
                }`}>
                  bookmark
                </span>
                <span className="hidden lg:inline whitespace-nowrap">
                  {isEn ? "Saved Collections" : "Colecciones Guardadas"}
                </span>
                <span className="hidden sm:inline lg:hidden whitespace-nowrap">
                  {isEn ? "Saved Collections" : "Guardadas"}
                </span>
                <span className="inline sm:hidden whitespace-nowrap text-[11px]">
                  {isEn ? "Saved" : "Guardadas"}
                </span>
                <span
                  className={`text-[10px] px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full font-black shrink-0 ${
                    activeTab === "colecciones"
                      ? "bg-white/25 text-white"
                      : "bg-[#C1272D]/15 text-[#C1272D]"
                  }`}
                >
                  {savedScores.length}
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>


      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-12 space-y-8">
        
        {/* ==========================================
               PESTAÑA 1: MIS PARTITURAS COMPRADAS
               ========================================== */}
        {activeTab === "descargas" && (
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F3FF] border border-[#0071BC]/10 text-[#0071BC] text-[11px] font-extrabold uppercase tracking-wider mb-3 font-montserrat">
                <span className="w-2 h-2 rounded-full bg-[#0071BC] animate-pulse"></span>
                {isEn ? "Customer Area • Digital Licenses" : "Área de Cliente • Licencias Digitales"}
              </div>
              <h1 className="text-3xl sm:text-4xl font-black font-montserrat text-[#111C2D] tracking-tight mb-2">
                {isEn ? "My Purchased Scores" : "Mis Partituras Compradas"}
              </h1>
              <p className="text-sm md:text-base text-[#4C4546] max-w-3xl leading-relaxed font-normal">
                {isEn
                  ? "Manage your acquired licenses, download high-fidelity official PDFs with antifraud security stamp, and access reference audio."
                  : "Gestiona tus licencias adquiridas, descarga tus archivos PDF oficiales con estampado de seguridad antifraude de alta fidelidad y accede a grabaciones de referencia."}
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
                      placeholder={isEn ? "Filter by piece or composer..." : "Filtrar por obra o compositor..."}
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#F0F3FF] border border-black/5 rounded-xl text-[#111C2D] placeholder-[#4C4546]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                    <span className="text-[#4C4546] hidden sm:inline">{isEn ? "Filter:" : "Filtrar:"}</span>
                    <button
                      type="button"
                      onClick={() => setCategoryFilter("todas")}
                      className={`px-3.5 py-2 rounded-xl text-xs font-montserrat font-bold transition cursor-pointer ${
                        categoryFilter === "todas"
                          ? "bg-[#111C2D] text-white shadow-2xs"
                          : "bg-[#F0F3FF] text-[#4C4546] hover:text-[#111C2D]"
                      }`}
                    >
                      {isEn ? `All (${scoresList.length})` : `Todas (${scoresList.length})`}
                    </button>
                    {availableCategories.map((cat) => {
                      const isActive = categoryFilter.toLowerCase().trim() === cat.name.toLowerCase().trim();
                      return (
                        <button
                          key={cat.name}
                          type="button"
                          onClick={() => setCategoryFilter(cat.name)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-montserrat font-bold transition cursor-pointer ${
                            isActive
                              ? "bg-[#111C2D] text-white shadow-2xs"
                              : "bg-[#F0F3FF] text-[#4C4546] hover:text-[#111C2D]"
                          }`}
                        >
                          {cat.name} ({cat.count})
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Lista de Partituras o Empty State Real */}
            {loading ? (
              <div className="bg-white rounded-3xl border border-black/5 p-12 text-center space-y-3 shadow-xs">
                <span className="w-6 h-6 border-2 border-[#111C2D] border-t-transparent rounded-full animate-spin inline-block"></span>
                <p className="text-xs font-bold text-[#4C4546] font-montserrat">
                  {isEn ? "Querying your licenses in database..." : "Consultando tus licencias en base de datos..."}
                </p>
              </div>
            ) : filteredScores.length > 0 ? (
              <div className="space-y-6">
                {filteredScores.map((score) => (
                  <article
                    key={score.id}
                    className="bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 p-4 sm:p-6 md:p-7 relative overflow-hidden group"
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
                              {isEn ? "Active License" : score.license}
                            </span>
                            <span className="text-xs font-mono text-[#4C4546]">ISMN: {score.ismn}</span>
                          </div>

                          <h2 className="text-xl sm:text-2xl font-black font-montserrat text-[#111C2D] hover:text-[#0071BC] cursor-pointer transition-colors">
                            {score.title}
                          </h2>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-[#4C4546] font-medium">
                            <span>{isEn ? "Composer:" : "Compositor:"} <strong className="text-[#111C2D] font-bold">{score.composer}</strong></span>
                            <span>•</span>
                            <span className="px-2.5 py-0.5 bg-[#0071BC]/10 text-[#0071BC] border border-[#0071BC]/20 rounded-md font-bold text-[10px] tracking-wide font-montserrat">
                              {score.category}
                            </span>
                            <span>•</span>
                            <span className="text-[11px]">{isEn ? "Urtext A4 Format" : score.format}</span>
                          </div>

                          <div className="pt-2 text-xs text-[#4C4546] flex flex-wrap items-center gap-x-2 gap-y-1 bg-[#F0F3FF]/70 p-2.5 rounded-xl border border-black/5">
                            <span className="font-bold text-[#111C2D] flex items-center gap-1 font-montserrat">
                              <span className="material-symbols-outlined text-sm text-[#0071BC]">shield</span>
                              {isEn ? "Security Stamp:" : "Estampa de Seguridad:"}
                            </span>
                            <span className="font-mono text-[#111C2D] bg-white px-2 py-0.5 rounded border border-black/5 text-[11px]">
                              {score.userStamp}
                            </span>
                            <span>|</span>
                            <span className="font-medium text-[#111C2D]">
                              {isEn ? "1 Authorized Printed Copy" : score.copies}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end justify-between gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-black/5">
                        <div className="text-left lg:text-right">
                          <span className="text-xs font-bold text-[#4C4546] block mb-0.5 font-montserrat">
                            {isEn ? "Remaining downloads:" : "Descargas restantes:"}
                          </span>
                          <div className="flex items-center lg:justify-end gap-2">
                            <span className="text-sm font-black font-montserrat text-[#0071BC]">
                              {isEn
                                ? `${score.downloadsLeft} of ${score.downloadsTotal} allowed`
                                : `${score.downloadsLeft} de ${score.downloadsTotal} permitidas`}
                            </span>
                          </div>
                          <div className="w-44 lg:ml-auto h-2 bg-[#F0F3FF] rounded-full mt-1.5 overflow-hidden border border-black/5">
                            <div className="h-full bg-[#FBB03B] rounded-full" style={{ width: `${score.progressPercent}%` }}></div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
                          {score.audioUrl ? (
                            <button
                              type="button"
                              onClick={() => window.open(score.audioUrl, "_blank", "noopener,noreferrer")}
                              className="px-3.5 py-2.5 text-xs font-bold text-[#111C2D] bg-[#F0F3FF] hover:bg-slate-200/60 rounded-xl flex items-center justify-center gap-1.5 transition font-montserrat border border-black/5 cursor-pointer"
                              title={isEn ? "Open reference audio in new tab" : "Abrir audio de referencia en nueva pestaña"}
                            >
                              <span className="material-symbols-outlined text-base text-[#0071BC]">open_in_new</span>
                              {isEn ? "Reference Audio" : "Audio Referencia"}
                            </button>
                          ) : null}

                          {score.downloadsLeft > 0 ? (
                            <button
                              onClick={() => handleDownloadPdf(score)}
                              disabled={downloadingToken === score.token}
                              className="px-5 py-3 rounded-xl bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition font-montserrat flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                            >
                              {downloadingToken === score.token ? (
                                <>
                                  <span className="w-4 h-4 border-2 border-[#111C2D] border-t-transparent rounded-full animate-spin"></span>
                                  <span>{isEn ? "Applying License..." : "Estampando Licencia..."}</span>
                                </>
                              ) : (
                                <>
                                  <span className="material-symbols-outlined text-lg">download</span>
                                  <span>{isEn ? "Download Stamped PDF" : "Descargar PDF Firmado"}</span>
                                </>
                              )}
                            </button>
                          ) : (
                            <button
                              disabled
                              title={isEn ? "You have reached the maximum download limit for this purchase" : "Has alcanzado el límite máximo de descargas para esta compra"}
                              className="px-5 py-3 rounded-xl bg-slate-100 text-slate-400 font-extrabold text-xs uppercase tracking-wider font-montserrat flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200"
                            >
                              <span className="material-symbols-outlined text-lg text-slate-400">lock</span>
                              <span>{isEn ? `Downloads Exhausted (0/${score.downloadsTotal})` : `Descargas Agotadas (0/${score.downloadsTotal})`}</span>
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
            ) : scoresList.length > 0 ? (
              /* BÚSQUEDA ACTIVA SIN RESULTADOS PERO EL USUARIO SÍ TIENE PARTITURAS */
              <div className="bg-white rounded-3xl border border-black/5 p-12 sm:p-16 text-center max-w-xl mx-auto space-y-5 shadow-xs animate-in fade-in duration-200">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-3xl">search_off</span>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-black font-montserrat text-[#111C2D]">
                    {isEn ? "No purchased scores match your search" : "No se encontraron coincidencias en tus partituras"}
                  </h3>
                  
                  {/* Badges estructurados con los filtros activos */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1 pb-1">
                    {searchFilter.trim() && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0071BC]/10 text-[#0071BC] text-xs font-bold font-montserrat border border-[#0071BC]/20">
                        <span className="material-symbols-outlined text-sm">search</span>
                        <span>{isEn ? "Search:" : "Búsqueda:"} "{searchFilter.trim()}"</span>
                      </span>
                    )}
                    {categoryFilter !== "todas" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBB03B]/20 text-[#111C2D] text-xs font-bold font-montserrat border border-[#FBB03B]/40">
                        <span className="material-symbols-outlined text-sm">filter_alt</span>
                        <span>{isEn ? "Category:" : "Categoría:"} {categoryFilter}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-[#4C4546] leading-relaxed max-w-md mx-auto">
                    {isEn
                      ? `You have ${scoresList.length} purchased score${scoresList.length > 1 ? "s" : ""} in your account, but none match the current filter criteria. Try adjusting your search term or clear the filters.`
                      : `Tienes ${scoresList.length} partitura${scoresList.length > 1 ? "s" : ""} adquirida${scoresList.length > 1 ? "s" : ""} en tu cuenta, pero ninguna coincide con los filtros aplicados. Prueba ajustando el término de búsqueda o limpia los filtros.`}
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchFilter("");
                      setCategoryFilter("todas");
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0071BC] hover:bg-[#005a96] text-white font-extrabold text-xs uppercase tracking-wider font-montserrat shadow-md transition cursor-pointer active:scale-95"
                  >
                    <span className="material-symbols-outlined text-base">restart_alt</span>
                    <span>{isEn ? `Clear filters and show all (${scoresList.length})` : `Limpiar filtros y ver todas (${scoresList.length})`}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* BASE DE DATOS SIN PARTITURAS COMPRADAS (USUARIO NUNCA HA COMPRADO) */
              <div className="bg-white rounded-3xl border border-black/5 p-6 sm:p-10 md:p-12 text-center space-y-4 shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-[#F0F3FF] text-[#0071BC] flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-3xl">library_music</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold font-montserrat text-[#111C2D]">
                    {isEn ? "You have no purchased scores yet" : "Aún no tienes partituras compradas"}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4C4546] max-w-md mx-auto leading-relaxed">
                    {isEn
                      ? "Explore our catalog of Urtext scores and acquire works by Colombian composers with your nominative legal license."
                      : "Explora nuestro catálogo de partituras Urtext y adquiere obras de compositores colombianos con tu licencia legal nominativa."}
                  </p>
                </div>
                <div className="pt-2 flex flex-col items-center gap-3">
                  <Link
                    href="/tienda"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider font-montserrat shadow-md transition"
                  >
                    <span className="material-symbols-outlined text-lg">storefront</span>
                    {isEn ? "Explore Sheet Music Catalog" : "Explorar Catálogo de Partituras"}
                  </Link>

                  {savedScores.length > 0 && (
                    <div className="inline-flex flex-col sm:flex-row items-center gap-2 px-4 py-2.5 bg-red-50/70 border border-red-200/60 rounded-2xl text-xs text-[#111C2D] text-center sm:text-left max-w-full">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base text-[#C1272D]">bookmark</span>
                        <span>
                          {isEn
                            ? `You have ${savedScores.length} saved score${savedScores.length > 1 ? "s" : ""} to purchase later.`
                            : `Tienes ${savedScores.length} partitura${savedScores.length > 1 ? "s" : ""} guardada${savedScores.length > 1 ? "s" : ""} para comprar más adelante.`}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleTabChange("colecciones")}
                        className="text-xs font-bold text-[#C1272D] hover:underline cursor-pointer"
                      >
                        {isEn ? `View saved (${savedScores.length}) →` : `Ver mis guardadas (${savedScores.length}) →`}
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
                      {isEn ? "How does legal security stamping work?" : "¿Cómo funciona el estampado de seguridad legal?"}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#4C4546] leading-relaxed">
                      {isEn
                        ? "Your scores are generated in real-time and personalized with your full name and email at the bottom margin of each page. This digital watermark certifies the legal authenticity of your copy for auditions, competitions, and copyright audits."
                        : "Tus partituras son generadas en tiempo real y personalizadas con tu nombre completo y correo en el margen inferior de cada página. Este sello digital garantiza la legitimidad jurídica de tu copia ante audiciones y auditorías de derechos de autor."}
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
                    {isEn ? "Download Support" : "Soporte de Descarga"}
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
                {isEn ? "Billing & Purchase History" : "Facturación & Historial de Compras"}
              </div>
              <h1 className="text-3xl sm:text-4xl font-black font-montserrat text-[#111C2D] tracking-tight mb-2">
                {isEn ? "Order History & Invoices" : "Historial de Pedidos & Facturas"}
              </h1>
              <p className="text-sm md:text-base text-[#4C4546] max-w-3xl leading-relaxed font-normal">
                {isEn
                  ? "View the breakdown of your transactions and official payment receipts processed through Wompi."
                  : "Consulta el desglose de tus transacciones realizadas y comprobantes de pago de la pasarela oficial Wompi."}
              </p>
            </div>

            {consolidatedPurchases.length > 0 ? (
              <div className="bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="p-6 border-b border-black/5 flex items-center justify-between">
                  <h3 className="text-base font-bold font-montserrat text-[#111C2D]">
                    {isEn ? "Purchases Log" : "Registro de Compras"}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#0071BC] font-bold font-montserrat">
                      {consolidatedPurchases.length} {isEn ? "Unique Scores" : "Obras Adquiridas"}
                    </span>
                    <span className="text-[11px] text-[#4C4546] font-semibold">
                      ({scoresList.length} {isEn ? "Total Licenses" : "Licencias Totales"})
                    </span>
                  </div>
                </div>

                {/* Vista Móvil: Tarjetas responsivas sin desbordamiento horizontal */}
                <div className="block md:hidden divide-y divide-black/5">
                  {consolidatedPurchases.map((score) => {
                    const hasDownloads = (score.downloadsLeft || 0) > 0;
                    const totalAllowed = score.downloadsTotal || ((score.quantity || 1) * 5);
                    const progress = totalAllowed > 0 ? Math.min(100, Math.max(0, ((score.downloadsLeft || 0) / totalAllowed) * 100)) : 0;

                    return (
                      <div key={score.id} className="p-4 sm:p-5 space-y-3 hover:bg-[#F0F3FF]/40 transition">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <span className="font-mono font-bold text-[10px] text-[#4C4546] bg-[#F0F3FF] px-2 py-0.5 rounded border border-black/5">
                              {score.id}
                            </span>
                            <h4 className="font-bold font-montserrat text-sm text-[#111C2D] leading-snug">
                              {score.title}
                            </h4>
                            <p className="text-xs text-[#4C4546]">
                              {isEn ? "Composer:" : "Compositor:"} <strong className="text-[#111C2D]">{score.composer}</strong>
                            </p>
                          </div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-extrabold font-montserrat border border-emerald-200 shrink-0">
                            <span className="material-symbols-outlined text-xs">check_circle</span>
                            {isEn ? "Approved" : "Aprobado"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-[#0071BC] rounded-full text-[11px] font-black font-montserrat border border-blue-200 shadow-2xs">
                            <span className="material-symbols-outlined text-xs">local_mall</span>
                            {score.quantity} {score.quantity === 1 ? (isEn ? "Purchase" : "Compra") : (isEn ? "Compras" : "Compras")}
                          </span>

                          <div className="text-right">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-montserrat ${
                              hasDownloads 
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                                : "bg-slate-100 text-slate-500 border border-slate-200"
                            }`}>
                              {score.downloadsLeft || 0} {isEn ? "of" : "de"} {totalAllowed} {isEn ? "downloads" : "descargas"}
                            </span>
                            <div className="w-28 h-1.5 bg-[#F0F3FF] rounded-full overflow-hidden border border-black/5 mt-1 ml-auto">
                              <div 
                                className={`h-full rounded-full transition-all duration-300 ${hasDownloads ? "bg-emerald-500" : "bg-slate-300"}`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="pt-2">
                          {hasDownloads ? (
                            <button
                              type="button"
                              onClick={() => handleDownloadPdf(score)}
                              disabled={downloadingToken === score.token}
                              className="w-full py-2.5 bg-[#F0F3FF] hover:bg-slate-200 text-[#0071BC] rounded-xl font-extrabold text-xs transition font-montserrat inline-flex items-center justify-center gap-1.5 border border-black/5 cursor-pointer disabled:opacity-60 shadow-2xs active:scale-95"
                              title={isEn ? "Download official stamped PDF" : "Descargar PDF estampado oficial"}
                            >
                              {downloadingToken === score.token ? (
                                <span className="w-4 h-4 border-2 border-[#0071BC] border-t-transparent rounded-full animate-spin"></span>
                              ) : (
                                <span className="material-symbols-outlined text-sm">download</span>
                              )}
                              <span>{isEn ? "Download Stamped PDF" : "Descargar PDF Estampado"}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="w-full py-2.5 bg-slate-100 text-slate-400 rounded-xl font-bold text-xs font-montserrat inline-flex items-center justify-center gap-1.5 border border-slate-200 cursor-not-allowed opacity-60"
                              title={isEn ? "Downloads exhausted (0 allowed)" : "Descargas agotadas (0 permitidas)"}
                            >
                              <span className="material-symbols-outlined text-sm">lock</span>
                              <span>{isEn ? "Downloads Exhausted (0 allowed)" : "Descargas Agotadas (0 permitidas)"}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Vista Escritorio: Tabla completa */}
                <div className="hidden md:block w-full overflow-x-auto overscroll-x-contain">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F0F3FF] text-[#4C4546] font-montserrat text-[11px] font-extrabold uppercase tracking-wider border-b border-black/5">
                        <th className="py-3 px-6">{isEn ? "License ID" : "ID Licencia"}</th>
                        <th className="py-3 px-6">{isEn ? "Purchased Piece" : "Obra Adquirida"}</th>
                        <th className="py-3 px-6 text-center">{isEn ? "Purchases / Licenses" : "Compras Realizadas"}</th>
                        <th className="py-3 px-6 text-center">{isEn ? "Available Downloads" : "Descargas Disponibles"}</th>
                        <th className="py-3 px-6">{isEn ? "Composer" : "Compositor"}</th>
                        <th className="py-3 px-6">{isEn ? "Status" : "Estado"}</th>
                        <th className="py-3 px-6 text-right">{isEn ? "Download" : "Descarga"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 text-xs text-[#111C2D]">
                      {consolidatedPurchases.map((score) => {
                        const hasDownloads = (score.downloadsLeft || 0) > 0;
                        const totalAllowed = score.downloadsTotal || ((score.quantity || 1) * 5);
                        const progress = totalAllowed > 0 ? Math.min(100, Math.max(0, ((score.downloadsLeft || 0) / totalAllowed) * 100)) : 0;

                        return (
                          <tr key={score.id} className="hover:bg-[#F0F3FF]/40 transition">
                            <td className="py-4 px-6 font-mono font-bold">
                              <div className="text-[#111C2D] text-xs">{score.id}</div>
                            </td>
                            <td className="py-4 px-6 font-bold font-montserrat max-w-xs">
                              {score.title}
                            </td>
                            <td className="py-4 px-6 text-center">
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-[#0071BC] rounded-full text-xs font-black font-montserrat border border-blue-200 shadow-2xs">
                                <span className="material-symbols-outlined text-xs">local_mall</span>
                                {score.quantity} {score.quantity === 1 ? (isEn ? "Purchase" : "Compra") : (isEn ? "Compras" : "Compras")}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <div className="inline-flex flex-col items-center gap-1">
                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold font-montserrat ${
                                  hasDownloads 
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                                    : "bg-slate-100 text-slate-500 border border-slate-200"
                                }`}>
                                  {score.downloadsLeft || 0} {isEn ? "of" : "de"} {totalAllowed} {isEn ? "allowed" : "permitidas"}
                                </span>
                                <div className="w-24 h-1.5 bg-[#F0F3FF] rounded-full overflow-hidden border border-black/5">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-300 ${hasDownloads ? "bg-emerald-500" : "bg-slate-300"}`}
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 font-medium text-[#4C4546]">
                              {score.composer}
                            </td>
                            <td className="py-4 px-6">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-extrabold font-montserrat border border-emerald-200">
                                <span className="material-symbols-outlined text-xs">check_circle</span>
                                {isEn ? "Approved by Wompi" : "Aprobado por Wompi"}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              {hasDownloads ? (
                                <button
                                  type="button"
                                  onClick={() => handleDownloadPdf(score)}
                                  disabled={downloadingToken === score.token}
                                  className="px-3.5 py-1.5 bg-[#F0F3FF] hover:bg-slate-200/60 text-[#0071BC] rounded-xl font-extrabold text-xs transition font-montserrat inline-flex items-center gap-1.5 border border-black/5 cursor-pointer disabled:opacity-60 shadow-2xs active:scale-95"
                                  title={isEn ? "Download official stamped PDF" : "Descargar PDF estampado oficial"}
                                >
                                  {downloadingToken === score.token ? (
                                    <span className="w-3.5 h-3.5 border-2 border-[#0071BC] border-t-transparent rounded-full animate-spin"></span>
                                  ) : (
                                    <span className="material-symbols-outlined text-sm">download</span>
                                  )}
                                  <span>PDF</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled
                                  className="px-3.5 py-1.5 bg-slate-100 text-slate-400 rounded-xl font-bold text-xs font-montserrat inline-flex items-center gap-1.5 border border-slate-200 cursor-not-allowed opacity-60"
                                  title={isEn ? "Downloads exhausted (0 allowed)" : "Descargas agotadas (0 permitidas)"}
                                >
                                  <span className="material-symbols-outlined text-sm">lock</span>
                                  <span>PDF</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-black/5 p-12 text-center space-y-3 shadow-xs">
                <div className="w-12 h-12 rounded-xl bg-[#F0F3FF] text-[#0071BC] flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-2xl">receipt_long</span>
                </div>
                <h3 className="text-base font-bold font-montserrat text-[#111C2D]">
                  {isEn ? "No recent orders recorded" : "No registras pedidos recientes"}
                </h3>
                <p className="text-xs text-[#4C4546]">
                  {isEn
                    ? "Your transactions and receipts will appear here once you make purchases in the store."
                    : "Tus transacciones y facturas aparecerán aquí una vez realices compras en la tienda."}
                </p>
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
                  {isEn ? "Saved Lists & Repertoires" : "Listas & Repertorios Guardados"}
                </div>
                <h1 className="text-3xl sm:text-4xl font-black font-montserrat text-[#111C2D] tracking-tight mb-2">
                  {isEn ? "My Saved Scores" : "Mis Partituras Guardadas"}
                </h1>
                <p className="text-sm md:text-base text-[#4C4546] max-w-3xl leading-relaxed font-normal">
                  {isEn
                    ? "Your favorite scores saved from the store for study, recital planning, or pedagogical repertoire."
                    : "Aquí se almacenan tus partituras preferidas guardadas desde la tienda para estudio, recitales o repertorio pedagógico."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(!showCreateModal)}
                className="px-5 py-3 bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">
                  {showCreateModal ? "close" : "create_new_folder"}
                </span>
                {showCreateModal ? (isEn ? "Cancel" : "Cancelar") : (isEn ? "New Collection" : "Nueva Colección")}
              </button>
            </div>

            {/* Modal / Formulario para Crear Colección */}
            {showCreateModal && (
              <div className="p-6 bg-white rounded-2xl border border-[#0071BC]/20 shadow-md space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-sm font-bold text-[#0071BC] font-montserrat border-b border-black/5 pb-2">
                  <span className="material-symbols-outlined text-lg">folder_special</span>
                  <span>{isEn ? "Create New Thematic Folder / Collection" : "Crear Nueva Carpeta / Colección Temática"}</span>
                </div>
                <form onSubmit={handleCreateCollection} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat">
                        {isEn ? "Collection Name *" : "Nombre de la Colección *"}
                      </label>
                      <input
                        type="text"
                        required
                        value={newColName}
                        onChange={(e) => setNewColName(e.target.value)}
                        placeholder={isEn ? "E.g., Pasillos for Graduation Recital" : "Ej: Pasillos para Recital de Grado"}
                        className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat">
                        {isEn ? "Description or Notes (Optional)" : "Descripción o Notas (Opcional)"}
                      </label>
                      <input
                        type="text"
                        value={newColDesc}
                        onChange={(e) => setNewColDesc(e.target.value)}
                        placeholder={isEn ? "E.g., Andean works for intermediate to advanced level" : "Ej: Obras andinas de nivel intermedio a avanzado"}
                        className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 text-xs font-bold text-[#4C4546] hover:bg-slate-100 rounded-xl transition cursor-pointer"
                    >
                      {isEn ? "Cancel" : "Cancelar"}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#0071BC] hover:bg-[#005996] text-white font-extrabold text-xs font-montserrat rounded-xl shadow-xs transition cursor-pointer"
                    >
                      {isEn ? "Save Collection" : "Guardar Colección"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Toolbar de Búsqueda de Guardadas */}
            {savedScores.length > 0 && (
              <div className="p-4 bg-white rounded-2xl border border-black/5 shadow-2xs">
                <div className="relative w-full">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4C4546] text-lg">search</span>
                  <input
                    type="search"
                    value={savedSearchQuery}
                    onChange={(e) => setSavedSearchQuery(e.target.value)}
                    placeholder={isEn ? "Search in your saved scores..." : "Buscar en tus partituras guardadas..."}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#F0F3FF] border border-black/5 rounded-xl text-[#111C2D] placeholder-[#4C4546]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                  />
                </div>
              </div>
            )}

            {/* Filtros de Colecciones y Acciones */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setCollectionFilter("todas")}
                  className={`px-4 py-2 rounded-xl text-xs font-montserrat font-bold transition cursor-pointer ${
                    collectionFilter === "todas"
                      ? "bg-[#111C2D] text-white shadow-2xs"
                      : "bg-white text-[#4C4546] border border-black/5 hover:text-[#111C2D]"
                  }`}
                >
                  {isEn ? `All Saved (${savedScores.length})` : `Todas las Guardadas (${savedScores.length})`}
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
                        className="px-3.5 py-2 flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">{col.icon || "folder"}</span>
                        <span>{col.name}</span>
                        <span className="text-[10px] opacity-80">({count})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          showConfirm({
                            title: isEn ? "Delete Collection" : "Eliminar Colección",
                            message: isEn
                              ? `Are you sure you want to delete the collection "${col.name}"?`
                              : `¿Deseas eliminar la colección "${col.name}"?`,
                            confirmText: isEn ? "Yes, Delete" : "Sí, eliminar",
                            cancelText: isEn ? "Cancel" : "Cancelar",
                            type: "danger",
                            onConfirm: () => {
                              deleteCollection(col.id);
                              if (collectionFilter === col.id) setCollectionFilter("todas");
                            },
                          });
                        }}
                        title={isEn ? "Delete collection" : "Eliminar colección"}
                        className="pr-2.5 pl-1 py-2 text-xs opacity-60 hover:opacity-100 hover:text-red-300 transition cursor-pointer"
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
                    showConfirm({
                      title: isEn ? "Clear All Saved Scores" : "Vaciar Obras Guardadas",
                      message: isEn
                        ? "Are you sure you want to remove all scores from your saved list?"
                        : "¿Estás seguro de que deseas eliminar todas las partituras de tu lista de guardadas?",
                      confirmText: isEn ? "Yes, Clear All" : "Sí, vaciar todas",
                      cancelText: isEn ? "Cancel" : "Cancelar",
                      type: "danger",
                      onConfirm: () => clearAllSavedScores(),
                    });
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-montserrat font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs active:scale-95"
                  title={isEn ? "Delete all saved scores" : "Eliminar todas las obras guardadas"}
                >
                  <span className="material-symbols-outlined text-base">delete_sweep</span>
                  {isEn ? `Clear all (${savedScores.length})` : `Vaciar todas (${savedScores.length})`}
                </button>
              )}
            </div>

            {/* Grid de Partituras Guardadas o Empty State */}
            {filteredSavedScores.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSavedScores.map((score) => (
                  <div
                    key={score.id || score.slug}
                    className="bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full bg-[#FBB03B]/20 text-[#111C2D] font-montserrat font-extrabold text-[10px] uppercase">
                          {score.category || "Piano Solo"}
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => removeSavedScore(score)}
                          title={isEn ? "Remove from saved" : "Quitar de guardadas"}
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
                        <p className="text-xs text-[#4C4546] font-semibold mt-1">
                          {isEn ? "By" : "Por"} {score.composer}
                        </p>
                        {score.level && (
                          <span className="inline-block text-[10px] font-bold text-[#4C4546] bg-[#F0F3FF] px-2 py-0.5 rounded mt-2">
                            {isEn ? "Level:" : "Nivel:"} {score.level}
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
                            {isEn ? "Folder / Collection:" : "Carpeta / Colección:"}
                          </label>
                          <select
                            value={score.collectionId || ""}
                            onChange={(e) => moveScoreToCollection(score.slug || score.id, e.target.value || undefined)}
                            className="w-full bg-[#F0F3FF] border border-black/10 rounded-lg px-2.5 py-1.5 text-xs text-[#111C2D] font-medium"
                          >
                            <option value="">{isEn ? "No folder assigned" : "Sin carpeta asignada"}</option>
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
                          {isEn ? "View" : "Ver"}
                        </Link>
                        <Link
                          href={`/checkout`}
                          className="px-3.5 py-2 bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl transition font-montserrat shadow-xs flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">shopping_cart</span>
                          {isEn ? "Buy" : "Comprar"}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : savedScores.length > 0 ? (
              /* BÚSQUEDA O FILTRO ACTIVO EN GUARDADAS SIN RESULTADOS PERO EL USUARIO SÍ TIENE GUARDADAS */
              <div className="bg-white rounded-3xl border border-black/5 p-12 sm:p-16 text-center max-w-xl mx-auto space-y-5 shadow-xs animate-in fade-in duration-200">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-3xl">search_off</span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black font-montserrat text-[#111C2D]">
                    {isEn ? "No saved scores match your search" : "No se encontraron coincidencias en tus guardadas"}
                  </h3>

                  {/* Badges estructurados con los filtros activos */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1 pb-1">
                    {savedSearchQuery.trim() && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0071BC]/10 text-[#0071BC] text-xs font-bold font-montserrat border border-[#0071BC]/20">
                        <span className="material-symbols-outlined text-sm">search</span>
                        <span>{isEn ? "Search:" : "Búsqueda:"} "{savedSearchQuery.trim()}"</span>
                      </span>
                    )}
                    {collectionFilter !== "todas" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBB03B]/20 text-[#111C2D] text-xs font-bold font-montserrat border border-[#FBB03B]/40">
                        <span className="material-symbols-outlined text-sm">folder</span>
                        <span>
                          {isEn ? "Collection:" : "Colección:"}{" "}
                          {collections.find((c) => c.id === collectionFilter)?.name || collectionFilter}
                        </span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-[#4C4546] leading-relaxed max-w-md mx-auto">
                    {isEn
                      ? `You have ${savedScores.length} saved score${savedScores.length > 1 ? "s" : ""} in your library, but none match the current filters. Try adjusting your search term or clear the filters.`
                      : `Tienes ${savedScores.length} partitura${savedScores.length > 1 ? "s" : ""} guardada${savedScores.length > 1 ? "s" : ""} en tu biblioteca, pero ninguna coincide con los filtros aplicados. Prueba con otro término o limpia los filtros.`}
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSavedSearchQuery("");
                      setCollectionFilter("todas");
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0071BC] hover:bg-[#005a96] text-white font-extrabold text-xs uppercase tracking-wider font-montserrat shadow-md transition cursor-pointer active:scale-95"
                  >
                    <span className="material-symbols-outlined text-base">restart_alt</span>
                    <span>
                      {isEn
                        ? `Clear filters and show all (${savedScores.length})`
                        : `Limpiar filtros y ver todas (${savedScores.length})`}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              /* BASE DE DATOS SIN NINGUNA PARTITURA GUARDADA */
              <div className="bg-white rounded-3xl border border-black/5 p-12 text-center space-y-4 shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-[#F0F3FF] text-[#0071BC] flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-3xl">bookmark_border</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold font-montserrat text-[#111C2D]">
                    {isEn ? "You have no saved scores yet" : "Aún no tienes partituras guardadas"}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4C4546] max-w-md mx-auto leading-relaxed">
                    {isEn
                      ? "Explore the store and click the bookmark icon on any sheet music to save it to your customer library."
                      : "Explora la tienda y haz clic en el ícono de marcador en cualquier partitura para guardarla en tu perfil de cliente."}
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/tienda"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider font-montserrat shadow-md transition"
                  >
                    <span className="material-symbols-outlined text-lg">storefront</span>
                    {isEn ? "Explore Sheet Music Store" : "Explorar Tienda de Partituras"}
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
          <span className="text-xs font-bold hidden md:inline font-montserrat">{isEn ? "Account Support?" : "¿Ayuda con tu cuenta?"}</span>
        </a>
      </aside>

    </div>
  );
}

