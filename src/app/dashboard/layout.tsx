import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { DashboardLayoutShell } from '@/components/features/dashboard/DashboardLayoutShell';
import { getServerSession } from '@/lib/server/auth-session';
import { sql } from 'kysely';
import { db } from '@/lib/server/db';


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
            const result = await sql<{ onboarding_completed?: boolean }>`
                SELECT onboarding_completed FROM user_settings WHERE user_id = ${userId}
            `.execute(db);
            
            console.log(result,userId,session, 'result,userid,session');
    
            if (result.rows.length > 0) {
                requiresOnboarding = !result.rows[0].onboarding_completed;
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
