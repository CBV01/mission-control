'use client';

import * as React from 'react';
import {
  Mail, Edit, Plus, Star, Copy, Eye, Layout, X, Check, Sparkles, Tag,
  BarChart2, MessageSquare, Send, Bot, RefreshCw, Trash2, User,
} from 'lucide-react';
import { ClientShell } from '@/components/shell/client-shell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
  openRate: string;
  replyRate: string;
  tags?: string[];
  isAi?: boolean;
}

const MY_TEMPLATES: Template[] = [
  {
    id: '1',
    name: 'Productivity Pitch (Short)',
    subject: 'Scale Next.js dev loops by 40%?',
    body: 'Hi {{firstName}},\n\nI saw {{company}} is building awesome tools. Our Next.js visual mission control helps developers streamline monitoring. Would you be open to a quick 5 min walk-through next Tuesday?\n\nBest,\nArkilo Agent',
    openRate: '72.4%',
    replyRate: '18.2%',
    tags: ['cold', 'saas'],
    isAi: false,
  },
  {
    id: '2',
    name: 'Follow-up Case Study',
    subject: 'Case study: How Acme Corp saved $15k',
    body: 'Hey {{firstName}},\n\nFollowing up on my last note. We worked with Acme Corp to reduce Next.js memory footprint. Here is the case study: {{link}}.\n\nLet me know if this aligns with your current goals.\n\nBest,\nArkilo Agent',
    openRate: '61.5%',
    replyRate: '12.4%',
    tags: ['follow-up'],
    isAi: false,
  },
  {
    id: '3',
    name: 'Cold Introduction (SaaS)',
    subject: 'Automate SaaS developer dashboards',
    body: 'Hi {{firstName}},\n\nQuick question: how does {{company}} handle agentic orchestration pipelines?\n\nOur tool ArkiloStudios helps SaaS CTOs visualize subagent tasks in a real-time live terminal.\n\nOpen to testing?\n\nCheers,\nArkilo Agent',
    openRate: '64.8%',
    replyRate: '11.2%',
    tags: ['cold', 'intro'],
    isAi: false,
  },
];

const AI_TEMPLATES: Template[] = [
  {
    id: 'ai-1',
    name: 'AI SaaS Accelerator Pitch',
    subject: 'Accelerate {{company}} output via Agents?',
    body: 'Hi {{firstName}},\n\nI saw {{company}} is hiring engineering roles. We built an autonomous agent platform that handles code reviews, lint fixes, and component generation directly inside Next.js.\n\nCan I send you a 2-min demo link?\n\nBest,\nArkilo AI',
    openRate: '81.2%',
    replyRate: '24.5%',
    tags: ['ai-gen', 'saas'],
    isAi: true,
  },
  {
    id: 'ai-2',
    name: 'AI Painpoint Follow-up',
    subject: 'Frustrated with agent latency, {{firstName}}?',
    body: 'Hey {{firstName}},\n\nMost product teams we speak with complain that subagent tasks take minutes to load. Our caching framework cuts execution lag down to sub-second responses.\n\nLet me know if this is worth a quick chat.\n\nBest,\nArkilo AI',
    openRate: '75.9%',
    replyRate: '19.8%',
    tags: ['ai-gen', 'follow-up'],
    isAi: true,
  },
];

type ToastState = { message: string; type: 'success' | 'info' } | null;

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  suggestedTemplate?: {
    name: string;
    subject: string;
    body: string;
    tags: string[];
  };
}

function Toast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, 2500);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);
  if (!toast) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border shadow-glow-cyan text-xs font-semibold ${
      toast.type === 'success'
        ? 'bg-status-success/10 border-status-success/30 text-status-success'
        : 'bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan'
    }`}>
      <Check className="h-4 w-4" />
      {toast.message}
    </div>
  );
}

function PreviewModal({ template, open, onClose }: { template: Template | null; open: boolean; onClose: () => void }) {
  if (!template) return null;
  const previewBody = template.body
    .replace(/{{firstName}}/g, 'Alex')
    .replace(/{{company}}/g, 'TechCorp')
    .replace(/{{link}}/g, 'https://case-study.arkilostudios.com');

  return (
    <Modal open={open} onClose={onClose} title="Email Preview" description={`Preview how "${template.name}" looks to recipients`} size="md"
      footer={<Button variant="ghost" size="sm" onClick={onClose}>Close Preview</Button>}
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.05] bg-white/[0.02]">
            <div className="flex items-center gap-2 text-xs text-text-tertiary mb-1">
              <span className="text-text-secondary font-medium">From:</span>
              <span className="font-mono">outreach@arkilostudios.com</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-tertiary mb-1">
              <span className="text-text-secondary font-medium">To:</span>
              <span className="font-mono">alex@techcorp.com</span>
            </div>
            <div className="flex items-center gap-2 text-xs mt-2">
              <span className="text-text-secondary font-medium">Subject:</span>
              <span className="text-text-primary font-semibold">{template.subject}</span>
            </div>
          </div>
          <div className="p-5">
            <pre className="text-sm text-text-secondary whitespace-pre-wrap font-sans leading-relaxed">{previewBody}</pre>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-tertiary">
          <Sparkles className="h-3.5 w-3.5 text-accent-cyan" />
          <span>Variables replaced with sample values for preview</span>
        </div>
      </div>
    </Modal>
  );
}

function NewTemplateModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (t: Template) => void }) {
  const [name, setName] = React.useState('');
  const [subject, setSubject] = React.useState('');
  const [body, setBody] = React.useState('Hi {{firstName}},\n\n\n\nBest,\nArkilo Agent');
  const [tag, setTag] = React.useState('');
  const [tags, setTags] = React.useState<string[]>([]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tag.trim()) {
      e.preventDefault();
      if (!tags.includes(tag.trim())) setTags([...tags, tag.trim()]);
      setTag('');
    }
  };

  const handleSave = () => {
    if (!name.trim() || !subject.trim() || !body.trim()) return;
    onSave({
      id: Date.now().toString(),
      name: name.trim(),
      subject: subject.trim(),
      body: body.trim(),
      openRate: '-',
      replyRate: '-',
      tags,
      isAi: false,
    });
    setName(''); setSubject(''); setBody('Hi {{firstName}},\n\n\n\nBest,\nArkilo Agent');
    setTag(''); setTags([]);
    onClose();
  };

  const inputClass = 'w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-text-primary font-mono focus:outline-none focus:border-cyan-500/50 placeholder:text-text-tertiary transition-colors';
  const labelClass = 'text-2xs uppercase tracking-wider text-text-tertiary font-semibold font-mono';

  return (
    <Modal open={open} onClose={onClose} title="New Email Template" description="Create a personalized outreach template with dynamic variables." size="md"
      footer={<><Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button><Button variant="primary" size="sm" onClick={handleSave} className={!name || !subject || !body ? 'opacity-50 cursor-not-allowed' : ''}><Plus className="h-3.5 w-3.5 mr-1.5" /> Create Template</Button></>}
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Template Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cold Intro - SaaS founders" className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Subject Line</label>
          <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Scale {{company}} dev loops by 40%?" className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Email Body</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={7} className={cn(inputClass, 'resize-none')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Tags (press Enter)</label>
          <div className="flex flex-wrap gap-2 mb-1.5">
            {tags.map((t) => (
              <span key={t} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-xs">
                <Tag className="h-2.5 w-2.5" /> {t}
                <button onClick={() => setTags(tags.filter((x) => x !== t))} className="ml-0.5 hover:text-white cursor-pointer"><X className="h-2.5 w-2.5" /></button>
              </span>
            ))}
          </div>
          <input type="text" value={tag} onChange={(e) => setTag(e.target.value)} onKeyDown={handleAddTag} placeholder="cold, saas, intro..." className={inputClass} />
        </div>
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] text-[10px] text-text-tertiary font-mono">
          <span className="text-text-secondary font-semibold block mb-1">Supported variables:</span>
          <span className="text-accent-cyan">{'{{firstName}}'}</span> &middot;{' '}
          <span className="text-accent-cyan">{'{{company}}'}</span> &middot;{' '}
          <span className="text-accent-cyan">{'{{link}}'}</span>
        </div>
      </div>
    </Modal>
  );
}

// AI Assistant Chat Modal
function AIChatModal({ open, onClose, onSaveAiTemplate }: { open: boolean; onClose: () => void; onSaveAiTemplate: (t: Template) => void }) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    { id: '1', sender: 'ai', text: 'Hi! I am your AI Outreach Assistant. Describe the details of the email you want to write (e.g., target audience, product value, tone) and I will generate a template with variables.' }
  ]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const doSend = () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { id: 'u-' + Date.now(), sender: 'user', text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    const promptText = trimmed.toLowerCase();
    setInput('');
    setLoading(true);

    setTimeout(() => {
      let name = 'AI Custom Pitch';
      let subject = 'Dynamic partnership with {{company}}?';
      let body = 'Hi {{firstName}},\n\nI reached out because of {{company}}\'s impressive trajectory in your sector. Arkilo automates monitoring and intelligence routing to double throughput.\n\nLet me know if you would like a brief overview.\n\nBest,\nArkilo Agent';
      let tags = ['ai-gen', 'custom'];

      if (promptText.includes('saas') || promptText.includes('tech') || promptText.includes('developer')) {
        name = 'AI SaaS Observability Pitch';
        subject = 'Accelerate {{company}} dev pipeline?';
        body = 'Hi {{firstName}},\n\nI noticed {{company}} has been expanding its developer footprint. Our visual mission control provides unified pipelines observability to slash latency by 40%.\n\nOpen to testing out a sandbox preview next Tuesday?\n\nBest,\nArkilo AI';
        tags = ['ai-gen', 'saas', 'intro'];
      } else if (promptText.includes('follow') || promptText.includes('checking')) {
        name = 'AI Smart Follow-up';
        subject = 'Re: Accelerate {{company}} dev pipeline';
        body = 'Hey {{firstName}},\n\nChecking if you had a moment to review my last email about pipeline scaling. I would love to share how we helped Acme cut infrastructure overhead in half.\n\nLet me know if next Thursday works.\n\nBest,\nArkilo AI';
        tags = ['ai-gen', 'follow-up'];
      } else if (promptText.includes('cold') || promptText.includes('intro')) {
        name = 'AI Cold Intro';
        subject = 'Quick question for {{firstName}}';
        body = 'Hi {{firstName}},\n\nI came across {{company}} and was impressed by your recent growth. We help teams like yours automate outreach workflows and reduce manual follow-up time by 60%.\n\nWould you be open to a quick 15-min call?\n\nBest,\nArkilo AI';
        tags = ['ai-gen', 'cold', 'intro'];
      }

      const aiMsg: ChatMessage = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: 'Here is the template I generated based on your request. Review it below and accept it to save it to your AI templates pool.',
        suggestedTemplate: { name, subject, body, tags }
      };
      setMessages(prev => [...prev, aiMsg]);
      setLoading(false);
    }, 1400);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      doSend();
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="AI Template Assistant" description="Describe what you need and the AI will draft a personalized email template for you." size="lg" bodyClassName="flex-1 overflow-hidden p-5 flex flex-col">

        {/* Scrollable messages area - flex-1 + min-h-0 ensures it fills space and scrolls internally */}
        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4 p-4 bg-white/[0.01] rounded-xl border border-white/[0.05]">
          {messages.map((msg) => (
            <div key={msg.id} className="flex flex-col gap-3">
              {/* Message bubble row */}
              <div className={cn('flex gap-3 items-start', msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                {/* Avatar */}
                <div className={cn(
                  'h-8 w-8 rounded-xl flex items-center justify-center shrink-0',
                  msg.sender === 'user'
                    ? 'bg-white/[0.06] border border-white/[0.1] text-text-secondary'
                    : 'bg-gradient-to-br from-cyan-500/30 to-violet-500/30 border border-cyan-500/30 text-cyan-400'
                )}>
                  {msg.sender === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>

                {/* Bubble */}
                <div className={cn(
                  'px-4 py-3 text-sm leading-relaxed max-w-[78%]',
                  msg.sender === 'user'
                    ? 'bg-white/[0.05] border border-white/[0.08] text-text-primary rounded-2xl rounded-tr-sm'
                    : 'bg-gradient-to-br from-cyan-500/[0.07] to-violet-500/[0.04] border border-cyan-500/[0.15] text-text-primary rounded-2xl rounded-tl-sm'
                )}>
                  {msg.text}
                </div>
              </div>

              {/* Suggested template card */}
              {msg.suggestedTemplate && (
                <div className="ml-11 rounded-xl border border-cyan-500/25 bg-gradient-to-br from-cyan-500/[0.04] to-violet-500/[0.03] overflow-hidden">
                  {/* Card header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                      <span className="text-xs font-bold text-cyan-400">{msg.suggestedTemplate.name}</span>
                    </div>
                    <div className="flex gap-1">
                      {msg.suggestedTemplate.tags.map(t => (
                        <span key={t} className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-white/[0.04] border border-white/[0.08] text-text-tertiary">{t}</span>
                      ))}
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-text-tertiary font-mono w-14 shrink-0 pt-0.5">Subject</span>
                      <span className="text-xs text-text-primary font-medium">{msg.suggestedTemplate.subject}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-text-tertiary font-mono w-14 shrink-0 pt-0.5">Body</span>
                      <pre className="text-xs text-text-secondary font-sans whitespace-pre-wrap leading-relaxed flex-1 bg-black/20 p-3 rounded-lg border border-white/[0.04] max-h-32 overflow-y-auto">{msg.suggestedTemplate.body}</pre>
                    </div>
                  </div>

                  {/* Card footer */}
                  <div className="px-4 py-3 border-t border-white/[0.06] bg-white/[0.01] flex justify-end">
                    <button
                      onClick={() => {
                        onSaveAiTemplate({
                          id: 'ai-gen-' + Date.now(),
                          name: msg.suggestedTemplate!.name,
                          subject: msg.suggestedTemplate!.subject,
                          body: msg.suggestedTemplate!.body,
                          openRate: '-',
                          replyRate: '-',
                          tags: msg.suggestedTemplate!.tags,
                          isAi: true,
                        });
                        onClose();
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Accept &amp; Save Template
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-3 items-start">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-cyan-500/30 to-violet-500/30 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="px-4 py-3 bg-gradient-to-br from-cyan-500/[0.07] to-violet-500/[0.04] border border-cyan-500/[0.15] rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Fixed input bar */}
        <div className="mt-3 shrink-0">
          <div className="flex items-end gap-2 p-3 rounded-xl border border-white/[0.08] bg-white/[0.02]">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="e.g. Write a cold pitch for a SaaS CTO about cloud cost savings..."
              rows={2}
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none resize-none disabled:opacity-50 leading-relaxed"
            />
            <button
              onClick={doSend}
              disabled={!input.trim() || loading}
              className="h-9 w-9 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-black flex items-center justify-center shrink-0 transition-all cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1.5 text-[10px] text-text-tertiary font-mono text-center">Press Enter to send &middot; Shift+Enter for new line</p>
        </div>
    </Modal>
  );
}

export default function OutreachTemplatesPage() {
  const [myTemplates, setMyTemplates] = React.useState<Template[]>(MY_TEMPLATES);
  const [aiTemplates, setAiTemplates] = React.useState<Template[]>(AI_TEMPLATES);
  const [activeTab, setActiveTab] = React.useState<'my' | 'ai'>('my');
  
  const currentList = activeTab === 'my' ? myTemplates : aiTemplates;
  const [selectedTemplate, setSelectedTemplate] = React.useState<Template>(MY_TEMPLATES[0]);
  const [editedTemplate, setEditedTemplate] = React.useState<Template>(MY_TEMPLATES[0]);
  
  const [showNewModal, setShowNewModal] = React.useState(false);
  const [showAiModal, setShowAiModal] = React.useState(false);
  const [showPreviewModal, setShowPreviewModal] = React.useState(false);
  const [toast, setToast] = React.useState<ToastState>(null);

  React.useEffect(() => {
    if (selectedTemplate) setEditedTemplate(selectedTemplate);
  }, [selectedTemplate]);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => setToast({ message, type });
  const dismissToast = React.useCallback(() => setToast(null), []);

  const handleSelectTemplate = (tmpl: Template) => {
    setSelectedTemplate(tmpl);
  };

  const handleSaveTemplate = () => {
    const updater = (prev: Template[]) => prev.map((t) => (t.id === editedTemplate.id ? editedTemplate : t));
    if (activeTab === 'my') {
      setMyTemplates(updater);
    } else {
      setAiTemplates(updater);
    }
    setSelectedTemplate(editedTemplate);
    showToast('Template saved successfully');
  };

  const handleDeleteTemplate = (id: string) => {
    const filterOut = (prev: Template[]) => prev.filter((t) => t.id !== id);
    let next: Template | null = null;
    if (activeTab === 'my') {
      const nextList = filterOut(myTemplates);
      setMyTemplates(nextList);
      if (nextList.length > 0) next = nextList[0];
    } else {
      const nextList = filterOut(aiTemplates);
      setAiTemplates(nextList);
      if (nextList.length > 0) next = nextList[0];
    }
    if (next) setSelectedTemplate(next);
    showToast('Template deleted');
  };

  const handleCopy = () => {
    const text = `Subject: ${editedTemplate.subject}\n\n${editedTemplate.body}`;
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied to clipboard', 'info');
    });
  };

  const handleNewTemplate = (tmpl: Template) => {
    setMyTemplates((prev) => [...prev, tmpl]);
    setActiveTab('my');
    setSelectedTemplate(tmpl);
    showToast(`"${tmpl.name}" created`);
  };

  const handleSaveAiTemplate = (tmpl: Template) => {
    setAiTemplates((prev) => [tmpl, ...prev]);
    setActiveTab('ai');
    setSelectedTemplate(tmpl);
    showToast(`AI draft "${tmpl.name}" saved to templates pool`);
  };

  return (
    <ClientShell>
      {/* Container with viewport-based height limit (removes outer body scroll) */}
      <div className="flex flex-col gap-6 h-[calc(100vh-95px)] overflow-hidden">
        <div className="shrink-0">
          <PageHeader
            title="Outreach Templates"
            description="Manage and personalize your cold email outreach copy templates. Review performance analytics per variant."
            icon={<Layout className="h-4 w-4 text-white" />}
            actions={
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="border border-accent-cyan/30 hover:border-accent-cyan/50 text-accent-cyan hover:bg-accent-cyan/10 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer" onClick={() => setShowAiModal(true)}>
                  <Sparkles className="h-4 w-4" /> AI Assistant
                </Button>
                <Button variant="primary" size="sm" className="font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer" onClick={() => setShowNewModal(true)}>
                  <Plus className="h-4 w-4" /> New Template
                </Button>
              </div>
            }
          />
        </div>

        {/* Full-height flex grid container for the 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1 min-h-0">
          {/* Left panel: list (h-full flex-col) */}
          <div className="lg:col-span-2 h-full flex flex-col min-h-0">
            <Card innerGlow className="flex flex-col h-full overflow-hidden">
              {/* Fixed header and 1-line tab headers */}
              <div className="shrink-0 border-b border-white/[0.04]">
                <div className="flex w-full">
                  <button
                    onClick={() => { setActiveTab('my'); if (myTemplates.length > 0) setSelectedTemplate(myTemplates[0]); }}
                    className={cn(
                      'flex-1 text-center py-3.5 text-2xs uppercase tracking-wider font-bold transition-all cursor-pointer border-b-2 flex items-center justify-center gap-1.5 whitespace-nowrap',
                      activeTab === 'my'
                        ? 'border-accent-cyan text-text-primary bg-white/[0.01]'
                        : 'border-transparent text-text-tertiary hover:text-text-secondary bg-transparent'
                    )}
                  >
                    My Templates
                    <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-mono', activeTab === 'my' ? 'bg-accent-cyan text-black font-extrabold' : 'bg-white/[0.04] text-text-tertiary')}>{myTemplates.length}</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab('ai'); if (aiTemplates.length > 0) setSelectedTemplate(aiTemplates[0]); }}
                    className={cn(
                      'flex-1 text-center py-3.5 text-2xs uppercase tracking-wider font-bold transition-all cursor-pointer border-b-2 flex items-center justify-center gap-1.5 whitespace-nowrap',
                      activeTab === 'ai'
                        ? 'border-accent-cyan text-text-primary bg-white/[0.01]'
                        : 'border-transparent text-text-tertiary hover:text-text-secondary bg-transparent'
                    )}
                  >
                    AI Generated
                    <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-mono', activeTab === 'ai' ? 'bg-accent-cyan text-black font-extrabold' : 'bg-white/[0.04] text-text-tertiary')}>{aiTemplates.length}</span>
                  </button>
                </div>
              </div>
              {/* List area - ONLY this scrolls */}
              <CardContent className="flex-1 overflow-y-auto p-3 min-h-0 space-y-2">
                {currentList.length === 0 ? (
                  <div className="py-12 text-center text-xs text-text-tertiary font-mono">No templates in this pool.</div>
                ) : (
                  currentList.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      onClick={() => handleSelectTemplate(tmpl)}
                      className={cn(
                        'w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1 cursor-pointer hover:bg-white/[0.02]',
                        selectedTemplate.id === tmpl.id
                          ? 'bg-white/5 border-accent-cyan/30 shadow-glow-cyan/5'
                          : 'bg-transparent border-transparent'
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-text-primary text-sm truncate flex-1">{tmpl.name}</span>
                        {tmpl.isAi ? <Sparkles className="h-3.5 w-3.5 text-accent-cyan shrink-0 animate-pulse" /> : <Star className={cn('h-3.5 w-3.5 text-text-tertiary shrink-0', selectedTemplate.id === tmpl.id && 'text-status-warning fill-status-warning')} />}
                      </div>
                      <span className="text-2xs text-text-tertiary truncate font-mono mt-0.5">{tmpl.subject}</span>
                      
                      {tmpl.tags && tmpl.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {tmpl.tags.map((tag) => (
                            <span key={tag} className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-white/[0.04] border border-white/[0.06] text-text-tertiary">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-4 mt-2 text-2xs font-mono text-text-secondary">
                        <span>OpenRate: <strong className={tmpl.openRate !== '-' ? 'text-status-success' : 'text-text-tertiary'}>{tmpl.openRate}</strong></span>
                        <span>ReplyRate: <strong className={tmpl.replyRate !== '-' ? 'text-accent-cyan' : 'text-text-tertiary'}>{tmpl.replyRate}</strong></span>
                      </div>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right panel: editor (h-full flex-col) */}
          <div className="lg:col-span-3 h-full flex flex-col min-h-0">
            <Card innerGlow className="flex flex-col h-full overflow-hidden bg-bg-surface/50 border border-white/[0.06]">
              {/* Fixed header */}
              <CardHeader className="shrink-0 border-b border-white/[0.04] pb-4.5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle>Template Editor</CardTitle>
                    {editedTemplate.openRate !== '-' && (
                      <div className="flex items-center gap-2.5 text-2xs font-mono bg-white/[0.02] border border-white/[0.06] px-2 py-0.5 rounded-lg">
                        <span className="text-text-tertiary">Open:</span>
                        <span className="text-status-success font-bold">{editedTemplate.openRate}</span>
                        <span className="text-text-tertiary">&middot;</span>
                        <span className="text-text-tertiary">Reply:</span>
                        <span className="text-accent-cyan font-bold">{editedTemplate.replyRate}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold" onClick={handleCopy}>
                      <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold" onClick={() => setShowPreviewModal(true)}>
                      <Eye className="h-3.5 w-3.5 mr-1.5" /> Preview
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold text-status-danger hover:bg-status-danger/10 hover:text-status-danger transition-all" onClick={() => handleDeleteTemplate(editedTemplate.id)} title="Delete Template">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Content area: fields scrollable, action buttons fixed */}
              <CardContent className="flex-1 flex flex-col justify-between min-h-0 p-5">
                {/* Inputs container - ONLY this scrolls */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-text-tertiary font-semibold font-mono">Template Name</label>
                    <input
                      type="text"
                      value={editedTemplate.name}
                      onChange={(e) => setEditedTemplate({ ...editedTemplate, name: e.target.value })}
                      className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-accent-cyan/40 rounded-lg px-3 py-2 text-sm text-text-primary font-semibold focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-text-tertiary font-semibold font-mono">Subject Line</label>
                    <input
                      type="text"
                      value={editedTemplate.subject}
                      onChange={(e) => setEditedTemplate({ ...editedTemplate, subject: e.target.value })}
                      className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-accent-cyan/40 rounded-lg px-3 py-2 text-sm text-text-primary font-mono focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-text-tertiary font-semibold font-mono">Email Body</label>
                    <textarea
                      value={editedTemplate.body}
                      onChange={(e) => setEditedTemplate({ ...editedTemplate, body: e.target.value })}
                      rows={10}
                      className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-accent-cyan/40 rounded-lg p-3 text-sm text-text-primary font-mono focus:outline-none resize-none transition-colors flex-1"
                    />
                  </div>
                </div>
                {/* Action footer - fixed at bottom of CardContent */}
                <div className="mt-4 flex justify-between items-center pt-4 border-t border-white/[0.06] shrink-0">
                  <div className="text-[10px] text-text-tertiary font-mono">
                    Variables:{' '}
                    <span className="text-accent-cyan">&#123;&#123;firstName&#125;&#125;</span> &middot;{' '}
                    <span className="text-accent-cyan">&#123;&#123;company&#125;&#125;</span> &middot;{' '}
                    <span className="text-accent-cyan">&#123;&#123;link&#125;&#125;</span>
                  </div>
                  <Button variant="primary" size="sm" className="h-8 text-xs font-semibold" onClick={handleSaveTemplate}>
                    <Edit className="h-3.5 w-3.5 mr-1.5" /> Save Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals & Toast */}
      <NewTemplateModal open={showNewModal} onClose={() => setShowNewModal(false)} onSave={handleNewTemplate} />
      <AIChatModal open={showAiModal} onClose={() => setShowAiModal(false)} onSaveAiTemplate={handleSaveAiTemplate} />
      <PreviewModal template={editedTemplate} open={showPreviewModal} onClose={() => setShowPreviewModal(false)} />
      <Toast toast={toast} onDismiss={dismissToast} />
    </ClientShell>
  );
}