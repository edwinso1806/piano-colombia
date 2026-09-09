import Image from "next/image";
import Link from "next/link";
import { MOCK_COMPOSERS } from "@/lib/mock-data";
import { getComposersList } from "@/lib/api-client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default async function CompositoresPage() {
  const liveComposers = await getComposersList();
  
  // Normalizar datos de Medusa o usar fallback local
  const composers = liveComposers && liveComposers.length > 0 
    ? liveComposers.map((c: any) => ({
        id: c.id,
        name: c.artistic_name || `${c.first_name} ${c.last_name}`,
        slug: c.slug,
        country: "Colombia",
        city: c.region || "Colombia",
        photoUrl: c.photo_url || "/images/composers/adolfo-mejia.jpg",
        shortBio: c.bio_es ? c.bio_es.substring(0, 120) + "..." : "Compositor colombiano para piano.",
        fullBio: c.bio_es || "",
        scoreCount: 1,
        isFeatured: c.is_featured,
      }))
    : MOCK_COMPOSERS;

  return (
    <div className="min-h-screen bg-[#F9F9FF] text-[#111C2D] flex flex-col font-inter selection:bg-[#FBB03B] selection:text-[#111C2D]">
      
      {/* Header Fijo con Estilo Stitch */}
      <Header activePage="compositores" />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        
        {/* Banner Titulo */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-extrabold text-[#0071BC] tracking-widest uppercase bg-[#F0F3FF] px-4 py-1.5 rounded-full border border-[#0071BC]/10 inline-block font-montserrat">
            Patrimonio Pianístico
          </span>
          <h1 className="text-4xl md:text-5xl font-black font-montserrat tracking-tight mt-4 mb-4 text-[#111C2D]">Compositores</h1>
          <p className="text-[#4C4546] font-normal text-base md:text-lg">
            Descubre a las mentes detrás de la literatura musical para piano en Colombia, desde grandes maestros históricos hasta compositores contemporáneos.
          </p>
        </div>

        {/* Buscador & Filtros */}
        <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] mb-12 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <input
              type="text"
              placeholder="Buscar por nombre o ciudad..."
              className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-3 text-sm text-[#111C2D] placeholder-[#4C4546]/60 focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select className="bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-3 text-sm text-[#111C2D] font-medium focus:outline-none focus:ring-2 focus:ring-[#0071BC]">
              <option value="">Todas las regiones</option>
              <option value="caribe">Caribe</option>
              <option value="andina">Andina</option>
              <option value="pacifico">Pacífico</option>
            </select>
          </div>
        </div>

        {/* Grid Compositores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {composers.map((comp: any) => (
            <div key={comp.id} className="bg-white rounded-2xl p-6 border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-lg hover:border-[#FBB03B]/50 transition flex flex-col items-center text-center group">
              <div className="w-28 h-28 rounded-full overflow-hidden mb-4 border-2 border-[#FBB03B]/40 group-hover:border-[#FBB03B] transition bg-[#F0F3FF] flex items-center justify-center text-3xl font-montserrat font-extrabold text-[#111C2D] shadow-xs">
                {comp.name.substring(0, 2)}
              </div>
              <h2 className="text-xl font-bold font-montserrat text-[#111C2D] mb-1">{comp.name}</h2>
              <span className="text-xs text-[#0071BC] font-extrabold mb-3 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">location_on</span>
                {comp.city}, {comp.country}
              </span>
              <p className="text-sm text-[#4C4546] font-normal mb-6 leading-relaxed line-clamp-3">
                {comp.shortBio}
              </p>
              <Link
                href={`/compositores/${comp.slug}`}
                className="mt-auto px-5 py-2.5 rounded-xl bg-[#F0F3FF] group-hover:bg-[#111C2D] group-hover:text-white text-[#111C2D] font-bold text-xs uppercase tracking-wider transition font-montserrat w-full"
              >
                Ver Biografía & Obras
              </Link>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}


