import { createDraftAction } from "@/actions/articles";

export default async function NewArticlePage() {
  await createDraftAction(); // redirects into /studio/articles/[id]/edit
  return null;
}
