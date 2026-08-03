import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'

// Export createClient function for components using createClient()
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Export pre-initialized supabase instance for components using supabase.from(...)
export const supabase = createClient()