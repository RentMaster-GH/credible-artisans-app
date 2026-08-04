'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient()

      // 1. Listen for real-time auth state change from Google redirect
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const user = session.user
          const googleName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split('@')[0] ||
            'Valued User'
          const googleRole = user.user_metadata?.role || 'client'

          // Auto-create/sync profiles row
          await supabase.from('profiles').upsert({
            id: user.id,
            full_name: googleName,
            role: googleRole,
          } as any)

          // Hard redirect to dashboard to force Navbar session reload
          window.location.href = '/dashboard'
        }
      })

      // 2. Immediate session check fallback
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const user = session.user
        const googleName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split('@')[0] ||
          'Valued User'
        const googleRole = user.user_metadata?.role || 'client'

        await supabase.from('profiles').upsert({
          id: user.id,
          full_name: googleName,
          role: googleRole,
        } as any)

        window.location.href = '/dashboard'
      }

      return () => {
        subscription.unsubscribe()
      }
    }

    handleAuthCallback()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center max-w-sm w-full">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-lg font-bold text-gray-900">Completing Google Sign In...</h2>
        <p className="text-xs text-gray-500 mt-1">Authenticating your account and opening your dashboard.</p>
      </div>
    </div>
  )
}