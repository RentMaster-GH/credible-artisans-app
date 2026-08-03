'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'

interface ArtisanDetail {
  id: string
  business_name: string | null
  primary_skill: string
  bio: string | null
  experience_years: number
  hourly_rate: number | null
  location: string
  verified: boolean
  rating: number
  jobs_completed: number
  profiles: {
    full_name: string
    avatar_url: string | null
    phone_number: string | null
  }
}

export default function ArtisanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const artisanId = resolvedParams.id

  const [artisan, setArtisan] = useState<ArtisanDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const fetchArtisan = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('artisans')
        .select(`
          *,
          profiles:id (
            full_name,
            avatar_url,
            phone_number
          )
        `)
        .eq('id', artisanId)
        .single()

      if (error) {
        console.error('Error fetching artisan profile:', error)
      } else {
        setArtisan(data)
      }
      setLoading(false)
    }

    fetchArtisan()
  }, [artisanId, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-20 text-gray-500 text-sm">Loading artisan profile...</div>
      </div>
    )
  }

  if (!artisan) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Artisan Not Found</h1>
          <p className="text-gray-500 mt-2">The requested artisan profile could not be located.</p>
          <Link href="/artisans" className="mt-6 inline-block text-indigo-600 font-medium">
            ← Return to Artisan Directory
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Breadcrumb */}
        <Link href="/artisans" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 mb-6">
          ← Back to Artisan Directory
        </Link>

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-10 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-gray-100">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-3xl overflow-hidden border-2 border-indigo-200 flex-shrink-0">
                {artisan.profiles?.avatar_url ? (
                  <img src={artisan.profiles.avatar_url} alt={artisan.profiles?.full_name} className="w-full h-full object-cover" />
                ) : (
                  artisan.profiles?.full_name?.charAt(0) || 'A'
                )}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
                  {artisan.profiles?.full_name}
                  {artisan.verified && (
                    <span className="text-blue-600 text-xs bg-blue-50 px-2 py-0.5 rounded font-semibold" title="Verified Professional">
                      ✓ Verified
                    </span>
                  )}
                </h1>
                {artisan.business_name && (
                  <p className="text-sm text-gray-600 font-medium mt-0.5">{artisan.business_name}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">📍 {artisan.location}</p>
              </div>
            </div>

            <div className="text-left sm:text-right bg-gray-50 p-4 rounded-xl border border-gray-100 w-full sm:w-auto">
              <p className="text-xs text-gray-400 uppercase font-medium">Hourly Rate</p>
              <p className="text-xl font-extrabold text-indigo-600 mt-0.5">
                {artisan.hourly_rate ? `$${artisan.hourly_rate}/hr` : 'Negotiable'}
              </p>
            </div>
          </div>

          {/* Key Stats Bar */}
          <div className="grid grid-cols-3 gap-4 py-6 border-b border-gray-100 text-center">
            <div>
              <p className="text-xs text-gray-400 uppercase font-medium">Primary Skill</p>
              <p className="text-sm font-bold text-gray-900 mt-1">{artisan.primary_skill}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-medium">Experience</p>
              <p className="text-sm font-bold text-gray-900 mt-1">{artisan.experience_years} Years</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-medium">Rating & Jobs</p>
              <p className="text-sm font-bold text-amber-600 mt-1">
                ★ {artisan.rating ? artisan.rating.toFixed(1) : 'New'} ({artisan.jobs_completed} completed)
              </p>
            </div>
          </div>

          {/* Bio Section */}
          <div className="pt-6">
            <h3 className="text-base font-bold text-gray-900 mb-2">Professional Biography</h3>
            <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">
              {artisan.bio || 'Experienced artisan specializing in professional fabrication, woodwork, installation, and custom project execution.'}
            </p>
          </div>

        </div>

      </div>
    </div>
  )
}