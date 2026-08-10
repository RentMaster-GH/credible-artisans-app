// app/page.tsx
'use client';

import { AuthScreen } from '@/components/auth/AuthScreen';

export default function HomePage() {
  // Renders the Master AuthScreen immediately on the home page (Create Account mode)
  return <AuthScreen initialIsSignUp={true} />;
}