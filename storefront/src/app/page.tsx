"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { MOCK_COMPOSERS, MOCK_SCORES } from "@/lib/mock-data";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SaveScoreButton from "@/components/SaveScoreButton";
import { getHeroCms, getCmsCategories, getStoreFeaturedComposers, getStoreFeaturedScores, getStoreBlogPosts } from "@/lib/api-client";

function FeaturedComposerCard({ comp }: { comp: any }) {
  const [imgError, setImgError] = useState(false);

  const photo = comp.photo_url || comp.image_url;
  const showPhoto = Boolean(photo) && !imgError;
  const initials =
    comp.initials ||
    (comp.name
      ? comp.name
          .split(" ")
          .filter(Boolean)
          .map((n: string) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "PC");

  const bio = comp.bio_es || comp.bio || comp.short_bio || "Compositor destacado del catálogo de Piano Colombia.";
  const subtitle = [comp.era || comp.period, comp.region || comp.origin].filter(Boolean).join(" · ") || "Colombia";

  return (
    <div className="group flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-black/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="relative w-28 h-28 mb-4">
        <div className="absolute inset-0 rounded-full bg-[#FBB03B]/40 blur-md group-hover:blur-lg group-hover:scale-110 transition-all"></div>
        {showPhoto ? (
          <img
            src={photo}
            alt={comp.name}
            onError={() => setImgError(true)}
            className="relative w-28 h-28 rounded-full object-cover border-2 border-white shadow-md"
          />
        ) : (
          <div className="relative w-28 h-28 rounded-full bg-[#F0F3FF] border-2 border-white flex items-center justify-center text-3xl font-montserrat font-black text-[#111C2D] shadow-md">
            {initials}
          </div>
        )}
        <span className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#111C2D] text-white flex items-center justify-center text-xs shadow border border-white">
          <span className="material-symbols-outlined text-sm">
            {comp.category_icon || "piano"}
          </span>
        </span>
      </div>
      <h4 className="text-lg font-bold font-montserrat text-[#111C2D] group-hover:text-[#0071BC] transition-colors line-clamp-1">
        {comp.name}
      </h4>
      <span className="text-[11px] font-bold text-[#4C4546] uppercase tracking-wider mt-0.5 font-montserrat line-clamp-1">
        {subtitle}
      </span>
      <p className="text-xs text-[#4C4546] mt-2 line-clamp-2 leading-relaxed min-h-[32px]" title={bio}>
        {bio}
      </p>
      <div className="mt-6 pt-3 flex items-center justify-between w-full border-t border-black/5 text-xs">
        <span className="font-bold text-[#0071BC]">
          {comp.scoreCount || 0} {comp.scoreCount === 1 ? "Partitura" : "Partituras"}
        </span>
        <Link
          href={`/compositores/${comp.slug || comp.id}`}
          className="font-bold text-[#111C2D] hover:underline flex items-center font-montserrat"
        >
          Ver perfil <span className="material-symbols-outlined text-xs ml-0.5">chevron_right</span>
        </Link>
      </div>
    </div>
  );
}

export default function Home() {
  const [isPlayingHero, setIsPlayingHero] = useState(false);
  const [currency, setCurrency] = useState<"COP" | "USD">("COP");
  const [activeComposerFilter, setActiveComposerFilter] = useState("todos");
  const [featuredComposersData, setFeaturedComposersData] = useState<{
    tabs: any[];
    all_composers: any[];
    recent_composers: any[];
    total_registered_composers: number;
  }>({
    tabs: [],
    all_composers: [],
    recent_composers: [],
    total_registered_composers: 0,
  });
  const [featuredScores, setFeaturedScores] = useState<any[]>([]);
  const [isLoadingFeaturedScores, setIsLoadingFeaturedScores] = useState(true);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0);

  const formatAudioTime = (sec: number) => {
    if (isNaN(sec) || !isFinite(sec)) return "00:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Estado dinámico del CMS Hero de la BD
  const [heroData, setHeroData] = useState<any>({
    hero_title: "La tradición del piano colombiano y latinoamericano en tus manos.",
    hero_subtitle: "Un proyecto cultural con enfoque musical riguroso en pro del rescate, edición filológica y difusión de obras patrimoniales y contemporáneas para teclado.",
    btn1_text: "Explorar Partituras",
    btn1_url: "/tienda",
    btn2_text: "Conocer Compositores",
    btn2_url: "/compositores",
    footer_notice: "Edición revisada con digitaciones de concierto y notas históricas bilingües (ES/EN).",
    featured_genre: "PASILLO LÍRICO",
    featured_title: "Malvaloca",
    featured_author: "Luis A. Calvo (1882–1945) · Op. 12",
    featured_tempo: "Andante cantabile",
    featured_ismn: "ISMN 979-0-901314-18-2",
    featured_audio_sample: "Pasillo No. 1 — L. A. Calvo",
    featured_badge_text: "GRABADO URTEXT 100% Alta Resolución",
    featured_link_url: "/partitura/malvaloca",
  });

  // Estadísticas dinámicas reales de la Base de Datos
  const [statsCards, setStatsCards] = useState<any[]>([
    {
      id: "card_scores",
      display_value: "4+",
      title: "Partituras Digitales",
      subtitle: "Editadas bajo rigurosa musicología",
    },
    {
      id: "card_composers",
      display_value: "4+",
      title: "Compositores",
      subtitle: "Desde el siglo XIX hasta hoy",
    },
    {
      id: "card_genres",
      display_value: "6",
      title: "Ritmos Tradicionales",
      subtitle: "Piano Solo, Piano a 4 Manos, Cámara...",
    },
    {
      id: "card_format",
      display_value: "PDF",
      has_bolt: true,
      title: "Descarga Inmediata",
      subtitle: "Con licencia legal autorizada",
    },
  ]);

  // Estado dinámico de Categorías Principales cargadas desde PostgreSQL
  const [categoriesList, setCategoriesList] = useState<any[]>([
    {
      id: "cat_piano_solo",
      title: "Piano Solo",
      slug: "piano-solo",
      description: "Obras maestras para recital, concurso y profundización técnica individual. Pasillos virtuosos, bambucos de concierto e intermezzos líricos.",
      icon: "piano",
      cta_text: "Explorar piezas solistas",
      link: "/tienda?categoria=piano-solo",
      display_count: "3 Obras",
    },
    {
      id: "cat_piano_4_manos",
      title: "Piano a 4 Manos",
      slug: "piano-a-4-manos",
      description: "Dúos concertantes y reducciones orquestales a cuatro manos. Ideal para cátedras de música de cámara y recitales colaborativos a dos intérpretes.",
      icon: "group",
      cta_text: "Ver dúos de piano",
      link: "/tienda?categoria=piano-a-4-manos",
      display_count: "1 Obra",
    },
    {
      id: "cat_piano_orquesta",
      title: "Piano y Orquesta",
      slug: "piano-y-orquesta",
      description: "Partituras de dirección, guiones generales y reducciones a segundo piano de conciertos para piano y orquesta sinfónica colombiana.",
      icon: "stadium",
      cta_text: "Catálogo orquestal",
      link: "/tienda?categoria=piano-y-orquesta",
      display_count: "0 Conciertos",
    },
    {
      id: "cat_musica_camara",
      title: "Música de Cámara",
      slug: "musica-de-camara",
      description: "Tríos con violín y violonchelo, sonatas para instrumentos solistas con acompañamiento de piano y ensambles folclóricos de cámara.",
      icon: "diversity_3",
      cta_text: "Explorar cámara",
      link: "/tienda?categoria=musica-de-camara",
      display_count: "0 Partituras",
    },
    {
      id: "cat_piezas_pedagogicas",
      title: "Piezas Pedagógicas",
      slug: "piezas-pedagogicas",
      description: "Metodologías progresivas, iniciación al teclado y repertorio graduado por niveles (Preparatorio al Nivel 6) con canciones tradicionales colombianas.",
      icon: "school",
      cta_text: "Ver repertorio didáctico",
      link: "/tienda?categoria=piezas-pedagogicas",
      display_count: "0 Cuadernos",
    },
    {
      id: "cat_piano_electronica",
      title: "Piano y Electrónica",
      slug: "piano-y-electronica",
      description: "Vanguardia contemporánea, obras para piano preparado con cinta magnética, procesamiento digital en vivo (Max/MSP) y paisajes bio-acústicos.",
      icon: "graphic_eq",
      cta_text: "Explorar vanguardia",
      link: "/tienda?categoria=piano-y-electronica",
      display_count: "0 Obras",
    },
  ]);

  useEffect(() => {
    async function fetchHero() {
      try {
        const res = await getHeroCms();
        if (res) {
          if (res.stats && Array.isArray(res.stats.cards) && res.stats.cards.length > 0) {
            setStatsCards(res.stats.cards);
          }
          if (res.categories && Array.isArray(res.categories) && res.categories.length > 0) {
            setCategoriesList(res.categories);
          } else {
            getCmsCategories().then((cats) => {
              if (Array.isArray(cats) && cats.length > 0) setCategoriesList(cats);
            }).catch(() => {});
          }
          if (res.hero) {
            const h = res.hero;
            setHeroData({
              hero_title: h.hero_title || `${h.title_part1 || ""} ${h.title_part2_highlight || ""}`.trim() || "La tradición del piano colombiano y latinoamericano en tus manos.",
              hero_subtitle: h.hero_subtitle || h.description || "Un proyecto cultural con enfoque musical riguroso en pro del rescate, edición filológica y difusión de obras patrimoniales y contemporáneas para teclado.",
              btn1_text: h.btn1_text || h.button1_text || "Explorar Partituras",
              btn1_url: h.btn1_url || h.button1_url || "/tienda",
              btn2_text: h.btn2_text || h.button2_text || "Conocer Compositores",
              btn2_url: h.btn2_url || h.button2_url || "/compositores",
              footer_notice: h.footer_notice || h.urtext_badge_text || "Edición revisada con digitaciones de concierto y notas históricas bilingües (ES/EN).",
              featured_genre: h.featured_genre || "PASILLO LÍRICO",
              featured_title: h.featured_title || "Malvaloca",
              featured_author: h.featured_author || "Luis A. Calvo (1882–1945) · Op. 12",
              featured_tempo: h.featured_tempo || "Andante cantabile",
              featured_ismn: h.featured_ismn || "ISMN 979-0-901314-18-2",
              featured_audio_sample: h.featured_audio_sample || "Pasillo No. 1 — L. A. Calvo",
              featured_audio_url: h.featured_audio_url || "",
              featured_badge_text: h.featured_badge_text || "GRABADO URTEXT 100% Alta Resolución",
              featured_link_url: h.featured_link_url || "/partitura/malvaloca",
            });
          }
        }
      } catch (err) {
        console.warn("Error cargando CMS Hero en home:", err);
      }

      // Cargar Compositores Destacados dinámicos desde Medusa / PostgreSQL
      try {
        const compRes = await getStoreFeaturedComposers();
        if (compRes) {
          setFeaturedComposersData({
            tabs: compRes.tabs || [],
            all_composers: compRes.all_composers || [],
            recent_composers: compRes.recent_composers || [],
            total_registered_composers:
              compRes.total_registered_composers ||
              compRes.all_composers?.length ||
              0,
          });
        }
      } catch (err) {
        console.warn("Error cargando compositores destacados en home:", err);
      }

      // Cargar Partituras Destacadas dinámicas desde Medusa / PostgreSQL
      try {
        const scoresRes = await getStoreFeaturedScores();
        setFeaturedScores(scoresRes || []);
      } catch (err) {
        console.warn("Error cargando partituras destacadas en home:", err);
      } finally {
        setIsLoadingFeaturedScores(false);
      }

      // Cargar Artículos de Bitácora / Blog dinámicos
      try {
        const blogRes = await getStoreBlogPosts({ limit: 3 });
        if (blogRes && Array.isArray(blogRes.posts)) {
          setBlogPosts(blogRes.posts);
        }
      } catch (err) {
        console.warn("Error cargando artículos de blog en home:", err);
      }
    }
    fetchHero();
  }, []);

  // Tabs dinámicos para compositores destacados (filtrando los que no tienen compositores activos)
  const visibleTabs = [
    ...(featuredComposersData.all_composers && featuredComposersData.all_composers.length > 0
      ? [{ id: "todos", label: "Todos" }]
      : []),
    ...(featuredComposersData.tabs || []).map((t: any) => ({ id: t.id, label: t.name })),
  ];

  const displayedComposers =
    activeComposerFilter === "todos"
      ? featuredComposersData.all_composers || []
      : (featuredComposersData.tabs?.find((t: any) => t.id === activeComposerFilter)?.composers || []);

  useEffect(() => {
    if (visibleTabs.length > 0 && !visibleTabs.some((t) => t.id === activeComposerFilter)) {
      setActiveComposerFilter(visibleTabs[0].id);
    }
  }, [visibleTabs, activeComposerFilter]);

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
                  {heroData.hero_title}
                </h1>

                {/* Subtítulo Descriptor */}
                <p className="font-inter text-base sm:text-lg text-[#4C4546] max-w-xl leading-relaxed">
                  {heroData.hero_subtitle}
                </p>

                {/* Botones CTA Principales */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href={heroData.btn1_url}
                    className="group flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#FBB03B] text-[#111C2D] font-montserrat font-extrabold text-sm uppercase tracking-wider shadow-md hover:shadow-xl hover:bg-[#e09b2d] hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <span>{heroData.btn1_text}</span>
                    <span className="material-symbols-outlined text-lg text-[#111C2D] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </Link>

                  <Link
                    href={heroData.btn2_url}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/90 backdrop-blur-md text-[#111C2D] border border-black/10 font-montserrat font-bold text-sm shadow-xs hover:bg-[#F0F3FF] hover:shadow-md transition-all"
                  >
                    <span className="material-symbols-outlined text-[#0071BC]">library_music</span>
                    <span>{heroData.btn2_text}</span>
                  </Link>
                </div>

                {/* Trust notation badge */}
                <div className="flex items-center gap-2 pt-2 text-[#4C4546]">
                  <span className="material-symbols-outlined text-[#0071BC] text-lg">verified</span>
                  <span className="text-xs font-medium">{heroData.footer_notice}</span>
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
                      <span className="ml-2 text-[10px] font-bold text-[#4C4546] uppercase tracking-widest font-montserrat">
                        Edición Urtext Certificada
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#F0F3FF] text-[10px] font-bold text-[#0071BC] font-montserrat">{heroData.featured_ismn}</span>
                  </div>

                  {/* Showcase Content */}
                  <div className="relative rounded-2xl bg-[#F9F9FF] p-5 shadow-inner mt-4 overflow-hidden border border-black/5">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-extrabold text-[#0071BC] uppercase tracking-wider block font-montserrat">{heroData.featured_genre}</span>
                        <h3 className="text-xl font-black font-montserrat text-[#111C2D]">{heroData.featured_title}</h3>
                        <p className="text-xs text-[#4C4546] font-medium">{heroData.featured_author}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FBB03B]/30 text-[#111C2D] font-montserrat">{heroData.featured_tempo}</span>
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

                    {/* Reproductor de Audio Demo Administrable */}
                    <div className="mt-4 flex flex-col gap-2 p-3 rounded-xl bg-white shadow-xs border border-black/5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            type="button"
                            onClick={() => {
                              const audioEl = document.getElementById("hero-audio-player") as HTMLAudioElement;
                              if (audioEl && heroData.featured_audio_url) {
                                if (!audioEl.paused) {
                                  audioEl.pause();
                                  setIsPlayingHero(false);
                                } else {
                                  audioEl.play().then(() => {
                                    setIsPlayingHero(true);
                                  }).catch((err) => {
                                    console.warn("Reproducción de audio:", err.message);
                                  });
                                }
                              } else {
                                setIsPlayingHero(!isPlayingHero);
                              }
                            }}
                            className="w-10 h-10 shrink-0 rounded-full bg-[#111C2D] text-[#FBB03B] flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-xl">{isPlayingHero ? "pause" : "play_arrow"}</span>
                          </button>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-extrabold text-[#0071BC] uppercase tracking-wider font-montserrat">Muestra en Vivo</span>
                            <span className="text-xs font-bold text-[#111C2D] truncate font-montserrat">{heroData.featured_audio_sample}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <span className={`h-2 w-1 bg-[#0071BC] rounded-full transition-all ${isPlayingHero ? 'animate-pulse' : ''}`}></span>
                          <span className={`h-4 w-1 bg-[#0071BC] rounded-full transition-all ${isPlayingHero ? 'animate-pulse' : ''}`}></span>
                          <span className={`h-6 w-1 bg-[#FBB03B] rounded-full transition-all ${isPlayingHero ? 'animate-pulse' : ''}`}></span>
                          <span className={`h-3 w-1 bg-[#C1272D] rounded-full transition-all ${isPlayingHero ? 'animate-pulse' : ''}`}></span>
                          <span className="text-[10px] text-[#4C4546] font-semibold ml-1">
                            {audioDuration ? `${formatAudioTime(audioCurrentTime)} / ${formatAudioTime(audioDuration)}` : "01:42"}
                          </span>
                        </div>
                      </div>

                      {/* Elemento de Audio Nativo HTML5 */}
                      {heroData.featured_audio_url ? (
                        <audio
                          id="hero-audio-player"
                          key={heroData.featured_audio_url}
                          src={heroData.featured_audio_url}
                          crossOrigin="anonymous"
                          preload="metadata"
                          onLoadedMetadata={(e) => setAudioDuration(e.currentTarget.duration)}
                          onTimeUpdate={(e) => setAudioCurrentTime(e.currentTarget.currentTime)}
                          onPlay={() => setIsPlayingHero(true)}
                          onPause={() => setIsPlayingHero(false)}
                          onEnded={() => {
                            setIsPlayingHero(false);
                            setAudioCurrentTime(0);
                          }}
                          className="w-full h-8 mt-1"
                          controls
                        />
                      ) : (
                        <div className="text-[10px] text-slate-400 italic text-center py-1">
                          (Sin muestra de audio configurada)
                        </div>
                      )}
                    </div>
                  </div>



                  {/* Card Footer: Solo botón Ver Partitura */}
                  <div className="mt-5 pt-4 border-t border-black/5 flex items-center justify-end">
                    <Link
                      href={heroData.featured_link_url || "/tienda"}
                      className="px-5 py-2.5 bg-[#111C2D] hover:bg-[#0071BC] text-white rounded-xl text-xs font-bold font-montserrat transition flex items-center gap-2 shadow-sm group"
                    >
                      <span>Ver Partitura</span>
                      <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">north_east</span>
                    </Link>
                  </div>
                </div>
              </div>


            </div>

            {/* Quick Stats Counter Strip Dinámico de Base de Datos (Bento Pattern) */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-white shadow-xs border border-black/5">
              {statsCards.map((card: any, idx: number) => (
                <div key={card.id || idx} className="flex flex-col p-4 rounded-xl hover:bg-[#F0F3FF] transition-colors">
                  <div className="flex items-center gap-1">
                    <span className={`text-3xl font-black font-montserrat tracking-tight ${idx === 1 ? 'text-[#0071BC]' : 'text-[#111C2D]'}`}>
                      {card.display_value || card.auto_value || "0"}
                    </span>
                    {card.has_bolt && (
                      <span className="material-symbols-outlined text-[#0071BC] text-xl">bolt</span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-[#111C2D] font-montserrat mt-1">{card.title}</span>
                  <span className="text-[11px] text-[#4C4546] mt-0.5 truncate">{card.subtitle}</span>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ==========================================
               SECCIÓN 2: CATEGORÍAS PRINCIPALES (BENTO GRID DESDE BD)
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
                <span>{categoriesList.length} Formatos Disponibles</span>
                <span>•</span>
                <span>Actualización en Tiempo Real</span>
              </div>
            </div>

            {/* Responsive Bento Grid de Categorías Dinámicas de BD */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoriesList.map((cat, idx) => {
                // Alternar colores sutiles de badge para mantener estética vibrante
                const badgeStyle =
                  idx % 3 === 0
                    ? "bg-[#FBB03B]/20 text-[#111C2D]"
                    : idx % 3 === 1
                    ? "bg-[#F0F3FF] text-[#0071BC]"
                    : "bg-[#C1272D]/10 text-[#C1272D]";

                return (
                  <Link
                    key={cat.id || idx}
                    href={cat.link || `/tienda?categoria=${cat.slug || encodeURIComponent(cat.title)}`}
                    className="group flex flex-col justify-between p-6 rounded-2xl bg-white border border-black/5 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#F0F3FF] flex items-center justify-center text-[#111C2D] group-hover:bg-[#111C2D] group-hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-3xl">{cat.icon || "piano"}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold font-montserrat ${badgeStyle}`}>
                          {cat.display_count || `${cat.count ?? 0} ${cat.count_unit || "Obras"}`}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold font-montserrat text-[#111C2D] group-hover:text-[#0071BC] transition-colors">
                        {cat.title}
                      </h3>
                      <p className="text-xs text-[#4C4546] mt-2 leading-relaxed line-clamp-4">
                        {cat.description}
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-between text-xs font-bold text-[#0071BC] font-montserrat group-hover:text-[#111C2D]">
                      <span>{cat.cta_text || "Explorar repertorio"}</span>
                      <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">east</span>
                    </div>
                  </Link>
                );
              })}
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
              {visibleTabs.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-[#F0F3FF] self-start md:self-auto border border-black/5">
                  {visibleTabs.map((tab) => (
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
              )}
            </div>

            {/* Grid Dynamic Profiles with circular portraits & golden glow */}
            {displayedComposers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayedComposers.map((comp: any) => (
                  <FeaturedComposerCard key={comp.id} comp={comp} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-[#4C4546] bg-[#F0F3FF]/50 rounded-2xl border border-dashed border-black/10">
                <span className="material-symbols-outlined text-4xl text-[#111C2D]/30 mb-2">person_search</span>
                <p className="text-sm font-montserrat font-medium">No hay compositores configurados para esta categoría en este momento.</p>
              </div>
            )}

            {/* Extended Composers Chips Row & Link Dinámicos */}
            <div className="mt-10 p-4 rounded-2xl bg-[#F0F3FF] border border-black/5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start text-xs">
                <span className="font-bold text-[#111C2D] uppercase tracking-wider font-montserrat mr-1">
                  Otros autores:
                </span>
                {featuredComposersData.recent_composers && featuredComposersData.recent_composers.length > 0 ? (
                  featuredComposersData.recent_composers.map((comp: any, idx: number) => {
                    const colors = ["bg-[#111C2D]", "bg-[#FBB03B]", "bg-[#0071BC]", "bg-[#C1272D]"];
                    const dotColor = colors[idx % colors.length];
                    return (
                      <Link
                        key={comp.id || idx}
                        href={`/compositores/${comp.slug || comp.id}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-[#111C2D] font-medium shadow-2xs hover:shadow-xs hover:border-[#0071BC]/40 border border-transparent transition cursor-pointer"
                      >
                        <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
                        <span>{comp.name}</span>
                        {comp.era && (
                          <span className="text-slate-400 text-[11px] font-normal">({comp.era})</span>
                        )}
                      </Link>
                    );
                  })
                ) : (
                  <>
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
                  </>
                )}
              </div>
              <Link
                href="/compositores"
                className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-[#0071BC] hover:underline font-montserrat group"
              >
                <span>
                  {featuredComposersData.total_registered_composers > 0
                    ? `Ver los ${featuredComposersData.total_registered_composers} Compositores`
                    : "Ver todos los Compositores"}
                </span>
                <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-1">
                  arrow_forward
                </span>
              </Link>
            </div>

          </div>
        </section>

        {/* ==========================================
               SECCIÓN 4: PARTITURAS DESTACADAS (STOREFRONT)
               Se oculta automáticamente si no hay partituras seleccionadas
               ========================================== */}
        {!isLoadingFeaturedScores && featuredScores.length === 0 ? null : (
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
                    className={`px-3 py-1 rounded-lg text-xs font-montserrat font-bold transition-colors cursor-pointer ${
                      currency === "COP" ? "bg-[#111C2D] text-white shadow-xs" : "text-[#4C4546] hover:text-[#111C2D]"
                    }`}
                  >
                    COP
                  </button>
                  <button
                    onClick={() => setCurrency("USD")}
                    className={`px-3 py-1 rounded-lg text-xs font-montserrat font-bold transition-colors cursor-pointer ${
                      currency === "USD" ? "bg-[#111C2D] text-white shadow-xs" : "text-[#4C4546] hover:text-[#111C2D]"
                    }`}
                  >
                    USD
                  </button>
                </div>
              </div>

              {/* Grid de Partituras Destacadas Dinámicas (Hasta 6) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredScores.map((score) => {
                  const composerName =
                    score.composer_name ||
                    score.composer?.name ||
                    (score.composer?.first_name ? `${score.composer.first_name} ${score.composer.last_name || ""}`.trim() : "Piano Colombia");
                  const priceCOP = Number(score.price_cop ?? score.priceCOP ?? 0);
                  const priceUSD = Number(score.price_usd ?? score.priceUSD ?? 0);
                  const genre = score.genre || score.category || "PIANO SOLO";
                  const difficulty = score.difficulty || score.level || "INTERMEDIO";
                  const description = score.description_es || score.description || "";
                  const scoreSlug = score.slug || score.id;

                  // Extraer imagen de portada / preview si existe
                  const coverImage = (() => {
                    const p = score.preview_images || score.previewPages;
                    if (!p) return null;
                    if (Array.isArray(p) && p.length > 0) {
                      return typeof p[0] === "string" ? p[0].trim() : null;
                    }
                    if (typeof p === "string") {
                      const trimmed = p.trim();
                      if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
                        try {
                          const parsed = JSON.parse(trimmed);
                          if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
                        } catch {}
                      }
                      const parts = trimmed.split(/[\s,]+/).filter((s) => s.startsWith("http") || s.startsWith("/"));
                      if (parts.length > 0) return parts[0];
                      if (trimmed.startsWith("http") || trimmed.startsWith("/")) return trimmed;
                    }
                    return null;
                  })();

                  // Adaptador normalizado para SaveScoreButton y Cart
                  const normalizedScore = {
                    id: score.id,
                    title: score.title,
                    slug: scoreSlug,
                    composer: composerName,
                    category: genre,
                    genre,
                    level: difficulty,
                    difficulty,
                    description,
                    priceCOP,
                    priceUSD,
                    price_cop: priceCOP,
                    price_usd: priceUSD,
                  };

                  return (
                    <div key={score.id} className="group flex flex-col rounded-xl bg-white border border-black/8 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden">
                      
                      {/* Miniatura Superior de la Partitura - Altura Compacta (h-36 sm:h-40) */}
                      <div className="relative h-36 sm:h-40 bg-[#F8FAFC] p-2.5 flex flex-col justify-between overflow-hidden border-b border-black/5 select-none">
                        
                        {/* Foto / Muestra Real de la Partitura */}
                        {coverImage ? (
                          <div className="absolute inset-0 flex items-center justify-center p-2 bg-[#FAF9F6]">
                            <img
                              src={coverImage}
                              alt={score.title}
                              className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-300 rounded"
                              loading="lazy"
                              onError={(e) => {
                                // Fallback a pentagramas si la imagen falla al cargar
                                (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                        ) : (
                          /* Pentagrama Clásico Estilizado Compacto como Fallback */
                          <div className="absolute inset-0 flex flex-col justify-center items-center px-5 py-3 bg-[#FAF9F6] pointer-events-none">
                            <div className="w-full space-y-1 opacity-25">
                              <div className="h-[1px] w-full bg-slate-600"></div>
                              <div className="h-[1px] w-full bg-slate-600"></div>
                              <div className="h-[1px] w-full bg-slate-600"></div>
                              <div className="h-[1px] w-full bg-slate-600"></div>
                              <div className="h-[1px] w-full bg-slate-600"></div>
                            </div>
                            <div className="mt-2 text-center">
                              <span className="font-serif italic text-xs font-bold text-[#111C2D]/80 line-clamp-1 block">
                                {score.title}
                              </span>
                              <span className="text-[10px] text-[#4C4546]/70 font-montserrat block mt-0.5">
                                {composerName}
                              </span>
                            </div>
                            <div className="w-full space-y-1 opacity-25 mt-2">
                              <div className="h-[1px] w-full bg-slate-600"></div>
                              <div className="h-[1px] w-full bg-slate-600"></div>
                              <div className="h-[1px] w-full bg-slate-600"></div>
                              <div className="h-[1px] w-full bg-slate-600"></div>
                              <div className="h-[1px] w-full bg-slate-600"></div>
                            </div>
                          </div>
                        )}

                        {/* Badges Superiores Flotantes */}
                        <div className="relative z-10 flex items-center justify-between gap-1.5">
                          <span className="px-2 py-0.5 rounded-full font-montserrat font-extrabold text-[9px] uppercase shadow-2xs bg-white/95 text-[#111C2D] border border-black/5 backdrop-blur-xs">
                            {genre}
                          </span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full shadow-2xs font-montserrat bg-white/95 text-[#4C4546] border border-black/5 backdrop-blur-xs">
                            {difficulty}
                          </span>
                        </div>

                        {/* Hover Action Overlay */}
                        <div className="absolute inset-0 bg-[#111C2D]/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
                          <Link
                            href={`/partitura/${scoreSlug}`}
                            className="w-10 h-10 rounded-full bg-[#FBB03B] text-[#111C2D] shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                            title="Ver partitura"
                          >
                            <span className="material-symbols-outlined text-xl">visibility</span>
                          </Link>
                        </div>

                        {/* Badges Inferiores de la Miniatura */}
                        <div className="relative z-10 flex items-center justify-between text-[9px] font-bold">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/90 text-slate-700 backdrop-blur-xs shadow-2xs border border-black/5">
                            <span className="material-symbols-outlined text-[12px] text-[#0071BC]">picture_as_pdf</span>
                            Formato Vectorial
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-white/90 text-[#0071BC] backdrop-blur-xs shadow-2xs border border-black/5 font-semibold">
                            Edición Urtext
                          </span>
                        </div>
                      </div>

                      {/* Cuerpo de la Tarjeta - Compacto y Proporcional */}
                      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-sm sm:text-base font-bold text-[#111C2D] font-montserrat group-hover:text-[#0071BC] transition-colors leading-snug line-clamp-1">
                            {score.title}
                          </h3>
                          <p className="text-xs text-[#0071BC] font-semibold mt-0.5 line-clamp-1">{composerName}</p>
                          <p className="text-[11px] text-[#4C4546] mt-1.5 line-clamp-2 leading-relaxed font-normal">
                            {description || "Edición Urtext digital de alta fidelidad para piano."}
                          </p>
                        </div>

                        {/* Fila de Precios y Acciones */}
                        <div className="mt-3 pt-2.5 border-t border-black/5 flex justify-between items-center">
                          <div>
                            <span className="text-sm sm:text-base font-black text-[#111C2D] font-montserrat">
                              {currency === "COP" ? `$${priceCOP.toLocaleString('es-CO')} COP` : `$${priceUSD} USD`}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-medium -mt-0.5">
                              {currency === "COP" ? `~$${priceUSD} USD` : `~$${priceCOP.toLocaleString('es-CO')} COP`}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <SaveScoreButton score={normalizedScore} variant="icon" />
                            <Link
                              href={`/partitura/${scoreSlug}`}
                              className="w-8 h-8 rounded-lg bg-[#111C2D] text-white hover:bg-[#FBB03B] hover:text-[#111C2D] transition-all shadow-xs flex items-center justify-center cursor-pointer"
                              title="Ver partitura"
                            >
                              <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                            </Link>
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          </section>
        )}

        {/* ==========================================
               SECCIÓN 5: BITÁCORA & NOTICIAS
               ========================================== */}
        {blogPosts.length > 0 && (
          <section className="w-full py-16 bg-[#F0F3FF]/40 border-t border-black/5" id="bitacora">
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
                {blogPosts.map((post) => {
                  const dateStr = (() => {
                    try {
                      if (!post.published_at) return "";
                      const d = new Date(post.published_at);
                      return d.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
                    } catch {
                      return post.published_at || "";
                    }
                  })();

                  return (
                    <div key={post.id} className="bg-white rounded-2xl border border-black/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group overflow-hidden">
                      {/* Portada del Artículo si existe */}
                      {post.cover_image && (
                        <div className="relative h-44 w-full bg-slate-100 overflow-hidden border-b border-black/5">
                          <img
                            src={post.cover_image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="px-3 py-1 bg-white/95 backdrop-blur-md text-[#0071BC] rounded-full font-bold text-xs shadow-xs border border-black/5">
                              {post.category}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div className="space-y-3">
                          {!post.cover_image && (
                            <div className="flex justify-between items-center text-xs">
                              <span className="px-3 py-1 bg-[#F0F3FF] text-[#0071BC] rounded-full font-bold">{post.category}</span>
                              <span className="text-[#4C4546] font-medium">{dateStr}</span>
                            </div>
                          )}
                          {post.cover_image && (
                            <div className="flex justify-between items-center text-xs text-[#4C4546]">
                              <span className="font-medium">{dateStr}</span>
                              <span className="text-[11px] text-slate-400">{post.read_time || "5 min"}</span>
                            </div>
                          )}
                          <h3 className="text-lg font-bold font-montserrat text-[#111C2D] group-hover:text-[#0071BC] transition-colors leading-snug line-clamp-2">
                            {post.title}
                          </h3>
                          {post.excerpt && (
                            <p className="text-xs text-[#4C4546] font-normal leading-relaxed line-clamp-2">
                              {post.excerpt}
                            </p>
                          )}
                        </div>

                        <div className="pt-4 mt-4 border-t border-black/5 flex justify-between items-center">
                          <span className="text-xs text-[#4C4546] font-medium line-clamp-1">Por {post.author}</span>
                          <Link href={`/blog/${post.slug}`} className="text-xs font-bold text-[#0071BC] hover:text-[#111C2D] transition font-montserrat inline-flex items-center gap-1 group-hover:translate-x-0.5">
                            <span>Leer noticia</span>
                            <span className="material-symbols-outlined text-xs">arrow_forward</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </section>
        )}

      </main>

      {/* Footer Elegante Stitch */}
      <Footer />

    </div>
  );
}



