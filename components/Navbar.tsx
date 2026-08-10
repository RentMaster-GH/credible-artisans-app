// components/Navbar.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [fullName, setFullName] = useState<string>('')
  const [role, setRole] = useState<string>('artisan')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        const { data: profile } = await (supabase.from as any)('profiles')
          .select('full_name, role')
          .eq('id', currentUser.id)
          .single()

        if (profile) {
          setFullName(profile.full_name || 'User')
          setRole(profile.role === 'client' ? 'client' : 'artisan')
        }
      }
    }

    fetchUserData()
  }, [supabase, pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/login')
  }

  const getInitials = (name: string) => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <nav className="bg-gray-900/90 border-b border-gray-800 sticky top-0 z-50 backdrop-blur-md text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-amber-500 group-hover:bg-amber-400 rounded-xl flex items-center justify-center font-black text-black text-lg shadow-lg shadow-amber-500/20 transition">
            CA
          </div>
          <span className="font-black text-lg sm:text-xl tracking-tight text-white">
            Credible<span className="text-amber-400">Artisans</span>
          </span>
        </Link>

        {/* Middle Navigation Links */}
        <div className="hidden md:flex items-center gap-1 bg-gray-800/60 p-1 rounded-xl border border-gray-700/50">
          <Link
            href="/dashboard"
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              pathname === '/dashboard' ? 'bg-amber-500 text-black shadow-sm' : 'text-gray-300 hover:text-white'
            }`}
          >
            📊 Portal Dashboard
          </Link>

          <Link
            href="/jobs"
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              pathname?.startsWith('/jobs') ? 'bg-amber-500 text-black shadow-sm' : 'text-gray-300 hover:text-white'
            }`}
          >
            📋 Job Marketplace
          </Link>

          <Link
            href="/artisans/boq"
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              pathname?.startsWith('/artisans/boq') ? 'bg-amber-500 text-black shadow-sm' : 'text-gray-300 hover:text-white'
            }`}
          >
            📐 BOQ Generator
          </Link>
        </div>

        {/* Right Side User Profile / Dropdown */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 focus:outline-none bg-gray-800/80 hover:bg-gray-800 border border-gray-700/70 py-1.5 px-3 rounded-2xl transition shadow-md"
              >
                <div className="w-8 h-8 bg-amber-500 text-black font-extrabold rounded-xl flex items-center justify-center text-xs shadow-md">
                  {getInitials(fullName)}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-white leading-tight">{fullName || 'Account'}</p>
                  <p className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold">
                    {role === 'artisan' ? '🛠️ Artisan' : '👤 Client'}
                  </p>
                </div>
                <span className="text-xs text-gray-400">▼</span>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-800 text-white rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in duration-200">
                  <div className="px-4 py-2.5 border-b border-gray-800">
                    <p className="text-xs font-bold text-white">{fullName}</p>
                    <p className="text-[10px] text-amber-400 uppercase font-semibold mt-0.5">
                      {role === 'artisan' ? '🛠️ Artisan Mode' : '👤 Client Mode'}
                    </p>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-xs font-medium text-gray-300 hover:bg-gray-800 hover:text-amber-400 transition"
                  >
                    📊 Portal Dashboard
                  </Link>
                  
                  <Link
                    href="/jobs"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-xs font-medium text-gray-300 hover:bg-gray-800 hover:text-amber-400 transition"
                  >
                    📋 Job Marketplace
                  </Link>

                  <Link
                    href="/artisans/boq"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-xs font-medium text-gray-300 hover:bg-gray-800 hover:text-amber-400 transition"
                  >
                    📐 BOQ Generator
                  </Link>

                  <button
                    onClick={() => {
                      setDropdownOpen(false)
                      handleLogout()
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition border-t border-gray-800 mt-1 pt-2"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-black px-4 py-2 rounded-xl transition shadow"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  )
}