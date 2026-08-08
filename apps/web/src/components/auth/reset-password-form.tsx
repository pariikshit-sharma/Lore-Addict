"use client";

import { useActionState } from "react";
import { Button, Input } from "@lore-addict/ui";
import {
  requestPasswordResetAction,
  type AuthActionResult,
} from "@/actions/auth";

const initialState: AuthActionResult = {};

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    requestPasswordResetAction,
    initialState,
  );

  // useActionState returns a new object on every dispatch, even a
  // content-identical `{}` on success — so reference inequality against
  // the module-level `initialState` constant reliably means "has been
  // submitted at least once," per component instance, with no shared
  // mutable state across users or renders.
  const hasSubmitted = state !== initialState;
  const succeeded = hasSubmitted && !state.error && !state.fieldErrors;

  if (succeeded) {
    return (
      <p className="text-sm text-paper">
        If an account exists for that email, a reset link is on its way.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm text-mute">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        {state.fieldErrors?.email && (
          <p className="text-xs text-danger">{state.fieldErrors.email}</p>
        )}
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
