'use client';

import React, { useState } from 'react';

// Sample Job Data
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
    description: 'Looking for a certified electrical engineer/artisan to completely overhaul the conduit wiring for a 5-bedroom duplex, install modern LED strip lights, and set up an inverter bypass board.',
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
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      {/* Top Header & Stats */}
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-2">
              🛠️ Artisan Portal
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Job Marketplace</h1>
            <p className="text-gray-500 mt-1">Discover verified client projects looking for expert trade professionals.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-white border border-gray-200 text-gray-700 font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:bg-gray-50 transition">
              🔖 Saved Jobs (4)
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition">
              ⚡ Instant Alert Settings
            </button>
          </div>
        </div>

        {/* Quick Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Available Jobs</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">128</h3>
            </div>
            <span className="p-3 bg-blue-50 text-blue-600 rounded-xl text-xl">📋</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Urgent Requests</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">14</h3>
            </div>
            <span className="p-3 bg-amber-50 text-amber-600 rounded-xl text-xl">🔥</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Active Bids Submitted</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">5</h3>
            </div>
            <span className="p-3 bg-purple-50 text-purple-600 rounded-xl text-xl">🚀</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Avg. Project Budget</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">₦650k</h3>
            </div>
            <span className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-xl">💰</span>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-3.5 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search by trade, skill, or project keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition outline-none text-sm"
              />
            </div>
            <select className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-xl text-sm outline-none">
              <option>📍 All Locations (Lagos, Abuja...)</option>
              <option>Lagos Island</option>
              <option>Lagos Mainland</option>
              <option>Abuja FCT</option>
            </select>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Job Listings Feed */}
        <div className="space-y-4">
          {JOBS_DATA.map((job) => (
            <div
              key={job.id}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition duration-200 group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                      {job.category}
                    </span>
                    {job.urgent && (
                      <span className="bg-red-50 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1">
                        🔥 Urgent Need
                      </span>
                    )}
                    <span className="text-xs text-gray-400">• Posted {job.postedTime}</span>
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition">
                    {job.title}
                  </h2>

                  <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-medium text-gray-500 pt-2 flex-wrap">
                    <span className="flex items-center gap-1">📍 {job.location}</span>
                    <span className="flex items-center gap-1">
                      👤 {job.client} {job.verifiedClient && <span className="text-blue-500" title="Verified Client">✓ Verified</span>}
                    </span>
                    <span className="flex items-center gap-1">📩 {job.proposalsCount} Quotes Submitted</span>
                  </div>
                </div>

                {/* Right Side: Budget & CTA */}
                <div className="flex lg:flex-col justify-between items-end gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100 min-w-[200px]">
                  <div className="text-left lg:text-right">
                    <p className="text-xs text-gray-400 font-medium uppercase">Budget Range</p>
                    <p className="text-lg font-extrabold text-emerald-600">{job.budget}</p>
                  </div>
                  <div className="flex items-center gap-2 w-full lg:w-auto">
                    <button className="flex-1 lg:flex-none bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition shadow-sm">
                      Submit Proposal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}