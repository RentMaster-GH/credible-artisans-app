'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<'client' | 'artisan'>('client')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(true)
  const [updatingRole, setUpdatingRole] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

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
        .select('role, full_name')
        .eq('id', user.id)
        .single()

      if (profile) {
        setRole(profile.role === 'artisan' ? 'artisan' : 'client')
        setFullName(profile.full_name || '')
      }
      setLoading(false)
    }

    fetchUserData()
  }, [router, supabase])

  const handleToggleRole = async (newRole: 'client' | 'artisan') => {
    if (newRole === role || !user) return

    setUpdatingRole(true)
    setMessage(null)

    // Update profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', user.id)

    // Update user auth metadata
    await supabase.auth.updateUser({
      data: { role: newRole },
    })

    if (!profileError) {
      setRole(newRole)
      setMessage(`Switched to ${newRole === 'artisan' ? 'Artisan' : 'Client'} Mode successfully!`)
      router.refresh()
    }
    setUpdatingRole(false)
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
        <p className="text-gray-500 text-sm mb-8">Manage your profile mode, security settings, and verification status.</p>

        {message && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl font-medium">
            {message}
          </div>
        )}

        <div className="space-y-6">
          
          {/* Role Mode Switcher Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-1">Account Mode / Active Role</h2>
            <p className="text-gray-500 text-xs mb-4">
              Toggle your mode between hiring artisans as a Client or offering your services as an Artisan.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleToggleRole('client')}
                disabled={updatingRole}
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
                <p className="text-xs text-gray-500">Post jobs, review proposals, and hire skilled local artisans.</p>
              </button>

              <button
                type="button"
                onClick={() => handleToggleRole('artisan')}
                disabled={updatingRole}
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
                <p className="text-xs text-gray-500">Browse job board, submit proposals, and showcase your trade skills.</p>
              </button>
            </div>
          </div>

          {/* Identity Verification Quick Link */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">ID & Photo Verification</h2>
              <p className="text-xs text-gray-500 mt-0.5">Upload your official ID document and profile photo to get verified.</p>
            </div>
            <Link
              href="/verification"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shrink-0"
            >
              Verify Account →
            </Link>
          </div>

          {/* Customer Support Link */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">Customer Support & Suggestions</h2>
              <p className="text-xs text-gray-500 mt-0.5">Report complaints, technical issues, or share feedback with the manager.</p>
            </div>
            <Link
              href="/support"
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs px-4 py-2.5 rounded-xl transition shrink-0"
            >
              Submit Ticket →
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}