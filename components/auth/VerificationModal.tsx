// components/auth/VerificationModal.tsx
'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Props {
  isOpen: boolean;
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const VerificationModal: React.FC<Props> = ({ isOpen, userId, onClose, onSuccess }) => {
  const [idType, setIdType] = useState('ghana_card');
  const [idNumber, setIdNumber] = useState('');
  const [location, setLocation] = useState('');
  const [idDocumentUrl, setIdDocumentUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: updateError } = await (supabase.from as any)('profiles')
        .update({
          id_type: idType,
          id_number: idNumber,
          id_document_url: idDocumentUrl,
          location,
          is_verified: true,
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      alert('Verification details submitted! You can now contact artisans near you.');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit verification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black font-bold">
          ✕
        </button>

        <div className="space-y-3">
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase">
            🛡️ Identity Verification Required
          </span>
          <h3 className="text-xl font-extrabold text-gray-900">Verify Your ID to Proceed</h3>
          <p className="text-xs text-gray-500">
            To ensure trust and safety for both clients and artisans on CredibleArtisans.com, please complete your profile verification.
          </p>

          {error && <div className="p-2.5 bg-red-50 text-red-600 text-xs rounded">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Select ID Type *</label>
              <select
                value={idType}
                onChange={(e) => setIdType(e.target.value)}
                className="w-full border rounded-lg p-2.5 text-sm"
              >
                <option value="ghana_card">Ghana Card / National ID</option>
                <option value="passport">Passport</option>
                <option value="drivers_license">Driver's License</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">ID Number *</label>
              <input
                type="text"
                required
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="e.g. GHA-000000000-0"
                className="w-full border rounded-lg p-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Your City / Location *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Accra, East Legon"
                className="w-full border rounded-lg p-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Upload / Link ID Document Photo *</label>
              <input
                type="url"
                required
                value={idDocumentUrl}
                onChange={(e) => setIdDocumentUrl(e.target.value)}
                placeholder="https://your-image-link.com/id-photo.jpg"
                className="w-full border rounded-lg p-2.5 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-sm shadow mt-2"
            >
              {loading ? 'Submitting Verification...' : 'Complete Verification & Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
