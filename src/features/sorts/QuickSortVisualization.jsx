import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import Button from "../../ui/Button";
import ArrayBars from "../../ui/ArrayBars";

/* Layout for the two bar panels */
const Grid = styled.div`
  display: grid;
  gap: 1.6rem;
  grid-template-columns: 1fr 1fr;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

/* Wrapper for the speed control row */
const SpeedRow = styled.div`
  margin-left: 18px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

const SpeedLabel = styled.span`
  font-size: 1.2rem;
  color: var(--color-grey-600);
`;

/* Styled range input matching your design system */
const SpeedSlider = styled.input.attrs({ type: "range" })`
  appearance: none;
  width: 180px;
  height: 4px;
  border-radius: 999px;
  background: var(--color-grey-300);
  outline: none;
  cursor: pointer;

  /* WebKit (Chrome, Edge, Safari) */
  &::-webkit-slider-runnable-track {
    height: 4px;
    border-radius: 999px;
    background: var(--color-grey-300);
  }

  &::-webkit-slider-thumb {
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 999px;
    background: var(--color-brand-500);
    border: 2px solid var(--color-grey-0);
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.35); /* soft brand glow */
    margin-top: -5px; /* center on track */
  }

  /* Firefox */
  &::-moz-range-track {
    height: 4px;
    border-radius: 999px;
    background: var(--color-grey-300);
  }

  &::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 999px;
    background: var(--color-brand-500);
    border: 2px solid var(--color-grey-0);
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.35);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-brand-600);
  }
`;

const SpeedValue = styled.span`
  font-size: 1.2rem;
  color: var(--color-grey-600);
`;

/* Playback hook local to visualization */
function useQuickSortPlayback(steps, { autoplay = false, speedMs = 260 } = {}) {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(autoplay);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!playing) return;
    timerRef.current = setInterval(() => {
      setIdx((current) => (current + 1 < steps.length ? current + 1 : current));
    }, speedMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing, speedMs, steps.length]);

  useEffect(() => {
    setIdx(0);
    setPlaying(autoplay);
  }, [steps, autoplay]);

  return {
    idx,
    step: steps[idx] ?? null,
    isEnd: idx >= steps.length - 1,
    playing,
    play: () => setPlaying(true),
    pause: () => setPlaying(false),
    next: () => setIdx((i) => Math.min(i + 1, steps.length - 1)),
    prev: () => setIdx((i) => Math.max(i - 1, 0)),
    reset: () => setIdx(0),
  };
}

function QuickSortVisualization({ array, steps }) {
  const [speedMs, setSpeedMs] = useState(220);
  const playback = useQuickSortPlayback(steps, {
    autoplay: false,
    speedMs,
  });

  return (
    <>
      <Grid>
        <div>
          <div
            style={{
              fontSize: 12,
              color: "var(--color-grey-500)",
              marginBottom: 6,
            }}
          >
            Initial
          </div>
          {/* Original array, no highlight */}
          <ArrayBars array={array} step={null} />
        </div>
        <div>
          <div
            style={{
              fontSize: 12,
              color: "#16a34a",
              marginBottom: 6,
            }}
          >
            Current Step
          </div>
          <ArrayBars
            array={steps[playback.idx]?.a ?? array}
            step={steps[playback.idx]}
          />
        </div>
      </Grid>

      {/* Playback controls */}
      <div
        style={{
          marginTop: 12,
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Button variation="danger" onClick={playback.reset}>
          Reset
        </Button>
        <Button variation="secondary" onClick={playback.prev}>
          ⟵ Step
        </Button>
        {playback.playing ? (
          <Button secondary onClick={playback.pause}>
            Pause
          </Button>
        ) : (
          <Button primary onClick={playback.play}>
            Play
          </Button>
        )}
        <Button
          variation="secondary"
          onClick={playback.next}
          disabled={playback.isEnd}
        >
          Step ⟶
        </Button>

        <div
          style={{
            marginLeft: 12,
            fontSize: 12,
            color: "var(--color-grey-600)",
          }}
        >
          Step: {playback.idx + 1} / {steps.length}
        </div>

        <SpeedRow>
          <SpeedLabel>Speed</SpeedLabel>
          <SpeedSlider
            min="40"
            max="800"
            step="20"
            value={speedMs}
            onChange={(e) => setSpeedMs(parseInt(e.target.value, 10))}
          />
          <SpeedValue>{speedMs} ms</SpeedValue>
        </SpeedRow>
      </div>
    </>
  );
}

export default QuickSortVisualization;
