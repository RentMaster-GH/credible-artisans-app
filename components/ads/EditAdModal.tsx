// components/ads/EditAdModal.tsx
'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Advertisement } from '@/types/advertisement';

interface Props {
  ad: Advertisement;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditAdModal: React.FC<Props> = ({ ad, isOpen, onClose, onSuccess }) => {
  const [shopName, setShopName] = useState(ad.shop_name);
  const [headline, setHeadline] = useState(ad.headline);
  const [contactPhone, setContactPhone] = useState(ad.contact_phone);
  const [imageUrl, setImageUrl] = useState(ad.image_url);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('advertisements')
      .update({
        shop_name: shopName,
        headline,
        contact_phone: contactPhone,
        image_url: imageUrl,
      })
      .eq('id', ad.id);

    setLoading(false);
    if (!error) {
      alert('Advertisement updated successfully!');
      onSuccess();
      onClose();
    } else {
      alert(error.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this advertisement?')) return;
    setLoading(true);

    const { error } = await supabase
      .from('advertisements')
      .delete()
      .eq('id', ad.id);

    setLoading(false);
    if (!error) {
      alert('Advertisement deleted.');
      onSuccess();
      onClose();
    } else {
      alert(error.message);
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        <h3 className="text-lg font-bold text-gray-900 mb-4">✏️ Edit / Delete Your Sponsored Ad</h3>
        <form onSubmit={handleUpdate} className="space-y-3">
          <div>
            <label className="text-xs font-semibold">Shop Name</label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full border rounded p-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold">Headline</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full border rounded p-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold">WhatsApp Number</label>
            <input
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full border rounded p-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold">Image URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full border rounded p-2 text-sm"
            />
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 text-white text-xs font-bold px-4 py-2 rounded hover:bg-red-700"
            >
              🗑️ Delete Ad
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-200 text-gray-800 text-xs font-bold px-3 py-2 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded hover:bg-amber-600"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};