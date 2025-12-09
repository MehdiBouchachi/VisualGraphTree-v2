import styled from "styled-components";

import Button from "../../ui/Button";
import ButtonGroup from "../../ui/ButtonGroup";
import Input from "../../ui/Input";

/* Simple color palette for DSatur nodes */
const COLOR_PALETTE = [
  "#2563eb", // Blue
  "#dc2626", // Red
  "#16a34a", // Green
  "#d97706", // Amber
  "#7c3aed", // Purple
  "#059669", // Emerald
  "#ea580c", // Orange
  "#0ea5e9", // Sky Blue
];

/* ========== UI pieces (aligned with other sections) ========== */

const Card = styled.div`
  background-color: var(--color-grey-0);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-grey-200);
  box-shadow: var(--shadow-sm);
  padding: 2rem 2.4rem;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-bottom: 1.2rem;
`;

const Title = styled.h3`
  font-size: 1.7rem;
  font-weight: 600;
  color: var(--color-grey-800);
`;

const SectionLabel = styled.span`
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-grey-500);
`;

const ControlsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  align-items: center;
  margin-bottom: 0.8rem;
`;

const Hint = styled.p`
  margin-top: 0.6rem;
  font-size: 1.3rem;
  color: var(--color-grey-600);
`;

const SmallTitle = styled.h4`
  margin-top: 1rem;
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--color-grey-800);
`;

const StatsGrid = styled.div`
  display: grid;
  gap: 0.4rem;
  font-size: 1.3rem;

  strong {
    font-weight: 600;
  }
`;

const Table = styled.table`
  border-collapse: collapse;
  width: 100%;
  font-size: 1.3rem;
  margin-top: 0.8rem;

  th,
  td {
    border: 1px solid var(--color-grey-200);
    padding: 0.4rem 0.6rem;
    text-align: center;
  }

  th {
    background-color: var(--color-grey-50);
    font-weight: 600;
  }
`;

const GraphRow = styled.div`
  display: grid;
  grid-template-columns: minmax(260px, 320px) minmax(0, 1.6fr);
  gap: 1.6rem;
  margin-top: 1.2rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const GraphCanvas = styled.svg`
  width: 100%;
  max-width: 340px;
  height: 260px;
  border-radius: var(--border-radius-md);
  background: radial-gradient(
    circle at top,
    var(--color-grey-0) 0,
    var(--color-grey-50) 55%,
    var(--color-grey-100) 100%
  );
  border: 1px solid var(--color-grey-200);
  box-shadow: var(--shadow-sm);
`;

const StepBar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 0.6rem;
`;

const StepTopRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
`;

const Range = styled.input.attrs({ type: "range" })`
  width: 100%;
  accent-color: var(--color-brand-600);
`;

const StepLabel = styled.span`
  font-size: 1.3rem;
  color: var(--color-grey-700);
`;

const LegendRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 0.8rem;
  gap: 0.8rem;
  font-size: 1.2rem;
  color: var(--color-grey-700);
`;

const LegendItem = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
`;

const LegendDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background-color: ${(props) => props.color || "black"};
  border: 1px solid var(--color-grey-400);
`;

const BeforeAfterBox = styled.div`
  margin-top: 0.8rem;
  font-size: 1.3rem;
  padding: 0.8rem 1rem;
  border-radius: var(--border-radius-sm);
  background-color: var(--color-blue-100);
  border-left: 3px solid var(--color-blue-700);
`;

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 0.6rem;
`;

const NodeBadge = styled.div`
  min-width: 3.2rem;
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
  border: 1px solid var(--color-grey-200);
  box-shadow: var(--shadow-sm);
  font-size: 1.2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => props.bg || "white"};
  color: ${(props) => props.color || "inherit"};
`;

const StepLog = styled.div`
  margin-top: 0.6rem;
  padding: 0.7rem 0.9rem;
  border-radius: var(--border-radius-sm);
  background-color: var(--color-grey-50);
  border: 1px solid var(--color-grey-100);
  font-size: 1.25rem;
  color: var(--color-grey-700);
`;

/* ========== Step descriptions ========== */

function describeDsaturStep(step) {
  if (!step) return "No step yet. Run DSATUR to start the coloring phase.";
  if (step.type === "assign-color") {
    return `Choose the most saturated vertex (${step.node}) and assign it color c${step.colorIndex}.`;
  }
  if (step.type === "update-saturation") {
    return `Update saturation of vertex ${step.node} to ${step.newValue}.`;
  }
  return "Step recorded.";
}

/* ========== Component ========== */

export default function DsaturSection({
  graph,
  unweightedGraph,
  nodePositions,
  dsaturResult,
  dsaturStepIndex,
  setDsaturStepIndex,
  dsAutoPlay,
  setDsAutoPlay,
  dsSpeedMs,
  setDsSpeedMs,
  handleRunDsatur,
  dsaturCurrentStep,
  dsaturPrevStep,
  dsaturColorMap, // still passed from parent but we'll override with visibleColorMap
}) {
  /* --- Build a progressive color map: only nodes colored up to the current step --- */
  let visibleColorMap = dsaturColorMap || {};

  if (dsaturResult && dsaturResult.steps && dsaturResult.color) {
    const finalColors = dsaturResult.color;
    const stepsArr = dsaturResult.steps;
    visibleColorMap = {};

    const maxIndex = Math.min(dsaturStepIndex, stepsArr.length - 1);
    for (let i = 0; i <= maxIndex; i++) {
      const st = stepsArr[i];
      if (st.type === "assign-color") {
        const v = st.node;
        let idx = st.colorIndex;

        // fallback if instrumented step stores color in a map
        if (idx == null) {
          if (st.color && st.color[v] != null) idx = st.color[v];
          else idx = finalColors[v];
        }

        if (idx != null) {
          visibleColorMap[v] = idx;
        }
      }
    }
  }

  return (
    <Card>
      <TitleRow>
        <Title>Graph Coloring with DSATUR</Title>
        <SectionLabel>Step 3 · Coloring</SectionLabel>
      </TitleRow>

      <ControlsRow>
        <ButtonGroup>
          <Button variation="primary" size="medium" onClick={handleRunDsatur}>
            Run DSATUR
          </Button>
        </ButtonGroup>
      </ControlsRow>

      <LegendRow>
        <LegendItem>
          <LegendDot color="var(--color-yellow-300)" />
          <span>Current vertex</span>
        </LegendItem>
        <LegendItem>
          <LegendDot color="var(--color-brand-600)" />
          <span>Edges incident to current vertex</span>
        </LegendItem>
        <LegendItem>
          <LegendDot color="#4338ca" />
          <span>Color c0</span>
        </LegendItem>
        <LegendItem>
          <LegendDot color="#b91c1c" />
          <span>Color c1</span>
        </LegendItem>
        <LegendItem>
          <LegendDot color="#15803d" />
          <span>Color c2</span>
        </LegendItem>
      </LegendRow>

      {dsaturResult ? (
        <>
          <StepBar>
            <StepTopRow>
              <Button
                variation="secondary"
                size="small"
                onClick={() => {
                  setDsAutoPlay(false);
                  setDsaturStepIndex((idx) => Math.max(0, idx - 1));
                }}
                disabled={dsaturStepIndex === 0}
              >
                Prev
              </Button>
              <Button
                variation={dsAutoPlay ? "danger" : "secondary"}
                size="small"
                disabled={dsaturResult.steps.length === 0}
                onClick={() => setDsAutoPlay((prev) => !prev)}
              >
                {dsAutoPlay ? "Pause" : "Auto play"}
              </Button>
              <Button
                variation="secondary"
                size="small"
                onClick={() => {
                  setDsAutoPlay(false);
                  setDsaturStepIndex((idx) =>
                    Math.min(dsaturResult.steps.length - 1, idx + 1)
                  );
                }}
                disabled={
                  dsaturResult.steps.length === 0 ||
                  dsaturStepIndex === dsaturResult.steps.length - 1
                }
              >
                Next
              </Button>
              <StepLabel>
                Step {dsaturResult.steps.length === 0 ? 0 : dsaturStepIndex + 1}{" "}
                / {dsaturResult.steps.length}
              </StepLabel>
            </StepTopRow>

            {dsaturResult.steps.length > 1 && (
              <>
                <Range
                  min={0}
                  max={dsaturResult.steps.length - 1}
                  value={dsaturStepIndex}
                  onChange={(e) => {
                    setDsAutoPlay(false);
                    setDsaturStepIndex(parseInt(e.target.value, 10));
                  }}
                />
                <label
                  style={{
                    fontSize: "1.3rem",
                    color: "var(--color-grey-700)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.4rem",
                  }}
                >
                  Speed (ms / step)
                  <Input
                    type="number"
                    min={100}
                    max={2000}
                    step={100}
                    value={dsSpeedMs}
                    onChange={(e) =>
                      setDsSpeedMs(
                        Math.max(100, parseInt(e.target.value || "100", 10))
                      )
                    }
                    style={{ width: "7rem" }}
                  />
                </label>
              </>
            )}
          </StepBar>

          <StepLog>{describeDsaturStep(dsaturCurrentStep)}</StepLog>

          <GraphRow>
            {/* SVG coloring graph */}
            <GraphCanvas viewBox="0 0 340 260">
              {/* Edges */}
              {graph.edges.map((e, idx) => {
                const p1 = nodePositions[e.from];
                const p2 = nodePositions[e.to];
                if (!p1 || !p2) return null;

                const isRelatedToCurrent =
                  dsaturCurrentStep?.node &&
                  (dsaturCurrentStep.node === e.from ||
                    dsaturCurrentStep.node === e.to);

                return (
                  <line
                    key={idx}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={
                      isRelatedToCurrent
                        ? "var(--color-brand-600)"
                        : "var(--color-grey-300)"
                    }
                    strokeWidth={isRelatedToCurrent ? 3 : 1.6}
                  />
                );
              })}

              {/* Nodes */}
              {unweightedGraph.nodes.map((n) => {
                const pos = nodePositions[n];
                if (!pos) return null;

                const colorIndex = visibleColorMap[n];
                const isCurrent = dsaturCurrentStep?.node === n;

                const bg =
                  colorIndex == null
                    ? "var(--color-grey-0)"
                    : COLOR_PALETTE[colorIndex % COLOR_PALETTE.length];
                const fg =
                  colorIndex == null ? "var(--color-grey-800)" : "#fff";
                const stroke = isCurrent
                  ? "var(--color-yellow-700)"
                  : "var(--color-grey-400)";

                return (
                  <g key={n}>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={16}
                      fill={bg}
                      stroke={stroke}
                      strokeWidth={2}
                    />
                    <text
                      x={pos.x}
                      y={pos.y - 2}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="600"
                      fill={fg}
                    >
                      {n}
                    </text>
                    <text
                      x={pos.x}
                      y={pos.y + 12}
                      textAnchor="middle"
                      fontSize="9"
                      fill={fg}
                    >
                      {colorIndex == null ? "–" : `c${colorIndex}`}
                    </text>
                  </g>
                );
              })}
            </GraphCanvas>

            {/* right side: table, before/after */}
            <div>
              <SmallTitle>Colors, saturation & degree</SmallTitle>
              <Table>
                <thead>
                  <tr>
                    <th>Node</th>
                    <th>Color</th>
                    <th>Saturation</th>
                    <th>Degree</th>
                  </tr>
                </thead>
                <tbody>
                  {unweightedGraph.nodes.map((n) => {
                    const idx = visibleColorMap[n];

                    return (
                      <tr key={n}>
                        <td>{n}</td>
                        <td>{idx == null ? "—" : `c${idx}`}</td>
                        <td>{dsaturResult.saturation[n]}</td>
                        <td>{dsaturResult.degree[n]}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>

              {dsaturCurrentStep?.type === "assign-color" && (
                <BeforeAfterBox>
                  <strong>Coloring node {dsaturCurrentStep.node}</strong>
                  <br />
                  {(() => {
                    const v = dsaturCurrentStep.node;
                    const before = dsaturPrevStep?.color?.[v] ?? null;
                    const after =
                      dsaturCurrentStep.color?.[v] ??
                      dsaturCurrentStep.colorIndex;

                    return (
                      <>
                        Before: {before == null ? "uncolored" : `c${before}`}{" "}
                        {" → "}
                        After: <strong>c{after}</strong>
                      </>
                    );
                  })()}
                </BeforeAfterBox>
              )}

              <SmallTitle style={{ marginTop: "1rem" }}>
                Final coloring badges
              </SmallTitle>
              <BadgeRow>
                {unweightedGraph.nodes.map((n) => {
                  const idx = visibleColorMap[n];
                  const bg =
                    idx == null
                      ? "var(--color-grey-0)"
                      : COLOR_PALETTE[idx % COLOR_PALETTE.length];
                  const fg = idx == null ? "inherit" : "#fff";

                  return (
                    <NodeBadge key={n} bg={bg} color={fg}>
                      {n}
                      {idx == null ? "" : ` (c${idx})`}
                    </NodeBadge>
                  );
                })}
              </BadgeRow>
            </div>
          </GraphRow>

          <SmallTitle>Statistics</SmallTitle>
          <StatsGrid>
            <div>
              Nodes colored: <strong>{dsaturResult.stats.coloredCount}</strong>
            </div>
            <div>
              Colors used (chromatic number ≤):{" "}
              <strong>{dsaturResult.stats.colorsUsed}</strong>
            </div>
            <div>
              Tie breaks (by degree):{" "}
              <strong>{dsaturResult.stats.tieBreaks}</strong>
            </div>
            <div>
              Time (ms): <strong>{dsaturResult.tookMs.toFixed(3)}</strong>
            </div>
            {dsaturResult.stats.complexity && (
              <div>
                Complexity:{" "}
                <strong>{dsaturResult.stats.complexity.bigO}</strong>
                <br />
                <span>{dsaturResult.stats.complexity.details}</span>
              </div>
            )}
          </StatsGrid>
        </>
      ) : (
        <Hint>
          Click <strong>Run DSATUR</strong> to color the graph. At each step,
          only the vertices that have already been colored will appear in color;
          the others stay neutral until their turn.
        </Hint>
      )}
    </Card>
  );
}
