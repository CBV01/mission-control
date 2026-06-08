'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, RotateCw, Stethoscope, X, Zap, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/store';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

interface FabAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: 'cyan' | 'danger' | 'default' | 'violet';
  onClick: () => void;
}

export function FloatingActions() {
  const [open, setOpen] = React.useState(false);
  const { openModal } = useUIStore();
  const router = useRouter();
  const [confirm, setConfirm] = React.useState<{ title: string; description: string } | null>(null);

  const actions: FabAction[] = [
    {
      id: 'message',
      label: 'Send Message',
      icon: MessageSquare,
      tone: 'violet',
      onClick: () => {
        setOpen(false);
        // Navigate to the chat page so the user can message the orchestrator
        router.push('/chat');
      },
    },
    {
      id: 'pipeline',
      label: 'Trigger Pipeline',
      icon: Zap,
      tone: 'cyan',
      onClick: () => { setOpen(false); openModal('trigger-pipeline'); },
    },
    {
      id: 'health',
      label: 'Run Health Check',
      icon: Stethoscope,
      tone: 'default',
      onClick: () => { setOpen(false); openModal('health-check'); },
    },
    {
      id: 'restart',
      label: 'Restart Gateway',
      icon: RotateCw,
      tone: 'danger',
      onClick: () => {
        setOpen(false);
        setConfirm({
          title: 'Restart Gateway?',
          description: 'Active tasks will be interrupted. The gateway will be offline for ~10s.',
        });
      },
    },
  ];

  return (
    <>
      <div className="fixed bottom-6 right-6 z-fab flex flex-col items-end gap-3">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-end gap-2"
            >
              {actions.map((a, i) => {
                const Icon = a.icon;
                return (
                  <motion.button
                    key={a.id}
                    initial={{ opacity: 0, x: 8, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 8, scale: 0.9 }}
                    transition={{ delay: (actions.length - 1 - i) * 0.05, duration: 0.15 }}
                    onClick={a.onClick}
                    className={cn(
                      'group flex items-center gap-3 rounded-full border backdrop-blur-xl shadow-lg transition-all cursor-pointer',
                      'focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-root',
                      a.tone === 'cyan' && 'border-cyan-400/30 bg-bg-elevated/90 text-accent-cyan shadow-glow-cyan',
                      a.tone === 'danger' && 'border-status-danger/30 bg-bg-elevated/90 text-status-danger',
                      a.tone === 'default' && 'border-white/10 bg-bg-elevated/90 text-text-primary hover:border-white/20',
                      a.tone === 'violet' && 'border-accent-violet/30 bg-bg-elevated/90 text-accent-violet shadow-glow-violet'
                    )}
                    aria-label={a.label}
                  >
                    <span className="text-xs font-medium pl-4 pr-2">{a.label}</span>
                    <span
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full',
                        a.tone === 'cyan' && 'bg-cyan-500/15',
                        a.tone === 'danger' && 'bg-status-danger/15',
                        a.tone === 'default' && 'bg-white/5',
                        a.tone === 'violet' && 'bg-accent-violet/15'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Primary FAB */}
        <button
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-accent text-white shadow-glow-cyan transition-transform duration-200 cursor-pointer',
            'focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-root',
            'hover:scale-105 active:scale-95',
            open && 'rotate-45'
          )}
          aria-label={open ? 'Close quick actions' : 'Open quick actions'}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          {!open && (
            <span className="absolute inset-0 rounded-full bg-gradient-accent animate-pulse-glow opacity-50" aria-hidden />
          )}
        </button>
      </div>

      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm?.title}
        description={confirm?.description}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => {
                setConfirm(null);
                openModal('restart-gateway');
              }}
            >
              Restart
            </Button>
          </>
        }
      >
        <div className="rounded-lg border border-status-danger/20 bg-status-danger/5 p-3 text-xs text-text-secondary">
          <p className="font-mono">
            <span className="text-text-tertiary">PID:</span> 48217 ·{' '}
            <span className="text-text-tertiary">Uptime:</span> 24h 0m 32s
          </p>
        </div>
      </Modal>
    </>
  );
}
