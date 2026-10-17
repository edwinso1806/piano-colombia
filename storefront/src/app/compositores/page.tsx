import { getComposersList } from "@/lib/api-client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CompositoresClient from "@/components/CompositoresClient";

export default async function CompositoresPage() {
  const liveComposers = await getComposersList();
  
  // Normalizar datos de Medusa
  const composers = Array.isArray(liveComposers)
    ? liveComposers.map((c: any) => ({
        id: c.id,
        name: c.artistic_name || `${c.first_name || ""} ${c.last_name || ""}`.trim() || "Compositor Colombiano",
        slug: c.slug,
        country: c.country || "Colombia",
        region: c.region || c.department || "",
        city: c.city || c.region || "Colombia",
        photoUrl: c.photo_url || null,
        shortBio: c.bio_es ? c.bio_es.substring(0, 120) + "..." : "Compositor colombiano para piano.",
        shortBioEn: c.bio_en ? c.bio_en.substring(0, 120) + "..." : "Colombian piano composer.",
        scoreCount: c.scoreCount ?? c.approved_scores_count ?? 0,
        isFeatured: c.is_featured,
      }))
    : [];

  return (
    <div className="min-h-screen bg-[#F9F9FF] text-[#111C2D] flex flex-col font-inter selection:bg-[#FBB03B] selection:text-[#111C2D]">
      <Header activePage="compositores" />
      <CompositoresClient initialComposers={composers} />
      <Footer />
    </div>
  );
}



