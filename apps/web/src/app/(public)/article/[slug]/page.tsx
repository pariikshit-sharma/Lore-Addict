import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import type { Metadata, Route } from "next";
import { createClient } from "@/lib/supabase/server";
import { createStaticClient } from "@/lib/supabase/static";
import { getArticleBySlug, getRedirectTarget } from "@/lib/data/articles";
import { ArticleHeader } from "@/components/article/article-header";
import { ArticleBody } from "@/components/article/article-body";
import { AuthorByline } from "@/components/article/author-byline";
import { TagList } from "@/components/article/tag-list";
import { ReadingProgressBar } from "@/components/article/reading-progress-bar";
import { ReadingProgressTracker } from "@/components/article/reading-progress-tracker";
import { AnalyticsTracker } from "@/components/article/analytics-tracker";
import { ShareButtons } from "@/components/article/share-buttons";
import { BookmarkButton } from "@/components/article/bookmark-button";
import { RelatedArticlesSection } from "@/components/article/related-articles-section";
import { CommentThread } from "@/components/article/comment-thread";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { buildArticleJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo/json-ld";

const ARTICLE_BODY_ID = "article-body";

// Every published slug is generated at build time; new/edited articles
// arrive via the on-publish revalidation call (see /api/revalidate), not
// by waiting for this list to be rebuilt.
export async function generateStaticParams() {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from("articles")
    .select("slug")
    .eq("status", "published")
    .is("deleted_at", null)
    .limit(1000);

  return (data ?? []).map((a) => ({ slug: a.slug }));
}

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  const title = article.seo_title || article.title;
  const description =
    article.seo_description || article.excerpt || article.subtitle || undefined;

  return {
    title,
    description,
    alternates: { canonical: `/article/${article.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      images: article.og_image_url || article.cover_image_url
        ? [article.og_image_url || article.cover_image_url!]
        : undefined,
      publishedTime: article.published_at ?? undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    // Try the redirect table before 404ing — a renamed article's old URL
    // should 301, not break. See ARCHITECTURE.md's Route Map section.
    const target = await getRedirectTarget(slug);
    if (target) redirect(`/article/${target}`);
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isBookmarked = false;
  if (user) {
    const { data } = await supabase
      .from("bookmarks")
      .select("article_id")
      .eq("user_id", user.id)
      .eq("article_id", article.id)
      .maybeSingle();
    isBookmarked = Boolean(data);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const breadcrumbItems = [
    { label: "Home", href: "/" as Route },
    ...(article.category
      ? [{ label: article.category.name, href: `/category/${article.category.slug}` as Route }]
      : []),
    { label: article.title },
  ];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
      <JsonLd data={buildArticleJsonLd(article)} />
      <JsonLd data={buildBreadcrumbJsonLd(breadcrumbItems)} />

      <ReadingProgressBar targetId={ARTICLE_BODY_ID} />
      <ReadingProgressTracker articleId={article.id} targetId={ARTICLE_BODY_ID} />
      <AnalyticsTracker articleId={article.id} targetId={ARTICLE_BODY_ID} />

      <Breadcrumbs items={breadcrumbItems} />

      <ArticleHeader article={article} />

      <div className="flex items-center gap-3 border-y border-plum-deep/60 py-3">
        <ShareButtons
          articleId={article.id}
          title={article.title}
          url={`${siteUrl}/article/${article.slug}`}
        />
        <BookmarkButton
          articleId={article.id}
          articleSlug={article.slug}
          initiallyBookmarked={isBookmarked}
        />
      </div>

      <ArticleBody
        id={ARTICLE_BODY_ID}
        html={article.content_html}
        containsSpoilers={article.contains_spoilers}
        spoilerScope={article.spoiler_scope}
      />

      <TagList tags={article.tags} />

      <AuthorByline author={article.author} />

      <div className="flex flex-col gap-10 border-t border-plum-deep/60 pt-10">
        <Suspense fallback={<div className="h-40 animate-pulse rounded-bubble bg-ink-raised" />}>
          <RelatedArticlesSection articleId={article.id} categoryId={article.category_id} />
        </Suspense>

        <Suspense fallback={<CommentThreadSkeleton />}>
          <CommentThread articleId={article.id} articleSlug={article.slug} />
        </Suspense>
      </div>
    </div>
  );
}

function CommentThreadSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-6 w-40 animate-pulse rounded bg-ink-raised" />
      <div className="h-24 animate-pulse rounded-bubble bg-ink-raised" />
    </div>
  );
}
