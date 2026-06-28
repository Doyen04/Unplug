'use client';

import { useRef, useEffect } from 'react';
import { Download, Share2 } from 'lucide-react';

interface ShareCardProps {
    score: number;    // 0–100
    wasteAmountNaira: number;
    totalSubscriptions: number;
    wastedCount: number;
    userName?: string;
}

function getScoreLabel(score: number) {
    if (score <= 20) return { text: 'Frugal', color: '#22c55e' };
    if (score <= 45) return { text: 'Mindful', color: '#eab308' };
    if (score <= 70) return { text: 'Wasteful', color: '#f97316' };
    return { text: 'Burning money', color: '#E8482C' };
}

export function ShareCard({
    score,
    wasteAmountNaira,
    totalSubscriptions,
    wastedCount,
    userName,
}: ShareCardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = 1080;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { text: label, color } = getScoreLabel(score);

        ctx.fillStyle = '#0D0D0D';
        ctx.fillRect(0, 0, 1080, 1080);

        ctx.strokeStyle = 'rgba(255,255,255,0.035)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 1080; i += 54) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1080); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1080, i); ctx.stroke();
        }

        const cx = 540, cy = 430, r = 220;

        ctx.beginPath();
        ctx.arc(cx, cy, r, Math.PI, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(255,255,255,0.07)';
        ctx.lineWidth = 28;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, r, Math.PI, Math.PI + (score / 100) * Math.PI);
        ctx.strokeStyle = color;
        ctx.lineWidth = 28;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 180px -apple-system, system-ui, sans-serif';
        ctx.fillText(`${score}`, cx, cy + 20);

        ctx.font = '500 30px -apple-system, system-ui, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillText('SHAME SCORE', cx, cy + 68);

        ctx.font = '700 32px -apple-system, system-ui, sans-serif';
        ctx.fillStyle = color;
        ctx.fillText(label.toUpperCase(), cx, cy + 118);

        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.beginPath();
        (ctx as any).roundRect(80, 620, 920, 130, 20);
        ctx.fill();

        const stats = [
            { label: 'monthly waste', value: `₦${wasteAmountNaira.toLocaleString()}`, color: '#E8482C' },
            { label: 'subscriptions', value: `${totalSubscriptions}`, color: '#FFFFFF' },
            { label: 'wasted', value: `${wastedCount}`, color },
        ];

        stats.forEach(({ label: l, value, color: c }, i) => {
            const x = 80 + (920 / 3) * i + (920 / 3) / 2;
            ctx.font = '800 52px -apple-system, system-ui, sans-serif';
            ctx.fillStyle = c;
            ctx.fillText(value, x, 693);
            ctx.font = '400 22px -apple-system, system-ui, sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.fillText(l, x, 724);
        });

        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        [80 + 920 / 3, 80 + (920 / 3) * 2].forEach((x) => {
            ctx.beginPath(); ctx.moveTo(x, 638); ctx.lineTo(x, 733); ctx.stroke();
        });

        ctx.font = '400 26px -apple-system, system-ui, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.fillText('Check yours → unplug.app', cx, 840);

        ctx.font = '800 40px -apple-system, system-ui, sans-serif';
        ctx.fillStyle = '#E8482C';
        ctx.fillText('UNPLUG', cx, 960);

        if (userName) {
            ctx.font = '400 22px -apple-system, system-ui, sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.25)';
            ctx.textAlign = 'left';
            ctx.fillText(userName, 60, 60);
        }
    }, [score, wasteAmountNaira, totalSubscriptions, wastedCount, userName]);

    function handleDownload() {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `unplug-shame-score-${score}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    async function handleShare() {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.toBlob(async (blob) => {
            if (!blob) return;
            const file = new File([blob], 'unplug-shame-score.png', { type: 'image/png' });
            const shareData = {
                files: [file],
                text: `I'm wasting ₦${wasteAmountNaira.toLocaleString()}/month on ${wastedCount} dead subscriptions. Check yours 👇 unplug.app`,
            };
            if (navigator.canShare?.(shareData)) {
                await navigator.share(shareData);
            } else {
                handleDownload();
            }
        }, 'image/png');
    }

    return (
        <div className="space-y-4">
            <canvas ref={canvasRef}
                className="w-full max-w-105 mx-auto rounded-2xl block border border-neutral-800"
                style={{ aspectRatio: '1 / 1' }}
            />
            <div className="mx-auto flex max-w-105 flex-col gap-2 sm:flex-row">
                <button onClick={handleDownload}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-border bg-bg-base px-4 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-bg-base/80">
                    <Download className="h-3.5 w-3.5" />
                    Save image
                </button>
                <button onClick={handleShare}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-[#E8482C] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d13f26]">
                    <Share2 className="h-3.5 w-3.5" />
                    Share score
                </button>
            </div>
        </div>
    );
}
