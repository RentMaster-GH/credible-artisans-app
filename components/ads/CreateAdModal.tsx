// components/ads/CreateAdModal.tsx
'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { AD_PRICING, AdCurrency } from '@/types/advertisement';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateAdModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [shopName, setShopName] = useState('');
  const [headline, setHeadline] = useState('');
  const [category, setCategory] = useState('Carpentry');
  const [contactPhone, setContactPhone] = useState('');
  const [email, setEmail] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [currency, setCurrency] = useState<AdCurrency>('GHS');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const currentPricing = AD_PRICING[currency];

  const resetForm = () => {
    setShopName('');
    setHeadline('');
    setImageUrl('');
    setError('');
    setSubmitted(false);
  };

  const loadPaystackScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).PaystackPop) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Process saving to Supabase after payment authorization
  const saveAdvertisement = async (paymentRef: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();

      const { error: insertError } = await supabase.from('advertisements').insert({
        artisan_id: userData?.user?.id || null,
        shop_name: shopName,
        headline,
        category,
        contact_phone: contactPhone,
        image_url: imageUrl || 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&q=80&w=400',
        amount_paid: currentPricing.amount,
        currency,
        payment_reference: paymentRef,
        status: 'active',
      });

      if (insertError) {
        setError(insertError.message);
      } else {
        setSubmitted(true);
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save advertisement.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const scriptLoaded = await loadPaystackScript();
    if (!scriptLoaded) {
      setError('Could not connect to payment gateway. Please check internet connection.');
      setLoading(false);
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_sample';
      const referenceCode = 'AD_' + Math.floor(Math.random() * 1000000000 + 1);

      // Attach explicit global functions on window object to bypass SWC minification
      (window as any).onPaystackSuccess = function (response: any) {
        const ref = response?.reference || response?.trxref || referenceCode;
        saveAdvertisement(ref);
      };

      (window as any).onPaystackClose = function () {
        setLoading(false);
        setError('Payment popup closed. Ad was not published.');
      };

      // Pass global function references to Paystack Setup
      const handler = (window as any).PaystackPop.setup({
        key: paystackPublicKey,
        email: email || userData?.user?.email || 'advertiser@credibleartisans.com',
        amount: currentPricing.amount * 100, // Amount in pesewas
        currency: currency,
        ref: referenceCode,
        callback: (window as any).onPaystackSuccess,
        onClose: (window as any).onPaystackClose,
      });

      handler.openIframe();
    } catch (err: any) {
      setError(err.message || 'Unable to trigger payment prompt.');
      setLoading(false);
    }
  };

  return (
    <div 
      onClick={onClose} 
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border relative my-8"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold"
        >
          ✕
        </button>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase">
                Self-Service Promo
              </span>
              <h2 className="text-xl font-bold text-gray-900 mt-2">📢 Advertise Your Shop Here</h2>
              <p className="text-xs text-gray-500">Feature your shop on our Auth Screen seen by thousands daily!</p>
            </div>

            {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-md">{error}</div>}

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-xs text-amber-900 font-bold">30 Days Promotion Fee</p>
                <p className="text-lg font-extrabold text-amber-700">{currentPricing.symbol} {currentPricing.amount}</p>
              </div>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as AdCurrency)}
                className="text-xs font-semibold border rounded p-1.5 bg-white"
              >
                {Object.entries(AD_PRICING).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Shop Name *</label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. Kwame Furniture & Fittings"
                className="w-full border rounded-lg p-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Headline / Offer *</label>
              <input
                type="text"
                required
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Custom Wardrobes & Kitchen Cabinets in Accra"
                className="w-full border rounded-lg p-2.5 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-sm"
                >
                  <option value="Carpentry">Carpentry & Furniture</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Masonry">Masonry</option>
                  <option value="Welding">Welding</option>
                  <option value="Other">Other Services</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile Money Number *</label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="024XXXXXXX"
                  className="w-full border rounded-lg p-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email for MoMo Receipt *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your-email@gmail.com"
                className="w-full border rounded-lg p-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Shop Photo URL (Optional)</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full border rounded-lg p-2.5 text-sm"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-lg shadow transition disabled:opacity-50 text-sm"
              >
                {loading ? 'Triggering MoMo...' : `Pay ${currentPricing.symbol}${currentPricing.amount} via MoMo`}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              ✓
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Ad Published Successfully!</h3>
            <p className="text-sm text-gray-600">Your product promotion is now live on the Credible Artisans Auth Screen!</p>
            
            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2.5 rounded-lg text-xs shadow"
              >
                📢 Promote Another Product ({currentPricing.symbol}{currentPricing.amount})
              </button>
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-900 hover:bg-black text-white font-semibold px-4 py-2.5 rounded-lg text-xs"
              >
                Close & View Live Ad
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};