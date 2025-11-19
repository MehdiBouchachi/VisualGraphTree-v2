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

/* One cell = bar + label */
const BarItem = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
`;

const Bar = styled.div`
  width: 100%;
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

const Label = styled.div`
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.02);
  color: ${({ $role }) =>
    $role === "pivot"
      ? "#f97316"
      : $role === "compare"
      ? "#0ea5e9"
      : $role === "swap"
      ? "#16a34a"
      : "var(--color-grey-700)"};
  font-weight: ${({ $role }) => ($role ? 600 : 400)};
`;

export default function ArrayBars({ array = [], step }) {
  const n = array.length || 1;
  const max = Math.max(...array, 1);

  const getRole = (idx) => {
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
      {array.map((v, idx) => {
        const role = getRole(idx);
        return (
          <BarItem key={idx}>
            <Bar $h={(100 * v) / max} $role={role} />
            <Label $role={role}>{v}</Label>
          </BarItem>
        );
      })}
    </Wrap>
  );
}
