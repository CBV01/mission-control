'use client';

import * as React from 'react';
import {
  Zap, Play, Pause, MoreVertical, Plus, Users, Calendar,
  Check, Search, Layers,
  ArrowUpRight, Filter,
  CheckSquare, Square, Layout, Send, Eye,
} from 'lucide-react';
import { ClientShell } from '@/components/shell/client-shell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { Modal } from '@/components/ui/modal';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────────
interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'draft' | 'completed';
  recipientsCount: number;
  emailsSent: number;
  openRate: string;
  replyRate: string;
  template: string;
  createdAt: string;
  progress: number;
}

interface Lead {
  id: string;
  name: string;
  role: string;
  company: string;
  email: string;
  score: number;
  status: 'new' | 'contacted' | 'qualified' | 'nurturing' | 'unqualified';
  listName?: string;
}

interface Template {
  id: string;
  name: string;
  subject: string;
  openRate: string;
  replyRate: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────
const MOCK_CAMPAIGNS: Campaign[] = [
  { id: '1', name: 'SaaS Founder Scale Sequence', status: 'active', recipientsCount: 420, emailsSent: 180, openRate: '72.4%', replyRate: '14.8%', template: 'Productivity Pitch (Short)', createdAt: 'Jun 12, 2026', progress: 43 },
  { id: '2', name: 'Next.js Dev Loop Follow-up', status: 'active', recipientsCount: 280, emailsSent: 280, openRate: '61.5%', replyRate: '12.2%', template: 'Follow-up Case Study', createdAt: 'Jun 18, 2026', progress: 100 },
  { id: '3', name: 'Outbound Marketing Drip v2', status: 'paused', recipientsCount: 150, emailsSent: 40, openRate: '54.0%', replyRate: '6.5%', template: 'Cold Introduction (SaaS)', createdAt: 'Jun 22, 2026', progress: 27 },
  { id: '4', name: 'EU Tech Leaders (Webinar)', status: 'draft', recipientsCount: 500, emailsSent: 0, openRate: '—', replyRate: '—', template: 'Productivity Pitch (Short)', createdAt: 'Jun 29, 2026', progress: 0 },
];

const MOCK_LEADS: Lead[] = [
  { id: '1', name: 'Alexander Wright', role: 'CTO & Co-founder', company: 'SaaSify Global', email: 'alex@saasify.io', score: 94, status: 'qualified', listName: 'SaaS Founders' },
  { id: '2', name: 'Elena Rostova', role: 'Head of Growth', company: 'DataPulse', email: 'elena.r@datapulse.tech', score: 87, status: 'new', listName: 'Growth Leaders' },
  { id: '3', name: 'Marcus Chen', role: 'VP of Engineering', company: 'CloudScale Inc', email: 'm.chen@cloudscale.com', score: 79, status: 'contacted', listName: 'Tech Leads v2' },
  { id: '4', name: 'Sarah Jenkins', role: 'Chief Executive Officer', company: 'OmniFlow Solutions', email: 'sarah.jenkins@omniflow.co', score: 92, status: 'nurturing', listName: 'SaaS Founders' },
  { id: '5', name: 'Takashi Sato', role: 'Founder & MD', company: 'Nippon AI', email: 'sato@nippon.ai', score: 65, status: 'unqualified', listName: 'Asia Outbound' },
  { id: '6', name: 'Laura Martinez', role: 'Director of Product', company: 'LogiLink', email: 'l.martinez@logilink.net', score: 81, status: 'qualified', listName: 'Growth Leaders' },
];

const MOCK_TEMPLATES: Template[] = [
  { id: '1', name: 'Productivity Pitch (Short)', subject: 'Scale Next.js dev loops by 40%?', openRate: '72.4%', replyRate: '18.2%' },
  { id: '2', name: 'Follow-up Case Study', subject: 'Case study: How Acme Corp saved $15k', openRate: '61.5%', replyRate: '12.4%' },
  { id: '3', name: 'Cold Introduction (SaaS)', subject: 'Automate SaaS developer dashboards', openRate: '64.8%', replyRate: '11.2%' },
];

// ─── Helpers ────────────────────────────────────────────────────────
const statusConfig = {
  active:    { tone: 'success' as const,  label: 'Active',    icon: <Play className="h-3 w-3 fill-current" />, dot: 'bg-status-success' },
  paused:    { tone: 'warning' as const,  label: 'Paused',    icon: <Pause className="h-3 w-3" />, dot: 'bg-status-warning' },
  draft:     { tone: 'default' as const,  label: 'Draft',     icon: <Layers className="h-3 w-3" />, dot: 'bg-white/30' },
  completed: { tone: 'cyan' as const,     label: 'Completed', icon: <Check className="h-3 w-3" />, dot: 'bg-accent-cyan' },
};

const scoreColor = (score: number) =>
  score >= 90 ? 'text-status-success' : score >= 75 ? 'text-accent-cyan' : 'text-text-tertiary';

// ─── Create Campaign Modal ───────────────────────────────────────────
function CreateCampaignModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (campaign: Campaign) => void;
}) {
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [name, setName] = React.useState('');
  const [selectedLeadIds, setSelectedLeadIds] = React.useState<string[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string>('');
  const [leadSearch, setLeadSearch] = React.useState('');
  const [leadStatusFilter, setLeadStatusFilter] = React.useState<string>('all');
  const [selectedSegmentFilter, setSelectedSegmentFilter] = React.useState<string>('all');
  const [leads, setLeads] = React.useState<Lead[]>([]);

  // Load from localStorage or mock leads on open
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mc_leads');
      if (stored) {
        try {
          setLeads(JSON.parse(stored));
        } catch (e) {
          setLeads(MOCK_LEADS);
        }
      } else {
        setLeads(MOCK_LEADS);
      }
    }
  }, [open]);

  // Extract unique segment names
  const uniqueSegments = React.useMemo(() => {
    const segments = leads.map(l => l.listName || 'General List');
    return Array.from(new Set(segments));
  }, [leads]);

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(leadSearch.toLowerCase()) ||
      l.company.toLowerCase().includes(leadSearch.toLowerCase()) ||
      l.email.toLowerCase().includes(leadSearch.toLowerCase());
    const matchesStatus = leadStatusFilter === 'all' || l.status === leadStatusFilter;
    const matchesSegment = selectedSegmentFilter === 'all' || (l.listName || 'General List') === selectedSegmentFilter;
    return matchesSearch && matchesStatus && matchesSegment;
  });

  const selectedTemplate = MOCK_TEMPLATES.find((t) => t.id === selectedTemplateId);

  const toggleLead = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedLeadIds.length === filteredLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map((l) => l.id));
    }
  };

  // Auto select segment leads when chosen
  const handleSelectSegmentAll = (segmentName: string) => {
    if (segmentName === 'all') return;
    const segmentLeads = leads.filter(l => (l.listName || 'General List') === segmentName).map(l => l.id);
    setSelectedLeadIds(prev => {
      const union = Array.from(new Set([...prev, ...segmentLeads]));
      return union;
    });
  };

  const canProceedStep1 = name.trim().length > 0;
  const canProceedStep2 = selectedLeadIds.length > 0;
  const canSubmit = selectedTemplateId.length > 0;

  const handleReset = () => {
    setStep(1);
    setName('');
    setSelectedLeadIds([]);
    setSelectedTemplateId('');
    setLeadSearch('');
    setLeadStatusFilter('all');
    setSelectedSegmentFilter('all');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = () => {
    const tmpl = MOCK_TEMPLATES.find((t) => t.id === selectedTemplateId);
    onSubmit({
      id: Date.now().toString(),
      name: name.trim(),
      status: 'draft',
      recipientsCount: selectedLeadIds.length,
      emailsSent: 0,
      openRate: '—',
      replyRate: '—',
      template: tmpl?.name ?? '',
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      progress: 0,
    });
    handleReset();
    onClose();
  };

  const inputClass =
    'w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-cyan-500/50 placeholder:text-text-tertiary transition-colors';

  const StepIndicator = () => (
    <div className="flex items-center gap-1 mb-5">
      {[1, 2, 3].map((s) => (
        <React.Fragment key={s}>
          <div
            className={cn(
              'flex items-center justify-center h-6 w-6 rounded-full text-[10px] font-bold border transition-all',
              step > s
                ? 'bg-status-success border-status-success text-white'
                : step === s
                ? 'bg-accent-cyan/20 border-accent-cyan text-accent-cyan'
                : 'bg-white/[0.03] border-white/[0.08] text-text-tertiary'
            )}
          >
            {step > s ? <Check className="h-3 w-3" /> : s}
          </div>
          {s < 3 && (
            <div
              className={cn(
                'flex-1 h-px transition-all',
                step > s ? 'bg-status-success/50' : 'bg-white/[0.06]'
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create Campaign"
      description="Set up a new outreach sequence — name it, pick your leads, choose a template."
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-text-tertiary">
            Step {step} of 3
          </div>
          <div className="flex items-center gap-2">
            {step > 1 && (
              <Button variant="ghost" size="sm" onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}>
                Back
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            {step < 3 ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
                className={cn(
                  (step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2)
                    ? 'opacity-40 cursor-not-allowed'
                    : ''
                )}
              >
                Continue <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                className={cn(!canSubmit ? 'opacity-40 cursor-not-allowed' : '')}
              >
                <Send className="h-3.5 w-3.5 mr-1.5" /> Create Campaign
              </Button>
            )}
          </div>
        </div>
      }
    >
      <StepIndicator />

      {/* Step 1: Name */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-2xs uppercase tracking-wider text-text-tertiary">Campaign Name *</label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. SaaS Founder Scale Q3 2026"
              className={inputClass}
              onKeyDown={(e) => e.key === 'Enter' && canProceedStep1 && setStep(2)}
            />
            <p className="text-[10px] text-text-tertiary mt-0.5">Give your campaign a clear, descriptive name for easy identification.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {[
              { icon: <Users className="h-4 w-4 text-accent-cyan" />, label: 'Select leads from your database', title: 'Step 2: Leads' },
              { icon: <Layout className="h-4 w-4 text-accent-violet" />, label: 'Choose an email template', title: 'Step 3: Template' },
              { icon: <Send className="h-4 w-4 text-status-success" />, label: 'Campaign goes live as draft', title: 'Launch' },
            ].map((hint) => (
              <div key={hint.title} className="flex flex-col gap-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                {hint.icon}
                <span className="text-xs font-semibold text-text-primary">{hint.title}</span>
                <span className="text-[10px] text-text-tertiary">{hint.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Select Leads */}
      {step === 2 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-primary">
              Select Recipients from Lead Database
            </span>
            <Badge tone="cyan">
              {selectedLeadIds.length} selected
            </Badge>
          </div>

          {/* Search + filter bar */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
              <input
                type="text"
                placeholder="Search leads, companies, emails…"
                value={leadSearch}
                onChange={(e) => setLeadSearch(e.target.value)}
                className={`${inputClass} pl-9`}
              />
            </div>
            
            {/* Filter by segment dropdown */}
            <select
              value={selectedSegmentFilter}
              onChange={(e) => {
                const seg = e.target.value;
                setSelectedSegmentFilter(seg);
                handleSelectSegmentAll(seg);
              }}
              className={`${inputClass} sm:w-auto cursor-pointer font-mono text-xs`}
            >
              <option value="all">All segments</option>
              {uniqueSegments.map(seg => (
                <option key={seg} value={seg}>List: {seg}</option>
              ))}
            </select>

            <select
              value={leadStatusFilter}
              onChange={(e) => setLeadStatusFilter(e.target.value)}
              className={`${inputClass} sm:w-auto cursor-pointer`}
            >
              <option value="all">All statuses</option>
              <option value="new">New</option>
              <option value="qualified">Qualified</option>
              <option value="contacted">Contacted</option>
              <option value="nurturing">Nurturing</option>
              <option value="unqualified">Unqualified</option>
            </select>
          </div>

          {/* Select all toggle */}
          <div className="flex items-center justify-between px-1">
            <button
              onClick={toggleAll}
              className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              {selectedLeadIds.length === filteredLeads.length && filteredLeads.length > 0 ? (
                <CheckSquare className="h-3.5 w-3.5 text-accent-cyan" />
              ) : (
                <Square className="h-3.5 w-3.5" />
              )}
              Select all ({filteredLeads.length})
            </button>
            <span className="text-[10px] text-text-tertiary font-mono">{leads.length} total leads</span>
          </div>

          {/* Lead list */}
          <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredLeads.length === 0 ? (
              <div className="text-center py-8 text-text-tertiary text-sm">No leads match your search.</div>
            ) : (
              filteredLeads.map((lead) => {
                const isSelected = selectedLeadIds.includes(lead.id);
                return (
                  <button
                    key={lead.id}
                    onClick={() => toggleLead(lead.id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer',
                      isSelected
                        ? 'bg-accent-cyan/5 border-accent-cyan/25'
                        : 'bg-white/[0.01] border-white/[0.04] hover:bg-white/[0.03]'
                    )}
                  >
                    {/* Checkbox */}
                    <div className={cn(
                      'flex-shrink-0 h-4.5 w-4.5 rounded border transition-all flex items-center justify-center',
                      isSelected
                        ? 'bg-accent-cyan border-accent-cyan'
                        : 'border-white/20 bg-white/[0.03]'
                    )}>
                      {isSelected && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                    </div>

                    {/* Lead info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-text-primary truncate">{lead.name}</span>
                        <span className={cn('text-[10px] font-bold font-mono shrink-0', scoreColor(lead.score))}>
                          {lead.score}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-text-tertiary truncate">{lead.role} · {lead.company}</span>
                      </div>
                    </div>

                    {/* Email + status */}
                    <div className="shrink-0 text-right hidden sm:block">
                      <div className="text-[10px] font-mono text-text-tertiary truncate max-w-[140px]">{lead.email}</div>
                      <Badge
                        tone={
                          lead.status === 'qualified' ? 'success'
                          : lead.status === 'new' ? 'cyan'
                          : lead.status === 'nurturing' ? 'warning'
                          : lead.status === 'unqualified' ? 'danger'
                          : 'default'
                        }
                        className="text-[9px] mt-0.5"
                      >
                        {lead.status}
                      </Badge>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Step 3: Select Template */}
      {step === 3 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-primary">Choose an Email Template</span>
            <Badge tone="violet">{selectedLeadIds.length} recipients</Badge>
          </div>

          <div className="space-y-2">
            {MOCK_TEMPLATES.map((tmpl) => {
              const isSelected = selectedTemplateId === tmpl.id;
              return (
                <button
                  key={tmpl.id}
                  onClick={() => setSelectedTemplateId(tmpl.id)}
                  className={cn(
                    'w-full text-left p-4 rounded-xl border transition-all cursor-pointer',
                    isSelected
                      ? 'bg-accent-violet/5 border-accent-violet/30'
                      : 'bg-white/[0.01] border-white/[0.04] hover:bg-white/[0.03]'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Radio */}
                    <div className={cn(
                      'flex-shrink-0 mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all',
                      isSelected ? 'border-accent-violet' : 'border-white/20'
                    )}>
                      {isSelected && <div className="h-2 w-2 rounded-full bg-accent-violet" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-text-primary">{tmpl.name}</span>
                        <div className="flex items-center gap-3 shrink-0 text-[10px] font-mono">
                          <span className="text-text-tertiary">Open <span className="text-status-success font-bold">{tmpl.openRate}</span></span>
                          <span className="text-text-tertiary">Reply <span className="text-accent-cyan font-bold">{tmpl.replyRate}</span></span>
                        </div>
                      </div>
                      <p className="text-[11px] text-text-tertiary font-mono mt-1 truncate">
                        Subject: {tmpl.subject}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Summary */}
          {selectedTemplate && (
            <div className="mt-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <div className="text-xs font-semibold text-text-secondary mb-2">Campaign Summary</div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-text-tertiary block text-[10px] uppercase tracking-wider mb-0.5">Name</span>
                  <span className="text-text-primary font-medium">{name}</span>
                </div>
                <div>
                  <span className="text-text-tertiary block text-[10px] uppercase tracking-wider mb-0.5">Recipients</span>
                  <span className="text-accent-cyan font-bold font-mono">{selectedLeadIds.length} leads</span>
                </div>
                <div>
                  <span className="text-text-tertiary block text-[10px] uppercase tracking-wider mb-0.5">Template</span>
                  <span className="text-text-primary font-medium">{selectedTemplate.name}</span>
                </div>
                <div>
                  <span className="text-text-tertiary block text-[10px] uppercase tracking-wider mb-0.5">Status on Create</span>
                  <span className="text-status-warning font-medium">Draft (not launched)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

// ─── Campaign Card (Grid) ─────────────────────────────────────────────
function CampaignCard({
  c,
  onToggle,
}: {
  c: Campaign;
  onToggle: (id: string) => void;
}) {
  const cfg = statusConfig[c.status];

  const gradientMap = {
    active:    'from-emerald-500/20 via-emerald-500/5 to-transparent',
    paused:    'from-amber-500/20 via-amber-500/5 to-transparent',
    draft:     'from-white/10 via-white/3 to-transparent',
    completed: 'from-cyan-500/20 via-cyan-500/5 to-transparent',
  };

  const borderMap = {
    active:    'hover:border-emerald-500/30',
    paused:    'hover:border-amber-500/30',
    draft:     'hover:border-white/15',
    completed: 'hover:border-cyan-500/30',
  };

  const accentMap = {
    active:    'bg-gradient-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0',
    paused:    'bg-gradient-to-r from-amber-500/0 via-amber-500 to-amber-500/0',
    draft:     'bg-gradient-to-r from-white/0 via-white/20 to-white/0',
    completed: 'bg-gradient-to-r from-cyan-500/0 via-cyan-500 to-cyan-500/0',
  };

  const iconBgMap = {
    active:    'bg-emerald-500/15 text-emerald-400',
    paused:    'bg-amber-500/15 text-amber-400',
    draft:     'bg-white/5 text-text-tertiary',
    completed: 'bg-cyan-500/15 text-cyan-400',
  };

  const pulseMap = {
    active:    'bg-emerald-400',
    paused:    'bg-amber-400',
    draft:     'bg-white/30',
    completed: 'bg-cyan-400',
  };

  // Circular progress
  const r = 18;
  const circ = 2 * Math.PI * r;
  const dash = (c.progress / 100) * circ;

  return (
    <div className={cn(
      'group relative rounded-2xl border border-white/[0.07] bg-bg-elevated overflow-hidden transition-all duration-300 cursor-default',
      borderMap[c.status],
      'hover:shadow-lg'
    )}>
      {/* Top accent stripe */}
      <div className={cn('h-[2px] w-full', accentMap[c.status])} />

      {/* Gradient wash inside card */}
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-60 pointer-events-none', gradientMap[c.status])} />

      <div className="relative p-5 flex flex-col gap-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Icon */}
            <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border border-white/[0.06]', iconBgMap[c.status])}>
              <Zap className="h-4.5 w-4.5" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-text-primary text-sm leading-snug truncate">{c.name}</h3>
              <div className="flex items-center gap-1.5 mt-1">
                {/* Animated status dot */}
                <span className="relative flex h-2 w-2">
                  {c.status === 'active' && (
                    <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', pulseMap[c.status])} />
                  )}
                  <span className={cn('relative inline-flex rounded-full h-2 w-2', pulseMap[c.status])} />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">{cfg.label}</span>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="flex items-center gap-1 shrink-0">
            {c.status === 'active' ? (
              <button onClick={() => onToggle(c.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/[0.04] border border-white/[0.08] text-text-secondary hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-400 transition-all cursor-pointer">
                <Pause className="h-3 w-3" /> Pause
              </button>
            ) : c.status === 'paused' ? (
              <button onClick={() => onToggle(c.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer">
                <Play className="h-3 w-3 fill-current" /> Resume
              </button>
            ) : c.status === 'draft' ? (
              <button onClick={() => onToggle(c.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/20 transition-all cursor-pointer">
                <Play className="h-3 w-3 fill-current" /> Launch
              </button>
            ) : null}
            <button className="h-7 w-7 flex items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary hover:bg-white/[0.05] transition-all cursor-pointer">
              <MoreVertical className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 text-[10px] font-mono text-text-tertiary">
          <span className="flex items-center gap-1"><Layout className="h-2.5 w-2.5" />{c.template}</span>
          <span className="text-white/10">|</span>
          <span className="flex items-center gap-1"><Calendar className="h-2.5 w-2.5" />{c.createdAt}</span>
        </div>

        {/* Progress + metrics row */}
        <div className="flex items-center gap-4 pt-3 border-t border-white/[0.05]">
          {/* SVG circular progress */}
          {c.status !== 'draft' ? (
            <div className="shrink-0 relative h-14 w-14">
              <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
                <circle cx="28" cy="28" r={r} fill="none" strokeWidth="3" className="stroke-white/[0.06]" />
                <circle
                  cx="28" cy="28" r={r} fill="none" strokeWidth="3"
                  strokeDasharray={`${dash} ${circ}`}
                  strokeLinecap="round"
                  className={cn(
                    c.status === 'active' ? 'stroke-emerald-500' :
                    c.status === 'paused' ? 'stroke-amber-500' :
                    'stroke-cyan-500'
                  )}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[11px] font-bold font-mono text-text-primary">{c.progress}%</span>
              </div>
            </div>
          ) : (
            <div className="shrink-0 h-14 w-14 rounded-xl border border-dashed border-white/[0.1] flex items-center justify-center text-[10px] font-mono text-text-tertiary">
              DRAFT
            </div>
          )}

          {/* Metric chips */}
          <div className="flex-1 grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
              <span className="text-[9px] uppercase tracking-wider text-text-tertiary">Recipients</span>
              <span className="font-mono text-sm font-bold text-text-primary">{c.recipientsCount.toLocaleString()}</span>
            </div>
            <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
              <span className="text-[9px] uppercase tracking-wider text-text-tertiary">Sent</span>
              <span className="font-mono text-sm font-bold text-text-primary">{c.emailsSent.toLocaleString()}</span>
            </div>
            <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
              <span className="text-[9px] uppercase tracking-wider text-text-tertiary">Open Rate</span>
              <span className={cn('font-mono text-sm font-bold', c.openRate !== '-' && c.openRate !== '—' ? 'text-emerald-400' : 'text-text-tertiary')}>{c.openRate}</span>
            </div>
            <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
              <span className="text-[9px] uppercase tracking-wider text-text-tertiary">Reply Rate</span>
              <span className={cn('font-mono text-sm font-bold', c.replyRate !== '-' && c.replyRate !== '—' ? 'text-cyan-400' : 'text-text-tertiary')}>{c.replyRate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────
export default function OutreachCampaignPage() {
  const [campaigns, setCampaigns] = React.useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [toast, setToast] = React.useState<string | null>(null);

  const filteredCampaigns = campaigns.filter(
    (c) => statusFilter === 'all' || c.status === statusFilter
  );

  const stats = React.useMemo(() => ({
    active: campaigns.filter((c) => c.status === 'active').length,
    totalSent: campaigns.reduce((sum, c) => sum + c.emailsSent, 0),
    avgOpenRate: (() => {
      const active = campaigns.filter((c) => c.openRate !== '—');
      if (!active.length) return '—';
      const avg = active.reduce((sum, c) => sum + parseFloat(c.openRate), 0) / active.length;
      return `${avg.toFixed(1)}%`;
    })(),
    drafts: campaigns.filter((c) => c.status === 'draft').length,
  }), [campaigns]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleCreateCampaign = (campaign: Campaign) => {
    setCampaigns((prev) => [campaign, ...prev]);
    showToast(`Campaign "${campaign.name}" created as draft`);
  };

  const handleToggleStatus = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        if (c.status === 'active') return { ...c, status: 'paused' };
        if (c.status === 'paused') return { ...c, status: 'active' };
        if (c.status === 'draft') return { ...c, status: 'active' };
        return c;
      })
    );
  };

  return (
    <ClientShell>
      <div className="flex flex-col gap-6 pb-8">
        <PageHeader
          title="Outreach Campaigns"
          description="Build, launch, and monitor automated email sequencing workflows for targeted lead lists."
          icon={<Zap className="h-4 w-4 text-white" />}
          actions={
            <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" /> Create Campaign
            </Button>
          }
        />

        {/* ── Summary KPI strip ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Campaigns', value: stats.active, icon: <Play className="h-4 w-4" />, color: 'text-status-success', bg: 'bg-status-success/10' },
            { label: 'Emails Sent', value: stats.totalSent.toLocaleString(), icon: <Send className="h-4 w-4" />, color: 'text-accent-cyan', bg: 'bg-accent-cyan/10' },
            { label: 'Avg Open Rate', value: stats.avgOpenRate, icon: <Eye className="h-4 w-4" />, color: 'text-accent-violet', bg: 'bg-accent-violet/10' },
            { label: 'Drafts', value: stats.drafts, icon: <Layers className="h-4 w-4" />, color: 'text-text-secondary', bg: 'bg-white/5' },
          ].map((stat) => (
            <Card innerGlow key={stat.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center shrink-0', stat.bg, stat.color)}>
                  {stat.icon}
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-text-tertiary">{stat.label}</div>
                  <div className={cn('font-mono text-xl font-bold mt-0.5', stat.color)}>{stat.value}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-3.5 w-3.5 text-text-tertiary" />
          {['all', 'active', 'paused', 'draft', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                'px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border transition-all cursor-pointer',
                statusFilter === f
                  ? 'bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan'
                  : 'bg-white/[0.02] border-white/[0.06] text-text-tertiary hover:text-text-secondary hover:border-white/10'
              )}
            >
              {f === 'all' ? `All (${campaigns.length})` : `${f} (${campaigns.filter((c) => c.status === f).length})`}
            </button>
          ))}
        </div>

        {/* ── Campaign Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredCampaigns.length === 0 ? (
            <Card innerGlow>
              <CardContent className="p-12 text-center">
                <Zap className="h-10 w-10 text-text-tertiary mx-auto mb-3 opacity-30" />
                <p className="text-text-secondary font-medium">No campaigns match this filter.</p>
                <p className="text-text-tertiary text-sm mt-1">Try a different status filter or create a new campaign.</p>
              </CardContent>
            </Card>
          ) : (
            filteredCampaigns.map((c) => (
              <CampaignCard key={c.id} c={c} onToggle={handleToggleStatus} />
            ))
          )}
        </div>
      </div>

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateCampaign}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-status-success/30 bg-status-success/10 text-status-success text-sm font-medium shadow-xl animate-in slide-in-from-bottom-4 fade-in">
          <Check className="h-4 w-4" />
          {toast}
        </div>
      )}
    </ClientShell>
  );
}
