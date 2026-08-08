"use client";

import { useTransition } from "react";
import { motion } from "framer-motion";
import { cn } from "@lore-addict/ui";
import { signInWithOAuthAction } from "@/actions/auth";
import { GoogleIcon } from "./icons/google-icon";
import { DiscordIcon } from "./icons/discord-icon";

const PROVIDERS = [
  {
    id: "google" as const,
    label: "Continue with Google",
    icon: GoogleIcon,
    iconClassName: "",
    hoverRing: "hover:border-[#4285F4]/40",
  },
  {
    id: "discord" as const,
    label: "Continue with Discord",
    icon: DiscordIcon,
    iconClassName: "text-[#5865F2]",
    hoverRing: "hover:border-[#5865F2]/40",
  },
];

export function OAuthButtons() {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-2.5">
      {PROVIDERS.map((provider) => (
        <motion.button
          key={provider.id}
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => signInWithOAuthAction(provider.id))}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className={cn(
            "flex h-11 items-center justify-center gap-3 rounded-bubble border border-plum-deep bg-ink-raised text-sm font-medium text-paper transition-colors duration-150",
            "hover:bg-ink-raised/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum-bright focus-visible:ring-offset-2 focus-visible:ring-offset-ink",
            "disabled:pointer-events-none disabled:opacity-50",
            provider.hoverRing,
          )}
          aria-label={provider.label}
        >
          <provider.icon className={cn("h-[18px] w-[18px]", provider.iconClassName)} />
          {provider.label}
        </motion.button>
      ))}
    </div>
  );
}
