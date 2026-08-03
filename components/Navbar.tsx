'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // 1. Check initial user session
    const getUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        // Fetch role metadata from profile or auth metadata
        const role = currentUser.user_metadata?.role || 'client'
        setUserRole(role)
      }
      setLoading(false)
    }

    getUserSession()

    // 2. Listen to real-time auth state changes
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
    await supabase.auth.signOut()
    setIsDropdownOpen(false)
    setIsMobileMenuOpen(false)
    router.push('/login')
    router.refresh()
  }

  // Get user display name or fallback to email prefix
  const displayName =
    user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Account'
  const userInitials = displayName.slice(0, 2).toUpperCase()

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Brand Logo & Main Navigation Links */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <span className="bg-indigo-600 text-white font-black text-xl px-2.5 py-1 rounded-lg shadow-sm">
                CA
              </span>
              <span className="font-extrabold text-xl tracking-tight text-gray-900">
                Credible<span className="text-indigo-600">Artisans</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <Link
                href="/artisans"
                className="text-gray-600 hover:text-indigo-600 transition"
              >
                Find Artisans
              </Link>
              <Link
                href="/jobs"
                className="text-gray-600 hover:text-indigo-600 transition"
              >
                Job Board
              </Link>
              <Link
                href="/jobs/new"
                className="text-gray-600 hover:text-indigo-600 transition"
              >
                Post a Job
              </Link>
            </div>
          </div>

          {/* Right Section: Auth State & Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {!loading && (
              <>
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center space-x-3 focus:outline-none p-1 rounded-full hover:bg-gray-50 transition"
                    >
                      <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                        {userInitials}
                      </div>
                      <div className="text-left hidden lg:block">
                        <p className="text-sm font-semibold text-gray-900 leading-none">
                          {displayName}
                        </p>
                        <p className="text-xs text-gray-500 capitalize mt-0.5">
                          {userRole || 'User'}
                        </p>
                      </div>
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* User Dropdown Menu */}
                    {isDropdownOpen && (
                      <div
                        className="origin-top-right absolute right-0 mt-2 w-52 rounded-xl shadow-lg bg-white border border-gray-100 py-1 z-50"
                        onMouseLeave={() => setIsDropdownOpen(false)}
                      >
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-xs font-semibold text-gray-400 uppercase">
                            Signed in as
                          </p>
                          <p className="text-xs font-medium text-gray-800 truncate mt-0.5">
                            {user.email}
                          </p>
                        </div>

                        <Link
                          href="/dashboard"
                          onClick={() => setIsDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/profile"
                          onClick={() => setIsDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                        >
                          Edit Profile
                        </Link>

                        <div className="border-t border-gray-100">
                          <button
                            onClick={handleSignOut}
                            className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                          >
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link
                      href="/login"
                      className="text-sm font-medium text-gray-700 hover:text-indigo-600 px-3 py-2 transition"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/login?signup=true"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/artisans"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-base font-medium text-gray-700 hover:text-indigo-600"
          >
            Find Artisans
          </Link>
          <Link
            href="/jobs"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-base font-medium text-gray-700 hover:text-indigo-600"
          >
            Job Board
          </Link>
          <Link
            href="/jobs/new"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-base font-medium text-gray-700 hover:text-indigo-600"
          >
            Post a Job
          </Link>

          <div className="border-t border-gray-100 pt-3">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    {userInitials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-sm font-medium text-gray-700 hover:text-indigo-600"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left text-sm font-medium text-red-600"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  href="/login?signup=true"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}