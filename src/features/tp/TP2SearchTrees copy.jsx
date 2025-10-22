import { useMemo, useState } from "react";
import Heading from "../../ui/Heading";
import Row from "../../ui/Row";
import Button from "../../ui/Button";
import Select from "../../ui/Select";
import Textarea from "../../ui/Textarea";
import DataItem from "../../ui/DataItem";
import { BST } from "../../lib/trees/bst";
import { AVL } from "../../lib/trees/avl";
import { BinaryHeap } from "../../lib/trees/heap";
import { treePositions } from "../../lib/trees/layout";

function TreeSVG({ edges, labels, pos }) {
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

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      style={{
        width: "100%",
        border: "1px solid var(--color-grey-200)",
        borderRadius: 7,
        background: "var(--color-grey-0)",
      }}
    >
      {edges.map(([u, v], i) => {
        const p1 = pos.get(u),
          p2 = pos.get(v);
        if (!p1 || !p2) return null;
        return (
          <line
            key={i}
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke="#4b5563"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        );
      })}
      {[...nodes].map((id) => {
        const p = pos.get(id);
        if (!p) return null;
        const text = labels?.get(id) ?? id; // <<< show value, not the unique id
        return (
          <g key={id}>
            <circle cx={p.x} cy={p.y} r="14" fill="var(--color-brand-600)" />
            <text
              x={p.x}
              y={p.y + 4}
              textAnchor="middle"
              fontSize="12"
              fill="#0b1320"
              fontWeight="600"
            >
              {text}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function TP2SearchTrees() {
  // ----- inputs / generator -----
  const [struct, setStruct] = useState("BST");
  const [text, setText] = useState("10,4,12,7,3,9,11,2,14");
  const [op, setOp] = useState(5);
  const [genN, setGenN] = useState(15);
  const [genMin, setGenMin] = useState(0);
  const [genMax, setGenMax] = useState(100);
  const [lastExtracted, setLastExtracted] = useState(null);

  const nums = Array.from(
    new Set(
      text
        .replace(/,/g, "\n")
        .split(/\s+/)
        .map(Number)
        .filter((n) => !Number.isNaN(n))
    )
  );
  // build baseline structure from nums
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

  // allow ephemeral view after operations without mutating base
  const [view, setView] = useState(null);
  const current = view ?? base;

  // operations
  const applyInsert = () => {
    if (struct === "Heap") {
      const h = new BinaryHeap();
      nums.forEach((n) => h.insert(n));
      h.insert(op);
      setView(h);
    } else if (struct === "BST") {
      const t = new BST();
      nums.forEach((n) => t.insert(n));
      t.insert(op);
      setView(t);
    } else {
      const t = new AVL();
      nums.forEach((n) => t.insert(n));
      t.insert(op);
      setView(t);
    }
  };

  const applyDelete = () => {
    if (struct === "Heap") {
      const h = new BinaryHeap();
      nums.forEach((n) => h.insert(n));
      const ex = h.extractMax();
      setLastExtracted(ex);
      setView(h);
    } else if (struct === "BST") {
      const t = new BST();
      nums.forEach((n) => t.insert(n));
      t.delete(op);
      setView(t);
    } else {
      const t = new AVL();
      nums.forEach((n) => t.insert(n));
      t.delete(op);
      setView(t);
    }
  };

  // edges/positions for tree drawing
  const graphData = useMemo(() => {
    if (struct === "Heap") return { edges: [], labels: new Map(), root: null };
    return current.graph(); // { edges, labels, root }
  }, [current, struct]);

  const pos = useMemo(
    () =>
      struct === "Heap"
        ? new Map()
        : treePositions(graphData.edges, graphData.root),
    [graphData, struct]
  );

  // generator -> produce vector and fill textarea
  const generate = () => {
    const N = Math.max(1, Math.min(1000, genN));
    const min = Math.min(genMin, genMax),
      max = Math.max(genMin, genMax);
    const arr = Array.from(
      { length: N },
      () => Math.floor(Math.random() * (max - min + 1)) + min
    );
    setText(arr.join(","));
    setView(null);
    setLastExtracted(null);
  };

  return (
    <>
      <Heading as="h2">TP2 — Search Trees</Heading>

      {/* structure + value + actions */}
      <Row type="horizontal">
        <Select
          value={struct}
          onChange={(e) => {
            setStruct(e.target.value);
            setView(null);
            setLastExtracted(null);
          }}
          options={[
            { value: "BST", label: "BST" },
            { value: "AVL", label: "AVL" },
            { value: "Heap", label: "Heap (max)" },
          ]}
        />
        <input
          type="number"
          value={op}
          onChange={(e) => setOp(parseInt(e.target.value || "0", 10))}
        />
        <Button
          onClick={() => {
            setView(null);
            setLastExtracted(null);
          }}
        >
          Build from list
        </Button>
        <Button onClick={applyInsert}>Insert</Button>
        <Button $variation="danger" onClick={applyDelete}>
          Delete / Extract
        </Button>
      </Row>

      {/* generator */}
      <Row type="horizontal">
        <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
          <span>Generate</span>
          <input
            type="number"
            value={genN}
            onChange={(e) => setGenN(parseInt(e.target.value || "0", 10))}
            style={{ width: 80 }}
          />
          <span>values between</span>
          <input
            type="number"
            value={genMin}
            onChange={(e) => setGenMin(parseInt(e.target.value || "0", 10))}
            style={{ width: 90 }}
          />
          <span>and</span>
          <input
            type="number"
            value={genMax}
            onChange={(e) => setGenMax(parseInt(e.target.value || "0", 10))}
            style={{ width: 90 }}
          />
          <Button onClick={generate}>Generate vector</Button>
        </div>
      </Row>

      {/* input vector + metrics */}
      <Row>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} />
        <div>
          {struct === "Heap" ? (
            <>
              <DataItem label="Heap array">{current.a.join(", ")}</DataItem>
              {lastExtracted != null && (
                <DataItem label="Extracted max">
                  {String(lastExtracted)}
                </DataItem>
              )}
            </>
          ) : (
            <>
              <DataItem label="Height">{current.height()}</DataItem>
              <DataItem label="BFS Levels">
                <pre style={{ fontSize: "1.2rem" }}>
                  {JSON.stringify(current.bfsLevels(), null, 2)}
                </pre>
              </DataItem>
            </>
          )}
        </div>
      </Row>

      {/* visual */}
      {struct === "Heap" ? (
        <div style={{ opacity: 0.8 }}>
          Heap shown as array; tree-drawing is optional.
        </div>
      ) : (
        <TreeSVG edges={graphData.edges} labels={graphData.labels} pos={pos} />
      )}
    </>
  );
}
