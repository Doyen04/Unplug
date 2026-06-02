import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { emailOTP } from 'better-auth/plugins';

import { db } from './server/db';
import { sendPasswordResetOtpEmail } from './server/mailer';

const resolveBaseUrl = (): string => {
    // Explicit app URL (set in Vercel env vars to actual production domain)
    if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
    // Better Auth dedicated config
    if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
    // Vercel system env
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return 'http://localhost:3000';
};

const authBaseUrl = resolveBaseUrl();

const authSecret = process.env.BETTER_AUTH_SECRET

if (!authSecret) {
    throw new Error('Missing BETTER_AUTH_SECRET. Set this environment variable in production.');
}

// Build a list of all origins that are allowed to make auth requests
const trustedOrigins: string[] = [authBaseUrl];
if (process.env.VERCEL_URL) trustedOrigins.push(`https://${process.env.VERCEL_URL}`);
if (process.env.VERCEL_PROJECT_PRODUCTION_URL) trustedOrigins.push(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
if (process.env.NEXT_PUBLIC_APP_URL && !trustedOrigins.includes(process.env.NEXT_PUBLIC_APP_URL)) {
    trustedOrigins.push(process.env.NEXT_PUBLIC_APP_URL);
}

export const auth = betterAuth({
    baseURL: authBaseUrl,
    secret: authSecret,
    database: {
        db,
        type: 'postgres',
    },
    session: {
        // seconds: 7 days
        expiresIn: 60 * 60 * 24 * 7,
        // seconds: refresh at most once per 24h
        updateAge: 60 * 60 * 24,
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5, // 5 minutes — avoids DB hit on every request
        },
    },
    user: {
        deleteUser: {
            enabled: true,
        },
    },
    emailAndPassword: {
        enabled: true,
    },
    trustedOrigins: [...new Set(trustedOrigins)],
    plugins: [
        nextCookies(),
        emailOTP({
            expiresIn: 60 * 10,
            otpLength: 6,
            async sendVerificationOTP(data) {
                if (data.type !== 'forget-password') return;

                try {
                    await sendPasswordResetOtpEmail(data.email, data.otp);
                } catch (err) {
                    // swallow errors; Better Auth fallback will handle if needed
                    return;
                }
            },
        }),
    ],
});
