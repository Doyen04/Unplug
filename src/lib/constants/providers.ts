/**
 * Plaid API configuration for different environments
 */
export const PLAID_BASE_URLS: Record<string, string> = {
    sandbox: 'https://sandbox.plaid.com',
    development: 'https://development.plaid.com',
    production: 'https://production.plaid.com',
};

/**
 * Mono API base URL
 */
export const MONO_DEFAULT_BASE_URL = 'https://api.withmono.com/v2';
