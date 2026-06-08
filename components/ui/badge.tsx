'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type Tone = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'cyan' | 'violet' | 'magenta';

const toneClasses: Record<Tone, string> = {
  default: 'bg-white/5 text-text-secondary border-white/10',
  success: 'bg-status-success/10 text-status-success border-status-success/30',
  warning: 'bg-status-warning/10 text-status-warning border-status-warning/30',
  danger: 'bg-status-danger/10 text-status-danger border-status-danger/30',
  info: 'bg-status-info/10 text-status-info border-status-info/30',
  cyan: 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30',
  violet: 'bg-accent-violet/10 text-accent-violet border-accent-violet/30',
  magenta: 'bg-accent-magenta/10 text-accent-magenta border-accent-magenta/30',
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  dot?: boolean;
}

export function Badge({ tone = 'default', dot = false, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-2xs font-medium uppercase tracking-wider',
        toneClasses[tone],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full', {
            'bg-status-success': tone === 'success',
            'bg-status-warning': tone === 'warning',
            'bg-status-danger': tone === 'danger',
            'bg-status-info': tone === 'info',
            'bg-accent-cyan': tone === 'cyan',
            'bg-accent-violet': tone === 'violet',
            'bg-accent-magenta': tone === 'magenta',
            'bg-text-secondary': tone === 'default',
          })}
        />
      )}
      {children}
    </span>
  );
}
