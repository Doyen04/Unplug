import { redirect } from 'next/navigation';

import { getServerSession } from '@/lib/server/auth-session';
import { sql } from 'kysely';
import { db } from '@/lib/server/db';

const completeOnboarding = async (formData: FormData) => {
    'use server';
    const session = await getServerSession();
    if (!session) redirect('/login');

    const userId = (session as any)?.user?.id;
    if (!userId) redirect('/login');

    try {
        await sql`
            INSERT INTO user_settings (user_id, onboarding_completed, created_at, updated_at)
            VALUES (${userId}, true, now(), now())
            ON CONFLICT (user_id) DO UPDATE SET onboarding_completed = true, updated_at = now();
        `.execute(db);
    } catch (e) {
        // ignore and proceed to connect page
    }

    redirect('/dashboard/connect');
};

export default async function OnboardingPage() {
    const session = await getServerSession();
    if (!session) redirect('/login');

    const userId = (session as any)?.user?.id;
    if (!userId) redirect('/login');

    const result = await sql<{ onboarding_completed?: boolean }>`
        SELECT onboarding_completed FROM user_settings WHERE user_id = ${userId}
    `.execute(db);

    if (result.rows.length > 0 && result.rows[0].onboarding_completed) {
        redirect('/dashboard');
    }

    return (
        <main className="space-y-6">
            <h1 className="text-3xl font-bold">Welcome to Unplug</h1>
            <p className="text-text-secondary">Let's get you set up — connect an account to import transactions and discover subscriptions.</p>

            <form action={completeOnboarding} className="mt-6">
                <button type="submit" className="btn btn-primary">Continue to Connect</button>
            </form>
        </main>
    );
}
