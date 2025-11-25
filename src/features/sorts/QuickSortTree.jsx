import { useMemo } from "react";
import styled from "styled-components";

/* Tree view styles */
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

/* Build tree levels from "choose-pivot" steps */
function buildQuickSortLevels(steps) {
  const levelMap = new Map();

  steps.forEach((s) => {
    if (s.action !== "choose-pivot") return;
    if (typeof s.l !== "number" || typeof s.r !== "number") return;

    const segment = s.a.slice(s.l, s.r + 1);
    const pivotOffset = s.pivot - s.l;

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

export default QuickSortTree;
