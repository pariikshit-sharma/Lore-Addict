import { createClient } from "@/lib/supabase/server";
import { CategoryForm } from "@/components/cms/category-form";
import { deleteCategoryAction } from "@/actions/taxonomy";
import { Button } from "@lore-addict/ui";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id")
    .order("name");

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <h1 className="font-display text-2xl font-medium text-paper">
        Categories
      </h1>

      <CategoryForm categories={categories ?? []} />

      <ul className="flex flex-col divide-y divide-plum-deep rounded-bubble border border-plum-deep">
        {(categories ?? []).map((category) => (
          <li
            key={category.id}
            className="flex items-center justify-between px-4 py-3"
          >
            <div>
              <p className="text-sm text-paper">{category.name}</p>
              <p className="text-xs text-mute">/{category.slug}</p>
            </div>
            <form action={deleteCategoryAction.bind(null, category.id)}>
              <Button type="submit" variant="ghost" size="sm" className="text-danger">
                Delete
              </Button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
