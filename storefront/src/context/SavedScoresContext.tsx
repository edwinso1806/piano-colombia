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

interface SavedScoresContextType {
  savedScores: SavedScore[];
  collections: ScoreCollection[];
  isLoaded: boolean;
  isSaved: (slugOrId: string) => boolean;
  toggleSaveScore: (score: Omit<SavedScore, "savedAt">, collectionId?: string) => boolean;
  removeSavedScore: (slugOrId: string) => void;
  createCollection: (name: string, description?: string, icon?: string) => ScoreCollection;
  deleteCollection: (id: string) => void;
  moveScoreToCollection: (slugOrId: string, collectionId?: string) => void;
}

const SavedScoresContext = createContext<SavedScoresContextType | undefined>(undefined);

export function SavedScoresProvider({ children }: { children: React.ReactNode }) {
  const { customer } = useAuth();
  const [savedScores, setSavedScores] = useState<SavedScore[]>([]);
  const [collections, setCollections] = useState<ScoreCollection[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const getStorageKey = () => {
    return customer?.email
      ? `piano_colombia_saved_scores_${customer.email.toLowerCase().trim()}`
      : "piano_colombia_saved_scores_guest";
  };

  const getCollectionsKey = () => {
    return customer?.email
      ? `piano_colombia_collections_${customer.email.toLowerCase().trim()}`
      : "piano_colombia_collections_guest";
  };

  // Load saved scores & collections when customer session changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const scoresKey = getStorageKey();
        const rawScores = localStorage.getItem(scoresKey);
        if (rawScores) {
          setSavedScores(JSON.parse(rawScores));
        } else {
          setSavedScores([]);
        }

        const colsKey = getCollectionsKey();
        const rawCols = localStorage.getItem(colsKey);
        if (rawCols) {
          setCollections(JSON.parse(rawCols));
        } else {
          setCollections([]);
        }
      } catch (err) {
        console.error("Error loading saved scores from localStorage:", err);
      } finally {
        setIsLoaded(true);
      }
    }
  }, [customer?.email]);

  const saveToStorage = (newScores: SavedScore[]) => {
    setSavedScores(newScores);
    if (typeof window !== "undefined") {
      localStorage.setItem(getStorageKey(), JSON.stringify(newScores));
    }
  };

  const saveCollectionsToStorage = (newCollections: ScoreCollection[]) => {
    setCollections(newCollections);
    if (typeof window !== "undefined") {
      localStorage.setItem(getCollectionsKey(), JSON.stringify(newCollections));
    }
  };

  const isSaved = (slugOrId: string) => {
    return savedScores.some((s) => s.slug === slugOrId || s.id === slugOrId);
  };

  const toggleSaveScore = (score: Omit<SavedScore, "savedAt">, collectionId?: string): boolean => {
    const exists = isSaved(score.slug || score.id);
    if (exists) {
      const updated = savedScores.filter((s) => s.slug !== score.slug && s.id !== score.id);
      saveToStorage(updated);
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

  const removeSavedScore = (slugOrId: string) => {
    const updated = savedScores.filter((s) => s.slug !== slugOrId && s.id !== slugOrId);
    saveToStorage(updated);
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

  return (
    <SavedScoresContext.Provider
      value={{
        savedScores,
        collections,
        isLoaded,
        isSaved,
        toggleSaveScore,
        removeSavedScore,
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
