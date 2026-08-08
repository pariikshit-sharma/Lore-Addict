"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics/track";

export function AnalyticsTracker({
  articleId,
  targetId,
}: {
  articleId: string;
  targetId: string;
}) {
  const fired = useRef({ scroll25: false, scroll75: false });

  useEffect(() => {
    trackEvent(articleId, "view");

    const target = document.getElementById(targetId);
    if (!target) return;

    function onScroll() {
      if (!target) return;
      const { top, height } = target.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const scrolled = Math.min(
        Math.max((viewportHeight - top) / (height + viewportHeight * 0.3), 0),
        1,
      );

      if (scrolled >= 0.25 && !fired.current.scroll25) {
        fired.current.scroll25 = true;
        trackEvent(articleId, "scroll_25");
      }
      if (scrolled >= 0.75 && !fired.current.scroll75) {
        fired.current.scroll75 = true;
        trackEvent(articleId, "scroll_75");
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [articleId, targetId]);

  return null;
}
