import { useMemo, useState } from "react";
import styled from "styled-components";
import Button from "../../ui/Button";

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
`;

const Description = styled.p`
  font-size: 1.3rem;
  color: var(--color-grey-600);

  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
      "Liberation Mono", "Courier New", monospace;
    padding: 0.1rem 0.4rem;
    border-radius: 0.4rem;
    background: var(--color-grey-50);
    border: 1px solid var(--color-grey-100);
  }

  strong {
    font-weight: 600;
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
  color: var(--color-grey-700);
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
  color: var(--color-grey-600);
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.1rem 0.7rem;
  border-radius: 999px;
  border: 1px solid var(--color-grey-300);
  font-size: 1.15rem;
  background: var(--color-grey-50);
`;

const PreviewRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.4rem;
`;

const ValueChip = styled.span`
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  border: 1px solid var(--color-grey-200);
  background: var(--color-grey-50);
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--color-grey-700);
`;

const ErrorText = styled.p`
  font-size: 1.25rem;
  color: var(--color-red-600);
  min-height: 1.4rem;
`;

const SuccessText = styled.p`
  font-size: 1.25rem;
  color: var(--color-emerald-600);
  min-height: 1.4rem;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
`;

// --- helpers -----------------------------------------------------

function parseNumberList(raw) {
  return raw
    .replace(/,/g, " ")
    .split(/\s+/)
    .map((x) => parseInt(x, 10))
    .filter((x) => !Number.isNaN(x));
}

/**
 * Props:
 *  - onApplyList(nums: number[]): void
 *  - onCloseModal(): void    (injected automatically by <Modal.Window>)
 */
function CustomListModalContent({ onApplyList, onCloseModal }) {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const numbers = useMemo(() => parseNumberList(value), [value]);

  const meta = useMemo(() => {
    if (!numbers.length) return null;
    let min = numbers[0];
    let max = numbers[0];
    const seen = new Set();
    let hasDuplicates = false;

    for (const n of numbers) {
      if (n < min) min = n;
      if (n > max) max = n;
      if (seen.has(n)) hasDuplicates = true;
      seen.add(n);
    }
    return { length: numbers.length, min, max, hasDuplicates };
  }, [numbers]);

  const error =
    numbers.length === 0 && submitted
      ? "Please enter at least one number."
      : numbers.length > 0 && numbers.length < 2
      ? "The list must contain at least 2 numbers."
      : numbers.length > 256
      ? "The list must not exceed 256 numbers."
      : null;

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
        <code>5,3,9,1,7</code>. The list must contain between 2 and 256 numbers.
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
                {meta.hasDuplicates && (
                  <Badge>⚠ duplicates detected (QuickSort still works)</Badge>
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
            {numbers.slice(0, 10).map((n, idx) => (
              <ValueChip key={`${n}-${idx}`}>{n}</ValueChip>
            ))}
            {numbers.length > 10 && (
              <ValueChip>+{numbers.length - 10} more…</ValueChip>
            )}
          </PreviewRow>
        )}
      </div>

      {error ? (
        <ErrorText>{error}</ErrorText>
      ) : numbers.length >= 2 ? (
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
