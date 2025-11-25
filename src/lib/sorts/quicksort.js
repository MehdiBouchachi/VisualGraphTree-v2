// Instrumented QuickSort with 5 pivot cases and detailed steps for visualization.
// Returns { sorted, stats, steps, tookMs }
//
// - order: "asc" | "desc"
// - pivotCase: "first" | "middle" | "last" | "median-of-three" | "random"
// - steps: used by the visualizer (ArrayBars + QuickSortTree)

export function quickSortInstrumented(
  input,
  { order = "asc", pivotCase = "last", record = true, maxSteps = 200000 } = {}
) {
  const arr = Array.isArray(input) ? input.slice() : [];
  const cmp = order === "asc" ? (a, b) => a - b : (a, b) => b - a;

  const steps = [];
  const stats = {
    comparisons: 0,
    swaps: 0,
    partitions: 0,
    maxDepth: 0,
    pivotCase,
  };

  const now =
    typeof performance !== "undefined" && performance.now
      ? () => performance.now()
      : () => Date.now();

  // ---- theoretical complexity per pivot case (for explanation) ----
  const complexityTable = {
    first: {
      id: "first",
      label: "Pivot at start (first element)",
      best: "O(n log n)",
      average: "O(n log n)",
      worst: "O(n²)",
      notes:
        "First element as pivot. On already sorted or reverse-sorted arrays, the partitions are very unbalanced and complexity becomes O(n²).",
    },
    last: {
      id: "last",
      label: "Pivot at end (last element)",
      best: "O(n log n)",
      average: "O(n log n)",
      worst: "O(n²)",
      notes:
        "Last element as pivot. Same behavior as 'first': very sensitive to already sorted inputs.",
    },
    middle: {
      id: "middle",
      label: "Pivot in the middle index",
      best: "O(n log n)",
      average: "O(n log n)",
      worst: "O(n²)",
      notes:
        "Middle index as pivot. For sorted arrays it often produces more balanced partitions. Worst case is still O(n²) for specially crafted inputs.",
    },
    "median-of-three": {
      id: "median-of-three",
      label: "Median-of-three (first / middle / last)",
      best: "O(n log n)",
      average: "O(n log n)",
      worst: "O(n²)",
      notes:
        "Pivot is the median of (first, middle, last) elements. This strategy reduces the probability of very bad pivots, so the O(n²) case is much rarer.",
    },
    random: {
      id: "random",
      label: "Random pivot index",
      best: "O(n log n)",
      average: "O(n log n) (expected)",
      worst: "O(n²)",
      notes:
        "Pivot index is chosen randomly in [left, right]. The expected complexity is O(n log n); O(n²) is still theoretically possible but very unlikely.",
    },
  };

  const pushStep = (payload) => {
    if (!record) return;
    if (steps.length >= maxSteps) return;
    steps.push({ a: arr.slice(), ...payload });
  };

  // swap with optional "silent" flag (no step recorded)
  const swapValues = (i, j, { silent = false } = {}) => {
    if (i === j) return;
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
    stats.swaps++;
    if (!silent) {
      pushStep({ action: "swap", i, j, note: `swap(${i},${j})` });
    }
  };

  // ---- pivot chooser for the 5 cases ----
  const choosePivotIndex = (leftIndex, rightIndex) => {
    const middleIndex = Math.floor((leftIndex + rightIndex) / 2);

    switch (pivotCase) {
      case "first":
        return leftIndex;

      case "middle":
        return middleIndex;

      case "last":
        return rightIndex;

      case "random":
        return (
          leftIndex + Math.floor(Math.random() * (rightIndex - leftIndex + 1))
        );

      case "median-of-three":
      default: {
        const i = leftIndex;
        const j = middleIndex;
        const k = rightIndex;

        const a = arr[i];
        const b = arr[j];
        const c = arr[k];

        // return index of the median value among a, b, c
        if ((a <= b && b <= c) || (c <= b && b <= a)) return j; // b is median
        if ((b <= a && a <= c) || (c <= a && a <= b)) return i; // a is median
        return k; // otherwise c is median
      }
    }
  };

  const t0 = now();

  if (arr.length > 1) {
    // ---- Lomuto partition using our chosen pivot index ----
    const partitionSegment = (leftIndex, rightIndex, depth) => {
      // 1. choose pivot index using the selected case (on the current segment)
      const chosenPivotIndex = choosePivotIndex(leftIndex, rightIndex);
      const pivotValue = arr[chosenPivotIndex];

      // record which element we chose as pivot (before moving it)
      pushStep({
        action: "choose-pivot",
        l: leftIndex,
        r: rightIndex,
        pivot: chosenPivotIndex,
        depth,
        note: `pivotCase=${pivotCase}, chosenPivotIndex=${chosenPivotIndex}, pivotValue=${pivotValue}`,
      });

      // 2. move pivot to the end to reuse the classic Lomuto algorithm
      //    (do it silently so the first visible step is the choice above)
      swapValues(chosenPivotIndex, rightIndex, { silent: true });
      const pivotIndex = rightIndex;

      // 3. partition-start step (pivot now at the end of the segment)
      pushStep({
        action: "partition-start",
        l: leftIndex,
        r: rightIndex,
        pivot: pivotIndex,
        depth,
        note: `pivotCase=${pivotCase}, pivotIndexAtEnd=${pivotIndex}, pivotValue=${pivotValue}`,
      });

      // 4. Lomuto partition
      let storeIndex = leftIndex;
      for (let j = leftIndex; j < rightIndex; j++) {
        stats.comparisons++;
        pushStep({
          action: "compare",
          i: j,
          j: pivotIndex,
          pivot: pivotIndex,
          depth,
        });

        if (cmp(arr[j], pivotValue) <= 0) {
          swapValues(storeIndex, j);
          storeIndex++;
        }
      }

      // 5. put pivot in its final sorted position
      swapValues(storeIndex, pivotIndex);

      pushStep({
        action: "partition-end",
        l: leftIndex,
        r: rightIndex,
        pivot: storeIndex,
        depth,
        note: `pivotCase=${pivotCase}, pivotFinalIndex=${storeIndex}`,
      });

      return storeIndex;
    };

    // ---- quicksort recursion with tail-call optimization ----
    const quickSortRecursive = (leftIndex, rightIndex, depth) => {
      while (leftIndex < rightIndex) {
        stats.partitions++;
        stats.maxDepth = Math.max(stats.maxDepth, depth);

        const pivotFinalIndex = partitionSegment(leftIndex, rightIndex, depth);

        const leftSegmentSize = pivotFinalIndex - 1 - leftIndex;
        const rightSegmentSize = rightIndex - (pivotFinalIndex + 1);

        if (leftSegmentSize < rightSegmentSize) {
          // Left segment is smaller
          if (leftIndex < pivotFinalIndex - 1) {
            quickSortRecursive(leftIndex, pivotFinalIndex - 1, depth + 1);
          }
          leftIndex = pivotFinalIndex + 1;
          depth += 1;
        } else {
          // Right segment is smaller
          if (pivotFinalIndex + 1 < rightIndex) {
            quickSortRecursive(pivotFinalIndex + 1, rightIndex, depth + 1);
          }
          rightIndex = pivotFinalIndex - 1;
          depth += 1;
        }
      }
    };

    quickSortRecursive(0, arr.length - 1, 1);
  }

  const tookMs = Math.max(0, now() - t0);
  pushStep({ action: "done" });

  stats.complexity = complexityTable[pivotCase] || null;

  return { sorted: arr, stats, steps, tookMs };
}
