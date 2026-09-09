"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { MOCK_SCORES, Score } from "@/lib/mock-data";

export interface CartItem {
  score: Score;
  quantity: number;
  licenseType: "personal" | "institutional";
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (score: Score, licenseType?: "personal" | "institutional") => void;
  removeFromCart: (scoreId: string) => void;
  updateQuantity: (scoreId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalCOP: number;
  totalUSD: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([
    {
      score: MOCK_SCORES[0], // Malvaloca - Luis A. Calvo
      quantity: 1,
      licenseType: "personal",
    },
    {
      score: MOCK_SCORES[1], // Bambuco en Fa Mayor - Pedro Morales Pino
      quantity: 1,
      licenseType: "personal",
    },
  ]);

  const addToCart = (score: Score, licenseType: "personal" | "institutional" = "personal") => {
    setCart((prev) => {
      const existing = prev.find((item) => item.score.id === score.id);
      if (existing) {
        return prev.map((item) =>
          item.score.id === score.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { score, quantity: 1, licenseType }];
    });
  };

  const removeFromCart = (scoreId: string) => {
    setCart((prev) => prev.filter((item) => item.score.id !== scoreId));
  };

  const updateQuantity = (scoreId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(scoreId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.score.id === scoreId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCOP = cart.reduce((sum, item) => sum + item.score.priceCOP * item.quantity, 0);
  const totalUSD = cart.reduce((sum, item) => sum + item.score.priceUSD * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalCOP,
        totalUSD,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe ser usado dentro de un CartProvider");
  }
  return context;
};
