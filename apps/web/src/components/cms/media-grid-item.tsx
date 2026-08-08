"use client";

import Image from "next/image";
import { useState } from "react";

export function MediaGridItem({ url, name }: { url: string; name: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="group relative aspect-square overflow-hidden rounded-bubble border border-plum-deep">
      <Image src={url} alt={name} fill className="object-cover" sizes="200px" />
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="absolute inset-0 flex items-center justify-center bg-ink/80 text-xs text-paper opacity-0 transition-opacity group-hover:opacity-100"
      >
        {copied ? "Copied!" : "Copy URL"}
      </button>
    </div>
  );
}
