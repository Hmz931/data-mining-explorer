import { useMemo, useState } from "react";
import { sortedEigen, type Mat } from "@/lib/linalg";
import { MatrixView } from "@/components/MatrixView";

// Questionnaire 12 étudiants M1 ESB · 4 questions qualitatives
// Q1 Spécialisation visée (M2)        : DS, Marketing, Finance
// Q2 Outil préféré                    : Python, Excel, Tableau
// Q3 Type de stage cible              : Startup, Grand groupe, Cabinet
// Q4 Format de cours préféré          : Théorique, Pratique, Mixte
const QUESTIONS = ["Spécialisation", "Outil préféré", "Stage", "Cours"];
const MODS = [
  ["DS", "Mkt", "Fin"],
  ["Python", "Excel", "Tableau"],
  ["Startup", "Groupe", "Cabinet"],
  ["Théorie", "Pratique", "Mixte"],
];
const MOD_LABELS = [
  ["Spé:DS", "Spé:Mkt", "Spé:Fin"],
  ["Outil:Python", "Outil:Excel", "Outil:Tableau"],
  ["Stage:Startup", "Stage:Groupe", "Stage:Cabinet"],
  ["Cours:Théorie", "Cours:Pratique", "Cours:Mixte"],
];

const RESP: string[][] = [
  ["DS", "Python", "Startup", "Pratique"],
  ["DS", "Python", "Groupe", "Mixte"],
  ["DS", "Tableau", "Startup", "Pratique"],
  ["Mkt", "Excel", "Groupe", "Mixte"],
  ["Mkt", "Tableau", "Groupe", "Théorie"],
  ["Mkt", "Excel", "Cabinet", "Mixte"],
  ["Fin", "Excel", "Cabinet", "Théorie"],
  ["Fin", "Excel", "Cabinet", "Théorie"],
  ["Fin", "Tableau", "Groupe", "Théorie"],
  ["DS", "Python", "Startup", "Pratique"],
  ["Mkt", "Tableau", "Startup", "Pratique"],
  ["Fin", "Excel", "Cabinet", "Mixte"],
];
const NAMES = ["Amel","Yann","Léa","Karim","Inès","Hugo","Sami","Manon","Théo","Nora","Élise","Omar"];

function buildDisjunctive() {
  const labels: string[] = [];
  MOD_LABELS.forEach((qm) => qm.forEach((m) => labels.push(m)));
  const Z: Mat = RESP.map((r) =>
    r.flatMap((val, qi) => MODS[qi].map((mod) => (val === mod ? 1 : 0)))
  );
  return { Z, labels };
}

function acm() {
  const { Z, labels } = buildDisjunctive();
  const n = Z.length;
  const Q = QUESTIONS.length;
  const m = labels.length;

  const colSums = Array(m).fill(0);
  Z.forEach((r) => r.forEach((v, j) => (colSums[j] += v)));
  const total = n * Q;
  const ri = 1 / n;
  const cj = colSums.map((s) => s / total);
  const P = Z.map((r) => r.map((v) => v / total));
  const S: Mat = P.map((r) =>
    r.map((p, j) => (p - ri * cj[j]) / Math.sqrt(ri * cj[j]))
  );

  const TS: Mat = Array.from({ length: m }, () => Array(m).fill(0));
  for (let j = 0; j < m; j++)
    for (let k = 0; k < m; k++) {
      let s = 0;
      for (let i = 0; i < n; i++) s += S[i][j] * S[i][k];
      TS[j][k] = s;
    }
  const colEig = sortedEigen(TS);
  const SS: Mat = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++)
    for (let k = 0; k < n; k++) {
      let s = 0;
      for (let j = 0; j < m; j++) s += S[i][j] * S[k][j];
      SS[i][k] = s;
    }
  const rowEig = sortedEigen(SS);

  // remove trivial eigenvalue ≈ 1
  const nonTrivial: number[] = [];
  for (let k = 0; k < colEig.values.length && nonTrivial.length < Math.min(n, m) - 1; k++) {
    if (colEig.values[k] < 0.999 && colEig.values[k] > 1e-6) nonTrivial.push(k);
  }
  const eigvals = nonTrivial.map((k) => colEig.values[k]);
  const top2 = nonTrivial.slice(0, 2);

  const colCoords = labels.map((_, j) =>
    top2.map((k) => (Math.sqrt(colEig.values[k]) * colEig.vectors[k][j]) / Math.sqrt(cj[j]))
  );
  const rowCoords = Array.from({ length: n }, (_, i) =>
    top2.map((k) => (Math.sqrt(rowEig.values[k]) * rowEig.vectors[k][i]) / Math.sqrt(ri))
  );
  for (let kk = 0; kk < 2; kk++) {
    let s = 0;
    const k = top2[kk];
    for (let i = 0; i < n; i++)
      for (let j = 0; j < m; j++) s += S[i][j] * rowEig.vectors[k][i] * colEig.vectors[k][j];
    if (s < 0) colCoords.forEach((c) => (c[kk] = -c[kk]));
  }

  // Benzécri correction (only for axes with lambda > 1/Q)
  const seuil = 1 / Q;
  const benzecri = eigvals.map((l) =>
    l > seuil ? ((Q / (Q - 1)) ** 2) * (l - seuil) ** 2 : 0
  );
  const totalBenz = benzecri.reduce((a, b) => a + b, 0) || 1;
  const tauBenz = benzecri.map((b) => b / totalBenz);

  return { Z, labels, n, Q, m, eigvals, colCoords, rowCoords, seuil, tauBenz };
}

export const ACMViz = () => {
  const r = useMemo(acm, []);
  const [showInd, setShowInd] = useState(true);

  // Burt
  const B: Mat = Array.from({ length: r.m }, () => Array(r.m).fill(0));
  for (let j = 0; j < r.m; j++)
    for (let k = 0; k < r.m; k++) {
      let s = 0;
      for (let i = 0; i < r.n; i++) s += r.Z[i][j] * r.Z[i][k];
      B[j][k] = s;
    }

  const W = 540, H = 400, pad = 36;
  const allX = [...r.colCoords.map((c) => c[0]), ...r.rowCoords.map((c) => c[0])];
  const allY = [...r.colCoords.map((c) => c[1]), ...r.rowCoords.map((c) => c[1])];
  const m = Math.max(Math.abs(Math.min(...allX, ...allY)), Math.abs(Math.max(...allX, ...allY))) * 1.2;
  const sx = (x: number) => W / 2 + (x / m) * (W / 2 - pad);
  const sy = (y: number) => H / 2 - (y / m) * (H / 2 - pad);

  const tau1 = (r.tauBenz[0] || 0) * 100;
  const tau2 = (r.tauBenz[1] || 0) * 100;

  const QCOLORS = ["hsl(220 65% 45%)", "hsl(32 78% 48%)", "hsl(145 35% 40%)", "hsl(280 50% 50%)"];
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
          <h4 className="font-serif text-base font-semibold text-primary mt-1 mb-4">{r.n} étudiants × {r.m} modalités</h4>
          <MatrixView
            data={r.Z}
            rowLabels={NAMES}
            colLabels={r.labels}
            decimals={0}
            highlight={(_, __, v) => (v === 1 ? "bg-accent/15 text-accent font-semibold" : "text-muted-foreground/40")}
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
            highlight={(i, j, v) => {
              if (i === j) return "bg-primary/10 font-semibold text-primary";
              if (v >= 5) return "bg-sage/15 font-semibold";
              if (v === 0) return "text-muted-foreground/40";
              return "";
            }}
          />
        </div>
      </div>

      {/* Eigenvalues with 1/Q threshold */}
      <div className="p-6 rounded-lg border border-border bg-card shadow-soft">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-accent font-semibold">Valeurs propres</div>
            <h4 className="font-serif text-lg font-semibold text-primary mt-0.5">
              Seuil de Benzécri : λ &gt; 1/Q = {(1 / r.Q).toFixed(3)}
            </h4>
          </div>
          <div className="text-xs text-muted-foreground">
            <span className="font-mono text-primary font-bold">
              {r.eigvals.filter((v) => v > r.seuil).length}
            </span> axes au-dessus du seuil
          </div>
        </div>
        <svg viewBox={`0 0 600 200`} className="w-full h-auto mt-3">
          {(() => {
            const maxE = Math.max(...r.eigvals);
            const yT = 180 - (r.seuil / maxE) * 160;
            return (
              <g>
                <line x1={20} x2={580} y1={yT} y2={yT} stroke="hsl(var(--destructive))" strokeDasharray="4 3" strokeWidth={1.2} />
                <text x={580} y={yT - 4} textAnchor="end" fontSize="10" fill="hsl(var(--destructive))" fontWeight="600">
                  λ = 1/Q (seuil de Benzécri)
                </text>
              </g>
            );
          })()}
          {r.eigvals.map((v, i) => {
            const bw = 560 / r.eigvals.length;
            const bh = (v / Math.max(...r.eigvals)) * 160;
            const above = v > r.seuil;
            return (
              <g key={i}>
                <rect
                  x={20 + i * bw + 2} y={180 - bh} width={bw - 4} height={bh}
                  fill={above ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                  opacity={above ? 1 : 0.4}
                />
                <text x={20 + i * bw + bw / 2} y={180 - bh - 4} textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))">
                  {v.toFixed(2)}
                </text>
                <text x={20 + i * bw + bw / 2} y={193} textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))">
                  F{i + 1}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Plan factoriel */}
      <div className="p-6 rounded-lg border border-border bg-card shadow-soft">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-accent font-semibold">Plan factoriel ACM</div>
            <h4 className="font-serif text-lg font-semibold text-primary mt-0.5">Modalités & individus (M1 ESB)</h4>
          </div>
          <button
            onClick={() => setShowInd((s) => !s)}
            className="text-[11px] px-2 py-1 rounded border border-border hover:bg-secondary transition"
          >
            {showInd ? "Masquer individus" : "Afficher individus"}
          </button>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto bg-surface/40 rounded">
          <line x1={pad} x2={W - pad} y1={H / 2} y2={H / 2} stroke="hsl(var(--border))" strokeDasharray="2 4" />
          <line x1={W / 2} x2={W / 2} y1={pad} y2={H - pad} stroke="hsl(var(--border))" strokeDasharray="2 4" />

          {showInd &&
            r.rowCoords.map((c, i) => (
              <g key={`i${i}`}>
                <circle cx={sx(c[0])} cy={sy(c[1])} r={3} fill="hsl(var(--muted-foreground))" opacity={0.6} />
                <text x={sx(c[0]) + 5} y={sy(c[1]) + 3} fontSize="9" fill="hsl(var(--muted-foreground))">
                  {NAMES[i]}
                </text>
              </g>
            ))}
          {r.colCoords.map((c, j) => {
            const qi = modQuestion(j);
            return (
              <g key={`m${j}`}>
                <rect x={sx(c[0]) - 6} y={sy(c[1]) - 6} width={12} height={12} fill={QCOLORS[qi]} stroke="white" strokeWidth={1.5} />
                <text
                  x={sx(c[0]) + 10} y={sy(c[1]) + 4}
                  fontSize="11" fontFamily="serif" fontWeight="600" fill={QCOLORS[qi]}
                >
                  {r.labels[j]}
                </text>
              </g>
            );
          })}

          <text x={W - pad} y={H / 2 - 6} textAnchor="end" fontSize="10" fill="hsl(var(--primary))" fontWeight="600">
            F1 corr. ({tau1.toFixed(1)}%)
          </text>
          <text x={W / 2 + 6} y={pad + 4} fontSize="10" fill="hsl(var(--primary))" fontWeight="600">
            F2 corr. ({tau2.toFixed(1)}%)
          </text>
        </svg>
        <div className="flex flex-wrap gap-4 mt-3 text-xs">
          {QUESTIONS.map((q, i) => (
            <span key={q} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5" style={{ background: QCOLORS[i] }} /> {q}
            </span>
          ))}
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-muted-foreground/60" /> Étudiants</span>
        </div>
      </div>
    </div>
  );
};

export const ACM_RESP = RESP;
export const ACM_NAMES = NAMES;
export const ACM_QUESTIONS = QUESTIONS;
