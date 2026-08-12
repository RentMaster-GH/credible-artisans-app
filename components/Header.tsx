'use client';

import { usePortalMode } from '@/components/ModeContext';

export default function UserMenu() {
  const { activePortal, switchPortal } = usePortalMode();

  return (
    <div className="bg-white border rounded-lg p-4 shadow-md w-72">
      <div className="font-bold text-gray-700 text-sm mb-2">
        {activePortal === 'artisan' ? '🛠️ ARTISAN MODE' : '👤 CLIENT MODE'}
      </div>

      <nav className="space-y-2 text-sm">
        {activePortal === 'artisan' ? (
          <>
            <a href="/artisan/dashboard" className="block p-2 hover:bg-gray-100 rounded">
              📊 Portal Dashboard
            </a>
            <a href="/artisan/jobs" className="block p-2 hover:bg-gray-100 rounded">
              📋 Job Marketplace
            </a>
            <a href="/artisan/boq" className="block p-2 hover:bg-gray-100 rounded">
              📐 BOQ Generator
            </a>
            <button
              onClick={() => switchPortal('client')}
              className="w-full text-left font-semibold text-blue-600 p-2 hover:bg-blue-50 rounded transition"
            >
              Switch to 👤 Client Mode
            </button>
          </>
        ) : (
          <>
            <a href="/client/dashboard" className="block p-2 hover:bg-gray-100 rounded">
              📊 Client Dashboard
            </a>
            <a href="/client/jobs/new" className="block p-2 hover:bg-gray-100 rounded">
              📝 Post a New Project
            </a>
            <a href="/client/settings" className="block p-2 hover:bg-gray-100 rounded">
              ⚙️ Client Settings
            </a>
            <button
              onClick={() => switchPortal('artisan')}
              className="w-full text-left font-semibold text-amber-600 p-2 hover:bg-amber-50 rounded transition"
            >
              Switch to 🛠️ Artisan Mode
            </button>
          </>
        )}
      </nav>
    </div>
  );
}