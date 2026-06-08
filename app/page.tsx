'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip as RechartsTooltip, CartesianGrid, PieChart, Pie, Cell,
} from 'recharts';
import {
  Activity, Cpu, MemoryStick, HardDrive, Server, Zap, MessageSquare,
  Bot, GitBranch, DollarSign, ArrowUpRight, ArrowDownRight,
  CheckCircle2, XCircle, AlertTriangle, Clock, Send, RefreshCw,
  Download,
} from 'lucide-react';
import { ClientShell } from '@/components/shell/client-shell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusDot } from '@/components/ui/status-dot';
import { Progress } from '@/components/ui/progress';
import { Stat } from '@/components/ui/stat';
import { Skeleton } from '@/components/ui/skeleton';
import { useUIStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { fmtUsd, fmtBytes, fmtDuration, fmtPct, fmtTime, fmtRelative, cn } from '@/lib/utils';

const CHART_COLORS = {
  cyan: '#06b6d4',
  violet: '#8b5cf6',
  magenta: '#d946ef',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  text: '#94a3b8',
  border: 'rgba(255,255,255,0.06)',
};

const tooltipStyle = {
  contentStyle: {
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    fontSize: '12px',
    backdropFilter: 'blur(12px)',
  },
  labelStyle: { color: '#f8fafc', fontWeight: 500, marginBottom: 4 },
  itemStyle: { color: '#94a3b8' },
};

function MetricTile({
  label, value, sub, icon, tone, status, spark, sparkColor, footer,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon: React.ReactNode;
  tone?: 'cyan' | 'success' | 'warning' | 'danger';
  status?: 'live' | 'success' | 'warning' | 'danger' | 'idle';
  spark?: number[];
  sparkColor?: 'cyan' | 'success' | 'warning' | 'danger' | 'violet' | 'magenta';
  footer?: React.ReactNode;
}) {
  const stroke = {
    cyan: CHART_COLORS.cyan,
    success: CHART_COLORS.success,
    warning: CHART_COLORS.warning,
    danger: CHART_COLORS.danger,
    violet: CHART_COLORS.violet,
    magenta: CHART_COLORS.magenta,
  }[sparkColor ?? 'cyan'];
  const id = `spark-${label.replace(/\s+/g, '')}`;

  return (
    <Card innerGlow className="p-4 flex flex-col">
      <div className="flex items-start justify-between mb-2">
        <div className="text-2xs uppercase tracking-wider text-text-tertiary">{label}</div>
        <div
          className={cn('flex h-7 w-7 items-center justify-center rounded-md', {
            'bg-cyan-500/10 text-accent-cyan': tone === 'cyan',
            'bg-status-success/10 text-status-success': tone === 'success',
            'bg-status-warning/10 text-status-warning': tone === 'warning',
            'bg-status-danger/10 text-status-danger': tone === 'danger',
          })}
        >
          {icon}
        </div>
      </div>
      <div className="font-mono text-lg font-semibold tracking-tight text-text-primary">{value}</div>
      {sub && <div className="mt-1 text-2xs text-text-tertiary">{sub}</div>}
      {status && <div className="mt-2"><StatusDot status={status} label /></div>}
      {spark && spark.length > 0 && (
        <div className="mt-3 -mx-1 h-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spark.map((v, i) => ({ i, v }))}>
              <defs>
                <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={stroke}
                strokeWidth={1.5}
                fill={`url(#${id})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      {footer && (
        <div className="mt-2 pt-2 border-t border-white/[0.06] text-2xs text-text-tertiary flex items-center justify-between gap-3">
          {Array.isArray(footer)
            ? footer.map((item, i) => (
                <span key={i} className="flex items-center gap-1.5 min-w-0">
                  {item}
                </span>
              ))
            : <span className="flex items-center gap-1.5 min-w-0">{footer}</span>}
        </div>
      )}
    </Card>
  );
}

function HomeContent() {
  const { setPage } = useUIStore();
  const router = useRouter();
  const go = (page: string) => { setPage(page as any); router.push(page === 'home' ? '/' : `/${page}`); };
  const { data: health, isLoading: hLoading } = useQuery({ queryKey: ['health'], queryFn: api.health, refetchInterval: 10_000 });
  const { data: agents, isLoading: aLoading } = useQuery({ queryKey: ['agents'], queryFn: api.agents });
  const { data: pipelines, isLoading: pLoading } = useQuery({ queryKey: ['pipelines'], queryFn: api.pipelines });
  const { data: logs, isLoading: lLoading } = useQuery({ queryKey: ['logs'], queryFn: api.logs });
  const { data: credits, isLoading: cLoading } = useQuery({ queryKey: ['credits'], queryFn: api.credits });

  const isLoading = hLoading || aLoading || pLoading || lLoading || cLoading;

  // Derived
  const activeAgents = agents?.domains.flatMap((d) => d.agents).filter((a) => a.status === 'working').length ?? 0;
  const totalAgents = agents?.domains.flatMap((d) => d.agents).length ?? 0;
  const tasksToday = agents?.domains.flatMap((d) => d.agents).reduce((sum, a) => sum + a.tasksToday, 0) ?? 0;
  const tasksCompleted = logs?.logs.filter((l) => l.status === 'completed').length ?? 0;
  const tasksFailed = logs?.logs.filter((l) => l.status === 'failed' || l.status === 'timeout').length ?? 0;
  const completionRate = tasksCompleted + tasksFailed > 0 ? tasksCompleted / (tasksCompleted + tasksFailed) : 0;

  const recentEvents = logs?.logs.slice(0, 10) ?? [];

  const agentActivity = (() => {
    if (!logs) return [];
    const map = new Map<string, number>();
    logs.logs.forEach((l) => map.set(l.agent, (map.get(l.agent) ?? 0) + 1));
    return Array.from(map.entries())
      .map(([agent, count]) => ({ agent: agent.split('-').slice(-1)[0], count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  })();

  const dailyCredits = credits?.dailyHistory.slice(-14) ?? [];
  const today = dailyCredits[dailyCredits.length - 1]?.amount ?? 0;
  const yesterday = dailyCredits[dailyCredits.length - 2]?.amount ?? 0;
  const trendPct = yesterday > 0 ? ((today - yesterday) / yesterday) * 100 : 0;

  const completionData = [
    { name: 'Completed', value: tasksCompleted, color: CHART_COLORS.success },
    { name: 'Failed', value: tasksFailed, color: CHART_COLORS.danger },
  ];

  return (
    <>
      {/* Top status strip — 4 metric tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : (
          <>
            <MetricTile
              label="Gateway"
              value={
                <span className="flex items-center gap-2">
                  {health?.gateway.state === 'running' ? 'Running' : 'Down'}
                  <span className="font-mono text-xs text-text-tertiary">PID {health?.gateway.pid}</span>
                </span>
              }
              sub={`Uptime ${fmtDuration((health?.gateway.uptime ?? 0) * 1000)}`}
              icon={<Server className="h-3.5 w-3.5" />}
              tone="cyan"
              status={health?.gateway.state === 'running' ? 'live' : 'danger'}
              spark={health?.gateway.memoryHistory}
              sparkColor="cyan"
              footer={[
                <>
                  Mem <span className="font-mono text-text-primary">{health?.gateway.memoryMb}MB</span>
                </>,
                <>
                  Restarts <span className="font-mono text-text-primary">{health?.gateway.restartCount}</span>
                </>,
              ]}
            />
            <MetricTile
              label="Platforms"
              value={
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-sm">
                    <MessageSquare className="h-3.5 w-3.5 text-status-info" /> TG
                    <span className={cn('h-1.5 w-1.5 rounded-full', health?.platforms.telegram.state === 'connected' ? 'bg-status-success' : 'bg-status-danger')} />
                  </span>
                  <span className="flex items-center gap-1 text-sm">
                    <MessageSquare className="h-3.5 w-3.5 text-accent-violet" /> DC
                    <span className={cn('h-1.5 w-1.5 rounded-full', health?.platforms.discord.state === 'connected' ? 'bg-status-success' : 'bg-status-danger')} />
                  </span>
                </div>
              }
              sub={`Discord latency ${health?.platforms.discord.latencyMs}ms`}
              icon={<MessageSquare className="h-3.5 w-3.5" />}
              tone="success"
              spark={health?.platforms.discord.latencyHistory}
              sparkColor="success"
              footer={[
                <>
                  Last msg <span className="font-mono text-text-primary">{fmtRelative(health?.platforms.telegram.lastMessageAt)}</span>
                </>,
                <>
                  <span className="font-mono text-text-primary">{health?.platforms.discord.channels}</span> channels
                </>,
              ]}
            />
            <MetricTile
              label="Model"
              value={<span className="font-mono text-sm">{health?.model.primary.split('/').pop()}</span>}
              sub={
                <span className="flex items-center gap-1">
                  <span className="text-text-tertiary">Provider:</span> {health?.model.provider}
                </span>
              }
              icon={<Bot className="h-3.5 w-3.5" />}
              tone="cyan"
              spark={health?.model.callHistory}
              sparkColor="violet"
              footer={[
                <>
                  Fallback <span className="font-mono text-text-primary truncate max-w-[100px] inline-block align-middle">{health?.model.fallback.split('/').pop()}</span>
                </>,
                <>
                  <span className="font-mono text-text-primary">{logs?.logs.length ?? 0}</span> calls
                </>,
              ]}
            />
            <MetricTile
              label="Credits"
              value={
                <span className="flex items-baseline gap-1.5">
                  <span>{fmtUsd(health?.credits.used ?? 0)}</span>
                  <span className="text-2xs text-text-tertiary">used</span>
                  <span className="text-2xs text-text-tertiary">·</span>
                  <span className="text-2xs text-text-tertiary">{fmtUsd(health?.credits.remaining ?? 0)} left</span>
                </span>
              }
              sub={
                <Progress
                  value={((health?.credits.used ?? 0) / (health?.credits.limit ?? 100)) * 100}
                  tone={((health?.credits.used ?? 0) / (health?.credits.limit ?? 100)) > 0.95 ? 'danger' : 'cyan'}
                  className="mt-1"
                />
              }
              icon={<DollarSign className="h-3.5 w-3.5" />}
              tone={((health?.credits.used ?? 0) / (health?.credits.limit ?? 100)) > 0.5 ? 'warning' : 'cyan'}
              spark={health?.credits.dailyHistory.slice(-24).map((d) => d.amount)}
              sparkColor="warning"
              footer={[
                <>
                  Today <span className="font-mono text-text-primary">{fmtUsd(health?.credits.dailyUsed ?? 0)}</span>
                </>,
                <>
                  Limit <span className="font-mono text-text-primary">{fmtUsd(health?.credits.limit ?? 100)}</span>
                </>,
              ]}
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-2xs uppercase tracking-wider text-text-tertiary mr-2">Quick actions:</span>
        <Button variant="secondary" size="sm" onClick={() => go('pipelines')}>
          <Zap className="h-3.5 w-3.5" /> Run Pipeline
        </Button>
        <Button variant="secondary" size="sm" onClick={() => go('health')}>
          <RefreshCw className="h-3.5 w-3.5" /> Restart Gateway
        </Button>
        <Button variant="secondary" size="sm" onClick={() => go('logs')}>
          <Download className="h-3.5 w-3.5" /> Export Logs
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setPage('agents')}>
          <Send className="h-3.5 w-3.5" /> Send Test Message
        </Button>
      </div>

      {/* Bento grid 2x2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* VPS at a glance */}
        <Card innerGlow>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-accent-cyan" />
              <CardTitle>VPS at a glance</CardTitle>
            </div>
            <Badge tone="success" dot>Healthy</Badge>
          </CardHeader>
          <CardContent>
            {hLoading ? (
              <Skeleton className="h-32" />
            ) : health ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <Stat
                    label="CPU Cores"
                    value={health.vps.cpu.cores}
                    icon={<Cpu className="h-3.5 w-3.5" />}
                  />
                  <Stat
                    label="Load Avg"
                    value={
                      <span className="text-base">
                        {health.vps.cpu.load1.toFixed(2)} / {health.vps.cpu.load5.toFixed(2)}
                      </span>
                    }
                    hint="1m / 5m"
                  />
                  <Stat
                    label="Uptime"
                    value={<span className="text-base">{fmtDuration(health.vps.uptime * 1000)}</span>}
                    icon={<Clock className="h-3.5 w-3.5" />}
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-2xs">
                      <span className="flex items-center gap-1.5 text-text-secondary">
                        <MemoryStick className="h-3 w-3" /> RAM
                      </span>
                      <span className="font-mono text-text-primary">
                        {health.vps.ram.used.toFixed(1)} / {health.vps.ram.total} GB
                        <span className="text-text-tertiary"> · {fmtPct(health.vps.ram.pct, 0)}</span>
                      </span>
                    </div>
                    <Progress
                      value={health.vps.ram.pct * 100}
                      tone={health.vps.ram.pct > 0.9 ? 'danger' : health.vps.ram.pct > 0.75 ? 'warning' : 'cyan'}
                    />
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-2xs">
                      <span className="flex items-center gap-1.5 text-text-secondary">
                        <HardDrive className="h-3 w-3" /> Disk
                      </span>
                      <span className="font-mono text-text-primary">
                        {health.vps.disk.used} / {health.vps.disk.total} GB
                        <span className="text-text-tertiary"> · {fmtPct(health.vps.disk.pct, 0)}</span>
                      </span>
                    </div>
                    <Progress value={health.vps.disk.pct * 100} tone="violet" />
                  </div>
                </div>

                {/* Sparkline */}
                <div className="h-16 -mx-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={health.vps.cpu.history.map((v, i) => ({ i, v }))}>
                      <defs>
                        <linearGradient id="loadGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={CHART_COLORS.cyan} stopOpacity={0.4} />
                          <stop offset="100%" stopColor={CHART_COLORS.cyan} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="v"
                        stroke={CHART_COLORS.cyan}
                        strokeWidth={1.5}
                        fill="url(#loadGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between text-2xs text-text-tertiary font-mono">
                  <span>In: {fmtBytes(health.vps.network.bytesIn)}</span>
                  <span>Out: {fmtBytes(health.vps.network.bytesOut)}</span>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Agents today */}
        <Card innerGlow className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-accent-violet" />
              <CardTitle>Agents today</CardTitle>
            </div>
            <Badge tone="cyan" dot>
              {activeAgents}/{totalAgents} active
            </Badge>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {aLoading || lLoading ? (
              <Skeleton className="h-full min-h-[200px]" />
            ) : (
              <>
                {/* Centerpiece: large donut with the success rate in the middle */}
                <div className="flex-1 flex items-center justify-center py-2 relative">
                  {/* Subtle ambient glow behind the donut */}
                  <div
                    className="absolute inset-0 m-auto h-44 w-44 rounded-full blur-2xl opacity-30 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 70%)' }}
                  />

                  <div className="relative h-44 w-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <defs>
                          <linearGradient id="donutSuccess" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                            <stop offset="100%" stopColor="#059669" stopOpacity={1} />
                          </linearGradient>
                          <linearGradient id="donutDanger" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
                            <stop offset="100%" stopColor="#dc2626" stopOpacity={1} />
                          </linearGradient>
                        </defs>
                        <Pie
                          data={completionData}
                          innerRadius={62}
                          outerRadius={82}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="rgba(10,10,10,0.8)"
                          strokeWidth={3}
                          startAngle={90}
                          endAngle={-270}
                          isAnimationActive={true}
                          animationDuration={800}
                        >
                          {completionData.map((_, i) => (
                            <Cell key={i} fill={i === 0 ? 'url(#donutSuccess)' : 'url(#donutDanger)'} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Center label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <div className="text-2xs uppercase tracking-widest text-text-tertiary">Success</div>
                      <div className="font-mono text-3xl font-semibold tracking-tight text-text-primary leading-none mt-1">
                        {fmtPct(completionRate, 0)}
                      </div>
                      <div className="text-2xs text-text-tertiary mt-1.5 font-mono">
                        {tasksCompleted}/{tasksCompleted + tasksFailed}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stat row at the bottom — fills the card */}
                <div className="grid grid-cols-3 gap-2 pt-3 mt-2 border-t border-white/[0.06]">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center gap-1 text-text-tertiary text-2xs uppercase tracking-wider">
                      <CheckCircle2 className="h-3 w-3 text-status-success" />
                      Done
                    </div>
                    <div className="font-mono text-lg font-semibold text-text-primary mt-0.5">{tasksCompleted}</div>
                  </div>
                  <div className="flex flex-col items-center text-center border-x border-white/[0.06]">
                    <div className="flex items-center gap-1 text-text-tertiary text-2xs uppercase tracking-wider">
                      <XCircle className="h-3 w-3 text-status-danger" />
                      Failed
                    </div>
                    <div className="font-mono text-lg font-semibold text-text-primary mt-0.5">{tasksFailed}</div>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center gap-1 text-text-tertiary text-2xs uppercase tracking-wider">
                      <Activity className="h-3 w-3 text-accent-cyan" />
                      Total
                    </div>
                    <div className="font-mono text-lg font-semibold text-text-primary mt-0.5">{tasksToday}</div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Active Pipelines */}
        <Card innerGlow>
          <CardHeader>
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-accent-magenta" />
              <CardTitle>Active pipelines</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => go('pipelines')}>
              View all <ArrowUpRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            {pLoading ? (
              <Skeleton className="h-32" />
            ) : (
              <div className="space-y-3">
                {pipelines?.pipelines.slice(0, 3).map((p) => (
                  <div key={p.id} className="rounded-lg border border-white/5 bg-white/5 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-text-primary">{p.name}</div>
                        <div className="text-2xs text-text-tertiary">{p.subtitle}</div>
                      </div>
                      <Badge
                        tone={
                          p.status === 'running' ? 'cyan' :
                          p.status === 'completed' ? 'success' :
                          p.status === 'failed' ? 'danger' : 'default'
                        }
                        dot
                      >
                        {p.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={p.progress}
                        tone={p.status === 'failed' ? 'danger' : p.status === 'completed' ? 'success' : 'gradient'}
                        className="flex-1"
                      />
                      <span className="font-mono text-2xs text-text-tertiary w-9 text-right">
                        {p.progress}%
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-2xs text-text-tertiary">
                      <span>Step {p.steps.findIndex((s) => s.status === 'active') + 1} of {p.steps.length}</span>
                      {p.lastRun && <span>Last run {fmtRelative(p.lastRun)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Credit burn rate */}
        <Card innerGlow className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-status-warning" />
              <CardTitle>Credit burn · 14d</CardTitle>
            </div>
            <Badge tone={trendPct > 0 ? 'danger' : 'success'}>
              {trendPct > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(trendPct).toFixed(0)}% vs yesterday
            </Badge>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {cLoading ? (
              <Skeleton className="h-full min-h-[200px]" />
            ) : (
              <>
                {/* Hero metric row — fills the top of the card */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
                    <div className="text-2xs uppercase tracking-wider text-text-tertiary">Today</div>
                    <div className="font-mono text-lg font-semibold text-text-primary mt-0.5">{fmtUsd(dailyCredits[dailyCredits.length - 1]?.amount ?? 0)}</div>
                  </div>
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
                    <div className="text-2xs uppercase tracking-wider text-text-tertiary">Avg / day</div>
                    <div className="font-mono text-lg font-semibold text-text-primary mt-0.5">
                      {fmtUsd(dailyCredits.reduce((s, d) => s + d.amount, 0) / Math.max(dailyCredits.length, 1))}
                    </div>
                  </div>
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
                    <div className="text-2xs uppercase tracking-wider text-text-tertiary">Peak</div>
                    <div className="font-mono text-lg font-semibold text-text-primary mt-0.5">
                      {fmtUsd(Math.max(...dailyCredits.map((d) => d.amount)))}
                    </div>
                  </div>
                </div>

                {/* Bar chart — taller now */}
                <div className="flex-1 min-h-[180px] -mx-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyCredits.map((d) => ({ ...d, label: d.date.slice(5) }))} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={CHART_COLORS.violet} stopOpacity={0.9} />
                          <stop offset="100%" stopColor={CHART_COLORS.magenta} stopOpacity={0.4} />
                        </linearGradient>
                        <linearGradient id="barGradToday" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                          <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.5} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke={CHART_COLORS.border} vertical={false} strokeDasharray="2 4" />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: CHART_COLORS.text, fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        interval={1}
                      />
                      <YAxis
                        tick={{ fill: CHART_COLORS.text, fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `$${v.toFixed(2)}`}
                        width={40}
                      />
                      <RechartsTooltip
                        {...tooltipStyle}
                        cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                        formatter={(v: number) => [`$${v.toFixed(3)}`, 'Spent']}
                      />
                      <Bar
                        dataKey="amount"
                        radius={[4, 4, 0, 0]}
                        shape={(props: any) => {
                          const isLast = props.index === dailyCredits.length - 1;
                          return (
                            <rect
                              x={props.x}
                              y={props.y}
                              width={props.width}
                              height={props.height}
                              fill={isLast ? 'url(#barGradToday)' : 'url(#barGrad)'}
                              rx={4}
                            />
                          );
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Events feed + Activity chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card innerGlow>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-accent-cyan" />
              <CardTitle>Recent events</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => go('logs')}>
              All logs <ArrowUpRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            {lLoading ? (
              <Skeleton className="h-72" />
            ) : (
              <div className="space-y-1.5 max-h-80 overflow-y-auto scrollbar-hide -mx-1 px-1">
                {recentEvents.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 rounded-md p-2 hover:bg-white/5 transition-colors"
                  >
                    <span className="font-mono text-2xs text-text-tertiary w-14 flex-shrink-0">
                      {fmtTime(e.timestamp)}
                    </span>
                    {e.status === 'completed' && <CheckCircle2 className="h-3.5 w-3.5 text-status-success flex-shrink-0" />}
                    {e.status === 'failed' && <XCircle className="h-3.5 w-3.5 text-status-danger flex-shrink-0" />}
                    {e.status === 'timeout' && <AlertTriangle className="h-3.5 w-3.5 text-status-warning flex-shrink-0" />}
                    {e.status === 'pending' && <Clock className="h-3.5 w-3.5 text-text-tertiary flex-shrink-0" />}
                    <Badge tone="default" className="font-mono text-[10px] flex-shrink-0">
                      {e.agent.split('-').slice(-1)[0]}
                    </Badge>
                    <span className="flex-1 truncate text-xs text-text-primary">{e.task}</span>
                    <span className="font-mono text-2xs text-text-tertiary flex-shrink-0">
                      ${e.credits.toFixed(3)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card innerGlow className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-accent-violet" />
              <CardTitle>Live agent activity · 24h</CardTitle>
            </div>
            <Badge tone="cyan" dot>
              {agentActivity.reduce((s, a) => s + a.count, 0)} tasks
            </Badge>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {lLoading ? (
              <Skeleton className="h-full min-h-[240px]" />
            ) : (
              <>
                {/* Top agent highlight */}
                {agentActivity.length > 0 && (
                  <div className="mb-4 rounded-lg border border-accent-violet/20 bg-gradient-to-r from-accent-violet/[0.08] to-accent-cyan/[0.04] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-2xs uppercase tracking-wider text-text-tertiary">Top contributor</div>
                        <div className="font-mono text-base font-semibold text-text-primary mt-0.5 truncate">
                          {agentActivity[0].agent}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-mono text-2xl font-semibold text-accent-cyan leading-none">
                          {agentActivity[0].count}
                        </div>
                        <div className="text-2xs text-text-tertiary mt-0.5">tasks</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ranked list */}
                <div className="flex-1 space-y-1.5 overflow-y-auto scrollbar-hide -mx-1 px-1">
                  {agentActivity.map((a, i) => {
                    const max = Math.max(...agentActivity.map((x) => x.count));
                    const pct = (a.count / max) * 100;
                    const isTop = i === 0;
                    return (
                      <div key={a.agent} className="flex items-center gap-3 group">
                        <span
                          className={cn(
                            'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-2xs font-mono font-semibold',
                            isTop ? 'bg-accent-cyan/20 text-accent-cyan' : 'bg-white/[0.04] text-text-tertiary',
                          )}
                        >
                          {i + 1}
                        </span>
                        <span className="text-2xs text-text-secondary w-20 truncate">{a.agent}</span>
                        <div className="flex-1 h-5 bg-white/[0.04] rounded overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded transition-all duration-500 ease-out-expo flex items-center justify-end pr-2',
                              isTop
                                ? 'bg-gradient-to-r from-cyan-500 to-violet-500 shadow-glow-cyan'
                                : 'bg-gradient-to-r from-cyan-500/60 to-violet-500/60',
                            )}
                            style={{ width: `${Math.max(pct, 8)}%`, minWidth: '32px' }}
                          >
                            <span className="font-mono text-[10px] text-white font-medium">{a.count}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default function HomePage() {
  return (
    <ClientShell>
      <HomeContent />
    </ClientShell>
  );
}
