"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  getAdminCatalogMetadata,
  updateAdminCatalogMetadata,
  getHeroCms,
  updateHeroCmsAdmin,
  getAdminCmsCategories,
  updateAdminCmsCategories,
  getAdminFeaturedComposers,
  updateAdminFeaturedComposers,
  getAdminFeaturedScores,
  updateAdminFeaturedScores,
  getAdminDownloadSettings,
  updateAdminDownloadSettings,
  getAdminCmsLegalsApi,
  updateAdminCmsLegalsApi,
  updateGeneralCommission,
  CmsLegalSettings,
  DEFAULT_CMS_LEGAL_SETTINGS,
  getCmsWhatsAppApi,
  getAdminCmsWhatsAppApi,
  updateAdminCmsWhatsAppApi,
  CmsWhatsAppSettings,
  DEFAULT_CMS_WHATSAPP_SETTINGS,
} from "@/lib/api-client";

type CmsTabId = "hero" | "featured_score" | "featured_scores_home" | "stats" | "categories" | "featured_composers" | "blog" | "metadata" | "legals" | "whatsapp";

interface CmsTabConfig {
  id: CmsTabId;
  label: string;
  badge?: string;
  icon: string;
  iconColor: string;
  group: "home" | "catalog_legal";
}

const CMS_TABS_CONFIG: CmsTabConfig[] = [
  { id: "hero", label: "Hero: Textos & Botones", icon: "title", iconColor: "text-[#0071BC]", group: "home" },
  { id: "featured_score", label: "Audio Hero (Card Derecha)", badge: "Hero Audio", icon: "music_note", iconColor: "text-[#FBB03B]", group: "home" },
  { id: "featured_scores_home", label: "Partituras Destacadas", badge: "Home (Máx 6)", icon: "library_music", iconColor: "text-[#0071BC]", group: "home" },
  { id: "stats", label: "Estadísticas", badge: "BD", icon: "analytics", iconColor: "text-[#0071BC]", group: "home" },
  { id: "categories", label: "Categorías Principales", badge: "Home", icon: "grid_view", iconColor: "text-[#0071BC]", group: "home" },
  { id: "featured_composers", label: "Compositores Destacados", badge: "Home", icon: "groups", iconColor: "text-[#0071BC]", group: "home" },
  { id: "blog", label: "Bitácora & Blog", badge: "Noticias", icon: "article", iconColor: "text-[#0071BC]", group: "home" },
  { id: "metadata", label: "Géneros & Dificultades", badge: "Catálogo", icon: "tune", iconColor: "text-[#0071BC]", group: "catalog_legal" },
  { id: "legals", label: "Páginas Legales & T&C", icon: "gavel", iconColor: "text-[#C1272D]", group: "catalog_legal" },
  { id: "whatsapp", label: "Soporte WhatsApp (Cliente & Compositor)", badge: "Chat", icon: "chat", iconColor: "text-emerald-600", group: "catalog_legal" },
];

export default function AdminCMSPage() {
  const [activeTab, setActiveTab] = useState<CmsTabId>("hero");
  const [tabGroupFilter, setTabGroupFilter] = useState<"all" | "home" | "catalog_legal">("all");
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollState = () => {
    const el = tabsContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 15);
  };

  useEffect(() => {
    checkScrollState();
    const handleResize = () => checkScrollState();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [tabGroupFilter]);

  const scrollTabs = (direction: "left" | "right") => {
    const el = tabsContainerRef.current;
    if (!el) return;
    const scrollAmount = direction === "left" ? -280 : 280;
    el.scrollBy({ left: scrollAmount, behavior: "smooth" });
    setTimeout(checkScrollState, 300);
  };

  const handleTabWheel = (e: React.WheelEvent) => {
    const el = tabsContainerRef.current;
    if (!el) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY;
      checkScrollState();
    }
  };

  const handleSelectTab = (tabId: CmsTabId) => {
    setActiveTab(tabId);
    setTimeout(() => {
      const activeEl = document.getElementById(`cms-tab-btn-${tabId}`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
      checkScrollState();
    }, 50);
  };

  const handleGroupFilterChange = (filter: "all" | "home" | "catalog_legal") => {
    setTabGroupFilter(filter);
    if (filter === "home" && (activeTab === "metadata" || activeTab === "legals")) {
      handleSelectTab("hero");
    } else if (filter === "catalog_legal" && (activeTab !== "metadata" && activeTab !== "legals")) {
      handleSelectTab("metadata");
    }
  };

  const [isSaved, setIsSaved] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => {
      setFeedback(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [feedback]);

  // Estado del Límite de Descargas por Licencia (CMS)
  const [cmsMaxDownloads, setCmsMaxDownloads] = useState<number>(5);
  const [isSavingCmsDownloads, setIsSavingCmsDownloads] = useState(false);
  const [cmsApplyToExisting, setCmsApplyToExisting] = useState(true);

  useEffect(() => {
    getAdminDownloadSettings()
      .then((res) => {
        if (res && res.maxDownloads) setCmsMaxDownloads(res.maxDownloads);
      })
      .catch(() => {});
  }, []);

  const handleSaveCmsDownloadLimit = async () => {
    setIsSavingCmsDownloads(true);
    try {
      const res = await updateAdminDownloadSettings(cmsMaxDownloads, cmsApplyToExisting);
      setFeedback({
        type: "success",
        message: res.message || `Límite de descargas actualizado a ${cmsMaxDownloads} descargas por licencia en BD.`,
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Error al actualizar límite de descargas.",
      });
    } finally {
      setIsSavingCmsDownloads(false);
    }
  };

  // Estado de Páginas Legales y Textos de Checkboxes (CMS)
  const [cmsLegals, setCmsLegals] = useState<CmsLegalSettings>(DEFAULT_CMS_LEGAL_SETTINGS);
  const [cmsStandardCommission, setCmsStandardCommission] = useState<number>(20);
  const [isUpdatingCommission, setIsUpdatingCommission] = useState(false);
  const [isSavingCmsLegals, setIsSavingCmsLegals] = useState(false);
  const [editingLegalDocId, setEditingLegalDocId] = useState<"composer_terms" | "privacy_policy" | null>(null);
  const [editingLegalLang, setEditingLegalLang] = useState<"es" | "en">("es");

  useEffect(() => {
    getAdminCmsLegalsApi()
      .then((data) => {
        if (data && data.composer_terms) {
          setCmsLegals(data);
          if (data.default_commission_percentage !== undefined) {
            setCmsStandardCommission(data.default_commission_percentage);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveStandardCommission = async () => {
    setIsUpdatingCommission(true);
    setFeedback(null);
    try {
      await updateGeneralCommission(cmsStandardCommission);
      setCmsLegals((prev) => ({
        ...prev,
        default_commission_percentage: cmsStandardCommission,
        author_percentage: 100 - cmsStandardCommission,
      }));
      setFeedback({
        type: "success",
        message: `✅ Porcentaje estándar de plataforma actualizado exitosamente al ${cmsStandardCommission}% (${100 - cmsStandardCommission}% neto autor).`,
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Error al actualizar comisión estándar.",
      });
    } finally {
      setIsUpdatingCommission(false);
    }
  };

  const handleSaveCmsLegals = async () => {
    setIsSavingCmsLegals(true);
    try {
      const payload: CmsLegalSettings = {
        ...cmsLegals,
        default_commission_percentage: cmsStandardCommission,
        author_percentage: 100 - cmsStandardCommission,
      };
      const res = await updateAdminCmsLegalsApi(payload);
      setCmsLegals(res);
      if (res.default_commission_percentage !== undefined) {
        setCmsStandardCommission(res.default_commission_percentage);
      }
      setFeedback({
        type: "success",
        message: "Textos y páginas legales guardados exitosamente en la base de datos.",
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      setEditingLegalDocId(null);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Error al actualizar textos legales.",
      });
    } finally {
      setIsSavingCmsLegals(false);
    }
  };

  // Estado de Canales de WhatsApp (Cliente y Compositor)
  const [cmsWhatsAppData, setCmsWhatsAppData] = useState<CmsWhatsAppSettings>(DEFAULT_CMS_WHATSAPP_SETTINGS);
  const [isSavingWhatsApp, setIsSavingWhatsApp] = useState(false);
  const [editingWhatsAppChannel, setEditingWhatsAppChannel] = useState<"customer_support" | "composer_support">("customer_support");
  const [editingWhatsAppLang, setEditingWhatsAppLang] = useState<"es" | "en">("es");

  useEffect(() => {
    getAdminCmsWhatsAppApi()
      .then((data) => {
        if (data && data.customer_support && data.composer_support) {
          setCmsWhatsAppData(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveCmsWhatsApp = async () => {
    setIsSavingWhatsApp(true);
    setFeedback(null);
    try {
      const res = await updateAdminCmsWhatsAppApi(cmsWhatsAppData);
      setCmsWhatsAppData(res);
      setFeedback({
        type: "success",
        message: "✅ ¡Canales de soporte WhatsApp (Cliente & Compositor) guardados exitosamente en PostgreSQL!",
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Error al actualizar configuración de WhatsApp.",
      });
    } finally {
      setIsSavingWhatsApp(false);
    }
  };

  // Estado del Hero Principal
  const [heroTitle, setHeroTitle] = useState("La tradición del piano colombiano y latinoamericano en tus manos.");
  const [heroSubtitle, setHeroSubtitle] = useState(
    "Un proyecto cultural con enfoque musical riguroso en pro del rescate, edición filológica y difusión de obras patrimoniales y contemporáneas para teclado."
  );
  const [btn1Text, setBtn1Text] = useState("EXPLORAR PARTITURAS");
  const [btn1Url, setBtn1Url] = useState("/tienda");
  const [btn2Text, setBtn2Text] = useState("Conocer Compositores");
  const [btn2Url, setBtn2Url] = useState("/compositores");
  const [footerNotice, setFooterNotice] = useState(
    "Edición revisada con digitaciones de concierto y notas históricas bilingües (ES/EN)."
  );

  // Estado de la Partitura Destacada (Card Hero Derecha)
  const [featuredGenre, setFeaturedGenre] = useState("PASILLO LÍRICO");
  const [featuredTitle, setFeaturedTitle] = useState("Malvaloca");
  const [featuredAuthor, setFeaturedAuthor] = useState("Luis A. Calvo (1882–1945) - Op. 12");
  const [featuredTempo, setFeaturedTempo] = useState("Andante cantabile ♩ = 68");
  const [featuredIsmn, setFeaturedIsmn] = useState("ISMN 979-0-901314-18-2");
  const [featuredAudioSample, setFeaturedAudioSample] = useState("Pasillo No. 1 — L. A. Calvo");
  const [featuredAudioUrl, setFeaturedAudioUrl] = useState("");
  const [featuredBadgeText, setFeaturedBadgeText] = useState("GRABADO URTEXT 100% Alta Resolución");
  const [featuredLinkUrl, setFeaturedLinkUrl] = useState("/partitura/malvaloca");
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);

  // Estado de Tarjetas de Estadísticas Dinámicas de la BD (Strip del Homepage)
  const [statsCards, setStatsCards] = useState<any[]>([
    {
      id: "card_scores",
      mode: "auto",
      auto_value: "4+",
      custom_value: "",
      display_value: "4+",
      title: "Partituras Digitales",
      subtitle: "Editadas bajo rigurosa musicología",
    },
    {
      id: "card_composers",
      mode: "auto",
      auto_value: "4+",
      custom_value: "",
      display_value: "4+",
      title: "Compositores",
      subtitle: "Desde el siglo XIX hasta hoy",
    },
    {
      id: "card_genres",
      mode: "auto",
      auto_value: "6",
      custom_value: "",
      display_value: "6",
      title: "Ritmos Tradicionales",
      subtitle: "Piano Solo, Piano a 4 Manos, Cámara...",
    },
    {
      id: "card_format",
      mode: "custom",
      auto_value: "PDF",
      custom_value: "PDF",
      display_value: "PDF",
      has_bolt: true,
      title: "Descarga Inmediata",
      subtitle: "Con licencia legal autorizada",
    },
  ]);

  const [liveCounts, setLiveCounts] = useState<any>({
    approved_scores: 0,
    total_scores: 0,
    approved_composers: 0,
    total_composers: 0,
    genres_count: 0,
    genres_sample: "",
  });

  const [isSavingStats, setIsSavingStats] = useState(false);

  // Estado de Metadatos Administrables desde la BD PostgreSQL
  const [categories, setCategories] = useState<string[]>([
    "Pasillo", "Bambuco", "Danza", "Guabina", "Vals", "Cumbia", "Porro", "Joropo", "Contradanza", "Estudio", "Piano Solo"
  ]);
  const [difficulties, setDifficulties] = useState<string[]>([
    "Iniciación / Fácil", "Intermedio", "Avanzado", "Virtuoso / Concierto"
  ]);

  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [newDifficultyInput, setNewDifficultyInput] = useState("");
  const [isSavingMetadata, setIsSavingMetadata] = useState(false);
  const [isSavingHero, setIsSavingHero] = useState(false);

  // Helper para generar slugs limpios automáticamente
  const slugifyCategory = (title: string): string => {
    if (!title) return "categoria";
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      || "categoria";
  };

  // ==========================================
  // Estado de Categorías Principales Administrables (BD & Home)
  // ==========================================
  const [cmsCategories, setCmsCategories] = useState<any[]>([
    {
      id: "cat_piano_solo",
      title: "Piano Solo",
      description: "Obras maestras para recital, concurso y profundización técnica individual. Pasillos virtuosos, bambucos de concierto e intermezzos líricos.",
      icon: "piano",
      cta_text: "Explorar piezas solistas",
      link: "/tienda?categoria=Piano Solo",
      is_active: true,
      order: 1,
      count_unit: "Obras",
      count_unit_singular: "Obra",
      count: 3,
      display_count: "3 Obras",
    },
    {
      id: "cat_piano_4_manos",
      title: "Piano a 4 Manos",
      description: "Dúos concertantes y reducciones orquestales a cuatro manos. Ideal para cátedras de música de cámara y recitales colaborativos a dos intérpretes.",
      icon: "group",
      cta_text: "Ver dúos de piano",
      link: "/tienda?categoria=Piano a 4 Manos",
      is_active: true,
      order: 2,
      count_unit: "Obras",
      count_unit_singular: "Obra",
      count: 1,
      display_count: "1 Obra",
    },
    {
      id: "cat_piano_orquesta",
      title: "Piano y Orquesta",
      description: "Partituras de dirección, guiones generales y reducciones a segundo piano de conciertos para piano y orquesta sinfónica colombiana.",
      icon: "stadium",
      cta_text: "Catálogo orquestal",
      link: "/tienda?categoria=Piano y Orquesta",
      is_active: true,
      order: 3,
      count_unit: "Conciertos",
      count_unit_singular: "Concierto",
      count: 0,
      display_count: "0 Conciertos",
    },
    {
      id: "cat_musica_camara",
      title: "Música de Cámara",
      description: "Tríos con violín y violonchelo, sonatas para instrumentos solistas con acompañamiento de piano y ensambles folclóricos de cámara.",
      icon: "diversity_3",
      cta_text: "Explorar cámara",
      link: "/tienda?categoria=Música de Cámara",
      is_active: true,
      order: 4,
      count_unit: "Partituras",
      count_unit_singular: "Partitura",
      count: 0,
      display_count: "0 Partituras",
    },
    {
      id: "cat_piezas_pedagogicas",
      title: "Piezas Pedagógicas",
      description: "Metodologías progresivas, iniciación al teclado y repertorio graduado por niveles (Preparatorio al Nivel 6) con canciones tradicionales colombianas.",
      icon: "school",
      cta_text: "Ver repertorio didáctico",
      link: "/tienda?categoria=Piezas Pedagógicas",
      is_active: true,
      order: 5,
      count_unit: "Cuadernos",
      count_unit_singular: "Cuaderno",
      count: 0,
      display_count: "0 Cuadernos",
    },
    {
      id: "cat_piano_electronica",
      title: "Piano y Electrónica",
      description: "Vanguardia contemporánea, obras para piano preparado con cinta magnética, procesamiento digital en vivo (Max/MSP) y paisajes bio-acústicos.",
      icon: "graphic_eq",
      cta_text: "Explorar vanguardia",
      link: "/tienda?categoria=Piano y Electrónica",
      is_active: true,
      order: 6,
      count_unit: "Obras",
      count_unit_singular: "Obra",
      count: 0,
      display_count: "0 Obras",
    },
  ]);
  const [isSavingCategories, setIsSavingCategories] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCatTitle, setNewCatTitle] = useState("");
  const [newCatDescription, setNewCatDescription] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("piano");
  const [newCatCta, setNewCatCta] = useState("Explorar repertorio");
  const [newCatLink, setNewCatLink] = useState("");
  const [newCatUnit, setNewCatUnit] = useState("Obras");
  const [newCatUnitSingular, setNewCatUnitSingular] = useState("Obra");
  const [newCatIsActive, setNewCatIsActive] = useState(true);
  const [editingIconIdx, setEditingIconIdx] = useState<number | null>(null);

  // Estado de Compositores Destacados del Home
  const [featuredTabs, setFeaturedTabs] = useState<any[]>([
    { id: "historico", name: "Patrimonio Histórico", icon: "piano", composer_ids: [] },
    { id: "contemporaneo", name: "Contemporáneos", icon: "music_note", composer_ids: [] },
    { id: "mujeres", name: "Mujeres Compositoras", icon: "star", composer_ids: [] },
  ]);
  const [activeComposersDirectory, setActiveComposersDirectory] = useState<any[]>([]);
  const [isSavingFeaturedComposers, setIsSavingFeaturedComposers] = useState(false);
  const [editingComposerIconTabId, setEditingComposerIconTabId] = useState<string | null>(null);
  const [selectedComposerToAdd, setSelectedComposerToAdd] = useState<{ [tabId: string]: string }>({});

  // Estado de Partituras Destacadas en el Home (Máx 6)
  const [featuredScoreIds, setFeaturedScoreIds] = useState<string[]>([]);
  const [featuredScoresList, setFeaturedScoresList] = useState<any[]>([]);
  const [availableCatalogScores, setAvailableCatalogScores] = useState<any[]>([]);
  const [isSavingFeaturedScores, setIsSavingFeaturedScores] = useState(false);
  const [selectedScoreToAdd, setSelectedScoreToAdd] = useState("");

  const POPULAR_ICONS = [
    { name: "piano", label: "Piano" },
    { name: "music_note", label: "Partitura" },
    { name: "star", label: "Pionera / Estrella" },
    { name: "waves", label: "Caribe / Litoral" },
    { name: "history_edu", label: "Histórico" },
    { name: "group", label: "Dúo / 4 Manos" },
    { name: "stadium", label: "Orquesta" },
    { name: "diversity_3", label: "Cámara" },
    { name: "school", label: "Pedagógico" },
    { name: "graphic_eq", label: "Electrónica" },
    { name: "library_music", label: "Archivo" },
    { name: "headphones", label: "Audio" },
    { name: "mic", label: "Canto / Voz" },
    { name: "theater_comedy", label: "Teatro" },
    { name: "auto_awesome", label: "Especial" },
    { name: "church", label: "Sacro" },
    { name: "album", label: "Colección" },
    { name: "speed", label: "Virtuoso" },
    { name: "menu_book", label: "Cuaderno" },
  ];

  // Cargar Hero CMS y metadatos reales de la BD
  useEffect(() => {
    async function loadCMSData() {
      try {
        const heroRes = await getHeroCms();
        if (heroRes && heroRes.hero) {
          const h = heroRes.hero;
          if (h.hero_title || h.title_part1) setHeroTitle(h.hero_title || `${h.title_part1} ${h.title_part2_highlight || ""}`);
          if (h.hero_subtitle || h.description) setHeroSubtitle(h.hero_subtitle || h.description);
          if (h.btn1_text || h.button1_text) setBtn1Text(h.btn1_text || h.button1_text);
          if (h.btn1_url || h.button1_url) setBtn1Url(h.btn1_url || h.button1_url);
          if (h.btn2_text || h.button2_text) setBtn2Text(h.btn2_text || h.button2_text);
          if (h.btn2_url || h.button2_url) setBtn2Url(h.btn2_url || h.button2_url);
          if (h.footer_notice || h.urtext_badge_text) setFooterNotice(h.footer_notice || h.urtext_badge_text);

          if (h.featured_genre) setFeaturedGenre(h.featured_genre);
          if (h.featured_title) setFeaturedTitle(h.featured_title);
          if (h.featured_author) setFeaturedAuthor(h.featured_author);
          if (h.featured_tempo) setFeaturedTempo(h.featured_tempo);
          if (h.featured_ismn) setFeaturedIsmn(h.featured_ismn);
          if (h.featured_audio_sample) setFeaturedAudioSample(h.featured_audio_sample);
          if (h.featured_audio_url !== undefined) setFeaturedAudioUrl(h.featured_audio_url || "");
          if (h.featured_badge_text) setFeaturedBadgeText(h.featured_badge_text);
          if (h.featured_link_url) setFeaturedLinkUrl(h.featured_link_url);
        }

        if (heroRes && heroRes.stats) {
          if (heroRes.stats.cards && Array.isArray(heroRes.stats.cards) && heroRes.stats.cards.length > 0) {
            setStatsCards(heroRes.stats.cards);
          }
          if (heroRes.stats.live_counts) {
            setLiveCounts(heroRes.stats.live_counts);
          }
        }

        const res = await getAdminCatalogMetadata();
        if (res.categories && Array.isArray(res.categories)) {
          const normalizedCats = res.categories
            .map((c: any) => (typeof c === "string" ? c : (c.title_es || c.title || c.name || c.id)))
            .filter(Boolean);
          setCategories(normalizedCats);
        }
        if (res.difficulties && Array.isArray(res.difficulties)) {
          const normalizedDiffs = res.difficulties
            .map((d: any) => (typeof d === "string" ? d : (d.title_es || d.title || d.name || d.code || d.id)))
            .filter(Boolean);
          setDifficulties(normalizedDiffs);
        }

        // Cargar categorías principales desde backend
        try {
          const catData = await getAdminCmsCategories();
          if (catData && catData.categories && Array.isArray(catData.categories) && catData.categories.length > 0) {
            setCmsCategories(catData.categories);
          }
        } catch (e: any) {
          console.warn("Fallo cargando categorías de BD:", e.message);
        }

        // Cargar compositores destacados desde backend
        try {
          const compData = await getAdminFeaturedComposers();
          if (compData && compData.tabs && Array.isArray(compData.tabs) && compData.tabs.length > 0) {
            const normalizedTabs = compData.tabs.map((t: any) => ({
              ...t,
              composer_ids: Array.isArray(t.composer_ids)
                ? t.composer_ids
                : (Array.isArray(t.composers) ? t.composers.map((c: any) => c.id) : []),
            }));
            setFeaturedTabs(normalizedTabs);
          }
          if (compData && compData.active_composers_directory && Array.isArray(compData.active_composers_directory)) {
            setActiveComposersDirectory(compData.active_composers_directory);
          }
        } catch (e: any) {
          console.warn("Fallo cargando compositores destacados de BD:", e.message);
        }

        // Cargar partituras destacadas en el Home desde backend
        try {
          const scoresData = await getAdminFeaturedScores();
          if (scoresData) {
            setFeaturedScoreIds(scoresData.featured_score_ids || []);
            setFeaturedScoresList(scoresData.featured_scores || []);
            setAvailableCatalogScores(scoresData.available_scores || []);
          }
        } catch (e: any) {
          console.warn("Fallo cargando partituras destacadas de BD:", e.message);
        }
      } catch (err: any) {
        console.warn("Error cargando metadatos o CMS de BD:", err.message);
      }
    }
    loadCMSData();
  }, []);

  const handleAddFeaturedScore = () => {
    if (!selectedScoreToAdd) return;
    if (featuredScoreIds.length >= 6) {
      setFeedback({ type: "error", message: "Solo puedes seleccionar un máximo de 6 partituras destacadas." });
      return;
    }
    if (featuredScoreIds.includes(selectedScoreToAdd)) {
      setFeedback({ type: "error", message: "Esta partitura ya está agregada a la lista de destacadas." });
      return;
    }
    const scoreObj = availableCatalogScores.find((s) => s.id === selectedScoreToAdd);
    if (!scoreObj) return;

    setFeaturedScoreIds([...featuredScoreIds, selectedScoreToAdd]);
    setFeaturedScoresList([...featuredScoresList, scoreObj]);
    setSelectedScoreToAdd("");
  };

  const handleRemoveFeaturedScore = (idToRemove: string) => {
    setFeaturedScoreIds((prev) => prev.filter((id) => id !== idToRemove));
    setFeaturedScoresList((prev) => prev.filter((s) => s.id !== idToRemove));
  };

  const handleMoveScore = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= featuredScoresList.length) return;

    const updatedIds = [...featuredScoreIds];
    const tempId = updatedIds[index];
    updatedIds[index] = updatedIds[targetIndex];
    updatedIds[targetIndex] = tempId;

    const updatedList = [...featuredScoresList];
    const tempItem = updatedList[index];
    updatedList[index] = updatedList[targetIndex];
    updatedList[targetIndex] = tempItem;

    setFeaturedScoreIds(updatedIds);
    setFeaturedScoresList(updatedList);
  };

  const handleSaveFeaturedScores = async () => {
    setIsSavingFeaturedScores(true);
    setFeedback(null);
    try {
      await updateAdminFeaturedScores(featuredScoreIds);
      setFeedback({
        type: "success",
        message: featuredScoreIds.length === 0
          ? "Configuración guardada: No seleccionaste ninguna partitura, por lo que la sección se ocultará automáticamente en el Home."
          : `¡Excelente! Se han guardado ${featuredScoreIds.length} partituras destacadas para la portada.`
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: `Error al guardar partituras destacadas: ${err.message}`
      });
    } finally {
      setIsSavingFeaturedScores(false);
    }
  };

  const handleAudioFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAudio(true);
    setFeedback(null);
    try {
      const { uploadFileToCloudflareR2 } = await import("@/lib/api-client");
      const res = await uploadFileToCloudflareR2(file, "audio-samples");
      setFeaturedAudioUrl(res.url);
      setFeedback({
        type: "success",
        message: "🎵 ¡Archivo de audio subido exitosamente a Cloudflare R2! Al guardar la configuración se reemplazará y eliminará automáticamente el archivo anterior en la nube.",
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Error al subir el archivo de audio a Cloudflare R2.",
      });
    } finally {
      setIsUploadingAudio(false);
    }
  };

  const handleSaveCMS = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingHero(true);
    setFeedback(null);
    try {
      await updateHeroCmsAdmin({
        hero_title: heroTitle,
        hero_subtitle: heroSubtitle,
        btn1_text: btn1Text,
        btn1_url: btn1Url,
        btn2_text: btn2Text,
        btn2_url: btn2Url,
        footer_notice: footerNotice,
        // Compatibilidad con campos del backend
        title_part1: heroTitle,
        description: heroSubtitle,
        button1_text: btn1Text,
        button1_url: btn1Url,
        button2_text: btn2Text,
        button2_url: btn2Url,
        urtext_badge_text: footerNotice,

        featured_genre: featuredGenre,
        featured_title: featuredTitle,
        featured_author: featuredAuthor,
        featured_tempo: featuredTempo,
        featured_ismn: featuredIsmn,
        featured_audio_sample: featuredAudioSample,
        featured_audio_url: featuredAudioUrl,
        featured_badge_text: featuredBadgeText,
        featured_link_url: featuredLinkUrl,

        stats_cards: statsCards,
      });

      setIsSaved(true);
      setFeedback({
        type: "success",
        message: "✅ ¡Configuración de la Portada, Partitura Destacada y Tarjetas guardada en PostgreSQL!",
      });
      setTimeout(() => setIsSaved(false), 4000);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Error al guardar la información del Hero CMS.",
      });
    } finally {
      setIsSavingHero(false);
    }
  };

  const handleSaveStatsOnly = async () => {
    setIsSavingStats(true);
    setFeedback(null);
    try {
      const res = await updateHeroCmsAdmin({ stats_cards: statsCards });
      if (res && res.stats) {
        if (res.stats.cards) setStatsCards(res.stats.cards);
        if (res.stats.live_counts) setLiveCounts(res.stats.live_counts);
      }
      setFeedback({
        type: "success",
        message: "✅ ¡Tarjetas de estadísticas guardadas exitosamente en la base de datos PostgreSQL!",
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Error al guardar las tarjetas de estadísticas.",
      });
    } finally {
      setIsSavingStats(false);
    }
  };

  // ==========================================
  // Handlers para Categorías Principales Administrables
  // ==========================================
  const handleSaveCategoriesOnly = async () => {
    setIsSavingCategories(true);
    setFeedback(null);
    try {
      const res = await updateAdminCmsCategories(cmsCategories);
      if (res && res.categories) {
        setCmsCategories(res.categories);
      }
      setFeedback({
        type: "success",
        message: "✅ ¡Categorías principales guardadas y sincronizadas con la base de datos PostgreSQL!",
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Error al guardar las categorías principales.",
      });
    } finally {
      setIsSavingCategories(false);
    }
  };

  const handleToggleCategoryActive = (idx: number) => {
    const updated = [...cmsCategories];
    updated[idx].is_active = !updated[idx].is_active;
    setCmsCategories(updated);
  };

  const handleUpdateCategoryField = (idx: number, field: string, val: any) => {
    const updated = [...cmsCategories];
    updated[idx][field] = val;
    // Si cambia el título, regenerar automáticamente el slug y la URL
    if (field === "title") {
      const newSlug = slugifyCategory(val);
      updated[idx].slug = newSlug;
      updated[idx].link = `/tienda?categoria=${newSlug}`;
    }
    setCmsCategories(updated);
  };

  const handleDeleteCategory = (idx: number) => {
    const cat = cmsCategories[idx];
    if (confirm(`¿Seguro que deseas eliminar la categoría "${cat.title}"?`)) {
      const updated = cmsCategories.filter((_, i) => i !== idx);
      setCmsCategories(updated);
    }
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatTitle.trim()) {
      alert("Por favor ingresa un título para la nueva categoría");
      return;
    }

    const title = newCatTitle.trim();
    const slug = slugifyCategory(title);
    const link = `/tienda?categoria=${slug}`;

    const newCategory = {
      id: `cat_${Date.now()}`,
      title,
      slug,
      description: newCatDescription.trim(),
      icon: newCatIcon.trim() || "piano",
      cta_text: newCatCta.trim() || "Explorar repertorio",
      link,
      is_active: newCatIsActive,
      order: cmsCategories.length + 1,
      count_unit: newCatUnit.trim() || "Obras",
      count_unit_singular: newCatUnitSingular.trim() || "Obra",
      count: 0,
      display_count: `0 ${newCatUnit.trim() || "Obras"}`,
    };

    setCmsCategories([...cmsCategories, newCategory]);
    setNewCatTitle("");
    setNewCatDescription("");
    setNewCatIcon("piano");
    setNewCatCta("Explorar repertorio");
    setNewCatLink("");
    setShowAddCategoryModal(false);
    setFeedback({
      type: "success",
      message: `Categoría "${newCategory.title}" creada con slug automático "${slug}". Recuerda hacer clic en "Guardar Categorías en BD".`,
    });
  };


  const handleSaveMetadata = async () => {
    setIsSavingMetadata(true);
    setFeedback(null);
    try {
      await updateAdminCatalogMetadata({ categories, difficulties });
      setFeedback({
        type: "success",
        message: "✅ Categorías y Niveles de Dificultad guardados exitosamente en la base de datos PostgreSQL.",
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Error al guardar metadatos en la base de datos.",
      });
    } finally {
      setIsSavingMetadata(false);
    }
  };

  const handleAddCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    if (categories.includes(trimmed)) return;
    setCategories([...categories, trimmed]);
    setNewCategoryInput("");
  };

  const handleRemoveCategory = (cat: string) => {
    setCategories(categories.filter((c) => c !== cat));
  };

  const handleAddDifficulty = () => {
    const trimmed = newDifficultyInput.trim();
    if (!trimmed) return;
    if (difficulties.includes(trimmed)) return;
    setDifficulties([...difficulties, trimmed]);
    setNewDifficultyInput("");
  };

  const handleRemoveDifficulty = (diff: string) => {
    setDifficulties(difficulties.filter((d) => d !== diff));
  };

  const handleUpdateFeaturedTabName = (tabId: string, newName: string) => {
    setFeaturedTabs((prev) =>
      prev.map((t) => (t.id === tabId ? { ...t, name: newName } : t))
    );
  };

  const handleUpdateFeaturedTabIcon = (tabId: string, newIcon: string) => {
    setFeaturedTabs((prev) =>
      prev.map((t) => (t.id === tabId ? { ...t, icon: newIcon } : t))
    );
  };

  const handleAddComposerToTab = (tabId: string, composerId: string) => {
    if (!composerId) return;
    setFeaturedTabs((prev) =>
      prev.map((t) => {
        if (t.id !== tabId) return t;
        const currentIds = Array.isArray(t.composer_ids) ? t.composer_ids : [];
        if (currentIds.includes(composerId)) return t;
        if (currentIds.length >= 8) {
          alert("Máximo 8 compositores permitidos en esta pestaña.");
          return t;
        }
        return { ...t, composer_ids: [...currentIds, composerId] };
      })
    );
    setSelectedComposerToAdd((prev) => ({ ...prev, [tabId]: "" }));
  };

  const handleRemoveComposerFromTab = (tabId: string, composerId: string) => {
    setFeaturedTabs((prev) =>
      prev.map((t) => {
        if (t.id !== tabId) return t;
        const currentIds = Array.isArray(t.composer_ids) ? t.composer_ids : [];
        return {
          ...t,
          composer_ids: currentIds.filter((id: string) => id !== composerId),
        };
      })
    );
  };

  const handleSaveFeaturedComposers = async () => {
    setIsSavingFeaturedComposers(true);
    setFeedback(null);
    try {
      const res = await updateAdminFeaturedComposers(featuredTabs);
      if (res && res.tabs) {
        setFeaturedTabs(res.tabs);
      }
      setFeedback({
        type: "success",
        message: "✅ Pestañas y compositores destacados actualizados y persistidos en PostgreSQL.",
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Error al guardar compositores destacados.",
      });
    } finally {
      setIsSavingFeaturedComposers(false);
    }
  };

  return (
    <div className="space-y-8 text-[#111C2D]">
      
      {/* Header Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F3FF] border border-[#0071BC]/10 text-[#0071BC] text-[11px] font-extrabold uppercase tracking-wider mb-2 font-montserrat">
            <span className="material-symbols-outlined text-xs">web</span>
            Gestor CMS • Contenido Administrable de la Homepage
          </div>
          <h1 className="text-3xl font-black font-montserrat text-[#111C2D] tracking-tight">
            Gestión de Portada & Hero Principal
          </h1>
          <p className="text-xs md:text-sm text-[#4C4546] font-medium max-w-2xl leading-relaxed">
            Administre los textos principales, botones de navegación, avisos de garantía y la partitura destacada visible en la cabecera de la tienda.
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          className="px-4 py-2.5 bg-[#F0F3FF] hover:bg-slate-200/60 text-[#111C2D] font-bold text-xs rounded-xl transition font-montserrat flex items-center justify-center gap-2 border border-black/5 shrink-0"
        >
          <span className="material-symbols-outlined text-base text-[#0071BC]">open_in_new</span>
          <span>Ver Homepage Pública</span>
        </Link>
      </div>

      {/* Feedback Pop-up Flotante (Toast Modal en Primer Plano) */}
      {feedback && (
        <div className="fixed top-6 right-6 z-[9999] max-w-md w-[calc(100vw-3rem)] animate-in fade-in slide-in-from-top-4 duration-300 font-montserrat shadow-2xl">
          <div
            className={`p-4 rounded-2xl flex items-start gap-3.5 border shadow-2xl backdrop-blur-md transition-all ${
              feedback.type === "success"
                ? "bg-[#064E3B] border-emerald-400 text-white"
                : "bg-[#7F1D1D] border-rose-400 text-white"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
                feedback.type === "success"
                  ? "bg-emerald-400/20 text-emerald-300"
                  : "bg-rose-400/20 text-rose-300"
              }`}
            >
              <span className="material-symbols-outlined text-2xl">
                {feedback.type === "success" ? "check_circle" : "error"}
              </span>
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <h4 className="text-xs font-black uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span>{feedback.type === "success" ? "Operación Exitosa" : "Aviso del Sistema"}</span>
              </h4>
              <p className="text-xs text-white/95 leading-relaxed font-medium">
                {feedback.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-white/60 hover:text-white transition p-1.5 hover:bg-white/10 rounded-xl shrink-0 cursor-pointer"
              title="Cerrar notificación"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Barra de Navegación y Filtros de Pestañas CMS */}
      <div className="space-y-3 font-montserrat">
        
        {/* Fila 1: Filtros de Grupo + Selector Rápido */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-black/5 shadow-2xs">
          
          {/* Filtros por Grupo (Píldoras) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
              Filtrar:
            </span>
            <button
              type="button"
              onClick={() => handleGroupFilterChange("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                tabGroupFilter === "all"
                  ? "bg-[#111C2D] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>Todos</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${tabGroupFilter === "all" ? "bg-white/20 text-white" : "bg-black/5 text-slate-500"}`}>
                {CMS_TABS_CONFIG.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleGroupFilterChange("home")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                tabGroupFilter === "home"
                  ? "bg-[#0071BC] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span className="material-symbols-outlined text-sm">home</span>
              <span>Portada (Home)</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${tabGroupFilter === "home" ? "bg-white/20 text-white" : "bg-black/5 text-slate-500"}`}>
                {CMS_TABS_CONFIG.filter((t) => t.group === "home").length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleGroupFilterChange("catalog_legal")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                tabGroupFilter === "catalog_legal"
                  ? "bg-[#111C2D] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span className="material-symbols-outlined text-sm">tune</span>
              <span>Catálogo & Legal</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${tabGroupFilter === "catalog_legal" ? "bg-white/20 text-white" : "bg-black/5 text-slate-500"}`}>
                {CMS_TABS_CONFIG.filter((t) => t.group === "catalog_legal").length}
              </span>
            </button>
          </div>

          {/* Selector desplegable directo (Salto Rápido) */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label htmlFor="cms-quick-jump" className="text-[11px] font-bold text-slate-400 whitespace-nowrap">
              Ir directo a:
            </label>
            <div className="relative w-full sm:w-60">
              <select
                id="cms-quick-jump"
                value={activeTab}
                onChange={(e) => handleSelectTab(e.target.value as CmsTabId)}
                className="w-full pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#111C2D] focus:ring-2 focus:ring-[#0071BC] focus:bg-white transition cursor-pointer appearance-none"
              >
                <optgroup label="Portada (Home)">
                  {CMS_TABS_CONFIG.filter((t) => t.group === "home").map((tab) => (
                    <option key={tab.id} value={tab.id}>
                      {tab.label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Catálogo & Legal">
                  {CMS_TABS_CONFIG.filter((t) => t.group === "catalog_legal").map((tab) => (
                    <option key={tab.id} value={tab.id}>
                      {tab.label}
                    </option>
                  ))}
                </optgroup>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-base">
                unfold_more
              </span>
            </div>
          </div>
        </div>

        {/* Fila 2: Carrusel de Pestañas con Flechas de Scroll y Controles Suaves */}
        <div className="relative flex items-center gap-1.5 bg-slate-100/60 p-1.5 rounded-2xl border border-black/5">
          
          {/* Botón Scroll Izquierda */}
          <button
            type="button"
            onClick={() => scrollTabs("left")}
            disabled={!canScrollLeft}
            title="Desplazar a la izquierda"
            className={`shrink-0 w-8 h-10 flex items-center justify-center rounded-xl bg-white border border-black/5 shadow-2xs transition ${
              canScrollLeft
                ? "text-[#111C2D] hover:bg-[#FBB03B] hover:text-[#111C2D] cursor-pointer"
                : "text-slate-300 cursor-not-allowed opacity-40"
            }`}
          >
            <span className="material-symbols-outlined text-lg">chevron_left</span>
          </button>

          {/* Contenedor de Pestañas con Scroll */}
          <div
            ref={tabsContainerRef}
            onScroll={checkScrollState}
            onWheel={handleTabWheel}
            className="flex items-center gap-2 overflow-x-auto scroll-smooth py-1 px-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent overscroll-x-contain w-full"
            style={{ scrollbarWidth: "thin" }}
          >
            {CMS_TABS_CONFIG.filter(
              (tab) => tabGroupFilter === "all" || tab.group === tabGroupFilter
            ).map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`cms-tab-btn-${tab.id}`}
                  type="button"
                  onClick={() => handleSelectTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-xl transition-all whitespace-nowrap cursor-pointer shrink-0 border ${
                    isActive
                      ? "bg-white text-[#111C2D] border-[#FBB03B] shadow-sm ring-2 ring-[#FBB03B]/20 font-black"
                      : "bg-white/50 text-slate-600 border-transparent hover:bg-white hover:text-[#111C2D]"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-base ${
                      isActive ? tab.iconColor : "text-slate-400"
                    }`}
                  >
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-md uppercase tracking-wider font-extrabold ${
                        isActive
                          ? "bg-[#FBB03B]/20 text-[#B87D00]"
                          : "bg-black/5 text-slate-500"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Botón Scroll Derecha */}
          <button
            type="button"
            onClick={() => scrollTabs("right")}
            disabled={!canScrollRight}
            title="Desplazar a la derecha"
            className={`shrink-0 w-8 h-10 flex items-center justify-center rounded-xl bg-white border border-black/5 shadow-2xs transition ${
              canScrollRight
                ? "text-[#111C2D] hover:bg-[#FBB03B] hover:text-[#111C2D] cursor-pointer"
                : "text-slate-300 cursor-not-allowed opacity-40"
            }`}
          >
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Formulario Principal CMS */}
      <form onSubmit={handleSaveCMS} className="space-y-8">
        
        {/* ==========================================
               TAB 1: HERO TEXTOS Y BOTONES
               ========================================== */}
        {activeTab === "hero" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Formulario Izquierda (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-5">
                <h2 className="text-base font-bold font-montserrat text-[#111C2D] border-b border-black/5 pb-3">
                  1. Titular Principal & Mensaje del Hero
                </h2>

                <div>
                  <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
                    Texto Principal (Encabezado H1) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    className="w-full p-3.5 bg-[#F0F3FF] border border-black/5 rounded-xl text-xs text-[#111C2D] font-black font-montserrat focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                  />
                  <p className="text-[11px] text-[#4C4546] mt-1">Sugerido: Mantener bajo 80 caracteres para óptimo impacto visual.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
                    Texto Secundario (Bajada / Descripción Cultural) *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    className="w-full p-3.5 bg-[#F0F3FF] border border-black/5 rounded-xl text-xs text-[#111C2D] leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                  />
                </div>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-5">
                <h2 className="text-base font-bold font-montserrat text-[#111C2D] border-b border-black/5 pb-3">
                  2. Botones de Llamada a la Acción (CTA Buttons)
                </h2>

                {/* Botón 1 Principal */}
                <div className="p-4 bg-[#F0F3FF]/70 rounded-xl border border-black/5 space-y-3">
                  <span className="text-xs font-extrabold text-[#0071BC] uppercase tracking-wider block font-montserrat">
                    Botón 1 (Principal Amarillo Gold)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#111C2D] mb-1">Texto del Botón 1 *</label>
                      <input
                        type="text"
                        required
                        value={btn1Text}
                        onChange={(e) => setBtn1Text(e.target.value)}
                        className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-xs text-[#111C2D] font-bold font-montserrat"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#111C2D] mb-1">URL / Enlace Destino *</label>
                      <input
                        type="text"
                        required
                        value={btn1Url}
                        onChange={(e) => setBtn1Url(e.target.value)}
                        className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-xs font-mono text-[#0071BC]"
                      />
                    </div>
                  </div>
                </div>

                {/* Botón 2 Secundario */}
                <div className="p-4 bg-[#F0F3FF]/70 rounded-xl border border-black/5 space-y-3">
                  <span className="text-xs font-extrabold text-[#4C4546] uppercase tracking-wider block font-montserrat">
                    Botón 2 (Secundario Blanco)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#111C2D] mb-1">Texto del Botón 2 *</label>
                      <input
                        type="text"
                        required
                        value={btn2Text}
                        onChange={(e) => setBtn2Text(e.target.value)}
                        className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-xs text-[#111C2D] font-bold font-montserrat"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#111C2D] mb-1">URL / Enlace Destino *</label>
                      <input
                        type="text"
                        required
                        value={btn2Url}
                        onChange={(e) => setBtn2Url(e.target.value)}
                        className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-xs font-mono text-[#0071BC]"
                      />
                    </div>
                  </div>
                </div>

                {/* Aviso Inferior de Garantía */}
                <div>
                  <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
                    Aviso / Badge de Garantía en Pie de Hero
                  </label>
                  <input
                    type="text"
                    value={footerNotice}
                    onChange={(e) => setFooterNotice(e.target.value)}
                    className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs text-[#111C2D]"
                  />
                </div>

              </div>

            </div>

            {/* Previsualización en Vivo Derecha (5 Cols) */}
            <div className="lg:col-span-5">
              <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-4 sticky top-24">
                <span className="text-[10px] font-extrabold text-[#0071BC] uppercase tracking-wider block font-montserrat border-b border-black/5 pb-2">
                  👁️ Previsualización en Vivo de la Portada
                </span>

                <div className="p-5 bg-[#F9F9FF] rounded-2xl border border-black/5 space-y-4">
                  <h3 className="text-xl font-black font-montserrat text-[#111C2D] leading-tight">
                    {heroTitle}
                  </h3>
                  <p className="text-xs text-[#4C4546] leading-relaxed">
                    {heroSubtitle}
                  </p>

                  <div className="flex flex-wrap gap-2.5 pt-2">
                    <button type="button" className="px-4 py-2.5 bg-[#FBB03B] text-[#111C2D] font-extrabold text-[11px] uppercase tracking-wider rounded-xl font-montserrat shadow-2xs">
                      {btn1Text} →
                    </button>
                    <button type="button" className="px-4 py-2.5 bg-white border border-black/10 text-[#111C2D] font-bold text-[11px] rounded-xl font-montserrat">
                      📖 {btn2Text}
                    </button>
                  </div>

                  <div className="pt-3 border-t border-black/5 text-[10px] text-[#4C4546] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-xs text-[#0071BC]">verified</span>
                    <span>{footerNotice}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingHero}
                  className="w-full py-3.5 bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingHero ? (
                    <>
                      <span className="w-4 h-4 border-2 border-[#111C2D] border-t-transparent rounded-full animate-spin"></span>
                      <span>Guardando Cambios en BD...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">save</span>
                      <span>Guardar & Publicar Cambios del Hero</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ==========================================
               TAB 2: PARTITURA DESTACADA (CARD HERO DERECHA)
               ========================================== */}
        {activeTab === "featured_score" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Campos de la Partitura Destacada */}
            <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-5">
              <h2 className="text-base font-bold font-montserrat text-[#111C2D] border-b border-black/5 pb-3">
                Configuración de la Partitura Destacada (Card Hero Derecha)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">Género / Etiqueta Superior *</label>
                  <input
                    type="text"
                    required
                    value={featuredGenre}
                    onChange={(e) => setFeaturedGenre(e.target.value)}
                    placeholder="Ej: PASILLO LÍRICO"
                    className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs text-[#111C2D] font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">Código ISMN *</label>
                  <input
                    type="text"
                    required
                    value={featuredIsmn}
                    onChange={(e) => setFeaturedIsmn(e.target.value)}
                    placeholder="ISMN 979-0-901314-18-2"
                    className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs font-mono text-[#0071BC]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">Título de la Obra Destacada *</label>
                <input
                  type="text"
                  required
                  value={featuredTitle}
                  onChange={(e) => setFeaturedTitle(e.target.value)}
                  placeholder="Ej: Malvaloca"
                  className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs text-[#111C2D] font-black font-montserrat"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">Autor & Opus *</label>
                  <input
                    type="text"
                    required
                    value={featuredAuthor}
                    onChange={(e) => setFeaturedAuthor(e.target.value)}
                    placeholder="Luis A. Calvo (1882–1945) - Op. 12"
                    className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs text-[#111C2D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">Tempo / Indicación *</label>
                  <input
                    type="text"
                    required
                    value={featuredTempo}
                    onChange={(e) => setFeaturedTempo(e.target.value)}
                    placeholder="Andante cantabile ♩ = 68"
                    className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs text-[#111C2D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">Etiqueta de Muestra de Audio *</label>
                  <input
                    type="text"
                    required
                    value={featuredAudioSample}
                    onChange={(e) => setFeaturedAudioSample(e.target.value)}
                    placeholder="Pasillo No. 1 — L. A. Calvo"
                    className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs text-[#111C2D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">Badge de Calidad Editorial *</label>
                  <input
                    type="text"
                    required
                    value={featuredBadgeText}
                    onChange={(e) => setFeaturedBadgeText(e.target.value)}
                    placeholder="GRABADO URTEXT 100% Alta Resolución"
                    className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs text-[#111C2D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
                  Enlace o Archivo de Audio Muestra *
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={featuredAudioUrl}
                      onChange={(e) => setFeaturedAudioUrl(e.target.value)}
                      placeholder="https://... o sube un mp3 a Cloudflare R2"
                      className="flex-1 bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs text-[#111C2D] font-mono"
                    />

                    <label className="px-4 py-2.5 bg-[#0071BC] hover:bg-[#005a96] text-white text-xs font-bold font-montserrat rounded-xl cursor-pointer flex items-center gap-1.5 shrink-0 transition shadow-xs">
                      <span className="material-symbols-outlined text-base">upload_file</span>
                      <span>{isUploadingAudio ? "Subiendo R2..." : "Subir MP3"}</span>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioFileUpload}
                        disabled={isUploadingAudio}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-[11px] text-[#4C4546]">
                    💡 Puedes escribir la URL directa de un audio (MP3/WAV) o hacer clic en <strong>"Subir MP3"</strong> para almacenarlo en Cloudflare R2. Al reemplazar un archivo subido previamente, el sistema eliminará automáticamente el archivo antiguo en la nube para no acumular basura.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">URL / Enlace Ver Partitura *</label>
                <input
                  type="text"
                  required
                  value={featuredLinkUrl}
                  onChange={(e) => setFeaturedLinkUrl(e.target.value)}
                  placeholder="/partitura/malvaloca"
                  className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs font-mono text-[#0071BC]"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingHero}
                className="w-full py-3.5 bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
              >
                {isSavingHero ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#111C2D] border-t-transparent rounded-full animate-spin"></span>
                    <span>Guardando en Base de Datos...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">save</span>
                    <span>Guardar Partitura Destacada</span>
                  </>
                )}
              </button>
            </div>

            {/* Card Preview Derecha */}
            <div className="lg:col-span-5">
              <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-4 sticky top-24">
                <span className="text-[10px] font-extrabold text-[#0071BC] uppercase tracking-wider block font-montserrat border-b border-black/5 pb-2">
                  🎼 Previsualización Card Hero Partitura
                </span>

                <div className="bg-white p-6 rounded-3xl border border-black/10 shadow-lg space-y-4 relative overflow-hidden">
                  <div className="flex justify-between items-center text-[10px] font-mono text-[#4C4546]">
                    <div className="flex gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block"></span>
                    </div>
                    <span className="font-bold text-[#0071BC]">{featuredIsmn}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0071BC] font-montserrat block">
                      {featuredGenre}
                    </span>
                    <h4 className="text-xl font-black font-montserrat text-[#111C2D]">{featuredTitle}</h4>
                    <p className="text-xs text-[#4C4546]">{featuredAuthor}</p>
                  </div>

                  {/* Pentagrama Mock */}
                  <div className="p-3 bg-[#F0F3FF]/70 rounded-xl border border-black/5 text-center font-mono text-xs text-[#0071BC]">
                    🎼 [ Muestra de Pentagrama Urtext ]
                  </div>

                  {/* Audio Player */}
                  <div className="p-3 bg-[#F0F3FF] rounded-xl space-y-2 border border-black/5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="material-symbols-outlined text-[#0071BC]">graphic_eq</span>
                        <span className="font-bold text-[#111C2D] text-[11px] truncate">{featuredAudioSample}</span>
                      </div>
                    </div>

                    {featuredAudioUrl ? (
                      <audio
                        controls
                        key={featuredAudioUrl}
                        src={featuredAudioUrl}
                        crossOrigin="anonymous"
                        preload="metadata"
                        className="w-full h-8"
                      />
                    ) : (
                      <div className="p-2 bg-white rounded-lg text-center text-[11px] text-slate-400 font-mono">
                        (Sin audio cargado · añade un enlace o sube un archivo MP3)
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex justify-between items-center text-xs border-t border-black/5">
                    <span className="px-2.5 py-1 bg-[#FBB03B]/20 text-[#111C2D] font-extrabold rounded-md text-[10px]">
                      {featuredBadgeText}
                    </span>
                    <Link href={featuredLinkUrl} className="font-bold text-[#0071BC] flex items-center gap-1 font-montserrat hover:underline">
                      Ver Partitura <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>


          </div>
        )}

        {/* ==========================================
               TAB 3: METADATOS DEL CATÁLOGO (CATEGORÍAS & DIFICULTADES BD)
               ========================================== */}
        {activeTab === "metadata" && (
          <div className="space-y-8">
            {/* Feedback Banner */}
            {feedback && (
              <div
                className={`p-4 rounded-2xl flex items-center justify-between text-xs font-medium ${
                  feedback.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
                    : "bg-rose-50 border border-rose-200 text-rose-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base shrink-0">
                    {feedback.type === "success" ? "check_circle" : "error"}
                  </span>
                  <span>{feedback.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFeedback(null)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            )}

            {/* SECCIÓN 1: CATEGORÍAS PIANÍSTICAS */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5 pb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold font-montserrat text-[#111C2D]">
                    1. Categorías Musicales / Géneros del Catálogo
                  </h2>
                  <p className="text-xs text-[#4C4546] mt-0.5">
                    Estas categorías se listan en los filtros de la tienda pública y en el formulario de subida de partituras de los compositores.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#0071BC] bg-[#F0F3FF] px-3 py-1 rounded-full border border-black/5 font-mono shrink-0">
                  {categories.length} categorías activas
                </span>
              </div>

              {/* Formulario Añadir Categoría */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCategory();
                    }
                  }}
                  placeholder="Ej: Pasillo, Bambuco, Danza, Estudio de Concierto..."
                  className="flex-1 bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-4 py-2.5 bg-[#0071BC] hover:bg-[#005a96] text-white font-bold text-xs rounded-xl transition font-montserrat flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  <span>Añadir Categoría</span>
                </button>
              </div>

              {/* Lista de Categorías Actuales */}
              <div className="flex flex-wrap gap-2.5 pt-2">
                {categories.map((cat: any, idx) => {
                  const label = typeof cat === "string" ? cat : (cat.title_es || cat.title || cat.name || String(cat));
                  return (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#F0F3FF] border border-black/5 rounded-xl text-xs font-bold text-[#111C2D] shadow-2xs font-montserrat"
                    >
                      <span>{label}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(cat)}
                        className="text-slate-400 hover:text-red-600 transition"
                        title="Eliminar categoría"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECCIÓN 2: NIVELES DE DIFICULTAD */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5 pb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold font-montserrat text-[#111C2D]">
                    2. Niveles de Dificultad Técnicos
                  </h2>
                  <p className="text-xs text-[#4C4546] mt-0.5">
                    Niveles pedagógicos y concertísticos configurados en la base de datos (se despliegan dinámicamente en el formulario del compositor).
                  </p>
                </div>
                <span className="text-xs font-bold text-[#0071BC] bg-[#F0F3FF] px-3 py-1 rounded-full border border-black/5 font-mono shrink-0">
                  {difficulties.length} niveles activos
                </span>
              </div>

              {/* Formulario Añadir Nivel */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newDifficultyInput}
                  onChange={(e) => setNewDifficultyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddDifficulty();
                    }
                  }}
                  placeholder="Ej: Principiante, Intermedio, Avanzado, Virtuoso..."
                  className="flex-1 bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                />
                <button
                  type="button"
                  onClick={handleAddDifficulty}
                  className="px-4 py-2.5 bg-[#0071BC] hover:bg-[#005a96] text-white font-bold text-xs rounded-xl transition font-montserrat flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  <span>Añadir Nivel</span>
                </button>
              </div>

              {/* Lista de Niveles de Dificultad Actuales */}
              <div className="flex flex-wrap gap-2.5 pt-2">
                {difficulties.map((diff: any, idx) => {
                  const label = typeof diff === "string" ? diff : (diff.title_es || diff.title || diff.name || diff.code || String(diff));
                  return (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-2 px-3.5 py-2 bg-amber-50 border border-amber-200/70 rounded-xl text-xs font-bold text-amber-950 shadow-2xs font-montserrat"
                    >
                      <span>{label}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDifficulty(diff)}
                        className="text-amber-500 hover:text-red-600 transition"
                        title="Eliminar nivel"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BARRA DE ACCIÓN DE GUARDADO EN BD */}
            <div className="bg-[#111C2D] text-white p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div>
                <span className="text-xs font-bold text-[#FBB03B] font-montserrat block uppercase tracking-wider">
                  Sincronización con PostgreSQL
                </span>
                <p className="text-xs text-slate-300 mt-0.5">
                  Los cambios se almacenan en la tabla <code>platform_settings</code> y se reflejan al instante en la tienda y el panel del compositor.
                </p>
              </div>

              <button
                type="button"
                disabled={isSavingMetadata}
                onClick={handleSaveMetadata}
                className="w-full sm:w-auto px-6 py-3 bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isSavingMetadata ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#111C2D] border-t-transparent rounded-full animate-spin"></span>
                    <span>Guardando en BD...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">save</span>
                    <span>Guardar Metadatos en Base de Datos</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ==========================================
               TAB: PARTITURAS DESTACADAS (PORTADA HOME - MÁX 6)
               ========================================== */}
        {activeTab === "featured_scores_home" && (
          <div className="space-y-8 font-montserrat">
            
            {/* Banner Informativo y Regla de Negocio */}
            <div className="p-6 bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-white border border-[#FBB03B]/30 rounded-3xl shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FBB03B] text-[#111C2D] flex items-center justify-center shadow-md shrink-0">
                    <span className="material-symbols-outlined text-2xl">library_music</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-[#111C2D]">
                      Gestor de Partituras Destacadas en Portada
                    </h2>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Selecciona hasta un máximo de 6 partituras aprobadas para exhibir en el Home. Puedes reordenarlas o cambiarlas en cualquier momento.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Cupos Utilizados</span>
                    <span className="text-xl font-black text-[#111C2D]">
                      {featuredScoreIds.length} <span className="text-slate-400 text-sm font-semibold">/ 6</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Indicador de regla de sección oculta */}
              <div className={`p-3.5 rounded-2xl border flex items-center gap-3 text-xs ${
                featuredScoreIds.length === 0
                  ? "bg-rose-50 border-rose-200 text-rose-800"
                  : "bg-emerald-50 border-emerald-200 text-emerald-800"
              }`}>
                <span className="material-symbols-outlined text-lg shrink-0">
                  {featuredScoreIds.length === 0 ? "visibility_off" : "visibility"}
                </span>
                <div>
                  {featuredScoreIds.length === 0 ? (
                    <span>
                      <strong>Sección Oculta en el Home:</strong> Al no tener ninguna partitura seleccionada (0/6), la sección <em>&ldquo;Partituras Destacadas&rdquo;</em> <strong>no se mostrará a los visitantes</strong> en la página de inicio.
                    </span>
                  ) : (
                    <span>
                      <strong>Sección Activa en el Home:</strong> Se mostrarán <strong>{featuredScoreIds.length}</strong> partituras en la cuadrícula de la portada en el orden indicado abajo.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Selector para Agregar Partitura */}
            <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#111C2D] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0071BC] text-lg">add_circle</span>
                Agregar Partitura del Catálogo Aprobado
              </h3>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <select
                    value={selectedScoreToAdd}
                    onChange={(e) => setSelectedScoreToAdd(e.target.value)}
                    disabled={featuredScoreIds.length >= 6}
                    className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#111C2D] focus:ring-2 focus:ring-[#0071BC] focus:bg-white transition cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {featuredScoreIds.length >= 6
                        ? "Límite máximo alcanzado (6/6 partituras)"
                        : "-- Selecciona una obra para agregar --"}
                    </option>
                    {availableCatalogScores
                      .filter((s) => !featuredScoreIds.includes(s.id))
                      .map((score) => (
                        <option key={score.id} value={score.id}>
                          {score.title} — {score.composer_name} ({score.genre || "PIANO SOLO"} · ${Number(score.price_cop || 0).toLocaleString('es-CO')} COP)
                        </option>
                      ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">
                    arrow_drop_down
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAddFeaturedScore}
                  disabled={!selectedScoreToAdd || featuredScoreIds.length >= 6}
                  className="px-6 py-3 rounded-xl bg-[#0071BC] hover:bg-[#005a96] text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  <span>Agregar a Destacadas</span>
                </button>
              </div>

              {availableCatalogScores.length === 0 && (
                <p className="text-xs text-slate-400 italic">
                  No hay partituras aprobadas disponibles en el catálogo en este momento.
                </p>
              )}
            </div>

            {/* Lista Ordenada de Partituras Seleccionadas */}
            <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-black/5 pb-3">
                <h3 className="text-sm font-bold text-[#111C2D] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#FBB03B] text-lg">format_list_numbered</span>
                  Partituras Seleccionadas ({featuredScoresList.length} / 6)
                </h3>
                {featuredScoresList.length > 0 && (
                  <span className="text-[11px] font-medium text-slate-400">
                    El orden de esta lista corresponde al orden en el Home
                  </span>
                )}
              </div>

              {featuredScoresList.length === 0 ? (
                <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">music_off</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">No hay partituras destacadas seleccionadas</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      Utiliza el selector de arriba para elegir hasta 6 obras. Si guardas con la lista vacía, la sección de partituras se ocultará en el Home.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {featuredScoresList.map((score, index) => (
                    <div
                      key={score.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#0071BC]/40 shadow-2xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        {/* Número de posición */}
                        <div className="w-8 h-8 rounded-lg bg-[#111C2D] text-white flex items-center justify-center text-xs font-black shrink-0">
                          #{index + 1}
                        </div>

                        {/* Icono */}
                        <div className="w-10 h-10 rounded-xl bg-[#F0F3FF] text-[#0071BC] flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-xl">music_note</span>
                        </div>

                        {/* Información de la obra */}
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-black text-[#111C2D]">{score.title}</h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {score.genre || "PIANO SOLO"}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                              {score.difficulty || "INTERMEDIO"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {score.composer_name || score.composer?.name || "Compositor"} ·{" "}
                            <span className="font-semibold text-slate-700">
                              ${Number(score.price_cop || 0).toLocaleString('es-CO')} COP (~${score.price_usd || 0} USD)
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Controles de orden y eliminación */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                        {/* Subir */}
                        <button
                          type="button"
                          onClick={() => handleMoveScore(index, "up")}
                          disabled={index === 0}
                          title="Mover arriba"
                          className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
                        >
                          <span className="material-symbols-outlined text-base">arrow_upward</span>
                        </button>

                        {/* Bajar */}
                        <button
                          type="button"
                          onClick={() => handleMoveScore(index, "down")}
                          disabled={index === featuredScoresList.length - 1}
                          title="Mover abajo"
                          className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
                        >
                          <span className="material-symbols-outlined text-base">arrow_downward</span>
                        </button>

                        {/* Quitar */}
                        <button
                          type="button"
                          onClick={() => handleRemoveFeaturedScore(score.id)}
                          title="Quitar de destacadas"
                          className="w-8 h-8 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center justify-center cursor-pointer transition ml-1"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Botón de Guardado Persistente */}
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleSaveFeaturedScores}
                disabled={isSavingFeaturedScores}
                className="px-8 py-3.5 rounded-xl bg-[#111C2D] hover:bg-[#FBB03B] hover:text-[#111C2D] text-white text-xs font-black transition-all shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSavingFeaturedScores ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-base">refresh</span>
                    <span>Guardando en Base de Datos...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">save</span>
                    <span>Guardar Partituras Destacadas</span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}

        {/* ==========================================
               TAB STATS: TARJETAS DE MÉTRICAS (HOMEPAGE BD)
               ========================================== */}
        {activeTab === "stats" && (
          <div className="space-y-8">
            {/* Banner Informativo con Conteos Reales en Vivo de PostgreSQL */}
            <div className="p-6 bg-gradient-to-br from-blue-50 via-[#F0F3FF] to-indigo-50/40 border border-[#0071BC]/20 rounded-3xl shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#0071BC] text-white flex items-center justify-center shadow-md shrink-0">
                    <span className="material-symbols-outlined text-2xl">database</span>
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black font-montserrat text-[#111C2D]">
                      Métricas en Vivo de la Base de Datos PostgreSQL
                    </h2>
                    <p className="text-xs text-[#4C4546] font-medium">
                      Conectado en tiempo real a las tablas <code>score</code>, <code>composer</code> y <code>platform_settings</code>.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-extrabold rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Sincronización en Vivo
                  </span>
                </div>
              </div>

              {/* Grid de Conteos Reales de la BD */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-black/5 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-[#0071BC] tracking-wider block font-montserrat">
                    Partituras en BD
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black font-montserrat text-[#111C2D]">{liveCounts.approved_scores}</span>
                    <span className="text-xs font-semibold text-slate-500">aprobadas ({liveCounts.total_scores} totales)</span>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-black/5 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-[#0071BC] tracking-wider block font-montserrat">
                    Compositores en BD
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black font-montserrat text-[#111C2D]">{liveCounts.approved_composers}</span>
                    <span className="text-xs font-semibold text-slate-500">aprobados ({liveCounts.total_composers} totales)</span>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-black/5 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-[#0071BC] tracking-wider block font-montserrat">
                    Ritmos / Categorías en BD
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black font-montserrat text-[#111C2D]">{liveCounts.genres_count}</span>
                    <span className="text-xs font-semibold text-slate-500">formatos activos</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Editor de las 4 Tarjetas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {statsCards.map((card, idx) => (
                <div
                  key={card.id || idx}
                  className="bg-white p-6 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-black/5 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#0071BC] text-white text-xs font-black flex items-center justify-center font-mono">
                        {idx + 1}
                      </span>
                      <h3 className="text-sm font-black font-montserrat text-[#111C2D]">
                        Tarjeta {idx + 1}: {card.title}
                      </h3>
                    </div>

                    {card.id !== "card_format" && (
                      <div className="flex items-center bg-[#F0F3FF] p-1 rounded-xl gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...statsCards];
                            updated[idx].mode = "auto";
                            setStatsCards(updated);
                          }}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition font-montserrat cursor-pointer ${
                            card.mode === "auto"
                              ? "bg-white text-[#0071BC] shadow-2xs"
                              : "text-[#4C4546] hover:text-[#111C2D]"
                          }`}
                        >
                          Auto BD ({card.auto_value})
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...statsCards];
                            updated[idx].mode = "custom";
                            setStatsCards(updated);
                          }}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition font-montserrat cursor-pointer ${
                            card.mode === "custom"
                              ? "bg-white text-[#0071BC] shadow-2xs"
                              : "text-[#4C4546] hover:text-[#111C2D]"
                          }`}
                        >
                          Manual
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Campo de Valor */}
                  <div>
                    <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat">
                      Valor a Mostrar en el Home *
                    </label>
                    {card.mode === "custom" || card.id === "card_format" ? (
                      <input
                        type="text"
                        value={card.custom_value || ""}
                        onChange={(e) => {
                          const updated = [...statsCards];
                          updated[idx].custom_value = e.target.value;
                          setStatsCards(updated);
                        }}
                        placeholder={card.auto_value}
                        className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs text-[#111C2D] font-bold font-montserrat focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                      />
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-sm font-black font-montserrat text-[#0071BC]">
                          {card.auto_value}
                        </span>
                        <span className="text-[11px] text-slate-500 italic font-mono">
                          (Calculado dinámicamente de la base de datos)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Título de la Tarjeta */}
                  <div>
                    <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat">
                      Título de la Métrica *
                    </label>
                    <input
                      type="text"
                      value={card.title}
                      onChange={(e) => {
                        const updated = [...statsCards];
                        updated[idx].title = e.target.value;
                        setStatsCards(updated);
                      }}
                      className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs text-[#111C2D] font-semibold font-montserrat focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                    />
                  </div>

                  {/* Subtítulo / Descripción */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-[#111C2D] font-montserrat">
                        Subtítulo Explicativo *
                      </label>
                      {card.id === "card_genres" && liveCounts.genres_sample && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...statsCards];
                            updated[idx].subtitle = liveCounts.genres_sample;
                            setStatsCards(updated);
                          }}
                          className="text-[10px] text-[#0071BC] font-extrabold hover:underline cursor-pointer"
                        >
                          Usar géneros de BD
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={card.subtitle}
                      onChange={(e) => {
                        const updated = [...statsCards];
                        updated[idx].subtitle = e.target.value;
                        setStatsCards(updated);
                      }}
                      className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs text-[#4C4546] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Previsualización en Vivo de la Tira */}
            <div className="bg-slate-900 p-6 md:p-8 rounded-3xl text-white space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#FBB03B] font-extrabold font-montserrat block">
                    Previsualización en Vivo
                  </span>
                  <h3 className="text-base font-black font-montserrat text-white">
                    Así se mostrarán las tarjetas en la cabecera de la tienda:
                  </h3>
                </div>
                <span className="material-symbols-outlined text-[#0071BC] text-2xl">visibility</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-white text-[#111C2D] shadow-lg border border-black/5">
                {statsCards.map((card, idx) => {
                  const displayVal =
                    card.mode === "custom" && card.custom_value ? card.custom_value : card.auto_value;
                  return (
                    <div
                      key={idx}
                      className="flex flex-col p-4 rounded-xl hover:bg-[#F0F3FF] transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span
                          className={`text-3xl font-black font-montserrat tracking-tight ${
                            idx === 1 ? "text-[#0071BC]" : "text-[#111C2D]"
                          }`}
                        >
                          {displayVal || "0"}
                        </span>
                        {card.has_bolt && (
                          <span className="material-symbols-outlined text-[#0071BC] text-xl">bolt</span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-[#111C2D] font-montserrat mt-1">
                        {card.title}
                      </span>
                      <span className="text-[11px] text-[#4C4546] mt-0.5 truncate">{card.subtitle}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Botón Guardar Cambios */}
            <div className="p-4 bg-white rounded-2xl border border-black/5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#111C2D] block font-montserrat">
                  Persistencia en PostgreSQL
                </span>
                <p className="text-xs text-[#4C4546]">
                  Los cambios se guardan en la tabla <code>platform_settings</code> (clave <code>home_stats_cards</code>) y se sincronizan de inmediato con el frontend.
                </p>
              </div>

              <button
                type="button"
                disabled={isSavingStats}
                onClick={handleSaveStatsOnly}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#0071BC] hover:bg-[#005a96] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isSavingStats ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Guardando en BD...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">save</span>
                    <span>Guardar Configuración de Tarjetas</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ==========================================
               TAB NUEVA: CATEGORÍAS PRINCIPALES (BD & HOME)
               ========================================== */}
        {activeTab === "categories" && (
          <div className="space-y-8">
            
            {/* Banner de Estado en Vivo desde PostgreSQL */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0071BC]/10 via-[#F0F3FF] to-white border border-[#0071BC]/20 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#0071BC] font-montserrat">
                    PostgreSQL • Conexión Activa & Contadores en Tiempo Real
                  </span>
                </div>
                <h2 className="text-xl font-black font-montserrat text-[#111C2D]">
                  Gestión de Categorías Principales del Home
                </h2>
                <p className="text-xs text-[#4C4546] mt-1 max-w-2xl leading-relaxed">
                  Las 6 tarjetas de la sección "Categorías Principales" provienen directamente de la base de datos.
                  Aquí puede administrar la <strong>descripción</strong>, el <strong>ícono</strong>, activar o <strong>desactivar</strong> categorías y <strong>crear nuevas</strong>. Los contadores se calculan automáticamente con datos reales de la BD.
                </p>
              </div>

              {/* Botón "+ Nueva Categoría" */}
              <button
                type="button"
                onClick={() => setShowAddCategoryModal(true)}
                className="px-5 py-3 bg-[#0071BC] hover:bg-[#005a96] text-white text-xs font-black uppercase tracking-wider rounded-xl transition font-montserrat flex items-center justify-center gap-2 shadow-md shrink-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">add_circle</span>
                <span>Nueva Categoría</span>
              </button>
            </div>

            {/* KPI Cards de Resumen */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-black/5 shadow-2xs">
                <span className="text-[11px] text-[#4C4546] font-bold block font-montserrat">Total Categorías</span>
                <span className="text-2xl font-black font-montserrat text-[#111C2D]">
                  {cmsCategories.length}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">En plataforma</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-black/5 shadow-2xs">
                <span className="text-[11px] text-emerald-700 font-bold block font-montserrat">Activas en Home</span>
                <span className="text-2xl font-black font-montserrat text-emerald-600">
                  {cmsCategories.filter((c) => c.is_active).length}
                </span>
                <span className="text-[10px] text-emerald-600 block font-mono">Visibles al público</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-black/5 shadow-2xs">
                <span className="text-[11px] text-rose-700 font-bold block font-montserrat">Desactivadas / Ocultas</span>
                <span className="text-2xl font-black font-montserrat text-rose-600">
                  {cmsCategories.filter((c) => !c.is_active).length}
                </span>
                <span className="text-[10px] text-rose-600 block font-mono">Ocultas en Home</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-black/5 shadow-2xs">
                <span className="text-[11px] text-[#0071BC] font-bold block font-montserrat">Obras Vinculadas</span>
                <span className="text-2xl font-black font-montserrat text-[#0071BC]">
                  {cmsCategories.reduce((acc, c) => acc + (Number(c.count) || 0), 0)}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">Conteo en PostgreSQL</span>
              </div>
            </div>

            {/* Modal / Formulario Flotante de Creación de Nueva Categoría */}
            {showAddCategoryModal && (
              <div className="p-6 bg-amber-50/70 border-2 border-[#FBB03B] rounded-3xl space-y-4 shadow-md animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-[#FBB03B]/30 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#111C2D]">add_box</span>
                    <h3 className="text-base font-black font-montserrat text-[#111C2D]">
                      Crear Nueva Categoría para el Home & Catálogo
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddCategoryModal(false)}
                    className="w-7 h-7 rounded-lg bg-white text-slate-500 hover:text-slate-800 flex items-center justify-center transition"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat">
                      Título de la Categoría *
                    </label>
                    <input
                      type="text"
                      value={newCatTitle}
                      onChange={(e) => setNewCatTitle(e.target.value)}
                      placeholder="Ej: Música Sacra y Coral"
                      className="w-full bg-white border border-black/10 rounded-xl px-4 py-2.5 text-xs text-[#111C2D] font-bold font-montserrat focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat">
                      Ícono de la Categoría * (Material Symbols)
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-white border border-black/10 flex items-center justify-center text-[#111C2D] shrink-0">
                        <span className="material-symbols-outlined text-2xl">{newCatIcon || "piano"}</span>
                      </div>
                      <input
                        type="text"
                        value={newCatIcon}
                        onChange={(e) => setNewCatIcon(e.target.value)}
                        placeholder="piano, group, church..."
                        className="flex-1 bg-white border border-black/10 rounded-xl px-4 py-2 text-xs text-[#111C2D] font-mono focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                      />
                    </div>
                  </div>

                  {/* Selector rápido de íconos en creación */}
                  <div className="md:col-span-2">
                    <span className="text-[11px] font-bold text-[#4C4546] block mb-1.5 font-montserrat">
                      Selección rápida de ícono sugerido:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_ICONS.map((ico) => (
                        <button
                          key={ico.name}
                          type="button"
                          onClick={() => setNewCatIcon(ico.name)}
                          className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 border transition cursor-pointer font-montserrat ${
                            newCatIcon === ico.name
                              ? "bg-[#0071BC] text-white border-[#0071BC]"
                              : "bg-white text-slate-700 border-black/5 hover:border-black/20"
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">{ico.name}</span>
                          <span className="text-[10px]">{ico.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat">
                      Descripción Detallada * (Se muestra en la tarjeta del Home)
                    </label>
                    <textarea
                      rows={2}
                      value={newCatDescription}
                      onChange={(e) => setNewCatDescription(e.target.value)}
                      placeholder="Explica qué tipo de obras incluye esta categoría, características estilísticas o usos escénicos..."
                      className="w-full bg-white border border-black/10 rounded-xl p-3 text-xs text-[#111C2D] focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat">
                      Texto del Botón CTA
                    </label>
                    <input
                      type="text"
                      value={newCatCta}
                      onChange={(e) => setNewCatCta(e.target.value)}
                      placeholder="Explorar repertorio"
                      className="w-full bg-white border border-black/10 rounded-xl px-4 py-2.5 text-xs text-[#111C2D] focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                    />
                  </div>

                  {/* Slug & URL Automáticos (El usuario no tiene que administrarlo) */}
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-[#0071BC]">auto_mode</span>
                      <span className="text-xs text-slate-700 font-bold font-montserrat">
                        URL & Redirección Automática:
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#0071BC] bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs">
                      /tienda?categoria={slugifyCategory(newCatTitle)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newCatIsActive}
                        onChange={(e) => setNewCatIsActive(e.target.checked)}
                        className="w-4 h-4 rounded text-[#0071BC] focus:ring-0"
                      />
                      <span className="text-xs font-bold text-[#111C2D] font-montserrat">
                        Activa inmediatamente en el Home
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#FBB03B]/30">
                  <button
                    type="button"
                    onClick={() => setShowAddCategoryModal(false)}
                    className="px-4 py-2 bg-white text-slate-700 text-xs font-bold rounded-xl border border-black/5 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleAddCategorySubmit}
                    className="px-5 py-2 bg-[#0071BC] hover:bg-[#005a96] text-white text-xs font-black rounded-xl shadow-sm transition cursor-pointer font-montserrat"
                  >
                    Confirmar & Agregar a la Lista
                  </button>
                </div>
              </div>
            )}

            {/* Listado de Categorías Existentes */}
            <div className="space-y-6">
              {cmsCategories.map((cat, idx) => (
                <div
                  key={cat.id || idx}
                  className={`p-6 rounded-3xl border transition-all duration-300 shadow-sm ${
                    cat.is_active
                      ? "bg-white border-black/5"
                      : "bg-slate-50/80 border-dashed border-slate-300 opacity-80"
                  }`}
                >
                  {/* Encabezado de la Tarjeta */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-[#0071BC] text-white text-xs font-black flex items-center justify-center font-mono">
                        {idx + 1}
                      </span>
                      <div>
                        <h3 className="text-base font-black font-montserrat text-[#111C2D]">
                          {cat.title}
                        </h3>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: {cat.id}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Badge de Conteo Real de BD */}
                      <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full flex items-center gap-1.5 text-emerald-800 text-xs font-bold font-montserrat">
                        <span className="material-symbols-outlined text-sm text-emerald-600">database</span>
                        <span>BD: {cat.display_count || `${cat.count ?? 0} ${cat.count_unit || "Obras"}`}</span>
                      </div>

                      {/* Switch Activar / Desactivar */}
                      <button
                        type="button"
                        onClick={() => handleToggleCategoryActive(idx)}
                        className={`px-3 py-1 rounded-full text-xs font-extrabold font-montserrat flex items-center gap-1.5 transition cursor-pointer ${
                          cat.is_active
                            ? "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                            : "bg-rose-100 text-rose-900 hover:bg-rose-200"
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {cat.is_active ? "visibility" : "visibility_off"}
                        </span>
                        <span>{cat.is_active ? "Activa en Home" : "Desactivada"}</span>
                      </button>

                      {/* Botón Eliminar */}
                      {cmsCategories.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(idx)}
                          className="w-8 h-8 rounded-xl bg-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition cursor-pointer"
                          title="Eliminar categoría"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Campos de Edición */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Columna Izquierda: Título, Ícono y Métricas */}
                    <div className="lg:col-span-5 space-y-4">
                      {/* Título de Categoría */}
                      <div>
                        <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat">
                          Título de la Categoría *
                        </label>
                        <input
                          type="text"
                          value={cat.title}
                          onChange={(e) => handleUpdateCategoryField(idx, "title", e.target.value)}
                          className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs text-[#111C2D] font-bold font-montserrat focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                        />
                      </div>

                      {/* Ícono Administrable */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-[#111C2D] font-montserrat">
                            Ícono de la Categoría *
                          </label>
                          <button
                            type="button"
                            onClick={() => setEditingIconIdx(editingIconIdx === idx ? null : idx)}
                            className="text-[11px] text-[#0071BC] font-extrabold hover:underline cursor-pointer"
                          >
                            {editingIconIdx === idx ? "Cerrar selector" : "Cambiar ícono..."}
                          </button>
                        </div>

                        <div className="flex items-center gap-3 p-2 bg-[#F0F3FF] rounded-xl border border-black/5">
                          <div className="w-12 h-12 rounded-xl bg-[#111C2D] text-white flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-2xl">{cat.icon || "piano"}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] text-[#4C4546] block">Identificador Material Symbol:</span>
                            <input
                              type="text"
                              value={cat.icon || ""}
                              onChange={(e) => handleUpdateCategoryField(idx, "icon", e.target.value)}
                              placeholder="piano"
                              className="w-full bg-white border border-black/10 rounded-lg px-2.5 py-1 text-xs text-[#111C2D] font-mono focus:outline-none focus:ring-1 focus:ring-[#0071BC]"
                            />
                          </div>
                        </div>

                        {/* Selector de íconos desplegable */}
                        {editingIconIdx === idx && (
                          <div className="mt-2 p-3 bg-white border border-black/10 rounded-2xl shadow-lg space-y-2 animate-in fade-in duration-150">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block font-montserrat">
                              Íconos sugeridos para catálogo musical:
                            </span>
                            <div className="grid grid-cols-4 gap-1.5">
                              {POPULAR_ICONS.map((ico) => (
                                <button
                                  key={ico.name}
                                  type="button"
                                  onClick={() => {
                                    handleUpdateCategoryField(idx, "icon", ico.name);
                                    setEditingIconIdx(null);
                                  }}
                                  className={`p-2 rounded-xl flex flex-col items-center gap-1 border transition cursor-pointer ${
                                    cat.icon === ico.name
                                      ? "bg-[#0071BC] text-white border-[#0071BC]"
                                      : "bg-[#F0F3FF] text-[#111C2D] border-transparent hover:bg-slate-200"
                                  }`}
                                >
                                  <span className="material-symbols-outlined text-xl">{ico.name}</span>
                                  <span className="text-[9px] font-montserrat truncate w-full text-center">
                                    {ico.label}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Unidad de Conteo */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-[#111C2D] mb-1 font-montserrat">
                            Unidad Plural
                          </label>
                          <input
                            type="text"
                            value={cat.count_unit || "Obras"}
                            onChange={(e) => handleUpdateCategoryField(idx, "count_unit", e.target.value)}
                            placeholder="Obras"
                            className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-3 py-2 text-xs text-[#111C2D] font-montserrat focus:bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#111C2D] mb-1 font-montserrat">
                            Unidad Singular
                          </label>
                          <input
                            type="text"
                            value={cat.count_unit_singular || "Obra"}
                            onChange={(e) => handleUpdateCategoryField(idx, "count_unit_singular", e.target.value)}
                            placeholder="Obra"
                            className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-3 py-2 text-xs text-[#111C2D] font-montserrat focus:bg-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Columna Derecha: Descripción Administrable y Enlaces */}
                    <div className="lg:col-span-7 space-y-4">
                      {/* Descripción Administrable */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-[#111C2D] font-montserrat">
                            Descripción de la Categoría *
                          </label>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {(cat.description || "").length} caracteres
                          </span>
                        </div>
                        <textarea
                          rows={4}
                          value={cat.description || ""}
                          onChange={(e) => handleUpdateCategoryField(idx, "description", e.target.value)}
                          placeholder="Descripción clara de la categoría para orientar al estudiante, pianista o investigador..."
                          className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl p-3.5 text-xs text-[#111C2D] leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                        />
                      </div>

                      {/* Botón CTA y URL Automática */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat">
                            Texto Botón CTA
                          </label>
                          <input
                            type="text"
                            value={cat.cta_text || "Explorar repertorio"}
                            onChange={(e) => handleUpdateCategoryField(idx, "cta_text", e.target.value)}
                            className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-3 py-2.5 text-xs text-[#111C2D] font-montserrat focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0071BC]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat">
                            URL de Redirección Automática
                          </label>
                          <div className="flex items-center justify-between p-2 bg-[#F0F3FF] border border-black/5 rounded-xl">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="material-symbols-outlined text-sm text-[#0071BC] shrink-0">link</span>
                              <span className="font-mono text-xs text-[#111C2D] font-bold truncate">
                                /tienda?categoria={cat.slug || slugifyCategory(cat.title)}
                              </span>
                            </div>
                            <Link
                              href={`/tienda?categoria=${cat.slug || slugifyCategory(cat.title)}`}
                              target="_blank"
                              className="px-2 py-0.5 text-[10px] font-bold bg-white text-[#0071BC] border border-blue-200 rounded-lg hover:bg-blue-50 transition shrink-0 ml-1.5"
                            >
                              Probar ↗
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* Vista previa miniatura de la tarjeta */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                        <span className="text-[10px] text-slate-500 font-bold uppercase font-montserrat">
                          Previsualización de Tarjeta:
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-base text-[#0071BC]">
                            {cat.icon || "piano"}
                          </span>
                          <span className="font-bold text-[#111C2D] font-montserrat">{cat.title}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FBB03B]/20 text-[#111C2D]">
                            {cat.display_count || `${cat.count ?? 0} ${cat.count_unit || "Obras"}`}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>

            {/* Previsualización Bento Grid Completa del Home */}
            <div className="bg-slate-900 p-6 md:p-8 rounded-3xl text-white space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#FBB03B] font-extrabold font-montserrat block">
                    Previsualización en Vivo de la Sección
                  </span>
                  <h3 className="text-base font-black font-montserrat text-white">
                    Así se verá "Categorías Principales" en la portada pública:
                  </h3>
                </div>
                <span className="material-symbols-outlined text-[#0071BC] text-2xl">visibility</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cmsCategories
                  .filter((c) => c.is_active)
                  .map((cat, idx) => {
                    const badgeStyle =
                      idx % 3 === 0
                        ? "bg-[#FBB03B]/20 text-[#111C2D]"
                        : idx % 3 === 1
                        ? "bg-[#F0F3FF] text-[#0071BC]"
                        : "bg-[#C1272D]/10 text-[#C1272D]";

                    return (
                      <div
                        key={cat.id || idx}
                        className="p-5 rounded-2xl bg-white text-[#111C2D] shadow-md flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 rounded-xl bg-[#F0F3FF] flex items-center justify-center text-[#111C2D]">
                              <span className="material-symbols-outlined text-2xl">{cat.icon || "piano"}</span>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold font-montserrat ${badgeStyle}`}>
                              {cat.display_count || `${cat.count ?? 0} ${cat.count_unit || "Obras"}`}
                            </span>
                          </div>
                          <h4 className="text-base font-bold font-montserrat text-[#111C2D]">
                            {cat.title}
                          </h4>
                          <p className="text-[11px] text-[#4C4546] mt-1.5 line-clamp-3 leading-relaxed">
                            {cat.description}
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-[11px] font-bold text-[#0071BC] font-montserrat">
                          <span>{cat.cta_text || "Explorar repertorio"}</span>
                          <span className="material-symbols-outlined text-sm">east</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Botón Guardar Cambios en PostgreSQL */}
            <div className="p-4 bg-white rounded-2xl border border-black/5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#111C2D] block font-montserrat">
                  Persistencia en Base de Datos PostgreSQL
                </span>
                <p className="text-xs text-[#4C4546]">
                  Los cambios se almacenan en <code>platform_settings</code> (clave <code>home_categories</code>) y actualizan en vivo el Home y los metadatos del catálogo.
                </p>
              </div>

              <button
                type="button"
                disabled={isSavingCategories}
                onClick={handleSaveCategoriesOnly}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#0071BC] hover:bg-[#005a96] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isSavingCategories ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Guardando en BD...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">save</span>
                    <span>Guardar Categorías en BD</span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}

        {/* ==========================================
               TAB: COMPOSITORES DESTACADOS (HOME)
               ========================================== */}
        {activeTab === "featured_composers" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F3FF] border border-[#0071BC]/10 text-[#0071BC] text-[11px] font-extrabold uppercase tracking-wider mb-2 font-montserrat">
                  <span className="material-symbols-outlined text-xs">groups</span>
                  Sección Home • Compositores Destacados
                </div>
                <h2 className="text-2xl font-black font-montserrat text-[#111C2D]">
                  Pestañas y Compositores Asignados
                </h2>
                <p className="text-xs text-[#4C4546] font-medium max-w-3xl leading-relaxed mt-1">
                  Personalice los nombres de las 3 pestañas temáticas, seleccione el ícono representativo de su categoría y asigne hasta 8 compositores activos por pestaña. Las pestañas sin compositores asignados se ocultarán automáticamente en la portada pública.
                </p>
              </div>

              <button
                type="button"
                disabled={isSavingFeaturedComposers}
                onClick={handleSaveFeaturedComposers}
                className="px-6 py-3 bg-[#0071BC] hover:bg-[#005a96] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isSavingFeaturedComposers ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Guardando en BD...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">save</span>
                    <span>Guardar Compositores en BD</span>
                  </>
                )}
              </button>
            </div>

            {/* Listado de las 3 Pestañas Fijas Administrables */}
            <div className="space-y-6">
              {featuredTabs.map((tab) => {
                const tabComposerIds = Array.isArray(tab.composer_ids)
                  ? tab.composer_ids
                  : (Array.isArray(tab.composers) ? tab.composers.map((c: any) => c.id) : []);

                const availableComposers = activeComposersDirectory.filter(
                  (c) => !tabComposerIds.includes(c.id)
                );

                return (
                  <div
                    key={tab.id}
                    className="p-6 rounded-3xl bg-white border border-black/5 shadow-sm space-y-5 relative overflow-hidden"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-black/5 pb-4">
                      {/* Cabecera del Tab con ID y Nombre Editable */}
                      <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#F0F3FF] flex items-center justify-center text-[#0071BC] shrink-0 border border-black/5">
                          <span className="material-symbols-outlined text-2xl">{tab.icon || "piano"}</span>
                        </div>

                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                              Pestaña ID: {tab.id}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-montserrat ${
                                tabComposerIds.length > 0
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {tabComposerIds.length > 0 ? "Visible en Home" : "Oculta en Home (0 asignados)"}
                            </span>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-[#111C2D] font-montserrat mb-1">
                              Nombre Visible de la Pestaña *
                            </label>
                            <input
                              type="text"
                              required
                              value={tab.name}
                              onChange={(e) => handleUpdateFeaturedTabName(tab.id, e.target.value)}
                              placeholder="Ej: Patrimonio Histórico"
                              className="w-full sm:max-w-md bg-[#F0F3FF] border border-black/10 rounded-xl px-4 py-2 text-xs font-bold text-[#111C2D] font-montserrat focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Selector de Ícono de Categoría y Contador */}
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="relative">
                          <label className="block text-[11px] font-bold text-[#111C2D] mb-1 font-montserrat">
                            Ícono de Categoría
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setEditingComposerIconTabId(
                                editingComposerIconTabId === tab.id ? null : tab.id
                              )
                            }
                            className="px-3 py-2 bg-[#F0F3FF] hover:bg-slate-200 text-[#111C2D] rounded-xl text-xs font-bold font-montserrat transition flex items-center gap-2 border border-black/5"
                          >
                            <span className="material-symbols-outlined text-base text-[#0071BC]">
                              {tab.icon || "piano"}
                            </span>
                            <span>{tab.icon || "piano"}</span>
                            <span className="material-symbols-outlined text-sm text-slate-400">expand_more</span>
                          </button>

                          {/* Popover selector de íconos */}
                          {editingComposerIconTabId === tab.id && (
                            <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-white border border-black/10 rounded-2xl shadow-xl z-20 space-y-2 animate-in fade-in duration-150">
                              <span className="text-[10px] uppercase font-bold text-slate-500 block font-montserrat">
                                Seleccionar ícono de categoría:
                              </span>
                              <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
                                {POPULAR_ICONS.map((ico) => (
                                  <button
                                    key={ico.name}
                                    type="button"
                                    onClick={() => {
                                      handleUpdateFeaturedTabIcon(tab.id, ico.name);
                                      setEditingComposerIconTabId(null);
                                    }}
                                    className={`p-2 rounded-xl flex flex-col items-center gap-1 border transition cursor-pointer ${
                                      tab.icon === ico.name
                                        ? "bg-[#0071BC] text-white border-[#0071BC]"
                                        : "bg-[#F0F3FF] text-[#111C2D] border-transparent hover:bg-slate-200"
                                    }`}
                                  >
                                    <span className="material-symbols-outlined text-lg">{ico.name}</span>
                                    <span className="text-[9px] font-montserrat truncate w-full text-center">
                                      {ico.label}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Contador de Cupos */}
                        <div>
                          <label className="block text-[11px] font-bold text-[#111C2D] mb-1 font-montserrat text-right">
                            Capacidad
                          </label>
                          <span className="inline-block px-3 py-2 bg-[#F0F3FF] rounded-xl text-xs font-black font-montserrat text-[#111C2D] border border-black/5">
                            {tabComposerIds.length} / 8
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Selector y Asignación de Compositores Activos */}
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="text-xs font-bold text-[#111C2D] font-montserrat">
                          Compositores asignados a esta pestaña ({tabComposerIds.length} de máx. 8):
                        </span>

                        {tabComposerIds.length < 8 && availableComposers.length > 0 && (
                          <div className="flex items-center gap-2">
                            <select
                              value={selectedComposerToAdd[tab.id] || ""}
                              onChange={(e) =>
                                setSelectedComposerToAdd((prev) => ({
                                  ...prev,
                                  [tab.id]: e.target.value,
                                }))
                              }
                              className="bg-[#F0F3FF] border border-black/10 rounded-xl px-3 py-2 text-xs font-bold text-[#111C2D] font-montserrat focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                            >
                              <option value="">Seleccionar compositor activo...</option>
                              {availableComposers.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name} ({c.scoreCount} partituras)
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              disabled={!selectedComposerToAdd[tab.id]}
                              onClick={() => handleAddComposerToTab(tab.id, selectedComposerToAdd[tab.id])}
                              className="px-3.5 py-2 bg-[#111C2D] hover:bg-[#0071BC] text-white text-xs font-bold font-montserrat rounded-xl transition disabled:opacity-40 cursor-pointer shrink-0"
                            >
                              + Agregar
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Chips de Compositores Asignados */}
                      {tabComposerIds.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {tabComposerIds.map((cId: string) => {
                            const comp = activeComposersDirectory.find((c) => c.id === cId);
                            if (!comp) return null;

                            return (
                              <div
                                key={cId}
                                className="p-3 bg-[#F9F9FF] border border-black/5 rounded-2xl flex items-center justify-between gap-2 shadow-2xs hover:border-[#0071BC]/30 transition group"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-8 h-8 rounded-full bg-[#0071BC] text-white flex items-center justify-center font-montserrat font-black text-xs shrink-0 overflow-hidden">
                                    {comp.photo_url ? (
                                      <img src={comp.photo_url} alt={comp.name} className="w-full h-full object-cover" />
                                    ) : (
                                      comp.name.substring(0, 2).toUpperCase()
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-bold text-xs text-[#111C2D] block truncate font-montserrat">
                                      {comp.name}
                                    </span>
                                    <span className="text-[10px] text-[#4C4546] block truncate">
                                      {comp.scoreCount} {comp.scoreCount === 1 ? "partitura" : "partituras"}
                                    </span>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveComposerFromTab(tab.id, cId)}
                                  title="Quitar de esta pestaña"
                                  className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center text-xs font-black transition shrink-0 cursor-pointer"
                                >
                                  ×
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-center text-xs text-slate-500 space-y-1 font-montserrat">
                          <span className="material-symbols-outlined text-lg block text-slate-400">person_off</span>
                          <span className="font-bold block text-slate-600">No hay compositores asignados a esta pestaña</span>
                          <span className="text-[11px] block text-slate-400">
                            Esta pestaña permanecerá oculta en la página de inicio hasta que agregues al menos 1 compositor activo.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Banner inferior de guardado */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#111C2D] block font-montserrat">
                  Persistencia en Base de Datos PostgreSQL
                </span>
                <p className="text-xs text-[#4C4546]">
                  Los cambios se almacenan en <code>platform_settings</code> (clave <code>home_featured_composers</code>) y se sincronizan en tiempo real con la portada.
                </p>
              </div>

              <button
                type="button"
                disabled={isSavingFeaturedComposers}
                onClick={handleSaveFeaturedComposers}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#0071BC] hover:bg-[#005a96] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isSavingFeaturedComposers ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Guardando en BD...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">save</span>
                    <span>Guardar Compositores en BD</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ==========================================
               TAB 4: GÉNEROS Y DIFICULTADES DEL CATÁLOGO
               ========================================== */}
        {activeTab === "metadata" && (
          <div className="space-y-8">
            <div className="p-6 rounded-2xl bg-white border border-black/5 shadow-sm">
              <h2 className="text-lg font-black font-montserrat text-[#111C2D] mb-2">
                Listado General de Géneros y Dificultades
              </h2>
              <p className="text-xs text-[#4C4546] mb-6">
                Utilizado por el formulario de subida de partituras para compositores y los filtros generales de la tienda.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Categorías / Géneros */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold font-montserrat text-[#0071BC]">Géneros Musicales Registrados</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryInput}
                      onChange={(e) => setNewCategoryInput(e.target.value)}
                      placeholder="Nuevo género..."
                      className="flex-1 bg-[#F0F3FF] border border-black/5 rounded-xl px-3 py-2 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="px-4 py-2 bg-[#0071BC] text-white rounded-xl text-xs font-bold font-montserrat cursor-pointer"
                    >
                      Agregar
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat, i) => (
                      <span key={i} className="px-3 py-1 bg-[#F0F3FF] rounded-full text-xs font-medium flex items-center gap-1">
                        {cat}
                        <button type="button" onClick={() => handleRemoveCategory(cat)} className="text-rose-500 hover:text-rose-700 ml-1">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Dificultades */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold font-montserrat text-[#0071BC]">Niveles de Dificultad</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newDifficultyInput}
                      onChange={(e) => setNewDifficultyInput(e.target.value)}
                      placeholder="Nueva dificultad..."
                      className="flex-1 bg-[#F0F3FF] border border-black/5 rounded-xl px-3 py-2 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddDifficulty}
                      className="px-4 py-2 bg-[#0071BC] text-white rounded-xl text-xs font-bold font-montserrat cursor-pointer"
                    >
                      Agregar
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {difficulties.map((diff, i) => (
                      <span key={i} className="px-3 py-1 bg-[#F0F3FF] rounded-full text-xs font-medium flex items-center gap-1">
                        {diff}
                        <button type="button" onClick={() => handleRemoveDifficulty(diff)} className="text-rose-500 hover:text-rose-700 ml-1">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-black/5 flex justify-end">
                <button
                  type="button"
                  disabled={isSavingMetadata}
                  onClick={handleSaveMetadata}
                  className="px-6 py-2.5 bg-[#0071BC] text-white font-bold text-xs rounded-xl font-montserrat cursor-pointer"
                >
                  {isSavingMetadata ? "Guardando..." : "Guardar Géneros & Dificultades"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
               TAB: BITÁCORA PIANÍSTICA & BLOG
               ========================================== */}
        {activeTab === "blog" && (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0071BC] font-montserrat">
                  <span className="material-symbols-outlined text-base">article</span>
                  <span>Módulo Especializado de Difusión</span>
                </div>
                <h2 className="text-2xl font-black font-montserrat text-[#111C2D]">
                  Gestión de Bitácora Pianística & Artículos
                </h2>
                <p className="text-xs sm:text-sm text-[#4C4546] max-w-2xl leading-relaxed">
                  Para mantener las pestañas del CMS ligeras y ordenadas, el blog cuenta con un panel dedicado con redacción en texto enriquecido, subida de imágenes a la nube, asignación de categorías dinámicas y activación/desactivación instantánea.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Link
                  href="/admin/blog"
                  className="px-6 py-3.5 bg-[#FBB03B] hover:bg-[#e09b2d] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">open_in_new</span>
                  <span>Abrir Gestor del Blog</span>
                </Link>
                <Link
                  href="/blog"
                  target="_blank"
                  className="px-4 py-3.5 bg-white border border-black/10 hover:bg-[#F0F3FF] text-[#111C2D] font-bold text-xs rounded-xl shadow-xs transition font-montserrat flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base text-[#0071BC]">visibility</span>
                  <span>Ver Bitácora Pública</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
               TAB 4: PÁGINAS LEGALES Y T&C
               ========================================== */}
        {activeTab === "legals" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
              <div>
                <h2 className="text-base font-bold font-montserrat text-[#111C2D]">Editor de Páginas Legales & Textos de Checkboxes</h2>
                <p className="text-xs text-[#4C4546]">
                  Administra las cláusulas de los documentos oficiales y los textos exactos de las casillas de verificación que aceptan los compositores durante su registro.
                </p>
              </div>
              <button
                type="button"
                disabled={isSavingCmsLegals}
                onClick={handleSaveCmsLegals}
                className="px-6 py-2.5 bg-[#0071BC] hover:bg-[#005a96] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isSavingCmsLegals ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base text-[#FBB03B]">save</span>
                    <span>Guardar Textos Legales en BD</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-6">
              
              {/* CARD CMS: ESQUEMA DE COMISIÓN ESTÁNDAR Y PORCENTAJES DE REGALÍAS */}
              <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-black/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
                      <span className="material-symbols-outlined text-xl">payments</span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold font-montserrat text-[#111C2D]">
                        Porcentaje Estándar de Comisión & Liquidación
                      </h3>
                      <p className="text-xs text-[#4C4546]">
                        Configura el porcentaje estándar de la plataforma. Se refleja automáticamente en los Términos y Condiciones y en la casilla de aceptación al registrarse como compositor.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black font-mono tracking-tight">
                      {100 - cmsStandardCommission}% Neto Autor / {cmsStandardCommission}% Plataforma
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 items-end">
                  <div>
                    <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
                      Comisión Estándar Plataforma (% retención) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={cmsStandardCommission}
                        onChange={(e) => setCmsStandardCommission(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                        className="w-full pl-4 pr-10 py-2.5 bg-[#F0F3FF] border border-black/10 rounded-xl text-sm font-mono font-bold text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#4C4546] font-mono">
                        %
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">
                      Liquidación Neta para el Autor (Cálculo automático)
                    </label>
                    <div className="w-full px-4 py-2.5 bg-slate-100 border border-black/5 rounded-xl text-sm font-mono font-bold text-emerald-700 flex items-center justify-between">
                      <span>{100 - cmsStandardCommission}% Neto Autor</span>
                      <span className="material-symbols-outlined text-base text-emerald-600">verified</span>
                    </div>
                  </div>

                  <div>
                    <button
                      type="button"
                      disabled={isUpdatingCommission}
                      onClick={handleSaveStandardCommission}
                      className="w-full px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isUpdatingCommission ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          <span>Guardando...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-base">save</span>
                          <span>Guardar Comisión en BD</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200/80 text-blue-900 text-xs flex items-start gap-2.5 leading-relaxed">
                  <span className="material-symbols-outlined text-base text-[#0071BC] shrink-0 mt-0.5">info</span>
                  <p>
                    <strong>Comodines dinámicos:</strong> En los textos de las casillas y en el contenido de las cláusulas puedes escribir{" "}
                    <code className="bg-blue-100 text-blue-950 px-1 py-0.5 rounded font-mono font-bold">{"{author_percent}"}</code> y{" "}
                    <code className="bg-blue-100 text-blue-950 px-1 py-0.5 rounded font-mono font-bold">{"{platform_percent}"}</code>. El sistema interpolará automáticamente{" "}
                    <strong>{100 - cmsStandardCommission}%</strong> para el autor y <strong>{cmsStandardCommission}%</strong> para Piano Colombia.
                  </p>
                </div>
              </div>

              {/* DOCUMENTO 1: TÉRMINOS Y CONDICIONES PARA COMPOSITORES */}
              <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-black/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 shrink-0">
                      <span className="material-symbols-outlined text-xl">gavel</span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold font-montserrat text-[#111C2D]">
                        {cmsLegals.composer_terms.title_es}
                      </h3>
                      <p className="text-xs text-[#4C4546]">
                        {cmsLegals.composer_terms.updated_at_text_es} • {cmsLegals.composer_terms.updated_at_text_en}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditingLegalDocId(editingLegalDocId === "composer_terms" ? null : "composer_terms")}
                    className="px-4 py-2 bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xs transition font-montserrat flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">
                      {editingLegalDocId === "composer_terms" ? "expand_less" : "edit_note"}
                    </span>
                    {editingLegalDocId === "composer_terms" ? "Ocultar Editor" : "Editar Documento & Checkbox"}
                  </button>
                </div>

                {/* Vista previa del checkbox en el registro */}
                <div className="p-4 bg-[#F0F3FF]/70 rounded-xl border border-black/5 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0071BC] font-montserrat block">
                    Vista previa de la casilla en el formulario de registro:
                  </span>
                  <div className="space-y-1.5 text-xs text-[#111C2D]">
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] font-bold bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">ES</span>
                      <p>
                        {(() => {
                          const authorPct = 100 - cmsStandardCommission;
                          const platformPct = cmsStandardCommission;
                          const interpolated = cmsLegals.composer_terms.checkbox_text_es
                            .replace(/\{author_percent\}/g, String(authorPct))
                            .replace(/\{platform_percent\}/g, String(platformPct))
                            .replace(/\b\d+%\s*neto\s*autor\s*\/\s*\d+%\s*plataforma\b/gi, `${authorPct}% neto autor / ${platformPct}% plataforma`);
                          if (interpolated.includes("{link}")) {
                            const [before, after] = interpolated.split("{link}");
                            return (
                              <>
                                {before}
                                <span className="text-[#0071BC] font-bold underline font-montserrat">
                                  {cmsLegals.composer_terms.link_text_es}
                                </span>
                                {after}
                              </>
                            );
                          }
                          return interpolated;
                        })()}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] font-bold bg-blue-100 px-1.5 py-0.5 rounded text-blue-700">EN</span>
                      <p>
                        {(() => {
                          const authorPct = 100 - cmsStandardCommission;
                          const platformPct = cmsStandardCommission;
                          const interpolated = cmsLegals.composer_terms.checkbox_text_en
                            .replace(/\{author_percent\}/g, String(authorPct))
                            .replace(/\{platform_percent\}/g, String(platformPct))
                            .replace(/\b\d+%\s*net\s*author\s*\/\s*\d+%\s*platform\b/gi, `${authorPct}% net author / ${platformPct}% platform`);
                          if (interpolated.includes("{link}")) {
                            const [before, after] = interpolated.split("{link}");
                            return (
                              <>
                                {before}
                                <span className="text-[#0071BC] font-bold underline font-montserrat">
                                  {cmsLegals.composer_terms.link_text_en}
                                </span>
                                {after}
                              </>
                            );
                          }
                          return interpolated;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Formulario editable desplegable */}
                {editingLegalDocId === "composer_terms" && (
                  <div className="space-y-5 pt-3 border-t border-black/5 animate-in fade-in duration-200">
                    {/* Selector de Idioma para Edición */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#4C4546]">Idioma a editar:</span>
                      <div className="inline-flex rounded-xl bg-[#F0F3FF] p-1 border border-black/5">
                        <button
                          type="button"
                          onClick={() => setEditingLegalLang("es")}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition font-montserrat ${
                            editingLegalLang === "es"
                              ? "bg-white text-[#111C2D] shadow-xs"
                              : "text-[#4C4546] hover:text-[#111C2D]"
                          }`}
                        >
                          🇪🇸 Español
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingLegalLang("en")}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition font-montserrat ${
                            editingLegalLang === "en"
                              ? "bg-white text-[#0071BC] shadow-xs"
                              : "text-[#4C4546] hover:text-[#111C2D]"
                          }`}
                        >
                          🇺🇸 Inglés (English)
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat">
                          Título Oficial del Documento ({editingLegalLang === "es" ? "Español" : "Inglés"}) *
                        </label>
                        <input
                          type="text"
                          value={
                            editingLegalLang === "es"
                              ? cmsLegals.composer_terms.title_es
                              : cmsLegals.composer_terms.title_en
                          }
                          onChange={(e) =>
                            setCmsLegals({
                              ...cmsLegals,
                              composer_terms: {
                                ...cmsLegals.composer_terms,
                                [editingLegalLang === "es" ? "title_es" : "title_en"]: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3.5 py-2.5 bg-[#F0F3FF] border border-black/10 rounded-xl text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat">
                          Fecha / Versión mostrada ({editingLegalLang === "es" ? "Español" : "Inglés"}) *
                        </label>
                        <input
                          type="text"
                          value={
                            editingLegalLang === "es"
                              ? cmsLegals.composer_terms.updated_at_text_es
                              : cmsLegals.composer_terms.updated_at_text_en
                          }
                          onChange={(e) =>
                            setCmsLegals({
                              ...cmsLegals,
                              composer_terms: {
                                ...cmsLegals.composer_terms,
                                [editingLegalLang === "es" ? "updated_at_text_es" : "updated_at_text_en"]: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3.5 py-2.5 bg-[#F0F3FF] border border-black/10 rounded-xl text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat">
                          Texto del Enlace Clickable ({editingLegalLang === "es" ? "Español" : "Inglés"}) *
                        </label>
                        <input
                          type="text"
                          value={
                            editingLegalLang === "es"
                              ? cmsLegals.composer_terms.link_text_es
                              : cmsLegals.composer_terms.link_text_en
                          }
                          onChange={(e) =>
                            setCmsLegals({
                              ...cmsLegals,
                              composer_terms: {
                                ...cmsLegals.composer_terms,
                                [editingLegalLang === "es" ? "link_text_es" : "link_text_en"]: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3.5 py-2.5 bg-[#F0F3FF] border border-black/10 rounded-xl text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat">
                          Texto Completo del Checkbox ({editingLegalLang === "es" ? "Español" : "Inglés"}) *
                          <span className="text-[10px] font-normal text-[#0071BC] ml-2">Usa {"{link}"}, {"{author_percent}"}% y {"{platform_percent}"}%</span>
                        </label>
                        <input
                          type="text"
                          value={
                            editingLegalLang === "es"
                              ? cmsLegals.composer_terms.checkbox_text_es
                              : cmsLegals.composer_terms.checkbox_text_en
                          }
                          onChange={(e) =>
                            setCmsLegals({
                              ...cmsLegals,
                              composer_terms: {
                                ...cmsLegals.composer_terms,
                                [editingLegalLang === "es" ? "checkbox_text_es" : "checkbox_text_en"]: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3.5 py-2.5 bg-[#F0F3FF] border border-black/10 rounded-xl text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat">
                        Contenido Completo de los Términos ({editingLegalLang === "es" ? "Español" : "Inglés"}) *
                      </label>
                      <textarea
                        rows={9}
                        value={
                          editingLegalLang === "es"
                            ? cmsLegals.composer_terms.content_es
                            : cmsLegals.composer_terms.content_en
                        }
                        onChange={(e) =>
                          setCmsLegals({
                            ...cmsLegals,
                            composer_terms: {
                              ...cmsLegals.composer_terms,
                              [editingLegalLang === "es" ? "content_es" : "content_en"]: e.target.value,
                            },
                          })
                        }
                        className="w-full p-4 bg-[#F0F3FF] border border-black/10 rounded-xl text-xs text-[#111C2D] font-mono leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                      ></textarea>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingLegalDocId(null)}
                        className="px-4 py-2 border border-black/10 rounded-xl text-xs font-bold text-[#4C4546] hover:bg-slate-100 transition"
                      >
                        Cerrar Edición
                      </button>
                      <button
                        type="button"
                        disabled={isSavingCmsLegals}
                        onClick={handleSaveCmsLegals}
                        className="px-6 py-2 bg-[#0071BC] hover:bg-[#005a96] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-sm text-[#FBB03B]">save</span>
                        Guardar Términos en BD
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* DOCUMENTO 2: POLÍTICA DE TRATAMIENTO DE DATOS PERSONALES */}
              <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-black/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0071BC] flex items-center justify-center border border-blue-200 shrink-0">
                      <span className="material-symbols-outlined text-xl">shield</span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold font-montserrat text-[#111C2D]">
                        {cmsLegals.privacy_policy.title_es}
                      </h3>
                      <p className="text-xs text-[#4C4546]">
                        {cmsLegals.privacy_policy.updated_at_text_es} • {cmsLegals.privacy_policy.updated_at_text_en}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditingLegalDocId(editingLegalDocId === "privacy_policy" ? null : "privacy_policy")}
                    className="px-4 py-2 bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xs transition font-montserrat flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">
                      {editingLegalDocId === "privacy_policy" ? "expand_less" : "edit_note"}
                    </span>
                    {editingLegalDocId === "privacy_policy" ? "Ocultar Editor" : "Editar Documento & Checkbox"}
                  </button>
                </div>

                {/* Vista previa del checkbox en el registro */}
                <div className="p-4 bg-[#F0F3FF]/70 rounded-xl border border-black/5 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0071BC] font-montserrat block">
                    Vista previa de la casilla en el formulario de registro:
                  </span>
                  <div className="space-y-1.5 text-xs text-[#111C2D]">
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] font-bold bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">ES</span>
                      <p>
                        {cmsLegals.privacy_policy.checkbox_text_es.includes("{link}") ? (
                          <>
                            {cmsLegals.privacy_policy.checkbox_text_es.split("{link}")[0]}
                            <span className="text-[#0071BC] font-bold underline font-montserrat">
                              {cmsLegals.privacy_policy.link_text_es}
                            </span>
                            {cmsLegals.privacy_policy.checkbox_text_es.split("{link}")[1]}
                          </>
                        ) : (
                          cmsLegals.privacy_policy.checkbox_text_es
                        )}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] font-bold bg-blue-100 px-1.5 py-0.5 rounded text-blue-700">EN</span>
                      <p>
                        {cmsLegals.privacy_policy.checkbox_text_en.includes("{link}") ? (
                          <>
                            {cmsLegals.privacy_policy.checkbox_text_en.split("{link}")[0]}
                            <span className="text-[#0071BC] font-bold underline font-montserrat">
                              {cmsLegals.privacy_policy.link_text_en}
                            </span>
                            {cmsLegals.privacy_policy.checkbox_text_en.split("{link}")[1]}
                          </>
                        ) : (
                          cmsLegals.privacy_policy.checkbox_text_en
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Formulario editable desplegable */}
                {editingLegalDocId === "privacy_policy" && (
                  <div className="space-y-5 pt-3 border-t border-black/5 animate-in fade-in duration-200">
                    {/* Selector de Idioma para Edición */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#4C4546]">Idioma a editar:</span>
                      <div className="inline-flex rounded-xl bg-[#F0F3FF] p-1 border border-black/5">
                        <button
                          type="button"
                          onClick={() => setEditingLegalLang("es")}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition font-montserrat ${
                            editingLegalLang === "es"
                              ? "bg-white text-[#111C2D] shadow-xs"
                              : "text-[#4C4546] hover:text-[#111C2D]"
                          }`}
                        >
                          🇪🇸 Español
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingLegalLang("en")}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition font-montserrat ${
                            editingLegalLang === "en"
                              ? "bg-white text-[#0071BC] shadow-xs"
                              : "text-[#4C4546] hover:text-[#111C2D]"
                          }`}
                        >
                          🇺🇸 Inglés (English)
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat">
                          Título Oficial del Documento ({editingLegalLang === "es" ? "Español" : "Inglés"}) *
                        </label>
                        <input
                          type="text"
                          value={
                            editingLegalLang === "es"
                              ? cmsLegals.privacy_policy.title_es
                              : cmsLegals.privacy_policy.title_en
                          }
                          onChange={(e) =>
                            setCmsLegals({
                              ...cmsLegals,
                              privacy_policy: {
                                ...cmsLegals.privacy_policy,
                                [editingLegalLang === "es" ? "title_es" : "title_en"]: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3.5 py-2.5 bg-[#F0F3FF] border border-black/10 rounded-xl text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat">
                          Fecha / Versión mostrada ({editingLegalLang === "es" ? "Español" : "Inglés"}) *
                        </label>
                        <input
                          type="text"
                          value={
                            editingLegalLang === "es"
                              ? cmsLegals.privacy_policy.updated_at_text_es
                              : cmsLegals.privacy_policy.updated_at_text_en
                          }
                          onChange={(e) =>
                            setCmsLegals({
                              ...cmsLegals,
                              privacy_policy: {
                                ...cmsLegals.privacy_policy,
                                [editingLegalLang === "es" ? "updated_at_text_es" : "updated_at_text_en"]: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3.5 py-2.5 bg-[#F0F3FF] border border-black/10 rounded-xl text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat">
                          Texto del Enlace Clickable ({editingLegalLang === "es" ? "Español" : "Inglés"}) *
                        </label>
                        <input
                          type="text"
                          value={
                            editingLegalLang === "es"
                              ? cmsLegals.privacy_policy.link_text_es
                              : cmsLegals.privacy_policy.link_text_en
                          }
                          onChange={(e) =>
                            setCmsLegals({
                              ...cmsLegals,
                              privacy_policy: {
                                ...cmsLegals.privacy_policy,
                                [editingLegalLang === "es" ? "link_text_es" : "link_text_en"]: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3.5 py-2.5 bg-[#F0F3FF] border border-black/10 rounded-xl text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat">
                          Texto Completo del Checkbox ({editingLegalLang === "es" ? "Español" : "Inglés"}) *
                          <span className="text-[10px] font-normal text-[#0071BC] ml-2">Usa {"{link}"} para el enlace</span>
                        </label>
                        <input
                          type="text"
                          value={
                            editingLegalLang === "es"
                              ? cmsLegals.privacy_policy.checkbox_text_es
                              : cmsLegals.privacy_policy.checkbox_text_en
                          }
                          onChange={(e) =>
                            setCmsLegals({
                              ...cmsLegals,
                              privacy_policy: {
                                ...cmsLegals.privacy_policy,
                                [editingLegalLang === "es" ? "checkbox_text_es" : "checkbox_text_en"]: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3.5 py-2.5 bg-[#F0F3FF] border border-black/10 rounded-xl text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat">
                        Contenido Completo de la Política de Privacidad ({editingLegalLang === "es" ? "Español" : "Inglés"}) *
                      </label>
                      <textarea
                        rows={9}
                        value={
                          editingLegalLang === "es"
                            ? cmsLegals.privacy_policy.content_es
                            : cmsLegals.privacy_policy.content_en
                        }
                        onChange={(e) =>
                          setCmsLegals({
                            ...cmsLegals,
                            privacy_policy: {
                              ...cmsLegals.privacy_policy,
                              [editingLegalLang === "es" ? "content_es" : "content_en"]: e.target.value,
                            },
                          })
                        }
                        className="w-full p-4 bg-[#F0F3FF] border border-black/10 rounded-xl text-xs text-[#111C2D] font-mono leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                      ></textarea>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingLegalDocId(null)}
                        className="px-4 py-2 border border-black/10 rounded-xl text-xs font-bold text-[#4C4546] hover:bg-slate-100 transition"
                      >
                        Cerrar Edición
                      </button>
                      <button
                        type="button"
                        disabled={isSavingCmsLegals}
                        onClick={handleSaveCmsLegals}
                        className="px-6 py-2 bg-[#0071BC] hover:bg-[#005a96] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-sm text-[#FBB03B]">save</span>
                        Guardar Política en BD
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* CARD CMS: LÍMITE DE DESCARGAS POR LICENCIA */}
              <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-black/5">
                  <div className="w-10 h-10 rounded-xl bg-[#F0F3FF] text-[#0071BC] flex items-center justify-center border border-[#0071BC]/20 shrink-0">
                    <span className="material-symbols-outlined text-xl">download_done</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-montserrat text-[#111C2D]">Límite Máximo de Descargas por Licencia</h3>
                    <p className="text-xs text-[#4C4546]">Configura cuántas veces puede descargar un comprador su partitura con estampa legal (por defecto 5).</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-1">
                  <div className="relative max-w-xs">
                    <input
                      type="number"
                      min="1"
                      max="50"
                      step="1"
                      value={cmsMaxDownloads}
                      onChange={(e) => setCmsMaxDownloads(parseInt(e.target.value, 10) || 5)}
                      className="w-full pl-4 pr-24 py-2.5 bg-[#F0F3FF] border border-black/10 rounded-xl text-sm font-mono font-bold text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#4C4546]">
                      Descargas
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="cmsApplyExistingCheckbox"
                      checked={cmsApplyToExisting}
                      onChange={(e) => setCmsApplyToExisting(e.target.checked)}
                      className="w-4 h-4 rounded text-[#0071BC] focus:ring-[#0071BC] cursor-pointer"
                    />
                    <label htmlFor="cmsApplyExistingCheckbox" className="text-xs text-[#4C4546] cursor-pointer">
                      Aplicar a compras anteriores
                    </label>
                  </div>

                  <button
                    type="button"
                    disabled={isSavingCmsDownloads}
                    onClick={handleSaveCmsDownloadLimit}
                    className="sm:ml-auto px-6 py-2.5 bg-[#0071BC] hover:bg-[#005a96] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingCmsDownloads ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base text-[#FBB03B]">save</span>
                        <span>Guardar Límite en BD</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==========================================
               TAB: CANALES DE SOPORTE WHATSAPP
               ========================================== */}
        {activeTab === "whatsapp" && (
          <div className="space-y-6">
            {/* Header del Tab */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <h2 className="text-base font-bold font-montserrat text-[#111C2D]">
                    Gestor de Canales de Soporte WhatsApp
                  </h2>
                </div>
                <p className="text-xs text-[#4C4546] max-w-2xl">
                  Configura números de WhatsApp independientes, textos bilingües y mensajes de bienvenida tanto para los compradores de la tienda como para los compositores afiliados.
                </p>
              </div>

              <button
                type="button"
                disabled={isSavingWhatsApp}
                onClick={handleSaveCmsWhatsApp}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isSavingWhatsApp ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">save</span>
                    <span>Guardar Canales en BD</span>
                  </>
                )}
              </button>
            </div>

            {/* Selector de Canal: Cliente (Tienda) vs Compositor */}
            <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-2xl border border-black/5 shadow-2xs">
              <span className="text-xs font-bold text-[#4C4546] mr-1 hidden sm:inline">Canal a Configurar:</span>
              <button
                type="button"
                onClick={() => setEditingWhatsAppChannel("customer_support")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition font-montserrat flex items-center gap-2 cursor-pointer ${
                  editingWhatsAppChannel === "customer_support"
                    ? "bg-[#0071BC] text-white shadow-xs"
                    : "bg-[#F0F3FF] text-[#111C2D] hover:bg-slate-200/60"
                }`}
              >
                <span className="material-symbols-outlined text-base">storefront</span>
                <span>🛍️ Atención al Cliente (Tienda)</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  cmsWhatsAppData.customer_support.is_active ? "bg-emerald-500/20 text-emerald-300" : "bg-black/10 text-slate-500"
                }`}>
                  {cmsWhatsAppData.customer_support.is_active ? "Activo" : "Inactivo"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setEditingWhatsAppChannel("composer_support")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition font-montserrat flex items-center gap-2 cursor-pointer ${
                  editingWhatsAppChannel === "composer_support"
                    ? "bg-[#111C2D] text-white shadow-xs"
                    : "bg-[#F0F3FF] text-[#111C2D] hover:bg-slate-200/60"
                }`}
              >
                <span className="material-symbols-outlined text-base">music_note</span>
                <span>🎼 Soporte a Compositores (Portal)</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  cmsWhatsAppData.composer_support.is_active ? "bg-emerald-500/20 text-emerald-300" : "bg-black/10 text-slate-500"
                }`}>
                  {cmsWhatsAppData.composer_support.is_active ? "Activo" : "Inactivo"}
                </span>
              </button>
            </div>

            {/* Contenedor Principal: Editor + Vista Previa en Vivo */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Columna Izquierda: Formulario de Configuración (7 cols) */}
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-black/5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
                      <span className="material-symbols-outlined text-lg">
                        {editingWhatsAppChannel === "customer_support" ? "storefront" : "music_note"}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold font-montserrat text-[#111C2D]">
                        {editingWhatsAppChannel === "customer_support"
                          ? "Canal de Atención a Clientes & Compradores"
                          : "Canal de Soporte Editorial a Compositores"}
                      </h3>
                      <p className="text-[11px] text-[#4C4546]">
                        {editingWhatsAppChannel === "customer_support"
                          ? "Visible en la tienda pública, ficha de partituras, carrito y portada."
                          : "Visible en el registro, inicio de sesión y portal del compositor."}
                      </p>
                    </div>
                  </div>

                  {/* Selector de Idioma para los textos */}
                  <div className="inline-flex rounded-xl bg-[#F0F3FF] p-1 border border-black/5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingWhatsAppLang("es")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition font-montserrat ${
                        editingWhatsAppLang === "es"
                          ? "bg-white text-[#111C2D] shadow-xs"
                          : "text-[#4C4546] hover:text-[#111C2D]"
                      }`}
                    >
                      🇪🇸 Español
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingWhatsAppLang("en")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition font-montserrat ${
                        editingWhatsAppLang === "en"
                          ? "bg-white text-[#0071BC] shadow-xs"
                          : "text-[#4C4546] hover:text-[#111C2D]"
                      }`}
                    >
                      🇺🇸 English
                    </button>
                  </div>
                </div>

                {/* Fila 1: Número de WhatsApp & Estado Activo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat">
                      Número de WhatsApp (con indicativo internacional) *
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 text-lg">
                        phone
                      </span>
                      <input
                        type="text"
                        value={cmsWhatsAppData[editingWhatsAppChannel].phone}
                        onChange={(e) =>
                          setCmsWhatsAppData({
                            ...cmsWhatsAppData,
                            [editingWhatsAppChannel]: {
                              ...cmsWhatsAppData[editingWhatsAppChannel],
                              phone: e.target.value,
                            },
                          })
                        }
                        placeholder="573137529693"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F0F3FF] border border-black/10 rounded-xl text-xs font-mono font-bold text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                      />
                    </div>
                    <p className="text-[10px] text-[#4C4546] mt-1 font-medium">
                      Ej: 573137529693 (57 para Colombia + 10 dígitos)
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat">
                      Disponibilidad del Canal
                    </label>
                    <div className="flex items-center gap-3 pt-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={cmsWhatsAppData[editingWhatsAppChannel].is_active}
                          onChange={(e) =>
                            setCmsWhatsAppData({
                              ...cmsWhatsAppData,
                              [editingWhatsAppChannel]: {
                                ...cmsWhatsAppData[editingWhatsAppChannel],
                                is_active: e.target.checked,
                              },
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                      <span className="text-xs font-semibold text-[#111C2D]">
                        {cmsWhatsAppData[editingWhatsAppChannel].is_active ? "Canal Activo en Tienda" : "Canal Oculto / En Pausa"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fila 2: Etiquetas & Nombre del Asesor */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat">
                      Texto del Botón Flotante ({editingWhatsAppLang === "es" ? "Español" : "Inglés"}) *
                    </label>
                    <input
                      type="text"
                      value={
                        editingWhatsAppLang === "es"
                          ? cmsWhatsAppData[editingWhatsAppChannel].label_es
                          : cmsWhatsAppData[editingWhatsAppChannel].label_en
                      }
                      onChange={(e) =>
                        setCmsWhatsAppData({
                          ...cmsWhatsAppData,
                          [editingWhatsAppChannel]: {
                            ...cmsWhatsAppData[editingWhatsAppChannel],
                            [editingWhatsAppLang === "es" ? "label_es" : "label_en"]: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-[#F0F3FF] border border-black/10 rounded-xl text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat">
                      Nombre del Asesor / Área ({editingWhatsAppLang === "es" ? "Español" : "Inglés"}) *
                    </label>
                    <input
                      type="text"
                      value={
                        editingWhatsAppLang === "es"
                          ? cmsWhatsAppData[editingWhatsAppChannel].agent_name_es
                          : cmsWhatsAppData[editingWhatsAppChannel].agent_name_en
                      }
                      onChange={(e) =>
                        setCmsWhatsAppData({
                          ...cmsWhatsAppData,
                          [editingWhatsAppChannel]: {
                            ...cmsWhatsAppData[editingWhatsAppChannel],
                            [editingWhatsAppLang === "es" ? "agent_name_es" : "agent_name_en"]: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-[#F0F3FF] border border-black/10 rounded-xl text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                    />
                  </div>
                </div>

                {/* Fila 3: Tiempo de Respuesta */}
                <div>
                  <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat">
                    Mensaje de Tiempo de Respuesta ({editingWhatsAppLang === "es" ? "Español" : "Inglés"}) *
                  </label>
                  <input
                    type="text"
                    value={
                      editingWhatsAppLang === "es"
                        ? cmsWhatsAppData[editingWhatsAppChannel].response_time_es
                        : cmsWhatsAppData[editingWhatsAppChannel].response_time_en
                    }
                    onChange={(e) =>
                      setCmsWhatsAppData({
                        ...cmsWhatsAppData,
                        [editingWhatsAppChannel]: {
                          ...cmsWhatsAppData[editingWhatsAppChannel],
                          [editingWhatsAppLang === "es" ? "response_time_es" : "response_time_en"]: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-[#F0F3FF] border border-black/10 rounded-xl text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                  />
                </div>

                {/* Fila 4: Burbuja de Bienvenida en la Ventana de Chat */}
                <div>
                  <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat">
                    Burbuja de Bienvenida en la Ventana ({editingWhatsAppLang === "es" ? "Español" : "Inglés"}) *
                  </label>
                  <textarea
                    rows={3}
                    value={
                      editingWhatsAppLang === "es"
                        ? cmsWhatsAppData[editingWhatsAppChannel].welcome_bubble_es
                        : cmsWhatsAppData[editingWhatsAppChannel].welcome_bubble_en
                    }
                    onChange={(e) =>
                      setCmsWhatsAppData({
                        ...cmsWhatsAppData,
                        [editingWhatsAppChannel]: {
                          ...cmsWhatsAppData[editingWhatsAppChannel],
                          [editingWhatsAppLang === "es" ? "welcome_bubble_es" : "welcome_bubble_en"]: e.target.value,
                        },
                      })
                    }
                    className="w-full p-3 bg-[#F0F3FF] border border-black/10 rounded-xl text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                  ></textarea>
                </div>

                {/* Fila 5: Mensaje Predeterminado de Saludo */}
                <div>
                  <label className="block text-xs font-bold text-[#111C2D] mb-1 font-montserrat">
                    Mensaje Predeterminado al Iniciar Chat ({editingWhatsAppLang === "es" ? "Español" : "Inglés"}) *
                  </label>
                  <textarea
                    rows={2}
                    value={
                      editingWhatsAppLang === "es"
                        ? cmsWhatsAppData[editingWhatsAppChannel].default_message_es
                        : cmsWhatsAppData[editingWhatsAppChannel].default_message_en
                    }
                    onChange={(e) =>
                      setCmsWhatsAppData({
                        ...cmsWhatsAppData,
                        [editingWhatsAppChannel]: {
                          ...cmsWhatsAppData[editingWhatsAppChannel],
                          [editingWhatsAppLang === "es" ? "default_message_es" : "default_message_en"]: e.target.value,
                        },
                      })
                    }
                    className="w-full p-3 bg-[#F0F3FF] border border-black/10 rounded-xl text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                  ></textarea>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    disabled={isSavingWhatsApp}
                    onClick={handleSaveCmsWhatsApp}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-sm">save</span>
                    Guardar Cambios de WhatsApp en BD
                  </button>
                </div>
              </div>

              {/* Columna Derecha: Vista Previa en Vivo de la Ventana Flotante (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0071BC] font-montserrat flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">visibility</span>
                    Vista Previa en Vivo para el Cliente
                  </span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                    {editingWhatsAppLang.toUpperCase()}
                  </span>
                </div>

                {/* Simulación de la Ventana Emergente */}
                <div className="bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden font-sans">
                  {/* Cabecera */}
                  <div className="bg-[#111C2D] text-white p-4 relative">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-emerald-400 font-bold">
                          <span className="material-symbols-outlined text-xl">chat</span>
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-[#111C2D]"></span>
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold font-montserrat text-white truncate">
                            Piano Colombia
                          </h4>
                          <span className="material-symbols-outlined text-[11px] text-blue-400">verified</span>
                        </div>
                        <p className="text-[11px] text-emerald-400 font-semibold truncate font-montserrat">
                          {editingWhatsAppLang === "es"
                            ? cmsWhatsAppData[editingWhatsAppChannel].agent_name_es
                            : cmsWhatsAppData[editingWhatsAppChannel].agent_name_en}
                        </p>
                        <p className="text-[10px] text-white/60 truncate">
                          {editingWhatsAppLang === "es"
                            ? cmsWhatsAppData[editingWhatsAppChannel].response_time_es
                            : cmsWhatsAppData[editingWhatsAppChannel].response_time_en}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Cuerpo del Chat */}
                  <div className="p-4 bg-[#ECE5DD]/40 space-y-3">
                    <div className="flex justify-center">
                      <span className="text-[10px] bg-black/10 text-slate-600 px-2.5 py-0.5 rounded-full font-medium">
                        Canal Oficial WhatsApp
                      </span>
                    </div>

                    <div className="flex items-start gap-2 max-w-[95%]">
                      <div className="bg-white rounded-2xl rounded-tl-xs p-3 shadow-xs text-xs text-[#111C2D] space-y-1.5 leading-relaxed">
                        <p className="font-bold text-[#0071BC] text-[10px] font-montserrat">
                          Piano Colombia •{" "}
                          {editingWhatsAppLang === "es"
                            ? cmsWhatsAppData[editingWhatsAppChannel].label_es
                            : cmsWhatsAppData[editingWhatsAppChannel].label_en}
                        </p>
                        <p className="text-[11px]">
                          {editingWhatsAppLang === "es"
                            ? cmsWhatsAppData[editingWhatsAppChannel].welcome_bubble_es
                            : cmsWhatsAppData[editingWhatsAppChannel].welcome_bubble_en}
                        </p>
                        <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 pt-1">
                          <span>En línea</span>
                          <span className="material-symbols-outlined text-xs text-blue-500">done_all</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pie con Previsualización de Envío */}
                  <div className="p-4 bg-white border-t border-black/5 space-y-2.5">
                    <div className="p-2.5 bg-[#F0F3FF] rounded-xl border border-black/5 text-[11px] text-[#4C4546]">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                        Mensaje preparado:
                      </span>
                      <p className="italic">
                        "{editingWhatsAppLang === "es"
                          ? cmsWhatsAppData[editingWhatsAppChannel].default_message_es
                          : cmsWhatsAppData[editingWhatsAppChannel].default_message_en}"
                      </p>
                    </div>

                    <div className="w-full py-2.5 px-4 bg-[#25D366] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center justify-center gap-2 cursor-pointer">
                      <span className="material-symbols-outlined text-base">send</span>
                      <span>Iniciar Chat en WhatsApp</span>
                    </div>
                  </div>
                </div>

                {/* Previsualización del Botón Flotante */}
                <div className="p-4 bg-slate-100/70 rounded-2xl border border-black/5 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-montserrat block">
                    Previsualización del Botón Flotante en Pantalla:
                  </span>
                  <div className="flex justify-end pt-1">
                    <div className="flex items-center gap-2.5 bg-white text-[#111C2D] border border-emerald-500/40 rounded-full px-4 py-2.5 shadow-md">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="material-symbols-outlined text-emerald-600 text-base">chat</span>
                      <span className="text-xs font-bold font-montserrat">
                        {editingWhatsAppLang === "es"
                          ? cmsWhatsAppData[editingWhatsAppChannel].label_es
                          : cmsWhatsAppData[editingWhatsAppChannel].label_en}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </form>

    </div>
  );
}
