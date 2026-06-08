'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface StatProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  trend?: { value: number; positive?: boolean };
  className?: string;
}

export function Stat({ label, value, hint, icon, trend, className }: StatProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center justify-between text-2xs uppercase tracking-wider text-text-tertiary">
        <span>{label}</span>
        {icon && <span className="text-text-secondary">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-2xl font-semibold text-text-primary tracking-tight">{value}</span>
        {trend && (
          <span
            className={cn(
              'text-2xs font-mono',
              trend.positive ? 'text-status-success' : 'text-status-danger'
            )}
          >
            {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      {hint && <div className="text-2xs text-text-tertiary">{hint}</div>}
    </div>
  );
}
