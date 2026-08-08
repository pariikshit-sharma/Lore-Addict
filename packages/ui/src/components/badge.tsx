import { type HTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn";
import { StarBurst } from "../icons/star-burst";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium font-mono uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-ink-raised text-mute",
        category: "bg-plum-deep text-paper",
        featured: "bg-star/15 text-star",
        success: "bg-plum-bright/15 text-plum-bright",
        spoiler: "bg-danger/15 text-danger",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, className }))}
        {...props}
      >
        {variant === "featured" && <StarBurst className="h-3 w-3" />}
        {children}
      </span>
    );
  },
);
Badge.displayName = "Badge";
