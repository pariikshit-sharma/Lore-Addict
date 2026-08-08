import { createClient } from "@/lib/supabase/server";
import { TagForm } from "@/components/cms/tag-form";
import { deleteTagAction } from "@/actions/taxonomy";
import { Badge } from "@lore-addict/ui";

export default async function TagsPage() {
  const supabase = await createClient();
  const { data: tags } = await supabase
    .from("tags")
    .select("id, name, slug")
    .order("name");

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <h1 className="font-display text-2xl font-medium text-paper">Tags</h1>

      <TagForm />

      <div className="flex flex-wrap gap-2">
        {(tags ?? []).map((tag) => (
          <form key={tag.id} action={deleteTagAction.bind(null, tag.id)}>
            <button type="submit" className="group">
              <Badge variant="default" className="group-hover:bg-danger/15 group-hover:text-danger">
                {tag.name} ×
              </Badge>
            </button>
          </form>
        ))}
        {tags?.length === 0 && <p className="text-sm text-mute">No tags yet.</p>}
      </div>
    </div>
  );
}
