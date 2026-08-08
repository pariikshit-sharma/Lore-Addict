"use client";

import { useActionState } from "react";
import { Button, Input } from "@lore-addict/ui";
import { signUpAction, type AuthActionResult } from "@/actions/auth";

const initialState: AuthActionResult = {};

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(
    signUpAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="displayName" className="text-sm text-mute">
          Name
        </label>
        <Input
          id="displayName"
          name="displayName"
          type="text"
          autoComplete="name"
          required
        />
        {state.fieldErrors?.displayName && (
          <p className="text-xs text-danger">
            {state.fieldErrors.displayName}
          </p>
        )}
      </div>

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

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm text-mute">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
        <p className="text-xs text-mute">
          At least 8 characters, one uppercase letter, one number.
        </p>
        {state.fieldErrors?.password && (
          <p className="text-xs text-danger">{state.fieldErrors.password}</p>
        )}
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
