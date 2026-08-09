// app/client/boq/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Boq } from '@/types/boq';
import { BoqView } from '@/components/boq/BoqView';

export default function ClientBoqDetailPage() {
  const params = useParams();
  const boqId = params.id as string;

  const [boq, setBoq] = useState<Boq | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchBoq() {
      try {
        const res = await fetch(`/api/boq/${boqId}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to fetch BOQ');
        setBoq(json.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (boqId) fetchBoq();
  }, [boqId]);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-8 text-center text-gray-500">Loading BOQ document...</div>;
  }

  if (error || !boq) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded max-w-md mx-auto">
          {error || 'BOQ document not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {/* Set isClient={true} so approval buttons are visible */}
      <BoqView boq={boq} isClient={true} />
    </div>
  );
}