'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  GitBranch, Play, CheckCircle2, Circle, AlertCircle, Phone, Search,
  Search as SearchIcon, Plus,
  Database, ArrowRight, Clock, Activity, DollarSign, FileText, Hash,
  ListChecks, Loader2, Sparkles,
} from 'lucide-react';
import { ClientShell } from '@/components/shell/client-shell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs } from '@/components/ui/tabs';
import { StatusDot } from '@/components/ui/status-dot';
import { api } from '@/lib/api';
import { cn, fmtDuration, fmtRelative, fmtUsd } from '@/lib/utils';
import type { Pipeline, PipelineStep } from '@/lib/types';

const DOMAIN_COLORS: Record<string, { tone: 'cyan' | 'violet' | 'magenta' | 'success' | 'warning'; hex: string }> = {
  outreach: { tone: 'cyan', hex: '#06b6d4' },
  marketing: { tone: 'magenta', hex: '#d946ef' },
  SEO: { tone: 'success', hex: '#10b981' },
  Ads: { tone: 'warning', hex: '#f59e0b' },
  IPTV: { tone: 'violet', hex: '#8b5cf6' },
  Dev: { tone: 'cyan', hex: '#06b6d4' },
};

function PipelinesContent() {
  const { data, isLoading } = useQuery({ queryKey: ['pipelines'], queryFn: api.pipelines });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'running' | 'completed' | 'failed' | 'idle'>('all');
  const [search, setSearch] = useState('');
  const [rightTab, setRightTab] = useState('overview');
  const [running, setRunning] = useState(false);
  const [liveProgress, setLiveProgress] = React.useState<Record<string, string>>({});
  const runTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Default selection: first running or first pipeline
  useEffect(() => {
    if (!selectedId && data?.pipelines.length) {
      const first = data.pipelines.find((p) => p.status === 'running') ?? data.pipelines[0];
      setSelectedId(first.id);
    }
  }, [data, selectedId]);

  const selected = data?.pipelines.find((p) => p.id === selectedId) ?? null;

  // Filtered list
  const filtered = (data?.pipelines ?? []).filter((p) => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.domain.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Animated Run
  const runPipeline = (p: Pipeline) => {
    if (running) return;
    setRunning(true);
    setLiveProgress({});
    let stepIdx = 0;
    const steps = p.steps;
    const tick = () => {
      if (stepIdx >= steps.length) {
        setRunning(false);
        return;
      }
      const s = steps[stepIdx];
      setLiveProgress((prev) => ({ ...prev, [s.id]: 'completed' }));
      setLiveProgress((prev) => {
        const next = { ...prev };
        if (stepIdx + 1 < steps.length) next[steps[stepIdx + 1].id] = 'active';
        return next;
      });
      stepIdx++;
      runTimerRef.current = setTimeout(tick, 1200);
    };
    tick();
  };

  useEffect(() => {
    return () => { if (runTimerRef.current) clearTimeout(runTimerRef.current); };
  }, []);

  if (isLoading || !data) {
    return (
      <>
        <PageHeader
          title="Pipelines & Workflows"
          description="Multi-step agent workflows with step-by-step progress."
          icon={<GitBranch className="h-4 w-4 text-white" />}
        />
        <Skeleton className="h-[600px]" />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Pipelines & Workflows"
        description="Multi-step agent workflows. Click a pipeline to inspect its step graph, run history, and live data flow."
        icon={<GitBranch className="h-4 w-4 text-white" />}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary">
              <Plus className="h-3.5 w-3.5" /> New pipeline
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ─── LEFT RAIL: pipeline list ─── */}
        <Card innerGlow className="lg:col-span-3 flex flex-col">
          <CardHeader className="flex-shrink-0">
            <div className="flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-accent-cyan" />
              <CardTitle>All pipelines</CardTitle>
            </div>
            <Badge tone="cyan">{filtered.length}</Badge>
          </CardHeader>
          {/* Filters + search */}
          <div className="px-4 pt-4 pb-4 border-b border-white/[0.06] flex-shrink-0 space-y-3">
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-text-tertiary" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-full h-7 pl-7 pr-2 rounded-md border border-white/[0.08] bg-white/[0.04] text-xs text-text-primary placeholder:text-text-tertiary focus:border-cyan-400/50 focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(['all', 'running', 'completed', 'failed', 'idle'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'rounded-full border px-2.5 py-0.5 text-2xs font-medium transition-colors cursor-pointer capitalize',
                    filter === f
                      ? 'bg-gradient-accent text-white border-transparent shadow-glow-cyan'
                      : 'border-white/[0.08] text-text-secondary hover:bg-white/5',
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          {/* List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
            {filtered.map((p) => {
              const domain = DOMAIN_COLORS[p.domain] ?? DOMAIN_COLORS.outreach;
              const isSelected = selectedId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={cn(
                    'w-full text-left rounded-lg p-2.5 border transition-all cursor-pointer',
                    isSelected
                      ? `border-${domain.tone === 'cyan' ? 'cyan-400' : domain.tone === 'violet' ? 'accent-violet' : domain.tone === 'magenta' ? 'accent-magenta' : domain.tone === 'success' ? 'status-success' : 'status-warning'}/50 bg-white/[0.04]`
                      : 'border-transparent hover:border-white/[0.08] hover:bg-white/[0.02]',
                  )}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <StatusDot
                      status={p.status === 'running' ? 'live' : p.status === 'completed' ? 'success' : p.status === 'failed' ? 'danger' : 'idle'}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-text-primary truncate">{p.name}</div>
                      <div className="text-[10px] text-text-tertiary truncate">{p.domain}</div>
                    </div>
                    <Badge
                      tone={p.status === 'running' ? 'cyan' : p.status === 'completed' ? 'success' : p.status === 'failed' ? 'danger' : 'default'}
                      className="text-[10px]"
                    >
                      {p.progress}%
                    </Badge>
                  </div>
                  {/* Mini progress bar */}
                  <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden mb-1">
                    <div
                      className={cn(
                        'h-full transition-all duration-700',
                        p.status === 'failed' ? 'bg-status-danger'
                        : p.status === 'completed' ? 'bg-status-success'
                        : p.status === 'running' ? 'bg-gradient-accent'
                        : 'bg-white/20',
                      )}
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-text-tertiary font-mono">
                    <span>{p.steps.length} steps</span>
                    <span>{p.lastRun ? fmtRelative(p.lastRun) : 'never'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* ─── CENTER: flow diagram ─── */}
        <Card innerGlow className="lg:col-span-6 flex flex-col">
          {selected ? (
            <>
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <GitBranch className="h-4 w-4 text-accent-cyan flex-shrink-0" />
                  <div className="min-w-0">
                    <CardTitle className="truncate">{selected.name}</CardTitle>
                    <p className="text-2xs text-text-tertiary font-mono mt-0.5 truncate">{selected.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={pipelineTone(selected.status)} dot>{selected.status}</Badge>
                  <Button
                    size="sm"
                    variant={running ? 'ghost' : 'primary'}
                    onClick={() => runPipeline(selected)}
                    disabled={running}
                  >
                    {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                    {running ? 'Running…' : 'Run pipeline'}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col min-h-0">
                {/* Flow graph — fits inside the container, no scroll */}
                <div className="flex-1 min-h-0 py-4 flex items-center justify-center">
                  <FlowGraph pipeline={selected} liveProgress={liveProgress} running={running} progress={selected.progress} />
                </div>

                {/* Hero stats — compact row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 mt-2 border-t border-white/[0.06] flex-shrink-0">
                  <Stat icon={<Activity className="h-3 w-3" />} label="Progress" value={<span className="font-mono text-base text-text-primary">{selected.progress}%</span>} />
                  <Stat icon={<Clock className="h-3 w-3" />} label="Last duration" value={<span className="font-mono text-base text-text-primary">{fmtDuration(selected.lastDurationMs ?? 0)}</span>} />
                  <Stat icon={<DollarSign className="h-3 w-3" />} label="Cost / run" value={<span className="font-mono text-base text-text-primary">{fmtUsd(estimatedCost(selected))}</span>} />
                  <Stat icon={<CheckCircle2 className="h-3 w-3" />} label="Steps" value={<span className="font-mono text-base text-text-primary">{selected.steps.filter((s) => s.status === 'completed').length}/{selected.steps.length}</span>} />
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center text-center">
              <div>
                <GitBranch className="h-10 w-10 text-text-tertiary mx-auto mb-2" />
                <h3 className="text-sm font-medium text-text-primary">Select a pipeline</h3>
                <p className="text-xs text-text-tertiary">Pick one from the list to see its flow graph.</p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* ─── RIGHT RAIL: tabs ─── */}
        <Card innerGlow className="lg:col-span-3 flex flex-col">
          {selected ? (
            <>
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-accent-violet" />
                  <CardTitle>Inspect</CardTitle>
                </div>
                <Badge tone="violet">{selected.steps.length}</Badge>
              </CardHeader>
              <div className="px-4 pt-4 pb-3 flex-shrink-0 border-b border-white/[0.06]">
                <Tabs
                  tabs={[
                    { id: 'overview', label: 'Overview' },
                    { id: 'steps', label: 'Steps' },
                    { id: 'flow', label: 'Data' },
                    { id: 'logs', label: 'Logs' },
                  ]}
                  active={rightTab}
                  onChange={setRightTab}
                  className="w-full flex-wrap [&>button]:flex-1 [&>button]:justify-center [&>button]:min-w-0 [&>button]:px-2"
                />
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto p-4 scrollbar-hide">
                {rightTab === 'overview' && <OverviewTab pipeline={selected} />}
                {rightTab === 'steps' && <StepsTab pipeline={selected} liveProgress={liveProgress} />}
                {rightTab === 'flow' && <FlowTab pipeline={selected} />}
                {rightTab === 'logs' && <LogsTab pipeline={selected} />}
              </div>
            </>
          ) : null}
        </Card>
      </div>
    </>
  );
}

// ─── Flow Graph (the centerpiece) ─────────────────────────────────
// Steps are arranged at the cardinal positions of an invisible circle (top/right/bottom/left).
// No connecting lines — the workflow order is read top → right → bottom → left by convention.
function FlowGraph({ pipeline, liveProgress, running, progress }: { pipeline: Pipeline; liveProgress: Record<string, string>; running: boolean; progress: number }) {
  const steps = pipeline.steps;
  const N = steps.length;

  // Square container. 360px gives the flow enough breathing room without forcing a scroll.
  const CONTAINER = 360;
  // Virtual circle radius (viewBox units 0-100). Steps sit on this circle.
  const STEP_RADIUS = 36;

  // Position each step on the virtual circle
  const positions = steps.map((_, i) => {
    const angle = (i / N) * 2 * Math.PI - Math.PI / 2; // start at top
    return {
      x: 50 + STEP_RADIUS * Math.cos(angle),
      y: 50 + STEP_RADIUS * Math.sin(angle),
    };
  });

  return (
    <div className="relative w-full h-full flex items-center justify-center p-2">
      <div
        className="relative"
        style={{ width: CONTAINER, height: CONTAINER, maxWidth: '100%' }}
      >
        {/* Nodes — absolutely positioned at the cardinal points (no connecting lines) */}
        {steps.map((step, i) => {
          const pos = positions[i];
          return (
            <div
              key={step.id}
              className="absolute"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <FlowNode
                step={step}
                idx={i}
                status={(liveProgress[step.id] ?? step.status) as any}
                running={running}
                progress={progress}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FlowNode({ step, idx, status, running, progress }: { step: PipelineStep; idx: number; status: 'completed' | 'active' | 'pending' | 'failed'; running: boolean; progress: number }) {
  const isCompleted = status === 'completed';
  const isActive = status === 'active';
  const isFailed = status === 'failed';

  // Sized so the node's outer edge sits on the circle (radius 36% of 360 = ~130, half = 65; node radius = 52 → edge at 36% when center at 36%)
  const SIZE = 88;
  const STROKE = 4;
  const RADIUS = (SIZE - STROKE) / 2;
  const CIRC = 2 * Math.PI * RADIUS;
  const dashOffset = CIRC * (1 - Math.max(0, Math.min(100, progress)) / 100);

  // Color of the progress ring depends on the progress value (cool→warm gradient)
  const p = progress;
  const progressStroke =
    p >= 85 ? '#10b981' :
    p >= 60 ? '#f59e0b' :
    p >= 30 ? '#8b5cf6' :
              '#06b6d4';

  return (
    <div className="flex flex-col items-center flex-shrink-0">
      {/* Step label */}
      <div className="text-[9px] text-text-tertiary uppercase tracking-wider mb-1 truncate w-full text-center max-w-[100px]">
        Step {idx + 1}
      </div>

      {/* Ring + node */}
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg
          className="absolute inset-0"
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
        >
          {/* Background "track" ring — broken/dashed segments like the sketch */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={STROKE}
            strokeDasharray="4 6"
          />
          {/* Solid progress arc — drawn as a stroke arc based on progress */}
          {progress > 0 && (
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={isFailed ? '#ef4444' : progressStroke}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
              style={{ transition: 'stroke-dashoffset 700ms ease-out' }}
            />
          )}
        </svg>

        {/* Inner node circle (just a soft glow, no extra ring) */}
        {isActive && (
          <div className="absolute inset-2 rounded-full bg-cyan-400/20 blur-md" />
        )}
        <div
          className={cn(
            'absolute rounded-full border-2 flex items-center justify-center transition-all duration-500',
            isCompleted && 'border-status-success bg-status-success/15 shadow-glow-success',
            isActive && 'border-cyan-400 bg-cyan-500/20 shadow-glow-cyan',
            isFailed && 'border-status-danger bg-status-danger/15 shadow-glow-danger',
            !isCompleted && !isActive && !isFailed && 'border-white/[0.1] bg-white/[0.04]',
          )}
          style={{ top: STROKE + 2, left: STROKE + 2, right: STROKE + 2, bottom: STROKE + 2 }}
        >
          {isCompleted && <CheckCircle2 className="h-6 w-6 text-status-success" />}
          {isActive && (running ? <Loader2 className="h-6 w-6 text-accent-cyan animate-spin" /> : <span className="font-mono text-base font-bold text-accent-cyan">{idx + 1}</span>)}
          {isFailed && <AlertCircle className="h-6 w-6 text-status-danger" />}
          {!isCompleted && !isActive && !isFailed && <Circle className="h-5 w-5 text-text-tertiary" />}
        </div>

        {/* Progress % label (top-right of the ring) */}
        <div className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-bg-root border border-white/[0.1] text-[9px] font-mono font-semibold text-text-primary">
          {Math.round(progress)}%
        </div>
      </div>

      {/* Name */}
      <div className="mt-1.5 text-center w-full max-w-[120px]">
        <div className={cn(
          'text-xs font-medium truncate',
          isActive ? 'text-accent-cyan' : isCompleted ? 'text-text-primary' : isFailed ? 'text-status-danger' : 'text-text-secondary',
        )}>
          {step.name}
        </div>
        <div className="text-[9px] text-text-tertiary mt-0.5 uppercase tracking-wider">
          {isCompleted ? 'done' : isActive ? 'running' : isFailed ? 'failed' : 'queued'}
        </div>
      </div>
    </div>
  );
}

// ─── Right-side tabs ───────────────────────────────────────────────
function OverviewTab({ pipeline }: { pipeline: Pipeline }) {
  const completed = pipeline.steps.filter((s) => s.status === 'completed').length;
  const failed = pipeline.steps.filter((s) => s.status === 'failed').length;
  const running = pipeline.steps.filter((s) => s.status === 'active').length;
  const pending = pipeline.steps.filter((s) => s.status === 'pending').length;
  return (
    <div className="space-y-4">
      <div>
        <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-1.5">Description</div>
        <p className="text-xs text-text-secondary leading-relaxed">{pipeline.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <OverviewStat label="Domain" value={pipeline.domain} />
        <OverviewStat label="Total steps" value={String(pipeline.steps.length)} />
        <OverviewStat label="Last run" value={pipeline.lastRun ? fmtRelative(pipeline.lastRun) : 'never'} />
        <OverviewStat label="Duration" value={fmtDuration(pipeline.lastDurationMs ?? 0)} />
      </div>

      <div>
        <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-1.5">Step status</div>
        <div className="grid grid-cols-4 gap-1.5 text-center">
          <StatusCount label="Done" count={completed} color="success" />
          <StatusCount label="Active" count={running} color="cyan" />
          <StatusCount label="Failed" count={failed} color="danger" />
          <StatusCount label="Pending" count={pending} color="default" />
        </div>
      </div>

      <div>
        <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-1.5">Last result</div>
        <div className={cn(
          'rounded-md border p-2.5 text-2xs',
          pipeline.lastResult === 'success' ? 'border-status-success/20 bg-status-success/5 text-status-success' : 'border-status-danger/20 bg-status-danger/5 text-status-danger',
        )}>
          <div className="font-medium">{pipeline.lastResult === 'success' ? '✓ Succeeded' : '✗ Failed'}</div>
          {pipeline.lastResult === 'success'
            ? <div className="text-text-tertiary mt-0.5">All steps completed in {fmtDuration(pipeline.lastDurationMs ?? 0)}.</div>
            : <div className="text-text-tertiary mt-0.5">Pipeline halted at a failed step. Inspect the step log to retry.</div>}
        </div>
      </div>
    </div>
  );
}

function StatusCount({ label, count, color }: { label: string; count: number; color: 'success' | 'cyan' | 'danger' | 'default' }) {
  return (
    <div className={cn(
      'rounded-md border p-2',
      color === 'success' ? 'border-status-success/20 bg-status-success/5' :
      color === 'cyan' ? 'border-cyan-400/20 bg-cyan-500/5' :
      color === 'danger' ? 'border-status-danger/20 bg-status-danger/5' :
      'border-white/[0.06] bg-white/[0.02]',
    )}>
      <div className={cn(
        'font-mono text-base font-semibold',
        color === 'success' ? 'text-status-success' :
        color === 'cyan' ? 'text-accent-cyan' :
        color === 'danger' ? 'text-status-danger' :
        'text-text-secondary',
      )}>{count}</div>
      <div className="text-2xs text-text-tertiary">{label}</div>
    </div>
  );
}

function OverviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2">
      <div className="text-2xs text-text-tertiary uppercase tracking-wider">{label}</div>
      <div className="text-xs text-text-primary mt-0.5 truncate">{value}</div>
    </div>
  );
}

function StepsTab({ pipeline, liveProgress }: { pipeline: Pipeline; liveProgress: Record<string, string> }) {
  return (
    <div className="space-y-1.5">
      {pipeline.steps.map((step, i) => {
        const live = liveProgress[step.id];
        const status = (live ?? step.status) as 'completed' | 'active' | 'pending' | 'failed';
        return (
          <div key={step.id} className={cn(
            'rounded-md border p-2.5',
            status === 'completed' && 'border-status-success/20 bg-status-success/5',
            status === 'active' && 'border-cyan-400/30 bg-cyan-500/5',
            status === 'failed' && 'border-status-danger/20 bg-status-danger/5',
            status === 'pending' && 'border-white/[0.06] bg-white/[0.02]',
          )}>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/[0.08] bg-bg-root text-2xs font-mono text-text-tertiary">
                {i + 1}
              </span>
              <span className="text-xs font-medium text-text-primary flex-1">{step.name}</span>
              <StatusDot
                status={status === 'completed' ? 'success' : status === 'active' ? 'live' : status === 'failed' ? 'danger' : 'idle'}
              />
            </div>
            <p className="text-2xs text-text-secondary ml-7 leading-relaxed">{step.description}</p>
            {(step.input || step.output) && (
              <div className="ml-7 mt-1.5 grid grid-cols-1 gap-0.5 text-[10px] font-mono">
                {step.input && (
                  <div className="flex items-center gap-1 truncate">
                    <span className="text-text-tertiary">in:</span>
                    <span className="text-text-primary truncate">{step.input}</span>
                  </div>
                )}
                {step.output && (
                  <div className="flex items-center gap-1 truncate">
                    <span className="text-text-tertiary">out:</span>
                    <span className="text-text-primary truncate">{step.output}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function FlowTab({ pipeline }: { pipeline: Pipeline }) {
  // Data flow: each step's output → next step's input
  const links: { from: string; to: string; artifact: string }[] = [];
  for (let i = 0; i < pipeline.steps.length - 1; i++) {
    const cur = pipeline.steps[i];
    const nxt = pipeline.steps[i + 1];
    if (cur.output) {
      links.push({ from: cur.name, to: nxt.name, artifact: cur.output });
    }
  }
  return (
    <div className="space-y-3">
      <div>
        <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-1.5">Data flow</div>
        <p className="text-2xs text-text-tertiary mb-2">
          How artifacts (files, JSON, etc.) flow from one step's output to the next step's input.
        </p>
      </div>
      {links.length === 0 ? (
        <div className="text-2xs text-text-tertiary italic">No data flow links defined for this pipeline.</div>
      ) : (
        <div className="space-y-1.5">
          {links.map((l, i) => (
            <div key={i} className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2.5">
              <div className="flex items-center gap-1.5 text-2xs mb-1">
                <span className="text-text-primary font-medium">{l.from}</span>
                <ArrowRight className="h-3 w-3 text-accent-cyan flex-shrink-0" />
                <span className="text-text-primary font-medium">{l.to}</span>
              </div>
              <div className="font-mono text-[10px] text-accent-cyan flex items-center gap-1 truncate">
                <Database className="h-2.5 w-2.5 flex-shrink-0" />
                {l.artifact}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pt-3 border-t border-white/[0.06]">
        <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-1.5">Integrations</div>
        <div className="space-y-1.5">
          {pipeline.id === 'pipe-outreach' && (
            <>
              <Integration icon={Phone} name="Vapi" status="connected" desc="Outbound voice calls" />
              <Integration icon={Search} name="Apollo" status="connected" desc="Lead enrichment" />
              <Integration icon={Database} name="Google Maps" status="connected" desc="Local business leads" />
            </>
          )}
          {pipeline.id === 'pipe-content' && (
            <>
              <Integration icon={Sparkles} name="OpenRouter" status="connected" desc="Model provider" />
              <Integration icon={Hash} name="X / Reddit / HN" status="connected" desc="Trend sources" />
            </>
          )}
          {pipeline.id === 'pipe-ads' && (
            <Integration icon={AlertCircle} name="Meta Ads API" status="failed" desc="Insufficient permissions" />
          )}
          {pipeline.id === 'pipe-seo' && (
            <Integration icon={Search} name="Keyword Tool" status="connected" desc="Search volume data" />
          )}
        </div>
      </div>
    </div>
  );
}

function Integration({ icon: Icon, name, status, desc }: { icon: any; name: string; status: 'connected' | 'failed' | 'idle'; desc: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-white/[0.06] bg-white/[0.02] p-2">
      <div className={cn(
        'flex h-7 w-7 items-center justify-center rounded-md flex-shrink-0',
        status === 'connected' ? 'bg-status-success/15 text-status-success' : status === 'failed' ? 'bg-status-danger/15 text-status-danger' : 'bg-white/[0.06] text-text-tertiary',
      )}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-text-primary truncate">{name}</div>
        <div className="text-[10px] text-text-tertiary truncate">{desc}</div>
      </div>
      <Badge tone={status === 'connected' ? 'success' : status === 'failed' ? 'danger' : 'default'} className="text-[10px]">
        {status}
      </Badge>
    </div>
  );
}

function LogsTab({ pipeline }: { pipeline: Pipeline }) {
  // Synthesize plausible log entries from the pipeline state
  const logs: { ts: string; level: 'info' | 'success' | 'error' | 'warn'; msg: string }[] = [];
  const baseTime = new Date(pipeline.lastRun ?? Date.now());
  logs.push({ ts: baseTime.toISOString(), level: 'info', msg: `Pipeline started: ${pipeline.name}` });
  pipeline.steps.forEach((s, i) => {
    if (s.status === 'completed') {
      logs.push({ ts: new Date(baseTime.getTime() + i * 60_000).toISOString(), level: 'success', msg: `Step ${i + 1} (${s.name}) completed` });
    } else if (s.status === 'active') {
      logs.push({ ts: new Date(baseTime.getTime() + i * 60_000).toISOString(), level: 'info', msg: `Step ${i + 1} (${s.name}) started` });
    } else if (s.status === 'failed') {
      logs.push({ ts: new Date(baseTime.getTime() + i * 60_000).toISOString(), level: 'error', msg: `Step ${i + 1} (${s.name}) failed` });
    }
  });
  if (pipeline.lastResult) {
    logs.push({ ts: new Date(baseTime.getTime() + pipeline.steps.length * 60_000).toISOString(), level: pipeline.lastResult === 'success' ? 'success' : 'error', msg: `Pipeline ${pipeline.lastResult}` });
  }
  return (
    <div className="space-y-1">
      {logs.length === 0 ? (
        <div className="text-text-tertiary italic text-2xs">No logs yet.</div>
      ) : (
        <>
          <div className="flex items-center justify-between text-2xs uppercase tracking-wider text-text-tertiary mb-2 px-1">
            <span>{logs.length} entries</span>
            <span className="font-mono normal-case tracking-normal">{fmtRelative(logs[0].ts)}</span>
          </div>
          {logs.map((l, i) => (
            <div key={i} className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2 hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-mono font-semibold uppercase tracking-wider',
                    l.level === 'info' && 'bg-status-info/15 text-status-info',
                    l.level === 'success' && 'bg-status-success/15 text-status-success',
                    l.level === 'error' && 'bg-status-danger/15 text-status-danger',
                    l.level === 'warn' && 'bg-status-warning/15 text-status-warning',
                  )}
                >
                  {l.level}
                </span>
                <span className="font-mono text-[10px] text-text-tertiary flex-1">{l.ts.slice(11, 19)}</span>
                <span className="text-[10px] text-text-tertiary font-mono">{fmtRelative(l.ts)}</span>
              </div>
              <div className="text-xs text-text-secondary leading-relaxed pl-0.5">{l.msg}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────
function pipelineTone(status: Pipeline['status']): 'cyan' | 'success' | 'danger' | 'default' {
  if (status === 'running') return 'cyan';
  if (status === 'completed') return 'success';
  if (status === 'failed') return 'danger';
  return 'default';
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2">
      <div className="flex items-center gap-1 text-text-tertiary text-2xs uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <div className="mt-0.5">{value}</div>
    </div>
  );
}

function estimatedCost(p: Pipeline): number {
  // rough estimate based on number of steps and average duration
  const avgPerStep = 0.012;
  return Number((p.steps.length * avgPerStep).toFixed(3));
}

export default function PipelinesPage() {
  return <ClientShell><PipelinesContent /></ClientShell>;
}
