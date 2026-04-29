// Mini critical-value table for the chi-squared distribution.
// Source: standard tables (right-tail, P(X² > value) = alpha).

const ALPHAS = [0.1, 0.05, 0.025, 0.01, 0.001];
const TABLE: Record<number, number[]> = {
  1: [2.706, 3.841, 5.024, 6.635, 10.828],
  2: [4.605, 5.991, 7.378, 9.210, 13.816],
  3: [6.251, 7.815, 9.348, 11.345, 16.266],
  4: [7.779, 9.488, 11.143, 13.277, 18.467],
  5: [9.236, 11.070, 12.833, 15.086, 20.515],
  6: [10.645, 12.592, 14.449, 16.812, 22.458],
  8: [13.362, 15.507, 17.535, 20.090, 26.124],
  10: [15.987, 18.307, 20.483, 23.209, 29.588],
  12: [18.549, 21.026, 23.337, 26.217, 32.910],
  15: [22.307, 24.996, 27.488, 30.578, 37.697],
  20: [28.412, 31.410, 34.170, 37.566, 45.315],
  30: [40.256, 43.773, 46.979, 50.892, 59.703],
};

interface Props {
  highlightDf?: number;
  highlightAlpha?: number;
}

export const Chi2Table = ({ highlightDf, highlightAlpha = 0.05 }: Props) => {
  const ai = ALPHAS.indexOf(highlightAlpha);
  return (
    <figure className="my-6 rounded-lg border border-border bg-card overflow-hidden shadow-soft">
      <div className="px-5 py-2 border-b border-border bg-surface/60 text-[11px] uppercase tracking-[0.2em] text-accent font-semibold">
        Table du χ² · valeurs critiques (queue droite)
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12.5px] font-mono">
          <thead>
            <tr className="bg-surface/70">
              <th className="px-3 py-2 text-left text-muted-foreground border-b border-border">ddl \ α</th>
              {ALPHAS.map((a, j) => (
                <th
                  key={a}
                  className={`px-3 py-2 text-right border-b border-l border-border ${
                    ai === j ? "text-accent" : "text-primary"
                  }`}
                >
                  {a}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(TABLE).map(([df, vals]) => {
              const isHL = highlightDf === Number(df);
              return (
                <tr key={df} className={`border-t border-border/40 ${isHL ? "bg-accent/10" : "even:bg-surface/30"}`}>
                  <td className={`px-3 py-1.5 ${isHL ? "text-accent font-semibold" : "text-muted-foreground"}`}>{df}</td>
                  {vals.map((v, j) => (
                    <td
                      key={j}
                      className={`px-3 py-1.5 text-right border-l border-border/40 tabular-nums ${
                        isHL && ai === j ? "bg-accent/30 text-primary font-bold" : "text-foreground/85"
                      }`}
                    >
                      {v.toFixed(3)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <figcaption className="px-5 py-2 text-xs text-muted-foreground italic border-t border-border bg-surface/30">
        On rejette l'hypothèse d'indépendance H₀ si <strong>χ²<sub>obs</sub> &gt; χ²<sub>α, ddl</sub></strong>.
      </figcaption>
    </figure>
  );
};
