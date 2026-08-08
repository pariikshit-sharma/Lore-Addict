import { createClient } from "@/lib/supabase/server";
import { MediaGridItem } from "@/components/cms/media-grid-item";

async function listBucket(
  supabase: Awaited<ReturnType<typeof createClient>>,
  bucket: "covers" | "inline",
) {
  const { data } = await supabase.storage.from(bucket).list(undefined, {
    limit: 100,
    sortBy: { column: "created_at", order: "desc" },
  });

  return (data ?? [])
    .filter((item) => item.id) // folders have no id
    .map((item) => ({
      name: item.name,
      url: supabase.storage.from(bucket).getPublicUrl(item.name).data.publicUrl,
    }));
}

export default async function MediaLibraryPage() {
  const supabase = await createClient();
  const [covers, inline] = await Promise.all([
    listBucket(supabase, "covers"),
    listBucket(supabase, "inline"),
  ]);
  const allMedia = [...covers, ...inline];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-medium text-paper">Media</h1>
      <p className="text-sm text-mute">
        Upload from within the article editor's cover-image field — this
        library is for browsing and copying URLs of what's already been
        uploaded.
      </p>

      {allMedia.length === 0 ? (
        <p className="text-sm text-mute">No media uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {allMedia.map((item) => (
            <MediaGridItem key={item.url} url={item.url} name={item.name} />
          ))}
        </div>
      )}
    </div>
  );
}
