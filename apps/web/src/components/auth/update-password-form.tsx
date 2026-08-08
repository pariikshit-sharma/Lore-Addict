"use client";

import { useActionState } from "react";
import { Button, Input } from "@lore-addict/ui";
import { updatePasswordAction, type AuthActionResult } from "@/actions/auth";

const initialState: AuthActionResult = {};

export function UpdatePasswordForm() {
  const [state, formAction, isPending] = useActionState(
    updatePasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm text-mute">
          New password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
        {state.fieldErrors?.password && (
          <p className="text-xs text-danger">{state.fieldErrors.password}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmPassword" className="text-sm text-mute">
          Confirm new password
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
        {state.fieldErrors?.confirmPassword && (
          <p className="text-xs text-danger">
            {state.fieldErrors.confirmPassword}
          </p>
        )}
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
