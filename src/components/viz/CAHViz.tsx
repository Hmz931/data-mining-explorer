import { useMemo, useState } from "react";
import { euclid, type Vec } from "@/lib/linalg";

// Small dataset of 10 points in 2D, easy to read in dendrogram
const POINTS: { name: string; x: number; y: number }[] = [
  { name: "A", x: 1, y: 1 },
  { name: "B", x: 1.5, y: 1.8 },
  { name: "C", x: 5, y: 8 },
  { name: "D", x: 8, y: 8 },
  { name: "E", x: 1, y: 0.6 },
  { name: "F", x: 9, y: 11 },
  { name: "G", x: 8, y: 2 },
  { name: "H", x: 10, y: 2 },
  { name: "I", x: 9, y: 3 },
  { name: "J", x: 6, y: 9 },
];

type Linkage = "single" | "complete" | "average" | "ward";

interface Node {
  id: number;
  members: number[]; // indices into POINTS
  height: number;
  left?: Node;
  right?: Node;
  // for centroid/ward
  centroid: Vec;
  size: number;
}

function clusterDist(A: Node, B: Node, link: Linkage, ptArr: Vec[]): number {
  if (link === "ward") {
    const d2 = euclid(A.centroid, B.centroid) ** 2;
    return Math.sqrt((A.size * B.size / (A.size + B.size)) * d2);
  }
  const dists: number[] = [];
  for (const i of A.members) for (const j of B.members) dists.push(euclid(ptArr[i], ptArr[j]));
  if (link === "single") return Math.min(...dists);
  if (link === "complete") return Math.max(...dists);
  return dists.reduce((a, b) => a + b, 0) / dists.length; // average
}

function buildDendrogram(link: Linkage) {
  const ptArr: Vec[] = POINTS.map((p) => [p.x, p.y]);
  let nextId = POINTS.length;
  let clusters: Node[] = POINTS.map((_, i) => ({
    id: i,
    members: [i],
    height: 0,
    centroid: [POINTS[i].x, POINTS[i].y],
    size: 1,
  }));

  const merges: { height: number; size: number }[] = [];

  while (clusters.length > 1) {
    let bestI = 0, bestJ = 1, bestD = Infinity;
    for (let i = 0; i < clusters.length; i++)
      for (let j = i + 1; j < clusters.length; j++) {
        const d = clusterDist(clusters[i], clusters[j], link, ptArr);
        if (d < bestD) { bestD = d; bestI = i; bestJ = j; }
      }
    const A = clusters[bestI], B = clusters[bestJ];
    const newSize = A.size + B.size;
    const cx = (A.centroid[0] * A.size + B.centroid[0] * B.size) / newSize;
    const cy = (A.centroid[1] * A.size + B.centroid[1] * B.size) / newSize;
    const merged: Node = {
      id: nextId++,
      members: [...A.members, ...B.members],
      height: bestD,
      left: A,
      right: B,
      centroid: [cx, cy],
      size: newSize,
    };
    merges.push({ height: bestD, size: newSize });
    clusters = clusters.filter((_, k) => k !== bestI && k !== bestJ).concat(merged);
  }
  return { root: clusters[0], merges };
}

// Layout dendrogram: leaves get x positions in left-to-right order of traversal
interface Layout {
  x: number; // svg
  y: number;
  width: number;
  branches: { x1: number; x2: number; y1: number; y2: number }[];
  leaves: { x: number; y: number; name: string }[];
}

function layoutTree(root: Node, W: number, H: number, padX = 30, padY = 20, threshold?: number) {
  // Get leaf order
  const leafOrder: number[] = [];
  function traverse(n: Node) {
    if (!n.left && !n.right) { leafOrder.push(n.members[0]); return; }
    traverse(n.left!); traverse(n.right!);
  }
  traverse(root);

  const maxH = root.height || 1;
  const xOf = (idx: number) => padX + (idx / (leafOrder.length - 1)) * (W - 2 * padX);
  const yOf = (h: number) => H - padY - (h / maxH) * (H - 2 * padY);

  const branches: Layout["branches"] = [];

  // Color by threshold cut
  function placement(n: Node): { x: number; y: number; cluster: number | null } {
    if (!n.left && !n.right) {
      const li = leafOrder.indexOf(n.members[0]);
      return { x: xOf(li), y: yOf(0), cluster: null };
    }
    const L = placement(n.left!);
    const R = placement(n.right!);
    const my = yOf(n.height);
    branches.push({ x1: L.x, x2: L.x, y1: L.y, y2: my });
    branches.push({ x1: R.x, x2: R.x, y1: R.y, y2: my });
    branches.push({ x1: L.x, x2: R.x, y1: my, y2: my });
    return { x: (L.x + R.x) / 2, y: my, cluster: null };
  }
  placement(root);

  const leaves = leafOrder.map((idx) => ({
    x: xOf(leafOrder.indexOf(idx)),
    y: yOf(0),
    name: POINTS[idx].name,
  }));

  return { branches, leaves, yOf, maxH };
}

const COLORS = ["hsl(32 78% 48%)", "hsl(220 65% 45%)", "hsl(145 35% 40%)", "hsl(280 50% 50%)", "hsl(0 60% 50%)"];

// Determine cluster id of each leaf when cutting at given threshold
function cutClusters(root: Node, threshold: number): Map<number, number> {
  const map = new Map<number, number>();
  let counter = 0;
  function visit(n: Node) {
    if (!n.left || !n.right || n.height <= threshold) {
      const c = counter++;
      n.members.forEach((m) => map.set(m, c));
      return;
    }
    visit(n.left); visit(n.right);
  }
  visit(root);
  return map;
}

export const CAHViz = () => {
  const [link, setLink] = useState<Linkage>("ward");
  const { root } = useMemo(() => buildDendrogram(link), [link]);
  const maxH = root.height;
  const [threshold, setThreshold] = useState(maxH * 0.45);

  // when linkage changes, reset threshold proportionally
  useMemo(() => setThreshold(root.height * 0.45), [link, root.height]);

  const W = 560, H = 280;
  const layout = useMemo(() => layoutTree(root, W, H), [root]);
  const cuts = useMemo(() => cutClusters(root, threshold), [root, threshold]);

  // For scatter plot: color points by cluster
  const ptW = 280, ptH = 280, pad = 24;
  const xs = POINTS.map((p) => p.x), ys = POINTS.map((p) => p.y);
  const xmin = Math.min(...xs) - 1, xmax = Math.max(...xs) + 1;
  const ymin = Math.min(...ys) - 1, ymax = Math.max(...ys) + 1;
  const psx = (x: number) => pad + ((x - xmin) / (xmax - xmin)) * (ptW - 2 * pad);
  const psy = (y: number) => ptH - pad - ((y - ymin) / (ymax - ymin)) * (ptH - 2 * pad);

  const thresholdY = layout.yOf(threshold);

  return (
    <div className="my-8 p-6 rounded-lg border border-border bg-card shadow-soft">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-accent font-semibold">Démo interactive</div>
          <h4 className="font-serif text-lg font-semibold text-primary mt-1">Dendrogramme & coupure</h4>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {(["single", "complete", "average", "ward"] as Linkage[]).map((l) => (
            <button
              key={l}
              onClick={() => setLink(l)}
              className={`px-3 py-1.5 text-xs rounded font-medium transition ${
                link === l ? "bg-primary text-primary-foreground" : "border border-border hover:bg-secondary"
              }`}
            >
              {l === "single" ? "Lien min." : l === "complete" ? "Lien max." : l === "average" ? "Lien moy." : "Ward"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6 items-center">
        {/* Dendrogram */}
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto bg-surface/40 rounded">
          {/* threshold line */}
          <line
            x1={20} x2={W - 20}
            y1={thresholdY} y2={thresholdY}
            stroke="hsl(var(--accent))"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          <text x={W - 22} y={thresholdY - 4} textAnchor="end" fontSize="9" fill="hsl(var(--accent))" fontWeight="600">
            seuil
          </text>

          {layout.branches.map((b, i) => {
            // color: if both endpoints below threshold and merge height ≤ threshold → cluster color
            const aboveThreshold = Math.min(b.y1, b.y2) < thresholdY; // higher on screen = bigger height
            const stroke = aboveThreshold ? "hsl(var(--muted-foreground))" : "hsl(var(--primary))";
            return <line key={i} x1={b.x1} x2={b.x2} y1={b.y1} y2={b.y2} stroke={stroke} strokeWidth={1.5} />;
          })}
          {layout.leaves.map((l, i) => {
            const idx = POINTS.findIndex((p) => p.name === l.name);
            const c = cuts.get(idx) ?? 0;
            return (
              <g key={i}>
                <circle cx={l.x} cy={l.y} r={4.5} fill={COLORS[c % COLORS.length]} stroke="white" strokeWidth={1.2} />
                <text x={l.x} y={l.y + 16} textAnchor="middle" fontSize="11" fontFamily="monospace" fill="hsl(var(--primary))">
                  {l.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Scatter */}
        <div>
          <svg viewBox={`0 0 ${ptW} ${ptH}`} className="w-full h-auto bg-surface/40 rounded">
            {POINTS.map((p, i) => {
              const c = cuts.get(i) ?? 0;
              return (
                <g key={p.name}>
                  <circle cx={psx(p.x)} cy={psy(p.y)} r={6} fill={COLORS[c % COLORS.length]} stroke="white" strokeWidth={1.5} />
                  <text x={psx(p.x) + 8} y={psy(p.y) + 4} fontSize="10" fontFamily="monospace" fill="hsl(var(--primary))">
                    {p.name}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="mt-3">
            <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-semibold block mb-2">
              Hauteur de coupure : <span className="font-mono text-accent">{threshold.toFixed(2)}</span>
              <span className="text-foreground/60 ml-2">→ {Math.max(...Array.from(cuts.values())) + 1} clusters</span>
            </label>
            <input
              type="range" min={0.01} max={maxH} step={maxH / 100}
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full accent-[hsl(var(--accent))]"
            />
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground italic mt-4">
        Bougez le seuil pour couper le dendrogramme à différentes hauteurs. Le critère de Ward minimise la perte
        d'inertie ; les liens « min » et « max » utilisent les extrêmes des distances entre paires.
      </p>
    </div>
  );
};
