// Lightweight numerical helpers used across method visualizations.
// Keep this file dependency-free.

export type Vec = number[];
export type Mat = number[][];

export function mean(v: Vec): number {
  return v.reduce((a, b) => a + b, 0) / v.length;
}
export function variance(v: Vec): number {
  const m = mean(v);
  return v.reduce((a, b) => a + (b - m) ** 2, 0) / v.length;
}
export function std(v: Vec): number {
  return Math.sqrt(variance(v)) || 1;
}

export function transpose(A: Mat): Mat {
  const r = A.length, c = A[0].length;
  const T: Mat = Array.from({ length: c }, () => Array(r).fill(0));
  for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) T[j][i] = A[i][j];
  return T;
}

export function matmul(A: Mat, B: Mat): Mat {
  const r = A.length, m = A[0].length, c = B[0].length;
  const C: Mat = Array.from({ length: r }, () => Array(c).fill(0));
  for (let i = 0; i < r; i++)
    for (let k = 0; k < m; k++)
      for (let j = 0; j < c; j++) C[i][j] += A[i][k] * B[k][j];
  return C;
}

export function standardize(X: Mat): { Z: Mat; means: Vec; stds: Vec } {
  const n = X.length, p = X[0].length;
  const means = Array(p).fill(0), stds = Array(p).fill(0);
  for (const row of X) row.forEach((v, j) => (means[j] += v));
  means.forEach((_, j) => (means[j] /= n));
  for (const row of X) row.forEach((v, j) => (stds[j] += (v - means[j]) ** 2));
  stds.forEach((_, j) => (stds[j] = Math.sqrt(stds[j] / n) || 1));
  const Z = X.map((r) => r.map((v, j) => (v - means[j]) / stds[j]));
  return { Z, means, stds };
}

export function covariance(Z: Mat): Mat {
  const n = Z.length, p = Z[0].length;
  const C: Mat = Array.from({ length: p }, () => Array(p).fill(0));
  for (let i = 0; i < p; i++)
    for (let j = 0; j < p; j++) {
      let s = 0;
      for (let k = 0; k < n; k++) s += Z[k][i] * Z[k][j];
      C[i][j] = s / (n - 1);
    }
  return C;
}

// Jacobi eigen-decomposition for symmetric matrices.
export function jacobi(A: Mat, maxSweeps = 100, tol = 1e-10) {
  const n = A.length;
  const M: Mat = A.map((r) => r.slice());
  const V: Mat = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  );
  for (let s = 0; s < maxSweeps; s++) {
    let off = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += M[i][j] ** 2;
    if (Math.sqrt(off) < tol) break;
    for (let p = 0; p < n - 1; p++)
      for (let q = p + 1; q < n; q++) {
        const apq = M[p][q];
        if (Math.abs(apq) < 1e-14) continue;
        const theta = (M[q][q] - M[p][p]) / (2 * apq);
        const t = Math.sign(theta) / (Math.abs(theta) + Math.sqrt(1 + theta * theta));
        const c = 1 / Math.sqrt(1 + t * t);
        const sn = t * c;
        const app = M[p][p], aqq = M[q][q];
        M[p][p] = app - t * apq;
        M[q][q] = aqq + t * apq;
        M[p][q] = M[q][p] = 0;
        for (let i = 0; i < n; i++) {
          if (i !== p && i !== q) {
            const aip = M[i][p], aiq = M[i][q];
            M[i][p] = M[p][i] = c * aip - sn * aiq;
            M[i][q] = M[q][i] = sn * aip + c * aiq;
          }
          const vip = V[i][p], viq = V[i][q];
          V[i][p] = c * vip - sn * viq;
          V[i][q] = sn * vip + c * viq;
        }
      }
  }
  const values = M.map((r, i) => r[i]);
  return { values, vectors: V };
}

export function sortedEigen(C: Mat) {
  const { values, vectors } = jacobi(C);
  const order = values.map((v, i) => [v, i] as const).sort((a, b) => b[0] - a[0]).map((x) => x[1]);
  return {
    values: order.map((i) => values[i]),
    vectors: order.map((i) => vectors.map((row) => row[i])), // each entry = a vector
  };
}

export function seededRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function gauss(rng: () => number) {
  const u = 1 - rng(), v = 1 - rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function euclid(a: Vec, b: Vec): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += (a[i] - b[i]) ** 2;
  return Math.sqrt(s);
}
