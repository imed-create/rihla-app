import React, { createContext, useCallback, useContext, useMemo, useState, Suspense } from 'react';
import { ProRole } from '@/constants/proNavigation';

const ProCommandDrawer = React.lazy(() => import('./CommandDrawer'));

type ProNavContextValue = {
  role: ProRole;
  isOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
};

const ProNavContext = createContext<ProNavContextValue | null>(null);

export function ProNavProvider({ role, children }: { role: ProRole; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openMenu = useCallback(() => setIsOpen(true), []);
  const closeMenu = useCallback(() => setIsOpen(false), []);
  const toggleMenu = useCallback(() => setIsOpen((v) => !v), []);

  const value = useMemo(
    () => ({ role, isOpen, openMenu, closeMenu, toggleMenu }),
    [role, isOpen, openMenu, closeMenu, toggleMenu]
  );

  return (
    <ProNavContext.Provider value={value}>
      {children}
      <Suspense fallback={null}>
        <ProCommandDrawer />
      </Suspense>
    </ProNavContext.Provider>
  );
}

export function useProNav() {
  const ctx = useContext(ProNavContext);
  if (!ctx) throw new Error('useProNav must be used within ProNavProvider');
  return ctx;
}
