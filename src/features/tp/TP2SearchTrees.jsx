import { useMemo, useRef, useState, useLayoutEffect } from "react";
import styled from "styled-components";
import Button from "../../ui/Button";
import ButtonGroup from "../../ui/ButtonGroup";
import Select from "../../ui/Select";
import Textarea from "../../ui/Textarea";
import DataItem from "../../ui/DataItem";
import Input from "../../ui/Input";
import { BST } from "../../lib/trees/bst";
import { AVL } from "../../lib/trees/avl";
import { BinaryHeap } from "../../lib/trees/heap";
import { treePositions } from "../../lib/trees/layout";

/* ========== helpers for numeric-only text inputs ========== */
function sanitizeInt(str, allowNegative = true) {
  if (typeof str !== "string") str = String(str ?? "");
  let s = str.replace(/[^\d-]/g, "");
  if (!allowNegative) s = s.replace(/-/g, "");
  s = s.replace(/(?!^)-/g, "");
  return s;
}
function parseNum(str, fallback = 0) {
  if (str === "" || str === "-") return fallback;
  const n = parseInt(str, 10);
  return Number.isNaN(n) ? fallback : n;
}

/* ========== tiny utils for syncing & dedup ========== */
function sortedValuesFromGraph(graphData) {
  const vals = Array.from(graphData?.labels?.values?.() ?? [])
    .map((v) => Number(v))
    .filter((n) => !Number.isNaN(n));
  vals.sort((a, b) => a - b);
  return vals;
}
function textFromStructure(struct, instance, graphData) {
  if (struct === "Heap") return (instance?.a ?? []).join(",");
  if (instance && typeof instance.inorder === "function") {
    try {
      return instance.inorder().join(",");
    } catch {
      console.warn("inorder() failed, falling back to graph()");
    }
  }
  return sortedValuesFromGraph(graphData).join(",");
}
/* order-preserving, numeric-only dedupe for textarea */
function dedupeListString(str) {
  const parts = str.replace(/,/g, "\n").split(/\s+/).filter(Boolean);
  const seen = new Set();
  const out = [];
  for (const t of parts) {
    const n = Number(t);
    if (Number.isNaN(n)) continue;
    if (!seen.has(n)) {
      seen.add(n);
      out.push(n);
    }
  }
  return out.join(",");
}

/* ========== Layout & Cards (row-based) ========== */
const PageStack = styled.div`
  display: grid;
  grid-template-rows: auto auto;
  gap: 2.4rem;
`;
const Card = styled.div`
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  padding: 1.8rem;
`;
const SectionTitle = styled.h3`
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--color-grey-700);
  margin-bottom: 1.2rem;
`;
const TightTitle = styled(SectionTitle)`
  margin-bottom: 0.6rem;
`;
const RowWrap = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;
const GridTwo = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 2rem;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

/* ========== Form/Gens ========== */
const Field = styled.div`
  display: grid;
  gap: 0.4rem;
  min-width: 120px;
`;
const Label = styled.label`
  font-size: 1.2rem;
  color: var(--color-grey-600);
`;
const ErrorText = styled.span`
  font-size: 1.2rem;
  color: var(--color-red-700);
`;

/* ========== Chip List ========== */
const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
`;
const Chip = styled.span`
  background: var(--color-indigo-100);
  color: var(--color-indigo-700);
  border: 1px solid var(--color-brand-600);
  border-radius: var(--border-radius-sm);
  padding: 0.2rem 0.8rem;
  font-size: 1.2rem;
`;

/* ========== Pre block ========== */
const PreBlock = styled.pre`
  font-size: 1.3rem;
  background: var(--color-grey-50);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 0.8rem 1rem;
  max-height: 200px;
  overflow: auto;
`;

/* ========== SVG Card ========== */
const SvgCard = styled(Card)`
  padding: 0;
  overflow: hidden;
`;
const SvgHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1.2rem 1.6rem;
  border-bottom: 1px solid var(--color-grey-200);
`;
const Meta = styled.div`
  display: flex;
  gap: 0.8rem;
  font-size: 1.2rem;
  color: var(--color-grey-500);
  flex-wrap: wrap;
`;
const SvgWrap = styled.div`
  padding: 1.6rem;
`;

/* ========== Sliders, toggles, ghost buttons ========== */
const ControlsBar = styled.div`
  display: flex;
  gap: 1.2rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const Group = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 1.2rem;
  color: var(--color-grey-600);
`;

const SliderWrap = styled.div`
  position: relative;
  height: 2.8rem;
  display: inline-flex;
  align-items: center;
`;

const Slider = styled.input.attrs({ type: "range" })`
  --track-h: 0.8rem;
  --thumb-d: 1.8rem;

  appearance: none;
  width: 220px;
  height: var(--thumb-d);
  background: transparent;
  margin: 0;
  outline: none;

  /* Track */
  &::-webkit-slider-runnable-track {
    height: var(--track-h);
    border-radius: 999px;
    background: linear-gradient(
      to right,
      var(--color-brand-600) 0%,
      var(--color-brand-600) ${({ $pct }) => $pct}%,
      var(--color-grey-200) ${({ $pct }) => $pct}%,
      var(--color-grey-200) 100%
    );
  }
  &::-moz-range-track {
    height: var(--track-h);
    border-radius: 999px;
    background: linear-gradient(
      to right,
      var(--color-brand-600) 0%,
      var(--color-brand-600) ${({ $pct }) => $pct}%,
      var(--color-grey-200) ${({ $pct }) => $pct}%,
      var(--color-grey-200) 100%
    );
  }

  /* Thumb */
  &::-webkit-slider-thumb {
    appearance: none;
    width: var(--thumb-d);
    height: var(--thumb-d);
    border-radius: 50%;
    background: var(--color-indigo-700);
    border: 2px solid var(--color-brand-600);
    box-shadow: var(--shadow-sm);
    margin-top: calc((var(--track-h) - var(--thumb-d)) / 2);
    transition: transform 0.12s ease, box-shadow 0.12s ease;
  }
  &::-moz-range-thumb {
    width: var(--thumb-d);
    height: var(--thumb-d);
    border-radius: 50%;
    background: var(--color-grey-0);
    border: 2px solid var(--color-brand-600);
    box-shadow: var(--shadow-sm);
    transition: transform 0.12s ease, box-shadow 0.12s ease;
  }

  &:hover::-webkit-slider-thumb,
  &:hover::-moz-range-thumb {
    transform: scale(1.04);
  }

  &:focus-visible::-webkit-slider-thumb,
  &:focus-visible::-moz-range-thumb {
    box-shadow: 0 0 0 3px var(--color-brand-100);
  }
`;

/* Small value bubble that follows the thumb */
const ValueBubble = styled.span`
  position: absolute;
  top: -2.4rem;
  left: ${({ $pct }) => `calc(${$pct}% - 1.2rem)`}; /* center bubble on thumb */
  min-width: 2.4rem;
  padding: 0.1rem 0.6rem;
  font-size: 1.1rem;
  text-align: center;
  background: var(--color-indigo-700);
  color: var(--color-indigo-100);
  border-radius: var(--border-radius-sm);
  box-shadow: var(--shadow-sm);
  pointer-events: none;

  &::after {
    content: "";
    position: absolute;
    bottom: -0.36rem;
    left: 50%;
    transform: translateX(-50%);
    width: 0.7rem;
    height: 0.7rem;
    background: var(--color-indigo-700);
    transform: translateX(-50%) rotate(45deg);
    border-radius: 2px;
  }
`;

/* Toggle styled */
const ToggleBox = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
`;

const ToggleTrack = styled.span`
  position: relative;
  width: 42px;
  height: 24px;
  background: ${(p) =>
    p.$on ? "var(--color-brand-600)" : "var(--color-grey-300)"};
  border-radius: 999px;
  transition: background 0.2s;
`;

const ToggleThumb = styled.span`
  position: absolute;
  top: 3px;
  left: ${(p) => (p.$on ? "22px" : "3px")};
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-brand-50);
  box-shadow: var(--shadow-sm);
  transition: left 0.2s;
`;

const HiddenCheckbox = styled.input.attrs({ type: "checkbox" })`
  display: none;
`;
const GhostButton = styled(Button)`
  background: transparent;
  color: var(--color-grey-600);
  border: 1px solid var(--color-grey-200);
  &:hover {
    background: var(--color-grey-50);
  }
`;

/* ========== SVG elements ========== */
const Svg = styled.svg`
  width: 100%;
  height: min(62vh, 560px);
  display: block;
  background: var(--color-grey-0);
  cursor: ${(p) => (p.$grabbing ? "grabbing" : "grab")};
  user-select: none;
`;
const Edge = styled.line`
  stroke: var(--color-grey-300);
  stroke-width: 1.5;
  stroke-linecap: round;
`;
const NodeCircle = styled.circle`
  fill: var(--color-brand-600);
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
`;
const NodeText = styled.text`
  font-weight: 600;
  text-anchor: middle;
  dominant-baseline: middle;
  font-size: ${(p) => p.$px}px;
  fill: var(--color-grey-900);
`;

/* ========== Tree SVG with pan/zoom ========== */
function TreeSVG({
  edges,
  labels,
  pos,
  zoom,
  nodeScale,
  showLabels,
  tx,
  ty,
  setTx,
  setTy,
}) {
  const nodes = useMemo(() => {
    const s = new Set();
    edges.forEach(([u, v]) => {
      s.add(u);
      s.add(v);
    });
    return s;
  }, [edges]);

  const w = pos._bounds?.width ?? 900;
  const h = pos._bounds?.height ?? 420;
  const R = 14 * nodeScale;
  const fontPx = Math.max(10, Math.round(12 * nodeScale));

  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const onDown = (e) => {
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
  };
  const onMove = (e) => {
    if (!dragging.current) return;
    const dx = (e.clientX - last.current.x) / zoom;
    const dy = (e.clientY - last.current.y) / zoom;
    setTx((v) => v + dx);
    setTy((v) => v + dy);
    last.current = { x: e.clientX, y: e.clientY };
  };
  const onUp = () => (dragging.current = false);

  return (
    <Svg
      viewBox={`0 0 ${w} ${h}`}
      onMouseDown={onDown}
      onMouseMove={onMove}
      onMouseUp={onUp}
      onMouseLeave={onUp}
      $grabbing={dragging.current}
      role="img"
      aria-label="Search tree visualization"
    >
      <g transform={`translate(${tx},${ty}) scale(${zoom})`}>
        {edges.map(([u, v], i) => {
          const p1 = pos.get(u),
            p2 = pos.get(v);
          if (!p1 || !p2) return null;
          return <Edge key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} />;
        })}

        {[...nodes].map((id) => {
          const p = pos.get(id);
          if (!p) return null;
          const text = labels?.get(id) ?? id;
          return (
            <g key={id}>
              <NodeCircle cx={p.x} cy={p.y} r={R} />
              {showLabels && (
                <NodeText x={p.x} y={p.y} $px={fontPx}>
                  {text}
                </NodeText>
              )}
              <title>key: {text}</title>
            </g>
          );
        })}
      </g>
    </Svg>
  );
}

/* ========== Main ========== */
export default function TP2SearchTrees() {
  const [struct, setStruct] = useState("BST");
  const [text, setText] = useState("10,4,12,7,3,9,11,2,14");

  // numeric & string mirrors
  const [op, setOp] = useState(5);
  const [genN, setGenN] = useState(15);
  const [genMin, setGenMin] = useState(0);
  const [genMax, setGenMax] = useState(100);
  const [opStr, setOpStr] = useState(String(op));
  const [genNStr, setGenNStr] = useState(String(genN));
  const [genMinStr, setGenMinStr] = useState(String(genMin));
  const [genMaxStr, setGenMaxStr] = useState(String(genMax));

  // small inline error for Value field
  const [opError, setOpError] = useState("");

  // heap info
  const [lastExtracted, setLastExtracted] = useState(null);

  // view controls
  const [zoom, setZoom] = useState(1);
  const [nodeScale, setNodeScale] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);

  // fit-to-view support
  const wrapRef = useRef(null);
  const [wrapSize, setWrapSize] = useState({ w: 800, h: 420 });
  useLayoutEffect(() => {
    if (!wrapRef.current) return;
    const update = () => {
      const r = wrapRef.current.getBoundingClientRect();
      setWrapSize({ w: r.width - 32, h: Math.min(r.height - 32, 560) });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  // parse list (already deduped)
  const nums = useMemo(
    () =>
      Array.from(
        new Set(
          text
            .replace(/,/g, "\n")
            .split(/\s+/)
            .map(Number)
            .filter((n) => !Number.isNaN(n))
        )
      ),
    [text]
  );

  // build base structure
  const base = useMemo(() => {
    if (struct === "BST") {
      const t = new BST();
      nums.forEach((n) => t.insert(n));
      return t;
    }
    if (struct === "AVL") {
      const t = new AVL();
      nums.forEach((n) => t.insert(n));
      return t;
    }
    const h = new BinaryHeap();
    nums.forEach((n) => h.insert(n));
    return h;
  }, [struct, nums]);

  // ephemeral view after op
  const [view, setView] = useState(null);
  const current = view ?? base;

  // graph + layout
  const graphData = useMemo(() => {
    if (struct === "Heap") return { edges: [], labels: new Map(), root: null };
    return current.graph();
  }, [current, struct]);
  const pos = useMemo(() => {
    if (struct === "Heap") return new Map();
    return treePositions(graphData.edges, graphData.root);
  }, [graphData, struct]);

  // inorder fallback so AVL works even if it has no inorder()
  const inorderValues = useMemo(() => {
    if (struct === "Heap") return [];
    if (typeof current.inorder === "function") return current.inorder();
    return sortedValuesFromGraph(graphData);
  }, [current, graphData, struct]);

  // fit to view
  const fitToView = () => {
    if (struct === "Heap") {
      setTx(0);
      setTy(0);
      setZoom(1);
      return;
    }
    const contentW = pos._bounds?.width ?? 900;
    const contentH = pos._bounds?.height ?? 420;
    const scale = Math.max(
      0.4,
      Math.min(2, 0.92 * Math.min(wrapSize.w / contentW, wrapSize.h / contentH))
    );
    setZoom(scale);
    const dx = (wrapSize.w / scale - contentW) / 2;
    const dy = (wrapSize.h / scale - contentH) / 2;
    setTx(dx);
    setTy(dy);
  };
  const resetView = () => {
    setZoom(1);
    setTx(0);
    setTy(0);
  };

  // existence helpers
  const valueExistsInCurrent = (val) => {
    if (struct === "Heap") {
      return (current?.a ?? []).includes(val);
    }
    const set = new Set(sortedValuesFromGraph(graphData));
    return set.has(val);
  };

  const syncTextFrom = (instance) => {
    const next = textFromStructure(
      struct,
      instance,
      instance?.graph?.() ?? graphData
    );
    setText(next);
  };

  // operations — prevent duplicates
  const applyInsert = () => {
    setOpError("");
    if (valueExistsInCurrent(op)) {
      setOpError(`Value ${op} already exists.`);
      return;
    }

    if (struct === "Heap") {
      const h = new BinaryHeap();
      nums.forEach((n) => h.insert(n));
      h.insert(op);
      setLastExtracted(null);
      setView(h);
      setText(h.a.join(","));
      return;
    }

    const T = struct === "BST" ? BST : AVL;
    const t = new T();
    nums.forEach((n) => t.insert(n));
    t.insert(op);
    setView(t);
    syncTextFrom(t);
  };

  const applyDelete = () => {
    setOpError("");
    if (struct === "Heap") {
      if ((current?.a ?? []).length === 0) {
        setOpError("Heap is empty.");
        return;
      }
      const h = new BinaryHeap();
      nums.forEach((n) => h.insert(n));
      const ex = h.extractMax();
      setLastExtracted(ex);
      setView(h);
      setText(h.a.join(","));
      return;
    }

    if (!valueExistsInCurrent(op)) {
      setOpError(`Value ${op} not found in the tree.`);
      return;
    }
    const T = struct === "BST" ? BST : AVL;
    const t = new T();
    nums.forEach((n) => t.insert(n));
    t.delete(op);
    setView(t);
    syncTextFrom(t);
  };

  // generator — unique only
  const generate = () => {
    const min = Math.min(genMin, genMax);
    const max = Math.max(genMin, genMax);
    const range = max - min + 1;
    const need = Math.max(1, Math.min(genN, Math.min(1000, range))); // cap by range size
    const set = new Set();
    // sample without replacement
    while (set.size < need) {
      set.add(Math.floor(Math.random() * range) + min);
    }
    const arr = Array.from(set);
    setText(arr.join(","));
    setView(null);
    setLastExtracted(null);
    setOpError("");
  };

  return (
    <>
      <PageStack>
        {/* ===== Row 1: Controls + Metrics ===== */}
        <Card>
          <SectionTitle>Controls</SectionTitle>

          <RowWrap>
            <Select
              value={struct}
              onChange={(e) => {
                setStruct(e.target.value);
                setView(null);
                setLastExtracted(null);
                setOpError("");
              }}
              options={[
                { value: "BST", label: "BST" },
                { value: "AVL", label: "AVL" },
                { value: "Heap", label: "Heap (max)" },
              ]}
            />

            <Field>
              <Label>Value</Label>
              <Input
                type="text"
                inputMode="numeric"
                pattern="-?\\d*"
                value={opStr}
                onChange={(e) => {
                  const clean = sanitizeInt(e.target.value, true);
                  setOpStr(clean);
                  setOp(parseNum(clean, 0));
                  if (opError) setOpError("");
                }}
                aria-label="Value"
              />
              {opError && <ErrorText>{opError}</ErrorText>}
            </Field>

            <ButtonGroup>
              <Button
                onClick={() => {
                  setView(null);
                  setLastExtracted(null);
                  setOpError("");
                  // textarea is source of truth; build happens reactively
                }}
              >
                Build from list
              </Button>
              <Button onClick={applyInsert}>Insert</Button>
              <Button variation="danger" onClick={applyDelete}>
                {struct === "Heap" ? "Extract max" : "Delete"}
              </Button>
            </ButtonGroup>
          </RowWrap>

          <GridTwo>
            <div>
              <SectionTitle>Generator</SectionTitle>
              <RowWrap>
                <Field>
                  <Label>N</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="-?\\d*"
                    value={genNStr}
                    onChange={(e) => {
                      const clean = sanitizeInt(e.target.value, true);
                      setGenNStr(clean);
                      setGenN(parseNum(clean, 0));
                    }}
                    aria-label="Count N"
                  />
                </Field>
                <Field>
                  <Label>Min</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="-?\\d*"
                    value={genMinStr}
                    onChange={(e) => {
                      const clean = sanitizeInt(e.target.value, true);
                      setGenMinStr(clean);
                      setGenMin(parseNum(clean, 0));
                    }}
                    aria-label="Minimum"
                  />
                </Field>
                <Field>
                  <Label>Max</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="-?\\d*"
                    value={genMaxStr}
                    onChange={(e) => {
                      const clean = sanitizeInt(e.target.value, true);
                      setGenMaxStr(clean);
                      setGenMax(parseNum(clean, 0));
                    }}
                    aria-label="Maximum"
                  />
                </Field>
                <Button onClick={generate}>Generate vector</Button>
              </RowWrap>

              <SectionTitle>Input list</SectionTitle>
              <Textarea
                rows={5}
                value={text}
                onChange={(e) => {
                  // Immediately de-duplicate input list (order-preserving)
                  setText(dedupeListString(e.target.value));
                  setView(null);
                  setLastExtracted(null);
                  setOpError("");
                }}
              />
            </div>

            <div>
              <SectionTitle>Metrics</SectionTitle>

              {struct === "Heap" ? (
                <>
                  <DataItem label="Size">{current.a.length}</DataItem>
                  {lastExtracted != null && (
                    <DataItem label="Extracted max">
                      {String(lastExtracted)}
                    </DataItem>
                  )}

                  <Label>Array</Label>
                  <Chips>
                    {current.a.map((n, i) => (
                      <Chip key={i}>{n}</Chip>
                    ))}
                  </Chips>
                </>
              ) : (
                <>
                  <DataItem label="Height">{current.height()}</DataItem>
                  <Label>BFS Levels</Label>
                  <PreBlock>
                    {JSON.stringify(current.bfsLevels(), null, 2)}
                  </PreBlock>

                  <Label>Inorder</Label>
                  <Chips>
                    {inorderValues.map((n, i) => (
                      <Chip key={i}>{n}</Chip>
                    ))}
                  </Chips>
                </>
              )}
            </div>
          </GridTwo>
        </Card>

        {/* ===== Row 2: Visualization ===== */}
        <SvgCard>
          <SvgHeader>
            <strong>Visualization</strong>
            <Meta>
              <span>Structure: {struct}</span>
              {struct !== "Heap" && (
                <>
                  <span>Nodes: {graphData?.labels?.size ?? 0}</span>
                  <span>Edges: {graphData?.edges?.length ?? 0}</span>
                </>
              )}
            </Meta>
          </SvgHeader>

          <SvgWrap ref={wrapRef}>
            <ControlsBar>
              <Group>
                <span>Zoom</span>
                <SliderWrap>
                  <Slider
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    $pct={((zoom - 0.5) / (2 - 0.5)) * 100}
                    aria-label="Zoom"
                  />
                  <ValueBubble $pct={((zoom - 0.5) / (2 - 0.5)) * 100}>
                    {zoom.toFixed(1)}×
                  </ValueBubble>
                </SliderWrap>
              </Group>

              <Group>
                <span>Node size</span>
                <SliderWrap>
                  <Slider
                    min="0.8"
                    max="1.8"
                    step="0.1"
                    value={nodeScale}
                    onChange={(e) => setNodeScale(parseFloat(e.target.value))}
                    $pct={((nodeScale - 0.8) / (1.8 - 0.8)) * 100}
                    aria-label="Node size"
                  />
                  <ValueBubble $pct={((nodeScale - 0.8) / (1.8 - 0.8)) * 100}>
                    {nodeScale.toFixed(1)}
                  </ValueBubble>
                </SliderWrap>
              </Group>

              <Group>
                <ToggleBox>
                  <HiddenCheckbox
                    checked={showLabels}
                    onChange={(e) => setShowLabels(e.target.checked)}
                  />
                  <ToggleTrack $on={showLabels}>
                    <ToggleThumb $on={showLabels} />
                  </ToggleTrack>
                  <span>Labels</span>
                </ToggleBox>
              </Group>

              <GhostButton onClick={fitToView}>Fit to view</GhostButton>
              <GhostButton onClick={resetView}>Reset</GhostButton>
            </ControlsBar>

            {struct === "Heap" ? (
              <Card>
                <TightTitle>Heap (array view)</TightTitle>
                <Chips>
                  {current.a.map((n, i) => (
                    <Chip key={i}>{n}</Chip>
                  ))}
                </Chips>
              </Card>
            ) : (
              <TreeSVG
                edges={graphData.edges}
                labels={graphData.labels}
                pos={pos}
                zoom={zoom}
                nodeScale={nodeScale}
                showLabels={showLabels}
                tx={tx}
                ty={ty}
                setTx={setTx}
                setTy={setTy}
              />
            )}
          </SvgWrap>
        </SvgCard>
      </PageStack>
    </>
  );
}
