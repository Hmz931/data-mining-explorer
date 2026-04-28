import { useMemo } from "react";
import { sortedEigen, type Mat } from "@/lib/linalg";
import { MatrixView } from "@/components/MatrixView";

// Sample contingency table: 5 CSP × 4 leisure types
const ROWS = ["Cadres", "Employés", "Ouvriers", "Artisans", "Étudiants"];
const COLS = ["Théâtre", "Cinéma", "Foot", "Concert"];

const N: Mat = [
  [42, 38, 12, 35],
  [18, 55, 30, 22],
  [ 8, 40, 60, 14],
  [12, 30, 28, 18],
  [25, 60, 18, 50],
];

// AFC computation (Correspondence Analysis on contingency table)
function afc(N: Mat) {
  const I = N.length, J = N[0].length;
  const total = N.flat().reduce((a, b) => a + b, 0);
  const P = N.map((r) => r.map((v) => v / total));
  const ri = P.map((r) => r.reduce((a, b) => a + b, 0));
  const cj = Array(J).fill(0);
  for (const r of P) r.forEach((v, j) => (cj[j] += v));

  // Independence: t_ij = ri * cj * total
  const indep: Mat = ri.map((r) => cj.map((c) => r * c * total));
  const chi2 = N.reduce(
    (s, row, i) => s + row.reduce((ss, v, j) => ss + (v - indep[i][j]) ** 2 / indep[i][j], 0),
    0
  );
  // Inertia = chi2 / total
  const inertia = chi2 / total;

  // Standardized residuals matrix S_ij = (P_ij - ri cj) / sqrt(ri cj)
  const S: Mat = P.map((r, i) => r.map((p, j) => (p - ri[i] * cj[j]) / Math.sqrt(ri[i] * cj[j])));

  // SVD via S^T S (column factor) and S S^T (row factor) — small dim, eigen is fine
  // SS = S S^T  →  row coords; eigvecs scaled by sqrt(lambda)/sqrt(ri)
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

  // Take 2 dims; trivial eigenvalue = 1 already removed because S has zero margins
  const eigvals = rowEig.values.slice(0, Math.min(I, J) - 1).map((v) => Math.max(0, v));

  // Row coordinates (principal): F_i,k = sqrt(lambda_k) * u_ik / sqrt(r_i)
  function coords(eig: typeof rowEig, weights: number[]) {
    return weights.map((_, i) =>
      [0, 1].map((k) => (Math.sqrt(eigvals[k]) * eig.vectors[k][i]) / Math.sqrt(weights[i]))
    );
  }
  const rowCoords = coords(rowEig, ri);
  const colCoords = coords(colEig, cj);

  // Sign alignment: ensure row & col axes align (compare via S projection)
  for (const k of [0, 1]) {
    let s = 0;
    for (let i = 0; i < I; i++) for (let j = 0; j < J; j++) s += S[i][j] * rowEig.vectors[k][i] * colEig.vectors[k][j];
    if (s < 0) colCoords.forEach((c) => (c[k] = -c[k]));
  }

  return { P, ri, cj, total, indep, chi2, inertia, eigvals, rowCoords, colCoords };
}

export const AFCViz = () => {
  const r = useMemo(() => afc(N), []);

  // Biplot
  const W = 520, H = 380, pad = 36;
  const allX = [...r.rowCoords.map((c) => c[0]), ...r.colCoords.map((c) => c[0])];
  const allY = [...r.rowCoords.map((c) => c[1]), ...r.colCoords.map((c) => c[1])];
  const m = Math.max(Math.abs(Math.min(...allX, ...allY)), Math.abs(Math.max(...allX, ...allY))) * 1.15;
  const sx = (x: number) => W / 2 + (x / m) * (W / 2 - pad);
  const sy = (y: number) => H / 2 - (y / m) * (H / 2 - pad);

  const totalEig = r.eigvals.reduce((a, b) => a + b, 0);
  const tau1 = (r.eigvals[0] / totalEig) * 100;
  const tau2 = (r.eigvals[1] / totalEig) * 100;

  // Contingency heatmap
  const maxN = Math.max(...N.flat());

  return (
    <div className="my-8 space-y-6">
      {/* Heatmap */}
      <div className="p-6 rounded-lg border border-border bg-card shadow-soft">
        <div className="text-xs uppercase tracking-[0.18em] text-accent font-semibold">Tableau de contingence</div>
        <h4 className="font-serif text-lg font-semibold text-primary mt-1 mb-4">CSP × Loisirs préférés</h4>
        <MatrixView
          data={N}
          rowLabels={ROWS}
          colLabels={COLS}
          decimals={0}
          highlight={(_, __, v) => {
            const t = v / maxN;
            const a = (0.15 + t * 0.6).toFixed(2);
            return `font-semibold`;
          }}
        />
        <div className="grid sm:grid-cols-3 gap-3 mt-3">
          <div className="p-3 rounded bg-surface/70 border border-border">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Effectif total</div>
            <div className="font-serif text-xl font-semibold text-primary">{r.total}</div>
          </div>
          <div className="p-3 rounded bg-surface/70 border border-border">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">χ² observé</div>
            <div className="font-serif text-xl font-semibold text-primary">{r.chi2.toFixed(1)}</div>
          </div>
          <div className="p-3 rounded bg-surface/70 border border-border">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Inertie totale</div>
            <div className="font-serif text-xl font-semibold text-primary">{r.inertia.toFixed(3)}</div>
          </div>
        </div>
      </div>

      {/* Biplot */}
      <div className="p-6 rounded-lg border border-border bg-card shadow-soft">
        <div className="text-xs uppercase tracking-[0.18em] text-accent font-semibold">Plan factoriel</div>
        <h4 className="font-serif text-lg font-semibold text-primary mt-1 mb-4">Lignes & colonnes projetées</h4>
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
            Axe 1 ({tau1.toFixed(1)}%)
          </text>
          <text x={W / 2 + 6} y={pad + 4} fontSize="10" fill="hsl(var(--primary))" fontWeight="600">
            Axe 2 ({tau2.toFixed(1)}%)
          </text>
        </svg>
        <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-accent" /> Lignes (CSP)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-sage" /> Colonnes (loisirs)</span>
        </div>
        <p className="text-xs text-muted-foreground italic mt-3">
          Une ligne et une colonne <strong>proches</strong> dans le plan signalent une <strong>attirance</strong> entre cette
          modalité ligne et cette modalité colonne (effectif observé &gt; effectif théorique).
        </p>
      </div>
    </div>
  );
};
