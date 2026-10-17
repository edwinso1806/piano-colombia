"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { validateSessionApi } from "@/lib/api-client";

export interface CustomerUser {
  id?: string;
  email: string;
  fullName: string;
  phone?: string;
  taxId?: string;
  token?: string;
  expires_at?: number;
  logged_at?: number;
  last_active_at?: number;
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
  token?: string;
  expires_at?: number;
  logged_at?: number;
  last_active_at?: number;
}

export interface AdminUser {
  email: string;
  role: "admin" | "editor" | "moderator" | "payouts";
  name: string;
  token?: string;
  expires_at?: number;
  logged_at?: number;
  last_active_at?: number;
}

export interface ExpiredSessionNotice {
  role: "customer" | "composer" | "admin";
  title: string;
  message: string;
  reason?: string;
  loginUrl: string;
}

export interface SessionLoginOptions {
  token?: string;
  rememberMe?: boolean;
  expiresInMs?: number;
  expires_at?: number;
}

interface AuthContextType {
  customer: CustomerUser | null;
  composer: ComposerUser | null;
  admin: AdminUser | null;
  isLoaded: boolean;
  expiredSessionNotice: ExpiredSessionNotice | null;
  clearExpiredSessionNotice: () => void;
  loginCustomer: (data: CustomerUser, options?: SessionLoginOptions) => void;
  logoutCustomer: (options?: { silent?: boolean; reason?: string }) => void;
  loginComposer: (data: ComposerUser, options?: SessionLoginOptions) => void;
  logoutComposer: (options?: { silent?: boolean; reason?: string }) => void;
  loginAdmin: (data: AdminUser, options?: SessionLoginOptions) => void;
  logoutAdmin: (options?: { silent?: boolean; reason?: string }) => void;
  validateCurrentSessions: () => Promise<void>;
  isSessionValid: (role: "customer" | "composer" | "admin") => boolean;
  getSessionRemainingMs: (role: "customer" | "composer" | "admin") => number;
}

// Configuración de Tiempos de Expiración (TTL) y Límites de Inactividad
const TTL_CONFIG = {
  ADMIN: {
    DEFAULT: 8 * 60 * 60 * 1000,       // 8 Horas de sesión administrativa
    INACTIVITY: 2 * 60 * 60 * 1000,    // 2 Horas de inactividad
  },
  COMPOSER: {
    DEFAULT: 24 * 60 * 60 * 1000,      // 24 Horas estándar
    REMEMBER: 7 * 24 * 60 * 60 * 1000, // 7 Días con recordar sesión
    INACTIVITY: 12 * 60 * 60 * 1000,   // 12 Horas de inactividad
  },
  CUSTOMER: {
    DEFAULT: 7 * 24 * 60 * 60 * 1000,  // 7 Días estándar
    REMEMBER: 30 * 24 * 60 * 60 * 1000,// 30 Días con recordar sesión
    INACTIVITY: 7 * 24 * 60 * 60 * 1000,
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [composer, setComposer] = useState<ComposerUser | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [expiredSessionNotice, setExpiredSessionNotice] = useState<ExpiredSessionNotice | null>(null);

  const lastActivityUpdateRef = useRef<number>(Date.now());

  // 1. Cargar sesiones guardadas desde localStorage y validar expiración inicial
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const now = Date.now();

      // Cliente
      const savedCustomerStr = localStorage.getItem("piano_colombia_customer");
      if (savedCustomerStr) {
        try {
          const parsed = JSON.parse(savedCustomerStr);
          if (parsed && typeof parsed === "object") {
            if (parsed.expires_at && now > parsed.expires_at) {
              localStorage.removeItem("piano_colombia_customer");
            } else {
              // Asignar expires_at si es una sesión heredada sin expiración
              if (!parsed.expires_at) {
                parsed.expires_at = now + TTL_CONFIG.CUSTOMER.DEFAULT;
                parsed.logged_at = now;
                parsed.last_active_at = now;
                localStorage.setItem("piano_colombia_customer", JSON.stringify(parsed));
              }
              setCustomer(parsed);
            }
          }
        } catch (e) {
          localStorage.removeItem("piano_colombia_customer");
        }
      }

      // Compositor
      const savedComposerStr = localStorage.getItem("piano_colombia_composer");
      if (savedComposerStr) {
        try {
          const parsed = JSON.parse(savedComposerStr);
          if (parsed && typeof parsed === "object") {
            if (parsed.expires_at && now > parsed.expires_at) {
              localStorage.removeItem("piano_colombia_composer");
            } else {
              if (!parsed.expires_at) {
                parsed.expires_at = now + TTL_CONFIG.COMPOSER.DEFAULT;
                parsed.logged_at = now;
                parsed.last_active_at = now;
                localStorage.setItem("piano_colombia_composer", JSON.stringify(parsed));
              }
              setComposer(parsed);
            }
          }
        } catch (e) {
          localStorage.removeItem("piano_colombia_composer");
        }
      }

      // Administrador
      const savedAdminStr = localStorage.getItem("piano_colombia_admin_user");
      if (savedAdminStr) {
        try {
          const parsed = JSON.parse(savedAdminStr);
          if (parsed && typeof parsed === "object") {
            if (parsed.expires_at && now > parsed.expires_at) {
              localStorage.removeItem("piano_colombia_admin_user");
            } else {
              if (!parsed.expires_at) {
                parsed.expires_at = now + TTL_CONFIG.ADMIN.DEFAULT;
                parsed.logged_at = now;
                parsed.last_active_at = now;
                localStorage.setItem("piano_colombia_admin_user", JSON.stringify(parsed));
              }
              setAdmin(parsed);
            }
          }
        } catch (e) {
          localStorage.removeItem("piano_colombia_admin_user");
        }
      }
    } catch (err) {
      console.error("Error cargando sesiones desde localStorage:", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // 2. Métodos de Login con sellado de tiempo de expiración
  const loginCustomer = useCallback((data: CustomerUser, options?: SessionLoginOptions) => {
    const now = Date.now();
    const duration = options?.expiresInMs ||
      (options?.rememberMe ? TTL_CONFIG.CUSTOMER.REMEMBER : TTL_CONFIG.CUSTOMER.DEFAULT);
    const expires_at = options?.expires_at || (data.expires_at || (now + duration));

    const enriched: CustomerUser = {
      ...data,
      token: options?.token || data.token,
      logged_at: data.logged_at || now,
      expires_at,
      last_active_at: now,
    };

    setCustomer(enriched);
    if (typeof window !== "undefined") {
      localStorage.setItem("piano_colombia_customer", JSON.stringify(enriched));
    }
  }, []);

  const logoutCustomer = useCallback((options?: { silent?: boolean; reason?: string }) => {
    setCustomer(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("piano_colombia_customer");
      if (!options?.silent && options?.reason === "expired") {
        setExpiredSessionNotice({
          role: "customer",
          title: "Sesión de Cliente Expirada",
          message: "Tu sesión ha expirado por límite de tiempo o inactividad. Se ha cerrado automáticamente por seguridad.",
          reason: options.reason,
          loginUrl: "/login?expired=true",
        });
      }
    }
  }, []);

  const loginComposer = useCallback((data: ComposerUser, options?: SessionLoginOptions) => {
    const now = Date.now();
    const duration = options?.expiresInMs ||
      (options?.rememberMe ? TTL_CONFIG.COMPOSER.REMEMBER : TTL_CONFIG.COMPOSER.DEFAULT);
    const expires_at = options?.expires_at || (data.expires_at || (now + duration));

    const enriched: ComposerUser = {
      ...data,
      token: options?.token || data.token,
      logged_at: data.logged_at || now,
      expires_at,
      last_active_at: now,
    };

    setComposer(enriched);
    if (typeof window !== "undefined") {
      localStorage.setItem("piano_colombia_composer", JSON.stringify(enriched));
    }
  }, []);

  const logoutComposer = useCallback((options?: { silent?: boolean; reason?: string }) => {
    setComposer(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("piano_colombia_composer");
      if (!options?.silent && options?.reason === "expired") {
        setExpiredSessionNotice({
          role: "composer",
          title: "Sesión de Compositor Expirada",
          message: "Tu sesión en el Portal del Compositor ha expirado por tiempo límite. Por favor inicia sesión nuevamente.",
          reason: options.reason,
          loginUrl: "/compositor/login?expired=true",
        });
      }
    }
  }, []);

  const loginAdmin = useCallback((data: AdminUser, options?: SessionLoginOptions) => {
    const now = Date.now();
    const duration = options?.expiresInMs || TTL_CONFIG.ADMIN.DEFAULT; // Admin siempre 8h
    const expires_at = options?.expires_at || (data.expires_at || (now + duration));

    const enriched: AdminUser = {
      ...data,
      token: options?.token || data.token,
      logged_at: data.logged_at || now,
      expires_at,
      last_active_at: now,
    };

    setAdmin(enriched);
    if (typeof window !== "undefined") {
      localStorage.setItem("piano_colombia_admin_user", JSON.stringify(enriched));
    }
  }, []);

  const logoutAdmin = useCallback((options?: { silent?: boolean; reason?: string }) => {
    setAdmin(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("piano_colombia_admin_user");
      if (!options?.silent && options?.reason === "expired") {
        setExpiredSessionNotice({
          role: "admin",
          title: "Sesión Administrativa Expirada",
          message: "Por políticas de seguridad institucional (8 horas), tu sesión de administración ha concluido.",
          reason: options.reason,
          loginUrl: "/admin/login?expired=true",
        });
      }
    }
  }, []);

  // 3. Verificadores de Validez de Sesión
  const isSessionValid = useCallback((role: "customer" | "composer" | "admin"): boolean => {
    const now = Date.now();
    if (role === "composer") {
      return Boolean(composer && composer.expires_at && composer.expires_at > now);
    }
    if (role === "customer") {
      return Boolean(customer && customer.expires_at && customer.expires_at > now);
    }
    if (role === "admin") {
      return Boolean(admin && admin.expires_at && admin.expires_at > now);
    }
    return false;
  }, [customer, composer, admin]);

  const getSessionRemainingMs = useCallback((role: "customer" | "composer" | "admin"): number => {
    const now = Date.now();
    if (role === "composer" && composer?.expires_at) {
      return Math.max(0, composer.expires_at - now);
    }
    if (role === "customer" && customer?.expires_at) {
      return Math.max(0, customer.expires_at - now);
    }
    if (role === "admin" && admin?.expires_at) {
      return Math.max(0, admin.expires_at - now);
    }
    return 0;
  }, [customer, composer, admin]);

  // 4. Registro de Actividad del Usuario (Hearbeat/Sliding)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleUserActivity = () => {
      const now = Date.now();
      // Limitar escritura a una vez cada 45 segundos
      if (now - lastActivityUpdateRef.current < 45000) return;
      lastActivityUpdateRef.current = now;

      if (composer) {
        const updated = { ...composer, last_active_at: now };
        setComposer(updated);
        localStorage.setItem("piano_colombia_composer", JSON.stringify(updated));
      }
      if (customer) {
        const updated = { ...customer, last_active_at: now };
        setCustomer(updated);
        localStorage.setItem("piano_colombia_customer", JSON.stringify(updated));
      }
      if (admin) {
        const updated = { ...admin, last_active_at: now };
        setAdmin(updated);
        localStorage.setItem("piano_colombia_admin_user", JSON.stringify(updated));
      }
    };

    window.addEventListener("click", handleUserActivity, { passive: true });
    window.addEventListener("keydown", handleUserActivity, { passive: true });
    window.addEventListener("touchstart", handleUserActivity, { passive: true });

    return () => {
      window.removeEventListener("click", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("touchstart", handleUserActivity);
    };
  }, [composer, customer, admin]);

  // 5. Vigilante de Expiración en Tiempo Real (Heartbeat cada 10 segundos)
  useEffect(() => {
    if (typeof window === "undefined" || !isLoaded) return;

    const checkExpirationInterval = setInterval(() => {
      const now = Date.now();

      // Verificar Administrador
      if (admin) {
        const isExpired = admin.expires_at ? now > admin.expires_at : false;
        const isInactive = admin.last_active_at ? (now - admin.last_active_at > TTL_CONFIG.ADMIN.INACTIVITY) : false;

        if (isExpired || isInactive) {
          console.warn("⚠️ [AUTH] Sesión administrativa expirada automáticamente.");
          logoutAdmin({ reason: "expired" });

          if (window.location.pathname.startsWith("/admin") && !window.location.pathname.includes("/admin/login")) {
            window.location.href = `/admin/login?expired=true&redirect=${encodeURIComponent(window.location.pathname)}`;
          }
        }
      }

      // Verificar Compositor
      if (composer) {
        const isExpired = composer.expires_at ? now > composer.expires_at : false;
        const isInactive = composer.last_active_at ? (now - composer.last_active_at > TTL_CONFIG.COMPOSER.INACTIVITY) : false;

        if (isExpired || isInactive) {
          console.warn("⚠️ [AUTH] Sesión de compositor expirada automáticamente.");
          logoutComposer({ reason: "expired" });

          if (window.location.pathname.startsWith("/compositor/dashboard")) {
            window.location.href = `/compositor/login?expired=true`;
          }
        }
      }

      // Verificar Cliente
      if (customer) {
        const isExpired = customer.expires_at ? now > customer.expires_at : false;
        if (isExpired) {
          console.warn("⚠️ [AUTH] Sesión de cliente expirada automáticamente.");
          logoutCustomer({ reason: "expired" });

          if (window.location.pathname.startsWith("/mi-cuenta")) {
            window.location.href = `/login?expired=true`;
          }
        }
      }
    }, 10000);

    return () => clearInterval(checkExpirationInterval);
  }, [admin, composer, customer, isLoaded, logoutAdmin, logoutComposer, logoutCustomer]);

  // 6. Validación Remota contra el Backend (Al volver al tab / foco de ventana)
  const validateCurrentSessions = useCallback(async () => {
    if (typeof window === "undefined") return;

    // Validar Compositor
    if (composer && (composer.email || composer.id)) {
      try {
        const res = await validateSessionApi({
          role: "composer",
          email: composer.email,
          id: composer.id,
          token: composer.token,
        });

        if (res && res.valid === false) {
          console.warn("❌ [AUTH] Validación remota de compositor fallida:", res.reason);
          logoutComposer({ reason: "expired" });
          setExpiredSessionNotice({
            role: "composer",
            title: res.suspended ? "Cuenta de Compositor Suspendida" : "Sesión de Compositor Inválida",
            message: res.reason || "Tu sesión de compositor no es válida o ha caducado en el servidor.",
            reason: res.reason,
            loginUrl: "/compositor/login?expired=true",
          });
          if (window.location.pathname.startsWith("/compositor/dashboard")) {
            window.location.href = "/compositor/login?expired=true";
          }
        } else if (res && res.valid && res.composer) {
          // Mantener sincronizado el estado (ej. si fue aprobado o rechazado)
          if (
            res.composer.status !== composer.status ||
            res.composer.rejection_reason !== composer.rejection_reason
          ) {
            loginComposer({
              ...composer,
              ...res.composer,
            });
          }
        }
      } catch (err) {
        console.warn("Error en validación remota de compositor:", err);
      }
    }

    // Validar Administrador
    if (admin && admin.email) {
      try {
        const res = await validateSessionApi({
          role: "admin",
          email: admin.email,
          token: admin.token,
        });

        if (res && res.valid === false) {
          console.warn("❌ [AUTH] Validación remota de administrador fallida:", res.reason);
          logoutAdmin({ reason: "expired" });
          setExpiredSessionNotice({
            role: "admin",
            title: "Sesión Administrativa Revocada",
            message: res.reason || "Tu sesión administrativa ha expirado o tu usuario fue desactivado.",
            reason: res.reason,
            loginUrl: "/admin/login?expired=true",
          });
          if (window.location.pathname.startsWith("/admin") && !window.location.pathname.includes("/admin/login")) {
            window.location.href = "/admin/login?expired=true";
          }
        }
      } catch (err) {
        console.warn("Error en validación remota de administrador:", err);
      }
    }

    // Validar Cliente
    if (customer && customer.email) {
      try {
        const res = await validateSessionApi({
          role: "customer",
          email: customer.email,
          id: customer.id,
          token: customer.token,
        });

        if (res && res.valid === false) {
          logoutCustomer({ reason: "expired" });
        }
      } catch (err) {
        console.warn("Error en validación remota de cliente:", err);
      }
    }
  }, [composer, admin, customer, logoutComposer, logoutAdmin, logoutCustomer, loginComposer]);

  // Validar al reenfocar la ventana del navegador
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onFocus = () => {
      validateCurrentSessions();
    };

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [validateCurrentSessions]);

  const clearExpiredSessionNotice = useCallback(() => {
    setExpiredSessionNotice(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        customer,
        composer,
        admin,
        isLoaded,
        expiredSessionNotice,
        clearExpiredSessionNotice,
        loginCustomer,
        logoutCustomer,
        loginComposer,
        logoutComposer,
        loginAdmin,
        logoutAdmin,
        validateCurrentSessions,
        isSessionValid,
        getSessionRemainingMs,
      }}
    >
      {children}

      {/* Modal / Diálogo Automático de Sesión Expirada */}
      {expiredSessionNotice && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-black/10 text-center font-montserrat space-y-5 animate-in zoom-in-95 duration-200">
            {/* Ícono de Alerta de Expiración */}
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-3xl">lock_clock</span>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-amber-600 bg-amber-100/60 px-3 py-1 rounded-full border border-amber-300/50">
                Aviso de Seguridad
              </span>
              <h3 className="text-xl font-extrabold text-[#111C2D]">
                {expiredSessionNotice.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                {expiredSessionNotice.message}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const url = expiredSessionNotice.loginUrl;
                  clearExpiredSessionNotice();
                  if (typeof window !== "undefined") {
                    window.location.href = url;
                  }
                }}
                className="w-full py-3 px-4 bg-[#FBB03B] hover:bg-[#e09b2d] text-[#111C2D] font-black text-xs uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">login</span>
                <span>Iniciar Sesión de Nuevo</span>
              </button>
              <button
                type="button"
                onClick={clearExpiredSessionNotice}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
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
