'use client';

import { Lightbulb, Sparkles } from 'lucide-react';

interface DebriefPanelProps {
  month: string;
  isLoading: boolean;
  content: string | null;
  error: boolean;
  onGenerate?: () => void;
}

const LoadingDots = () => (
  <div className="flex flex-col items-center gap-3 py-6">
    <div className="flex gap-1.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-2 w-2 rounded-full bg-brand"
          style={{
            animation: 'dotBounce 1.4s infinite ease-in-out both',
            animationDelay: `${i * 0.16}s`,
          }}
        />
      ))}
    </div>
    <p className="text-[13px] text-text-muted">
      Analysing your subscriptions...
    </p>
  </div>
);

export const DebriefPanel = ({
  month,
  isLoading,
  content,
  error,
  onGenerate,
}: DebriefPanelProps) => (
  <section className="rounded-card border border-border bg-white p-6 shadow-card">
    <div className="flex items-center justify-between">
      <p className="text-[18px] font-medium text-text-primary">
        Monthly Debrief
      </p>
      <p className="text-[13px] text-text-muted">{month}</p>
    </div>

    <div className="mt-4">
      {/* Loading */}
      {isLoading && <LoadingDots />}

      {/* Error */}
      {!isLoading && error && (
        <div className="flex flex-col items-center gap-3 py-6">
          <p className="text-[13px] text-text-secondary">
            Couldn&apos;t generate your debrief.
          </p>
          {onGenerate && (
            <button
              type="button"
              onClick={onGenerate}
              className="rounded-btn border border-border px-4 py-2 text-[13px] font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
            >
              Try again
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && !content && (
        <div className="flex flex-col items-center gap-3 py-6">
          <Sparkles size={32} className="text-brand" />
          <p className="text-[15px] font-medium text-text-primary">
            Get your monthly debrief
          </p>
          <p className="max-w-xs text-center text-[13px] text-text-secondary">
            AI-powered analysis of your subscription habits this month.
          </p>
          {onGenerate && (
            <button
              type="button"
              onClick={onGenerate}
              className="mt-2 rounded-btn bg-brand px-5 py-2.5 text-[13px] font-semibold text-white transition-all duration-150 hover:bg-brand-dark hover:-translate-y-0.5"
            >
              Generate debrief
            </button>
          )}
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && content && (
        <div>
          <p className="text-[15px] leading-7 text-text-primary">
            {content}
          </p>
          <div className="my-4 border-t border-border" />
          <div className="flex items-start gap-2">
            <Lightbulb size={16} className="mt-0.5 shrink-0 text-brand" />
            <p className="text-[13px] font-medium text-text-primary">
              Review your unused subscriptions and cancel at least one this week.
            </p>
          </div>
        </div>
      )}
    </div>
  </section>
);
