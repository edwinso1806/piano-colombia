"use client";

import { useState } from "react";
import Link from "next/link";

export default function AdminPartiturasPage() {
  const [pendingScores, setPendingScores] = useState([
    {
      id: "pending_score_1",
      title: "Suite Fantasía Colombiana — Mvt. 1",
      composer: "Adolfo Mejía",
      category: "Piano Solo",
      level: "Virtuoso",
      priceCOP: 60000,
      priceUSD: 16,
      pages: 4,
      date: "2 Sept 2026",
      status: "PENDIENTE",
    },
  ]);

  const handleApprove = (id: string) => {
    setPendingScores(pendingScores.map(s => s.id === id ? { ...s, status: "APROBADA" } : s));
    alert("✅ Partitura aprobada. Ya se encuentra visible en el catálogo de la tienda.");
  };

  const handleReject = (id: string) => {
    setPendingScores(pendingScores.map(s => s.id === id ? { ...s, status: "RECHAZADA" } : s));
    alert("❌ Partitura rechazada. Se ha notificado al compositor por correo.");
  };

  return (
    <div className="space-y-8 text-[#111C2D]">
      
      {/* Header Módulo */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F3FF] border border-[#0071BC]/10 text-[#0071BC] text-[11px] font-extrabold uppercase tracking-wider mb-2 font-montserrat">
          <span className="material-symbols-outlined text-xs">library_music</span>
          Inspección Musicológica & Moderación
        </div>
        <h1 className="text-3xl font-black font-montserrat text-[#111C2D] tracking-tight">
          Aprobación de Partituras
        </h1>
        <p className="text-xs md:text-sm text-[#4C4546] font-medium max-w-2xl leading-relaxed">
          Inspecciona los archivos PDF subidos por compositores, valida las muestras de opacidad al 40% y autoriza la publicación en la tienda.
        </p>
      </div>

      {/* Lista de Partituras Pendientes */}
      <div className="space-y-6">
        {pendingScores.map((s) => (
          <div key={s.id} className="bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-6 md:p-8 space-y-6">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-black/5 pb-4">
              <div>
                <span className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full font-extrabold font-montserrat ${
                  s.status === "PENDIENTE" ? "bg-amber-50 text-amber-800 border border-amber-200" :
                  s.status === "APROBADA" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                  "bg-rose-50 text-rose-700 border border-rose-200"
                }`}>
                  {s.status === "PENDIENTE" && <span className="material-symbols-outlined text-xs">hourglass_top</span>}
                  {s.status === "APROBADA" && <span className="material-symbols-outlined text-xs">check_circle</span>}
                  {s.status === "RECHAZADA" && <span className="material-symbols-outlined text-xs">cancel</span>}
                  {s.status}
                </span>

                <h2 className="text-2xl font-black font-montserrat text-[#111C2D] mt-1">{s.title}</h2>
                <p className="text-xs text-[#0071BC] font-bold">Compositor Autor: {s.composer}</p>
              </div>

              {s.status === "PENDIENTE" && (
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={() => handleApprove(s.id)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center justify-center gap-1.5 flex-1 md:flex-none"
                  >
                    <span className="material-symbols-outlined text-base">publish</span>
                    Publicar en Tienda
                  </button>
                  <button
                    onClick={() => handleReject(s.id)}
                    className="px-4 py-2.5 bg-rose-50 text-[#C1272D] border border-rose-200 hover:bg-rose-100 font-bold text-xs rounded-xl transition font-montserrat flex items-center justify-center gap-1 flex-1 md:flex-none"
                  >
                    <span className="material-symbols-outlined text-base">cancel</span>
                    Rechazar Obra
                  </button>
                </div>
              )}
            </div>

            {/* Grid Detalles de Inspección */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs text-[#4C4546] bg-[#F0F3FF]/60 p-4 rounded-xl border border-black/5">
              <div>
                <span className="block font-bold text-[#111C2D] font-montserrat">Categoría & Nivel:</span>
                <span>{s.category} ({s.level})</span>
              </div>
              <div>
                <span className="block font-bold text-[#111C2D] font-montserrat">Precio Publicado:</span>
                <span className="font-mono text-[#111C2D] font-bold">${s.priceCOP.toLocaleString('es-CO')} COP (${s.priceUSD} USD)</span>
              </div>
              <div>
                <span className="block font-bold text-[#111C2D] font-montserrat">Extensión del PDF Master:</span>
                <span>{s.pages} páginas formateadas</span>
              </div>
              <div>
                <span className="block font-bold text-[#111C2D] font-montserrat">Muestra Protegida:</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">verified</span> 40% Opacidad OK
                </span>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
