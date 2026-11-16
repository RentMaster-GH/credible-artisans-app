'use server'

import { redirect } from 'next/navigation'

export async function signIn(_formData: FormData) {
  // Authentication is handled client-side via @/lib/backend (localStorage JWTs).
  // Redirect to the login screen so the client SDK manages session tokens.
  redirect('/login')
}
