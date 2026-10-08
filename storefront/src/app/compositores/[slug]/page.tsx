import { notFound } from "next/navigation";
import { getComposerBySlug } from "@/lib/api-client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CompositorDetailClient from "@/components/CompositorDetailClient";

export default async function CompositorDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const composer = await getComposerBySlug(slug);

  if (!composer) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F9F9FF] text-[#111C2D] flex flex-col font-inter selection:bg-[#FBB03B] selection:text-[#111C2D]">
      <Header activePage="compositores" />
      <CompositorDetailClient composer={composer} />
      <Footer />
    </div>
  );
}



