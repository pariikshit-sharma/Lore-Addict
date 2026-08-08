import { ArticleGrid } from "./article-grid";
import type { FeedArticle } from "@/lib/data/articles";

export function RelatedArticles({ articles }: { articles: FeedArticle[] }) {
  if (articles.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-xl font-medium text-paper">
        Related
      </h2>
      <ArticleGrid articles={articles} />
    </section>
  );
}
