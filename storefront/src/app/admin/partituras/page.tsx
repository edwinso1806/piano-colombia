"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getAdminScoresQueue,
  approveScoreAdmin,
  rejectScoreAdmin,
} from "@/lib/api-client";

interface ScoreItem {
  id: string;
  title: string;
  slug: string;
  genre: string;
  difficulty: string;
  price_cop: number;
  price_usd: number;
  pages_count: number;
  tonality?: string;
  description_es?: string;
  status: "IN_REVIEW" | "APPROVED" | "REJECTED";
  rejection_notes?: string;
  preview_images?: string[];
  original_pdf_url?: string;
  preview_pdf_url?: string;
  audio_sample_url?: string;
  createdAt: string;
  composer?: {
    id: string;
    artistic_name?: string;
    full_name?: string;
    email?: string;
  };
}

export default function AdminPartiturasPage() {
  const [scores, setScores] = useState<ScoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "IN_REVIEW" | "APPROVED" | "REJECTED">("ALL");

  // Rejection Modal State
  const [selectedScoreForReject, setSelectedScoreForReject] = useState<ScoreItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Inspection Modal State (Full Score Viewer)
  const [inspectingScore, setInspectingScore] = useState<ScoreItem | null>(null);

  // Notification Banner
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchScores = async () => {
    setLoading(true);
    try {
      const data = await getAdminScoresQueue();
      if (data && Array.isArray(data)) {
        setScores(data);
      }
    } catch (err: any) {
      console.warn("Error cargando partituras:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, []);

  const handleApprove = async (score: ScoreItem) => {
    setActionLoading(true);
    setFeedback(null);
    try {
      await approveScoreAdmin(score.id);
      setFeedback({
        type: "success",
        message: `✅ Partitura "${score.title}" aprobada y publicada en la tienda. Correo de notificación enviado al compositor.`,
      });
      await fetchScores();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Error al aprobar la partitura.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScoreForReject) return;
    if (!rejectionReason.trim()) {
      setFeedback({
        type: "error",
        message: "Debes ingresar las observaciones o motivos para el rechazo.",
      });
      return;
    }

    setActionLoading(true);
    setFeedback(null);
    try {
      await rejectScoreAdmin(selectedScoreForReject.id, rejectionReason.trim());
      setFeedback({
        type: "success",
        message: `⚠️ Partitura "${selectedScoreForReject.title}" rechazada. Se enviaron las observaciones por correo al autor para su subsanación.`,
      });
      setSelectedScoreForReject(null);
      setRejectionReason("");
      await fetchScores();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Error al rechazar la partitura.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredScores = scores.filter((s) => {
    if (activeTab === "ALL") return true;
    return s.status === activeTab;
  });

  const countInReview = scores.filter((s) => s.status === "IN_REVIEW").length;
  const countApproved = scores.filter((s) => s.status === "APPROVED").length;
  const countRejected = scores.filter((s) => s.status === "REJECTED").length;

  return (
    <div className="space-y-8 text-[#111C2D]">
      {/* Header del Módulo */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F3FF] border border-[#0071BC]/10 text-[#0071BC] text-[11px] font-extrabold uppercase tracking-wider mb-2 font-montserrat">
          <span className="material-symbols-outlined text-xs">library_music</span>
          Inspección Musicológica & Curaduría Editorial
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-montserrat text-[#111C2D] tracking-tight">
          Moderación de Partituras
        </h1>
        <p className="text-xs md:text-sm text-[#4C4546] font-medium max-w-2xl leading-relaxed">
          Inspecciona los archivos maestros PDF, revisa las muestras generadas con marcas de agua y difuminado, y aprueba o rechaza con observaciones técnicas.
        </p>
      </div>

      {/* Banner de Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-medium ${
            feedback.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
              : "bg-rose-50 border border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-base shrink-0">
              {feedback.type === "success" ? "check_circle" : "error"}
            </span>
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-700"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Tabs de Filtro de Estado */}
      <div className="flex flex-wrap items-center gap-2 border-b border-black/5 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("ALL")}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-montserrat transition cursor-pointer ${
            activeTab === "ALL"
              ? "bg-[#111C2D] text-white shadow-xs"
              : "bg-[#F0F3FF] text-[#4C4546] hover:text-[#111C2D]"
          }`}
        >
          Todas las Partituras ({scores.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("IN_REVIEW")}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-montserrat transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === "IN_REVIEW"
              ? "bg-[#FBB03B] text-[#111C2D] shadow-xs"
              : "bg-amber-50 text-amber-800 hover:bg-amber-100"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span>En Revisión / Pendientes ({countInReview})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("APPROVED")}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-montserrat transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === "APPROVED"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
          }`}
        >
          <span>Aprobadas ({countApproved})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("REJECTED")}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-montserrat transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === "REJECTED"
              ? "bg-[#C1272D] text-white shadow-xs"
              : "bg-rose-50 text-[#C1272D] hover:bg-rose-100"
          }`}
        >
          <span>Rechazadas ({countRejected})</span>
        </button>
      </div>

      {/* Lista de Partituras */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 font-medium">
          <div className="w-8 h-8 border-2 border-[#0071BC] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          Cargando cola de partituras de la base de datos...
        </div>
      ) : filteredScores.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-black/5 shadow-2xs space-y-3">
          <span className="material-symbols-outlined text-4xl text-slate-300">library_music</span>
          <h3 className="text-sm font-bold text-slate-700 font-montserrat">No hay partituras en esta categoría</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Cuando los compositores registren obras o se apliquen filtros, aparecerán aquí para su inspección técnica.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredScores.map((s) => {
            const composerName =
              s.composer?.artistic_name || s.composer?.full_name || "Compositor PC";

            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-6 md:p-8 space-y-6"
              >
                {/* Cabecera de la Partitura */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-black/5 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full font-extrabold font-montserrat uppercase ${
                          s.status === "IN_REVIEW"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : s.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {s.status === "IN_REVIEW" && (
                          <span className="material-symbols-outlined text-xs">hourglass_top</span>
                        )}
                        {s.status === "APPROVED" && (
                          <span className="material-symbols-outlined text-xs">check_circle</span>
                        )}
                        {s.status === "REJECTED" && (
                          <span className="material-symbols-outlined text-xs">cancel</span>
                        )}
                        {s.status === "IN_REVIEW"
                          ? "En Revisión Técnica"
                          : s.status === "APPROVED"
                          ? "Aprobada & Publicada"
                          : "Rechazada"}
                      </span>

                      <span className="text-[10px] text-slate-400 font-mono">
                        ID: {s.id.slice(0, 12)}...
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black font-montserrat text-[#111C2D]">
                      {s.title}
                    </h2>
                    <p className="text-xs text-[#0071BC] font-bold mt-0.5">
                      Compositor: {composerName} {s.composer?.email && `(${s.composer.email})`}
                    </p>
                  </div>

                  {/* Botones de Acción */}
                  <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                    {/* Botón Inspeccionar */}
                    <button
                      type="button"
                      onClick={() => setInspectingScore(s)}
                      className="px-4 py-2.5 bg-[#F0F3FF] hover:bg-slate-200 text-[#111C2D] font-bold text-xs rounded-xl transition font-montserrat flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base text-[#0071BC]">visibility</span>
                      <span>Inspeccionar Muestras</span>
                    </button>

                    {s.status !== "APPROVED" && (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleApprove(s)}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition font-montserrat flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-base">check_circle</span>
                        <span>Aprobar Obra</span>
                      </button>
                    )}

                    {s.status !== "REJECTED" && (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => {
                          setSelectedScoreForReject(s);
                          setRejectionReason(s.rejection_notes || "");
                        }}
                        className="px-4 py-2.5 bg-rose-50 text-[#C1272D] border border-rose-200 hover:bg-rose-100 font-bold text-xs rounded-xl transition font-montserrat flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-base">cancel</span>
                        <span>Rechazar con Observaciones</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Observaciones si está rechazada */}
                {s.status === "REJECTED" && s.rejection_notes && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900">
                    <strong className="block font-montserrat uppercase text-[10px] text-rose-800 mb-1">
                      📝 Observaciones Registradas para el Compositor:
                    </strong>
                    <p className="italic">{s.rejection_notes}</p>
                  </div>
                )}

                {/* Grid Ficha Técnica */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-[#4C4546] bg-[#F0F3FF]/60 p-4 rounded-xl border border-black/5">
                  <div>
                    <span className="block font-bold text-[#111C2D] font-montserrat">Categoría:</span>
                    <span>{s.genre || "Piano Solo"}</span>
                  </div>
                  <div>
                    <span className="block font-bold text-[#111C2D] font-montserrat">Nivel de Dificultad:</span>
                    <span>{s.difficulty || "Intermedio"}</span>
                  </div>
                  <div>
                    <span className="block font-bold text-[#111C2D] font-montserrat">Precio Catálogo:</span>
                    <span className="font-mono text-[#111C2D] font-bold">
                      ${(s.price_cop || 0).toLocaleString("es-CO")} COP (${s.price_usd || 12} USD)
                    </span>
                  </div>
                  <div>
                    <span className="block font-bold text-[#111C2D] font-montserrat">Páginas & Formato:</span>
                    <span>{s.pages_count || 4} págs. (PDF Urtext)</span>
                  </div>
                </div>

                {/* Miniaturas de Muestras Protegidas */}
                {s.preview_images && s.preview_images.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-700 block mb-2 font-montserrat uppercase tracking-wider">
                      Muestras Protegidas Generadas ({s.preview_images.length} imágenes difuminadas con marca de agua):
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {s.preview_images.map((img, idx) => (
                        <div
                          key={idx}
                          onClick={() => setInspectingScore(s)}
                          className="relative rounded-lg overflow-hidden border border-slate-200 shadow-2xs aspect-[3/4] bg-slate-50 cursor-pointer hover:ring-2 hover:ring-[#0071BC] transition"
                        >
                          <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                          <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[8px] font-bold px-1 rounded">
                            Pág. {idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE RECHAZO CON OBSERVACIONES */}
      {selectedScoreForReject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-700">
                <span className="material-symbols-outlined text-2xl">warning</span>
                <h3 className="text-base font-black font-montserrat">Rechazar Partitura</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedScoreForReject(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Indica detalladamente las observaciones técnicas o curatoriales para que el compositor{" "}
              <strong>
                {selectedScoreForReject.composer?.artistic_name || selectedScoreForReject.composer?.full_name}
              </strong>{" "}
              pueda corregir la obra <strong>"{selectedScoreForReject.title}"</strong>. Se le enviará una notificación por correo electrónico.
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 font-montserrat">
                  Observaciones para el Compositor *
                </label>
                <textarea
                  required
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ej: El archivo PDF contiene páginas cortadas o resolución inferior a 600 DPI. Por favor verificar numeración de compases y adjuntar armadura completa."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none font-inter"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedScoreForReject(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 font-montserrat cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider font-montserrat shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">send</span>
                  <span>Confirmar y Enviar Correo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE INSPECCIÓN DE MUESTRAS */}
      {inspectingScore && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black font-montserrat text-[#111C2D]">
                  Inspección: {inspectingScore.title}
                </h3>
                <p className="text-xs text-[#0071BC] font-bold">
                  {inspectingScore.composer?.artistic_name || inspectingScore.composer?.full_name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectingScore(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Muestras con marca de agua */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-700 block font-montserrat">
                Muestras Difuminadas con Marca de Agua (Visualización para Tienda):
              </span>

              {inspectingScore.preview_images && inspectingScore.preview_images.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {inspectingScore.preview_images.map((img, i) => (
                    <div key={i} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm aspect-[3/4]">
                      <img src={img} alt={`Pág ${i + 1}`} className="w-full h-full object-contain bg-slate-50" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No se adjuntaron vistas previas para esta obra.</p>
              )}
            </div>

            {/* Acciones Rápidas en el Modal */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-mono">
                Estado Actual: <strong className="text-slate-800">{inspectingScore.status}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInspectingScore(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cerrar
                </button>
                {inspectingScore.status !== "APPROVED" && (
                  <button
                    type="button"
                    onClick={() => {
                      const s = inspectingScore;
                      setInspectingScore(null);
                      handleApprove(s);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl font-montserrat flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">check</span>
                    Aprobar Ahora
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
