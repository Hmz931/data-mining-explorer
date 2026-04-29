import { ReactNode, useState } from "react";

interface Props {
  title?: string;
  caption?: ReactNode;
  rowLabels: string[];
  colLabels: string[];
  data: (number | string)[][];
  defaultRows?: number;
  decimals?: number;
}

// Pandas-like preview ("df.head()") with toggle to show all rows.
export const DataPreview = ({
  title,
  caption,
  rowLabels,
  colLabels,
  data,
  defaultRows = 5,
  decimals = 1,
}: Props) => {
  const [expanded, setExpanded] = useState(false);
  const rows = expanded ? data : data.slice(0, defaultRows);

  const fmt = (v: number | string) =>
    typeof v === "number" ? (Number.isInteger(v) ? String(v) : v.toFixed(decimals)) : v;

  return (
    <figure className="my-6 rounded-lg border border-border bg-card shadow-soft overflow-hidden">
      {title && (
        <div className="px-5 py-2 border-b border-border bg-surface/60 flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-[0.2em] text-accent font-semibold">{title}</span>
          {data.length > defaultRows && (
            <button
              onClick={() => setExpanded((e) => !e)}
              className="text-xs text-muted-foreground hover:text-accent transition"
            >
              {expanded ? "Réduire" : `Voir les ${data.length} lignes`}
            </button>
          )}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-[12.5px] font-mono">
          <thead>
            <tr className="bg-surface/70">
              <th className="px-3 py-2 text-left font-medium text-muted-foreground border-b border-border">#</th>
              {colLabels.map((c, j) => (
                <th
                  key={j}
                  className="px-3 py-2 text-right font-medium text-primary border-b border-l border-border whitespace-nowrap"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-border/40 even:bg-surface/30">
                <td className="px-3 py-1.5 text-muted-foreground italic whitespace-nowrap">{rowLabels[i]}</td>
                {row.map((v, j) => (
                  <td key={j} className="px-3 py-1.5 text-right border-l border-border/40 tabular-nums text-foreground/90">
                    {fmt(v)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!expanded && data.length > defaultRows && (
        <div className="px-5 py-1.5 text-[11px] text-muted-foreground text-center bg-surface/30 border-t border-border/60">
          … {data.length - defaultRows} lignes masquées · <strong>df.head({defaultRows})</strong>
        </div>
      )}
      {caption && (
        <figcaption className="px-5 py-2 text-xs text-muted-foreground italic border-t border-border bg-surface/30">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};
