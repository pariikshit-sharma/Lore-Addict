import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@lore-addict/ui";

export default async function StudioDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { count: myDrafts },
    { count: pendingComments },
    { count: scheduled },
    { count: published },
  ] = await Promise.all([
    supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("primary_author_id", user!.id)
      .eq("status", "draft"),
    supabase
      .from("comments")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("status", "scheduled"),
    supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
  ]);

  const stats = [
    { label: "Your drafts", value: myDrafts ?? 0, href: "/studio/articles?status=draft" },
    { label: "Pending comments", value: pendingComments ?? 0, href: "/studio/comments" },
    { label: "Scheduled", value: scheduled ?? 0, href: "/studio/articles?status=scheduled" },
    { label: "Published", value: published ?? 0, href: "/studio/articles?status=published" },
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-medium text-paper">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">{stat.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-mute">{stat.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <p className="text-sm text-mute">
        Full performance breakdowns (traffic sources, devices, countries,
        top articles) live in{" "}
        <Link href="/studio/analytics" className="text-plum-bright hover:underline">
          Analytics
        </Link>
        .
      </p>
    </div>
  );
}
