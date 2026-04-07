import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { getServerSession } from '../../lib/server/auth-session';

interface DashboardLayoutProps {
    children: ReactNode;
}

const DashboardLayout = async ({ children }: DashboardLayoutProps) => {
    const session = await getServerSession();

    if (!session) {
        redirect('/login');
    }

    return children;
};

export default DashboardLayout;
