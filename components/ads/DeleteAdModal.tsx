// components/ads/DeleteAdModal.tsx
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

export const DeleteAdModal: React.FC<Props> = ({ ad, isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setLoading(true);

    const { error } = await supabase
      .from('advertisements')
      .delete()
      .eq('id', ad.id);

    setLoading(false);
    if (!error) {
      alert('Advertisement removed. Publishing a new ad will require a fresh 20 GHS fee (or foreign equivalent).');
      onSuccess();
      onClose();
    } else {
      alert(error.message);
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl max-w-sm w-full p-6 relative text-center space-y-4">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
          🗑️
        </div>
        <h3 className="text-lg font-bold text-gray-900">Delete Advertisement?</h3>
        <p className="text-xs text-gray-600">
          Are you sure you want to remove <strong>"{ad.shop_name}"</strong> from the auth screen?
        </p>
        <div className="bg-amber-50 p-3 rounded-lg text-amber-900 text-[11px] font-medium border border-amber-200">
          ⚠️ Note: Once deleted, publishing another advertisement requires a new 20 GHS payment (or foreign currency equivalent).
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold py-2.5 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="w-1/2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 rounded-lg"
          >
            {loading ? 'Deleting...' : 'Delete Ad'}
          </button>
        </div>
      </div>
    </div>
  );
};