"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getStoreBlogPosts } from "@/lib/api-client";

export default function BlogIndexPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("Todos");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await getStoreBlogPosts(
          activeCategory !== "Todos" ? { category: activeCategory } : undefined
        );
        if (data) {
          setPosts(data.posts || []);
          if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
            setCategories(data.categories);
          }
        }
      } catch (err) {
        console.warn("Error cargando artículos de blog:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [activeCategory]);

  const categoryNames = [
    "Todos",
    ...categories.map((c: any) => c.name || c),
  ];

  return (
    <div className="min-h-screen bg-[#F9F9FF] text-[#111C2D] flex flex-col font-inter selection:bg-[#FBB03B] selection:text-[#111C2D]">
      {/* Header Fijo */}
      <Header activePage="blog" />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full space-y-12">
        {/* Title Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-extrabold text-[#0071BC] tracking-widest uppercase bg-[#F0F3FF] px-4 py-1.5 rounded-full border border-[#0071BC]/10 inline-block font-montserrat">
            Bitácora & Difusión
          </span>
          <h1 className="text-4xl md:text-5xl font-black font-montserrat tracking-tight text-[#111C2D]">
            Actualidad Musical & Artículos
          </h1>
          <p className="text-sm md:text-base text-[#4C4546] font-normal leading-relaxed">
            Investigaciones pianísticas, análisis del patrimonio musical colombiano, pedagogía y noticias del sector.
          </p>
        </div>

        {/* Categorías Pills */}
        <div className="flex justify-center gap-2 flex-wrap">
          {categoryNames.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-montserrat font-extrabold transition cursor-pointer ${
                activeCategory === cat
                  ? "bg-[#FBB03B] text-[#111C2D] shadow-xs"
                  : "bg-white border border-black/5 text-[#4C4546] hover:bg-[#F0F3FF]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid de Artículos */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <span className="material-symbols-outlined text-4xl animate-spin text-[#0071BC]">progress_activity</span>
            <span className="text-sm font-medium">Cargando publicaciones de la bitácora...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-black/5 p-8 max-w-xl mx-auto space-y-3">
            <span className="material-symbols-outlined text-5xl text-slate-300">article</span>
            <h3 className="text-lg font-bold font-montserrat text-[#111C2D]">No hay artículos en esta categoría</h3>
            <p className="text-xs text-[#4C4546]">
              Pronto publicaremos nuevos análisis y notas sobre el repertorio pianístico colombiano.
            </p>
            <button
              onClick={() => setActiveCategory("Todos")}
              className="mt-2 px-4 py-2 rounded-xl bg-[#0071BC] text-white text-xs font-bold font-montserrat hover:bg-[#005a96] transition"
            >
              Ver todas las categorías
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {posts.map((post) => {
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
                <article
                  key={post.id}
                  className="bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-xl hover:border-[#FBB03B]/50 transition flex flex-col justify-between group overflow-hidden"
                >
                  {post.cover_image && (
                    <div className="relative h-48 w-full bg-slate-100 overflow-hidden border-b border-black/5">
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

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      {!post.cover_image && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="px-3 py-1 bg-[#F0F3FF] text-[#0071BC] rounded-full font-bold">
                            {post.category}
                          </span>
                          <span className="text-[#4C4546] font-medium flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">schedule</span> {post.read_time || "5 min"}
                          </span>
                        </div>
                      )}
                      {post.cover_image && (
                        <div className="flex justify-between items-center text-xs text-[#4C4546]">
                          <span className="font-medium">{dateStr}</span>
                          <span className="text-slate-400 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">schedule</span> {post.read_time || "5 min"}
                          </span>
                        </div>
                      )}
                      <h2 className="text-xl font-bold font-montserrat text-[#111C2D] group-hover:text-[#0071BC] transition leading-snug">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-xs text-[#4C4546] font-normal leading-relaxed line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="pt-6 border-t border-black/5 flex justify-between items-center text-xs">
                      <span className="text-[#4C4546] font-medium line-clamp-1">Por {post.author}</span>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="font-extrabold text-[#0071BC] hover:text-[#111C2D] transition font-montserrat flex items-center gap-1 group-hover:translate-x-0.5"
                      >
                        Leer Artículo <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
