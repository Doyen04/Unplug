import { getScoreColorClass, getShameLabel } from '../../../lib/utils/shameScore';

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
  const delta = typeof previousScore === 'number' ? score - previousScore : null;

  return (
    <section
      className="border border-stone-800 bg-stone-900 p-6"
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={score}
      aria-label="Shame Score"
    >
      <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">SHAME SCORE</p>
      <div className="mt-3 flex items-end gap-3">
        <p className={`font-display text-7xl leading-none ${getScoreColorClass(score)}`}>
          {isLoading ? '--' : score}
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
