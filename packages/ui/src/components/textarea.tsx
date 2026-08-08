import { type TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "../utils/cn";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, rows = 4, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        "flex w-full rounded-bubble border border-plum-deep bg-ink px-3.5 py-2.5 text-sm text-paper placeholder:text-mute transition-colors duration-150 ease-signature focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum-bright disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";
