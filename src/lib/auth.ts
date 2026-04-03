import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';

import { db } from './server/db';

const authBaseUrl = process.env.BETTER_AUTH_URL
    ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

export const auth = betterAuth({
    baseURL: authBaseUrl,
    database: {
        db,
        type: 'postgres',
    },
    emailAndPassword: {
        enabled: true,
    },
    trustedOrigins: [authBaseUrl],
    plugins: [nextCookies()],
});
