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
  const [isPermanentBlock, setIsPermanentBlock] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [defaultCommission, setDefaultCommission] = useState<number>(15);
  const [editingCommissionId, setEditingCommissionId] = useState<string | null>(null);
  const [commissionValueInput, setCommissionValueInput] = useState<string>("");
  const [expandedPhotoUrl, setExpandedPhotoUrl] = useState<string | null>(null);

  // Estados para Toast Notification y Validación en Modal
  const [toast, setToast] = useState<{
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  } | null>(null);
  const [modalValidationError, setModalValidationError] = useState<string | null>(null);
  const [confirmingBlock, setConfirmingBlock] = useState(false);

  const showToast = (type: "success" | "error" | "warning" | "info", title: string, message: string) => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast(prev => prev && prev.title === title ? null : prev);
    }, 5000);
  };

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
            status: c.status === "PENDING_APPROVAL" ? "PENDIENTE" : c.status === "APPROVED" ? "APROBADO" : c.status === "BLOCKED" ? "BLOQUEADO" : c.status === "DRAFT" ? "BORRADOR" : "RECHAZADO",
            approvalAttempts: c.approval_attempts !== undefined ? Number(c.approval_attempts) : 0,
            rejectionReason: c.rejection_reason || null,
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
      showToast(
        "success",
        "Compositor Aprobado",
        "Se ha activado su perfil en el catálogo y se le notificó por correo de bienvenida."
      );
    } catch (err: any) {
      console.error(err);
      showToast("error", "Error al Aprobar", err.message || "No se pudo procesar la aprobación.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async (id: string, blockMode: boolean) => {
    if (!rejectionReason.trim()) {
      setModalValidationError(
        blockMode 
          ? "Por favor escribe el motivo del bloqueo definitivo." 
          : "Por favor escribe las observaciones para que el compositor sepa qué corregir."
      );
      return;
    }
    setModalValidationError(null);

    // Si es modo bloqueo y aún no ha confirmado en el paso 2 del modal
    if (blockMode && !confirmingBlock) {
      setConfirmingBlock(true);
      return;
    }

    setActionLoading(id);
    try {
      await rejectComposerAdmin(id, rejectionReason, blockMode);
      setComposersList(prev => prev.map(c => c.id === id ? { 
        ...c, 
        status: blockMode ? "BLOQUEADO" : "RECHAZADO",
        rejectionReason: rejectionReason 
      } : c));
      setRejectedId(null);
      setRejectionReason("");
      setIsPermanentBlock(false);
      setConfirmingBlock(false);
      setModalValidationError(null);

      if (blockMode) {
        showToast(
          "error",
          "Compositor Bloqueado Definitivamente",
          "Se cerró la solicitud permanentemente y se envió correo de resolución definitiva."
        );
      } else {
        showToast(
          "warning",
          "Solicitud Rechazada con Observaciones",
          "Se notificó al compositor por correo para que realice las correcciones y vuelva a enviar su perfil."
        );
      }
    } catch (err: any) {
      console.error(err);
      showToast("error", "Error en Moderación", err.message || "No se pudo procesar la moderación.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveComposerCommission = async (composerId: string) => {
    setActionLoading(composerId);
    try {
      const val = commissionValueInput.trim() === "" ? null : Number(commissionValueInput);
      await updateComposerCommission(composerId, val);
      showToast(
        "success",
        "Comisión Actualizada",
        val !== null ? `Comisión fijada al ${val}% para este compositor.` : "Se restableció a la comisión general de la plataforma."
      );
      setEditingCommissionId(null);
      fetchComposersAndSettings();
    } catch (err: any) {
      showToast("error", "Error al Guardar Comisión", err.message || "No se pudo actualizar el porcentaje.");
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
                      c.status === "BLOQUEADO" ? "bg-zinc-900 text-white border border-zinc-700" :
                      c.status === "BORRADOR" ? "bg-slate-100 text-slate-700 border border-slate-300" :
                      "bg-amber-50 text-amber-900 border border-amber-300"
                    }`}>
                      {c.status === "PENDIENTE" && <span className="material-symbols-outlined text-xs">hourglass_top</span>}
                      {c.status === "APROBADO" && <span className="material-symbols-outlined text-xs">check_circle</span>}
                      {c.status === "BLOQUEADO" && <span className="material-symbols-outlined text-xs">block</span>}
                      {c.status === "BORRADOR" && <span className="material-symbols-outlined text-xs">draw</span>}
                      {c.status === "RECHAZADO" && <span className="material-symbols-outlined text-xs">edit_note</span>}
                      {c.status === "BORRADOR" ? "BORRADOR / EN EDICIÓN" : c.status === "RECHAZADO" ? "CON SUGERENCIAS (EN CORRECCIÓN)" : c.status}
                    </span>

                    {/* Badge de Intentos de Aprobación */}
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-black font-mono border ${
                      c.approvalAttempts > 2 
                        ? "bg-rose-50 text-rose-700 border-rose-300" 
                        : c.approvalAttempts > 1 
                        ? "bg-amber-50 text-amber-800 border-amber-300" 
                        : "bg-blue-50 text-[#0071BC] border-blue-200"
                    }`}>
                      <span className="material-symbols-outlined text-xs">history</span>
                      Intento #{c.approvalAttempts}
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

                  {c.rejectionReason && (
                    <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
                      <span className="material-symbols-outlined text-sm text-rose-600 shrink-0 mt-0.5">info</span>
                      <div>
                        <strong>Observaciones previas:</strong> "{c.rejectionReason}"
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
                {c.status === "PENDIENTE" && (
                  <>
                    <button
                      onClick={() => handleApprove(c.id)}
                      disabled={actionLoading === c.id}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider font-montserrat flex items-center justify-center gap-1.5 transition shadow-sm disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-base">check</span>
                      Aprobar
                    </button>
                    <button
                      onClick={() => {
                        setRejectedId(c.id);
                        setIsPermanentBlock(false);
                        setRejectionReason("");
                      }}
                      disabled={actionLoading === c.id}
                      className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-extrabold uppercase tracking-wider font-montserrat flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-base">edit_note</span>
                      Sugerencias / Observaciones
                    </button>
                    <button
                      onClick={() => {
                        setRejectedId(c.id);
                        setIsPermanentBlock(true);
                        setRejectionReason("Se ha superado el número de intentos permitidos o incumplimiento reiterado de las directrices.");
                      }}
                      disabled={actionLoading === c.id}
                      className="px-3.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider font-montserrat flex items-center justify-center gap-1.5 transition shadow-sm disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-base">block</span>
                      Bloquear Definitivo
                    </button>
                  </>
                )}

                {c.status === "BORRADOR" && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-slate-400">edit_note</span>
                      En edición por el autor (Aún no enviado a revisión)
                    </span>
                    <button
                      onClick={() => handleApprove(c.id)}
                      disabled={actionLoading === c.id}
                      title="Autorizar directamente si el administrador conoce al maestro"
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold font-montserrat flex items-center gap-1 transition shadow-xs disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-sm">check</span>
                      Aprobar
                    </button>
                    <button
                      onClick={() => {
                        setRejectedId(c.id);
                        setIsPermanentBlock(true);
                        setRejectionReason("Solicitud bloqueada por administración.");
                      }}
                      disabled={actionLoading === c.id}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold font-montserrat flex items-center gap-1 transition disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-sm">block</span>
                      Bloquear
                    </button>
                  </div>
                )}

                {c.status === "RECHAZADO" && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-300 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-amber-700">hourglass_empty</span>
                      Esperando corrección del autor (Intento #{c.approvalAttempts + 1})
                    </span>
                    <button
                      onClick={() => handleApprove(c.id)}
                      disabled={actionLoading === c.id}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold font-montserrat flex items-center gap-1 transition shadow-xs disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-sm">check</span>
                      Aprobar
                    </button>
                    <button
                      onClick={() => {
                        setRejectedId(c.id);
                        setIsPermanentBlock(true);
                        setRejectionReason("Solicitud cerrada de forma definitiva tras evaluar intentos previos.");
                      }}
                      disabled={actionLoading === c.id}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-900 text-white rounded-xl text-xs font-bold font-montserrat flex items-center gap-1 transition disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-sm">block</span>
                      Bloquear Definitivo
                    </button>
                  </div>
                )}
              </div>
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

          </div>
        ))}
      </div>

      {/* Modal Flotante de Rechazo con Observaciones o Bloqueo Definitivo */}
      {rejectedId && (
        <div 
          onClick={() => {
            setRejectedId(null);
            setRejectionReason("");
            setIsPermanentBlock(false);
          }}
          className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          {(() => {
            const selectedComposer = composersList.find(c => c.id === rejectedId);
            if (!selectedComposer) return null;

            return (
              <div 
                onClick={(e) => e.stopPropagation()}
                className={`relative max-w-lg w-full rounded-3xl p-6 sm:p-7 shadow-2xl border space-y-4 animate-in zoom-in-95 duration-150 ${
                  isPermanentBlock 
                    ? "bg-[#18181B] border-zinc-700 text-white" 
                    : "bg-white border-black/10 text-[#111C2D]"
                }`}
              >
                {/* Header del Modal */}
                <div className="flex items-start justify-between gap-3 border-b pb-4 border-black/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      isPermanentBlock ? "bg-rose-950/80 text-rose-400 border border-rose-800" : "bg-amber-100 text-amber-800 border border-amber-200"
                    }`}>
                      <span className="material-symbols-outlined text-2xl">
                        {isPermanentBlock ? "block" : "edit_note"}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-black font-montserrat">
                        {isPermanentBlock 
                          ? "Bloqueo Definitivo de Acceso" 
                          : "Enviar Sugerencias de Corrección al Autor"}
                      </h3>
                      <p className={`text-xs ${isPermanentBlock ? "text-zinc-400" : "text-[#4C4546]"}`}>
                        Compositor: <strong>{selectedComposer.name}</strong> • Intento Evaluado #{selectedComposer.approvalAttempts}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setRejectedId(null);
                      setRejectionReason("");
                      setIsPermanentBlock(false);
                    }}
                    className={`p-1.5 rounded-xl hover:bg-black/5 transition cursor-pointer ${isPermanentBlock ? "text-zinc-400 hover:text-white" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                </div>

                {/* Switch / Toggle Modo */}
                <div className={`p-2.5 rounded-xl flex items-center justify-between text-xs ${
                  isPermanentBlock ? "bg-zinc-800/80 border border-zinc-700" : "bg-amber-50 border border-amber-200"
                }`}>
                  <span className="font-semibold text-[11px]">
                    {isPermanentBlock ? "Modo: Bloqueo Definitivo Permanente" : `Modo: Sugerencias de Corrección (Habilitará el reenvío para Intento #${(selectedComposer.approvalAttempts || 0) + 1})`}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPermanentBlock(!isPermanentBlock);
                      if (!isPermanentBlock && !rejectionReason) {
                        setRejectionReason("Se ha superado el número de intentos permitidos para subsanar los requisitos curatoriales de la plataforma.");
                      } else if (isPermanentBlock) {
                        setRejectionReason("");
                      }
                    }}
                    className={`px-3 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                      isPermanentBlock 
                        ? "bg-amber-400 text-black hover:bg-amber-300" 
                        : "bg-rose-600 text-white hover:bg-rose-700"
                    }`}
                  >
                    {isPermanentBlock ? "Cambiar a Sugerencias" : "Cambiar a Bloqueo"}
                  </button>
                </div>

                {/* Error de Validación en Modal */}
                {modalValidationError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2 animate-in fade-in">
                    <span className="material-symbols-outlined text-base text-rose-600">error</span>
                    <span>{modalValidationError}</span>
                  </div>
                )}

                {/* Explicación */}
                <p className={`text-xs leading-relaxed ${isPermanentBlock ? "text-zinc-300" : "text-[#4C4546]"}`}>
                  {isPermanentBlock
                    ? "Esta acción deniega la postulación de forma PERMANENTE. Se notificará formalmente al autor por correo que su solicitud definitiva no ha sido aceptada y no podrá reenviar su perfil."
                    : `Escribe las sugerencias u observaciones exactas que el compositor debe corregir (fotografía, biografía o datos bancarios). Se le notificará por correo, se volverá a habilitar su botón para enviar de nuevo a revisión para el Intento #${(selectedComposer.approvalAttempts || 0) + 1} y se bloqueará nuevamente en cuanto el autor lo envíe hasta tu próxima acción o aprobación.`}
                </p>

                {/* Confirmación explícita de Bloqueo Permanente */}
                {confirmingBlock && (
                  <div className="p-4 bg-rose-950/90 border border-rose-700 rounded-2xl space-y-2 text-xs text-rose-200 animate-in fade-in">
                    <div className="flex items-center gap-2 text-white font-bold">
                      <span className="material-symbols-outlined text-rose-400">warning</span>
                      <span>¿Confirmas el bloqueo permanente e irreversible?</span>
                    </div>
                    <p className="text-[11px] text-rose-300 leading-relaxed">
                      El compositor no podrá volver a postularse a la plataforma y se inactivarán sus partituras registradas.
                    </p>
                  </div>
                )}

                {/* Textarea */}
                <div>
                  <label className={`block text-xs font-bold font-montserrat mb-1.5 ${isPermanentBlock ? "text-zinc-300" : "text-[#111C2D]"}`}>
                    {isPermanentBlock ? "Motivo del bloqueo definitivo:" : "Sugerencias u observaciones a corregir (se notificarán al correo):"}
                  </label>
                  <textarea
                    rows={4}
                    autoFocus
                    value={rejectionReason}
                    onChange={(e) => {
                      setRejectionReason(e.target.value);
                      if (modalValidationError) setModalValidationError(null);
                    }}
                    placeholder={
                      isPermanentBlock
                        ? "Ej: Se ha superado el límite de intentos permitidos sin subsanar las observaciones curatoriales..."
                        : "Ej: Por favor adjunta una fotografía con fondo neutro y mayor nitidez, y completa la biografía en español..."
                    }
                    className={`w-full rounded-2xl p-3.5 text-xs focus:outline-none transition ${
                      isPermanentBlock
                        ? "bg-zinc-800 border border-zinc-600 text-white placeholder-zinc-500 focus:ring-2 focus:ring-rose-500"
                        : "bg-[#F0F3FF]/70 border border-black/10 text-[#111C2D] placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#0071BC]"
                    }`}
                  />
                </div>

                {/* Footer Botones */}
                <div className="flex justify-end items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRejectedId(null);
                      setRejectionReason("");
                      setIsPermanentBlock(false);
                      setConfirmingBlock(false);
                      setModalValidationError(null);
                    }}
                    className={`px-4 py-2 text-xs font-bold hover:underline font-montserrat ${
                      isPermanentBlock ? "text-zinc-400 hover:text-white" : "text-[#4C4546]"
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRejectSubmit(selectedComposer.id, isPermanentBlock)}
                    disabled={actionLoading === selectedComposer.id}
                    className={`px-5 py-2.5 font-extrabold text-xs uppercase tracking-wider rounded-xl transition font-montserrat shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
                      isPermanentBlock
                        ? "bg-rose-600 hover:bg-rose-700 text-white"
                        : "bg-[#0071BC] hover:bg-[#005c99] text-white"
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">
                      {isPermanentBlock ? (confirmingBlock ? "gavel" : "block") : "send"}
                    </span>
                    {actionLoading === selectedComposer.id
                      ? "Procesando..."
                      : isPermanentBlock
                      ? (confirmingBlock ? "Sí, Proceder con el Bloqueo" : "Confirmar Bloqueo Definitivo")
                      : "Enviar Sugerencias al Autor"}
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Toast Notification Flotante con Diseño Premium */}
      {toast && (
        <div className="fixed top-6 right-6 z-[10000] max-w-md w-full animate-in slide-in-from-top-4 fade-in duration-300">
          <div className={`p-4 rounded-2xl shadow-2xl border flex items-start gap-3.5 backdrop-blur-md ${
            toast.type === "success" 
              ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-100" 
              : toast.type === "error"
              ? "bg-rose-950/90 border-rose-500/50 text-rose-100"
              : toast.type === "warning"
              ? "bg-amber-950/90 border-amber-500/50 text-amber-100"
              : "bg-blue-950/90 border-blue-500/50 text-blue-100"
          }`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              toast.type === "success" ? "bg-emerald-500 text-white" :
              toast.type === "error" ? "bg-rose-600 text-white" :
              toast.type === "warning" ? "bg-amber-500 text-black" : "bg-blue-500 text-white"
            }`}>
              <span className="material-symbols-outlined text-xl">
                {toast.type === "success" ? "check_circle" : toast.type === "error" ? "cancel" : toast.type === "warning" ? "warning" : "info"}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-black uppercase tracking-wider font-montserrat">{toast.title}</h4>
              <p className="text-xs mt-0.5 leading-relaxed opacity-90">{toast.message}</p>
            </div>

            <button
              onClick={() => setToast(null)}
              className="p-1 rounded-lg opacity-70 hover:opacity-100 transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>
      )}

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
