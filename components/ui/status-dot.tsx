'use client';

import { cn } from '@/lib/utils';

type Status = 'live' | 'success' | 'warning' | 'danger' | 'idle';

const statusClasses: Record<Status, string> = {
  live: 'status-dot-live',
  success: 'status-dot-success',
  warning: 'status-dot-warning',
  danger: 'status-dot-danger',
  idle: 'status-dot-idle',
};

const statusLabels: Record<Status, string> = {
  live: 'Live',
  success: 'Operational',
  warning: 'Degraded',
  danger: 'Down',
  idle: 'Idle',
};

export function StatusDot({ status, label = false, className }: { status: Status; label?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        className={cn('status-dot', statusClasses[status])}
        role="status"
        aria-label={statusLabels[status]}
      />
      {label && <span className="text-2xs uppercase tracking-wider text-text-secondary">{statusLabels[status]}</span>}
    </span>
  );
}
