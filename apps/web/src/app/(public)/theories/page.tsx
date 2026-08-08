import type { Metadata } from "next";
import { getArticlesByType } from "@/lib/data/articles";
import { ArticleGrid } from "@/components/article/article-grid";

export const metadata: Metadata = { title: "Theories" };
export const revalidate = 300;

export default async function TheoriesPage() {
  const articles = await getArticlesByType("theory", 24);
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-display text-2xl font-medium text-paper">Theories</h1>
      <ArticleGrid articles={articles} />
    </div>
  );
}
