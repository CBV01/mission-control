'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, AreaChart, Area, Legend,
  PieChart, Pie, Cell,
} from 'recharts';
import { BarChart3, DollarSign, AlertCircle, TrendingUp, TrendingDown, Trophy, Activity, Calendar, Flame, Wallet } from 'lucide-react';
import { ClientShell } from '@/components/shell/client-shell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { fmtUsd, fmtPct, cn } from '@/lib/utils';

const tabs = [
  { id: 'credits', label: 'Credits' },
  { id: 'tokens', label: 'Tokens' },
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'models', label: 'Models' },
];

const COLORS = { cyan: '#06b6d4', violet: '#8b5cf6', magenta: '#d946ef', success: '#10b981', warning: '#f59e0b', danger: '#ef4444' };
const tooltipStyle = {
  contentStyle: { backgroundColor: 'rgba(17, 24, 39, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' },
  labelStyle: { color: '#f8fafc', fontWeight: 500 },
  itemStyle: { color: '#94a3b8' },
};

function AnalyticsContent() {
  const [tab, setTab] = useState('credits');
  return (
    <>
      <PageHeader
        title="Analytics & Credits"
        description="Spend, tokens, performance, and reliability metrics."
        icon={<BarChart3 className="h-4 w-4 text-white" />}
      />
      <Tabs tabs={tabs} active={tab} onChange={setTab} className="mb-6" />
      {tab === 'credits' && <CreditsView />}
      {tab === 'tokens' && <TokensView />}
      {tab === 'leaderboard' && <LeaderboardView />}
      {tab === 'models' && <ModelsView />}
    </>
  );
}

function CreditsView() {
  const { data, isLoading } = useQuery({ queryKey: ['credits'], queryFn: api.credits });
  if (isLoading || !data) return <Skeleton className="h-96" />;

  const pct = (data.totalUsed / data.limit) * 100;
  const remainingPct = 100 - pct;
  const tone = pct > 95 ? 'danger' : pct > 80 ? 'warning' : 'cyan';
  const toneHex = tone === 'danger' ? '#ef4444' : tone === 'warning' ? '#f59e0b' : '#06b6d4';
  const avgPerDay = data.dailyHistory.length > 0
    ? data.dailyHistory.reduce((s, d) => s + d.amount, 0) / data.dailyHistory.length
    : 0;
  const projectedMonth = avgPerDay * 30;
  const daysToZero = data.dailyUsed > 0 ? Math.floor(data.remaining / data.dailyUsed) : Infinity;
  const status = pct > 95 ? 'critical' : pct > 80 ? 'warning' : 'healthy';
  const statusColor = status === 'critical' ? 'text-status-danger' : status === 'warning' ? 'text-status-warning' : 'text-status-success';
  const statusBg = status === 'critical' ? 'bg-status-danger/10' : status === 'warning' ? 'bg-status-warning/10' : 'bg-status-success/10';
  const statusBorder = status === 'critical' ? 'border-status-danger/30' : status === 'warning' ? 'border-status-warning/30' : 'border-status-success/30';
  const statusLabel = status === 'critical' ? 'Critical' : status === 'warning' ? 'Warning' : 'Healthy';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ── Upgraded budget card ─────────────────────────────── */}
        <Card innerGlow className="md:col-span-1 overflow-hidden relative">
          {/* Subtle gradient background */}
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 80% 0%, ${toneHex}20 0%, transparent 60%)`,
            }}
          />

          <CardContent className="pt-5 relative">
            {/* Header: status + icon */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={cn('flex h-7 w-7 items-center justify-center rounded-md', statusBg, statusColor)}>
                  <Wallet className="h-3.5 w-3.5" />
                </div>
                <span className="text-2xs uppercase tracking-wider text-text-tertiary">Budget</span>
              </div>
              <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-2xs font-medium', statusBg, statusColor, statusBorder)}>
                <span className={cn('h-1.5 w-1.5 rounded-full', status === 'critical' ? 'bg-status-danger' : status === 'warning' ? 'bg-status-warning' : 'bg-status-success', 'shadow-glow-success')} />
                {statusLabel}
              </span>
            </div>

            {/* Hero: total used */}
            <div className="mb-1">
              <div className="text-2xs uppercase tracking-wider text-text-tertiary">Total Used</div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-3xl font-semibold tracking-tight text-text-primary">
                  {fmtUsd(data.totalUsed)}
                </span>
                <span className="text-2xs text-text-tertiary">
                  of {fmtUsd(data.limit)}
                </span>
              </div>
            </div>

            {/* Progress bar with embedded % label */}
            <div className="mt-3">
              <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden relative">
                <div
                  className="h-full transition-all duration-500 ease-out-expo"
                  style={{
                    width: `${pct}%`,
                    background: pct > 95
                      ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                      : pct > 80
                      ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                      : 'linear-gradient(90deg, #06b6d4, #8b5cf6)',
                  }}
                />
                {/* Pulse dot at the leading edge */}
                {pct > 0 && pct < 100 && (
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full shadow-glow-cyan"
                    style={{
                      left: `calc(${pct}% - 6px)`,
                      background: toneHex,
                    }}
                  />
                )}
              </div>
              <div className="flex items-center justify-between text-2xs text-text-tertiary mt-1.5 font-mono">
                <span>
                  <span className={cn('font-medium', statusColor)}>{pct.toFixed(1)}%</span> used
                </span>
                <span>{remainingPct.toFixed(1)}% left</span>
              </div>
            </div>

            {/* Divider */}
            <div className="my-4 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

            {/* Quick stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center gap-1 text-2xs uppercase tracking-wider text-text-tertiary">
                  <DollarSign className="h-2.5 w-2.5" /> Remaining
                </div>
                <div className="font-mono text-base font-semibold text-text-primary mt-0.5">
                  {fmtUsd(data.remaining)}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-2xs uppercase tracking-wider text-text-tertiary">
                  <Flame className="h-2.5 w-2.5" /> Today
                </div>
                <div className="font-mono text-base font-semibold text-text-primary mt-0.5">
                  {fmtUsd(data.dailyUsed)}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-2xs uppercase tracking-wider text-text-tertiary">
                  <Calendar className="h-2.5 w-2.5" /> Avg/day
                </div>
                <div className="font-mono text-base font-semibold text-text-primary mt-0.5">
                  {fmtUsd(avgPerDay)}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-2xs uppercase tracking-wider text-text-tertiary">
                  <Activity className="h-2.5 w-2.5" /> Runway
                </div>
                <div className="font-mono text-base font-semibold text-text-primary mt-0.5">
                  {Number.isFinite(daysToZero) ? `${daysToZero}d` : '∞'}
                </div>
              </div>
            </div>

            {/* Footer: projection */}
            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-2xs">
              <span className="text-text-tertiary">Projected 30d</span>
              <span className="font-mono text-text-primary">
                <span className={cn('font-medium', projectedMonth > data.limit ? 'text-status-danger' : 'text-text-primary')}>
                  {fmtUsd(projectedMonth)}
                </span>
                {projectedMonth > data.limit && (
                  <span className="ml-1.5 inline-flex items-center gap-0.5 text-status-danger">
                    <AlertCircle className="h-2.5 w-2.5" /> over
                  </span>
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ── Daily spend chart ─────────────────────────────── */}
        <Card innerGlow className="md:col-span-2">
          <CardHeader>
            <CardTitle>Daily spend · 14d</CardTitle>
            <Badge tone="cyan">{fmtUsd(data.dailyUsed)} today</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.dailyHistory.map((d) => ({ ...d, label: d.date.slice(5) }))}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v.toFixed(2)}`} />
                  <RechartsTooltip {...tooltipStyle} formatter={(v: number) => [`$${v.toFixed(3)}`, 'Spent']} />
                  <Bar dataKey="amount" fill={COLORS.cyan} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card innerGlow>
          <CardHeader><CardTitle>Spend by model</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.byModel.map((m) => (
                <div key={m.model}>
                  <div className="flex justify-between text-2xs mb-1">
                    <span className="font-mono text-text-secondary">{m.model}</span>
                    <span className="font-mono text-text-primary">{fmtUsd(m.amount)} · {fmtPct(m.pct, 1)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-gradient-accent" style={{ width: `${m.pct * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card innerGlow>
          <CardHeader><CardTitle>Fallback trigger log</CardTitle><Badge tone="warning">{data.fallbackTriggerLog.length} events</Badge></CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs">
              {data.fallbackTriggerLog.map((e, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded border border-white/5 bg-white/5">
                  <AlertCircle className="h-3 w-3 text-status-warning flex-shrink-0" />
                  <span className="font-mono text-2xs text-text-tertiary w-32 flex-shrink-0">{e.timestamp.slice(11, 19)}</span>
                  <span className="text-text-primary flex-1 truncate">{e.reason}</span>
                  <span className="font-mono text-2xs text-accent-cyan">{e.model.split('/').pop()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TokensView() {
  const { data, isLoading } = useQuery({ queryKey: ['tokens'], queryFn: api.tokens });
  if (isLoading || !data) return <Skeleton className="h-96" />;

  const byDate = data.reduce<Record<string, Record<string, number>>>((acc, r) => {
    (acc[r.date] ??= {})[r.agent] = r.tokens;
    return acc;
  }, {});
  const series = Object.entries(byDate).map(([date, vals]) => ({ date: date.slice(5), ...vals }));
  const agents = Array.from(new Set(data.map((d) => d.agent)));

  return (
    <Card innerGlow>
      <CardHeader><CardTitle>Token consumption · 14d</CardTitle><Badge tone="cyan">per agent</Badge></CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series}>
              <defs>
                {agents.map((a, i) => (
                  <linearGradient key={a} id={`grad-${a}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={Object.values(COLORS)[i % 6]} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={Object.values(COLORS)[i % 6]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <RechartsTooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              {agents.map((a, i) => (
                <Area key={a} type="monotone" dataKey={a} stackId="1" stroke={Object.values(COLORS)[i % 6]} fill={`url(#grad-${a})`} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function LeaderboardView() {
  const { data, isLoading } = useQuery({ queryKey: ['leaderboard'], queryFn: api.leaderboard });
  if (isLoading || !data) return <Skeleton className="h-96" />;

  return (
    <Card innerGlow>
      <CardContent className="p-0">
        <table className="w-full text-sm">
          <thead className="text-2xs uppercase tracking-wider text-text-tertiary border-b border-white/5">
            <tr>
              <th className="text-left p-3 w-12">#</th>
              <th className="text-left p-3">Agent</th>
              <th className="text-right p-3">Tasks</th>
              <th className="text-right p-3">Success</th>
              <th className="text-right p-3">$/task</th>
              <th className="text-right p-3">Trend</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.agent} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-3">
                  {i < 3 ? <Trophy className={cn('h-4 w-4', i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-300' : 'text-amber-700')} /> : <span className="text-text-tertiary font-mono">{i + 1}</span>}
                </td>
                <td className="p-3 text-text-primary font-mono text-xs">{row.agent}</td>
                <td className="p-3 text-right font-mono text-text-primary">{row.tasks}</td>
                <td className="p-3 text-right font-mono text-status-success">{fmtPct(row.successRate, 0)}</td>
                <td className="p-3 text-right font-mono text-text-primary">${row.avgCredits.toFixed(3)}</td>
                <td className="p-3 text-right">
                  <span className={cn('inline-flex items-center gap-0.5 font-mono text-2xs', row.trend >= 0 ? 'text-status-success' : 'text-status-danger')}>
                    {row.trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(row.trend)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function ModelsView() {
  const { data } = useQuery({ queryKey: ['credits'], queryFn: api.credits });
  if (!data) return <Skeleton className="h-64" />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card innerGlow>
        <CardHeader><CardTitle>Model spend share</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.byModel} dataKey="amount" nameKey="model" innerRadius={50} outerRadius={80} stroke="none">
                  {data.byModel.map((_, i) => <Cell key={i} fill={Object.values(COLORS)[i % 6]} />)}
                </Pie>
                <RechartsTooltip {...tooltipStyle} formatter={(v: number) => `$${v.toFixed(3)}`} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card innerGlow>
        <CardHeader><CardTitle>Empty-response incidents</CardTitle><Badge tone="warning">{data.emptyResponseIncidents.length}</Badge></CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs">
            {data.emptyResponseIncidents.map((e, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded border border-white/5 bg-white/5">
                <AlertCircle className="h-3 w-3 text-status-warning flex-shrink-0" />
                <span className="font-mono text-2xs text-text-tertiary w-32 flex-shrink-0">{e.timestamp.slice(0, 16).replace('T', ' ')}</span>
                <span className="font-mono text-text-primary flex-shrink-0">{e.agent}</span>
                <span className="text-text-secondary flex-1 truncate">{e.task}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AnalyticsPage() {
  return <ClientShell><AnalyticsContent /></ClientShell>;
}
