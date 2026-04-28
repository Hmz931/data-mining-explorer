import { useMemo } from "react";
import { sortedEigen, type Mat } from "@/lib/linalg";
import { MatrixView } from "@/components/MatrixView";

// Tiny survey: 8 individuals × 3 questions, each with 2-3 modalities
// Q1 Habitation: Urbain (U) / Rural (R)
// Q2 Transport: Voiture (V) / Vélo (B) / Transport (T)
// Q3 Sport: Oui (O) / Non (N)
const RESP = [
  ["U", "T", "O"],
  ["U", "B", "O"],
  ["U", "V", "N"],
  ["R", "V", "O"],
  ["R", "V", "N"],
  ["U", "T", "O"],
  ["R", "V", "N"],
  ["U", "B", "O"],
];

const MODS = [
  ["U", "R"],
  ["V", "B", "T"],
  ["O", "N"],
];
const MOD_LABELS = [
  ["Urbain", "Rural"],
  ["Voiture", "Vélo", "Transport"],
  ["Sport oui", "Sport non"],
];

function buildDisjunctive() {
  const flatLabels: string[] = [];
  MOD_LABELS.forEach((qm) => qm.forEach((m) => flatLabels.push(m)));
  const Z: Mat = RESP.map((r) => {
    const row: number[] = [];
    r.forEach((val, qi) => {
      MODS[qi].forEach((mod) => row.push(val === mod ? 1 : 0));
    });
    return row;
  });
  return { Z, labels: flatLabels };
}

function acm() {
  const { Z, labels } = buildDisjunctive();
  const n = Z.length;
  const Q = MODS.length;
  const m = labels.length;

  // Marginals
  const colSums = Array(m).fill(0);
  Z.forEach((r) => r.forEach((v, j) => (colSums[j] += v)));
  const total = n * Q;

  // Standardized residuals: S_ij = (Z_ij/total - r_i c_j) / sqrt(r_i c_j)
  // r_i = 1/n (each row sums to Q so r_i = Q/total = 1/n)
  // c_j = colSums[j]/total
  const ri = 1 / n;
  const cj = colSums.map((s) => s / total);
  const P = Z.map((r) => r.map((v) => v / total));
  const S: Mat = P.map((r, i) =>
    r.map((p, j) => (p - ri * cj[j]) / Math.sqrt(ri * cj[j]))
  );

  // SVD via S^T S → modality coords
  const TS: Mat = Array.from({ length: m }, () => Array(m).fill(0));
  for (let j = 0; j < m; j++)
    for (let k = 0; k < m; k++) {
      let s = 0;
      for (let i = 0; i < n; i++) s += S[i][j] * S[i][k];
      TS[j][k] = s;
    }
  const colEig = sortedEigen(TS);

  // S S^T → individu coords
  const SS: Mat = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++)
    for (let k = 0; k < n; k++) {
      let s = 0;
      for (let j = 0; j < m; j++) s += S[i][j] * S[k][j];
      SS[i][k] = s;
    }
  const rowEig = sortedEigen(SS);

  // Drop trivial eigenvalue (≈ 1) by skipping any value ≥ 0.999
  const allVals = colEig.values.map((v) => Math.max(0, v));
  const eigvals = allVals.filter((v) => v < 0.999 && v > 1e-6).slice(0, Math.min(n, m) - 1);

  // Recompute factor coords using top-2 non-trivial eigvecs
  // Identify their original indices
  const topIdx: number[] = [];
  for (let k = 0; k < colEig.values.length && topIdx.length < 2; k++) {
    if (colEig.values[k] < 0.999 && colEig.values[k] > 1e-6) topIdx.push(k);
  }

  const colCoords = labels.map((_, j) =>
    topIdx.map((k) => (Math.sqrt(colEig.values[k]) * colEig.vectors[k][j]) / Math.sqrt(cj[j]))
  );
  const rowCoords = Array.from({ length: n }, (_, i) =>
    topIdx.map((k) => (Math.sqrt(rowEig.values[k]) * rowEig.vectors[k][i]) / Math.sqrt(ri))
  );

  // Sign alignment row vs col
  for (let kk = 0; kk < 2; kk++) {
    let s = 0;
    const k = topIdx[kk];
    for (let i = 0; i < n; i++)
      for (let j = 0; j < m; j++) s += S[i][j] * rowEig.vectors[k][i] * colEig.vectors[k][j];
    if (s < 0) colCoords.forEach((c) => (c[kk] = -c[kk]));
  }

  return { Z, labels, n, Q, m, eigvals, colCoords, rowCoords };
}

export const ACMViz = () => {
  const r = useMemo(acm, []);

  // Burt matrix preview = Z^T Z
  const B: Mat = Array.from({ length: r.m }, () => Array(r.m).fill(0));
  for (let j = 0; j < r.m; j++)
    for (let k = 0; k < r.m; k++) {
      let s = 0;
      for (let i = 0; i < r.n; i++) s += r.Z[i][j] * r.Z[i][k];
      B[j][k] = s;
    }

  const W = 540, H = 380, pad = 36;
  const allX = [...r.colCoords.map((c) => c[0]), ...r.rowCoords.map((c) => c[0])];
  const allY = [...r.colCoords.map((c) => c[1]), ...r.rowCoords.map((c) => c[1])];
  const m = Math.max(Math.abs(Math.min(...allX, ...allY)), Math.abs(Math.max(...allX, ...allY))) * 1.2;
  const sx = (x: number) => W / 2 + (x / m) * (W / 2 - pad);
  const sy = (y: number) => H / 2 - (y / m) * (H / 2 - pad);

  const totalEig = r.eigvals.reduce((a, b) => a + b, 0);
  const tau1 = (r.eigvals[0] / totalEig) * 100;
  const tau2 = (r.eigvals[1] / totalEig) * 100;

  // Color modalities by question
  const QCOLORS = ["hsl(32 78% 48%)", "hsl(220 65% 45%)", "hsl(145 35% 40%)"];
  function modQuestion(j: number) {
    let count = 0;
    for (let qi = 0; qi < MODS.length; qi++) {
      if (j < count + MODS[qi].length) return qi;
      count += MODS[qi].length;
    }
    return 0;
  }

  return (
    <div className="my-8 space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-lg border border-border bg-card shadow-soft">
          <div className="text-xs uppercase tracking-[0.18em] text-accent font-semibold">Tableau disjonctif Z</div>
          <h4 className="font-serif text-base font-semibold text-primary mt-1 mb-4">{r.n} individus × {r.m} modalités</h4>
          <MatrixView
            data={r.Z}
            rowLabels={Array.from({ length: r.n }, (_, i) => `i${i + 1}`)}
            colLabels={r.labels}
            decimals={0}
            highlight={(_, __, v) => (v === 1 ? "bg-accent/15 text-accent font-semibold" : "text-muted-foreground/50")}
          />
        </div>
        <div className="p-6 rounded-lg border border-border bg-card shadow-soft">
          <div className="text-xs uppercase tracking-[0.18em] text-accent font-semibold">Matrice de Burt B = Zᵀ Z</div>
          <h4 className="font-serif text-base font-semibold text-primary mt-1 mb-4">Croisement de toutes les modalités</h4>
          <MatrixView
            data={B}
            rowLabels={r.labels}
            colLabels={r.labels}
            decimals={0}
            highlight={(i, j) => (i === j ? "bg-primary/10 font-semibold text-primary" : "")}
          />
        </div>
      </div>

      <div className="p-6 rounded-lg border border-border bg-card shadow-soft">
        <div className="text-xs uppercase tracking-[0.18em] text-accent font-semibold">Plan factoriel ACM</div>
        <h4 className="font-serif text-lg font-semibold text-primary mt-1 mb-4">Modalités & individus</h4>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto bg-surface/40 rounded">
          <line x1={pad} x2={W - pad} y1={H / 2} y2={H / 2} stroke="hsl(var(--border))" strokeDasharray="2 4" />
          <line x1={W / 2} x2={W / 2} y1={pad} y2={H - pad} stroke="hsl(var(--border))" strokeDasharray="2 4" />

          {/* Individuals (small grey dots) */}
          {r.rowCoords.map((c, i) => (
            <g key={`i${i}`}>
              <circle cx={sx(c[0])} cy={sy(c[1])} r={3} fill="hsl(var(--muted-foreground))" opacity={0.6} />
              <text x={sx(c[0]) + 5} y={sy(c[1]) + 3} fontSize="9" fill="hsl(var(--muted-foreground))">
                i{i + 1}
              </text>
            </g>
          ))}
          {/* Modalities (big colored squares) */}
          {r.colCoords.map((c, j) => {
            const qi = modQuestion(j);
            return (
              <g key={`m${j}`}>
                <rect x={sx(c[0]) - 5} y={sy(c[1]) - 5} width={10} height={10} fill={QCOLORS[qi]} stroke="white" strokeWidth={1.5} />
                <text
                  x={sx(c[0]) + 9}
                  y={sy(c[1]) + 4}
                  fontSize="11"
                  fontFamily="serif"
                  fontWeight="600"
                  fill={QCOLORS[qi]}
                >
                  {r.labels[j]}
                </text>
              </g>
            );
          })}

          <text x={W - pad} y={H / 2 - 6} textAnchor="end" fontSize="10" fill="hsl(var(--primary))" fontWeight="600">
            Axe 1 ({tau1.toFixed(1)}%)
          </text>
          <text x={W / 2 + 6} y={pad + 4} fontSize="10" fill="hsl(var(--primary))" fontWeight="600">
            Axe 2 ({tau2.toFixed(1)}%)
          </text>
        </svg>
        <div className="flex flex-wrap gap-4 mt-3 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5" style={{ background: QCOLORS[0] }} /> Habitation</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5" style={{ background: QCOLORS[1] }} /> Transport</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5" style={{ background: QCOLORS[2] }} /> Sport</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-muted-foreground/60" /> Individus</span>
        </div>
      </div>
    </div>
  );
};
