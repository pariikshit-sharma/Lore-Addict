import { getRelatedArticles } from "@/lib/data/articles";
import { RelatedArticles } from "./related-articles";

export async function RelatedArticlesSection({
  articleId,
  categoryId,
}: {
  articleId: string;
  categoryId: string | null;
}) {
  const related = await getRelatedArticles(articleId, categoryId);
  return <RelatedArticles articles={related} />;
}
