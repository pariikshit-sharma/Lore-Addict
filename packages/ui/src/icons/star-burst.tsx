import type { SVGProps } from "react";

/**
 * The signature element of the design system, taken directly from the
 * logo's star cutout. Used deliberately rarely: featured-content badges,
 * the spoiler-reveal moment, and loading states — never as general
 * decoration. If it starts showing up more than a few places on one
 * screen, that's a sign it's being used as decoration, not signature.
 */
export function StarBurst(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 1.5c.4 0 .77.25.9.63l1.9 5.4 5.4 1.9c.38.13.63.5.63.9s-.25.77-.63.9l-5.4 1.9-1.9 5.4a.96.96 0 0 1-.9.63.96.96 0 0 1-.9-.63l-1.9-5.4-5.4-1.9a.96.96 0 0 1-.63-.9c0-.4.25-.77.63-.9l5.4-1.9 1.9-5.4c.13-.38.5-.63.9-.63Z" />
    </svg>
  );
}
