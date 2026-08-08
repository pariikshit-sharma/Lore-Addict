"use client";

import { useState, useTransition } from "react";
import { Button } from "@lore-addict/ui";
import { toggleBookmarkAction } from "@/actions/bookmarks";
import { trackEvent } from "@/lib/analytics/track";

export function BookmarkButton({
  articleId,
  articleSlug,
  initiallyBookmarked,
}: {
  articleId: string;
  articleSlug: string;
  initiallyBookmarked: boolean;
}) {
  const [bookmarked, setBookmarked] = useState(initiallyBookmarked);
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant={bookmarked ? "primary" : "secondary"}
      size="sm"
      disabled={isPending}
      onClick={() => {
        setBookmarked((v) => !v); // optimistic
        startTransition(async () => {
          const result = await toggleBookmarkAction(articleId, articleSlug);
          setBookmarked(result.bookmarked);
          if (result.bookmarked) trackEvent(articleId, "bookmark");
        });
      }}
    >
      {bookmarked ? "Bookmarked" : "Bookmark"}
    </Button>
  );
}
