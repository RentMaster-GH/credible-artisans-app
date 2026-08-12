'use client';

import React, { useEffect, useState } from 'react';
import { Boq } from '@/types/boq';
import { BoqStatusBadge } from '@/components/boq/BoqStatusBadge';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

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

  // Dynamic Statistics
  const totalBoqs = boqs.length;
  const totalValue = boqs.reduce((sum, item) => sum + (Number(item.grand_total) || 0), 0);
  const pendingBoqs = boqs.filter(
    (b) => String(b.status).toUpperCase() === 'PENDING' || String(b.status).toUpperCase() === 'SENT'
  ).length;
  const approvedBoqs = boqs.filter(
    (b) => String(b.status).toUpperCase() === 'APPROVED' || String(b.status).toUpperCase() === 'ACCEPTED'
  ).length;

  const filteredBoqs = boqs.filter(
    (boq) =>
      boq.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      boq.boq_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      boq.client?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-20 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* HERO ROLE BANNER */}
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-3xl p-6 sm:p-8 shadow-2xl border border-amber-400/20">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="bg-black/30 backdrop-blur-md text-amber-200 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-widest border border-amber-300/30">
                ACTIVE PORTAL: 🛠️ ARTISAN WORK PORTAL
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-3">
                BOQ Estimates Generator
              </h1>
              <p className="text-amber-100 text-sm mt-1 max-w-xl">
                Generate professional Bill of Quantities (BOQ), manage material estimates, and submit quotes to clients.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href="/artisans/boq/new"
                className="bg-white text-gray-900 hover:bg-amber-100 font-black text-xs px-5 py-3 rounded-2xl shadow-xl transition transform hover:-translate-y-0.5"
              >
                + Create New BOQ
              </Link>
            </div>
          </div>
        </div>

        {/* PORTAL METRICS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-900/80 border border-gray-800 p-5 rounded-2xl backdrop-blur-md shadow-lg">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Estimates</p>
            <p className="text-2xl font-black text-white mt-1">{totalBoqs}</p>
          </div>

          <div className="bg-gray-900/80 border border-gray-800 p-5 rounded-2xl backdrop-blur-md shadow-lg">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Quoted Value</p>
            <p className="text-2xl font-black text-amber-400 mt-1">
              ₦{totalValue.toLocaleString()}
            </p>
          </div>

          <div className="bg-gray-900/80 border border-gray-800 p-5 rounded-2xl backdrop-blur-md shadow-lg">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Pending Review</p>
            <p className="text-2xl font-black text-orange-400 mt-1">{pendingBoqs}</p>
          </div>

          <div className="bg-gray-900/80 border border-gray-800 p-5 rounded-2xl backdrop-blur-md shadow-lg">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Approved Contracts</p>
            <p className="text-2xl font-black text-green-400 mt-1">{approvedBoqs}</p>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-gray-900/90 border border-gray-800 p-4 rounded-2xl shadow-2xl">
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-gray-500">🔍</span>
            <input
              type="text"
              placeholder="Search by BOQ #, Project Title, or Client Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-950 border border-gray-800 rounded-xl focus:border-amber-500 text-white placeholder-gray-500 outline-none text-sm transition"
            />
          </div>
        </div>

        {/* BOQs DATA TABLE */}
        {loading ? (
          <div className="bg-gray-900/80 border border-gray-800 p-12 rounded-2xl text-center shadow-lg">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Loading your estimates...</p>
          </div>
        ) : filteredBoqs.length === 0 ? (
          <div className="bg-gray-900/80 border border-gray-800 p-12 text-center rounded-2xl shadow-lg space-y-4">
            <span className="text-4xl">📐</span>
            <h3 className="text-lg font-black text-white">No BOQs Found</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              {searchTerm
                ? `No estimates match "${searchTerm}".`
                : 'No Bill of Quantities created yet. Click below to generate your first estimate.'}
            </p>
            {!searchTerm && (
              <Link
                href="/artisans/boq/new"
                className="inline-block bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs px-5 py-3 rounded-xl transition"
              >
                + Create New BOQ
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-gray-900/90 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-800/80 border-b border-gray-800 text-gray-400 font-extrabold text-xs uppercase tracking-wider">
                    <th className="p-4 pl-6">BOQ #</th>
                    <th className="p-4">Project Title</th>
                    <th className="p-4">Client</th>
                    <th className="p-4">Grand Total</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 text-gray-300">
                  {filteredBoqs.map((boq) => (
                    <tr key={boq.id} className="hover:bg-gray-800/50 transition duration-150">
                      <td className="p-4 pl-6 font-bold text-white">
                        {boq.boq_number}
                      </td>
                      <td className="p-4 font-semibold text-white max-w-xs truncate">
                        {boq.title}
                      </td>
                      <td className="p-4 font-medium text-gray-400">
                        {boq.client?.full_name || 'Client'}
                      </td>
                      <td className="p-4 font-black text-amber-400">
                        ₦{Number(boq.grand_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4">
                        <BoqStatusBadge status={boq.status} />
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <Link
                          href={`/client/boq/${boq.id}`}
                          className="inline-flex items-center gap-1 bg-gray-800 hover:bg-amber-500 hover:text-black text-amber-400 text-xs font-extrabold px-3 py-1.5 rounded-lg transition"
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

      </main>
    </div>
  );
}