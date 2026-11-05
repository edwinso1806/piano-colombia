"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAlert } from "@/context/AlertContext";
import { getComposerProfileApi, updateComposerProfileApi, uploadFileApi, resolveMediaUrl } from "@/lib/api-client";

export default function CompositorPerfilPage() {
  const { composer, loginComposer } = useAuth();
  const { t, language } = useLanguage();
  const { showAlert } = useAlert();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"es" | "en">("es");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Form States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [artisticName, setArtisticName] = useState("");
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [bioEs, setBioEs] = useState("");
  const [bioEn, setBioEn] = useState("");
  const [status, setStatus] = useState<string>("DRAFT");
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [approvalAttempts, setApprovalAttempts] = useState<number>(0);

  // Bank Account States
  const [bankName, setBankName] = useState("Bancolombia");
  const [accountType, setAccountType] = useState("AHORROS");
  const [accountNumber, setAccountNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const [documentType, setDocumentType] = useState("CC");
  const [documentNumber, setDocumentNumber] = useState("");

  // Cargar datos reales desde el backend
  useEffect(() => {
    async function loadProfile() {
      if (!composer?.id && !composer?.email) {
        setLoadingProfile(false);
        return;
      }

      try {
        setLoadingProfile(true);
        const data = await getComposerProfileApi(composer.id || composer.email);
        if (data) {
          setFirstName(data.first_name || "");
          setLastName(data.last_name || "");
          setArtisticName(data.artistic_name || "");
          setPhone(data.phone || "");
          setRegion(data.region || "");
          setPhotoUrl(data.photo_url || "");
          setBioEs(data.bio_es || "");
          setBioEn(data.bio_en || "");
          setStatus(data.status || "DRAFT");
          setRejectionReason(data.rejection_reason || null);
          setApprovalAttempts(data.approval_attempts !== undefined ? Number(data.approval_attempts) : 0);

          if (data.bank_account) {
            setBankName(data.bank_account.bank_name || "Bancolombia");
            setAccountType(data.bank_account.account_type || "AHORROS");
            setAccountNumber(data.bank_account.account_number || "");
            setHolderName(data.bank_account.holder_name || "");
            setDocumentType(data.bank_account.document_type || "CC");
            setDocumentNumber(data.bank_account.document_number || "");
          }

          // Sincronizar de inmediato y por completo con AuthContext (biografía, foto, datos de identidad y estado)
          if (composer) {
            loginComposer({
              ...composer,
              ...data,
              status: data.status,
              rejection_reason: data.rejection_reason,
            });
          }
        }
      } catch (err: any) {
        console.error("Error al cargar perfil:", err);
      } finally {
        setLoadingProfile(false);
      }
    }

    loadProfile();
  }, [composer?.id, composer?.email]);

  // Sincronizar pestaña de biografía activa con el selector de idioma global
  useEffect(() => {
    setActiveTab(language);
  }, [language]);

  // Manejar subida de foto a Cloudflare R2
  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showAlert({ type: "error", title: "Formato no válido", message: "Por favor selecciona un archivo de imagen válido (JPG, PNG o WebP)." });
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      showAlert({ type: "error", title: "Archivo demasiado pesado", message: "La imagen no debe superar los 25MB." });
      return;
    }

    setIsUploadingPhoto(true);

    try {
      // Optimización en cliente para carga ultrarrápida a Cloudflare R2
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = async () => {
          try {
            const maxWidth = 1600;
            const maxHeight = 1600;
            let width = img.width;
            let height = img.height;

            if (width > maxWidth || height > maxHeight) {
              if (width > height) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
              } else {
                width = Math.round((width * maxHeight) / height);
                height = maxHeight;
              }
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");

            let optimizedBase64 = reader.result as string;
            let targetType = file.type;

            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              targetType = file.type === "image/png" ? "image/png" : "image/jpeg";
              optimizedBase64 = canvas.toDataURL(targetType, 0.92);
            }

            const uploadRes = await uploadFileApi({
              base64: optimizedBase64,
              fileName: file.name.replace(/\.[^/.]+$/, "") + (targetType === "image/png" ? ".png" : ".jpg"),
              fileType: targetType,
              folder: "composers/photos",
            });

            if (uploadRes && uploadRes.url) {
              const newUrl = uploadRes.url;
              setPhotoUrl(newUrl);

              // Guardar inmediatamente en la base de datos para no obligar a scroll manual
              try {
                const saveRes = await updateComposerProfileApi({
                  id: composer?.id,
                  email: composer?.email,
                  photo_url: newUrl,
                });

                if (saveRes?.composer) {
                  loginComposer({
                    ...composer,
                    ...saveRes.composer,
                    photo_url: saveRes.composer.photo_url || newUrl,
                  });
                } else if (composer) {
                  loginComposer({
                    ...composer,
                    photo_url: newUrl,
                  });
                }

                showAlert({
                  type: "success",
                  title: language === "en" ? "Photo Updated" : "Foto Guardada",
                  message: language === "en" 
                    ? "Official profile picture updated and saved successfully!" 
                    : "¡Fotografía oficial guardada y actualizada con éxito en tu perfil!",
                });
              } catch (saveErr: any) {
                console.error("Error al persistir foto:", saveErr);
                showAlert({
                  type: "warning",
                  message: language === "en"
                    ? "Photo uploaded. Please click 'Save Draft' at the bottom to confirm changes."
                    : "Fotografía subida a Cloudflare R2. Haz clic en 'Guardar Borrador' al final de la página para confirmar.",
                });
              }
            }
          } catch (uploadErr: any) {
            console.error("Error al subir a Cloudflare R2:", uploadErr);
            showAlert({ type: "error", message: "Error al guardar imagen en Cloudflare R2: " + (uploadErr.message || "Error desconocido") });
          } finally {
            setIsUploadingPhoto(false);
          }
        };
        img.onerror = async () => {
          // Fallback a base64 directo si no se puede leer la imagen en canvas
          try {
            const uploadRes = await uploadFileApi({
              base64: reader.result as string,
              fileName: file.name,
              fileType: file.type,
              folder: "composers/photos",
            });
            if (uploadRes && uploadRes.url) {
              const newUrl = uploadRes.url;
              setPhotoUrl(newUrl);

              try {
                const saveRes = await updateComposerProfileApi({
                  id: composer?.id,
                  email: composer?.email,
                  photo_url: newUrl,
                });

                if (saveRes?.composer) {
                  loginComposer({
                    ...composer,
                    ...saveRes.composer,
                    photo_url: saveRes.composer.photo_url || newUrl,
                  });
                } else if (composer) {
                  loginComposer({
                    ...composer,
                    photo_url: newUrl,
                  });
                }

                showAlert({
                  type: "success",
                  title: language === "en" ? "Photo Updated" : "Foto Guardada",
                  message: language === "en"
                    ? "Profile picture updated and saved successfully!"
                    : "¡Fotografía actualizada y guardada con éxito!",
                });
              } catch {
                showAlert({
                  type: "warning",
                  message: "Foto subida a Cloudflare R2. Haz clic en 'Guardar Borrador' para confirmar.",
                });
              }
            }
          } catch (errFallback: any) {
            showAlert({ type: "error", message: "Error al guardar imagen en Cloudflare R2: " + errFallback.message });
          } finally {
            setIsUploadingPhoto(false);
          }
        };
      };
    } catch (err: any) {
      setIsUploadingPhoto(false);
      showAlert({ type: "error", title: "Error al procesar", message: "Error al procesar el archivo: " + err.message });
    }
  };

  // Ejecución real del guardado de perfil
  const executeSaveProfile = async (submitForReview = false) => {
    setIsSaving(true);

    try {
      const payload = {
        id: composer?.id,
        email: composer?.email,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        artistic_name: artisticName.trim() || `${firstName.trim()} ${lastName.trim()}`,
        phone: phone.trim(),
        region: region.trim(),
        bio_es: bioEs.trim(),
        bio_en: bioEn.trim(),
        photo_url: photoUrl.trim(),
        submit_for_review: submitForReview,
        bank_account: {
          bank_name: bankName,
          account_type: accountType,
          account_number: accountNumber.trim(),
          holder_name: holderName.trim() || `${firstName.trim()} ${lastName.trim()}`,
          document_type: documentType,
          document_number: documentNumber.trim(),
        },
      };

      const res = await updateComposerProfileApi(payload);

      // Actualizar sesión en AuthContext
      if (res.composer) {
        loginComposer({
          id: res.composer.id,
          artistic_name: res.composer.artistic_name,
          email: res.composer.email,
          first_name: res.composer.first_name,
          last_name: res.composer.last_name,
          phone: res.composer.phone,
          region: res.composer.region,
          status: res.composer.status,
          photo_url: res.composer.photo_url,
          bio_es: res.composer.bio_es,
          bio_en: res.composer.bio_en,
        });
        if (res.composer.status) {
          setStatus(res.composer.status);
        }
        if (res.composer.approval_attempts !== undefined) {
          setApprovalAttempts(Number(res.composer.approval_attempts));
        }
        if (res.composer.rejection_reason !== undefined) {
          setRejectionReason(res.composer.rejection_reason);
        }
      }

      if (submitForReview) {
        setStatus("PENDING_APPROVAL");
        setRejectionReason(null);
      }

      const alertMsg = res.message || (submitForReview
        ? (language === "en"
            ? "Your information was submitted successfully for review. The curation team will evaluate your profile."
            : "Tu información fue enviada exitosamente a revisión técnica por el comité de Piano Colombia.")
        : (language === "en"
            ? "Profile changes saved successfully in the database."
            : "Borrador de perfil guardado correctamente en la base de datos."));

      showAlert({
        type: res.was_approved ? "warning" : "success",
        title: submitForReview
          ? (language === "en" ? "Profile in Review" : "Solicitud Enviada a Revisión")
          : (language === "en" ? "Changes Saved" : "Cambios Guardados"),
        message: alertMsg,
        duration: 5000,
      });
    } catch (err: any) {
      console.error("Error al guardar perfil:", err);
      showAlert({
        type: "error",
        title: language === "en" ? "Error Saving Profile" : "Error al Guardar Perfil",
        message: err.message || (language === "en" ? "An error occurred while saving profile." : "Ocurrió un error al guardar los cambios."),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfile = (submitForReview = false) => {
    if (submitForReview) {
      if (!bioEs.trim()) {
        showAlert({
          type: "warning",
          title: language === "en" ? "Biography Required" : "Biografía Requerida",
          message: language === "en"
            ? "Please write your biography in Spanish before submitting for review."
            : "Por favor redacta tu biografía en español antes de enviar a revisión.",
        });
        return;
      }
      if (!bankName.trim() || !accountNumber.trim() || !documentNumber.trim()) {
        showAlert({
          type: "warning",
          title: language === "en" ? "Bank Details Incomplete" : "Datos Bancarios Incompletos",
          message: language === "en"
            ? "Please complete your bank account details for royalty payouts before submitting for review."
            : "Por favor completa tus datos bancarios para la liquidación de regalías antes de enviar a revisión.",
        });
        return;
      }
    }

    const isCurrentlyApproved = composer?.status === "APPROVED";
    if (submitForReview && isCurrentlyApproved) {
      setShowConfirmModal(true);
      return;
    }
    executeSaveProfile(submitForReview);
  };

  const isApproved = composer?.status === "APPROVED";

  return (
    <div className="space-y-8 text-[#111C2D] w-full max-w-full min-w-0">
      
      {/* Header Principal de la Sección */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F3FF] border border-[#0071BC]/10 text-[#0071BC] text-[11px] font-extrabold uppercase tracking-wider mb-2 font-montserrat">
            <span className="material-symbols-outlined text-xs">badge</span>
            {language === "en" ? "Author Dossier • Cloudflare R2 Secure Storage" : "Ficha de Autor • Almacenamiento Seguro Cloudflare R2"}
          </div>
          <h1 className="text-3xl font-black font-montserrat text-[#111C2D] tracking-tight">
            {t("profile.header_title", "Perfil & Biografía Oficial")}
          </h1>
          <p className="text-xs md:text-sm text-[#4C4546] font-medium max-w-2xl leading-relaxed">
            {t("profile.header_desc", "Gestiona tu identidad musical pública, biografía bilingüe y cuenta bancaria para la transferencia de regalías.")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold font-montserrat ${
            status === "APPROVED" 
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
              : status === "BLOCKED"
              ? "bg-rose-950 text-white border border-rose-800"
              : status === "REJECTED"
              ? "bg-amber-100 text-amber-950 border border-amber-300"
              : status === "PENDING_APPROVAL"
              ? "bg-blue-50 text-[#0071BC] border border-blue-200"
              : "bg-slate-100 text-slate-700 border border-slate-300"
          }`}>
            <span className="material-symbols-outlined text-sm">
              {status === "APPROVED" 
                ? "verified" 
                : status === "BLOCKED" 
                ? "block" 
                : status === "REJECTED" 
                ? "edit_note" 
                : status === "PENDING_APPROVAL" 
                ? "hourglass_top" 
                : "edit_document"}
            </span>
            {status === "APPROVED" 
              ? t("profile.status_approved", "Compositor Aprobado") 
              : status === "BLOCKED"
              ? t("profile.status_blocked", "Acceso Bloqueado")
              : status === "REJECTED"
              ? `${t("profile.status_rejected", "Requiere Corrección")} (${t("profile.attempt", "Intento")} #${approvalAttempts})`
              : status === "PENDING_APPROVAL"
              ? `${t("profile.status_in_review", "En Revisión")} (${t("profile.attempt", "Intento")} #${approvalAttempts})`
              : t("profile.status_draft", "Borrador (No Enviado)")}
          </span>
        </div>
      </div>

      {/* Banner de Bloqueo Definitivo */}
      {status === "BLOCKED" && (
        <div className="p-6 rounded-2xl bg-rose-950 text-white border border-rose-800 shadow-md animate-in fade-in duration-200 space-y-2">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-rose-400">block</span>
            <h2 className="text-base font-black font-montserrat tracking-tight">
              {t("profile.blocked_banner_title", "Solicitud No Aceptada Definitivamente en Piano Colombia")}
            </h2>
          </div>
          <p className="text-xs text-rose-200 leading-relaxed">
            {t("profile.blocked_banner_desc", "La administración y curaduría de Piano Colombia ha resuelto no aceptar tu postulación de forma definitiva para formar parte del catálogo de autores.")}
          </p>
          {rejectionReason && (
            <div className="p-3 bg-black/40 rounded-xl border border-rose-900 text-xs italic text-rose-100">
              "{rejectionReason}"
            </div>
          )}
          <p className="text-[11px] text-rose-300">
            {t("profile.blocked_no_resubmit", "No es posible realizar nuevas modificaciones ni reenviar este perfil.")}
          </p>
        </div>
      )}

      {/* Banner de Sugerencias y Observaciones de Moderación */}
      {status === "REJECTED" && (
        <div className="p-6 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 shadow-sm space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-2xl text-amber-700">edit_note</span>
              <h2 className="text-sm font-black font-montserrat uppercase tracking-wider text-amber-950">
                {t("profile.rejected_banner_title", "Sugerencias y Observaciones del Administrador / Moderador")}
              </h2>
            </div>
            <span className="text-[11px] font-mono font-bold bg-amber-200/80 px-2.5 py-1 rounded-full text-amber-900 border border-amber-300">
              {t("profile.rejected_banner_subtitle", "Revisión Anterior: Intento #")}{approvalAttempts}
            </span>
          </div>

          <p className="text-xs text-amber-900 leading-relaxed font-medium">
            {t("profile.rejected_banner_desc", "El equipo curatorial y administrativo evaluó tu postulación y solicita que atiendas las siguientes sugerencias para habilitar tu catálogo oficial:")}
          </p>

          <div className="p-4 bg-white rounded-xl border border-amber-300 text-xs font-semibold text-rose-900 italic leading-relaxed shadow-2xs">
            "{rejectionReason || "Por favor revisa la fotografía de autor, la precisión biográfica o la coincidencia de los datos bancarios con tu documento."}"
          </div>

          <div className="p-3 bg-amber-100/70 rounded-xl text-[11px] text-amber-950 flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-amber-700">info</span>
            <span>
              {t("profile.rejected_what_to_do", "Se ha vuelto a habilitar tu botón para enviar de nuevo a revisión. Modifica los campos señalados y haz clic abajo en \"Guardar y Enviar a Revisión\" para registrar el Intento #")}{approvalAttempts + 1}. Tu perfil se bloqueará nuevamente en revisión solo hasta la acción del administrador.
            </span>
          </div>
        </div>
      )}

      {/* Banner de Perfil en Borrador (Aún no enviado a revisión) */}
      {status === "DRAFT" && (
        <div className="p-5 rounded-2xl bg-[#FFF9ED] border-2 border-[#FBB03B]/40 text-amber-950 flex items-start gap-3.5 shadow-xs animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-2xl text-[#e09b2e] shrink-0 mt-0.5">draw</span>
          <div className="text-xs space-y-1">
            <strong className="block font-montserrat uppercase tracking-wider text-[11px] text-[#111C2D]">
              {t("profile.draft_banner_title", "Perfil en Borrador • Completa tu Información para Solicitar Aprobación")}
            </strong>
            <span className="text-[#4C4546] font-medium block leading-relaxed">
              {t("profile.draft_banner_desc", "¡Bienvenido a Piano Colombia! Para que tu perfil sea evaluado por los curadores y habilitar la publicación de tus obras en el catálogo, sube tu fotografía de retrato oficial, redacta tu biografía y verifica tus datos bancarios para regalías. Cuando todo esté completo, haz clic abajo en \"Guardar y Enviar a Revisión\".")}
            </span>
          </div>
        </div>
      )}

      {/* Banner de Perfil en Revisión */}
      {status === "PENDING_APPROVAL" && !rejectionReason && (
        <div className="p-4 rounded-2xl bg-[#F0F3FF] border border-[#0071BC]/20 text-[#0071BC] flex items-center gap-3 animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-2xl shrink-0">hourglass_top</span>
          <div className="text-xs leading-relaxed">
            <strong className="block font-montserrat uppercase tracking-wider text-[11px]">
              {t("profile.pending_banner_title", "Solicitud en Proceso de Moderación (Intento #")}{approvalAttempts})
            </strong>
            <span>
              {t("profile.pending_banner_desc", "Tus datos y fotografía oficial se encuentran en cola de revisión técnica por nuestros curadores. Te notificaremos a tu correo electrónico en cuanto sea validado.")}
            </span>
          </div>
        </div>
      )}

      {/* Banner de Advertencia para Compositor Activo */}
      {status === "APPROVED" && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3.5 shadow-xs animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-2xl text-amber-600 shrink-0">warning</span>
          <div className="text-xs space-y-1">
            <span className="font-extrabold font-montserrat uppercase tracking-wider block text-amber-950">
              {t("profile.active_warning_title", "⚠️ Perfil Activo & Visibilidad en Tienda")}
            </span>
            <span className="text-amber-900 font-medium block leading-relaxed">
              {t("profile.active_warning_desc", "Tu perfil y catálogo se encuentran actualmente Aprobados y Visibles en la tienda pública. Si realizas modificaciones en tu biografía, fotografía o datos bancarios y haces clic en \"Guardar y Enviar a Revisión\", tu perfil y todas tus partituras registradas se inactivarán temporalmente de la tienda hasta que un administrador de Piano Colombia valide y apruebe los cambios.")}
            </span>
          </div>
        </div>
      )}

      {/* Estado de carga */}

      {loadingProfile ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-black/5 shadow-xs">
          <div className="w-8 h-8 border-3 border-[#0071BC] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-bold text-[#4C4546] uppercase tracking-wider font-montserrat">
            {t("profile.loading_from_db", "Cargando perfil desde base de datos...")}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Card 1: Fotografía Oficial & Datos Institucionales */}
          <div className="bg-white p-6 lg:p-8 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-6">
            <h2 className="text-lg font-black font-montserrat text-[#111C2D] border-b border-black/5 pb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0071BC]">photo_camera</span>
              {t("profile.section_1_title", "1. Fotografía Oficial & Datos de Identidad")}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Foto de Autor con Cloudflare R2 */}
              <div className="lg:col-span-4 flex flex-col items-center text-center p-6 bg-[#F0F3FF]/50 rounded-2xl border border-black/5">
                <span className="text-xs font-bold font-montserrat text-[#111C2D] mb-1">{t("profile.photo_title", "Fotografía de Retrato")}</span>
                <p className="text-[11px] text-[#4C4546] mb-4">{t("profile.photo_subtitle", "Alojada de forma segura en Cloudflare R2")}</p>
                
                <div className="relative w-36 h-36 rounded-full overflow-hidden shadow-md mb-4 group border-2 border-[#FBB03B] bg-[#111C2D] flex items-center justify-center text-3xl font-montserrat font-black text-white">
                  {photoUrl ? (
                    <img src={resolveMediaUrl(photoUrl)} alt="Foto de perfil" className="w-full h-full object-cover" />
                  ) : (
                    <span>
                      {(artisticName || firstName || "PC").slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  {isUploadingPhoto && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-[10px] font-bold">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mb-1"></div>
                      {t("profile.photo_uploading", "Subiendo a R2...")}
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoFileChange}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-200/60 text-[#111C2D] text-xs font-bold rounded-xl transition border border-black/10 shadow-xs font-montserrat disabled:opacity-50 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base text-[#0071BC]">cloud_upload</span>
                  <span>{photoUrl ? t("profile.photo_upload_btn", "Cambiar Fotografía") : t("profile.photo_upload_new", "Subir Fotografía a R2")}</span>
                </button>
              </div>

              {/* Campos de Identidad */}
              <div className="lg:col-span-8 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">{t("profile.first_name", "Nombres *")}</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Ej: Alex"
                      className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-3 text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">{t("profile.last_name", "Apellidos *")}</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Ej: Ríos"
                      className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-3 text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">{t("profile.artistic_name", "Nombre Artístico / Seudónimo *")}</label>
                    <input
                      type="text"
                      required
                      value={artisticName}
                      onChange={(e) => setArtisticName(e.target.value)}
                      placeholder="Ej: El Cacique de la Junta"
                      className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-3 text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">{t("profile.phone", "Teléfono de Contacto *")}</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+57 316 694 3197"
                      className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-3 text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111C2D] mb-1.5 font-montserrat">{t("profile.region", "Ciudad / Región Cultural *")}</label>
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="Ej: Bello, Antioquia / Región Andina"
                    className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-3 text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Card 2: Biografía Bilingüe (Español & Inglés) */}
          <div className="bg-white p-6 lg:p-8 rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 pb-3">
              <div>
                <h2 className="text-lg font-black font-montserrat text-[#111C2D] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0071BC]">history_edu</span>
                  {t("profile.section_2_title", "2. Redacción Biográfica de Autor")}
                </h2>
                <p className="text-[11px] text-[#4C4546] mt-0.5">{t("profile.section_2_subtitle", "Visible para el público y compradores en el catálogo internacional.")}</p>
              </div>

              {/* Switch de Idiomas */}
              <div className="inline-flex p-1 bg-[#F0F3FF] rounded-xl self-start sm:self-auto border border-black/5">
                <button
                  type="button"
                  onClick={() => setActiveTab("es")}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-montserrat font-bold transition-all cursor-pointer ${
                    activeTab === "es"
                      ? "bg-[#111C2D] text-white shadow-2xs"
                      : "text-[#4C4546] hover:text-[#111C2D]"
                  }`}
                >
                  <span>🇨🇴</span> Español
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("en")}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-montserrat font-bold transition-all cursor-pointer ${
                    activeTab === "en"
                      ? "bg-[#111C2D] text-white shadow-2xs"
                      : "text-[#4C4546] hover:text-[#111C2D]"
                  }`}
                >
                  <span>🇺🇸</span> English
                </button>
              </div>
            </div>

            {activeTab === "es" ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#111C2D] font-montserrat flex items-center gap-1">
                    <span>{t("profile.bio_es_label", "Biografía en Español")}</span> <span className="text-[#C1272D]">*</span>
                  </label>
                  <span className={`text-[11px] font-bold font-montserrat px-2 py-0.5 rounded-md transition ${
                    bioEs.length >= 1500
                      ? "text-red-700 bg-red-50 border border-red-200"
                      : bioEs.length > 1200
                      ? "text-amber-700 bg-amber-50 border border-amber-200"
                      : "text-[#4C4546] bg-[#F0F3FF]"
                  }`}>
                    {bioEs.length} / 1500 {t("profile.characters", "caracteres")}
                  </span>
                </div>
                <textarea
                  rows={6}
                  maxLength={1500}
                  value={bioEs}
                  onChange={(e) => setBioEs(e.target.value.slice(0, 1500))}
                  placeholder="Describe tu formación musical, trayectoria artística, obras principales, influencias y estilo de composición..."
                  className="w-full p-4 rounded-xl bg-[#F0F3FF]/50 border border-black/5 text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC] transition-all resize-none shadow-2xs leading-relaxed"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#111C2D] font-montserrat flex items-center gap-1">
                    <span>{t("profile.bio_en_label", "Biografía en Inglés (Conservatorios & Academias)")}</span> <span className="text-[#0071BC]">*</span>
                  </label>
                  <span className={`text-[11px] font-bold font-montserrat px-2 py-0.5 rounded-md transition ${
                    bioEn.length >= 1500
                      ? "text-red-700 bg-red-50 border border-red-200"
                      : bioEn.length > 1200
                      ? "text-amber-700 bg-amber-50 border border-amber-200"
                      : "text-[#4C4546] bg-[#F0F3FF]"
                  }`}>
                    {bioEn.length} / 1500 {t("profile.characters", "characters")}
                  </span>
                </div>
                <textarea
                  rows={6}
                  maxLength={1500}
                  value={bioEn}
                  onChange={(e) => setBioEn(e.target.value.slice(0, 1500))}
                  placeholder="Provide an English summary of your musical background, catalogue, and piano repertoire..."
                  className="w-full p-4 rounded-xl bg-[#F0F3FF]/50 border border-black/5 text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC] transition-all resize-none shadow-2xs leading-relaxed"
                />
              </div>
            )}
          </div>

          {/* Card 3: Datos Bancarios & Fiscales */}
          <div className="bg-white p-6 lg:p-8 rounded-2xl border border-black/5 shadow-xs space-y-6">
            <h2 className="text-lg font-black font-montserrat text-[#111C2D] border-b border-black/5 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0071BC]">account_balance</span>
                <span>{t("profile.section_3_title", "3. Cuenta Bancaria para Transferencia de Regalías")}</span>
              </div>
              <span className="text-[11px] font-bold text-[#4C4546]">
                {t("profile.section_3_subtitle", "Para liquidación de ventas (PSE / Wompi)")}
              </span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#111C2D] mb-1 font-montserrat">{t("profile.bank_name", "Entidad Bancaria *")}</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                >
                  <option value="Bancolombia">Bancolombia</option>
                  <option value="Davivienda">Davivienda</option>
                  <option value="Banco de Bogotá">Banco de Bogotá</option>
                  <option value="BBVA">BBVA Colombia</option>
                  <option value="Nequi">Nequi</option>
                  <option value="Daviplata">Daviplata</option>
                  <option value="Colpatria">Scotiabank Colpatria</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#111C2D] mb-1 font-montserrat">{t("profile.account_type", "Tipo de Cuenta *")}</label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                >
                  <option value="AHORROS">{t("profile.account_type_savings", "Cuenta de Ahorros")}</option>
                  <option value="CORRIENTE">{t("profile.account_type_checking", "Cuenta Corriente")}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#111C2D] mb-1 font-montserrat">{t("profile.account_number", "Número de Cuenta *")}</label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Ej: 10312813181"
                  className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs text-[#111C2D] font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#111C2D] mb-1 font-montserrat">{t("profile.document_type", "Tipo de Documento *")}</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                >
                  <option value="CC">{language === "en" ? "National ID (CC)" : "Cédula de Ciudadanía (CC)"}</option>
                  <option value="NIT">{language === "en" ? "Tax ID (NIT)" : "Número de Identificación Tributaria (NIT)"}</option>
                  <option value="CE">{language === "en" ? "Foreigner ID (CE)" : "Cédula de Extranjería (CE)"}</option>
                  <option value="PASAPORTE">{language === "en" ? "Passport" : "Pasaporte"}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#111C2D] mb-1 font-montserrat">{t("profile.document_number", "Número de Documento *")}</label>
                <input
                  type="text"
                  required
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="Ej: 98703268"
                  className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs text-[#111C2D] font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#111C2D] mb-1 font-montserrat">{t("profile.holder_name", "Nombre del Titular de la Cuenta *")}</label>
                <input
                  type="text"
                  required
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                  placeholder={t("profile.holder_name", "Nombre completo tal como figura en el banco")}
                  className="w-full bg-[#F0F3FF] border border-black/5 rounded-xl px-4 py-2.5 text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                />
              </div>
            </div>
          </div>

          {/* Barra de Acciones y Guardado */}
          <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-md flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 overflow-hidden">
            <div className="space-y-1.5 flex-1 min-w-0 max-w-xl">
              <span className="text-sm font-bold text-[#111C2D] block font-montserrat">
                {status === "BLOCKED" 
                  ? t("profile.status_blocked", "Acceso Bloqueado") 
                  : status === "REJECTED" 
                  ? t("profile.ready_resubmit_title", "¿Listo para reenviar tus correcciones?") 
                  : status === "PENDING_APPROVAL"
                  ? t("profile.pending_review_title", "Solicitud en proceso de moderación")
                  : t("profile.ready_submit_title", "¿Todo listo para la aprobación de tu cuenta?")}
              </span>
              <p className="text-xs text-[#4C4546] leading-relaxed">
                {status === "BLOCKED"
                  ? t("profile.blocked_no_resubmit", "Esta postulación no admite reenvíos por resolución administrativa definitiva.")
                  : status === "REJECTED"
                  ? (language === "en"
                      ? `When you resubmit, review attempt #${approvalAttempts + 1} will be registered and the button will lock again until the administrator approves or sends further suggestions.`
                      : `Al reenviar, se registrará el nuevo intento de revisión (Intento #${approvalAttempts + 1}) y el botón se bloqueará de nuevo en espera de la evaluación final del administrador.`)
                  : status === "PENDING_APPROVAL"
                  ? t("profile.pending_review_desc", "Tu postulación se encuentra en lista de espera de revisión técnica por los administradores y curadores de Piano Colombia.")
                  : t("profile.ready_submit_desc", "Al enviar a revisión, el administrador podrá validar tu fotografía en R2, tus datos biográficos y habilitar tu catálogo.")}
              </p>
            </div>

            {status !== "BLOCKED" ? (
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full xl:w-auto justify-start sm:justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => handleSaveProfile(false)}
                  disabled={isSaving}
                  className="w-full sm:w-auto px-5 py-3 text-xs font-bold text-[#4C4546] hover:bg-[#F0F3FF] rounded-xl transition font-montserrat border border-black/10 disabled:opacity-50 cursor-pointer whitespace-nowrap text-center"
                >
                  {isSaving ? t("profile.saving", "Guardando...") : t("profile.save_draft_btn", "Guardar Cambios")}
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveProfile(true)}
                  disabled={isSaving || status === "PENDING_APPROVAL"}
                  title={
                    status === "PENDING_APPROVAL"
                      ? (language === "en"
                          ? "Your profile is currently under review by Piano Colombia administration"
                          : "Tu solicitud se encuentra actualmente en proceso de revisión por los administradores")
                      : undefined
                  }
                  className={`w-full sm:w-auto px-6 py-3 text-xs font-extrabold uppercase tracking-wider rounded-xl transition shadow-md font-montserrat flex items-center justify-center gap-2 whitespace-nowrap shrink-0 ${
                    status === "PENDING_APPROVAL"
                      ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
                      : status === "REJECTED"
                      ? "bg-[#0071BC] hover:bg-[#005c99] text-white cursor-pointer"
                      : "bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] cursor-pointer"
                  } disabled:opacity-60`}
                >
                  <span className="material-symbols-outlined text-base shrink-0">
                    {status === "PENDING_APPROVAL"
                      ? "hourglass_top"
                      : status === "REJECTED"
                      ? "published_with_changes"
                      : "send"}
                  </span>
                  <span className="whitespace-nowrap">
                    {isSaving
                      ? t("profile.saving", "Guardando...")
                      : status === "PENDING_APPROVAL"
                      ? (language === "en" ? "In Review by Administration" : "En Revisión por Administración")
                      : status === "REJECTED"
                      ? `${t("profile.save_resubmit_btn", "Guardar y Enviar a Revisión")} (${t("profile.attempt", "Intento")} #${approvalAttempts + 1})`
                      : t("profile.save_review_btn", "Guardar y Enviar a Revisión")}
                  </span>
                </button>
              </div>
            ) : (
              <div className="text-xs font-bold text-rose-700 bg-rose-50 px-4 py-2 rounded-xl border border-rose-200 shrink-0">
                {t("profile.status_blocked", "Acceso Bloqueado")}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Confirmación para Enviar Perfil Activo a Revisión */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-black/10 shadow-2xl space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto border border-amber-200">
              <span className="material-symbols-outlined text-3xl">warning</span>
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black font-montserrat text-[#111C2D]">
                {t("profile.confirm_modal_title", "¿Confirmas enviar a revisión tu perfil activo?")}
              </h3>
              <p className="text-xs text-[#4C4546] leading-relaxed font-medium">
                {t("profile.confirm_modal_desc", "Al enviar las modificaciones a revisión, tu cuenta pasará a estado PENDIENTE DE APROBACIÓN y tanto tu perfil público como todas tus partituras registradas se inactivarán temporalmente de la tienda pública hasta que un administrador revise y apruebe las modificaciones.")}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-[#111C2D] font-bold text-xs rounded-xl transition font-montserrat"
              >
                {t("profile.confirm_modal_cancel", "Cancelar")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  executeSaveProfile(true);
                }}
                className="flex-1 py-3 px-4 bg-[#C1272D] hover:bg-[#a61f25] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md font-montserrat flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">send</span>
                <span>{t("profile.confirm_modal_submit", "Sí, inactivar y enviar")}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
