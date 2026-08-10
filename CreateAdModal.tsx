// components/ads/CreateAdModal.tsx
'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface CreateAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateAdModal: React.FC<CreateAdModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [shopName, setShopName] = useState('');
  const [headline, setHeadline] = useState('');
  const [category, setCategory] = useState('Carpentry');
  const [contactPhone, setContactPhone] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        setError('Please sign in to feature your business.');
        setLoading(false);
        return;
      }

      // Insert advertisement into 'ads' table
      const { error: insertError } = await ((supabase.from as any)('ads') as any).insert([
        {
          artisan_id: user.id,
          shop_name: shopName,
          business_name: shopName,
          headline: headline,
          category: category,
          contact_phone: contactPhone,
          image_url: imageUrl || 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&q=80&w=600',
          creative_url: imageUrl || 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&q=80&w=600',
          status: 'active',
        },
      ]);

      if (insertError) {
        throw insertError;
      }

      // Reset form and notify parent component
      setShopName('');
      setHeadline('');
      setContactPhone('');
      setImageUrl('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to publish advert.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-900 text-white rounded-2xl max-w-md w-full p-6 border border-gray-800 shadow-2xl relative">
        
        <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-3">
          <div>
            <h3 className="text-lg font-black text-amber-400">📢 Promote Your Artisan Business</h3>
            <p className="text-xs text-gray-400">
              Feature your shop on the main sign-in showcase (GH₵ 20 or its foreign currency equivalent)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-lg font-bold p-1"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-200 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">
              Shop / Business Name *
            </label>
            <input
              type="text"
              required
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="e.g. Mensah Master Carpentry"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">
              Trade Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="Carpentry">Carpentry & Furniture</option>
              <option value="Plumbing">Plumbing Specialist</option>
              <option value="Electrical">Master Electrician</option>
              <option value="Welding">Welding & Metal Fabrication</option>
              <option value="Masonry">Masonry & Construction</option>
              <option value="General">General Artisan</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">
              Short Promotional Headline *
            </label>
            <input
              type="text"
              required
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Custom kitchen cabinets & roofing with 100% guarantee"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">
              WhatsApp Phone Number *
            </label>
            <input
              type="text"
              required
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="e.g. +233 24 123 4567"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">
              Shop Photo URL (Optional)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-700 text-gray-300 font-bold text-xs hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs shadow-lg transition disabled:opacity-50"
            >
              {loading ? 'Publishing...' : '🚀 Publish Advert (GH₵ 20 / Foreign Equivalent)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

