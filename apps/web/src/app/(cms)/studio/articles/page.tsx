import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createDraftAction } from "@/actions/articles";
import { Button } from "@lore-addict/ui";
import { ArticleStatusBadge } from "@/components/cms/status-badge";
import type { ArticleStatus } from "@lore-addict/types";

export default async function StudioArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("articles")
    .select("id, title, slug, status, type, updated_at, primary_author_id")
    .order("updated_at", { ascending: false })
    .limit(50);

  if (status) {
    query = query.eq("status", status as ArticleStatus);
  }

  // No explicit author filter here: RLS already scopes the result set to
  // "my own articles" for author-role users and "everything" for
  // editor/admin — the query doesn't need to know which case it's in.
  const { data: articles, error } = await query;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-medium text-paper">
          Articles
        </h1>
        <form action={createDraftAction}>
          <Button type="submit">New article</Button>
        </form>
      </div>

      {error && <p className="text-sm text-danger">{error.message}</p>}

      <div className="overflow-hidden rounded-bubble border border-plum-deep">
        <table className="w-full text-sm">
          <thead className="bg-ink-raised text-left text-mute">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {articles?.map((article) => (
              <tr
                key={article.id}
                className="border-t border-plum-deep transition-colors duration-150 hover:bg-ink-raised/60"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/studio/articles/${article.id}/edit`}
                    className="text-paper hover:text-plum-bright hover:underline"
                  >
                    {article.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <ArticleStatusBadge status={article.status} />
                </td>
                <td className="px-4 py-3 text-mute">{article.type}</td>
                <td className="px-4 py-3 text-mute">
                  {new Date(article.updated_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {articles?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-16 text-center">
                  <p className="text-sm text-paper">No articles yet</p>
                  <p className="mt-1 text-xs text-mute">
                    Click "New article" to write the first one.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
