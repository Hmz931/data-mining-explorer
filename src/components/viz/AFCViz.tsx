import { useMemo, useState } from "react";
import { sortedEigen, type Mat } from "@/lib/linalg";
import { MatrixView } from "@/components/MatrixView";

// Contingency table : Spécialisation visée × Matière préférée (M1 ESB)
const ROWS = ["Data Science", "Marketing", "Finance", "Conseil", "Audit"];
const COLS = ["Maths/Stat", "Programmation", "Marketing dig.", "Gestion projet", "Anglais"];

const N: Mat = [
  [22, 18, 4, 3, 5],   // Data Science
  [3, 6, 24, 10, 12],  // Marketing
  [14, 4, 6, 8, 10],   // Finance
  [4, 5, 12, 18, 9],   // Conseil
  [10, 3, 4, 14, 8],   // Audit
];

function afc(N: Mat) {
  const I = N.length, J = N[0].length;
  const total = N.flat().reduce((a, b) => a + b, 0);
  const P = N.map((r) => r.map((v) => v / total));
  const ri = P.map((r) => r.reduce((a, b) => a + b, 0));
  const cj = Array(J).fill(0);
  for (const r of P) r.forEach((v, j) => (cj[j] += v));

  const indep: Mat = ri.map((r) => cj.map((c) => r * c * total));
  const chi2cells: Mat = N.map((row, i) =>
    row.map((v, j) => (v - indep[i][j]) ** 2 / indep[i][j])
  );
  const chi2 = chi2cells.flat().reduce((a, b) => a + b, 0);
  const phi2 = chi2 / total;

  // Standardized residuals (signed) — for attraction/repulsion heatmap
  const signed: Mat = N.map((row, i) =>
    row.map((v, j) => (v - indep[i][j]) / Math.sqrt(indep[i][j]))
  );

  const S: Mat = P.map((r, i) =>
    r.map((p, j) => (p - ri[i] * cj[j]) / Math.sqrt(ri[i] * cj[j]))
  );
  const SS: Mat = Array.from({ length: I }, () => Array(I).fill(0));
  for (let i = 0; i < I; i++)
    for (let k = 0; k < I; k++) {
      let s = 0;
      for (let j = 0; j < J; j++) s += S[i][j] * S[k][j];
      SS[i][k] = s;
    }
  const TS: Mat = Array.from({ length: J }, () => Array(J).fill(0));
  for (let j = 0; j < J; j++)
    for (let k = 0; k < J; k++) {
      let s = 0;
      for (let i = 0; i < I; i++) s += S[i][j] * S[i][k];
      TS[j][k] = s;
    }
  const rowEig = sortedEigen(SS);
  const colEig = sortedEigen(TS);
  const eigvals = rowEig.values.slice(0, Math.min(I, J) - 1).map((v) => Math.max(0, v));

  function coords(eig: typeof rowEig, weights: number[]) {
    return weights.map((_, i) =>
      [0, 1].map((k) => (Math.sqrt(eigvals[k]) * eig.vectors[k][i]) / Math.sqrt(weights[i]))
    );
  }
  const rowCoords = coords(rowEig, ri);
  const colCoords = coords(colEig, cj);

  for (const k of [0, 1]) {
    let s = 0;
    for (let i = 0; i < I; i++) for (let j = 0; j < J; j++) s += S[i][j] * rowEig.vectors[k][i] * colEig.vectors[k][j];
    if (s < 0) colCoords.forEach((c) => (c[k] = -c[k]));
  }

  return { P, ri, cj, total, indep, chi2cells, chi2, phi2, signed, eigvals, rowCoords, colCoords, ddl: (I - 1) * (J - 1) };
}

export const AFCViz = () => {
  const r = useMemo(() => afc(N), []);
  const [view, setView] = useState<"observed" | "expected" | "residuals">("observed");

  const W = 540, H = 380, pad = 36;
  const allX = [...r.rowCoords.map((c) => c[0]), ...r.colCoords.map((c) => c[0])];
  const allY = [...r.rowCoords.map((c) => c[1]), ...r.colCoords.map((c) => c[1])];
  const m = Math.max(Math.abs(Math.min(...allX, ...allY)), Math.abs(Math.max(...allX, ...allY))) * 1.2;
  const sx = (x: number) => W / 2 + (x / m) * (W / 2 - pad);
  const sy = (y: number) => H / 2 - (y / m) * (H / 2 - pad);
  const totalEig = r.eigvals.reduce((a, b) => a + b, 0);
  const tau1 = (r.eigvals[0] / totalEig) * 100;
  const tau2 = (r.eigvals[1] / totalEig) * 100;

  const matrixData = view === "observed" ? N : view === "expected" ? r.indep : r.signed;
  const maxVal = Math.max(...matrixData.flat().map(Math.abs));

  return (
    <div className="my-8 space-y-6">
      {/* Contingency / expected / residuals toggleable */}
      <div className="p-6 rounded-lg border border-border bg-card shadow-soft">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-accent font-semibold">Tableau croisé</div>
            <h4 className="font-serif text-lg font-semibold text-primary mt-0.5">Spécialisation visée × Matière préférée (M1 ESB)</h4>
          </div>
          <div className="flex gap-1">
            {[
              { id: "observed", label: "Observés" },
              { id: "expected", label: "Théoriques" },
              { id: "residuals", label: "Résidus χ²" },
            ].map((b) => (
              <button
                key={b.id}
                onClick={() => setView(b.id as typeof view)}
                className={`text-xs px-2.5 py-1 rounded font-medium transition ${
                  view === b.id ? "bg-primary text-primary-foreground" : "border border-border hover:bg-secondary"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <MatrixView
          data={matrixData}
          rowLabels={ROWS}
          colLabels={COLS}
          decimals={view === "observed" ? 0 : 2}
          highlight={(_, __, v) => {
            if (view === "residuals") {
              const t = Math.min(1, Math.abs(v) / Math.max(0.5, maxVal));
              if (v > 0.5) return "bg-blue-500/20 text-blue-900 font-semibold";
              if (v < -0.5) return "bg-rose-500/20 text-rose-900 font-semibold";
              return "text-muted-foreground";
            }
            const t = v / maxVal;
            return t > 0.5 ? "font-bold text-primary" : "";
          }}
        />

        <div className="grid sm:grid-cols-4 gap-3 mt-4 text-xs">
          <div className="p-3 rounded bg-surface/70 border border-border">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">n</div>
            <div className="font-serif text-xl font-semibold text-primary">{r.total}</div>
          </div>
          <div className="p-3 rounded bg-surface/70 border border-border">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">χ² obs.</div>
            <div className="font-serif text-xl font-semibold text-primary">{r.chi2.toFixed(2)}</div>
          </div>
          <div className="p-3 rounded bg-surface/70 border border-border">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">ddl = (I-1)(J-1)</div>
            <div className="font-serif text-xl font-semibold text-primary">{r.ddl}</div>
          </div>
          <div className="p-3 rounded bg-surface/70 border border-border">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Φ² = χ²/n</div>
            <div className="font-serif text-xl font-semibold text-primary">{r.phi2.toFixed(3)}</div>
          </div>
        </div>

        {view === "residuals" && (
          <p className="text-xs text-muted-foreground italic mt-3">
            <span className="text-blue-700 font-semibold">Bleu (résidu &gt; 0)</span> = <strong>attraction</strong> (effectif observé &gt; attendu).
            <span className="text-rose-700 font-semibold ml-2">Rouge (résidu &lt; 0)</span> = <strong>répulsion</strong> (observé &lt; attendu).
          </p>
        )}
      </div>

      {/* Biplot */}
      <div className="p-6 rounded-lg border border-border bg-card shadow-soft">
        <div className="text-xs uppercase tracking-[0.18em] text-accent font-semibold">Plan factoriel — biplot</div>
        <h4 className="font-serif text-lg font-semibold text-primary mt-0.5 mb-4">Spécialisations & matières projetées sur F1 × F2</h4>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto bg-surface/40 rounded">
          <line x1={pad} x2={W - pad} y1={H / 2} y2={H / 2} stroke="hsl(var(--border))" strokeDasharray="2 4" />
          <line x1={W / 2} x2={W / 2} y1={pad} y2={H - pad} stroke="hsl(var(--border))" strokeDasharray="2 4" />
          {r.rowCoords.map((c, i) => (
            <g key={`r${i}`}>
              <circle cx={sx(c[0])} cy={sy(c[1])} r={6} fill="hsl(var(--accent))" stroke="white" strokeWidth={1.5} />
              <text x={sx(c[0]) + 9} y={sy(c[1]) + 4} fontSize="11" fontFamily="serif" fill="hsl(var(--primary))" fontWeight="600">
                {ROWS[i]}
              </text>
            </g>
          ))}
          {r.colCoords.map((c, j) => (
            <g key={`c${j}`}>
              <rect x={sx(c[0]) - 5} y={sy(c[1]) - 5} width={10} height={10} fill="hsl(var(--sage))" stroke="white" strokeWidth={1.5} />
              <text x={sx(c[0]) + 9} y={sy(c[1]) + 4} fontSize="11" fontFamily="serif" fill="hsl(var(--sage))" fontWeight="600" fontStyle="italic">
                {COLS[j]}
              </text>
            </g>
          ))}
          <text x={W - pad} y={H / 2 - 6} textAnchor="end" fontSize="10" fill="hsl(var(--primary))" fontWeight="600">
            F1 ({tau1.toFixed(1)}%)
          </text>
          <text x={W / 2 + 6} y={pad + 4} fontSize="10" fill="hsl(var(--primary))" fontWeight="600">
            F2 ({tau2.toFixed(1)}%)
          </text>
        </svg>
        <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-accent" /> Spécialisations</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-sage" /> Matières</span>
        </div>
      </div>
    </div>
  );
};

export const AFC_DATA = N;
export const AFC_ROWS = ROWS;
export const AFC_COLS = COLS;
export const AFC_DDL = (N.length - 1) * (N[0].length - 1);
