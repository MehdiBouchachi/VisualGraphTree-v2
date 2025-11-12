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
import { RBT } from "../../lib/trees/rbt";
import { BinaryHeap } from "../../lib/trees/heap";
import { treePositions } from "../../lib/trees/layout";

/* ========= helpers ========= */

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

function sortedValuesFromGraph(graphData) {
  const vals = Array.from(graphData?.labels?.values?.() ?? [])
    .map((v) => {
      const match = String(v).match(/^-?\d+/);
      const num = parseInt(match?.[0] ?? "", 10);
      return num;
    })
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
      /* ignore */
    }
  }
  return sortedValuesFromGraph(graphData).join(",");
}

/* ========= styled ========= */

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

const PreBlock = styled.pre`
  font-size: 1.3rem;
  background: var(--color-grey-50);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 0.8rem 1rem;
  max-height: 200px;
  overflow: auto;
`;

/* Graph card / SVG area */
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

const ValueBubble = styled.span`
  position: absolute;
  top: -2.4rem;
  left: ${({ $pct }) => `calc(${$pct}% - 1.2rem)`};
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
    transform: translateX(-50%) rotate(45deg);
    width: 0.7rem;
    height: 0.7rem;
    background: var(--color-indigo-700);
    border-radius: 2px;
  }
`;

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

/* explanation box */
const ExplainBox = styled.div`
  margin-top: 1.6rem;
  background: var(--color-grey-50);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 1rem 1.2rem;
  font-size: 1.3rem;
  line-height: 1.4;
  color: var(--color-grey-700);
`;

const ExplainHeading = styled.div`
  font-weight: 600;
  font-size: 1.2rem;
  color: var(--color-grey-600);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-bottom: 0.4rem;
`;

const StatusLine = styled.div`
  font-size: 1.2rem;
  margin-top: 0.6rem;
  color: ${(p) =>
    p.$ok ? "var(--color-green-700,#15803d)" : "var(--color-red-700,#b91c1c)"};
  font-weight: 500;
`;

/* ========= SVG primitives ========= */

function getNodeStyleForLabel(struct, rawLabel) {
  let fill = "var(--color-brand-600)";
  let stroke = "rgba(0,0,0,0.25)";

  if (struct === "RBT") {
    const s = String(rawLabel);
    // we label like "10●" (red) or "10○" (black)
    const hasRedDot = s.includes("●");
    const hasBlackDot = s.includes("○");

    let isRed = false;
    let isBlack = false;
    if (hasRedDot) isRed = true;
    if (hasBlackDot) isBlack = true;
    if (!isRed && !isBlack) isBlack = true;

    if (isRed) {
      fill = "#ef4444";
      stroke = "#7f1d1d";
    } else {
      fill = "#1e1e3a";
      stroke = "#0a0a1a";
    }
  }

  return { fill, stroke };
}

const Svg = styled.svg`
  width: 100%;
  height: min(62vh, 560px);
  display: block;
  background: var(--color-grey-0);
  cursor: ${(p) => (p.$grabbing ? "grabbing" : "grab")};
  user-select: none;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
`;

const Edge = styled.line`
  stroke: rgba(148, 163, 184, 0.4);
  stroke-width: 1.5;
  stroke-linecap: round;
`;

const NodeCircle = styled.circle`
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
`;

const NodeText = styled.text`
  font-weight: 600;
  text-anchor: middle;
  dominant-baseline: middle;
  fill: #e2e8f0;
`;

function OneTreeSVG({
  title,
  struct,
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
    <div className="flex flex-col gap-2 min-w-[260px] flex-1">
      <div
        className="text-[12px] font-semibold text-[#475569] uppercase tracking-wide flex items-center gap-2"
        style={{
          lineHeight: 1.2,
        }}
      >
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "9999px",
            background:
              title === "Before"
                ? "var(--color-red-600, #dc2626)"
                : "var(--color-green-600, #16a34a)",
          }}
        />
        {title}
      </div>

      <Svg
        viewBox={`0 0 ${w} ${h}`}
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={onUp}
        onMouseLeave={onUp}
        $grabbing={dragging.current}
      >
        <g transform={`translate(${tx},${ty}) scale(${zoom})`}>
          {edges.map(([u, v], i) => {
            const p1 = pos.get(u);
            const p2 = pos.get(v);
            if (!p1 || !p2) return null;
            return <Edge key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} />;
          })}

          {[...nodes].map((id) => {
            const p = pos.get(id);
            if (!p) return null;

            const rawLabel = labels?.get(id) ?? id;
            const { fill, stroke } = getNodeStyleForLabel(struct, rawLabel);

            return (
              <g key={id}>
                <NodeCircle
                  cx={p.x}
                  cy={p.y}
                  r={R}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={1.5}
                />
                {showLabels && (
                  <NodeText x={p.x} y={p.y} fontSize={fontPx}>
                    {rawLabel}
                  </NodeText>
                )}
              </g>
            );
          })}
        </g>
      </Svg>
    </div>
  );
}

const TwoCols = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.6rem;
  width: 100%;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

/* ========= explanation builders ========= */

function buildBSTExplanation(actionType, value, beforeTree, afterTree) {
  if (actionType === "insert") {
    // Find new node in afterTree, describe path.
    let path = [];
    let cur = afterTree.root;
    while (cur && cur.key !== value) {
      path.push(cur.key);
      cur = value < cur.key ? cur.left : cur.right;
    }
    if (cur && cur.key === value) {
      const parentVal = path.length ? path[path.length - 1] : null;
      if (parentVal === null) {
        return `BST insert ${value}: ${value} became the root (tree was empty or rotated root manually later). BST never rotates automatically.`;
      }
      return `BST insert ${value}: followed "< left / > right" down ${
        path.length ? path.join(" → ") + " → " : ""
      }and attached ${value} as ${
        value < parentVal ? "left" : "right"
      } child of ${parentVal}. No balancing/rotations in BST.`;
    }
    return `BST insert ${value}: inserted following BST ordering rules.`;
  }

  if (actionType === "delete") {
    // check if 'value' still exists -> if yes, we replaced key not pointer
    const stillThere = (() => {
      let c = afterTree?.root;
      while (c) {
        if (c.key === value) return true;
        c = value < c.key ? c.left : c.right;
      }
      return false;
    })();

    if (stillThere) {
      return `BST delete ${value}: this node had 2 children; copied inorder successor into it, then removed the successor leaf.`;
    }

    return `BST delete ${value}: removed ${value} (leaf or single-child case) and reconnected its subtree up to the parent.`;
  }

  return "";
}

function buildExplanation(struct, actionType, value, afterDS, beforeDS) {
  if (struct === "AVL") {
    if (afterDS.debugSteps && afterDS.debugSteps.length) {
      return afterDS.debugSteps.join(" → ");
    }
    return `AVL ${actionType} ${value}: rebalanced using rotations so every node's balance factor stays in [-1,1].`;
  }

  if (struct === "RBT") {
    if (afterDS.debugSteps && afterDS.debugSteps.length) {
      return afterDS.debugSteps.join(" → ");
    }
    return `RBT ${actionType} ${value}: fixed red-black rules with recolor and rotations (maintain equal black-height).`;
  }

  if (struct === "BST") {
    return buildBSTExplanation(actionType, value, beforeDS, afterDS);
  }

  if (struct === "Heap") {
    if (actionType === "insert") {
      return `Heap insert ${value}: appended ${value} at the end and bubbled it up until parent ≥ child (max-heap).`;
    } else {
      return `Heap extract/delete: removed max at root, moved last element to root, then bubbled down to restore heap property.`;
    }
  }

  return "";
}

/* ========= MAIN ========= */

export default function TP2SearchTrees() {
  const [struct, setStruct] = useState("RBT");
  const [text, setText] = useState("10,4,12,7,3,9,11,2,14");

  const [op, setOp] = useState(5);
  const [opStr, setOpStr] = useState("5");

  const [genN, setGenN] = useState(15);
  const [genNStr, setGenNStr] = useState("15");

  const [genMin, setGenMin] = useState(0);
  const [genMinStr, setGenMinStr] = useState("0");

  const [genMax, setGenMax] = useState(100);
  const [genMaxStr, setGenMaxStr] = useState("100");

  const [opError, setOpError] = useState("");
  const [lastExtracted, setLastExtracted] = useState(null);

  // camera
  const [zoom, setZoom] = useState(1);
  const [nodeScale, setNodeScale] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);

  // explanation + RBT validity status
  const [explanation, setExplanation] = useState(null);
  const [rbStatus, setRbStatus] = useState(null); // { ok, problems } or null

  // we store DS before mutation for better explanation text
  const [dsBeforeOp, setDsBeforeOp] = useState(null);

  // we store the "before" snapshot frame for Before/After view
  const [prevTreeFrame, setPrevTreeFrame] = useState(null);

  // measure area to do "fitToView"
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

  // parse textarea to unique sorted values
  const nums = useMemo(() => {
    return Array.from(
      new Set(
        text
          .replace(/,/g, "\n")
          .split(/\s+/)
          .map(Number)
          .filter((n) => !Number.isNaN(n))
      )
    );
  }, [text]);

  // base data structure built fresh from nums
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
    if (struct === "RBT") {
      const t = new RBT();
      nums.forEach((n) => t.insert(n));
      return t;
    }
    const h = new BinaryHeap();
    nums.forEach((n) => h.insert(n));
    return h;
  }, [struct, nums]);

  // transient mutated DS (after op)
  const [view, setView] = useState(null);
  const current = view ?? base;

  // build graph + layout for current DS (BST/AVL/RBT)
  const currGraph = useMemo(() => {
    if (struct === "Heap") return { edges: [], labels: new Map(), root: null };
    return current.graph();
  }, [current, struct]);

  const currPos = useMemo(() => {
    if (struct === "Heap") return new Map();
    return treePositions(currGraph.edges, currGraph.root);
  }, [currGraph, struct]);

  const currTreeFrame = useMemo(() => {
    return {
      edges: currGraph.edges,
      labels: currGraph.labels,
      pos: currPos,
    };
  }, [currGraph, currPos]);

  // metrics from current DS
  const inorderValues = useMemo(() => {
    if (struct === "Heap") return [];
    if (typeof current.inorder === "function") return current.inorder();
    return sortedValuesFromGraph(currGraph);
  }, [current, currGraph, struct]);

  // membership check
  const valueExistsInCurrent = (val) => {
    if (struct === "Heap") {
      return (current?.a ?? []).includes(val);
    }
    const setVals = new Set(sortedValuesFromGraph(currGraph));
    return setVals.has(val);
  };

  // keep textarea synced after ops
  const syncTextFrom = (instance) => {
    const g = instance?.graph?.() ?? currGraph;
    const next = textFromStructure(struct, instance, g);
    setText(next);
  };

  // camera helpers
  const fitToView = () => {
    if (struct === "Heap") {
      setTx(0);
      setTy(0);
      setZoom(1);
      return;
    }
    const contentW = currPos._bounds?.width ?? 900;
    const contentH = currPos._bounds?.height ?? 420;
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

  // snapshot BEFORE frame + DS
  function snapshotBeforeMutation() {
    setPrevTreeFrame({
      edges: currTreeFrame.edges,
      labels: currTreeFrame.labels,
      pos: currTreeFrame.pos,
    });
    setDsBeforeOp(current);
  }

  // helper: run validator if RBT, else null
  function computeRbStatus(ds) {
    if (struct !== "RBT") return null;
    if (!ds || typeof ds.checkValidity !== "function") return null;
    return ds.checkValidity();
  }

  // INSERT
  const applyInsert = () => {
    setOpError("");

    if (valueExistsInCurrent(op)) {
      setOpError(`Value ${op} already exists.`);
      return;
    }

    snapshotBeforeMutation();

    if (struct === "Heap") {
      const h = new BinaryHeap();
      nums.forEach((n) => h.insert(n));
      h.insert(op);
      setLastExtracted(null);
      setView(h);
      setText(h.a.join(","));

      setExplanation(
        buildExplanation(struct, "insert", op, h, dsBeforeOp ?? current)
      );
      setRbStatus(null); // heap doesn't have rbStatus
      return;
    }

    const T = struct === "BST" ? BST : struct === "AVL" ? AVL : RBT;
    const t = new T();
    nums.forEach((n) => t.insert(n));
    t.insert(op);

    setView(t);
    syncTextFrom(t);

    setExplanation(
      buildExplanation(struct, "insert", op, t, dsBeforeOp ?? current)
    );
    setRbStatus(computeRbStatus(t));
  };

  // DELETE / EXTRACT
  const applyDelete = () => {
    setOpError("");

    snapshotBeforeMutation();

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

      setExplanation(
        buildExplanation(struct, "delete", op, h, dsBeforeOp ?? current)
      );
      setRbStatus(null);
      return;
    }

    if (!valueExistsInCurrent(op)) {
      setOpError(`Value ${op} not found in the tree.`);
      return;
    }

    const T = struct === "BST" ? BST : struct === "AVL" ? AVL : RBT;
    const t = new T();
    nums.forEach((n) => t.insert(n));
    t.delete(op);

    setView(t);
    syncTextFrom(t);

    setExplanation(
      buildExplanation(struct, "delete", op, t, dsBeforeOp ?? current)
    );
    setRbStatus(computeRbStatus(t));
  };

  // generate random values
  const generate = () => {
    const N = Math.max(1, Math.min(1000, genN));
    const min = Math.min(genMin, genMax);
    const max = Math.max(genMin, genMax);
    const arr = Array.from(
      { length: N },
      () => Math.floor(Math.random() * (max - min + 1)) + min
    );
    const uniqueArr = Array.from(new Set(arr));

    setText(uniqueArr.join(","));
    setView(null);
    setLastExtracted(null);
    setOpError("");
    setPrevTreeFrame(null);
    setExplanation(null);
    setDsBeforeOp(null);
    setRbStatus(null);
  };

  // complete reset (switch struct or rebuild from list)
  function hardResetFromTextarea(newStructValue = null) {
    if (newStructValue !== null) setStruct(newStructValue);
    setView(null);
    setLastExtracted(null);
    setOpError("");
    setPrevTreeFrame(null);
    setExplanation(null);
    setDsBeforeOp(null);
    setRbStatus(null);
  }

  // pick which frames to display
  const leftFrame = prevTreeFrame ?? currTreeFrame;
  const rightFrame = currTreeFrame;

  return (
    <>
      <PageStack>
        {/* CONTROLS + METRICS */}
        <Card>
          <SectionTitle>Controls</SectionTitle>

          <RowWrap>
            <Select
              value={struct}
              onChange={(e) => {
                hardResetFromTextarea(e.target.value);
              }}
              options={[
                { value: "RBT", label: "Red-Black" },
                { value: "AVL", label: "AVL" },

                { value: "BST", label: "BST" },
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
                  hardResetFromTextarea();
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
                  setText(e.target.value);
                  hardResetFromTextarea();
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

        {/* VISUALIZATION */}
        <SvgCard>
          <SvgHeader>
            <strong>Visualization</strong>
            <Meta>
              <span>
                Structure:{" "}
                {struct === "RBT" ? "RBT" : struct === "Heap" ? "Heap" : struct}
              </span>
              {struct !== "Heap" && (
                <>
                  <span>Nodes: {currTreeFrame.labels?.size ?? 0}</span>
                  <span>Edges: {currTreeFrame.edges?.length ?? 0}</span>
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
              <GhostButton onClick={resetView}>Reset camera</GhostButton>
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
              <>
                <TwoCols>
                  <OneTreeSVG
                    title="Before"
                    struct={struct}
                    edges={leftFrame.edges}
                    labels={leftFrame.labels}
                    pos={leftFrame.pos}
                    zoom={zoom}
                    nodeScale={nodeScale}
                    showLabels={showLabels}
                    tx={tx}
                    ty={ty}
                    setTx={setTx}
                    setTy={setTy}
                  />

                  <OneTreeSVG
                    title="After"
                    struct={struct}
                    edges={rightFrame.edges}
                    labels={rightFrame.labels}
                    pos={rightFrame.pos}
                    zoom={zoom}
                    nodeScale={nodeScale}
                    showLabels={showLabels}
                    tx={tx}
                    ty={ty}
                    setTx={setTx}
                    setTy={setTy}
                  />
                </TwoCols>

                <ExplainBox>
                  <ExplainHeading>Why did the tree change?</ExplainHeading>
                  <div>
                    {explanation
                      ? explanation
                      : "No operation yet. Insert or delete a value to see balancing steps / rotations."}
                  </div>

                  <StatusLine $ok={rbStatus?.ok ?? true}>
                    {struct === "RBT" ? (
                      rbStatus ? (
                        rbStatus.ok ? (
                          <>Red-Black status: OK ✅ Black-height consistent.</>
                        ) : (
                          <>
                            Red-Black status: ❌ {rbStatus.problems.join(" | ")}
                          </>
                        )
                      ) : (
                        "Red-Black status: N/A (no operation yet)"
                      )
                    ) : struct === "AVL" ? (
                      "AVL status: height-balanced by rotations (bf in [-1,1])"
                    ) : struct === "BST" ? (
                      "BST status: no balancing (can become skewed)"
                    ) : (
                      "Heap status: parent ≥ child (max-heap)"
                    )}
                  </StatusLine>
                </ExplainBox>
              </>
            )}
          </SvgWrap>
        </SvgCard>
      </PageStack>
    </>
  );
}
