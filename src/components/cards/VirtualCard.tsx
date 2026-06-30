'use client';

import { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';
import { CardSensitiveData } from '@/components/cards/CardSensitiveData';

interface CardData {
    sudo_card_id: string;
    currency: 'NGN' | 'USD';
    last_four: string;
    expiry_month: string;
    expiry_year: string;
    status: 'active' | 'inactive' | 'closed';
    migration_status: string;
}

interface VirtualCardProps {
    subscriptionId: string;
    serviceName: string;
    card: CardData;
    onStatusChange?: (newStatus: string) => void;
}

export function VirtualCard({
    subscriptionId,
    serviceName,
    card,
    onStatusChange,
}: VirtualCardProps) {
    const [isTogglingFreeze, setIsTogglingFreeze] = useState(false);

    const isFrozen = card.status === 'inactive';

    async function handleFreezeToggle() {
        setIsTogglingFreeze(true);
        const action = isFrozen ? 'unfreeze' : 'freeze';
        try {
            const res = await fetch(`/api/cards/${subscriptionId}/freeze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            onStatusChange?.(data.status);
            toast.success(action === 'freeze' ? 'Card frozen — no charges will go through' : 'Card unfrozen');
        } catch {
            toast.error('Could not update card. Try again.');
        } finally {
            setIsTogglingFreeze(false);
        }
    }

    return (
        <div className="space-y-3">
            <div className={`
        relative rounded-2xl p-5 select-none overflow-hidden transition-all duration-300
        ${isFrozen
                    ? 'bg-neutral-800 grayscale opacity-70'
                    : card.currency === 'USD'
                        ? 'bg-neutral-900'
                        : 'bg-[#E8482C]'}
      `}>
                {isFrozen && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                        <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                            <Lock className="w-4 h-4" />
                            Card frozen
                        </div>
                    </div>
                )}

                <div className="relative flex justify-between items-start mb-8">
                    <span className="text-white/60 text-xs font-mono uppercase tracking-widest">
                        {serviceName}
                    </span>
                    <span className="text-white/50 text-[10px] uppercase tracking-wider">
                        {card.currency} · Virtual
                    </span>
                </div>

                <div className="space-y-4">
                    <CardSensitiveData
                        subscriptionId={subscriptionId}
                        lastFour={card.last_four}
                        disabled={isFrozen}
                    />
                </div>

                <div className="absolute bottom-4 right-5 flex -space-x-2.5 pointer-events-none">
                    <div className="w-7 h-7 rounded-full bg-red-500/90" />
                    <div className="w-7 h-7 rounded-full bg-amber-400/90" />
                </div>
            </div>

            <div className="flex gap-2">
                <button onClick={handleFreezeToggle}
                    disabled={isTogglingFreeze}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm transition-all disabled:opacity-40 cursor-pointer
            ${isFrozen
                            ? 'bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20'
                            : 'border border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-500'}`}>
                    {isFrozen
                        ? <><Unlock className="w-3.5 h-3.5" /> Unfreeze</>
                        : <><Lock className="w-3.5 h-3.5" /> Freeze</>}
                </button>
            </div>
        </div>
    );
}
