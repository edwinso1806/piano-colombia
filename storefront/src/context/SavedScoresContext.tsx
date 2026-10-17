"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "./AuthContext";
import { useLanguage } from "./LanguageContext";
import { useAlert } from "./AlertContext";

export interface SavedScore {
  id: string;
  slug?: string;
  title: string;
  composer: string;
  category?: string;
  level?: string;
  priceCOP: number;
  priceUSD: number;
  description?: string;
  savedAt: string;
  collectionId?: string;
}

export interface ScoreCollection {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  createdAt: string;
}

export type ScoreIdentifier = string | { id?: string; slug?: string; title?: string };

interface SavedScoresContextType {
  savedScores: SavedScore[];
  collections: ScoreCollection[];
  isLoaded: boolean;
  isSaved: (target: ScoreIdentifier) => boolean;
  toggleSaveScore: (score: Omit<SavedScore, "savedAt">, collectionId?: string) => boolean;
  removeSavedScore: (target: ScoreIdentifier) => void;
  clearAllSavedScores: () => void;
  createCollection: (name: string, description?: string, icon?: string) => ScoreCollection;
  deleteCollection: (id: string) => void;
  moveScoreToCollection: (slugOrId: string, collectionId?: string) => void;
  openSaveModal: (score: any) => void;
  closeSaveModal: () => void;
}

const SavedScoresContext = createContext<SavedScoresContextType | undefined>(undefined);

// Helper para comparar si dos partituras son la misma por ID, Slug o Título
function matchesScore(
  saved: SavedScore,
  target: ScoreIdentifier
): boolean {
  if (!target) return false;

  if (typeof target === "string") {
    const q = target.toLowerCase().trim();
    return Boolean(
      (saved.id && saved.id.toLowerCase().trim() === q) ||
      (saved.slug && saved.slug.toLowerCase().trim() === q) ||
      (saved.title && saved.title.toLowerCase().trim() === q)
    );
  }

  // Coincidencia por ID
  if (target.id && saved.id && target.id === saved.id) return true;

  // Coincidencia por Slug
  if (
    target.slug &&
    saved.slug &&
    target.slug.toLowerCase().trim() === saved.slug.toLowerCase().trim()
  ) {
    return true;
  }

  // Coincidencia cruzada Slug <-> ID
  if (
    target.slug &&
    saved.id &&
    target.slug.toLowerCase().trim() === saved.id.toLowerCase().trim()
  ) {
    return true;
  }
  if (
    target.id &&
    saved.slug &&
    target.id.toLowerCase().trim() === saved.slug.toLowerCase().trim()
  ) {
    return true;
  }

  // Coincidencia por Título (muy importante para partituras de catálogo)
  if (
    target.title &&
    saved.title &&
    target.title.toLowerCase().trim() === saved.title.toLowerCase().trim()
  ) {
    return true;
  }

  return false;
}

export function SavedScoresProvider({ children }: { children: React.ReactNode }) {
  const { customer } = useAuth();
  const customerEmail = customer?.email ? customer.email.toLowerCase().trim() : null;
  const { language } = useLanguage();
  const { showSuccess } = useAlert();
  const isEn = language === "en";

  const [savedScores, setSavedScores] = useState<SavedScore[]>([]);
  const [collections, setCollections] = useState<ScoreCollection[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Estado del Modal Global de Colección
  const [mounted, setMounted] = useState(false);
  const [scoreToSave, setScoreToSave] = useState<any | null>(null);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openSaveModal = useCallback((score: any) => {
    setScoreToSave(score);
    setIsCreatingCollection(false);
    setNewCollectionName("");
  }, []);

  const closeSaveModal = useCallback(() => {
    setScoreToSave(null);
    setIsCreatingCollection(false);
    setNewCollectionName("");
  }, []);

  // Cerrar modal al presionar tecla Escape
  useEffect(() => {
    if (!scoreToSave) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeSaveModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scoreToSave, closeSaveModal]);

  const getStorageKey = () => {
    return customerEmail ? `piano_colombia_saved_scores_${customerEmail}` : null;
  };

  const getCollectionsKey = () => {
    return customerEmail ? `piano_colombia_collections_${customerEmail}` : null;
  };

  // Cargar partituras guardadas y colecciones cuando el cliente inicia sesión o cambia
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!customerEmail) {
        setSavedScores([]);
        setCollections([]);
        setIsLoaded(true);
        return;
      }

      try {
        const scoresKey = `piano_colombia_saved_scores_${customerEmail}`;
        const rawScores = localStorage.getItem(scoresKey);
        let currentScores: SavedScore[] = [];
        if (rawScores) {
          try {
            currentScores = JSON.parse(rawScores);
          } catch {
            currentScores = [];
          }
        }

        // Migración única: Revisar y vaciar llaves de invitado o residuos previos para que no resuciten
        try {
          const guestKey = "piano_colombia_saved_scores_guest";
          const guestRaw = localStorage.getItem(guestKey);
          if (guestRaw) {
            try {
              const guestList: SavedScore[] = JSON.parse(guestRaw);
              if (Array.isArray(guestList)) {
                for (const oldItem of guestList) {
                  if (!currentScores.some((s) => matchesScore(s, oldItem))) {
                    currentScores.push({
                      ...oldItem,
                      savedAt: oldItem.savedAt || new Date().toISOString(),
                    });
                  }
                }
              }
            } catch (err) {
              console.warn("No se pudo parsear llave guest:", err);
            }
            // ELIMINAR definitivamente la llave guest para que las eliminaciones persistan
            localStorage.removeItem(guestKey);
          }

          // Limpiar cualquier otra llave huérfana de pruebas para que no cause conflictos
          const orphanKeys: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith("piano_colombia_saved_scores_") && k !== scoresKey) {
              orphanKeys.push(k);
            }
          }
          orphanKeys.forEach((k) => localStorage.removeItem(k));
        } catch (e) {
          console.warn("Error limpiando llaves locales secundarias:", e);
        }

        // Revisar si el usuario venía de intentar guardar una partitura como favorita antes del login
        const pending = sessionStorage.getItem("piano_colombia_pending_favorite");
        if (pending) {
          try {
            const pendingScore = JSON.parse(pending);
            sessionStorage.removeItem("piano_colombia_pending_favorite");

            const alreadySaved = currentScores.some((s) => matchesScore(s, pendingScore));

            if (!alreadySaved) {
              const item: SavedScore = {
                ...pendingScore,
                savedAt: new Date().toISOString(),
                collectionId: "default",
              };
              currentScores = [item, ...currentScores];
            }
          } catch (e) {
            console.error("Error al procesar partitura pendiente post-login:", e);
          }
        }

        setSavedScores(currentScores);
        localStorage.setItem(scoresKey, JSON.stringify(currentScores));

        const colsKey = `piano_colombia_collections_${customerEmail}`;
        const rawCols = localStorage.getItem(colsKey);
        if (rawCols) {
          try {
            setCollections(JSON.parse(rawCols));
          } catch {
            setCollections([]);
          }
        } else {
          setCollections([]);
        }
      } catch (err) {
        console.error("Error al cargar partituras guardadas de localStorage:", err);
      } finally {
        setIsLoaded(true);
      }
    }
  }, [customerEmail]);

  const saveToStorage = (newScores: SavedScore[]) => {
    setSavedScores(newScores);
    if (typeof window !== "undefined" && customerEmail) {
      localStorage.setItem(`piano_colombia_saved_scores_${customerEmail}`, JSON.stringify(newScores));
    }
  };

  const saveCollectionsToStorage = (newCollections: ScoreCollection[]) => {
    setCollections(newCollections);
    if (typeof window !== "undefined" && customerEmail) {
      localStorage.setItem(`piano_colombia_collections_${customerEmail}`, JSON.stringify(newCollections));
    }
  };

  const isSaved = (target: ScoreIdentifier): boolean => {
    if (!customerEmail) return false;
    return savedScores.some((s) => matchesScore(s, target));
  };

  const toggleSaveScore = (score: Omit<SavedScore, "savedAt">, collectionId?: string): boolean => {
    if (!customerEmail) return false;

    const exists = isSaved(score);
    if (exists) {
      const updated = savedScores.filter((s) => !matchesScore(s, score));
      saveToStorage(updated);
      if (typeof window !== "undefined") {
        localStorage.removeItem("piano_colombia_saved_scores_guest");
        const pending = sessionStorage.getItem("piano_colombia_pending_favorite");
        if (pending) {
          try {
            const pendingScore = JSON.parse(pending);
            if (matchesScore(pendingScore, score)) {
              sessionStorage.removeItem("piano_colombia_pending_favorite");
            }
          } catch {}
        }
      }
      return false; // removed
    } else {
      const item: SavedScore = {
        ...score,
        savedAt: new Date().toISOString(),
        collectionId: collectionId || "default",
      };
      const updated = [item, ...savedScores];
      saveToStorage(updated);
      return true; // added
    }
  };

  const removeSavedScore = (target: ScoreIdentifier) => {
    if (!customerEmail) return;
    const updated = savedScores.filter((s) => !matchesScore(s, target));
    saveToStorage(updated);
    if (typeof window !== "undefined") {
      localStorage.removeItem("piano_colombia_saved_scores_guest");
      const pending = sessionStorage.getItem("piano_colombia_pending_favorite");
      if (pending) {
        try {
          const pendingScore = JSON.parse(pending);
          if (matchesScore(pendingScore, target)) {
            sessionStorage.removeItem("piano_colombia_pending_favorite");
          }
        } catch {}
      }
    }
  };

  const createCollection = (name: string, description?: string, icon?: string): ScoreCollection => {
    const newCol: ScoreCollection = {
      id: `col_${Date.now()}`,
      name,
      description,
      icon: icon || "folder",
      createdAt: new Date().toISOString(),
    };
    const updated = [...collections, newCol];
    saveCollectionsToStorage(updated);
    return newCol;
  };

  const deleteCollection = (id: string) => {
    const updatedCols = collections.filter((c) => c.id !== id);
    saveCollectionsToStorage(updatedCols);
    // Unassign scores from deleted collection
    const updatedScores = savedScores.map((s) => (s.collectionId === id ? { ...s, collectionId: undefined } : s));
    saveToStorage(updatedScores);
  };

  const moveScoreToCollection = (slugOrId: string, collectionId?: string) => {
    const updated = savedScores.map((s) => {
      if (s.slug === slugOrId || s.id === slugOrId) {
        return { ...s, collectionId };
      }
      return s;
    });
    saveToStorage(updated);
  };

  const clearAllSavedScores = () => {
    if (!customerEmail) return;
    saveToStorage([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("piano_colombia_saved_scores_guest");
      sessionStorage.removeItem("piano_colombia_pending_favorite");
    }
  };

  const handleSelectCollection = (colId: string, colName: string) => {
    if (!scoreToSave) return;
    toggleSaveScore(scoreToSave, colId);
    const scoreTitle = scoreToSave.title;
    closeSaveModal();
    showSuccess(
      isEn
        ? `"${scoreTitle}" saved in collection "${colName}".`
        : `"${scoreTitle}" guardada en la colección "${colName}".`
    );
  };

  const handleCreateAndSave = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!newCollectionName.trim() || !scoreToSave) return;

    const created = createCollection(newCollectionName.trim());
    const scoreTitle = scoreToSave.title;
    toggleSaveScore(scoreToSave, created.id);
    closeSaveModal();
    showSuccess(
      isEn
        ? `Collection "${created.name}" created and score saved.`
        : `Colección "${created.name}" creada y partitura guardada.`
    );
  };

  return (
    <SavedScoresContext.Provider
      value={{
        savedScores,
        collections,
        isLoaded,
        isSaved,
        toggleSaveScore,
        removeSavedScore,
        clearAllSavedScores,
        createCollection,
        deleteCollection,
        moveScoreToCollection,
        openSaveModal,
        closeSaveModal,
      }}
    >
      {children}

      {/* ========================================================
          MODAL GLOBAL DE SELECCIÓN DE COLECCIONES (VIA PORTAL)
          Renderizado en document.body para evitar estar dentro de
          tarjetas con transform o overflow-hidden
          ======================================================== */}
      {mounted && scoreToSave && typeof document !== "undefined" && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            closeSaveModal();
          }}
          className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 text-left"
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-black/10 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
          >
            {/* Encabezado */}
            <div className="flex items-start justify-between border-b border-black/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F0F3FF] text-[#0071BC] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl">folder_special</span>
                </div>
                <div>
                  <h3 className="text-base font-black font-montserrat text-[#111C2D]">
                    {isEn ? "Save to Collection" : "Guardar en Colección"}
                  </h3>
                  <p className="text-xs text-[#4C4546] line-clamp-1 font-medium font-inter">
                    {scoreToSave.title} {scoreToSave.composer ? `— ${scoreToSave.composer}` : ""}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeSaveModal}
                className="p-1 rounded-lg text-slate-400 hover:text-[#111C2D] hover:bg-slate-100 transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Listado de Colecciones Disponibles */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#0071BC] font-montserrat">
                {isEn ? "Select a destination collection:" : "Selecciona una colección de destino:"}
              </p>

              {/* Colección por defecto (Favoritos Generales) */}
              <button
                type="button"
                onClick={() => handleSelectCollection("default", isEn ? "General Favorites" : "Favoritos Generales")}
                className="w-full p-3 rounded-xl border border-black/5 hover:border-[#0071BC]/40 hover:bg-[#F0F3FF]/70 text-left transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-lg text-[#0071BC]">
                    star
                  </span>
                  <span className="text-xs font-bold text-[#111C2D] font-montserrat group-hover:text-[#0071BC]">
                    {isEn ? "General Favorites" : "Favoritos Generales"}
                  </span>
                </div>
                <span className="material-symbols-outlined text-sm text-slate-400 group-hover:text-[#0071BC] group-hover:translate-x-0.5 transition-transform">
                  chevron_right
                </span>
              </button>

              {collections.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => handleSelectCollection(col.id, col.name)}
                  className="w-full p-3 rounded-xl border border-black/5 hover:border-[#0071BC]/40 hover:bg-[#F0F3FF]/70 text-left transition flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-lg text-[#0071BC]">
                      {col.icon || "folder"}
                    </span>
                    <span className="text-xs font-bold text-[#111C2D] font-montserrat group-hover:text-[#0071BC]">
                      {col.name}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-sm text-slate-400 group-hover:text-[#0071BC] group-hover:translate-x-0.5 transition-transform">
                    chevron_right
                  </span>
                </button>
              ))}
            </div>

            {/* Crear Nueva Colección */}
            <div className="border-t border-black/5 pt-4">
              {isCreatingCollection ? (
                <form onSubmit={handleCreateAndSave} className="space-y-3">
                  <label className="block text-[11px] font-extrabold text-[#111C2D] uppercase font-montserrat">
                    {isEn ? "New Collection Name" : "Nombre de la Nueva Colección"}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      autoFocus
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      placeholder={isEn ? "e.g. Colombian Pasillos" : "Ej: Pasillos de Concierto"}
                      className="flex-1 px-3 py-2 bg-[#F0F3FF] border border-black/10 rounded-xl text-xs text-[#111C2D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071BC]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D] font-bold text-xs rounded-xl transition font-montserrat shrink-0 cursor-pointer"
                    >
                      {isEn ? "Save" : "Guardar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreatingCollection(false)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-[#4C4546] font-bold text-xs rounded-xl transition shrink-0 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCreatingCollection(true)}
                  className="w-full py-2.5 px-3 border border-dashed border-slate-300 hover:border-[#0071BC] hover:bg-[#F0F3FF]/40 rounded-xl text-xs font-bold font-montserrat text-[#0071BC] flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">create_new_folder</span>
                  <span>{isEn ? "+ Create New Collection" : "+ Crear Nueva Colección"}</span>
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </SavedScoresContext.Provider>
  );
}

export function useSavedScores() {
  const context = useContext(SavedScoresContext);
  if (!context) {
    throw new Error("useSavedScores debe usarse dentro de un SavedScoresProvider");
  }
  return context;
}
