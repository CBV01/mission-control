'use client';

import * as React from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { FloatingActions } from './floating-actions';
import { useUIStore } from '@/lib/store';
import { usePathname } from 'next/navigation';

export function ClientShell({ children }: { children: React.ReactNode }) {
  const { setPage } = useUIStore();
  const pathname = usePathname();

  // Sync pathname → store (one-way, no loop)
  React.useEffect(() => {
    const path = pathname === '/' ? 'home' : pathname.replace('/', '');
    setPage(path as any);
  }, [pathname, setPage]);

  return (
    <div className="flex h-screen overflow-hidden bg-bg-root text-text-primary">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1600px] p-6">{children}</div>
        </main>
      </div>
      <FloatingActions />
    </div>
  );
}
