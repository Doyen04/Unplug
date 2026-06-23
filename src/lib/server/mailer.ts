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

const getEmailLayout = (title: string, innerHtml: string) => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #FAFAF7;
      color: #1A1A17;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .wrapper {
      width: 100%;
      background-color: #FAFAF7;
      padding: 48px 24px;
      box-sizing: border-box;
    }
    .container {
      max-width: 560px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 32px;
    }
    .logo {
      font-size: 24px;
      font-weight: 800;
      color: #FF5C35;
      text-decoration: none;
      letter-spacing: -0.5px;
    }
    .card {
      background-color: #FFFFFF;
      border: 1px solid #E8E7E0;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
    }
    .footer {
      text-align: center;
      margin-top: 32px;
      font-size: 13px;
      color: #A9A79E;
      line-height: 1.5;
    }
    .footer a {
      color: #6B6960;
      text-decoration: underline;
    }
    h1 {
      font-size: 22px;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 24px;
      color: #1A1A17;
    }
    p {
      font-size: 15px;
      line-height: 1.6;
      margin-top: 0;
      margin-bottom: 16px;
      color: #6B6960;
    }
    .btn {
      display: inline-block;
      background-color: #FF5C35;
      color: #FFFFFF !important;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      padding: 12px 24px;
      border-radius: 10px;
      margin: 16px 0;
      text-align: center;
    }
    .btn:hover {
      background-color: #C93A1A;
    }
    .code-box {
      font-size: 32px;
      letter-spacing: 6px;
      font-weight: 700;
      color: #1A1A17;
      background-color: #FAFAF7;
      border: 1px solid #E8E7E0;
      border-radius: 10px;
      padding: 16px;
      text-align: center;
      margin: 24px 0;
    }
    ol, ul {
      margin-top: 0;
      margin-bottom: 24px;
      padding-left: 20px;
      color: #6B6960;
      font-size: 15px;
      line-height: 1.6;
    }
    li {
      margin-bottom: 8px;
    }
    .accent-bar {
      height: 4px;
      background-color: #FF5C35;
      border-radius: 4px 4px 0 0;
      margin: -40px -40px 32px -40px;
    }
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .meta-table td {
      padding: 12px;
      border-bottom: 1px solid #E8E7E0;
      font-size: 15px;
    }
    .meta-table td.label {
      color: #A9A79E;
      font-weight: 500;
      width: 35%;
    }
    .meta-table td.value {
      color: #1A1A17;
      font-weight: 600;
      text-align: right;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <span class="logo">Unplug</span>
      </div>
      <div class="card">
        <div class="accent-bar"></div>
        ${innerHtml}
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Unplug. All rights reserved.</p>
        <p>Manage your settings or contact support at <a href="mailto:support@unplug.app">support@unplug.app</a></p>
      </div>
    </div>
  </div>
</body>
</html>
`;
};

export const sendPasswordResetOtpEmail = async (email: string, otp: string) => {
    const subject = 'Your Unplug password reset code';
    const innerHtml = `
        <h1>Reset your password</h1>
        <p>Use this one-time code to reset your password. This code expires in 10 minutes.</p>
        <div class="code-box">${otp}</div>
        <p>If you did not request this, you can safely ignore this email.</p>
    `;
    const html = getEmailLayout(subject, innerHtml);

    return sendMail({ to: email, subject, html, text: `Your Unplug password reset code is ${otp}. This code expires in 10 minutes.` });
};

export const sendWelcomeEmail = async (email: string, name?: string) => {
    const subject = 'Welcome to Unplug';
    const innerHtml = `
        <h1>Welcome to Unplug</h1>
        <p>Hi ${name ?? 'there'},</p>
        <p>We're thrilled to have you! Let's get started saving money on recurring charges. Here are your next steps:</p>
        <ol>
            <li>Open the connect accounts section in your dashboard.</li>
            <li>Link one bank or card so Unplug can find your recurring charges automatically.</li>
            <li>Review subscriptions, alerts, and savings suggestions.</li>
        </ol>
        <p>If you need help, feel free to reply directly to this email.</p>
    `;
    const html = getEmailLayout(subject, innerHtml);

    return sendMail({ to: email, subject, html, text: `Welcome to Unplug, ${name ?? ''}. Connect an account to get started.` });
};

export const sendSubscriptionCancelledEmail = async (
    email: string,
    serviceName: string,
    amount: number,
    frequency: string
) => {
    const subject = `Subscription Cancelled: ${serviceName}`;
    const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    const innerHtml = `
        <h1>Subscription Cancelled</h1>
        <p>This is to confirm that you have successfully marked your subscription to <strong>${serviceName}</strong> as cancelled within Unplug.</p>
        
        <table class="meta-table">
            <tr>
                <td class="label">Service</td>
                <td class="value">${serviceName}</td>
            </tr>
            <tr>
                <td class="label">Amount</td>
                <td class="value">${formattedAmount} / ${frequency}</td>
            </tr>
            <tr>
                <td class="label">Status</td>
                <td class="value" style="color: #E53434;">Cancelled</td>
            </tr>
        </table>
        
        <p>Your dashboard and shame score will be updated to reflect this change automatically.</p>
        <p>If you made a mistake, you can undo this cancellation directly from the subscriptions dashboard at any time.</p>
    `;
    const html = getEmailLayout(subject, innerHtml);

    return sendMail({
        to: email,
        subject,
        html,
        text: `You have successfully cancelled your subscription to ${serviceName} (${formattedAmount} / ${frequency}) in Unplug.`
    });
};

