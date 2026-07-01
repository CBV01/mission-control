'use client';

import * as React from 'react';
import {
  Phone, PhoneCall, PhoneOff, SkipForward, Play, Pause, User, CheckCircle2,
  MessageSquare, Terminal, DollarSign, Activity, BarChart3, TrendingUp,
  TrendingDown, Search, ArrowUpRight, Volume2, ShieldAlert, Award, FileText,
  Clock, Flame, Check, HelpCircle, X, Layers
} from 'lucide-react';
import { ClientShell } from '@/components/shell/client-shell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';

// ─── Interfaces ──────────────────────────────────────────────────────
interface CallOutcome {
  id: string;
  name: string;
  role: string;
  company: string;
  phone: string;
  duration: string;
  cost: number;
  sentiment: 'positive' | 'negative' | 'neutral' | 'no-answer';
  timestamp: string;
  transcript: { speaker: 'Agent' | 'Prospect'; text: string; time: string }[];
}

interface Lead {
  id: string;
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
  score: number;
  status: 'new' | 'contacted' | 'qualified' | 'nurturing' | 'unqualified';
  listName?: string;
}

// ─── Historic call records ───────────────────────────────────────────
const MOCK_HISTORIC_CALLS: CallOutcome[] = [
  {
    id: '1',
    name: 'Elena Rostova',
    role: 'Head of Growth',
    company: 'DataPulse',
    phone: '+44 20 7946 0958',
    duration: '01:05',
    cost: 0.16,
    sentiment: 'neutral',
    timestamp: '42 mins ago',
    transcript: [
      { speaker: 'Agent', text: 'Hello Elena, this is your AI agent from ArkiloStudios. Hope your day is going well!', time: '0:03' },
      { speaker: 'Prospect', text: 'Hi. Yes, what is this about? I am in a meeting in about 5 minutes.', time: '0:09' },
      { speaker: 'Agent', text: 'Understood, I will be brief. We help growth teams automate analytics tracking on user journeys. I wanted to see if DataPulse is looking to upgrade its event pipeline?', time: '0:18' },
      { speaker: 'Prospect', text: 'We are actually good on that front. We just implemented Segment. But you can send over an intro deck to my email and I will forward it to our growth engineer.', time: '0:32' },
      { speaker: 'Agent', text: 'Sounds perfect. I will drop that in your inbox. Thank you, Elena.', time: '0:45' }
    ]
  },
  {
    id: '2',
    name: 'Marcus Chen',
    role: 'VP of Engineering',
    company: 'CloudScale Inc',
    phone: '+1 (555) 876-5432',
    duration: '00:32',
    cost: 0.08,
    sentiment: 'negative',
    timestamp: '1 hour ago',
    transcript: [
      { speaker: 'Agent', text: 'Hello Marcus, this is the AI assistant calling from ArkiloStudios. Am I catching you at a bad time?', time: '0:02' },
      { speaker: 'Prospect', text: 'Yes, I am not interested. Please remove me from your calling list.', time: '0:10' },
      { speaker: 'Agent', text: 'Apologies for the intrusion, Marcus. I will update our records immediately. Have a great day.', time: '0:18' }
    ]
  }
];

export default function ColdCallPage() {
  const [callState, setCallState] = React.useState<'idle' | 'calling' | 'connected' | 'completed'>('idle');
  const [activeTab, setActiveTab] = React.useState<'transcript' | 'script'>('transcript');
  const [history, setHistory] = React.useState<CallOutcome[]>(MOCK_HISTORIC_CALLS);
  const [selectedCall, setSelectedCall] = React.useState<CallOutcome | null>(null);
  
  // Autopilot / Manual states
  const [dialerMode, setDialerMode] = React.useState<'manual' | 'autopilot'>('autopilot');
  const [dialerRunning, setDialerRunning] = React.useState(false);
  
  // Call session segment selection states
  const [showSegmentModal, setShowSegmentModal] = React.useState(false);
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [activeSegment, setActiveSegment] = React.useState<string>('General List');
  const [callQueue, setCallQueue] = React.useState<Lead[]>([]);
  const [currentLeadIdx, setCurrentLeadIdx] = React.useState(0);
  
  // History tab filtering state
  const [historyFilter, setHistoryFilter] = React.useState<string>('all');
  
  // Live call timer
  const [activeCallTime, setActiveCallTime] = React.useState(0);
  const [timerIntervalId, setTimerIntervalId] = React.useState<NodeJS.Timeout | null>(null);
  const [liveTranscript, setLiveTranscript] = React.useState<{ speaker: 'Agent' | 'Prospect'; text: string; time: string }[]>([]);

  // Telemetry aggregates
  const totalCalls = 1432 + history.length - MOCK_HISTORIC_CALLS.length;
  const costToday = 14.85 + history.reduce((sum, h) => sum + (h.timestamp === 'Just now' || h.timestamp.includes('ago') && !h.timestamp.includes('hour') ? h.cost : 0), 0);
  const responseRate = 48.6;
  const sentimentStats = React.useMemo(() => {
    const total = history.length;
    if (!total) return { positive: 50, negative: 50 };
    const positive = Math.round((history.filter(h => h.sentiment === 'positive').length / total) * 100);
    const negative = Math.round((history.filter(h => h.sentiment === 'negative' || h.sentiment === 'no-answer').length / total) * 100);
    return { positive, negative };
  }, [history]);

  // Load leads database on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mc_leads');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setLeads(parsed);
          setCallQueue(parsed);
        } catch (e) {
          // fallback
        }
      }
    }
  }, []);

  const uniqueSegments = React.useMemo(() => {
    const segments = leads.map(l => l.listName || 'General List');
    return Array.from(new Set(segments));
  }, [leads]);

  // Live timer tick
  React.useEffect(() => {
    if (callState === 'connected') {
      const interval = setInterval(() => {
        setActiveCallTime((prev) => prev + 1);
      }, 1000);
      setTimerIntervalId(interval);
      return () => clearInterval(interval);
    } else {
      if (timerIntervalId) {
        clearInterval(timerIntervalId);
        setTimerIntervalId(null);
      }
      setActiveCallTime(0);
    }
  }, [callState]);

  // Simulating dialog text stream during live call
  React.useEffect(() => {
    if (callState === 'calling') {
      setLiveTranscript([]);
      const activeLead = callQueue[currentLeadIdx];
      const timer = setTimeout(() => {
        setCallState('connected');
        setLiveTranscript([
          { speaker: 'Agent', text: `Hi ${activeLead?.name || 'there'}, this is your AI agent calling from ArkiloStudios. I noticed ${activeLead?.company || 'your company'} has been scaling out Next.js loops, is that correct?`, time: '0:02' }
        ]);
      }, 2500);
      return () => clearTimeout(timer);
    }

    if (callState === 'connected') {
      const activeLead = callQueue[currentLeadIdx];
      const responses = [
        { delay: 3500, speaker: 'Prospect' as const, text: `Hello! Yes, that is correct. I am the ${activeLead?.role || 'CTO'}. What exactly does ArkiloStudios do?`, time: '0:07' },
        { delay: 7500, speaker: 'Agent' as const, text: 'We build an autonomous voice and developer mission control dashboard. It automates next-generation pipelines and schedules outreach.', time: '0:15' },
        { delay: 11000, speaker: 'Prospect' as const, text: 'Sounds promising. I would love to check out your documentation.', time: '0:22' }
      ];

      const timers = responses.map((r) =>
        setTimeout(() => {
          setLiveTranscript((prev) => [...prev, { speaker: r.speaker, text: r.text, time: r.time }]);
        }, r.delay)
      );

      return () => timers.forEach(t => clearTimeout(t));
    }
  }, [callState, currentLeadIdx, callQueue]);

  const activeLead = callQueue[currentLeadIdx] || leads[0];

  const handleStartDialer = () => {
    if (leads.length === 0) return;
    setShowSegmentModal(true);
  };

  const handleConfirmSegmentCall = (segmentName: string) => {
    setActiveSegment(segmentName);
    const segmentLeads = leads.filter(l => (l.listName || 'General List') === segmentName);
    
    if (segmentLeads.length > 0) {
      setCallQueue(segmentLeads);
      setCurrentLeadIdx(0);
    } else {
      setCallQueue(leads);
      setCurrentLeadIdx(0);
    }

    setShowSegmentModal(false);
    setDialerRunning(true);
    setCallState('calling');
  };

  const handleStopDialer = () => {
    setDialerRunning(false);
    setCallState('idle');
  };

  const handleLogOutcome = (sentiment: 'positive' | 'negative' | 'neutral' | 'no-answer') => {
    const concludedLead = callQueue[currentLeadIdx] || activeLead;
    const finalDuration = formatCallTime(activeCallTime || Math.floor(Math.random() * 50) + 20);
    const finalCost = Number(((activeCallTime || 30) * 0.0025).toFixed(2));

    const newOutcome: CallOutcome = {
      id: `outcome-${Date.now()}`,
      name: concludedLead?.name || 'Unknown Prospect',
      role: concludedLead?.role || 'Prospect',
      company: concludedLead?.company || 'Company',
      phone: concludedLead?.phone || '+1 (555) 000-0000',
      duration: finalDuration,
      cost: finalCost,
      sentiment,
      timestamp: 'Just now',
      transcript: liveTranscript.length > 0 ? liveTranscript : [
        { speaker: 'Agent', text: 'Hi, this is your AI agent calling from ArkiloStudios.', time: '0:02' },
        { speaker: 'Prospect', text: 'Hello, I am busy right now.', time: '0:10' }
      ]
    };

    setHistory((prev) => [newOutcome, ...prev]);
    setCallState('completed');

    if (dialerRunning) {
      const nextIdx = (currentLeadIdx + 1) % callQueue.length;
      setCurrentLeadIdx(nextIdx);

      if (dialerMode === 'autopilot') {
        const delayTimer = setTimeout(() => {
          setCallState('calling');
        }, 2200);
        return () => clearTimeout(delayTimer);
      } else {
        setDialerRunning(false);
      }
    }
  };

  const handleManualDialNext = () => {
    setDialerRunning(true);
    setCallState('calling');
  };

  const formatCallTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Filtered Call History List
  const filteredHistory = React.useMemo(() => {
    return history.filter(h => historyFilter === 'all' || h.sentiment === historyFilter);
  }, [history, historyFilter]);

  return (
    <ClientShell>
      <div className="flex flex-col gap-6 pb-8">
        <PageHeader
          title="AI Cold-Calling Terminal"
          description="Outbound voice dialing workspace. Segment lists, review agent transcripts, and manage calling hooks."
          icon={<Phone className="h-4 w-4 text-white" />}
          actions={
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider font-mono text-text-tertiary uppercase">Dialer Mode:</span>
              <div className="flex bg-white/[0.03] border border-white/[0.08] p-1 rounded-xl">
                <button
                  onClick={() => setDialerMode('manual')}
                  className={cn(
                    'px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer',
                    dialerMode === 'manual' ? 'bg-white/10 text-white' : 'text-text-tertiary hover:text-text-secondary'
                  )}
                >
                  Manual
                </button>
                <button
                  onClick={() => setDialerMode('autopilot')}
                  className={cn(
                    'px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer',
                    dialerMode === 'autopilot' ? 'bg-gradient-accent text-white shadow-glow-cyan/20' : 'text-text-tertiary hover:text-text-secondary'
                  )}
                >
                  Autopilot
                </button>
              </div>
            </div>
          }
        />

        {/* ── Badass Metrics Strip ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-bg-elevated/40 p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-cyan-500/0 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] uppercase tracking-wider text-text-tertiary font-mono">Total Numbers Called</p>
                <h3 className="text-xl font-bold font-mono text-text-primary mt-1">{totalCalls.toLocaleString()}</h3>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5 mt-0.5">
                  <TrendingUp className="h-3 w-3" /> +14% today
                </span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <PhoneCall className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-bg-elevated/40 p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-violet-500/0 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] uppercase tracking-wider text-text-tertiary font-mono">Cost Spent</p>
                <h3 className="text-xl font-bold font-mono text-text-primary mt-1">${costToday.toFixed(2)}</h3>
                <span className="text-[10px] text-text-tertiary font-mono">Avg: $0.11 / call</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-violet-500/10 border-violet-500/20 flex items-center justify-center text-violet-400">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-bg-elevated/40 p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-emerald-500/0 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] uppercase tracking-wider text-text-tertiary font-mono">Response Rate</p>
                <h3 className="text-xl font-bold font-mono text-text-primary mt-1">{responseRate}%</h3>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5 mt-0.5">
                  <TrendingUp className="h-3 w-3" /> Target: 50%
                </span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Activity className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-bg-elevated/40 p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-amber-500/0 to-transparent pointer-events-none" />
            <div className="flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <p className="text-[9px] uppercase tracking-wider text-text-tertiary font-mono">Sentiment Performance</p>
                <Award className="h-4 w-4 text-amber-400" />
              </div>
              <div className="mt-2 flex flex-col gap-1">
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-mono text-text-secondary">
                    <span>Positive</span>
                    <span className="text-emerald-400 font-bold">{sentimentStats.positive}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: sentimentStats.positive + '%' }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-mono text-text-secondary">
                    <span>Negative</span>
                    <span className="text-red-400 font-bold">{sentimentStats.negative}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 rounded-full" style={{ width: sentimentStats.negative + '%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Dialer Workspace ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Active Dialer Console */}
          <div className={cn(
            'lg:col-span-2 relative rounded-2xl border bg-bg-elevated overflow-hidden flex flex-col justify-between p-5 min-h-[460px] transition-all duration-300',
            callState === 'calling' ? 'border-amber-500/40 shadow-lg shadow-amber-500/5' :
            callState === 'connected' ? 'border-emerald-500/40 shadow-lg shadow-emerald-500/5' :
            'border-white/[0.07]'
          )}>
            <div className={cn(
              'absolute inset-0 bg-gradient-to-br opacity-50 pointer-events-none',
              callState === 'calling' ? 'from-amber-500/10 via-amber-500/0 to-transparent' :
              callState === 'connected' ? 'from-emerald-500/10 via-emerald-500/0 to-transparent' :
              'from-white/[0.02] to-transparent'
            )} />

            {/* Header Telemetry */}
            <div className="relative flex items-center justify-between border-b border-white/[0.06] pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold font-mono tracking-widest text-text-tertiary">[NODE CALLER_01]</span>
                <span className="inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                  Segment: {activeSegment}
                </span>
              </div>
              <Badge
                tone={
                  callState === 'calling' ? 'warning' :
                  callState === 'connected' ? 'success' :
                  callState === 'completed' ? 'cyan' :
                  'default'
                }
                className="text-[9px] uppercase tracking-wider font-mono font-bold"
              >
                {callState}
              </Badge>
            </div>

            {/* Live Audio animation */}
            <div className="relative flex-1 flex flex-col items-center justify-center py-6">
              <div className="relative mb-6 flex items-center justify-center">
                {callState === 'calling' && (
                  <div className="absolute h-28 w-28 rounded-full border border-amber-500/20 bg-amber-500/5 animate-ping opacity-60" />
                )}
                {callState === 'connected' && (
                  <div className="absolute h-28 w-28 rounded-full border border-emerald-500/20 bg-emerald-500/5 animate-pulse" />
                )}
                <div className={cn(
                  'h-20 w-20 rounded-2xl flex items-center justify-center border transition-all duration-300',
                  callState === 'calling' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-glow-warning/10' :
                  callState === 'connected' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-glow-success/10 scale-105' :
                  'bg-white/[0.03] border-white/[0.07] text-text-tertiary'
                )}>
                  {callState === 'connected' ? (
                    <Volume2 className="h-8 w-8 animate-bounce" />
                  ) : (
                    <Phone className="h-8 w-8" />
                  )}
                </div>
              </div>

              {/* Lead details */}
              <div className="text-center space-y-1 z-10">
                {activeLead ? (
                  <>
                    <h3 className="font-bold text-text-primary text-sm">{activeLead.name}</h3>
                    <p className="text-[10px] text-text-tertiary font-mono">{activeLead.phone}</p>
                    <p className="text-[11px] text-text-tertiary">{activeLead.role} &middot; {activeLead.company}</p>
                  </>
                ) : (
                  <>
                    <h3 className="font-bold text-text-primary text-sm">No Active Lead Loaded</h3>
                    <p className="text-xs text-text-tertiary">Select a list segment to provision dialer queue.</p>
                  </>
                )}
                {callState === 'calling' && (
                  <p className="text-[11px] text-amber-400 animate-pulse mt-2">Connecting secure voice path...</p>
                )}
                {callState === 'connected' && (
                  <div className="flex items-center justify-center gap-1.5 mt-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-mono font-bold text-text-secondary">{formatCallTime(activeCallTime)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Active Control Panel */}
            <div className="relative flex flex-col gap-2 pt-4 border-t border-white/[0.06] shrink-0">
              {callState === 'idle' && (
                <button
                  onClick={handleStartDialer}
                  className="w-full h-10 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-gradient-accent text-white shadow-glow-cyan border-none hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                >
                  <Play className="h-4 w-4 fill-current" /> Initiate Call Session
                </button>
              )}

              {callState === 'calling' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setCallState('connected')}
                    className="flex-1 h-10 flex items-center justify-center text-xs font-bold uppercase tracking-wider rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black transition-all cursor-pointer"
                  >
                    Answered
                  </button>
                  <button
                    onClick={handleStopDialer}
                    className="flex-1 h-10 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all cursor-pointer"
                  >
                    <PhoneOff className="h-4 w-4" /> Cancel
                  </button>
                </div>
              )}

              {callState === 'connected' && (
                <button
                  onClick={() => setCallState('completed')}
                  className="w-full h-10 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all cursor-pointer"
                >
                  <PhoneOff className="h-4 w-4" /> Hang Up
                </button>
              )}

              {callState === 'completed' && (
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] uppercase tracking-wider font-mono text-text-tertiary text-center">Log Call Sentiment Outcome</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleLogOutcome('positive')}
                      className="h-8 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider rounded-lg bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/25 transition-all cursor-pointer"
                    >
                      Positive
                    </button>
                    <button
                      onClick={() => handleLogOutcome('neutral')}
                      className="h-8 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider rounded-lg bg-white/5 border border-white/10 text-text-secondary hover:bg-white/10 transition-all cursor-pointer"
                    >
                      Neutral
                    </button>
                    <button
                      onClick={() => handleLogOutcome('negative')}
                      className="h-8 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider rounded-lg bg-red-500/15 border border-red-500/20 text-red-400 hover:bg-red-500/25 transition-all cursor-pointer"
                    >
                      Negative
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLogOutcome('no-answer')}
                      className="flex-1 h-8 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-white/[0.02] border border-white/[0.05] text-text-tertiary hover:text-text-secondary transition-all cursor-pointer"
                    >
                      No Answer
                    </button>
                    {dialerMode === 'manual' && (
                      <button
                        onClick={handleManualDialNext}
                        className="flex-1 h-8 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Play className="h-3 w-3 fill-current" /> Dial Next
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Transcripts Workspace */}
          <div className="lg:col-span-3 flex flex-col gap-6 min-h-[460px]">
            <div className="flex-1 rounded-2xl border border-white/[0.07] bg-bg-elevated overflow-hidden flex flex-col">
              <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-1.5 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('transcript')}
                    className={cn(
                      'px-3 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer',
                      activeTab === 'transcript' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-text-tertiary hover:text-text-secondary'
                    )}
                  >
                    Voice Transcript
                  </button>
                  <button
                    onClick={() => setActiveTab('script')}
                    className={cn(
                      'px-3 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer',
                      activeTab === 'script' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-text-tertiary hover:text-text-secondary'
                    )}
                  >
                    AI Suggested Script
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-text-tertiary">
                  <Clock className="h-3 w-3" /> Live Telemetry
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
                {activeTab === 'transcript' ? (
                  <div className="flex-grow overflow-y-auto space-y-3.5 max-h-[300px] scrollbar-thin">
                    {liveTranscript.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center text-text-tertiary italic py-20">
                        <Volume2 className="h-8 w-8 text-white/10 mb-2 animate-pulse" />
                        <p className="text-xs">Establish voice link connection to stream dialogue...</p>
                      </div>
                    ) : (
                      liveTranscript.map((t, idx) => {
                        const isAgent = t.speaker === 'Agent';
                        return (
                          <div key={idx} className={cn('flex flex-col gap-1', isAgent ? 'items-end' : 'items-start')}>
                            <span className="text-[9px] font-mono text-text-tertiary uppercase">{t.speaker} &middot; {t.time}</span>
                            <div className={cn(
                              'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed',
                              isAgent
                                ? 'bg-cyan-500/10 border border-cyan-500/25 text-cyan-200 rounded-tr-none'
                                : 'bg-white/[0.03] border border-white/[0.06] text-text-secondary rounded-tl-none'
                            )}>
                              {t.text}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 text-xs leading-relaxed text-text-secondary max-h-[300px] overflow-y-auto scrollbar-thin">
                    <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.05] space-y-2">
                      <Badge tone="cyan" className="text-[9px] uppercase font-bold">1. Opening Hook</Badge>
                      <p className="text-text-primary">
                        "Hi {activeLead?.name || 'Alexander'}, this is your AI agent calling from ArkiloStudios. I noticed {activeLead?.company || 'SaaSify Global'} has been scaling out your Next.js engineering dashboard, is that correct?"
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.05] space-y-2">
                      <Badge tone="violet" className="text-[9px] uppercase font-bold">2. Value Pitch</Badge>
                      <p className="text-text-primary">
                        "We've built an AI-driven mission control that integrates with Next.js pipelines to automatically track deployment logs and analytics without manual configuration."
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-white/[0.06] shrink-0">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Terminal className="h-3.5 w-3.5 text-text-tertiary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary font-mono">Workspace Outcome Log Notes</span>
                  </div>
                  <textarea
                    placeholder="Enter custom follow up requirements..."
                    className="w-full h-16 bg-white/[0.03] border border-white/[0.08] rounded-xl p-2.5 text-xs text-text-primary focus:outline-none focus:border-cyan-500/50 resize-none font-mono placeholder:text-text-tertiary"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Call History Logs ── */}
        <div className="flex flex-col gap-4">
          {/* Header block with title & completed calls count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-text-secondary" />
              <h2 className="text-base font-bold text-text-primary uppercase tracking-wider">Outbound Call Log History</h2>
              <span className="text-[10px] font-mono text-text-tertiary font-semibold">({filteredHistory.length} listed)</span>
            </div>

            {/* Outcome sentiment filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 font-sans">
              {[
                { key: 'all', label: 'All' },
                { key: 'positive', label: 'Positive' },
                { key: 'neutral', label: 'Neutral' },
                { key: 'negative', label: 'Negative' },
                { key: 'no-answer', label: 'No Answer' }
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setHistoryFilter(f.key)}
                  className={cn(
                    'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer whitespace-nowrap',
                    historyFilter === f.key
                      ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
                      : 'bg-white/[0.02] border-white/[0.05] text-text-tertiary hover:text-text-secondary hover:border-white/10'
                  )}
                >
                  {f.label} ({f.key === 'all' ? history.length : history.filter(h => h.sentiment === f.key).length})
                </button>
              ))}
            </div>
          </div>

          {/* Fixed height scrollable history card table */}
          <div className="rounded-2xl border border-white/[0.07] bg-bg-elevated overflow-hidden max-h-[300px] overflow-y-auto scrollbar-thin">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-bg-elevated">
                  <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                    <th className="p-4 text-2xs font-bold uppercase tracking-wider text-text-tertiary">Prospect</th>
                    <th className="p-4 text-2xs font-bold uppercase tracking-wider text-text-tertiary">Phone</th>
                    <th className="p-4 text-2xs font-bold uppercase tracking-wider text-text-tertiary">Metrics</th>
                    <th className="p-4 text-2xs font-bold uppercase tracking-wider text-text-tertiary">Outcome Sentiment</th>
                    <th className="p-4 text-2xs font-bold uppercase tracking-wider text-text-tertiary">Concluded</th>
                    <th className="p-4 text-2xs font-bold uppercase tracking-wider text-text-tertiary text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-xs">
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((call) => {
                      const statusConfig = {
                        positive: { label: 'Positive', tone: 'success' as const, cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                        neutral:  { label: 'Neutral',  tone: 'default' as const, cls: 'text-text-secondary bg-white/5 border-white/10' },
                        negative: { label: 'Negative', tone: 'danger' as const,  cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
                        'no-answer': { label: 'No Answer', tone: 'warning' as const, cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
                      };
                      const cfg = statusConfig[call.sentiment];

                      return (
                        <tr key={call.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="text-text-primary font-bold">{call.name}</span>
                              <span className="text-[10px] text-text-tertiary mt-0.5">{call.role} &middot; {call.company}</span>
                            </div>
                          </td>
                          <td className="p-4 font-mono text-text-secondary">{call.phone}</td>
                          <td className="p-4">
                            <div className="flex flex-col font-mono">
                              <span className="text-text-secondary flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5 text-text-tertiary" /> {call.duration}
                              </span>
                              <span className="text-text-tertiary flex items-center gap-1 mt-0.5">
                                <DollarSign className="h-3.5 w-3.5 text-text-tertiary" /> ${call.cost.toFixed(2)}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={cn('inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border', cfg.cls)}>
                              {cfg.label}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-text-tertiary">{call.timestamp}</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => setSelectedCall(call)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/[0.08] hover:border-cyan-500/30 bg-white/[0.02] hover:bg-cyan-500/10 text-text-secondary hover:text-cyan-400 transition-all cursor-pointer font-bold uppercase tracking-wider text-[10px]"
                            >
                              <FileText className="h-3.5 w-3.5" /> Read Transcript
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-text-tertiary italic">
                        No concluded calls match this outcome filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ── Call Session Segment Selector Modal ── */}
      <Modal
        open={showSegmentModal}
        onClose={() => setShowSegmentModal(false)}
        title="Select Segment to Dial"
        description="Choose a pre-defined lead segment list to initiate the AI dialer queue."
        size="sm"
      >
        <div className="space-y-4 pt-2">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-tertiary">Select List Segment</span>
            <div className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-thin">
              <button
                onClick={() => handleConfirmSegmentCall('General List')}
                className={cn(
                  'w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer bg-white/[0.01] border-white/[0.05] hover:bg-white/[0.03]'
                )}
              >
                <div>
                  <span className="text-xs font-semibold text-text-primary block">All Directory Leads</span>
                  <span className="text-[9px] text-text-tertiary font-mono uppercase">Full unsegmented list</span>
                </div>
                <Badge tone="cyan" className="font-mono">{leads.length} leads</Badge>
              </button>

              {uniqueSegments.filter(s => s !== 'General List').map((seg) => {
                const count = leads.filter(l => l.listName === seg).length;
                return (
                  <button
                    key={seg}
                    onClick={() => handleConfirmSegmentCall(seg)}
                    className="w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer bg-white/[0.01] border-white/[0.05] hover:bg-white/[0.03]"
                  >
                    <div>
                      <span className="text-xs font-semibold text-text-primary block">{seg}</span>
                      <span className="text-[9px] text-text-tertiary font-mono uppercase">Segmented list name</span>
                    </div>
                    <Badge tone="cyan" className="font-mono">{count} leads</Badge>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.06]">
            <button
              onClick={() => setShowSegmentModal(false)}
              className="h-8 px-4 rounded-lg text-xs font-bold uppercase tracking-wider border border-white/[0.08] hover:bg-white/[0.05] text-text-secondary hover:text-text-primary transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Call Transcript Viewer Modal ── */}
      <Modal
        open={!!selectedCall}
        onClose={() => {
          setSelectedCall(null);
        }}
        title="AI Voice Conversation Record"
        description="Detailed text rendering of AI cold call script hook outcome logs."
        size="lg"
      >
        {selectedCall && <CallTranscriptDetails selectedCall={selectedCall} onClose={() => setSelectedCall(null)} />}
      </Modal>
    </ClientShell>
  );
}

// ─── Call Transcript Details Component with Interactive Audio ──────────
function CallTranscriptDetails({ selectedCall, onClose }: { selectedCall: CallOutcome; onClose: () => void }) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const playIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const durationSecs = React.useMemo(() => {
    if (!selectedCall.duration) return 60;
    const parts = selectedCall.duration.split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }, [selectedCall]);

  React.useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= durationSecs) {
            setIsPlaying(false);
            if (playIntervalRef.current) clearInterval(playIntervalRef.current);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, durationSecs]);

  // Reset player when call selection changes
  React.useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, [selectedCall]);

  const formatSecs = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60).toString().padStart(2, '0');
    const s = (totalSecs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const progressPercent = (currentTime / durationSecs) * 100;

  return (
    <div className="space-y-4">
      {/* Telemetry info banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <div>
          <span className="text-[9px] uppercase tracking-wider font-mono text-text-tertiary font-semibold">Prospect</span>
          <p className="text-xs font-bold text-text-primary mt-0.5">{selectedCall.name}</p>
          <p className="text-[10px] text-text-tertiary">{selectedCall.role} at {selectedCall.company}</p>
        </div>
        <div>
          <span className="text-[9px] uppercase tracking-wider font-mono text-text-tertiary font-semibold">Duration / Cost</span>
          <p className="text-xs font-bold font-mono text-text-primary mt-0.5">{selectedCall.duration}</p>
          <p className="text-[10px] font-mono text-text-tertiary">${selectedCall.cost.toFixed(2)} spent</p>
        </div>
        <div>
          <span className="text-[9px] uppercase tracking-wider font-mono text-text-tertiary font-semibold">Concluded</span>
          <p className="text-xs font-bold text-text-primary mt-0.5">{selectedCall.timestamp}</p>
          <p className="text-[10px] text-text-tertiary font-mono">Outbound call slot 1</p>
        </div>
        <div>
          <span className="text-[9px] uppercase tracking-wider font-mono text-text-tertiary font-semibold">Outcome Sentiment</span>
          <div className="mt-1">
            <span className={cn(
              'px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border',
              selectedCall.sentiment === 'positive' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
              selectedCall.sentiment === 'negative' ? 'text-red-400 bg-red-500/10 border-red-500/20' :
              selectedCall.sentiment === 'neutral' ? 'text-text-secondary bg-white/5 border-white/10' :
              'text-amber-400 bg-amber-500/10 border-amber-500/20'
            )}>
              {selectedCall.sentiment}
            </span>
          </div>
        </div>
      </div>

      {/* ── Badass Call Recording Audio Player Widget ── */}
      <div className="relative rounded-2xl border border-cyan-500/15 bg-cyan-500/[0.02] p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className={cn('h-4 w-4 text-cyan-400', isPlaying && 'animate-pulse')} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 font-mono">Outbound Voice Recording</span>
          </div>
          <span className="text-[9px] font-mono text-text-tertiary uppercase">Stereo Telemetry 16bit 8kHz</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Play/Pause custom button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={cn(
              'h-11 w-11 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300 cursor-pointer shadow-md',
              isPlaying
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400 shadow-cyan-500/10'
                : 'bg-white/5 border-white/10 text-white hover:border-cyan-500/30'
            )}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="h-4 w-4 fill-current ml-0.5" />
            )}
          </button>

          {/* Seekbar and wave visuals */}
          <div className="flex-1 space-y-2">
            {/* Wave animation simulation */}
            <div className="flex items-end justify-between h-6 gap-[2px] opacity-70">
              {Array.from({ length: 42 }).map((_, i) => {
                // Wave height patterns
                const heights = [
                  4, 8, 18, 12, 6, 14, 20, 24, 16, 8, 12, 18, 14, 6, 12, 22, 26, 18, 10,
                  6, 14, 12, 8, 16, 20, 14, 6, 12, 24, 22, 12, 8, 16, 18, 10, 4, 8, 14, 10, 6, 4, 2
                ];
                const active = progressPercent > (i / 42) * 100;
                return (
                  <div
                    key={i}
                    className={cn(
                      'flex-1 rounded-sm transition-all duration-300',
                      active ? 'bg-cyan-400' : 'bg-white/10',
                      isPlaying && active && 'animate-pulse'
                    )}
                    style={{
                      height: `${heights[i % heights.length]}px`,
                    }}
                  />
                );
              })}
            </div>

            {/* Slider bar */}
            <div className="relative w-full h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const percent = clickX / rect.width;
              setCurrentTime(Math.floor(percent * durationSecs));
            }}>
              <div
                className="absolute top-0 left-0 h-full bg-cyan-400 transition-all duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Time stamps */}
            <div className="flex justify-between text-[10px] font-mono text-text-tertiary">
              <span>{formatSecs(currentTime)}</span>
              <span>{formatSecs(durationSecs)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Conversation Dialog bubble scroll */}
      <div className="max-h-[220px] overflow-y-auto space-y-3.5 p-4 rounded-2xl border border-white/[0.05] bg-white/[0.01] scrollbar-thin">
        {selectedCall.transcript.map((t, idx) => {
          const isAgent = t.speaker === 'Agent';
          return (
            <div key={idx} className={cn('flex flex-col gap-1', isAgent ? 'items-end' : 'items-start')}>
              <span className="text-[9px] font-mono text-text-tertiary uppercase">{t.speaker} &middot; {t.time}</span>
              <div className={cn(
                'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed',
                isAgent
                  ? 'bg-cyan-500/10 border border-cyan-500/25 text-cyan-200 rounded-tr-none'
                  : 'bg-white/[0.03] border border-white/[0.06] text-text-secondary rounded-tl-none'
              )}>
                {t.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Close actions */}
      <div className="flex items-center justify-end pt-2">
        <button
          onClick={onClose}
          className="h-9 px-5 rounded-xl text-xs font-bold uppercase tracking-wider border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-text-secondary hover:text-text-primary transition-all cursor-pointer"
        >
          Close Transcript
        </button>
      </div>
    </div>
  );
}
