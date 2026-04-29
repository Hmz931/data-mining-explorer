import { useMemo } from "react";

interface Props {
  columns: string[];
  data: number[][];           // rows × cols
  decimals?: number;
}

/* pandas df.describe() — for numeric data. Returns count, mean, std, min, q25, median, q75, max + mode */
export const SummaryStats = ({ columns, data, decimals = 2 }: Props) => {
  const stats = useMemo(() => {
    const n = data.length;
    const p = columns.length;
    const out: Record<string, number[]> = {
      count: [], mean: [], std: [], min: [], "25%": [], "50%": [], "75%": [], max: [], mode: [], var: [],
    };
    for (let j = 0; j < p; j++) {
      const col = data.map((r) => r[j]).filter((v) => Number.isFinite(v));
      const sorted = [...col].sort((a, b) => a - b);
      const mean = col.reduce((a, b) => a + b, 0) / col.length;
      const variance = col.reduce((a, b) => a + (b - mean) ** 2, 0) / (col.length - 1);
      const std = Math.sqrt(variance);
      const q = (p: number) => {
        const idx = (sorted.length - 1) * p;
        const lo = Math.floor(idx), hi = Math.ceil(idx);
        return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
      };
      // mode (rounded to 1 dp to handle near-equal values on continuous data)
      const counts = new Map<number, number>();
      col.forEach((v) => {
        const key = Math.round(v * 10) / 10;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      });
      let mode = sorted[0], best = 0;
      counts.forEach((c, k) => { if (c > best) { best = c; mode = k; } });

      out.count.push(col.length);
      out.mean.push(mean);
      out.std.push(std);
      out.var.push(variance);
      out.min.push(sorted[0]);
      out["25%"].push(q(0.25));
      out["50%"].push(q(0.5));
      out["75%"].push(q(0.75));
      out.max.push(sorted[sorted.length - 1]);
      out.mode.push(mode);
    }
    return out;
  }, [columns, data]);

  const rows = ["count", "mean", "std", "var", "min", "25%", "50%", "75%", "max", "mode"];
  const fmt = (k: string, v: number) => k === "count" ? String(v) : v.toFixed(decimals);

  return (
    <figure className="my-2 rounded-md border border-border bg-card overflow-hidden">
      <div className="px-3 py-1.5 border-b border-border bg-surface/60 font-mono text-[11px] text-muted-foreground">
        df.describe(include="all")
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px] font-mono">
          <thead>
            <tr className="bg-surface/70">
              <th className="px-3 py-1.5 text-left font-medium text-muted-foreground border-b border-border">stat</th>
              {columns.map((c) => (
                <th key={c} className="px-3 py-1.5 text-right font-medium text-primary border-b border-l border-border whitespace-nowrap">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r} className="border-t border-border/40 even:bg-surface/30">
                <td className="px-3 py-1 text-accent font-semibold">{r}</td>
                {stats[r].map((v, j) => (
                  <td key={j} className="px-3 py-1 text-right border-l border-border/40 tabular-nums text-foreground/90">
                    {fmt(r, v)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
};

/* Categorical version — value counts per column */
export const ValueCounts = ({ columns, data }: { columns: string[]; data: string[][] }) => {
  const stats = useMemo(() => columns.map((_, j) => {
    const col = data.map((r) => r[j]);
    const counts = new Map<string, number>();
    col.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1));
    const entries = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    return { unique: entries.length, top: entries[0][0], freq: entries[0][1], total: col.length, entries };
  }), [columns, data]);

  return (
    <figure className="my-2 rounded-md border border-border bg-card overflow-hidden">
      <div className="px-3 py-1.5 border-b border-border bg-surface/60 font-mono text-[11px] text-muted-foreground">
        df.describe(include="object")
      </div>
      <table className="w-full text-[12px] font-mono">
        <thead>
          <tr className="bg-surface/70">
            <th className="px-3 py-1.5 text-left font-medium text-muted-foreground border-b border-border">stat</th>
            {columns.map((c) => (
              <th key={c} className="px-3 py-1.5 text-right font-medium text-primary border-b border-l border-border">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(["count", "unique", "top", "freq"] as const).map((k) => (
            <tr key={k} className="border-t border-border/40 even:bg-surface/30">
              <td className="px-3 py-1 text-accent font-semibold">{k}</td>
              {stats.map((s, j) => (
                <td key={j} className="px-3 py-1 text-right border-l border-border/40 text-foreground/90">
                  {k === "count" ? s.total : k === "unique" ? s.unique : k === "top" ? s.top : s.freq}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
};
