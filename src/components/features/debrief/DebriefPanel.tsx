interface DebriefPanelProps {
  month: string;
  isLoading: boolean;
  content: string | null;
  error: boolean;
}

export const DebriefPanel = ({
  month,
  isLoading,
  content,
  error,
}: DebriefPanelProps) => (
  <section className="rounded-2xl border border-border bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]">
    <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-muted">
      MONTHLY DEBRIEF / {month}
    </p>

    <div className="mt-4 text-[15px] leading-7 text-text-primary">
      {isLoading ? (
        <p className="text-sm text-text-secondary animate-pulse">
          Analysing your subscriptions<span>...</span>
        </p>
      ) : null}

      {!isLoading && error ? <p className="text-danger">Debrief unavailable.</p> : null}

      {!isLoading && !error && content ? <p>{content}</p> : null}
    </div>
  </section>
);
