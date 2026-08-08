import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Avatar } from "@lore-addict/ui";
import { getProfileByUsername, getArticlesByAuthor } from "@/lib/data/profiles";
import { ArticleGrid } from "@/components/article/article-grid";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getProfileByUsername(slug);
  if (!profile) return {};
  return { title: profile.display_name };
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await getProfileByUsername(slug);
  if (!profile) notFound();

  const articles = await getArticlesByAuthor(profile.id);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex items-center gap-5">
        <Avatar src={profile.avatar_url} name={profile.display_name} size={72} />
        <div>
          <h1 className="font-display text-2xl font-semibold text-paper">
            {profile.display_name}
          </h1>
          {profile.bio && <p className="mt-1 max-w-prose text-sm text-mute">{profile.bio}</p>}
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-medium text-paper">
          Articles
        </h2>
        <ArticleGrid articles={articles} />
      </section>
    </div>
  );
}
