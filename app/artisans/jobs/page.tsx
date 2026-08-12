'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const JOBS_DATA = [
  {
    id: 'JOB-101',
    title: 'Full Villa Electrical Rewiring & Lighting Installation',
    client: 'Chief Adeniyi',
    verifiedClient: true,
    location: 'Lekki Phase 1, Lagos',
    budget: '₦850,000 - ₦1,200,000',
    category: 'Electrical',
    postedTime: '2 hours ago',
    proposalsCount: 3,
    description: 'Looking for a certified electrical engineer/artisan to completely overhaul conduit wiring for a 5-bedroom duplex, install modern LED strip lights, and set up an inverter bypass board.',
    urgent: true,
  },
  {
    id: 'JOB-102',
    title: 'Custom Modern Kitchen Cabinetry & Granite Tops',
    client: 'Mrs. Sarah Jenkins',
    verifiedClient: true,
    location: 'Ikeja GRA, Lagos',
    budget: '₦1,500,000',
    category: 'Carpentry',
    postedTime: '5 hours ago',
    proposalsCount: 7,
    description: 'Need skilled joinery artisans for high-gloss acrylic kitchen cabinets with soft-close hinges and black galaxy granite countertop fitting.',
    urgent: false,
  },
  {
    id: 'JOB-103',
    title: 'Bathroom Tile Laying & Plumbing Overhaul',
    client: 'Emeka Nwosu',
    verifiedClient: false,
    location: 'Epe, Lagos',
    budget: '₦450,000',
    category: 'Plumbing & Tiling',
    postedTime: '1 day ago',
    proposalsCount: 12,
    description: 'Replacement of old porcelain tiles with 60x60 vitreous tiles in 3 bathrooms. Includes installing wall-hung toilets and shower glass panels.',
    urgent: false,
  },
];

export default function JobMarketplacePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Electrical', 'Carpentry', 'Plumbing & Tiling', 'Masonry', 'Painting'];

  return (
    <div className="min-h-screen bg-gray-50/60 p-4 md:p-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HERO BANNER - Matched to Portal Dashboard */}
        <div className="bg-gradient-to-r from-slate-900 via-gray-900 to-slate-800 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE PORTAL: 🛠️ ARTISAN WORK PORTAL
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">Job Marketplace</h1>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                Browse verified client contracts, submit competitive proposals, and win new artisan projects.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/artisans/boq"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold px-4 py-2.5 rounded-xl text-sm transition backdrop-blur-md"
              >
                📐 Generate BOQ
              </Link>
            </div>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Available Contracts</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">128</h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl font-bold">
              📋
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Urgent Hiring</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">14</h3>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-xl font-bold">
              🔥
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">My Submitted Proposals</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">5</h3>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-xl font-bold">
              🚀
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Avg. Project Budget</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">₦650,000</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl font-bold">
              💰
            </div>
          </div>
        </div>

        {/* SEARCH & CATEGORY FILTERS */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-3.5 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search by trade, skill, or project keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm transition"
              />
            </div>
            <select className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-xl text-sm font-medium outline-none">
              <option>📍 All Locations (Lagos, Abuja...)</option>
              <option>Lagos Island</option>
              <option>Lagos Mainland</option>
              <option>Abuja FCT</option>
            </select>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* JOB LISTINGS FEED */}
        <div className="space-y-4">
          {JOBS_DATA.map((job) => (
            <div
              key={job.id}
              className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition duration-200 group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-lg">
                      {job.category}
                    </span>
                    {job.urgent && (
                      <span className="bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1">
                        🔥 Urgent Need
                      </span>
                    )}
                    <span className="text-xs text-gray-400 font-medium">• Posted {job.postedTime}</span>
                  </div>

                  <h2 className="text-xl font-extrabold text-gray-900 group-hover:text-blue-600 transition">
                    {job.title}
                  </h2>

                  <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 pt-1 flex-wrap">
                    <span className="flex items-center gap-1">📍 {job.location}</span>
                    <span className="flex items-center gap-1">
                      👤 {job.client} {job.verifiedClient && <span className="text-blue-500" title="Verified Client">✓ Verified</span>}
                    </span>
                    <span className="flex items-center gap-1">📩 {job.proposalsCount} Proposals</span>
                  </div>
                </div>

                <div className="flex lg:flex-col justify-between items-end gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100 min-w-[200px]">
                  <div className="text-left lg:text-right">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Project Budget</p>
                    <p className="text-xl font-black text-emerald-600">{job.budget}</p>
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition shadow-sm">
                    Submit Proposal
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}