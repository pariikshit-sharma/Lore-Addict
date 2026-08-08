import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Avatar } from "@lore-addict/ui";
import { getProfileByUsername, getUserCommentCount } from "@/lib/data/profiles";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) return {};
  return { title: `@${profile.username}` };
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) notFound();

  const commentCount = await getUserCommentCount(profile.id);
  const joined = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex items-center gap-5">
        <Avatar src={profile.avatar_url} name={profile.display_name} size={64} />
        <div>
          <h1 className="font-display text-xl font-semibold text-paper">
            {profile.display_name}
          </h1>
          <p className="text-sm text-mute">@{profile.username}</p>
        </div>
      </div>

      {profile.bio && <p className="text-sm text-paper">{profile.bio}</p>}

      <div className="flex gap-6 border-t border-plum-deep pt-4 text-sm text-mute">
        <span>{commentCount} comments</span>
        <span>Joined {joined}</span>
      </div>
    </div>
  );
}
