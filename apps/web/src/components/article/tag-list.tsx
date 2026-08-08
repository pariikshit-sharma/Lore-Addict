import Link from "next/link";
import { Badge } from "@lore-addict/ui";

export function TagList({ tags }: { tags: Array<{ id: string; name: string; slug: string }> }) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Link key={tag.id} href={`/tag/${tag.slug}`}>
          <Badge variant="default">{tag.name}</Badge>
        </Link>
      ))}
    </div>
  );
}
