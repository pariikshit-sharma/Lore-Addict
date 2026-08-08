"use client";

import dynamic from "next/dynamic";
import type { ViewsOverTimePoint } from "@/lib/data/analytics";

// recharts is a meaningful chunk of JS with no reason to load until the
// analytics page specifically renders it — deferred behind a dynamic
// import so /studio's other pages (dashboard, articles, etc.) never pay
// for it even though they share the same client bundle boundary.
const ViewsChart = dynamic(
  () => import("./views-chart").then((mod) => mod.ViewsChart),
  {
    ssr: false,
    loading: () => <div className="h-[280px] animate-pulse rounded-bubble bg-ink-raised" />,
  },
);

export function ViewsChartLoader({ data }: { data: ViewsOverTimePoint[] }) {
  return <ViewsChart data={data} />;
}
