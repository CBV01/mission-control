'use client';

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronRight, CheckCheck, ExternalLink, AlertCircle, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useUIStore } from '@/lib/store';
import { StatusDot } from '@/components/ui/status-dot';
import { Badge } from '@/components/ui/badge';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { cn, fmtRelative } from '@/lib/utils';
import type { AppNotification, NotificationLevel } from '@/lib/types';

const pageTitles: Record<string, { title: string; crumb: string[] }> = {
  home: { title: 'Command Center', crumb: ['Home'] },
  chat: { title: 'Chat & Terminal', crumb: ['Home', 'Chat'] },
  health: { title: 'System & VPS', crumb: ['System', 'Health'] },
  agents: { title: 'Agents & Domains', crumb: ['Agents', 'Tree'] },
  pipelines: { title: 'Pipelines & Workflows', crumb: ['Agents', 'Pipelines'] },
  kanban: { title: 'Kanban Board', crumb: ['Agents', 'Kanban'] },
  studio: { title: 'Social Content Studio', crumb: ['Growth', 'Studio'] },
  analytics: { title: 'Analytics & Credits', crumb: ['Growth', 'Analytics'] },
  cron: { title: 'Cron Jobs', crumb: ['Operations', 'Cron'] },
  skills: { title: 'Skills Library', crumb: ['Operations', 'Skills'] },
  logs: { title: 'Logs & Insights', crumb: ['System', 'Logs'] },
  memory: { title: 'Memory / Obsidian', crumb: ['Brain', 'Memory'] },
  settings: { title: 'Settings', crumb: ['System', 'Settings'] },
};

const LEVEL_ICON: Record<NotificationLevel, React.ComponentType<{ className?: string }>> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
};
const LEVEL_TONE: Record<NotificationLevel, string> = {
  info: 'text-status-info',
  success: 'text-status-success',
  warning: 'text-status-warning',
  error: 'text-status-danger',
};

export function Topbar() {
  const { currentPage, openModal, activeModal, closeModal } = useUIStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const meta = pageTitles[currentPage] ?? { title: '—', crumb: [] };

  const { data: cron } = useQuery({
    queryKey: ['cron'],
    queryFn: api.cron,
    refetchInterval: 30_000,
  });
  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: api.health,
    refetchInterval: 10_000,
  });
  // Real-time notifications — poll every 10s
  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: api.notifications,
    refetchInterval: 10_000,
  });

  const enabledJobs = cron?.jobs.filter((j) => j.enabled).length ?? 0;
  const gatewayRunning = health?.gateway.state === 'running';
  const notifications: AppNotification[] = notifData?.items ?? [];
  const unreadCount = notifications.filter((n: AppNotification) => !n.read).length;

  // Search query
  const [search, setSearch] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Cmd+K to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (activeModal === 'search') closeModal();
        else openModal('search');
      }
      if (e.key === 'Escape' && activeModal === 'search') closeModal();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeModal, openModal, closeModal]);

  // Focus search input when search modal opens
  useEffect(() => {
    if (activeModal === 'search') {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearch('');
    }
  }, [activeModal]);

  // Mark all as read
  const markAllRead = () => {
    queryClient.setQueryData<{ items: AppNotification[] }>(['notifications'], (old) => {
      if (!old) return old;
      return { items: old.items.map((n) => ({ ...n, read: true })) };
    });
  };

  // Notification dropdown
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notifOpen]);

  // Search results
  const searchResults = React.useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    const all: { type: string; label: string; sub: string; href: string }[] = [
      ...((cron?.jobs ?? []).map((j) => ({ type: 'Cron', label: j.name, sub: j.schedule, href: '/cron' }))),
      ...(notifications.map((n: AppNotification) => ({ type: 'Notification', label: n.title, sub: n.body, href: n.href ?? '/logs' }))),
    ];
    return all.filter((x) => x.label.toLowerCase().includes(q) || x.sub.toLowerCase().includes(q)).slice(0, 10);
  }, [search, cron, notifications]);

  return (
    <header
      className="sticky top-0 z-sticky h-14 flex-shrink-0 border-b border-white/[0.06] bg-bg-root/70 backdrop-blur-xl"
      role="banner"
    >
      <div className="flex h-full items-center gap-4 px-6">
        {/* Crumb + title */}
        <div className="flex items-center gap-2 min-w-0">
          {meta.crumb.map((c, i) => (
            <React.Fragment key={c}>
              {i > 0 && <ChevronRight className="h-3 w-3 text-text-tertiary" />}
              <span className={cn('text-2xs uppercase tracking-wider', i === meta.crumb.length - 1 ? 'text-text-primary font-medium' : 'text-text-tertiary')}>
                {c}
              </span>
            </React.Fragment>
          ))}
          <span className="ml-2 text-sm font-semibold tracking-tight text-text-primary truncate">
            {meta.title}
          </span>
        </div>

        {/* Center status */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-2 text-xs text-text-secondary">
          <StatusDot status={gatewayRunning ? 'live' : 'danger'} />
          <span className="font-mono text-2xs">
            Gateway {gatewayRunning ? 'running' : 'down'}
          </span>
          <span className="text-text-tertiary">·</span>
          <span className="font-mono text-2xs">
            {enabledJobs} cron {enabledJobs === 1 ? 'job' : 'jobs'} enabled
          </span>
        </div>

        {/* Search */}
        <div className="relative ml-auto">
          <button
            onClick={() => openModal('search')}
            className="group flex h-9 w-72 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-text-tertiary transition-colors hover:border-white/20 hover:bg-white/10 cursor-pointer"
            aria-label="Open search (Cmd+K)"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search agents, logs, settings…</span>
            <kbd className="ml-auto rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-text-tertiary">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Notifications dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-colors cursor-pointer"
            aria-label={`Notifications (${unreadCount} unread)`}
          >
            <Bell className="h-4 w-4 text-text-secondary" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-status-danger px-1 text-[10px] font-mono font-medium text-white shadow-glow-danger">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-96 max-h-[480px] flex flex-col rounded-xl border border-white/10 bg-bg-elevated/95 backdrop-blur-xl shadow-2xl shadow-black/50 z-modal overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Bell className="h-3.5 w-3.5 text-text-secondary" />
                  <span className="text-sm font-semibold text-text-primary">Notifications</span>
                  {unreadCount > 0 && (
                    <Badge tone="danger" className="text-[10px]">{unreadCount} new</Badge>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-2xs text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
                  >
                    <CheckCheck className="h-3 w-3" /> Mark all read
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-2xs text-text-tertiary">No notifications</div>
                ) : (
                  notifications.map((n: AppNotification) => {
                    const Icon = LEVEL_ICON[n.level];
                    return (
                      <button
                        key={n.id}
                        onClick={() => {
                          if (n.href) {
                            router.push(n.href);
                            setNotifOpen(false);
                          }
                        }}
                        className={cn(
                          'w-full text-left px-4 py-3 border-b border-white/[0.06] last:border-b-0 hover:bg-white/[0.04] transition-colors cursor-pointer flex items-start gap-3',
                          !n.read && 'bg-cyan-500/[0.04]',
                        )}
                      >
                        <Icon className={cn('h-4 w-4 mt-0.5 flex-shrink-0', LEVEL_TONE[n.level])} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-text-primary truncate">{n.title}</span>
                            {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan flex-shrink-0" />}
                          </div>
                          <p className="text-2xs text-text-secondary leading-relaxed mt-0.5 line-clamp-2">{n.body}</p>
                          <div className="flex items-center gap-2 mt-1 text-2xs text-text-tertiary font-mono">
                            <span>{n.source}</span>
                            <span>·</span>
                            <span>{fmtRelative(n.timestamp)}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
              <div className="px-4 py-2 border-t border-white/[0.06] text-2xs text-text-tertiary text-center">
                Auto-refreshes every 10s
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── SEARCH MODAL ─────────────────────────────────────────── */}
      {activeModal === 'search' && (
        <div
          className="fixed inset-0 z-modal flex items-start justify-center pt-[15vh] bg-black/70 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-xl mx-4 rounded-xl border border-white/10 bg-bg-elevated shadow-2xl shadow-black/50 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
              <Search className="h-4 w-4 text-text-tertiary flex-shrink-0" />
              <input
                ref={searchInputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search across agents, jobs, notifications…"
                className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
              />
              <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-text-tertiary">ESC</kbd>
            </div>
            <div className="max-h-[50vh] overflow-y-auto scrollbar-hide">
              {search.trim() === '' ? (
                <div className="p-6 text-center text-2xs text-text-tertiary">
                  Start typing to search across the system
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-6 text-center text-2xs text-text-tertiary">
                  No results for "{search}"
                </div>
              ) : (
                <div className="py-1">
                  {searchResults.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        router.push(r.href);
                        closeModal();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-white/5 flex items-center gap-3 transition-colors cursor-pointer"
                    >
                      <span className="text-2xs uppercase tracking-wider text-text-tertiary w-20 flex-shrink-0">
                        {r.type}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-text-primary truncate">{r.label}</div>
                        <div className="text-2xs text-text-tertiary truncate">{r.sub}</div>
                      </div>
                      <ExternalLink className="h-3 w-3 text-text-tertiary flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
