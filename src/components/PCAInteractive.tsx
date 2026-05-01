import { useMemo, useState } from "react";

/**
 * Tiny interactive PCA toy: 2D dataset, user rotates a unit vector,
 * we display the projected variance. The optimal angle = first PC.
 */

// Fixed demo dataset (correlated)
const points: [number, number][] = [
  [-3, -2.6], [-2, -1.6], [0, 0.4], [2, 1.4], [3, 2.4],
  [-2.5, -2.1], [1.5, 1.0], [2.6, 2.0], [-1.5, -1.2], [0.5, 0.6],
];

// Compute optimal angle (first PC) via covariance eigen
function optimalAngleDeg(): number {
  let sxx = 0, syy = 0, sxy = 0;
  for (const [x, y] of points) { sxx += x * x; syy += y * y; sxy += x * y; }
  const n = points.length - 1;
  sxx /= n; syy /= n; sxy /= n;
  // angle of largest eigenvector of [[sxx,sxy],[sxy,syy]]
  const theta = 0.5 * Math.atan2(2 * sxy, sxx - syy);
  return (theta * 180) / Math.PI;
}

export const PCAInteractive = () => {
  const [angle, setAngle] = useState(20);
  const opt = useMemo(optimalAngleDeg, []);

  const rad = (angle * Math.PI) / 180;
  const ux = Math.cos(rad), uy = Math.sin(rad);

  // Projected variance
  const projVar = useMemo(() => {
    const projs = points.map(([x, y]) => x * ux + y * uy);
    const m = projs.reduce((a, b) => a + b, 0) / projs.length;
    return projs.reduce((a, b) => a + (b - m) ** 2, 0) / (projs.length - 1);
  }, [ux, uy]);

  const totalVar = useMemo(() => {
    const mx = points.reduce((a, [x]) => a + x, 0) / points.length;
    const my = points.reduce((a, [, y]) => a + y, 0) / points.length;
    let v = 0;
    for (const [x, y] of points) v += (x - mx) ** 2 + (y - my) ** 2;
    return v / (points.length - 1);
  }, []);

  const pct = (projVar / totalVar) * 100;

  // SVG transform: center 200,150, scale 30
  const cx = 200, cy = 150, s = 30;
  const tx = (x: number) => cx + x * s;
  const ty = (y: number) => cy - y * s;

  // Projection points
  const proj = points.map(([x, y]) => {
    const t = x * ux + y * uy;
    return [t * ux, t * uy] as [number, number];
  });

  return (
    <div className="my-8 p-6 rounded-lg border border-border bg-card shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-accent font-semibold">Démo interactive</div>
          <h4 className="font-serif text-lg font-semibold text-primary mt-1">Trouver l'axe qui maximise la variance</h4>
        </div>
        <button
          onClick={() => setAngle(opt)}
          className="text-xs px-3 py-1.5 rounded border border-accent text-accent hover:bg-accent hover:text-accent-foreground transition"
        >
          Solution optimale
        </button>
      </div>

      <div className="grid md:grid-cols-[1fr_220px] gap-6 items-center">
        <svg viewBox="0 0 400 300" className="w-full h-auto bg-surface/40 rounded">
          {/* axes */}
          <line x1={0} y1={cy} x2={400} y2={cy} stroke="hsl(var(--border))" strokeWidth={1.2} />
          <line x1={cx} y1={0} x2={cx} y2={300} stroke="hsl(var(--border))" strokeWidth={1.2} />
          {/* arrows */}
          <polygon points={`395,${cy} 388,${cy-4} 388,${cy+4}`} fill="hsl(var(--muted-foreground))" />
          <polygon points={`${cx},5 ${cx-4},12 ${cx+4},12`} fill="hsl(var(--muted-foreground))" />
          {/* axis labels */}
          <text x={388} y={cy + 16} fontSize="11" fill="hsl(var(--muted-foreground))" textAnchor="end" fontStyle="italic">
            X (Variable 1)
          </text>
          <text x={cx + 8} y={14} fontSize="11" fill="hsl(var(--muted-foreground))" fontStyle="italic">
            Y (Variable 2)
          </text>
          {/* tick marks */}
          {[-4,-2,2,4].map((t) => (
            <g key={`tx${t}`}>
              <line x1={tx(t)} y1={cy-3} x2={tx(t)} y2={cy+3} stroke="hsl(var(--muted-foreground))" />
              <text x={tx(t)} y={cy+14} fontSize="9" fill="hsl(var(--muted-foreground))" textAnchor="middle">{t}</text>
            </g>
          ))}
          {[-4,-2,2,4].map((t) => (
            <g key={`ty${t}`}>
              <line x1={cx-3} y1={ty(t)} x2={cx+3} y2={ty(t)} stroke="hsl(var(--muted-foreground))" />
              <text x={cx-6} y={ty(t)+3} fontSize="9" fill="hsl(var(--muted-foreground))" textAnchor="end">{t}</text>
            </g>
          ))}

          {/* projection lines */}
          {points.map(([x, y], i) => (
            <line
              key={`l${i}`}
              x1={tx(x)} y1={ty(y)}
              x2={tx(proj[i][0])} y2={ty(proj[i][1])}
              stroke="hsl(var(--muted-foreground))" strokeWidth={0.8} strokeDasharray="2 2" opacity={0.5}
            />
          ))}

          {/* the candidate axis (PC1) */}
          <line
            x1={tx(-ux * 5)} y1={ty(-uy * 5)}
            x2={tx(ux * 5)} y2={ty(uy * 5)}
            stroke="hsl(var(--accent))" strokeWidth={2.5}
          />
          <text
            x={tx(ux * 5) + (ux > 0 ? 6 : -6)}
            y={ty(uy * 5) + (uy < 0 ? -6 : 12)}
            fontSize="11" fontWeight="600" fill="hsl(var(--accent))"
            textAnchor={ux > 0 ? "start" : "end"}
          >
            PC1
          </text>

          {/* projected points */}
          {proj.map(([x, y], i) => (
            <circle key={`p${i}`} cx={tx(x)} cy={ty(y)} r={3} fill="hsl(var(--accent))" />
          ))}

          {/* original points */}
          {points.map(([x, y], i) => (
            <circle key={`o${i}`} cx={tx(x)} cy={ty(y)} r={4.5} fill="hsl(var(--primary))" stroke="white" strokeWidth={1.2} />
          ))}
        </svg>

        <div className="space-y-5">
          <div>
            <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-semibold block mb-2">
              Angle de l'axe : <span className="text-accent font-mono">{angle.toFixed(0)}°</span>
            </label>
            <input
              type="range" min={-90} max={90} step={1}
              value={angle} onChange={(e) => setAngle(parseFloat(e.target.value))}
              className="w-full accent-[hsl(var(--accent))]"
            />
          </div>
          <div className="p-4 rounded bg-surface border border-border">
            <div className="text-xs text-muted-foreground mb-1">Variance capturée</div>
            <div className="font-serif text-3xl font-semibold text-primary">{pct.toFixed(1)}%</div>
            <div className="mt-2 h-1.5 bg-muted rounded overflow-hidden">
              <div
                className="h-full bg-gradient-accent transition-all"
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>
            <div className="text-[11px] text-muted-foreground mt-2 italic">
              Optimum : ≈ {opt.toFixed(1)}°
            </div>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-4 italic leading-relaxed">
        Faites pivoter l'axe orange. Les points orange sont les projections des points bleus sur cet axe.
        L'ACP cherche l'angle qui maximise leur dispersion — c'est <em>exactement</em> le premier vecteur propre.
      </p>
    </div>
  );
};
