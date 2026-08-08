"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Button } from "@lore-addict/ui";
import { signOutAction } from "@/actions/auth";

export interface MobileNavProps {
  navLinks: ReadonlyArray<{ href: Route; label: string }>;
  isAuthenticated: boolean;
  canAccessStudio: boolean;
}

export function MobileNav({ navLinks, isAuthenticated, canAccessStudio }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="rounded-full p-2 text-paper hover:bg-ink-raised"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-16 z-30 flex flex-col gap-1 border-b border-plum-deep bg-ink p-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-bubble px-3 py-2.5 text-sm text-paper hover:bg-ink-raised"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2 border-t border-plum-deep pt-3">
            {isAuthenticated ? (
              <>
                {canAccessStudio && (
                  <Link href="/studio" onClick={() => setOpen(false)}>
                    <Button variant="secondary" className="w-full">
                      Studio
                    </Button>
                  </Link>
                )}
                <Link href="/bookmarks" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full">
                    Bookmarks
                  </Button>
                </Link>
                <Link href="/history" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full">
                    Reading history
                  </Button>
                </Link>
                <Link href="/settings" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full">
                    Settings
                  </Button>
                </Link>
                <form action={signOutAction}>
                  <Button variant="ghost" type="submit" className="w-full">
                    Sign out
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setOpen(false)}>
                  <Button className="w-full">Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
