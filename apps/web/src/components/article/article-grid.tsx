import { ArticleCard } from "./article-card";
import { EmptyState } from "@/components/ui/empty-state";
import type { FeedArticle } from "@/lib/data/articles";

export function ArticleGrid({ articles }: { articles: FeedArticle[] }) {
  if (articles.length === 0) {
    return (
      <EmptyState
        title="No articles yet"
        description="Once something's published here, it'll show up in this grid."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {articles.map((article, i) => (
        <ArticleCard key={article.id} article={article} variant="grid" index={i} />
      ))}
    </div>
  );
}
