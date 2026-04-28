import { useMemo } from "react";

// Synthetic students dataset (same spirit as the notebook), computed deterministically
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}
function gauss(rng: () => number) {
  const u = 1 - rng(), v = 1 - rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const subjects = ["Gestion","Maths","SI","Finance","Proba","BDD","Marketing","Analyse stat","Programmation","Gestion projets","Innovation","RO","PL/SQL","SID","KM","Veille","Soft skills","Séminaire","Anglais"];
const groups: Record<number, "math" | "mgmt" | "it" | "comm"> = {
  0:"mgmt",1:"math",2:"it",3:"mgmt",4:"math",5:"it",6:"mgmt",7:"math",8:"it",9:"mgmt",10:"mgmt",11:"math",12:"it",13:"it",14:"mgmt",15:"mgmt",16:"comm",17:"comm",18:"comm",
};

function generateData(n = 25) {
  const rng = seededRandom(42);
  const skills = Array.from({ length: n }, () => ({
    math: 12 + 3 * gauss(rng),
    mgmt: 11 + 2.5 * gauss(rng),
    it: 12 + 2.8 * gauss(rng),
    comm: 13 + 2 * gauss(rng),
  }));
  return skills.map((s) =>
    subjects.map((_, j) => {
      const g = groups[j];
      const base = g === "math" ? s.math : g === "mgmt" ? s.mgmt : g === "it" ? s.it : s.comm;
      return Math.max(0, Math.min(20, base + gauss(rng)));
    })
  );
}

// Standardize then PCA via power iteration on covariance to get top-2 components.
// For a 19x19 cov it's fine to do full Jacobi-like... but we just compute via covariance + 2 deflated power iterations.
function pca(data: number[][]) {
  const n = data.length, p = data[0].length;
  const mean = Array(p).fill(0);
  for (const row of data) row.forEach((v, j) => (mean[j] += v));
  mean.forEach((_, j) => (mean[j] /= n));
  const std = Array(p).fill(0);
  for (const row of data) row.forEach((v, j) => (std[j] += (v - mean[j]) ** 2));
  std.forEach((_, j) => (std[j] = Math.sqrt(std[j] / n) || 1));
  const Z = data.map((row) => row.map((v, j) => (v - mean[j]) / std[j]));

  // Cov = Z^T Z / (n-1)
  const C: number[][] = Array.from({ length: p }, () => Array(p).fill(0));
  for (let i = 0; i < p; i++) {
    for (let j = 0; j < p; j++) {
      let s = 0;
      for (let k = 0; k < n; k++) s += Z[k][i] * Z[k][j];
      C[i][j] = s / (n - 1);
    }
  }

  // Compute all eigenvalues/vectors via Jacobi rotation
  const { values, vectors } = jacobi(C);
  // Sort desc
  const order = values.map((v, i) => [v, i] as const).sort((a, b) => b[0] - a[0]).map((x) => x[1]);
  const eigVals = order.map((i) => values[i]);
  const eigVecs = order.map((i) => vectors.map((row) => row[i])); // each entry = vector

  const scores = Z.map((row) => eigVecs.slice(0, 2).map((v) => row.reduce((s, z, k) => s + z * v[k], 0)));
  const totalVar = eigVals.reduce((a, b) => a + b, 0);
  return { eigVals, eigVecs, scores, totalVar, loadings: eigVecs.slice(0, 2) };
}

function jacobi(A: number[][], maxSweeps = 100, tol = 1e-10) {
  const n = A.length;
  const M = A.map((r) => r.slice());
  const V: number[][] = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
  for (let sweep = 0; sweep < maxSweeps; sweep++) {
    let off = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += M[i][j] ** 2;
    if (Math.sqrt(off) < tol) break;
    for (let p = 0; p < n - 1; p++) {
      for (let q = p + 1; q < n; q++) {
        const apq = M[p][q];
        if (Math.abs(apq) < 1e-14) continue;
        const theta = (M[q][q] - M[p][p]) / (2 * apq);
        const t = Math.sign(theta) / (Math.abs(theta) + Math.sqrt(1 + theta * theta));
        const c = 1 / Math.sqrt(1 + t * t);
        const s = t * c;
        const app = M[p][p], aqq = M[q][q];
        M[p][p] = app - t * apq;
        M[q][q] = aqq + t * apq;
        M[p][q] = M[q][p] = 0;
        for (let i = 0; i < n; i++) {
          if (i !== p && i !== q) {
            const aip = M[i][p], aiq = M[i][q];
            M[i][p] = M[p][i] = c * aip - s * aiq;
            M[i][q] = M[q][i] = s * aip + c * aiq;
          }
          const vip = V[i][p], viq = V[i][q];
          V[i][p] = c * vip - s * viq;
          V[i][q] = s * vip + c * viq;
        }
      }
    }
  }
  const values = M.map((r, i) => r[i]);
  return { values, vectors: V };
}

export const PCAStudentsViz = () => {
  const { eigVals, scores, loadings, totalVar } = useMemo(() => {
    const data = generateData(25);
    return pca(data);
  }, []);

  const explained = eigVals.map((v) => v / totalVar);

  // Bounds
  const xs = scores.map((s) => s[0]);
  const ys = scores.map((s) => s[1]);
  const xmin = Math.min(...xs), xmax = Math.max(...xs);
  const ymin = Math.min(...ys), ymax = Math.max(...ys);
  const pad = 0.5;
  const w = 480, h = 380;
  const sx = (x: number) => 40 + ((x - xmin + pad) / (xmax - xmin + 2 * pad)) * (w - 60);
  const sy = (y: number) => h - 30 - ((y - ymin + pad) / (ymax - ymin + 2 * pad)) * (h - 60);

  // Correlation circle scaling
  const rad = 130, ccx = 160, ccy = 160;

  return (
    <div className="my-10 grid lg:grid-cols-2 gap-6">
      {/* Scree plot */}
      <div className="lg:col-span-2 p-6 rounded-lg border border-border bg-card shadow-soft">
        <h4 className="font-serif text-lg font-semibold text-primary mb-1">Éboulis des valeurs propres</h4>
        <p className="text-xs text-muted-foreground mb-4">
          Variance expliquée par chaque composante (en %). Le critère du coude suggère 3 à 4 composantes.
        </p>
        <svg viewBox="0 0 600 200" className="w-full h-auto">
          {explained.map((e, i) => {
            const bw = 580 / explained.length;
            const bh = e * 600;
            return (
              <g key={i}>
                <rect
                  x={10 + i * bw + 2}
                  y={180 - bh}
                  width={bw - 4}
                  height={bh}
                  fill="hsl(var(--primary))"
                  opacity={i < 4 ? 1 : 0.35}
                />
                {i < 6 && (
                  <text
                    x={10 + i * bw + bw / 2}
                    y={180 - bh - 4}
                    textAnchor="middle"
                    fontSize="9"
                    fill="hsl(var(--muted-foreground))"
                  >
                    {(e * 100).toFixed(1)}%
                  </text>
                )}
                <text x={10 + i * bw + bw / 2} y={195} textAnchor="middle" fontSize="8" fill="hsl(var(--muted-foreground))">
                  PC{i + 1}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Individuals plot */}
      <div className="p-6 rounded-lg border border-border bg-card shadow-soft">
        <h4 className="font-serif text-lg font-semibold text-primary mb-1">Projection des étudiants</h4>
        <p className="text-xs text-muted-foreground mb-4">
          Plan PC1 × PC2 — chaque point représente un étudiant.
        </p>
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto bg-surface/40 rounded">
          <line x1={40} y1={(sy(0))} x2={w - 20} y2={sy(0)} stroke="hsl(var(--border))" strokeDasharray="2 4" />
          <line x1={sx(0)} y1={10} x2={sx(0)} y2={h - 30} stroke="hsl(var(--border))" strokeDasharray="2 4" />
          {scores.map((s, i) => (
            <g key={i}>
              <circle cx={sx(s[0])} cy={sy(s[1])} r={4} fill="hsl(var(--accent))" stroke="white" strokeWidth={1} />
              <text x={sx(s[0]) + 6} y={sy(s[1]) + 3} fontSize="8" fill="hsl(var(--muted-foreground))">
                E{i + 1}
              </text>
            </g>
          ))}
          <text x={w - 20} y={sy(0) - 5} textAnchor="end" fontSize="10" fill="hsl(var(--primary))" fontWeight="600">
            PC1 ({(explained[0] * 100).toFixed(1)}%)
          </text>
          <text x={sx(0) + 5} y={15} fontSize="10" fill="hsl(var(--primary))" fontWeight="600">
            PC2 ({(explained[1] * 100).toFixed(1)}%)
          </text>
        </svg>
      </div>

      {/* Correlation circle */}
      <div className="p-6 rounded-lg border border-border bg-card shadow-soft">
        <h4 className="font-serif text-lg font-semibold text-primary mb-1">Cercle des corrélations</h4>
        <p className="text-xs text-muted-foreground mb-4">
          Position des matières dans le plan factoriel. Vecteurs proches = corrélés ; opposés = anti-corrélés.
        </p>
        <svg viewBox="0 0 320 320" className="w-full h-auto bg-surface/40 rounded">
          <circle cx={ccx} cy={ccy} r={rad} fill="none" stroke="hsl(var(--border))" strokeDasharray="3 3" />
          <line x1={20} y1={ccy} x2={300} y2={ccy} stroke="hsl(var(--border))" />
          <line x1={ccx} y1={20} x2={ccx} y2={300} stroke="hsl(var(--border))" />
          {subjects.map((sub, i) => {
            const lx = loadings[0][i], ly = loadings[1][i];
            const ex = ccx + lx * rad;
            const ey = ccy - ly * rad;
            const colors = { math: "hsl(220 65% 45%)", mgmt: "hsl(var(--accent))", it: "hsl(var(--sage))", comm: "hsl(280 50% 50%)" };
            const c = colors[groups[i]];
            return (
              <g key={sub}>
                <line x1={ccx} y1={ccy} x2={ex} y2={ey} stroke={c} strokeWidth={1.4} opacity={0.8} />
                <circle cx={ex} cy={ey} r={2.5} fill={c} />
                <text x={ex + (lx >= 0 ? 4 : -4) * 1} y={ey + (ly >= 0 ? -4 : 8)} fontSize="8.5" fill="hsl(var(--primary))" textAnchor={lx >= 0 ? "start" : "end"}>
                  {sub}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="flex flex-wrap gap-3 mt-3 text-[10px]">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: "hsl(220 65% 45%)" }} />Maths</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-accent" />Gestion</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sage" />SI</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: "hsl(280 50% 50%)" }} />Communication</span>
        </div>
      </div>
    </div>
  );
};
