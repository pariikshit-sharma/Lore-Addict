"use client";

import { useEffect, useState } from "react";

export function ReadingProgressBar({ targetId }: { targetId: string }) {
  const [progress, setProgress] = useState(0);

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
      setProgress(scrolled);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [targetId]);

  return (
    <div
      className="fixed inset-x-0 top-0 z-30 h-0.5 bg-transparent"
      role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    >
      <div
        className="h-full bg-plum-bright transition-[width] duration-150 ease-out"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}
