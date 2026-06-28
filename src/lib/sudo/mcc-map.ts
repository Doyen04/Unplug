/**
 * Merchant Category Code (MCC) Map
 *
 * MCCs are 4-digit codes that classify what kind of business a merchant is.
 * Sudo Africa uses MCCs to restrict which merchants a virtual card can be charged by.
 *
 * WHY WE DO THIS:
 *  - A card issued for Netflix should ONLY allow video streaming merchants (MCC 7841).
 *  - If a card number leaks, an attacker cannot use it to buy groceries or gas — it will decline.
 *  - This is the primary fraud prevention layer for Unplug virtual cards.
 *
 * HOW TO READ THIS MAP:
 *  - Key = service name (lowercased, trimmed).
 *  - Value = array of MCC codes that service's merchants might use.
 *    Some services can appear under multiple MCCs depending on region or billing entity.
 *
 * ADDING A NEW SERVICE:
 *  1. Look up the merchant's MCC. Most SaaS companies use 7372 (Computer Programming).
 *  2. Add the entry here in the correct category.
 *  3. The getMCCsForService() function will pick it up automatically.
 */

export const SERVICE_MCC_MAP: Record<string, string[]> = {
    // ── Video streaming ────────────────────────────────────────────────────────
    // MCC 7841 = Video Tape Rental Stores (industry-standard for streaming services)
    netflix: ['7841'],
    'youtube premium': ['7841'],
    youtube: ['7841'],
    showmax: ['7841'],
    primevideo: ['7841'],
    'amazon prime': ['7841'],
    hulu: ['7841'],
    'disney+': ['7841'],
    disneyplus: ['7841'],
    // MCC 4899 = Cable, Satellite, and Other Pay Television and Radio Services
    dstv: ['4899'],

    // ── Audio streaming ────────────────────────────────────────────────────────
    // MCC 5735 = Musical Instrument Shops (industry-standard for music streaming)
    spotify: ['5735'],
    'apple music': ['5735'],
    audiomack: ['5735'],
    boomplay: ['5735'],
    tidal: ['5735'],

    // ── SaaS / Software ───────────────────────────────────────────────────────
    // MCC 7372 = Computer Programming, Data Processing
    notion: ['7372'],
    figma: ['7372'],
    chatgpt: ['7372'],
    openai: ['7372'],
    cursor: ['7372'],
    github: ['7372'],
    gitlab: ['7372'],
    vercel: ['7372'],
    netlify: ['7372'],
    supabase: ['7372'],
    linear: ['7372'],
    slack: ['7372'],
    zoom: ['7372'],
    loom: ['7372'],
    grammarly: ['7372'],
    canva: ['7372'],
    adobe: ['7372'],
    'microsoft 365': ['7372'],
    office365: ['7372'],
    dropbox: ['7372'],
    'google one': ['7372'],
    'google workspace': ['7372'],

    // ── Cloud / Hosting ────────────────────────────────────────────────────────
    // MCC 7374 = Computer Processing and Data Preparation
    aws: ['7374'],
    azure: ['7374'],
    gcp: ['7374'],
    digitalocean: ['7374'],

    // ── E-learning ────────────────────────────────────────────────────────────
    // MCC 8299 = Schools and Educational Services
    coursera: ['8299'],
    udemy: ['8299'],
    duolingo: ['8299'],
    pluralsight: ['8299'],
    skillshare: ['8299'],
    masterclass: ['8299'],
};

/**
 * Fallback MCC codes for unrecognised services.
 * Covers most generic SaaS and cloud products.
 */
export const DEFAULT_SAAS_MCCS: string[] = ['7372', '7374'];

/**
 * Returns the MCC codes for a given service name.
 * Lookup is case-insensitive. Falls back to DEFAULT_SAAS_MCCS if not found.
 *
 * @param serviceName The display name of the subscription service (e.g. "Netflix", "Spotify").
 */
export function getMCCsForService(serviceName: string): string[] {
    const key = serviceName.toLowerCase().trim();
    return SERVICE_MCC_MAP[key] ?? DEFAULT_SAAS_MCCS;
}
