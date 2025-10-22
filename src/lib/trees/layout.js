// Tidy binary-tree layout using inorder indexing
// edges: Array<[parentId, childId]>, ids are strings
export function treePositions(edges, rootKey) {
  // Build children map and indegree
  const children = new Map();
  const indeg = new Map();
  const nodes = new Set();

  for (const [u, v] of edges) {
    nodes.add(u);
    nodes.add(v);
    if (!children.has(u)) children.set(u, []);
    children.get(u).push(v);
    indeg.set(v, (indeg.get(v) || 0) + 1);
    if (!indeg.has(u)) indeg.set(u, 0);
  }

  // Root (string!)
  let root = rootKey !== undefined && rootKey !== null ? String(rootKey) : null;
  if (!root)
    for (const [n, d] of indeg)
      if (d === 0) {
        root = n;
        break;
      }

  // Convert to explicit left/right by keeping insertion order (first -> left, second -> right)
  const LR = new Map();
  for (const n of nodes) {
    const kids = children.get(n) || [];
    LR.set(n, { left: kids[0] ?? null, right: kids[1] ?? null });
  }

  // Inorder traversal to assign x index, and depth = y
  const depth = new Map();
  const xIndex = new Map();
  let cursor = 0;
  function inorder(n, d) {
    if (!n) return;
    depth.set(n, d);
    const { left, right } = LR.get(n) || { left: null, right: null };
    inorder(left, d + 1);
    xIndex.set(n, cursor++); // assign x in inorder sequence
    inorder(right, d + 1);
  }
  if (root) inorder(root, 0);
  else {
    // Fallback: single level
    let i = 0;
    for (const n of nodes) {
      depth.set(n, 0);
      xIndex.set(n, i++);
    }
  }

  // Compute spacing
  const maxDepth = Math.max(0, ...[...depth.values()]);
  const count = xIndex.size || 1;

  const X_SPACING = 80; // horizontal distance between inorder columns
  const Y_SPACING = 90; // vertical distance between levels
  const PADDING = 40;

  const width = Math.max(300, count * X_SPACING + PADDING * 2);
  const height = Math.max(240, (maxDepth + 1) * Y_SPACING + PADDING * 2);

  const pos = new Map();
  for (const [n, xi] of xIndex) {
    const d = depth.get(n) || 0;
    const x = PADDING + xi * X_SPACING + X_SPACING / 2;
    const y = PADDING + d * Y_SPACING;
    pos.set(n, { x, y });
  }

  // Attach bounds so the SVG can auto-fit
  pos._bounds = { width, height, padding: PADDING };
  return pos;
}
