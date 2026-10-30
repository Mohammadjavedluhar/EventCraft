export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR)', locale: 'en-IN' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar (USD)', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro (EUR)', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound (GBP)', locale: 'en-GB' },
};

export function formatCurrency(amount: number | null | undefined, currency: CurrencyCode = 'INR'): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return '—';
  
  const config = CURRENCIES[currency] || CURRENCIES.INR;
  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${config.symbol} ${Math.round(amount).toLocaleString()}`;
  }
}

export function formatCompactCurrency(amount: number, currency: CurrencyCode = 'INR'): string {
  const config = CURRENCIES[currency] || CURRENCIES.INR;
  if (amount >= 10000000 && currency === 'INR') {
    return `${config.symbol}${(amount / 10000000).toFixed(1)}Cr`;
  }
  if (amount >= 100000 && currency === 'INR') {
    return `${config.symbol}${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000000) {
    return `${config.symbol}${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${config.symbol}${Math.round(amount / 1000)}k`;
  }
  return `${config.symbol}${Math.round(amount)}`;
}

export function getCurrencySymbol(currency: CurrencyCode = 'INR'): string {
  const config = CURRENCIES[currency] || CURRENCIES.INR;
  return config.symbol;
}
