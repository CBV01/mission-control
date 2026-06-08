'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from './badge';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: { label: string; tone?: 'cyan' | 'violet' | 'magenta' | 'default' };
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, icon, badge, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-2 pb-6', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-accent shadow-glow-cyan">
              {icon}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-text-primary">{title}</h1>
              {badge && <Badge tone={badge.tone}>{badge.label}</Badge>}
            </div>
            {description && <p className="text-sm text-text-secondary mt-0.5">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
