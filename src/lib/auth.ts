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
    session: {
        // seconds: 7 days
        expiresIn: 60 * 60 * 24 * 7,
        // seconds: refresh at most once per 24h
        updateAge: 60 * 60 * 24,
    },
    emailAndPassword: {
        enabled: true,
    },
    trustedOrigins: [authBaseUrl],
    plugins: [nextCookies()],
});
