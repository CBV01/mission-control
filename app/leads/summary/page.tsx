'use client';

import * as React from 'react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip as RechartsTooltip, CartesianGrid, PieChart, Pie, Cell,
} from 'recharts';
import {
  Users, Mail, Phone, TrendingUp, ArrowUpRight, ArrowDownRight,
  CheckCircle2, Clock, PhoneCall, PhoneMissed, Calendar, BarChart3,
  Target, Zap, Star, Activity, Search, Filter, ExternalLink,
  Globe, Tag,
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
const pipelineTimeline = [
  { day: 'Jun 1',  discovered: 52,  enriched: 38,  qualified: 18 },
  { day: 'Jun 4',  discovered: 68,  enriched: 51,  qualified: 24 },
  { day: 'Jun 7',  discovered: 74,  enriched: 60,  qualified: 29 },
  { day: 'Jun 10', discovered: 88,  enriched: 72,  qualified: 35 },
  { day: 'Jun 13', discovered: 65,  enriched: 50,  qualified: 22 },
  { day: 'Jun 16', discovered: 95,  enriched: 80,  qualified: 42 },
  { day: 'Jun 19', discovered: 110, enriched: 90,  qualified: 50 },
  { day: 'Jun 22', discovered: 98,  enriched: 85,  qualified: 48 },
  { day: 'Jun 25', discovered: 120, enriched: 104, qualified: 62 },
  { day: 'Jun 28', discovered: 135, enriched: 118, qualified: 74 },
  { day: 'Jun 30', discovered: 142, enriched: 124, qualified: 80 },
];

// Email Campaigns (different timeframes)
const campaignBarsAll = [
  { name: 'SaaS Scale',   open: 72, age: 5 },
  { name: 'Dev Loops',    open: 61, age: 9 },
  { name: 'EU Leaders',   open: 58, age: 12 },
  { name: 'Outbound v2',  open: 54, age: 18 },
  { name: 'Cold Intro',   open: 64, age: 22 },
  { name: 'Webinar Feb',  open: 49, age: 26 },
  { name: 'Q2 Follow-up', open: 67, age: 29 },
];

// Cold Calls (30 days of data)
const callsDaily30d = [
  { day: 'Jun 1',  calls: 8  }, { day: 'Jun 2',  calls: 12 },
  { day: 'Jun 3',  calls: 15 }, { day: 'Jun 4',  calls: 11 },
  { day: 'Jun 5',  calls: 9  }, { day: 'Jun 6',  calls: 4  },
  { day: 'Jun 7',  calls: 0  }, { day: 'Jun 8',  calls: 16 },
  { day: 'Jun 9',  calls: 20 }, { day: 'Jun 10', calls: 22 },
  { day: 'Jun 11', calls: 18 }, { day: 'Jun 12', calls: 14 },
  { day: 'Jun 13', calls: 8  }, { day: 'Jun 14', calls: 2  },
  { day: 'Jun 15', calls: 19 }, { day: 'Jun 16', calls: 25 },
  { day: 'Jun 17', calls: 12 }, { day: 'Jun 18', calls: 18 },
  { day: 'Jun 19', calls: 24 }, { day: 'Jun 20', calls: 16 },
  { day: 'Jun 21', calls: 8  }, { day: 'Jun 22', calls: 0  },
  { day: 'Jun 23', calls: 22 }, { day: 'Jun 24', calls: 28 },
  { day: 'Jun 25', calls: 31 }, { day: 'Jun 26', calls: 26 },
  { day: 'Jun 27', calls: 19 }, { day: 'Jun 28', calls: 34 },
  { day: 'Jun 29', calls: 29 }, { day: 'Jun 30', calls: 38 },
];

const templateRanks = [
  { name: 'Productivity Pitch (Short)',  open: 72.4, reply: 18.2 },
  { name: 'Cold Intro (SaaS)',           open: 64.8, reply: 11.2 },
  { name: 'Q2 Follow-up Case Study',     open: 61.5, reply: 12.4 },
  { name: 'Webinar Invite',              open: 58.0, reply: 9.8  },
  { name: 'Direct Meeting Link',         open: 54.2, reply: 7.4  },
];

const callDonutData = [
  { name: 'Connected',          value: 148, color: C.success },
  { name: 'No Answer',          value: 94,  color: C.warning },
  { name: 'Voicemail Left',     value: 56,  color: C.info },
  { name: 'Busy / Declined',    value: 28,  color: C.danger },
  { name: 'Callback Scheduled', value: 16,  color: C.violet },
];

const recentActivity = [
  {
    id: 'a1', type: 'lead', ts: '16:58',
    business: 'Bright Smiles Dental', niche: 'Dentists · Texas',
    website: 'brightsmiles.com', detail: 'AI enrichment complete — email & socials found',
    score: 91, status: 'qualified',
    opportunities: ['AI Receptionist', 'Online Booking'],
  },
  {
    id: 'a2', type: 'email', ts: '16:54',
    business: 'Elena Rostova', niche: 'Head of Growth · DataPulse',
    website: 'datapulse.tech', detail: 'Step 1 of "SaaS Scale Sequence" delivered',
    score: null, status: 'opened',
    opportunities: [],
  },
  {
    id: 'a3', type: 'call', ts: '16:49',
    business: 'Marcus Chen', niche: 'VP Engineering · CloudScale',
    website: 'cloudscale.com', detail: 'Call connected · Duration 3m 12s',
    score: 79, status: 'callback',
    opportunities: [],
  },
  {
    id: 'a4', type: 'lead', ts: '16:41',
    business: 'ProRoof Texas LLC', niche: 'Roofers · Dallas',
    website: 'proooftexas.com', detail: 'Discovered via Maps API · enrichment in progress',
    score: 78, status: 'enriched',
    opportunities: ['Website Redesign', 'SEO'],
  },
  {
    id: 'a5', type: 'meeting', ts: '16:35',
    business: 'Sarah Jenkins', niche: 'CEO · OmniFlow Solutions',
    website: 'omniflow.co', detail: 'Meeting confirmed · Fri Jul 4 · 2:00 PM GMT',
    score: 92, status: 'booked',
    opportunities: ['CRM Implementation'],
  },
  {
    id: 'a6', type: 'call', ts: '16:28',
    business: 'Takashi Sato', niche: 'Founder · Nippon AI',
    website: 'nippon.ai', detail: 'No answer · Voicemail left',
    score: 65, status: 'no-answer',
    opportunities: [],
  },
  {
    id: 'a7', type: 'email', ts: '16:22',
    business: 'Alexander Wright', niche: 'CTO · SaaSify Global',
    website: 'saasify.io', detail: 'Opened email · 3 clicks on CTA link',
    score: 94, status: 'clicked',
    opportunities: [],
  },
  {
    id: 'a8', type: 'lead', ts: '16:14',
    business: 'Lagos Kitchen & Bar', niche: 'Restaurants · Lagos',
    website: '—', detail: 'No website found · Serper fallback running',
    score: 55, status: 'new',
    opportunities: ['Website Build', 'Online Ordering'],
  },
];

type ActivityFilter = 'all' | 'lead' | 'email' | 'call' | 'meeting';
type Timeframe = '7d' | '14d' | '30d';

// ─── SPARK TILE ──────────────────────────────────────────────────────
function SparkTile({
  label, value, sub, icon, tone, delta, spark, sparkColor,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon: React.ReactNode;
  tone: 'cyan' | 'success' | 'warning' | 'violet' | 'magenta';
  delta?: { value: string; up: boolean };
  spark: number[];
  sparkColor: keyof typeof C;
}) {
  const stroke = C[sparkColor];
  const gradId = `sg-${label.replace(/\s+/g, '')}`;
  const toneMap = {
    cyan:    'bg-cyan-500/10 text-accent-cyan',
    success: 'bg-status-success/10 text-status-success',
    warning: 'bg-status-warning/10 text-status-warning',
    violet:  'bg-accent-violet/10 text-accent-violet',
    magenta: 'bg-accent-magenta/10 text-accent-magenta',
  }[tone];

  return (
    <Card innerGlow className="p-4 flex flex-col">
      <div className="flex items-start justify-between mb-2">
        <div className="text-2xs uppercase tracking-wider text-text-tertiary">{label}</div>
        <div className={cn('flex h-7 w-7 items-center justify-center rounded-md', toneMap)}>{icon}</div>
      </div>
      <div className="font-mono text-xl font-bold tracking-tight text-text-primary">{value}</div>
      {delta && (
        <div className={cn('mt-0.5 flex items-center gap-1 text-2xs font-semibold', delta.up ? 'text-status-success' : 'text-status-danger')}>
          {delta.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {delta.value}
        </div>
      )}
      {sub && <div className="text-2xs text-text-tertiary mt-0.5">{sub}</div>}
      {spark.length > 0 && (
        <div className="mt-3 -mx-1 h-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spark.map((v, i) => ({ i, v }))}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={stroke} strokeWidth={1.5} fill={`url(#${gradId})`} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

// ─── RANKED BAR LIST ─────────────────────────────────────────────────
function RankedList({
  title, icon, badge, items, color,
}: {
  title: string;
  icon: React.ReactNode;
  badge?: string;
  items: { name: string; value: number; sub?: string; secondaryValue?: number; secondaryLabel?: string }[];
  color: string;
}) {
  const max = Math.max(...items.map((x) => x.value));
  return (
    <Card innerGlow className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-center gap-2">{icon}<CardTitle>{title}</CardTitle></div>
        {badge && <Badge tone="cyan">{badge}</Badge>}
      </CardHeader>
      <CardContent className="space-y-3 flex-1">
        {items.map((item, i) => {
          const pct = (item.value / max) * 100;
          const isTop = i === 0;
          return (
            <div key={item.name} className="flex items-center gap-3">
              <span className={cn(
                'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-2xs font-mono font-bold',
                isTop ? 'bg-accent-cyan/20 text-accent-cyan' : 'bg-white/[0.04] text-text-tertiary'
              )}>{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-text-secondary truncate mb-1">{item.name}</div>
                <div className="h-4 bg-white/[0.04] rounded overflow-hidden">
                  <div
                    className="h-full rounded transition-all duration-500 flex items-center justify-end pr-2"
                    style={{
                      width: `${Math.max(pct, 8)}%`,
                      background: isTop
                        ? `linear-gradient(90deg, ${color}, ${color}99)`
                        : `linear-gradient(90deg, ${color}70, ${color}40)`,
                    }}
                  >
                    <span className="font-mono text-[9px] text-white font-semibold">
                      {item.value}{item.sub ?? ''}
                    </span>
                  </div>
                </div>
              </div>
              {item.secondaryValue !== undefined && (
                <div className="text-right flex-shrink-0">
                  <div className="font-mono text-xs font-semibold text-status-success">{item.secondaryValue}%</div>
                  <div className="text-2xs text-text-tertiary">{item.secondaryLabel}</div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ─── ACTIVITY ROW ────────────────────────────────────────────────────
function ActivityRow({ e }: { e: typeof recentActivity[number] }) {
  const typeConfig: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
    lead:    { icon: <Search className="h-3.5 w-3.5" />,    color: 'text-accent-cyan',    bg: 'bg-accent-cyan/10',    label: 'Lead Found' },
    email:   { icon: <Mail className="h-3.5 w-3.5" />,      color: 'text-accent-violet',  bg: 'bg-accent-violet/10',  label: 'Email' },
    call:    { icon: <PhoneCall className="h-3.5 w-3.5" />, color: 'text-accent-magenta', bg: 'bg-accent-magenta/10', label: 'Call' },
    meeting: { icon: <Calendar className="h-3.5 w-3.5" />,  color: 'text-status-success', bg: 'bg-status-success/10', label: 'Meeting' },
  };

  const statusBadge: Record<string, React.ReactNode> = {
    qualified:  <Badge tone="success" dot>Qualified</Badge>,
    enriched:   <Badge tone="cyan">Enriched</Badge>,
    new:        <Badge tone="default">New</Badge>,
    sent:       <Badge tone="violet">Sent</Badge>,
    opened:     <Badge tone="violet">Opened</Badge>,
    clicked:    <Badge tone="cyan" dot>Clicked CTA</Badge>,
    callback:   <Badge tone="warning">Callback Set</Badge>,
    'no-answer':<Badge tone="warning">No Answer</Badge>,
    booked:     <Badge tone="success" dot>Meeting Booked</Badge>,
  };

  const t = typeConfig[e.type];

  return (
    <div className="group rounded-xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all p-3 flex gap-3">
      <div className={cn('h-8 w-8 flex-shrink-0 rounded-lg flex items-center justify-center mt-0.5', t.bg, t.color)}>
        {t.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-text-primary">{e.business}</span>
            {e.score !== null && (
              <span className={cn('font-mono text-2xs px-1.5 py-0.5 rounded border font-bold',
                e.score >= 90 ? 'bg-status-success/10 border-status-success/20 text-status-success' :
                e.score >= 75 ? 'bg-accent-cyan/10 border-accent-cyan/20 text-accent-cyan' :
                'bg-white/5 border-white/10 text-text-secondary'
              )}>
                {e.score}
              </span>
            )}
          </div>
          <span className="font-mono text-2xs text-text-tertiary flex-shrink-0">{e.ts}</span>
        </div>

        <div className="flex items-center gap-3 text-2xs text-text-tertiary mb-1.5">
          <span className="flex items-center gap-1">
            <Tag className="h-3 w-3" /> {e.niche}
          </span>
          {e.website !== '—' && (
            <span className="flex items-center gap-1">
              <Globe className="h-3 w-3" /> {e.website}
            </span>
          )}
        </div>

        <p className="text-xs text-text-secondary leading-relaxed">{e.detail}</p>

        {e.opportunities.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className="text-2xs text-text-tertiary uppercase tracking-wider">Opportunities:</span>
            {e.opportunities.map((op) => (
              <span key={op} className="text-2xs px-1.5 py-0.5 rounded bg-accent-violet/10 border border-accent-violet/20 text-accent-violet font-medium">
                {op}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex-shrink-0 flex flex-col items-end justify-between gap-2">
        {statusBadge[e.status]}
        <button className="opacity-0 group-hover:opacity-100 transition-opacity text-text-tertiary hover:text-text-primary">
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── TIMEFRAME TOGGLE ────────────────────────────────────────────────
function TimeframeToggle({
  value,
  onChange,
}: {
  value: Timeframe;
  onChange: (v: Timeframe) => void;
}) {
  return (
    <div className="flex items-center bg-white/[0.03] p-0.5 rounded-lg border border-white/[0.05]">
      {((['7d', '14d', '30d'] as Timeframe[])).map((tf) => (
        <button
          key={tf}
          onClick={() => onChange(tf)}
          className={cn(
            'px-2 py-0.5 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer',
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
export default function LeadsSummaryPage() {
  const [activityFilter, setActivityFilter] = React.useState<ActivityFilter>('all');
  const [campaignTf, setCampaignTf] = React.useState<Timeframe>('14d');
  const [callsTf, setCallsTf] = React.useState<Timeframe>('14d');

  // Filter campaigns based on selected timeframe
  const filteredCampaigns = React.useMemo(() => {
    if (campaignTf === '7d') return campaignBarsAll.filter(c => c.age <= 7);
    if (campaignTf === '14d') return campaignBarsAll.filter(c => c.age <= 14);
    return campaignBarsAll;
  }, [campaignTf]);

  // Filter calls based on selected timeframe
  const filteredCalls = React.useMemo(() => {
    if (callsTf === '7d') return callsDaily30d.slice(-7);
    if (callsTf === '14d') return callsDaily30d.slice(-14);
    return callsDaily30d;
  }, [callsTf]);

  // Activity filter options
  const filteredActivity = recentActivity.filter(
    (e) => activityFilter === 'all' || e.type === activityFilter
  );

  const filterCounts = {
    all:     recentActivity.length,
    lead:    recentActivity.filter((e) => e.type === 'lead').length,
    email:   recentActivity.filter((e) => e.type === 'email').length,
    call:    recentActivity.filter((e) => e.type === 'call').length,
    meeting: recentActivity.filter((e) => e.type === 'meeting').length,
  };

  return (
    <ClientShell>
      <div className="flex flex-col gap-6 pb-8">
        <PageHeader
          title="Leads Command Summary"
          description="Real-time intelligence across your full lead generation, outreach, and cold-call pipeline."
          icon={<BarChart3 className="h-4 w-4 text-white" />}
          actions={<Badge tone="cyan" dot>Live</Badge>}
        />

        {/* ── Section 1: 4 Top KPI Tiles ──────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SparkTile
            label="Total Leads Discovered" value="4,821" sub="all-time scraped"
            icon={<Search className="h-3.5 w-3.5" />} tone="cyan" sparkColor="cyan"
            delta={{ value: '+142 today', up: true }}
            spark={[32,45,38,60,54,72,65,88,74,95,110,98,120,135,142]}
          />
          <SparkTile
            label="Leads Enriched" value="3,940" sub="website + contact found"
            icon={<Zap className="h-3.5 w-3.5" />} tone="violet" sparkColor="violet"
            delta={{ value: '+124 today', up: true }}
            spark={[25,36,30,50,44,60,55,72,61,80,90,85,104,118,124]}
          />
          <SparkTile
            label="Emails Sent Today" value="176" sub="across 3 active campaigns"
            icon={<Mail className="h-3.5 w-3.5" />} tone="cyan" sparkColor="cyan"
            delta={{ value: '+22 vs yesterday', up: true }}
            spark={[80,95,110,88,130,115,142,154,138,160,168,172,176,176,176]}
          />
          <SparkTile
            label="Email Open Rate" value="68.4%" sub="industry avg 22%"
            icon={<Activity className="h-3.5 w-3.5" />} tone="magenta" sparkColor="magenta"
            delta={{ value: '+1.2% today', up: true }}
            spark={[58,60,62,64,62,65,66,67,65,68,68,69,68,68,68]}
          />
        </div>

        {/* ── Section 2: Cold-Call Donut + Pipeline Area Chart ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Cold-Call Outcomes Donut (BEAUTIFIED LEGEND & LAYOUT) */}
          <Card innerGlow className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-2">
                <PhoneCall className="h-4 w-4 text-accent-magenta" />
                <CardTitle>Cold-Call Outcomes</CardTitle>
              </div>
              <Badge tone="default">342 total calls</Badge>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6 flex-1 justify-between">
              <div className="relative h-44 w-44 flex-shrink-0">
                <div
                  className="absolute inset-0 m-auto h-32 w-32 rounded-full blur-2xl opacity-20 pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${C.success}80 0%, transparent 70%)` }}
                />
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={callDonutData}
                      innerRadius={58}
                      outerRadius={78}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="rgba(10,10,10,0.8)"
                      strokeWidth={3}
                      startAngle={90}
                      endAngle={-270}
                      animationDuration={700}
                    >
                      {callDonutData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <RechartsTooltip {...TT} formatter={(v: number) => [v, 'calls']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-2xs uppercase tracking-widest text-text-tertiary">Total</div>
                  <div className="font-mono text-2xl font-bold text-text-primary leading-none mt-1">342</div>
                </div>
              </div>

              {/* Breath-taking indicator progress cards */}
              <div className="w-full space-y-2.5">
                {callDonutData.map((d) => {
                  const pct = ((d.value / 342) * 100);
                  return (
                    <div
                      key={d.name}
                      className="group rounded-xl border border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/[0.08] p-2.5 transition-all flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                          <span className="text-text-secondary font-medium">{d.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <span className="font-bold text-text-primary">{d.value}</span>
                          <span className="text-2xs text-text-tertiary">({pct.toFixed(0)}%)</span>
                        </div>
                      </div>
                      <div className="h-1 w-full bg-white/[0.04] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-out-expo"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: d.color,
                            boxShadow: `0 0 8px ${d.color}80`
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Right: Lead Generation Pipeline Area Chart */}
          <Card innerGlow className="lg:col-span-2 flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-accent-cyan" />
                <CardTitle>Lead Generation Pipeline · 30 Days</CardTitle>
              </div>
              <div className="flex items-center gap-4 text-2xs font-mono text-text-tertiary">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent-cyan inline-block" /> Discovered</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent-violet inline-block" /> Enriched</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-status-success inline-block" /> Qualified</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={pipelineTimeline} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradDisc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={C.cyan}    stopOpacity={0.18} />
                      <stop offset="95%" stopColor={C.cyan}    stopOpacity={0}    />
                    </linearGradient>
                    <linearGradient id="gradEnrich" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={C.violet}  stopOpacity={0.18} />
                      <stop offset="95%" stopColor={C.violet}  stopOpacity={0}    />
                    </linearGradient>
                    <linearGradient id="gradQual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={C.success} stopOpacity={0.22} />
                      <stop offset="95%" stopColor={C.success} stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: C.text, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.text, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip {...TT} />
                  <Area type="monotone" dataKey="discovered" name="Discovered" stroke={C.cyan}    strokeWidth={2} fill="url(#gradDisc)"   />
                  <Area type="monotone" dataKey="enriched"   name="Enriched"   stroke={C.violet}  strokeWidth={2} fill="url(#gradEnrich)" />
                  <Area type="monotone" dataKey="qualified"  name="Qualified"  stroke={C.success} strokeWidth={2} fill="url(#gradQual)"   />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* ── Section 3: Bar Charts (WITH TIMEFRAME TOGGLES) ────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Email Campaigns Card */}
          <Card innerGlow className="flex flex-col">
            <CardHeader className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-accent-violet" />
                <CardTitle>Email Open Rate by Campaign</CardTitle>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone="violet" className="hidden sm:inline-flex">{filteredCampaigns.length} campaigns</Badge>
                <TimeframeToggle value={campaignTf} onChange={setCampaignTf} />
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredCampaigns} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="emailBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor={C.violet}  stopOpacity={0.9} />
                      <stop offset="100%" stopColor={C.magenta} stopOpacity={0.5} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={C.border} vertical={false} strokeDasharray="2 4" />
                  <XAxis dataKey="name" tick={{ fill: C.text, fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.text, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <RechartsTooltip {...TT} formatter={(v: number) => [`${v}%`, 'Open Rate']} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="open" radius={[4,4,0,0]} fill="url(#emailBarGrad)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cold Calls Placed Card */}
          <Card innerGlow className="flex flex-col">
            <CardHeader className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-accent-magenta" />
                <CardTitle>Cold Calls Placed</CardTitle>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone="cyan" className="hidden sm:inline-flex">{filteredCalls.reduce((s, c) => s + c.calls, 0)} calls</Badge>
                <TimeframeToggle value={callsTf} onChange={setCallsTf} />
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredCalls} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="callBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor={C.cyan}    stopOpacity={0.9} />
                      <stop offset="100%" stopColor={C.cyan}    stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="callBarToday" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor={C.warning} stopOpacity={1}   />
                      <stop offset="100%" stopColor={C.warning} stopOpacity={0.5} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={C.border} vertical={false} strokeDasharray="2 4" />
                  <XAxis dataKey="day" tick={{ fill: C.text, fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.text, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip {...TT} formatter={(v: number) => [v, 'Calls']} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar
                    dataKey="calls"
                    radius={[4,4,0,0]}
                    shape={(props: any) => (
                      <rect
                        x={props.x} y={props.y}
                        width={props.width} height={props.height}
                        fill={props.index === filteredCalls.length - 1 ? 'url(#callBarToday)' : 'url(#callBarGrad)'}
                        rx={4}
                      />
                    )}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* ── Section 4: Template Leaderboard + Progress Grids ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <RankedList
            title="Best Performing Templates"
            icon={<Star className="h-4 w-4 text-status-success" />}
            badge="by open rate"
            items={templateRanks.map((t) => ({
              name: t.name,
              value: t.open,
              sub: '%',
              secondaryValue: t.reply,
              secondaryLabel: 'reply',
            }))}
            color={C.success}
          />

          <Card innerGlow>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-status-warning" />
                <CardTitle>AI Scoring Distribution</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Excellent (Score 90+)',  count: 382, pct: 25, tone: 'success' as const },
                { label: 'Good (Score 75–89)',      count: 740, pct: 50, tone: 'cyan' as const   },
                { label: 'Moderate (Score 50–74)', count: 280, pct: 19, tone: 'warning' as const },
                { label: 'Low (Score < 50)',        count: 80,  pct: 6,  tone: 'danger' as const },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-text-secondary">{row.label}</span>
                    <span className="font-mono text-text-primary">{row.count} · {row.pct}%</span>
                  </div>
                  <Progress value={row.pct} tone={row.tone} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card innerGlow>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-accent-violet" />
                <CardTitle>Deliverability Health</CardTitle>
              </div>
              <Badge tone="success" dot>Optimal</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Open Rate',        value: 68.4, target: 100, tone: 'success' as const, note: 'avg 22%'  },
                { label: 'Reply Rate',       value: 14.8, target: 100, tone: 'cyan' as const,    note: 'avg 3.5%' },
                { label: 'Bounce Rate',      value: 0.4,  target: 5,   tone: 'success' as const, note: 'max 2%'   },
                { label: 'Spam Report Rate', value: 0.02, target: 0.1, tone: 'success' as const, note: 'max 0.08%'},
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-text-secondary">{row.label}</span>
                    <span className="font-mono text-text-primary">{row.value}%
                      <span className="text-text-tertiary text-[10px] ml-1">· {row.note}</span>
                    </span>
                  </div>
                  <Progress value={(row.value / row.target) * 100} tone={row.tone} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* ── Section 5: Cold-Call Breakdown Today ─────────────── */}
        <div>
          <h3 className="text-xs uppercase tracking-widest text-text-tertiary mb-3 px-1 flex items-center gap-2">
            <Phone className="h-3.5 w-3.5" /> Cold-Call Breakdown · Today
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Calls Placed',        value: '38',     icon: PhoneCall,     tone: 'cyan',    note: '+9 vs yesterday'   },
              { label: 'Connected',           value: '21',     icon: CheckCircle2,  tone: 'success', note: '55.3% connect rate' },
              { label: 'No Answer / VM',      value: '12',     icon: PhoneMissed,   tone: 'warning', note: '31.6% miss rate'   },
              { label: 'Callbacks Booked',    value: '5',      icon: Calendar,      tone: 'violet',  note: 'Scheduled via AI'  },
              { label: 'Avg. Call Duration',  value: '3m 24s', icon: Clock,         tone: 'default', note: 'Connected calls'   },
              { label: 'Meetings from Calls', value: '2',      icon: Target,        tone: 'success', note: '9.5% conversion'   },
            ].map((s) => {
              const Icon = s.icon;
              const toneMap: Record<string, string> = {
                cyan:    'bg-cyan-500/10 text-accent-cyan',
                success: 'bg-status-success/10 text-status-success',
                warning: 'bg-status-warning/10 text-status-warning',
                violet:  'bg-accent-violet/10 text-accent-violet',
                default: 'bg-white/5 text-text-secondary',
              };
              return (
                <Card key={s.label} innerGlow className="p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xs uppercase tracking-wider text-text-tertiary">{s.label}</span>
                    <div className={cn('h-6 w-6 rounded flex items-center justify-center', toneMap[s.tone])}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <div className="font-mono text-lg font-bold text-text-primary">{s.value}</div>
                  <div className="text-2xs text-text-tertiary">{s.note}</div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* ── Section 6: Live Activity Feed (TABS CONSOLIDATED INTO HEADER) ── */}
        <Card innerGlow>
          <CardHeader className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-accent-cyan" />
              <CardTitle>Live Lead & Outreach Activity</CardTitle>
              <Badge tone="cyan" dot className="ml-2">{recentActivity.length} events today</Badge>
            </div>

            {/* Premium, responsive filter tabs embedded cleanly inside header actions */}
            <div className="flex items-center gap-1 bg-white/[0.02] p-0.5 rounded-lg border border-white/[0.05] overflow-x-auto scrollbar-hide max-w-full">
              {((['all', 'lead', 'email', 'call', 'meeting'] as ActivityFilter[])).map((f) => {
                const icons: Record<ActivityFilter, React.ReactNode> = {
                  all: <Activity className="h-3 w-3" />,
                  lead: <Search className="h-3 w-3" />,
                  email: <Mail className="h-3 w-3" />,
                  call: <PhoneCall className="h-3 w-3" />,
                  meeting: <Calendar className="h-3 w-3" />,
                };
                const labels: Record<ActivityFilter, string> = {
                  all: 'All', lead: 'Leads', email: 'Emails', call: 'Calls', meeting: 'Meetings',
                };
                const isActive = activityFilter === f;
                return (
                  <button
                    key={f}
                    onClick={() => setActivityFilter(f)}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
                      isActive
                        ? 'bg-white/[0.08] text-text-primary shadow-sm shadow-black/25'
                        : 'text-text-tertiary hover:text-text-secondary hover:bg-white/[0.01]'
                    )}
                  >
                    {icons[f]}
                    <span>{labels[f]}</span>
                    <span className={cn('font-mono text-[9px] px-1 rounded-sm leading-normal',
                      isActive ? 'bg-accent-cyan/20 text-accent-cyan' : 'bg-white/5 text-text-tertiary'
                    )}>
                      {filterCounts[f]}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            <div className="max-h-[390px] overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {filteredActivity.length > 0 ? (
                filteredActivity.map((e) => <ActivityRow key={e.id} e={e} />)
              ) : (
                <div className="text-center text-text-tertiary text-sm py-8 italic">
                  No activity of this type yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ClientShell>
  );
}
