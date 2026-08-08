"use client";

import { useActionState, useRef } from "react";
import { Button, Textarea } from "@lore-addict/ui";
import { createCommentAction, type CommentActionResult } from "@/actions/comments";

const initialState: CommentActionResult = {};

export function CommentForm({
  articleId,
  articleSlug,
  parentId,
  onPosted,
}: {
  articleId: string;
  articleSlug: string;
  parentId?: string;
  onPosted?: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    createCommentAction.bind(null, articleSlug),
    initialState,
  );

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await formAction(formData);
        formRef.current?.reset();
        onPosted?.();
      }}
      className="flex flex-col gap-2"
    >
      <input type="hidden" name="articleId" value={articleId} />
      {parentId && <input type="hidden" name="parentId" value={parentId} />}
      <Textarea
        name="body"
        placeholder={parentId ? "Write a reply…" : "Join the discussion…"}
        rows={3}
        required
      />
      {state.error && <p className="text-xs text-danger">{state.error}</p>}
      <Button type="submit" size="sm" disabled={isPending} className="self-end">
        {isPending ? "Posting…" : "Post"}
      </Button>
    </form>
  );
}
