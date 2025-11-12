// ui/CompareRecharts.jsx
import React, { useMemo, useState } from "react";
import styled from "styled-components";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const Wrap = styled.div`
  display: grid;
  gap: 12px;
`;
const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;
const Title = styled.h4`
  margin: 0;
  font-size: 1.4rem;
  color: var(--color-grey-700);
`;
const Toolbar = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;
const Toggle = styled.button`
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--color-grey-200);
  background: ${({ $active }) =>
    $active ? "var(--color-brand-50)" : "var(--color-grey-0)"};
  color: ${({ $active }) =>
    $active ? "var(--color-brand-700)" : "var(--color-grey-700)"};
  cursor: pointer;
  font-size: 12px;
  transition: background 120ms ease;
  &:hover {
    background: ${({ $active }) =>
      $active ? "var(--color-brand-100)" : "var(--color-grey-50)"};
  }
`;
const ChartBox = styled.div`
  width: 100%;
  height: 320px;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  background: var(--color-grey-0);
  box-shadow: var(--shadow-sm);
  padding: 10px 10px 6px 10px;
`;

const TipWrap = styled.div`
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: 10px;
  padding: 8px 10px;
  box-shadow: var(--shadow-sm);
  color: var(--color-grey-700);
  font-size: 12px;
`;
function Tip({ active, payload, label, currentMetric, unit }) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload;
  return (
    <TipWrap>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div>
        {currentMetric === "timeMs" ? "Time" : currentMetric} :{" "}
        <strong>
          {p[currentMetric].toFixed(currentMetric === "timeMs" ? 2 : 0)}
          {unit}
        </strong>
      </div>
      <div>Comparisons: {p.comparisons ?? 0}</div>
      <div>Swaps: {p.swaps ?? 0}</div>
    </TipWrap>
  );
}

export default function CompareRecharts({ rows = [] }) {
  const [metric, setMetric] = useState("timeMs");
  const data = useMemo(
    () =>
      rows.map((r) => ({
        algo: r.name,
        timeMs: +r.timeMs,
        comparisons: r.comparisons ?? 0,
        swaps: r.swaps ?? 0,
      })),
    [rows]
  );

  const yUnit = metric === "timeMs" ? " ms" : "";
  const domain = metric === "timeMs" ? ["auto", "auto"] : [0, "auto"];

  return (
    <Wrap>
      <Head>
        <Title>Algorithm Comparison</Title>
        <Toolbar>
          <Toggle
            $active={metric === "timeMs"}
            onClick={() => setMetric("timeMs")}
          >
            Time (ms)
          </Toggle>
          <Toggle
            $active={metric === "comparisons"}
            onClick={() => setMetric("comparisons")}
          >
            Comparisons
          </Toggle>
          <Toggle
            $active={metric === "swaps"}
            onClick={() => setMetric("swaps")}
          >
            Swaps
          </Toggle>
        </Toolbar>
      </Head>

      <ChartBox>
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{ top: 8, right: 14, left: 0, bottom: 6 }}
          >
            <defs>
              <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.65} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-grey-200)"
            />
            <XAxis dataKey="algo" tick={{ fill: "var(--color-grey-600)" }} />
            <YAxis
              unit={yUnit}
              tick={{ fill: "var(--color-grey-600)" }}
              domain={domain}
              allowDecimals={metric === "timeMs"}
            />
            <Tooltip
              cursor={{ fill: "rgba(99,102,241,0.06)" }}
              content={<Tip currentMetric={metric} unit={yUnit} />}
            />
            <Bar
              dataKey={metric}
              name={metric}
              fill="url(#barFill)"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartBox>
    </Wrap>
  );
}
