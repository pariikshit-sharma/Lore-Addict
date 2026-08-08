import type { ArticleDetail } from "@/lib/data/articles";
import type { BreadcrumbItem } from "@/components/layout/breadcrumbs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";
const SITE_NAME = "Lore Addict";

/**
 * Schema.org type varies by article type: a review gets Review (with the
 * item it's reviewing named generically, since we don't have structured
 * "what's being reviewed" data separate from the title), news gets
 * NewsArticle, everything else gets the general Article type.
 */
export function buildArticleJsonLd(article: ArticleDetail) {
  const schemaType =
    article.type === "review" ? "Review" : article.type === "news" ? "NewsArticle" : "Article";

  return {
    "@context": "https://schema.org",
    "@type": schemaType,
    headline: article.title,
    description: article.excerpt ?? article.subtitle ?? undefined,
    image: article.og_image_url || article.cover_image_url || undefined,
    datePublished: article.published_at ?? undefined,
    author: {
      "@type": "Person",
      name: article.author.display_name,
      url: `${SITE_URL}/author/${article.author.username}`,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/article/${article.slug}`,
    },
  };
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      item: item.href ? `${SITE_URL}${item.href}` : undefined,
    })),
  };
}

/**
 * Rendered once, sitewide, in the root layout — not per-page — since
 * Organization/WebSite identity doesn't change between routes.
 */
export function buildSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}
