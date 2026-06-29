/**
 * Sudo Africa API Client
 *
 * This is the ONLY file that speaks directly to the Sudo Africa REST API.
 * All other files in the codebase must import from here — never call Sudo directly.
 *
 * Base URL switches automatically between sandbox and production based on
 * the SUDO_AFRICA_ENV environment variable. Default is sandbox.
 *
 * ⚠️  SECURITY RULES (never break these):
 *  - PAN and CVV must never be written to a database or log.
 *  - getSudoCardPAN() is server-side only. Its return value must not be persisted.
 *  - The Authorization header carries the API key — never expose this client to the browser.
 */

const SUDO_BASE_URL =
    process.env.SUDO_AFRICA_ENV === 'production'
        ? 'https://api.sudo.africa'
        : 'https://api.sandbox.sudo.cards';

const SUDO_HEADERS = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.SUDO_AFRICA_API_KEY}`,
};

export type SudoCardCurrency = 'NGN' | 'USD';
export type SudoCardStatus = 'active' | 'inactive' | 'closed';

/** Payload required to register a new cardholder in Sudo Africa */
export interface CreateCustomerPayload {
    type: 'individual' | 'business';
    name: string;
    status: 'active';
    individual: { firstName: string; lastName: string };
    phoneNumber: string;  // e.g. "+2348012345678"
    emailAddress: string;
    billingAddress: {
        line1: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
    };
}

/** The shape Sudo Africa returns for a cardholder record */
export interface SudoCustomer {
    _id: string;
    type: string;
    name: string;
    status: string;
}

/**
 * Controls what the card is allowed to spend.
 * We lock each card to specific MCC codes (merchant category codes)
 * so a Netflix card can only be charged by video streaming merchants.
 */
export interface SpendingControls {
    spendingLimits?: {
        amount: number;                                                  // in smallest unit (kobo/cents)
        interval: 'daily' | 'weekly' | 'monthly' | 'yearly';
        billing_day?: number;                                             // optional anchor day for monthly limits
    }[];
    allowedCategories?: string[];                                       // MCC whitelist
    blockedCategories?: string[];                                               // MCC blacklist 
    channels?: {
        atm: boolean;   // always false — subscriptions don't use ATMs
        pos: boolean;   // always false — subscriptions don't use physical POS
        web: boolean;   // true — most subscription billing goes through web
        mobile: boolean;   // true — mobile app billing
    };
}

/** Payload to create a new virtual card under an existing Sudo customer */
export interface CreateCardPayload {
    customerId: string;
    type: 'virtual' | 'physical';
    currency: SudoCardCurrency;
    brand: 'Verve' | 'MasterCard' | 'Visa' | 'AfriGo';
    debitAccountId: string;
    amount: number;
    status: 'active';
    spendingControls?: SpendingControls;
}

/** Safe card metadata returned by Sudo — no PAN, no CVV */
export interface SudoCard {
    _id: string;
    type: string;
    currency: SudoCardCurrency;
    status: SudoCardStatus;
    last4: string;          // last 4 digits — safe to store
    expiryMonth: string;
    expiryYear: string;
    customerId: string;
    spendingControls: SpendingControls;
}

/**
 * SENSITIVE — Full card details including PAN and CVV.
 * This type must never be written to a database, logger, or external service.
 * It flows: Sudo Africa → our server → browser (HTTPS only, in-memory only).
 */
export interface SudoCardPAN {
    pan: string;   // full 16-digit card number
    cvv2: string;   // 3-digit security code
    expiryMonth: string;
    expiryYear: string;
}

/**
 * Creates a new cardholder (customer) in Sudo Africa.
 * Called once per Unplug user — all their virtual cards are grouped under one customer.
 */
export async function createSudoCustomer(
    payload: CreateCustomerPayload
): Promise<SudoCustomer> {
    const res = await fetch(`${SUDO_BASE_URL}/customers`, {
        method: 'POST',
        headers: SUDO_HEADERS,
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    
    // Check both HTTP status AND response body for errors
    // Sudo sometimes returns 2xx status with error message in body
    if (!res.ok || data.statusCode || data.error || data.message?.includes('required')) {
        throw new Error(`Sudo createCustomer [${res.status}]: ${JSON.stringify(data)}`);
    }
    
    return data.data;
}

/**
 * Issues a new virtual card for a cardholder.
 * The card is locked to specific MCC codes and has a monthly spend limit.
 * Returns safe metadata only — PAN is not included in this response.
 */
export async function createSudoCard(payload: CreateCardPayload): Promise<SudoCard> {
    const res = await fetch(`${SUDO_BASE_URL}/cards`, {
        method: 'POST',
        headers: SUDO_HEADERS,
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    
    // Check both HTTP status AND response body for errors
    // Sudo sometimes returns 2xx status with error message in body
    if (!res.ok || data.statusCode || data.error || data.message?.includes('required')) {
        throw new Error(`Sudo createCard [${res.status}]: ${JSON.stringify(data)}`);
    }
    
    console.log('[issue-card] sudo response from createSudoCard:', JSON.stringify(data));
    return data.data;
}

/**
 * Retrieves current safe card details by Sudo card ID.
 * Use this to check status or spending controls — not for PAN retrieval.
 */
export async function getSudoCard(cardId: string): Promise<SudoCard> {
    const res = await fetch(`${SUDO_BASE_URL}/cards/${cardId}`, {
        headers: SUDO_HEADERS,
    });
    if (!res.ok) throw new Error(`Sudo getCard [${res.status}]: ${cardId}`);
    const data = await res.json();
    return data.data;
}

/**
 * Freezes or unfreezes a card by changing its status.
 * - 'inactive' = frozen: all authorizations are declined
 * - 'active'   = unfrozen: normal operation
 *
 * Always update Sudo first (source of truth), then sync our local DB.
 */
export async function updateSudoCardStatus(
    cardId: string,
    status: SudoCardStatus
): Promise<SudoCard> {
    const res = await fetch(`${SUDO_BASE_URL}/cards/${cardId}`, {
        method: 'PUT',
        headers: SUDO_HEADERS,
        body: JSON.stringify({ status }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`Sudo updateCardStatus [${res.status}]: ${JSON.stringify(err)}`);
    }
    const data = await res.json();
    return data.data;
}

/**
 * ⚠️ SENSITIVE — Retrieves full card details including PAN and CVV.
 *
 * Server-side ONLY. Never log the result. Never store the result.
 * This is called when a user explicitly requests to view their card number.
 * The data flows: Sudo → our server → browser (HTTPS, in-memory only).
 */
export async function getSudoCardPAN(cardId: string): Promise<SudoCardPAN> {
    const res = await fetch(`${SUDO_BASE_URL}/cards/${cardId}/pan`, {
        headers: SUDO_HEADERS,
    });
    if (!res.ok) throw new Error(`Sudo getCardPAN [${res.status}]: ${cardId}`);
    const data = await res.json();
    return data.data;
}
