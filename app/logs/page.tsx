'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Search, X } from 'lucide-react';
import { ClientShell } from '@/components/shell/client-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { fmtDuration, fmtTime } from '@/lib/utils';
import type { LogEntry } from '@/lib/types';

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'errors', label: 'Errors' },
  { id: 'completed', label: 'Completed' },
];

function LogsContent() {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<LogEntry | null>(null);
  const { data, isLoading } = useQuery({ queryKey: ['logs'], queryFn: api.logs });

  const filtered = (data?.logs ?? [])
    .filter((l) => {
      if (tab === 'errors' && l.status === 'completed') return false;
      if (tab === 'completed' && l.status !== 'completed') return false;
      if (search && !l.task.toLowerCase().includes(search.toLowerCase()) && !l.agent.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .slice(0, 100);

  return (
    <>
      <PageHeader
        title="Logs & Insights"
        description="Last 100 entries · auto-refresh every 30s"
        icon={<FileText className="h-4 w-4 text-white" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
        {/* LEFT: Filters — sticky so it stays in place while the right column scrolls */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <Card innerGlow>
            <CardContent className="pt-4 space-y-3">
              <div>
                <label className="text-2xs uppercase tracking-wider text-text-tertiary">Search</label>
                <div className="relative mt-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-text-tertiary" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Task or agent…"
                    className="w-full h-8 pl-7 pr-2 rounded-md border border-white/10 bg-white/5 text-xs text-text-primary placeholder:text-text-tertiary focus:border-cyan-400/50 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-2xs uppercase tracking-wider text-text-tertiary">Status</label>
                <div className="mt-2">
                  <Tabs tabs={tabs} active={tab} onChange={setTab} className="flex flex-col w-full [&>button]:w-full [&>button]:justify-start" />
                </div>
              </div>
              <div className="text-2xs text-text-tertiary pt-2 border-t border-white/5">
                <div>Showing {filtered.length} of {data?.logs.length ?? 0}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Log table — scrolls naturally with the page */}
        <Card innerGlow className="lg:col-span-3">
          <CardContent className="p-0">
            {isLoading ? <Skeleton className="h-96" /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-2xs uppercase tracking-wider text-text-tertiary border-b border-white/5">
                    <tr>
                      <th className="text-left pl-4 pr-3 py-3 w-20">Time</th>
                      <th className="text-left px-3 py-3 w-32">Agent</th>
                      <th className="text-left px-3 py-3">Task</th>
                      <th className="text-left px-3 py-3 w-32">Model</th>
                      <th className="text-left px-3 py-3 w-28">Status</th>
                      <th className="text-right pl-3 pr-4 py-3 w-28">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((l) => (
                      <tr
                        key={l.id}
                        onClick={() => setSelected(l)}
                        className="border-b border-white/5 hover:bg-white/5 cursor-pointer"
                      >
                        <td className="pl-4 pr-3 py-3 font-mono text-2xs text-text-tertiary">{fmtTime(l.timestamp)}</td>
                        <td className="px-3 py-3"><Badge tone="default" className="font-mono text-[10px]">{l.agent.split('-').slice(-1)[0]}</Badge></td>
                        <td className="px-3 py-3 text-text-primary max-w-md truncate">{l.task}</td>
                        <td className="px-3 py-3 font-mono text-2xs text-text-tertiary">{l.model.split('/').pop()?.slice(0, 12)}</td>
                        <td className="px-3 py-3">
                          {l.status === 'completed' && <Badge tone="success" dot>OK</Badge>}
                          {l.status === 'failed' && <Badge tone="danger" dot>Failed</Badge>}
                          {l.status === 'timeout' && <Badge tone="warning" dot>Timeout</Badge>}
                          {l.status === 'pending' && <Badge tone="default" dot>Pending</Badge>}
                        </td>
                        <td className="pl-3 pr-4 py-3 text-right font-mono text-2xs text-text-primary">${l.credits.toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md z-modal bg-bg-elevated border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <h3 className="text-sm font-semibold text-text-primary">Log entry · {selected.id}</h3>
            <button onClick={() => setSelected(null)} className="text-text-tertiary hover:text-text-primary cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div><div className="text-text-tertiary text-2xs">Time</div><div className="font-mono">{selected.timestamp}</div></div>
              <div><div className="text-text-tertiary text-2xs">Status</div><Badge tone={selected.status === 'completed' ? 'success' : 'danger'} dot>{selected.status}</Badge></div>
              <div><div className="text-text-tertiary text-2xs">Agent</div><div className="font-mono">{selected.agent}</div></div>
              <div><div className="text-text-tertiary text-2xs">Model</div><div className="font-mono">{selected.model}</div></div>
              <div><div className="text-text-tertiary text-2xs">Duration</div><div className="font-mono">{fmtDuration(selected.durationMs)}</div></div>
              <div><div className="text-text-tertiary text-2xs">Cost</div><div className="font-mono">${selected.credits.toFixed(4)}</div></div>
              <div><div className="text-text-tertiary text-2xs">Tokens In</div><div className="font-mono">{selected.tokensIn.toLocaleString()}</div></div>
              <div><div className="text-text-tertiary text-2xs">Tokens Out</div><div className="font-mono">{selected.tokensOut.toLocaleString()}</div></div>
            </div>
            <div>
              <div className="text-text-tertiary text-2xs mb-1">Task</div>
              <div className="text-text-primary">{selected.task}</div>
            </div>
            {selected.error && (
              <div>
                <div className="text-status-danger text-2xs mb-1">Error</div>
                <pre className="rounded border border-status-danger/30 bg-status-danger/5 p-2 font-mono text-2xs text-status-danger whitespace-pre-wrap">{selected.error}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function LogsPage() {
  return <ClientShell><LogsContent /></ClientShell>;
}
