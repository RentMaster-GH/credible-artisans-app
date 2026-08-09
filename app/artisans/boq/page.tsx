// app/artisan/boq/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Boq } from '@/types/boq';
import { BoqStatusBadge } from '@/components/boq/BoqStatusBadge';
import Link from 'next/link';

export default function ArtisanBoqListPage() {
  const [boqs, setBoqs] = useState<Boq[]>([]);
  const [loading, setLoading] = useState(true);

  // Replace with actual artisan ID from auth session
  const artisanId = "YOUR_LOGGED_IN_ARTISAN_ID"; 

  useEffect(() => {
    async function fetchBoqs() {
      try {
        const res = await fetch(`/api/boq?artisanId=${artisanId}`);
        const json = await res.json();
        if (json.success) {
          setBoqs(json.data);
        }
      } catch (err) {
        console.error('Failed to load BOQs:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBoqs();
  }, [artisanId]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Generated BOQs</h1>
            <p className="text-sm text-gray-500">Track and manage bills of quantities sent to clients</p>
          </div>
          <Link
            href="/artisan/boq/new"
            className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700"
          >
            + Create New BOQ
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading BOQs...</p>
        ) : boqs.length === 0 ? (
          <div className="bg-white p-8 text-center rounded border text-gray-500">
            No Bill of Quantities created yet. Click "+ Create New BOQ" to generate your first one.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden border">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3 border-b">BOQ #</th>
                  <th className="p-3 border-b">Project Title</th>
                  <th className="p-3 border-b">Client</th>
                  <th className="p-3 border-b">Grand Total</th>
                  <th className="p-3 border-b">Status</th>
                  <th className="p-3 border-b text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {boqs.map((boq) => (
                  <tr key={boq.id} className="hover:bg-gray-50 border-b">
                    <td className="p-3 font-medium">{boq.boq_number}</td>
                    <td className="p-3">{boq.title}</td>
                    <td className="p-3">{boq.client?.full_name || 'Client'}</td>
                    <td className="p-3 font-semibold">${Number(boq.grand_total).toFixed(2)}</td>
                    <td className="p-3"><BoqStatusBadge status={boq.status} /></td>
                    <td className="p-3 text-right">
                      <Link 
                        href={`/client/boq/${boq.id}`}
                        className="text-blue-600 hover:underline font-medium text-xs"
                      >
                        View BOQ
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}