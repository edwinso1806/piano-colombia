"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface ComposerItem {
  id: string;
  name: string;
  slug: string;
  country: string;
  region?: string;
  city: string;
  photoUrl: string | null;
  shortBio: string;
  shortBioEn?: string;
  scoreCount: number;
  isFeatured?: boolean;
}

interface ComposerWithRegion extends ComposerItem {
  resolvedRegion: string;
  birthplace: string;
}

interface CompositoresClientProps {
  initialComposers: ComposerItem[];
}

/**
 * Normaliza cadenas removiendo tildes, mayúsculas y espacios extra.
 */
function normalizeText(str: string): string {
  return (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Resuelve la Región Geográfica Natural de Colombia (o país internacional)
 * a partir de la ciudad, departamento o texto de región registrado en la BD.
 */
export function resolveColombianRegion(locationText?: string, country?: string): string {
  const text = normalizeText(`${locationText || ""} ${country || ""}`);
  if (!text) return "Región Andina";

  // 1. Detección directa si el texto ya menciona explícitamente la región
  if (text.includes("andina") || text.includes("andean")) return "Región Andina";
  if (text.includes("caribe") || text.includes("caribbean")) return "Región Caribe";
  if (text.includes("pacifica") || text.includes("pacifico") || text.includes("pacific")) return "Región Pacífica";
  if (text.includes("orinoquia") || text.includes("llanos")) return "Región Orinoquía";
  if (text.includes("amazonia") || text.includes("amazon")) return "Región Amazonía";
  if (text.includes("insular")) return "Región Insular";

  // 2. Región Caribe (Departamentos y principales ciudades costeñas)
  const caribeKeywords = [
    "bolivar", "cartagena", "atlantico", "barranquilla", "magdalena", "santa marta",
    "cesar", "valledupar", "cordoba", "monteria", "sucre", "sincelejo",
    "la guajira", "guajira", "riohacha", "maicao", "cienaga", "mompox", "turbaco", "lorica"
  ];
  if (caribeKeywords.some((k) => text.includes(k))) return "Región Caribe";

  // 3. Región Pacífica (Litoral pacífico y Chocó)
  const pacificaKeywords = [
    "choco", "quibdo", "buenaventura", "tumaco", "guapi", "timbiqui", "istmina", "nuqui", "bahia solano"
  ];
  if (pacificaKeywords.some((k) => text.includes(k))) return "Región Pacífica";

  // 4. Región Orinoquía (Llanos Orientales)
  const orinoquiaKeywords = [
    "meta", "villavicencio", "casanare", "yopal", "arauca", "vichada", "puerto carreno", "acacias", "granada"
  ];
  if (orinoquiaKeywords.some((k) => text.includes(k))) return "Región Orinoquía";

  // 5. Región Amazonía
  const amazoniaKeywords = [
    "amazonas", "leticia", "caqueta", "florencia", "putumayo", "mocoa", "puerto asis",
    "guainia", "inirida", "guaviare", "san jose del guaviare", "vaupes", "mitu"
  ];
  if (amazoniaKeywords.some((k) => text.includes(k))) return "Región Amazonía";

  // 6. Región Insular
  const insularKeywords = ["san andres", "providencia", "santa catalina"];
  if (insularKeywords.some((k) => text.includes(k))) return "Región Insular";

  // 7. Región Andina (Departamentos y ciudades de la cordillera andina)
  const andinaKeywords = [
    "antioquia", "medellin", "bello", "itagui", "envigado", "rionegro", "santa fe de antioquia", "jerico", "marinilla",
    "bogota", "cundinamarca", "soacha", "chia", "zipaquira", "facatativa", "fusagasuga", "girardot", "mosquera", "madrid", "funza", "cajica",
    "santander", "bucaramanga", "floridablanca", "giron", "piedecuesta", "barrancabermeja", "san gil", "socorro", "gambita", "zapatoca", "barichara", "velez", "charala",
    "norte de santander", "cucuta", "ocana", "pamplona", "villa del rosario", "los patios",
    "boyaca", "tunja", "duitama", "sogamoso", "chiquinquira", "villa de leyva", "paipa", "moniquira", "puerto boyaca",
    "tolima", "ibague", "espinal", "melgar", "honda", "mariquita", "libano", "chaparral",
    "huila", "neiva", "pitalito", "garzon", "la plata",
    "caldas", "manizales", "chinchina", "la dorada", "salamina", "aguadas", "villamaria", "riosucio",
    "risaralda", "pereira", "dosquebradas", "santa rosa de cabal",
    "quindio", "armenia", "calarca", "quimbaya", "circasia", "salento", "montenegro",
    "valle del cauca", "valle", "cali", "palmira", "cartago", "buga", "tulua", "jamundi", "yumbo", "sevilla", "caicedonia", "roldanillo",
    "cauca", "popayan", "inza", "silvia", "santander de quilichao", "tierradentro", "puerto tejada", "patia",
    "narino", "pasto", "ipiales", "tuquerres", "la union"
  ];
  if (andinaKeywords.some((k) => text.includes(k))) return "Región Andina";

  // Por defecto si es de Colombia
  if (!country || text.includes("colombia")) {
    return "Región Andina";
  }

  // País internacional
  return country.trim();
}

/**
 * Limpia y formatea la ciudad y departamento para presentación en la tarjeta
 */
function formatBirthplace(city: string, region?: string, country?: string): string {
  const raw = (city || region || "").trim();
  if (!raw || raw.toLowerCase() === "colombia") {
    return country || "Colombia";
  }
  let clean = raw.split("/")[0].trim();
  clean = clean.replace(/,\s*colombia$/i, "").trim();
  if (country && country.toLowerCase() !== "colombia" && !clean.toLowerCase().includes(country.toLowerCase())) {
    return `${clean}, ${country}`;
  }
  return clean || raw;
}

export default function CompositoresClient({ initialComposers }: CompositoresClientProps) {
  const { t, language } = useLanguage();
  const isEn = language === "en";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");

  // Enriquecer compositores con su región natural y lugar de nacimiento limpio
  const composersWithRegion = useMemo<ComposerWithRegion[]>(() => {
    return initialComposers.map((comp) => {
      const locText = `${comp.city || ""} ${comp.region || ""}`.trim();
      const resolved = resolveColombianRegion(locText, comp.country);
      const birthplace = formatBirthplace(comp.city, comp.region, comp.country);
      return {
        ...comp,
        resolvedRegion: resolved,
        birthplace,
      };
    });
  }, [initialComposers]);

  // Lista única de regiones agrupadas disponibles para el filtro
  const availableRegions = useMemo(() => {
    const set = new Set<string>();
    composersWithRegion.forEach((comp) => {
      if (comp.resolvedRegion) {
        set.add(comp.resolvedRegion);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [composersWithRegion]);

  // Filtrado que agrupa por región y permite búsqueda por nombre, ciudad o región
  const filteredComposers = useMemo(() => {
    return composersWithRegion.filter((comp) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === "" ||
        comp.name.toLowerCase().includes(q) ||
        (comp.region && comp.region.toLowerCase().includes(q)) ||
        comp.city.toLowerCase().includes(q) ||
        comp.birthplace.toLowerCase().includes(q) ||
        comp.resolvedRegion.toLowerCase().includes(q);

      const matchesRegion =
        selectedRegion === "" || comp.resolvedRegion === selectedRegion;

      return matchesSearch && matchesRegion;
    });
  }, [composersWithRegion, searchQuery, selectedRegion]);

  return (
    <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
      {/* Banner Titulo */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-extrabold text-[#0071BC] tracking-widest uppercase bg-[#F0F3FF] px-4 py-1.5 rounded-full border border-[#0071BC]/10 inline-block font-montserrat">
          {t("composers.badge", "Patrimonio Pianístico")}
        </span>
        <h1 className="text-4xl md:text-5xl font-black font-montserrat tracking-tight mt-4 mb-4 text-[#111C2D]">
          {t("composers.title", "Compositores")}
        </h1>
        <p className="text-[#4C4546] font-normal text-base md:text-lg">
          {t(
            "composers.subtitle",
            "Descubre a las mentes detrás de la literatura musical para piano en Colombia, desde grandes maestros históricos hasta compositores contemporáneos."
          )}
        </p>
      </div>

      {/* Buscador & Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] mb-12 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4C4546] text-lg pointer-events-none">
            search
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("composers.search_placeholder", isEn ? "Search by name, region or city..." : "Buscar por nombre, región o ciudad...")}
            className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl pl-10 pr-10 py-3 text-sm text-[#111C2D] placeholder-[#4C4546]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC] transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
              title={isEn ? "Clear search" : "Borrar búsqueda"}
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          )}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-3 text-sm text-[#111C2D] font-medium focus:outline-none focus:ring-2 focus:ring-[#0071BC] cursor-pointer"
          >
            <option value="">{t("composers.all_regions", isEn ? "All regions" : "Todas las regiones")}</option>
            {availableRegions.map((reg) => (
              <option key={reg} value={reg}>
                {reg}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Compositores */}
      {filteredComposers.length === 0 ? (
        initialComposers.length > 0 ? (
          /* Búsqueda activa sin resultados pero existen compositores en el catálogo */
          <div className="bg-white rounded-3xl p-12 sm:p-16 border border-black/5 shadow-xs text-center max-w-xl mx-auto space-y-5 animate-in fade-in duration-200">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
              <span className="material-symbols-outlined text-3xl">search_off</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black font-montserrat text-[#111C2D]">
                {isEn ? "No composers match your search" : "No se encontraron coincidencias en los compositores"}
              </h3>

              {/* Badges estructurados con los filtros activos */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1 pb-1">
                {searchQuery.trim() && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0071BC]/10 text-[#0071BC] text-xs font-bold font-montserrat border border-[#0071BC]/20">
                    <span className="material-symbols-outlined text-sm">search</span>
                    <span>{isEn ? "Search:" : "Búsqueda:"} "{searchQuery.trim()}"</span>
                  </span>
                )}
                {selectedRegion && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBB03B]/20 text-[#111C2D] text-xs font-bold font-montserrat border border-[#FBB03B]/40">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    <span>{isEn ? "Region:" : "Región:"} {selectedRegion}</span>
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-[#4C4546] leading-relaxed max-w-md mx-auto">
                {isEn
                  ? `There are ${initialComposers.length} composer${initialComposers.length > 1 ? "s" : ""} registered in our archive, but none match the current search or region filter. Try searching with a different term or clear the filters.`
                  : `Hay ${initialComposers.length} compositor${initialComposers.length > 1 ? "es" : ""} registrado${initialComposers.length > 1 ? "s" : ""} en nuestro archivo histórico, pero ninguno coincide con los filtros aplicados. Intenta con otro término o limpia los filtros.`}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedRegion("");
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0071BC] hover:bg-[#005a96] text-white font-extrabold text-xs uppercase tracking-wider font-montserrat shadow-md transition cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-base">restart_alt</span>
                <span>
                  {isEn
                    ? `Clear filters and show all (${initialComposers.length})`
                    : `Limpiar filtros y ver todos (${initialComposers.length})`}
                </span>
              </button>
            </div>
          </div>
        ) : (
          /* Base de datos completamente vacía */
          <div className="bg-white rounded-3xl p-16 border border-black/5 shadow-sm text-center max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 bg-[#F0F3FF] text-[#0071BC] rounded-2xl flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">music_note</span>
            </div>
            <h3 className="text-lg font-black font-montserrat text-[#111C2D]">
              {t("composers.coming_soon_title", "Próximamente Catálogo de Obras")}
            </h3>
            <p className="text-xs text-[#4C4546] leading-relaxed">
              {t(
                "composers.coming_soon_desc",
                "Actualmente los compositores registrados se encuentran en proceso de curaduría y aprobación de partituras. Muy pronto encontrarás aquí sus perfiles oficiales."
              )}
            </p>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredComposers.map((comp) => {
            const bioText = isEn && comp.shortBioEn ? comp.shortBioEn : comp.shortBio;
            return (
              <div
                key={comp.id}
                className="bg-white rounded-2xl p-6 border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-lg hover:border-[#FBB03B]/50 transition flex flex-col items-center text-center group"
              >
                <div className="w-28 h-28 rounded-full overflow-hidden mb-4 border-2 border-[#FBB03B]/40 group-hover:border-[#FBB03B] transition bg-[#F0F3FF] flex items-center justify-center text-3xl font-montserrat font-extrabold text-[#111C2D] shadow-xs">
                  {comp.photoUrl ? (
                    <img src={comp.photoUrl} alt={comp.name} className="w-full h-full object-cover" />
                  ) : (
                    comp.name.substring(0, 2)
                  )}
                </div>
                <h2 className="text-xl font-bold font-montserrat text-[#111C2D] mb-1">{comp.name}</h2>
                <div className="flex flex-col items-center gap-1 mb-3">
                  <span className="text-xs text-[#0071BC] font-semibold flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    <span>{comp.birthplace}</span>
                  </span>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#0071BC]/10 text-[#0071BC] text-[11px] font-bold font-montserrat tracking-wide">
                    {comp.resolvedRegion}
                  </span>
                </div>
                <p className="text-sm text-[#4C4546] font-normal mb-6 leading-relaxed line-clamp-3">
                  {bioText}
                </p>
                <Link
                  href={`/compositores/${comp.slug}`}
                  className="mt-auto px-5 py-2.5 rounded-xl bg-[#F0F3FF] group-hover:bg-[#111C2D] group-hover:text-white text-[#111C2D] font-bold text-xs uppercase tracking-wider transition font-montserrat w-full"
                >
                  {t("composers.view_bio_and_scores", "Ver Biografía & Obras")} ({comp.scoreCount})
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
