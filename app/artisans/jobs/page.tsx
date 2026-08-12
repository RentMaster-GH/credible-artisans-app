'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/client';

interface Job {
  id: string;
  title: string;
  category: string;
  location: string;
  budget_min: number | null;
  budget_max: number | null;
  currency: string;
  status: string;
  created_at: string;
  description?: string;
  client_id?: string;
}

// Fallback sample jobs if database table is currently empty
const SAMPLE_JOBS: Job[] = [
  {
    id: 'sample-1',
    title: 'Full Villa Electrical Rewiring & Lighting Installation',
    category: 'Electrical',
    location: 'Lekki Phase 1, Lagos',
    budget_min: 850000,
    budget_max: 1200000,
    currency: '₦',
    status: 'open',
    created_at: new Date().toISOString(),
    description: 'Looking for a certified electrical engineer/artisan to completely overhaul conduit wiring for a 5-bedroom duplex, install modern LED strip lights, and set up an inverter bypass board.',
  },
  {
    id: 'sample-2',
    title: 'Custom Modern Kitchen Cabinetry & Granite Tops',
    category: 'Carpentry',
    location: 'Ikeja GRA, Lagos',
    budget_min: 1500000,
    budget_max: 2000000,
    currency: '₦',
    status: 'open',
    created_at: new Date().toISOString(),
    description: 'Need skilled joinery artisans for high-gloss acrylic kitchen cabinets with soft-close hinges and black galaxy granite countertop fitting.',
  },
  {
    id: 'sample-3',
    title: 'Bathroom Tile Laying & Plumbing Overhaul',
    category: 'Plumbing & Tiling',
    location: 'Epe, Lagos',
    budget_min: 450000,
    budget_max: 600000,
    currency: '₦',
    status: 'open',
    created_at: new Date().toISOString(),
    description: 'Replacement of old porcelain tiles with 60x60 vitreous tiles in 3 bathrooms. Includes installing wall-hung toilets and shower glass panels.',
  },
];

export default function JobMarketplacePage() {
  const supabase = createClient();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Proposal Modal State
  const [selectedJobForBid, setSelectedJobForBid] = useState<Job | null>(null);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [bidTimeline, setBidTimeline] = useState<string>('1 Week');
  const [bidCoverLetter, setBidCoverLetter] = useState<string>('');
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);
  const [bidFeedbackMsg, setBidFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const categories = ['All', 'Electrical', 'Carpentry', 'Plumbing & Tiling', 'Masonry', 'Painting'];

  // Fetch Jobs from Supabase
  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          setJobs(data as Job[]);
        } else {
          // Fallback to sample data for visual preview
          setJobs(SAMPLE_JOBS);
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setJobs(SAMPLE_JOBS);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, [supabase]);

  // Handle Proposal Submission to Supabase
  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobForBid) return;

    setIsSubmittingBid(true);
    setBidFeedbackMsg(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setBidFeedbackMsg({ type: 'error', text: 'Please sign in to submit a proposal.' });
        setIsSubmittingBid(false);
        return;
      }

      const { error } = await (supabase.from as any)('bids').insert([
        {
          job_id: selectedJobForBid.id,
          artisan_id: user.id,
          amount: Number(bidAmount),
          proposed_timeline: bidTimeline,
          cover_letter: bidCoverLetter,
          status: 'pending',
        },
      ]);

      if (error) throw error;

      setBidFeedbackMsg({ type: 'success', text: 'Your proposal was submitted successfully!' });
      setTimeout(() => {
        setSelectedJobForBid(null);
        setBidAmount('');
        setBidCoverLetter('');
        setBidFeedbackMsg(null);
      }, 2000);
    } catch (err: any) {
      setBidFeedbackMsg({ type: 'error', text: err.message || 'Failed to submit proposal.' });
    } finally {
      setIsSubmittingBid(false);
    }
  };

  // Filtered Jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesCategory = selectedCategory === 'All' || job.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-20 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* HERO BANNER - Exact Dashboard Gradient */}
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
                Browse verified client contracts, submit competitive proposals, and win new artisan projects.
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

        {/* REAL-TIME PORTAL METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-900/80 border border-gray-800 p-5 rounded-2xl backdrop-blur-md shadow-lg">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Available Contracts</p>
            <p className="text-2xl font-black text-amber-400 mt-1">{jobs.length}</p>
          </div>

          <div className="bg-gray-900/80 border border-gray-800 p-5 rounded-2xl backdrop-blur-md shadow-lg">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Marketplace Status</p>
            <p className="text-xl font-black text-green-400 mt-1 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-ping" />
              Live Hiring
            </p>
          </div>

          <div className="bg-gray-900/80 border border-gray-800 p-5 rounded-2xl backdrop-blur-md shadow-lg">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Proposals Protection</p>
            <p className="text-xl font-black text-blue-400 mt-1">Escrow Guaranteed</p>
          </div>

          <div className="bg-gray-900/80 border border-gray-800 p-5 rounded-2xl backdrop-blur-md shadow-lg">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Active Search</p>
            <p className="text-lg font-black text-white mt-1">
              {filteredJobs.length} {filteredJobs.length === 1 ? 'Job' : 'Jobs'} Found
            </p>
          </div>
        </div>

        {/* SEARCH & INTERACTIVE CATEGORY FILTERS */}
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
        {loading ? (
          <div className="bg-gray-900/80 border border-gray-800 p-12 rounded-2xl text-center shadow-lg">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Loading marketplace jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-gray-900/80 border border-gray-800 p-12 text-center rounded-2xl shadow-lg space-y-3">
            <span className="text-4xl">📋</span>
            <h3 className="text-lg font-black text-white">No Jobs Available</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              No project listings match your search criteria. Try selecting another category or keyword.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-gray-900/90 border border-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-4 hover:border-amber-500/40 transition duration-200 group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30 uppercase">
                        {job.category || 'General'}
                      </span>
                      <span className="text-xs text-gray-400">• Posted {new Date(job.created_at).toLocaleDateString()}</span>
                    </div>

                    <h2 className="text-xl font-black text-white group-hover:text-amber-400 transition">
                      {job.title}
                    </h2>

                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                      {job.description || 'No detailed description provided.'}
                    </p>

                    <div className="flex items-center gap-4 text-xs font-semibold text-gray-400 pt-1 flex-wrap">
                      <span>📍 {job.location || 'Remote / Direct'}</span>
                      <span className="text-green-400">✓ Verified Client Contract</span>
                    </div>
                  </div>

                  <div className="flex lg:flex-col justify-between items-end gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-800 min-w-[200px]">
                    <div className="text-left lg:text-right">
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Client Budget</p>
                      <p className="text-xl font-black text-amber-400">
                        {job.currency || '₦'}{' '}
                        {job.budget_min
                          ? `${Number(job.budget_min).toLocaleString()}${job.budget_max ? ` - ${Number(job.budget_max).toLocaleString()}` : '+'}`
                          : 'Negotiable'}
                      </p>
                    </div>

                    {/* Submit Proposal Action */}
                    <button
                      onClick={() => {
                        setSelectedJobForBid(job);
                        setBidAmount(job.budget_min ? String(job.budget_min) : '');
                      }}
                      className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs px-5 py-3 rounded-xl shadow-lg transition"
                    >
                      Submit Proposal
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* PROPOSAL SUBMISSION MODAL DRAWER */}
      {selectedJobForBid && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedJobForBid(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold text-lg"
            >
              ✕
            </button>

            <div>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30 uppercase">
                Submit Proposal
              </span>
              <h2 className="text-xl font-black text-white mt-2">{selectedJobForBid.title}</h2>
              <p className="text-xs text-gray-400 mt-1">📍 {selectedJobForBid.location}</p>
            </div>

            {bidFeedbackMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-bold ${
                  bidFeedbackMsg.type === 'success'
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}
              >
                {bidFeedbackMsg.text}
              </div>
            )}

            <form onSubmit={handleSubmitProposal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                  Your Bid Amount ({selectedJobForBid.currency || '₦'})
                </label>
                <input
                  type="number"
                  required
                  placeholder="Enter proposal amount..."
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full p-3 bg-gray-950 border border-gray-800 rounded-xl text-white outline-none focus:border-amber-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                  Proposed Timeline
                </label>
                <select
                  value={bidTimeline}
                  onChange={(e) => setBidTimeline(e.target.value)}
                  className="w-full p-3 bg-gray-950 border border-gray-800 rounded-xl text-white outline-none focus:border-amber-500 text-sm"
                >
                  <option>3 Days</option>
                  <option>1 Week</option>
                  <option>2 Weeks</option>
                  <option>1 Month</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                  Cover Letter & Pitch
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain your experience, tools, and why the client should hire you..."
                  value={bidCoverLetter}
                  onChange={(e) => setBidCoverLetter(e.target.value)}
                  className="w-full p-3 bg-gray-950 border border-gray-800 rounded-xl text-white outline-none focus:border-amber-500 text-sm resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedJobForBid(null)}
                  className="w-1/2 p-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBid}
                  className="w-1/2 p-3 bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl text-xs shadow-lg transition disabled:opacity-50"
                >
                  {isSubmittingBid ? 'Submitting...' : 'Send Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}