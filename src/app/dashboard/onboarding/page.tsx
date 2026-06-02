import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/server/auth-session';
import { sql } from 'kysely';
import { db } from '@/lib/server/db';
import OnboardingContent from './onboarding-content';

export default async function OnboardingPage() {
    const session = await getServerSession();
    if (!session) redirect('/login');

    const userId = (session as any)?.user?.id;
    if (!userId) redirect('/login');

    try {
        const result = await sql<{ onboarding_completed?: boolean }>`
            SELECT onboarding_completed FROM user_settings WHERE user_id = ${userId}
        `.execute(db);

        if (result.rows.length > 0 && result.rows[0].onboarding_completed) {
            redirect('/dashboard');
        }
    } catch (e) {
        // continue to onboarding
    }

    return <OnboardingContent />;
}
