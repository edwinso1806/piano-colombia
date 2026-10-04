import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getStoreBlogPost } from "@/lib/api-client";
import { notFound } from "next/navigation";

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getStoreBlogPost(slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-[#F9F9FF] text-[#111C2D] flex flex-col font-inter">
        <Header activePage="blog" />
        <main className="flex-1 max-w-3xl mx-auto px-6 py-20 text-center space-y-4">
          <span className="material-symbols-outlined text-6xl text-slate-300">article_off</span>
          <h1 className="text-3xl font-black font-montserrat text-[#111C2D]">Artículo no encontrado</h1>
          <p className="text-sm text-[#4C4546]">
            La publicación que buscas no existe o se encuentra temporalmente inactiva.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0071BC] text-white text-xs font-bold font-montserrat hover:bg-[#005a96] transition"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Volver a la Bitácora
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const dateStr = (() => {
    try {
      if (!post.published_at) return "";
      const d = new Date(post.published_at);
      return d.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
    } catch {
      return post.published_at || "";
    }
  })();

  return (
    <div className="min-h-screen bg-[#F9F9FF] text-[#111C2D] flex flex-col font-inter selection:bg-[#FBB03B] selection:text-[#111C2D]">
      {/* Header Fijo con Estilo Stitch */}
      <Header activePage="blog" />

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full space-y-8">
        
        {/* Breadcrumb de navegación */}
        <div className="flex items-center gap-2 text-xs text-[#4C4546] font-medium">
          <Link href="/blog" className="hover:text-[#0071BC] transition">Bitácora</Link>
          <span className="text-slate-300">/</span>
          <span className="text-[#0071BC] font-bold">{post.category}</span>
        </div>

        {/* Article Header */}
        <div className="space-y-4 border-b border-black/5 pb-8">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="px-3.5 py-1 bg-[#F0F3FF] border border-[#0071BC]/10 text-[#0071BC] rounded-full font-extrabold uppercase font-montserrat">
              {post.category}
            </span>
            <span className="text-[#4C4546] font-medium flex items-center gap-1">
              • <span className="material-symbols-outlined text-xs">schedule</span> {post.read_time || "5 min de lectura"}
            </span>
            {dateStr && (
              <span className="text-[#4C4546] font-medium">
                • {dateStr}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-black font-montserrat text-[#111C2D] leading-tight tracking-tight">
            {post.title}
          </h1>

          <div className="text-xs text-[#4C4546] pt-1 font-medium flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-[#FBB03B]/30 text-[#111C2D] font-extrabold flex items-center justify-center text-xs">
              {(post.author || "P")[0]}
            </span>
            <span>
              Escrito por <strong className="text-[#111C2D]">{post.author}</strong>
            </span>
          </div>
        </div>

        {/* Imagen de Portada */}
        {post.cover_image && (
          <div className="relative w-full h-72 sm:h-96 rounded-3xl overflow-hidden shadow-sm border border-black/5 bg-slate-100">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Body */}
        <article className="bg-white p-8 sm:p-12 rounded-3xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-6">
          {post.excerpt && (
            <p className="text-lg font-medium text-[#0071BC] italic border-l-4 border-[#FBB03B] pl-5 py-2 leading-relaxed bg-[#F0F3FF]/30 rounded-r-xl">
              "{post.excerpt}"
            </p>
          )}

          {/* Contenido HTML Enriquecido */}
          <div
            className="prose prose-slate max-w-none text-[#111C2D] leading-relaxed space-y-4 text-base
              [&>h2]:text-2xl [&>h2]:font-black [&>h2]:font-montserrat [&>h2]:text-[#111C2D] [&>h2]:mt-8 [&>h2]:mb-3
              [&>h3]:text-xl [&>h3]:font-bold [&>h3]:font-montserrat [&>h3]:text-[#111C2D] [&>h3]:mt-6 [&>h3]:mb-2
              [&>p]:text-[#4C4546] [&>p]:leading-relaxed
              [&>blockquote]:border-l-4 [&>blockquote]:border-[#FBB03B] [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-[#111C2D] [&>blockquote]:my-6
              [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-1.5 [&>ul]:text-[#4C4546]
              [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:space-y-1.5 [&>ol]:text-[#4C4546]
              [&>img]:rounded-2xl [&>img]:shadow-md [&>img]:my-6 [&>img]:max-w-full [&>img]:mx-auto"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="pt-8 mt-8 border-t border-black/5 text-xs text-[#4C4546]">
            En Piano Colombia continuamos recuperando y digitalizando el repertorio histórico y contemporáneo de los maestros colombianos. Te invitamos a conocer las partituras asociadas en nuestro catálogo oficial.
          </div>
        </article>

        {/* CTA Catálogo */}
        <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] text-center space-y-4 mt-12">
          <h3 className="text-xl font-bold font-montserrat text-[#111C2D]">Explora las Obras Mencionadas</h3>
          <p className="text-xs text-[#4C4546] max-w-md mx-auto">
            Consigue las ediciones digitales oficiales revisadas con marca de agua personalizada.
          </p>
          <Link
            href="/tienda"
            className="px-6 py-3.5 bg-[#FBB03B] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl hover:bg-[#e09b2d] transition inline-flex items-center gap-2 font-montserrat shadow-md hover:shadow-lg"
          >
            <span className="material-symbols-outlined text-base">storefront</span>
            Ver Partituras en la Tienda
          </Link>
        </div>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
