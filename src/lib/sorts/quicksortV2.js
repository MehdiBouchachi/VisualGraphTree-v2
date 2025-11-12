// QuickSort (PDF-style version)
// Pivot = first element, Hoare partition
// Returns { sorted, stats, steps, tookMs }
export function quickSortInstrumented(
  input,
  {
    order = "asc", // "asc" | "desc"
    record = true,
    maxSteps = 200000,
  } = {}
) {
  const arr = Array.isArray(input) ? input.slice() : [];
  const cmp = order === "asc" ? (a, b) => a - b : (a, b) => b - a;

  const steps = [];
  const stats = { comparisons: 0, swaps: 0, partitions: 0, maxDepth: 0 };

  const pushStep = (payload) => {
    if (!record || steps.length >= maxSteps) return;
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

  /* === Partition (Hoare, pivot = first element) === */
  function partition(l, r) {
    const pivotIdx = l;
    const pivotVal = arr[pivotIdx];
    let i = l;
    let j = r;

    stats.partitions++;
    pushStep({
      action: "partition-start",
      l,
      r,
      pivot: pivotIdx,
      note: `pivot=${pivotVal} (first)`,
    });

    while (i < j) {
      // Move i right while arr[i] <= pivot
      while (i < r && cmp(arr[i], pivotVal) <= 0) {
        stats.comparisons++;
        i++;
      }
      // Move j left while arr[j] > pivot
      while (j > l && cmp(arr[j], pivotVal) > 0) {
        stats.comparisons++;
        j--;
      }
      if (i < j) swap(i, j);
    }

    swap(l, j); // place pivot correctly
    pushStep({ action: "partition-end", l, r, pivot: j, note: `p=${j}` });
    return j;
  }

  /* === Classic recursive QuickSort === */
  const t0 =
    typeof performance !== "undefined" ? performance.now() : Date.now();

  function quicksort(l, r, depth = 1) {
    if (l < r) {
      stats.maxDepth = Math.max(stats.maxDepth, depth);
      const p = partition(l, r);
      quicksort(l, p - 1, depth + 1);
      quicksort(p + 1, r, depth + 1);
    }
  }

  if (arr.length > 1) quicksort(0, arr.length - 1, 1);

  const tookMs =
    (typeof performance !== "undefined" ? performance.now() : Date.now()) - t0;

  pushStep({ action: "done" });
  return { sorted: arr, stats, steps, tookMs };
}
