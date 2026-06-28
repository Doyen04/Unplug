'use client';

import { useState } from 'react';
import { Eye, EyeOff, Lock, Unlock, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface CardData {
    sudo_card_id: string;
    currency: 'NGN' | 'USD';
    last_four: string;
    expiry_month: string;
    expiry_year: string;
    status: 'active' | 'inactive' | 'closed';
    migration_status: string;
}

interface PANData {
    pan: string;
    cvv: string;
    expiryMonth: string;
    expiryYear: string;
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
    const [panData, setPanData] = useState<PANData | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [isLoadingPAN, setIsLoadingPAN] = useState(false);
    const [isTogglingFreeze, setIsTogglingFreeze] = useState(false);

    const isFrozen = card.status === 'inactive';

    async function handleRevealToggle() {
        if (isFrozen) { toast.error('Unfreeze the card first to view details'); return; }
        if (panData) { setShowDetails((v) => !v); return; }

        setIsLoadingPAN(true);
        try {
            const res = await fetch(`/api/cards/${subscriptionId}/pan`);
            if (!res.ok) throw new Error('Failed to load card details');
            const data: PANData = await res.json();
            setPanData(data);
            setShowDetails(true);
        } catch {
            toast.error('Could not load card details. Try again.');
        } finally {
            setIsLoadingPAN(false);
        }
    }

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
            if (action === 'freeze') {
                setPanData(null);
                setShowDetails(false);
                toast.success('Card frozen — no charges will go through');
            } else {
                toast.success('Card unfrozen');
            }
        } catch {
            toast.error('Could not update card. Try again.');
        } finally {
            setIsTogglingFreeze(false);
        }
    }

    function copyToClipboard(value: string, label: string) {
        navigator.clipboard.writeText(value);
        toast.success(`${label} copied`);
    }

    const displayPAN = showDetails && panData
        ? panData.pan.match(/.{1,4}/g)?.join(' ') ?? panData.pan
        : `•••• •••• •••• ${card.last_four}`;
    const displayExpiry = showDetails && panData
        ? `${panData.expiryMonth}/${panData.expiryYear}`
        : `${card.expiry_month}/${card.expiry_year}`;
    const displayCVV = showDetails && panData ? panData.cvv : '•••';

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

                <div className="relative flex items-center gap-2 mb-4">
                    <span className="font-mono text-white text-lg tracking-[0.18em] flex-1">
                        {displayPAN}
                    </span>
                    {showDetails && panData && (
                        <button onClick={() => copyToClipboard(panData.pan, 'Card number')}
                            className="text-white/45 hover:text-white transition-colors">
                            <Copy className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                <div className="relative flex gap-6 items-center">
                    <div>
                        <p className="text-white/40 text-[10px] uppercase tracking-widest mb-0.5">Expires</p>
                        <p className="text-white font-mono text-sm">{displayExpiry}</p>
                    </div>
                    <div>
                        <p className="text-white/40 text-[10px] uppercase tracking-widest mb-0.5">CVV</p>
                        <div className="flex items-center gap-1.5">
                            <p className="text-white font-mono text-sm">{displayCVV}</p>
                            {showDetails && panData && (
                                <button onClick={() => copyToClipboard(panData.cvv, 'CVV')}
                                    className="text-white/45 hover:text-white transition-colors">
                                    <Copy className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-4 right-5 flex -space-x-2.5 pointer-events-none">
                    <div className="w-7 h-7 rounded-full bg-red-500/90" />
                    <div className="w-7 h-7 rounded-full bg-amber-400/90" />
                </div>
            </div>

            <div className="flex gap-2">
                <button onClick={handleRevealToggle}
                    disabled={isLoadingPAN || isFrozen}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-500 text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                    {isLoadingPAN
                        ? <span className="text-xs animate-spin">↻</span>
                        : showDetails
                            ? <><EyeOff className="w-3.5 h-3.5" /> Hide</>
                            : <><Eye className="w-3.5 h-3.5" /> Show details</>}
                </button>

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
