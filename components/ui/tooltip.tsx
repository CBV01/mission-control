'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: React.ReactNode;
  side?: 'right' | 'left' | 'top' | 'bottom';
  children: React.ReactElement;
  className?: string;
}

const sideClasses = {
  right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  left: 'right-full mr-2 top-1/2 -translate-y-1/2',
  top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
  bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
};

export function Tooltip({ content, side = 'right', children, className }: TooltipProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className={cn(
            'pointer-events-none absolute z-popover whitespace-nowrap rounded-md border border-white/10 bg-bg-elevated px-2 py-1 text-2xs text-text-primary shadow-lg',
            sideClasses[side],
            className
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
