"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, Button } from "@lore-addict/ui";

export function AvatarUpload({
  name,
  value,
  onUploaded,
}: {
  name: string;
  value?: string | null;
  onUploaded: (publicUrl: string) => void;
}) {
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
        body: JSON.stringify({ bucket: "avatars", fileName: file.name }),
      });
      if (!signRes.ok) throw new Error("Could not get an upload URL");

      const { path, token, publicUrl } = await signRes.json();
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from("avatars")
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
    <div className="flex items-center gap-4">
      <Avatar src={value} name={name} size={64} />
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
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
          {isUploading ? "Uploading…" : "Change avatar"}
        </Button>
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      </div>
    </div>
  );
}
