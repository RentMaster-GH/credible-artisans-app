'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
      }
      setLoading(false)
    }
    checkUser()
  }, [supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 text-sm">
        Loading Credible Artisans...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-gray-900 to-indigo-950 text-white flex flex-col justify-between">
      
      {/* Top Navbar Header */}
      <header className="max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🛠️</span>
          <span className="font-extrabold text-lg tracking-tight">Credible Artisans</span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <Link
              href="/artisans"
              className="bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-sm"
            >
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs font-semibold text-gray-300 hover:text-white transition px-3 py-2"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Hero Content */}
      <main className="max-w-4xl mx-auto px-6 text-center py-16">
        <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full inline-block mb-6">
          Verified Local Professionals
        </span>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
          Find Trusted Artisans <br />
          <span className="text-emerald-400">Right in Your Neighborhood</span>
        </h1>
        <p className="text-gray-300 text-sm sm:text-base mt-6 max-w-2xl mx-auto leading-relaxed">
          Connect with skilled carpenters, electricians, plumbers, masons, and more. Hire with confidence or offer your professional services.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          {user ? (
            <Link
              href="/artisans"
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm px-8 py-3.5 rounded-xl transition shadow-lg"
            >
              Enter Marketplace Directory →
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm px-8 py-3.5 rounded-xl transition shadow-lg"
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm px-8 py-3.5 rounded-xl transition backdrop-blur-sm"
              >
                Log In to Account
              </Link>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto px-6 py-6 border-t border-white/10 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} Credible Artisans. All rights reserved.
      </footer>

    </div>
  )
}
