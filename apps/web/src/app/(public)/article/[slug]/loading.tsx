export default function ArticleLoading() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-col gap-4">
        <div className="h-4 w-40 animate-pulse rounded bg-ink-raised" />
        <div className="h-9 w-full animate-pulse rounded bg-ink-raised" />
        <div className="h-9 w-2/3 animate-pulse rounded bg-ink-raised" />
        <div className="aspect-[16/9] w-full animate-pulse rounded-bubble bg-ink-raised" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-4 w-full animate-pulse rounded bg-ink-raised" />
        ))}
      </div>
    </div>
  );
}
