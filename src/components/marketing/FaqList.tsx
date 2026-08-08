import { Plus } from 'lucide-react';

import { FAQ_ITEMS } from '@/lib/constants/marketing';

/**
 * Native <details>/<summary>: keyboard-operable and screen-reader-announced
 * without any JS, and it keeps the answers in the DOM for crawlers.
 */
export function FaqList() {
    return (
        <div className="mt-12 divide-y divide-line overflow-hidden rounded-[24px] border border-line bg-bg-surface">
            {FAQ_ITEMS.map(({ question, answer }) => (
                <details key={question} className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 p-6 text-left text-[17px] font-medium text-ink transition-colors hover:bg-bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink sm:p-7 [&::-webkit-details-marker]:hidden">
                        <span className="text-balance">{question}</span>
                        <span
                            aria-hidden="true"
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-orange transition-transform duration-200 group-open:rotate-45"
                        >
                            <Plus className="h-4 w-4" />
                        </span>
                    </summary>
                    <p className="max-w-3xl px-6 pb-7 text-[16px] leading-8 text-ink-70 sm:px-7">{answer}</p>
                </details>
            ))}
        </div>
    );
}
