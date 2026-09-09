import Image from "next/image";
import Link from "next/link";
import { MOCK_POSTS } from "@/lib/mock-data";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen bg-[#F9F9FF] text-[#111C2D] flex flex-col font-inter selection:bg-[#FBB03B] selection:text-[#111C2D]">
      
      {/* Header Fijo con Estilo Stitch */}
      <Header activePage="blog" />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full space-y-12">
        
        {/* Title Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-extrabold text-[#0071BC] tracking-widest uppercase bg-[#F0F3FF] px-4 py-1.5 rounded-full border border-[#0071BC]/10 inline-block font-montserrat">
            Bitácora & Difusión
          </span>
          <h1 className="text-4xl md:text-5xl font-black font-montserrat tracking-tight text-[#111C2D]">Actualidad Musical & Artículos</h1>
          <p className="text-sm md:text-base text-[#4C4546] font-normal leading-relaxed">
            Investigaciones pianísticas, análisis del patrimonio musical colombiano, pedagogía y noticias del sector.
          </p>
        </div>

        {/* Categorías Pills */}
        <div className="flex justify-center gap-2 flex-wrap">
          {["Todos", "Pedagogía", "Historia", "Actualidad", "Reseñas"].map((cat, idx) => (
            <button
              key={idx}
              className={`px-5 py-2 rounded-full text-xs font-montserrat font-extrabold transition ${
                idx === 0
                  ? "bg-[#FBB03B] text-[#111C2D] shadow-xs"
                  : "bg-white border border-black/5 text-[#4C4546] hover:bg-[#F0F3FF]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid de Artículos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {MOCK_POSTS.map((post) => (
            <article key={post.id} className="bg-white rounded-2xl p-6 border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-lg hover:border-[#FBB03B]/50 transition flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="px-3 py-1 bg-[#F0F3FF] text-[#0071BC] rounded-full font-bold">{post.category}</span>
                  <span className="text-[#4C4546] font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">schedule</span> {post.readTime}
                  </span>
                </div>
                <h2 className="text-xl font-bold font-montserrat text-[#111C2D] group-hover:text-[#0071BC] transition leading-snug">
                  {post.title}
                </h2>
                <p className="text-xs text-[#4C4546] font-normal leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-black/5 flex justify-between items-center text-xs">
                <span className="text-[#4C4546] font-medium">Por {post.author}</span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="font-extrabold text-[#0071BC] hover:text-[#111C2D] transition font-montserrat flex items-center gap-1 group-hover:translate-x-0.5"
                >
                  Leer Artículo <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </article>
          ))}
        </div>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}


