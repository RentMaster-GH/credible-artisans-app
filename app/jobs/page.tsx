'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'

interface Job {
  id: string
  client_id: string | null
  title: string
  description: string | null
  category: string
  location: string
  budget_min: number | null
  budget_max: number | null
  currency: string
  status: string
  created_at: string
  updated_at: string | null
}

const CATEGORIES = [
  'All Categories',
  'Carpentry & Woodwork',
  'Welding & Fabrication',
  'Plumbing & Piping',
  'Electrical Installation',
  'Masonry & Construction',
  'Painting & Decorating',
  'Roofing & Ceiling',
  'Solar & Inverter Setup',
  'Tiling & Flooring',
  'General Maintenance',
]

export default function JobBoardPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [searchTerm, setSearchTerm] = useState('')

  const supabase = createClient()

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true)
      let query = supabase
        .from('jobs')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })

      if (selectedCategory !== 'All Categories') {
        query = query.eq('category', selectedCategory)
      }

      const { data, error } = await query

      if (error) {
        // Safe handling without crashing Next.js dev overlay
        console.warn('Notice fetching jobs:', error.message)
      } else {
        setJobs((data as unknown as Job[]) || [])
      }
      setLoading(false)
    }

    fetchJobs()
  }, [selectedCategory, supabase])

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Global Job Board</h1>
            <p className="text-gray-500 text-sm mt-1">
              Browse active client requests and submit custom proposals to win projects.
            </p>
          </div>
          <Link
            href="/jobs/new"
            className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-sm transition"
          >
            + Post a New Job
          </Link>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-96">
            <input
              type="text"
              placeholder="Search by title or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm outline-none transition"
            />
          </div>

          <div className="w-full md:w-72">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm outline-none bg-white transition"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Job Listings Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 text-sm">Loading active job listings...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <p className="text-gray-600 font-medium">No job requests found.</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-emerald-200 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="bg-emerald-50 text-emerald-700 font-semibold text-xs px-2.5 py-1 rounded-full">
                      {job.category}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-gray-900 line-clamp-2 mb-2">
                    {job.title}
                  </h2>

                  <p className="text-gray-500 text-xs flex items-center gap-1 mb-4">
                    📍 {job.location}
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-4 flex items-center justify-between mt-2">
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-medium">Estimated Budget</p>
                    <p className="text-sm font-bold text-gray-900">
                      {job.budget_min !== null || job.budget_max !== null ? (
                        <>
                          {job.currency || 'GHS'} {job.budget_min ?? '0'} {job.budget_max ? `- ${job.budget_max}` : '+'}
                        </>
                      ) : (
                        'Open Budget'
                      )}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600 hover:text-emerald-800">
                    View & Bid →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}