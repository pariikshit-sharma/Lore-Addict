"use client";

import { useState, useTransition } from "react";
import { updateUserRoleAction } from "@/actions/admin";
import type { UserRole } from "@lore-addict/types";

const ROLES: UserRole[] = ["user", "moderator", "author", "editor", "admin"];

export function RoleSelect({
  userId,
  currentRole,
  disabled,
}: {
  userId: string;
  currentRole: UserRole;
  disabled?: boolean;
}) {
  const [role, setRole] = useState(currentRole);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-1">
      <select
        value={role}
        disabled={disabled || isPending}
        onChange={(e) => {
          const next = e.target.value as UserRole;
          const previous = role;
          setRole(next);
          setError(null);
          startTransition(async () => {
            const result = await updateUserRoleAction(userId, next);
            if (result.error) {
              setRole(previous);
              setError(result.error);
            }
          });
        }}
        className="h-9 rounded-bubble border border-plum-deep bg-ink px-2 text-sm text-paper"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
