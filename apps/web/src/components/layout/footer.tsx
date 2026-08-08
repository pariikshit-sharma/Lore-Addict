import Link from "next/link";

const COLUMNS = [
  {
    title: "Browse",
    links: [
      { href: "/news", label: "News" },
      { href: "/reviews", label: "Reviews" },
      { href: "/theories", label: "Theories" },
      { href: "/trending", label: "Trending" },
    ],
  },
  {
    title: "Categories",
    links: [
      { href: "/category/anime", label: "Anime" },
      { href: "/category/movies", label: "Movies" },
      { href: "/category/tv", label: "TV" },
      { href: "/category/manga", label: "Manga" },
    ],
  },
  {
    title: "More",
    links: [{ href: "/rss.xml", label: "RSS" }],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-plum-deep">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 sm:grid-cols-4 sm:px-6">
        <div className="col-span-2 sm:col-span-1">
          <p className="font-display text-lg font-semibold text-paper">
            Lore Addict
          </p>
          <p className="mt-2 text-sm text-mute">
            Anime, movies, TV, manga, and pop culture.
          </p>
        </div>
        {COLUMNS.map((column) => (
          <div key={column.title} className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-mute">
              {column.title}
            </p>
            {column.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-mute hover:text-paper"
              >
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="border-t border-plum-deep px-4 py-4 text-center text-xs text-mute sm:px-6">
        © {new Date().getFullYear()} Lore Addict.
      </div>
    </footer>
  );
}
