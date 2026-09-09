import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-black/5 bg-white py-12 px-4 sm:px-6 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Columna 1: Brand & Bio */}
        <div>
          <Link href="/" className="flex items-center gap-2.5 group mb-4">
            <div className="flex items-center gap-1 shrink-0">
              <div className="h-6 w-1 bg-[#111C2D] rounded-full"></div>
              <div className="h-8 w-1 bg-[#FBB03B] rounded-full"></div>
              <div className="h-5 w-1 bg-[#0071BC] rounded-full"></div>
              <div className="h-7 w-1 bg-[#111C2D] rounded-full"></div>
              <div className="h-4.5 w-1 bg-[#C1272D] rounded-full"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-montserrat text-sm font-black tracking-tight text-[#111C2D] leading-none group-hover:text-[#0071BC] transition-colors">
                PIANO COLOMBIA
              </span>
              <span className="text-[9px] font-extrabold text-[#4C4546] uppercase tracking-wider font-montserrat mt-0.5">
                Archivo & Partituras
              </span>
            </div>
          </Link>
          <p className="text-xs text-[#4C4546] leading-relaxed font-medium">
            El portal definitivo para la difusión, comercialización y preservación de las partituras colombianas para piano.
          </p>
        </div>

        {/* Columna 2: Navegación */}
        <div>
          <h4 className="text-xs font-bold font-montserrat uppercase tracking-wider text-[#111C2D] mb-4">Navegación</h4>
          <ul className="space-y-2 text-xs text-[#4C4546] font-medium">
            <li><Link href="/" className="hover:text-[#0071BC] transition">Inicio</Link></li>
            <li><Link href="/tienda" className="hover:text-[#0071BC] transition">Tienda de Partituras</Link></li>
            <li><Link href="/compositores" className="hover:text-[#0071BC] transition">Directorio de Compositores</Link></li>
            <li><Link href="/blog" className="hover:text-[#0071BC] transition">Blog / Noticias</Link></li>
          </ul>
        </div>

        {/* Columna 3: Portal Compositores */}
        <div>
          <h4 className="text-xs font-bold font-montserrat uppercase tracking-wider text-[#111C2D] mb-4">Compositores</h4>
          <ul className="space-y-2 text-xs text-[#4C4546] font-medium">
            <li><Link href="/compositor/registro" className="hover:text-[#0071BC] transition">Registrarme como Compositor</Link></li>
            <li><Link href="/compositor/login" className="hover:text-[#0071BC] transition">Iniciar Sesión Portal</Link></li>
            <li><a href="#" className="hover:text-[#0071BC] transition">Términos y Condiciones</a></li>
          </ul>
        </div>

        {/* Columna 4: Contacto & Redes */}
        <div>
          <h4 className="text-xs font-bold font-montserrat uppercase tracking-wider text-[#111C2D] mb-4">Contacto</h4>
          <p className="text-xs text-[#4C4546] leading-relaxed mb-3 font-medium">
            soporte@pianocolombia.com
          </p>
          <div className="flex gap-3 text-sm">
            <span className="w-8 h-8 rounded-full bg-[#F0F3FF] border border-black/5 flex items-center justify-center cursor-pointer hover:bg-[#FBB03B] hover:text-[#111C2D] transition shadow-2xs">📷</span>
            <span className="w-8 h-8 rounded-full bg-[#F0F3FF] border border-black/5 flex items-center justify-center cursor-pointer hover:bg-[#FBB03B] hover:text-[#111C2D] transition shadow-2xs">📘</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-black/5 flex flex-col md:flex-row justify-between items-center text-xs text-[#4C4546] font-medium">
        <p>© 2026 Piano Colombia. Todos los derechos reservados.</p>
        <p className="mt-2 md:mt-0">Desarrollado con Next.js 16 & Medusa.js 2.x</p>
      </div>
    </footer>
  );
}
