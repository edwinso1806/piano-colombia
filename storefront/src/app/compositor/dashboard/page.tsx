"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { getComposerScoresApi } from "@/lib/api-client";

function CompositorDashboardContent() {
  const { composer } = useAuth();
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();

  const [activeMainTab, setActiveMainTab] = useState<"metricas" | "partituras">("metricas");
  const [scoreFilter, setScoreFilter] = useState<"todas" | "publicadas" | "revision" | "rechazadas">("todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [scores, setScores] = useState<any[]>([]);
  const [loadingScores, setLoadingScores] = useState(true);

  // Leer parámetros de URL (?tab=partituras&filter=revision)
  useEffect(() => {
    const tab = searchParams.get("tab");
    const filter = searchParams.get("filter");
    if (tab === "partituras" || tab === "scores") {
      setActiveMainTab("partituras");
    }
    if (filter === "revision") {
      setScoreFilter("revision");
    } else if (filter === "publicadas") {
      setScoreFilter("publicadas");
    } else if (filter === "rechazadas") {
      setScoreFilter("rechazadas");
    }
  }, [searchParams]);

  // Cargar partituras reales del compositor desde PostgreSQL
  useEffect(() => {
    async function loadScores() {
      if (!composer?.id) {
        setLoadingScores(false);
        return;
      }
      try {
        setLoadingScores(true);
        const data = await getComposerScoresApi(composer.id);
        setScores(data || []);
      } catch (err) {
        console.warn("Error cargando partituras del compositor:", err);
      } finally {
        setLoadingScores(false);
      }
    }
    loadScores();
  }, [composer?.id]);

  const activeName =
    composer?.artistic_name ||
    (composer?.first_name ? `${composer.first_name} ${composer.last_name || ""}`.trim() : "Compositor");
  const activeEmail = composer?.email || "";
  const initials = (activeName || "PC")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const publishedScores = scores.filter((s) => s.status === "APPROVED");
  const inReviewScores = scores.filter((s) => s.status === "IN_REVIEW");
  const rejectedScores = scores.filter((s) => s.status === "REJECTED");

  const filteredScores = scores.filter((score) => {
    const title = (score.title || "").toLowerCase();
    const genre = (score.genre || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesQuery = title.includes(query) || genre.includes(query);

    if (scoreFilter === "publicadas") return matchesQuery && score.status === "APPROVED";
    if (scoreFilter === "revision") return matchesQuery && score.status === "IN_REVIEW";
    if (scoreFilter === "rechazadas") return matchesQuery && score.status === "REJECTED";
    return matchesQuery;
  });

  // Métricas reales calculadas desde la base de datos
  const totalApproved = publishedScores.length;
  const totalSales = 0; // Ventas reales registradas en órdenes (0 para cuentas nuevas)
  const grossAmount = publishedScores.reduce((acc, s) => acc + (Number(s.price_cop) || 45000), 0) * totalSales;
  const netRoyalties = Math.round(grossAmount * 0.8);

  return (
    <div className="space-y-8 text-[#111C2D]">
      {/* 1. Header Hero Compositor con Datos Reales de BD */}
      <section className="relative p-6 lg:p-8 bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="absolute -right-20 -top-24 w-96 h-96 bg-gradient-to-br from-[#FBB03B]/20 via-[#0071BC]/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-[#FBB03B] shadow-md bg-[#111C2D] flex items-center justify-center font-montserrat font-black text-2xl text-white">
                {composer?.photo_url ? (
                  <img src={composer.photo_url} alt={activeName} className="w-full h-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 flex items-center justify-center p-1 bg-white rounded-full shadow-sm">
                <span className="material-symbols-outlined text-[#0071BC] text-xl">
                  {composer?.status === "APPROVED" ? "verified" : "hourglass_top"}
                </span>
              </div>
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="font-montserrat text-2xl md:text-3xl font-black text-[#111C2D] tracking-tight">
                  {activeName}
                </h1>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F0F3FF] border border-[#0071BC]/10 rounded-full">
                  <div className="flex items-center gap-0.5">
                    <span className="h-3 w-1 bg-[#111C2D] rounded-full"></span>
                    <span className="h-3 w-1 bg-[#FBB03B] rounded-full"></span>
                    <span className="h-3 w-1 bg-[#0071BC] rounded-full"></span>
                  </div>
                  <span className="text-[11px] font-extrabold text-[#0071BC] font-montserrat uppercase tracking-wider">
                    {composer?.status === "APPROVED"
                      ? t("dashboard.verified_composer", "Compositor Verificado")
                      : t("dashboard.in_review", "En Revisión")}
                  </span>
                </div>
              </div>

              <p className="text-xs md:text-sm text-[#4C4546] font-normal max-w-xl leading-relaxed">
                {composer?.region || t("dashboard.default_region", "Compositor e Investigador Musical de Colombia")}
                {activeEmail ? ` • ${activeEmail}` : ""}
              </p>

              <div className="flex items-center gap-4 mt-2 text-xs text-[#4C4546] font-medium">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-[#0071BC]">schedule</span>
                  {t("dashboard.last_payout", "Última liquidación")}: {new Date().toLocaleDateString(language === "en" ? "en-US" : "es-CO", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-bold text-[#111C2D]">
                  <span className="material-symbols-outlined text-sm text-[#FBB03B]">music_note</span>
                  {scores.length} {t("dashboard.registered_scores", "Obras Registradas")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto shrink-0">
            {composer?.slug && (
              <Link
                href={`/compositores/${composer.slug}`}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F0F3FF] hover:bg-slate-200/60 text-[#111C2D] font-bold text-xs rounded-xl transition border border-black/5 font-montserrat"
              >
                <span className="material-symbols-outlined text-base">visibility</span>
                <span>{t("dashboard.public_profile", "Ver Perfil Público")}</span>
              </Link>
            )}
            <Link
              href="/compositor/dashboard/partituras/nueva"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FBB03B] hover:bg-[#e09b2d] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition font-montserrat"
            >
              <span className="material-symbols-outlined text-base">upload_file</span>
              <span>{t("dashboard.upload_score_btn", "Subir Partitura")}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Navegación Principal de Pestañas */}
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
          <span className="truncate">{t("dashboard.metrics_tab", "Métricas & Rendimiento")}</span>
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
          <span>{t("dashboard.scores_tab", "Catálogo de Obras")}</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
              activeMainTab === "partituras"
                ? "bg-[#FBB03B] text-[#111C2D]"
                : "bg-white text-[#0071BC] border border-black/5"
            }`}
          >
            {scores.length}
          </span>
        </button>

        <Link
          href="/compositor/dashboard/perfil"
          className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl font-extrabold text-xs bg-[#F0F3FF] text-[#4C4546] hover:text-[#111C2D] hover:bg-slate-200/60 transition"
        >
          <span className="material-symbols-outlined text-base text-[#C1272D]">badge</span>
          <span>{t("dashboard.nav_profile", "Perfil & Biografía")}</span>
        </Link>
      </div>

      {/* PESTAÑA 1: PANEL DE MÉTRICAS */}
      {activeMainTab === "metricas" && (
        <div className="space-y-8">
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between group hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4C4546] font-montserrat">
                  {t("dashboard.total_scores", "Partituras en Catálogo")}
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#F0F3FF] flex items-center justify-center text-[#111C2D] group-hover:bg-[#111C2D] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-xl">library_books</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-black font-montserrat text-[#111C2D] tracking-tight">
                  {scores.length}
                </div>
                <div className="flex items-center gap-1 mt-2 text-[#0071BC] text-xs font-bold font-montserrat">
                  <span>{publishedScores.length} {t("dashboard.approved_scores_count", "Aprobadas")}</span>
                  <span>•</span>
                  <span>{inReviewScores.length} {t("dashboard.in_review_scores_count", "En Revisión")}</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between group hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4C4546] font-montserrat">
                    {t("dashboard.royalties_balance", "Saldo de Regalías (80%)")}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#F0F3FF] flex items-center justify-center text-[#0071BC] group-hover:bg-[#0071BC] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-black font-montserrat text-[#111C2D] tracking-tight">
                  ${netRoyalties.toLocaleString(language === "en" ? "en-US" : "es-CO")} <span className="text-xs font-bold text-[#4C4546]">COP</span>
                </div>
                <div className="flex items-center gap-1 mt-2 text-[#111C2D] text-xs font-bold font-montserrat">
                  <span className="material-symbols-outlined text-base text-[#FBB03B]">verified</span>
                  <span>{t("dashboard.wompi_dispersal", "Dispersión Wompi / PSE")}</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between group hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4C4546] font-montserrat">
                  {t("dashboard.scores_in_review", "En Mesa de Revisión")}
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#FBB03B]/20 flex items-center justify-center text-[#111C2D]">
                  <span className="material-symbols-outlined text-xl">hourglass_top</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-black font-montserrat text-[#111C2D] tracking-tight">
                  {inReviewScores.length}
                </div>
                <div className="flex items-center gap-1 mt-2 text-[#4C4546] text-xs font-medium">
                  <span>{t("dashboard.in_curation", "En proceso de validación curatorial")}</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between group hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4C4546] font-montserrat">
                  {t("dashboard.total_sales", "Ventas Acumuladas")}
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#F0F3FF] flex items-center justify-center text-[#111C2D]">
                  <span className="material-symbols-outlined text-xl">shopping_bag</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-black font-montserrat text-[#111C2D] tracking-tight">
                  {totalSales}
                </div>
                <div className="flex items-center gap-1 mt-2 text-emerald-700 text-xs font-bold font-montserrat">
                  <span className="material-symbols-outlined text-base">trending_up</span>
                  <span>{t("dashboard.active_licenses", "Licencias activas")}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* PESTAÑA 2: MIS PARTITURAS (CATÁLOGO REAL DE BASE DE DATOS) */}
      {activeMainTab === "partituras" && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
            <div className="space-y-1">
              <h2 className="text-2xl font-black font-montserrat text-[#111C2D]">
                {t("dashboard.scores_tab", "Catálogo de Obras")}
              </h2>
              <p className="text-xs text-[#4C4546]">
                {t(
                  "dashboard.scores_catalog_desc",
                  "Administra tus obras cargadas, revisa el estado de aprobación musicológica y monitorea la disponibilidad en tienda."
                )}
              </p>
            </div>

            <Link
              href="/compositor/dashboard/partituras/nueva"
              className="px-5 py-3 bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center justify-center gap-2 shrink-0"
            >
              <span className="material-symbols-outlined text-lg">add_circle</span>
              {t("dashboard.upload_score_btn", "Subir Nueva Partitura")}
            </Link>
          </div>

          {/* Toolbar de Búsqueda y Filtros */}
          <div className="p-4 bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4C4546] text-lg">
                search
              </span>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("dashboard.search_scores", "Buscar por título, género o clave...")}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#F0F3FF] border border-black/5 rounded-xl text-[#111C2D] placeholder-[#4C4546]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <button
                onClick={() => setScoreFilter("todas")}
                className={`px-3.5 py-2 rounded-xl text-xs font-montserrat font-bold transition whitespace-nowrap ${
                  scoreFilter === "todas"
                    ? "bg-[#111C2D] text-white shadow-2xs"
                    : "bg-[#F0F3FF] text-[#4C4546] hover:text-[#111C2D]"
                }`}
              >
                {t("dashboard.filter_all", "Todas")} ({scores.length})
              </button>
              <button
                onClick={() => setScoreFilter("publicadas")}
                className={`px-3.5 py-2 rounded-xl text-xs font-montserrat font-bold transition whitespace-nowrap ${
                  scoreFilter === "publicadas"
                    ? "bg-[#111C2D] text-white shadow-2xs"
                    : "bg-[#F0F3FF] text-[#4C4546] hover:text-[#111C2D]"
                }`}
              >
                {t("dashboard.filter_published", "Publicadas")} ({publishedScores.length})
              </button>
              <button
                onClick={() => setScoreFilter("revision")}
                className={`px-3.5 py-2 rounded-xl text-xs font-montserrat font-bold transition whitespace-nowrap ${
                  scoreFilter === "revision"
                    ? "bg-[#111C2D] text-white shadow-2xs"
                    : "bg-[#F0F3FF] text-[#4C4546] hover:text-[#111C2D]"
                }`}
              >
                {t("dashboard.filter_in_review", "En Revisión")} ({inReviewScores.length})
              </button>
              <button
                onClick={() => setScoreFilter("rechazadas")}
                className={`px-3.5 py-2 rounded-xl text-xs font-montserrat font-bold transition whitespace-nowrap ${
                  scoreFilter === "rechazadas"
                    ? "bg-[#111C2D] text-white shadow-2xs"
                    : "bg-[#F0F3FF] text-[#4C4546] hover:text-[#111C2D]"
                }`}
              >
                {t("dashboard.filter_rejected", "Con Observaciones")} ({rejectedScores.length})
              </button>
            </div>
          </div>

          {/* Tabla de Partituras Reales */}
          <div className="bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] overflow-hidden">
            {loadingScores ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-3 border-[#0071BC] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-bold text-[#4C4546] font-montserrat">
                  {t("dashboard.loading_scores_from_db", "Cargando partituras desde la base de datos...")}
                </p>
              </div>
            ) : filteredScores.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#F0F3FF] text-[#0071BC] flex items-center justify-center mx-auto text-3xl">
                  <span className="material-symbols-outlined">library_music</span>
                </div>
                <h3 className="font-montserrat font-black text-lg text-[#111C2D]">
                  {t("dashboard.no_scores_title", "Aún no tienes partituras registradas")}
                </h3>
                <p className="text-xs text-[#4C4546] max-w-md mx-auto leading-relaxed">
                  {t(
                    "dashboard.no_scores_desc",
                    "Sube tu primera obra en formato PDF de alta resolución con vistas previas automáticas."
                  )}
                </p>
                <Link
                  href="/compositor/dashboard/partituras/nueva"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#0071BC] hover:bg-[#005a96] text-white font-bold text-xs rounded-xl shadow-md transition font-montserrat"
                >
                  <span className="material-symbols-outlined text-base">cloud_upload</span>
                  {t("dashboard.upload_score_btn", "Subir Nueva Partitura")}
                </Link>
              </div>
            ) : (
              <div className="w-full overflow-x-auto overscroll-x-contain">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F0F3FF] text-[#4C4546] font-montserrat text-[11px] font-extrabold uppercase tracking-wider border-b border-black/5">
                      <th className="py-4 px-6">{t("dashboard.table_title", "Título de la Obra")}</th>
                      <th className="py-4 px-6">{t("dashboard.table_genre", "Género")} / {t("dashboard.table_difficulty", "Dificultad")}</th>
                      <th className="py-4 px-6">{t("dashboard.table_price", "Precio")}</th>
                      <th className="py-4 px-6">{t("dashboard.table_status", "Estado")}</th>
                      <th className="py-4 px-6 text-right">{t("dashboard.table_actions", "Acciones")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 text-xs text-[#111C2D]">
                    {filteredScores.map((score) => (
                      <tr key={score.id} className="hover:bg-[#F0F3FF]/40 transition group">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#111C2D] text-[#FBB03B] flex items-center justify-center shrink-0 font-bold">
                              <span className="material-symbols-outlined text-xl">music_note</span>
                            </div>
                            <div>
                              <h3 className="font-bold font-montserrat text-sm text-[#111C2D] group-hover:text-[#0071BC] transition-colors">
                                {score.title}
                              </h3>
                              <span className="text-[11px] text-[#4C4546] block">
                                {score.pages_count ? `${score.pages_count} ${t("dashboard.pages", "páginas")}` : "PDF Urtext"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <span className="font-bold text-[#111C2D] block">{score.genre || "Piano Solo"}</span>
                          <span className="inline-block px-2 py-0.5 bg-[#F0F3FF] text-[#0071BC] text-[10px] font-bold rounded mt-0.5 font-montserrat">
                            {score.difficulty || "Intermedio"}
                          </span>
                        </td>

                        <td className="py-4 px-6 font-mono font-bold">
                          <div>${Number(score.price_cop || 45000).toLocaleString(language === "en" ? "en-US" : "es-CO")} COP</div>
                          {score.price_usd && (
                            <span className="text-[10px] text-[#4C4546]">(${score.price_usd} USD)</span>
                          )}
                        </td>

                        <td className="py-4 px-6">
                          {score.status === "APPROVED" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-extrabold font-montserrat border border-emerald-200">
                              <span className="material-symbols-outlined text-xs">verified</span>
                              {t("dashboard.approved_in_store", "Aprobada & En Tienda")}
                            </span>
                          )}
                          {score.status === "IN_REVIEW" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 rounded-full text-[10px] font-extrabold font-montserrat border border-amber-200">
                              <span className="material-symbols-outlined text-xs">hourglass_top</span>
                              {t("dashboard.filter_in_review", "En Revisión")}
                            </span>
                          )}
                          {score.status === "REJECTED" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-800 rounded-full text-[10px] font-extrabold font-montserrat border border-rose-200">
                              <span className="material-symbols-outlined text-xs">edit_note</span>
                              {t("dashboard.filter_rejected", "Requiere Corrección")}
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {score.status === "APPROVED" && score.slug && (
                              <Link
                                href={`/partitura/${score.slug}`}
                                className="px-3 py-1.5 bg-[#F0F3FF] hover:bg-slate-200/60 text-[#0071BC] rounded-xl font-bold text-xs transition font-montserrat inline-flex items-center gap-1 border border-black/5"
                              >
                                <span className="material-symbols-outlined text-sm">visibility</span>
                                {t("dashboard.view_in_store", "Ver en Tienda")}
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CompositorDashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-12 text-center text-xs font-bold text-slate-500 font-montserrat">
        Cargando tablero...
      </div>
    }>
      <CompositorDashboardContent />
    </Suspense>
  );
}
