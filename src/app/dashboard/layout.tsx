import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { DashboardLayoutShell } from '@/components/features/dashboard/DashboardLayoutShell';
import { getServerSession } from '@/lib/server/auth-session';
import { db } from '@/lib/server/db';
import { ensureUserBootstrap } from '@/lib/server/user-bootstrap';


interface DashboardLayoutProps {
    children: ReactNode;
}

const DashboardLayout = async ({ children }: DashboardLayoutProps) => {
    const session = await getServerSession();

    if (!session) {
        redirect('/login');
    }

    let requiresOnboarding = false;
    try {

        const userId = (session as any)?.user?.id;
        if (userId) {
            await ensureUserBootstrap(userId);
            const result = await db
                .selectFrom('user_settings')
                .select('onboarding_completed')
                .where('user_id', '=', userId)
                .executeTakeFirst();

            if (result?.onboarding_completed) {
                requiresOnboarding = false;
            } else {
                // no settings row implies not completed
                requiresOnboarding = true;
            }
        }
    } catch (e) {
        // ignore and continue
    }

    if (requiresOnboarding) {
        redirect('/onboarding');
    }

    return <DashboardLayoutShell>{children}</DashboardLayoutShell>;
};

export default DashboardLayout;
