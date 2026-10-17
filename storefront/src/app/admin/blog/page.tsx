"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  getAdminBlogPosts,
  createAdminBlogPost,
  updateAdminBlogPost,
  toggleAdminBlogPost,
  deleteAdminBlogPost,
  createAdminBlogCategory,
  deleteAdminBlogCategory,
  uploadFileToCloudflareR2,
} from "@/lib/api-client";
import { autoTranslateBlogDraft, translateBlogCategory } from "@/lib/localize-messages";
import { useAlert } from "@/context/AlertContext";

interface BlogPostItem {
  id: string;
  title: string;
  title_en?: string | null;
  slug: string;
  category: string;
  category_en?: string | null;
  author: string;
  published_at: string;
  read_time: string;
  cover_image: string | null;
  excerpt: string | null;
  excerpt_en?: string | null;
  content: string;
  content_en?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface BlogCategoryItem {
  id: string;
  name: string;
  name_en?: string | null;
  slug: string;
  created_at: string;
}

export default function AdminBlogPage() {
  const { showAlert, showConfirm } = useAlert();
  const [posts, setPosts] = useState<BlogPostItem[]>([]);
  const [categories, setCategories] = useState<BlogCategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");

  // Estado del Toast / Pop-up Flotante
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 6000);
  };

  // Cargar datos
  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getAdminBlogPosts();
      if (data && data.success) {
        setPosts(data.posts || []);
        setCategories(data.categories || []);
      }
    } catch (err: any) {
      showToast(err.message || "Error al cargar publicaciones", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Modal de Categorías
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  // Modal de Edición / Creación de Artículo
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Partial<BlogPostItem> | null>(null);
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingInlineImage, setIsUploadingInlineImage] = useState(false);
  const [editorPreviewMode, setEditorPreviewMode] = useState<"write" | "preview">("write");
  const [editorLangTab, setEditorLangTab] = useState<"es" | "en">("es");

  // Confirmación de eliminación
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  // Textarea ref para insertar tags enriquecidos (ES y EN)
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaEnRef = useRef<HTMLTextAreaElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const inlineImageInputRef = useRef<HTMLInputElement>(null);

  // Abrir editor para nuevo artículo
  const handleOpenNewPost = () => {
    const firstCat = categories[0]?.name || "Actualidad";
    setEditingPost({
      title: "",
      title_en: "",
      slug: "",
      category: firstCat,
      category_en: (categories[0] as any)?.name_en || translateBlogCategory(firstCat, true),
      author: "Equipo Piano Colombia",
      published_at: new Date().toISOString().split("T")[0],
      read_time: "5 min de lectura",
      cover_image: null,
      excerpt: "",
      excerpt_en: "",
      content: "",
      content_en: "",
      is_active: true,
    });
    setEditorLangTab("es");
    setEditorPreviewMode("write");
    setIsEditorOpen(true);
  };

  // Abrir editor para editar artículo existente
  const handleOpenEditPost = (post: BlogPostItem) => {
    setEditingPost({
      ...post,
      title_en: post.title_en || "",
      excerpt_en: post.excerpt_en || "",
      content_en: post.content_en || "",
      category_en: post.category_en || translateBlogCategory(post.category, true),
      published_at: post.published_at ? new Date(post.published_at).toISOString().split("T")[0] : "",
    });
    setEditorLangTab("es");
    setEditorPreviewMode("write");
    setIsEditorOpen(true);
  };

  // Traducir automáticamente de Español a Inglés
  const handleAutoTranslateAction = () => {
    if (!editingPost?.title?.trim() && !editingPost?.content?.trim()) {
      showToast("Ingresa primero el título o contenido en español para traducir.", "info");
      return;
    }
    const auto = autoTranslateBlogDraft({
      title: editingPost.title || "",
      excerpt: editingPost.excerpt || "",
      content: editingPost.content || "",
    });
    setEditingPost((prev) => ({
      ...prev,
      title_en: auto.title_en,
      excerpt_en: auto.excerpt_en,
      content_en: auto.content_en,
    }));
    setEditorLangTab("en");
    showToast("¡Contenido traducido al inglés! Puedes revisarlo o ajustarlo en esta pestaña.", "success");
  };

  // Generador de slug a partir de título
  const handleTitleChange = (newTitle: string) => {
    const slug = newTitle
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setEditingPost((prev) => ({
      ...prev,
      title: newTitle,
      slug: prev?.id ? prev.slug : slug,
    }));
  };

  // Insertar formato en textarea (detecta si redacta en ES o EN)
  const insertFormatting = (tagStart: string, tagEnd: string = "") => {
    const isEnTab = editorLangTab === "en";
    const textarea = isEnTab ? textareaEnRef.current : textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end) || (isEnTab ? "Text here" : "Texto aquí");
    const replacement = `${tagStart}${selectedText}${tagEnd}`;

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    if (isEnTab) {
      setEditingPost((prev) => ({ ...prev, content_en: newContent }));
    } else {
      setEditingPost((prev) => ({ ...prev, content: newContent }));
    }

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagStart.length, start + tagStart.length + selectedText.length);
    }, 50);
  };

  // Subir imagen de portada
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const res = await uploadFileToCloudflareR2(file, "blog-covers");
      setEditingPost((prev) => ({ ...prev, cover_image: res.url }));
      showToast("Imagen de portada cargada exitosamente.", "success");
    } catch (err: any) {
      showToast(err.message || "Error al subir imagen de portada", "error");
    } finally {
      setIsUploadingCover(false);
      if (coverFileInputRef.current) coverFileInputRef.current.value = "";
    }
  };

  // Subir e insertar imagen dentro del cuerpo del artículo
  const handleInlineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingInlineImage(true);
    try {
      const res = await uploadFileToCloudflareR2(file, "blog-inline");
      const imgTag = `\n<img src="${res.url}" alt="${file.name.replace(/\.[^/.]+$/, "")}" class="my-6 rounded-2xl shadow-md max-w-full mx-auto" />\n`;

      const isEnTab = editorLangTab === "en";
      const textarea = isEnTab ? textareaEnRef.current : textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const text = textarea.value;
        const newContent = text.substring(0, start) + imgTag + text.substring(start);
        if (isEnTab) {
          setEditingPost((prev) => ({ ...prev, content_en: newContent }));
        } else {
          setEditingPost((prev) => ({ ...prev, content: newContent }));
        }
      } else {
        if (isEnTab) {
          setEditingPost((prev) => ({ ...prev, content_en: (prev?.content_en || "") + imgTag }));
        } else {
          setEditingPost((prev) => ({ ...prev, content: (prev?.content || "") + imgTag }));
        }
      }
      showToast("Imagen insertada en el cuerpo del artículo.", "success");
    } catch (err: any) {
      showToast(err.message || "Error al subir e insertar imagen", "error");
    } finally {
      setIsUploadingInlineImage(false);
      if (inlineImageInputRef.current) inlineImageInputRef.current.value = "";
    }
  };

  // Guardar artículo (Crear o Actualizar)
  const handleSavePost = async () => {
    if (!editingPost?.title?.trim()) {
      showToast("Por favor ingresa el título del artículo.", "error");
      return;
    }
    if (!editingPost?.content?.trim()) {
      showToast("Por favor escribe el contenido del artículo.", "error");
      return;
    }

    // Categoría en inglés
    const selectedCat = categories.find((c) => c.name === editingPost.category);
    const category_en = (selectedCat as any)?.name_en || translateBlogCategory(editingPost.category, true);

    // Salvaguarda multilingüe: Si el admin no llenó inglés, autogenerar
    let finalTitleEn = editingPost.title_en?.trim();
    let finalExcerptEn = editingPost.excerpt_en?.trim();
    let finalContentEn = editingPost.content_en?.trim();

    if (!finalTitleEn || !finalContentEn) {
      const auto = autoTranslateBlogDraft({
        title: editingPost.title || "",
        excerpt: editingPost.excerpt || "",
        content: editingPost.content || "",
      });
      if (!finalTitleEn) finalTitleEn = auto.title_en;
      if (!finalExcerptEn) finalExcerptEn = auto.excerpt_en;
      if (!finalContentEn) finalContentEn = auto.content_en;
    }

    const payload = {
      ...editingPost,
      title_en: finalTitleEn,
      excerpt_en: finalExcerptEn,
      content_en: finalContentEn,
      category_en,
    };

    setIsSavingPost(true);
    try {
      if (editingPost.id) {
        // Actualizar
        const res = await updateAdminBlogPost(editingPost.id, payload);
        showToast(res.message || "Artículo actualizado correctamente.", "success");
      } else {
        // Crear
        const res = await createAdminBlogPost(payload);
        showToast(res.message || "Artículo creado y publicado exitosamente.", "success");
      }
      setIsEditorOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || "Error al guardar el artículo", "error");
    } finally {
      setIsSavingPost(false);
    }
  };

  // Activar / Desactivar artículo
  const handleToggleStatus = async (post: BlogPostItem) => {
    const nextStatus = !post.is_active;
    // Optimistic update
    setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, is_active: nextStatus } : p)));

    try {
      await toggleAdminBlogPost(post.id, nextStatus);
      showToast(`Artículo "${post.title}" ${nextStatus ? "activado" : "desactivado"}.`, "info");
    } catch (err: any) {
      // Revertir
      setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, is_active: post.is_active } : p)));
      showToast(err.message || "Error al cambiar estado", "error");
    }
  };

  // Eliminar artículo
  const handleConfirmDelete = async () => {
    if (!deletingPostId) return;
    try {
      await deleteAdminBlogPost(deletingPostId);
      setPosts((prev) => prev.filter((p) => p.id !== deletingPostId));
      showToast("Artículo eliminado exitosamente.", "success");
    } catch (err: any) {
      showToast(err.message || "Error al eliminar artículo", "error");
    } finally {
      setDeletingPostId(null);
    }
  };

  // Crear categoría
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setIsSavingCategory(true);
    try {
      const res = await createAdminBlogCategory(newCategoryName.trim());
      if (res && res.category) {
        setCategories((prev) => [...prev, res.category]);
        setNewCategoryName("");
        showToast(`Categoría "${res.category.name}" creada.`, "success");
      }
    } catch (err: any) {
      showToast(err.message || "Error al crear categoría", "error");
    } finally {
      setIsSavingCategory(false);
    }
  };

  // Eliminar categoría
  const handleDeleteCategory = (catId: string, catName: string) => {
    showConfirm({
      title: "Eliminar Categoría",
      message: `¿Estás seguro de que deseas eliminar la categoría "${catName}"? Esta acción no se puede deshacer.`,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      danger: true,
      onConfirm: async () => {
        try {
          await deleteAdminBlogCategory(catId);
          setCategories((prev) => prev.filter((c) => c.id !== catId));
          showAlert({
            type: "info",
            message: `Categoría "${catName}" eliminada correctamente.`
          });
        } catch (err: any) {
          showAlert({
            type: "error",
            message: err.message || "Error al eliminar categoría"
          });
        }
      }
    });
  };

  // Filtrado de publicaciones
  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.excerpt && p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategoryFilter === "all" ||
      p.category.toLowerCase() === selectedCategoryFilter.toLowerCase();

    const matchesStatus =
      selectedStatusFilter === "all" ||
      (selectedStatusFilter === "active" && p.is_active) ||
      (selectedStatusFilter === "inactive" && !p.is_active);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalActive = posts.filter((p) => p.is_active).length;
  const totalInactive = posts.filter((p) => !p.is_active).length;

  return (
    <div className="space-y-8">
      {/* Toast Flotante */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-semibold transition-all transform animate-in fade-in slide-in-from-top-4 ${
            toast.type === "success"
              ? "bg-[#111C2D] text-white border-[#FBB03B]/40 shadow-black/20"
              : toast.type === "error"
              ? "bg-red-900 text-white border-red-500 shadow-red-950/40"
              : "bg-blue-900 text-white border-blue-500 shadow-blue-950/40"
          }`}
        >
          <span
            className={`material-symbols-outlined text-xl ${
              toast.type === "success"
                ? "text-[#FBB03B]"
                : toast.type === "error"
                ? "text-red-300"
                : "text-blue-300"
            }`}
          >
            {toast.type === "success" ? "check_circle" : toast.type === "error" ? "error" : "info"}
          </span>
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-white/60 hover:text-white transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Cabecera Principal */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-black/5 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0071BC] font-montserrat">
            <span className="material-symbols-outlined text-base">article</span>
            <span>Bitácora Pianística & Blog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-montserrat text-[#111C2D] mt-1">
            Gestor de Publicaciones & Artículos
          </h1>
          <p className="text-xs sm:text-sm text-[#4C4546] mt-1">
            Crea, edita, activa o elimina noticias e investigaciones musicales con texto enriquecido e imágenes.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-black/10 bg-white text-[#111C2D] font-montserrat font-bold text-xs hover:bg-[#F0F3FF] transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-base text-[#0071BC]">label</span>
            <span>Categorías ({categories.length})</span>
          </button>

          <button
            onClick={handleOpenNewPost}
            className="px-5 py-2.5 rounded-xl bg-[#FBB03B] text-[#111C2D] font-montserrat font-extrabold text-xs uppercase tracking-wider hover:bg-[#e09b2d] shadow-sm hover:shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            <span>Nuevo Artículo</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-2xs">
          <span className="text-xs font-semibold text-[#4C4546] block">Total Artículos</span>
          <span className="text-2xl font-black text-[#111C2D] font-montserrat mt-1 block">{posts.length}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-2xs">
          <span className="text-xs font-semibold text-emerald-700 block flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Publicados / Activos
          </span>
          <span className="text-2xl font-black text-emerald-700 font-montserrat mt-1 block">{totalActive}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-300"></span> Borradores / Inactivos
          </span>
          <span className="text-2xl font-black text-slate-600 font-montserrat mt-1 block">{totalInactive}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-2xs">
          <span className="text-xs font-semibold text-[#0071BC] block">Categorías</span>
          <span className="text-2xl font-black text-[#0071BC] font-montserrat mt-1 block">{categories.length}</span>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/5 shadow-2xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar por título, autor o contenido..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-black/10 focus:outline-none focus:border-[#0071BC] focus:ring-1 focus:ring-[#0071BC] bg-[#F9F9FF]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          {/* Selector de Categoría */}
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-black/10 bg-white font-medium text-[#111C2D] focus:outline-none focus:border-[#0071BC]"
          >
            <option value="all">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Selector de Estado */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-black/10 bg-white font-medium text-[#111C2D] focus:outline-none focus:border-[#0071BC]"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Solo Activos</option>
            <option value="inactive">Solo Inactivos</option>
          </select>
        </div>
      </div>

      {/* Lista de Artículos */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400 bg-white rounded-3xl border border-black/5">
          <span className="material-symbols-outlined text-4xl animate-spin text-[#0071BC]">progress_activity</span>
          <span className="text-sm font-medium">Cargando publicaciones...</span>
        </div>
      ) : filteredPosts.length === 0 ? (
        posts.length > 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-black/5 p-8 sm:p-12 space-y-4 max-w-lg mx-auto shadow-xs animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">search_off</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black font-montserrat text-[#111C2D]">
                No se encontraron artículos con los filtros aplicados
              </h3>
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                {searchQuery.trim() && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#0071BC]/10 text-[#0071BC] text-[11px] font-bold">
                    Búsqueda: "{searchQuery.trim()}"
                  </span>
                )}
                {selectedCategoryFilter !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FBB03B]/20 text-[#111C2D] text-[11px] font-bold">
                    Categoría: {categories.find((c) => c.slug === selectedCategoryFilter)?.name || selectedCategoryFilter}
                  </span>
                )}
                {selectedStatusFilter !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                    Estado: {selectedStatusFilter === "active" ? "Solo Activos" : "Solo Inactivos"}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#4C4546] leading-relaxed max-w-sm mx-auto">
                Tienes {posts.length} artículo{posts.length > 1 ? "s" : ""} en la bitácora, pero ninguno coincide con los criterios de búsqueda o filtrado.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategoryFilter("all");
                  setSelectedStatusFilter("all");
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0071BC] hover:bg-[#005a96] text-white font-extrabold text-xs uppercase tracking-wider font-montserrat shadow-md transition cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-base">restart_alt</span>
                <span>Limpiar filtros ({posts.length})</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-16 text-center bg-white rounded-3xl border border-black/5 p-8 space-y-3">
            <span className="material-symbols-outlined text-5xl text-slate-300">post_add</span>
            <h3 className="text-lg font-bold font-montserrat text-[#111C2D]">No se encontraron artículos</h3>
            <p className="text-xs text-[#4C4546] max-w-md mx-auto">
              Aún no has creado artículos en la bitácora. ¡Comienza haciendo clic en 'Nuevo Artículo'!
            </p>
            <button
              onClick={handleOpenNewPost}
              className="mt-2 px-5 py-2.5 rounded-xl bg-[#FBB03B] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider font-montserrat hover:bg-[#e09b2d] transition"
            >
              Redactar Primer Artículo
            </button>
          </div>
        )
      ) : (
        <div className="bg-white rounded-3xl border border-black/5 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#111C2D]">
              <thead className="bg-[#F8FAFC] text-[11px] font-extrabold uppercase font-montserrat text-[#4C4546] border-b border-black/5">
                <tr>
                  <th className="py-3.5 px-4">Artículo</th>
                  <th className="py-3.5 px-4">Categoría</th>
                  <th className="py-3.5 px-4">Autor</th>
                  <th className="py-3.5 px-4">Fecha</th>
                  <th className="py-3.5 px-4 text-center">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredPosts.map((post) => {
                  const dateStr = (() => {
                    try {
                      if (!post.published_at) return "";
                      const d = new Date(post.published_at);
                      return d.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
                    } catch {
                      return post.published_at;
                    }
                  })();

                  return (
                    <tr key={post.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Portada & Título */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-black/5">
                            {post.cover_image ? (
                              <img
                                src={post.cover_image}
                                alt={post.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <span className="material-symbols-outlined text-xl">image</span>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-md">
                            <h4 className="font-bold text-sm text-[#111C2D] font-montserrat truncate">
                              {post.title}
                            </h4>
                            <span className="text-[11px] text-slate-400 font-mono block truncate">
                              /blog/{post.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Categoría */}
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 bg-[#F0F3FF] text-[#0071BC] rounded-full font-bold text-[10px] uppercase font-montserrat border border-[#0071BC]/10">
                          {post.category}
                        </span>
                      </td>

                      {/* Autor */}
                      <td className="py-4 px-4 font-medium text-[#4C4546]">
                        {post.author}
                      </td>

                      {/* Fecha & Lectura */}
                      <td className="py-4 px-4">
                        <span className="font-medium text-[#111C2D] block">{dateStr}</span>
                        <span className="text-[10px] text-slate-400 block">{post.read_time || "5 min"}</span>
                      </td>

                      {/* Switch de Activo / Inactivo */}
                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(post)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            post.is_active ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                          title={post.is_active ? "Desactivar artículo" : "Activar artículo"}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                              post.is_active ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                        <span className="text-[10px] text-slate-400 block font-medium mt-0.5">
                          {post.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Ver en vivo */}
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="p-2 rounded-lg text-slate-500 hover:text-[#0071BC] hover:bg-slate-100 transition"
                            title="Ver en el sitio"
                          >
                            <span className="material-symbols-outlined text-base">visibility</span>
                          </Link>

                          {/* Editar */}
                          <button
                            onClick={() => handleOpenEditPost(post)}
                            className="p-2 rounded-lg text-slate-700 hover:text-[#0071BC] hover:bg-slate-100 transition cursor-pointer"
                            title="Editar artículo"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>

                          {/* Eliminar */}
                          <button
                            onClick={() => setDeletingPostId(post.id)}
                            className="p-2 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition cursor-pointer"
                            title="Eliminar artículo"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: EDITOR DE ARTÍCULO (CREAR / EDITAR)
          ======================================================== */}
      {isEditorOpen && editingPost && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-black/5 bg-[#F8FAFC]">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0071BC] font-montserrat block">
                  {editingPost.id ? "Modo Edición" : "Nueva Publicación"}
                </span>
                <h3 className="text-xl font-black font-montserrat text-[#111C2D]">
                  {editingPost.id ? `Editar: ${editingPost.title}` : "Redactar Nuevo Artículo"}
                </h3>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="w-9 h-9 rounded-full bg-white border border-black/10 text-slate-500 hover:text-[#111C2D] flex items-center justify-center transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
              
              {/* Sección 1: Metadatos Globales (Categoría, Autor, Fecha, Lectura) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Categoría */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#111C2D] font-montserrat">
                    Categoría <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editingPost.category || ""}
                    onChange={(e) => setEditingPost((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-xs font-medium focus:outline-none focus:border-[#0071BC] bg-[#F9F9FF]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Autor */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#111C2D] font-montserrat">
                    Autor
                  </label>
                  <input
                    type="text"
                    value={editingPost.author || ""}
                    onChange={(e) => setEditingPost((prev) => ({ ...prev, author: e.target.value }))}
                    placeholder="Edwin A. Soto"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-xs font-medium focus:outline-none focus:border-[#0071BC] bg-[#F9F9FF]"
                  />
                </div>

                {/* Fecha */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#111C2D] font-montserrat">
                    Fecha de Publicación
                  </label>
                  <input
                    type="date"
                    value={editingPost.published_at || ""}
                    onChange={(e) => setEditingPost((prev) => ({ ...prev, published_at: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-xs font-medium focus:outline-none focus:border-[#0071BC] bg-[#F9F9FF]"
                  />
                </div>

                {/* Tiempo de Lectura */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#111C2D] font-montserrat">
                    Tiempo de Lectura
                  </label>
                  <input
                    type="text"
                    value={editingPost.read_time || ""}
                    onChange={(e) => setEditingPost((prev) => ({ ...prev, read_time: e.target.value }))}
                    placeholder="5 min de lectura"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-xs font-medium focus:outline-none focus:border-[#0071BC] bg-[#F9F9FF]"
                  />
                </div>
              </div>

              {/* Sección 2: Imagen de Portada y Estado Activo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#F8FAFC] border border-black/5">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-[#111C2D] font-montserrat block">
                    Imagen de Portada
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      ref={coverFileInputRef}
                      onChange={handleCoverUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isUploadingCover}
                      onClick={() => coverFileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-white border border-black/10 text-xs font-bold font-montserrat text-[#111C2D] hover:bg-[#F0F3FF] transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base text-[#0071BC]">
                        {isUploadingCover ? "sync" : "cloud_upload"}
                      </span>
                      <span>{isUploadingCover ? "Subiendo..." : "Subir Portada"}</span>
                    </button>

                    {editingPost.cover_image && (
                      <button
                        type="button"
                        onClick={() => setEditingPost((prev) => ({ ...prev, cover_image: null }))}
                        className="text-xs text-red-500 hover:text-red-700 font-medium"
                      >
                        Quitar imagen
                      </button>
                    )}
                  </div>

                  {editingPost.cover_image && (
                    <div className="mt-2 relative w-full h-32 rounded-xl overflow-hidden border border-black/10 bg-white">
                      <img
                        src={editingPost.cover_image}
                        alt="Vista previa portada"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Switch de Publicación Inmediata */}
                <div className="flex flex-col justify-center items-start md:items-end">
                  <span className="text-xs font-bold text-[#111C2D] font-montserrat block mb-2">
                    Estado de Publicación
                  </span>
                  <label className="inline-flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editingPost.is_active)}
                      onChange={(e) => setEditingPost((prev) => ({ ...prev, is_active: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    <span className="text-xs font-semibold text-[#111C2D]">
                      {editingPost.is_active ? "Publicado (Visible)" : "Borrador (Oculto)"}
                    </span>
                  </label>
                </div>
              </div>

              {/* Selector de Pestaña de Idioma */}
              <div className="flex items-center justify-between border-y border-black/10 py-3 bg-[#F8FAFC] -mx-6 px-6 sm:-mx-8 sm:px-8">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditorLangTab("es")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold font-montserrat transition cursor-pointer flex items-center gap-1.5 ${
                      editorLangTab === "es"
                        ? "bg-[#0071BC] text-white shadow-xs"
                        : "bg-white border border-black/10 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>🇨🇴</span>
                    <span>Español (Principal)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorLangTab("en")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold font-montserrat transition cursor-pointer flex items-center gap-1.5 ${
                      editorLangTab === "en"
                        ? "bg-[#0071BC] text-white shadow-xs"
                        : "bg-white border border-black/10 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>🇺🇸</span>
                    <span>English (Traducción)</span>
                    {editingPost.title_en && (
                      <span className="text-[10px] bg-emerald-500 text-white rounded-full px-1.5 py-0.2">✓</span>
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAutoTranslateAction}
                  className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 transition text-xs font-bold font-montserrat flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Traducir automáticamente de español a inglés"
                >
                  <span className="material-symbols-outlined text-sm text-amber-600">auto_awesome</span>
                  <span>Traducir con IA a Inglés</span>
                </button>
              </div>

              {/* ========================================================
                  CONTENIDO EN ESPAÑOL
                  ======================================================== */}
              {editorLangTab === "es" && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  {/* Fila Título y Slug */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-[#111C2D] font-montserrat">
                        Título del Artículo (Español) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingPost.title || ""}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="Ej: El Bambuco en el Piano: Rítmica y Articulación..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-xs font-medium focus:outline-none focus:border-[#0071BC] bg-[#F9F9FF]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#111C2D] font-montserrat">
                        Slug (URL Amigable)
                      </label>
                      <input
                        type="text"
                        value={editingPost.slug || ""}
                        onChange={(e) => setEditingPost((prev) => ({ ...prev, slug: e.target.value }))}
                        placeholder="el-bambuco-en-el-piano"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-xs font-mono text-slate-600 focus:outline-none focus:border-[#0071BC] bg-[#F9F9FF]"
                      />
                    </div>
                  </div>

                  {/* Extracto Corto */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#111C2D] font-montserrat">
                      Resumen Corto / Extracto (Español)
                    </label>
                    <textarea
                      rows={2}
                      value={editingPost.excerpt || ""}
                      onChange={(e) => setEditingPost((prev) => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="Breve sinopsis que aparecerá en las tarjetas de la página de inicio..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-xs font-medium focus:outline-none focus:border-[#0071BC] bg-[#F9F9FF]"
                    />
                  </div>

                  {/* Editor de Contenido Enriquecido */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#111C2D] font-montserrat">
                        Contenido del Artículo (Español) <span className="text-red-500">*</span>
                      </label>

                      {/* Switch Redacción vs Vista Previa */}
                      <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => setEditorPreviewMode("write")}
                          className={`px-3 py-1 rounded-md transition ${
                            editorPreviewMode === "write"
                              ? "bg-white text-[#111C2D] shadow-2xs"
                              : "text-slate-500 hover:text-[#111C2D]"
                          }`}
                        >
                          Redactar
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditorPreviewMode("preview")}
                          className={`px-3 py-1 rounded-md transition ${
                            editorPreviewMode === "preview"
                              ? "bg-white text-[#111C2D] shadow-2xs"
                              : "text-slate-500 hover:text-[#111C2D]"
                          }`}
                        >
                          Vista Previa
                        </button>
                      </div>
                    </div>

                    {editorPreviewMode === "write" ? (
                      <div className="border border-black/10 rounded-2xl overflow-hidden bg-white shadow-2xs">
                        <div className="flex items-center gap-1 p-2 bg-[#F8FAFC] border-b border-black/5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => insertFormatting("<strong>", "</strong>")}
                            className="p-1.5 rounded hover:bg-slate-200 text-slate-700 font-bold text-xs"
                            title="Negrita"
                          >
                            B
                          </button>
                          <button
                            type="button"
                            onClick={() => insertFormatting("<em>", "</em>")}
                            className="p-1.5 rounded hover:bg-slate-200 text-slate-700 italic text-xs"
                            title="Cursiva"
                          >
                            I
                          </button>
                          <button
                            type="button"
                            onClick={() => insertFormatting("<h2>", "</h2>")}
                            className="px-2 py-1 rounded hover:bg-slate-200 text-slate-700 font-bold text-xs"
                            title="Título Principal (H2)"
                          >
                            H2
                          </button>
                          <button
                            type="button"
                            onClick={() => insertFormatting("<h3>", "</h3>")}
                            className="px-2 py-1 rounded hover:bg-slate-200 text-slate-700 font-bold text-xs"
                            title="Subtítulo (H3)"
                          >
                            H3
                          </button>
                          <button
                            type="button"
                            onClick={() => insertFormatting("<blockquote>\n  \"", "\"\n</blockquote>")}
                            className="p-1.5 rounded hover:bg-slate-200 text-slate-700 text-xs flex items-center"
                            title="Cita destacada"
                          >
                            <span className="material-symbols-outlined text-sm">format_quote</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => insertFormatting("<ul>\n  <li>", "</li>\n</ul>")}
                            className="p-1.5 rounded hover:bg-slate-200 text-slate-700 text-xs flex items-center"
                            title="Lista con viñetas"
                          >
                            <span className="material-symbols-outlined text-sm">format_list_bulleted</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => insertFormatting("<ol>\n  <li>", "</li>\n</ol>")}
                            className="p-1.5 rounded hover:bg-slate-200 text-slate-700 text-xs flex items-center"
                            title="Lista numerada"
                          >
                            <span className="material-symbols-outlined text-sm">format_list_numbered</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => insertFormatting('<a href="https://" target="_blank">', "</a>")}
                            className="p-1.5 rounded hover:bg-slate-200 text-slate-700 text-xs flex items-center"
                            title="Enlace"
                          >
                            <span className="material-symbols-outlined text-sm">link</span>
                          </button>

                          <div className="h-5 w-px bg-slate-300 mx-1"></div>

                          {/* Subir e Insertar Imagen */}
                          <input
                            type="file"
                            ref={inlineImageInputRef}
                            onChange={handleInlineImageUpload}
                            accept="image/*"
                            className="hidden"
                          />
                          <button
                            type="button"
                            disabled={isUploadingInlineImage}
                            onClick={() => inlineImageInputRef.current?.click()}
                            className="px-2.5 py-1 rounded-lg bg-[#F0F3FF] text-[#0071BC] hover:bg-[#e0eaff] transition text-xs font-bold flex items-center gap-1 cursor-pointer"
                            title="Subir e insertar imagen dentro del texto"
                          >
                            <span className="material-symbols-outlined text-sm">
                              {isUploadingInlineImage ? "sync" : "add_photo_alternate"}
                            </span>
                            <span>{isUploadingInlineImage ? "Subiendo..." : "Insertar Imagen"}</span>
                          </button>
                        </div>

                        <textarea
                          ref={textareaRef}
                          rows={12}
                          value={editingPost.content || ""}
                          onChange={(e) => setEditingPost((prev) => ({ ...prev, content: e.target.value }))}
                          placeholder="Escribe el artículo utilizando texto enriquecido, subtítulos y citas..."
                          className="w-full p-4 text-xs font-mono leading-relaxed focus:outline-none bg-white resize-y"
                        />
                      </div>
                    ) : (
                      /* Vista Previa Enriquecida */
                      <div className="border border-black/10 rounded-2xl p-6 bg-slate-50 min-h-[300px] overflow-y-auto">
                        <div
                          className="prose prose-slate max-w-none text-[#111C2D] text-xs leading-relaxed space-y-3
                            [&>h2]:text-base [&>h2]:font-bold [&>h2]:text-[#111C2D] [&>h2]:mt-4
                            [&>h3]:text-sm [&>h3]:font-bold [&>h3]:text-[#111C2D] [&>h3]:mt-3
                            [&>p]:text-[#4C4546]
                            [&>blockquote]:border-l-4 [&>blockquote]:border-[#FBB03B] [&>blockquote]:pl-3 [&>blockquote]:italic
                            [&>ul]:list-disc [&>ul]:pl-5
                            [&>ol]:list-decimal [&>ol]:pl-5
                            [&>img]:rounded-xl [&>img]:shadow-xs [&>img]:max-w-md [&>img]:mx-auto"
                          dangerouslySetInnerHTML={{ __html: editingPost.content || "<p className='text-slate-400 italic'>Sin contenido todavía...</p>" }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================
                  CONTENIDO EN INGLÉS
                  ======================================================== */}
              {editorLangTab === "en" && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  {/* Título en Inglés */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#111C2D] font-montserrat flex items-center justify-between">
                      <span>Article Title (English)</span>
                      <span className="text-[11px] text-[#0071BC] font-normal">Shown to English visitors</span>
                    </label>
                    <input
                      type="text"
                      value={editingPost.title_en || ""}
                      onChange={(e) => setEditingPost((prev) => ({ ...prev, title_en: e.target.value }))}
                      placeholder="E.g.: The Bambuco on the Piano: Rhythm and Articulation for Concert Performance..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-xs font-medium focus:outline-none focus:border-[#0071BC] bg-[#F9F9FF]"
                    />
                  </div>

                  {/* Extracto en Inglés */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#111C2D] font-montserrat">
                      Short Summary / Excerpt (English)
                    </label>
                    <textarea
                      rows={2}
                      value={editingPost.excerpt_en || ""}
                      onChange={(e) => setEditingPost((prev) => ({ ...prev, excerpt_en: e.target.value }))}
                      placeholder="Brief English synopsis for cards and previews..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-xs font-medium focus:outline-none focus:border-[#0071BC] bg-[#F9F9FF]"
                    />
                  </div>

                  {/* Contenido en Inglés */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#111C2D] font-montserrat">
                        Article Content (English)
                      </label>

                      <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => setEditorPreviewMode("write")}
                          className={`px-3 py-1 rounded-md transition ${
                            editorPreviewMode === "write"
                              ? "bg-white text-[#111C2D] shadow-2xs"
                              : "text-slate-500 hover:text-[#111C2D]"
                          }`}
                        >
                          Write
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditorPreviewMode("preview")}
                          className={`px-3 py-1 rounded-md transition ${
                            editorPreviewMode === "preview"
                              ? "bg-white text-[#111C2D] shadow-2xs"
                              : "text-slate-500 hover:text-[#111C2D]"
                          }`}
                        >
                          Preview
                        </button>
                      </div>
                    </div>

                    {editorPreviewMode === "write" ? (
                      <div className="border border-black/10 rounded-2xl overflow-hidden bg-white shadow-2xs">
                        <div className="flex items-center gap-1 p-2 bg-[#F8FAFC] border-b border-black/5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => insertFormatting("<strong>", "</strong>")}
                            className="p-1.5 rounded hover:bg-slate-200 text-slate-700 font-bold text-xs"
                            title="Bold"
                          >
                            B
                          </button>
                          <button
                            type="button"
                            onClick={() => insertFormatting("<em>", "</em>")}
                            className="p-1.5 rounded hover:bg-slate-200 text-slate-700 italic text-xs"
                            title="Italic"
                          >
                            I
                          </button>
                          <button
                            type="button"
                            onClick={() => insertFormatting("<h2>", "</h2>")}
                            className="px-2 py-1 rounded hover:bg-slate-200 text-slate-700 font-bold text-xs"
                            title="Heading (H2)"
                          >
                            H2
                          </button>
                          <button
                            type="button"
                            onClick={() => insertFormatting("<h3>", "</h3>")}
                            className="px-2 py-1 rounded hover:bg-slate-200 text-slate-700 font-bold text-xs"
                            title="Subheading (H3)"
                          >
                            H3
                          </button>
                          <button
                            type="button"
                            onClick={() => insertFormatting("<blockquote>\n  \"", "\"\n</blockquote>")}
                            className="p-1.5 rounded hover:bg-slate-200 text-slate-700 text-xs flex items-center"
                            title="Quote"
                          >
                            <span className="material-symbols-outlined text-sm">format_quote</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => insertFormatting("<ul>\n  <li>", "</li>\n</ul>")}
                            className="p-1.5 rounded hover:bg-slate-200 text-slate-700 text-xs flex items-center"
                            title="Bullet List"
                          >
                            <span className="material-symbols-outlined text-sm">format_list_bulleted</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => insertFormatting("<ol>\n  <li>", "</li>\n</ol>")}
                            className="p-1.5 rounded hover:bg-slate-200 text-slate-700 text-xs flex items-center"
                            title="Numbered List"
                          >
                            <span className="material-symbols-outlined text-sm">format_list_numbered</span>
                          </button>

                          <div className="h-5 w-px bg-slate-300 mx-1"></div>

                          {/* Subir e Insertar Imagen */}
                          <button
                            type="button"
                            disabled={isUploadingInlineImage}
                            onClick={() => inlineImageInputRef.current?.click()}
                            className="px-2.5 py-1 rounded-lg bg-[#F0F3FF] text-[#0071BC] hover:bg-[#e0eaff] transition text-xs font-bold flex items-center gap-1 cursor-pointer"
                            title="Upload and insert inline image"
                          >
                            <span className="material-symbols-outlined text-sm">
                              {isUploadingInlineImage ? "sync" : "add_photo_alternate"}
                            </span>
                            <span>{isUploadingInlineImage ? "Uploading..." : "Insert Image"}</span>
                          </button>
                        </div>

                        <textarea
                          ref={textareaEnRef}
                          rows={12}
                          value={editingPost.content_en || ""}
                          onChange={(e) => setEditingPost((prev) => ({ ...prev, content_en: e.target.value }))}
                          placeholder="Write English content or click 'Traducir con IA a Inglés' to auto-translate..."
                          className="w-full p-4 text-xs font-mono leading-relaxed focus:outline-none bg-white resize-y"
                        />
                      </div>
                    ) : (
                      /* Vista Previa Enriquecida */
                      <div className="border border-black/10 rounded-2xl p-6 bg-slate-50 min-h-[300px] overflow-y-auto">
                        <div
                          className="prose prose-slate max-w-none text-[#111C2D] text-xs leading-relaxed space-y-3
                            [&>h2]:text-base [&>h2]:font-bold [&>h2]:text-[#111C2D] [&>h2]:mt-4
                            [&>h3]:text-sm [&>h3]:font-bold [&>h3]:text-[#111C2D] [&>h3]:mt-3
                            [&>p]:text-[#4C4546]
                            [&>blockquote]:border-l-4 [&>blockquote]:border-[#FBB03B] [&>blockquote]:pl-3 [&>blockquote]:italic
                            [&>ul]:list-disc [&>ul]:pl-5
                            [&>ol]:list-decimal [&>ol]:pl-5
                            [&>img]:rounded-xl [&>img]:shadow-xs [&>img]:max-w-md [&>img]:mx-auto"
                          dangerouslySetInnerHTML={{ __html: editingPost.content_en || "<p className='text-slate-400 italic'>No English content yet...</p>" }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-black/5 bg-[#F8FAFC]">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-black/10 bg-white text-xs font-bold font-montserrat text-[#4C4546] hover:bg-slate-100 transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isSavingPost}
                onClick={handleSavePost}
                className="px-6 py-2.5 rounded-xl bg-[#FBB03B] text-[#111C2D] font-extrabold text-xs uppercase tracking-wider font-montserrat hover:bg-[#e09b2d] shadow-sm hover:shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">
                  {isSavingPost ? "sync" : "save"}
                </span>
                <span>{isSavingPost ? "Guardando..." : "Guardar Publicación"}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: GESTIÓN DE CATEGORÍAS
          ======================================================== */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-black/5 pb-3">
              <h3 className="text-lg font-black font-montserrat text-[#111C2D] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0071BC]">label</span>
                <span>Categorías del Blog</span>
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-slate-400 hover:text-[#111C2D] transition"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Formulario Nueva Categoría */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nombre de categoría (ej: Reseñas)..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-black/10 text-xs focus:outline-none focus:border-[#0071BC] bg-[#F9F9FF]"
                onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
              />
              <button
                type="button"
                disabled={isSavingCategory || !newCategoryName.trim()}
                onClick={handleCreateCategory}
                className="px-4 py-2 rounded-xl bg-[#0071BC] text-white font-bold text-xs font-montserrat hover:bg-[#005a96] disabled:opacity-50 transition cursor-pointer"
              >
                {isSavingCategory ? "Creando..." : "Agregar"}
              </button>
            </div>

            {/* Lista de Categorías Existentes */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-black/5 text-xs"
                >
                  <span className="font-bold text-[#111C2D]">{cat.name}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="text-red-500 hover:text-red-700 p-1 transition cursor-pointer"
                    title="Eliminar categoría"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-black/5 text-right">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-100 text-[#111C2D] font-bold text-xs font-montserrat hover:bg-slate-200 transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: CONFIRMACIÓN DE ELIMINACIÓN
          ======================================================== */}
      {deletingPostId && (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            <h4 className="text-base font-black font-montserrat text-[#111C2D]">¿Eliminar esta publicación?</h4>
            <p className="text-xs text-[#4C4546]">
              Esta acción no se puede deshacer. El artículo y sus comentarios quedarán permanentemente eliminados.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingPostId(null)}
                className="px-4 py-2 rounded-xl border border-black/10 text-xs font-bold font-montserrat text-[#4C4546] hover:bg-slate-100 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold font-montserrat hover:bg-red-700 transition cursor-pointer"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
