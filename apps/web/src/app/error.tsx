"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@lore-addict/ui";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production this is where an error-tracking integration (Sentry,
    // per the Deployment Architecture section) would receive the report —
    // not wired up yet since that requires a live account to send to.
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="font-display text-2xl font-semibold text-paper">
        Something went wrong
      </h1>
      <p className="text-sm text-mute">
        That's on us, not you. You can try again, or head back home.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Link href="/">
          <Button variant="secondary">Back to Lore Addict</Button>
        </Link>
      </div>
    </main>
  );
}
