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

/**
 * Plaid error codes that mean the stored access token can no longer be used and
 * the user must re-link the institution. Callers flip
 * `connected_accounts.auth_status` to 'reconnect_required' on these rather than
 * throwing, so a single stale item doesn't fail the whole dashboard load.
 */
export const RECONNECT_ERROR_CODES = new Set(['INVALID_ACCESS_TOKEN', 'ITEM_LOGIN_REQUIRED']);
