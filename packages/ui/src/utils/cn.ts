import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class lists, resolving Tailwind class conflicts (e.g. a consumer
 * passing `p-4` to override a component's default `p-2` actually wins,
 * instead of both classes landing in the DOM and depending on source order).
 * Every component in this package builds its className through this.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
