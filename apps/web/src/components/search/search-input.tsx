"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@lore-addict/ui";

const DEBOUNCE_MS = 350;

export function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (value.trim()) {
        params.set("q", value.trim());
      } else {
        params.delete("q");
      }
      router.replace(`/search?${params.toString()}`);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally
    // omits searchParams/router: including them would re-fire the debounce
    // on every navigation this effect itself causes.
  }, [value]);

  return (
    <Input
      autoFocus
      type="search"
      placeholder="Search anime, movies, theories…"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="h-12 text-base"
    />
  );
}
