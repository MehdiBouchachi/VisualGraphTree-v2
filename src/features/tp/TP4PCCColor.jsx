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

import DijkstraSection from "./TP4DijkstraSection";
import DsaturSection from "./TP4DsaturSection";

/* ========== Layout & basic UI (parent) ========== */

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

const TitleRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.8rem;
  margin-bottom: 0.8rem;
`;

const Title = styled.h3`
  font-size: 1.7rem;
  font-weight: 600;
  color: var(--color-grey-800);
`;

const Subtitle = styled.p`
  font-size: 1.3rem;
  color: var(--color-grey-600);
`;

const SectionLabel = styled.span`
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-grey-500);
`;

/* 2-column layout for config card */

const ConfigGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(320px, 1.1fr);
  gap: 2rem;
  margin-top: 0.6rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const LeftCol = styled.div``;
const RightCol = styled.div``;

const ControlsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  align-items: center;
  margin-bottom: 1.2rem;
`;

const Label = styled.label`
  font-size: 1.3rem;
  color: var(--color-grey-700);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const LabelHelp = styled.span`
  font-size: 1.15rem;
  color: var(--color-grey-500);
`;

const Hint = styled.p`
  margin-top: 0.4rem;
  font-size: 1.3rem;
  color: var(--color-grey-600);
`;

const SmallTitle = styled.h4`
  margin-top: 1.4rem;
  font-size: 1.35rem;
  font-weight: 600;
  color: var(--color-grey-800);
`;

/* stats row under controls */

const StatRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-top: 0.4rem;
`;

const StatChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  border: 1px solid var(--color-grey-200);
  background-color: var(--color-grey-50);
  font-size: 1.2rem;
  color: var(--color-grey-700);

  strong {
    font-weight: 600;
    color: var(--color-grey-900);
  }
`;

/* node editor */

const NodeSection = styled.div`
  margin-top: 1.4rem;
`;

const NodeChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 0.4rem;
`;

const NodeChip = styled.div`
  padding: 0.3rem 0.9rem;
  border-radius: 999px;
  border: 1px solid var(--color-grey-200);
  background-color: var(--color-grey-50);
  font-size: 1.25rem;
  color: var(--color-grey-800);
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
`;

const NodeRemoveButton = styled.button`
  border: none;
  background: transparent;
  color: var(--color-red-500);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;

  &:hover {
    color: var(--color-red-600);
  }
`;

const NodeEditorRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
  margin-top: 0.8rem;
`;

/* edges list */

const EdgeSection = styled.div`
  margin-top: 1.2rem;
`;

const EdgeListBox = styled.div`
  margin-top: 0.4rem;
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--color-grey-200);
  background-color: var(--color-grey-50);
  max-height: 160px;
  overflow-y: auto;
  padding: 0.6rem 0.9rem;
`;

const EdgeList = styled.ul`
  font-size: 1.3rem;
  padding-left: 0;
  list-style: none;
`;

const EdgeListItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  margin-bottom: 0.2rem;
`;

const EdgeLabelText = styled.span`
  flex: 1;
`;

const EdgeRemoveButton = styled.button`
  border: none;
  background: transparent;
  color: var(--color-red-500);
  font-size: 1.4rem;
  cursor: pointer;
  padding: 0 0.2rem;
  line-height: 1;

  &:hover {
    color: var(--color-red-600);
  }
`;

/* edge editor */

const EdgeEditorRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
  margin-top: 0.8rem;
`;

const Select = styled.select`
  border: 1px solid var(--color-grey-300);
  background-color: var(--color-grey-0);
  border-radius: var(--border-radius-sm);
  padding: 0.4rem 0.6rem;
  box-shadow: var(--shadow-sm);
  font-size: 1.3rem;
`;

/* preview block (right column) */

const PreviewCard = styled.div`
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-grey-200);
  background-color: var(--color-grey-0);
  box-shadow: var(--shadow-sm);
  padding: 1.2rem 1.4rem;
`;

const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  margin-bottom: 0.8rem;
`;

const PreviewBadge = styled.span`
  font-size: 1.1rem;
  padding: 0.2rem 0.7rem;
  border-radius: 999px;
  background-color: var(--color-indigo-50);
  color: var(--color-indigo-700);
  border: 1px solid var(--color-indigo-100);
`;

const PreviewCanvas = styled.svg`
  width: 100%;
  max-width: 360px;
  height: 260px;
  border-radius: var(--border-radius-md);
  background: var(--color-grey-50);
  border: 1px solid var(--color-grey-200);
  box-shadow: var(--shadow-sm);
`;

const PreviewTips = styled.ul`
  margin-top: 0.8rem;
  font-size: 1.25rem;
  color: var(--color-grey-700);
  padding-left: 1.4rem;

  li {
    margin-bottom: 0.25rem;
  }
`;

/* ========== Helpers (graph generation) ========== */

// Node labels: A, B, C, … then N0, N1…
function generateNodeLabels(n) {
  const labels = [];
  for (let i = 0; i < n; i++) {
    if (i < 26) labels.push(String.fromCharCode(65 + i));
    else labels.push(`N${i - 26}`);
  }
  return labels;
}

function getNextAutoLabel(existing) {
  let i = 0;
  // Find the first label (A, B, ..., N0, N1, ...) that is not used yet
  while (i < 100) {
    const label = i < 26 ? String.fromCharCode(65 + i) : `N${i - 26}`;
    if (!existing.includes(label)) return label;
    i += 1;
  }
  return `N${existing.length}`;
}

// Random graph; when directed = true, edges have an orientation
function generateRandomGraph(
  numNodes,
  density,
  directed = false,
  minW = 1,
  maxW = 9
) {
  const nodes = generateNodeLabels(numNodes);
  const edges = [];

  if (directed) {
    // possible edge from every node to every other node (i -> j)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue;
        if (Math.random() <= density) {
          const w = Math.floor(Math.random() * (maxW - minW + 1)) + minW;
          edges.push({ from: nodes[i], to: nodes[j], weight: w });
        }
      }
    }
  } else {
    // simple undirected: only one (u, v) with u < v, adjacency will mirror it
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.random() <= density) {
          const w = Math.floor(Math.random() * (maxW - minW + 1)) + minW;
          edges.push({ from: nodes[i], to: nodes[j], weight: w });
        }
      }
    }
  }

  return { nodes, edges };
}

// Weighted adjacency for Dijkstra
function buildWeightedGraph(nodes, edges, directed) {
  const adj = {};
  nodes.forEach((v) => (adj[v] = []));
  edges.forEach(({ from, to, weight }) => {
    adj[from].push({ to, weight });
    if (!directed) {
      adj[to].push({ to: from, weight });
    }
  });
  return { nodes, adj };
}

// Unweighted adjacency for DSatur (always treated as undirected)
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
  const cx = 180;
  const cy = 135;
  const r = 95;
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

/* ========== Main Component (parent) ========== */

export default function TP4PCCColor() {
  /* Shared graph state */
  const [nodesStr, setNodesStr] = useState("6");
  const [densityStr, setDensityStr] = useState("0.4");
  const [isDirected, setIsDirected] = useState(false);

  const [graph, setGraph] = useState(() => generateRandomGraph(6, 0.4, false));

  const [newEdgeFrom, setNewEdgeFrom] = useState("");
  const [newEdgeTo, setNewEdgeTo] = useState("");
  const [newEdgeWeight, setNewEdgeWeight] = useState("1");

  const [newNodeLabel, setNewNodeLabel] = useState("");
  const [renameFrom, setRenameFrom] = useState("");
  const [renameTo, setRenameTo] = useState("");

  const numNodes = Math.max(2, Math.min(15, parseInt(nodesStr || "0", 10)));
  let density = parseFloat(densityStr || "0.3");
  if (Number.isNaN(density)) density = 0.3;
  density = Math.min(1, Math.max(0, density));

  const weightedGraph = useMemo(
    () => buildWeightedGraph(graph.nodes, graph.edges, isDirected),
    [graph, isDirected]
  );
  const unweightedGraph = useMemo(
    () => buildUnweightedGraph(graph.nodes, graph.edges),
    [graph]
  );
  const nodePositions = useMemo(
    () => computeNodePositions(graph.nodes),
    [graph.nodes]
  );

  /* Dijkstra state */

  const [sourceNode, setSourceNode] = useState("");
  const [targetNode, setTargetNode] = useState("");
  const [dijkstraResult, setDijkstraResult] = useState(null);
  const [dijkstraStepIndex, setDijkstraStepIndex] = useState(0);

  const [dijAutoPlay, setDijAutoPlay] = useState(false);
  const [dijSpeedMs, setDijSpeedMs] = useState(800);

  function resetAlgorithms() {
    setSourceNode("");
    setTargetNode("");
    setDijkstraResult(null);
    setDijkstraStepIndex(0);
    setDsaturResult(null);
    setDsaturStepIndex(0);
    setDijAutoPlay(false);
    setDsAutoPlay(false);
  }

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

  // autoplay effect Dijkstra
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

  // autoplay effect DSatur
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

  /* Shared config handlers */

  function handleGenerateGraph() {
    setGraph(generateRandomGraph(numNodes, density, isDirected));
    resetAlgorithms();
  }

  function handleAddEdge() {
    const from = newEdgeFrom;
    const to = newEdgeTo;
    let w = parseInt(newEdgeWeight || "1", 10);
    if (!from || !to || from === to) return;
    if (Number.isNaN(w) || w <= 0) w = 1;

    setGraph((prev) => ({
      ...prev,
      edges: [...prev.edges, { from, to, weight: w }],
    }));
    resetAlgorithms();
  }

  function handleRemoveEdge(index) {
    setGraph((prev) => ({
      ...prev,
      edges: prev.edges.filter((_, i) => i !== index),
    }));
    resetAlgorithms();
  }

  function handleAddNode() {
    setGraph((prev) => {
      const existing = prev.nodes;
      let label = newNodeLabel.trim();
      if (!label) label = getNextAutoLabel(existing);
      if (existing.includes(label)) return prev; // ignore duplicate

      const nodes = [...existing, label];
      return { ...prev, nodes };
    });
    setNewNodeLabel("");
    resetAlgorithms();
  }

  function handleDeleteNode(node) {
    setGraph((prev) => {
      const nodes = prev.nodes.filter((n) => n !== node);
      const edges = prev.edges.filter((e) => e.from !== node && e.to !== node);
      return { nodes, edges };
    });
    resetAlgorithms();
  }

  function handleRenameNode() {
    const from = renameFrom;
    const to = renameTo.trim();
    if (!from || !to || from === to) return;
    if (graph.nodes.includes(to)) return; // avoid duplicates

    setGraph((prev) => {
      const nodes = prev.nodes.map((n) => (n === from ? to : n));
      const edges = prev.edges.map((e) => ({
        ...e,
        from: e.from === from ? to : e.from,
        to: e.to === from ? to : e.to,
      }));
      return { nodes, edges };
    });

    setSourceNode((prev) => (prev === from ? to : prev));
    setTargetNode((prev) => (prev === from ? to : prev));
    setRenameFrom("");
    setRenameTo("");
    resetAlgorithms();
  }

  /* helper for path edge highlighting */
  const pathEdges = new Set();
  if (dijkstraPath.length > 1) {
    for (let i = 0; i < dijkstraPath.length - 1; i++) {
      const a = dijkstraPath[i];
      const b = dijkstraPath[i + 1];
      pathEdges.add(`${a}-${b}`);
      pathEdges.add(`${b}-${a}`);
    }
  }

  const edgeCount = graph.edges.length;
  const arrowSymbol = isDirected ? "→" : "–";

  return (
    <TP4Container>
      {/* Shared config */}
      <Card>
        <TitleRow>
          <div>
            <Title>TP4 – Shared Graph Configuration</Title>
            <Subtitle>
              Build the graph once, then reuse it in the shortest path and
              coloring sections below.
            </Subtitle>
          </div>
          <SectionLabel>Step 1 · Graph setup</SectionLabel>
        </TitleRow>

        <ConfigGrid>
          {/* LEFT: controls + nodes + edges */}
          <LeftCol>
            <SectionLabel>Graph parameters</SectionLabel>

            <ControlsRow>
              <Label>
                Number of nodes
                <LabelHelp>
                  How many points your graph has (they will be named A, B, C,
                  …).
                </LabelHelp>
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
                Connection level (0–1)
                <LabelHelp>
                  0 = almost no connections, 1 = every node connected to all
                  others.
                </LabelHelp>
                <Input
                  type="number"
                  step={0.1}
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
                  Quick generate
                </Button>
              </ButtonGroup>
            </ControlsRow>

            <StatRow>
              <StatChip>
                Nodes <strong>{graph.nodes.length}</strong>
              </StatChip>
              <StatChip>
                Edges <strong>{edgeCount}</strong>
              </StatChip>
              <StatChip>
                Density (target) <strong>{density.toFixed(1)}</strong>
              </StatChip>
            </StatRow>

            {/* NODES BUILDER */}
            <NodeSection>
              <SmallTitle>Nodes</SmallTitle>
              <Hint>
                Nodes are the points of the graph (cities, stations, etc.).
                Build or adjust the list below.
              </Hint>

              <NodeChipRow>
                {graph.nodes.length === 0 && (
                  <span
                    style={{
                      fontSize: "1.2rem",
                      color: "var(--color-grey-500)",
                    }}
                  >
                    No nodes yet. Add one below.
                  </span>
                )}
                {graph.nodes.map((n) => (
                  <NodeChip key={n}>
                    {n}
                    <NodeRemoveButton
                      type="button"
                      onClick={() => handleDeleteNode(n)}
                      aria-label={`Remove node ${n}`}
                    >
                      ×
                    </NodeRemoveButton>
                  </NodeChip>
                ))}
              </NodeChipRow>

              <NodeEditorRow>
                <Label>
                  Add node
                  <Input
                    placeholder="Label (optional)"
                    value={newNodeLabel}
                    onChange={(e) => setNewNodeLabel(e.target.value)}
                    style={{ width: "10rem" }}
                  />
                </Label>
                <ButtonGroup>
                  <Button
                    variation="secondary"
                    size="small"
                    onClick={handleAddNode}
                  >
                    Add
                  </Button>
                </ButtonGroup>
              </NodeEditorRow>

              <NodeEditorRow>
                <Label>
                  Rename
                  <Select
                    value={renameFrom}
                    onChange={(e) => setRenameFrom(e.target.value)}
                  >
                    <option value="">Choose node</option>
                    {graph.nodes.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </Select>
                </Label>
                <Label>
                  New label
                  <Input
                    value={renameTo}
                    onChange={(e) => setRenameTo(e.target.value)}
                    style={{ width: "10rem" }}
                  />
                </Label>
                <ButtonGroup>
                  <Button
                    variation="secondary"
                    size="small"
                    onClick={handleRenameNode}
                  >
                    Rename
                  </Button>
                </ButtonGroup>
              </NodeEditorRow>
            </NodeSection>

            {/* ORIENTATION + EDGES */}
            <SmallTitle style={{ marginTop: "1.4rem" }}>
              Graph orientation
            </SmallTitle>
            <ControlsRow style={{ marginBottom: "0.4rem" }}>
              <ButtonGroup>
                <Button
                  variation={isDirected ? "secondary" : "primary"}
                  size="small"
                  onClick={() => {
                    setIsDirected(false);
                    resetAlgorithms();
                  }}
                >
                  Undirected
                </Button>
                <Button
                  variation={isDirected ? "primary" : "secondary"}
                  size="small"
                  onClick={() => {
                    setIsDirected(true);
                    resetAlgorithms();
                  }}
                >
                  Directed
                </Button>
              </ButtonGroup>
            </ControlsRow>
            <Hint>
              <strong>Undirected</strong> graphs model two-way links (u — v).
              <br />
              <strong>Directed</strong> graphs model one-way links (u → v).
              Dijkstra respects the direction; DSATUR still uses an undirected
              version for coloring.
            </Hint>

            <EdgeSection>
              <SmallTitle>Edges (u, v, w)</SmallTitle>
              {edgeCount === 0 ? (
                <Hint style={{ marginTop: "0.4rem" }}>
                  No edges in the current graph. Add edges below or increase the
                  connection level and use <strong>Quick generate</strong>.
                </Hint>
              ) : (
                <EdgeListBox>
                  <EdgeList>
                    {graph.edges.map((e, i) => (
                      <EdgeListItem key={i}>
                        <EdgeLabelText>
                          {e.from} {arrowSymbol} {e.to} (w = {e.weight})
                        </EdgeLabelText>
                        <EdgeRemoveButton
                          type="button"
                          onClick={() => handleRemoveEdge(i)}
                          aria-label="Remove edge"
                        >
                          ×
                        </EdgeRemoveButton>
                      </EdgeListItem>
                    ))}
                  </EdgeList>
                </EdgeListBox>
              )}

              <SmallTitle style={{ marginTop: "1.2rem" }}>
                Add / edit edges
              </SmallTitle>
              <EdgeEditorRow>
                <Label>
                  From
                  <Select
                    value={newEdgeFrom}
                    onChange={(e) => setNewEdgeFrom(e.target.value)}
                  >
                    <option value="">—</option>
                    {graph.nodes.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </Select>
                </Label>

                <Label>
                  To
                  <Select
                    value={newEdgeTo}
                    onChange={(e) => setNewEdgeTo(e.target.value)}
                  >
                    <option value="">—</option>
                    {graph.nodes.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </Select>
                </Label>

                <Label>
                  Weight
                  <Input
                    type="number"
                    min={1}
                    max={99}
                    value={newEdgeWeight}
                    onChange={(e) => setNewEdgeWeight(e.target.value)}
                    style={{ width: "6rem" }}
                  />
                </Label>

                <ButtonGroup>
                  <Button
                    variation="secondary"
                    size="small"
                    onClick={handleAddEdge}
                  >
                    Add edge
                  </Button>
                </ButtonGroup>
              </EdgeEditorRow>
              <Hint style={{ marginTop: "0.4rem" }}>
                Use this editor to tweak the generated graph or build your own
                from scratch. Edges follow the current orientation (
                {isDirected ? "u → v" : "u — v"}).
              </Hint>
            </EdgeSection>
          </LeftCol>

          {/* RIGHT: graph preview */}
          <RightCol>
            {graph.nodes.length > 0 && (
              <>
                <SectionLabel>Graph preview</SectionLabel>
                <PreviewCard>
                  <PreviewHeader>
                    <span style={{ fontSize: "1.25rem", fontWeight: 500 }}>
                      Visual layout
                    </span>
                    <PreviewBadge>Used by both algorithms</PreviewBadge>
                  </PreviewHeader>

                  <PreviewCanvas viewBox="0 0 360 270">
                    {/* Arrowhead definition for directed graphs */}
                    {isDirected && (
                      <defs>
                        <marker
                          id="preview-arrow"
                          markerWidth="12"
                          markerHeight="12"
                          refX="8"
                          refY="3"
                          orient="auto"
                          markerUnits="strokeWidth"
                        >
                          <path
                            d="M0,0 L0,6 L8,3 z"
                            fill="var(--color-grey-500)"
                          />
                        </marker>
                      </defs>
                    )}

                    {/* Edges */}
                    {graph.edges.map((e, idx) => {
                      const p1 = nodePositions[e.from];
                      const p2 = nodePositions[e.to];
                      if (!p1 || !p2) return null;

                      let x1 = p1.x;
                      let y1 = p1.y;
                      let x2 = p2.x;
                      let y2 = p2.y;

                      if (isDirected) {
                        const dx = x2 - x1;
                        const dy = y2 - y1;
                        const len = Math.hypot(dx, dy) || 1;

                        const targetOffset = 18;
                        const sourceOffset = 6;

                        const scaleTo = (len - targetOffset) / len;
                        const scaleFrom = sourceOffset / len;

                        x2 = x1 + dx * scaleTo;
                        y2 = y1 + dy * scaleTo;

                        x1 = x1 + dx * scaleFrom;
                        y1 = y1 + dy * scaleFrom;
                      }

                      const labelX = (x1 + x2) / 2;
                      const labelY = (y1 + y2) / 2 - 4;

                      return (
                        <g key={idx}>
                          <line
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="var(--color-grey-300)"
                            strokeWidth={2}
                            markerEnd={
                              isDirected ? "url(#preview-arrow)" : undefined
                            }
                          />

                          <text
                            x={labelX}
                            y={labelY}
                            textAnchor="middle"
                            fontSize="11"
                            fill="var(--color-grey-600)"
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

                      return (
                        <g key={n}>
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r={16}
                            fill="var(--color-grey-0)"
                            stroke="var(--color-grey-400)"
                            strokeWidth={2}
                          />
                          <text
                            x={pos.x}
                            y={pos.y + 3}
                            textAnchor="middle"
                            fontSize="12"
                            fontWeight="600"
                            fill="var(--color-grey-900)"
                          >
                            {n}
                          </text>
                        </g>
                      );
                    })}
                  </PreviewCanvas>

                  <PreviewTips>
                    <li>
                      Choose a <strong>source</strong> and{" "}
                      <strong>target</strong> node in the{" "}
                      <em>PCC with Dijkstra</em> card.
                    </li>
                    <li>
                      Run <strong>Dijkstra</strong> to see how distances evolve
                      on this graph.
                    </li>
                    <li>
                      Run <strong>DSATUR</strong> to color the same graph and
                      observe saturation changes.
                    </li>
                    <li>
                      Use <strong>Quick generate</strong> or the{" "}
                      <strong>builder tools</strong> on the left to explore
                      different topologies.
                    </li>
                  </PreviewTips>
                </PreviewCard>
              </>
            )}
          </RightCol>
        </ConfigGrid>
      </Card>

      {/* Dijkstra card as its own component */}
      <DijkstraSection
        graph={graph}
        weightedGraph={weightedGraph}
        nodePositions={nodePositions}
        sourceNode={sourceNode}
        setSourceNode={setSourceNode}
        targetNode={targetNode}
        setTargetNode={setTargetNode}
        dijkstraResult={dijkstraResult}
        dijkstraStepIndex={dijkstraStepIndex}
        setDijkstraStepIndex={setDijkstraStepIndex}
        dijAutoPlay={dijAutoPlay}
        setDijAutoPlay={setDijAutoPlay}
        dijSpeedMs={dijSpeedMs}
        setDijSpeedMs={setDijSpeedMs}
        handleRunDijkstra={handleRunDijkstra}
        handleDijkstraPrev={handleDijkstraPrev}
        handleDijkstraNext={handleDijkstraNext}
        dijkstraCurrentStep={dijkstraCurrentStep}
        dijkstraPrevStep={dijkstraPrevStep}
        dijkstraPath={dijkstraPath}
        pathEdges={pathEdges}
        isDirected={isDirected}
      />

      {/* DSATUR card as its own component */}
      <DsaturSection
        graph={graph}
        unweightedGraph={unweightedGraph}
        nodePositions={nodePositions}
        dsaturResult={dsaturResult}
        dsaturStepIndex={dsaturStepIndex}
        setDsaturStepIndex={setDsaturStepIndex}
        dsAutoPlay={dsAutoPlay}
        setDsAutoPlay={setDsAutoPlay}
        dsSpeedMs={dsSpeedMs}
        setDsSpeedMs={setDsSpeedMs}
        handleRunDsatur={handleRunDsatur}
        dsaturCurrentStep={dsaturCurrentStep}
        dsaturPrevStep={dsaturPrevStep}
        dsaturColorMap={dsaturColorMap}
      />
    </TP4Container>
  );
}
