import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getReadingHistory } from "@/lib/data/profiles";

export const metadata: Metadata = { title: "Reading history" };

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/history");

  const entries = await getReadingHistory(user.id);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-display text-2xl font-medium text-paper">
        Reading history
      </h1>

      {entries.length === 0 ? (
        <p className="text-sm text-mute">No reading history yet.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-plum-deep rounded-bubble border border-plum-deep">
          {entries.map((entry) => (
            <li key={entry.article_id} className="flex items-center justify-between p-4">
              <Link
                href={`/article/${entry.slug}`}
                className="text-sm text-paper hover:text-plum-bright hover:underline"
              >
                {entry.title}
              </Link>
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-ink-raised">
                  <div
                    className="h-full bg-plum-bright"
                    style={{ width: `${entry.progress_percent}%` }}
                  />
                </div>
                <span className="w-9 text-right text-xs text-mute">
                  {entry.progress_percent}%
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
