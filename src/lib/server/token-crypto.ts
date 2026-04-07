import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

const resolveEncryptionSecret = (): string => {
    const secret = process.env.PLAID_TOKEN_ENCRYPTION_KEY
        ?? process.env.BETTER_AUTH_SECRET
        ?? process.env.AUTH_SECRET;

    if (!secret) {
        throw new Error('Missing PLAID_TOKEN_ENCRYPTION_KEY (or BETTER_AUTH_SECRET/AUTH_SECRET) for token encryption.');
    }

    return secret;
};

const deriveKey = (): Buffer => createHash('sha256').update(resolveEncryptionSecret()).digest();

export const encryptToken = (plainText: string): string => {
    const iv = randomBytes(12);
    const key = deriveKey();

    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    return `${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
};

export const decryptToken = (payload: string): string => {
    const [ivB64, tagB64, dataB64] = payload.split(':');

    if (!ivB64 || !tagB64 || !dataB64) {
        throw new Error('Invalid encrypted token payload.');
    }

    const iv = Buffer.from(ivB64, 'base64');
    const tag = Buffer.from(tagB64, 'base64');
    const encrypted = Buffer.from(dataB64, 'base64');

    const key = deriveKey();
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
};
