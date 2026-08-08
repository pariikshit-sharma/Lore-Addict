import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getArticlesByCategory } from "@/lib/data/articles";
import { ArticleGrid } from "@/components/article/article-grid";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

async function getCategory(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("name, slug, description")
    .eq("slug", slug)
    .single();
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description ?? `${category.name} news, reviews, and theories.`,
    alternates: { canonical: `/category/${category.slug}` },
  };
}

export const revalidate = 300;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  const articles = await getArticlesByCategory(slug, 24);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: category.name }]} />
      <div>
        <h1 className="font-display text-2xl font-medium text-paper">{category.name}</h1>
        {category.description && <p className="mt-1 text-sm text-mute">{category.description}</p>}
      </div>
      <ArticleGrid articles={articles} />
    </div>
  );
}
