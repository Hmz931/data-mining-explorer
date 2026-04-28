interface Props {
  data: number[][];
  rowLabels?: string[];
  colLabels?: string[];
  caption?: string;
  decimals?: number;
  highlight?: (i: number, j: number, v: number) => string | undefined;
  maxRows?: number;
  maxCols?: number;
}

export const MatrixView = ({
  data,
  rowLabels,
  colLabels,
  caption,
  decimals = 2,
  highlight,
  maxRows,
  maxCols,
}: Props) => {
  const rows = maxRows ? data.slice(0, maxRows) : data;
  const truncRows = maxRows && data.length > maxRows;
  const truncCols = maxCols && data[0].length > maxCols;

  return (
    <figure className="my-6">
      <div className="overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full text-[12px] font-mono">
          {colLabels && (
            <thead>
              <tr className="bg-surface/70">
                <th className="px-2 py-1.5 text-left font-normal text-muted-foreground"></th>
                {(maxCols ? colLabels.slice(0, maxCols) : colLabels).map((c, j) => (
                  <th
                    key={j}
                    className="px-2 py-1.5 text-right font-medium text-primary border-l border-border whitespace-nowrap"
                  >
                    {c}
                  </th>
                ))}
                {truncCols && <th className="px-2 py-1.5 text-muted-foreground">…</th>}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((row, i) => {
              const cells = maxCols ? row.slice(0, maxCols) : row;
              return (
                <tr key={i} className="border-t border-border/60">
                  {rowLabels && (
                    <td className="px-2 py-1 text-left text-muted-foreground whitespace-nowrap">
                      {rowLabels[i]}
                    </td>
                  )}
                  {cells.map((v, j) => {
                    const cls = highlight?.(i, j, v) ?? "";
                    return (
                      <td
                        key={j}
                        className={`px-2 py-1 text-right border-l border-border/60 tabular-nums ${cls}`}
                      >
                        {Number.isFinite(v) ? v.toFixed(decimals) : "—"}
                      </td>
                    );
                  })}
                  {truncCols && <td className="px-2 text-muted-foreground">…</td>}
                </tr>
              );
            })}
            {truncRows && (
              <tr>
                <td colSpan={(rowLabels ? 1 : 0) + (rows[0]?.length ?? 0) + (truncCols ? 1 : 0)} className="text-center py-1.5 text-muted-foreground">
                  ⋮
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {caption && (
        <figcaption className="text-xs text-muted-foreground italic mt-2 text-center">{caption}</figcaption>
      )}
    </figure>
  );
};
