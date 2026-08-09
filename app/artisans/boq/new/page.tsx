// app/artisan/boq/new/page.tsx
'use client';

import React from 'react';
import { BoqForm } from '@/components/boq/BoqForm';
import Link from 'next/link';

export default function CreateBoqPage() {
  // Replace with your actual logged-in Artisan User ID (e.g. from Supabase auth context or session)
  const currentArtisanId = "YOUR_LOGGED_IN_ARTISAN_ID"; 

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center">
        <Link 
          href="/artisan/boq" 
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          ← Back to BOQ List
        </Link>
      </div>

      <BoqForm 
        artisanId={currentArtisanId} 
        onSuccess={() => {
          window.location.href = '/artisan/boq';
        }} 
      />
    </div>
  );
}