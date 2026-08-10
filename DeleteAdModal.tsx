// components/ads/DeleteAdModal.tsx
'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Advertisement } from '@/types/advertisement';

interface DeleteAdModalProps {
  ad: Advertisement;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (deletedAdId: string) => void;
}

export const DeleteAdModal: React.FC<DeleteAdModalProps> = ({
  ad,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError('');

    try {
      const { error: deleteError } = await (supabase.from('ads') as any)
        .delete()
        .eq('id', ad.id);

      if (deleteError) {
        throw deleteError;
      }

      onSuccess(ad.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete advert.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-900 text-white rounded-2xl max-w-sm w-full p-6 border border-gray-800 shadow-2xl">
        <h3 className="text-lg font-bold text-red-500 mb-2">🗑️ Delete Advertisement</h3>
        <p className="text-xs text-gray-300 mb-4">
          Are you sure you want to delete <span className="font-bold text-white">"{ad.shop_name || 'this advert'}"</span>? This action cannot be undone.
        </p>

        {error && (
          <div className="mb-4 p-2.5 bg-red-900/50 border border-red-500 text-red-200 text-xs rounded-lg">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-gray-700 text-gray-300 font-bold text-xs hover:bg-gray-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-lg transition disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};