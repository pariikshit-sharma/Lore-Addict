import { ArticleCard } from "./article-card";
import type { FeedArticle } from "@/lib/data/articles";

export function TrendingRail({ articles }: { articles: FeedArticle[] }) {
  if (articles.length === 0) return null;

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {articles.map((article, i) => (
        <ArticleCard key={article.id} article={article} variant="compact" index={i} />
      ))}
    </div>
  );
}
