import { CommentForm } from "./comment-form";
import { CommentItem } from "./comment-item";
import { getArticleComments } from "@/lib/data/comments";

export async function CommentThread({
  articleId,
  articleSlug,
}: {
  articleId: string;
  articleSlug: string;
}) {
  const comments = await getArticleComments(articleId);

  return (
    <section className="flex flex-col gap-6">
      <h2 className="font-display text-xl font-medium text-paper">
        Discussion {comments.length > 0 && `(${comments.length})`}
      </h2>

      <CommentForm articleId={articleId} articleSlug={articleSlug} />

      <div className="flex flex-col gap-6">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            articleId={articleId}
            articleSlug={articleSlug}
          />
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-mute">Be the first to comment.</p>
        )}
      </div>
    </section>
  );
}
