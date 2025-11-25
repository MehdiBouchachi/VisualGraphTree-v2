import styled from "styled-components";
import Button from "../../ui/Button";
import ButtonGroup from "../../ui/ButtonGroup";
import Select from "../../ui/Select";
import Input from "../../ui/Input";

/* Labeled field wrapper for Select/Input */
const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 120px;

  .field-label {
    font-size: 12px;
    color: var(--color-grey-600);
  }
`;

/* Responsive row for controls */
const Row = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  align-items: end;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  @media (max-width: 640px) {
    grid-template-columns: 1fr 1fr;
  }
`;

function QuickSortControls({
  algo,
  order,
  pivotCase,
  nStr,
  minStr,
  maxStr,
  onAlgoChange,
  onOrderChange,
  onPivotCaseChange,
  onNChange,
  onMinChange,
  onMaxChange,
  onGenerateClick,
  customListTrigger, // NEW: React node (button wrapped in Modal.Open)
}) {
  return (
    <>
      <Row role="group" aria-label="Sorting controls">
        <Field htmlFor="algo">
          <span className="field-label">Algorithm</span>
          <Select
            id="algo"
            value={algo}
            onChange={(e) => onAlgoChange(e.target.value)}
            options={[{ value: "quicksort", label: "QuickSort (tri rapide)" }]}
          />
        </Field>

        <Field htmlFor="order">
          <span className="field-label">Order</span>
          <Select
            id="order"
            value={order}
            onChange={(e) => onOrderChange(e.target.value)}
            options={[
              { value: "asc", label: "Ascending" },
              { value: "desc", label: "Descending" },
            ]}
          />
        </Field>

        <Field htmlFor="pivotCase">
          <span className="field-label">Pivot case (pivot position)</span>
          <Select
            id="pivotCase"
            value={pivotCase}
            onChange={(e) => onPivotCaseChange(e.target.value)}
            options={[
              { value: "first", label: "Start (first element)" },
              { value: "middle", label: "Middle index" },
              { value: "last", label: "End (last element)" },
              {
                value: "median-of-three",
                label: "Median-of-three (first/middle/last)",
              },
              { value: "random", label: "Random index in [L, R]" },
            ]}
          />
        </Field>

        <Field htmlFor="n">
          <span className="field-label">Array size (N)</span>
          <Input
            id="n"
            value={nStr}
            onChange={(e) => onNChange(e.target.value.replace(/[^\d]/g, ""))}
            placeholder="e.g. 30"
          />
        </Field>

        <Field htmlFor="min">
          <span className="field-label">Min value</span>
          <Input
            id="min"
            value={minStr}
            onChange={(e) => onMinChange(e.target.value.replace(/[^\d-]/g, ""))}
            placeholder="e.g. 1"
          />
        </Field>

        <Field htmlFor="max">
          <span className="field-label">Max value</span>
          <Input
            id="max"
            value={maxStr}
            onChange={(e) => onMaxChange(e.target.value.replace(/[^\d-]/g, ""))}
            placeholder="e.g. 99"
          />
        </Field>
      </Row>

      <div
        style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}
      >
        <ButtonGroup>
          <Button primary onClick={onGenerateClick}>
            Generate
          </Button>
          {/* This is whatever the parent passes (Modal.Open + Button) */}
          {customListTrigger}
        </ButtonGroup>
      </div>
    </>
  );
}

export default QuickSortControls;
