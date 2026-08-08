// This is the loading fallback for the whole (public) route group, not
// just the homepage — Next.js uses the nearest loading.tsx up the segment
// tree, and only article/[slug] currently defines a more specific one.
// Kept generic (hero + grid shape) rather than homepage-exact for that
// reason; category/tag/news/etc. pages inherit this until they earn a
// more tailored skeleton of their own.
export default function PublicLoading() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-8 sm:px-6 sm:py-12">
      <div className="aspect-[21/9] w-full animate-pulse rounded-bubble bg-ink-raised" />
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[4/3] animate-pulse rounded-bubble bg-ink-raised" />
        ))}
      </div>
    </div>
  );
}
