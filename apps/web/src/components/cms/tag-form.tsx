"use client";

import { useActionState } from "react";
import { Button, Input } from "@lore-addict/ui";
import { createTagAction, type TaxonomyActionResult } from "@/actions/taxonomy";

const initialState: TaxonomyActionResult = {};

export function TagForm() {
  const [state, formAction, isPending] = useActionState(
    createTagAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex gap-2">
      <Input name="name" placeholder="Tag name" required className="flex-1" />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Adding…" : "Add"}
      </Button>
      {state.error && <p className="text-xs text-danger">{state.error}</p>}
    </form>
  );
}
