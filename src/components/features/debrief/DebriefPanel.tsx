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
  <section className="border border-stone-800 bg-stone-950 p-6">
    <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">
      MONTHLY DEBRIEF / {month}
    </p>

    <div className="mt-4 text-[15px] leading-7 text-stone-300">
      {isLoading ? (
        <p className="text-sm text-stone-500">
          Analysing your subscriptions
          <span className="animate-blink">_</span>
        </p>
      ) : null}

      {!isLoading && error ? <p className="text-red-500">DEBRIEF UNAVAILABLE</p> : null}

      {!isLoading && !error && content ? <p>{content}</p> : null}
    </div>
  </section>
);
