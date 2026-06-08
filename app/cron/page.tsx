'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Clock, Play, Pause, Search, AlertCircle, CheckCircle2, Bot,
  Activity, Calendar, Hash, Sparkles, ChevronRight, MoreHorizontal,
  TrendingUp, TrendingDown, Plus,
} from 'lucide-react';
import { ClientShell } from '@/components/shell/client-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { Modal } from '@/components/ui/modal';
import { api } from '@/lib/api';
import { cn, fmtDuration, fmtRelative, fmtPct } from '@/lib/utils';
import type { CronJob, CronStatus } from '@/lib/types';

const STATUS_TONE: Record<CronStatus, { dot: 'success' | 'danger' | 'default'; text: 'text-status-success' | 'text-status-danger' | 'text-text-tertiary'; bg: 'bg-status-success' | 'bg-status-danger' | 'bg-text-tertiary'; label: string; accent: string }> = {
  ok:      { dot: 'success', text: 'text-status-success', bg: 'bg-status-success', label: 'OK',      accent: 'rgba(16, 185, 129, 0.4)' },
  error:   { dot: 'danger',  text: 'text-status-danger',  bg: 'bg-status-danger',  label: 'Error',   accent: 'rgba(239, 68, 68, 0.4)' },
  paused:  { dot: 'default', text: 'text-text-tertiary', bg: 'bg-text-tertiary', label: 'Paused',  accent: 'rgba(148, 163, 184, 0.3)' },
};

function CronContent() {
  const { data, isLoading } = useQuery({ queryKey: ['cron'], queryFn: api.cron });
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | CronStatus>('all');
  const [selectedJob, setSelectedJob] = useState<CronJob | null>(null);
  const [showNewJob, setShowNewJob] = useState(false);

  const filtered = (data?.jobs ?? []).filter((j) => {
    if (statusFilter !== 'all' && j.status !== statusFilter) return false;
    if (filter && !j.name.toLowerCase().includes(filter.toLowerCase())
        && !j.description.toLowerCase().includes(filter.toLowerCase())) return false;
    return true;
  });

  const jobs = data?.jobs ?? [];
  const counts = {
    total: jobs.length,
    ok: jobs.filter((j) => j.status === 'ok').length,
    error: jobs.filter((j) => j.status === 'error').length,
    paused: jobs.filter((j) => j.status === 'paused').length,
  };

  const addJob = (newJob: CronJob) => {
    queryClient.setQueryData<{ jobs: CronJob[] }>(['cron'], (old: { jobs: CronJob[] } | undefined) => {
      if (!old) return { jobs: [newJob] };
      return { jobs: [newJob, ...old.jobs] };
    });
    setShowNewJob(false);
  };

  return (
    <>
      <PageHeader
        title="Cron Jobs"
        description={`${counts.total} scheduled jobs · ${counts.ok} healthy · ${counts.error} failing · ${counts.paused} paused`}
        icon={<Clock className="h-4 w-4 text-white" />}
        actions={
          <Button variant="primary" size="sm" onClick={() => setShowNewJob(true)}>
            <Plus className="h-3.5 w-3.5" /> New Job
          </Button>
        }
      />

      {isLoading ? (
        <Skeleton className="h-96" />
      ) : (
        <>
          {/* ── KPI Summary Row ───────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <KpiCard
              label="Total jobs"
              value={counts.total}
              icon={<Clock className="h-4 w-4" />}
              tone="cyan"
            />
            <KpiCard
              label="Healthy"
              value={counts.ok}
              icon={<CheckCircle2 className="h-4 w-4" />}
              tone="success"
              pct={counts.total ? (counts.ok / counts.total) * 100 : 0}
            />
            <KpiCard
              label="Failing"
              value={counts.error}
              icon={<AlertCircle className="h-4 w-4" />}
              tone="danger"
              pct={counts.total ? (counts.error / counts.total) * 100 : 0}
            />
            <KpiCard
              label="Paused"
              value={counts.paused}
              icon={<Pause className="h-4 w-4" />}
              tone="default"
            />
          </div>

          {/* ── Filter row ───────────────────────────── */}
          <div className="mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search jobs by name or description…"
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-white/[0.08] bg-white/[0.04] text-sm text-text-primary placeholder:text-text-tertiary focus:border-cyan-400/50 focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(['all', 'ok', 'error', 'paused'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-2xs font-medium transition-colors cursor-pointer capitalize',
                    statusFilter === s
                      ? 'bg-gradient-accent text-white border-transparent shadow-glow-cyan'
                      : 'border-white/[0.08] text-text-secondary hover:bg-white/5',
                  )}
                >
                  {s} {s !== 'all' && <span className="ml-1 opacity-70">{
                    s === 'ok' ? counts.ok : s === 'error' ? counts.error : counts.paused
                  }</span>}
                </button>
              ))}
            </div>
          </div>

          {/* ── Job Cards Grid ───────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((job) => (
              <JobCard key={job.id} job={job} onOpen={() => setSelectedJob(job)} />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full rounded-xl border border-dashed border-white/[0.08] p-8 text-center">
                <p className="text-sm text-text-tertiary">No jobs match the current filters.</p>
              </div>
            )}
          </div>
        </>
      )}

      <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      <NewJobModal open={showNewJob} onClose={() => setShowNewJob(false)} onSubmit={addJob} />
    </>
  );
}

// ─── KPI Card ──────────────────────────────────────────────────────
function KpiCard({ label, value, icon, tone, pct }: { label: string; value: number; icon: React.ReactNode; tone: 'cyan' | 'success' | 'danger' | 'default'; pct?: number }) {
  const toneClass = {
    cyan:   { text: 'text-accent-cyan',    bg: 'bg-accent-cyan/10',    border: 'border-accent-cyan/20',    bar: 'bg-accent-cyan' },
    success:{ text: 'text-status-success', bg: 'bg-status-success/10', border: 'border-status-success/20', bar: 'bg-status-success' },
    danger: { text: 'text-status-danger',  bg: 'bg-status-danger/10',  border: 'border-status-danger/20',  bar: 'bg-status-danger' },
    default:{ text: 'text-text-secondary', bg: 'bg-white/[0.04]',      border: 'border-white/[0.08]',      bar: 'bg-text-tertiary' },
  }[tone];

  return (
    <Card innerGlow className={cn('overflow-hidden relative', toneClass.border)}>
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{ background: `radial-gradient(circle at 100% 0%, var(--accent-color, transparent) 0%, transparent 60%)` }}
      />
      <CardContent className="p-4 relative">
        <div className="flex items-center justify-between mb-2">
          <div className={cn('flex h-8 w-8 items-center justify-center rounded-md', toneClass.bg, toneClass.text)}>
            {icon}
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={cn('font-mono text-2xl font-semibold tracking-tight', toneClass.text)}>{value}</span>
          <span className="text-2xs text-text-tertiary uppercase tracking-wider">{label}</span>
        </div>
        {pct != null && (
          <div className="mt-2 h-1 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className={cn('h-full transition-all duration-500 ease-out-expo', toneClass.bar)}
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Job Card ──────────────────────────────────────────────────────
function JobCard({ job, onOpen }: { job: CronJob; onOpen: () => void }) {
  const tone = STATUS_TONE[job.status];
  const recentRuns = job.runHistory;
  const okRuns = recentRuns.filter((r) => r.status === 'ok').length;
  const runRate = recentRuns.length > 0 ? (okRuns / recentRuns.length) * 100 : 0;

  return (
    <div
      onClick={onOpen}
      className={cn(
        'group relative rounded-xl border bg-bg-elevated/60 p-4 cursor-pointer transition-all duration-200 ease-out-expo',
        'hover:-translate-y-0.5',
        job.status === 'ok' ? 'border-white/[0.06] hover:border-status-success/30' :
        job.status === 'error' ? 'border-status-danger/30 hover:border-status-danger/50' :
        'border-white/[0.06] opacity-75 hover:opacity-100',
      )}
    >
      {/* Top accent stripe */}
      <div
        className={cn('absolute top-0 left-0 right-0 h-0.5 rounded-t-xl', tone.bg)}
        style={{ boxShadow: `0 0 20px ${tone.accent}` }}
      />

      {/* Header: status icon + actions */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg',
              job.status === 'ok' && 'bg-status-success/15 text-status-success',
              job.status === 'error' && 'bg-status-danger/15 text-status-danger',
              job.status === 'paused' && 'bg-white/[0.06] text-text-tertiary',
            )}
          >
            {job.status === 'ok' && <CheckCircle2 className="h-4 w-4" />}
            {job.status === 'error' && <AlertCircle className="h-4 w-4" />}
            {job.status === 'paused' && <Pause className="h-4 w-4" />}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary leading-tight">{job.name}</h3>
            <p className="text-2xs text-text-tertiary leading-relaxed mt-0.5 line-clamp-2">{job.description}</p>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); }}
          className="opacity-0 group-hover:opacity-100 flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:bg-white/5 hover:text-text-primary transition-all cursor-pointer"
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Schedule + cron */}
      <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2 mb-3">
        <div className="flex items-center gap-1.5 text-2xs text-text-tertiary mb-1">
          <Calendar className="h-2.5 w-2.5" />
          <span className="uppercase tracking-wider">Schedule</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-text-primary">{job.schedule}</span>
          <code className="font-mono text-2xs text-text-tertiary bg-bg-root/40 rounded px-1.5 py-0.5">
            {job.cron}
          </code>
        </div>
      </div>

      {/* Last run + Next run */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2">
          <div className="flex items-center gap-1 text-2xs text-text-tertiary uppercase tracking-wider">
            <Clock className="h-2.5 w-2.5" /> Last
          </div>
          <div className="text-xs text-text-primary font-medium mt-0.5">{fmtRelative(job.lastRun)}</div>
          <div className="text-2xs text-text-tertiary font-mono">{job.lastRun ? fmtDuration(job.avgDurationMs) : '—'}</div>
        </div>
        <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2">
          <div className="flex items-center gap-1 text-2xs text-text-tertiary uppercase tracking-wider">
            <Sparkles className="h-2.5 w-2.5" /> Next
          </div>
          <div className="text-xs text-text-primary font-medium mt-0.5">{fmtRelative(job.nextRun)}</div>
          <div className="text-2xs text-text-tertiary font-mono">scheduled</div>
        </div>
      </div>

      {/* Run history mini-bars */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1 text-2xs text-text-tertiary uppercase tracking-wider">
            <Activity className="h-2.5 w-2.5" /> Last {recentRuns.length} runs
          </div>
          <div className="flex items-center gap-1 text-2xs">
            {runRate >= 90 ? (
              <TrendingUp className="h-3 w-3 text-status-success" />
            ) : (
              <TrendingDown className="h-3 w-3 text-status-danger" />
            )}
            <span className={cn('font-mono font-medium', runRate >= 90 ? 'text-status-success' : 'text-status-danger')}>
              {fmtPct(runRate / 100, 0)}
            </span>
          </div>
        </div>
        <div className="flex items-end gap-0.5 h-8">
          {recentRuns.slice(-10).reverse().map((r, i) => {
            const max = Math.max(...recentRuns.map((x) => x.durationMs), 1);
            const h = Math.max(2, (r.durationMs / max) * 100);
            return (
              <div
                key={i}
                className="flex-1 rounded-sm transition-all"
                style={{
                  height: r.status === 'error' ? '4px' : `${h}%`,
                  background: r.status === 'error'
                    ? 'rgba(239, 68, 68, 0.6)'
                    : runRate >= 90
                      ? `rgba(16, 185, 129, ${0.4 + (i / recentRuns.length) * 0.5})`
                      : `rgba(245, 158, 11, ${0.4 + (i / recentRuns.length) * 0.5})`,
                }}
                title={`${r.status} · ${fmtDuration(r.durationMs)}`}
              />
            );
          })}
        </div>
      </div>

      {/* Last error if any */}
      {job.lastError && (
        <div className="rounded-md border border-status-danger/30 bg-status-danger/5 p-2 mb-3 flex items-start gap-1.5">
          <AlertCircle className="h-3 w-3 text-status-danger flex-shrink-0 mt-0.5" />
          <div className="text-2xs font-mono text-status-danger leading-relaxed line-clamp-2">
            {job.lastError}
          </div>
        </div>
      )}

      {/* Tags + agent */}
      <div className="flex items-center gap-1.5 flex-wrap mb-3">
        {job.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="inline-flex items-center gap-0.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-1.5 py-0.5 text-[10px] text-text-tertiary">
            <Hash className="h-2 w-2" />
            {tag}
          </span>
        ))}
        <span className="inline-flex items-center gap-0.5 text-[10px] text-text-tertiary ml-auto">
          <Bot className="h-2.5 w-2.5" />
          {job.agent}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
        <Button
          size="sm"
          variant="primary"
          onClick={(e) => { e.stopPropagation(); }}
          className="flex-1"
        >
          <Play className="h-3 w-3" /> Run now
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => { e.stopPropagation(); }}
          className="flex-1"
        >
          {job.enabled ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {job.enabled ? 'Pause' : 'Resume'}
        </Button>
        <button
          onClick={(e) => { e.stopPropagation(); onOpen(); }}
          className="flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:bg-white/5 hover:text-text-primary transition-colors cursor-pointer"
          title="View details"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Job Detail Modal ──────────────────────────────────────────────
function JobDetailModal({ job, onClose }: { job: CronJob | null; onClose: () => void }) {
  if (!job) return null;
  const tone = STATUS_TONE[job.status];
  const okRuns = job.runHistory.filter((r) => r.status === 'ok').length;
  const runRate = job.runHistory.length > 0 ? (okRuns / job.runHistory.length) * 100 : 0;
  const totalRunTime = job.runHistory.reduce((s, r) => s + r.durationMs, 0);
  const lastErrorCount = job.runHistory.filter((r) => r.status === 'error').length;

  return (
    <Modal
      open={!!job}
      onClose={onClose}
      title={job.name}
      description={job.description}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <Button variant="primary">
            <Play className="h-3.5 w-3.5" /> Run now
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Status row */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge tone={tone.dot} dot>{tone.label}</Badge>
          <Badge tone="default" className="font-mono text-xs">
            {job.cron}
          </Badge>
          <span className="text-2xs text-text-tertiary ml-auto">{job.schedule}</span>
        </div>

        {/* Quick stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-2xs">
          <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2.5">
            <div className="text-text-tertiary uppercase tracking-wider">Success rate</div>
            <div className={cn('font-mono text-base font-semibold mt-0.5', runRate >= 90 ? 'text-status-success' : 'text-status-danger')}>
              {fmtPct(runRate / 100, 0)}
            </div>
          </div>
          <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2.5">
            <div className="text-text-tertiary uppercase tracking-wider">Avg duration</div>
            <div className="font-mono text-base font-semibold text-text-primary mt-0.5">{fmtDuration(job.avgDurationMs)}</div>
          </div>
          <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2.5">
            <div className="text-text-tertiary uppercase tracking-wider">Total time</div>
            <div className="font-mono text-base font-semibold text-text-primary mt-0.5">{fmtDuration(totalRunTime)}</div>
          </div>
          <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2.5">
            <div className="text-text-tertiary uppercase tracking-wider">Failures</div>
            <div className={cn('font-mono text-base font-semibold mt-0.5', lastErrorCount > 0 ? 'text-status-danger' : 'text-status-success')}>
              {lastErrorCount}
            </div>
          </div>
        </div>

        {/* Last error */}
        {job.lastError && (
          <div>
            <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-1.5 flex items-center gap-1.5">
              <AlertCircle className="h-3 w-3" /> Last error
            </div>
            <div className="rounded-lg border border-status-danger/30 bg-status-danger/5 p-3 font-mono text-xs text-status-danger leading-relaxed">
              {job.lastError}
            </div>
          </div>
        )}

        {/* Run history */}
        <div>
          <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-1.5">Run history (last {job.runHistory.length})</div>
          <div className="rounded-lg border border-white/[0.06] overflow-hidden">
            {job.runHistory.slice().reverse().map((r, i) => {
              const ok = r.status === 'ok';
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2 text-2xs border-b border-white/[0.06] last:border-b-0 hover:bg-white/[0.02] transition-colors"
                >
                  <span className={cn(
                    'h-2 w-2 rounded-full flex-shrink-0',
                    ok ? 'bg-status-success' : 'bg-status-danger',
                  )} />
                  <span className="font-mono text-text-tertiary w-20 flex-shrink-0">{r.ts.slice(0, 10)}</span>
                  <span className="font-mono text-text-secondary w-14 flex-shrink-0">{r.ts.slice(11, 19)}</span>
                  <span className="font-mono text-text-primary flex-1">{fmtDuration(r.durationMs)}</span>
                  <span className={cn('font-mono font-medium', ok ? 'text-status-success' : 'text-status-danger')}>
                    {r.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Agent + owner */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/[0.06] text-2xs">
          <div>
            <div className="text-text-tertiary uppercase tracking-wider mb-1">Runs as</div>
            <div className="flex items-center gap-1.5 text-text-primary">
              <Bot className="h-3 w-3 text-accent-cyan" />
              <span className="font-mono">{job.agent}</span>
            </div>
          </div>
          <div>
            <div className="text-text-tertiary uppercase tracking-wider mb-1">Owner</div>
            <div className="text-text-primary font-mono">{job.owner}</div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ─── New Job Modal ─────────────────────────────────────────────────
const CRON_PRESETS = [
  { label: 'Every minute',     cron: '* * * * *' },
  { label: 'Every 5 minutes',  cron: '*/5 * * * *' },
  { label: 'Every 15 minutes', cron: '*/15 * * * *' },
  { label: 'Every hour',       cron: '0 * * * *' },
  { label: 'Every 6 hours',    cron: '0 */6 * * *' },
  { label: 'Daily at 08:00',   cron: '0 8 * * *' },
  { label: 'Daily at 03:00',   cron: '0 3 * * *' },
  { label: 'Mondays at 09:00', cron: '0 9 * * 1' },
  { label: 'Weekdays at 09:00',cron: '0 9 * * 1-5' },
  { label: '1st of month 02:00', cron: '0 2 1 * *' },
];

const AGENT_OPTIONS = [
  'orchestrator',
  'outreach-scraper',
  'outreach-emailer',
  'mkt-content',
  'mkt-poster',
  'mkt-trends',
  'seo-planner',
  'ads-creative',
  'ads-analytics',
  'dev-coding',
];

function NewJobModal({
  open, onClose, onSubmit,
}: { open: boolean; onClose: () => void; onSubmit: (job: CronJob) => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cron, setCron] = useState('0 8 * * *');
  const [schedule, setSchedule] = useState('Daily at 08:00');
  const [agent, setAgent] = useState('orchestrator');
  const [enabled, setEnabled] = useState(true);
  const [tags, setTags] = useState('');

  // When the user picks a cron preset, auto-fill the human-readable schedule
  const applyPreset = (cronValue: string, label: string) => {
    setCron(cronValue);
    setSchedule(label);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const now = new Date();
    const inAMinute = new Date(now.getTime() + 60_000);
    const newJob: CronJob = {
      id: `c-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'Custom scheduled job.',
      cron,
      schedule,
      lastRun: null,
      nextRun: inAMinute.toISOString(),
      status: enabled ? 'ok' : 'paused',
      lastError: null,
      enabled,
      agent,
      avgDurationMs: 0,
      successRate: 1,
      owner: 'mkt-content',
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      runHistory: [],
    };
    onSubmit(newJob);
    // Reset form
    setName('');
    setDescription('');
    setCron('0 8 * * *');
    setSchedule('Daily at 08:00');
    setAgent('orchestrator');
    setEnabled(true);
    setTags('');
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New cron job"
      description="Schedule a recurring agent task."
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="primary" disabled={!name.trim() || !cron.trim()}>
            <Plus className="h-3.5 w-3.5" /> Create job
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-2xs uppercase tracking-wider text-text-tertiary">Name</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Daily Content Audit"
            className="mt-1 w-full h-9 px-3 rounded-md border border-white/[0.08] bg-white/[0.04] text-sm text-text-primary placeholder:text-text-tertiary focus:border-cyan-400/50 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-2xs uppercase tracking-wider text-text-tertiary">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="What does this job do?"
            className="mt-1 w-full px-3 py-2 rounded-md border border-white/[0.08] bg-white/[0.04] text-sm text-text-primary placeholder:text-text-tertiary focus:border-cyan-400/50 focus:outline-none resize-none"
          />
        </div>

        {/* Cron presets */}
        <div>
          <label className="text-2xs uppercase tracking-wider text-text-tertiary">Schedule preset</label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {CRON_PRESETS.map((p) => (
              <button
                key={p.cron}
                type="button"
                onClick={() => applyPreset(p.cron, p.label)}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-2xs font-medium transition-colors cursor-pointer',
                  cron === p.cron
                    ? 'bg-gradient-accent text-white border-transparent shadow-glow-cyan'
                    : 'border-white/[0.08] bg-white/[0.02] text-text-secondary hover:bg-white/5',
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-2xs uppercase tracking-wider text-text-tertiary">Cron expression</label>
            <input
              value={cron}
              onChange={(e) => setCron(e.target.value)}
              placeholder="0 8 * * *"
              className="mt-1 w-full h-9 px-3 rounded-md border border-white/[0.08] bg-white/[0.04] text-sm font-mono text-text-primary placeholder:text-text-tertiary focus:border-cyan-400/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-2xs uppercase tracking-wider text-text-tertiary">Human label</label>
            <input
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              placeholder="Daily at 08:00"
              className="mt-1 w-full h-9 px-3 rounded-md border border-white/[0.08] bg-white/[0.04] text-sm text-text-primary placeholder:text-text-tertiary focus:border-cyan-400/50 focus:outline-none"
          />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-2xs uppercase tracking-wider text-text-tertiary">Runs as</label>
            <select
              value={agent}
              onChange={(e) => setAgent(e.target.value)}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center',
                paddingRight: '28px',
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
              }}
              className="mt-1 w-full h-9 px-2 rounded-md border border-white/[0.08] bg-bg-elevated text-sm text-text-primary focus:border-cyan-400/50 focus:outline-none cursor-pointer"
            >
              {AGENT_OPTIONS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-2xs uppercase tracking-wider text-text-tertiary">Tags (comma-separated)</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="health, monitoring"
              className="mt-1 w-full h-9 px-3 rounded-md border border-white/[0.08] bg-white/[0.04] text-sm text-text-primary placeholder:text-text-tertiary focus:border-cyan-400/50 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border border-white/[0.06] bg-white/[0.02] p-2.5">
          <div>
            <div className="text-sm text-text-primary">Enabled</div>
            <div className="text-2xs text-text-tertiary">When off, the job stays paused and won't run on its schedule.</div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled(!enabled)}
            className={cn(
              'relative h-6 w-11 rounded-full border transition-colors cursor-pointer',
              enabled ? 'bg-cyan-500 border-cyan-400' : 'bg-white/[0.06] border-white/[0.08]',
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
                enabled ? 'translate-x-6' : 'translate-x-0.5',
              )}
            />
          </button>
        </div>

        {/* Hidden submit so Enter key works */}
        <button type="submit" className="hidden" />
      </form>
    </Modal>
  );
}

export default function CronPage() {
  return <ClientShell><CronContent /></ClientShell>;
}
