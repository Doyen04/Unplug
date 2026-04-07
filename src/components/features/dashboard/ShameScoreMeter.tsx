'use client';

import { useEffect, useMemo, useState } from 'react';

import { getShameLabel, interpolateScoreColor } from '../../../lib/utils/shameScore';

interface ShameScoreMeterProps {
  score: number;
  previousScore?: number;
  isLoading?: boolean;
}

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
    const duration = 600;
    const start = performance.now();

    let animationFrameId = 0;

    const animate = (timestamp: number) => {
      const elapsed = timestamp - start;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextValue = Math.round(from + (to - from) * eased);
      setDisplayScore(nextValue);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [score, isLoading]);

  const delta = typeof previousScore === 'number' ? score - previousScore : null;
  const scoreColor = useMemo(() => interpolateScoreColor(displayScore), [displayScore]);

  return (
    <section
      className="border border-stone-800 bg-stone-900 p-5 sm:p-6"
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={displayScore}
      aria-label="Shame Score"
    >
      <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">SHAME SCORE</p>
      <div className="mt-3 flex items-end gap-2 sm:gap-3">
        <p className="font-display text-5xl leading-none sm:text-6xl lg:text-7xl" style={{ color: scoreColor }}>
          {isLoading ? '--' : displayScore}
        </p>
        {delta !== null ? (
          <p className={`mb-2 text-sm ${delta <= 0 ? 'text-acid-green' : 'text-red-400'}`}>
            {delta > 0 ? `+${delta}` : `${delta}`}
          </p>
        ) : null}
      </div>
      <p className="mt-3 text-sm text-stone-300">{getShameLabel(score)}</p>
    </section>
  );
};
