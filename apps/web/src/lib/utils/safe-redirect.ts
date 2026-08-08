import type { Route } from "next";

/**
 * `redirectTo` reaches this from a hidden form field whose value
 * ultimately comes from a URL query param a user controls
 * (`/login?redirectTo=...`) — without validation this is a textbook
 * open-redirect vector (e.g. `?redirectTo=https://evil.example.com` or
 * the protocol-relative bypass `?redirectTo=//evil.example.com`).
 *
 * Only same-origin relative paths are allowed; anything else falls back
 * to "/". The `as Route` cast is the documented escape hatch for
 * next.config.ts's `typedRoutes` feature when a route is genuinely
 * computed at runtime rather than a static literal — safe here
 * specifically because the validation above already constrains the
 * value to this app's own routes before the cast happens.
 */
export function getSafeRedirectPath(value: FormDataEntryValue | null): Route {
  if (
    typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.startsWith("/\\")
  ) {
    return value as Route;
  }
  return "/" as Route;
}
