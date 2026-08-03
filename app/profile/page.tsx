'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'

const SKILLS = [
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

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Form states
  const [profileData, setProfileData] = useState({
    full_name: '',
    phone_number: '',
    avatar_url: '',
    role: 'client',
  })

  const [artisanData, setArtisanData] = useState({
    business_name: '',
    primary_skill: SKILLS[0],
    bio: '',
    experience_years: '0',
    hourly_rate: '',
    location: '',
  })

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true)
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        router.push('/login')
        return
      }

      setUserId(user.id)

      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setProfileData({
          full_name: profile.full_name || '',
          phone_number: profile.phone_number || '',
          avatar_url: profile.avatar_url || '',
          role: profile.role || 'client',
        })
      }

      // If artisan, fetch artisan details
      const { data: artisan, error: artisanError } = await supabase
        .from('artisans')
        .select('*')
        .eq('id', user.id)
        .single()

      if (artisan) {
        setArtisanData({
          business_name: artisan.business_name || '',
          primary_skill: artisan.primary_skill || SKILLS[0],
          bio: artisan.bio || '',
          experience_years: artisan.experience_years?.toString() || '0',
          hourly_rate: artisan.hourly_rate?.toString() || '',
          location: artisan.location || '',
        })
      }

      setLoading(false)
    }

    fetchUserData()
  }, [router, supabase])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    })
  }

  const handleArtisanChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setArtisanData({
      ...artisanData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!userId) return

    // 1. Update Profile
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({
        full_name: profileData.full_name.trim(),
        phone_number: profileData.phone_number.trim(),
        avatar_url: profileData.avatar_url.trim(),
        role: profileData.role,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (profileUpdateError) {
      setErrorMsg(profileUpdateError.message || 'Failed to update profile details.')
      setSaving(false)
      return
    }

    // 2. If role is artisan, ensure artisan row exists/updates
    if (profileData.role === 'artisan') {
      const artisanPayload = {
        id: userId,
        business_name: artisanData.business_name.trim(),
        primary_skill: artisanData.primary_skill,
        bio: artisanData.bio.trim(),
        experience_years: parseInt(artisanData.experience_years) || 0,
        hourly_rate: artisanData.hourly_rate ? parseFloat(artisanData.hourly_rate) : null,
        location: artisanData.location.trim() || 'Global',
        updated_at: new Date().toISOString(),
      }

      const { error: artisanUpsertError } = await supabase
        .from('artisans')
        .upsert(artisanPayload)

      if (artisanUpsertError) {
        setErrorMsg(artisanUpsertError.message || 'Failed to update artisan portfolio details.')
        setSaving(false)
        return
      }
    }

    setSuccessMsg('Profile successfully updated!')
    setSaving(false)
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-20 text-gray-500 text-sm">Loading your profile...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Profile Card Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-10">
          <div className="border-b border-gray-100 pb-5 mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Account & Profile Settings</h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage your personal credentials, switch roles, or update your professional artisan portfolio.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* SECTION 1: Personal Details */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                1. Personal Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-semibold text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    required
                    value={profileData.full_name}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone_number" className="block text-sm font-semibold text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      id="phone_number"
                      name="phone_number"
                      value={profileData.phone_number}
                      onChange={handleProfileChange}
                      placeholder="+233 ... or +1 ..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none transition"
                    />
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-1">
                      Account Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={profileData.role}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none bg-white transition"
                    >
                      <option value="client">Client (Post Jobs & Hire)</option>
                      <option value="artisan">Artisan (Offer Skills & Submit Bids)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="avatar_url" className="block text-sm font-semibold text-gray-700 mb-1">
                    Avatar Image URL
                  </label>
                  <input
                    type="url"
                    id="avatar_url"
                    name="avatar_url"
                    value={profileData.avatar_url}
                    onChange={handleProfileChange}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: Artisan Professional Portfolio (Conditional) */}
            {profileData.role === 'artisan' && (
              <div className="pt-4 animate-fadeIn">
                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                  <span>2. Artisan Portfolio Details</span>
                  <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">
                    Directory Enabled
                  </span>
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="business_name" className="block text-sm font-semibold text-gray-700 mb-1">
                        Business or Shop Name
                      </label>
                      <input
                        type="text"
                        id="business_name"
                        name="business_name"
                        value={artisanData.business_name}
                        onChange={handleArtisanChange}
                        placeholder="e.g., Kofi's Woodwork & Carpentry"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none transition"
                      />
                    </div>

                    <div>
                      <label htmlFor="primary_skill" className="block text-sm font-semibold text-gray-700 mb-1">
                        Primary Trade Skill <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="primary_skill"
                        name="primary_skill"
                        value={artisanData.primary_skill}
                        onChange={handleArtisanChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none bg-white transition"
                      >
                        {SKILLS.map((skill) => (
                          <option key={skill} value={skill}>
                            {skill}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="experience_years" className="block text-sm font-semibold text-gray-700 mb-1">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        id="experience_years"
                        name="experience_years"
                        min="0"
                        value={artisanData.experience_years}
                        onChange={handleArtisanChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none transition"
                      />
                    </div>

                    <div>
                      <label htmlFor="hourly_rate" className="block text-sm font-semibold text-gray-700 mb-1">
                        Hourly Rate (USD / Base)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        id="hourly_rate"
                        name="hourly_rate"
                        min="0"
                        value={artisanData.hourly_rate}
                        onChange={handleArtisanChange}
                        placeholder="e.g., 25"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none transition"
                      />
                    </div>

                    <div>
                      <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-1">
                        Base Location <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        required={profileData.role === 'artisan'}
                        value={artisanData.location}
                        onChange={handleArtisanChange}
                        placeholder="e.g., Cape Coast, Ghana"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="bio" className="block text-sm font-semibold text-gray-700 mb-1">
                      Professional Bio & Experience Overview
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      value={artisanData.bio}
                      onChange={handleArtisanChange}
                      placeholder="Describe your craftsmanship, specialized machinery, past projects, or workshop capabilities..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none transition"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 flex items-center justify-end space-x-4 border-t border-gray-100">
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm disabled:opacity-50 transition"
              >
                {saving ? 'Saving Changes...' : 'Save Profile'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}