import type { BreakdownRow } from "@/lib/data/analytics";

export function BreakdownBars({ title, rows }: { title: string; rows: BreakdownRow[] }) {
  const max = Math.max(...rows.map((r) => r.count), 1);

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-paper">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-xs text-mute">No data yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center gap-3">
              <span className="w-24 shrink-0 truncate text-xs text-mute">{row.label}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-raised">
                <div
                  className="h-full rounded-full bg-plum-bright"
                  style={{ width: `${(row.count / max) * 100}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-xs text-mute">{row.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
