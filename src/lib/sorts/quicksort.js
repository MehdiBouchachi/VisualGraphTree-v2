// Instrumented QuickSort (Lomuto or Hoare) with detailed steps for visualization.
// Returns { sorted, stats, steps, tookMs }
export function quickSortInstrumented(
  input,
  {
    order = "asc", // "asc" | "desc"
    scheme = "lomuto", // "lomuto" | "hoare"
    record = true,
    maxSteps = 200000,
  } = {}
) {
  const arr = Array.isArray(input) ? input.slice() : [];
  const cmp = order === "asc" ? (a, b) => a - b : (a, b) => b - a;

  const steps = [];
  const stats = { comparisons: 0, swaps: 0, partitions: 0, maxDepth: 0 };

  const pushStep = (payload) => {
    if (!record) return;
    if (steps.length >= maxSteps) return;
    steps.push({ a: arr.slice(), ...payload });
  };

  const swap = (i, j) => {
    if (i === j) return;
    const t = arr[i];
    arr[i] = arr[j];
    arr[j] = t;
    stats.swaps++;
    pushStep({ action: "swap", i, j, note: `swap(${i},${j})` });
  };

  // For consistent counting/visuals when we compare two array slots
  const compareIdxVal = (idx, val) => {
    stats.comparisons++;
    pushStep({ action: "compare", i: idx, j: null });
    return cmp(arr[idx], val);
  };

  const t0 = performance.now();

  if (arr.length > 1) {
    if (scheme === "hoare") {
      // === Hoare partition (correct with any comparator, great with duplicates) ===
      const partitionH = (l, r, depth) => {
        const mid = Math.floor((l + r) / 2);
        const pivotVal = arr[mid];
        pushStep({
          action: "partition-start",
          l,
          r,
          pivot: mid,
          note: `pivot=${pivotVal}`,
        });

        let i = l - 1;
        let j = r + 1;
        // Classic infinite loop form with early return when pointers cross
        for (;;) {
          do {
            i++;
            stats.comparisons++;
          } while (cmp(arr[i], pivotVal) < 0);

          do {
            j--;
            stats.comparisons++;
          } while (cmp(arr[j], pivotVal) > 0);

          if (i >= j) {
            pushStep({
              action: "partition-end",
              l,
              r,
              pivot: j,
              note: `p=${j}`,
            });
            return j;
          }
          swap(i, j);
        }
      };

      const qs = (l, r, depth) => {
        while (l < r) {
          stats.partitions++;
          stats.maxDepth = Math.max(stats.maxDepth, depth);
          const p = partitionH(l, r, depth);

          // Tail-call elimination: recurse into smaller side first, iterate on larger
          if (p - l < r - (p + 1)) {
            qs(l, p, depth + 1);
            l = p + 1;
            depth += 1;
          } else {
            qs(p + 1, r, depth + 1);
            r = p;
            depth += 1;
          }
        }
      };

      qs(0, arr.length - 1, 1);
    } else {
      // === Lomuto partition (pivot = right). Comparator-driven and safe for desc/asc. ===
      const partitionL = (l, r, depth) => {
        const pivot = r;
        const pivotVal = arr[pivot];
        let i = l;

        pushStep({
          action: "partition-start",
          l,
          r,
          pivot,
          note: `pivot=${pivotVal}`,
        });

        for (let j = l; j < r; j++) {
          stats.comparisons++;
          pushStep({ action: "compare", i: j, j: pivot, pivot });
          // Put elements that should come BEFORE pivot (by comparator) on the left
          if (cmp(arr[j], pivotVal) <= 0) {
            swap(i, j);
            i++;
          }
        }
        swap(i, pivot);
        pushStep({ action: "partition-end", l, r, pivot: i, note: `p->${i}` });
        return i;
      };

      const qs = (l, r, depth) => {
        while (l < r) {
          stats.partitions++;
          stats.maxDepth = Math.max(stats.maxDepth, depth);
          const p = partitionL(l, r, depth);

          // Tail-call elimination
          if (p - 1 - l < r - (p + 1)) {
            qs(l, p - 1, depth + 1);
            l = p + 1;
            depth += 1;
          } else {
            qs(p + 1, r, depth + 1);
            r = p - 1;
            depth += 1;
          }
        }
      };

      qs(0, arr.length - 1, 1);
    }
  }

  const tookMs = Math.max(0, performance.now() - t0);
  pushStep({ action: "done" });
  return { sorted: arr, stats, steps, tookMs };
}
