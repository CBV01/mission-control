'use client';

import * as React from 'react';
import { cn, clamp } from '@/lib/utils';

interface ProgressProps {
  value: number; // 0..100
  tone?: 'cyan' | 'violet' | 'magenta' | 'gradient' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  className?: string;
}

const toneClasses = {
  cyan: 'bg-accent-cyan',
  violet: 'bg-accent-violet',
  magenta: 'bg-accent-magenta',
  gradient: 'bg-gradient-accent',
  success: 'bg-status-success',
  warning: 'bg-status-warning',
  danger: 'bg-status-danger',
};

const glowClasses = {
  cyan: 'shadow-glow-cyan',
  violet: 'shadow-glow-violet',
  magenta: 'shadow-glow-magenta',
  gradient: 'shadow-glow-cyan',
  success: 'shadow-glow-success',
  warning: 'shadow-glow-warning',
  danger: 'shadow-glow-danger',
};

export function Progress({ value, tone = 'cyan', showLabel = false, className }: ProgressProps) {
  const v = clamp(value, 0, 100);
  return (
    <div className={cn('w-full', className)}>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out-expo', toneClasses[tone], glowClasses[tone])}
          style={{ width: `${v}%` }}
          role="progressbar"
          aria-valuenow={v}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showLabel && (
        <div className="mt-1 flex justify-between text-2xs text-text-tertiary font-mono">
          <span>{v.toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
}
