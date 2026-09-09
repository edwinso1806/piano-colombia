"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function MobileDrawer({ isOpen, onClose, title, children }: MobileDrawerProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Auto-cierre por cambio de ruta
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [pathname]);

  // 2. Cierre con tecla Escape (Esc) y control de overflow en body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const drawerContent = (
    <div className="fixed inset-0 z-[99999] lg:hidden font-inter">
      {/* Backdrop con desenfoque suave sobre todo el documento */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity z-[99998]"
      />

      {/* Panel Deslizable Lateral de Pantalla Completa */}
      <aside className="fixed inset-y-0 left-0 h-screen w-[320px] max-w-[85vw] bg-white shadow-2xl flex flex-col justify-between p-5 sm:p-6 z-[99999] border-r border-black/10">
        <div className="flex items-center justify-between border-b border-black/5 pb-4 mb-3 shrink-0">
          <span className="text-xs font-extrabold text-[#111C2D] uppercase tracking-widest font-montserrat">
            {title}
          </span>
          <button
            onClick={onClose}
            className="p-2 text-[#4C4546] hover:text-[#111C2D] rounded-xl hover:bg-[#F0F3FF] transition flex items-center justify-center cursor-pointer"
            aria-label="Cerrar menú"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-4">{children}</div>
      </aside>
    </div>
  );

  return createPortal(drawerContent, document.body);
}
