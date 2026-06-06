import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/server/auth-session';
import { db } from '@/lib/server/db';
import OnboardingClient from './OnboardingClient';

export default async function OnboardingPage() {
    const session = await getServerSession();
    if (!session) redirect('/login');

    const userId = (session as any)?.user?.id;
    if (!userId) redirect('/login');

    try {
        const result = await db
            .selectFrom('user_settings')
            .select('onboarding_completed')
            .where('user_id', '=', userId)
            .executeTakeFirst();

        if (result?.onboarding_completed) {
            redirect('/dashboard');
        }
    } catch (e) {
        // continue to onboarding
    }

    return <OnboardingClient />;
}
