'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Home() {
  const [status, setStatus] = useState('Checking Supabase connection...');
  const supabase = createClient();

  useEffect(() => {
    async function checkConnection() {
      // Perform a light query to test connection
      const { error } = await supabase.from('_not_a_real_table_').select('*');
      
      // A schema or relation error means the client successfully reached Supabase
      if (error) {
        setStatus('Connected to Supabase successfully!');
      } else {
        setStatus('Supabase connection active.');
      }
    }
    checkConnection();
  }, [supabase]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold text-center">Credible Artisans</h1>
      <p className="mt-4 text-lg text-emerald-600 font-medium">{status}</p>
    </main>
  );
}