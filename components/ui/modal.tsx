'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  bodyClassName?: string;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
};

export function Modal({ open, onClose, title, description, children, footer, size = 'md', bodyClassName }: ModalProps) {
  // ESC handler
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'relative w-full overflow-hidden rounded-xl border border-white/10 bg-bg-elevated shadow-2xl shadow-black/50',
              'max-h-[90vh] flex flex-col',
              sizeClasses[size]
            )}
          >
            {/* Accent stripe */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

            {title && (
              <div className="flex items-start justify-between p-5 border-b border-white/5">
                <div>
                  <h2 id="modal-title" className="text-lg font-semibold tracking-tight text-text-primary">
                    {title}
                  </h2>
                  {description && (
                    <p className="mt-1 text-xs text-text-secondary">{description}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  aria-label="Close modal"
                  className="-mr-1 -mt-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className={bodyClassName ?? 'flex-1 overflow-y-auto p-5'}>{children}</div>

            {footer && (
              <div className="flex items-center justify-end gap-2 p-5 border-t border-white/5">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
