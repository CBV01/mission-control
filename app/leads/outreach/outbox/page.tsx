'use client';

import * as React from 'react';
import {
  Send, Search, RefreshCw, CheckCircle2, Clock, AlertCircle,
  Mail, Inbox, Reply, MoreVertical, Star, Archive,
  ExternalLink, Paperclip, ArrowUpRight, Zap,
  Trash2, Copy, Flag, MailOpen, Check, X,
  Image, Video, FileText, File
} from 'lucide-react';
import { ClientShell } from '@/components/shell/client-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type MsgStatus = 'sent' | 'scheduled' | 'failed' | 'opened' | 'replied';

interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document' | 'other';
  url: string;
  size: string;
}

interface Message {
  id: string;
  direction: 'outbound' | 'reply';
  body: string;
  timestamp: string;
  attachments?: Attachment[];
}

interface Conversation {
  id: string;
  leadName: string;
  leadEmail: string;
  leadCompany: string;
  leadRole: string;
  status: MsgStatus;
  subject: string;
  lastSnippet: string;
  lastTime: string;
  unread: boolean;
  starred: boolean;
  archived: boolean;
  campaign: string;
  step: number;
  messages: Message[];
}

const INITIAL_CONVS: Conversation[] = [
  {
    id: '1', leadName: 'Alexander Wright', leadEmail: 'alex@saasify.io',
    leadCompany: 'SaaSify Global', leadRole: 'CTO and Co-founder',
    status: 'replied', subject: 'Scale Next.js dev loops by 40%?',
    lastSnippet: 'Hey, this sounds interesting. Can we jump on a call?',
    lastTime: '2m ago', unread: true, starred: true, archived: false,
    campaign: 'SaaS Founder Scale Sequence', step: 1,
    messages: [
      {
        id: 'm1', direction: 'outbound', timestamp: 'Jun 30, 2026 at 15:45',
        body: 'Hi Alexander,\n\nI saw SaaSify Global is building awesome developer tools. Our Next.js visual mission control helps developers streamline monitoring and reduce context switching by up to 40%.\n\nWould you be open to a quick 5 min walk-through next Tuesday?\n\nBest,\nArkilo Agent',
        attachments: [
          { id: 'att-mock-1', name: 'Product_Overview.pdf', type: 'document', url: '#', size: '2.4 MB' }
        ]
      },
      { id: 'm2', direction: 'reply', timestamp: 'Jul 1, 2026 at 14:22', body: 'Hey,\n\nThis sounds interesting. We have been struggling with visibility across our deployment pipeline. Can we jump on a call this week?\n\nAlex' },
    ],
  },
  {
    id: '2', leadName: 'Sarah Jenkins', leadEmail: 'sarah.jenkins@omniflow.co',
    leadCompany: 'OmniFlow Solutions', leadRole: 'Chief Executive Officer',
    status: 'opened', subject: 'Case study: How Acme Corp saved $15k',
    lastSnippet: 'Case study: How Acme Corp saved $15k in infra costs',
    lastTime: '1h ago', unread: true, starred: false, archived: false,
    campaign: 'SaaS Founder Scale Sequence', step: 2,
    messages: [
      { id: 'm3', direction: 'outbound', timestamp: 'Jun 29, 2026 at 09:00', body: 'Hi Sarah,\n\nFollowing up on my last note. We worked with Acme Corp to reduce their Next.js infrastructure footprint by 30%, saving them $15k per quarter.\n\nHere is the full case study: https://case-study.arkilostudios.com\n\nLet me know if this aligns with OmniFlow goals.\n\nBest,\nArkilo Agent' },
    ],
  },
  {
    id: '3', leadName: 'Marcus Chen', leadEmail: 'm.chen@cloudscale.com',
    leadCompany: 'CloudScale Inc', leadRole: 'VP of Engineering',
    status: 'sent', subject: 'Scale Next.js dev loops by 40%?',
    lastSnippet: 'Scale Next.js dev loops by 40% - Sent Jun 30',
    lastTime: 'Jun 30', unread: false, starred: false, archived: false,
    campaign: 'SaaS Founder Scale Sequence', step: 1,
    messages: [
      { id: 'm5', direction: 'outbound', timestamp: 'Jun 30, 2026 at 12:15', body: 'Hi Marcus,\n\nI noticed CloudScale has been expanding its engineering team rapidly. Our platform helps VP-level engineers get real-time visibility into distributed Next.js pipelines without the noise.\n\nWould you be open to a quick 5-minute overview?\n\nBest,\nArkilo Agent' },
    ],
  },
  {
    id: '4', leadName: 'Elena Rostova', leadEmail: 'elena.r@datapulse.tech',
    leadCompany: 'DataPulse', leadRole: 'Head of Growth',
    status: 'scheduled', subject: 'Scale Next.js dev loops by 40%?',
    lastSnippet: 'Scheduled for Jul 1 at 09:00',
    lastTime: 'In 2h', unread: false, starred: false, archived: false,
    campaign: 'Next.js Dev Loop Follow-up', step: 1,
    messages: [
      { id: 'm6', direction: 'outbound', timestamp: 'Jul 1, 2026 at 09:00 (Scheduled)', body: 'Hi Elena,\n\nI came across DataPulse while researching growth-focused SaaS teams. Our agentic monitoring suite can give your growth team a real-time view into activation funnels.\n\nWould you be open to a quick chat?\n\nBest,\nArkilo Agent' },
    ],
  },
  {
    id: '5', leadName: 'Laura Martinez', leadEmail: 'l.martinez@logilink.net',
    leadCompany: 'LogiLink', leadRole: 'Director of Product',
    status: 'replied', subject: 'Automate SaaS developer dashboards',
    lastSnippet: 'Thanks for reaching out! I would love to see a demo.',
    lastTime: 'Yesterday', unread: false, starred: false, archived: false,
    campaign: 'Outbound Marketing Drip v2', step: 1,
    messages: [
      { id: 'm7', direction: 'outbound', timestamp: 'Jun 28, 2026 at 10:00', body: 'Hi Laura,\n\nQuick question: how does LogiLink currently handle monitoring for your SaaS product dashboards?\n\nOur tool helps Product Directors like yourself get a unified view of pipeline health, user journeys, and agent task flows.\n\nOpen to a quick walkthrough?\n\nCheers,\nArkilo Agent' },
      { id: 'm8', direction: 'reply', timestamp: 'Jun 29, 2026 at 16:45', body: 'Thanks for reaching out! We have actually been evaluating a few tools in this space. I would love to see a demo. Can you send me a calendar link?\n\nLaura' },
    ],
  },
  {
    id: '6', leadName: 'Takashi Sato', leadEmail: 'sato@nippon.ai',
    leadCompany: 'Nippon AI', leadRole: 'Founder and MD',
    status: 'failed', subject: 'Scale Next.js dev loops by 40%?',
    lastSnippet: 'Delivery failed. Reauth required',
    lastTime: 'Jun 29', unread: false, starred: false, archived: false,
    campaign: 'SaaS Founder Scale Sequence', step: 1,
    messages: [
      { id: 'm9', direction: 'outbound', timestamp: 'Jun 29, 2026 at 11:30', body: 'Hi Takashi,\n\nI came across Nippon AI and was impressed by your work in agentic systems. Our mission control platform could complement your existing workflow nicely.\n\nWould you be open to a quick demo?\n\nBest,\nArkilo Agent' },
    ],
  },
];

const STATUS: Record<MsgStatus, { tone: 'success' | 'cyan' | 'warning' | 'danger' | 'violet' | 'default'; label: string; dot: string }> = {
  replied:   { tone: 'violet',  label: 'Replied',   dot: 'bg-accent-violet' },
  opened:    { tone: 'cyan',    label: 'Opened',    dot: 'bg-accent-cyan' },
  sent:      { tone: 'success', label: 'Sent',      dot: 'bg-status-success' },
  scheduled: { tone: 'warning', label: 'Scheduled', dot: 'bg-status-warning' },
  failed:    { tone: 'danger',  label: 'Failed',    dot: 'bg-status-danger' },
};

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  const palette = ['from-cyan-500 to-violet-600', 'from-violet-500 to-fuchsia-600', 'from-emerald-500 to-cyan-600', 'from-amber-500 to-orange-600', 'from-pink-500 to-rose-600', 'from-indigo-500 to-blue-600'];
  const col = palette[name.charCodeAt(0) % palette.length];
  const sz = size === 'sm' ? 'h-8 w-8 text-[10px]' : size === 'lg' ? 'h-10 w-10 text-sm' : 'h-9 w-9 text-xs';
  return <div className={cn('rounded-full bg-gradient-to-br flex items-center justify-center font-bold text-white shrink-0', col, sz)}>{initials}</div>;
}

function Toast({ msg, onDone }: { msg: string | null; onDone: () => void }) {
  React.useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [msg, onDone]);
  if (!msg) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-status-success/30 bg-bg-elevated shadow-2xl text-status-success text-xs font-medium">
      <Check className="h-3.5 w-3.5" /> {msg}
    </div>
  );
}

function DropdownMenu({ items, onClose }: { items: { label: string; icon: React.ReactNode; danger?: boolean; onClick: () => void }[]; onClose: () => void }) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);
  return (
    <div ref={ref} className="absolute right-0 top-8 z-50 w-48 rounded-xl border border-white/[0.08] bg-bg-elevated shadow-2xl shadow-black/60 overflow-hidden py-1">
      {items.map((item) => (
        <button key={item.label} onClick={() => { item.onClick(); onClose(); }}
          className={cn('w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors cursor-pointer', item.danger ? 'text-status-danger hover:bg-status-danger/10' : 'text-text-secondary hover:bg-white/[0.04] hover:text-text-primary')}
        >
          <span className="shrink-0">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}

function ComposeBox({ leadName, placeholder, onSend, onCancel }: { leadName: string; placeholder: string; onSend: (t: string, atts: Attachment[]) => void; onCancel?: () => void }) {
  const [text, setText] = React.useState('');
  const [attachments, setAttachments] = React.useState<Attachment[]>([]);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const applyFormatting = (prefix: string, suffix: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const val = el.value;
    const selectedText = val.slice(start, end);
    const replacement = prefix + selectedText + suffix;
    const newVal = val.slice(0, start) + replacement + val.slice(end);
    setText(newVal);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newAttachments: Attachment[] = [];
    const fileList = Array.from(e.target.files);
    
    fileList.forEach(file => {
      let type: 'image' | 'video' | 'document' | 'other' = 'other';
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('video/')) type = 'video';
      else if (file.type.startsWith('text/') || file.type.includes('pdf') || file.type.includes('msword') || file.type.includes('officedocument') || file.name.endsWith('.csv')) {
        type = 'document';
      }
      
      const sizeStr = file.size > 1024 * 1024 
        ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
        : (file.size / 1024).toFixed(0) + ' KB';
        
      newAttachments.push({
        id: 'att-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        name: file.name,
        type,
        url: URL.createObjectURL(file),
        size: sizeStr
      });
    });
    
    setAttachments(prev => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-white/[0.05]">
        <button onClick={() => applyFormatting('**', '**')} title="Bold" className="h-6 w-6 rounded text-text-tertiary hover:bg-white/[0.05] hover:text-text-primary text-xs font-bold transition-colors cursor-pointer flex items-center justify-center">B</button>
        <button onClick={() => applyFormatting('*', '*')} title="Italic" className="h-6 w-6 rounded text-text-tertiary hover:bg-white/[0.05] hover:text-text-primary text-xs font-italic transition-colors cursor-pointer flex items-center justify-center">I</button>
        <button onClick={() => applyFormatting('<u>', '</u>')} title="Underline" className="h-6 w-6 rounded text-text-tertiary hover:bg-white/[0.05] hover:text-text-primary text-xs underline transition-colors cursor-pointer flex items-center justify-center">U</button>
        <div className="h-3 w-px bg-white/10 mx-1" />
        <button onClick={triggerFileSelect} title="Attach Files" className="h-6 w-6 rounded text-text-tertiary hover:bg-white/[0.05] hover:text-text-primary transition-colors cursor-pointer flex items-center justify-center">
          <Paperclip className="h-3.5 w-3.5" />
        </button>
        <input ref={fileInputRef} type="file" multiple onChange={handleFileChange} className="hidden" accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.csv,.txt" />
      </div>

      {/* Selected Attachments list */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 px-3 py-2 border-b border-white/[0.05] bg-white/[0.01]">
          {attachments.map((att) => (
            <div key={att.id} className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-white/10 bg-white/[0.04] text-[11px] text-text-secondary">
              {att.type === 'image' && <Image className="h-3 w-3 text-accent-cyan" />}
              {att.type === 'video' && <Video className="h-3 w-3 text-accent-violet" />}
              {att.type === 'document' && <FileText className="h-3 w-3 text-status-success" />}
              {att.type === 'other' && <File className="h-3 w-3 text-text-tertiary" />}
              <span className="max-w-[120px] truncate">{att.name}</span>
              <span className="text-[9px] text-text-tertiary font-mono">({att.size})</span>
              <button onClick={() => setAttachments(prev => prev.filter(a => a.id !== att.id))} className="hover:text-status-danger cursor-pointer ml-1">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Textarea */}
      <textarea ref={textareaRef} rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder}
        className="w-full bg-transparent px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary resize-none focus:outline-none" />
      <div className="flex items-center justify-between px-3 py-2 border-t border-white/[0.05]">
        <span className="text-[10px] text-text-tertiary font-mono">Via: founders@arkilostudios.com</span>
        <div className="flex items-center gap-1.5">
          {onCancel && <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onCancel}>Cancel</Button>}
          <Button variant="primary" size="sm" className={cn('h-7 text-xs', (!text.trim() && attachments.length === 0) && 'opacity-40 cursor-not-allowed')}
            onClick={() => { if (text.trim() || attachments.length > 0) { onSend(text, attachments); setText(''); setAttachments([]); } }}>
            <Send className="h-3 w-3 mr-1.5" /> Send
          </Button>
        </div>
      </div>
    </div>
  );
}

function ConvRow({ c, active, onClick }: { c: Conversation; active: boolean; onClick: () => void }) {
  const cfg = STATUS[c.status];
  return (
    <button onClick={onClick} className={cn('w-full text-left px-4 py-3.5 flex items-start gap-3 border-b border-white/[0.04] transition-all cursor-pointer relative', active ? 'bg-white/[0.06] border-l-2 border-l-accent-cyan' : 'hover:bg-white/[0.02] border-l-2 border-l-transparent')}>
      {c.unread && <span className="absolute right-3 top-3.5 h-2 w-2 rounded-full bg-accent-cyan animate-pulse" />}
      {c.starred && !c.unread && <Star className="absolute right-3 top-3.5 h-2.5 w-2.5 fill-status-warning text-status-warning" />}
      <Avatar name={c.leadName} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className={cn('text-sm truncate', c.unread ? 'font-bold text-text-primary' : 'font-medium text-text-secondary')}>{c.leadName}</span>
          <span className="text-[10px] font-mono text-text-tertiary shrink-0">{c.lastTime}</span>
        </div>
        <div className="flex items-center gap-1.5 mb-1">
          <span className={cn('inline-block h-1.5 w-1.5 rounded-full shrink-0', cfg.dot)} />
          <span className="text-[10px] text-text-tertiary truncate">{c.leadCompany}</span>
        </div>
        <p className={cn('text-xs truncate', c.unread ? 'text-text-secondary' : 'text-text-tertiary')}>{c.lastSnippet}</p>
      </div>
    </button>
  );
}

function Bubble({ msg, leadName }: { msg: Message; leadName: string }) {
  const out = msg.direction === 'outbound';
  return (
    <div className={cn('flex gap-3', out ? 'flex-row-reverse' : 'flex-row')}>
      {out ? (
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent-cyan to-accent-violet flex items-center justify-center shrink-0 mt-1">
          <Zap className="h-3.5 w-3.5 text-white" />
        </div>
      ) : (
        <Avatar name={leadName} size="sm" />
      )}
      <div className={cn('max-w-[72%] flex flex-col gap-1', out ? 'items-end' : 'items-start')}>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-text-tertiary font-mono">{msg.timestamp}</span>
          <span className="text-[10px] font-semibold text-text-secondary">{out ? 'Arkilo Agent' : leadName}</span>
        </div>
        <div className={cn('rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap', out ? 'bg-accent-cyan/10 border border-accent-cyan/20 text-text-primary rounded-tr-sm' : 'bg-white/[0.04] border border-white/[0.07] text-text-primary rounded-tl-sm')}>
          {msg.body}
        </div>
        
        {/* Attachments rendering */}
        {msg.attachments && msg.attachments.length > 0 && (
          <div className="mt-2.5 flex flex-col gap-2 w-full">
            {msg.attachments.map((att) => {
              if (att.type === 'image') {
                return (
                  <div key={att.id} className="relative group max-w-[280px] rounded-lg overflow-hidden border border-white/10 bg-white/[0.02]">
                    <img src={att.url} alt={att.name} className="max-w-full h-auto object-cover max-h-[180px] rounded-lg" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="text-[10px] text-white font-mono bg-black/60 px-2 py-1 rounded">{att.size}</span>
                    </div>
                  </div>
                );
              }
              if (att.type === 'video') {
                return (
                  <div key={att.id} className="max-w-[280px] rounded-lg overflow-hidden border border-white/10 bg-white/[0.02]">
                    <video src={att.url} controls className="max-w-full h-auto max-h-[180px]" />
                  </div>
                );
              }
              return (
                <div key={att.id} className="flex items-center gap-3 px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors max-w-[280px]">
                  {att.type === 'document' ? (
                    <FileText className="h-5 w-5 text-accent-cyan shrink-0" />
                  ) : (
                    <File className="h-5 w-5 text-text-secondary shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-text-primary truncate font-medium">{att.name}</div>
                    <div className="text-[10px] text-text-tertiary font-mono">{att.size}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {out && (
          <div className="flex items-center gap-1 text-[9px] text-text-tertiary font-mono mt-0.5">
            <CheckCircle2 className="h-2.5 w-2.5 text-status-success" /> Delivered
          </div>
        )}
      </div>
    </div>
  );
}

interface ThreadProps {
  conv: Conversation | null;
  onToggleStar: (id: string) => void;
  onArchive: (id: string) => void;
  onMarkRead: (id: string) => void;
  onCopyEmail: (email: string) => void;
  onSendMessage: (id: string, text: string, atts: Attachment[]) => void;
}

function Thread({ conv, onToggleStar, onArchive, onMarkRead, onCopyEmail, onSendMessage }: ThreadProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [showFollowUp, setShowFollowUp] = React.useState(false);
  const [showMore, setShowMore] = React.useState(false);

  React.useEffect(() => {
    setShowFollowUp(false);
    setShowMore(false);
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [conv?.id]);

  if (!conv) return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3">
      <div className="h-14 w-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
        <Inbox className="h-6 w-6 opacity-30 text-text-tertiary" />
      </div>
      <p className="text-sm font-medium text-text-tertiary">Select a conversation</p>
      <p className="text-xs text-text-tertiary opacity-70">Pick a lead from the list to view the email thread</p>
    </div>
  );

  const cfg = STATUS[conv.status];
  const hasReply = conv.messages.some((m) => m.direction === 'reply');

  const moreItems = [
    { label: conv.unread ? 'Mark as Read' : 'Mark as Unread', icon: <MailOpen className="h-3.5 w-3.5" />, onClick: () => onMarkRead(conv.id) },
    { label: 'Copy Email Address', icon: <Copy className="h-3.5 w-3.5" />, onClick: () => onCopyEmail(conv.leadEmail) },
    { label: conv.starred ? 'Remove Star' : 'Add Star', icon: <Star className="h-3.5 w-3.5" />, onClick: () => onToggleStar(conv.id) },
    { label: 'Archive Conversation', icon: <Archive className="h-3.5 w-3.5" />, onClick: () => onArchive(conv.id) },
    { label: 'Mark as Spam', icon: <Flag className="h-3.5 w-3.5" />, danger: true, onClick: () => onArchive(conv.id) },
    { label: 'Delete Thread', icon: <Trash2 className="h-3.5 w-3.5" />, danger: true, onClick: () => onArchive(conv.id) },
  ];

  const scrollBottom = () => setTimeout(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, 80);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

      {/* Header */}
      <div className="px-6 py-4 border-b border-white/[0.06] bg-white/[0.01] flex items-start justify-between gap-4 shrink-0">
        <div className="flex items-start gap-3">
          <Avatar name={conv.leadName} size="lg" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-text-primary">{conv.leadName}</span>
              <Badge tone={cfg.tone} className="text-[10px]">{cfg.label}</Badge>
              {hasReply && <Badge tone="violet" className="flex items-center gap-1 text-[10px]"><Reply className="h-2.5 w-2.5" /> Replied</Badge>}
            </div>
            <div className="text-xs text-text-tertiary font-mono mt-0.5">{conv.leadEmail}</div>
            <div className="text-[10px] text-text-tertiary mt-0.5">{conv.leadRole} &middot; {conv.leadCompany}</div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => onToggleStar(conv.id)} title={conv.starred ? 'Remove star' : 'Star'}
            className={cn('h-7 w-7 rounded-lg flex items-center justify-center transition-all cursor-pointer', conv.starred ? 'text-status-warning bg-status-warning/10 hover:bg-status-warning/20' : 'text-text-tertiary hover:text-status-warning hover:bg-white/[0.05]')}>
            <Star className={cn('h-3.5 w-3.5', conv.starred && 'fill-current')} />
          </button>
          <button onClick={() => onArchive(conv.id)} title="Archive"
            className="h-7 w-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-white/[0.05] transition-all cursor-pointer">
            <Archive className="h-3.5 w-3.5" />
          </button>
          <button title="View lead profile"
            className="h-7 w-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-accent-cyan hover:bg-white/[0.05] transition-all cursor-pointer">
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
          <div className="relative">
            <button onClick={() => setShowMore((v) => !v)} title="More options"
              className={cn('h-7 w-7 rounded-lg flex items-center justify-center transition-all cursor-pointer', showMore ? 'bg-white/[0.08] text-text-primary' : 'text-text-tertiary hover:text-text-primary hover:bg-white/[0.05]')}>
              <MoreVertical className="h-3.5 w-3.5" />
            </button>
            {showMore && <DropdownMenu items={moreItems} onClose={() => setShowMore(false)} />}
          </div>
        </div>
      </div>

      {/* Subject meta */}
      <div className="px-6 py-2.5 border-b border-white/[0.04] bg-white/[0.005] shrink-0">
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <Mail className="h-3.5 w-3.5 text-text-tertiary shrink-0" />
          <span className="font-semibold text-text-primary">{conv.subject}</span>
          <span className="text-text-tertiary">&middot;</span>
          <span className="text-text-tertiary font-mono">Campaign: <span className="text-accent-cyan">{conv.campaign}</span></span>
          <span className="text-text-tertiary">&middot;</span>
          <span className="text-text-tertiary font-mono">Step {conv.step}</span>
        </div>
      </div>

      {/* Thread */}
      <div ref={ref} className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {conv.messages.map((msg) => <Bubble key={msg.id} msg={msg} leadName={conv.leadName} />)}
        {conv.status === 'scheduled' && (
          <div className="flex items-center gap-3 py-2.5 px-4 rounded-xl border border-status-warning/20 bg-status-warning/5 text-xs text-status-warning">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            Next follow-up is scheduled and queued for delivery.
          </div>
        )}
        {conv.status === 'failed' && (
          <div className="flex items-center gap-3 py-2.5 px-4 rounded-xl border border-status-danger/20 bg-status-danger/5 text-xs text-status-danger">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            Email delivery failed. Reauth required for this sender account.
          </div>
        )}
        {showFollowUp && (
          <div className="mt-2">
            <div className="text-[10px] text-text-tertiary uppercase tracking-wider font-semibold mb-2 ml-1">Manual Follow-up Email</div>
            <ComposeBox
              leadName={conv.leadName}
              placeholder={'Write a manual follow-up to ' + conv.leadName + '...'}
              onSend={(text, atts) => { onSendMessage(conv.id, text, atts); setShowFollowUp(false); }}
              onCancel={() => setShowFollowUp(false)}
            />
          </div>
        )}
      </div>

      {/* Reply compose - when lead has replied */}
      {hasReply && !showFollowUp && (
        <div className="px-6 pb-5 pt-3 border-t border-white/[0.06] shrink-0">
          <ComposeBox leadName={conv.leadName} placeholder={'Reply to ' + conv.leadName + '...'} onSend={(text, atts) => onSendMessage(conv.id, text, atts)} />
        </div>
      )}

      {/* Awaiting reply footer */}
      {!hasReply && conv.status !== 'failed' && !showFollowUp && (
        <div className="px-6 pb-4 pt-3 border-t border-white/[0.06] shrink-0">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-text-tertiary">
              <Clock className="h-3.5 w-3.5 text-status-warning" />
              Awaiting reply. Next follow-up queued automatically.
            </span>
            <Button variant="ghost" size="sm" className="h-7 text-xs border border-white/[0.07] hover:border-accent-cyan/30 hover:text-accent-cyan transition-all"
              onClick={() => { setShowFollowUp(true); scrollBottom(); }}>
              Manual Follow-up <ArrowUpRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Failed footer */}
      {conv.status === 'failed' && !showFollowUp && (
        <div className="px-6 pb-4 pt-3 border-t border-white/[0.06] shrink-0">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-status-danger">
              <AlertCircle className="h-3.5 w-3.5" />
              Delivery failed. Fix sender auth or send manually.
            </span>
            <Button variant="ghost" size="sm" className="h-7 text-xs border border-white/[0.07] hover:border-status-danger/30 hover:text-status-danger transition-all"
              onClick={() => { setShowFollowUp(true); scrollBottom(); }}>
              Send Manually <Send className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OutreachOutboxPage() {
  const [convs, setConvs] = React.useState<Conversation[]>(INITIAL_CONVS);
  const [activeId, setActiveId] = React.useState<string>('1');
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState<MsgStatus | 'all'>('all');
  const [toast, setToast] = React.useState<string | null>(null);

  const showToast = (msg: string) => setToast(msg);
  const dismissToast = React.useCallback(() => setToast(null), []);
  const updateConv = (id: string, patch: Partial<Conversation>) =>
    setConvs((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const visible = convs.filter((c) => !c.archived);
  const active = convs.find((c) => c.id === activeId) ?? null;
  const unread = visible.filter((c) => c.unread).length;

  const list = visible.filter((c) => {
    const q = search.toLowerCase();
    return (c.leadName.toLowerCase().includes(q) || c.leadEmail.toLowerCase().includes(q) || c.leadCompany.toLowerCase().includes(q))
      && (filter === 'all' || c.status === filter);
  });

  const handleToggleStar = (id: string) => {
    const c = convs.find((x) => x.id === id); if (!c) return;
    updateConv(id, { starred: !c.starred });
    showToast(c.starred ? 'Star removed' : 'Conversation starred');
  };

  const handleArchive = (id: string) => {
    updateConv(id, { archived: true });
    const next = visible.find((x) => x.id !== id);
    if (next) setActiveId(next.id);
    showToast('Conversation archived');
  };

  const handleMarkRead = (id: string) => {
    const c = convs.find((x) => x.id === id); if (!c) return;
    updateConv(id, { unread: !c.unread });
    showToast(c.unread ? 'Marked as read' : 'Marked as unread');
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email).catch(() => {});
    showToast('Email address copied to clipboard');
  };

  const handleSend = (convId: string, text: string, atts: Attachment[]) => {
    const now = new Date();
    const ts = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const newMsg: Message = { id: 'msg-' + Date.now(), direction: 'outbound', body: text, timestamp: ts, attachments: atts };
    const c = convs.find((x) => x.id === convId);
    const snippet = text ? text.slice(0, 60) : (atts.length > 0 ? 'Sent ' + atts.length + ' attachment(s)' : '');
    updateConv(convId, { messages: [...(c?.messages ?? []), newMsg], lastSnippet: snippet, lastTime: 'Just now', status: 'sent' });
    showToast('Message sent to ' + (c?.leadName ?? 'lead'));
  };

  return (
    <ClientShell>
      <div className="fixed inset-0 flex" style={{ left: 'var(--sidebar-width, 240px)', top: '49px' }}>

        {/* Left panel */}
        <div className="w-[300px] shrink-0 flex flex-col border-r border-white/[0.06] bg-bg-elevated/50 h-full">
          <div className="px-4 pt-4 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Inbox className="h-4 w-4 text-accent-cyan" />
                <h2 className="font-semibold text-text-primary text-sm">Outbox Monitor</h2>
              </div>
              <div className="flex items-center gap-1">
                {unread > 0 && <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent-cyan text-[9px] font-bold text-black px-1">{unread}</span>}
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><RefreshCw className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
              <input type="text" placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg pl-8 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-cyan-500/40 transition-colors" />
            </div>
            <div className="flex gap-1.5 mt-2.5 overflow-x-auto pb-0.5 scrollbar-hide">
              {(['all', 'replied', 'opened', 'sent', 'scheduled', 'failed'] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={cn('whitespace-nowrap px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider border transition-all cursor-pointer',
                    filter === f ? 'bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan' : 'bg-white/[0.02] border-white/[0.06] text-text-tertiary hover:text-text-secondary'
                  )}>{f}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 border-b border-white/[0.06]">
            {[{ label: 'Replied', value: visible.filter((c) => c.status === 'replied').length, color: 'text-accent-violet' },
              { label: 'Opened',  value: visible.filter((c) => c.status === 'opened').length,  color: 'text-accent-cyan' },
              { label: 'Failed',  value: visible.filter((c) => c.status === 'failed').length,  color: 'text-status-danger' }
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center py-2.5 border-r last:border-r-0 border-white/[0.04]">
                <span className={cn('font-mono text-base font-bold', s.color)}>{s.value}</span>
                <span className="text-[9px] uppercase tracking-wider text-text-tertiary">{s.label}</span>
              </div>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">
            {list.length === 0
              ? <div className="p-6 text-center text-xs text-text-tertiary">No conversations match.</div>
              : list.map((c) => (
                  <ConvRow key={c.id} c={c} active={activeId === c.id}
                    onClick={() => { setActiveId(c.id); updateConv(c.id, { unread: false }); }} />
                ))
            }
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col min-w-0 bg-bg-root/30 h-full overflow-hidden">
          <Thread conv={active} onToggleStar={handleToggleStar} onArchive={handleArchive}
            onMarkRead={handleMarkRead} onCopyEmail={handleCopyEmail} onSendMessage={handleSend} />
        </div>
      </div>
      <Toast msg={toast} onDone={dismissToast} />
    </ClientShell>
  );
}