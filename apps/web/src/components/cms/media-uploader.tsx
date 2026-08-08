"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@lore-addict/ui";

export interface MediaUploaderProps {
  bucket: "covers" | "inline";
  value?: string;
  onUploaded: (publicUrl: string) => void;
}

export function MediaUploader({ bucket, value, onUploaded }: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setIsUploading(true);
    setError(null);

    try {
      const signRes = await fetch("/api/uploads/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bucket, fileName: file.name }),
      });

      if (!signRes.ok) {
        const body = await signRes.json().catch(() => ({}));
        throw new Error(body.error ?? "Could not get an upload URL");
      }

      const { path, token, publicUrl } = await signRes.json();

      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .uploadToSignedUrl(path, token, file);

      if (uploadError) throw uploadError;

      onUploaded(publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {value && (
        <div className="relative aspect-video w-full overflow-hidden rounded-bubble border border-plum-deep">
          <Image src={value} alt="" fill className="object-cover" />
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? "Uploading…" : value ? "Replace image" : "Upload image"}
      </Button>

      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
