"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface ComposerItem {
  id: string;
  name: string;
  slug: string;
  country: string;
  city: string;
  photoUrl: string | null;
  shortBio: string;
  shortBioEn?: string;
  scoreCount: number;
  isFeatured?: boolean;
}

interface CompositoresClientProps {
  initialComposers: ComposerItem[];
}

export default function CompositoresClient({ initialComposers }: CompositoresClientProps) {
  const { t, language } = useLanguage();
  const isEn = language === "en";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");

  const filteredComposers = useMemo(() => {
    return initialComposers.filter((comp) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.city.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRegion =
        selectedRegion === "" ||
        comp.city.toLowerCase().includes(selectedRegion.toLowerCase());

      return matchesSearch && matchesRegion;
    });
  }, [initialComposers, searchQuery, selectedRegion]);

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
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("composers.search_placeholder", "Buscar por nombre o ciudad...")}
            className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-3 text-sm text-[#111C2D] placeholder-[#4C4546]/60 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-3 text-sm text-[#111C2D] font-medium focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
          >
            <option value="">{t("composers.all_regions", "Todas las regiones")}</option>
            <option value="caribe">{t("composers.region_caribe", "Caribe")}</option>
            <option value="andina">{t("composers.region_andina", "Andina")}</option>
            <option value="pacifico">{t("composers.region_pacifico", "Pacífico")}</option>
          </select>
        </div>
      </div>

      {/* Grid Compositores */}
      {filteredComposers.length === 0 ? (
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
                <span className="text-xs text-[#0071BC] font-extrabold mb-3 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  {comp.city}, {comp.country}
                </span>
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
