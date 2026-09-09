import Image from "next/image";
import Link from "next/link";
import { MOCK_SCORES, MOCK_COMPOSERS } from "@/lib/mock-data";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default async function PartituraDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const score = MOCK_SCORES.find((s) => s.id === slug) || MOCK_SCORES[0];
  const composer = MOCK_COMPOSERS.find((c) => c.id === score.composerId) || MOCK_COMPOSERS[0];

  return (
    <div className="min-h-screen bg-[#F9F9FF] text-[#111C2D] flex flex-col font-inter selection:bg-[#FBB03B] selection:text-[#111C2D]">
      
      {/* Header Fijo con Estilo Stitch */}
      <Header activePage="tienda" />

      {/* Detalle de Partitura */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Columna Izquierda: Visualizador de Preview */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex justify-between items-center bg-white p-3.5 rounded-2xl border border-black/5 shadow-2xs">
            <span className="text-xs font-bold text-[#0071BC] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">visibility</span> Vista Previa Muestra Protegida
            </span>
            <span className="text-xs text-[#4C4546] font-medium">Página 1 de 2 (Muestra no ejecutable)</span>
          </div>

          {/* PDF Viewer Mock con Protección Opaca + Marca de agua */}
          <div className="relative w-full aspect-[1/1.4] bg-white rounded-2xl overflow-hidden border border-black/10 shadow-[0_12px_40px_rgba(0,0,0,0.06)] flex flex-col justify-between p-8 text-[#111C2D] select-none">
            
            {/* Capa de Difuminado y Opacidad */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[3px] pointer-events-none z-10"></div>

            {/* Marca de Agua Diagonal "pianocolombia.com" */}
            <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center rotate-[-35deg] opacity-20">
              <span className="text-4xl md:text-5xl font-black tracking-widest text-[#C1272D] uppercase whitespace-nowrap font-montserrat">
                pianocolombia.com — MUESTRA
              </span>
            </div>

            {/* Simulación de Contenido de Partitura Pianística */}
            <div className="relative z-0 opacity-40 filter blur-[1px]">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold font-serif tracking-widest uppercase">{score.title}</h3>
                <p className="text-xs font-serif italic mt-1">Para Piano Solo — {score.composer}</p>
              </div>
              <div className="space-y-6">
                {[1, 2, 3, 4].map((p) => (
                  <div key={p} className="space-y-1">
                    <div className="h-0.5 bg-[#111C2D] w-full"></div>
                    <div className="h-0.5 bg-[#111C2D] w-full"></div>
                    <div className="h-0.5 bg-[#111C2D] w-full"></div>
                    <div className="h-0.5 bg-[#111C2D] w-full"></div>
                    <div className="h-0.5 bg-[#111C2D] w-full"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Banner Inferior de Advertencia/CTA */}
            <div className="relative z-30 bg-[#111C2D]/95 backdrop-blur-md p-4 rounded-xl text-center border border-[#FBB03B]/30 text-white shadow-lg">
              <p className="text-xs font-medium mb-1 text-slate-200 flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-sm text-[#FBB03B]">lock</span>
                Vista previa difuminada y protegida para resguardar los derechos del autor.
              </p>
              <span className="text-xs font-bold text-[#FBB03B] font-montserrat">Adquiere la versión completa en PDF imprimible</span>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Información y Compra */}
        <div className="lg:col-span-5 flex flex-col justify-start">
          <div className="bg-white p-8 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-6">
            
            <div>
              <span className="text-xs font-extrabold text-[#0071BC] tracking-wider uppercase bg-[#F0F3FF] px-3 py-1 rounded-full border border-[#0071BC]/10 inline-block mb-2 font-montserrat">
                {score.category}
              </span>
              <h1 className="text-3xl font-black font-montserrat text-[#111C2D] tracking-tight">{score.title}</h1>
              <p className="text-sm text-[#4C4546] mt-2">
                Compositor:{" "}
                <Link href={`/compositores/${composer.slug}`} className="text-[#0071BC] hover:underline font-bold">
                  {composer.name}
                </Link>
              </p>
            </div>

            <div className="border-t border-b border-black/5 py-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-[#4C4546] font-medium block">Precio COP / USD</span>
                <div className="text-2xl font-black font-montserrat text-[#111C2D]">
                  ${score.priceCOP.toLocaleString('es-CO')} COP <span className="text-xs font-semibold text-[#4C4546]">(${score.priceUSD} USD)</span>
                </div>
              </div>
              <span className="text-xs px-3 py-1 bg-[#FBB03B]/20 text-[#111C2D] border border-[#FBB03B]/40 rounded-full font-extrabold font-montserrat">
                Nivel: {score.level}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold font-montserrat text-[#111C2D] mb-2">Descripción y Edición</h3>
              <p className="text-sm text-[#4C4546] font-normal leading-relaxed">
                {score.description}
              </p>
            </div>

            {/* Selector de Copias / Licencias */}
            <div>
              <label className="block text-xs font-bold text-[#111C2D] mb-2 font-montserrat">Número de Copias Impresas Permitidas:</label>
              <select className="w-full bg-[#F0F3FF] border border-black/10 rounded-xl px-4 py-3 text-sm text-[#111C2D] font-medium focus:outline-none focus:ring-2 focus:ring-[#0071BC]">
                <option value="1">1 Copia Personal ($ {score.priceCOP.toLocaleString('es-CO')} COP)</option>
                <option value="5">5 Copias de Estudio / Coro</option>
                <option value="10">10 Copias Académicas</option>
              </select>
            </div>

            {/* Botones de Acción */}
            <div className="space-y-3 pt-2">
              <Link
                href="/checkout"
                className="w-full py-4 text-center block font-extrabold text-sm uppercase tracking-wider bg-[#FBB03B] text-[#111C2D] rounded-xl hover:bg-[#e09b2d] transition shadow-md hover:shadow-lg font-montserrat flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">shopping_cart</span>
                Comprar Ahora & Descargar PDF
              </Link>
              <p className="text-[11px] text-center text-[#4C4546] font-medium flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-xs text-[#0071BC]">bolt</span>
                Descarga digital inmediata post-pago con marca de agua personalizada con tu nombre.
              </p>
            </div>

          </div>
        </div>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}


