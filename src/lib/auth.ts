import { betterAuth } from 'better-auth';
import { memoryAdapter } from 'better-auth/adapters/memory';
import { nextCookies } from 'better-auth/next-js';

const memoryDb = {
    user: [],
    session: [],
    account: [],
    verification: [],
    rateLimit: [],
};

export const auth = betterAuth({
    database: memoryAdapter(memoryDb),
    emailAndPassword: {
        enabled: true,
    },
    trustedOrigins: [process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'],
    plugins: [nextCookies()],
});
