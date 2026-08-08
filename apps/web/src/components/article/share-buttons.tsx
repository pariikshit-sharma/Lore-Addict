"use client";

import { useState } from "react";
import { Button } from "@lore-addict/ui";
import { trackEvent } from "@/lib/analytics/track";

export function ShareButtons({
  articleId,
  title,
  url,
}: {
  articleId: string;
  title: string;
  url: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
        trackEvent(articleId, "share");
        return;
      } catch {
        // User canceled the native share sheet — no event, no fallback.
        return;
      }
    }

    await navigator.clipboard.writeText(url);
    trackEvent(articleId, "share");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Button type="button" variant="secondary" size="sm" onClick={handleShare}>
      {copied ? "Link copied!" : "Share"}
    </Button>
  );
}
