"use client";

import { useState } from "react";
import Link from "next/link";

export default function AdminCompositoresPage() {
  const [pendingComposers, setPendingComposers] = useState([
    {
      id: "comp_req_101",
      name: "Guillermo Uribe Holguín",
      pseudonym: "G. Uribe Holguín",
      docType: "CC",
      docNumber: "19283746",
      country: "Colombia",
      city: "Bogotá",
      email: "guribe@pianocolombia.com",
      date: "2 Sept 2026",
      status: "PENDIENTE",
    },
  ]);

  const [rejectedId, setRejectedId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleApprove = (id: string) => {
    setPendingComposers(pendingComposers.map(c => c.id === id ? { ...c, status: "APROBADO" } : c));
    alert("✅ Compositor aprobado. Se ha enviado automáticamente el correo de bienvenida y activación.");
  };

  const handleRejectSubmit = (id: string) => {
    setPendingComposers(pendingComposers.map(c => c.id === id ? { ...c, status: "RECHAZADO" } : c));
    setRejectedId(null);
    setRejectionReason("");
    alert("❌ Solicitud rechazada. Se ha enviado el correo explicativo con la razón especificada.");
  };

  return (
    <div className="space-y-8 text-[#111C2D]">
      
      {/* Header de Módulo */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F3FF] border border-[#0071BC]/10 text-[#0071BC] text-[11px] font-extrabold uppercase tracking-wider mb-2 font-montserrat">
          <span className="material-symbols-outlined text-xs">person_check</span>
          Moderación de Cuentas de Autor
        </div>
        <h1 className="text-3xl font-black font-montserrat text-[#111C2D] tracking-tight">
          Aprobación de Compositores
        </h1>
        <p className="text-xs md:text-sm text-[#4C4546] font-medium max-w-2xl leading-relaxed">
          Revisa y aprueba las solicitudes de registro para autorizar el ingreso a la plataforma y publicación en catálogo.
        </p>
      </div>

      {/* Lista de Solicitudes */}
      <div className="space-y-6">
        {pendingComposers.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-6 md:p-8 space-y-6">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-black/5 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full font-extrabold font-montserrat whitespace-nowrap shrink-0 ${
                    c.status === "PENDIENTE" ? "bg-amber-50 text-amber-800 border border-amber-200" :
                    c.status === "APROBADO" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                    "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}>
                    {c.status === "PENDIENTE" && <span className="material-symbols-outlined text-xs">hourglass_top</span>}
                    {c.status === "APROBADO" && <span className="material-symbols-outlined text-xs">check_circle</span>}
                    {c.status === "RECHAZADO" && <span className="material-symbols-outlined text-xs">cancel</span>}
                    {c.status}
                  </span>
                  <span className="text-xs text-[#4C4546] font-medium">Solicitud #{c.id} • {c.date}</span>
                </div>

                <h2 className="text-2xl font-black font-montserrat text-[#111C2D] mt-1">{c.name}</h2>
                <span className="text-xs text-[#0071BC] font-bold">Pseudónimo en catálogo: {c.pseudonym}</span>
              </div>

              {c.status === "PENDIENTE" && (
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={() => handleApprove(c.id)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center justify-center gap-1.5 flex-1 md:flex-none"
                  >
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    Aprobar Compositor
                  </button>
                  <button
                    onClick={() => setRejectedId(c.id)}
                    className="px-4 py-2.5 bg-rose-50 text-[#C1272D] border border-rose-200 hover:bg-rose-100 font-bold text-xs rounded-xl transition font-montserrat flex items-center justify-center gap-1 flex-1 md:flex-none"
                  >
                    <span className="material-symbols-outlined text-base">cancel</span>
                    Rechazar
                  </button>
                </div>
              )}
            </div>

            {/* Detalles del Solicitante */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs text-[#4C4546] bg-[#F0F3FF]/60 p-4 rounded-xl border border-black/5">
              <div>
                <span className="block font-bold text-[#111C2D] font-montserrat">Documento de Identidad:</span>
                <span className="font-mono text-[#111C2D]">{c.docType} {c.docNumber}</span>
              </div>
              <div>
                <span className="block font-bold text-[#111C2D] font-montserrat">Ubicación Residencial:</span>
                <span>{c.city}, {c.country}</span>
              </div>
              <div>
                <span className="block font-bold text-[#111C2D] font-montserrat">Correo Electrónico:</span>
                <span className="text-[#0071BC] font-mono">{c.email}</span>
              </div>
              <div>
                <span className="block font-bold text-[#111C2D] font-montserrat">Notificación Transaccional:</span>
                <span>Motor Resend API Habilitado</span>
              </div>
            </div>

            {/* Formulario de Motivo de Rechazo */}
            {rejectedId === c.id && (
              <div className="p-5 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
                <label className="block text-xs font-bold text-[#C1272D] font-montserrat">
                  Indica el motivo de rechazo (se incluirá en el correo enviado al compositor):
                </label>
                <textarea
                  rows={2}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ej: Documento de identidad no legible. Por favor adjuntar escaneo claro..."
                  className="w-full bg-white border border-rose-200 rounded-xl p-3 text-xs text-[#111C2D] focus:outline-none focus:ring-2 focus:ring-[#C1272D]"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setRejectedId(null)}
                    className="px-3 py-1.5 text-xs text-[#4C4546] font-semibold hover:underline font-montserrat"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleRejectSubmit(c.id)}
                    className="px-4 py-2 bg-[#C1272D] hover:bg-rose-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition font-montserrat shadow-xs"
                  >
                    Confirmar Rechazo & Enviar Email
                  </button>
                </div>
              </div>
            )}

          </div>
        ))}
      </div>

    </div>
  );
}
