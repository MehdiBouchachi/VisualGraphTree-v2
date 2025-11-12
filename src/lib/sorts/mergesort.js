// Tri fusion
export function mergeSortInstrumented(
  input,
  { order = "asc", record = false, maxSteps = 200000 } = {}
) {
  const arr = Array.isArray(input) ? input.slice() : [];
  const cmp = order === "asc" ? (a, b) => a - b : (a, b) => b - a;

  const steps = [];
  const stats = { comparisons: 0, swaps: 0, merges: 0, maxDepth: 0 };

  const pushStep = (p) => {
    if (!record) return;
    if (steps.length >= maxSteps) return;
    steps.push({ a: arr.slice(), ...p });
  };

  const t0 = performance.now();

  // Visual swap helper (counts + frame)
  const doSwap = (i, j) => {
    if (i === j) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    stats.swaps++;
    pushStep({ action: "swap", i, j });
  };

  // During merge we will *place* target at k by swapping from where it currently is.
  const placeAtK = (target, k, r) => {
    let pos = -1;
    for (let s = k; s <= r; s++) {
      stats.comparisons++; // scanning comparisons (visible)
      pushStep({ action: "compare", i: s, j: k });
      if (arr[s] === target) {
        pos = s;
        break;
      }
    }
    if (pos !== -1) doSwap(k, pos);
  };

  function merge(l, m, r, depth) {
    const L = arr.slice(l, m + 1);
    const R = arr.slice(m + 1, r + 1);
    let i = 0,
      j = 0,
      k = l;

    stats.merges++;
    stats.maxDepth = Math.max(stats.maxDepth, depth);
    pushStep({ action: "partition-start", l, r, note: "merge" });

    // Instead of writing directly, decide the next target then move it via a swap.
    while (i < L.length && j < R.length) {
      // Logical comparison between heads of L and R
      stats.comparisons++;
      const takeLeft = cmp(L[i], R[j]) <= 0;
      const target = takeLeft ? L[i++] : R[j++];
      placeAtK(target, k, r);
      k++;
    }

    // Drain the rest of L
    while (i < L.length) {
      const target = L[i++];
      placeAtK(target, k, r);
      k++;
    }

    // Drain the rest of R
    while (j < R.length) {
      const target = R[j++];
      placeAtK(target, k, r);
      k++;
    }

    pushStep({ action: "partition-end", l, r });
  }

  function sort(l, r, depth) {
    if (l >= r) return;
    const m = (l + r) >> 1;
    sort(l, m, depth + 1);
    sort(m + 1, r, depth + 1);
    merge(l, m, r, depth + 1);
  }

  if (arr.length > 1) sort(0, arr.length - 1, 1);

  const tookMs = Math.max(0, performance.now() - t0);
  pushStep({ action: "done" });
  return { sorted: arr, stats, steps, tookMs };
}
