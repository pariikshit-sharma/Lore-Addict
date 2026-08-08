import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAuthorsWithArticleCounts } from "@/lib/data/admin";
import { Avatar, Badge } from "@lore-addict/ui";

export default async function AuthorsPage() {
  await requireAdmin("MANAGE_USERS");
  const authors = await getAuthorsWithArticleCounts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-medium text-paper">Authors</h1>
        <Link
          href="/studio/users"
          className="text-sm text-plum-bright hover:underline"
        >
          Manage roles →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {authors.map((author) => (
          <Link
            key={author.id}
            href={`/author/${author.username}`}
            className="flex items-center gap-3 rounded-bubble border border-plum-deep p-4 hover:bg-ink-raised"
          >
            <Avatar src={author.avatar_url} name={author.display_name} size={40} />
            <div className="flex-1">
              <p className="text-sm text-paper">{author.display_name}</p>
              <p className="text-xs text-mute">{author.published_count} published</p>
            </div>
            <Badge variant="category">{author.role}</Badge>
          </Link>
        ))}
        {authors.length === 0 && (
          <p className="text-sm text-mute">No authors yet.</p>
        )}
      </div>
    </div>
  );
}
