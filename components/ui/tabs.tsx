'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode; count?: number }[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.02] p-1', className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 ease-out-expo cursor-pointer whitespace-nowrap border',
              'focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-root',
              isActive
                ? 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/40'
                : 'text-text-secondary border-transparent hover:bg-white/5 hover:text-text-primary'
            )}
            aria-pressed={isActive}
            role="tab"
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count != null && (
              <span
                className={cn(
                  'rounded-full px-1.5 text-[10px] font-mono',
                  isActive ? 'bg-accent-cyan/20 text-accent-cyan' : 'bg-white/5 text-text-tertiary'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
