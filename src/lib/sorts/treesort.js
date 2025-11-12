// Tri ABR
export function treeSortInstrumented(
  input,
  { order = "asc", record = true, maxSteps = 200000 } = {}
) {
  const src = Array.isArray(input) ? input.slice() : [];
  const cmp = order === "asc" ? (a, b) => a - b : (a, b) => b - a;

  const steps = [];
  const stats = {
    inserts: 0,
    traversals: 0,
    comparisons: 0,
    swaps: 0,
    maxDepth: 0,
  };

  // Snapshot helper: ALWAYS push the current visible array
  const push = (a, payload = {}) => {
    if (!record || steps.length >= maxSteps) return;
    steps.push({ a: a.slice(), ...payload });
  };

  const t0 = performance.now();

  /* ---------- BST build ---------- */
  function Node(v) {
    this.v = v;
    this.l = null;
    this.r = null;
  }
  let root = null;

  function insert(node, v, depth) {
    stats.comparisons++;
    if (!node) {
      stats.inserts++;
      stats.maxDepth = Math.max(stats.maxDepth, depth);
      return new Node(v);
    }
    // Visualize the decision at this node (compare with node.v)
    // We only log meta here; the bars animation will happen later during the "write/swap" phase.
    if (cmp(v, node.v) <= 0) node.l = insert(node.l, v, depth + 1);
    else node.r = insert(node.r, v, depth + 1);
    return node;
  }

  for (const v of src) root = insert(root, v, 1);

  /* ---------- Visualization buffer ---------- */
  // Start from the original bars and progressively "place" the next smallest into index k
  const vis = src.slice();
  push(vis, { action: "init" });

  // Collect the sorted sequence using an in-order traversal
  const sortedSeq = [];
  (function inorder(n) {
    if (!n) return;
    inorder(n.l);
    sortedSeq.push(n.v);
    stats.traversals++;
    inorder(n.r);
  })(root);

  if (order === "desc") sortedSeq.reverse();

  /* ---------- Simulate swaps to place each next sorted value ---------- */
  let k = 0;
  for (const target of sortedSeq) {
    // Find where the target currently lives in the visible array
    let pos = -1;
    for (let i = k; i < vis.length; i++) {
      stats.comparisons++;
      push(vis, { action: "compare", i: i, j: k }); // show scanning/compare
      if (vis[i] === target) {
        pos = i;
        break;
      }
    }
    if (pos === -1) continue; // should not happen

    if (pos !== k) {
      // Swap pos <-> k so the "next smallest" moves into its place
      const tmp = vis[pos];
      vis[pos] = vis[k];
      vis[k] = tmp;
      stats.swaps++;
      push(vis, { action: "swap", i: k, j: pos });
    } else {
      // Even when already in place, emit a light step so the player progresses
      push(vis, { action: "compare", i: k, j: pos });
    }
    k++;
  }

  push(vis, { action: "done" });
  const tookMs = Math.max(0, performance.now() - t0);
  return { sorted: vis.slice(), stats, steps, tookMs };
}
