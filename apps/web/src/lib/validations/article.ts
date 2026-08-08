import { z } from "zod";

export const articleTypeSchema = z.enum([
  "news",
  "review",
  "theory",
  "editorial",
  "listicle",
  "recap",
]);

export const saveArticleSchema = z
  .object({
    title: z.string().trim().min(3, "Title is required").max(180),
    subtitle: z.string().trim().max(200).optional().or(z.literal("")),
    excerpt: z.string().trim().max(280).optional().or(z.literal("")),
    contentJson: z.string().min(1, "Content is required"), // JSON-stringified Tiptap doc
    type: articleTypeSchema,
    categoryId: z.string().uuid().optional().or(z.literal("")),
    tagIds: z.array(z.string().uuid()).max(8, "Up to 8 tags").default([]),
    coverImageUrl: z.string().url().optional().or(z.literal("")),
    coverImageAlt: z.string().trim().max(200).optional().or(z.literal("")),
    containsSpoilers: z.boolean().default(false),
    spoilerScope: z.string().trim().max(120).optional().or(z.literal("")),
    seoTitle: z.string().trim().max(70).optional().or(z.literal("")),
    seoDescription: z.string().trim().max(160).optional().or(z.literal("")),
  })
  .refine(
    (data) => !data.containsSpoilers || data.spoilerScope !== "",
    {
      message: "Add a scope (e.g. \"up to episode 12\") for spoiler content",
      path: ["spoilerScope"],
    },
  );

export type SaveArticleInput = z.infer<typeof saveArticleSchema>;

export const scheduleArticleSchema = z.object({
  scheduledFor: z
    .string()
    .datetime({ message: "Choose a valid date and time" })
    .refine((val) => new Date(val).getTime() > Date.now(), {
      message: "Scheduled time must be in the future",
    }),
});
