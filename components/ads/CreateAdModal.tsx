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
  const [imageUrl, setImageUrl] = useState('');
  const [currency, setCurrency] = useState<AdCurrency>('GHS');
  const [paymentRef, setPaymentRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const currentPricing = AD_PRICING[currency];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
        payment_reference: paymentRef || 'DIRECT_AUTH_PROMO',
        status: 'active',
      });

      if (insertError) throw insertError;

      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit advertisement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Dark Backdrop - Clicking outside closes the modal */
    <div 
      onClick={onClose} 
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
    >
      {/* Modal Box - Stops propagation so clicking inside does not close */}
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border relative my-8 border-gray-100"
      >
        {/* Highly Visible Prominent Close (X) Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-black font-extrabold text-lg transition shadow-sm z-30 cursor-pointer"
        >
          ✕
        </button>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Self-Service Promo
              </span>
              <h2 className="text-xl font-bold text-gray-900 mt-2 pr-8">
                📢 Advertise Your Shop Here
              </h2>
              <p className="text-xs text-gray-500">
                Feature your brand on our Auth Screen seen by thousands of visiting clients daily!
              </p>
            </div>

            {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-md">{error}</div>}

            {/* Currency & Pricing Selector */}
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-xs text-amber-900 font-bold">Promotion Fee (30 Days)</p>
                <p className="text-lg font-extrabold text-amber-700">
                  {currentPricing.symbol} {currentPricing.amount}
                </p>
              </div>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as AdCurrency)}
                className="text-xs font-semibold border rounded p-1.5 bg-white text-gray-800"
              >
                {Object.entries(AD_PRICING).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Shop Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Shop / Business Name *</label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. Kwame Furniture & Fittings"
                className="w-full border rounded-lg p-2.5 text-sm"
              />
            </div>

            {/* Headline / Offer */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Headline / Promotional Offer *</label>
              <input
                type="text"
                required
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Quality Custom Wardrobes & Kitchen Cabinets in Accra"
                className="w-full border rounded-lg p-2.5 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Category */}
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
                  <option value="Masonry">Masonry / Construction</option>
                  <option value="Painting">Painting</option>
                  <option value="Welding">Welding / Fabrication</option>
                  <option value="Other">Other Services</option>
                </select>
              </div>

              {/* WhatsApp / Call Contact */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">WhatsApp / Phone *</label>
                <input
                  type="text"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+233 24 000 0000"
                  className="w-full border rounded-lg p-2.5 text-sm"
                />
              </div>
            </div>

            {/* Image / Logo URL */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Shop Image or Logo URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://your-image-link.com/photo.jpg (Optional)"
                className="w-full border rounded-lg p-2.5 text-sm"
              />
            </div>

            {/* Payment Reference */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Reference / TxID</label>
              <input
                type="text"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                placeholder="e.g. MoMo Ref # 204918239"
                className="w-full border rounded-lg p-2.5 text-sm"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Pay GHS 20 via MoMo / Card to account or enter reference code above.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-lg text-sm transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-lg shadow-md transition disabled:opacity-50 text-sm"
              >
                {loading ? 'Publishing...' : `Pay ${currentPricing.symbol}${currentPricing.amount} & Publish`}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              ✓
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Ad Published Successfully!</h3>
            <p className="text-sm text-gray-600">
              Your shop promotion is now live on the Credible Artisans Auth Screen for 30 days!
            </p>
            <button
              onClick={onClose}
              className="bg-gray-900 text-white font-semibold px-6 py-2.5 rounded-lg text-sm"
            >
              Close & View Live Ad
            </button>
          </div>
        )}
      </div>
    </div>
  );
};