'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    // 1. Immediate local session lookup
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        setUserRole(currentUser.user_metadata?.role || 'client')
      } else {
        setUserRole(null)
      }
      setLoading(false)
    }

    checkSession()

    // 2. Real-time auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        if (currentUser) {
          setUserRole(currentUser.user_metadata?.role || 'client')
        } else {
          setUserRole(null)
        }
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleSignOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    setUser(null)
    setUserRole(null)
    setIsDropdownOpen(false)
    setIsMobileMenuOpen(false)
    setLoading(false)
    window.location.href = '/login'
  }

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Account'
  const userInitials = displayName.slice(0, 2).toUpperCase()

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Brand Logo & Navigation Links */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <span className="bg-indigo-600 text-white font-black text-xl px-2.5 py-1 rounded-lg shadow-sm">
                CA
              </span>
              <span className="font-extrabold text-xl tracking-tight text-gray-900">
                Credible<span className="text-indigo-600">Artisans</span>
              </span>
            </Link>

            {/* Links visible ONLY to logged-in registered users */}
            {user && (
              <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
                <Link href="/artisans" className="text-gray-600 hover:text-indigo-600 transition">
                  Find Artisans
                </Link>
                <Link href="/jobs" className="text-gray-600 hover:text-indigo-600 transition">
                  Job Board
                </Link>
                <Link href="/jobs/new" className="text-gray-600 hover:text-indigo-600 transition">
                  Post a Job
                </Link>
              </div>
            )}
          </div>

          {/* Right Section: Donate & User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            
            <Link
              href="/donate"
              className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
            >
              ❤️ Donate
            </Link>

            {!loading && (
              <>
                {user ? (
                  /* USER IS LOGGED IN -> SHOW AVATAR & DROPDOWN WITH SIGN OUT */
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center space-x-3 focus:outline-none p-1 rounded-full hover:bg-gray-50 transition border border-gray-200 pr-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                        {userInitials}
                      </div>
                      <div className="text-left hidden lg:block">
                        <p className="text-xs font-semibold text-gray-900 leading-none">
                          {displayName}
                        </p>
                        <p className="text-[10px] text-gray-500 capitalize mt-0.5">
                          {userRole || 'User'}
                        </p>
                      </div>
                    </button>

                    {/* User Dropdown Menu */}
                    {isDropdownOpen && (
                      <div
                        className="origin-top-right absolute right-0 mt-2 w-52 rounded-xl shadow-lg bg-white border border-gray-100 py-1 z-50"
                        onMouseLeave={() => setIsDropdownOpen(false)}
                      >
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-[10px] font-semibold text-gray-400 uppercase">
                            Signed in as
                          </p>
                          <p className="text-xs font-medium text-gray-800 truncate mt-0.5">
                            {user.email}
                          </p>
                        </div>

                        <Link
                          href="/dashboard"
                          onClick={() => setIsDropdownOpen(false)}
                          className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                        >
                          📊 Dashboard
                        </Link>

                        <Link
                          href="/settings"
                          onClick={() => setIsDropdownOpen(false)}
                          className="block px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition"
                        >
                          ⚙️ Account Settings
                        </Link>

                        {/* Developer Admin Section (Separated cleanly) */}
                        {user.email === 'papastickle@gmail.com' && (
                          <div className="border-t border-gray-100 py-1">
                            <p className="px-4 py-1 text-[10px] font-bold text-indigo-600 uppercase">Developer Admin</p>
                            <Link
                              href="/admin/payments"
                              onClick={() => setIsDropdownOpen(false)}
                              className="block px-4 py-1.5 text-xs font-bold text-gray-700 hover:bg-indigo-50 transition"
                            >
                              💰 Payments & 10% Fee
                            </Link>
                            <Link
                              href="/admin/support"
                              onClick={() => setIsDropdownOpen(false)}
                              className="block px-4 py-1.5 text-xs font-bold text-gray-700 hover:bg-indigo-50 transition"
                            >
                              📩 Support Inbox
                            </Link>
                            <Link
                              href="/admin/verifications"
                              onClick={() => setIsDropdownOpen(false)}
                              className="block px-4 py-1.5 text-xs font-bold text-gray-700 hover:bg-indigo-50 transition"
                            >
                              🆔 ID Approvals
                            </Link>
                          </div>
                        )}

                        {/* Sign Out Section */}
                        <div className="border-t border-gray-100">
                          <button
                            onClick={handleSignOut}
                            className="w-full text-left block px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition"
                          >
                            🚪 Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-6 space-y-3">
          {user && (
            <>
              <Link href="/artisans" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-medium text-gray-700">
                Find Artisans
              </Link>
              <Link href="/jobs" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-medium text-gray-700">
                Job Board
              </Link>
              <Link href="/jobs/new" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-medium text-gray-700">
                Post a Job
              </Link>
            </>
          )}

          <Link href="/donate" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-semibold text-emerald-700">
            ❤️ Donate
          </Link>

          <div className="border-t border-gray-100 pt-3">
            {user && (
              <div className="space-y-2">
                <p className="text-xs text-gray-400">Logged in as {user.email}</p>
                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-medium text-gray-700">
                  📊 Dashboard
                </Link>
                <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-bold text-indigo-600">
                  ⚙️ Account Settings
                </Link>

                {user.email === 'papastickle@gmail.com' && (
                  <div className="border-t border-gray-100 pt-2 font-bold text-xs space-y-1 text-indigo-600">
                    <p className="text-[10px] uppercase text-gray-400">Developer Admin</p>
                    <Link href="/admin/payments" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">
                      💰 Payments & 10% Fee
                    </Link>
                    <Link href="/admin/support" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">
                      📩 Support Inbox
                    </Link>
                    <Link href="/admin/verifications" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">
                      🆔 ID Approvals
                    </Link>
                  </div>
                )}

                <button onClick={handleSignOut} className="block w-full text-left text-sm font-bold text-red-600 pt-2">
                  🚪 Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}