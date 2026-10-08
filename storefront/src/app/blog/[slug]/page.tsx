import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getStoreBlogPost } from "@/lib/api-client";
import BlogDetailClient from "@/components/BlogDetailClient";

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getStoreBlogPost(slug);

  return (
    <div className="min-h-screen bg-[#F9F9FF] text-[#111C2D] flex flex-col font-inter selection:bg-[#FBB03B] selection:text-[#111C2D]">
      <Header activePage="blog" />
      <BlogDetailClient post={post} />
      <Footer />
    </div>
  );
}

