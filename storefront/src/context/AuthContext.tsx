"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CustomerUser {
  id?: string;
  email: string;
  fullName: string;
  phone?: string;
  taxId?: string;
}

export interface ComposerUser {
  id?: string;
  artistic_name: string;
  email: string;
  slug?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  region?: string;
  status?: string;
  photo_url?: string;
  bio_es?: string;
  bio_en?: string;
  rejection_reason?: string;
  bankAccount?: any;
  bank_account?: any;
}

export interface AdminUser {
  email: string;
  role: "admin" | "editor" | "moderator" | "payouts";
  name: string;
}

interface AuthContextType {
  customer: CustomerUser | null;
  composer: ComposerUser | null;
  admin: AdminUser | null;
  isLoaded: boolean;
  loginCustomer: (data: CustomerUser) => void;
  logoutCustomer: () => void;
  loginComposer: (data: ComposerUser) => void;
  logoutComposer: () => void;
  loginAdmin: (data: AdminUser) => void;
  logoutAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [composer, setComposer] = useState<ComposerUser | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedCustomer = localStorage.getItem("piano_colombia_customer");
        if (savedCustomer) {
          setCustomer(JSON.parse(savedCustomer));
        }

        const savedComposer = localStorage.getItem("piano_colombia_composer");
        if (savedComposer) {
          setComposer(JSON.parse(savedComposer));
        }

        const savedAdmin = localStorage.getItem("piano_colombia_admin_user");
        if (savedAdmin) {
          setAdmin(JSON.parse(savedAdmin));
        }
      } catch (err) {
        console.error("Error loading auth sessions from localStorage:", err);
      } finally {
        setIsLoaded(true);
      }
    }
  }, []);

  const loginCustomer = (data: CustomerUser) => {
    setCustomer(data);
    if (typeof window !== "undefined") {
      localStorage.setItem("piano_colombia_customer", JSON.stringify(data));
    }
  };

  const logoutCustomer = () => {
    setCustomer(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("piano_colombia_customer");
    }
  };

  const loginComposer = (data: ComposerUser) => {
    setComposer(data);
    if (typeof window !== "undefined") {
      localStorage.setItem("piano_colombia_composer", JSON.stringify(data));
    }
  };

  const logoutComposer = () => {
    setComposer(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("piano_colombia_composer");
    }
  };

  const loginAdmin = (data: AdminUser) => {
    setAdmin(data);
    if (typeof window !== "undefined") {
      localStorage.setItem("piano_colombia_admin_user", JSON.stringify(data));
    }
  };

  const logoutAdmin = () => {
    setAdmin(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("piano_colombia_admin_user");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        composer,
        admin,
        isLoaded,
        loginCustomer,
        logoutCustomer,
        loginComposer,
        logoutComposer,
        loginAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
