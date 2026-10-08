"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getStoreBlogPosts } from "@/lib/api-client";
import { useLanguage } from "@/context/LanguageContext";
import { translateBlogCategory, formatReadTime } from "@/lib/localize-messages";

export default function BlogIndexPage() {
  const { t, language } = useLanguage();
  const isEn = language === "en";

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

  const allCategoryLabel = t("blog.all_categories", "Todos");
  const categoryNames = [
    { raw: "Todos", label: allCategoryLabel },
    ...categories.map((c: any) => {
      const name = c.name || c;
      const label = isEn ? (c.name_en || translateBlogCategory(name, true)) : name;
      return { raw: name, label };
    }),
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
            {t("blog.badge", "Bitácora & Difusión")}
          </span>
          <h1 className="text-4xl md:text-5xl font-black font-montserrat tracking-tight text-[#111C2D]">
            {t("blog.title", "Actualidad Musical & Artículos")}
          </h1>
          <p className="text-sm md:text-base text-[#4C4546] font-normal leading-relaxed">
            {t("blog.subtitle", "Investigaciones pianísticas, análisis del patrimonio musical colombiano, pedagogía y noticias del sector.")}
          </p>
        </div>

        {/* Categorías Pills */}
        <div className="flex justify-center gap-2 flex-wrap">
          {categoryNames.map((cat, idx) => {
            const isSelected = activeCategory === cat.raw;
            return (
              <button
                key={idx}
                onClick={() => setActiveCategory(cat.raw)}
                className={`px-5 py-2 rounded-full text-xs font-montserrat font-extrabold transition cursor-pointer ${
                  isSelected
                    ? "bg-[#FBB03B] text-[#111C2D] shadow-xs"
                    : "bg-white border border-black/5 text-[#4C4546] hover:bg-[#F0F3FF]"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Grid de Artículos */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <span className="material-symbols-outlined text-4xl animate-spin text-[#0071BC]">progress_activity</span>
            <span className="text-sm font-medium">{t("blog.loading", "Cargando publicaciones de la bitácora...")}</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-black/5 p-8 max-w-xl mx-auto space-y-3">
            <span className="material-symbols-outlined text-5xl text-slate-300">article</span>
            <h3 className="text-lg font-bold font-montserrat text-[#111C2D]">{t("blog.empty_title", "No hay artículos en esta categoría")}</h3>
            <p className="text-xs text-[#4C4546]">
              {t("blog.empty_desc", "Pronto publicaremos nuevos análisis y notas sobre el repertorio pianístico colombiano.")}
            </p>
            <button
              onClick={() => setActiveCategory("Todos")}
              className="mt-2 px-4 py-2 rounded-xl bg-[#0071BC] text-white text-xs font-bold font-montserrat hover:bg-[#005a96] transition cursor-pointer"
            >
              {t("blog.view_all_cats", "Ver todas las categorías")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {posts.map((post) => {
              const dateStr = (() => {
                try {
                  if (!post.published_at) return "";
                  const d = new Date(post.published_at);
                  return d.toLocaleDateString(isEn ? "en-US" : "es-CO", { day: "numeric", month: "short", year: "numeric" });
                } catch {
                  return post.published_at || "";
                }
              })();

              const titleText = isEn && post.title_en ? post.title_en : post.title;
              const excerptText = isEn && post.excerpt_en ? post.excerpt_en : post.excerpt;
              const categoryText = isEn ? (post.category_en || translateBlogCategory(post.category, true)) : post.category;
              const readTimeText = formatReadTime(post.read_time, isEn);

              return (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-xl hover:border-[#FBB03B]/50 transition flex flex-col justify-between group overflow-hidden"
                >
                  {post.cover_image && (
                    <div className="relative h-48 w-full bg-slate-100 overflow-hidden border-b border-black/5">
                      <img
                        src={post.cover_image}
                        alt={titleText}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-white/95 backdrop-blur-md text-[#0071BC] rounded-full font-bold text-xs shadow-xs border border-black/5">
                          {categoryText}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      {!post.cover_image && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="px-3 py-1 bg-[#F0F3FF] text-[#0071BC] rounded-full font-bold">
                            {categoryText}
                          </span>
                          <span className="text-[#4C4546] font-medium flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">schedule</span> {readTimeText}
                          </span>
                        </div>
                      )}
                      {post.cover_image && (
                        <div className="flex justify-between items-center text-xs text-[#4C4546]">
                          <span className="font-medium">{dateStr}</span>
                          <span className="text-slate-400 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">schedule</span> {readTimeText}
                          </span>
                        </div>
                      )}
                      <h2 className="text-xl font-bold font-montserrat text-[#111C2D] group-hover:text-[#0071BC] transition leading-snug">
                        {titleText}
                      </h2>
                      {excerptText && (
                        <p className="text-xs text-[#4C4546] font-normal leading-relaxed line-clamp-3">
                          {excerptText}
                        </p>
                      )}
                    </div>

                    <div className="pt-6 border-t border-black/5 flex justify-between items-center text-xs">
                      <span className="text-[#4C4546] font-medium line-clamp-1">{t("home.by", "Por")} {post.author}</span>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="font-extrabold text-[#0071BC] hover:text-[#111C2D] transition font-montserrat flex items-center gap-1 group-hover:translate-x-0.5"
                      >
                        {t("blog.read_article", "Leer artículo")} <span className="material-symbols-outlined text-sm">arrow_forward</span>
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

