"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PartiturasRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/compositor/dashboard?tab=partituras");
  }, [router]);

  return (
    <div className="flex items-center justify-center p-12 text-center text-xs font-bold text-[#111C2D] font-montserrat">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-[#0071BC] border-t-transparent rounded-full animate-spin"></div>
        <span>Redirigiendo a mis partituras...</span>
      </div>
    </div>
  );
}
