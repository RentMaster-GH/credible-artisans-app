'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Home() {
  const [status, setStatus] = useState('Checking Supabase connection...');

  useEffect(() => {
    // 1. Instantiate the client inside useEffect to avoid re-creating it every render
    const supabase = createClient();

    async function checkConnection() {
      try {
        // 2. Use auth.getSession() to test live server connection reliably
        const { error } = await supabase.auth.getSession();

        if (error) {
          setStatus(`Supabase connection error: ${error.message}`);
        } else {
          setStatus('Connected to Supabase successfully!');
        }
      } catch (err) {
        setStatus('Failed to reach Supabase. Check your URL & Anon Key.');
      }
    }

    checkConnection();
  }, []); // 3. Empty dependency array prevents infinite re-render loops

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold text-center">Credible Artisans</h1>
      <p className="mt-4 text-lg text-emerald-600 font-medium">{status}</p>
    </main>
  );
}