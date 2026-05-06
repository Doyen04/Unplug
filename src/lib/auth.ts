import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { emailOTP } from 'better-auth/plugins';

import { db } from './server/db';

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
    ?? (process.env.NODE_ENV === 'production' ? undefined : 'local-dev-only-secret-change-me');

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

                const resendApiKey = process.env.RESEND_API_KEY;
                const fromEmail = process.env.RESEND_FROM_EMAIL;

                if (!resendApiKey || !fromEmail) {
                    return;
                }

                const subject = 'Your Unplug password reset code';
                const html = [
                    '<div style="font-family:Arial,sans-serif;line-height:1.5;color:#111">',
                    '<h2>Reset your Unplug password</h2>',
                    '<p>Use this one-time code to reset your password:</p>',
                    `<p style="font-size:28px;letter-spacing:6px;font-weight:700;margin:16px 0;">${data.otp}</p>`,
                    '<p>This code expires in 10 minutes.</p>',
                    '<p>If you did not request this, you can ignore this email.</p>',
                    '</div>',
                ].join('');

                try {
                    const response = await fetch('https://api.resend.com/emails', {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${resendApiKey}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            from: fromEmail,
                            to: data.email,
                            subject,
                            html,
                            text: `Your Unplug password reset code is ${data.otp}. This code expires in 10 minutes.`,
                        }),
                        signal: AbortSignal.timeout(4000),
                    });

                    if (!response.ok) {
                        return;
                    }
                } catch {
                    return;
                }
            },
        }),
    ],
});
