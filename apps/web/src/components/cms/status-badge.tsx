import { Badge } from "@lore-addict/ui";
import type { ArticleStatus } from "@lore-addict/types";

const CONFIG: Record<ArticleStatus, { label: string; variant: "default" | "category" | "success" | "spoiler" }> = {
  draft: { label: "Draft", variant: "default" },
  in_review: { label: "In review", variant: "category" },
  scheduled: { label: "Scheduled", variant: "category" },
  published: { label: "Published", variant: "success" },
  archived: { label: "Archived", variant: "spoiler" },
};

export function ArticleStatusBadge({ status }: { status: ArticleStatus }) {
  const { label, variant } = CONFIG[status];
  return <Badge variant={variant}>{label}</Badge>;
}
