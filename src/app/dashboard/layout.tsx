import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { DashboardLayoutShell } from '../../components/features/dashboard/DashboardLayoutShell';

interface DashboardLayoutProps {
    children: ReactNode;
}

const DashboardLayout = async ({ children }: DashboardLayoutProps) => {
    const cookieStore = await cookies();
    const hasSessionCookie =
        Boolean(cookieStore.get('better-auth.session_token')?.value)
        || Boolean(cookieStore.get('__Secure-better-auth.session_token')?.value);

    if (!hasSessionCookie) {
        redirect('/login');
    }

    return <DashboardLayoutShell>{children}</DashboardLayoutShell>;
};

export default DashboardLayout;
