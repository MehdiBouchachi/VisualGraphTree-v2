import { useMemo, useState } from "react";
import styled from "styled-components";
import Button from "../../ui/Button";

const MAX_LENGTH = 20;
const MAX_RANGE = 100; // hard limit on (max - min)

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
  max-width: 480px;
`;

const Title = styled.h4`
  font-size: 1.7rem;
  font-weight: 700;
  margin-bottom: 0.2rem;
  color: var(--color-grey-900);
`;

const Description = styled.p`
  font-size: 1.3rem;
  color: var(--color-grey-500);

  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
      "Liberation Mono", "Courier New", monospace;
    padding: 0.1rem 0.4rem;
    border-radius: 0.4rem;
    background: var(--color-grey-50);
    border: 1px solid var(--color-grey-200);
  }

  strong {
    font-weight: 600;
    color: var(--color-grey-800);
  }
`;

const TextareaLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.8rem;
`;

const LabelText = styled.span`
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--color-brand-600);
`;

const HintText = styled.span`
  font-size: 1.2rem;
  color: var(--color-grey-500);
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  resize: vertical;
  padding: 0.9rem 1rem;
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--color-grey-300);
  font-size: 1.35rem;
  font-family: inherit;
  line-height: 1.4;
  background: var(--color-grey-0);
  color: var(--color-grey-800);

  &::placeholder {
    color: var(--color-grey-400);
  }

  &:focus {
    outline: none;
    border-color: var(--color-brand-500);
    box-shadow: 0 0 0 1px var(--color-brand-500);
  }
`;

const MetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  font-size: 1.2rem;
`;

const MetaLeft = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  align-items: center;
  color: var(--color-grey-500);
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem 0.8rem;
  border-radius: 999px;
  border: 1px solid var(--color-grey-300);
  font-size: 1.15rem;
  background: var(--color-grey-50);
  color: var(--color-grey-700);
`;

const BadgeWarning = styled(Badge)`
  border-color: var(--color-yellow-700);
  background: var(--color-yellow-100);
  color: var(--color-yellow-700);
`;

const PreviewRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.4rem;
`;

const ValueChip = styled.span`
  padding: 0.2rem 0.7rem;
  border-radius: 999px;
  border: 1px solid var(--color-brand-600);
  background: var(--color-brand-50);
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--color-brand-700);
`;

const ValueChipDuplicate = styled(ValueChip)`
  border-color: var(--color-yellow-700);
  background: var(--color-yellow-100);
  color: var(--color-yellow-700);
`;

const ErrorText = styled.p`
  font-size: 1.25rem;
  color: var(--color-red-700);
  min-height: 1.4rem;
`;

const SuccessText = styled.p`
  font-size: 1.25rem;
  color: var(--color-green-700);
  min-height: 1.4rem;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
`;

// --- helpers -----------------------------------------------------
function parseNumberList(raw) {
  const cleaned = raw.replace(/,/g, " ").trim();
  if (!cleaned) return { numbers: [], invalidTokens: [] };

  const tokens = cleaned.split(/\s+/);
  const numbers = [];
  const invalidTokens = [];

  for (const token of tokens) {
    if (/^-?\d+$/.test(token)) {
      numbers.push(parseInt(token, 10));
    } else {
      invalidTokens.push(token);
    }
  }

  return { numbers, invalidTokens };
}

/**
 * Props:
 *  - onApplyList(nums: number[]): void
 *  - onCloseModal(): void
 */
function CustomListModalContent({ onApplyList, onCloseModal }) {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { numbers, invalidTokens } = useMemo(
    () => parseNumberList(value),
    [value]
  );

  const meta = useMemo(() => {
    if (!numbers.length) return null;
    let min = numbers[0];
    let max = numbers[0];

    const seenOnce = new Set();
    const duplicateValues = new Set();

    for (const n of numbers) {
      if (n < min) min = n;
      if (n > max) max = n;

      if (seenOnce.has(n)) {
        duplicateValues.add(n);
      } else {
        seenOnce.add(n);
      }
    }

    const hasDuplicates = duplicateValues.size > 0;
    const range = max - min;
    return {
      length: numbers.length,
      min,
      max,
      range,
      hasDuplicates,
      duplicateValues,
    };
  }, [numbers]);

  // validation rules
  let error = null;

  if (submitted || value.length > 0) {
    if (invalidTokens.length > 0) {
      error = `Invalid value${
        invalidTokens.length > 1 ? "s" : ""
      }: ${invalidTokens.slice(0, 4).join(", ")}. Only integers are allowed.`;
    } else if (numbers.length === 0) {
      error = "Please enter at least one number.";
    } else if (numbers.length < 2) {
      error = "The list must contain at least 2 numbers.";
    } else if (numbers.length > MAX_LENGTH) {
      error = `The list must not exceed ${MAX_LENGTH} numbers.`;
    } else if (meta && meta.hasDuplicates) {
      error = "Duplicates are not allowed. Please use distinct values.";
    } else if (meta && meta.range > MAX_RANGE) {
      error = `The gap between minimum and maximum is too large (range = ${meta.range}). Please keep values closer together (max − min ≤ ${MAX_RANGE}).`;
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (error) return;
    if (!numbers.length) return;

    onApplyList(numbers);
    onCloseModal();
  };

  return (
    <Wrapper as="form" onSubmit={handleSubmit}>
      <Title>Custom list</Title>

      <Description>
        Enter your values separated by spaces or commas.{" "}
        <strong>Example:</strong> <code>5 3 9 1 7</code> or{" "}
        <code>5,3,9,1,7</code>. The list must:
        <br />• contain between <strong>2</strong> and{" "}
        <strong>{MAX_LENGTH}</strong> numbers
        <br />• have <strong>no duplicates</strong>
        <br />• keep the values reasonably close (
        <strong>max − min ≤ {MAX_RANGE}</strong>).
      </Description>

      <div>
        <TextareaLabel>
          <LabelText>Values</LabelText>
          <HintText>
            Tip: paste from Excel / VS&nbsp;Code, spaces are fine.
          </HintText>
        </TextareaLabel>

        <Textarea
          value={value}
          onChange={(e) => {
            setSubmitted(false);
            setValue(e.target.value);
          }}
          placeholder="e.g. 20 4 3 18 7 14 8 9"
        />

        <MetaRow>
          <MetaLeft>
            <Badge>
              Length: {numbers.length}
              {numbers.length ? " items" : ""}
            </Badge>
            {meta && (
              <>
                <Badge>Min: {meta.min}</Badge>
                <Badge>Max: {meta.max}</Badge>
                <Badge>Range: {meta.range}</Badge>
                {meta.hasDuplicates && (
                  <BadgeWarning>⚠ duplicates detected</BadgeWarning>
                )}
                {meta.range > MAX_RANGE && (
                  <BadgeWarning>
                    ⚠ range too large (&gt; {MAX_RANGE})
                  </BadgeWarning>
                )}
              </>
            )}
          </MetaLeft>
          {numbers.length > 0 && (
            <HintText>
              Showing first {Math.min(10, numbers.length)} values:
            </HintText>
          )}
        </MetaRow>

        {numbers.length > 0 && (
          <PreviewRow>
            {numbers.slice(0, 10).map((n, idx) => {
              const isDuplicate =
                meta && meta.duplicateValues && meta.duplicateValues.has(n);

              const ChipComponent = isDuplicate
                ? ValueChipDuplicate
                : ValueChip;

              return <ChipComponent key={`${n}-${idx}`}>{n}</ChipComponent>;
            })}
            {numbers.length > 10 && (
              <ValueChip>+{numbers.length - 10} more…</ValueChip>
            )}
          </PreviewRow>
        )}
      </div>

      {error ? (
        <ErrorText>{error}</ErrorText>
      ) : numbers.length >= 2 &&
        numbers.length <= MAX_LENGTH &&
        meta &&
        !meta.hasDuplicates &&
        meta.range <= MAX_RANGE ? (
        <SuccessText>Looks good, ready to apply.</SuccessText>
      ) : (
        <ErrorText />
      )}

      <Footer>
        <Button type="button" variation="secondary" onClick={onCloseModal}>
          Cancel
        </Button>
        <Button type="submit" primary disabled={!!error || numbers.length < 2}>
          Apply list
        </Button>
      </Footer>
    </Wrapper>
  );
}

export default CustomListModalContent;
