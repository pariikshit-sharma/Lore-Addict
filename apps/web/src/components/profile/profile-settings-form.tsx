"use client";

import { useActionState, useState } from "react";
import { Button, Input, Textarea } from "@lore-addict/ui";
import { AvatarUpload } from "./avatar-upload";
import { updateProfileAction, type ProfileActionResult } from "@/actions/profile";

const initialState: ProfileActionResult = {};

export function ProfileSettingsForm({
  profile,
}: {
  profile: { display_name: string; bio: string | null; avatar_url: string | null };
}) {
  const [state, formAction, isPending] = useActionState(
    updateProfileAction,
    initialState,
  );
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");

  // Same reference-identity pattern as Milestone 3's ResetPasswordForm:
  // useActionState returns a new object on every dispatch, so comparing
  // against the module-level `initialState` constant reliably means "has
  // submitted at least once," without a redundant success flag.
  const hasSubmitted = state !== initialState;
  const succeeded = hasSubmitted && !state.error && !state.fieldErrors;

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-5">
      <AvatarUpload name={profile.display_name} value={avatarUrl} onUploaded={setAvatarUrl} />
      <input type="hidden" name="avatarUrl" value={avatarUrl} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="displayName" className="text-sm text-mute">
          Display name
        </label>
        <Input
          id="displayName"
          name="displayName"
          defaultValue={profile.display_name}
          required
        />
        {state.fieldErrors?.displayName && (
          <p className="text-xs text-danger">{state.fieldErrors.displayName}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="bio" className="text-sm text-mute">
          Bio
        </label>
        <Textarea id="bio" name="bio" defaultValue={profile.bio ?? ""} rows={3} />
        {state.fieldErrors?.bio && (
          <p className="text-xs text-danger">{state.fieldErrors.bio}</p>
        )}
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      {succeeded && <p className="text-sm text-plum-bright">Saved.</p>}

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
