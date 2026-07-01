'use client';

import * as React from 'react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Settings as SettingsIcon, Key, Brain, Palette, Server, Save,
  Eye, EyeOff, Copy, RefreshCw, Check, Plus, ChevronRight, X, Sparkles,
  Layout as LayoutIcon, MonitorSmartphone, Bell, Shield, Activity,
  Database, Globe, Zap, Trash2, ExternalLink, Cpu, Volume2,
} from 'lucide-react';
import { ClientShell } from '@/components/shell/client-shell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs } from '@/components/ui/tabs';
import { useUIStore } from '@/lib/store';
import type { PersonalityTone } from '@/lib/types';
import { api } from '@/lib/api';
import { cn, fmtRelative } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

const tabs = [
  { id: 'model', label: 'Model' },
  { id: 'personality', label: 'Personality' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'system', label: 'System' },
];

// Theme definitions — applied via inline CSS variables on <html>
const THEMES = {
  dark: {
    label: 'Dark',
    description: 'Default. Pure black surfaces, violet/cyan accents.',
    swatch: { bg: '#0a0a0a', surface: '#171717', accent: '#06b6d4' },
    vars: {
      '--bg-root': '10 10 10',
      '--bg-surface': '15 15 16',
      '--bg-elevated': '23 23 23',
      '--text-primary': '250 250 250',
      '--text-secondary': '161 161 170',
      '--text-tertiary': '113 113 122',
    },
  },
  midnight: {
    label: 'Midnight',
    description: 'Deep navy. Calmer, cooler, easy on the eyes at night.',
    swatch: { bg: '#0a0f1f', surface: '#101728', accent: '#6366f1' },
    vars: {
      '--bg-root': '8 12 24',
      '--bg-surface': '13 19 36',
      '--bg-elevated': '20 28 48',
      '--text-primary': '241 245 249',
      '--text-secondary': '148 163 184',
      '--text-tertiary': '100 116 139',
    },
  },
  cyber: {
    label: 'Cyber',
    description: 'High-contrast neon. Magenta on near-black for that sci-fi vibe.',
    swatch: { bg: '#0a0008', surface: '#1a0410', accent: '#d946ef' },
    vars: {
      '--bg-root': '8 0 6',
      '--bg-surface': '20 4 14',
      '--bg-elevated': '34 8 24',
      '--text-primary': '255 240 250',
      '--text-secondary': '232 178 200',
      '--text-tertiary': '180 130 150',
    },
  },
} as const;

function SettingsContent() {
  const [tab, setTab] = useState('model');
  return (
    <>
      <PageHeader
        title="Settings"
        description="Configure model, personality, appearance, integrations, and system."
        icon={<SettingsIcon className="h-4 w-4 text-white" />}
        actions={
          <Button variant="primary">
            <Save className="h-3.5 w-3.5" /> Save changes
          </Button>
        }
      />
      <Tabs tabs={tabs} active={tab} onChange={setTab} className="mb-6" />
      {tab === 'model' && <ModelTab />}
      {tab === 'personality' && <PersonalityTab />}
      {tab === 'appearance' && <AppearanceTab />}
      {tab === 'integrations' && <IntegrationsTab />}
      {tab === 'system' && <SystemTab />}
    </>
  );
}

// ─── MODEL TAB ─────────────────────────────────────────────────────
function ModelTab() {
  const [showPrimaryKey, setShowPrimaryKey] = useState(false);
  const [showFallbackKey, setShowFallbackKey] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  // Fallback chain state
  const [fallbacks, setFallbacks] = useState([
    'google/gemini-2.0-flash-exp:free',
    'meta-llama/llama-3.3-70b:free',
    'qwen/qwen-2.5-72b:free',
  ]);

  const moveFallback = (i: number, dir: -1 | 1) => {
    const next = [...fallbacks];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setFallbacks(next);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Left column: primary + fallbacks */}
      <div className="lg:col-span-2 space-y-4">
        <Card innerGlow>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-accent-cyan" />
              <CardTitle>Primary model</CardTitle>
            </div>
            <Badge tone="cyan" dot>active</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field label="Model ID" hint="The default model used for all agent calls.">
              <input
                defaultValue="stepfun/step-3.7-flash:free"
                className="w-full h-9 px-3 rounded-md border border-white/[0.08] bg-white/[0.04] text-sm font-mono text-text-primary focus:border-cyan-400/50 focus:outline-none"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Provider">
                <input
                  defaultValue="OpenRouter"
                  className="w-full h-9 px-3 rounded-md border border-white/[0.08] bg-white/[0.04] text-sm text-text-primary focus:border-cyan-400/50 focus:outline-none"
                />
              </Field>
              <Field label="Base URL">
                <input
                  defaultValue="https://openrouter.ai/api/v1"
                  className="w-full h-9 px-3 rounded-md border border-white/[0.08] bg-white/[0.04] text-sm font-mono text-text-primary focus:border-cyan-400/50 focus:outline-none"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Temperature">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  defaultValue="0.7"
                  className="w-full h-9 px-3 rounded-md border border-white/[0.08] bg-white/[0.04] text-sm font-mono text-text-primary focus:border-cyan-400/50 focus:outline-none"
                />
              </Field>
              <Field label="Max tokens">
                <input
                  type="number"
                  step="256"
                  defaultValue="4096"
                  className="w-full h-9 px-3 rounded-md border border-white/[0.08] bg-white/[0.04] text-sm font-mono text-text-primary focus:border-cyan-400/50 focus:outline-none"
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card innerGlow>
          <CardHeader>
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-accent-violet" />
              <CardTitle>Fallback chain</CardTitle>
            </div>
            <Button size="sm" variant="ghost"><Plus className="h-3 w-3" /> Add fallback</Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {fallbacks.map((m, i) => (
              <div key={m} className="flex items-center gap-2 rounded border border-white/[0.06] bg-white/[0.02] p-2.5">
                <Badge tone={i === 0 ? 'cyan' : 'violet'}>{i + 1}</Badge>
                <span className="font-mono text-xs text-text-primary flex-1 truncate">{m}</span>
                <Button size="sm" variant="ghost" onClick={() => moveFallback(i, -1)} disabled={i === 0}>↑</Button>
                <Button size="sm" variant="ghost" onClick={() => moveFallback(i, 1)} disabled={i === fallbacks.length - 1}>↓</Button>
                <Button size="sm" variant="ghost"><X className="h-3 w-3" /></Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Right column: API keys with eye toggle */}
      <div className="space-y-4">
        <Card innerGlow>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-status-warning" />
              <CardTitle>API keys</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <SecretField
              label="OpenRouter"
              value="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"
              visible={showPrimaryKey}
              onToggle={() => setShowPrimaryKey((v) => !v)}
              onCopy={() => copy('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', 'or')}
              copied={copied === 'or'}
            />
            <SecretField
              label="Fallback provider"
              value="sk-fb-9c1d6e3f7a5b8c2d9e4f1a6b3c8d5e2f9a4b7c1d6e3f8a5b2c9d4e7f1a6b3c8d"
              visible={showFallbackKey}
              onToggle={() => setShowFallbackKey((v) => !v)}
              onCopy={() => copy('sk-fb-9c1d6e3f7a5b8c2d9e4f1a6b3c8d5e2f9a4b7c1d6e3f8a5b2c9d4e7f1a6b3c8d', 'fb')}
              copied={copied === 'fb'}
            />

            <Field label="Retry attempts" hint="Times to retry on transient failures.">
              <input
                type="range"
                min="0"
                max="5"
                defaultValue="2"
                className="w-full accent-cyan-400"
              />
              <div className="text-2xs text-text-tertiary mt-1">2 attempts</div>
            </Field>

            <Field label="Timeout (seconds)">
              <input
                type="number"
                min="5"
                max="120"
                defaultValue="30"
                className="w-full h-9 px-3 rounded-md border border-white/[0.08] bg-white/[0.04] text-sm font-mono text-text-primary focus:border-cyan-400/50 focus:outline-none"
              />
            </Field>
          </CardContent>
        </Card>

        <Card innerGlow>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-status-success" />
              <CardTitle>Usage this month</CardTitle>
            </div>
            <Badge tone="success">healthy</Badge>
          </CardHeader>
          <CardContent className="space-y-3 text-2xs">
            <UsageRow label="OpenRouter" used="$4.27" limit="$100" pct={4} tone="cyan" />
            <UsageRow label="Whisper" used="$0.18" limit="$20" pct={1} tone="violet" />
            <UsageRow label="Vapi voice" used="$1.42" limit="$50" pct={3} tone="magenta" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── PERSONALITY TAB ───────────────────────────────────────────────
function PersonalityTab() {
  const { activePersonality, setPersonality } = useUIStore();
  const { data } = useQuery({ queryKey: ['personalities'], queryFn: api.personalities });
  const [expandedId, setExpandedId] = useState<PersonalityTone | null>(null);

  const list = data ?? [];
  const expanded = list.find((p) => p.id === expandedId);
  const active = list.find((p) => p.id === activePersonality) ?? list[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Left: grid of all personalities */}
      <div className="lg:col-span-2 space-y-4">
        <Card innerGlow>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-accent-violet" />
              <CardTitle>All personalities</CardTitle>
            </div>
            <Badge tone="violet">active: {activePersonality}</Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {list.map((p) => {
                const Icon = (LucideIcons as any)[p.icon] || Sparkles;
                const isActive = activePersonality === p.id;
                const isExpanded = expandedId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setPersonality(p.id as PersonalityTone);
                      setExpandedId(p.id as PersonalityTone);
                    }}
                    className={cn(
                      'rounded-xl border p-3 text-left transition-all duration-200 ease-out-expo cursor-pointer',
                      isExpanded
                        ? 'border-accent-violet/60 bg-accent-violet/10 shadow-glow-violet'
                        : isActive
                        ? 'border-cyan-400 bg-cyan-500/10 shadow-glow-cyan'
                        : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:-translate-y-0.5',
                    )}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Icon className={cn('h-4 w-4', isActive ? 'text-accent-cyan' : 'text-text-secondary')} />
                      {isActive && <Badge tone="cyan">active</Badge>}
                    </div>
                    <div className="text-sm font-medium text-text-primary">{p.name}</div>
                    <p className="text-2xs text-text-tertiary mt-1 line-clamp-2">{p.description}</p>
                    <div className="mt-2 flex items-center gap-1 text-2xs text-accent-violet">
                      <span>Details</span>
                      <ChevronRight className={cn('h-3 w-3 transition-transform', isExpanded && 'rotate-90')} />
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Sample output preview */}
        {active && (
          <Card innerGlow>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent-cyan" />
                <CardTitle>Sample output · {active.name}</CardTitle>
              </div>
              <Badge tone="cyan">live preview</Badge>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-2">In the {active.name} tone</div>
                <p className="text-sm text-text-primary italic leading-relaxed">"{active.preview}"</p>
              </div>
              <p className="text-2xs text-text-tertiary mt-3">All content generated by agents will be styled in this tone.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right: detail panel — click any personality to see details */}
      <div className="space-y-4">
        <Card innerGlow>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-accent-violet" />
              <CardTitle>Personality details</CardTitle>
            </div>
            {expanded && <Badge tone="violet">{expanded.name}</Badge>}
          </CardHeader>
          <CardContent>
            {expanded ? (
              <div className="space-y-4">
                {/* Header with icon and name */}
                <div className="flex items-center gap-3 pb-3 border-b border-white/[0.06]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-violet/15">
                    {(() => {
                      const Icon = (LucideIcons as any)[expanded.icon] || Sparkles;
                      return <Icon className="h-5 w-5 text-accent-violet" />;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-semibold text-text-primary">{expanded.name}</div>
                    <div className="text-2xs text-text-tertiary line-clamp-1">{expanded.description}</div>
                  </div>
                  {activePersonality === expanded.id && <Badge tone="cyan">active</Badge>}
                </div>

                <div>
                  <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-1.5">What it means</div>
                  <p className="text-xs text-text-secondary leading-relaxed">{personalityMeaning(expanded.id)}</p>
                </div>

                <div>
                  <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-1.5">Example output</div>
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                    <p className="text-xs text-text-primary italic leading-relaxed">"{expanded.preview}"</p>
                  </div>
                </div>

                <div>
                  <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-1.5">Try asking it</div>
                  <div className="space-y-1">
                    {personalityExamples(expanded.id).map((ex, i) => (
                      <div key={i} className="rounded border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-2xs text-text-secondary">
                        "{ex}"
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-1.5">Personality traits</div>
                  <div className="grid grid-cols-2 gap-2">
                    <Trait label="Formality" value={personalityTrait(expanded.id, 'formality')} />
                    <Trait label="Energy" value={personalityTrait(expanded.id, 'energy')} />
                    <Trait label="Humor" value={personalityTrait(expanded.id, 'humor')} />
                    <Trait label="Length" value={personalityTrait(expanded.id, 'length')} />
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    className="flex-1"
                    onClick={() => setPersonality(expanded.id as PersonalityTone)}
                    disabled={activePersonality === expanded.id}
                  >
                    {activePersonality === expanded.id ? 'Currently active' : 'Make this the default'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setExpandedId(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-white/[0.08] mx-auto mb-3">
                  <Brain className="h-5 w-5 text-text-tertiary" />
                </div>
                <h3 className="text-sm font-medium text-text-primary mb-1">Pick a personality</h3>
                <p className="text-xs text-text-tertiary max-w-[220px] mx-auto">
                  Click any personality card on the left to see what it means, sample output, and traits.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick stats */}
        <Card innerGlow>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-status-success" />
              <CardTitle>Tone usage · 7d</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-2xs">
            {list.slice(0, 5).map((p) => {
              const pct = Math.floor(Math.random() * 30) + 5;
              return (
                <div key={p.id}>
                  <div className="flex justify-between text-2xs mb-1">
                    <span className="font-mono text-text-secondary">{p.name}</span>
                    <span className="font-mono text-text-primary">{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                    <div className="h-full bg-gradient-accent" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper: long-form meaning for each personality
function personalityMeaning(id: string): string {
  const map: Record<string, string> = {
    kawaii: 'Bright, bubbly, full of heart emojis. Best for social posts aimed at younger or lifestyle audiences. Reads as warm and approachable, never robotic.',
    noir: 'Hard-boiled, terse, dramatic. The agent narrates results like a 1940s detective. Great for incident reports and postmortems.',
    hype: 'All caps energy, exclamation marks, the digital equivalent of a sports commentator. Perfect for milestone announcements and shipping celebrations.',
    surfer: 'Laid-back, chill, uses "dude" and "vibes". Calms the team down when things go wrong. Goes well with monitoring dashboards.',
    pirate: 'Speaks in nautical vernacular. Fun for internal tools and team channels, less so for client-facing comms.',
    shakespeare: 'Iambic pentameter, archaic English. The agent literally writes like it\'s 1600. Entertaining for retro easter eggs.',
    technical: 'No metaphors, no fluff, just specs. Best for log summaries, status updates, and any output an engineer will read.',
    concise: 'Three to seven words per response. Use when the agent\'s output is read at a glance — alerts, kanban updates, status pills.',
    teacher: 'Walks the user through what happened and why. Great for new team members or explaining errors to non-technical stakeholders.',
    uwu: 'Soft, affectionate, internet kitten. Cute but a bit much in serious contexts — best for casual channels and reward messages.',
    philosopher: 'Reflective, asks "why" before "what". The agent narrates results in the context of bigger meaning. Slow but thought-provoking.',
  };
  return map[id] ?? 'No description available.';
}

function personalityTrait(id: string, trait: 'formality' | 'energy' | 'humor' | 'length'): string {
  const map: Record<string, Record<string, string>> = {
    kawaii: { formality: 'casual', energy: 'high', humor: 'medium', length: 'medium' },
    noir: { formality: 'formal', energy: 'low', humor: 'low', length: 'short' },
    hype: { formality: 'casual', energy: 'very high', humor: 'medium', length: 'medium' },
    surfer: { formality: 'casual', energy: 'low', humor: 'high', length: 'medium' },
    pirate: { formality: 'casual', energy: 'medium', humor: 'high', length: 'medium' },
    shakespeare: { formality: 'very formal', energy: 'medium', humor: 'low', length: 'long' },
    technical: { formality: 'formal', energy: 'low', humor: 'low', length: 'short' },
    concise: { formality: 'neutral', energy: 'medium', humor: 'low', length: 'very short' },
    teacher: { formality: 'neutral', energy: 'medium', humor: 'low', length: 'long' },
    uwu: { formality: 'casual', energy: 'medium', humor: 'high', length: 'short' },
    philosopher: { formality: 'formal', energy: 'low', humor: 'low', length: 'long' },
  };
  return map[id]?.[trait] ?? '—';
}

// Sample prompts a user could send to the agent to see this personality in action
function personalityExamples(id: string): string[] {
  const map: Record<string, string[]> = {
    kawaii: [
      'Hey! How did the deploy go today? ✨',
      'Can you check if my cron jobs ran okay? 🌸',
      'Give me a fun update on what the agents did!',
    ],
    noir: [
      'Report. What happened last night.',
      'Did anything fail? Spare me the details.',
      'The credits. How low are we.',
    ],
    hype: [
      'WE JUST HIT 1000 TASKS! TELL ME EVERYTHING!',
      'HOW IS THE GATEWAY HOLDING UP??',
      'YOOO what was the biggest win today??',
    ],
    surfer: [
      'whats the vibe with the system rn',
      'any waves we should know about?',
      'checkt he credits dude',
    ],
    pirate: [
      'Arrr, what be the state of the ship?',
      'How be me credit chest fairing?',
      'Any scallywags failing tasks today?',
    ],
    shakespeare: [
      'Prithee, how fares the gateway this hour?',
      'Speak: what news from the agents?',
      'Hath any task met with calamity?',
    ],
    technical: [
      'Status: gateway.state, agent counts, last error.',
      'List failed tasks in the last hour.',
      'Credit burn rate, grouped by model.',
    ],
    concise: [
      'Status?',
      'Failures today.',
      'Credits remaining.',
    ],
    teacher: [
      'Can you walk me through how the gateway works?',
      'Why did that task fail? I want to understand.',
      'What should I know about this agent?',
    ],
    uwu: [
      'hewwo~ how awe ouw agents doing today?',
      'did anyfing go owie?',
      'teww me about ouw cwedits uwu~',
    ],
    philosopher: [
      'What does it mean that an agent succeeded today?',
      'Why do we measure success in percentages?',
      'If a task fails and no one notices, did it matter?',
    ],
  };
  return map[id] ?? ['Tell me what you can do.'];
}

function Trait({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2">
      <div className="text-2xs uppercase tracking-wider text-text-tertiary">{label}</div>
      <div className="text-xs text-text-primary mt-0.5 capitalize">{value}</div>
    </div>
  );
}

// ─── APPEARANCE TAB ────────────────────────────────────────────────
function AppearanceTab() {
  const {
    theme, setTheme, sidebarCollapsed, toggleSidebar,
    fontScale, setFontScale, density, setDensity, animations, setAnimations,
  } = useUIStore();
  const [previewKey] = useState(0); // re-render preview on theme change

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        {/* Theme picker — actually applies theme now */}
        <Card innerGlow>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-accent-cyan" />
              <CardTitle>Theme</CardTitle>
            </div>
            <Badge tone="cyan" dot>applies to whole app</Badge>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-cyan-400/20 bg-cyan-500/[0.05] p-2.5 mb-3 flex items-start gap-2">
              <Palette className="h-3.5 w-3.5 text-accent-cyan flex-shrink-0 mt-0.5" />
              <p className="text-2xs text-text-secondary leading-relaxed">
                Click any theme to apply it <span className="text-accent-cyan font-medium">instantly across the entire dashboard</span> — sidebar, cards, topbar, every page. Your choice is saved to localStorage and persists across reloads.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['dark', 'midnight', 'cyber'] as const).map((t) => {
                const def = THEMES[t];
                const isActive = theme === t;
                return (
                  <div
                    key={t}
                    className={cn(
                      'group rounded-xl border p-3 text-left transition-all',
                      isActive
                        ? 'border-cyan-400 shadow-glow-cyan'
                        : 'border-white/[0.08] hover:border-white/20',
                    )}
                    style={isActive ? { backgroundColor: `rgb(${def.vars['--bg-elevated']})` } : { backgroundColor: `rgb(${def.vars['--bg-elevated']} / 0.5)` }}
                  >
                    {/* Swatch preview — clicking this applies the theme */}
                    <button
                      type="button"
                      onClick={() => setTheme(t)}
                      className="w-full text-left cursor-pointer"
                    >
                      <div className="flex h-16 rounded-md overflow-hidden mb-3 border border-white/[0.06]">
                        <div className="flex-1" style={{ backgroundColor: def.swatch.bg }} />
                        <div className="flex-1" style={{ backgroundColor: def.swatch.surface }} />
                        <div className="flex-1 relative" style={{ backgroundColor: def.swatch.accent }}>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-white" />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm font-medium text-text-primary capitalize">{def.label}</div>
                        {isActive && <Badge tone="cyan">active</Badge>}
                      </div>
                      <p className="text-2xs text-text-tertiary">{def.description}</p>
                    </button>
                    {/* Apply button */}
                    <button
                      type="button"
                      onClick={() => setTheme(t)}
                      disabled={isActive}
                      className={cn(
                        'mt-3 w-full h-8 rounded-md text-xs font-medium transition-colors cursor-pointer',
                        isActive
                          ? 'bg-cyan-500/15 text-accent-cyan border border-cyan-400/30 cursor-default'
                          : 'bg-white/[0.04] text-text-primary border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/20',
                      )}
                    >
                      {isActive ? '✓ Applied to dashboard' : `Apply ${def.label}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Layout */}
        <Card innerGlow>
          <CardHeader>
            <div className="flex items-center gap-2">
              <LayoutIcon className="h-4 w-4 text-accent-violet" />
              <CardTitle>Layout & density</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-text-primary">Sidebar collapsed</div>
                <div className="text-2xs text-text-tertiary">Show only icons, hide labels.</div>
              </div>
              <Toggle checked={sidebarCollapsed} onChange={toggleSidebar} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-text-primary">Compact density</div>
                <div className="text-2xs text-text-tertiary">Tighter padding across cards and tables.</div>
              </div>
              <Toggle
                checked={density === 'compact'}
                onChange={() => setDensity(density === 'compact' ? 'comfortable' : 'compact')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-text-primary">Animations</div>
                <div className="text-2xs text-text-tertiary">Smooth transitions and pulses.</div>
              </div>
              <Toggle checked={animations} onChange={() => setAnimations(!animations)} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right column: live preview + font scale */}
      <div className="space-y-4">
        <Card innerGlow>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MonitorSmartphone className="h-4 w-4 text-status-info" />
              <CardTitle>Live preview</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div
              key={previewKey}
              className="rounded-lg border border-white/[0.08] p-4 space-y-3"
              style={{ backgroundColor: `rgb(${THEMES[theme].vars['--bg-elevated']})` }}
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg" style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)' }} />
                <div>
                  <div className="text-2xs text-text-tertiary uppercase tracking-wider">Sample</div>
                  <div className="text-sm text-text-primary font-medium">Headline text</div>
                </div>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                This card shows how the current theme renders typography, surfaces, and accent colors.
                Switch themes to see it update in real time.
              </p>
              <div className="flex gap-2">
                <span className="px-2 py-0.5 rounded-full text-2xs bg-accent-cyan/15 text-accent-cyan">tag</span>
                <span className="px-2 py-0.5 rounded-full text-2xs bg-status-success/15 text-status-success">active</span>
                <span className="px-2 py-0.5 rounded-full text-2xs bg-accent-violet/15 text-accent-violet">label</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Font scale — wired to the store */}
        <Card innerGlow>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-accent-cyan">Aa</span>
              <CardTitle>Font scale</CardTitle>
            </div>
            <Badge tone="cyan">{Math.round(fontScale * 100)}%</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <input
              type="range"
              min="80"
              max="120"
              step="5"
              value={Math.round(fontScale * 100)}
              onChange={(e) => setFontScale(Number(e.target.value) / 100)}
              className="w-full accent-cyan-400"
            />
            <div className="flex items-center justify-between text-2xs text-text-tertiary font-mono">
              <span>80%</span>
              <span>100%</span>
              <span>120%</span>
            </div>
            <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-3">
              <p style={{ fontSize: `${fontScale}rem` }} className="text-text-primary leading-relaxed">
                The quick brown fox jumps over the lazy dog. This is a live preview of your current font scale.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(['80', '100', '120'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setFontScale(Number(v) / 100)}
                  className={cn(
                    'rounded-md border px-2 py-1.5 text-2xs font-mono transition-colors cursor-pointer',
                    Math.round(fontScale * 100) === Number(v)
                      ? 'border-cyan-400 bg-cyan-500/10 text-cyan-400'
                      : 'border-white/[0.08] text-text-secondary hover:bg-white/5',
                  )}
                >
                  {v}%
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        'relative h-6 w-11 rounded-full border transition-colors cursor-pointer',
        checked ? 'bg-cyan-500 border-cyan-400' : 'bg-white/[0.06] border-white/[0.08]',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-6' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}

// ─── INTEGRATIONS TAB ──────────────────────────────────────────────
function IntegrationsTab() {
  const integrations = [
    { id: 'discord', name: 'Discord', desc: 'Bot for community + agent chat.', enabled: true, key: 'Bot token • ••••8a2f', tone: 'violet' as const, icon: Globe },
    { id: 'telegram', name: 'Telegram', desc: 'Bot for direct agent commands.', enabled: true, key: 'Bot token • ••••3c91', tone: 'cyan' as const, icon: Globe },
    { id: 'slack', name: 'Slack', desc: 'Webhook for team notifications.', enabled: false, key: 'Webhook URL', tone: 'magenta' as const, icon: Globe },
    { id: 'whatsapp', name: 'WhatsApp', desc: 'Business API for outreach.', enabled: false, key: 'Business API key', tone: 'success' as const, icon: Globe },
    { id: 'vapi', name: 'Vapi (Voice)', desc: 'Outbound voice calls via AI.', enabled: true, key: 'API key • ••••f72a', tone: 'warning' as const, icon: Volume2 },
    { id: 'openai', name: 'OpenAI', desc: 'Whisper for transcription.', enabled: true, key: 'API key • ••••a91b', tone: 'info' as const, icon: Cpu },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-3">
        {integrations.map((i) => (
          <IntegrationRow key={i.id} id={i.id} name={i.name} desc={i.desc} enabled={i.enabled} apiKey={i.key} tone={i.tone} icon={i.icon} />
        ))}
      </div>

      {/* Right column: integration health */}
      <div className="space-y-4">
        <Card innerGlow>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-status-success" />
              <CardTitle>Integration health</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5 text-2xs">
            {integrations.filter((i) => i.enabled).map((i) => (
              <div key={i.id} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-status-success shadow-glow-success" />
                <span className="text-text-primary flex-1">{i.name}</span>
                <span className="font-mono text-text-tertiary">{fmtRelative('2026-06-05T15:50:00Z')}</span>
              </div>
            ))}
            {integrations.filter((i) => !i.enabled).map((i) => (
              <div key={i.id} className="flex items-center gap-2 opacity-60">
                <div className="h-2 w-2 rounded-full bg-text-tertiary" />
                <span className="text-text-secondary flex-1">{i.name}</span>
                <span className="font-mono text-text-tertiary">disabled</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card innerGlow>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-accent-cyan" />
              <CardTitle>Webhooks</CardTitle>
            </div>
            <Button size="sm" variant="ghost"><Plus className="h-3 w-3" /> Add</Button>
          </CardHeader>
          <CardContent className="space-y-2 text-2xs">
            <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-text-primary">events/task.completed</span>
                <Badge tone="success">200</Badge>
              </div>
              <div className="font-mono text-text-tertiary truncate">https://hooks.slack.com/...</div>
            </div>
            <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-text-primary">events/agent.failed</span>
                <Badge tone="success">200</Badge>
              </div>
              <div className="font-mono text-text-tertiary truncate">https://discord.com/api/...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function IntegrationRow({ name, desc, enabled, apiKey, tone, icon: Icon }: { id: string; name: string; desc: string; enabled: boolean; apiKey: string; tone: 'cyan' | 'violet' | 'magenta' | 'success' | 'warning' | 'info'; icon: any }) {
  return (
    <Card innerGlow>
      <div className="p-4 flex items-center gap-4">
        <div className={cn(
          'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg',
          tone === 'cyan' ? 'bg-accent-cyan/15 text-accent-cyan'
          : tone === 'violet' ? 'bg-accent-violet/15 text-accent-violet'
          : tone === 'magenta' ? 'bg-accent-magenta/15 text-accent-magenta'
          : tone === 'success' ? 'bg-status-success/15 text-status-success'
          : tone === 'warning' ? 'bg-status-warning/15 text-status-warning'
          : 'bg-status-info/15 text-status-info',
        )}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-text-primary">{name}</div>
            {enabled ? <Badge tone="success" dot>connected</Badge> : <Badge tone="default">disconnected</Badge>}
          </div>
          <div className="text-2xs text-text-tertiary">{desc}</div>
          <div className="text-2xs text-text-tertiary font-mono mt-1">{apiKey}</div>
        </div>
        <Toggle checked={enabled} onChange={() => {}} />
      </div>
    </Card>
  );
}

// ─── SYSTEM TAB ────────────────────────────────────────────────────
function SystemTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <Card innerGlow>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-accent-cyan" />
              <CardTitle>ArkiloStudios CLI</CardTitle>
            </div>
            <Badge tone="cyan" dot>v0.42.1</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field label="Executable path">
              <div className="font-mono text-xs text-text-primary bg-white/[0.02] border border-white/[0.06] rounded-md p-2 select-all break-all">
                /usr/local/lib/hermes-agent/venv/bin/hermes
              </div>
            </Field>
            <Field label="Working directory">
              <div className="font-mono text-xs text-text-primary bg-white/[0.02] border border-white/[0.06] rounded-md p-2 select-all">
                /opt/hermes
              </div>
            </Field>
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="secondary"><RefreshCw className="h-3 w-3" /> Check for updates</Button>
              <Button size="sm" variant="secondary"><ExternalLink className="h-3 w-3" /> View changelog</Button>
            </div>
          </CardContent>
        </Card>

        <Card innerGlow>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-accent-violet" />
              <CardTitle>Config</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="secondary" className="w-full justify-between">
              <span className="flex items-center gap-2"><Save className="h-3.5 w-3.5" /> Export config</span>
              <span className="text-2xs text-text-tertiary font-mono">hermes.yaml</span>
            </Button>
            <Button variant="secondary" className="w-full justify-between">
              <span className="flex items-center gap-2"><RefreshCw className="h-3.5 w-3.5" /> Import config</span>
              <span className="text-2xs text-text-tertiary font-mono">.yaml / .json</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card innerGlow>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-accent-magenta" />
              <CardTitle>Update channel</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <ChannelOption label="Stable" desc="Tested, recommended." active tone="cyan" />
            <ChannelOption label="Beta" desc="New features, occasional bugs." tone="magenta" />
            <ChannelOption label="Nightly" desc="Cutting edge, may break." tone="warning" />
          </CardContent>
        </Card>

        <Card innerGlow>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-status-danger" />
              <CardTitle>Danger zone</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="rounded-md border border-status-danger/30 bg-status-danger/5 p-3 text-2xs text-text-secondary">
              <strong className="text-status-danger">Reset to defaults</strong> will clear all local preferences and revert to factory settings.
            </div>
            <Button variant="danger" size="sm" className="w-full">Reset everything</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ChannelOption({ label, desc, active = false, tone }: { label: string; desc: string; active?: boolean; tone: 'cyan' | 'magenta' | 'warning' }) {
  return (
    <button
      className={cn(
        'w-full flex items-center justify-between rounded-md border p-2.5 text-left transition-colors cursor-pointer',
        active
          ? tone === 'cyan' ? 'border-cyan-400 bg-cyan-500/10'
          : tone === 'magenta' ? 'border-accent-magenta bg-accent-magenta/10'
          : 'border-status-warning bg-status-warning/10'
          : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/5',
      )}
    >
      <div>
        <div className="text-xs font-medium text-text-primary">{label}</div>
        <div className="text-2xs text-text-tertiary">{desc}</div>
      </div>
      {active && <Badge tone={tone}>active</Badge>}
    </button>
  );
}

// ─── SHARED COMPONENTS ─────────────────────────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-2xs uppercase tracking-wider text-text-tertiary flex items-center justify-between">
        <span>{label}</span>
        {hint && <span className="text-text-tertiary normal-case tracking-normal">{hint}</span>}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function SecretField({
  label, value, visible, onToggle, onCopy, copied,
}: { label: string; value: string; visible: boolean; onToggle: () => void; onCopy: () => void; copied: boolean }) {
  return (
    <div>
      <label className="text-2xs uppercase tracking-wider text-text-tertiary">{label}</label>
      <div className="mt-1.5 flex gap-2">
        <div className="flex-1 relative">
          <input
            type={visible ? 'text' : 'password'}
            value={value}
            readOnly
            className="w-full h-9 pl-3 pr-10 rounded-md border border-white/[0.08] bg-white/[0.04] text-sm font-mono text-text-primary focus:outline-none"
          />
          <button
            onClick={onToggle}
            className="absolute right-1 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded text-text-tertiary hover:bg-white/5 hover:text-text-primary transition-colors cursor-pointer"
            aria-label={visible ? 'Hide key' : 'Show key'}
            title={visible ? 'Hide key' : 'Show key'}
          >
            {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
        <Button size="sm" variant="secondary" onClick={onCopy} aria-label="Copy key">
          {copied ? <Check className="h-3.5 w-3.5 text-status-success" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </div>
  );
}

function UsageRow({ label, used, limit, pct, tone }: { label: string; used: string; limit: string; pct: number; tone: 'cyan' | 'violet' | 'magenta' }) {
  return (
    <div>
      <div className="flex justify-between text-2xs mb-1">
        <span className="text-text-secondary">{label}</span>
        <span className="font-mono text-text-primary">{used} <span className="text-text-tertiary">/ {limit}</span></span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
        <div
          className={cn('h-full', tone === 'cyan' ? 'bg-accent-cyan' : tone === 'violet' ? 'bg-accent-violet' : 'bg-accent-magenta')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return <ClientShell><SettingsContent /></ClientShell>;
}
