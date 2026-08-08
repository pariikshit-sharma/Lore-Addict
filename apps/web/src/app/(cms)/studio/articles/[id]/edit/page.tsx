import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArticleEditor } from "@/components/cms/article-editor";
import type { UserRole } from "@lore-addict/types";
import type { JSONContent } from "@tiptap/react";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [articleRes, categoriesRes, tagsRes, articleTagsRes, profileRes] =
    await Promise.all([
      supabase.from("articles").select("*").eq("id", id).single(),
      supabase.from("categories").select("id, name").order("name"),
      supabase.from("tags").select("id, name").order("name"),
      supabase.from("article_tags").select("tag_id").eq("article_id", id),
      supabase.from("profiles").select("role").eq("id", user!.id).single(),
    ]);

  if (articleRes.error || !articleRes.data) {
    notFound();
  }

  const article = articleRes.data;

  return (
    <div className="mx-auto max-w-5xl">
      <ArticleEditor
        article={{
          id: article.id,
          title: article.title,
          subtitle: article.subtitle,
          excerpt: article.excerpt,
          content_json: article.content_json as JSONContent,
          type: article.type,
          category_id: article.category_id,
          cover_image_url: article.cover_image_url,
          cover_image_alt: article.cover_image_alt,
          contains_spoilers: article.contains_spoilers,
          spoiler_scope: article.spoiler_scope,
          seo_title: article.seo_title,
          seo_description: article.seo_description,
          status: article.status,
        }}
        categories={categoriesRes.data ?? []}
        tags={tagsRes.data ?? []}
        selectedTagIds={(articleTagsRes.data ?? []).map((t) => t.tag_id)}
        role={(profileRes.data?.role ?? "user") as UserRole}
      />
    </div>
  );
}
