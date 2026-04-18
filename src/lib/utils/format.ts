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
  return rawName.trim().replace(/\s+/g, ' ');
};

export const toMerchantKey = (label: string): string =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '')
    .substring(0, 15);
