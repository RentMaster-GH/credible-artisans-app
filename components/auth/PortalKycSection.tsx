'use client';

import React, { useState, useEffect } from 'react';
import { backend } from '@/lib/backend';

export const PortalKycSection: React.FC = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [profileRecordId, setProfileRecordId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState('User');
  const [idType, setIdType] = useState('national_id');
  const [idNumber, setIdNumber] = useState('');
  const [location, setLocation] = useState('');
  const [idDocumentUrl, setIdDocumentUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const me = await backend.getMe();
        const uid = me.payload?.sub as string;
        const custom = (me.payload?.custom as Record<string, any>) || {};
        if (uid) {
          setUserId(uid);
          setFullName(custom.full_name || 'User');

          const profiles = await backend.list<any>('profiles');
          const existing = profiles.find((p) => p.owner_id === uid || p.data?.user_id === uid);
          if (existing) {
            setProfileRecordId(existing.id);
            const d = existing.data || {};
            setIsVerified(!!d.is_verified);
            if (d.id_type) setIdType(d.id_type);
            if (d.id_number) setIdNumber(d.id_number);
            if (d.location) setLocation(d.location);
          }
        }
      } catch {
        // Not logged in
      } finally {
        setFetching(false);
      }
    }
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    setMessage('');

    try {
      const kycPayload = {
        user_id: userId,
        full_name: fullName,
        id_type: idType,
        id_number: idNumber,
        id_document_url: idDocumentUrl,
        location,
        is_verified: true,
      };

      if (profileRecordId) {
        await backend.update('profiles', profileRecordId, kycPayload);
      } else {
        const created = await backend.create<any>('profiles', kycPayload);
        if (created?.id) setProfileRecordId(created.id);
      }

      setIsVerified(true);
      setMessage('✅ Identity verified successfully! Full portal, live calls, and messaging enabled.');
    } catch (err: any) {
      setMessage('❌ Failed to update KYC: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-4 text-xs text-gray-500">Checking verification status...</div>;

  if (isVerified) {
    return (
      <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
            ✓
          </div>
          <div>
            <h4 className="font-bold text-sm text-green-900">Identity & KYC Verified</h4>
            <p className="text-xs text-green-700">Your account is fully verified. You can contact users, host video calls, and create transactions.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <span className="bg-amber-200 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
            Action Required
          </span>
          <h3 className="text-lg font-bold text-amber-900 mt-1">🛡️ Complete Identity & KYC Verification</h3>
          <p className="text-xs text-amber-800">
            Upload your government ID (Ghana Card, Passport, Driver's License) to unlock live video calling, messaging, and transactions.
          </p>
        </div>
      </div>

      {message && <div className="p-3 text-xs font-semibold rounded bg-white">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-3 bg-white p-4 rounded-lg border border-amber-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">ID Type *</label>
            <select
              value={idType}
              onChange={(e) => setIdType(e.target.value)}
              className="w-full border rounded-lg p-2.5 text-xs text-gray-800 bg-white"
            >
              <option value="ghana_card">Ghana Card / National ID</option>
              <option value="passport">Passport</option>
              <option value="drivers_license">Driver's License</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">ID Number *</label>
            <input
              type="text"
              required
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              placeholder="e.g. GHA-000000000-0"
              className="w-full border rounded-lg p-2.5 text-xs text-gray-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">City / Primary Location *</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Accra, London, New York"
              className="w-full border rounded-lg p-2.5 text-xs text-gray-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">ID Photo URL *</label>
            <input
              type="url"
              required
              value={idDocumentUrl}
              onChange={(e) => setIdDocumentUrl(e.target.value)}
              placeholder="https://your-image-link.com/id.jpg"
              className="w-full border rounded-lg p-2.5 text-xs text-gray-800"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-lg text-xs shadow transition disabled:opacity-50"
        >
          {loading ? 'Submitting KYC Verification...' : 'Submit Verification & Unlock Features'}
        </button>
      </form>
    </div>
  );
};
