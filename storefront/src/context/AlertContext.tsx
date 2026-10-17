"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";

export type AlertType = "success" | "error" | "warning" | "info";

export interface ToastAlert {
  id: string;
  type: AlertType;
  title?: string;
  message: string;
  duration?: number; // ms, default 5000. 0 means persistent until closed
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  danger?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface AlertContextType {
  showAlert: (options: Omit<ToastAlert, "id">) => string;
  showToast: (message: string, type?: AlertType, duration?: number) => string;
  showSuccess: (message: string, title?: string) => string;
  showError: (message: string, title?: string) => string;
  showWarning: (message: string, title?: string) => string;
  showInfo: (message: string, title?: string) => string;
  closeAlert: (id: string) => void;
  showConfirm: (options: ConfirmDialogOptions) => void;
  closeConfirm: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastAlert[]>([]);
  const toastsRef = useRef<ToastAlert[]>([]);
  toastsRef.current = toasts;

  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogOptions | null>(null);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  const closeAlert = useCallback((id: string) => {
    const target = toastsRef.current.find((t) => t.id === id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (target?.onClose) {
      setTimeout(() => {
        try {
          target.onClose?.();
        } catch (err) {
          console.error("Error executing toast onClose:", err);
        }
      }, 0);
    }
  }, []);

  const showAlert = useCallback(
    ({ type, title, message, duration = 5000, action, onClose }: Omit<ToastAlert, "id">) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastAlert = { id, type, title, message, duration, action, onClose };

      setToasts((prev) => [...prev, newToast]);

      if (duration && duration > 0) {
        setTimeout(() => {
          closeAlert(id);
        }, duration);
      }

      return id;
    },
    [closeAlert]
  );

  const showToast = useCallback(
    (message: string, type: AlertType = "info", duration = 4500) => {
      return showAlert({ message, type, duration });
    },
    [showAlert]
  );

  const showSuccess = useCallback(
    (message: string, title?: string) => {
      return showAlert({ message, title: title || "Éxito", type: "success" });
    },
    [showAlert]
  );

  const showError = useCallback(
    (message: string, title?: string) => {
      return showAlert({ message, title: title || "Error", type: "error", duration: 7000 });
    },
    [showAlert]
  );

  const showWarning = useCallback(
    (message: string, title?: string) => {
      return showAlert({ message, title: title || "Atención", type: "warning", duration: 6000 });
    },
    [showAlert]
  );

  const showInfo = useCallback(
    (message: string, title?: string) => {
      return showAlert({ message, title: title || "Información", type: "info" });
    },
    [showAlert]
  );

  const showConfirm = useCallback((options: ConfirmDialogOptions) => {
    setConfirmDialog(options);
    setIsConfirmLoading(false);
  }, []);

  const closeConfirm = useCallback(() => {
    if (confirmDialog?.onCancel) {
      confirmDialog.onCancel();
    }
    setConfirmDialog(null);
    setIsConfirmLoading(false);
  }, [confirmDialog]);

  const handleConfirmAction = async () => {
    if (!confirmDialog) return;
    try {
      setIsConfirmLoading(true);
      await confirmDialog.onConfirm();
      setConfirmDialog(null);
    } catch (err) {
      console.error("Error executing confirm action:", err);
    } finally {
      setIsConfirmLoading(false);
    }
  };

  return (
    <AlertContext.Provider
      value={{
        showAlert,
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        closeAlert,
        showConfirm,
        closeConfirm,
      }}
    >
      {children}

      {/* ========================================================
          CONTENEDOR GLOBAL DE TOASTS / NOTIFICACIONES
          ======================================================== */}
      <div
        aria-live="polite"
        className="fixed top-5 right-5 z-[99999] flex flex-col gap-3 max-w-md w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => {
          const isSuccess = toast.type === "success";
          const isError = toast.type === "error";
          const isWarning = toast.type === "warning";

          const iconName = isSuccess
            ? "check_circle"
            : isError
            ? "error"
            : isWarning
            ? "warning"
            : "info";

          const borderBgClass = isSuccess
            ? "bg-white border-emerald-500 text-[#111C2D]"
            : isError
            ? "bg-white border-[#8B2522] text-[#111C2D]"
            : isWarning
            ? "bg-white border-[#FBB03B] text-[#111C2D]"
            : "bg-white border-[#0071BC] text-[#111C2D]";

          const iconColorClass = isSuccess
            ? "text-emerald-600 bg-emerald-50"
            : isError
            ? "text-[#8B2522] bg-rose-50"
            : isWarning
            ? "text-amber-600 bg-amber-50"
            : "text-[#0071BC] bg-[#F0F3FF]";

          const barColorClass = isSuccess
            ? "bg-emerald-500"
            : isError
            ? "bg-[#8B2522]"
            : isWarning
            ? "bg-[#FBB03B]"
            : "bg-[#0071BC]";

          return (
            <div
              key={toast.id}
              role="alert"
              className={`pointer-events-auto rounded-2xl border-l-4 shadow-[0_15px_40px_rgba(0,0,0,0.12)] p-4 sm:p-5 flex items-start gap-3.5 transition-all duration-300 animate-in slide-in-from-top-3 fade-in relative overflow-hidden backdrop-blur-md ${borderBgClass}`}
            >
              {/* Icono de Estado */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-black/5 ${iconColorClass}`}
              >
                <span className="material-symbols-outlined text-xl">{iconName}</span>
              </div>

              {/* Mensaje & Título */}
              <div className="flex-1 min-w-0 pr-6">
                {toast.title && (
                  <h4 className="text-xs font-black uppercase tracking-wider font-montserrat mb-1 text-[#111C2D]">
                    {toast.title}
                  </h4>
                )}
                <p className="text-xs text-[#4C4546] font-inter leading-relaxed break-words font-medium">
                  {toast.message}
                </p>

                {toast.action && (
                  <button
                    type="button"
                    onClick={() => {
                      toast.action?.onClick();
                      closeAlert(toast.id);
                    }}
                    className="mt-2.5 px-3 py-1 bg-[#111C2D] text-white rounded-lg text-[11px] font-bold font-montserrat hover:bg-black transition cursor-pointer"
                  >
                    {toast.action.label}
                  </button>
                )}
              </div>

              {/* Botón Cerrar */}
              <button
                type="button"
                onClick={() => closeAlert(toast.id)}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-[#111C2D] hover:bg-slate-100 transition cursor-pointer"
                aria-label="Cerrar notificación"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>

              {/* Barra de progreso de tiempo si es auto-cierre */}
              {toast.duration && toast.duration > 0 && (
                <div
                  className={`absolute bottom-0 left-0 h-1 opacity-75 ${barColorClass}`}
                  style={{
                    animation: `shrinkWidth ${toast.duration}ms linear forwards`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ========================================================
          MODAL GLOBAL DE CONFIRMACIÓN (REEMPLAZA confirm() y alert())
          ======================================================== */}
      {confirmDialog && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-black/10 shadow-[0_25px_60px_rgba(0,0,0,0.25)] space-y-6 text-center animate-in zoom-in-95 duration-200">
            {/* Icono del Modal */}
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto border ${
                confirmDialog.type === "danger" || confirmDialog.danger
                  ? "bg-rose-50 text-[#8B2522] border-rose-200"
                  : confirmDialog.type === "warning"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-[#F0F3FF] text-[#0071BC] border-[#0071BC]/20"
              }`}
            >
              <span className="material-symbols-outlined text-3xl">
                {confirmDialog.type === "danger" || confirmDialog.danger
                  ? "delete_forever"
                  : confirmDialog.type === "warning"
                  ? "warning"
                  : "help"}
              </span>
            </div>

            {/* Título & Mensaje */}
            <div className="space-y-2">
              <h3 className="text-lg font-black font-montserrat text-[#111C2D] tracking-tight">
                {confirmDialog.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#4C4546] font-inter leading-relaxed">
                {confirmDialog.message}
              </p>
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={closeConfirm}
                disabled={isConfirmLoading}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-[#111C2D] font-bold text-xs rounded-xl transition font-montserrat cursor-pointer disabled:opacity-50"
              >
                {confirmDialog.cancelText || "Cancelar"}
              </button>

              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={isConfirmLoading}
                className={`flex-1 py-3 px-4 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md font-montserrat flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                  confirmDialog.type === "danger" || confirmDialog.danger
                    ? "bg-[#8B2522] hover:bg-[#6c1c1a]"
                    : confirmDialog.type === "warning"
                    ? "bg-[#FBB03B] hover:bg-[#e09b2e] text-[#111C2D]"
                    : "bg-[#0071BC] hover:bg-[#005a96]"
                }`}
              >
                {isConfirmLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>{confirmDialog.confirmText || "Confirmar"}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert debe ser utilizado dentro de un AlertProvider");
  }
  return context;
}
