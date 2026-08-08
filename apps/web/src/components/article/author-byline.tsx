import Link from "next/link";
import { Avatar } from "@lore-addict/ui";
import type { ArticleDetail } from "@/lib/data/articles";

export function AuthorByline({ author }: { author: ArticleDetail["author"] }) {
  return (
    <Link
      href={`/author/${author.username}`}
      className="group flex items-center gap-3 rounded-bubble border border-plum-deep bg-gradient-to-br from-ink-raised to-ink p-4 transition-all duration-200 ease-signature hover:-translate-y-0.5 hover:border-plum-bright/40 hover:shadow-[0_12px_32px_-16px_rgba(139,111,168,0.35)]"
    >
      <Avatar src={author.avatar_url} name={author.display_name} size={44} />
      <div>
        <p className="text-xs uppercase tracking-wide text-mute">Written by</p>
        <p className="font-display text-sm font-medium text-paper transition-colors group-hover:text-plum-bright">
          {author.display_name}
        </p>
        {author.bio && <p className="mt-0.5 line-clamp-1 text-xs text-mute">{author.bio}</p>}
      </div>
    </Link>
  );
}
