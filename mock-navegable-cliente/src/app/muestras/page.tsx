import Image from "next/image";

export default function MuestrasPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#18181B] flex flex-col font-sans p-8 max-w-6xl mx-auto space-y-12">
      
      <div className="text-center space-y-3 border-b border-stone-200 pb-8">
        <span className="text-xs font-bold text-[#D97706] tracking-widest uppercase">Galería de Conceptos</span>
        <h1 className="text-4xl font-bold font-adam text-stone-900">Muestras de Diseño Visual — Piano Colombia</h1>
        <p className="text-stone-600 max-w-2xl mx-auto text-sm">
          Explora cada una de las 3 opciones gráficas creadas para elevar la estética de la tienda.
        </p>
      </div>

      {/* Opción 1 */}
      <section className="bg-white p-6 rounded-2xl border border-stone-200 shadow-md space-y-4">
        <div className="flex justify-between items-center border-b border-stone-100 pb-4">
          <div>
            <span className="text-xs font-bold text-[#0071BC] uppercase">Opción 1</span>
            <h2 className="text-2xl font-bold font-adam text-stone-900">Glassmorphism Claro Ultra-Moderno</h2>
          </div>
          <span className="text-xs px-3 py-1 bg-blue-50 text-[#0071BC] font-semibold rounded-full">Contemporáneo & Traslúcido</span>
        </div>
        <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-stone-200 shadow-inner">
          <Image
            src="/images/mockups/ui_glassmorphic_light_1788483926244.jpg"
            alt="Glassmorphism Claro"
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* Opción 2 */}
      <section className="bg-white p-6 rounded-2xl border-2 border-amber-400 shadow-lg space-y-4">
        <div className="flex justify-between items-center border-b border-stone-100 pb-4">
          <div>
            <span className="text-xs font-bold text-[#D97706] uppercase">Opción 2 (Recomendada)</span>
            <h2 className="text-2xl font-bold font-adam text-stone-900">Editorial Fotográfico de Concierto</h2>
          </div>
          <span className="text-xs px-3 py-1 bg-amber-100 text-[#B45309] font-bold rounded-full">Galería & Revista Pianística</span>
        </div>
        <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-stone-200 shadow-inner">
          <Image
            src="/images/mockups/piano_hero_banner_1788483832800.jpg"
            alt="Editorial Fotográfico"
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* Opción 3 */}
      <section className="bg-white p-6 rounded-2xl border border-stone-200 shadow-md space-y-4">
        <div className="flex justify-between items-center border-b border-stone-100 pb-4">
          <div>
            <span className="text-xs font-bold text-stone-600 uppercase">Opción 3</span>
            <h2 className="text-2xl font-bold font-adam text-stone-900">Clásico Tradicional Madera & Marfil</h2>
          </div>
          <span className="text-xs px-3 py-1 bg-stone-100 text-stone-700 font-semibold rounded-full">Estilo Conservatorio</span>
        </div>
        <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-stone-200 shadow-inner">
          <Image
            src="/images/mockups/ui_warm_wood_ivory_1788483960287.jpg"
            alt="Madera y Marfil Clásico"
            fill
            className="object-cover"
          />
        </div>
      </section>

    </div>
  );
}
