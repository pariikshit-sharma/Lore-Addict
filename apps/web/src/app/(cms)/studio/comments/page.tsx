import { createClient } from "@/lib/supabase/server";
import { moderateCommentAction } from "@/actions/comments";
import { Button, Card, CardContent } from "@lore-addict/ui";

export default async function CommentsModerationPage() {
  const supabase = await createClient();
  const { data: comments } = await supabase
    .from("comments")
    .select("id, body, created_at, user_id, article_id, profiles(display_name), articles(title, slug)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <h1 className="font-display text-2xl font-medium text-paper">
        Comment moderation
      </h1>

      {(comments ?? []).length === 0 && (
        <p className="text-sm text-mute">Nothing pending review.</p>
      )}

      <div className="flex flex-col gap-3">
        {(comments ?? []).map((comment) => (
          <Card key={comment.id}>
            <CardContent className="flex flex-col gap-3 pt-5">
              <p className="text-xs text-mute">
                {(comment.profiles as unknown as { display_name: string } | null)?.display_name ?? "Unknown"}{" "}
                on{" "}
                <span className="text-paper">
                  {(comment.articles as unknown as { title: string } | null)?.title ?? "Deleted article"}
                </span>
              </p>
              <p className="text-sm text-paper">{comment.body}</p>
              <div className="flex gap-2">
                <form action={moderateCommentAction.bind(null, comment.id, "visible")}>
                  <Button type="submit" size="sm">
                    Approve
                  </Button>
                </form>
                <form action={moderateCommentAction.bind(null, comment.id, "removed")}>
                  <Button type="submit" variant="ghost" size="sm" className="text-danger">
                    Remove
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
