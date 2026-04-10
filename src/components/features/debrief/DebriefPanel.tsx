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
  <section className="rounded-2xl border border-[#E8E7E0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]">
    <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#A9A79E]">
      MONTHLY DEBRIEF / {month}
    </p>

    <div className="mt-4 text-[15px] leading-7 text-[#1A1A17]">
      {isLoading ? (
        <p className="text-sm text-[#6B6960]">
          Analysing your subscriptions<span className="animate-blink">_</span>
        </p>
      ) : null}

      {!isLoading && error ? <p className="text-[#E53434]">Debrief unavailable.</p> : null}

      {!isLoading && !error && content ? <p>{content}</p> : null}
    </div>
  </section>
);
