'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Palette, Calendar, Lightbulb, Image as ImageIcon, ListChecks, Sparkles,
  Plus, Flame, Target, TrendingUp, Heart, Download, X, ChevronLeft, ChevronRight,
  Instagram, Linkedin, Twitter, Music2,
  Send, FileText, Hash, Loader2, Activity, Layers, MoreVertical,
  Clock, BarChart2, Zap, CheckCircle2, AlertCircle, Radio, Eye, Cpu, Star,
} from 'lucide-react';
import { ClientShell } from '@/components/shell/client-shell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs } from '@/components/ui/tabs';
import { Modal } from '@/components/ui/modal';
import { useUIStore } from '@/lib/store';
import { api } from '@/lib/api';
import { cn, fmtDate } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';
import type { PersonalityTone, CalendarItem, Platform, CarouselSlide, IdeaCard } from '@/lib/types';

const studioTabs = [
  { id: 'calendar', label: 'Calendar', icon: <Calendar className="h-3.5 w-3.5" /> },
  { id: 'ideas', label: 'Ideation', icon: <Lightbulb className="h-3.5 w-3.5" /> },
  { id: 'carousel', label: 'Carousel Maker', icon: <ImageIcon className="h-3.5 w-3.5" /> },
  { id: 'queue', label: 'Poster Queue', icon: <ListChecks className="h-3.5 w-3.5" /> },
  { id: 'style', label: 'Style Lab', icon: <Sparkles className="h-3.5 w-3.5" /> },
];

const sourceIcon = {
  trending: { icon: Flame, tone: 'danger' as const, label: 'Trending', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  keywords: { icon: Target, tone: 'cyan' as const, label: 'Keywords', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  pain: { icon: Heart, tone: 'magenta' as const, label: 'Pain Point', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
  viral: { icon: TrendingUp, tone: 'violet' as const, label: 'Viral', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
};

const platformIcon: Partial<Record<Platform, any>> = {
  instagram: Instagram,
  linkedin: Linkedin,
  twitter: Twitter,
  tiktok: Music2,
};

const platformColors: Partial<Record<Platform, { text: string; bg: string; border: string; gradient: string }>> = {
  instagram: { text: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', gradient: 'from-pink-500/15 to-transparent' },
  linkedin:  { text: 'text-cyan-400',  bg: 'bg-cyan-500/10',  border: 'border-cyan-500/20',  gradient: 'from-cyan-500/15 to-transparent'  },
  twitter:   { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', gradient: 'from-emerald-500/15 to-transparent' },
  tiktok:    { text: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', gradient: 'from-violet-500/15 to-transparent' },
};

const platformLabels: Partial<Record<Platform, string>> = {
  instagram: 'Instagram',
  linkedin:  'LinkedIn',
  twitter:   'X / Twitter',
  tiktok:    'TikTok',
};

const PLATFORMS: Platform[] = ['instagram', 'linkedin', 'twitter', 'tiktok'];
const TONES        = ['Concise', 'Technical', 'Noir', 'Hype'];
const SLIDE_COUNTS = [3, 4, 5, 6, 7, 8, 9, 10];

// ─── tiny helpers ───────────────────────────────────────────────────
function FieldLabel({ children, icon: Icon }: { children: React.ReactNode; icon?: any }) {
  return (
    <label className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-text-tertiary font-mono font-bold mb-1.5">
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </label>
  );
}

function StatCard({ label, value, icon: Icon, color, bg, border }: {
  label: string; value: number | string; icon: any;
  color: string; bg: string; border: string;
}) {
  return (
    <div className={cn('relative overflow-hidden rounded-2xl border p-4 flex items-center gap-3 bg-bg-elevated', border)}>
      <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center shrink-0', bg)}>
        <Icon className={cn('h-4 w-4', color)} />
      </div>
      <div>
        <div className={cn('text-xl font-bold font-mono leading-none', color)}>{value}</div>
        <div className="text-[10px] text-text-tertiary mt-0.5 font-medium">{label}</div>
      </div>
    </div>
  );
}

// ─── wrapText (canvas util) ─────────────────────────────────────────
function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(' ');
  let line = '';
  let yy = y;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    if (ctx.measureText(testLine).width > maxWidth && n > 0) {
      ctx.fillText(line, x, yy);
      line = words[n] + ' ';
      yy += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, yy);
}

// ─── slide download ─────────────────────────────────────────────────
function downloadSlide(slide: CarouselSlide, idx: number, postId: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080; canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
  grad.addColorStop(0, '#0a0e17'); grad.addColorStop(1, '#1a0e2e');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 1080, 1080);
  ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(60, 980); ctx.lineTo(1020, 980); ctx.stroke();
  ctx.fillStyle = '#06b6d4'; ctx.font = 'bold 56px sans-serif';
  ctx.fillText(`Slide ${idx + 1}`, 60, 120);
  ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 72px sans-serif';
  wrapText(ctx, slide.title, 60, 280, 960, 84);
  ctx.fillStyle = '#94a3b8'; ctx.font = '32px sans-serif';
  wrapText(ctx, slide.body, 60, 460, 960, 44);
  ctx.fillStyle = '#8b5cf6'; ctx.font = 'bold 28px sans-serif';
  ctx.fillText('ArkiloStudios Mission Control', 60, 1020);
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${postId}-slide-${idx + 1}.png`; a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}

// ═══════════════════════════════════════════════════════════════════
// StudioContent
// ═══════════════════════════════════════════════════════════════════
function StudioContent() {
  const [tab, setTab] = useState('calendar');
  const { activePersonality, setPersonality } = useUIStore();
  const [detailPost, setDetailPost] = useState<CalendarItem | null>(null);
  const [detailIdea, setDetailIdea] = useState<IdeaCard | null>(null);

  const useIdeaInPost = (_idea: IdeaCard) => {
    setTab('carousel');
    setDetailIdea(null);
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Social Content Studio"
        description="Autonomous post scheduling, dynamic carousel builder, and content ideation console."
        icon={<Palette className="h-4 w-4 text-white" />}
      />
      <Tabs tabs={studioTabs} active={tab} onChange={setTab} className="mb-6 font-sans font-semibold" />

      {tab === 'calendar' && <CalendarView   onSelectPost={setDetailPost} />}
      {tab === 'ideas'    && <IdeasView      onSelectIdea={setDetailIdea} onUseInPost={useIdeaInPost} />}
      {tab === 'carousel' && <CarouselView   onSelectPost={setDetailPost} />}
      {tab === 'queue'    && <QueueView      onSelectPost={setDetailPost} />}
      {tab === 'style'    && <StyleLabView   personality={activePersonality} setPersonality={setPersonality} />}

      <PostDetailModal post={detailPost} onClose={() => setDetailPost(null)} />
      <IdeaDetailModal idea={detailIdea} onClose={() => setDetailIdea(null)} onUseInPost={useIdeaInPost} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 1 — Calendar
// ═══════════════════════════════════════════════════════════════════
function CalendarView({ onSelectPost }: { onSelectPost: (p: CalendarItem) => void }) {
  const { data, isLoading } = useQuery({ queryKey: ['calendar'], queryFn: api.calendar });
  const [selected, setSelected]       = useState<string>('2026-06-05');
  const [showSchedule, setShowSchedule] = useState(false);
  const [viewMonth, setViewMonth]     = useState({ year: 2026, month: 5 });

  const items = data?.items.filter((i) => i.date === selected) ?? [];
  const datesWithItems = useMemo(() => new Set(data?.items.map((i) => i.date) ?? []), [data]);

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const daysInMonth = new Date(viewMonth.year, viewMonth.month + 1, 0).getDate();
  const offset      = (new Date(viewMonth.year, viewMonth.month, 1).getDay() + 6) % 7;

  const prevMonth = () => setViewMonth(v => v.month === 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: v.month - 1 });
  const nextMonth = () => setViewMonth(v => v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 });

  const platforms = [...new Set(data?.items.map(i => i.platform) ?? [])];
  const thisMonth = data?.items.filter(i => i.date.startsWith(`${viewMonth.year}-${String(viewMonth.month + 1).padStart(2, '0')}`)).length ?? 0;

  return (
    <div className="space-y-5">
      {/* Stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Scheduled"   value={data?.items.length ?? 0} icon={Calendar}   color="text-cyan-400"   bg="bg-cyan-500/10"   border="border-cyan-500/20" />
        <StatCard label="This Month"        value={thisMonth}               icon={BarChart2}  color="text-violet-400" bg="bg-violet-500/10" border="border-violet-500/20" />
        <StatCard label="Platforms Active"  value={platforms.length}        icon={Layers}     color="text-pink-400"   bg="bg-pink-500/10"   border="border-pink-500/20" />
        <StatCard label="Selected Day Posts" value={items.length}           icon={Zap}        color="text-amber-400"  bg="bg-amber-500/10"  border="border-amber-500/20" />
      </div>

      {/* Calendar + posts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Calendar */}
        <Card innerGlow className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/[0.04]">
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] text-text-tertiary hover:bg-white/5 hover:text-text-primary transition-all cursor-pointer">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="font-bold text-text-primary text-sm min-w-[140px] text-center">{monthNames[viewMonth.month]} {viewMonth.year}</span>
              <button onClick={nextMonth} className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] text-text-tertiary hover:bg-white/5 hover:text-text-primary transition-all cursor-pointer">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <Badge tone="cyan" className="font-mono text-[10px]">{data?.items.length ?? 0} posts</Badge>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoading ? (
              <div className="h-64 flex items-center justify-center"><Loader2 className="h-6 w-6 text-cyan-400 animate-spin" /></div>
            ) : (
              <div className="grid grid-cols-7 gap-1 text-[10px]">
                {['M','T','W','T','F','S','S'].map((d, i) => (
                  <div key={i} className="text-center text-text-tertiary font-bold font-mono tracking-widest py-2">{d}</div>
                ))}
                {Array.from({ length: offset }, (_, i) => <div key={`pad-${i}`} className="aspect-square" />)}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day  = i + 1;
                  const date = `${viewMonth.year}-${String(viewMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const hasItems  = datesWithItems.has(date);
                  const isSelected = date === selected;
                  const count = data?.items.filter(x => x.date === date).length ?? 0;
                  return (
                    <button
                      key={day}
                      onClick={() => setSelected(date)}
                      className={cn(
                        'aspect-square rounded-xl text-xs flex flex-col items-center justify-center transition-all duration-200 cursor-pointer relative font-mono',
                        !isSelected && 'border border-white/[0.04] bg-white/[0.01] text-text-secondary hover:bg-white/5 hover:border-white/10',
                        isSelected  && 'bg-gradient-accent text-white font-bold shadow-glow-cyan/40 scale-105 border-none',
                        hasItems && !isSelected && 'ring-1 ring-cyan-500/40 border-cyan-500/25 text-text-primary',
                      )}
                    >
                      <span className="leading-none">{day}</span>
                      {hasItems && (
                        <div className="flex gap-0.5 absolute bottom-1">
                          {Array.from({ length: Math.min(count, 3) }).map((_, di) => (
                            <span key={di} className={cn('h-1 w-1 rounded-full', isSelected ? 'bg-white/80' : 'bg-cyan-400')} />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Day posts */}
        <Card innerGlow className="lg:col-span-3 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/[0.04]">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Clock className="h-4 w-4 text-cyan-400" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold leading-none">Slot Schedule</CardTitle>
                <p className="text-[10px] text-text-tertiary mt-0.5 font-mono">{fmtDate(selected)}</p>
              </div>
              <Badge tone="cyan" className="font-mono ml-1">{items.length} slots</Badge>
            </div>
            <Button variant="primary" size="sm" onClick={() => setShowSchedule(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Schedule Post
            </Button>
          </CardHeader>
          <CardContent className="flex-1 pt-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-16 bg-white/[0.01] rounded-2xl border border-dashed border-white/[0.06]">
                <div className="h-14 w-14 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-text-tertiary opacity-40" />
                </div>
                <h3 className="text-xs font-semibold text-text-primary">No posts on this day</h3>
                <p className="text-[10px] text-text-tertiary mt-1.5 max-w-[200px] leading-relaxed">Click &ldquo;Schedule Post&rdquo; to add content to this calendar slot.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {items.map((item) => {
                  const PlatIcon = platformIcon[item.platform] ?? Send;
                  const colors   = platformColors[item.platform] || { text: 'text-text-primary', bg: 'bg-white/5', border: 'border-white/10', gradient: 'from-white/5' };
                  const isScheduled = item.status === 'scheduled';
                  const isPublished = item.status === 'published';
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectPost(item)}
                      className={cn(
                        'group relative overflow-hidden rounded-xl border text-left transition-all duration-200 hover:scale-[1.005] cursor-pointer bg-bg-elevated flex items-stretch',
                        colors.border, 'hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/5'
                      )}
                    >
                      {/* left accent bar */}
                      <div className={cn('w-0.5 shrink-0 bg-gradient-to-b', colors.gradient, 'to-transparent')} />
                      <div className={cn('absolute inset-0 bg-gradient-to-r opacity-20 pointer-events-none', colors.gradient)} />

                      <div className="relative flex items-center gap-4 p-3.5 w-full">
                        {/* Time chip */}
                        <div className="shrink-0 font-mono text-[11px] font-bold text-text-primary bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-lg leading-none">
                          {item.time}
                        </div>
                        {/* Platform icon */}
                        <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border', colors.bg, colors.border)}>
                          <PlatIcon className={cn('h-4 w-4', colors.text)} />
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold text-text-primary truncate block">{item.title}</span>
                          <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-1 leading-relaxed">{item.snippet}</p>
                        </div>
                        {/* Status */}
                        <div className="shrink-0 flex items-center gap-2">
                          <Badge
                            tone={isPublished ? 'success' : isScheduled ? 'cyan' : 'default'}
                            className="text-[9px] uppercase tracking-wider font-bold"
                            dot={isScheduled}
                          >
                            {item.status}
                          </Badge>
                          <ChevronRight className="h-3.5 w-3.5 text-text-tertiary group-hover:text-cyan-400 transition-colors" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <SchedulePostModal open={showSchedule} onClose={() => setShowSchedule(false)} defaultDate={selected} />
      </div>
    </div>
  );
}

// ─── Schedule Modal ─────────────────────────────────────────────────
function SchedulePostModal({ open, onClose, defaultDate }: { open: boolean; onClose: () => void; defaultDate: string }) {
  const queryClient = useQueryClient();
  const [title, setTitle]     = useState('');
  const [body, setBody]       = useState('');
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [date, setDate]       = useState(defaultDate);
  const [time, setTime]       = useState('09:00');
  const [hashtags, setHashtags] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const newPost: CalendarItem = {
      id: `p-${Date.now()}`, date, time, platform,
      title: title.trim(),
      snippet: body.slice(0, 80) + (body.length > 80 ? '…' : ''),
      body: body.trim() || title.trim(),
      hashtags: hashtags.split(/[,\s#]+/).map(h => h.replace(/^#/, '')).filter(Boolean),
      slides: [], author: 'mkt-content', status: 'scheduled', createdAt: new Date().toISOString(),
    };
    queryClient.setQueryData<{ items: CalendarItem[] }>(['calendar'], old =>
      old ? { items: [newPost, ...old.items] } : { items: [newPost] }
    );
    setTitle(''); setBody(''); setHashtags(''); onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Create New Post Slot"
      description="Queue up outbound social media content directly into scheduled slot channels."
      size="md"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="primary" size="sm" disabled={!title.trim()}>
            <Send className="h-3.5 w-3.5 mr-1.5" /> Schedule Node
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <div className="space-y-1.5">
          <FieldLabel icon={FileText}>Campaign Post Title *</FieldLabel>
          <input autoFocus required value={title} onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Next.js performance tip #12"
            className="w-full h-10 px-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-xs text-text-primary placeholder:text-text-tertiary focus:border-cyan-400/50 focus:outline-none transition-colors" />
        </div>
        <div className="space-y-1.5">
          <FieldLabel icon={FileText}>Content Snippet / Body</FieldLabel>
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={3}
            placeholder="Write your visual hook description here..."
            className="w-full px-3 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] text-xs text-text-primary placeholder:text-text-tertiary focus:border-cyan-400/50 focus:outline-none resize-none transition-colors" />
        </div>
        <div className="space-y-1.5">
          <FieldLabel icon={Hash}>Custom Tags (comma separated)</FieldLabel>
          <input value={hashtags} onChange={e => setHashtags(e.target.value)}
            placeholder="e.g. engineering, software, product"
            className="w-full h-10 px-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-xs text-text-primary placeholder:text-text-tertiary focus:border-cyan-400/50 focus:outline-none transition-colors" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <FieldLabel>Platform</FieldLabel>
            <select value={platform} onChange={e => setPlatform(e.target.value as Platform)}
              className="w-full h-10 px-2 rounded-xl border border-white/[0.08] bg-bg-elevated text-xs text-text-primary focus:border-cyan-400/50 focus:outline-none cursor-pointer">
              <option value="instagram">Instagram</option>
              <option value="linkedin">LinkedIn</option>
              <option value="twitter">X / Twitter</option>
              <option value="tiktok">TikTok</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Launch Date</FieldLabel>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full h-10 px-2 rounded-xl border border-white/[0.08] bg-bg-elevated text-xs text-text-primary focus:border-cyan-400/50 focus:outline-none cursor-pointer [color-scheme:dark]" />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Launch Time</FieldLabel>
            <input type="time" value={time} onChange={e => setTime(e.target.value)}
              className="w-full h-10 px-2 rounded-xl border border-white/[0.08] bg-bg-elevated text-xs text-text-primary focus:border-cyan-400/50 focus:outline-none cursor-pointer [color-scheme:dark]" />
          </div>
        </div>
      </form>
    </Modal>
  );
}

// ─── Post Detail Modal ──────────────────────────────────────────────
function PostDetailModal({ post, onClose }: { post: CalendarItem | null; onClose: () => void }) {
  if (!post) return null;
  const PlatIcon = platformIcon[post.platform] ?? Send;
  return (
    <Modal open={!!post} onClose={onClose} title={post.title}
      description={`${post.platform} · ${post.date} · ${post.time} · ${post.status}`} size="lg"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
          <Button variant="primary" size="sm" onClick={() => alert(`Post "${post.title}" would now be sent to ${post.platform}.`)}>
            <Send className="h-3.5 w-3.5 mr-1" /> {post.status === 'published' ? 'Re-post' : 'Schedule Post'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge tone="cyan" className="font-mono text-[9px] uppercase"><PlatIcon className="h-2.5 w-2.5 mr-1" />{post.platform}</Badge>
          <Badge tone={post.status === 'published' ? 'success' : post.status === 'scheduled' ? 'cyan' : 'default'} className="text-[9px] uppercase">{post.status}</Badge>
          <span className="text-[10px] text-text-tertiary font-mono">{post.date} &middot; {post.time}</span>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-text-tertiary font-mono"><FileText className="h-3 w-3" /> Description Body</div>
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 text-xs leading-relaxed text-text-secondary whitespace-pre-wrap">{post.body}</div>
        </div>
        {post.hashtags.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-text-tertiary font-mono"><Hash className="h-3 w-3" /> Hashtags</div>
            <div className="flex flex-wrap gap-1.5">
              {post.hashtags.map(h => <Badge key={h} tone="cyan" className="text-[10px] font-mono">#{h}</Badge>)}
            </div>
          </div>
        )}
        {post.slides.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-text-tertiary font-mono"><ImageIcon className="h-3 w-3" /> Carousel Slide Deck ({post.slides.length})</div>
            <div className="grid grid-cols-2 gap-3">
              {post.slides.map((s, idx) => (
                <div key={s.index} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 relative group">
                  <div className={cn('h-24 rounded-lg bg-gradient-to-br', s.gradient)} />
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <div className="text-[9px] font-mono text-text-tertiary uppercase">Slide {idx + 1}</div>
                      <div className="text-xs font-bold text-text-primary mt-0.5 line-clamp-1">{s.title}</div>
                    </div>
                    <button onClick={() => downloadSlide(s, idx, post.id)}
                      className="h-7 w-7 rounded-lg bg-bg-elevated/80 border border-white/[0.08] text-text-tertiary hover:text-accent-cyan hover:bg-bg-elevated transition-colors cursor-pointer shrink-0 flex items-center justify-center"
                      title="Download slide as PNG">
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 2 — Ideas
// ═══════════════════════════════════════════════════════════════════
function IdeasView({ onSelectIdea, onUseInPost }: {
  onSelectIdea: (idea: IdeaCard) => void;
  onUseInPost: (idea: IdeaCard) => void;
}) {
  const { data, isLoading } = useQuery({ queryKey: ['ideas'], queryFn: api.ideas });
  const ideas = data?.ideas ?? [];
  const avgScore     = ideas.length > 0 ? Math.round(ideas.reduce((a, b) => a + b.score, 0) / ideas.length) : 0;
  const trendingCount = ideas.filter(i => i.sources.includes('trending')).length;

  const headerGradMap: Record<string, string> = {
    trending: 'from-red-500/25 via-orange-500/10 to-transparent',
    keywords: 'from-cyan-500/25 via-cyan-500/10 to-transparent',
    pain:     'from-pink-500/25 via-pink-500/10 to-transparent',
    viral:    'from-violet-500/25 via-violet-500/10 to-transparent',
  };

  return (
    <div className="space-y-5">
      {/* Stat strip */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total Ideas"  value={ideas.length}  icon={Lightbulb} color="text-amber-400" bg="bg-amber-500/10" border="border-amber-500/20" />
        <StatCard label="Avg. Score"   value={avgScore}       icon={Star}      color="text-cyan-400"  bg="bg-cyan-500/10"  border="border-cyan-500/20" />
        <StatCard label="Trending Now" value={trendingCount}  icon={Flame}     color="text-red-400"   bg="bg-red-500/10"   border="border-red-500/20" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-64 rounded-2xl border border-white/5 bg-white/[0.01] animate-pulse" />)
          : ideas.map((idea) => {
              const mainSource = idea.sources[0] || 'trending';
              const meta       = sourceIcon[mainSource as keyof typeof sourceIcon] || sourceIcon.trending;
              const SrcIcon    = meta.icon;
              const headerGrad = headerGradMap[mainSource] || 'from-white/10 to-transparent';
              const scoreColor = idea.score >= 85
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                : idea.score >= 70
                ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
                : 'text-amber-400 bg-amber-500/10 border-amber-500/30';

              return (
                <div key={idea.id}
                  className="group relative rounded-2xl border border-white/[0.07] bg-bg-elevated overflow-hidden transition-all duration-300 hover:border-cyan-500/35 hover:shadow-xl hover:shadow-cyan-500/[0.06] hover:-translate-y-0.5 flex flex-col"
                >
                  {/* Gradient header zone */}
                  <div className={cn('relative h-16 bg-gradient-to-br shrink-0 border-b border-white/[0.05]', headerGrad)}>
                    <div className="absolute inset-0 flex items-center justify-between px-4">
                      <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center border', meta.bg, meta.border)}>
                        <SrcIcon className={cn('h-4 w-4', meta.color)} />
                      </div>
                      <div className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold font-mono', scoreColor)}>
                        <Activity className="h-3 w-3" /> {idea.score}
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  </div>

                  <div className="p-4 flex flex-col flex-1 gap-3">
                    <h3 className="text-xs font-bold text-text-primary leading-snug line-clamp-2">{idea.title}</h3>
                    <p className="text-[11px] text-text-secondary leading-relaxed line-clamp-3 flex-1">{idea.description}</p>

                    {/* Source badges */}
                    <div className="flex flex-wrap gap-1.5">
                      {idea.sources.map((s) => {
                        const m = sourceIcon[s as keyof typeof sourceIcon] || { label: s, icon: Lightbulb, color: 'text-text-tertiary', bg: 'bg-white/5', border: 'border-white/10' };
                        const MIcon = m.icon;
                        return (
                          <span key={s} className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border', m.bg, m.border, m.color)}>
                            <MIcon className="h-2.5 w-2.5" /> {m.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="grid grid-cols-2 gap-2 p-3 border-t border-white/[0.05] bg-white/[0.01]">
                    <button onClick={() => onSelectIdea(idea)}
                      className="h-8 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-white/[0.08] hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.07] text-text-secondary hover:text-text-primary transition-all cursor-pointer">
                      <Eye className="h-3 w-3" /> Details
                    </button>
                    <button onClick={() => onUseInPost(idea)}
                      className="h-8 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black transition-all cursor-pointer shadow-sm shadow-cyan-500/25">
                      <Zap className="h-3 w-3" /> Use in Post
                    </button>
                  </div>
                </div>
              );
            })
        }
      </div>
    </div>
  );
}

// ─── Idea Detail Modal ──────────────────────────────────────────────
function IdeaDetailModal({ idea, onClose, onUseInPost }: {
  idea: IdeaCard | null; onClose: () => void; onUseInPost: (idea: IdeaCard) => void;
}) {
  if (!idea) return null;
  return (
    <Modal open={!!idea} onClose={onClose} title={idea.title} description={`AI Engagement Score: ${idea.score}`} size="lg"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
          <Button variant="primary" size="sm" onClick={() => onUseInPost(idea)}><Send className="h-3.5 w-3.5 mr-1" /> Use in Post</Button>
        </div>
      }
    >
      <div className="space-y-4 pt-1">
        <div className="flex flex-wrap gap-2 items-center">
          {idea.sources.map(s => {
            const meta = sourceIcon[s as keyof typeof sourceIcon] || { label: s, tone: 'default' as const, icon: Lightbulb };
            const Icon = meta.icon;
            return <Badge key={s} tone={meta.tone} className="text-[10px] uppercase font-bold"><Icon className="h-3 w-3 mr-1" /> {meta.label}</Badge>;
          })}
          <Badge tone="cyan" className="font-mono text-[9px] ml-auto uppercase font-bold">Score {idea.score}</Badge>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-text-tertiary font-mono"><FileText className="h-3 w-3" /> Core Overview</div>
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 text-xs leading-relaxed text-text-secondary">{idea.description}</div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-text-tertiary font-mono"><Sparkles className="h-3 w-3 text-cyan-400" /> Hook Angle</div>
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/[0.03] p-3 text-xs leading-relaxed text-cyan-200 italic font-medium">&ldquo;{idea.angle}&rdquo;</div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-text-tertiary font-mono"><ListChecks className="h-3 w-3" /> Content Outline ({idea.outline.length} segments)</div>
          <ol className="space-y-2">
            {idea.outline.map((point, i) => (
              <li key={i} className="flex items-start gap-3 rounded-xl border border-white/[0.05] bg-white/[0.01] p-3">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-500/20 font-mono text-[10px] font-bold text-cyan-400">{i + 1}</span>
                <span className="text-xs text-text-secondary leading-relaxed pt-0.5">{point}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-text-tertiary font-mono"><Hash className="h-3 w-3" /> Hashtags</div>
            <div className="flex flex-wrap gap-1.5">{idea.suggestedHashtags.map(h => <Badge key={h} tone="cyan" className="text-[10px] font-mono">#{h}</Badge>)}</div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-text-tertiary font-mono"><ImageIcon className="h-3 w-3" /> Suggested Deck</div>
            <div className="h-9 px-3 flex items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] font-mono text-xs text-text-secondary font-bold">{idea.suggestedSlideCount} slides recommended</div>
          </div>
        </div>
        {idea.references.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-text-tertiary font-mono"><FileText className="h-3 w-3" /> Sources &amp; References</div>
            <div className="grid grid-cols-1 gap-2">
              {idea.references.map((ref, i) => (
                <a key={i} href={ref.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 hover:border-cyan-500/30 hover:bg-white/[0.04] transition-all group">
                  <span className="text-xs font-semibold text-text-primary">{ref.title}</span>
                  <ChevronRight className="h-4 w-4 text-text-tertiary group-hover:text-cyan-400 transition-colors" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 3 — Carousel Maker
// ═══════════════════════════════════════════════════════════════════
const slideGradients = [
  'from-cyan-500/30 to-violet-500/30',
  'from-violet-500/30 to-pink-500/30',
  'from-pink-500/30 to-rose-500/30',
  'from-rose-500/30 to-amber-500/30',
  'from-amber-500/30 to-cyan-500/30',
  'from-cyan-500/30 to-blue-500/30',
  'from-violet-500/30 to-rose-500/30',
  'from-indigo-500/30 to-violet-500/30',
];

const slideAccentColors = ['text-cyan-400','text-violet-400','text-pink-400','text-rose-400','text-amber-400','text-blue-400','text-emerald-400','text-indigo-400'];

function CarouselView({ onSelectPost }: { onSelectPost: (p: CalendarItem) => void }) {
  const [topic, setTopic]       = useState('5 underrated dev tools that 10x\'d my productivity in 2026');
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [tone, setTone]         = useState('Concise');
  const [slideCount, setSlideCount] = useState(5);
  const [hashtags, setHashtags] = useState(['DevTools', 'Productivity', 'AIEngineering']);
  const [newTag, setNewTag]     = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [slides, setSlides]     = useState<CarouselSlide[]>([
    { index: 0, title: 'Hook',                      body: '5 dev tools that 10x\'d my productivity.',           gradient: slideGradients[0] },
    { index: 1, title: 'Problem',                   body: 'Default stacks are 80% noise.',                       gradient: slideGradients[1] },
    { index: 2, title: 'Tool 1: Inngest',            body: 'Durable functions for agent workflows.',              gradient: slideGradients[2] },
    { index: 3, title: 'Tool 2: SQLite + Litestream', body: 'Embedded DB with S3 replication.',                  gradient: slideGradients[3] },
    { index: 4, title: 'CTA',                       body: 'Full breakdown in the comments.',                     gradient: slideGradients[4] },
  ]);

  const leftRef  = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const [rightH, setRightH] = useState<number | undefined>(undefined);

  useEffect(() => {
    const measure = () => { if (leftRef.current) setRightH(leftRef.current.offsetHeight); };
    measure();
    window.addEventListener('resize', measure);
    const ro = new ResizeObserver(measure);
    if (leftRef.current) ro.observe(leftRef.current);
    return () => { window.removeEventListener('resize', measure); ro.disconnect(); };
  }, [slides.length, hashtags.length]);

  const generate = () => {
    const templates = [
      { title: 'Hook',       body: topic },
      { title: 'The Problem', body: 'Default stacks are 80% noise. Here\'s what actually works.' },
      { title: 'Insight #1', body: 'Inngest for durable agent workflows. No more cron drift.' },
      { title: 'Insight #2', body: 'SQLite + Litestream. Embedded DB with S3 replication.' },
      { title: 'Insight #3', body: 'tmux + custom CLI. Agents spawn parallel sessions.' },
      { title: 'Insight #4', body: 'Bun runtime. 3x faster than Node, drops in cleanly.' },
      { title: 'CTA',        body: 'Full breakdown in the comments. What\'s in your stack?' },
    ];
    setSlides(templates.slice(0, slideCount).map((t, i) => ({ index: i, title: t.title, body: t.body, gradient: slideGradients[i % slideGradients.length] })));
  };

  const addTag    = () => { const t = newTag.trim().replace(/^#/, ''); if (t && !hashtags.includes(t)) setHashtags([...hashtags, t]); setNewTag(''); };
  const removeTag = (tag: string) => setHashtags(hashtags.filter(h => h !== tag));

  const schedulePost = () => {
    if (!slides.length) return;
    setIsPosting(true);
    setTimeout(() => {
      setIsPosting(false);
      alert(`Carousel scheduled to ${platform}! ${slides.length} slides will be published.`);
      onSelectPost({ id: `p-${Date.now()}`, date: '2026-06-08', time: '12:00', platform, title: topic.slice(0, 60), snippet: slides[0]?.body ?? '', body: topic, hashtags, slides, author: 'mkt-content', status: 'scheduled', createdAt: new Date().toISOString() });
    }, 800);
  };

  const currColors = platformColors[platform] || { text: 'text-text-tertiary', bg: 'bg-white/5', border: 'border-white/10' };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* ── LEFT: Config ─────────────────────────────────────────── */}
      <div ref={leftRef}>
        <Card innerGlow>
          <CardHeader className="pb-4 border-b border-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-cyan-400" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Generate Deck Settings</CardTitle>
                <p className="text-[10px] text-text-tertiary mt-0.5">Configure your carousel generation parameters</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5 flex flex-col gap-5">
            {/* Topic */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <FieldLabel icon={FileText}>Prompt Idea / Topic</FieldLabel>
                <span className={cn('text-[10px] font-mono', topic.length > 120 ? 'text-amber-400' : 'text-text-tertiary')}>{topic.length}/150</span>
              </div>
              <textarea rows={3} value={topic} onChange={e => setTopic(e.target.value)} maxLength={150}
                placeholder="Write target prompt or paste article context..."
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-xs text-text-primary placeholder:text-text-tertiary focus:border-cyan-400/50 focus:outline-none resize-none transition-colors leading-relaxed" />
            </div>

            {/* Platform pill toggle */}
            <div className="space-y-2">
              <FieldLabel>Platform</FieldLabel>
              <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                {PLATFORMS.map(p => {
                  const PIcon  = platformIcon[p] ?? Send;
                  const c      = platformColors[p] || { text: 'text-text-tertiary', bg: 'bg-white/5', border: 'border-white/10' };
                  const active = platform === p;
                  return (
                    <button key={p} onClick={() => setPlatform(p)}
                      className={cn('flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer',
                        active ? cn('text-white shadow-sm border', c.bg, c.border) : 'text-text-tertiary hover:text-text-secondary hover:bg-white/[0.03]')}>
                      <PIcon className={cn('h-4 w-4', active ? c.text : '')} />
                      <span>{platformLabels[p]?.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tone toggle */}
            <div className="space-y-2">
              <FieldLabel>Tone</FieldLabel>
              <div className="grid grid-cols-4 gap-1.5">
                {TONES.map(t => (
                  <button key={t} onClick={() => setTone(t)}
                    className={cn('h-9 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer border',
                      tone === t ? 'bg-violet-500/15 border-violet-500/30 text-violet-300' : 'bg-white/[0.02] border-white/[0.06] text-text-tertiary hover:text-text-secondary hover:bg-white/[0.05]')}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Slide count */}
            <div className="space-y-2">
              <FieldLabel icon={Layers}>Slide Count</FieldLabel>
              <div className="flex flex-wrap gap-1.5">
                {SLIDE_COUNTS.map(n => (
                  <button key={n} onClick={() => setSlideCount(n)}
                    className={cn('h-8 w-8 rounded-lg text-xs font-bold font-mono transition-all duration-200 cursor-pointer border',
                      slideCount === n ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300' : 'bg-white/[0.02] border-white/[0.06] text-text-tertiary hover:bg-white/[0.05] hover:text-text-secondary')}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate button */}
            <button onClick={generate}
              className="relative overflow-hidden h-11 w-full flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider rounded-xl text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)' }}>
              <Sparkles className="h-4 w-4" /> Assemble Slides Deck
            </button>

            {/* Hashtag manager */}
            <div className="border-t border-white/[0.06] pt-4 space-y-2.5">
              <FieldLabel icon={Hash}>Slide Tag Categories</FieldLabel>
              <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                {hashtags.map(h => (
                  <span key={h} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-mono font-bold text-cyan-400">
                    #{h}
                    <button onClick={() => removeTag(h)} className="cursor-pointer hover:text-white transition-colors"><X className="h-2.5 w-2.5" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={newTag} onChange={e => setNewTag(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add custom tag..."
                  className="flex-1 h-9 px-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-xs text-text-primary placeholder:text-text-tertiary focus:border-cyan-400/50 focus:outline-none transition-colors" />
                <button onClick={addTag}
                  className="h-9 px-4 rounded-xl text-xs font-bold uppercase tracking-wider border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.07] text-text-secondary hover:text-text-primary transition-all cursor-pointer">
                  Add
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── RIGHT: Slide preview ─────────────────────────────────── */}
      <div ref={rightRef} style={rightH ? { height: rightH } : undefined}>
        <Card innerGlow className="flex flex-col overflow-hidden h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/[0.04] shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <ImageIcon className="h-4 w-4 text-violet-400" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Visual Layout Preview</CardTitle>
                <p className="text-[10px] text-text-tertiary mt-0.5">Deck ready for {platformLabels[platform]}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge tone="violet" className="font-mono text-[9px] uppercase font-bold">{slides.length} slides</Badge>
              <Button size="sm" variant="primary" onClick={schedulePost} disabled={isPosting || !slides.length}>
                {isPosting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                {isPosting ? 'Scheduling…' : 'Schedule Node'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto scrollbar-thin p-4 min-h-0">
            <div className="grid grid-cols-2 gap-3">
              {slides.map((s, idx) => {
                const accent = slideAccentColors[idx % slideAccentColors.length];
                return (
                  <div key={`${s.index}-${idx}`}
                    className="rounded-2xl border border-white/[0.07] bg-white/[0.01] overflow-hidden group hover:border-white/15 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/5">
                    {/* Portrait-style preview */}
                    <div className={cn('relative bg-gradient-to-br flex flex-col justify-between p-3 overflow-hidden', s.gradient)} style={{ aspectRatio: '4/5' }}>
                      {/* Large faded slide number watermark */}
                      <span className="absolute bottom-1 right-2 text-[36px] font-black font-mono opacity-10 text-white leading-none select-none">
                        {String(idx + 1).padStart(2, '0')}
                      </span>

                      {/* Top row */}
                      <div className="flex items-start justify-between relative z-10">
                        <span className={cn('text-[9px] font-bold font-mono tracking-widest uppercase', accent)}>
                          SLIDE {String(idx + 1).padStart(2, '0')}
                        </span>
                        <button onClick={() => downloadSlide(s, idx, `carousel-${Date.now()}`)}
                          className="h-6 w-6 rounded-md bg-black/30 backdrop-blur-sm border border-white/10 text-white/60 hover:text-white hover:bg-black/50 transition-all cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100"
                          title="Download slide">
                          <Download className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Text */}
                      <div className="space-y-1 relative z-10">
                        <h4 className="text-sm font-black text-white leading-tight">{s.title}</h4>
                        <p className="text-[11px] text-white/75 leading-snug">{s.body}</p>
                      </div>

                      <span className="text-[8px] font-bold uppercase tracking-wider text-white/30 relative z-10">
                        ArkiloStudios Content Lab
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 4 — Queue
// ═══════════════════════════════════════════════════════════════════
function QueueView({ onSelectPost }: { onSelectPost: (p: CalendarItem) => void }) {
  const { data, isLoading } = useQuery({ queryKey: ['queue'], queryFn: api.posterQueue });
  const items          = data?.items ?? [];
  const queuedCount    = items.filter(q => q.status === 'queued' || q.status === 'ready').length;
  const publishingCount = items.filter(q => q.status === 'publishing').length;
  const failedCount    = items.filter(q => q.status === 'failed').length;

  type StatusKey = 'queued' | 'ready' | 'publishing' | 'published' | 'failed';
  const statusCfg: Record<StatusKey, { color: string; bg: string; border: string; icon: any }> = {
    queued:     { color: 'text-text-secondary',  bg: 'bg-white/5',         border: 'border-white/10',         icon: Clock },
    ready:      { color: 'text-cyan-400',         bg: 'bg-cyan-500/10',     border: 'border-cyan-500/20',      icon: CheckCircle2 },
    publishing: { color: 'text-amber-400',        bg: 'bg-amber-500/10',    border: 'border-amber-500/20',     icon: Radio },
    published:  { color: 'text-emerald-400',      bg: 'bg-emerald-500/10',  border: 'border-emerald-500/20',   icon: CheckCircle2 },
    failed:     { color: 'text-red-400',          bg: 'bg-red-500/10',      border: 'border-red-500/20',       icon: AlertCircle },
  };

  return (
    <div className="space-y-5">
      {/* Stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total in Queue"  value={items.length}    icon={ListChecks}  color="text-text-primary" bg="bg-white/5"        border="border-white/10" />
        <StatCard label="Queued / Ready"  value={queuedCount}     icon={Clock}       color="text-cyan-400"     bg="bg-cyan-500/10"    border="border-cyan-500/20" />
        <StatCard label="Publishing"      value={publishingCount} icon={Radio}       color="text-amber-400"    bg="bg-amber-500/10"   border="border-amber-500/20" />
        <StatCard label="Failed"          value={failedCount}     icon={AlertCircle} color="text-red-400"      bg="bg-red-500/10"     border="border-red-500/20" />
      </div>

      {/* Card list */}
      <Card innerGlow className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/[0.04]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <ListChecks className="h-4 w-4 text-violet-400" />
            </div>
            <CardTitle className="text-sm font-semibold">Publish Queue</CardTitle>
            <Badge tone="violet" className="font-mono text-[9px] uppercase font-bold">{items.length} items</Badge>
          </div>
          <Button variant="primary" size="sm">
            <Plus className="h-3.5 w-3.5 mr-1" /> Add to Queue
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center"><Loader2 className="h-6 w-6 text-cyan-400 animate-spin" /></div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16">
              <div className="h-14 w-14 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center mb-4">
                <ListChecks className="h-6 w-6 text-text-tertiary opacity-40" />
              </div>
              <h3 className="text-xs font-semibold text-text-primary">Queue is empty</h3>
              <p className="text-[10px] text-text-tertiary mt-1.5">Scheduled posts will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {items.map((q, idx) => {
                const colors  = platformColors[q.platform] || { text: 'text-text-primary', bg: 'bg-white/5', border: 'border-white/10', gradient: 'from-white/5' };
                const PlatComp = platformIcon[q.platform] ?? Send;
                const st      = statusCfg[q.status as StatusKey] ?? statusCfg.queued;
                const StatusIcon = st.icon;
                const isPublishing = q.status === 'publishing';

                return (
                  <button key={q.id}
                    onClick={() => onSelectPost({
                      id: q.id, date: q.scheduledAt.slice(0, 10), time: q.scheduledAt.slice(11, 16),
                      platform: q.platform, title: q.title, snippet: q.preview, body: q.preview,
                      hashtags: [], slides: [], author: 'mkt-content',
                      status: (q.status === 'queued' || q.status === 'ready' || q.status === 'publishing'
                        ? 'scheduled' : q.status === 'failed' ? 'draft' : 'scheduled') as 'draft' | 'scheduled' | 'published',
                      createdAt: q.scheduledAt,
                    })}
                    className="group relative w-full text-left flex items-stretch hover:bg-white/[0.015] transition-all duration-200 cursor-pointer">
                    {/* Platform color left accent */}
                    <div className={cn('w-0.5 shrink-0 bg-gradient-to-b opacity-70', colors.gradient, 'to-transparent')} />

                    <div className="flex items-center gap-4 p-4 flex-1 min-w-0">
                      {/* Index */}
                      <span className="shrink-0 font-mono text-[10px] text-text-tertiary w-5 text-center">{String(idx + 1).padStart(2, '0')}</span>

                      {/* Platform icon */}
                      <div className={cn('shrink-0 h-9 w-9 rounded-xl flex items-center justify-center border', colors.bg, colors.border)}>
                        <PlatComp className={cn('h-4 w-4', colors.text)} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-bold text-text-primary truncate">{q.title}</span>
                          <span className={cn('shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border', colors.bg, colors.border, colors.text)}>
                            <PlatComp className="h-2.5 w-2.5" /> {q.platform}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-tertiary truncate font-mono">{q.preview}</p>
                      </div>

                      {/* Time chip */}
                      <div className="shrink-0 flex items-center gap-1.5 text-[10px] font-mono text-text-tertiary bg-white/[0.03] border border-white/[0.06] px-2.5 py-1.5 rounded-lg">
                        <Clock className="h-3 w-3" />
                        {q.scheduledAt.slice(0, 16).replace('T', ' ')}
                      </div>

                      {/* Status */}
                      <div className={cn('shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider', st.bg, st.border, st.color)}>
                        <StatusIcon className={cn('h-3 w-3', isPublishing && 'animate-pulse')} />
                        {q.status}
                      </div>

                      {/* More actions */}
                      <button onClick={e => e.stopPropagation()}
                        className="shrink-0 h-7 w-7 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] text-text-tertiary hover:text-text-primary transition-colors flex items-center justify-center cursor-pointer">
                        <MoreVertical className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 5 — Style Lab
// ═══════════════════════════════════════════════════════════════════
function StyleLabView({ personality, setPersonality }: {
  personality: PersonalityTone; setPersonality: (p: PersonalityTone) => void;
}) {
  const { data } = useQuery({ queryKey: ['personalities'], queryFn: api.personalities });
  const active   = data?.find(p => p.id === personality) ?? data?.[0];
  const [cursor, setCursor] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setCursor(c => !c), 530);
    return () => clearInterval(t);
  }, []);

  // derive accent colours from personality id string
  const getAccent = (id: string) => {
    if (id.includes('technical') || id.includes('dev'))     return { text: 'text-cyan-400',   bg: 'bg-cyan-500/15',   border: 'border-cyan-500/30',   shadow: 'shadow-cyan-500/20',   grad: 'from-cyan-500/20 to-blue-500/20' };
    if (id.includes('creative') || id.includes('artis'))   return { text: 'text-violet-400', bg: 'bg-violet-500/15', border: 'border-violet-500/30', shadow: 'shadow-violet-500/20', grad: 'from-violet-500/20 to-pink-500/20' };
    if (id.includes('noir')    || id.includes('dark'))     return { text: 'text-slate-300',  bg: 'bg-slate-500/15',  border: 'border-slate-500/30',  shadow: 'shadow-slate-500/20',  grad: 'from-slate-500/20 to-gray-500/20' };
    if (id.includes('hype')    || id.includes('viral'))    return { text: 'text-rose-400',   bg: 'bg-rose-500/15',   border: 'border-rose-500/30',   shadow: 'shadow-rose-500/20',   grad: 'from-rose-500/20 to-orange-500/20' };
    if (id.includes('casual')  || id.includes('friend'))   return { text: 'text-amber-400',  bg: 'bg-amber-500/15',  border: 'border-amber-500/30',  shadow: 'shadow-amber-500/20',  grad: 'from-amber-500/20 to-orange-500/20' };
    return { text: 'text-cyan-400', bg: 'bg-cyan-500/15', border: 'border-cyan-500/30', shadow: 'shadow-cyan-500/20', grad: 'from-cyan-500/20 to-violet-500/20' };
  };

  return (
    <div className="space-y-6">
      {/* Section header row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-text-primary">Personality Style Lab</h2>
          <p className="text-[11px] text-text-tertiary">Select a voice persona that shapes all AI content generation</p>
        </div>
        {active && (
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-bold text-cyan-400 font-mono uppercase tracking-wider">{active.name} Active</span>
          </div>
        )}
      </div>

      {/* Personality grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {data?.map((p) => {
          const Icon     = (LucideIcons as any)[p.icon] || Sparkles;
          const isActive = personality === p.id;
          const accent   = getAccent(p.id);

          return (
            <button key={p.id} onClick={() => setPersonality(p.id)}
              className={cn(
                'relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 hover:scale-[1.03] cursor-pointer flex flex-col gap-3 min-h-[148px]',
                isActive
                  ? cn('shadow-lg', accent.border, accent.shadow)
                  : 'border-white/[0.07] bg-bg-elevated/40 hover:border-white/15 hover:bg-bg-elevated/60 hover:shadow-md hover:shadow-white/5'
              )}>
              {/* Background gradient wash on active */}
              {isActive && <div className={cn('absolute inset-0 bg-gradient-to-br opacity-50 pointer-events-none', accent.grad)} />}
              {/* Animated shimmer stripe */}
              {isActive && <div className={cn('absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent to-transparent', `via-current`)} style={{ color: accent.text.replace('text-', '').replace('-400', '') }} />}
              {isActive && <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />}

              {/* Icon */}
              <div className={cn('relative z-10 h-10 w-10 rounded-xl flex items-center justify-center border transition-all duration-300 shrink-0',
                isActive ? cn(accent.bg, accent.border, 'shadow-sm', accent.shadow) : 'bg-white/5 border-white/10')}>
                <Icon className={cn('h-5 w-5', isActive ? accent.text : 'text-text-tertiary')} />
              </div>

              {/* Label */}
              <div className="relative z-10 flex-1">
                <span className="text-xs font-bold text-text-primary block leading-tight">{p.name}</span>
                <span className="text-[9px] text-text-tertiary line-clamp-2 mt-1 leading-relaxed">{p.description}</span>
              </div>

              {isActive && (
                <div className={cn('relative z-10 self-start inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider', accent.bg, accent.border, accent.text)}>
                  <CheckCircle2 className="h-2.5 w-2.5" /> Active
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Active persona preview — terminal style */}
      {active && (
        <Card innerGlow className="relative overflow-hidden border border-cyan-500/15">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.04] via-transparent to-violet-500/[0.03] pointer-events-none" />

          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/[0.04] relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Cpu className="h-4 w-4 text-cyan-400" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Active Persona Viewport &middot; {active.name}</CardTitle>
                <p className="text-[10px] text-text-tertiary mt-0.5">Live personality output preview</p>
              </div>
            </div>
            <Badge tone="cyan" className="font-mono text-[9px] uppercase font-bold animate-pulse">● Running</Badge>
          </CardHeader>

          <CardContent className="pt-5 space-y-4 relative z-10">
            {/* Terminal pane */}
            <div className="rounded-xl border border-cyan-500/15 bg-black/30 overflow-hidden">
              {/* Traffic-light bar */}
              <div className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.03] border-b border-white/[0.05]">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
                <span className="ml-2 text-[10px] font-mono text-text-tertiary">persona_preview.md — {active.name}</span>
              </div>
              <div className="p-4 font-mono text-xs leading-relaxed text-cyan-100">
                <span className="text-text-tertiary select-none">→ </span>
                <span className="italic">&ldquo;{active.preview}&rdquo;</span>
                <span className={cn('inline-block w-[2px] h-[13px] bg-cyan-400 ml-0.5 align-middle', cursor ? 'opacity-100' : 'opacity-0', 'transition-opacity duration-100')} />
              </div>
            </div>

            <p className="text-[10px] text-text-tertiary leading-relaxed">
              * Automated sales copy and outbound marketing pipelines will automatically format, adapt, and inject this styled personality tone model during prompt generation tasks.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
export default function StudioPage() {
  return <ClientShell><StudioContent /></ClientShell>;
}
