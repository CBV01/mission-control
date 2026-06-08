'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Wrench, Search, Sparkles } from 'lucide-react';
import { ClientShell } from '@/components/shell/client-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

const CATEGORIES = ['All', 'Autonomous', 'Creative', 'Data', 'DevOps', 'Email', 'Gaming', 'GitHub', 'MCP', 'Media', 'MLOps', 'Notes', 'Productivity', 'Research', 'Smart Home', 'Social', 'Software'];

function SkillsContent() {
  const { data, isLoading } = useQuery({ queryKey: ['skills'], queryFn: api.skills });
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const [installedOnly, setInstalledOnly] = useState(false);

  const filtered = (data?.skills ?? []).filter((s) => {
    if (cat !== 'All' && s.category !== cat) return false;
    if (installedOnly && !s.installed) return false;
    if (q && !s.name.toLowerCase().includes(q.toLowerCase()) && !s.description.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <PageHeader
        title="Skills Library"
        description={`${data?.skills.length ?? 0} skills · ${new Set(data?.skills.map(s => s.category)).size ?? 0} categories · ${data?.totalActive ?? 0} active this week`}
        icon={<Wrench className="h-4 w-4 text-white" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* LEFT: Filters — sticky so it stays fixed in place while the right column scrolls */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <Card innerGlow>
            <CardContent className="space-y-3 pt-4">
              <div>
                <label className="text-2xs uppercase tracking-wider text-text-tertiary">Search</label>
                <div className="relative mt-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-text-tertiary" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Fuzzy search…"
                    className="w-full h-8 pl-7 pr-2 rounded-md border border-white/10 bg-white/5 text-xs text-text-primary placeholder:text-text-tertiary focus:border-cyan-400/50 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-2xs uppercase tracking-wider text-text-tertiary">Category</label>
                <div className="mt-1 flex flex-wrap gap-1">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCat(c)}
                      className={cn(
                        'rounded-full border px-2 py-0.5 text-2xs font-medium transition-colors cursor-pointer',
                        cat === c
                          ? 'bg-gradient-accent text-white border-transparent shadow-glow-cyan'
                          : 'border-white/10 text-text-secondary hover:bg-white/5'
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={installedOnly}
                  onChange={(e) => setInstalledOnly(e.target.checked)}
                  className="rounded border-white/20 bg-white/5 text-accent-cyan focus:ring-cyan-400"
                />
                <span className="text-xs text-text-secondary">Installed only</span>
              </label>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Skill grid — page-level scroll, scrolls naturally with all skills */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {Array.from({length:6}).map((_,i) => <Skeleton key={i} className="h-32" />)}
            </div>
          ) : filtered.length === 0 ? (
            <Card innerGlow><CardContent className="py-12 text-center text-sm text-text-tertiary">No skills match your filters.</CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filtered.map((s) => {
                const Icon = (LucideIcons as any)[s.icon] || Sparkles;
                return (
                  <Card key={s.id} innerGlow hoverable className="group">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <Icon className={cn('h-5 w-5', s.active ? 'text-accent-cyan' : 'text-text-tertiary group-hover:text-accent-violet transition-colors')} />
                        {s.active && <Badge tone="cyan" dot>active</Badge>}
                        {!s.installed && <Badge tone="default">not installed</Badge>}
                      </div>
                      <h3 className="text-sm font-medium text-text-primary">{s.name}</h3>
                      <p className="text-2xs text-text-tertiary mt-1 line-clamp-2">{s.description}</p>
                      <div className="mt-3">
                        <Badge tone="violet" className="text-[10px]">{s.category}</Badge>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function SkillsPage() {
  return <ClientShell><SkillsContent /></ClientShell>;
}
