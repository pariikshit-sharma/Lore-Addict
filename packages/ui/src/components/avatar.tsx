"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "../utils/cn";

export interface AvatarProps {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

/**
 * Falls back to initials on a plum background whenever `src` is missing
 * or fails to load — author/commenter avatars are user-supplied uploads,
 * so a broken image must never render as a broken-image icon.
 */
export function Avatar({ src, name, size = 40, className }: AvatarProps) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div
        role="img"
        aria-label={name}
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-plum font-display text-paper",
          className,
        )}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={name}
      width={size}
      height={size}
      className={cn("shrink-0 rounded-full object-cover", className)}
      onError={() => setErrored(true)}
    />
  );
}
