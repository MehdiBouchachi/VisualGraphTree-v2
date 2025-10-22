// Parse CSV with columns: source,target[,weight]
export function parseEdges(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
  if (!lines.length) return [];
  const header = lines[0].split(",").map((s) => s.trim().toLowerCase());
  const iS = header.indexOf("source");
  const iT = header.indexOf("target");
  const iW = header.indexOf("weight");
  if (iS < 0 || iT < 0)
    throw new Error("CSV must include 'source' and 'target' headers.");
  return lines.slice(1).map((ln) => {
    const cols = ln.split(",");
    return {
      source: String(cols[iS]).trim(),
      target: String(cols[iT]).trim(),
      weight: iW >= 0 ? Number(cols[iW]) : undefined,
    };
  });
}

export function graphMetrics(edges, directed = false) {
  const nodes = new Set();
  const deg = new Map();
  for (const e of edges) {
    nodes.add(e.source);
    nodes.add(e.target);
    deg.set(e.source, (deg.get(e.source) || 0) + 1);
    deg.set(e.target, (deg.get(e.target) || 0) + 1);
  }
  const n = nodes.size,
    m = edges.length;
  const avgDegree = n ? (2 * m) / n : 0;
  const density =
    n <= 1 ? 0 : directed ? m / (n * (n - 1)) : (2 * m) / (n * (n - 1));
  return {
    nodes: n,
    edges: m,
    avgDegree: Number(avgDegree.toFixed(3)),
    density: Number(density.toFixed(3)),
    degrees: Object.fromEntries(deg),
  };
}

// Simple circular layout for SVG
export function circularLayout(nodes, R = 180, cx = 300, cy = 220) {
  const arr = [...nodes];
  const N = arr.length || 1;
  const pos = new Map();
  arr.forEach((id, i) => {
    const a = (2 * Math.PI * i) / N;
    pos.set(id, { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) });
  });
  return pos;
}
