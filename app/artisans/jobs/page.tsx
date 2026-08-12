'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

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
    <div className="min-h-screen bg-gray-950 text-white pb-20 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* HERO ROLE BANNER - Matched to Dashboard */}
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-3xl p-6 sm:p-8 shadow-2xl border border-amber-400/20">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="bg-black/30 backdrop-blur-md text-amber-200 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-widest border border-amber-300/30">
                ACTIVE PORTAL: 🛠️ ARTISAN WORK PORTAL
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-3">
                Job Marketplace
              </h1>
              <p className="text-amber-100 text-sm mt-1 max-w-xl">
                Browse verified client contracts, submit competitive proposals, and win new artisan contracts.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href="/artisans/boq"
                className="bg-white text-gray-900 hover:bg-amber-100 font-black text-xs px-5 py-3 rounded-2xl shadow-xl transition transform hover:-translate-y-0.5"
              >
                📐 Generate BOQ Estimate
              </Link>
            </div>
          </div>
        </div>

        {/* PORTAL METRICS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-900/80 border border-gray-800 p-5 rounded-2xl backdrop-blur-md shadow-lg">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Available Contracts</p>
            <p className="text-2xl font-black text-amber-400 mt-1">128</p>
          </div>

          <div className="bg-gray-900/80 border border-gray-800 p-5 rounded-2xl backdrop-blur-md shadow-lg">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Urgent Hiring</p>
            <p className="text-2xl font-black text-red-400 mt-1 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-red-400 rounded-full animate-ping" />
              14 Requests
            </p>
          </div>

          <div className="bg-gray-900/80 border border-gray-800 p-5 rounded-2xl backdrop-blur-md shadow-lg">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Submitted Proposals</p>
            <p className="text-2xl font-black text-blue-400 mt-1">5 Bids</p>
          </div>

          <div className="bg-gray-900/80 border border-gray-800 p-5 rounded-2xl backdrop-blur-md shadow-lg">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Avg. Contract Value</p>
            <p className="text-2xl font-black text-green-400 mt-1">₦650,000</p>
          </div>
        </div>

        {/* SEARCH & CATEGORY FILTERS */}
        <div className="bg-gray-900/90 border border-gray-800 p-6 rounded-2xl shadow-2xl space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-3.5 text-gray-500">🔍</span>
              <input
                type="text"
                placeholder="Search by trade, skill, or project keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-950 border border-gray-800 rounded-xl focus:border-amber-500 text-white placeholder-gray-500 outline-none text-sm transition"
              />
            </div>
            <select className="bg-gray-950 border border-gray-800 text-gray-300 px-4 py-3 rounded-xl text-sm font-semibold outline-none focus:border-amber-500">
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
                className={`px-4 py-2 rounded-xl text-xs font-black transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                    : 'bg-gray-800/80 text-gray-400 hover:bg-gray-800 hover:text-white'
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
              className="bg-gray-900/90 border border-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-4 hover:border-amber-500/40 transition duration-200 group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30 uppercase">
                      {job.category}
                    </span>
                    {job.urgent && (
                      <span className="bg-red-500/20 text-red-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-red-500/30 uppercase flex items-center gap-1">
                        🔥 Urgent Need
                      </span>
                    )}
                    <span className="text-xs text-gray-400">• Posted {job.postedTime}</span>
                  </div>

                  <h2 className="text-xl font-black text-white group-hover:text-amber-400 transition">
                    {job.title}
                  </h2>

                  <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                    {job.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-semibold text-gray-400 pt-1 flex-wrap">
                    <span>📍 {job.location}</span>
                    <span>
                      👤 {job.client} {job.verifiedClient && <span className="text-blue-400" title="Verified">✓ Verified</span>}
                    </span>
                    <span>📩 {job.proposalsCount} Proposals Submitted</span>
                  </div>
                </div>

                <div className="flex lg:flex-col justify-between items-end gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-800 min-w-[200px]">
                  <div className="text-left lg:text-right">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Estimated Budget</p>
                    <p className="text-xl font-black text-amber-400">{job.budget}</p>
                  </div>
                  <button className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs px-5 py-3 rounded-xl shadow-lg transition">
                    Submit Proposal
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}