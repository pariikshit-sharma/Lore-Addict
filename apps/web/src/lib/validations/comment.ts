import { z } from "zod";

export const createCommentSchema = z.object({
  articleId: z.string().uuid(),
  parentId: z.string().uuid().optional().or(z.literal("")),
  body: z
    .string()
    .trim()
    .min(1, "Comment can't be empty")
    .max(2000, "Comments are limited to 2000 characters"),
});
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
