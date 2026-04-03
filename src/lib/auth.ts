import { betterAuth } from 'better-auth';
import { kyselyAdapter } from '@better-auth/kysely-adapter';
import { nextCookies } from 'better-auth/next-js';

import { db } from './server/db';

export const auth = betterAuth({
    database: kyselyAdapter(db, {
        type: 'postgres',
    }),
    emailAndPassword: {
        enabled: true,
    },
    trustedOrigins: [process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'],
    plugins: [nextCookies()],
});
