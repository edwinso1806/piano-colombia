"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { getStoreCatalogMetadata, createScoreApi, uploadFileApi } from "@/lib/api-client";
import { generateScoreBlurredPreviews } from "@/lib/pdf-preview-generator";
import { getUsdCopExchangeRate, convertCopToUsd, convertUsdToCop } from "@/lib/exchange-rate-service";

export default function NuevaPartituraPage() {
  const { composer } = useAuth();
  const { t, language } = useLanguage();

  // Exchange rate (TRM) state
  const [usdRate, setUsdRate] = useState<number>(3900);
  const [isRateLive, setIsRateLive] = useState<boolean>(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [priceCOP, setPriceCOP] = useState(45000);
  const [priceUSD, setPriceUSD] = useState(11.54);
  const [audioLink, setAudioLink] = useState("");
  const [tonality, setTonality] = useState("");
  const [description, setDescription] = useState("");
  const [pagesCount, setPagesCount] = useState(4);

  // Load live TRM exchange rate on mount
  useEffect(() => {
    async function fetchTrm() {
      const { rate, isLive } = await getUsdCopExchangeRate();
      setUsdRate(rate);
      setIsRateLive(isLive);
      setPriceUSD(convertCopToUsd(45000, rate));
    }
    fetchTrm();
  }, []);

  // Currency handlers with auto-conversion using live exchange rate service
  const handleCopInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    if (valStr === "") {
      setPriceCOP(0);
      setPriceUSD(0);
      return;
    }
    const valCOP = parseFloat(valStr);
    if (!isNaN(valCOP)) {
      setPriceCOP(valCOP);
      setPriceUSD(convertCopToUsd(valCOP, usdRate));
    }
  };

  const handleUsdInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    if (valStr === "") {
      setPriceUSD(0);
      setPriceCOP(0);
      return;
    }
    const valUSD = parseFloat(valStr);
    if (!isNaN(valUSD)) {
      setPriceUSD(valUSD);
      setPriceCOP(convertUsdToCop(valUSD, usdRate));
    }
  };

  // Dynamic Metadata Options from Database
  const [categoriesList, setCategoriesList] = useState<string[]>([
    "Pasillo", "Bambuco", "Danza", "Guabina", "Vals", "Cumbia", "Porro", "Joropo", "Contradanza", "Estudio", "Piano Solo"
  ]);
  const [difficultiesList, setDifficultiesList] = useState<string[]>([
    "Iniciación / Fácil", "Intermedio", "Avanzado", "Virtuoso / Concierto"
  ]);

  // PDF File and Generated Previews State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState<string | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load CMS Dynamic Metadata from Database
  useEffect(() => {
    async function loadMetadata() {
      try {
        const data = await getStoreCatalogMetadata();
        if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
          const normalized = data.categories
            .map((c: any) => (typeof c === "string" ? c : c.title_es || c.title || c.name || c.id))
            .filter(Boolean);
          setCategoriesList(normalized);
          if (normalized.length > 0) setCategory(normalized[0]);
        }
        if (data.difficulties && Array.isArray(data.difficulties) && data.difficulties.length > 0) {
          const normalized = data.difficulties
            .map((d: any) => (typeof d === "string" ? d : d.title_es || d.title || d.name || d.code || d.id))
            .filter(Boolean);
          setDifficultiesList(normalized);
          if (normalized.length > 0) setDifficulty(normalized[0]);
        }
      } catch (err) {
        console.warn("Usando metadatos predeterminados:", err);
      }
    }
    loadMetadata();
  }, []);

  // Handle PDF selection and automatic watermark + blur generation
  const handlePdfSelected = async (file: File) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      setPdfError(
        language === "en"
          ? "Please select a valid .PDF document."
          : "Por favor selecciona un archivo en formato .PDF válido."
      );
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setPdfError(
        language === "en"
          ? "File exceeds the 25MB maximum limit."
          : "El archivo supera el límite máximo de 25MB."
      );
      return;
    }

    setPdfFile(file);
    setPdfError(null);
    setIsProcessingPdf(true);

    try {
      const scoreNameForWatermark = title.trim() || file.name.replace(/\.pdf$/i, "");
      const { previewImages: generatedImages, pagesCount: count } = await generateScoreBlurredPreviews(
        file,
        scoreNameForWatermark
      );

      setPreviewImages(generatedImages);
      if (count > 0) setPagesCount(count);
    } catch (err: any) {
      console.warn("Aviso al procesar vistas previas PDF:", err.message);
    } finally {
      setIsProcessingPdf(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handlePdfSelected(e.dataTransfer.files[0]);
    }
  };

  const commission = Math.round(priceCOP * 0.2);
  const netEarnings = priceCOP - commission;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!pdfFile && previewImages.length === 0) {
      setPdfError(
        language === "en"
          ? "Please upload the score's master PDF file."
          : "Por favor adjunta el archivo PDF maestro de la partitura."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Opcional: Subir PDF a almacenamiento si hay base64 o endpoint disponible
      let masterPdfUrl = `/master-scores/${Date.now()}-${pdfFile?.name || "score.pdf"}`;

      // 2. Crear partitura en el catálogo a través de createScoreApi
      await createScoreApi({
        title,
        composer_id: composer?.id || "",
        composer_name: composer?.artistic_name || (composer?.first_name ? `${composer.first_name} ${composer.last_name || ""}`.trim() : "Compositor"),
        genre: category || "Pasillo",
        difficulty: difficulty || "Intermedio",
        price_cop: priceCOP,
        price_usd: priceUSD || Math.round(priceCOP / usdRate) || 12,
        audio_preview_url: audioLink || null,
        description: description || null,
        tonality: tonality || "Do mayor",
        pages_count: pagesCount,
        preview_images: previewImages, // De 2 a 3 imágenes con marca de agua y difuminado
        original_pdf_url: masterPdfUrl,
        preview_pdf_url: masterPdfUrl,
      });

      setIsSubmitted(true);
    } catch (err: any) {
      console.error("Error al registrar partitura:", err);
      setSubmitError(
        err.message ||
          (language === "en"
            ? "Error submitting score. Please verify your connection."
            : "Error al enviar la partitura. Por favor verifica tu conexión.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 text-[#111C2D]">
      {/* Encabezado */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-1.5">
          <h1 className="text-2xl sm:text-3xl font-black font-montserrat text-[#111C2D] tracking-tight">
            {t("new_score.title", "Cargar Nueva Partitura al Catálogo")}
          </h1>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#F0F3FF] text-[#0071BC] border border-[#0071BC]/10 font-montserrat">
            {language === "en" ? "Review & Moderation Protocol" : "Protocolo de Moderación Editorial"}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[#4C4546] font-normal leading-relaxed">
          {t(
            "new_score.subtitle",
            "El archivo PDF pasará por la mesa técnica y editorial antes de su publicación en la tienda."
          )}
        </p>
      </div>

      {isSubmitted ? (
        <div className="bg-white p-8 lg:p-10 rounded-2xl text-center space-y-6 border border-[#FBB03B] shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
          <div className="w-16 h-16 bg-[#FBB03B]/20 rounded-full flex items-center justify-center text-3xl mx-auto text-[#111C2D]">
            🎼
          </div>
          <h2 className="text-2xl font-black font-montserrat text-[#111C2D]">
            {t("new_score.success_modal_title", "¡Partitura Enviada a Curaduría!")}
          </h2>
          <p className="text-xs sm:text-sm text-[#4C4546] leading-relaxed max-w-md mx-auto font-normal">
            {t(
              "new_score.success_modal_desc",
              "Tu obra ha ingresado a la mesa técnica. Se ha notificado a los moderadores y administradores. Te avisaremos por correo tan pronto sea aprobada."
            )}
          </p>

          {/* Vistas previas generadas confirmadas */}
          {previewImages.length > 0 && (
            <div className="pt-4 border-t border-slate-100 max-w-xl mx-auto">
              <span className="text-xs font-bold text-slate-700 block mb-3 font-montserrat">
                {language === "en" ? "Generated Protected Store Previews:" : "Muestras Protegidas para la Tienda Generadas:"}
              </span>
              <div className="grid grid-cols-3 gap-3">
                {previewImages.map((img, i) => (
                  <div key={i} className="relative rounded-lg overflow-hidden border border-slate-200 shadow-sm aspect-[3/4] bg-slate-50">
                    <img src={img} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      Pág. {i + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4">
            <Link
              href="/compositor/dashboard?tab=partituras&filter=revision"
              className="px-6 py-3 bg-[#FBB03B] hover:bg-[#e09b2d] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider rounded-xl transition inline-block font-montserrat shadow-md"
            >
              {language === "en" ? "View My Scores Queue" : "Ver Mis Partituras en Cola"}
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {submitError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{submitError}</span>
            </div>
          )}

          {/* PASO 1: Archivo PDF y Generación de Vistas Previas Protegidas */}
          <section className="bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-6 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-bold font-montserrat text-[#111C2D] flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0071BC] text-white text-xs font-bold">1</span>
                <span>{t("new_score.pdf_upload_title", "Archivo Maestro PDF de la Partitura")}</span>
              </h2>
              <span className="text-xs text-[#C1272D] font-medium">* {language === "en" ? "Required" : "Obligatorio"}</span>
            </div>

            {/* Input nativo oculto */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handlePdfSelected(e.target.files[0]);
                }
              }}
            />

            {/* Dropzone Container */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl transition-all p-7 sm:p-9 text-center cursor-pointer group ${
                pdfFile
                  ? "border-emerald-400 bg-emerald-50/30"
                  : "border-slate-300 hover:border-[#FBB03B] bg-[#F0F3FF]/40 hover:bg-[#FBB03B]/5"
              }`}
            >
              <div className="mx-auto w-14 h-14 rounded-full bg-white shadow-2xs border border-black/5 flex items-center justify-center text-[#111C2D] group-hover:scale-110 group-hover:text-[#0071BC] transition-all mb-3">
                <span className="material-symbols-outlined text-3xl text-[#C1272D]">picture_as_pdf</span>
              </div>

              {pdfFile ? (
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-bold font-montserrat text-[#111C2D] flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                    <span>{pdfFile.name}</span>
                    <span className="text-slate-400 font-normal text-xs">
                      ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </p>
                  <p className="text-[11px] text-[#0071BC] font-medium">
                    {language === "en" ? "Click to select a different PDF" : "Haz clic si deseas reemplazar el archivo"}
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-xs sm:text-sm font-bold font-montserrat text-[#111C2D] mb-1">
                    {t("new_score.pdf_drop_text", "Arrastra y suelta tu archivo PDF aquí, o haz clic para seleccionarlo")}
                  </p>
                  <p className="text-[11px] text-[#4C4546] max-w-md mx-auto leading-relaxed">
                    {t(
                      "new_score.pdf_subtext",
                      "Solo archivos PDF de alta resolución (máx. 25MB). Se generarán automáticamente 2 a 3 imágenes difuminadas con marca de agua para la tienda."
                    )}
                  </p>
                </>
              )}

              {pdfError && (
                <p className="mt-2 text-xs font-semibold text-red-600">
                  {pdfError}
                </p>
              )}
            </div>

            {/* Spinner de procesamiento de imágenes difuminadas */}
            {isProcessingPdf && (
              <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3 animate-pulse">
                <span className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></span>
                <span className="font-medium">
                  {t("new_score.generating_previews", "Generando muestras con marca de agua y difuminado protector...")}
                </span>
              </div>
            )}

            {/* Galería de Muestras Protegidas Generadas */}
            {previewImages.length > 0 && !isProcessingPdf && (
              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-emerald-600">verified</span>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-montserrat">
                      {t("new_score.previews_generated", "Muestras de protección generadas con éxito")} ({previewImages.length} {language === "en" ? "pages" : "páginas"})
                    </h3>
                  </div>
                  <span className="text-[10px] text-[#0071BC] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 font-bold">
                    🛡️ {language === "en" ? "Urtext Watermark Applied" : "Marca Urtext & Difuminado Activo"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {previewImages.map((previewDataUrl, index) => (
                    <div
                      key={index}
                      className="group relative rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-md transition aspect-[3/4] flex flex-col justify-between"
                    >
                      <img
                        src={previewDataUrl}
                        alt={`Muestra ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#111C2D]/90 via-[#111C2D]/50 to-transparent p-2 text-white flex items-center justify-between text-[10px] font-bold">
                        <span>{language === "en" ? `Page ${index + 1}` : `Página ${index + 1}`}</span>
                        <span className="text-[#FBB03B] text-[9px] uppercase tracking-wider">
                          {language === "en" ? "Sample" : "Muestra"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* PASO 2: Metadatos de la Obra (Con Categorías y Dificultades dinámicas) */}
          <section className="bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-6 sm:p-7">
            <div className="mb-5">
              <h2 className="text-base sm:text-lg font-bold font-montserrat text-[#111C2D] flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0071BC] text-white text-xs font-bold">2</span>
                <span>{language === "en" ? "Score Metadata & Musicological Info" : "Metadatos de la Obra"}</span>
              </h2>
              <p className="text-xs text-[#4C4546] mt-1">
                {language === "en"
                  ? "Enter catalog metadata so musicians and concert pianists can easily find your piece."
                  : "Ingresa la información descriptiva para que los estudiantes y concertistas encuentren tu pieza fácilmente."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Título de la Obra */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold font-montserrat text-[#111C2D]">
                  {t("new_score.score_title", "Título de la Obra")} <span className="text-[#C1272D]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t("new_score.score_title_placeholder", "Ej: Pasillo en Do mayor, Op. 3")}
                  className="w-full text-xs font-medium rounded-xl border border-black/5 bg-[#F0F3FF]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC] transition-colors py-3 px-3.5 text-[#111C2D]"
                />
              </div>

              {/* Categoría Dinámica de la Base de Datos */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold font-montserrat text-[#111C2D] flex items-center justify-between">
                  <span>{t("new_score.genre", "Género / Categoría Musical")} <span className="text-[#C1272D]">*</span></span>
                  <span className="text-[10px] text-[#0071BC] font-semibold">{language === "en" ? "CMS Sync" : "BD Configurada"}</span>
                </label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs font-medium rounded-xl border border-black/5 bg-[#F0F3FF]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC] transition-colors py-3 px-3.5 text-[#111C2D] cursor-pointer"
                >
                  <option value="">{t("new_score.genre_select", "Selecciona una categoría...")}</option>
                  {categoriesList.map((cat: any, idx) => {
                    const val = typeof cat === "string" ? cat : (cat.title_es || cat.title || cat.name || cat.id || `cat_${idx}`);
                    const label = typeof cat === "string" ? cat : (language === "en" && cat.title_en ? cat.title_en : (cat.title_es || cat.title || cat.name || val));
                    return (
                      <option key={idx} value={val}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Nivel de Dificultad Dinámico de la Base de Datos */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold font-montserrat text-[#111C2D] flex items-center justify-between">
                  <span>{t("new_score.difficulty", "Nivel de Dificultad")} <span className="text-[#C1272D]">*</span></span>
                  <span className="text-[10px] text-[#0071BC] font-semibold">{language === "en" ? "CMS Sync" : "BD Configurada"}</span>
                </label>
                <select
                  required
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full text-xs font-medium rounded-xl border border-black/5 bg-[#F0F3FF]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC] transition-colors py-3 px-3.5 text-[#111C2D] cursor-pointer"
                >
                  <option value="">{t("new_score.difficulty_select", "Selecciona el nivel...")}</option>
                  {difficultiesList.map((diff: any, idx) => {
                    const val = typeof diff === "string" ? diff : (diff.title_es || diff.title || diff.name || diff.code || diff.id || `diff_${idx}`);
                    const label = typeof diff === "string" ? diff : (language === "en" && diff.title_en ? diff.title_en : (diff.title_es || diff.title || diff.name || val));
                    return (
                      <option key={idx} value={val}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Tonalidad Principal */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold font-montserrat text-[#111C2D]">
                  {t("new_score.tonality", "Tonalidad Principal")}
                </label>
                <input
                  type="text"
                  value={tonality}
                  onChange={(e) => setTonality(e.target.value)}
                  placeholder={t("new_score.tonality_placeholder", "Ej: Re menor, Sol mayor")}
                  className="w-full text-xs font-medium rounded-xl border border-black/5 bg-[#F0F3FF]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC] transition-colors py-3 px-3.5 text-[#111C2D]"
                />
              </div>

              {/* Número de Páginas */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold font-montserrat text-[#111C2D]">
                  {t("new_score.pages_count", "Número de Páginas")}
                </label>
                <input
                  type="number"
                  min={1}
                  max={250}
                  value={pagesCount}
                  onChange={(e) => setPagesCount(Math.max(1, Number(e.target.value)))}
                  className="w-full text-xs font-medium rounded-xl border border-black/5 bg-[#F0F3FF]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC] transition-colors py-3 px-3.5 text-[#111C2D]"
                />
              </div>

              {/* Enlace de Audio Opcional */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold font-montserrat text-[#111C2D]">
                  {t("new_score.audio_url", "Enlace a Muestra de Audio / MP3 (Opcional)")}
                </label>
                <input
                  type="url"
                  value={audioLink}
                  onChange={(e) => setAudioLink(e.target.value)}
                  placeholder={t("new_score.audio_url_placeholder", "https://... enlace de audio o grabación")}
                  className="w-full text-xs font-medium rounded-xl border border-black/5 bg-[#F0F3FF]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC] transition-colors py-3 px-3.5 text-[#111C2D]"
                />
              </div>

              {/* Descripción / Notas */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold font-montserrat text-[#111C2D]">
                  {t("new_score.description", "Notas al Programa / Reseña Musicológica")}
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t(
                    "new_score.description_placeholder",
                    "Describe el contexto de la obra, dedicatoria o pautas de interpretación..."
                  )}
                  className="w-full text-xs font-medium rounded-xl border border-black/5 bg-[#F0F3FF]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC] transition-colors py-3 px-3.5 text-[#111C2D] resize-y"
                />
              </div>
            </div>
          </section>

          {/* PASO 3: Precio & Regalías (80% para el compositor) */}
          <section className="bg-white rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-6 sm:p-7">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold font-montserrat text-[#111C2D] flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0071BC] text-white text-xs font-bold">3</span>
                  <span>{language === "en" ? "Pricing & Royalty Calculator" : "Precio & Calculadora de Regalías"}</span>
                </h2>
                <p className="text-xs text-[#4C4546] mt-1">
                  {language === "en"
                    ? `Set the retail price of your score. Enter in COP ($) or USD ($) with live real-time conversion (1 USD = $${usdRate.toLocaleString("es-CO")} COP).`
                    : `Fija el valor comercial de tu partitura en COP ($). La conversión a USD ($) se calcula automáticamente en vivo ($${usdRate.toLocaleString("es-CO")} COP por USD).`}
                </p>
              </div>

              {/* Insignia de Servicio TRM en Vivo */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#F0F3FF] border border-[#0071BC]/20 text-[#0071BC]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>
                  {isRateLive ? "TRM en Vivo (API):" : "TRM Estimada:"} 1 USD = ${usdRate.toLocaleString("es-CO")} COP
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {/* Inputs de Precio Bilingües con Conversión en Vivo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Input COP (Moneda Base Colombia) */}
                <div className={`p-4 rounded-xl border transition-all ${
                  language === "es"
                    ? "border-[#0071BC] bg-blue-50/20 shadow-xs"
                    : "border-black/5 bg-[#F0F3FF]/40"
                }`}>
                  <label className="block text-xs font-bold font-montserrat text-[#111C2D] mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span>{language === "en" ? "Price in COP ($ COP)" : "Precio de Venta (COP)"}</span>
                      <span className="text-[#C1272D]">*</span>
                    </span>
                    {language === "es" && (
                      <span className="text-[10px] font-extrabold bg-[#0071BC] text-white px-2 py-0.5 rounded-full">
                        Ingreso Principal (COP)
                      </span>
                    )}
                  </label>
                  <div className="relative rounded-xl shadow-2xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#111C2D] text-sm font-bold">
                      $
                    </div>
                    <input
                      type="number"
                      step="any"
                      min={1000}
                      value={priceCOP === 0 ? "" : priceCOP}
                      onChange={handleCopInputChange}
                      placeholder="45000"
                      className="w-full text-base font-bold text-[#111C2D] rounded-xl border border-black/10 bg-white pl-8 pr-14 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0071BC] transition-colors font-mono"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs font-bold text-[#4C4546]">
                      COP
                    </div>
                  </div>
                  <span className="text-[10px] text-[#4C4546] font-medium block mt-1.5">
                    {language === "en"
                      ? `≈ $${priceUSD.toFixed(2)} USD (Auto-converted via live TRM)`
                      : `≈ $${priceUSD.toFixed(2)} USD (Calculado en vivo vía servicio TRM)`}
                  </span>
                </div>

                {/* Input USD (Internacional) */}
                <div className={`p-4 rounded-xl border transition-all ${
                  language === "en"
                    ? "border-[#0071BC] bg-blue-50/20 shadow-xs"
                    : "border-black/5 bg-[#F0F3FF]/40"
                }`}>
                  <label className="block text-xs font-bold font-montserrat text-[#111C2D] mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span>{language === "en" ? "Price in USD ($ USD)" : "Precio en Dólares ($ USD)"}</span>
                      <span className="text-[#C1272D]">*</span>
                    </span>
                    {language === "en" && (
                      <span className="text-[10px] font-extrabold bg-[#0071BC] text-white px-2 py-0.5 rounded-full">
                        Primary (US / International)
                      </span>
                    )}
                  </label>
                  <div className="relative rounded-xl shadow-2xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#111C2D] text-sm font-bold">
                      $
                    </div>
                    <input
                      type="number"
                      step="any"
                      min={0.5}
                      value={priceUSD === 0 ? "" : priceUSD}
                      onChange={handleUsdInputChange}
                      placeholder="11.50"
                      className="w-full text-base font-bold text-[#111C2D] rounded-xl border border-black/10 bg-white pl-8 pr-14 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0071BC] transition-colors font-mono"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs font-bold text-[#0071BC]">
                      USD
                    </div>
                  </div>
                  <span className="text-[10px] text-[#4C4546] font-medium block mt-1.5">
                    {language === "en"
                      ? `≈ $${priceCOP.toLocaleString("es-CO")} COP (Rate: 1 USD = $${usdRate.toLocaleString("es-CO")} COP)`
                      : `≈ $${priceCOP.toLocaleString("es-CO")} COP (Tasa en vivo: 1 USD = $${usdRate.toLocaleString("es-CO")} COP)`}
                  </span>
                </div>
              </div>

              {/* Tarjetas de Desglose de Regalías (20% Plataforma / 80% Regalía) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Comisión Plataforma */}
                <div className="p-4 rounded-xl border border-black/5 bg-[#F0F3FF]/60 text-left space-y-1">
                  <span className="text-[11px] font-bold text-[#4C4546] block uppercase tracking-wider font-montserrat">
                    {language === "en" ? "Platform Fee (20%)" : "Comisión Plataforma (20%)"}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold font-mono text-[#111C2D]">
                      ${commission.toLocaleString("es-CO")} <span className="text-xs font-medium text-[#4C4546]">COP</span>
                    </span>
                    <span className="text-xs font-medium font-mono text-[#4C4546]">
                      (≈ ${ (commission / usdRate).toFixed(2) } USD)
                    </span>
                  </div>
                  <span className="text-[10px] text-[#4C4546] leading-tight block">
                    {language === "en" ? "Payment processing via Wompi, R2 CDN & DRM Protection" : "Pasarela Wompi, hosting R2 y protección de derechos"}
                  </span>
                </div>

                {/* Ganancia Neta Destacada */}
                <div className="p-4 rounded-xl border-2 border-[#FBB03B] bg-[#FBB03B]/10 text-left relative overflow-hidden space-y-1">
                  <span className="text-[11px] font-bold text-[#111C2D] block uppercase tracking-wider font-montserrat flex items-center justify-between">
                    <span>{language === "en" ? "Your Net Royalty (80%)" : "Tu Regalía Neta (80%)"}</span>
                    <span className="text-[10px] bg-[#FBB03B] text-[#111C2D] px-2 py-0.5 rounded font-extrabold">
                      {language === "en" ? "Paid to your account" : "Para tu cuenta bancaria"}
                    </span>
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black font-mono text-[#111C2D] tracking-tight">
                      ${netEarnings.toLocaleString("es-CO")} <span className="text-xs font-bold text-[#111C2D]">COP</span>
                    </span>
                    <span className="text-xs font-bold font-mono text-[#0071BC]">
                      (≈ ${ (netEarnings / usdRate).toFixed(2) } USD)
                    </span>
                  </div>
                  <span className="text-[10px] text-[#4C4546] leading-tight block">
                    {language === "en" ? "Dispersed bi-monthly per copy sold" : "Transferencia automática por cada descarga vendida"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Botón de Envío */}
          <div className="pt-2 space-y-3">
            <button
              type="submit"
              disabled={isSubmitting || isProcessingPdf}
              className="w-full py-4 px-6 rounded-xl font-extrabold text-sm sm:text-base text-[#111C2D] bg-[#FBB03B] hover:bg-[#e09b2d] shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer font-montserrat uppercase tracking-wider disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-[#111C2D] border-t-transparent rounded-full animate-spin"></span>
                  <span>{t("new_score.submitting", "Subiendo y Procesando Obra...")}</span>
                </>
              ) : (
                <>
                  <span>{t("new_score.submit", "Enviar Partitura a Revisión Editorial")}</span>
                  <span className="material-symbols-outlined text-xl">arrow_forward</span>
                </>
              )}
            </button>

            <p className="text-center text-xs text-[#4C4546] flex items-center justify-center gap-1.5 leading-relaxed">
              <span className="material-symbols-outlined text-base text-[#0071BC]">verified_user</span>
              <span>
                {language === "en"
                  ? "By submitting your piece, you confirm your authorship under copyright law. Curatorial review completed in 24 to 48 hours."
                  : "Al enviar tu obra confirmas tu autoría bajo normatividad DNDA / SAYCO. Revisión técnica por el comité en 24 a 48 horas hábiles."}
              </span>
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
