"use client";

import { useEffect, useRef } from "react";
import { recordReadingProgressAction } from "@/actions/reading-history";

const REPORT_DEBOUNCE_MS = 3000;

/**
 * Renders nothing — purely a side-effect component. Kept separate from
 * ReadingProgressBar (which is presentational) so the visual progress bar
 * works identically for signed-out readers while this tracker, which only
 * matters for signed-in reading_history, no-ops harmlessly for them at
 * the Server Action layer (see recordReadingProgressAction).
 */
export function ReadingProgressTracker({
  articleId,
  targetId,
}: {
  articleId: string;
  targetId: string;
}) {
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxProgress = useRef(0);

  useEffect(() => {
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
      maxProgress.current = Math.max(maxProgress.current, scrolled);

      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        recordReadingProgressAction(articleId, maxProgress.current * 100);
      }, REPORT_DEBOUNCE_MS);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [articleId, targetId]);

  return null;
}
