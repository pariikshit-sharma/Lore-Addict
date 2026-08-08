import Image from "next/image";
import { Badge } from "@lore-addict/ui";
import type { ArticleDetail } from "@/lib/data/articles";

export function ArticleHeader({ article }: { article: ArticleDetail }) {
  const publishedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <header className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        {article.category && (
          <Badge variant="category">{article.category.name}</Badge>
        )}
        {article.contains_spoilers && <Badge variant="spoiler">Spoilers</Badge>}
      </div>

      <h1 className="font-display text-3xl font-semibold leading-[1.1] tracking-tight text-paper sm:text-4xl lg:text-[2.75rem]">
        {article.title}
      </h1>

      {article.subtitle && (
        <p className="max-w-prose text-lg leading-relaxed text-mute">
          {article.subtitle}
        </p>
      )}

      <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-mute">
        {publishedDate && (
          <time dateTime={article.published_at ?? undefined}>{publishedDate}</time>
        )}
        {article.reading_time_minutes && (
          <>
            <span aria-hidden>·</span>
            <span>{article.reading_time_minutes} min read</span>
          </>
        )}
      </div>

      {article.cover_image_url && (
        <div className="relative mt-2 aspect-[16/9] w-full overflow-hidden rounded-bubble border border-plum-deep shadow-[0_24px_64px_-32px_rgba(0,0,0,0.7)]">
          <Image
            src={article.cover_image_url}
            alt={article.cover_image_alt ?? ""}
            fill
            priority
            sizes="(min-width: 1024px) 768px, 100vw"
            className="object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/20 to-transparent" />
        </div>
      )}
    </header>
  );
}
