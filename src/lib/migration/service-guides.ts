/**
 * Service Migration Guides
 *
 * Step-by-step instructions for updating payment methods on specific subscription services.
 * These guides are shown in the SubscriptionCardPanel UI after a user receives their virtual card.
 *
 * WHY THIS EXISTS:
 * Every subscription service has a different UI for updating payment methods.
 * Netflix's flow is completely different from Notion's or GitHub's.
 * Rather than generic instructions, we give users exact steps for their specific service.
 *
 * DATA FIELDS:
 *  - paymentSettingsUrl: The direct URL to the service's billing/payment settings page.
 *                        Saves the user from hunting for it.
 *  - steps: Ordered list of actions to take. Should be as specific and terse as possible.
 *  - requiresDollarCard: If true, the UI shows a note that this service requires a USD card.
 *                        The virtual card issued will be in USD (driven by currency detection).
 *  - billingAddressNote: Optional hint for services that require a US/UK billing address.
 *
 * ADDING A NEW SERVICE:
 *  1. Go to the service's billing settings page and walk through the payment method change flow.
 *  2. Write the steps in plain English (3–5 steps max).
 *  3. Add the entry using the lowercased service name as the key.
 *  4. Set requiresDollarCard based on whether the service bills in USD.
 */

export interface ServiceMigrationGuide {
  paymentSettingsUrl: string;
  steps:              string[];
  requiresDollarCard: boolean;
  billingAddressNote?: string;
}

export const SERVICE_MIGRATION_GUIDES: Record<string, ServiceMigrationGuide> = {
  netflix: {
    paymentSettingsUrl: 'https://www.netflix.com/YourAccount',
    steps: [
      'Tap "Manage Payment Info"',
      'Select "Add Payment Method"',
      'Enter your Unplug virtual card details',
      'Set it as your primary payment method',
      'Remove your old card',
    ],
    requiresDollarCard: true,
  },
  spotify: {
    paymentSettingsUrl: 'https://www.spotify.com/account/subscription',
    steps: [
      'Scroll to "Payment"',
      'Tap "Update"',
      'Enter your Unplug virtual card details',
      'Save changes',
    ],
    requiresDollarCard: true,
  },
  chatgpt: {
    paymentSettingsUrl: 'https://chat.openai.com/my-account/billing',
    steps: [
      'Click "Manage my subscription"',
      'Go to "Payment method" → "Update"',
      'Add your Unplug virtual card',
    ],
    requiresDollarCard: true,
  },
  notion: {
    paymentSettingsUrl: 'https://www.notion.so/profile/billing',
    steps: [
      'Click "Change credit card"',
      'Enter your Unplug virtual card details',
      'Click "Update card"',
    ],
    requiresDollarCard: true,
  },
  github: {
    paymentSettingsUrl: 'https://github.com/settings/billing/payment_information',
    steps: [
      'Click "Edit" next to your payment method',
      'Enter your Unplug virtual card details',
      'Click "Update payment method"',
    ],
    requiresDollarCard: true,
  },
  canva: {
    paymentSettingsUrl: 'https://www.canva.com/settings/billing',
    steps: [
      'Click "Payment method" → "Add payment method"',
      'Enter your Unplug virtual card',
      'Remove old card once new one is added',
    ],
    requiresDollarCard: true,
  },
  dstv: {
    paymentSettingsUrl: 'https://www.dstv.com/en-ng/my-dstv',
    steps: [
      'Log in and go to "Manage subscription"',
      'Select "Payment method"',
      'Add your Unplug Naira virtual card',
      'Set as default',
    ],
    requiresDollarCard: false,   // DStv bills in NGN
  },
  youtube: {
    paymentSettingsUrl: 'https://www.youtube.com/paid_memberships',
    steps: [
      'Click "Manage membership" → "Update payment method"',
      'Add your Unplug virtual card',
      'Select it as your payment method',
    ],
    requiresDollarCard: true,
  },
};

/**
 * Generic fallback guide for services not in SERVICE_MIGRATION_GUIDES.
 * Gives enough direction for most subscription services without being specific.
 */
export const DEFAULT_GUIDE: ServiceMigrationGuide = {
  paymentSettingsUrl: '',
  steps: [
    'Log in to your account',
    'Go to Settings → Billing or Payment',
    'Add your Unplug virtual card',
    'Remove your old card',
  ],
  requiresDollarCard: false,
};

/**
 * Returns step-by-step migration instructions for a given service.
 * Lookup is case-insensitive. Falls back to DEFAULT_GUIDE for unknown services.
 *
 * @param serviceName The display name of the subscription (e.g. "Netflix", "Spotify").
 */
export function getGuideForService(serviceName: string): ServiceMigrationGuide {
  return SERVICE_MIGRATION_GUIDES[serviceName.toLowerCase().trim()] ?? DEFAULT_GUIDE;
}
