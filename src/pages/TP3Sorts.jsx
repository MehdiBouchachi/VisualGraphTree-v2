import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import Button from "../ui/Button";
import ButtonGroup from "../ui/ButtonGroup";
import Select from "../ui/Select";
import Input from "../ui/Input";
import DataItem from "../ui/DataItem";
import ArrayBars from "../ui/ArrayBars";
import { quickSortInstrumented } from "../lib/sorts/quicksort";

/* ===================== UI helpers ===================== */
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
  color: var(--color-grey-800);
  margin-bottom: 1rem;
`;

/* Labeled field wrapper for Select/Input */
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

/* Responsive row for controls */
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

/* ===================== Tree view styles ===================== */
const TreeWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
  margin-top: 0.4rem;
`;

const LevelRow = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  align-items: flex-start;
`;

const LevelLabel = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-grey-600);
  margin-bottom: 0.4rem;
`;

const NodeBox = styled.div`
  border-radius: 0.6rem;
  padding: 0.7rem 0.8rem;
  border: 1px solid var(--color-grey-100);
  background: var(--color-grey-50);
`;

const NodeHeader = styled.div`
  font-size: 1.3rem;
  color: var(--color-grey-700);
  margin-bottom: 0.35rem;
  font-weight: 600;

  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  justify-content: space-between;
  align-items: center;

  span.badge {
    padding: 0.1rem 0.6rem;
    font-size: 1.3rem;

    border-radius: 999px;
    border: 1px solid var(--color-grey-700);
    color: var(--color-grey-700);
  }
`;

const ValuesRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  justify-content: center;
  align-items: center;
`;

const ValueBox = styled.div`
  min-width: 18px;
  padding: 1rem 2rem;
  border-radius: 0.35rem;
  font-size: 1.5rem;
  text-align: center;
  font-weight: 700;
  border: 1px solid
    ${({ $pivot }) =>
      $pivot ? "var(--color-brand-500, #38bdf8)" : "var(--color-grey-200)"};
  background: ${({ $pivot }) =>
    $pivot ? "var(--color-brand-500, #38bdf8)" : "var(--color-grey-200)"};
  color: ${({ $pivot }) =>
    $pivot ? "var(--color-brand-100)" : "var(--color-grey-700)"};
`;

/* ===================== Playback hook ===================== */
function usePlayback(steps, { autoplay = false, speedMs = 260 } = {}) {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(autoplay);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!playing) return;
    timerRef.current = setInterval(() => {
      setIdx((current) => (current + 1 < steps.length ? current + 1 : current));
    }, speedMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing, speedMs, steps.length]);

  // When steps change, restart playback
  useEffect(() => {
    setIdx(0);
    setPlaying(autoplay);
  }, [steps, autoplay]);

  return {
    idx,
    step: steps[idx] ?? null,
    isEnd: idx >= steps.length - 1,
    playing,
    play: () => setPlaying(true),
    pause: () => setPlaying(false),
    next: () => setIdx((i) => Math.min(i + 1, steps.length - 1)),
    prev: () => setIdx((i) => Math.max(i - 1, 0)),
    reset: () => setIdx(0),
  };
}
/* ===================== Tree builder ===================== */
/**
 * Build a divide-and-conquer tree from QuickSort steps.
 *
 * We now use ONLY the "choose-pivot" steps:
 *  - array snapshot = sub-array BEFORE partition
 *  - pivot index     = element chosen according to the pivot case
 *    (start / middle / end / median-of-three / random)
 */
function buildQuickSortLevels(steps) {
  const levelMap = new Map(); // depth -> nodes[]

  steps.forEach((s) => {
    if (s.action !== "choose-pivot") return;
    if (typeof s.l !== "number" || typeof s.r !== "number") return;

    const segment = s.a.slice(s.l, s.r + 1);
    const pivotOffset = s.pivot - s.l; // index of pivot inside [l..r]

    const node = {
      id: `${s.depth}-${s.l}-${s.r}-${s.pivot}-${segment.length}`,
      depth: s.depth,
      l: s.l,
      r: s.r,
      pivotOffset,
      array: segment,
    };

    if (!levelMap.has(s.depth)) levelMap.set(s.depth, []);
    levelMap.get(s.depth).push(node);
  });

  // sort levels by depth (1, 2, 3, …)
  return Array.from(levelMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([depth, nodes]) => ({ depth, nodes }));
}

function QuickSortTree({ steps, pivotCase }) {
  const levels = useMemo(() => buildQuickSortLevels(steps), [steps]);

  const pivotCaseLabels = {
    first: "Pivot at start (first element)",
    middle: "Pivot in the middle index",
    last: "Pivot at end (last element)",
    "median-of-three": "Median-of-three (first / middle / last)",
    random: "Random pivot index",
  };

  if (!levels.length) {
    return (
      <div style={{ fontSize: 12, color: "var(--color-grey-400)" }}>
        Run QuickSort to see the divide-and-conquer tree.
      </div>
    );
  }

  const n = steps[0]?.a?.length ?? 0;
  if (n > 20) {
    return (
      <div style={{ fontSize: 12, color: "var(--color-grey-400)" }}>
        Tree view is shown only for arrays with N ≤ 20.{" "}
        <span style={{ color: "var(--color-grey-200)" }}>
          (Current N = {n}. Use a smaller N to see the QuickSort partitions.)
        </span>
      </div>
    );
  }

  return (
    <TreeWrap>
      <div
        style={{
          fontSize: 12,
          color: "var(--color-grey-600)",
          marginBottom: 4,
        }}
      >
        Pivot case: <strong>{pivotCaseLabels[pivotCase] || pivotCase}</strong> –
        each box shows one sub-array <strong>before</strong> it is partitioned,
        with the element chosen as pivot{" "}
        <span style={{ color: "var(--color-brand-500, #38bdf8)" }}>
          (pivot highlighted)
        </span>
        .
      </div>

      {levels.map((level) => (
        <div key={level.depth}>
          <LevelLabel>Depth {level.depth}</LevelLabel>
          <LevelRow>
            {level.nodes.map((node) => (
              <NodeBox key={node.id}>
                <NodeHeader>
                  <span>
                    [{node.l} … {node.r}]
                  </span>
                  <span className="badge">size = {node.array.length}</span>
                </NodeHeader>

                <ValuesRow>
                  {node.array.map((v, idx) => (
                    <ValueBox key={idx} $pivot={idx === node.pivotOffset}>
                      {v}
                    </ValueBox>
                  ))}
                </ValuesRow>
              </NodeBox>
            ))}
          </LevelRow>
        </div>
      ))}
    </TreeWrap>
  );
}

/* ===================== Page ===================== */
export default function TP3Sorts() {
  // Dataset controls
  const [nStr, setNStr] = useState("10");
  const [minStr, setMinStr] = useState("1");
  const [maxStr, setMaxStr] = useState("20");

  const N = Math.max(2, Math.min(256, parseInt(nStr || "0", 10)));
  const MIN = parseInt(minStr || "0", 10);
  const MAX = parseInt(maxStr || "0", 10);

  // Generate a random array in [MIN, MAX]
  // Generate a random array of UNIQUE integers in [a, b]
  function generateRandomArray(n, a, b) {
    const low = Math.min(a, b);
    const high = Math.max(a, b);
    const rangeSize = high - low + 1;

    // we can’t create more unique numbers than the range size
    const length = Math.max(2, Math.min(n, rangeSize));

    // build [low, low+1, ..., high]
    const pool = [];
    for (let v = low; v <= high; v++) pool.push(v);

    // Fisher–Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = pool[i];
      pool[i] = pool[j];
      pool[j] = tmp;
    }

    // take the first `length` elements => all distinct
    return pool.slice(0, length);
  }

  const [arr, setArr] = useState(() => generateRandomArray(N, MIN, MAX));

  // Algorithm settings
  const [algo, setAlgo] = useState("quicksort");
  const [order, setOrder] = useState("desc");
  const [pivotCase, setPivotCase] = useState("last");

  // Run QuickSort (or fallback)
  const result = useMemo(() => {
    if (algo === "quicksort") {
      return quickSortInstrumented(arr, {
        order,
        pivotCase,
        record: true,
      });
    }
    return {
      sorted: arr.slice(),
      stats: {},
      steps: [{ a: arr.slice(), action: "idle" }],
      tookMs: 0,
    };
  }, [arr, algo, order, pivotCase]);

  const { steps, stats, tookMs } = result;

  // Playback
  const [speedMs, setSpeedMs] = useState(220);
  const pb = usePlayback(steps, { autoplay: false, speedMs });

  const regenerate = () => setArr(generateRandomArray(N, MIN, MAX));

  const buildFromText = (txt) => {
    const nums = txt
      .replace(/,/g, " ")
      .split(/\s+/)
      .map((x) => parseInt(x, 10))
      .filter((x) => !Number.isNaN(x));
    if (nums.length >= 2 && nums.length <= 256) setArr(nums);
  };

  const complexity = stats.complexity || null;

  return (
    <div className="grid gap-6">
      {/* ===== Controls ===== */}
      <Card>
        <Title>Sorting Algorithms (QuickSort)</Title>

        <Row role="group" aria-label="Sorting controls">
          <Field htmlFor="algo">
            <span className="field-label">Algorithm</span>
            <Select
              id="algo"
              value={algo}
              onChange={(e) => setAlgo(e.target.value)}
              options={[
                { value: "quicksort", label: "QuickSort (tri rapide)" },
              ]}
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

          <Field htmlFor="pivotCase">
            <span className="field-label">Pivot case (pivot position)</span>
            <Select
              id="pivotCase"
              value={pivotCase}
              onChange={(e) => setPivotCase(e.target.value)}
              options={[
                { value: "first", label: "Start (first element)" },
                { value: "middle", label: "Middle index" },
                { value: "last", label: "End (last element)" },
                {
                  value: "median-of-three",
                  label: "Median-of-three (first/middle/last)",
                },
                { value: "random", label: "Random index in [L, R]" },
              ]}
            />
          </Field>

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
          </ButtonGroup>
        </div>
      </Card>

      {/* ===== Visualization (bars + steps) ===== */}
      <Card>
        <Title>Visualization</Title>
        <Grid>
          <div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>
              Initial
            </div>
            {/* FIX: always show the original array, without any step highlighting */}
            <ArrayBars array={arr} step={null} />
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
            <Button primary onClick={pb.play}>
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

      {/* ===== Divide & Conquer tree (QuickSort partitions) ===== */}
      <Card>
        <Title>Divide &amp; Conquer Tree (QuickSort partitions)</Title>
        <QuickSortTree steps={steps} pivotCase={pivotCase} />
      </Card>

      {/* ===== Stats ===== */}
      <Card>
        <Title>Statistics</Title>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <DataItem label="Comparisons">{stats.comparisons}</DataItem>
          <DataItem label="Swaps">{stats.swaps}</DataItem>
          <DataItem label="Partitions">{stats.partitions}</DataItem>
          <DataItem label="Max recursion depth">{stats.maxDepth}</DataItem>
          <DataItem label="Execution time">{tookMs.toFixed(2)} ms</DataItem>
          <DataItem label="Array size">{arr.length}</DataItem>
          <DataItem label="Order">{order}</DataItem>
          <DataItem label="Pivot case">
            {complexity?.label || stats.pivotCase || pivotCase}
          </DataItem>
          <DataItem label="Best case">
            {complexity?.best || "O(n log n)"}
          </DataItem>
          <DataItem label="Average case">
            {complexity?.average || "O(n log n)"}
          </DataItem>
          <DataItem label="Worst case">{complexity?.worst || "O(n²)"}</DataItem>
          <DataItem label="Notes">
            {complexity?.notes || "Theoretical complexity for this pivot case."}
          </DataItem>
        </div>
      </Card>
    </div>
  );
}
