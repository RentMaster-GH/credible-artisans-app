'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PortalMode } from '@/types';

interface ModeContextType {
  activePortal: PortalMode;
  switchPortal: (mode: PortalMode) => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [activePortal, setActivePortal] = useState<PortalMode>('artisan');
  const router = useRouter();

  // Sync state with localStorage on load
  useEffect(() => {
    const savedMode = localStorage.getItem('activePortal') as PortalMode;
    if (savedMode) {
      setActivePortal(savedMode);
    }
  }, []);

  const switchPortal = (mode: PortalMode) => {
    setActivePortal(mode);
    localStorage.setItem('activePortal', mode);

    // Redirect to respective dashboard/portal home page
    if (mode === 'client') {
      router.push('/client/dashboard'); // or /client
    } else {
      router.push('/artisan/dashboard'); // or /artisan
    }
  };

  return (
    <ModeContext.Provider value={{ activePortal, switchPortal }}>
      {children}
    </ModeContext.Provider>
  );
}

export function usePortalMode() {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('usePortalMode must be used within a ModeProvider');
  }
  return context;
}