'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'

interface Artisan {
  id: string
  full_name: string
  skills: string[] | string | null
  location: string
  hourly_rate: number | null
  rating: number | null
  bio: string | null
  avatar_url: string | null
}

const SKILLS = [
  'All Skills',
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

export default function ArtisanDirectoryPage() {
  const [artisans, setArtisans] = useState<Artisan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSkill, setSelectedSkill] = useState('All Skills')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const supabase = createClient()

    const fetchArtisans = async () => {
      setLoading(true)
      let query = supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true })

      const { data, error } = await query

      if (error) {
        console.warn('Notice fetching artisans:', error.message)
      } else {
        setArtisans(data || [])
      }
      setLoading(false)
    }

    fetchArtisans()
  }, [])

  const filteredArtisans = artisans.filter((artisan) => {
    const matchesSearch =
      artisan.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artisan.location?.toLowerCase().includes(searchTerm.toLowerCase())

    const skillsArray = Array.isArray(artisan.skills)
      ? artisan.skills
      : typeof artisan.skills === 'string'
      ? [artisan.skills]
      : []

    const matchesSkill =
      selectedSkill === 'All Skills' ||
      skillsArray.some((s) => s.toLowerCase().includes(selectedSkill.toLowerCase()))

    return matchesSearch && matchesSkill
  })

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Artisan Directory</h1>
            <p className="text-gray-500 text-sm mt-1">
              Find and hire verified local professionals for your projects.
            </p>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-96">
            <input
              type="text"
              placeholder="Search by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm outline-none transition"
            />
          </div>

          <div className="w-full md:w-72">
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm outline-none bg-white transition"
            >
              {SKILLS.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Content Layout with Sidebar Ad */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left/Main Artisan Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-20 text-gray-500 text-sm">Loading available artisans...</div>
            ) : filteredArtisans.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <p className="text-gray-600 font-medium">No artisans found.</p>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArtisans.map((artisan) => (
                  <div
                    key={artisan.id}
                    className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-700 font-bold rounded-full flex items-center justify-center text-lg">
                          {artisan.full_name ? artisan.full_name.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-gray-900">{artisan.full_name}</h2>
                          <p className="text-xs text-gray-400">📍 {artisan.location || 'Cape Coast'}</p>
                        </div>
                      </div>

                      <p className="text-gray-600 text-xs line-clamp-2 mb-4">
                        {artisan.bio || 'Professional local artisan ready for your next project.'}
                      </p>
                    </div>

                    <div className="border-t border-gray-100 pt-4 flex items-center justify-between mt-2">
                      <div>
                        <p className="text-xs text-gray-400 uppercase font-medium">Rate</p>
                        <p className="text-sm font-bold text-gray-900">
                          {artisan.hourly_rate ? `GHS ${artisan.hourly_rate}/hr` : 'Negotiable'}
                        </p>
                      </div>
                      <Link
                        href={`/artisans/${artisan.id}`}
                        className="text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-2 rounded-lg transition"
                      >
                        View Profile →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 bg-emerald-900 text-white rounded-2xl p-6 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Sponsored</span>
              <h4 className="text-lg font-bold mt-2">Are you a Skilled Artisan?</h4>
              <p className="text-xs text-emerald-100 mt-2">
                Join Credible Artisans today and get connected with clients in your area.
              </p>
              <Link
                href="/register"
                className="inline-block mt-4 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2.5 rounded-xl transition"
              >
                Register as Artisan
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}