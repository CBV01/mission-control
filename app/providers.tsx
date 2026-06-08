'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { useUIStore } from '@/lib/store';

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  // Hydrate UI store from localStorage on mount
  if (typeof window !== 'undefined') {
    useUIStore.persist?.rehydrate?.();
  }

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
