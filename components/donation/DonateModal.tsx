// components/donation/DonateModal.tsx
'use client';

import React, { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DonateModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [currency, setCurrency] = useState<'GHS' | 'USD'>('GHS');
  const [selectedAmount, setSelectedAmount] = useState<number>(20);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [email, setEmail] = useState('');
  const [donorName, setDonorName] = useState('');
  const [loading, setLoading] = useState(false);
  const [donated, setDonated] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const presetsGHS = [10, 20, 50, 100, 200];
  const presetsUSD = [2, 5, 10, 25, 50];
  const activePresets = currency === 'GHS' ? presetsGHS : presetsUSD;

  const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;

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

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!finalAmount || finalAmount <= 0) {
      setError('Please select or enter a valid donation amount.');
      setLoading(false);
      return;
    }

    const scriptLoaded = await loadPaystackScript();
    if (!scriptLoaded) {
      setError('Unable to load payment gateway. Please check internet connection.');
      setLoading(false);
      return;
    }

    try {
      const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_sample';
      const referenceCode = 'DONATE_' + Math.floor(Math.random() * 1000000000 + 1);

      (window as any).onDonateSuccess = function () {
        setDonated(true);
        setLoading(false);
      };

      (window as any).onDonateClose = function () {
        setLoading(false);
      };

      const handler = (window as any).PaystackPop.setup({
        key: paystackPublicKey,
        email: email || 'supporter@credibleartisans.com',
        amount: Math.round(finalAmount * 100), // Pesewas or Cents
        currency: currency,
        ref: referenceCode,
        callback: (window as any).onDonateSuccess,
        onClose: (window as any).onDonateClose,
      });

      handler.openIframe();
    } catch (err: any) {
      setError(err.message || 'Unable to trigger payment.');
      setLoading(false);
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-[999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-2xl my-8">
        <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full font-bold text-gray-700">
          ✕
        </button>

        {!donated ? (
          <form onSubmit={handleDonate} className="space-y-4">
            <div>
              <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase">
                💖 Support Credible Artisans
              </span>
              <h2 className="text-xl font-extrabold text-gray-900 mt-2">Aid App Development</h2>
              <p className="text-xs text-gray-500">
                Your contribution powers free artisan training, verified background checks, and platform maintenance!
              </p>
            </div>

            {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg">{error}</div>}

            {/* Currency Switcher */}
            <div className="flex justify-between items-center bg-gray-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => { setCurrency('GHS'); setSelectedAmount(20); }}
                className={`flex-1 py-1.5 rounded-lg transition ${currency === 'GHS' ? 'bg-amber-500 text-white shadow' : 'text-gray-600'}`}
              >
                GH₵ Ghana Cedi
              </button>
              <button
                type="button"
                onClick={() => { setCurrency('USD'); setSelectedAmount(5); }}
                className={`flex-1 py-1.5 rounded-lg transition ${currency === 'USD' ? 'bg-amber-500 text-white shadow' : 'text-gray-600'}`}
              >
                $ US Dollar
              </button>
            </div>

            {/* Preset Tiers */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Select Donation Tier</label>
              <div className="grid grid-cols-3 gap-2">
                {activePresets.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => { setSelectedAmount(amount); setCustomAmount(''); }}
                    className={`py-2 text-xs font-bold rounded-lg border transition ${
                      !customAmount && selectedAmount === amount
                        ? 'bg-amber-500 text-white border-amber-500 shadow'
                        : 'bg-white text-gray-800 border-gray-300 hover:border-amber-400'
                    }`}
                  >
                    {currency === 'GHS' ? `GH₵ ${amount}` : `$${amount}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Or Enter Custom Amount</label>
              <input
                type="number"
                min="1"
                step="any"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder={`Custom amount in ${currency}`}
                className="w-full border rounded-lg p-2.5 text-sm"
              />
            </div>

            {/* Donor Information */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name (Optional)</label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="e.g. Ama Serwaa"
                  className="w-full border rounded-lg p-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email / Phone *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="for MoMo receipt"
                  className="w-full border rounded-lg p-2 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-3.5 rounded-xl shadow-lg transition text-sm disabled:opacity-50"
            >
              {loading ? 'Processing Donation...' : `💖 Donate ${currency === 'GHS' ? 'GH₵' : '$'}${finalAmount} via MoMo / Card`}
            </button>
          </form>
        ) : (
          <div className="text-center py-6 space-y-3">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto text-3xl">
              💖
            </div>
            <h3 className="text-2xl font-black text-gray-900">Thank You for Your Support!</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Your donation directly aids in building digital tools, verified artisan training, and empowering workers globally!
            </p>
            <button
              onClick={onClose}
              className="bg-gray-900 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};