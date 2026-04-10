'use client';

import { useEffect, useMemo, useState } from 'react';

import { getShameLabel, interpolateScoreColor } from '../../../lib/utils/shameScore';

interface ShameScoreMeterProps {
  score: number;
  previousScore?: number;
  isLoading?: boolean;
}

const RING_SIZE = 200;
const STROKE_WIDTH = 12;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const ShameScoreMeter = ({
  score,
  previousScore,
  isLoading = false,
}: ShameScoreMeterProps) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (isLoading) return;

    const from = displayScore;
    const to = score;
    const duration = 800;
    const start = performance.now();

    let frameId = 0;

    const animate = (timestamp: number) => {
      const elapsed = timestamp - start;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(from + (to - from) * eased));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [score, isLoading]);

  const delta = typeof previousScore === 'number' ? score - previousScore : null;
  const scoreColor = useMemo(() => interpolateScoreColor(displayScore), [displayScore]);
  const strokeOffset = CIRCUMFERENCE - (displayScore / 100) * CIRCUMFERENCE;

  if (isLoading) {
    return (
      <section className="flex flex-col items-center rounded-card border border-border bg-white p-6 shadow-card">
        <div className="shimmer h-[200px] w-[200px] rounded-full" />
        <div className="shimmer mt-4 h-3 w-28 rounded" />
      </section>
    );
  }

  return (
    <section
      className="flex flex-col items-center rounded-card border border-border bg-white p-6 shadow-card"
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={displayScore}
      aria-label="Shame Score"
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-text-muted">
        YOUR SHAME SCORE
      </p>

      <div className="relative mt-4">
        <svg
          width={RING_SIZE}
          height={RING_SIZE}
          viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
          className="-rotate-90"
        >
          {/* Background ring */}
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="#EEEDE6"
            strokeWidth={STROKE_WIDTH}
          />
          {/* Score ring */}
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={scoreColor}
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-smooth"
          />
        </svg>

        {/* Score number centered inside ring */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p
            className="font-display text-[72px] font-black leading-none"
            style={{ color: scoreColor }}
          >
            {displayScore}
          </p>
          {delta !== null && (
            <p
              className={`mt-1 text-[13px] font-medium ${
                delta <= 0 ? 'text-success' : 'text-danger'
              }`}
            >
              {delta > 0 ? `+${delta}` : `${delta}`}
            </p>
          )}
        </div>
      </div>

      <p className="mt-4 text-center text-[13px] text-text-secondary">
        {getShameLabel(score)}
      </p>
    </section>
  );
};
