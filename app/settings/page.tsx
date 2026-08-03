'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import { WORLD_COUNTRIES } from '@/lib/countries'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<'client' | 'artisan'>('client')
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [country, setCountry] = useState('Ghana')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setRole(profile.role === 'artisan' ? 'artisan' : 'client')
        setFullName(profile.full_name || '')
        setPhoneNumber(profile.phone_number || '')
        setCountry(user.user_metadata?.location || 'Ghana')
        setAvatarUrl(profile.avatar_url || null)
      }
      setLoading(false)
    }

    fetchUserData()
  }, [router, supabase])

  // Save General Profile Details
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    setMessage(null)
    setErrorMsg(null)

    // 1. Update user auth metadata (saves country)
    await supabase.auth.updateUser({
      data: { location: country, full_name: fullName }
    })

    // 2. Update profiles table
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: fullName,
        role: role,
        phone_number: phoneNumber,
        avatar_url: avatarUrl,
      } as any)

    if (error) {
      setErrorMsg(error.message)
    } else {
      setMessage('Profile settings updated successfully!')
      router.refresh()
    }
    setUpdating(false)
  }

  // Toggle Mode (Client <-> Artisan)
  const handleToggleRole = async (newRole: 'client' | 'artisan') => {
    if (newRole === role || !user) return
    setUpdating(true)

    await supabase.from('profiles').upsert({ id: user.id, role: newRole } as any)
    await supabase.auth.updateUser({ data: { role: newRole } })

    setRole(newRole)
    setMessage(`Switched to ${newRole === 'artisan' ? 'Artisan' : 'Client'} Mode!`)
    setUpdating(false)
    router.refresh()
  }

  // Handle Photo Upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be under 2MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setAvatarUrl(result)
    }
    reader.readAsDataURL(file)
  }

  // Delete / Remove Profile Picture
  const handleDeleteAvatar = async () => {
    if (!confirm('Are you sure you want to remove your profile picture?')) return
    setAvatarUrl(null)
    await supabase.from('profiles').update({ avatar_url: null } as any).eq('id', user.id)
    setMessage('Profile picture removed.')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-20 text-gray-500 text-sm">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Account Settings</h1>
        <p className="text-gray-500 text-sm mb-8">Manage your profile details, photo, mode switcher, and support tickets.</p>

        {message && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl font-medium">
            {message}
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {errorMsg}
          </div>
        )}

        <div className="space-y-6">
          
          {/* 1. Profile Picture Management Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-4">Profile Picture</h2>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-3xl overflow-hidden border-2 border-indigo-200 flex-shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  fullName.charAt(0) || 'U'
                )}
              </div>

              <div className="space-y-2 text-center sm:text-left">
                <div className="flex items-center gap-3 justify-center sm:justify-start">
                  <label className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition cursor-pointer shadow-sm">
                    Upload New Picture
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  </label>

                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={handleDeleteAvatar}
                      className="bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs px-4 py-2 rounded-xl transition"
                    >
                      Delete Picture
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-gray-400">JPG, PNG or GIF. Max size 2MB.</p>
              </div>
            </div>
          </div>

          {/* 2. Account Mode Switcher Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-1">Account Mode / Active Role</h2>
            <p className="text-gray-500 text-xs mb-4">
              Toggle your mode between hiring artisans as a Client or offering your services as an Artisan.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleToggleRole('client')}
                disabled={updating}
                className={`p-4 rounded-xl border text-left transition ${
                  role === 'client'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-gray-900">Client Mode</span>
                  {role === 'client' && <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded font-bold">Active</span>}
                </div>
                <p className="text-xs text-gray-500">Post jobs, review proposals, and hire artisans.</p>
              </button>

              <button
                type="button"
                onClick={() => handleToggleRole('artisan')}
                disabled={updating}
                className={`p-4 rounded-xl border text-left transition ${
                  role === 'artisan'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-gray-900">Artisan Mode</span>
                  {role === 'artisan' && <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded font-bold">Active</span>}
                </div>
                <p className="text-xs text-gray-500">Browse job board, submit proposals, and showcase skills.</p>
              </button>
            </div>
          </div>

          {/* 3. Personal Information Form */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-4">Personal Details</h2>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Country / Location</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  {WORLD_COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={updating}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition shadow-sm"
                >
                  {updating ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* 4. Customer Support, Complaints & Suggestions */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">Customer Support & Suggestions</h2>
              <p className="text-xs text-gray-500 mt-0.5">Submit complaints, technical issues, or platform feedback.</p>
            </div>
            <Link
              href="/support"
              className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs px-4 py-2.5 rounded-xl transition shrink-0"
            >
              Submit Complaint / Suggestion →
            </Link>
          </div>

          {/* 5. ID Verification Upload */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">ID Verification</h2>
              <p className="text-xs text-gray-500 mt-0.5">Upload official ID document to receive a verified badge.</p>
            </div>
            <Link
              href="/verification"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shrink-0"
            >
              Verify Account →
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}