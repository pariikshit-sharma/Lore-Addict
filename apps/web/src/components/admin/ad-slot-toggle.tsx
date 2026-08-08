"use client";

import { useState, useTransition } from "react";
import { toggleAdSlotAction } from "@/actions/admin";

export function AdSlotToggle({ adSlotId, isActive }: { adSlotId: string; isActive: boolean }) {
  const [active, setActive] = useState(isActive);
  const [isPending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 text-sm text-paper">
      <input
        type="checkbox"
        checked={active}
        disabled={isPending}
        onChange={(e) => {
          const next = e.target.checked;
          setActive(next);
          startTransition(() => toggleAdSlotAction(adSlotId, next));
        }}
      />
      {active ? "Active" : "Inactive"}
    </label>
  );
}
