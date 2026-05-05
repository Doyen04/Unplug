import { headers } from 'next/headers';

import { auth } from '@/lib/auth';

export const getServerSession = async () =>
    auth.api
        .getSession({
            headers: await headers(),
        })
        .catch(() => null);
