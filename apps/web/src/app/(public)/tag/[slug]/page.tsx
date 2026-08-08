import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getArticlesByTag } from "@/lib/data/articles";
import { ArticleGrid } from "@/components/article/article-grid";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

async function getTag(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("tags").select("name, slug").eq("slug", slug).single();
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTag(slug);
  if (!tag) return {};
  return { title: `#${tag.name}`, alternates: { canonical: `/tag/${tag.slug}` } };
}

export const revalidate = 300;

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tag = await getTag(slug);
  if (!tag) notFound();

  const articles = await getArticlesByTag(slug, 24);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: `#${tag.name}` }]} />
      <h1 className="font-display text-2xl font-medium text-paper">#{tag.name}</h1>
      <ArticleGrid articles={articles} />
    </div>
  );
}
