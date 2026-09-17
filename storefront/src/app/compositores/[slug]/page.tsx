import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getComposerBySlug } from "@/lib/api-client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SaveScoreButton from "@/components/SaveScoreButton";

export default async function CompositorDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const composer = await getComposerBySlug(slug);

  if (!composer) {
    notFound();
  }

  const composerName =
    composer.artistic_name ||
    (composer.first_name ? `${composer.first_name} ${composer.last_name || ""}`.trim() : "Compositor");
  const bio = composer.bio_es || composer.bio_en || "Compositor destacado del catálogo de Piano Colombia.";
  const location = composer.region || "Colombia";
  const initials = composerName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const composerScores = composer.scores || [];

  return (
    <div className="min-h-screen bg-[#F9F9FF] text-[#111C2D] flex flex-col font-inter selection:bg-[#FBB03B] selection:text-[#111C2D]">
      {/* Header Fijo con Estilo Stitch */}
      <Header activePage="compositores" />

      {/* Hero Banner Compositor */}
      <section className="relative py-16 px-6 border-b border-black/5 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-[#F0F3FF] border-4 border-[#FBB03B] flex items-center justify-center text-5xl font-montserrat font-black text-[#111C2D] shadow-md shrink-0 overflow-hidden">
            {composer.photo_url ? (
              <img src={composer.photo_url} alt={composerName} className="w-full h-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div>
            {composer.is_featured && (
              <div className="inline-block px-3 py-1 bg-[#FBB03B]/20 border border-[#FBB03B]/40 rounded-full text-xs text-[#111C2D] font-extrabold font-montserrat uppercase mb-3">
                Compositor Destacado
              </div>
            )}
            <h1 className="text-3xl md:text-5xl font-black font-montserrat text-[#111C2D] mb-2 tracking-tight">
              {composerName}
            </h1>
            <p className="text-sm md:text-base text-[#0071BC] font-extrabold mb-4 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">location_on</span>
              {location}
            </p>
            <p className="text-[#4C4546] max-w-3xl font-normal text-sm md:text-base leading-relaxed">
              {bio}
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
          <div className="bg-white p-12 text-center text-[#4C4546] rounded-2xl border border-black/5 shadow-xs font-montserrat font-bold">
            Este compositor no tiene obras publicadas actualmente.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {composerScores.map((score: any) => (
              <div
                key={score.id}
                className="bg-white rounded-2xl p-6 border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-lg hover:border-[#FBB03B]/50 transition flex flex-col group"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs px-2.5 py-1 bg-[#F0F3FF] text-[#111C2D] rounded-full font-bold">
                    {score.difficulty || "Intermedio"}
                  </span>
                  <span className="text-sm font-extrabold text-[#111C2D] font-montserrat">
                    ${Number(score.price_cop || 45000).toLocaleString("es-CO")} COP
                  </span>
                </div>
                <h3 className="text-lg font-bold font-montserrat text-[#111C2D] mb-1 group-hover:text-[#0071BC] transition-colors">
                  {score.title}
                </h3>
                <p className="text-xs text-[#4C4546] mb-4 line-clamp-2 leading-relaxed">
                  {score.description_es || score.description || "Partitura edición Urtext en formato digital PDF."}
                </p>
                <div className="mt-auto pt-4 border-t border-black/5 flex justify-between items-center">
                  <span className="text-xs text-[#4C4546] font-medium">{score.genre || "Piano Solo"}</span>
                  <div className="flex items-center gap-2">
                    <SaveScoreButton
                      score={{
                        id: score.id,
                        slug: score.slug,
                        title: score.title,
                        composer: composerName,
                        category: score.genre || "Piano Solo",
                        level: score.difficulty || "Intermedio",
                        priceCOP: Number(score.price_cop || 45000),
                        priceUSD: Number(score.price_usd || 12),
                        description: score.description_es || score.description,
                      }}
                      variant="icon"
                    />
                    <Link
                      href={`/partitura/${score.slug}`}
                      className="text-xs font-extrabold px-4 py-2 bg-[#FBB03B] hover:bg-[#e09b2d] text-[#111C2D] rounded-xl transition font-montserrat flex items-center gap-1 shadow-xs"
                    >
                      Ver Partitura <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>
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


