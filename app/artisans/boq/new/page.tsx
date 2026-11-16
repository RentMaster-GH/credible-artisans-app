'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BoqForm } from '@/components/boq/BoqForm';
import { backend } from '@/lib/backend';
import Link from 'next/link';

export default function CreateBoqPage() {
  const router = useRouter();
  const [currentArtisanId, setCurrentArtisanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        const { payload } = await backend.getMe();
        if (payload?.sub) {
          setCurrentArtisanId(String(payload.sub));
        } else {
          router.push('/login');
        }
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentArtisanId) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center">
        <Link 
          href="/artisan/boq" 
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          ← Back to BOQ List
        </Link>
      </div>

      <BoqForm 
        artisanId={currentArtisanId} 
        onSuccess={() => {
          router.push('/artisan/boq');
        }} 
      />
    </div>
  );
}
