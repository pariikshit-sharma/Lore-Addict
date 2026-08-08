"use client";

import { useActionState } from "react";
import { Button, Input } from "@lore-addict/ui";
import { createAdSlotAction, type AdminActionResult } from "@/actions/admin";

const initialState: AdminActionResult = {};

export function AdSlotForm() {
  const [state, formAction, isPending] = useActionState(
    createAdSlotAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex gap-2">
      <Input name="name" placeholder="Slot name (e.g. homepage_hero)" required className="flex-1" />
      <Input name="provider" placeholder="Provider (e.g. adsense)" required className="flex-1" />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Adding…" : "Add slot"}
      </Button>
      {state.error && <p className="text-xs text-danger">{state.error}</p>}
    </form>
  );
}
