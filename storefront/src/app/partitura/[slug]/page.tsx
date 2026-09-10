import { MOCK_SCORES, MOCK_COMPOSERS } from "@/lib/mock-data";
import PartituraDetailClient from "@/components/PartituraDetailClient";

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
const PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
  "pk_0372bd6f8b5885e7dcfd759e152d7a9db36782d5eaace95f07e707f2e9f68ce3";

async function fetchScoreDetails(slug: string) {
  try {
    const res = await fetch(`${MEDUSA_URL}/store/scores/${slug}`, {
      headers: {
        "x-publishable-api-key": PUBLISHABLE_KEY,
      },
      next: { revalidate: 15 },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.score) {
        return {
          id: data.score.id,
          title: data.score.title,
          slug: data.score.slug,
          genre: data.score.genre,
          difficulty: data.score.difficulty,
          priceCOP: data.score.price_cop || 45000,
          priceUSD: data.score.price_usd || 12,
          description: data.score.description_es,
          tonality: data.score.tonality,
          pages_count: data.score.pages_count,
          audio_sample_url: data.score.audio_sample_url,
          preview_images: data.score.preview_images || [],
          composer: data.score.composer,
        };
      }
    }
  } catch (err) {
    console.warn("Fallo conectando con API de partitura, usando datos locales:", err);
  }

  // Fallback a MOCK
  const mockScore = MOCK_SCORES.find((s) => s.id === slug) || MOCK_SCORES[0];
  const mockComposer = MOCK_COMPOSERS.find((c) => c.id === mockScore.composerId) || MOCK_COMPOSERS[0];

  return {
    id: mockScore.id,
    title: mockScore.title,
    category: mockScore.category,
    level: mockScore.level,
    priceCOP: mockScore.priceCOP,
    priceUSD: mockScore.priceUSD,
    description: mockScore.description,
    tonality: "Mi menor",
    pages_count: 8,
    audio_sample_url: mockScore.mediaUrl,
    preview_images: [],
    composer: {
      id: mockComposer.id,
      name: mockComposer.name,
      slug: mockComposer.slug,
      bio_es: mockComposer.fullBio,
    },
  };
}

export default async function PartituraDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const score = await fetchScoreDetails(slug);

  return <PartituraDetailClient score={score} />;
}
