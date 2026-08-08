import Link from "next/link";
import type { Route } from "next";

export interface BreadcrumbItem {
  label: string;
  href?: Route;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-mute">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span aria-hidden>/</span>}
          {item.href ? (
            <Link href={item.href} className="hover:text-paper hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="text-paper">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
