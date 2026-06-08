'use client';

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Network, Send, Bot, Cpu, Clock, DollarSign, TrendingUp, Activity, Hash, X } from 'lucide-react';
import { ClientShell } from '@/components/shell/client-shell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { StatusDot } from '@/components/ui/status-dot';
import { api } from '@/lib/api';
import { cn, fmtPct, fmtRelative, fmtDuration } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

function getIcon(name: string) {
  const I = (LucideIcons as any)[name];
  return I ? <I className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />;
}

type DomainTone = 'cyan' | 'violet' | 'magenta' | 'success' | 'warning' | 'info';

const DOMAIN_TONES: Record<string, DomainTone> = {
  outreach: 'cyan',
  marketing: 'magenta',
  seo: 'success',
  iptv: 'violet',
  ads: 'warning',
  dev: 'info',
};

function AgentsContent() {
  const { data, isLoading } = useQuery({ queryKey: ['agents'], queryFn: api.agents });
  const [expandedDomain, setExpandedDomain] = useState<string | null>('outreach');
  // Selected node: which card is highlighted in the tree
  // 'orchestrator' | { domain: string } | { agent: string }
  const [selectedNode, setSelectedNode] = useState<
    { kind: 'orchestrator' } | { kind: 'domain'; domainId: string } | { kind: 'agent'; agentId: string } | null
  >(null);

  const selectOrchestrator = () => setSelectedNode({ kind: 'orchestrator' });
  const selectDomain = (domainId: string) => setSelectedNode({ kind: 'domain', domainId });
  const selectAgent = (agentId: string) => setSelectedNode({ kind: 'agent', agentId });

  // Tree node positions for SVG line drawing
  const treeRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number; key: string }[]>([]);

  // Recompute connection lines whenever expansion changes
  useEffect(() => {
    if (!treeRef.current || !data) return;
    const recompute = () => {
      const tree = treeRef.current;
      if (!tree) return;
      const orchestrator = tree.querySelector<HTMLElement>('[data-node="orchestrator"]');
      if (!orchestrator) return;
      const treeRect = tree.getBoundingClientRect();
      const oRect = orchestrator.getBoundingClientRect();
      const ox = oRect.left + oRect.width / 2 - treeRect.left;
      const oy = oRect.bottom - treeRect.top;

      const newLines: typeof lines = [];

      data.domains.forEach((domain) => {
        const dom = tree.querySelector<HTMLElement>(`[data-node="domain-${domain.id}"]`);
        if (!dom) return;
        const dRect = dom.getBoundingClientRect();
        const dx = dRect.left + dRect.width / 2 - treeRect.left;
        const dy = dRect.top - treeRect.top;

        // Vertical from orchestrator down, then horizontal into domain
        const midY = (oy + dy) / 2;
        // Single path broken into segments for nicer drawing
        newLines.push({ key: `o-${domain.id}-v1`, x1: ox, y1: oy, x2: ox, y2: midY });
        newLines.push({ key: `o-${domain.id}-h`, x1: ox, y1: midY, x2: dx, y2: midY });
        newLines.push({ key: `o-${domain.id}-v2`, x1: dx, y1: midY, x2: dx, y2: dy });

        // If domain is expanded, draw lines to its sub-agents
        if (expandedDomain === domain.id) {
          domain.agents.forEach((agent) => {
            const a = tree.querySelector<HTMLElement>(`[data-node="agent-${agent.id}"]`);
            if (!a) return;
            const aRect = a.getBoundingClientRect();
            const ax = aRect.left + aRect.width / 2 - treeRect.left;
            const ay = aRect.top - treeRect.top;
            const aMidY = (dy + ay) / 2;
            newLines.push({ key: `d-${agent.id}-v1`, x1: dx, y1: dy, x2: dx, y2: aMidY });
            newLines.push({ key: `d-${agent.id}-h`, x1: dx, y1: aMidY, x2: ax, y2: aMidY });
            newLines.push({ key: `d-${agent.id}-v2`, x1: ax, y1: aMidY, x2: ax, y2: ay });
          });
        }
      });

      setLines(newLines);
    };

    // Delay to let layout settle
    const t = setTimeout(recompute, 50);
    window.addEventListener('resize', recompute);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', recompute);
    };
  }, [data, expandedDomain, isLoading]);

  const allAgents = data?.domains.flatMap((d) => d.agents) ?? [];
  const selectedDomain = selectedNode?.kind === 'domain'
    ? data?.domains.find((d) => d.id === selectedNode.domainId)
    : null;
  const selectedAgent = selectedNode?.kind === 'agent'
    ? allAgents.find((a) => a.id === selectedNode.agentId)
    : null;
  const selectedAgentDomain = selectedNode?.kind === 'agent'
    ? data?.domains.find((d) => d.agents.some((a) => a.id === selectedNode.agentId))
    : null;

  return (
    <>
      <PageHeader
        title="Agents & Domains"
        description="Hierarchical tree of orchestrator, domains, and sub-agents."
        icon={<Network className="h-4 w-4 text-white" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Tree */}
        <Card innerGlow className="lg:col-span-3 relative">
          <CardHeader>
            <CardTitle>Tree</CardTitle>
            <div className="flex items-center gap-2">
              <Badge tone="cyan">{data?.domains.length ?? 0} domains</Badge>
              <Badge tone="violet">{allAgents.length} agents</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[600px]" />
            ) : (
              <div ref={treeRef} className="relative pt-2 pb-8">
                {/* SVG layer for connection lines */}
                <svg
                  className="absolute inset-0 pointer-events-none"
                  style={{ width: '100%', height: '100%', overflow: 'visible' }}
                >
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.6} />
                    </linearGradient>
                    <linearGradient id="lineGradActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={1} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  {lines.map((l) => {
                    const isActive = l.key.includes('outreach'); // for highlight demo
                    return (
                      <line
                        key={l.key}
                        x1={l.x1}
                        y1={l.y1}
                        x2={l.x2}
                        y2={l.y2}
                        stroke={isActive ? 'url(#lineGradActive)' : 'url(#lineGrad)'}
                        strokeWidth={1.5}
                        strokeDasharray={isActive ? '0' : '4 4'}
                        className="transition-all duration-300"
                      />
                    );
                  })}
                </svg>

                {/* Root — Orchestrator */}
                <div className="flex justify-center mb-10">
                  <button
                    type="button"
                    data-node="orchestrator"
                    onClick={selectOrchestrator}
                    className={cn(
                      'relative rounded-2xl border-2 px-6 py-4 min-w-[260px] text-left transition-all cursor-pointer',
                      selectedNode?.kind === 'orchestrator'
                        ? 'border-cyan-400 bg-gradient-to-br from-cyan-500/20 to-violet-500/20 shadow-glow-cyan'
                        : 'border-cyan-400/40 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 shadow-glow-cyan hover:border-cyan-400/60 hover:from-cyan-500/15 hover:to-violet-500/15',
                    )}
                  >
                    <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-mono font-bold text-white shadow-glow-cyan">
                      1
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-accent shadow-glow-cyan">
                        <Network className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-2xs uppercase tracking-wider text-text-tertiary">Root</div>
                        <div className="text-base font-semibold text-text-primary">Orchestrator</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-lg font-semibold text-text-primary leading-none">
                          {allAgents.filter((a) => a.status === 'working').length}
                        </div>
                        <div className="text-2xs text-text-tertiary">active</div>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Domain layer */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {data?.domains.map((domain) => {
                    const isOpen = expandedDomain === domain.id;
                    const working = domain.agents.filter((a) => a.status === 'working').length;
                    const tone = DOMAIN_TONES[domain.id] ?? 'cyan';
                    const isSelected = selectedNode?.kind === 'domain' && selectedNode.domainId === domain.id;
                    return (
                      <div
                        key={domain.id}
                        data-node={`domain-${domain.id}`}
                        className="flex flex-col items-center"
                      >
                        <button
                          onClick={() => {
                            selectDomain(domain.id);
                            setExpandedDomain(domain.id);
                          }}
                          className={cn(
                            'group w-full rounded-xl border p-3 transition-all cursor-pointer',
                            isSelected
                              ? tone === 'cyan' ? 'border-cyan-400 bg-cyan-500/15 shadow-glow-cyan'
                              : tone === 'violet' ? 'border-accent-violet bg-accent-violet/15 shadow-glow-violet'
                              : tone === 'magenta' ? 'border-accent-magenta bg-accent-magenta/15 shadow-glow-magenta'
                              : tone === 'success' ? 'border-status-success bg-status-success/15 shadow-glow-success'
                              : tone === 'warning' ? 'border-status-warning bg-status-warning/15 shadow-glow-warning'
                              : 'border-status-info bg-status-info/15'
                              : isOpen
                              ? tone === 'cyan' ? 'border-cyan-400/40 bg-cyan-500/[0.08] shadow-glow-cyan'
                              : tone === 'violet' ? 'border-accent-violet/40 bg-accent-violet/[0.08] shadow-glow-violet'
                              : tone === 'magenta' ? 'border-accent-magenta/40 bg-accent-magenta/[0.08] shadow-glow-magenta'
                              : tone === 'success' ? 'border-status-success/40 bg-status-success/[0.08] shadow-glow-success'
                              : tone === 'warning' ? 'border-status-warning/40 bg-status-warning/[0.08] shadow-glow-warning'
                              : 'border-status-info/40 bg-status-info/[0.08]'
                              : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20',
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={cn(
                                'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg',
                                tone === 'cyan' ? 'bg-accent-cyan/15 text-accent-cyan'
                                : tone === 'violet' ? 'bg-accent-violet/15 text-accent-violet'
                                : tone === 'magenta' ? 'bg-accent-magenta/15 text-accent-magenta'
                                : tone === 'success' ? 'bg-status-success/15 text-status-success'
                                : tone === 'warning' ? 'bg-status-warning/15 text-status-warning'
                                : 'bg-status-info/15 text-status-info',
                              )}
                            >
                              {getIcon(domain.icon)}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <div className="text-sm font-semibold text-text-primary truncate">{domain.name}</div>
                              <div className="text-2xs text-text-tertiary">
                                {domain.agents.length} agents · {working} working
                              </div>
                            </div>
                            {working > 0 && (
                              <span className="flex h-2 w-2 flex-shrink-0 rounded-full bg-status-success shadow-glow-success animate-pulse-glow" />
                            )}
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Expanded domain agents */}
                {expandedDomain && (
                  <div className="mt-8 pt-4 border-t border-white/[0.06]">
                    {data?.domains
                      .filter((d) => d.id === expandedDomain)
                      .map((domain) => {
                        const tone = DOMAIN_TONES[domain.id] ?? 'cyan';
                        return (
                          <div key={domain.id}>
                            <div className="flex items-center gap-2 mb-4">
                              <Badge tone={tone}>{domain.name}</Badge>
                              <span className="text-2xs text-text-tertiary">
                                {domain.agents.length} sub-agents · click any to inspect
                              </span>
                              <button
                                onClick={() => setExpandedDomain(null)}
                                className="ml-auto flex h-6 w-6 items-center justify-center rounded-md text-text-tertiary hover:bg-white/5 hover:text-text-primary transition-colors cursor-pointer"
                                aria-label="Collapse domain"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {domain.agents.map((a) => {
                                const isSelected = selectedNode?.kind === 'agent' && selectedNode.agentId === a.id;
                                return (
                                  <button
                                    key={a.id}
                                    data-node={`agent-${a.id}`}
                                    onClick={() => selectAgent(a.id)}
                                    className={cn(
                                      'group relative rounded-lg border p-3 text-left transition-all cursor-pointer',
                                      isSelected
                                        ? 'border-cyan-400/50 bg-cyan-500/[0.08] shadow-glow-cyan'
                                        : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20',
                                    )}
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      <StatusDot
                                        status={a.status === 'working' ? 'live' : a.status === 'idle' ? 'idle' : 'danger'}
                                      />
                                      <span className="text-sm font-medium text-text-primary truncate flex-1">
                                        {a.name}
                                      </span>
                                    </div>
                                    <p className="text-2xs text-text-tertiary line-clamp-2 mb-2 min-h-[2.5em]">
                                      {a.description}
                                    </p>
                                    <div className="flex items-center justify-between text-2xs">
                                      <span className="font-mono text-text-secondary">{a.tasksToday} today</span>
                                      <span className="font-mono text-status-success">{fmtPct(a.successRate, 0)}</span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detail panel */}
        <Card innerGlow className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedNode?.kind === 'orchestrator' ? 'Orchestrator detail'
                : selectedNode?.kind === 'domain' ? 'Domain detail'
                : selectedNode?.kind === 'agent' ? 'Agent detail'
                : 'Detail'}
            </CardTitle>
            {selectedDomain && <Badge tone={DOMAIN_TONES[selectedDomain.id] ?? 'violet'}>{selectedDomain.name}</Badge>}
            {selectedAgent && selectedAgentDomain && <Badge tone={DOMAIN_TONES[selectedAgentDomain.id] ?? 'violet'}>{selectedAgentDomain.name}</Badge>}
          </CardHeader>
          <CardContent>
            {!selectedNode ? (
              <EmptyDetailPanel />
            ) : selectedNode.kind === 'orchestrator' ? (
              <OrchestratorDetailPanel
                allAgents={allAgents}
                domainCount={data?.domains.length ?? 0}
                onSelectDomain={selectDomain}
              />
            ) : selectedNode.kind === 'domain' && selectedDomain ? (
              <DomainDetailPanel
                domain={selectedDomain}
                onSelectAgent={selectAgent}
              />
            ) : selectedNode.kind === 'agent' && selectedAgent ? (
              <AgentDetailPanel agent={selectedAgent} />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────
function DetailStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2.5">
      <div className="flex items-center gap-1 text-text-tertiary text-2xs uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <div className="mt-0.5">{value}</div>
    </div>
  );
}

function EmptyDetailPanel() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-white/[0.08] mb-3">
        <Bot className="h-6 w-6 text-text-tertiary" />
      </div>
      <h3 className="text-sm font-medium text-text-primary mb-1">Select a node</h3>
      <p className="text-xs text-text-tertiary max-w-[220px]">
        Click the orchestrator, any domain, or any sub-agent to inspect its details.
      </p>
    </div>
  );
}

// ─── ORCHESTRATOR DETAIL ───────────────────────────────────────────
function OrchestratorDetailPanel({
  allAgents, onSelectDomain,
}: { allAgents: any[]; domainCount: number; onSelectDomain: (id: string) => void }) {
  const working = allAgents.filter((a) => a.status === 'working').length;
  const idle = allAgents.filter((a) => a.status === 'idle').length;
  const offline = allAgents.filter((a) => a.status === 'offline').length;
  const totalTasks = allAgents.reduce((s, a) => s + a.tasksToday, 0);
  const avgSuccess = allAgents.length > 0
    ? allAgents.reduce((s, a) => s + a.successRate, 0) / allAgents.length
    : 0;
  const totalCredits = allAgents.reduce((s, a) => s + a.tasksToday * a.avgCreditsPerTask, 0);

  // Group agents by status for the visualization
  const workingPct = allAgents.length > 0 ? (working / allAgents.length) * 100 : 0;
  const idlePct = allAgents.length > 0 ? (idle / allAgents.length) * 100 : 0;
  const offlinePct = allAgents.length > 0 ? (offline / allAgents.length) * 100 : 0;

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-accent shadow-glow-cyan">
            <Network className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-text-primary">Orchestrator</span>
              <Badge tone="cyan" dot>root</Badge>
            </div>
            <p className="text-2xs text-text-tertiary">Routes incoming tasks to the right specialist agent</p>
          </div>
        </div>
      </div>

      {/* Hero metric row */}
      <div className="grid grid-cols-2 gap-2 text-2xs">
        <DetailStat
          icon={<Activity className="h-3 w-3" />}
          label="Active now"
          value={<span className="font-mono text-lg text-status-success">{working}<span className="text-2xs text-text-tertiary"> / {allAgents.length}</span></span>}
        />
        <DetailStat
          icon={<Hash className="h-3 w-3" />}
          label="Tasks today"
          value={<span className="font-mono text-lg text-text-primary">{totalTasks}</span>}
        />
        <DetailStat
          icon={<TrendingUp className="h-3 w-3" />}
          label="Avg success"
          value={<span className="font-mono text-lg text-status-success">{fmtPct(avgSuccess, 0)}</span>}
        />
        <DetailStat
          icon={<DollarSign className="h-3 w-3" />}
          label="Spend today"
          value={<span className="font-mono text-lg text-text-primary">${totalCredits.toFixed(2)}</span>}
        />
      </div>

      {/* Status distribution bar */}
      <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-3">
        <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-2">Agent status</div>
        <div className="flex h-2.5 rounded-full overflow-hidden bg-white/[0.04] mb-2">
          <div className="bg-status-success" style={{ width: `${workingPct}%` }} />
          <div className="bg-text-tertiary" style={{ width: `${idlePct}%` }} />
          <div className="bg-status-danger" style={{ width: `${offlinePct}%` }} />
        </div>
        <div className="flex items-center justify-between text-2xs">
          <span className="flex items-center gap-1.5 text-status-success"><span className="h-1.5 w-1.5 rounded-full bg-status-success" />{working} working</span>
          <span className="flex items-center gap-1.5 text-text-tertiary"><span className="h-1.5 w-1.5 rounded-full bg-text-tertiary" />{idle} idle</span>
          <span className="flex items-center gap-1.5 text-status-danger"><span className="h-1.5 w-1.5 rounded-full bg-status-danger" />{offline} offline</span>
        </div>
      </div>

      {/* Domains list */}
      <div>
        <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-2">Domains under orchestrator</div>
        <div className="space-y-1">
          {['outreach', 'marketing', 'seo', 'iptv', 'ads', 'dev'].map((id) => {
            const tone = DOMAIN_TONES[id] ?? 'cyan';
            const agentCount = allAgents.filter((a) => a.id.startsWith(id)).length;
            return (
              <button
                key={id}
                onClick={() => onSelectDomain(id)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors text-left cursor-pointer"
              >
                <span
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded',
                    tone === 'cyan' ? 'bg-accent-cyan/15 text-accent-cyan'
                    : tone === 'violet' ? 'bg-accent-violet/15 text-accent-violet'
                    : tone === 'magenta' ? 'bg-accent-magenta/15 text-accent-magenta'
                    : tone === 'success' ? 'bg-status-success/15 text-status-success'
                    : tone === 'warning' ? 'bg-status-warning/15 text-status-warning'
                    : 'bg-status-info/15 text-status-info',
                  )}
                >
                  <Bot className="h-3 w-3" />
                </span>
                <span className="text-xs text-text-primary capitalize">{id}</span>
                <span className="ml-auto text-2xs text-text-tertiary font-mono">{agentCount}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-3 text-2xs">
        <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-1">Routing</div>
        <p className="text-text-secondary leading-relaxed">
          The orchestrator inspects each incoming task, classifies it, and dispatches to the best matching domain.
          If a specialist fails, it falls back to the next-best agent within the same domain.
        </p>
      </div>
    </div>
  );
}

// ─── DOMAIN DETAIL ─────────────────────────────────────────────────
function DomainDetailPanel({
  domain, onSelectAgent,
}: { domain: any; onSelectAgent: (id: string) => void }) {
  const tone = DOMAIN_TONES[domain.id] ?? 'cyan';
  const working = domain.agents.filter((a: any) => a.status === 'working').length;
  const idle = domain.agents.filter((a: any) => a.status === 'idle').length;
  const offline = domain.agents.filter((a: any) => a.status === 'offline').length;
  const totalTasks = domain.agents.reduce((s: number, a: any) => s + a.tasksToday, 0);
  const avgSuccess = domain.agents.length > 0
    ? domain.agents.reduce((s: number, a: any) => s + a.successRate, 0) / domain.agents.length
    : 0;
  const totalCredits = domain.agents.reduce((s: number, a: any) => s + a.tasksToday * a.avgCreditsPerTask, 0);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg',
              tone === 'cyan' ? 'bg-accent-cyan/15 text-accent-cyan'
              : tone === 'violet' ? 'bg-accent-violet/15 text-accent-violet'
              : tone === 'magenta' ? 'bg-accent-magenta/15 text-accent-magenta'
              : tone === 'success' ? 'bg-status-success/15 text-status-success'
              : tone === 'warning' ? 'bg-status-warning/15 text-status-warning'
              : 'bg-status-info/15 text-status-info',
            )}
          >
            {getIcon(domain.icon)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-text-primary">{domain.name}</span>
              <Badge tone={tone}>domain</Badge>
            </div>
            <p className="text-2xs text-text-tertiary">{domain.description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-2xs">
        <DetailStat
          icon={<Bot className="h-3 w-3" />}
          label="Sub-agents"
          value={<span className="font-mono text-lg text-text-primary">{domain.agents.length}</span>}
        />
        <DetailStat
          icon={<Activity className="h-3 w-3" />}
          label="Active now"
          value={<span className="font-mono text-lg text-status-success">{working}<span className="text-2xs text-text-tertiary"> / {domain.agents.length}</span></span>}
        />
        <DetailStat
          icon={<Hash className="h-3 w-3" />}
          label="Tasks today"
          value={<span className="font-mono text-lg text-text-primary">{totalTasks}</span>}
        />
        <DetailStat
          icon={<TrendingUp className="h-3 w-3" />}
          label="Avg success"
          value={<span className="font-mono text-lg text-status-success">{fmtPct(avgSuccess, 0)}</span>}
        />
      </div>

      <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-3 text-2xs">
        <div className="flex items-center justify-between text-2xs">
          <span className="text-text-tertiary uppercase tracking-wider">Spend today</span>
          <span className="font-mono text-text-primary">${totalCredits.toFixed(2)}</span>
        </div>
        <div className="mt-2 flex items-center gap-3 text-2xs">
          <span className="flex items-center gap-1 text-status-success"><span className="h-1.5 w-1.5 rounded-full bg-status-success" />{working} working</span>
          <span className="flex items-center gap-1 text-text-tertiary"><span className="h-1.5 w-1.5 rounded-full bg-text-tertiary" />{idle} idle</span>
          <span className="flex items-center gap-1 text-status-danger"><span className="h-1.5 w-1.5 rounded-full bg-status-danger" />{offline} offline</span>
        </div>
      </div>

      <div>
        <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-2">Sub-agents</div>
        <div className="space-y-1">
          {domain.agents.map((a: any) => (
            <button
              key={a.id}
              onClick={() => onSelectAgent(a.id)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors text-left cursor-pointer"
            >
              <StatusDot
                status={a.status === 'working' ? 'live' : a.status === 'idle' ? 'idle' : 'danger'}
              />
              <span className="text-xs text-text-primary flex-1 truncate">{a.name}</span>
              <span className="text-2xs text-text-tertiary font-mono">{a.tasksToday}</span>
              <span className="text-2xs text-status-success font-mono w-8 text-right">{fmtPct(a.successRate, 0)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── AGENT DETAIL ──────────────────────────────────────────────────
function AgentDetailPanel({ agent }: { agent: any }) {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <StatusDot status={agent.status === 'working' ? 'live' : 'idle'} label />
          <span className="text-sm font-medium text-text-primary">{agent.name}</span>
        </div>
        <p className="text-xs text-text-secondary">{agent.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-2xs">
        <DetailStat
          icon={<Activity className="h-3 w-3" />}
          label="Tasks today"
          value={<span className="font-mono text-lg text-text-primary">{agent.tasksToday}</span>}
        />
        <DetailStat
          icon={<TrendingUp className="h-3 w-3" />}
          label="Success rate"
          value={<span className="font-mono text-lg text-status-success">{fmtPct(agent.successRate, 0)}</span>}
        />
        <DetailStat
          icon={<Clock className="h-3 w-3" />}
          label="Avg duration"
          value={<span className="font-mono text-sm text-text-primary">{fmtDuration(agent.avgDurationMs)}</span>}
        />
        <DetailStat
          icon={<DollarSign className="h-3 w-3" />}
          label="$/task"
          value={<span className="font-mono text-sm text-text-primary">${agent.avgCreditsPerTask.toFixed(3)}</span>}
        />
      </div>

      <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-3">
        <div className="flex items-center gap-1.5 text-2xs uppercase tracking-wider text-text-tertiary mb-2">
          <Cpu className="h-3 w-3" /> Model
        </div>
        <div className="font-mono text-xs text-text-primary break-all">{agent.model}</div>
        <div className="text-2xs text-text-tertiary mt-1.5">
          Last active {fmtRelative(agent.lastActive)}
        </div>
      </div>

      <div className="pt-3 border-t border-white/[0.06]">
        <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-2">Send command</div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={`/delegate ${agent.id} ...`}
            className="flex-1 h-8 rounded-md border border-white/[0.08] bg-white/[0.04] px-2 text-xs text-text-primary placeholder:text-text-tertiary focus:border-cyan-400/50 focus:outline-none"
          />
          <Button size="sm" variant="primary">
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="pt-3 border-t border-white/[0.06]">
        <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-2 flex items-center gap-1.5">
          <Hash className="h-3 w-3" /> Recent activity
        </div>
        <div className="space-y-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 text-2xs py-1.5 px-2 rounded bg-white/[0.02]">
              <span className="font-mono text-text-tertiary">{fmtRelative(agent.lastActive)}</span>
              <span className="flex-1 truncate text-text-secondary">
                {i === 0 ? 'completed' : i === 1 ? 'failed' : 'in progress'} · task #{Math.floor(Math.random() * 1000)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AgentsPage() {
  return <ClientShell><AgentsContent /></ClientShell>;
}
