'use client';

import * as React from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EmptyState({
  title = 'Nothing here yet',
  description,
  action,
  icon,
  className,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-12 text-center', className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-text-tertiary">
        {icon ?? <Inbox className="h-5 w-5" />}
      </div>
      <div>
        <h3 className="text-sm font-medium text-text-primary">{title}</h3>
        {description && <p className="mt-1 text-xs text-text-tertiary max-w-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}
