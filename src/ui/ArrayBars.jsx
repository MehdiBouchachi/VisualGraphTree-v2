import styled from "styled-components";

const Wrap = styled.div`
  width: 100%;
  height: 280px;
  display: grid;
  align-items: end;
  gap: 2px;
  grid-template-columns: ${({ $n }) => `repeat(${$n}, 1fr)`};
  background: var(--color-grey-50);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 10px;
`;

const Bar = styled.div`
  height: ${({ $h }) => `${$h}%`};
  border-radius: 4px 4px 0 0;
  background: ${({ $role }) =>
    $role === "pivot"
      ? "#f97316" // orange
      : $role === "compare"
      ? "#0ea5e9" // blue
      : $role === "swap"
      ? "#22c55e" // green
      : "#6366f1"}; // default indigo
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  transition: height 120ms ease;
`;

export default function ArrayBars({ array = [], step }) {
  const n = array.length || 1;
  const max = Math.max(...array, 1);
  const setRole = (idx) => {
    if (!step) return null;
    if (idx === step?.pivot) return "pivot";
    if (step?.action === "swap" && (idx === step.i || idx === step.j))
      return "swap";
    if (step?.action === "compare" && (idx === step.i || idx === step.j))
      return "compare";
    return null;
  };

  return (
    <Wrap $n={n}>
      {array.map((v, idx) => (
        <Bar key={idx} $h={(100 * v) / max} $role={setRole(idx)} />
      ))}
    </Wrap>
  );
}
