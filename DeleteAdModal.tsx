// components/ads/DeleteAdModal.tsx
'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Advertisement } from '@/types/advertisement';

interface Props {
  ad: Advertisement;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (deletedAdId: string) => void;
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
      onSuccess(ad.id);
      onClose();
    } else {
      alert('Failed to delete advert: ' + error.message);
    }
  };

  return (
    <div 
      onClick={onClose} 
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-white rounded-2xl max-w-sm w-full p-6 relative text-center space-y-4 shadow-2xl border border-gray-100"
      >
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
          🗑️
        </div>
        <h3 className="text-lg font-extrabold text-gray-900">Delete Advert</h3>
        
        <p className="text-xs text-gray-600">
          You are about to remove <strong>"{ad.shop_name}"</strong> from the Auth Screen.
        </p>

        <div className="bg-amber-50 p-3 rounded-xl text-amber-900 text-xs text-left leading-relaxed border border-amber-200">
          ⚠️ <strong>Please Note:</strong> Deleting this advert will remove it off the screen immediately. If you decide to publish another advert in the future, you will have to pay the 20 GHS fee (or foreign currency equivalent) again.
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold py-2.5 rounded-lg transition"
          >
            Keep Advert
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="w-1/2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 rounded-lg transition shadow disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete & Remove'}
          </button>
        </div>
      </div>
    </div>
  );
};