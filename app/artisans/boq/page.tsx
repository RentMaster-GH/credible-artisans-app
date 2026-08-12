'use client';

import React, { useEffect, useState } from 'react';
import { Boq } from '@/types/boq';
import { BoqStatusBadge } from '@/components/boq/BoqStatusBadge';
import Link from 'next/link';

export default function ArtisanBoqListPage() {
  const [boqs, setBoqs] = useState<Boq[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Replace with actual artisan ID from auth session
  const artisanId = "YOUR_LOGGED_IN_ARTISAN_ID"; 

  useEffect(() => {
    async function fetchBoqs() {
      try {
        const res = await fetch(`/api/boq?artisanId=${artisanId}`);
        const json = await res.json();
        if (json.success) {
          setBoqs(json.data || []);
        }
      } catch (err) {
        console.error('Failed to load BOQs:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBoqs();
  }, [artisanId]);

  // Dynamic Statistics Calculated from Real API Data
  const totalBoqs = boqs.length;
  const totalValue = boqs.reduce((sum, item) => sum + (Number(item.grand_total) || 0), 0);
  const pendingBoqs = boqs.filter(
    (b) => String(b.status).toUpperCase() === 'PENDING' || String(b.status).toUpperCase() === 'SENT'
  ).length;
  const approvedBoqs = boqs.filter(
    (b) => String(b.status).toUpperCase() === 'APPROVED' || String(b.status).toUpperCase() === 'ACCEPTED'
  ).length;

  // Filtered BOQs based on search input
  const filteredBoqs = boqs.filter(
    (boq) =>
      boq.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      boq.boq_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      boq.client?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold uppercase tracking-wider mb-2">
              📐 Smart Estimator Tool
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Generated BOQs</h1>
            <p className="text-gray-500 mt-1">Track, manage, and send professional bills of quantities to clients.</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/artisans/boq/new"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition flex items-center gap-2 text-sm"
            >
              <span>+ Create New BOQ</span>
            </Link>
          </div>
        </div>

        {/* Real-time Overview Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Total Estimates</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalBoqs}</h3>
            </div>
            <span className="p-3 bg-blue-50 text-blue-600 rounded-xl text-xl">📄</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Total Quoted Value</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                ₦{totalValue.toLocaleString()}
              </h3>
            </div>
            <span className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-xl">💰</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Pending Review</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">{pendingBoqs}</h3>
            </div>
            <span className="p-3 bg-amber-50 text-amber-600 rounded-xl text-xl">⏳</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Approved / Accepted</p>
              <h3 className="text-2xl font-bold text-indigo-600 mt-1">{approvedBoqs}</h3>
            </div>
            <span className="p-3 bg-indigo-50 text-indigo-600 rounded-xl text-xl">✅</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="relative">
            <span className="absolute left-4 top-3 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search by BOQ #, Project Title, or Client Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm transition"
            />
          </div>
        </div>

        {/* Content Section: Loading, Empty, or Table */}
        {loading ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center shadow-sm">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3"></div>
            <p className="text-gray-500 text-sm font-medium">Loading your estimates...</p>
          </div>
        ) : filteredBoqs.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <span className="text-4xl">📐</span>
            <h3 className="text-lg font-bold text-gray-800">No BOQs Found</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              {searchTerm
                ? `No estimates match "${searchTerm}". Try adjusting your search.`
                : 'No Bill of Quantities created yet. Click below to generate your first estimate.'}
            </p>
            {!searchTerm && (
              <Link
                href="/artisans/boq/new"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition"
              >
                + Create New BOQ
              </Link>
            )}
          </div>
        ) : (
          /* Elevated Modern BOQ Table */
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider">
                    <th className="p-4 pl-6">BOQ #</th>
                    <th className="p-4">Project Title</th>
                    <th className="p-4">Client</th>
                    <th className="p-4">Grand Total</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {filteredBoqs.map((boq) => (
                    <tr
                      key={boq.id}
                      className="hover:bg-blue-50/30 transition duration-150 group"
                    >
                      <td className="p-4 pl-6 font-bold text-gray-900 group-hover:text-blue-600">
                        {boq.boq_number}
                      </td>
                      <td className="p-4 font-medium text-gray-900 max-w-xs truncate">
                        {boq.title}
                      </td>
                      <td className="p-4 font-medium text-gray-600">
                        {boq.client?.full_name || 'Client'}
                      </td>
                      <td className="p-4 font-bold text-emerald-600">
                        ₦{Number(boq.grand_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4">
                        <BoqStatusBadge status={boq.status} />
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <Link
                          href={`/client/boq/${boq.id}`}
                          className="inline-flex items-center gap-1 bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                        >
                          View BOQ →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}