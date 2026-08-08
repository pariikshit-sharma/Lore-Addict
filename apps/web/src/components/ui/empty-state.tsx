import { StarBurst } from "@lore-addict/ui";
import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-bubble border border-dashed border-plum-deep/60 bg-gradient-to-b from-ink-raised/40 to-transparent px-6 py-16 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-plum/15 text-plum-bright">
        <StarBurst className="h-5 w-5" />
      </div>
      <p className="font-display text-base text-paper">{title}</p>
      {description && (
        <p className="max-w-sm text-sm text-mute">{description}</p>
      )}
      {action}
    </div>
  );
}
