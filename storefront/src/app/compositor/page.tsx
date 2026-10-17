"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function CompositorIndexPage() {
  const router = useRouter();
  const { composer, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    if (composer && (composer.email || composer.id)) {
      const target = composer.status === "APPROVED" ? "/compositor/dashboard" : "/compositor/dashboard/perfil";
      router.replace(target);
    } else {
      router.replace("/compositor/login");
    }
  }, [composer, isLoaded, router]);

  return (
    <div className="min-h-screen bg-[#F9F9FF] flex flex-col items-center justify-center p-6 text-center font-montserrat">
      <div className="w-10 h-10 border-4 border-[#FBB03B] border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-bold text-[#111C2D]">Cargando Portal de Compositores...</p>
    </div>
  );
}
