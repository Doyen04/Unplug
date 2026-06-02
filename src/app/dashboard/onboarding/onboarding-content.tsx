'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, TrendingDown, Sparkles, ShieldAlert, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const Feature = ({ icon: Icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
    <Card className="group hover:border-brand/30 hover:shadow-lg hover:shadow-brand/5 transition-all duration-300">
        <div className="flex flex-col items-start gap-4">
            <div className="rounded-lg bg-brand-light p-3 group-hover:bg-brand/10 transition-colors">
                {Icon}
            </div>
            <div>
                <h3 className="font-semibold text-text-primary mb-2">{title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
            </div>
        </div>
    </Card>
);

export default function OnboardingContent() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleContinue = () => {
        startTransition(async () => {
            try {
                const res = await fetch('/api/user/settings', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ onboarding_completed: true }),
                });

                if (res.ok) {
                    router.push('/dashboard/connect');
                } else if (res.status === 401) {
                    router.push('/login');
                }
            } catch (error) {
                console.error('Failed to complete onboarding:', error);
            }
        });
    };

    return (
        <main className="min-h-screen bg-linear-to-b from-bg-base via-bg-base to-brand-light/20">
            <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
                {/* Hero Section */}
                <div className="text-center mb-16 md:mb-20">
                    <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-brand-light border border-brand/20">
                        <Sparkles className="w-4 h-4 text-brand" />
                        <span className="text-xs font-semibold text-brand uppercase tracking-wide">Welcome to Unplug</span>
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-6 leading-tight">
                        Let's uncover your{' '}
                        <span className="text-brand">hidden subscriptions</span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-4 leading-relaxed">
                        Unplug analyzes your spending to identify unused services, forgotten charges, and money you can reclaim. It's like having a financial detective in your pocket.
                    </p>
                    
                    <p className="text-base text-text-muted max-w-2xl mx-auto mb-8">
                        The average person wastes <span className="font-semibold text-brand">$156 per month</span> on forgotten subscriptions.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-16">
                    <Feature
                        icon={<ShieldAlert className="w-6 h-6 text-brand" />}
                        title="Find Forgotten Charges"
                        description="We scan your transaction history to identify recurring charges you've likely forgotten about. No more surprise bills."
                    />
                    <Feature
                        icon={<TrendingDown className="w-6 h-6 text-brand" />}
                        title="Calculate Your Savings"
                        description="See exactly how much you're spending on subscriptions and get personalized recommendations to cut the fat."
                    />
                    <Feature
                        icon={<Sparkles className="w-6 h-6 text-brand" />}
                        title="AI-Powered Analysis"
                        description="Our AI learns your usage patterns to identify which subscriptions you actually use and which are just wasting money."
                    />
                    <Feature
                        icon={<Lock className="w-6 h-6 text-brand" />}
                        title="Bank-Level Security"
                        description="Your data is encrypted and secured with bank-grade encryption. We never store your login credentials."
                    />
                </div>

                {/* How It Works */}
                <Card className="mb-16 border-brand/20 bg-linear-to-br from-bg-surface to-brand-light/30 p-8 md:p-10">
                    <h2 className="text-2xl font-bold text-text-primary mb-8">How Unplug Works</h2>
                    <div className="space-y-6">
                        {[
                            { number: '1', title: 'Connect Your Account', desc: 'Link a bank or card securely. We analyze your transactions with zero access to your credentials.' },
                            { number: '2', title: 'Get Insights', desc: 'Our AI identifies all recurring charges and categorizes them by usage and necessity.' },
                            { number: '3', title: 'Take Action', desc: 'Get step-by-step help to cancel unwanted subscriptions or downgrade to cheaper plans.' },
                            { number: '4', title: 'Save Every Month', desc: 'Track your savings and stay on top of new subscriptions before they become forgotten charges.' },
                        ].map((step, idx) => (
                            <div key={idx} className="flex gap-4">
                                <div className="shrink-0">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand text-white font-bold text-sm">
                                        {step.number}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-text-primary mb-1">{step.title}</h3>
                                    <p className="text-sm text-text-secondary">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* CTA Section */}
                <div className="text-center">
                    <Card className="border-brand/30 bg-linear-to-br from-brand/5 to-brand-light/40 p-8 md:p-10 text-center mb-8">
                        <h2 className="text-2xl font-bold text-text-primary mb-3">Ready to reclaim your money?</h2>
                        <p className="text-text-secondary mb-6 max-w-lg mx-auto">
                            It takes just a few minutes to connect an account and start seeing which subscriptions are draining your wallet.
                        </p>
                        <Button
                            onClick={handleContinue}
                            disabled={isPending}
                            className="rounded-full h-14 px-8 shadow-lg shadow-brand/20 gap-2 mx-auto"
                        >
                            {isPending ? 'Setting up...' : 'Start Your Audit'}
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Card>

                    <p className="text-sm text-text-muted">
                        This will take you to connect your first account. It's secure and takes less than a minute.
                    </p>
                </div>
            </div>
        </main>
    );
}
