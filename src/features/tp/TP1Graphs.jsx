import { useMemo, useRef, useState, useLayoutEffect } from "react";
import styled from "styled-components";
import Button from "../../ui/Button";
import Select from "../../ui/Select";
import DataItem from "../../ui/DataItem";
import ButtonGroup from "../../ui/ButtonGroup";
import { parseEdges, graphMetrics, circularLayout } from "../../lib/graph";

/* ---------- layout & cards ---------- */
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

const ControlsRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1.2rem;

  & ${ButtonGroup} > * {
    height: 3.6rem;
  }
`;

const GridTwo = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 2rem;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

/* ---------- SVG card ---------- */
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

const SvgHeaderTitle = styled.div`
  font-weight: 700;
  color: var(--color-grey-700);
`;

const SvgHeaderMeta = styled.div`
  display: flex;
  gap: 0.8rem;
  align-items: center;
  flex-wrap: wrap;
`;

const Badge = styled.span`
  background: var(--color-indigo-100);
  color: var(--color-indigo-700);
  border: 1px solid var(--color-brand-600);
  border-radius: var(--border-radius-sm);
  padding: 0.2rem 0.8rem;
  font-size: 1.2rem;
`;

const SvgWrap = styled.div`
  padding: 1.6rem;
`;

/* ---------- Sliders / toggle ---------- */
const ControlsBar = styled.div`
  display: flex;
  gap: 1.2rem;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
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

/* ---------- SVG elements ---------- */
const Svg = styled.svg`
  width: 100%;
  height: min(62vh, 560px);
  display: block;
  background: var(--color-grey-0);
  border-top: 1px solid var(--color-grey-200);
  cursor: ${(p) => (p.$grabbing ? "grabbing" : "grab")};
  user-select: none;
`;
const Edge = styled.line`
  stroke: var(--color-grey-300);
  stroke-width: 1.2;
  stroke-linecap: round;
  opacity: ${(p) => (p.$dim ? 0.25 : 1)};
`;
const WeightText = styled.text`
  font-size: 10px;
  fill: var(--color-grey-600);
`;
const NodeCircle = styled.circle`
  fill: var(--color-brand-600);
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
  opacity: ${(p) => (p.$dim ? 0.35 : 1)};
`;
const NodeText = styled.text`
  font-weight: 600;
  text-anchor: middle;
  dominant-baseline: middle;
  font-size: ${(p) => p.$px}px;
  fill: var(--color-grey-900);
`;

/* ---------- helpers ---------- */
function Arrow({ x1, y1, x2, y2, dim }) {
  const dx = x2 - x1,
    dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len,
    uy = dy / len;
  const baseX = x2 - ux * 16,
    baseY = y2 - uy * 16,
    s = 8;
  const leftX = baseX - uy * s,
    leftY = baseY + ux * s;
  const rightX = baseX + uy * s,
    rightY = baseY - ux * s;
  return (
    <polygon
      points={`${x2},${y2} ${leftX},${leftY} ${rightX},${rightY}`}
      fill="var(--color-grey-500)"
      opacity={dim ? 0.25 : 1}
    />
  );
}

/* ---------- layouts ---------- */
function gridLayout(ids, cols = 5, cellW = 110, cellH = 90, pad = 40) {
  const arr = [...ids];
  const pos = new Map();
  arr.forEach((id, i) => {
    const r = Math.floor(i / cols),
      c = i % cols;
    pos.set(id, { x: pad + c * cellW, y: pad + r * cellH });
  });
  return pos;
}

/* ================== Component ================== */
export default function TP1Graphs() {
  const [directed, setDirected] = useState(false);
  const [layout, setLayout] = useState("circular"); // 'circular' | 'grid'
  const [edges, setEdges] = useState([]);
  const [err, setErr] = useState("");
  const [zoom, setZoom] = useState(1);
  const [nodeScale, setNodeScale] = useState(1);
  const [sizeByDegree, setSizeByDegree] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [showWeights, setShowWeights] = useState(false);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [hoverId, setHoverId] = useState(null);
  const inputRef = useRef(null);

  // size for fit-to-view
  const svgWrapRef = useRef(null);
  const [wrap, setWrap] = useState({ w: 700, h: 440 });
  useLayoutEffect(() => {
    if (!svgWrapRef.current) return;
    const update = () => {
      const r = svgWrapRef.current.getBoundingClientRect();
      setWrap({ w: r.width - 32, h: Math.min(r.height - 32, 560) });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(svgWrapRef.current);
    return () => ro.disconnect();
  }, []);

  const nodes = useMemo(() => {
    const s = new Set();
    edges.forEach((e) => {
      s.add(e.source);
      s.add(e.target);
    });
    return s;
  }, [edges]);

  const metrics = useMemo(
    () => graphMetrics(edges, directed),
    [edges, directed]
  );

  // degree map for sizing
  const degreeMap = useMemo(() => {
    const m = new Map();
    edges.forEach((e) => {
      m.set(e.source, (m.get(e.source) || 0) + 1);
      m.set(e.target, (m.get(e.target) || 0) + 1);
    });
    return m;
  }, [edges]);

  const pos = useMemo(() => {
    if (layout === "grid") return gridLayout(nodes, 6);
    const R = Math.max(80, Math.min(wrap.w, wrap.h) * 0.35);
    return circularLayout(nodes, R, wrap.w / 2, wrap.h / 2);
  }, [nodes, layout, wrap]);

  const options = [
    { value: "undirected", label: "Undirected" },
    { value: "directed", label: "Directed" },
  ];

  // fit to view (for grid we can compute bounds; for circular just center/scale wrt wrap)
  const fitToView = () => {
    if (layout === "circular") {
      setTx(0);
      setTy(0);
      setZoom(1);
      return;
    }
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    for (const { x, y } of pos.values()) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
    const contentW = maxX - minX + 120;
    const contentH = maxY - minY + 120;
    const scale = Math.max(
      0.4,
      Math.min(2, 0.92 * Math.min(wrap.w / contentW, wrap.h / contentH))
    );
    setZoom(scale);
    const dx = (wrap.w / scale - contentW) / 2 - minX + 60;
    const dy = (wrap.h / scale - contentH) / 2 - minY + 60;
    setTx(dx);
    setTy(dy);
  };

  // drag-to-pan
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

  // node size / labels
  const baseR = 16 * nodeScale;
  const fontPx = Math.max(10, Math.round(12 * nodeScale));

  const radiusFor = (id) => {
    if (!sizeByDegree) return baseR;
    const d = degreeMap.get(id) || 1;
    // sqrt scale: min 12, max 28 (times nodeScale)
    const r = 10 + Math.min(18, Math.sqrt(d) * 6);
    return (r * nodeScale) / (16 / baseR); // keep relation with baseR
  };

  // download SVG
  const downloadSVG = () => {
    const svg = document.querySelector("#graph-svg");
    if (!svg) return;
    const serializer = new XMLSerializer();
    const src = serializer.serializeToString(svg);
    const blob = new Blob([src], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `graph_${directed ? "directed" : "undirected"}_${layout}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageStack>
        {/* Controls + Metrics */}
        <Card>
          <SectionTitle>Controls</SectionTitle>
          <ControlsRow>
            <Select
              options={options}
              value={directed ? "directed" : "undirected"}
              onChange={(e) => setDirected(e.target.value === "directed")}
            />

            <ButtonGroup>
              <Button
                onClick={() => {
                  const sample = `source,target,weight
1,2,1
2,3,2
3,4,1
4,2,3
1,3,2`;
                  setEdges(parseEdges(sample));
                  setErr("");
                }}
              >
                Load sample
              </Button>
              <Button onClick={() => inputRef.current?.click()}>
                Upload CSV
              </Button>
              <input
                ref={inputRef}
                type="file"
                accept=".csv"
                hidden
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  try {
                    setEdges(parseEdges(await f.text()));
                    setErr("");
                  } catch (ex) {
                    setErr(String(ex.message || ex));
                  }
                }}
              />
              <Button
                variation="secondary"
                onClick={() => {
                  setEdges([]);
                  setErr("");
                }}
              >
                Clear
              </Button>
            </ButtonGroup>
          </ControlsRow>

          <GridTwo>
            <div>
              <SectionTitle>Metrics</SectionTitle>
              <DataItem label="Nodes">{metrics.nodes}</DataItem>
              <DataItem label="Edges">{metrics.edges}</DataItem>
              <DataItem label="Avg degree">{metrics.avgDegree}</DataItem>
              <DataItem label="Density">{metrics.density}</DataItem>
            </div>

            <div>
              <SectionTitle>View</SectionTitle>
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
                  <ToggleBox title="Size nodes by degree">
                    <HiddenCheckbox
                      checked={sizeByDegree}
                      onChange={(e) => setSizeByDegree(e.target.checked)}
                    />
                    <ToggleTrack $on={sizeByDegree}>
                      <ToggleThumb $on={sizeByDegree} />
                    </ToggleTrack>
                    <span>Size by degree</span>
                  </ToggleBox>
                </Group>

                <Group>
                  <ToggleBox title="Show node labels">
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

                <Group>
                  <ToggleBox title="Show edge weights">
                    <HiddenCheckbox
                      checked={showWeights}
                      onChange={(e) => setShowWeights(e.target.checked)}
                    />
                    <ToggleTrack $on={showWeights}>
                      <ToggleThumb $on={showWeights} />
                    </ToggleTrack>
                    <span>Weights</span>
                  </ToggleBox>
                </Group>

                <GhostButton onClick={fitToView}>Fit to view</GhostButton>
                <GhostButton onClick={downloadSVG}>Download SVG</GhostButton>
              </ControlsBar>
            </div>
          </GridTwo>

          {err && <ErrorText>{err}</ErrorText>}
        </Card>

        {/* Graph */}
        <SvgCard>
          <SvgHeader>
            <SvgHeaderTitle>Visualization</SvgHeaderTitle>
            <SvgHeaderMeta>
              <Badge>{directed ? "Directed" : "Undirected"}</Badge>
              <Badge>Layout: {layout}</Badge>
              <Badge>Nodes: {metrics.nodes}</Badge>
              <Badge>Edges: {metrics.edges}</Badge>
            </SvgHeaderMeta>
          </SvgHeader>

          <SvgWrap ref={svgWrapRef}>
            <Svg
              id="graph-svg"
              viewBox={`0 0 ${wrap.w} ${wrap.h}`}
              onMouseDown={(e) => {
                // start drag
                // ignore if clicking UI
                if (e.target.closest("button,input,select,label")) return;
                const pt = e.target;
                onDown(e);
              }}
              onMouseMove={onMove}
              onMouseUp={onUp}
              onMouseLeave={onUp}
            >
              <g transform={`translate(${tx},${ty}) scale(${zoom})`}>
                {edges.map((e, i) => {
                  const p1 = pos.get(e.source),
                    p2 = pos.get(e.target);
                  if (!p1 || !p2) return null;

                  const hoverEdge =
                    hoverId && (e.source === hoverId || e.target === hoverId);

                  const mx = (p1.x + p2.x) / 2;
                  const my = (p1.y + p2.y) / 2;

                  return (
                    <g key={i}>
                      <Edge
                        x1={p1.x}
                        y1={p1.y}
                        x2={p2.x}
                        y2={p2.y}
                        $dim={hoverId && !hoverEdge}
                      />
                      {directed && (
                        <Arrow
                          x1={p1.x}
                          y1={p1.y}
                          x2={p2.x}
                          y2={p2.y}
                          dim={hoverId && !hoverEdge}
                        />
                      )}
                      {showWeights && e.weight != null && (
                        <WeightText x={mx} y={my - 4}>
                          {String(e.weight)}
                        </WeightText>
                      )}
                    </g>
                  );
                })}

                {[...nodes].map((id) => {
                  const p = pos.get(id);
                  if (!p) return null;
                  const hovered = hoverId === id;
                  const dim = hoverId && !hovered;
                  const r = radiusFor(id);

                  return (
                    <g
                      key={id}
                      onMouseEnter={() => setHoverId(id)}
                      onMouseLeave={() => setHoverId(null)}
                    >
                      <NodeCircle cx={p.x} cy={p.y} r={r} $dim={dim} />
                      {showLabels && (
                        <NodeText x={p.x} y={p.y} $px={fontPx}>
                          {id}
                        </NodeText>
                      )}
                    </g>
                  );
                })}
              </g>
            </Svg>
          </SvgWrap>
        </SvgCard>
      </PageStack>
    </>
  );
}

/* small error line */
const ErrorText = styled.p`
  margin-top: 0.8rem;
  color: var(--color-red-700);
  background: var(--color-red-100);
  border: 1px solid var(--color-red-700);
  border-radius: var(--border-radius-sm);
  padding: 0.4rem 0.8rem;
`;
