import styled from "styled-components";

import Button from "../../ui/Button";
import ButtonGroup from "../../ui/ButtonGroup";
import Input from "../../ui/Input";

/* ========== UI pieces ========== */

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

const Label = styled.label`
  font-size: 1.3rem;
  color: var(--color-grey-700);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const Select = styled.select`
  border: 1px solid var(--color-grey-300);
  background-color: var(--color-grey-0);
  border-radius: var(--border-radius-sm);
  padding: 0.6rem 0.8rem;
  box-shadow: var(--shadow-sm);
  font-size: 1.3rem;
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

function describeDijkstraStep(step) {
  if (!step) return "No step yet. Run Dijkstra to start the algorithm.";
  if (step.type === "select-node") {
    return `Select the unvisited node with minimal distance: ${step.node}.`;
  }
  if (step.type === "relax-edge") {
    const { from, to, newDist } = step;
    return `Try to improve the distance of ${to} via edge ${from} → ${to}. New tentative distance is ${newDist}.`;
  }
  return "Step recorded.";
}

/* ========== Component ========== */

export default function DijkstraSection({
  graph,
  weightedGraph,
  nodePositions,
  sourceNode,
  setSourceNode,
  targetNode,
  setTargetNode,
  dijkstraResult,
  dijkstraStepIndex,
  setDijkstraStepIndex,
  dijAutoPlay,
  setDijAutoPlay,
  dijSpeedMs,
  setDijSpeedMs,
  handleRunDijkstra,
  handleDijkstraPrev,
  handleDijkstraNext,
  dijkstraCurrentStep,
  dijkstraPrevStep,
  dijkstraPath,
  pathEdges,
  isDirected,
}) {
  // PCC nodes set (for coloring)
  const pathNodeSet = new Set(dijkstraPath || []);

  // show arrows when graph is directed
  const showArrows =
    !!isDirected || graph.edges?.some((e) => e.directed || e.isDirected);

  return (
    <Card>
      <TitleRow>
        <Title>PCC with Dijkstra</Title>
        <SectionLabel>Step 2 · Shortest path</SectionLabel>
      </TitleRow>

      {/* Source / target selection + run button */}
      <ControlsRow>
        <Label>
          Source node
          <Select
            value={sourceNode}
            onChange={(e) => setSourceNode(e.target.value)}
          >
            <option value="">—</option>
            {weightedGraph.nodes.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        </Label>

        <Label>
          Target node (for path)
          <Select
            value={targetNode}
            onChange={(e) => setTargetNode(e.target.value)}
          >
            <option value="">—</option>
            {weightedGraph.nodes.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        </Label>

        <ButtonGroup>
          <Button
            variation="primary"
            size="medium"
            disabled={!sourceNode}
            onClick={handleRunDijkstra}
          >
            Run Dijkstra
          </Button>
        </ButtonGroup>
      </ControlsRow>

      {/* Simplified legend – only PCC highlighting */}
      <LegendRow>
        <LegendItem>
          <LegendDot color="var(--color-indigo-700)" />
          <span>PCC / shortest path</span>
        </LegendItem>
      </LegendRow>

      {dijkstraResult ? (
        <>
          {/* Step controls */}
          <StepBar>
            <StepTopRow>
              <Button
                variation="secondary"
                size="small"
                onClick={handleDijkstraPrev}
                disabled={dijkstraStepIndex === 0}
              >
                Prev
              </Button>
              <Button
                variation={dijAutoPlay ? "danger" : "secondary"}
                size="small"
                disabled={dijkstraResult.steps.length === 0}
                onClick={() => setDijAutoPlay((prev) => !prev)}
              >
                {dijAutoPlay ? "Pause" : "Auto play"}
              </Button>
              <Button
                variation="secondary"
                size="small"
                onClick={handleDijkstraNext}
                disabled={
                  dijkstraResult.steps.length === 0 ||
                  dijkstraStepIndex === dijkstraResult.steps.length - 1
                }
              >
                Next
              </Button>
              <StepLabel>
                Step{" "}
                {dijkstraResult.steps.length === 0 ? 0 : dijkstraStepIndex + 1}{" "}
                / {dijkstraResult.steps.length}
              </StepLabel>
            </StepTopRow>

            {dijkstraResult.steps.length > 1 && (
              <>
                <Range
                  min={0}
                  max={dijkstraResult.steps.length - 1}
                  value={dijkstraStepIndex}
                  onChange={(e) => {
                    setDijAutoPlay(false);
                    setDijkstraStepIndex(parseInt(e.target.value, 10));
                  }}
                />
                <Label>
                  Speed (ms / step)
                  <Input
                    type="number"
                    min={100}
                    max={2000}
                    step={100}
                    value={dijSpeedMs}
                    onChange={(e) =>
                      setDijSpeedMs(
                        Math.max(100, parseInt(e.target.value || "100", 10))
                      )
                    }
                    style={{ width: "7rem" }}
                  />
                </Label>
              </>
            )}
          </StepBar>

          {/* Step explanation */}
          <StepLog>{describeDijkstraStep(dijkstraCurrentStep)}</StepLog>

          <GraphRow>
            {/* === SVG Graph === */}
            <GraphCanvas viewBox="0 0 340 260">
              {/* Arrow markers for directed graphs (neutral + PCC) */}
              {showArrows && (
                <defs>
                  <marker
                    id="dij-arrow-default"
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="8"
                    markerHeight="8"
                    orient="auto"
                    markerUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 0 0 L 10 5 L 0 10 z"
                      fill="var(--color-grey-400)"
                    />
                  </marker>
                  <marker
                    id="dij-arrow-pcc"
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="8"
                    markerHeight="8"
                    orient="auto"
                    markerUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 0 0 L 10 5 L 0 10 z"
                      fill="var(--color-indigo-700)"
                    />
                  </marker>
                </defs>
              )}

              {/* Edges */}
              {graph.edges.map((e, idx) => {
                const p1 = nodePositions[e.from];
                const p2 = nodePositions[e.to];
                if (!p1 || !p2) return null;

                const isPathEdge = pathEdges.has(`${e.from}-${e.to}`);

                let stroke = "var(--color-grey-300)";
                let strokeWidth = 1.8;
                let markerEnd = showArrows
                  ? "url(#dij-arrow-default)"
                  : undefined;

                if (isPathEdge) {
                  stroke = "var(--color-indigo-700)";
                  strokeWidth = 3;
                  markerEnd = showArrows ? "url(#dij-arrow-pcc)" : undefined;
                }

                // Shorten line to keep arrowhead outside node circles
                let x1 = p1.x;
                let y1 = p1.y;
                let x2 = p2.x;
                let y2 = p2.y;

                if (showArrows) {
                  const dx = x2 - x1;
                  const dy = y2 - y1;
                  const len = Math.sqrt(dx * dx + dy * dy) || 1;
                  const offsetStart = 16;
                  const offsetEnd = 20;

                  x1 += (dx / len) * offsetStart;
                  y1 += (dy / len) * offsetStart;
                  x2 -= (dx / len) * offsetEnd;
                  y2 -= (dy / len) * offsetEnd;
                }

                return (
                  <g key={idx}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                      markerEnd={markerEnd}
                    />
                    <text
                      x={(p1.x + p2.x) / 2}
                      y={(p1.y + p2.y) / 2 - 4}
                      textAnchor="middle"
                      fontSize="10"
                      fill="var(--color-grey-700)"
                    >
                      {e.weight}
                    </text>
                  </g>
                );
              })}

              {/* Nodes */}
              {graph.nodes.map((n) => {
                const pos = nodePositions[n];
                if (!pos) return null;

                const isOnPath = pathNodeSet.has(n);

                let fill = "var(--color-grey-0)";
                let stroke = "var(--color-grey-400)";
                let textColor = "var(--color-grey-900)";
                let distColor = "var(--color-grey-700)";

                if (isOnPath) {
                  fill = "var(--color-indigo-100)";
                  stroke = "var(--color-indigo-700)";
                  textColor = "var(--color-indigo-900)";
                  distColor = "var(--color-indigo-700)";
                }

                const distVal = dijkstraResult.dist[n];

                return (
                  <g key={n}>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={16}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={2}
                    />
                    <text
                      x={pos.x}
                      y={pos.y - 2}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="600"
                      fill={textColor}
                    >
                      {n}
                    </text>
                    <text
                      x={pos.x}
                      y={pos.y + 12}
                      textAnchor="middle"
                      fontSize="9"
                      fill={distColor}
                    >
                      {Number.isFinite(distVal) ? distVal : "∞"}
                    </text>
                  </g>
                );
              })}
            </GraphCanvas>

            {/* === Distance table & PCC info === */}
            <div>
              <SmallTitle>Distance table</SmallTitle>
              <Table>
                <thead>
                  <tr>
                    <th>Node</th>
                    <th>Distance</th>
                    <th>Predecessor</th>
                  </tr>
                </thead>
                <tbody>
                  {weightedGraph.nodes.map((n) => (
                    <tr key={n}>
                      <td>{n}</td>
                      <td>
                        {Number.isFinite(dijkstraResult.dist[n])
                          ? dijkstraResult.dist[n]
                          : "∞"}
                      </td>
                      <td>
                        {dijkstraResult.prev[n] === null
                          ? "—"
                          : dijkstraResult.prev[n]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {dijkstraCurrentStep?.type === "relax-edge" && (
                <BeforeAfterBox>
                  <strong>Relaxing edge</strong> {dijkstraCurrentStep.from} →{" "}
                  {dijkstraCurrentStep.to}
                  <br />
                  {(() => {
                    const v = dijkstraCurrentStep.to;
                    const before = dijkstraPrevStep
                      ? dijkstraPrevStep.dist?.[v]
                      : Infinity;
                    const after =
                      dijkstraCurrentStep.dist?.[v] ??
                      dijkstraCurrentStep.newDist;

                    const beforeLabel = Number.isFinite(before) ? before : "∞";
                    const afterLabel = Number.isFinite(after) ? after : "∞";

                    return (
                      <>
                        Before: d({v}) = {beforeLabel} {" → "}
                        After: d({v}) = <strong>{afterLabel}</strong>
                      </>
                    );
                  })()}
                </BeforeAfterBox>
              )}

              {sourceNode && targetNode && (
                <>
                  <SmallTitle>
                    Shortest path from {sourceNode} to {targetNode}
                  </SmallTitle>
                  {dijkstraPath.length === 0 ? (
                    <Hint>No path found.</Hint>
                  ) : (
                    <Hint>
                      Path: <strong>{dijkstraPath.join(" → ")}</strong>{" "}
                      (distance ={" "}
                      {Number.isFinite(dijkstraResult.dist[targetNode])
                        ? dijkstraResult.dist[targetNode]
                        : "∞"}
                      )
                    </Hint>
                  )}
                </>
              )}
            </div>
          </GraphRow>

          <SmallTitle>Statistics</SmallTitle>
          <StatsGrid>
            <div>
              Relaxations: <strong>{dijkstraResult.stats.relaxations}</strong>
            </div>
            <div>
              Visited nodes:{" "}
              <strong>{dijkstraResult.stats.visitedCount}</strong>
            </div>
            <div>
              Comparisons: <strong>{dijkstraResult.stats.comparisons}</strong>
            </div>
            <div>
              Time (ms): <strong>{dijkstraResult.tookMs.toFixed(3)}</strong>
            </div>
            {dijkstraResult.stats.complexity && (
              <div>
                Complexity:{" "}
                <strong>{dijkstraResult.stats.complexity.bigO}</strong>
                <br />
                <span>{dijkstraResult.stats.complexity.details}</span>
              </div>
            )}
          </StatsGrid>
        </>
      ) : (
        <Hint>
          Choose a <strong>source</strong> node and click{" "}
          <strong>Run Dijkstra</strong> to compute the PCC. Only the edges and
          nodes belonging to the shortest path will be highlighted in{" "}
          <strong>indigo</strong>; everything else stays neutral.
        </Hint>
      )}
    </Card>
  );
}
