// src/lib/graphs/dsatur.js

/**
 * Expected graph format:
 *
 * const graph = {
 *   nodes: ["A", "B", "C", ...],
 *   adj: {
 *     A: ["B", "C"],
 *     B: ["A", "C"],
 *     C: ["A", "B"],
 *     ...
 *   },
 * };
 *
 * Options:
 * - record: boolean (default true)
 * - maxSteps: number (default 5000)
 */
export function dsaturInstrumented(
  graph,
  { record = true, maxSteps = 5000 } = {}
) {
  const nodes = Array.isArray(graph.nodes) ? graph.nodes : [];
  const adj = graph.adj || {};

  const color = {};
  const saturation = {};
  const degree = {};
  const steps = [];

  const stats = {
    coloredCount: 0,
    maxColorIndex: -1,
    tieBreaks: 0,
  };

  const now =
    typeof performance !== "undefined" && performance.now
      ? () => performance.now()
      : () => Date.now();

  const pushStep = (payload) => {
    if (!record) return;
    if (steps.length >= maxSteps) return;
    steps.push(payload);
  };

  // Init structures
  for (const v of nodes) {
    color[v] = null;
    const neigh = adj[v] || [];
    degree[v] = neigh.length;
    saturation[v] = 0;
  }

  const t0 = now();

  let stepCount = 0;
  while (stepCount < maxSteps) {
    stepCount++;
    const uncolored = nodes.filter((v) => color[v] == null);
    if (uncolored.length === 0) break;

    // Select vertex with highest saturation, break ties by highest degree
    uncolored.sort((a, b) => {
      if (saturation[b] !== saturation[a]) return saturation[b] - saturation[a];
      if (degree[b] !== degree[a]) {
        const diff = degree[b] - degree[a];
        if (diff !== 0) stats.tieBreaks += 1;
        return diff;
      }
      return 0;
    });

    const v = uncolored[0];

    // Determine smallest available color not used by its neighbors
    const neighborColors = new Set();
    const neigh = adj[v] || [];
    for (const n of neigh) {
      if (color[n] != null) neighborColors.add(color[n]);
    }

    let c = 0;
    while (neighborColors.has(c)) c++;

    color[v] = c;
    stats.coloredCount += 1;
    stats.maxColorIndex = Math.max(stats.maxColorIndex, c);

    pushStep({
      type: "assign-color",
      node: v,
      colorIndex: c,
      color: { ...color },
      saturation: { ...saturation },
      degree: { ...degree },
    });

    // Update saturation of neighbors
    for (const n of neigh) {
      if (color[n] == null) {
        const coloredNeighbors = new Set(
          (adj[n] || []).map((x) => color[x]).filter((x) => x != null)
        );
        const newSat = coloredNeighbors.size;
        const oldSat = saturation[n];

        if (newSat !== oldSat) {
          saturation[n] = newSat;
          pushStep({
            type: "update-saturation",
            node: n,
            oldValue: oldSat,
            newValue: newSat,
            saturation: { ...saturation },
          });
        }
      }
    }
  }

  const t1 = now();

  stats.colorsUsed = stats.maxColorIndex + 1;
  stats.complexity = {
    bigO: "O(V^2)",
    details:
      "DSATUR uses repeated selection of the most saturated vertex, leading to a quadratic behavior in the number of vertices.",
  };

  return {
    color,
    saturation,
    degree,
    steps,
    stats,
    tookMs: t1 - t0,
  };
}
