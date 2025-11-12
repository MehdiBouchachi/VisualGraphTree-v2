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
  color: var(--color-grey-700);
  margin-bottom: 1rem;
`;

/* Labeled field wrapper (keeps your Select/Input untouched) */
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

/* ===================== Playback hook ===================== */
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
  }, [steps]);

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

/* ===================== Page ===================== */
export default function TP3Sorts() {
  // Dataset controls
  const [nStr, setNStr] = useState("30");
  const [minStr, setMinStr] = useState("1");
  const [maxStr, setMaxStr] = useState("99");

  const N = Math.max(2, Math.min(256, parseInt(nStr || "0", 10)));
  const MIN = parseInt(minStr || "0", 10);
  const MAX = parseInt(maxStr || "0", 10);

  const [arr, setArr] = useState(() => gen(N, MIN, MAX));
  function gen(n, a, b) {
    const L = Math.max(2, n);
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    return Array.from(
      { length: L },
      () => lo + Math.floor(Math.random() * (hi - lo + 1))
    );
  }

  // Algorithm settings
  const [algo, setAlgo] = useState("quicksort");
  const [order, setOrder] = useState("desc");
  const [scheme, setScheme] = useState("hoare");

  // Run quicksort
  const result = useMemo(() => {
    if (algo === "quicksort") {
      return quickSortInstrumented(arr, { order, scheme, record: true });
    }
    return {
      sorted: arr.slice(),
      stats: {},
      steps: [{ a: arr.slice(), action: "idle" }],
      tookMs: 0,
    };
  }, [arr, algo, order, scheme]);

  const { steps, stats, tookMs } = result;

  // Playback
  const [speedMs, setSpeedMs] = useState(220);
  const pb = usePlayback(steps, { autoplay: false, speedMs });

  const regenerate = () => setArr(gen(N, MIN, MAX));
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
              options={[{ value: "quicksort", label: "QuickSort (tri rapide)" }]}
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

          <Field htmlFor="scheme">
            <span className="field-label">Partition scheme</span>
            <Select
              id="scheme"
              value={scheme}
              onChange={(e) => setScheme(e.target.value)}
              options={[
                { value: "lomuto", label: "Pivot: Lomuto (right)" },
                { value: "hoare", label: "Pivot: Hoare (middle)" },
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

      {/* ===== Visualization ===== */}
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
          <DataItem label="Scheme">{scheme}</DataItem>
          <DataItem label="Order">{order}</DataItem>
        </div>
      </Card>
    </div>
  );
}
