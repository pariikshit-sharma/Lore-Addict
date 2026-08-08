import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "../utils/cn";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, type = "text", ...props }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-10 w-full rounded-bubble border border-plum-deep bg-ink px-3.5 text-sm text-paper placeholder:text-mute transition-colors duration-150 ease-signature focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum-bright disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";
