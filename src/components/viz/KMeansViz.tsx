import { useEffect, useMemo, useState } from "react";
import { euclid, gauss, seededRng, type Vec } from "@/lib/linalg";

// Generate 3 visible clusters
function makeData(): Vec[] {
  const rng = seededRng(7);
  const centers: Vec[] = [[2, 2], [8, 3], [5, 8]];
  const pts: Vec[] = [];
  for (const c of centers) {
    for (let i = 0; i < 24; i++) pts.push([c[0] + 0.9 * gauss(rng), c[1] + 0.9 * gauss(rng)]);
  }
  return pts;
}

const COLORS = ["hsl(32 78% 48%)", "hsl(220 65% 45%)", "hsl(145 35% 40%)", "hsl(280 50% 50%)"];

interface Snapshot { centroids: Vec[]; assign: number[]; inertia: number; }

function runKMeans(pts: Vec[], K: number, maxIter = 12): Snapshot[] {
  const rng = seededRng(2);
  // Init: K points spaced far apart (k-means++ light)
  const init: Vec[] = [pts[Math.floor(rng() * pts.length)].slice()];
  while (init.length < K) {
    const dists = pts.map((p) => Math.min(...init.map((c) => euclid(p, c) ** 2)));
    const sum = dists.reduce((a, b) => a + b, 0);
    let r = rng() * sum;
    let idx = 0;
    for (let i = 0; i < dists.length; i++) { r -= dists[i]; if (r <= 0) { idx = i; break; } }
    init.push(pts[idx].slice());
  }

  const snaps: Snapshot[] = [];
  let centroids = init.map((c) => c.slice());
  let assign = new Array(pts.length).fill(0);

  for (let it = 0; it < maxIter; it++) {
    // Assign
    assign = pts.map((p) => {
      let best = 0, bd = Infinity;
      centroids.forEach((c, k) => {
        const d = euclid(p, c);
        if (d < bd) { bd = d; best = k; }
      });
      return best;
    });
    const inertia = pts.reduce((s, p, i) => s + euclid(p, centroids[assign[i]]) ** 2, 0);
    snaps.push({ centroids: centroids.map((c) => c.slice()), assign: assign.slice(), inertia });

    // Update
    const newC: Vec[] = Array.from({ length: K }, () => [0, 0]);
    const counts = new Array(K).fill(0);
    pts.forEach((p, i) => {
      const k = assign[i];
      newC[k][0] += p[0]; newC[k][1] += p[1]; counts[k]++;
    });
    let moved = false;
    for (let k = 0; k < K; k++) {
      if (counts[k] === 0) continue;
      const nx = newC[k][0] / counts[k], ny = newC[k][1] / counts[k];
      if (Math.abs(nx - centroids[k][0]) > 1e-4 || Math.abs(ny - centroids[k][1]) > 1e-4) moved = true;
      centroids[k] = [nx, ny];
    }
    if (!moved) break;
  }
  return snaps;
}

export const KMeansViz = () => {
  const pts = useMemo(makeData, []);
  const [K, setK] = useState(3);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const snaps = useMemo(() => runKMeans(pts, K), [pts, K]);

  useEffect(() => { setStep(0); }, [K]);
  useEffect(() => {
    if (!playing) return;
    if (step >= snaps.length - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setStep((s) => Math.min(s + 1, snaps.length - 1)), 700);
    return () => clearTimeout(t);
  }, [playing, step, snaps.length]);

  const cur = snaps[step];

  // SVG transform
  const W = 460, H = 360, pad = 28;
  const allX = pts.map((p) => p[0]).concat(cur.centroids.map((c) => c[0]));
  const allY = pts.map((p) => p[1]).concat(cur.centroids.map((c) => c[1]));
  const xmin = Math.min(...allX) - 0.5, xmax = Math.max(...allX) + 0.5;
  const ymin = Math.min(...allY) - 0.5, ymax = Math.max(...allY) + 0.5;
  const sx = (x: number) => pad + ((x - xmin) / (xmax - xmin)) * (W - 2 * pad);
  const sy = (y: number) => H - pad - ((y - ymin) / (ymax - ymin)) * (H - 2 * pad);

  return (
    <div className="my-8 p-6 rounded-lg border border-border bg-card shadow-soft">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-accent font-semibold">Démo interactive</div>
          <h4 className="font-serif text-lg font-semibold text-primary mt-1">L'algorithme en direct</h4>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">K =</span>
          {[2, 3, 4].map((k) => (
            <button
              key={k}
              onClick={() => setK(k)}
              className={`w-8 h-8 rounded font-mono text-sm transition ${
                K === k ? "bg-primary text-primary-foreground" : "border border-border hover:bg-secondary"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_220px] gap-6 items-start">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto bg-surface/40 rounded">
          {/* Voronoi-like assignment lines (point → centroid) */}
          {pts.map((p, i) => {
            const c = cur.centroids[cur.assign[i]];
            return (
              <line
                key={`l${i}`}
                x1={sx(p[0])} y1={sy(p[1])}
                x2={sx(c[0])} y2={sy(c[1])}
                stroke={COLORS[cur.assign[i]]}
                strokeWidth={0.5}
                opacity={0.25}
              />
            );
          })}
          {/* points */}
          {pts.map((p, i) => (
            <circle
              key={`p${i}`}
              cx={sx(p[0])} cy={sy(p[1])} r={4}
              fill={COLORS[cur.assign[i]]}
              fillOpacity={0.85}
              stroke="white"
              strokeWidth={0.8}
            />
          ))}
          {/* centroids */}
          {cur.centroids.map((c, k) => (
            <g key={`c${k}`}>
              <circle cx={sx(c[0])} cy={sy(c[1])} r={11} fill={COLORS[k]} stroke="white" strokeWidth={2.5} />
              <text x={sx(c[0])} y={sy(c[1]) + 4} textAnchor="middle" fontSize="11" fill="white" fontWeight="700">
                ×
              </text>
            </g>
          ))}
        </svg>

        <div className="space-y-4">
          <div className="p-4 rounded bg-surface border border-border">
            <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1">Itération</div>
            <div className="font-serif text-3xl font-semibold text-primary">
              {step + 1}<span className="text-base text-muted-foreground"> / {snaps.length}</span>
            </div>
          </div>
          <div className="p-4 rounded bg-surface border border-border">
            <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1">Inertie intra</div>
            <div className="font-serif text-2xl font-semibold text-primary tabular-nums">
              {cur.inertia.toFixed(1)}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1 italic">décroît à chaque itération</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="flex-1 px-3 py-2 text-sm border border-border rounded hover:bg-secondary transition"
            >‹ Préc.</button>
            <button
              onClick={() => setPlaying((p) => !p)}
              className="flex-1 px-3 py-2 text-sm bg-accent text-accent-foreground rounded hover:opacity-90 transition"
            >{playing ? "Pause" : "Lecture"}</button>
            <button
              onClick={() => setStep((s) => Math.min(snaps.length - 1, s + 1))}
              className="flex-1 px-3 py-2 text-sm border border-border rounded hover:bg-secondary transition"
            >Suiv. ›</button>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-4 italic">
        Étape <strong>1</strong> : chaque point est affecté au centroïde le plus proche. Étape <strong>2</strong> : les
        centroïdes sont recalculés comme la moyenne des points de leur cluster. On répète jusqu'à convergence.
      </p>
    </div>
  );
};

// ─── Elbow plot: inertia vs K ──────────────────────────────────────────────
export const ElbowPlot = () => {
  const pts = useMemo(makeData, []);
  const data = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const k = i + 1;
      const snaps = runKMeans(pts, k, 20);
      return { k, inertia: snaps[snaps.length - 1].inertia };
    });
  }, [pts]);

  const W = 480, H = 220, pad = 36;
  const xs = data.map((d) => d.k);
  const maxI = Math.max(...data.map((d) => d.inertia));
  const sx = (k: number) => pad + ((k - 1) / 7) * (W - 2 * pad);
  const sy = (v: number) => H - pad - (v / maxI) * (H - 2 * pad);

  const path = data.map((d, i) => `${i === 0 ? "M" : "L"} ${sx(d.k)} ${sy(d.inertia)}`).join(" ");

  return (
    <div className="my-8 p-6 rounded-lg border border-border bg-card shadow-soft">
      <div className="text-xs uppercase tracking-[0.18em] text-accent font-semibold">Critère du coude</div>
      <h4 className="font-serif text-lg font-semibold text-primary mt-1 mb-4">
        Inertie intra-cluster en fonction de K
      </h4>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="hsl(var(--border))" />
        <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="hsl(var(--border))" />
        <path d={path} fill="none" stroke="hsl(var(--accent))" strokeWidth={2} />
        {data.map((d) => (
          <g key={d.k}>
            <circle cx={sx(d.k)} cy={sy(d.inertia)} r={5} fill="hsl(var(--primary))" stroke="white" strokeWidth={1.5} />
            <text x={sx(d.k)} y={H - pad + 14} fontSize="10" textAnchor="middle" fill="hsl(var(--muted-foreground))">
              K={d.k}
            </text>
          </g>
        ))}
        {/* Coude marker */}
        <circle cx={sx(3)} cy={sy(data[2].inertia)} r={11} fill="none" stroke="hsl(var(--accent))" strokeWidth={1.5} strokeDasharray="3 2" />
        <text x={sx(3) + 14} y={sy(data[2].inertia) - 8} fontSize="10" fill="hsl(var(--accent))" fontWeight="600">
          coude
        </text>
      </svg>
      <p className="text-xs text-muted-foreground italic mt-2">
        Le K optimal se situe à la cassure de la courbe — ici clairement <strong>K = 3</strong>.
      </p>
    </div>
  );
};
