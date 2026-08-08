import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-bubble border border-plum-deep bg-ink-raised p-8">
        <Link
          href="/"
          className="mb-6 block font-display text-xl font-semibold text-paper"
        >
          Lore Addict
        </Link>
        {children}
      </div>
    </main>
  );
}
