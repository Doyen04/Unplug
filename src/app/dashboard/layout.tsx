import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

const SESSION_COOKIE_NAME = 'unplug_session';
const SESSION_COOKIE_VALUE = 'active';

interface DashboardLayoutProps {
    children: ReactNode;
}

const DashboardLayout = async ({ children }: DashboardLayoutProps) => {
    const cookieStore = await cookies();
    const sessionValue = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (sessionValue !== SESSION_COOKIE_VALUE) {
        redirect('/login');
    }

    return children;
};

export default DashboardLayout;
