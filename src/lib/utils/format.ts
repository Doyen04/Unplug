const getCurrencyFormatOptions = (currency: string): {
  locale: string;
  currencyDisplay: Intl.NumberFormatOptions['currencyDisplay'];
} => {
  if (currency === 'NGN') {
    return {
      locale: 'en-NG',
      currencyDisplay: 'symbol',
    };
  }

  return {
    locale: 'en-US',
    currencyDisplay: 'symbol',
  };
};

export const formatCurrency = (value: number, currency = 'USD'): string => {
  const { locale, currencyDisplay } = getCurrencyFormatOptions(currency);

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatCurrencyPrecise = (value: number, currency = 'USD'): string => {
  const { locale, currencyDisplay } = getCurrencyFormatOptions(currency);

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const getNameInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const toSentenceCase = (value: string): string => {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return '';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

export const normalizeMerchantLabel = (rawName: string): string => {
  let name = rawName.trim();
  
  // Remove URLs or domains (e.g. netflix.com, spotify.co.uk)
  name = name.replace(/(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})(\/[a-zA-Z0-9-_]+)*/gi, '$3');
  name = name.replace(/\.[a-zA-Z]{2,4}$/i, ''); // Strip top level domain

  // Strip phone numbers
  name = name.replace(/[\d+-]{7,}/g, '');

  // Strip common corporate suffixes & locations & billing jargon
  const patternsToRemove = [
    /\b(inc|ltd|llc|co|corp|gmbh|sa|pvt|pty|plc|sarl)\b/gi,
    /\b(us|uk|ca|fr|de|nl|eu|bill|billing|sub|subscription|recurring|pmt|payment|chg|charge)\b/gi,
    /\*+/g, // asterisks
    /[-_/\\#@:]/g, // special chars
  ];

  for (const pattern of patternsToRemove) {
    name = name.replace(pattern, ' ');
  }

  // Remove multiple spaces, numbers, and trim
  name = name.replace(/\s+/g, ' ').replace(/\d+/g, '').trim();

  // Convert to Title Case
  if (!name) return 'Unknown Service';
  
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const toMerchantKey = (label: string): string =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '')
    .substring(0, 15);
