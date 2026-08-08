"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge, Avatar, cn } from "@lore-addict/ui";
import type { FeedArticle } from "@/lib/data/articles";

export interface ArticleCardProps {
  article: FeedArticle;
  variant?: "featured" | "grid" | "compact";
  index?: number;
}

export function ArticleCard({ article, variant = "grid", index = 0 }: ArticleCardProps) {
  if (variant === "featured") return <FeaturedCard article={article} />;
  if (variant === "compact") return <CompactCard article={article} index={index} />;
  return <GridCard article={article} index={index} />;
}

function Meta({ article }: { article: FeedArticle }) {
  return (
    <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-mute">
      {article.reading_time_minutes && <span>{article.reading_time_minutes} min read</span>}
      {article.category_name && (
        <>
          <span aria-hidden>·</span>
          <span className="text-plum-bright">{article.category_name}</span>
        </>
      )}
    </div>
  );
}

function FeaturedCard({ article }: { article: FeedArticle }) {
  return (
    <Link
      href={`/article/${article.slug}`}
      className="group relative flex aspect-[16/9] w-full flex-col justify-end overflow-hidden rounded-bubble border border-plum-deep shadow-[0_20px_60px_-25px_rgba(139,111,168,0.35)]"
    >
      {article.cover_image_url ? (
        <Image
          src={article.cover_image_url}
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 1024px, 100vw"
          className="object-cover transition-transform duration-500 ease-signature group-hover:scale-[1.04]"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-plum-deep via-ink-raised to-ink" />
      )}
      {/* Layered gradient: a soft top-down wash for legibility, plus a
          warm plum glow rising from the bottom-left so the hero doesn't
          read as a flat dark rectangle with text stamped on it. */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,111,168,0.25),transparent_60%)]" />
      <div className="relative flex flex-col gap-3 p-6 sm:p-10">
        <div className="flex items-center gap-2">
          {article.is_featured && <Badge variant="featured">Featured</Badge>}
          {article.contains_spoilers && <Badge variant="spoiler">Spoilers</Badge>}
        </div>
        <h1 className="font-display text-2xl font-semibold leading-[1.1] tracking-tight text-paper drop-shadow-sm sm:text-4xl lg:text-5xl">
          {article.title}
        </h1>
        {article.excerpt && (
          <p className="max-w-prose text-sm text-paper/80 sm:text-base">
            {article.excerpt}
          </p>
        )}
        <Meta article={article} />
      </div>
    </Link>
  );
}

function GridCard({ article, index }: { article: FeedArticle; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.04, ease: "easeOut" }}
    >
      <Link
        href={`/article/${article.slug}`}
        className="group flex flex-col gap-3 rounded-bubble"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-bubble border border-plum-deep shadow-[0_8px_24px_-16px_rgba(0,0,0,0.6)] transition-shadow duration-300 ease-signature group-hover:shadow-[0_16px_40px_-16px_rgba(139,111,168,0.4)]">
          {article.cover_image_url ? (
            <Image
              src={article.cover_image_url}
              alt=""
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover transition-transform duration-500 ease-signature group-hover:scale-110"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-ink-raised to-ink" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          {article.contains_spoilers && (
            <Badge variant="spoiler" className="absolute left-2 top-2">
              Spoilers
            </Badge>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Meta article={article} />
          <h3 className="font-display text-base font-medium leading-snug text-paper transition-colors duration-150 group-hover:text-plum-bright">
            {article.title}
          </h3>
          <div className="flex items-center gap-2 pt-1">
            <Avatar src={article.author_avatar} name={article.author_name} size={20} />
            <span className="text-xs text-mute">{article.author_name}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function CompactCard({ article, index }: { article: FeedArticle; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index, 6) * 0.05, ease: "easeOut" }}
    >
      <Link
        href={`/article/${article.slug}`}
        className={cn("group flex w-56 shrink-0 flex-col gap-2 rounded-bubble sm:w-64")}
      >
        <div className="relative aspect-video w-full overflow-hidden rounded-bubble border border-plum-deep">
          {article.cover_image_url ? (
            <Image
              src={article.cover_image_url}
              alt=""
              fill
              sizes="256px"
              className="object-cover transition-transform duration-300 ease-signature group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-ink-raised to-ink" />
          )}
        </div>
        <h4 className="font-display text-sm font-medium leading-snug text-paper transition-colors duration-150 group-hover:text-plum-bright">
          {article.title}
        </h4>
        <Meta article={article} />
      </Link>
    </motion.div>
  );
}
