'use client'

import { useEffect, useState, use } from 'react'
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
  is_available?: boolean
  role?: string | null
  client_company?: string | null
  client_phone?: string | null
}

export default function ArtisanProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const id = resolvedParams.id

  const [artisan, setArtisan] = useState<Artisan | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchArtisanProfile = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        // Fallback or handle missing profiles gracefully
        console.warn('Error fetching profile:', error?.message)
      } else {
        setArtisan(data as unknown as Artisan)
      }
      setLoading(false)
    }

    if (id) {
      fetchArtisanProfile()
    }
  }, [id, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-24 text-gray-500 text-sm">Loading profile details...</div>
      </div>
    )
  }

  if (!artisan) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-24 text-center">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Artisan Profile</h2>
            <p className="text-gray-500 text-sm mb-6">
              This profile details page is currently setting up, or the user record is a placeholder.
            </p>
            <Link
              href="/artisans"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition shadow-sm"
            >
              ← Return to Artisan Directory
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const skillsArray = Array.isArray(artisan.skills)
    ? artisan.skills
    : typeof artisan.skills === 'string'
    ? [artisan.skills]
    : []

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        <Link
          href="/artisans"
          className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 mb-6"
        >
          ← Back to Directory
        </Link>

        {/* Profile Card Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 font-bold rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                {artisan.full_name ? artisan.full_name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900">{artisan.full_name || 'Unnamed Artisan'}</h1>
                <p className="text-xs text-gray-500 mt-1">📍 {artisan.location || 'Cape Coast, Ghana'}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-100">
                    {artisan.is_available !== false ? '🟢 Available for Hire' : '🔴 Currently Unavailable'}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right bg-gray-50 p-4 rounded-xl border border-gray-100 w-full sm:w-auto">
              <p className="text-xs text-gray-400 uppercase font-medium">Hourly Rate</p>
              <p className="text-lg font-extrabold text-gray-900 mt-0.5">
                {artisan.hourly_rate ? `GHS ${artisan.hourly_rate} / hr` : 'Negotiable'}
              </p>
            </div>
          </div>

          {/* Bio Section */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Professional Biography</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              {artisan.bio || 'This artisan has not added a detailed biography yet, but they are verified and ready to assist with your projects.'}
            </p>
          </div>

          {/* Skills Section */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Skills & Expertise</h3>
            {skillsArray.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skillsArray.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-xl border border-indigo-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-xs italic">General maintenance and repair services.</p>
            )}
          </div>

          {/* Action / Hire Button */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              Mention <span className="font-semibold text-gray-800">Credible Artisans</span> when reaching out.
            </p>
            <a
              href={`mailto:support@credibleartisans.com?subject=Hiring Inquiry for ${encodeURIComponent(artisan.full_name || 'Artisan')}`}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-sm text-center"
            >
              Contact / Hire Artisan ✉️
            </a>
          </div>

        </div>

      </div>
    </div>
  )
}