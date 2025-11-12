/* eslint-env worker */
// Runs ONE algorithm in an isolated thread and posts compact stats.

import {
  quickSortInstrumented,
  mergeSortInstrumented,
  heapSortInstrumented,
  treeSortInstrumented,
} from "../sorts";

self.addEventListener("message", (e) => {
  const { algo, arr, order, scheme } = e.data || {};
  const opts = { order, record: false };

  try {
    let res;
    switch (algo) {
      case "treesort":
        res = treeSortInstrumented(arr, opts);
        break;
      case "heapsort":
        res = heapSortInstrumented(arr, opts);
        break;
      case "mergesort":
        res = mergeSortInstrumented(arr, opts);
        break;
      case "quicksort":
      default:
        res = quickSortInstrumented(arr, { ...opts, scheme });
        break;
    }

    const s = res?.stats || {};
    const payload = {
      algo,
      // clamp tiny values so the chart axis doesn’t collapse
      timeMs: Math.max(0.0001, Number(res?.tookMs || 0)),
      comparisons: Number(s.comparisons || 0),
      swaps: Number(s.swaps || 0),
    };

    postMessage(payload);
  } catch (err) {
    postMessage({ algo, error: String(err?.message || err) });
  }
});
