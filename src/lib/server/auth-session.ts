import { headers } from 'next/headers';

import { auth } from '../auth';

export const getServerSession = async () =>
    auth.api
        .getSession({
            headers: await headers(),
        })
        .catch(() => null);
