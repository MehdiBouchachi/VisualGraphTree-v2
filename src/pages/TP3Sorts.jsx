import { useMemo, useState } from "react";
import styled from "styled-components";
import { quickSortInstrumented } from "../lib/sorts/quicksort";

import Modal from "../ui/Modal";
import QuickSortControls from "../features/sorts/QuickSortControls";
import QuickSortVisualization from "../features/sorts/QuickSortVisualization";
import QuickSortTree from "../features/sorts/QuickSortTree";
import QuickSortStats from "../features/sorts/QuickSortStats";
import CustomListModalContent from "../features/sorts/CustomListModalContent";
import Button from "../ui/Button";

/* ===== Layout bits kept here so cards look the same ===== */
const TP3Container = styled.div`
  display: grid;
  gap: 2.4rem;
`;
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

// unique random array generator
function generateRandomArray(n, a, b) {
  const low = Math.min(a, b);
  const high = Math.max(a, b);
  const rangeSize = high - low + 1;

  const length = Math.max(2, Math.min(n, rangeSize));

  const pool = [];
  for (let v = low; v <= high; v++) pool.push(v);

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = pool[i];
    pool[i] = pool[j];
    pool[j] = tmp;
  }

  return pool.slice(0, length);
}

export default function TP3Sorts() {
  // Dataset controls
  const [nStr, setNStr] = useState("10");
  const [minStr, setMinStr] = useState("1");
  const [maxStr, setMaxStr] = useState("20");

  const N = Math.max(2, Math.min(256, parseInt(nStr || "0", 10)));
  const MIN = parseInt(minStr || "0", 10);
  const MAX = parseInt(maxStr || "0", 10);

  const [arr, setArr] = useState(() => generateRandomArray(N, MIN, MAX));

  // Algorithm settings
  const [algo, setAlgo] = useState("quicksort");
  const [order, setOrder] = useState("asc");
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
  const complexity = stats.complexity || null;

  // Dataset helpers
  const handleGenerate = () => setArr(generateRandomArray(N, MIN, MAX));

  const handleApplyCustomList = (nums) => {
    setArr(nums);
  };

  return (
    <TP3Container>
      {/* Controls + modal wrapper */}
      <Card>
        <Title>Sorting Algorithms (QuickSort)</Title>

        <Modal>
          <QuickSortControls
            algo={algo}
            order={order}
            pivotCase={pivotCase}
            nStr={nStr}
            minStr={minStr}
            maxStr={maxStr}
            onAlgoChange={setAlgo}
            onOrderChange={setOrder}
            onPivotCaseChange={setPivotCase}
            onNChange={setNStr}
            onMinChange={setMinStr}
            onMaxChange={setMaxStr}
            onGenerateClick={handleGenerate}
            customListTrigger={
              <Modal.Open opens="custom-list">
                <Button secondary>Custom list</Button>
              </Modal.Open>
            }
          />

          <Modal.Window name="custom-list">
            <CustomListModalContent onApplyList={handleApplyCustomList} />
          </Modal.Window>
        </Modal>
      </Card>

      {/* Visualization (bars + playback) */}
      <Card>
        <Title>Visualization</Title>
        <QuickSortVisualization array={arr} steps={steps} />
      </Card>

      {/* Tree */}
      <Card>
        <Title>Divide &amp; Conquer Tree (QuickSort partitions)</Title>
        <QuickSortTree steps={steps} pivotCase={pivotCase} />
      </Card>

      {/* Stats */}
      <Card>
        <Title>Statistics</Title>
        <QuickSortStats
          stats={stats}
          complexity={complexity}
          tookMs={tookMs}
          arrayLength={arr.length}
          order={order}
        />
      </Card>
    </TP3Container>
  );
}
