import Link from "next/link";
import { ArticleCard } from "@/components/article/article-card";
import { ArticleGrid } from "@/components/article/article-grid";
import { TrendingRail } from "@/components/article/trending-rail";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@lore-addict/ui";
import {
  getFeaturedArticle,
  getTrendingArticles,
  getLatestArticles,
} from "@/lib/data/articles";

// Revalidated by the on-publish webhook (see /api/revalidate) rather than
// a fixed interval — this number is the ceiling if that call is ever
// missed, not the primary refresh mechanism.
export const revalidate = 300;

export default async function HomePage() {
  const featured = await getFeaturedArticle();
  const [trending, latest] = await Promise.all([
    getTrendingArticles(10),
    getLatestArticles({ excludeId: featured?.id, limit: 12 }),
  ]);

  return (
    <div className="relative">
      {/* A quiet ambient glow behind the hero — the single background
          effect on this page, kept subtle and fixed so it doesn't compete
          with content while scrolling. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(139,111,168,0.16),transparent)]"
      />

      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-8 sm:px-6 sm:py-12">
        {featured ? (
          <section className="animate-hero-rise">
            <ArticleCard article={featured} variant="featured" />
          </section>
        ) : (
          <EmptyState
            title="Nothing published yet"
            description="Once an article goes live in Studio, it lands here."
            action={
              <Link href="/studio/articles/new">
                <Button size="sm">Write the first one</Button>
              </Link>
            }
          />
        )}

        {trending.length > 0 && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-xl font-medium text-paper">
                Trending
              </h2>
              <span className="h-px flex-1 bg-gradient-to-r from-plum-deep to-transparent" />
            </div>
            <TrendingRail articles={trending} />
          </section>
        )}

        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-xl font-medium text-paper">
              Latest
            </h2>
            <span className="h-px flex-1 bg-gradient-to-r from-plum-deep to-transparent" />
          </div>
          <ArticleGrid articles={latest} />
        </section>
      </div>
    </div>
  );
}
