import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">This page doesn't exist.</h1>
      <p className="text-neutral-400">
        The article or page you're looking for may have moved.
      </p>
      <Link href="/" className="underline underline-offset-4">
        Back to Lore Addict
      </Link>
    </main>
  );
}
