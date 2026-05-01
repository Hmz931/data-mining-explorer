import { useMemo, useState } from "react";
import { sortedEigen, standardize, covariance, type Mat } from "@/lib/linalg";

// ─── Synthetic ESB students dataset (deterministic) ────────────────────
function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
function gauss(r: () => number) {
  const u = 1 - r(), v = 1 - r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const SUBJECTS = [
  "Maths", "Proba", "Stat", "RO",                // axe quanti
  "Programmation", "BDD", "SI", "PL/SQL",        // axe IT
  "Gestion", "Finance", "Marketing", "Projets",  // axe gestion
  "Anglais", "Soft skills", "Séminaire",         // axe communication
];
const FAMILIES = ["math", "math", "math", "math", "it", "it", "it", "it", "mgmt", "mgmt", "mgmt", "mgmt", "comm", "comm", "comm"] as const;
const FAMILY_COLORS: Record<string, string> = {
  math: "hsl(220 65% 45%)",
  it: "hsl(145 35% 40%)",
  mgmt: "hsl(32 78% 48%)",
  comm: "hsl(280 50% 50%)",
};

const STUDENT_NAMES = [
  "Amel", "Yann", "Léa", "Karim", "Inès", "Hugo", "Sami", "Manon", "Théo", "Nora",
  "Élise", "Omar", "Lina", "Paul", "Sara", "Jules", "Anna", "Mehdi", "Clara", "Noah",
  "Eva", "Adam", "Maya", "Léo", "Zoé",
];

function generate() {
  const r = rng(7);
  const N = STUDENT_NAMES.length;
  const data: number[][] = [];
  for (let i = 0; i < N; i++) {
    const profMath = 11 + 3.2 * gauss(r);
    const profIt = 11 + 3 * gauss(r);
    const profMgmt = 12 + 2.6 * gauss(r);
    const profComm = 13 + 1.8 * gauss(r);
    const row = SUBJECTS.map((_, j) => {
      const f = FAMILIES[j];
      const base = f === "math" ? profMath : f === "it" ? profIt : f === "mgmt" ? profMgmt : profComm;
      return Math.max(2, Math.min(20, base + 0.9 * gauss(r)));
    });
    data.push(row);
  }
  return data;
}

// ─── PCA full pipeline ─────────────────────────────────────────────────
function pca(X: Mat) {
  const { Z } = standardize(X);
  const C = covariance(Z); // p × p correlation matrix (since Z standardized)
  const { values, vectors } = sortedEigen(C);
  const totalVar = values.reduce((a, b) => a + b, 0);
  // Scores on first 2 axes
  const scores = Z.map((row) => [0, 1].map((k) => row.reduce((s, z, j) => s + z * vectors[k][j], 0)));
  // Variable correlations with axes (loadings × sqrt(lambda))
  const corrs = SUBJECTS.map((_, j) =>
    [0, 1, 2].map((k) => vectors[k][j] * Math.sqrt(values[k]))
  );
  return { Z, C, eig: values, vectors, totalVar, scores, corrs };
}

interface Props {
  data?: Mat;
}

export const PCAStudentsViz = ({ data }: Props) => {
  const X = useMemo(() => data ?? generate(), [data]);
  const { C, eig, totalVar, scores, corrs } = useMemo(() => pca(X), [X]);
  const [familyFilter, setFamilyFilter] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);

  const explained = eig.map((v) => v / totalVar);
  const cum = explained.reduce<number[]>((acc, v, i) => [...acc, (acc[i - 1] ?? 0) + v], []);
  const kaiserCount = eig.filter((v) => v > 1).length;

  // ── Layout helpers ──
  const W = 460, H = 360, pad = 30;
  const xs = scores.map((s) => s[0]), ys = scores.map((s) => s[1]);
  const xmax = Math.max(...xs.map(Math.abs)) * 1.1;
  const ymax = Math.max(...ys.map(Math.abs)) * 1.1;
  const sx = (x: number) => W / 2 + (x / xmax) * (W / 2 - pad);
  const sy = (y: number) => H / 2 - (y / ymax) * (H / 2 - pad);

  // Correlation circle layout
  const cR = 130, cx = 165, cy = 165;
  const correloMax = Math.max(...C.flat().map(Math.abs));

  return (
    <div className="my-10 space-y-6">
      {/* Scree + Kaiser */}
      <div className="p-6 rounded-lg border border-border bg-card shadow-soft">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-accent font-semibold">Éboulis des valeurs propres</div>
            <h4 className="font-serif text-lg font-semibold text-primary mt-0.5">Critère de Kaiser : λ &gt; 1</h4>
          </div>
          <div className="text-xs text-muted-foreground">
            <span className="font-mono text-primary font-bold">{kaiserCount}</span> axes retenus ·
            cumul {((cum[kaiserCount - 1] ?? 0) * 100).toFixed(1)}%
          </div>
        </div>
        <svg viewBox="0 0 600 220" className="w-full h-auto mt-3">
          {/* Kaiser line at λ=1 */}
          {(() => {
            const yK = 200 - (1 / Math.max(...eig)) * 170;
            return (
              <g>
                <line x1={20} x2={580} y1={yK} y2={yK} stroke="hsl(var(--destructive))" strokeDasharray="4 3" strokeWidth={1.2} />
                <text x={580} y={yK - 4} textAnchor="end" fontSize="10" fill="hsl(var(--destructive))" fontWeight="600">
                  λ = 1 (seuil de Kaiser)
                </text>
              </g>
            );
          })()}
          {eig.map((v, i) => {
            const bw = 560 / eig.length;
            const bh = (v / Math.max(...eig)) * 170;
            const above = v > 1;
            return (
              <g key={i}>
                <rect
                  x={20 + i * bw + 2} y={200 - bh} width={bw - 4} height={bh}
                  fill={above ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                  opacity={above ? 1 : 0.45}
                />
                {i < 8 && (
                  <text x={20 + i * bw + bw / 2} y={200 - bh - 4} textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))">
                    {v.toFixed(2)}
                  </text>
                )}
                <text x={20 + i * bw + bw / 2} y={213} textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))">
                  F{i + 1}
                </text>
              </g>
            );
          })}
        </svg>
        {/* Variance explained table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-[11.5px] font-mono">
            <thead>
              <tr className="bg-surface/70 text-muted-foreground">
                <th className="px-2 py-1.5 text-left">Axe</th>
                {eig.slice(0, 6).map((_, i) => (
                  <th key={i} className="px-2 py-1.5 text-right border-l border-border">F{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border/40">
                <td className="px-2 py-1.5 text-muted-foreground">Valeur propre λ</td>
                {eig.slice(0, 6).map((v, i) => (
                  <td key={i} className={`px-2 py-1.5 text-right border-l border-border/40 tabular-nums ${v > 1 ? "text-primary font-bold" : "text-muted-foreground"}`}>
                    {v.toFixed(3)}
                  </td>
                ))}
              </tr>
              <tr className="border-t border-border/40 bg-surface/30">
                <td className="px-2 py-1.5 text-muted-foreground">% variance</td>
                {explained.slice(0, 6).map((v, i) => (
                  <td key={i} className="px-2 py-1.5 text-right border-l border-border/40 tabular-nums">{(v * 100).toFixed(1)}%</td>
                ))}
              </tr>
              <tr className="border-t border-border/40">
                <td className="px-2 py-1.5 text-muted-foreground">% cumulé</td>
                {cum.slice(0, 6).map((v, i) => (
                  <td key={i} className={`px-2 py-1.5 text-right border-l border-border/40 tabular-nums ${v >= 0.8 ? "text-sage font-bold" : ""}`}>
                    {(v * 100).toFixed(1)}%
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Individuals */}
        <div className="p-6 rounded-lg border border-border bg-card shadow-soft">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-accent font-semibold">Plan factoriel</div>
              <h4 className="font-serif text-lg font-semibold text-primary mt-0.5">Étudiants ESB</h4>
            </div>
            <button
              onClick={() => setShowLabels((s) => !s)}
              className="text-[11px] px-2 py-1 rounded border border-border hover:bg-secondary transition"
            >
              {showLabels ? "Masquer noms" : "Afficher noms"}
            </button>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto bg-surface/40 rounded">
            <line x1={pad} x2={W - pad} y1={H / 2} y2={H / 2} stroke="hsl(var(--border))" strokeDasharray="2 4" />
            <line x1={W / 2} x2={W / 2} y1={pad} y2={H - pad} stroke="hsl(var(--border))" strokeDasharray="2 4" />
            {scores.map((s, i) => (
              <g key={i}>
                <circle cx={sx(s[0])} cy={sy(s[1])} r={5} fill="hsl(var(--accent))" stroke="white" strokeWidth={1.2} />
                {showLabels && (
                  <text x={sx(s[0]) + 7} y={sy(s[1]) + 3} fontSize="9.5" fill="hsl(var(--primary))" fontWeight="500">
                    {STUDENT_NAMES[i]}
                  </text>
                )}
              </g>
            ))}
            <text x={W - pad} y={H / 2 - 5} textAnchor="end" fontSize="10" fill="hsl(var(--primary))" fontWeight="600">
              F1 ({(explained[0] * 100).toFixed(1)}%)
            </text>
            <text x={W / 2 + 5} y={pad - 4} fontSize="10" fill="hsl(var(--primary))" fontWeight="600">
              F2 ({(explained[1] * 100).toFixed(1)}%)
            </text>
          </svg>
        </div>

        {/* Correlation circle */}
        <div className="p-6 rounded-lg border border-border bg-card shadow-soft">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-accent font-semibold">Cercle des corrélations</div>
              <h4 className="font-serif text-lg font-semibold text-primary mt-0.5">Variables vs F1, F2</h4>
            </div>
            <div className="flex gap-1">
              {(["math", "it", "mgmt", "comm"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFamilyFilter(familyFilter === f ? null : f)}
                  className={`text-[10px] px-1.5 py-1 rounded border transition ${
                    familyFilter === f ? "border-accent bg-accent/15" : "border-border hover:bg-secondary"
                  }`}
                  style={{ color: FAMILY_COLORS[f] }}
                >
                  ● {f}
                </button>
              ))}
            </div>
          </div>
          <svg viewBox="0 0 330 330" className="w-full h-auto bg-surface/40 rounded">
            <circle cx={cx} cy={cy} r={cR} fill="none" stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <circle cx={cx} cy={cy} r={cR * 0.7} fill="none" stroke="hsl(var(--border))" strokeDasharray="2 5" opacity={0.5} />
            <line x1={20} y1={cy} x2={310} y2={cy} stroke="hsl(var(--border))" />
            <line x1={cx} y1={20} x2={cx} y2={310} stroke="hsl(var(--border))" />
            {SUBJECTS.map((s, j) => {
              const f = FAMILIES[j];
              if (familyFilter && familyFilter !== f) return null;
              const lx = corrs[j][0], ly = corrs[j][1];
              const ex = cx + lx * cR;
              const ey = cy - ly * cR;
              const color = FAMILY_COLORS[f];
              const quality = lx * lx + ly * ly; // cos²
              return (
                <g key={s} opacity={Math.max(0.4, quality)}>
                  <line x1={cx} y1={cy} x2={ex} y2={ey} stroke={color} strokeWidth={1.6} />
                  <polygon points={`${ex},${ey} ${ex - 4},${ey + 2} ${ex - 2},${ey - 3}`} fill={color}
                    transform={`rotate(${(Math.atan2(-ly, lx) * 180) / Math.PI}, ${ex}, ${ey})`} />
                  <text
                    x={ex + (lx >= 0 ? 5 : -5)} y={ey + (ly >= 0 ? -5 : 10)}
                    fontSize="9.5" fill={color} fontWeight="600"
                    textAnchor={lx >= 0 ? "start" : "end"}
                  >
                    {s}
                  </text>
                </g>
              );
            })}
            <text x={300} y={cy - 4} textAnchor="end" fontSize="9" fill="hsl(var(--muted-foreground))">F1 →</text>
            <text x={cx + 4} y={28} fontSize="9" fill="hsl(var(--muted-foreground))">F2 ↑</text>
          </svg>
          <p className="text-[11px] text-muted-foreground italic mt-2">
            Coordonnées d'une variable = (corr(var, F1), corr(var, F2)). Vecteur long = bien représentée.
          </p>
        </div>
      </div>

      {/* Correlogram */}
      <div className="p-6 rounded-lg border border-border bg-card shadow-soft">
        <div className="text-xs uppercase tracking-[0.18em] text-accent font-semibold">Correlogramme</div>
        <h4 className="font-serif text-lg font-semibold text-primary mt-0.5 mb-3">Matrice de corrélation des matières</h4>
        <div className="overflow-x-auto -mx-2 px-2">
          <svg viewBox={`0 0 ${SUBJECTS.length * 26 + 110} ${SUBJECTS.length * 26 + 30}`} className="h-auto" style={{ minWidth: 520, width: "100%" }}>
          {SUBJECTS.map((s, i) => (
            <text key={`r${i}`} x={108} y={30 + i * 26 + 16} textAnchor="end" fontSize="9.5" fill={FAMILY_COLORS[FAMILIES[i]]} fontWeight="600">
              {s}
            </text>
          ))}
          {SUBJECTS.map((s, j) => (
            <text key={`c${j}`} x={110 + j * 26 + 13} y={20} textAnchor="middle" fontSize="9.5" fill={FAMILY_COLORS[FAMILIES[j]]} fontWeight="600"
              transform={`rotate(-45, ${110 + j * 26 + 13}, 20)`}>
              {s}
            </text>
          ))}
          {C.map((row, i) =>
            row.map((v, j) => {
              const t = v / correloMax;
              const fill =
                v > 0
                  ? `hsl(220 65% ${50 - t * 30}%)`
                  : `hsl(0 60% ${60 + t * 25}%)`;
              return (
                <g key={`${i}${j}`}>
                  <rect x={110 + j * 26} y={30 + i * 26} width={24} height={24} fill={fill} opacity={Math.abs(v) * 0.85 + 0.1} />
                  <text x={110 + j * 26 + 12} y={30 + i * 26 + 16} textAnchor="middle" fontSize="8.5"
                    fill={Math.abs(v) > 0.5 ? "white" : "hsl(var(--foreground))"}>
                    {v.toFixed(2)}
                  </text>
                </g>
              );
            })
          )}
        </svg>
        <p className="text-[11px] text-muted-foreground italic mt-2">
          Bleu = corrélation positive, rouge = négative. Les blocs diagonaux par famille (Maths, IT, Gestion, Com.) confirment la structure latente.
        </p>
      </div>
    </div>
  );
};

// Export utility so the page can show df.head()
export const ESB_PCA_DATA = generate();
export const ESB_SUBJECTS = SUBJECTS;
export const ESB_NAMES = STUDENT_NAMES;
