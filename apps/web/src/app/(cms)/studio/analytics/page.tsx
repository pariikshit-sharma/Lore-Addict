import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { canAccess } from "@/config/roles";
import type { UserRole } from "@lore-addict/types";
import {
  getViewsOverTime,
  getTopArticles,
  getTrafficSources,
  getDeviceBreakdown,
  getCountryBreakdown,
} from "@/lib/data/analytics";
import { ViewsChartLoader } from "@/components/analytics/views-chart-loader";
import { BreakdownBars } from "@/components/analytics/breakdown-bars";
import { Card, CardContent, CardHeader, CardTitle } from "@lore-addict/ui";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  const role = (profile?.role ?? "user") as UserRole;
  const isSiteWide = canAccess(role, "VIEW_SITE_ANALYTICS");
  // Editors/admins see everything; authors see only their own articles'
  // performance — same query functions, just scoped by an author id or not.
  const scopeAuthorId = isSiteWide ? undefined : user!.id;

  const [views, topArticles, sources, devices, countries] = await Promise.all([
    getViewsOverTime(scopeAuthorId),
    getTopArticles(scopeAuthorId),
    getTrafficSources(scopeAuthorId),
    getDeviceBreakdown(scopeAuthorId),
    getCountryBreakdown(scopeAuthorId),
  ]);

  const totalViews = views.reduce((sum, v) => sum + v.views, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-medium text-paper">
          {isSiteWide ? "Analytics" : "Your article performance"}
        </h1>
        <p className="text-sm text-mute">Last 30 days</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{totalViews.toLocaleString()}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-mute">Total views</p>
          <div className="mt-4">
            <ViewsChartLoader data={views} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top articles</CardTitle>
          </CardHeader>
          <CardContent>
            {topArticles.length === 0 ? (
              <p className="text-xs text-mute">No data yet.</p>
            ) : (
              <ol className="flex flex-col gap-2">
                {topArticles.map((article, i) => (
                  <li key={article.article_id} className="flex items-center gap-3 text-sm">
                    <span className="w-5 shrink-0 text-mute">{i + 1}.</span>
                    <Link
                      href={`/article/${article.slug}`}
                      className="flex-1 truncate text-paper hover:text-plum-bright hover:underline"
                    >
                      {article.title}
                    </Link>
                    <span className="shrink-0 text-mute">{article.views}</span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Traffic sources</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownBars title="" rows={sources} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownBars title="" rows={devices} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownBars title="" rows={countries} />
          </CardContent>
        </Card>
      </div>

      <p className="max-w-prose text-xs text-mute">
        Search performance, ad performance, and revenue aren't shown here —
        they'd need a real search-analytics event stream and a live ad
        network integration respectively, neither of which exists yet.
        Faking those numbers would be worse than leaving them out.
      </p>
    </div>
  );
}
