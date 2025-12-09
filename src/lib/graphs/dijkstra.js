// src/lib/graphs/dijkstra.js

/**
 * Expected graph format:
 *
 * const graph = {
 *   nodes: ["A", "B", "C", ...],
 *   adj: {
 *     A: [ { to: "B", weight: 3 }, { to: "C", weight: 1 } ],
 *     B: [ { to: "C", weight: 7 }, ... ],
 *     ...
 *   },
 * };
 *
 * Options:
 * - record: boolean (default true)   → store step-by-step states
 * - maxSteps: number (default 5000) → safety limit
 */
export function dijkstraInstrumented(
  graph,
  source,
  { record = true, maxSteps = 5000 } = {}
) {
  const nodes = Array.isArray(graph.nodes) ? graph.nodes : [];

  const dist = {};
  const prev = {};
  const visited = new Set();
  const steps = [];

  // Stats
  const stats = {
    relaxations: 0,
    visitedCount: 0,
    comparisons: 0,
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

  // Init
  for (const v of nodes) {
    dist[v] = Infinity;
    prev[v] = null;
  }
  if (!nodes.includes(source)) {
    // invalid source, return basic structure
    return {
      dist,
      prev,
      steps: [],
      stats: { ...stats, error: "Source node not in graph" },
      tookMs: 0,
    };
  }

  dist[source] = 0;

  // Simple array-based priority queue (small graphs = ok)
  const pq = [{ node: source, dist: 0 }];

  const t0 = now();

  while (pq.length > 0) {
    // Extract-min
    pq.sort((a, b) => a.dist - b.dist);
    const { node: u, dist: du } = pq.shift();

    if (visited.has(u)) continue;
    visited.add(u);
    stats.visitedCount += 1;

    pushStep({
      type: "select-node",
      node: u,
      distance: du,
      dist: { ...dist },
      prev: { ...prev },
      visited: Array.from(visited),
    });

    const neighbors = graph.adj?.[u] || [];
    for (const { to, weight } of neighbors) {
      if (visited.has(to)) continue;

      stats.comparisons += 1;
      const alt = dist[u] + weight;

      if (alt < dist[to]) {
        dist[to] = alt;
        prev[to] = u;
        stats.relaxations += 1;

        pushStep({
          type: "relax-edge",
          from: u,
          to,
          newDist: alt,
          dist: { ...dist },
          prev: { ...prev },
        });

        pq.push({ node: to, dist: alt });
      }
    }
  }

  const t1 = now();

  // Theoretical complexity for display
  stats.complexity = {
    bigO: "O(E log V)",
    details:
      "Using a priority queue, Dijkstra runs in O(E log V) time; here we use a simple array-based queue (small graphs).",
  };

  return {
    dist,
    prev,
    steps,
    stats,
    tookMs: t1 - t0,
  };
}

/**
 * Helper to reconstruct the shortest path from source to target using `prev`.
 * Returns an array of nodes [source, ..., target] or [] if unreachable.
 */
export function reconstructPath(prev, source, target) {
  if (source === undefined || target === undefined) return [];
  const path = [];
  let cur = target;

  while (cur != null) {
    path.push(cur);
    if (cur === source) break;
    cur = prev[cur];
  }

  if (path[path.length - 1] !== source) return []; // no path
  return path.reverse();
}
