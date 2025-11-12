// Tri par Tas

export function heapSortInstrumented(
  input,
  { order = "asc", record = false, maxSteps = 200000 } = {}
) {
  const arr = Array.isArray(input) ? input.slice() : [];
  const cmp = order === "asc" ? (a, b) => a - b : (a, b) => b - a;

  const steps = [];
  const stats = { comparisons: 0, swaps: 0, heapifies: 0, maxDepth: 0 };
  const pushStep = (p) =>
    record && steps.length < maxSteps && steps.push({ a: arr.slice(), ...p });
  const swap = (i, j) => {
    if (i === j) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    stats.swaps++;
    pushStep({ action: "swap", i, j });
  };

  const t0 = performance.now();
  const n = arr.length;

  // For asc -> max-heap; for desc -> min-heap
  const better = (x, y) => {
    stats.comparisons++;
    return cmp(x, y) > 0;
  };

  function heapify(size, i, depth) {
    stats.heapifies++;
    stats.maxDepth = Math.max(stats.maxDepth, depth);
    let best = i;
    const l = 2 * i + 1,
      r = 2 * i + 2;
    if (l < size && better(arr[l], arr[best])) best = l;
    if (r < size && better(arr[r], arr[best])) best = r;
    if (best !== i) {
      swap(i, best);
      heapify(size, best, depth + 1);
    }
  }

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(n, i, 1);
  for (let end = n - 1; end > 0; end--) {
    swap(0, end);
    heapify(end, 0, 1);
  }

  const tookMs = Math.max(0, performance.now() - t0);
  pushStep({ action: "done" });
  return { sorted: arr, stats, steps, tookMs };
}
