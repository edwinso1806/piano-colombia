"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

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

  const [savedScores, setSavedScores] = useState<SavedScore[]>([]);
  const [collections, setCollections] = useState<ScoreCollection[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

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
      }}
    >
      {children}
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
