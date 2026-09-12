import { redirect } from "next/navigation";

export default async function CategoriaRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolved = await params;
  const slug = resolved?.slug || "";
  redirect(`/tienda?categoria=${encodeURIComponent(slug)}`);
}
