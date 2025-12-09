import { useMemo, useState, useEffect } from "react";
import styled from "styled-components";

import {
  dijkstraInstrumented,
  reconstructPath,
} from "../../lib/graphs/dijkstra";
import { dsaturInstrumented } from "../../lib/graphs/dsatur";

import Button from "../../ui/Button";
import ButtonGroup from "../../ui/ButtonGroup";
import Input from "../../ui/Input";

/* ========== Layout & basic UI ========== */

const TP4Container = styled.div`
  display: grid;
  gap: 2.4rem;
`;

const Card = styled.div`
  background-color: var(--color-grey-0);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-grey-200);
  box-shadow: var(--shadow-sm);
  padding: 2rem 2.4rem;
`;

const Title = styled.h3`
  font-size: 1.7rem;
  font-weight: 600;
  color: var(--color-grey-800);
  margin-bottom: 1.2rem;
`;

const ControlsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  align-items: center;
  margin-bottom: 1rem;
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

const EdgeList = styled.ul`
  margin-top: 0.4rem;
  padding-left: 1.4rem;
  font-size: 1.3rem;

  li {
    margin-bottom: 0.2rem;
  }
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
    #f9fafb 0,
    #e5e7eb 55%,
    #e5e7eb 100%
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

const NodeInfoList = styled.div`
  font-size: 1.3rem;
  display: grid;
  gap: 0.4rem;
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

/* Simple color palette for DSatur nodes */
const COLOR_PALETTE = [
  "#4338ca",
  "#b91c1c",
  "#15803d",
  "#a16207",
  "#0f766e",
  "#1d4ed8",
  "#7c3aed",
  "#4b5563",
];

/* ========== Helpers ========== */

// Node labels: A, B, C, … then N0, N1…
function generateNodeLabels(n) {
  const labels = [];
  for (let i = 0; i < n; i++) {
    if (i < 26) labels.push(String.fromCharCode(65 + i));
    else labels.push(`N${i - 26}`);
  }
  return labels;
}

// Random undirected weighted graph
function generateRandomGraph(numNodes, density, minW = 1, maxW = 9) {
  const nodes = generateNodeLabels(numNodes);
  const edges = [];

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (Math.random() <= density) {
        const w = Math.floor(Math.random() * (maxW - minW + 1)) + minW;
        edges.push({ from: nodes[i], to: nodes[j], weight: w });
      }
    }
  }

  return { nodes, edges };
}

// Weighted adjacency for Dijkstra
function buildWeightedGraph(nodes, edges) {
  const adj = {};
  nodes.forEach((v) => (adj[v] = []));
  edges.forEach(({ from, to, weight }) => {
    adj[from].push({ to, weight });
    adj[to].push({ to: from, weight }); // undirected
  });
  return { nodes, adj };
}

// Unweighted adjacency for DSatur
function buildUnweightedGraph(nodes, edges) {
  const adj = {};
  nodes.forEach((v) => (adj[v] = []));
  edges.forEach(({ from, to }) => {
    adj[from].push(to);
    adj[to].push(from);
  });
  return { nodes, adj };
}

// Node positions on a circle for the SVG
function computeNodePositions(nodes) {
  const cx = 170;
  const cy = 130;
  const r = 90;
  const n = nodes.length || 1;
  const map = {};

  nodes.forEach((node, idx) => {
    const angle = (2 * Math.PI * idx) / n - Math.PI / 2;
    map[node] = {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  });

  return map;
}

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

/* ========== Main Component ========== */

export default function TP4PCCColor() {
  /* Shared graph state */
  const [nodesStr, setNodesStr] = useState("6");
  const [densityStr, setDensityStr] = useState("0.4");
  const [graph, setGraph] = useState(() => generateRandomGraph(6, 0.4));

  const numNodes = Math.max(2, Math.min(15, parseInt(nodesStr || "0", 10)));
  let density = parseFloat(densityStr || "0.3");
  if (Number.isNaN(density)) density = 0.3;
  density = Math.min(1, Math.max(0, density));

  const weightedGraph = useMemo(
    () => buildWeightedGraph(graph.nodes, graph.edges),
    [graph]
  );
  const unweightedGraph = useMemo(
    () => buildUnweightedGraph(graph.nodes, graph.edges),
    [graph]
  );
  const nodePositions = useMemo(
    () => computeNodePositions(graph.nodes),
    [graph.nodes]
  );

  function handleGenerateGraph() {
    setGraph(generateRandomGraph(numNodes, density));
    // reset algo state
    setSourceNode("");
    setTargetNode("");
    setDijkstraResult(null);
    setDijkstraStepIndex(0);
    setDsaturResult(null);
    setDsaturStepIndex(0);
  }

  /* Dijkstra state */

  const [sourceNode, setSourceNode] = useState("");
  const [targetNode, setTargetNode] = useState("");
  const [dijkstraResult, setDijkstraResult] = useState(null);
  const [dijkstraStepIndex, setDijkstraStepIndex] = useState(0);

  const [dijAutoPlay, setDijAutoPlay] = useState(false);
  const [dijSpeedMs, setDijSpeedMs] = useState(800);

  function handleRunDijkstra() {
    if (!sourceNode) return;
    const result = dijkstraInstrumented(weightedGraph, sourceNode, {
      record: true,
    });
    setDijkstraResult(result);
    setDijkstraStepIndex(result.steps.length > 0 ? 0 : 0);
  }

  const dijkstraCurrentStep =
    dijkstraResult && dijkstraResult.steps.length > 0
      ? dijkstraResult.steps[dijkstraStepIndex]
      : null;

  const dijkstraPrevStep =
    dijkstraResult && dijkstraStepIndex > 0
      ? dijkstraResult.steps[dijkstraStepIndex - 1]
      : null;

  const dijkstraPath =
    dijkstraResult && sourceNode && targetNode
      ? reconstructPath(dijkstraResult.prev, sourceNode, targetNode)
      : [];

  function handleDijkstraPrev() {
    setDijAutoPlay(false);
    setDijkstraStepIndex((idx) => (dijkstraResult ? Math.max(0, idx - 1) : 0));
  }

  function handleDijkstraNext() {
    setDijAutoPlay(false);
    setDijkstraStepIndex((idx) =>
      dijkstraResult ? Math.min(dijkstraResult.steps.length - 1, idx + 1) : 0
    );
  }

  // autoplay effect
  useEffect(() => {
    if (!dijAutoPlay || !dijkstraResult) return;
    if (dijkstraStepIndex >= dijkstraResult.steps.length - 1) {
      setDijAutoPlay(false);
      return;
    }
    const id = setTimeout(() => {
      setDijkstraStepIndex((idx) =>
        Math.min(dijkstraResult.steps.length - 1, idx + 1)
      );
    }, dijSpeedMs);
    return () => clearTimeout(id);
  }, [dijAutoPlay, dijkstraResult, dijkstraStepIndex, dijSpeedMs]);

  /* DSatur state */

  const [dsaturResult, setDsaturResult] = useState(null);
  const [dsaturStepIndex, setDsaturStepIndex] = useState(0);
  const [dsAutoPlay, setDsAutoPlay] = useState(false);
  const [dsSpeedMs, setDsSpeedMs] = useState(800);

  function handleRunDsatur() {
    const result = dsaturInstrumented(unweightedGraph, {
      record: true,
    });
    setDsaturResult(result);
    setDsaturStepIndex(result.steps.length > 0 ? 0 : 0);
  }

  const dsaturCurrentStep =
    dsaturResult && dsaturResult.steps.length > 0
      ? dsaturResult.steps[dsaturStepIndex]
      : null;

  const dsaturPrevStep =
    dsaturResult && dsaturStepIndex > 0
      ? dsaturResult.steps[dsaturStepIndex - 1]
      : null;

  // snapshot of colors for current step
  const dsaturColorMap =
    (dsaturCurrentStep && dsaturCurrentStep.color) ||
    (dsaturResult && dsaturResult.color) ||
    {};

  useEffect(() => {
    if (!dsAutoPlay || !dsaturResult) return;
    if (dsaturStepIndex >= dsaturResult.steps.length - 1) {
      setDsAutoPlay(false);
      return;
    }
    const id = setTimeout(() => {
      setDsaturStepIndex((idx) =>
        Math.min(dsaturResult.steps.length - 1, idx + 1)
      );
    }, dsSpeedMs);
    return () => clearTimeout(id);
  }, [dsAutoPlay, dsaturResult, dsaturStepIndex, dsSpeedMs]);

  /* ========== Render ========== */

  // helper for path edge highlighting
  const pathEdges = new Set();
  if (dijkstraPath.length > 1) {
    for (let i = 0; i < dijkstraPath.length - 1; i++) {
      const a = dijkstraPath[i];
      const b = dijkstraPath[i + 1];
      pathEdges.add(`${a}-${b}`);
      pathEdges.add(`${b}-${a}`);
    }
  }

  return (
    <TP4Container>
      {/* Shared config */}
      <Card>
        <Title>TP4 – Shared Graph Configuration</Title>

        <ControlsRow>
          <Label>
            Nodes
            <Input
              type="number"
              min={2}
              max={15}
              value={nodesStr}
              onChange={(e) => setNodesStr(e.target.value)}
              style={{ width: "7rem" }}
            />
          </Label>

          <Label>
            Density (0–1)
            <Input
              type="number"
              step="0.1"
              min={0}
              max={1}
              value={densityStr}
              onChange={(e) => setDensityStr(e.target.value)}
              style={{ width: "7rem" }}
            />
          </Label>

          <ButtonGroup>
            <Button
              variation="primary"
              size="medium"
              onClick={handleGenerateGraph}
            >
              Generate graph
            </Button>
          </ButtonGroup>
        </ControlsRow>

        <Hint>
          Nodes are labeled A, B, C, … Edges are undirected. Edge weights are
          used for Dijkstra. DSatur only uses the graph structure.
        </Hint>

        <SmallTitle>Edges (u, v, w)</SmallTitle>
        {graph.edges.length === 0 ? (
          <Hint>No edges in the current graph.</Hint>
        ) : (
          <EdgeList>
            {graph.edges.map((e, i) => (
              <li key={i}>
                {e.from} – {e.to} (w = {e.weight})
              </li>
            ))}
          </EdgeList>
        )}
      </Card>

      {/* Dijkstra */}
      <Card>
        <Title>PCC with Dijkstra</Title>

        <ControlsRow>
          <Label>
            Source
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
            Target (for path)
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

        <LegendRow>
          <LegendItem>
            <LegendDot color="var(--color-indigo-500)" />
            <span>Source</span>
          </LegendItem>
          <LegendItem>
            <LegendDot color="var(--color-red-500)" />
            <span>Target</span>
          </LegendItem>
          <LegendItem>
            <LegendDot color="var(--color-green-400)" />
            <span>Visited</span>
          </LegendItem>
          <LegendItem>
            <LegendDot color="var(--color-yellow-300)" />
            <span>Current node</span>
          </LegendItem>
          <LegendItem>
            <LegendDot color="var(--color-brand-600)" />
            <span>Relaxed / path edge</span>
          </LegendItem>
        </LegendRow>

        {dijkstraResult ? (
          <>
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
                  {dijkstraResult.steps.length === 0
                    ? 0
                    : dijkstraStepIndex + 1}{" "}
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

            <StepLog>{describeDijkstraStep(dijkstraCurrentStep)}</StepLog>

            <GraphRow>
              {/* === SVG Graph === */}
              <GraphCanvas viewBox="0 0 340 260">
                {/* Edges */}
                {graph.edges.map((e, idx) => {
                  const p1 = nodePositions[e.from];
                  const p2 = nodePositions[e.to];
                  if (!p1 || !p2) return null;

                  const isRelaxEdge =
                    dijkstraCurrentStep?.type === "relax-edge" &&
                    ((dijkstraCurrentStep.from === e.from &&
                      dijkstraCurrentStep.to === e.to) ||
                      (dijkstraCurrentStep.from === e.to &&
                        dijkstraCurrentStep.to === e.from));

                  const isPathEdge = pathEdges.has(`${e.from}-${e.to}`);

                  let stroke = "var(--color-grey-300)";
                  let strokeWidth = 1.6;
                  if (isPathEdge) {
                    stroke = "var(--color-brand-600)";
                    strokeWidth = 3.2;
                  }
                  if (isRelaxEdge) {
                    stroke = "var(--color-amber-500)";
                    strokeWidth = 3.2;
                  }

                  return (
                    <g key={idx}>
                      <line
                        x1={p1.x}
                        y1={p1.y}
                        x2={p2.x}
                        y2={p2.y}
                        stroke={stroke}
                        strokeWidth={strokeWidth}
                      />
                      {/* weight label */}
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

                  const visited =
                    dijkstraCurrentStep?.visited?.includes(n) || false;
                  const isCurrent =
                    dijkstraCurrentStep?.type === "select-node" &&
                    dijkstraCurrentStep.node === n;
                  const isSource = n === sourceNode;
                  const isTarget = n === targetNode;

                  let fill = "var(--color-grey-0)";
                  let stroke = "var(--color-grey-400)";
                  if (visited) {
                    fill = "var(--color-green-100)";
                    stroke = "var(--color-green-700)";
                  }
                  if (isSource) {
                    fill = "var(--color-indigo-100)";
                    stroke = "var(--color-indigo-700)";
                  }
                  if (isTarget) {
                    fill = "var(--color-red-100)";
                    stroke = "var(--color-red-700)";
                  }
                  if (isCurrent) {
                    fill = "var(--color-yellow-100)";
                    stroke = "var(--color-yellow-700)";
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
                        fill="var(--color-grey-900)"
                      >
                        {n}
                      </text>
                      <text
                        x={pos.x}
                        y={pos.y + 12}
                        textAnchor="middle"
                        fontSize="9"
                        fill="var(--color-grey-700)"
                      >
                        {Number.isFinite(distVal) ? distVal : "∞"}
                      </text>
                    </g>
                  );
                })}
              </GraphCanvas>

              {/* === Distance table & before/after === */}
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

                      const beforeLabel = Number.isFinite(before)
                        ? before
                        : "∞";
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
            Choose a source node and click <strong>Run Dijkstra</strong> to see
            the step-by-step evolution of distances on the graph. You can then
            use the slider or auto play to animate the algorithm.
          </Hint>
        )}
      </Card>

      {/* DSATUR */}
      <Card>
        <Title>Graph Coloring with DSATUR</Title>

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
            <span>Adjacency of current vertex</span>
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
                  Step{" "}
                  {dsaturResult.steps.length === 0 ? 0 : dsaturStepIndex + 1} /{" "}
                  {dsaturResult.steps.length}
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
                  <Label>
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
                  </Label>
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

                  const colorIndex = dsaturColorMap[n];
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
                    {unweightedGraph.nodes.map((n) => (
                      <tr key={n}>
                        <td>{n}</td>
                        <td>
                          {dsaturResult.color[n] == null
                            ? "—"
                            : `c${dsaturResult.color[n]}`}
                        </td>
                        <td>{dsaturResult.saturation[n]}</td>
                        <td>{dsaturResult.degree[n]}</td>
                      </tr>
                    ))}
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
                    const idx = dsaturResult.color[n];
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
                Nodes colored:{" "}
                <strong>{dsaturResult.stats.coloredCount}</strong>
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
            Click <strong>Run DSATUR</strong> to color the graph. Use{" "}
            <strong>Next / Prev / Auto play</strong> to see how saturation
            changes and how colors are assigned.
          </Hint>
        )}
      </Card>
    </TP4Container>
  );
}
