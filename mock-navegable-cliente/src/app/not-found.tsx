import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F9F9FF] text-[#111C2D] font-inter antialiased flex flex-col justify-between relative selection:bg-[#FBB03B]/30 selection:text-[#111C2D]">
      
      {/* Dynamic Ambient Background */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,transparent_32px,rgba(17,28,45,0.03)_32px,rgba(17,28,45,0.03)_33px)] opacity-70"></div>
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-full max-w-[850px] h-[400px] bg-gradient-to-b from-amber-100/50 via-blue-50/40 to-transparent rounded-full blur-[120px]"></div>
      </div>

      {/* Header Unificado Stitch */}
      <Header />

      {/* Main Content Area */}
      <main className="relative z-10 flex-grow flex items-center justify-center py-16 px-6">
        <div className="max-w-2xl w-full text-center space-y-8">
          
          {/* Hero Card 404 */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-black/5 shadow-[0_20px_40px_-10px_rgba(15,23,42,0.08)] relative overflow-hidden space-y-6">
            
            {/* Barra Tríada de Acento Stitch */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#FBB03B] via-[#0071BC] to-[#C1272D]"></div>

            {/* Badge Error 404 */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F0F3FF] border border-[#0071BC]/10 text-[#0071BC] text-[11px] font-extrabold uppercase tracking-wider font-montserrat">
              <span className="w-2 h-2 rounded-full bg-[#C1272D] animate-ping"></span>
              Error 404 • Página No Encontrada
            </div>

            {/* Iso-Icono Clave de Sol */}
            <div className="w-20 h-20 bg-[#111C2D] text-[#FBB03B] rounded-2xl flex items-center justify-center text-4xl mx-auto shadow-md transform hover:rotate-6 transition-transform">
              🎼
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-montserrat text-[#111C2D] tracking-tight">
                Nota Fuera de Compás
              </h1>
              <p className="text-xs sm:text-sm text-[#4C4546] font-normal leading-relaxed max-w-md mx-auto">
                Parece que la página o la partitura que estás buscando no existe, ha cambiado de tono o ya no forma parte activa del archivo editorial.
              </p>
            </div>

            {/* Buscador Rápido de Emergencia */}
            <div className="pt-2 max-w-md mx-auto">
              <form action="/tienda" method="GET" className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-[#4C4546] text-lg">search</span>
                <input
                  type="search"
                  name="q"
                  placeholder="¿Buscas una partitura o compositor especifico?..."
                  className="w-full pl-10 pr-24 py-3 text-xs bg-[#F0F3FF] border border-black/5 rounded-xl text-[#111C2D] placeholder-[#4C4546]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 px-3 py-1.5 bg-[#0071BC] hover:bg-[#005a96] text-white text-[11px] font-extrabold rounded-lg transition font-montserrat"
                >
                  Buscar
                </button>
              </form>
            </div>

            {/* Enlaces de Acción Destacados */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
              <Link
                href="/"
                className="px-6 py-3.5 bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">home</span>
                Volver al Inicio
              </Link>
              <Link
                href="/tienda"
                className="px-6 py-3.5 bg-[#F0F3FF] hover:bg-slate-200/60 text-[#111C2D] font-bold text-xs rounded-xl transition font-montserrat flex items-center justify-center gap-2 border border-black/5"
              >
                <span className="material-symbols-outlined text-base text-[#0071BC]">storefront</span>
                Explorar Tienda
              </Link>
              <Link
                href="/compositor/login"
                className="px-6 py-3.5 bg-white border border-black/10 hover:bg-[#F0F3FF] text-[#111C2D] font-bold text-xs rounded-xl transition font-montserrat flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base text-[#C1272D]">music_note</span>
                Portal Compositor
              </Link>
            </div>

          </div>

        </div>
      </main>

      {/* Footer Unificado Stitch */}
      <Footer />

      {/* Flotante WhatsApp Support */}
      <aside aria-label="Soporte WhatsApp" className="fixed bottom-6 right-6 z-50">
        <a
          href="https://wa.me/573137529693"
          target="_blank"
          rel="noopener noreferrer"
          title="Atención al usuario vía WhatsApp"
          className="flex items-center gap-2.5 bg-white hover:bg-emerald-50 text-[#111C2D] border border-emerald-500/40 rounded-full px-4 py-2.5 shadow-lg backdrop-blur-md transition-all duration-200 group hover:scale-105"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="material-symbols-outlined text-emerald-600 text-lg group-hover:scale-110 transition-transform">chat</span>
          <span className="text-xs font-bold hidden md:inline font-montserrat">¿Necesitas ayuda?</span>
        </a>
      </aside>

    </div>
  );
}
