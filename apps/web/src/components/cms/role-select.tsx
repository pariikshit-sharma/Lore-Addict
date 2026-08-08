"use client";

import { useState, useTransition } from "react";
import type { UserRole } from "@lore-addict/types";
import { updateUserRoleAction } from "@/actions/users";

const ROLE_OPTIONS: UserRole[] = ["user", "moderator", "author", "editor", "admin"];

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
        className="h-8 rounded-bubble border border-plum-deep bg-ink px-2 text-xs text-paper disabled:opacity-50"
      >
        {ROLE_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
