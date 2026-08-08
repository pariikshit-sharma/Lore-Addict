"use client";

import { useState } from "react";
import { Avatar, Button } from "@lore-addict/ui";
import { CommentForm } from "./comment-form";
import type { CommentNode } from "@/lib/data/comments";

export function CommentItem({
  comment,
  articleId,
  articleSlug,
  depth = 0,
}: {
  comment: CommentNode;
  articleId: string;
  articleSlug: string;
  depth?: number;
}) {
  const [replying, setReplying] = useState(false);

  return (
    <div className={depth > 0 ? "ml-8 border-l border-plum-deep pl-4" : ""}>
      <div className="flex gap-3">
        <Avatar src={comment.user.avatar_url} name={comment.user.display_name} size={32} />
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <p className="text-sm font-medium text-paper">{comment.user.display_name}</p>
            <time className="text-xs text-mute" dateTime={comment.created_at}>
              {new Date(comment.created_at).toLocaleDateString()}
            </time>
          </div>
          <p className="mt-1 text-sm text-paper">{comment.body}</p>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="mt-1"
            onClick={() => setReplying((v) => !v)}
          >
            {replying ? "Cancel" : "Reply"}
          </Button>

          {replying && (
            <div className="mt-2">
              <CommentForm
                articleId={articleId}
                articleSlug={articleSlug}
                parentId={comment.id}
                onPosted={() => setReplying(false)}
              />
            </div>
          )}
        </div>
      </div>

      {comment.replies.length > 0 && (
        <div className="mt-4 flex flex-col gap-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              articleId={articleId}
              articleSlug={articleSlug}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
