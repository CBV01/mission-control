'use client';

import * as React from 'react';
import {
  ResponsiveContainer, ComposedChart, Area, Bar, XAxis, YAxis,
  Tooltip as RechartsTooltip, CartesianGrid, Line,
} from 'recharts';
import {
  Mail, BarChart3, TrendingUp, CheckCircle2,
  Clock, Key, Shield, RefreshCw,
  Activity, Send, Check, AlertTriangle, Wifi,
} from 'lucide-react';
import { ClientShell } from '@/components/shell/client-shell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// ─── COLOURS ────────────────────────────────────────────────────────
const C = {
  cyan:    '#06b6d4',
  violet:  '#8b5cf6',
  magenta: '#d946ef',
  success: '#10b981',
  warning: '#f59e0b',
  danger:  '#ef4444',
  info:    '#3b82f6',
  text:    '#71717a',
  border:  'rgba(255,255,255,0.06)',
};

const TT = {
  contentStyle: {
    backgroundColor: 'rgba(15,15,16,0.97)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    fontSize: '11px',
    backdropFilter: 'blur(16px)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
  },
  labelStyle: { color: '#fafafa', fontWeight: 600, marginBottom: 4 },
  itemStyle:  { color: '#94a3b8' },
};

// ─── MOCK DATA ───────────────────────────────────────────────────────
const history30d = [
  { day: 'Jun 1',  sent: 120, openRate: 60, replies: 12 },
  { day: 'Jun 4',  sent: 180, openRate: 62, replies: 18 },
  { day: 'Jun 7',  sent: 240, openRate: 61, replies: 28 },
  { day: 'Jun 10', sent: 150, openRate: 64, replies: 14 },
  { day: 'Jun 13', sent: 280, openRate: 65, replies: 32 },
  { day: 'Jun 16', sent: 310, openRate: 66, replies: 38 },
  { day: 'Jun 19', sent: 260, openRate: 65, replies: 24 },
  { day: 'Jun 22', sent: 340, openRate: 68, replies: 44 },
  { day: 'Jun 25', sent: 410, openRate: 69, replies: 56 },
  { day: 'Jun 28', sent: 380, openRate: 67, replies: 49 },
  { day: 'Jun 30', sent: 450, openRate: 68.4, replies: 62 },
];

const senderPools = [
  { email: 'founders@arkilostudios.com', provider: 'Google Workspace', used: 64,  limit: 150, warmup: 99, status: 'connected' },
  { email: 'campaigns@arkilostudios.com', provider: 'Google Workspace', used: 112, limit: 150, warmup: 98, status: 'connected' },
  { email: 'smtp-outbound@arkilo-server.net', provider: 'SMTP Dedicated', used: 0,   limit: 500, warmup: 45, status: 'reauth_needed' },
];

const funnelSteps = [
  { step: 'Step 1: Introduction Pitch', sent: 12480, label: 'Sent', outcome: '68.4% Opened', value: 68.4, color: C.cyan, drop: 'Initial reach' },
  { step: 'Step 2: Case Study Follow-up', sent: 8536,  label: 'Delivered', outcome: '54.0% Opened', value: 54.0, color: C.violet, drop: '21.0% drop-off' },
  { step: 'Step 3: Direct Booking Call', sent: 4610,  label: 'Triggered', outcome: '42.2% Opened', value: 42.2, color: C.magenta, drop: '22.0% drop-off' },
  { step: 'Step 4: Demo Conversation', sent: 1945,  label: 'Replied', outcome: '14.8% Booking Rate', value: 14.8, color: C.success, drop: '64.9% drop-off' },
];

const scheduledOutbox = [
  { id: 'o1', recipient: 'Thomas Jenkins', company: 'Vertex Solutions', time: 'In 12 mins', template: 'Productivity Pitch', step: 1, account: 'founders@arkilostudios.com' },
  { id: 'o2', recipient: 'Sarah O\'Connor', company: 'Nova Retail', time: 'In 34 mins', template: 'Case Study Follow-up', step: 2, account: 'campaigns@arkilostudios.com' },
  { id: 'o3', recipient: 'Dave Kasprowicz', company: 'Holo Tech', time: 'In 58 mins', template: 'Productivity Pitch', step: 1, account: 'founders@arkilostudios.com' },
  { id: 'o4', recipient: 'Elena Rostova', company: 'Aero Dynamics', time: 'In 1h 12m', template: 'Direct Booking Call', step: 3, account: 'campaigns@arkilostudios.com' },
];

type Timeframe = '7d' | '14d' | '30d';

// ─── TIMEFRAME TOGGLE ────────────────────────────────────────────────
function TimeframeToggle({ value, onChange }: { value: Timeframe; onChange: (v: Timeframe) => void }) {
  return (
    <div className="flex items-center bg-white/[0.03] p-0.5 rounded-lg border border-white/[0.05]">
      {(['7d', '14d', '30d'] as Timeframe[]).map((tf) => (
        <button
          key={tf}
          onClick={() => onChange(tf)}
          className={cn(
            'px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer',
            value === tf
              ? 'bg-white/[0.08] text-text-primary shadow-sm shadow-black/25'
              : 'text-text-tertiary hover:text-text-secondary'
          )}
        >
          {tf}
        </button>
      ))}
    </div>
  );
}

// ─── PAGE ────────────────────────────────────────────────────────────
export default function OutreachOverviewPage() {
  const [timeframe, setTimeframe] = React.useState<Timeframe>('14d');

  const filteredHistory = React.useMemo(() => {
    if (timeframe === '7d') return history30d.slice(-7);
    if (timeframe === '14d') return history30d.slice(-14);
    return history30d;
  }, [timeframe]);

  return (
    <ClientShell>
      <div className="flex flex-col gap-6 pb-8">
        <PageHeader
          title="Outreach Command Overview"
          description="Track email delivery sequences, outbox queue metrics, connected sender rotation health and funnel conversions."
          icon={<Mail className="h-4 w-4 text-white" />}
          actions={<Badge tone="violet" dot>Active Outreach Agent</Badge>}
        />

        {/* ── Section 1: Funnel + Deliverability ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Sequence Funnel */}
          <Card innerGlow className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-accent-cyan" />
                <CardTitle>Sequence Funnel Conversions</CardTitle>
              </div>
              <Badge tone="cyan">12,480 total starts</Badge>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              {funnelSteps.map((f, i) => (
                <div
                  key={f.step}
                  className="relative flex flex-col md:flex-row md:items-center justify-between gap-2.5 p-3 rounded-xl border border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.02] transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-lg text-2xs font-bold bg-white/[0.05] text-text-secondary border border-white/[0.08]">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-text-primary truncate">{f.step}</div>
                      <div className="text-[10px] text-text-tertiary font-mono mt-0.5">
                        {f.label}: {f.sent.toLocaleString()} leads
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 max-w-[200px] mx-0 md:mx-4">
                    <div className="flex justify-between text-[9px] font-mono text-text-tertiary mb-1">
                      <span>Conversion</span>
                      <span>{f.value}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${f.value}%`, backgroundColor: f.color }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-xs font-bold text-text-primary">{f.outcome}</span>
                    <Badge tone="default" className="text-[9px] capitalize tracking-wide">{f.drop}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Deliverability Checklist */}
          <Card innerGlow className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-status-success" />
                <CardTitle>Deliverability Checklist</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 pt-2">
              {/* Circular Health Meter */}
              <div className="relative h-28 w-28 mx-auto flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="transparent" />
                  <circle
                    cx="50" cy="50" r="40"
                    stroke={C.success} strokeWidth="6" fill="transparent"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * 99) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="font-mono text-2xl font-bold text-text-primary">99%</span>
                  <span className="text-[8px] uppercase tracking-wider text-text-tertiary mt-0.5">Warm Health</span>
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-2">
                {[
                  { label: 'SPF Protocol Aligned', status: 'verified' },
                  { label: 'DKIM Signatures Active', status: 'verified' },
                  { label: 'DMARC Security Policy', status: 'verified' },
                  { label: 'Custom Tracking Domain', status: 'verified' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-white/[0.03] bg-white/[0.01] text-xs"
                  >
                    <span className="text-text-secondary font-medium">{item.label}</span>
                    <Badge tone="success" className="flex items-center gap-1 leading-none py-0.5">
                      <Check className="h-2.5 w-2.5" /> Ok
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Section 2: Timeline Chart ── */}
        <Card innerGlow>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-accent-violet" />
              <CardTitle>Sent Volume vs Open Rate Engagement</CardTitle>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 text-2xs font-mono text-text-tertiary">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-accent-cyan/80 inline-block" /> Emails Sent</span>
                <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-accent-magenta inline-block" /> Open Rate (%)</span>
              </div>
              <TimeframeToggle value={timeframe} onChange={setTimeframe} />
            </div>
          </CardHeader>
          <CardContent className="h-[260px] pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={filteredHistory} margin={{ top: 8, right: -20, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barSentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={C.cyan} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={C.cyan} stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="day" tick={{ fill: C.text, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fill: C.text, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: C.text, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <RechartsTooltip {...TT} />
                <Bar yAxisId="left" dataKey="sent" name="Mails Sent" radius={[4, 4, 0, 0]} fill="url(#barSentGrad)" />
                <Line yAxisId="right" type="monotone" dataKey="openRate" name="Open Rate" stroke={C.magenta} strokeWidth={2.5} dot={{ fill: C.magenta, r: 3 }} activeDot={{ r: 5 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ── Section 3: Sender Rotation Pools & Outbox Queue ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Sender Rotation Pools – fixed layout */}
          <Card innerGlow className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-accent-cyan" />
                <CardTitle>Sender Rotation Pools &amp; Warmup Health</CardTitle>
              </div>
              <Badge tone="cyan" dot>Rotation Enabled</Badge>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              {senderPools.map((pool) => {
                const limitPct = (pool.used / pool.limit) * 100;
                const isConnected = pool.status === 'connected';
                return (
                  <div
                    key={pool.email}
                    className="rounded-xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.02] p-3.5 transition-all"
                  >
                    {/* Top row: email + badges */}
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="font-semibold text-text-primary text-sm">{pool.email}</div>
                        <div className="text-[10px] text-text-tertiary uppercase tracking-wider mt-0.5 font-mono">
                          {pool.provider}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge tone={pool.warmup >= 90 ? 'success' : 'warning'}>
                          Warmup: {pool.warmup}%
                        </Badge>
                        <Badge tone={isConnected ? 'success' : 'danger'}>
                          {isConnected ? (
                            <span className="flex items-center gap-1">
                              <Wifi className="h-2.5 w-2.5" /> Connected
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <AlertTriangle className="h-2.5 w-2.5" /> Reauth Needed
                            </span>
                          )}
                        </Badge>
                      </div>
                    </div>

                    {/* Usage bar */}
                    <div>
                      <div className="flex justify-between text-[10px] text-text-tertiary mb-1.5 font-mono">
                        <span>Daily limit usage: {pool.used} / {pool.limit} emails</span>
                        <span className="font-semibold">{limitPct.toFixed(0)}%</span>
                      </div>
                      <Progress value={limitPct} tone={isConnected ? 'cyan' : 'danger'} />
                    </div>

                    {/* Warmup sub-bar */}
                    <div className="mt-2.5">
                      <div className="flex justify-between text-[10px] text-text-tertiary mb-1.5 font-mono">
                        <span>Warmup score</span>
                        <span className="font-semibold text-status-success">{pool.warmup}%</span>
                      </div>
                      <Progress value={pool.warmup} tone="success" />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Scheduled Outbox Queue */}
          <Card innerGlow className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-status-warning" />
                <CardTitle>Scheduled Outbox Queue</CardTitle>
              </div>
              <Badge tone="warning">Queue active</Badge>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              {scheduledOutbox.map((e) => (
                <div
                  key={e.id}
                  className="group rounded-xl border border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.02] p-3 transition-all flex flex-col gap-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-text-primary text-xs">{e.recipient}</div>
                      <div className="text-[10px] text-text-tertiary mt-0.5">{e.company}</div>
                    </div>
                    <span className="font-mono text-[10px] text-status-warning font-semibold flex items-center gap-1 shrink-0">
                      <Clock className="h-3 w-3" /> {e.time}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-text-tertiary pt-1.5 border-t border-white/[0.04]">
                    <span>Step {e.step} · {e.template.slice(0, 18)}{e.template.length > 18 ? '…' : ''}</span>
                    <span className="font-mono truncate max-w-[110px]">{e.account.split('@')[0]}@…</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

      </div>
    </ClientShell>
  );
}
