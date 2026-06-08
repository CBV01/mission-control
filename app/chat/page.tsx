'use client';

import * as React from 'react';
import {
  Send, Bot, User, Terminal, Loader2,
  CheckCircle2, XCircle, AlertCircle, Info, Cpu, MessageCircle,
} from 'lucide-react';
import { ClientShell } from '@/components/shell/client-shell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusDot } from '@/components/ui/status-dot';
import { PageHeader } from '@/components/ui/page-header';
import { cn, fmtTime } from '@/lib/utils';
import type { ChatMessage, ChatTarget, TerminalLine } from '@/lib/types';

// ─── TARGETS ────────────────────────────────────────────────────────
// Each "target" is a logical destination for the user's message.
// The orchestrator (default) routes to the best specialist agent.
const TARGETS: { id: ChatTarget; label: string; tone: 'cyan' | 'violet' | 'magenta' | 'default' }[] = [
  { id: 'orchestrator', label: 'Orchestrator', tone: 'cyan' },
  { id: 'outreach', label: 'Outreach', tone: 'violet' },
  { id: 'marketing', label: 'Marketing', tone: 'magenta' },
  { id: 'content', label: 'Content', tone: 'cyan' },
  { id: 'analytics', label: 'Analytics', tone: 'default' },
  { id: 'support', label: 'Support', tone: 'violet' },
  { id: 'memory', label: 'Memory', tone: 'default' },
];

// ─── MOCK ROUTER ────────────────────────────────────────────────────
// A very lightweight keyword-based router that decides which agent
// would handle the message and what tool calls the terminal should
// stream. In production this becomes a backend orchestration API.
function planForMessage(text: string, target: ChatTarget): {
  routedTo: ChatTarget;
  reasoning: string;
  tools: { name: string; args: string }[];
  reply: string;
} {
  const t = text.toLowerCase();

  // Explicit overrides
  if (t.startsWith('/agent ')) {
    const name = t.replace('/agent ', '').trim();
    return {
      routedTo: (TARGETS.find((tg) => tg.id === name)?.id ?? 'orchestrator') as ChatTarget,
      reasoning: `Explicit delegation to ${name}.`,
      tools: [],
      reply: `Switched target to ${name}. What do you want me to do?`,
    };
  }

  // Keyword routing
  if (/(email|outreach|lead|cold|drip)/.test(t)) {
    return {
      routedTo: 'outreach',
      reasoning: 'Detected outreach keywords (email/lead/cold).',
      tools: [
        { name: 'outreach.findLeads', args: '{ query: "EU SaaS founders", limit: 25 }' },
        { name: 'outreach.scoreLeads', args: '{ strategy: "lookalike-v3" }' },
        { name: 'outreach.composeEmail', args: '{ tone: "concise", steps: 3 }' },
        { name: 'outreach.schedule', args: '{ window: "Mon 09:00-11:00" }' },
      ],
      reply: 'I\'ll spin up the outreach pipeline: find leads, score them, draft a 3-step email, and schedule for Monday morning. Standing by in the terminal →',
    };
  }
  if (/(post|carousel|tweet|caption|content|blog)/.test(t)) {
    return {
      routedTo: 'content',
      reasoning: 'Detected content keywords (post/carousel/caption).',
      tools: [
        { name: 'content.brainstorm', args: '{ sources: ["trending","keywords"] }' },
        { name: 'content.draft', args: '{ platform: "linkedin", tone: "concise" }' },
        { name: 'media.generate', args: '{ type: "carousel", slides: 5 }' },
        { name: 'studio.queue', args: '{ schedule: "tomorrow 10:00" }' },
      ],
      reply: 'Drafting a 5-slide LinkedIn carousel for tomorrow. Terminal will show each step →',
    };
  }
  if (/(spend|credit|cost|report|analytics|dashboard)/.test(t)) {
    return {
      routedTo: 'analytics',
      reasoning: 'Detected analytics keywords (spend/credit/cost).',
      tools: [
        { name: 'analytics.summarize', args: '{ window: "7d" }' },
        { name: 'analytics.breakdown', args: '{ groupBy: "model" }' },
        { name: 'analytics.alerts', args: '{ threshold: 0.8 }' },
      ],
      reply: 'Pulling 7-day spend, breaking it down by model, and checking the 80% alert threshold →',
    };
  }
  if (/(cron|schedule|job)/.test(t)) {
    return {
      routedTo: 'orchestrator',
      reasoning: 'Cron-related query — routing via orchestrator.',
      tools: [
        { name: 'cron.list', args: '{}' },
        { name: 'cron.health', args: '{}' },
      ],
      reply: 'Listing cron jobs and checking their health →',
    };
  }
  if (/(remember|note|memory|save|recall)/.test(t)) {
    return {
      routedTo: 'memory',
      reasoning: 'Memory operation detected.',
      tools: [
        { name: 'memory.search', args: '{ query: "..." }' },
        { name: 'memory.write', args: '{ folder: "Daily Notes" }' },
      ],
      reply: 'Searching the vault and writing the note →',
    };
  }

  // Default: orchestrator meta-routing
  return {
    routedTo: target === 'orchestrator' ? 'orchestrator' : target,
    reasoning: target === 'orchestrator'
      ? 'No specific domain detected. Orchestrator will triage.'
      : `Routed directly to ${target}.`,
    tools: [
      { name: 'orchestrator.classify', args: '{ text: "..." }' },
      { name: 'orchestrator.plan', args: '{ maxSteps: 3 }' },
    ],
    reply: 'Got it. I\'ll classify the request, build a plan, and stream the tool calls to the terminal →',
  };
}

// ─── STREAMING HELPERS ──────────────────────────────────────────────
// A tiny scheduler that emits events at human-readable intervals
// so the terminal feels "alive" instead of all-at-once.
function streamSequence(
  events: { delay: number; emit: () => void }[],
  onDone: () => void,
  signal: { aborted: boolean },
) {
  let i = 0;
  const tick = () => {
    if (signal.aborted) return;
    if (i >= events.length) { onDone(); return; }
    const e = events[i++];
    e.emit();
    setTimeout(tick, e.delay);
  };
  tick();
}

// ─── PAGE ───────────────────────────────────────────────────────────
export default function ChatPage() {
  return <ClientShell><ChatContent /></ClientShell>;
}

function ChatContent() {
  // Chat state
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [target, setTarget] = React.useState<ChatTarget>('orchestrator');
  const [isStreaming, setIsStreaming] = React.useState(false);

  // Terminal state
  const [terminalLines, setTerminalLines] = React.useState<TerminalLine[]>([]);
  const [autoScroll, setAutoScroll] = React.useState(true);

  // Seed a friendly opening message on first mount
  React.useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'sys-1',
          role: 'system',
          target: 'orchestrator',
          content: 'ArkiloStudios online. Talk to the Orchestrator to delegate, or pick a specialist from the target selector. I\'ll stream every tool call into the terminal on the right.',
          timestamp: new Date().toISOString(),
          status: 'done',
        },
      ]);
      // Seed terminal with a "ready" line
      setTerminalLines([
        {
          id: 't-init',
          timestamp: new Date().toISOString(),
          level: 'info',
          source: 'gateway',
          message: 'ArkiloStudios gateway ready · awaiting input',
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const abortRef = React.useRef({ aborted: false });
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const termRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  React.useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  // Auto-scroll terminal
  React.useEffect(() => {
    if (autoScroll && termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight;
    }
  }, [terminalLines, autoScroll]);

  const send = () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput('');
    setIsStreaming(true);
    abortRef.current = { aborted: false };

    const now = new Date().toISOString();
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      target,
      content: text,
      timestamp: now,
      status: 'done',
    };
    setMessages((m) => [...m, userMsg]);

    // Plan the response
    const plan = planForMessage(text, target);

    // Assistant message placeholder (will be filled when tools complete)
    const aId = `a-${Date.now()}`;
    setMessages((m) => [
      ...m,
      {
        id: aId,
        role: 'assistant',
        target: plan.routedTo,
        content: '',
        timestamp: new Date().toISOString(),
        status: 'streaming',
        toolCalls: plan.tools.map((t) => ({ name: t.name, args: t.args, status: 'pending' })),
      },
    ]);

    // Build a stream of events: route → tools (each tool: start + finish) → reply
    type Ev = { delay: number; emit: () => void };
    const events: Ev[] = [];

    // Initial routing line
    events.push({
      delay: 350,
      emit: () => {
        pushTerminal(plan.routedTo, 'info', `→ routed to ${plan.routedTo}: ${plan.reasoning}`);
        setMessages((m) =>
          m.map((msg) => (msg.id === aId ? { ...msg, target: plan.routedTo, content: '_thinking…_' } : msg)),
        );
      },
    });

    // Tool calls
    plan.tools.forEach((tool, idx) => {
      events.push({
        delay: 500,
        emit: () => {
          pushTerminal(plan.routedTo, 'info', `▸ ${tool.name} ${tool.args}`);
          setMessages((m) =>
            m.map((msg) =>
              msg.id === aId
                ? {
                    ...msg,
                    toolCalls: msg.toolCalls?.map((tc, i) =>
                      i === idx ? { ...tc, status: 'running' } : tc,
                    ),
                  }
                : msg,
            ),
          );
        },
      });
      events.push({
        delay: 700,
        emit: () => {
          const ok = Math.random() > 0.08; // simulate occasional non-fatal warning
          pushTerminal(plan.routedTo, ok ? 'success' : 'warn', `✓ ${tool.name} done`);
          setMessages((m) =>
            m.map((msg) =>
              msg.id === aId
                ? {
                    ...msg,
                    toolCalls: msg.toolCalls?.map((tc, i) =>
                      i === idx ? { ...tc, status: 'done' } : tc,
                    ),
                  }
                : msg,
            ),
          );
        },
      });
    });

    // Final reply
    events.push({
      delay: 400,
      emit: () => {
        setMessages((m) =>
          m.map((msg) =>
            msg.id === aId ? { ...msg, content: plan.reply, status: 'done' } : msg,
          ),
        );
        pushTerminal(plan.routedTo, 'success', '✓ response ready');
      },
    });

    streamSequence(
      events,
      () => setIsStreaming(false),
      abortRef.current,
    );
  };

  const pushTerminal = (source: string, level: TerminalLine['level'], message: string) => {
    setTerminalLines((t) => [
      ...t,
      {
        id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        level,
        source,
        message,
      },
    ]);
  };

  const clearTerminal = () => setTerminalLines([]);
  const clearChat = () => {
    if (isStreaming) abortRef.current.aborted = true;
    setMessages([
      {
        id: 'sys-2',
        role: 'system',
        target: 'orchestrator',
        content: 'Conversation cleared.',
        timestamp: new Date().toISOString(),
        status: 'done',
      },
    ]);
    setIsStreaming(false);
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 7rem)' }}>
      <div className="flex-shrink-0 pb-4">
        <PageHeader
          title="Chat & Terminal"
          description="Talk to the orchestrator or a specialist agent. Watch every tool call stream in real time."
          icon={<MessageCircle className="h-4 w-4 text-white" />}
          actions={
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={clearChat} disabled={isStreaming}>
                <Trash2 className="h-3.5 w-3.5" /> Clear chat
              </Button>
              <Button size="sm" variant="ghost" onClick={clearTerminal}>
                <Trash2 className="h-3.5 w-3.5" /> Clear terminal
              </Button>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 flex-1 min-h-0">
        {/* ── Chat pane ── */}
        <Card innerGlow className="lg:col-span-3 flex flex-col overflow-hidden min-h-0">
          <CardHeader className="flex-shrink-0">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-accent-cyan" />
              <CardTitle>Conversation</CardTitle>
            </div>
            <Badge tone="cyan" dot>
              {isStreaming ? 'streaming' : 'idle'}
            </Badge>
          </CardHeader>

          {/* Target selector */}
          <div className="px-4 py-2 border-b border-white/[0.06] flex-shrink-0">
            <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-1.5">Target</div>
            <div className="flex flex-wrap gap-1.5">
              {TARGETS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTarget(t.id)}
                  className={cn(
                    'rounded-full border px-2.5 py-0.5 text-2xs font-medium transition-colors cursor-pointer',
                    target === t.id
                      ? 'bg-gradient-accent text-white border-transparent shadow-glow-cyan'
                      : 'border-white/[0.08] text-text-secondary hover:bg-white/5',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide"
          >
            {messages.map((m) => (
              <MessageBubble key={m.id} m={m} />
            ))}
            {isStreaming && (
              <div className="flex items-center gap-2 text-2xs text-text-tertiary pl-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                working…
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="border-t border-white/[0.06] p-3 flex-shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={
                  target === 'orchestrator'
                    ? 'Tell ArkiloStudios what to do… e.g. "draft a cold email for SaaS founders in the EU"'
                    : `Message ${TARGETS.find((t) => t.id === target)?.label}…`
                }
                rows={2}
                className="flex-1 resize-none rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-cyan-400/50 focus:outline-none"
              />
              <Button onClick={send} disabled={!input.trim() || isStreaming} variant="primary">
                {isStreaming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                Send
              </Button>
            </div>
            <div className="mt-1.5 text-[10px] text-text-tertiary font-mono">
              Enter to send · Shift+Enter for newline · try <span className="text-accent-cyan">/agent outreach</span>
            </div>
          </div>
        </Card>

        {/* ── Terminal pane ── */}
        <Card innerGlow className="lg:col-span-2 flex flex-col overflow-hidden min-h-0">
          <CardHeader className="flex-shrink-0">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-accent-violet" />
              <CardTitle>Live Terminal</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <StatusDot status={isStreaming ? 'live' : 'idle'} label />
              <Badge tone="violet">{terminalLines.length} events</Badge>
            </div>
          </CardHeader>
          <div
            ref={termRef}
            onScroll={(e) => {
              const el = e.currentTarget;
              const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
              setAutoScroll(atBottom);
            }}
            className="flex-1 overflow-y-auto bg-[#0a0a0a] border-t border-white/[0.06] p-3 font-mono text-[11px] leading-5 scrollbar-hide"
          >
            {terminalLines.length === 0 ? (
              <div className="text-text-tertiary italic">No events yet — send a message to see tool calls stream in.</div>
            ) : (
              terminalLines.map((l) => <TerminalRow key={l.id} line={l} />            )
            )}
            {!autoScroll && terminalLines.length > 5 && (
              <div className="sticky bottom-0 left-0 right-0 mt-1 text-center">
                <button
                  onClick={() => setAutoScroll(true)}
                  className="rounded-full border border-white/[0.08] bg-bg-elevated px-2 py-0.5 text-2xs text-text-secondary hover:bg-white/5 cursor-pointer"
                >
                  ↓ resume
                </button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── MESSAGE BUBBLE ────────────────────────────────────────────────
function MessageBubble({ m }: { m: ChatMessage }) {
  const isUser = m.role === 'user';
  const isSystem = m.role === 'system';

  if (isSystem) {
    return (
      <div className="flex items-center justify-center gap-2 text-2xs text-text-tertiary py-1">
        <Info className="h-3 w-3" />
        <span>{m.content}</span>
      </div>
    );
  }

  const targetLabel = TARGETS.find((t) => t.id === m.target)?.label ?? m.target;

  return (
    <div className={cn('flex gap-2.5', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div
        className={cn(
          'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-accent-cyan/20 text-accent-cyan' : 'bg-accent-violet/20 text-accent-violet',
        )}
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
      </div>
      <div className={cn('flex flex-col min-w-0 max-w-[80%]', isUser && 'items-end')}>
        <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase tracking-wider text-text-tertiary">
          <span className="text-text-secondary font-medium">{isUser ? 'You' : targetLabel}</span>
          <span>·</span>
          <span className="font-mono">{fmtTime(m.timestamp)}</span>
        </div>
        <div
          className={cn(
            'rounded-xl px-3 py-2 text-sm',
            isUser
              ? 'bg-accent-cyan/15 border border-accent-cyan/20 text-text-primary'
              : 'bg-white/[0.04] border border-white/[0.08] text-text-primary',
          )}
        >
          {m.status === 'streaming' && !m.content ? (
            <span className="inline-flex items-center gap-1.5 text-text-tertiary">
              <Loader2 className="h-3 w-3 animate-spin" />
              {m.target ? `${targetLabel} is thinking` : 'thinking…'}
            </span>
          ) : (
            <span className="whitespace-pre-wrap">{m.content || <span className="text-text-tertiary italic">…</span>}</span>
          )}

          {/* Tool calls */}
          {m.toolCalls && m.toolCalls.length > 0 && (
            <div className="mt-2 space-y-1 border-t border-white/[0.06] pt-2">
              {m.toolCalls.map((tc, i) => (
                <div key={i} className="flex items-center gap-1.5 text-2xs font-mono">
                  {tc.status === 'done' ? (
                    <CheckCircle2 className="h-3 w-3 text-status-success flex-shrink-0" />
                  ) : tc.status === 'running' ? (
                    <Loader2 className="h-3 w-3 text-accent-cyan animate-spin flex-shrink-0" />
                  ) : (
                    <span className="h-3 w-3 rounded-full border border-text-tertiary flex-shrink-0" />
                  )}
                  <span className="text-text-secondary">{tc.name}</span>
                  <span className="text-text-tertiary truncate">{tc.args}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── TERMINAL ROW ──────────────────────────────────────────────────
function TerminalRow({ line }: { line: TerminalLine }) {
  const levelStyle = {
    info: { color: 'text-text-secondary', icon: Info, iconColor: 'text-status-info' },
    success: { color: 'text-status-success', icon: CheckCircle2, iconColor: 'text-status-success' },
    warn: { color: 'text-status-warning', icon: AlertCircle, iconColor: 'text-status-warning' },
    error: { color: 'text-status-danger', icon: XCircle, iconColor: 'text-status-danger' },
    debug: { color: 'text-text-tertiary', icon: Cpu, iconColor: 'text-text-tertiary' },
  }[line.level];

  const Icon = levelStyle.icon;

  return (
    <div className="flex items-start gap-2 hover:bg-white/[0.02] -mx-1 px-1 rounded">
      <span className="text-text-tertiary flex-shrink-0">{fmtTime(line.timestamp)}</span>
      <Icon className={cn('h-3 w-3 mt-[3px] flex-shrink-0', levelStyle.iconColor)} />
      <span className="text-accent-violet flex-shrink-0">[{line.source}]</span>
      <span className={cn('flex-1 min-w-0 break-words', levelStyle.color)}>{line.message}</span>
    </div>
  );
}
