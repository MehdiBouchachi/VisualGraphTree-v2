import { useMemo, useRef, useState, useLayoutEffect } from "react";
import styled from "styled-components";
import Textarea from "../../ui/Textarea";
import DataItem from "../../ui/DataItem";
import Button from "../../ui/Button";
import ButtonGroup from "../../ui/ButtonGroup";
import { BST } from "../../lib/trees/bst";
import { treePositions } from "../../lib/trees/layout";

/* ---------------- layout & cards (ROW layout) ---------------- */
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

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.2rem;
  margin-top: 1.6rem;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const LabelMuted = styled.div`
  font-size: 1.2rem;
  color: var(--color-grey-500);
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 0.6rem;
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
  margin-top: 0.6rem;
  font-size: 1.3rem;
  background: var(--color-grey-50);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 0.8rem 1rem;
  max-height: 180px;
  overflow: auto;
`;

/* ---------------- graph card ---------------- */
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
  font-size: 1.2rem;
  color: var(--color-grey-500);
  display: flex;
  gap: 0.8rem;
  align-items: center;
`;

const SvgWrap = styled.div`
  padding: 1.6rem;
`;

/* ---------------- controls bar (sliders/toggle) ---------------- */
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

/* Ghost buttons */
const GhostButton = styled(Button)`
  background: transparent;
  color: var(--color-grey-600);
  border: 1px solid var(--color-grey-200);

  &:hover {
    background: var(--color-grey-50);
  }
`;

/* ---------------- SVG elements ---------------- */
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
  /* Use theme colors for perfect contrast in light/dark */
  fill: var(--color-grey-800);
  paint-order: stroke fill;

  font-size: ${(p) => p.$px}px;
`;

/* ---------------- Tree SVG (with pan/zoom) ---------------- */
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
  const fontPx = Math.max(10, Math.round(12 * nodeScale)); // clamp min for readability

  // Drag-to-pan
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  const onMouseDown = (e) => {
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseMove = (e) => {
    if (!dragging.current) return;
    const dx = (e.clientX - last.current.x) / zoom;
    const dy = (e.clientY - last.current.y) / zoom;
    setTx((v) => v + dx);
    setTy((v) => v + dy);
    last.current = { x: e.clientX, y: e.clientY };
  };
  const endDrag = () => (dragging.current = false);

  return (
    <Svg
      viewBox={`0 0 ${w} ${h}`}
      $grabbing={dragging.current}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseLeave={endDrag}
      onMouseUp={endDrag}
      role="img"
      aria-label="Binary tree visualization"
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

/* ---------------- main component ---------------- */
export default function TP1TreesBasics() {
  // Section 1: data + metrics
  const [text, setText] = useState("20,15,35,40,45,50,60,22,5");

  // Section 2: view controls
  const [zoom, setZoom] = useState(1); // 0.5 .. 2.0
  const [nodeScale, setNodeScale] = useState(1); // 0.8 .. 1.8
  const [showLabels, setShowLabels] = useState(true);
  const [tx, setTx] = useState(0); // pan x
  const [ty, setTy] = useState(0); // pan y

  // measure wrapper to implement "Fit to view"
  const wrapRef = useRef(null);
  const [wrapSize, setWrapSize] = useState({ w: 800, h: 420 });
  useLayoutEffect(() => {
    if (!wrapRef.current) return;
    const update = () => {
      const rect = wrapRef.current.getBoundingClientRect();
      setWrapSize({ w: rect.width - 32, h: Math.min(rect.height - 32, 560) }); // minus padding
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  // parse & build tree
  const values = useMemo(
    () =>
      text
        .replace(/,/g, "\n")
        .split(/\s+/)
        .map(Number)
        .filter((n) => !Number.isNaN(n)),
    [text]
  );

  const tree = useMemo(() => {
    const t = new BST();
    values.forEach((v) => t.insert(v));
    return t;
  }, [values]);

  const { edges, labels, root } = tree.graph();
  const pos = useMemo(() => treePositions(edges, root), [edges, root]);

  // fit to view
  const fitToView = () => {
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

  const centerOrigin = () => {
    setTx(0);
    setTy(0);
  };

  const handleSample = () =>
    setText("20,15,35,5,22,40,45,50,60,10,31,78,28,8,16");
  const handleClear = () => setText("");

  return (
    <>
      <PageStack>
        {/* SECTION 1 — input + metrics */}
        <Card>
          <SectionTitle>Input</SectionTitle>

          <ControlsRow>
            <ButtonGroup>
              <Button onClick={handleSample}>Load sample</Button>
              <Button variation="secondary" onClick={handleClear}>
                Clear
              </Button>
            </ButtonGroup>
          </ControlsRow>

          <Textarea
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <SectionTitle>Metrics</SectionTitle>
          <StatGrid>
            <DataItem label="Height">{tree.height()}</DataItem>
            <div>
              <LabelMuted>Inorder</LabelMuted>
              <Chips>
                {tree.inorder().map((n, i) => (
                  <Chip key={i}>{n}</Chip>
                ))}
              </Chips>
            </div>
          </StatGrid>

          <LabelMuted>BFS Levels</LabelMuted>
          <PreBlock>{JSON.stringify(tree.bfsLevels(), null, 2)}</PreBlock>
        </Card>

        {/* SECTION 2 — graph */}
        <SvgCard>
          <SvgHeader>
            <SvgHeaderTitle>Visualization</SvgHeaderTitle>
            <SvgHeaderMeta>
              <span>Nodes: {labels?.size ?? 0}</span>
              <span>Edges: {edges.length}</span>
            </SvgHeaderMeta>
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

              {/* Node size */}
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
                  <span>Show labels</span>
                </ToggleBox>
              </Group>

              <GhostButton onClick={fitToView}>Fit to view</GhostButton>
              <GhostButton onClick={centerOrigin}>Center</GhostButton>
            </ControlsBar>

            <TreeSVG
              edges={edges}
              labels={labels}
              pos={pos}
              zoom={zoom}
              nodeScale={nodeScale}
              showLabels={showLabels}
              tx={tx}
              ty={ty}
              setTx={setTx}
              setTy={setTy}
            />
          </SvgWrap>
        </SvgCard>
      </PageStack>
    </>
  );
}
