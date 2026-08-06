'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
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

  // Current User & Settings Drawer States
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<Artisan | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsMsg, setSettingsMsg] = useState<string | null>(null)

  // Quick-Settings Form States for logged-in Artisan
  const [isAvailable, setIsAvailable] = useState(true)
  const [hourlyRate, setHourlyRate] = useState<string>('')
  const [bio, setBio] = useState<string>('')

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchSessionAndData = async () => {
      setLoading(true)

      // 1. Check logged-in user session
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        // Fetch specific profile data for quick settings drawer
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single()

        if (profileData) {
          const typedProfile = profileData as unknown as Artisan
          setUserProfile(typedProfile)
          setIsAvailable(typedProfile.is_available ?? true)
          setHourlyRate(typedProfile.hourly_rate ? typedProfile.hourly_rate.toString() : '')
          setBio(typedProfile.bio || '')
        }
      }

      // 2. Fetch all artisans for the directory
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true })

      if (error) {
        console.warn('Notice fetching artisans:', error.message)
      } else {
        setArtisans((data as unknown as Artisan[]) || [])
      }
      setLoading(false)
    }

    fetchSessionAndData()
  }, [supabase])

  // Handle Logout action
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserProfile(null)
    router.push('/login')
  }

  // Handle Quick-Settings Form Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSavingSettings(true)
    setSettingsMsg(null)

    const { error } = await (supabase.from('profiles') as any)
      .update({
        is_available: isAvailable,
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
        bio: bio.trim(),
      })
      .eq('id', user.id)

    if (error) {
      setSettingsMsg('Failed to update settings: ' + error.message)
    } else {
      setSettingsMsg('Settings updated successfully!')
      // Refresh local directory data list
      const { data } = await supabase.from('profiles').select('*').order('full_name', { ascending: true })
      if (data) setArtisans(data as unknown as Artisan[])
    }
    setSavingSettings(false)
  }

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
        
        {/* Header Section & Quick-Settings Button (Visible if logged in) */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Artisan Directory</h1>
            <p className="text-gray-500 text-sm mt-1">
              Find and hire verified local professionals for your projects.
            </p>
          </div>

          {user && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-sm"
              >
                ⚙️ Artisan Quick Settings
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-red-50 hover:text-red-600 text-gray-700 font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-sm"
              >
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Account Management Quick-Settings Drawer / Panel */}
        {isSettingsOpen && user && (
          <div className="bg-white rounded-2xl border border-indigo-100 shadow-md p-6 mb-8 transition animate-fadeIn">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Account Quick-Settings</h3>
                <p className="text-xs text-gray-500">Manage your directory status and public profile information.</p>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            {settingsMsg && (
              <div className={`mb-4 p-3 text-xs rounded-xl ${settingsMsg.includes('success') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {settingsMsg}
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Availability Toggle */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Directory Status</label>
                <div className="flex items-center space-x-3 mt-2">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-xs font-medium text-gray-800">
                    {isAvailable ? '🟢 Active & Accepting Jobs' : '🔴 Away / Inactive'}
                  </span>
                </div>
              </div>

              {/* Hourly Rate */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Hourly Rate (GHS)</label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Bio summary */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Short Bio</label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Professional description..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="md:col-span-3 flex justify-end">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-sm"
                >
                  {savingSettings ? 'Saving changes...' : 'Save Quick Settings'}
                </button>
              </div>
            </form>
          </div>
        )}

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
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 font-bold rounded-full flex items-center justify-center text-lg">
                            {artisan.full_name ? artisan.full_name.charAt(0).toUpperCase() : 'A'}
                          </div>
                          <div>
                            <h2 className="text-base font-bold text-gray-900">{artisan.full_name}</h2>
                            <p className="text-xs text-gray-400">📍 {artisan.location || 'Cape Coast'}</p>
                          </div>
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
                href="/signup"
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