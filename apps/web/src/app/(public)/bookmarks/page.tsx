import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getBookmarkedArticles } from "@/lib/data/profiles";
import { ArticleGrid } from "@/components/article/article-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@lore-addict/ui";

export const metadata: Metadata = { title: "Bookmarks" };

export default async function BookmarksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Belt-and-suspenders: middleware already redirects unauthenticated
  // requests to /bookmarks before this ever runs (see middleware.ts's
  // PROTECTED_PREFIXES), same enforced-twice pattern as everywhere else.
  if (!user) redirect("/login?redirectTo=/bookmarks");

  const articles = await getBookmarkedArticles(user.id);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-display text-2xl font-medium text-paper">
        Bookmarks
      </h1>
      {articles.length === 0 ? (
        <EmptyState
          title="Nothing bookmarked yet"
          description="The bookmark button lives on every article page — save something to come back to."
          action={
            <Link href="/">
              <Button size="sm" variant="secondary">
                Browse articles
              </Button>
            </Link>
          }
        />
      ) : (
        <ArticleGrid articles={articles} />
      )}
    </div>
  );
}
