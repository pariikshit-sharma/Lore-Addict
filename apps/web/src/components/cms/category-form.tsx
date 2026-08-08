"use client";

import { useActionState } from "react";
import { Button, Input } from "@lore-addict/ui";
import {
  createCategoryAction,
  type TaxonomyActionResult,
} from "@/actions/taxonomy";

const initialState: TaxonomyActionResult = {};

export function CategoryForm({
  categories,
}: {
  categories: Array<{ id: string; name: string }>;
}) {
  const [state, formAction, isPending] = useActionState(
    createCategoryAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex gap-2">
      <Input name="name" placeholder="Category name" required className="flex-1" />
      <select
        name="parentId"
        className="h-10 rounded-bubble border border-plum-deep bg-ink px-3 text-sm text-paper"
        defaultValue=""
      >
        <option value="">No parent</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Adding…" : "Add"}
      </Button>
      {state.error && <p className="text-xs text-danger">{state.error}</p>}
    </form>
  );
}
