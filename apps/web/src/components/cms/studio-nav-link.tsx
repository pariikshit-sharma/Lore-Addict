"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { cn } from "@lore-addict/ui";

export function StudioNavLink({ href, label }: { href: Route; label: string }) {
  const pathname = usePathname();
  // Exact match for the dashboard root; prefix match for everything else
  // so e.g. /studio/articles/[id]/edit still highlights "Articles".
  const isActive = href === "/studio" ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "relative rounded-bubble px-3 py-2 text-sm transition-colors duration-150",
        isActive
          ? "bg-plum/15 text-plum-bright"
          : "text-mute hover:bg-ink hover:text-paper",
      )}
    >
      {isActive && (
        <span className="absolute -left-1 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-plum-bright" />
      )}
      {label}
    </Link>
  );
}
