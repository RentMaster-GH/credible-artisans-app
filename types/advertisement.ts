// types/advertisement.ts

export type AdStatus = 'pending_payment' | 'active' | 'expired' | 'rejected';
export type AdCurrency = 'GHS' | 'USD' | 'EUR' | 'GBP';

export interface Advertisement {
  id: string;
  artisan_id?: string | null;
  shop_name: string;
  headline: string;
  image_url: string;
  contact_phone: string;
  category: string;
  amount_paid: number;
  currency: AdCurrency;
  status: AdStatus;
  payment_reference?: string | null;
  starts_at: string;
  expires_at: string;
  created_at: string;
}

export interface CreateAdInput {
  artisan_id?: string;
  shop_name: string;
  headline: string;
  image_url: string;
  contact_phone: string;
  category: string;
  amount_paid: number;
  currency: AdCurrency;
  payment_reference?: string;
}

// Preset Pricing Map: 20 GHS or foreign equivalents
export const AD_PRICING: Record<AdCurrency, { amount: number; symbol: string; label: string }> = {
  GHS: { amount: 20, symbol: 'GH₵', label: 'GH₵ 20 (Ghana Cedi)' },
  USD: { amount: 1.50, symbol: '$', label: '$1.50 USD (US Dollar)' },
  EUR: { amount: 1.40, symbol: '€', label: '€1.40 EUR (Euro)' },
  GBP: { amount: 1.20, symbol: '£', label: '£1.20 GBP (British Pound)' },
};