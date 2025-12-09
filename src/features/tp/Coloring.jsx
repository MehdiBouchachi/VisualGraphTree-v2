// src/app/features/tp/Coloring.jsx
"use client";

import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { dsaturInstrumented } from "../../lib/graphs/dsatur";

const Card = styled.section`
  border-radius: 18px;
  padding: 20px 18px 18px;
  background: radial-gradient(
      circle at top left,
      rgba(244, 114, 182, 0.08),
      transparent 55%
    ),
    #020617;
  border: 1px solid rgba(148, 163, 184, 0.25);
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CardHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const CardTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 600;
`;

const Small = styled.span`
  font-size: 0.75rem;
  opacity: 0.8;
`;

const Badge = styled.span`
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(248, 250, 252, 0.7);
  opacity: 0.9;
`;

const ControlsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.8rem;
  opacity: 0.8;
`;

const TextArea = styled.textarea`
  min-width: 260px;
  max-width: 420px;
  min-height: 90px;
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.6);
  background: rgba(15, 23, 42, 0.9);
  color: inherit;
  font-size: 0.85rem;
  font-family: monospace;
  resize: vertical;

  &:focus {
    border-color: #fb7185;
    box-shadow: 0 0 0 1px rgba(248, 113, 113, 0.4);
    outline: none;
  }
`;

const Button = styled.button`
  padding: 7px 14px;
  border-radius: 999px;
  border: none;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  background: linear-gradient(135deg, #fb7185, #f97316);
  color: #020617;
  box-shadow: 0 10px 22px rgba(248, 113, 113, 0.4);
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    box-shadow: none;
  }

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 6px 14px rgba(248, 113, 113, 0.35);
  }
`;

const GhostButton = styled(Button)`
  background: transparent;
  color: #e5e7eb;
  border: 1px solid rgba(248, 250, 252, 0.7);
  box-shadow: none;

  &:disabled {
    border-style: dashed;
  }
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  gap: 16px;
  margin-top: 4px;

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const GraphCanvas = styled.div`
  position: relative;
  min-height: 260px;
  border-radius: 14px;
  background: radial-gradient(
      circle at top right,
      rgba(248, 113, 113, 0.12),
      transparent 60%
    ),
    radial-gradient(
      circle at bottom left,
      rgba(59, 130, 246, 0.08),
      transparent 60%
    ),
    #020617;
  border: 1px dashed rgba(248, 250, 252, 0.7);
  overflow: hidden;
  padding: 12px;
`;

const NodesGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const NodeChip = styled.div`
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: ${({ color }) => color || "rgba(15,23,42,0.9)"};
  color: #020617;
  border: 1px solid rgba(15, 23, 42, 0.8);
`;

const NodeLabel = styled.span`
  font-weight: 600;
`;

const StepsPanel = styled.div`
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.96);
  border: 1px solid rgba(148, 163, 184, 0.55);
  padding: 12px;
  min-height: 260px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StepsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const StepsTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 500;
`;

const StepsList = styled.ol`
  margin: 0;
  padding-left: 18px;
  font-size: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 6px;
  max-height: 210px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.5);
    border-radius: 999px;
  }
`;

const StepItem = styled.li`
  opacity: ${({ active }) => (active ? 1 : 0.7)};
  font-weight: ${({ active }) => (active ? 500 : 400)};
`;

const StatsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 0.75rem;
  opacity: 0.8;
  margin-top: 4px;
`;

const StatPill = styled.span`
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.55);
`;

const colorPalette = ["#22c55e", "#3b82f6", "#f97316", "#e11d48", "#a855f7"];

function parseUnweightedGraph(text) {
  // Format ligne: A B  (arête non pondérée, non orientée)
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const nodesSet = new Set();
  const adj = {};

  const addEdge = (u, v) => {
    if (!adj[u]) adj[u] = [];
    if (!adj[v]) adj[v] = [];
    if (!adj[u].includes(v)) adj[u].push(v);
    if (!adj[v].includes(u)) adj[v].push(u);
  };

  for (const line of lines) {
    const [u, v] = line.split(/\s+/);
    if (!u || !v) continue;
    nodesSet.add(u);
    nodesSet.add(v);
    addEdge(u, v);
  }

  const nodes = Array.from(nodesSet);
  return { nodes, adj };
}

export default function Coloring() {
  const [graphInput, setGraphInput] = useState("A B\nA C\nB C\nB D\nC D\nC E");
  const [result, setResult] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const lastStep = useMemo(() => (result?.steps?.length ?? 0) - 1, [result]);

  const run = () => {
    const graph = parseUnweightedGraph(graphInput);
    const res = dsaturInstrumented(graph, { record: true });
    setResult({ ...res, graph });
    setCurrentStepIndex(0);
  };

  const reset = () => {
    setResult(null);
    setCurrentStepIndex(0);
  };

  const handlePrev = () => {
    setCurrentStepIndex((prev) => (prev - 1 >= 0 ? prev - 1 : 0));
  };

  const handleNext = () => {
    setCurrentStepIndex((prev) => (prev + 1 <= lastStep ? prev + 1 : prev));
  };

  const currentStep =
    result?.steps && result.steps[currentStepIndex]
      ? result.steps[currentStepIndex]
      : null;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Coloration de graphe – DSATUR</CardTitle>
          <Small>
            Entrez un graphe non pondéré (u v) et suivez la sélection du sommet
            le plus saturé et l&apos;assignation des couleurs.
          </Small>
        </div>
        <Badge>Graph Coloring • O(V²)</Badge>
      </CardHeader>

      <ControlsRow>
        <Label>
          Graphe (u v)
          <TextArea
            value={graphInput}
            onChange={(e) => setGraphInput(e.target.value)}
          />
        </Label>

        <ControlsRow>
          <Button type="button" onClick={run}>
            Lancer DSATUR
          </Button>
          <GhostButton type="button" onClick={reset}>
            Réinitialiser
          </GhostButton>
        </ControlsRow>
      </ControlsRow>

      <Layout>
        <GraphCanvas>
          {result && (
            <NodesGrid>
              {result.graph.nodes.map((node) => {
                const index = result.color?.[node];
                const color =
                  index != null && index >= 0
                    ? colorPalette[index % colorPalette.length]
                    : "rgba(15,23,42,0.9)";
                const sat = result.saturation?.[node] ?? 0;
                const deg = result.degree?.[node] ?? 0;
                return (
                  <NodeChip key={node} color={color}>
                    <NodeLabel>{node}</NodeLabel>
                    <span style={{ fontSize: "0.7rem" }}>
                      c={index != null && index >= 0 ? index : "-"} • sat={sat}{" "}
                      • deg={deg}
                    </span>
                  </NodeChip>
                );
              })}
            </NodesGrid>
          )}

          {!result && (
            <Small>
              Lancez DSATUR pour voir les couleurs affectées à chaque sommet et
              les saturations associées.
            </Small>
          )}
        </GraphCanvas>

        <StepsPanel>
          <StepsHeader>
            <StepsTitle>Étapes de DSATUR</StepsTitle>
            <ControlsRow>
              <GhostButton
                type="button"
                disabled={!result || currentStepIndex === 0}
                onClick={handlePrev}
              >
                ⬅
              </GhostButton>
              <GhostButton
                type="button"
                disabled={!result || currentStepIndex === lastStep}
                onClick={handleNext}
              >
                ➜
              </GhostButton>
            </ControlsRow>
          </StepsHeader>

          {!result || !result.steps?.length ? (
            <Small>
              Aucune étape pour l&apos;instant. Lancer l&apos;algorithme pour
              voir la trace.
            </Small>
          ) : (
            <>
              <StepsList>
                {result.steps.map((s, idx) => (
                  <StepItem key={idx} active={idx === currentStepIndex}>
                    {idx + 1}.{" "}
                    {s.type === "assign-color" && (
                      <>
                        Sommet <strong>{s.node}</strong> → couleur{" "}
                        <strong>{s.colorIndex}</strong>.
                      </>
                    )}
                    {s.type === "update-saturation" && (
                      <>
                        Saturation de <strong>{s.node}</strong> : {s.oldValue} →{" "}
                        {s.newValue}.
                      </>
                    )}
                  </StepItem>
                ))}
              </StepsList>

              <StatsRow>
                <StatPill>
                  Sommets colorés: {result.stats?.coloredCount ?? 0}
                </StatPill>
                <StatPill>
                  Couleurs utilisées: {result.stats?.colorsUsed ?? 0}
                </StatPill>
                <StatPill>Tie-breaks: {result.stats?.tieBreaks ?? 0}</StatPill>
                <StatPill>Temps: {result.tookMs?.toFixed(2) ?? 0} ms</StatPill>
              </StatsRow>
            </>
          )}
        </StepsPanel>
      </Layout>
    </Card>
  );
}
