import Image from "next/image";
import Link from "next/link";
import { MOCK_POSTS } from "@/lib/mock-data";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = MOCK_POSTS.find((p) => p.slug === slug) || MOCK_POSTS[0];

  return (
    <div className="min-h-screen bg-[#F9F9FF] text-[#111C2D] flex flex-col font-inter selection:bg-[#FBB03B] selection:text-[#111C2D]">
      
      {/* Header Fijo con Estilo Stitch */}
      <Header activePage="blog" />

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full space-y-8">
        
        {/* Article Header */}
        <div className="space-y-4 text-center border-b border-black/5 pb-8">
          <div className="flex justify-center gap-2 items-center text-xs">
            <span className="px-3.5 py-1 bg-[#F0F3FF] border border-[#0071BC]/10 text-[#0071BC] rounded-full font-extrabold uppercase font-montserrat">
              {post.category}
            </span>
            <span className="text-[#4C4546] font-medium flex items-center gap-1">
              • <span className="material-symbols-outlined text-xs">schedule</span> {post.readTime}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black font-montserrat text-[#111C2D] leading-tight tracking-tight">
            {post.title}
          </h1>
          <div className="text-xs text-[#4C4546] pt-2 font-medium">
            Escrito por <span className="text-[#111C2D] font-bold">{post.author}</span> el {post.date}
          </div>
        </div>

        {/* Article Body */}
        <article className="prose max-w-none text-[#111C2D] space-y-6 text-sm md:text-base leading-relaxed font-normal bg-white p-8 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          <p className="text-lg font-medium text-[#0071BC] italic border-l-4 border-[#FBB03B] pl-4 py-1">
            "{post.excerpt}"
          </p>
          <p className="text-[#4C4546]">
            {post.content}
          </p>
          <p className="text-[#4C4546]">
            En Piano Colombia continuamos recuperando y digitalizando el repertorio histórico y contemporáneo de los maestros colombianos. Te invitamos a conocer las partituras asociadas en nuestro catálogo oficial.
          </p>
        </article>

        {/* CTA Catálogo */}
        <div className="bg-white p-8 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] text-center space-y-4 mt-12">
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


