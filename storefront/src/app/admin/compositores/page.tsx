"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getAdminComposersQueue,
  approveComposerAdmin,
  rejectComposerAdmin,
  getCommissionSettings,
  updateComposerCommission
} from "@/lib/api-client";

export default function AdminCompositoresPage() {
  const [composersList, setComposersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectedId, setRejectedId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [defaultCommission, setDefaultCommission] = useState<number>(15);
  const [editingCommissionId, setEditingCommissionId] = useState<string | null>(null);
  const [commissionValueInput, setCommissionValueInput] = useState<string>("");
  const [expandedPhotoUrl, setExpandedPhotoUrl] = useState<string | null>(null);

  const fetchComposersAndSettings = async () => {
    setLoading(true);
    try {
      const [composersData, commissionData] = await Promise.all([
        getAdminComposersQueue(),
        getCommissionSettings()
      ]);

      if (commissionData && commissionData.success) {
        setDefaultCommission(commissionData.defaultCommission || 15);
      }

      const commissionMap = new Map();
      if (commissionData?.composers) {
        commissionData.composers.forEach((c: any) => {
          commissionMap.set(c.id, {
            customCommission: c.customCommission,
            effectiveCommission: c.effectiveCommission,
          });
        });
      }

      if (composersData && composersData.length > 0) {
        setComposersList(composersData.map((c: any) => {
          const commInfo = commissionMap.get(c.id);
          return {
            id: c.id,
            firstName: c.first_name || "",
            lastName: c.last_name || "",
            name: c.artistic_name || `${c.first_name || ""} ${c.last_name || ""}`.trim() || "Sin Nombre",
            pseudonym: c.artistic_name || "N/A",
            photoUrl: c.photo_url || null,
            bioEs: c.bio_es || "",
            bioEn: c.bio_en || "",
            docType: c.bank_account?.document_type || "CC",
            docNumber: c.bank_account?.document_number || "Pendiente",
            accountHolder: c.bank_account?.account_holder_name || `${c.first_name || ""} ${c.last_name || ""}`.trim(),
            country: "Colombia",
            city: c.region || "Colombia",
            email: c.email,
            phone: c.phone || "No registrado",
            date: new Date(c.created_at || c.createdAt || Date.now()).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" }),
            status: c.status === "PENDING_APPROVAL" ? "PENDIENTE" : c.status === "APPROVED" ? "APROBADO" : "RECHAZADO",
            bankName: c.bank_account?.bank_name || "No especificado",
            accountType: c.bank_account?.account_type || "Ahorros",
            accountNumber: c.bank_account?.account_number || "No especificado",
            customCommission: commInfo?.customCommission ?? (c.commission_percentage !== null ? Number(c.commission_percentage) : null),
            effectiveCommission: commInfo?.effectiveCommission ?? (c.commission_percentage !== null ? Number(c.commission_percentage) : (commissionData?.defaultCommission || 15)),
          };
        }));
      } else {
        setComposersList([]);
      }
    } catch (err) {
      console.error("Error al cargar compositores y comisiones:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComposersAndSettings();
  }, []);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await approveComposerAdmin(id);
      setComposersList(prev => prev.map(c => c.id === id ? { ...c, status: "APROBADO" } : c));
      alert("✅ Compositor aprobado en base de datos. Se ha activado su perfil en el catálogo.");
    } catch (err: any) {
      console.error(err);
      alert("Error al aprobar compositor: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async (id: string) => {
    setActionLoading(id);
    try {
      await rejectComposerAdmin(id, rejectionReason);
      setComposersList(prev => prev.map(c => c.id === id ? { ...c, status: "RECHAZADO" } : c));
      setRejectedId(null);
      setRejectionReason("");
      alert("❌ Solicitud rechazada en base de datos.");
    } catch (err: any) {
      console.error(err);
      alert("Error al rechazar: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveComposerCommission = async (composerId: string) => {
    setActionLoading(composerId);
    try {
      const val = commissionValueInput.trim() === "" ? null : Number(commissionValueInput);
      await updateComposerCommission(composerId, val);
      alert(val !== null ? `✅ Comisión fijada al ${val}% para este compositor.` : "✅ Se restableció a la comisión general de la plataforma.");
      setEditingCommissionId(null);
      fetchComposersAndSettings();
    } catch (err: any) {
      alert("Error al actualizar comisión: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8 text-[#111C2D]">
      
      {/* Header de Módulo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F3FF] border border-[#0071BC]/10 text-[#0071BC] text-[11px] font-extrabold uppercase tracking-wider mb-2 font-montserrat">
            <span className="material-symbols-outlined text-xs">person_check</span>
            Moderación Integral de Compositores • Cloudflare R2
          </div>
          <h1 className="text-3xl font-black font-montserrat text-[#111C2D] tracking-tight">
            Aprobación de Compositores & Perfiles
          </h1>
          <p className="text-xs md:text-sm text-[#4C4546] font-medium max-w-2xl leading-relaxed">
            Revisa las solicitudes de registro con su <strong>fotografía oficial</strong> en Cloudflare R2, biografía completa y datos bancarios antes de autorizar su acceso al catálogo.
          </p>
        </div>

        <Link
          href="/admin/dashboard"
          className="self-start md:self-auto px-4 py-2.5 bg-[#F0F3FF] hover:bg-[#111C2D] text-[#111C2D] hover:text-white rounded-xl text-xs font-bold font-montserrat transition inline-flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">dashboard</span>
          Volver al Tablero
        </Link>
      </div>

      {/* Banner de Comisión General */}
      <div className="p-4 bg-amber-50/70 border border-amber-200/70 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-amber-600 text-xl shrink-0">percent</span>
          <div>
            <span className="font-extrabold font-montserrat text-[#111C2D]">Comisión General Vigente: </span>
            <span className="font-black text-[#0071BC] font-mono">{defaultCommission}%</span>
            <span className="text-[#4C4546] ml-2 font-medium">(Aplica a los autores sin tasa personalizada).</span>
          </div>
        </div>

        <Link
          href="/admin/dashboard"
          className="text-[11px] font-extrabold text-[#0071BC] hover:underline font-montserrat"
        >
          Editar Comisión General en Tablero →
        </Link>
      </div>

      {/* Lista de Solicitudes y Compositores */}
      <div className="space-y-6">
        {loading ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-black/5 shadow-xs">
            <div className="w-8 h-8 border-3 border-[#0071BC] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-bold text-[#4C4546] uppercase tracking-wider font-montserrat">Consultando solicitudes y acuerdos en PostgreSQL...</p>
          </div>
        ) : composersList.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-black/5 shadow-xs space-y-3">
            <span className="material-symbols-outlined text-4xl text-[#4C4546]/40">inbox</span>
            <p className="text-sm font-bold text-[#111C2D] font-montserrat">No hay solicitudes ni compositores registrados en este momento.</p>
          </div>
        ) : composersList.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-6 md:p-8 space-y-6">
            
            {/* Header de la Tarjeta con Fotografía */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 border-b border-black/5 pb-6">
              <div className="flex items-start gap-4">
                {/* Fotografía de Perfil en R2 */}
                <div
                  onClick={() => c.photoUrl && setExpandedPhotoUrl(c.photoUrl)}
                  className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 border-2 border-[#FBB03B] shadow-sm bg-[#111C2D] flex items-center justify-center font-montserrat font-black text-2xl text-white ${
                    c.photoUrl ? "cursor-zoom-in group" : ""
                  }`}
                >
                  {c.photoUrl ? (
                    <>
                      <img src={c.photoUrl} alt={c.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="material-symbols-outlined text-white text-xl">zoom_in</span>
                      </div>
                    </>
                  ) : (
                    <span>{c.name.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
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

                    {c.photoUrl ? (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        <span className="material-symbols-outlined text-xs">cloud_done</span> Foto en R2
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Sin Foto de Perfil
                      </span>
                    )}

                    <span className="text-xs text-[#4C4546] font-medium">ID: {c.id} • Registrado: {c.date}</span>
                  </div>

                  <h2 className="text-2xl font-black font-montserrat text-[#111C2D] mt-1.5">{c.name}</h2>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs mt-1">
                    <span className="text-[#0071BC] font-bold">Pseudónimo: {c.pseudonym}</span>
                    <span className="text-[#4C4546]">•</span>
                    <span className="text-[#4C4546]">Nombre Real: {c.firstName} {c.lastName}</span>
                    <span className="text-[#4C4546]">•</span>
                    <span className="text-[#4C4546] font-mono">{c.email}</span>
                    <span className="text-[#4C4546]">•</span>
                    <span className="text-[#4C4546] font-mono">{c.phone}</span>
                  </div>
                </div>
              </div>

              {c.status === "PENDIENTE" && (
                <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                  <button
                    onClick={() => handleApprove(c.id)}
                    disabled={actionLoading === c.id}
                    className="flex-1 md:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider font-montserrat flex items-center justify-center gap-1.5 transition shadow-sm disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-base">check</span>
                    Aprobar Solicitud
                  </button>
                  <button
                    onClick={() => setRejectedId(c.id)}
                    disabled={actionLoading === c.id}
                    className="flex-1 md:flex-none px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-extrabold uppercase tracking-wider font-montserrat flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-base">close</span>
                    Rechazar
                  </button>
                </div>
              )}
            </div>

            {/* SECCIÓN BIOGRÁFICA (ESPAÑOL E INGLÉS) */}
            <div className="p-4 bg-[#F0F3FF]/40 rounded-xl border border-black/5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0071BC] text-lg">history_edu</span>
                <span className="text-xs font-extrabold font-montserrat text-[#111C2D]">Ficha Biográfica del Autor</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-white p-3.5 rounded-lg border border-black/5">
                  <span className="block font-bold text-[#111C2D] font-montserrat mb-1">🇨🇴 Biografía (Español):</span>
                  <p className="text-[#4C4546] leading-relaxed italic">
                    {c.bioEs ? `"${c.bioEs}"` : "Biografía en español no registrada aún."}
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-lg border border-black/5">
                  <span className="block font-bold text-[#111C2D] font-montserrat mb-1">🇺🇸 Biography (English):</span>
                  <p className="text-[#4C4546] leading-relaxed italic">
                    {c.bioEn ? `"${c.bioEn}"` : "English biography not registered yet."}
                  </p>
                </div>
              </div>
            </div>

            {/* SECCIÓN DE COMISIÓN INDIVIDUALIZADA */}
            <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold font-montserrat text-[#111C2D]">Comisión de Plataforma para este Autor:</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-black font-mono ${
                    c.customCommission !== null ? "bg-[#0071BC] text-white" : "bg-[#FBB03B]/30 text-[#111C2D]"
                  }`}>
                    {c.effectiveCommission}%
                  </span>
                  <span className="text-[11px] text-[#4C4546] font-medium">
                    ({c.customCommission !== null ? "Tasa personalizada" : "Heredada de la tasa general"})
                  </span>
                </div>
                <p className="text-[11px] text-[#4C4546] mt-0.5">
                  El compositor recibe el <strong>{100 - c.effectiveCommission}%</strong> neto de cada venta de sus partituras.
                </p>
              </div>

              {editingCommissionId === c.id ? (
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <div className="relative w-24">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      placeholder={defaultCommission.toString()}
                      value={commissionValueInput}
                      onChange={(e) => setCommissionValueInput(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-black/20 rounded-lg text-xs font-mono font-bold text-center"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-[#4C4546]">%</span>
                  </div>
                  <button
                    onClick={() => handleSaveComposerCommission(c.id)}
                    disabled={actionLoading === c.id}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold font-montserrat"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => {
                      setEditingCommissionId(null);
                      setCommissionValueInput("");
                    }}
                    className="px-2.5 py-1.5 text-xs text-[#4C4546] hover:text-[#111C2D]"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setEditingCommissionId(c.id);
                    setCommissionValueInput(c.customCommission !== null ? c.customCommission.toString() : "");
                  }}
                  className="px-3.5 py-1.5 bg-white hover:bg-[#111C2D] text-[#111C2D] hover:text-white border border-black/10 rounded-xl text-xs font-bold font-montserrat transition shadow-2xs inline-flex items-center gap-1 self-start sm:self-auto"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                  {c.customCommission !== null ? "Modificar % Comisión" : "Asignar % Especial"}
                </button>
              )}
            </div>

            {/* Detalles Fiscales y Bancarios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs text-[#4C4546] bg-[#F0F3FF]/60 p-4 rounded-xl border border-black/5">
              <div>
                <span className="block font-bold text-[#111C2D] font-montserrat">Documento de Identidad:</span>
                <span className="font-mono text-[#111C2D]">{c.docType} {c.docNumber}</span>
              </div>
              <div>
                <span className="block font-bold text-[#111C2D] font-montserrat">Ubicación / Región:</span>
                <span>{c.city}, {c.country}</span>
              </div>
              <div>
                <span className="block font-bold text-[#111C2D] font-montserrat">Cuenta Bancaria para Pagos:</span>
                <span className="font-mono">{c.bankName} ({c.accountType}) - {c.accountNumber}</span>
              </div>
              <div>
                <span className="block font-bold text-[#111C2D] font-montserrat">Titular de la Cuenta:</span>
                <span className="font-semibold text-[#111C2D]">{c.accountHolder}</span>
              </div>
            </div>

            {/* Formulario de Motivo de Rechazo */}
            {rejectedId === c.id && (
              <div className="p-5 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
                <label className="block text-xs font-bold text-[#C1272D] font-montserrat">
                  Indica el motivo de rechazo (se incluirá en la notificación al compositor):
                </label>
                <textarea
                  rows={2}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ej: La fotografía de retrato no es nítida o el documento bancario no coincide con el titular..."
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
                    Confirmar Rechazo & Guardar
                  </button>
                </div>
              </div>
            )}

          </div>
        ))}
      </div>

      {/* Modal de Zoom para Foto de Perfil */}
      {expandedPhotoUrl && (
        <div
          onClick={() => setExpandedPhotoUrl(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs cursor-zoom-out animate-in fade-in"
        >
          <div className="relative max-w-lg w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-2" onClick={(e) => e.stopPropagation()}>
            <img src={expandedPhotoUrl} alt="Foto de autor" className="w-full h-auto max-h-[70vh] object-contain rounded-xl" />
            <div className="p-4 flex items-center justify-between">
              <span className="text-xs font-bold text-[#111C2D] font-montserrat">Fotografía Oficial (Cloudflare R2)</span>
              <button
                onClick={() => setExpandedPhotoUrl(null)}
                className="px-3 py-1.5 bg-[#111C2D] text-white text-xs font-bold rounded-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
