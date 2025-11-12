// pages/TP3Compare.jsx
import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import styled from "styled-components";
import Button from "../ui/Button";
import ButtonGroup from "../ui/ButtonGroup";
import Select from "../ui/Select";
import Input from "../ui/Input";
import DataItem from "../ui/DataItem";
import ArrayBars from "../ui/ArrayBars";
import {
  quickSortInstrumented,
  mergeSortInstrumented,
  heapSortInstrumented,
  treeSortInstrumented,
} from "../lib/sorts";
import CompareRecharts from "../ui/CompareRecharts";

/* ====== Styled wrappers ====== */
const Card = styled.div`
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  padding: 1.6rem;
`;
const Title = styled.h3`
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--color-grey-700);
  margin-bottom: 1rem;
`;
const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 120px;
  .field-label {
    font-size: 12px;
    color: var(--color-grey-600);
  }
`;
const Row = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  align-items: end;
  @media (max-width: 1100px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  @media (max-width: 640px) {
    grid-template-columns: 1fr 1fr;
  }
`;
const Grid = styled.div`
  display: grid;
  gap: 1.6rem;
  grid-template-columns: 1fr 1fr;
  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

/* ===== Playback ===== */
function usePlayback(steps, { autoplay = false, speedMs = 260 } = {}) {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(autoplay);
  const timer = useRef();
  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setIdx((i) => (i + 1 < steps.length ? i + 1 : i));
    }, speedMs);
    return () => clearInterval(timer.current);
  }, [playing, speedMs, steps.length]);
  useEffect(() => {
    setIdx(0);
    setPlaying(autoplay);
  }, [steps, autoplay]);
  const isEnd = idx >= steps.length - 1;
  return {
    idx,
    step: steps[idx] ?? null,
    isEnd,
    playing,
    play: () => setPlaying(true),
    pause: () => setPlaying(false),
    next: () => setIdx((i) => Math.min(i + 1, steps.length - 1)),
    prev: () => setIdx((i) => Math.max(i - 1, 0)),
    reset: () => setIdx(0),
  };
}

/* ===== Helpers ===== */
function gen(n, a, b) {
  const L = Math.max(2, n);
  const lo = Math.min(a, b),
    hi = Math.max(a, b);
  return Array.from(
    { length: L },
    () => lo + Math.floor(Math.random() * (hi - lo + 1))
  );
}
const ALGOS = [
  { value: "treesort", label: "Tree Sort (Tri ABR)" },
  { value: "heapsort", label: "Heap Sort (Tri par Tas)" },
  { value: "mergesort", label: "Merge Sort (Tri fusion)" },
  { value: "quicksort", label: "Quick Sort (Tri rapide)" },
];

export default function TP3Compare() {
  // Dataset
  const [nStr, setNStr] = useState("30");
  const [minStr, setMinStr] = useState("1");
  const [maxStr, setMaxStr] = useState("99");
  const N = Math.max(2, Math.min(256, parseInt(nStr || "0", 10)));
  const MIN = parseInt(minStr || "0", 10);
  const MAX = parseInt(maxStr || "0", 10);
  const [arr, setArr] = useState(() => gen(N, MIN, MAX));
  const regenerate = useCallback(() => setArr(gen(N, MIN, MAX)), [N, MIN, MAX]);

  // Algorithm & order
  const [algo, setAlgo] = useState("quicksort");
  const [order, setOrder] = useState("asc");
  const [scheme, setScheme] = useState("hoare"); // quicksort only

  // Run selected algorithm with steps for the bar animation
  const result = useMemo(() => {
    const common = { order, record: true };
    switch (algo) {
      case "treesort":
        return treeSortInstrumented(arr, common);
      case "heapsort":
        return heapSortInstrumented(arr, common);
      case "mergesort":
        return mergeSortInstrumented(arr, common);
      case "quicksort":
      default:
        return quickSortInstrumented(arr, { ...common, scheme });
    }
  }, [arr, algo, order, scheme]);
  const { steps, tookMs } = result;

  // Playback
  const [speedMs, setSpeedMs] = useState(220);
  const pb = usePlayback(steps, { autoplay: false, speedMs });

  /* ===== Comparison (derive metrics from the same frames you visualize) ===== */
  const [compareRows, setCompareRows] = useState([]);

  // Compute comparisons/swaps from step actions so charts == player
  const metricsFromSteps = (steps = []) => {
    let comparisons = 0;
    let swaps = 0;
    for (const s of steps) {
      if (s?.action === "compare") comparisons++;
      else if (s?.action === "swap") swaps++;
    }
    return { comparisons, swaps };
  };

  const runOne = (name, fn) => {
    const { steps = [], tookMs = 0 } = fn(); // run with record:true
    const { comparisons, swaps } = metricsFromSteps(steps);
    return { name, timeMs: tookMs, comparisons, swaps };
  };

  const runCompare = () => {
    // Freeze the dataset for this compare click
    const base = arr.slice();
    const common = { order, record: true };

    const rows = [
      runOne("Tree Sort", () => treeSortInstrumented(base.slice(), common)),
      runOne("Heap Sort", () => heapSortInstrumented(base.slice(), common)),
      runOne("Merge Sort", () => mergeSortInstrumented(base.slice(), common)),
      runOne("Quick Sort", () =>
        quickSortInstrumented(base.slice(), { ...common, scheme })
      ),
    ];
    setCompareRows(rows);
  };

  const buildFromText = (txt) => {
    const nums = txt
      .replace(/,/g, " ")
      .split(/\s+/)
      .map((x) => parseInt(x, 10))
      .filter((x) => !Number.isNaN(x));
    if (nums.length >= 2 && nums.length <= 256) setArr(nums);
  };

  return (
    <div className="grid gap-6">
      {/* Controls */}
      <Card>
        <Title>Compare and Sorting Algorithms</Title>
        <Row role="group" aria-label="Sorting controls">
          <Field htmlFor="algo">
            <span className="field-label">Algorithm</span>
            <Select
              id="algo"
              value={algo}
              onChange={(e) => setAlgo(e.target.value)}
              options={ALGOS}
            />
          </Field>

          <Field htmlFor="order">
            <span className="field-label">Order</span>
            <Select
              id="order"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              options={[
                { value: "asc", label: "Ascending" },
                { value: "desc", label: "Descending" },
              ]}
            />
          </Field>

          {algo === "quicksort" && (
            <Field htmlFor="scheme">
              <span className="field-label">Partition scheme (Quick)</span>
              <Select
                id="scheme"
                value={scheme}
                onChange={(e) => setScheme(e.target.value)}
                options={[
                  { value: "lomuto", label: "Lomuto (pivot right)" },
                  { value: "hoare", label: "Hoare (pivot middle)" },
                ]}
              />
            </Field>
          )}

          <Field htmlFor="n">
            <span className="field-label">Array size (N)</span>
            <Input
              id="n"
              value={nStr}
              onChange={(e) => setNStr(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="e.g. 30"
            />
          </Field>
          <Field htmlFor="min">
            <span className="field-label">Min value</span>
            <Input
              id="min"
              value={minStr}
              onChange={(e) => setMinStr(e.target.value.replace(/[^\d-]/g, ""))}
              placeholder="e.g. 1"
            />
          </Field>
          <Field htmlFor="max">
            <span className="field-label">Max value</span>
            <Input
              id="max"
              value={maxStr}
              onChange={(e) => setMaxStr(e.target.value.replace(/[^\d-]/g, ""))}
              placeholder="e.g. 99"
            />
          </Field>
        </Row>

        <div
          style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}
        >
          <ButtonGroup>
            <Button primary onClick={regenerate}>
              Generate
            </Button>
            <Button
              secondary
              onClick={() =>
                buildFromText(
                  prompt("Enter numbers (comma or space separated):") ?? ""
                )
              }
            >
              Custom list
            </Button>
            <Button variation="secondary" onClick={runCompare}>
              Compare all
            </Button>
          </ButtonGroup>
        </div>
      </Card>

      {/* Visualization */}
      <Card>
        <Title>Visualization</Title>
        <Grid>
          <div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>
              Initial
            </div>
            <ArrayBars array={steps[0]?.a ?? arr} step={steps[0]} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#16a34a", marginBottom: 6 }}>
              Current Step
            </div>
            <ArrayBars array={steps[pb.idx]?.a ?? arr} step={steps[pb.idx]} />
          </div>
        </Grid>

        {/* Playback */}
        <div
          style={{
            marginTop: 12,
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Button variation="danger" onClick={pb.reset}>
            Reset
          </Button>
          <Button variation="secondary" onClick={pb.prev}>
            ⟵ Step
          </Button>
          {pb.playing ? (
            <Button secondary onClick={pb.pause}>
              Pause
            </Button>
          ) : (
            <Button primary onClick={pb.play} disabled={pb.isEnd}>
              Play
            </Button>
          )}
          <Button variation="secondary" onClick={pb.next} disabled={pb.isEnd}>
            Step ⟶
          </Button>

          <div style={{ marginLeft: 12, fontSize: 12, color: "#475569" }}>
            Step: {pb.idx + 1} / {steps.length}
          </div>

          <div
            style={{
              marginLeft: 18,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ fontSize: 12, color: "#64748b" }}>Speed</span>
            <input
              type="range"
              min="40"
              max="800"
              step="20"
              value={speedMs}
              onChange={(e) => setSpeedMs(parseInt(e.target.value, 10))}
            />
            <span style={{ fontSize: 12, color: "#64748b" }}>{speedMs} ms</span>
          </div>
        </div>
      </Card>

      {/* Comparison */}
      <Card>
        <Title>Algorithm Comparison</Title>
        <CompareRecharts rows={compareRows} />
        {compareRows.length > 0 && (
          <div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3"
            style={{ marginTop: 12 }}
          >
            {compareRows.map((r) => (
              <DataItem key={r.name} label={r.name}>
                {r.timeMs.toFixed(2)} ms — {r.comparisons} comps — {r.swaps}{" "}
                swaps
              </DataItem>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
