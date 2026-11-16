'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(
      'Self-service password resets are managed by the platform administrator on the custom backend. Please contact support@credibleartisans.com if you need your password reset.'
    )
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-md mx-auto pt-16 px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <h1 className="text-2xl font-extrabold text-gray-900 text-center mb-2">Set New Password</h1>
          <p className="text-gray-500 text-xs text-center mb-6">Enter your new secure password below.</p>

          {message && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl">
              {message}
            </div>
          )}

          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm transition shadow-sm"
            >
              {loading ? 'Processing...' : 'Save New Password'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            <Link href="/login" className="text-indigo-600 font-bold hover:underline">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
