import nodemailer from 'nodemailer';

type MailOptions = {
    to: string;
    subject: string;
    html: string;
    text?: string;
};

let transport: ReturnType<typeof nodemailer.createTransport> | null = null;

const getTransport = () => {
    if (transport) return transport;

    const smtpUrl = process.env.SMTP_URL;
    if (smtpUrl) {
        transport = nodemailer.createTransport(smtpUrl);
        return transport;
    }

    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const secure = (process.env.SMTP_SECURE ?? 'false').toLowerCase() === 'true';

    if (!host || !port || !user || !pass) return null;

    transport = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
    return transport;
};

const resolveFrom = (): string => {
    const fromEmail = process.env.SMTP_FROM_EMAIL ?? process.env.RESEND_FROM_EMAIL ?? 'no-reply@unplug.app';
    const fromName = process.env.SMTP_FROM_NAME ?? 'Unplug';
    return `${fromName} <${fromEmail}>`;
};

export const sendMail = async (opts: MailOptions): Promise<boolean> => {
    const t = getTransport();
    if (!t) {
        console.warn('No SMTP transport configured; skipping sendMail');
        return false;
    }

    try {
        await t.sendMail({ from: resolveFrom(), to: opts.to, subject: opts.subject, html: opts.html, text: opts.text });
        return true;
    } catch (err) {
        console.error('sendMail failed:', err);
        return false;
    }
};

export const sendPasswordResetOtpEmail = async (email: string, otp: string) => {
    const subject = 'Your Unplug password reset code';
    const html = [
        '<div style="font-family:Arial,sans-serif;line-height:1.5;color:#111">',
        '<h2>Reset your Unplug password</h2>',
        '<p>Use this one-time code to reset your password:</p>',
        `<p style="font-size:28px;letter-spacing:6px;font-weight:700;margin:16px 0;">${otp}</p>`,
        '<p>This code expires in 10 minutes.</p>',
        '<p>If you did not request this, you can ignore this email.</p>',
        '</div>',
    ].join('');

    return sendMail({ to: email, subject, html, text: `Your Unplug password reset code is ${otp}. This code expires in 10 minutes.` });
};

export const sendWelcomeEmail = async (email: string, name?: string) => {
    const subject = 'Welcome to Unplug';
    const html = [
        '<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">',
        '<h2>Welcome to Unplug</h2>',
        `<p>Hi ${name ?? 'there'},</p>`,
        '<p>To get started quickly:</p>',
        '<ol>',
        '<li>Open the connect accounts section.</li>',
        '<li>Link one bank or card so Unplug can find recurring charges.</li>',
        '<li>Review subscriptions, alerts, and savings suggestions in the dashboard.</li>',
        '</ol>',
        '<p>If you need help, reply to this email or visit support@unplug.app.</p>',
        '</div>',
    ].join('');

    return sendMail({ to: email, subject, html, text: `Welcome to Unplug, ${name ?? ''}. Connect an account to get started.` });
};
