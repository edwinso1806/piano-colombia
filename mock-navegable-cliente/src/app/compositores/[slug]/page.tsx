import Image from "next/image";
import Link from "next/link";
import { MOCK_COMPOSERS, MOCK_SCORES } from "@/lib/mock-data";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default async function CompositorDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const composer = MOCK_COMPOSERS.find((c) => c.slug === slug) || MOCK_COMPOSERS[0];
  const composerScores = MOCK_SCORES.filter((s) => s.composerId === composer.id);

  return (
    <div className="min-h-screen bg-[#F9F9FF] text-[#111C2D] flex flex-col font-inter selection:bg-[#FBB03B] selection:text-[#111C2D]">
      
      {/* Header Fijo con Estilo Stitch */}
      <Header activePage="compositores" />

      {/* Hero Banner Compositor */}
      <section className="relative py-16 px-6 border-b border-black/5 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-[#F0F3FF] border-4 border-[#FBB03B] flex items-center justify-center text-5xl font-montserrat font-black text-[#111C2D] shadow-md shrink-0">
            {composer.name.substring(0, 2)}
          </div>
          <div>
            <div className="inline-block px-3 py-1 bg-[#FBB03B]/20 border border-[#FBB03B]/40 rounded-full text-xs text-[#111C2D] font-extrabold font-montserrat uppercase mb-3">
              Compositor Destacado
            </div>
            <h1 className="text-3xl md:text-5xl font-black font-montserrat text-[#111C2D] mb-2 tracking-tight">{composer.name}</h1>
            <p className="text-sm md:text-base text-[#0071BC] font-extrabold mb-4 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">location_on</span>
              {composer.city}, {composer.country}
            </p>
            <p className="text-[#4C4546] max-w-3xl font-normal text-sm md:text-base leading-relaxed">
              {composer.fullBio}
            </p>
          </div>
        </div>
      </section>

      {/* Partituras del Compositor */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        <h2 className="text-2xl font-black font-montserrat text-[#111C2D] mb-8 flex items-center gap-3">
          Partituras Disponibles
          <span className="text-xs bg-[#FBB03B]/20 text-[#111C2D] font-extrabold font-montserrat px-3 py-1 rounded-full border border-[#FBB03B]/30">
            {composerScores.length} obras
          </span>
        </h2>

        {composerScores.length === 0 ? (
          <div className="bg-white p-12 text-center text-[#4C4546] rounded-2xl border border-black/5 shadow-xs">
            Este compositor no tiene obras publicadas actualmente.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {composerScores.map((score) => (
              <div key={score.id} className="bg-white rounded-2xl p-6 border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-lg hover:border-[#FBB03B]/50 transition flex flex-col group">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs px-2.5 py-1 bg-[#F0F3FF] text-[#111C2D] rounded-full font-bold">{score.level}</span>
                  <span className="text-sm font-extrabold text-[#111C2D] font-montserrat">${score.priceCOP.toLocaleString('es-CO')} COP</span>
                </div>
                <h3 className="text-lg font-bold font-montserrat text-[#111C2D] mb-1">{score.title}</h3>
                <p className="text-xs text-[#4C4546] mb-4 line-clamp-2 leading-relaxed">{score.description}</p>
                <div className="mt-auto pt-4 border-t border-black/5 flex justify-between items-center">
                  <span className="text-xs text-[#4C4546] font-medium">{score.category}</span>
                  <Link
                    href={`/partitura/${score.slug}`}
                    className="text-xs font-extrabold px-4 py-2 bg-[#FBB03B] hover:bg-[#e09b2d] text-[#111C2D] rounded-xl transition font-montserrat flex items-center gap-1 shadow-xs"
                  >
                    Ver Partitura <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}


