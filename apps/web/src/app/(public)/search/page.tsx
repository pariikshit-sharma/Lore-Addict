import { Suspense } from "react";
import type { Metadata } from "next";
import { searchArticles } from "@/lib/data/articles";
import { SearchInput } from "@/components/search/search-input";
import { ArticleGrid } from "@/components/article/article-grid";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const results = q ? await searchArticles(q, 30) : [];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
      <Suspense fallback={<div className="h-12" />}>
        <SearchInput />
      </Suspense>

      {q ? (
        <>
          <p className="text-sm text-mute">
            {results.length} result{results.length === 1 ? "" : "s"} for
            &ldquo;{q}&rdquo;
          </p>
          <ArticleGrid articles={results} />
        </>
      ) : (
        <p className="text-sm text-mute">
          Search across every article on Lore Addict.
        </p>
      )}
    </div>
  );
}
