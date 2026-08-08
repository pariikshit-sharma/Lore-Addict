"use client";

import { useId, useState } from "react";
import { cn } from "../utils/cn";
import { StarBurst } from "../icons/star-burst";

export interface SpoilerBlockProps {
  /** Optional context shown on the closed state, e.g. "up to episode 12" */
  scope?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * The one designed "moment" in the interaction language (see design plan):
 * a star-shaped wipe reveal, used specifically for spoiler content rather
 * than as decoration elsewhere. Content-agnostic by design — Milestone 7
 * (Article pages) wraps real article body content in this; this component
 * only owns the reveal mechanic and accessibility behavior.
 */
export function SpoilerBlock({ scope, children, className }: SpoilerBlockProps) {
  const [revealed, setRevealed] = useState(false);
  const contentId = useId();

  if (revealed) {
    return (
      <div
        id={contentId}
        className={cn("animate-star-reveal", className)}
        data-state="revealed"
      >
        {children}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setRevealed(true)}
      aria-expanded={revealed}
      aria-controls={contentId}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-bubble border border-dashed border-plum-bright/40 bg-ink-raised px-5 py-8 text-sm font-medium text-plum-bright transition-colors duration-150 ease-signature hover:bg-ink-raised/70",
        className,
      )}
    >
      <StarBurst className="h-4 w-4" />
      Reveal spoiler{scope ? ` — ${scope}` : ""}
    </button>
  );
}
