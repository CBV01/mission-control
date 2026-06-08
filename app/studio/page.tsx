'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Palette, Calendar, Lightbulb, Image as ImageIcon, ListChecks, Sparkles,
  Plus, Flame, Target, TrendingUp, Heart, Download, X, ChevronLeft, ChevronRight,
  Instagram, Linkedin, Twitter, Music2,
  Send, FileText, Hash, Loader2,
} from 'lucide-react';
import { ClientShell } from '@/components/shell/client-shell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
  { id: 'carousel', label: 'Carousel', icon: <ImageIcon className="h-3.5 w-3.5" /> },
  { id: 'queue', label: 'Poster Queue', icon: <ListChecks className="h-3.5 w-3.5" /> },
  { id: 'style', label: 'Style Lab', icon: <Sparkles className="h-3.5 w-3.5" /> },
];

const sourceIcon = {
  trending: { icon: Flame, tone: 'danger' as const, label: 'Trending' },
  keywords: { icon: Target, tone: 'cyan' as const, label: 'Keywords' },
  pain: { icon: Heart, tone: 'magenta' as const, label: 'Pain Point' },
  viral: { icon: TrendingUp, tone: 'violet' as const, label: 'Viral' },
};

const platformIcon: Partial<Record<Platform, any>> = {
  instagram: Instagram,
  linkedin: Linkedin,
  twitter: Twitter,
  tiktok: Music2,
};

const platformTone: Partial<Record<Platform, 'cyan' | 'violet' | 'magenta' | 'success'>> = {
  instagram: 'magenta',
  linkedin: 'cyan',
  twitter: 'success',
  tiktok: 'violet',
};

function StudioContent() {
  const [tab, setTab] = useState('calendar');
  const { activePersonality, setPersonality } = useUIStore();
  const [detailPost, setDetailPost] = useState<CalendarItem | null>(null);
  const [detailIdea, setDetailIdea] = useState<IdeaCard | null>(null);
  const queryClient = useQueryClient();

  // When user clicks "Use in Post", prefill the carousel with this idea
  const useIdeaInPost = (_idea: IdeaCard) => {
    // Pre-fill the carousel query cache so the CarouselView reads from it
    setTab('carousel');
    setDetailIdea(null);
  };

  return (
    <>
      <PageHeader
        title="Social Content Studio"
        description="Calendar, ideation, carousels, queue, and style. Click any post to see full details."
        icon={<Palette className="h-4 w-4 text-white" />}
      />

      <Tabs tabs={studioTabs} active={tab} onChange={setTab} className="mb-6" />

      {tab === 'calendar' && <CalendarView onSelectPost={setDetailPost} />}
      {tab === 'ideas' && <IdeasView onSelectIdea={setDetailIdea} />}
      {tab === 'carousel' && <CarouselView onSelectPost={setDetailPost} />}
      {tab === 'queue' && <QueueView onSelectPost={setDetailPost} />}
      {tab === 'style' && <StyleLabView personality={activePersonality} setPersonality={setPersonality} />}

      <PostDetailModal post={detailPost} onClose={() => setDetailPost(null)} />
      <IdeaDetailModal
        idea={detailIdea}
        onClose={() => setDetailIdea(null)}
        onUseInPost={useIdeaInPost}
      />
    </>
  );
}

// ─── Calendar View ──────────────────────────────────────────────────
function CalendarView({ onSelectPost }: { onSelectPost: (p: CalendarItem) => void }) {
  const { data, isLoading } = useQuery({ queryKey: ['calendar'], queryFn: api.calendar });
  const [selected, setSelected] = useState<string>('2026-06-05');
  const [showSchedule, setShowSchedule] = useState(false);
  const [viewMonth, setViewMonth] = useState({ year: 2026, month: 5 }); // 0-indexed; May=4, June=5

  const items = data?.items.filter((i) => i.date === selected) ?? [];
  const datesWithItems = useMemo(
    () => new Set(data?.items.map((i) => i.date) ?? []),
    [data],
  );

  // Build a real calendar grid: find the first weekday of the month and pad
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const daysInMonth = new Date(viewMonth.year, viewMonth.month + 1, 0).getDate();
  const firstDay = new Date(viewMonth.year, viewMonth.month, 1).getDay(); // 0=Sun
  // Reorder so Monday is the first column
  const offset = (firstDay + 6) % 7;

  const prevMonth = () => setViewMonth((v) => v.month === 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: v.month - 1 });
  const nextMonth = () => setViewMonth((v) => v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Calendar card */}
      <Card innerGlow>
        <CardHeader>
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="flex h-6 w-6 items-center justify-center rounded-md text-text-tertiary hover:bg-white/5 hover:text-text-primary cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <CardTitle>{monthNames[viewMonth.month]} {viewMonth.year}</CardTitle>
            <button
              onClick={nextMonth}
              className="flex h-6 w-6 items-center justify-center rounded-md text-text-tertiary hover:bg-white/5 hover:text-text-primary cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <Badge tone="cyan" dot>{data?.items.length ?? 0} posts</Badge>
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-64" /> : (
            <div className="grid grid-cols-7 gap-1 text-2xs">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <div key={i} className="text-center text-text-tertiary py-1 font-mono">{d}</div>
              ))}
              {Array.from({ length: offset }, (_, i) => (
                <div key={`pad-${i}`} className="aspect-square" />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const date = `${viewMonth.year}-${String(viewMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const hasItems = datesWithItems.has(date);
                const isSelected = date === selected;
                return (
                  <button
                    key={day}
                    onClick={() => setSelected(date)}
                    className={cn(
                      'aspect-square rounded-md text-2xs flex flex-col items-center justify-center transition-colors cursor-pointer relative',
                      !isSelected && 'hover:bg-white/5 text-text-secondary',
                      isSelected && 'bg-gradient-accent text-white font-semibold shadow-glow-cyan',
                      hasItems && !isSelected && 'ring-1 ring-accent-cyan/40',
                    )}
                  >
                    <span>{day}</span>
                    {hasItems && (
                      <span className={cn(
                        'h-1 w-1 rounded-full mt-0.5',
                        isSelected ? 'bg-white' : 'bg-accent-cyan',
                      )} />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Day's posts */}
      <Card innerGlow className="lg:col-span-2 flex flex-col">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Schedule · {fmtDate(selected)}</CardTitle>
            <Badge tone="cyan">{items.length}</Badge>
          </div>
          <Button variant="primary" size="sm" onClick={() => setShowSchedule(true)}>
            <Plus className="h-3.5 w-3.5" /> Schedule Post
          </Button>
        </CardHeader>
        <CardContent className="flex-1">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-10">
              <Calendar className="h-10 w-10 text-text-tertiary mb-2" />
              <h3 className="text-sm font-medium text-text-primary">Nothing scheduled</h3>
              <p className="text-xs text-text-tertiary mt-1">No posts for this day. Click "Schedule Post" to add one.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((i) => {
                const PlatIcon = platformIcon[i.platform] ?? Send;
                return (
                  <button
                    key={i.id}
                    onClick={() => onSelectPost(i)}
                    className="w-full rounded-lg border border-white/5 bg-white/5 p-3 flex items-start gap-3 text-left transition-colors hover:border-cyan-400/30 hover:bg-white/[0.07] cursor-pointer"
                  >
                    <span className="font-mono text-2xs text-text-tertiary w-12 flex-shrink-0">{i.time}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <PlatIcon className="h-3.5 w-3.5 text-accent-cyan flex-shrink-0" />
                        <span className="text-sm font-medium text-text-primary truncate">{i.title}</span>
                        <Badge tone={i.status === 'published' ? 'success' : i.status === 'scheduled' ? 'cyan' : 'default'} dot>
                          {i.status}
                        </Badge>
                      </div>
                      <p className="text-2xs text-text-secondary mt-1 line-clamp-1">{i.snippet}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <SchedulePostModal
        open={showSchedule}
        onClose={() => setShowSchedule(false)}
        defaultDate={selected}
      />
    </div>
  );
}

// ─── Schedule Post Modal ────────────────────────────────────────────
function SchedulePostModal({ open, onClose, defaultDate }: { open: boolean; onClose: () => void; defaultDate: string }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState('09:00');
  const [hashtags, setHashtags] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const newPost: CalendarItem = {
      id: `p-${Date.now()}`,
      date,
      time,
      platform,
      title: title.trim(),
      snippet: body.slice(0, 80) + (body.length > 80 ? '…' : ''),
      body: body.trim() || title.trim(),
      hashtags: hashtags.split(/[,\s#]+/).map((h) => h.replace(/^#/, '')).filter(Boolean),
      slides: [],
      author: 'mkt-content',
      status: 'scheduled',
      createdAt: new Date().toISOString(),
    };
    queryClient.setQueryData<{ items: CalendarItem[] }>(['calendar'], (old) => {
      if (!old) return { items: [newPost] };
      return { items: [newPost, ...old.items] };
    });
    setTitle('');
    setBody('');
    setHashtags('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Schedule a post"
      description="Pick a date, time, and platform."
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="primary" disabled={!title.trim()}>
            <Send className="h-3.5 w-3.5" /> Schedule
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-2xs uppercase tracking-wider text-text-tertiary">Title</label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Founder story #4"
            className="mt-1 w-full h-9 px-3 rounded-md border border-white/[0.08] bg-white/[0.04] text-sm text-text-primary placeholder:text-text-tertiary focus:border-cyan-400/50 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-2xs uppercase tracking-wider text-text-tertiary">Body</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="Post content…"
            className="mt-1 w-full px-3 py-2 rounded-md border border-white/[0.08] bg-white/[0.04] text-sm text-text-primary placeholder:text-text-tertiary focus:border-cyan-400/50 focus:outline-none resize-none"
          />
        </div>
        <div>
          <label className="text-2xs uppercase tracking-wider text-text-tertiary">Hashtags</label>
          <input
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            placeholder="e.g. AI, BuildInPublic, HermesOS"
            className="mt-1 w-full h-9 px-3 rounded-md border border-white/[0.08] bg-white/[0.04] text-sm text-text-primary placeholder:text-text-tertiary focus:border-cyan-400/50 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-2xs uppercase tracking-wider text-text-tertiary">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center',
                paddingRight: '28px',
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
              }}
              className="mt-1 w-full h-9 px-2 rounded-md border border-white/[0.08] bg-bg-elevated text-sm text-text-primary focus:border-cyan-400/50 focus:outline-none cursor-pointer"
            >
              <option value="instagram">Instagram</option>
              <option value="linkedin">LinkedIn</option>
              <option value="twitter">X / Twitter</option>
              <option value="tiktok">TikTok</option>
            </select>
          </div>
          <div>
            <label className="text-2xs uppercase tracking-wider text-text-tertiary">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full h-9 px-2 rounded-md border border-white/[0.08] bg-bg-elevated text-sm text-text-primary focus:border-cyan-400/50 focus:outline-none cursor-pointer [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="text-2xs uppercase tracking-wider text-text-tertiary">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-1 w-full h-9 px-2 rounded-md border border-white/[0.08] bg-bg-elevated text-sm text-text-primary focus:border-cyan-400/50 focus:outline-none cursor-pointer [color-scheme:dark]"
            />
          </div>
        </div>
        <button type="submit" className="hidden" />
      </form>
    </Modal>
  );
}

// ─── Post Detail Modal ──────────────────────────────────────────────
function PostDetailModal({ post, onClose }: { post: CalendarItem | null; onClose: () => void }) {
  if (!post) return null;
  const PlatIcon = platformIcon[post.platform] ?? Send;

  const downloadSlide = (slide: CarouselSlide, idx: number) => {
    // Render a slide to canvas and download as PNG
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Dark background
    const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
    grad.addColorStop(0, '#0a0e17');
    grad.addColorStop(1, '#1a0e2e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1080);
    // Accent line
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(60, 980);
    ctx.lineTo(1020, 980);
    ctx.stroke();
    // Title
    ctx.fillStyle = '#06b6d4';
    ctx.font = 'bold 56px sans-serif';
    ctx.fillText(`Slide ${idx + 1}`, 60, 120);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 72px sans-serif';
    wrapText(ctx, slide.title, 60, 280, 960, 84);
    // Body
    ctx.fillStyle = '#94a3b8';
    ctx.font = '32px sans-serif';
    wrapText(ctx, slide.body, 60, 460, 960, 44);
    // Brand
    ctx.fillStyle = '#8b5cf6';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('ArkiloStudios Mission Control', 60, 1020);
    // Download
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${post.id}-slide-${idx + 1}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  return (
    <Modal
      open={!!post}
      onClose={onClose}
      title={post.title}
      description={`${post.platform} · ${post.date} · ${post.time} · ${post.status}`}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <Button
            variant="primary"
            onClick={() => {
              // "Schedule Post" / "Publish" action
              alert(`Post "${post.title}" would now be sent to ${post.platform}.`);
            }}
          >
            <Send className="h-3.5 w-3.5" />
            {post.status === 'published' ? 'Re-post' : 'Schedule Post'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Meta row */}
        <div className="flex items-center gap-3 flex-wrap">
          <Badge tone={platformTone[post.platform]} dot><PlatIcon className="h-3 w-3" />{post.platform}</Badge>
          <Badge tone={post.status === 'published' ? 'success' : post.status === 'scheduled' ? 'cyan' : 'default'} dot>
            {post.status}
          </Badge>
          <span className="text-2xs text-text-tertiary font-mono">{post.date} · {post.time}</span>
        </div>

        {/* Body */}
        <div>
          <div className="flex items-center gap-1.5 text-2xs uppercase tracking-wider text-text-tertiary mb-1.5">
            <FileText className="h-3 w-3" /> Body
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
            <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">{post.body}</p>
          </div>
        </div>

        {/* Hashtags */}
        {post.hashtags.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-2xs uppercase tracking-wider text-text-tertiary mb-1.5">
              <Hash className="h-3 w-3" /> Hashtags
            </div>
            <div className="flex flex-wrap gap-1.5">
              {post.hashtags.map((h) => (
                <Badge key={h} tone="cyan" className="text-xs">#{h}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Slides */}
        {post.slides.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-2xs uppercase tracking-wider text-text-tertiary mb-1.5">
              <ImageIcon className="h-3 w-3" /> Slides ({post.slides.length})
            </div>
            <div className="grid grid-cols-2 gap-2">
              {post.slides.map((s, idx) => (
                <div key={s.index} className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2 relative group">
                  <div className={cn('h-20 rounded bg-gradient-to-br', s.gradient)} />
                  <div className="mt-1.5 text-2xs font-mono text-text-tertiary">Slide {idx + 1}</div>
                  <div className="text-xs text-text-primary mt-0.5 line-clamp-2">{s.title}</div>
                  <button
                    onClick={() => downloadSlide(s, idx)}
                    className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-md bg-bg-elevated/80 backdrop-blur-sm text-text-tertiary hover:text-accent-cyan hover:bg-bg-elevated transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                    title="Download slide as PNG"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Author + created */}
        <div className="flex items-center justify-between text-2xs text-text-tertiary pt-2 border-t border-white/[0.06]">
          <span>By <span className="font-mono text-text-primary">{post.author}</span></span>
          <span>Created {fmtDate(post.createdAt)}</span>
        </div>
      </div>
    </Modal>
  );
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(' ');
  let line = '';
  let yy = y;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, yy);
      line = words[n] + ' ';
      yy += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, yy);
}

// ─── Ideas View ─────────────────────────────────────────────────────
function IdeasView({ onSelectIdea }: { onSelectIdea: (idea: IdeaCard) => void }) {
  const { data, isLoading } = useQuery({ queryKey: ['ideas'], queryFn: api.ideas });
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {isLoading ? Array.from({length:6}).map((_,i) => <Skeleton key={i} className="h-48" />) :
        data?.ideas.map((idea) => (
          <Card key={idea.id} innerGlow hoverable>
            <div className="p-4 flex flex-col h-full">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-medium text-text-primary flex-1">{idea.title}</h3>
                <span className="font-mono text-2xs text-accent-cyan ml-2">{idea.score}</span>
              </div>
              <p className="text-xs text-text-secondary line-clamp-3 mb-3">{idea.description}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {idea.sources.map((s) => {
                  const meta = sourceIcon[s];
                  const Icon = meta.icon;
                  return (
                    <Badge key={s} tone={meta.tone} className="text-[10px]">
                      <Icon className="h-2.5 w-2.5" /> {meta.label}
                    </Badge>
                  );
                })}
              </div>
              <div className="mt-auto flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => onSelectIdea(idea)}
                >
                  <FileText className="h-3.5 w-3.5" /> Details
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  className="flex-1"
                  onClick={() => onSelectIdea(idea)}
                >
                  Use in Post
                </Button>
              </div>
            </div>
          </Card>
        ))
      }
    </div>
  );
}

// ─── Idea Detail Modal ──────────────────────────────────────────────
function IdeaDetailModal({
  idea, onClose, onUseInPost,
}: { idea: IdeaCard | null; onClose: () => void; onUseInPost: (idea: IdeaCard) => void }) {
  if (!idea) return null;

  return (
    <Modal
      open={!!idea}
      onClose={onClose}
      title={idea.title}
      description={`Score: ${idea.score} · Sources: ${idea.sources.length}`}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <Button variant="primary" onClick={() => onUseInPost(idea)}>
            <Send className="h-3.5 w-3.5" /> Use in Post
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Sources badges */}
        <div className="flex flex-wrap gap-1.5">
          {idea.sources.map((s) => {
            const meta = sourceIcon[s];
            const Icon = meta.icon;
            return (
              <Badge key={s} tone={meta.tone} className="text-xs">
                <Icon className="h-2.5 w-2.5" /> {meta.label}
              </Badge>
            );
          })}
          <Badge tone="violet" className="text-xs font-mono ml-auto">score {idea.score}</Badge>
        </div>

        {/* Short description */}
        <div>
          <div className="flex items-center gap-1.5 text-2xs uppercase tracking-wider text-text-tertiary mb-1.5">
            <FileText className="h-3 w-3" /> Description
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
            <p className="text-sm text-text-primary leading-relaxed">{idea.description}</p>
          </div>
        </div>

        {/* Angle */}
        <div>
          <div className="flex items-center gap-1.5 text-2xs uppercase tracking-wider text-text-tertiary mb-1.5">
            <Sparkles className="h-3 w-3" /> The angle
          </div>
          <div className="rounded-lg border border-accent-cyan/20 bg-accent-cyan/[0.04] p-3">
            <p className="text-sm text-text-primary leading-relaxed italic">"{idea.angle}"</p>
          </div>
        </div>

        {/* Outline */}
        <div>
          <div className="flex items-center gap-1.5 text-2xs uppercase tracking-wider text-text-tertiary mb-1.5">
            <ListChecks className="h-3 w-3" /> Post outline ({idea.outline.length} points)
          </div>
          <ol className="space-y-1.5">
            {idea.outline.map((point, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 rounded-md border border-white/[0.06] bg-white/[0.02] p-2.5"
              >
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent-cyan/15 font-mono text-2xs text-accent-cyan">
                  {i + 1}
                </span>
                <span className="text-sm text-text-primary leading-relaxed">{point}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Hashtags + slide count */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-2xs uppercase tracking-wider text-text-tertiary mb-1.5">
              <Hash className="h-3 w-3" /> Suggested hashtags
            </div>
            <div className="flex flex-wrap gap-1.5">
              {idea.suggestedHashtags.map((h) => (
                <Badge key={h} tone="cyan" className="text-xs">#{h}</Badge>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-2xs uppercase tracking-wider text-text-tertiary mb-1.5">
              <ImageIcon className="h-3 w-3" /> Suggested slides
            </div>
            <div className="flex h-9 items-center justify-center rounded-md border border-white/[0.06] bg-white/[0.02] font-mono text-sm text-text-primary">
              {idea.suggestedSlideCount} slides
            </div>
          </div>
        </div>

        {/* References */}
        {idea.references.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-2xs uppercase tracking-wider text-text-tertiary mb-1.5">
              <FileText className="h-3 w-3" /> References
            </div>
            <div className="space-y-1.5">
              {idea.references.map((ref, i) => (
                <a
                  key={i}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-md border border-white/[0.06] bg-white/[0.02] p-2.5 hover:border-cyan-400/30 hover:bg-white/[0.05] transition-colors group"
                >
                  <span className="text-sm text-text-primary">{ref.title}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-text-tertiary group-hover:text-accent-cyan transition-colors" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── Carousel View ──────────────────────────────────────────────────
function CarouselView({ onSelectPost }: { onSelectPost: (p: CalendarItem) => void }) {
  const [topic, setTopic] = useState('5 underrated dev tools that 10x\'d my productivity in 2026');
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [tone, setTone] = useState('Concise');
  const [slideCount, setSlideCount] = useState(5);
  const [slides, setSlides] = useState<CarouselSlide[]>([
    { index: 0, title: 'Hook', body: '5 dev tools that 10x\'d my productivity.', gradient: 'from-cyan-500/20 to-violet-500/20' },
    { index: 1, title: 'Problem', body: 'Default stacks are 80% noise. Here\'s the 20% that matters.', gradient: 'from-violet-500/20 to-magenta-500/20' },
    { index: 2, title: 'Tool 1: Inngest', body: 'Durable functions for agent workflows.', gradient: 'from-magenta-500/20 to-rose-500/20' },
    { index: 3, title: 'Tool 2: SQLite + Litestream', body: 'Embedded DB with S3 replication.', gradient: 'from-rose-500/20 to-amber-500/20' },
    { index: 4, title: 'CTA', body: 'Full breakdown in the comments.', gradient: 'from-amber-500/20 to-cyan-500/20' },
  ]);
  const [hashtags, setHashtags] = useState(['DevTools', 'Productivity', 'AIEngineering']);
  const [newTag, setNewTag] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // Measure the left card's height and apply it to the right card
  const leftCardRef = useRef<HTMLDivElement>(null);
  const rightCardRef = useRef<HTMLDivElement>(null);
  const [rightCardHeight, setRightCardHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const measure = () => {
      if (leftCardRef.current) {
        setRightCardHeight(leftCardRef.current.offsetHeight);
      }
    };
    measure();
    // Re-measure when the window resizes or content changes
    window.addEventListener('resize', measure);
    // Use a ResizeObserver to re-measure when the left card's content changes
    const ro = new ResizeObserver(measure);
    if (leftCardRef.current) ro.observe(leftCardRef.current);
    return () => {
      window.removeEventListener('resize', measure);
      ro.disconnect();
    };
  }, [slides.length, hashtags.length]);

  const gradients = [
    'from-cyan-500/20 to-violet-500/20',
    'from-violet-500/20 to-magenta-500/20',
    'from-magenta-500/20 to-rose-500/20',
    'from-rose-500/20 to-amber-500/20',
    'from-amber-500/20 to-cyan-500/20',
    'from-cyan-500/20 to-blue-500/20',
    'from-violet-500/20 to-rose-500/20',
    'from-magenta-500/20 to-rose-500/20',
  ];

  const generate = () => {
    // Simulate generating slides for the topic
    const templates = [
      { title: 'Hook', body: topic },
      { title: 'The Problem', body: 'Default stacks are 80% noise. Here\'s what actually works.' },
      { title: 'Insight #1', body: 'Inngest for durable agent workflows. No more cron drift.' },
      { title: 'Insight #2', body: 'SQLite + Litestream. Embedded DB with S3 replication.' },
      { title: 'Insight #3', body: 'tmux + custom CLI. Agents spawn parallel sessions.' },
      { title: 'Insight #4', body: 'Bun runtime. 3x faster than Node, drops in cleanly.' },
      { title: 'CTA', body: 'Full breakdown in the comments. What\'s in your stack?' },
    ];
    const generated: CarouselSlide[] = templates.slice(0, slideCount).map((t, i) => ({
      index: i,
      title: t.title,
      body: t.body,
      gradient: gradients[i % gradients.length],
    }));
    setSlides(generated);
  };

  const downloadSlide = (slide: CarouselSlide, idx: number) => {
    // Reuse the download function from PostDetailModal via a similar implementation
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
    grad.addColorStop(0, '#0a0e17');
    grad.addColorStop(1, '#1a0e2e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(60, 980);
    ctx.lineTo(1020, 980);
    ctx.stroke();
    ctx.fillStyle = '#06b6d4';
    ctx.font = 'bold 56px sans-serif';
    ctx.fillText(`Slide ${idx + 1}`, 60, 120);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 72px sans-serif';
    wrapText(ctx, slide.title, 60, 280, 960, 84);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '32px sans-serif';
    wrapText(ctx, slide.body, 60, 460, 960, 44);
    ctx.fillStyle = '#8b5cf6';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('ArkiloStudios Mission Control', 60, 1020);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `carousel-slide-${idx + 1}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  const addTag = () => {
    const t = newTag.trim().replace(/^#/, '');
    if (t && !hashtags.includes(t)) setHashtags([...hashtags, t]);
    setNewTag('');
  };

  const removeTag = (tag: string) => setHashtags(hashtags.filter((h) => h !== tag));

  const schedulePost = () => {
    if (slides.length === 0) return;
    setIsPosting(true);
    // Simulate posting
    setTimeout(() => {
      setIsPosting(false);
      alert(`Carousel scheduled to ${platform}! ${slides.length} slides will be published.`);
      onSelectPost({
        id: `p-${Date.now()}`,
        date: '2026-06-08',
        time: '12:00',
        platform,
        title: topic.slice(0, 60),
        snippet: slides[0]?.body ?? '',
        body: topic,
        hashtags,
        slides,
        author: 'mkt-content',
        status: 'scheduled',
        createdAt: new Date().toISOString(),
      });
    }, 800);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
      {/* LEFT: Input — stays at its natural compact height */}
      <div ref={leftCardRef}>
        <Card innerGlow className="self-start">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent-cyan" />
            <CardTitle>Generate</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2.5">
          <div>
            <label className="text-2xs uppercase tracking-wider text-text-tertiary">Topic</label>
            <textarea
              rows={2}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Topic, key points, or paste a source article…"
              className="mt-1 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] p-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-cyan-400/50 focus:outline-none resize-none"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-2xs uppercase tracking-wider text-text-tertiary">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                  paddingRight: '28px',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                }}
                className="mt-1 w-full h-9 px-2 rounded-md border border-white/[0.08] bg-bg-elevated text-sm text-text-primary focus:border-cyan-400/50 focus:outline-none cursor-pointer"
              >
                <option value="instagram">Instagram</option>
                <option value="linkedin">LinkedIn</option>
                <option value="twitter">X / Twitter</option>
                <option value="tiktok">TikTok</option>
              </select>
            </div>
            <div>
              <label className="text-2xs uppercase tracking-wider text-text-tertiary">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                  paddingRight: '28px',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                }}
                className="mt-1 w-full h-9 px-2 rounded-md border border-white/[0.08] bg-bg-elevated text-sm text-text-primary focus:border-cyan-400/50 focus:outline-none cursor-pointer"
              >
                <option>Concise</option>
                <option>Technical</option>
                <option>Noir</option>
                <option>Hype</option>
              </select>
            </div>
            <div>
              <label className="text-2xs uppercase tracking-wider text-text-tertiary">Slides</label>
              <select
                value={slideCount}
                onChange={(e) => setSlideCount(Number(e.target.value))}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                  paddingRight: '28px',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                }}
                className="mt-1 w-full h-9 px-2 rounded-md border border-white/[0.08] bg-bg-elevated text-sm text-text-primary focus:border-cyan-400/50 focus:outline-none cursor-pointer"
              >
                {[3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <Button variant="primary" className="w-full" onClick={generate}>
            <Sparkles className="h-3.5 w-3.5" /> Generate Carousel
          </Button>

          {/* Hashtags editor — sits right under the button */}
          <div className="border-t border-white/[0.06] pt-2.5">
            <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-1.5">Hashtags</div>
            <div className="flex flex-wrap gap-1 mb-1.5">
              {hashtags.map((h) => (
                <Badge key={h} tone="cyan" className="text-xs flex items-center gap-1">
                  #{h}
                  <button onClick={() => removeTag(h)} className="cursor-pointer">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-1.5">
              <input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add hashtag…"
                className="flex-1 h-8 px-2 rounded-md border border-white/[0.08] bg-white/[0.04] text-xs text-text-primary placeholder:text-text-tertiary focus:border-cyan-400/50 focus:outline-none"
              />
              <Button size="sm" variant="secondary" onClick={addTag}>Add</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>

      {/* RIGHT: Slides preview with scroll — matches left card height, internal scroll */}
      <div ref={rightCardRef} style={rightCardHeight ? { height: rightCardHeight } : undefined}>
        <Card innerGlow className="flex flex-col overflow-hidden h-full">
          <CardHeader className="flex-shrink-0">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-accent-violet" />
            <CardTitle>Preview</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="cyan">{slides.length} slides</Badge>
            <Button size="sm" variant="primary" onClick={schedulePost} disabled={isPosting || slides.length === 0}>
              {isPosting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              {isPosting ? 'Posting…' : 'Schedule Post'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto scrollbar-hide pr-1 min-h-0">
          <div className="space-y-2">
            {slides.map((s, idx) => (
              <div key={`${s.index}-${idx}`} className="rounded-md border border-white/[0.06] bg-white/[0.02] p-3 relative group">
                <div className={cn('h-24 rounded bg-gradient-to-br', s.gradient)} />
                <div className="mt-2 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="text-2xs font-mono text-text-tertiary">Slide {idx + 1}</div>
                    <div className="text-sm text-text-primary mt-0.5 font-medium truncate">{s.title}</div>
                    <div className="text-2xs text-text-tertiary line-clamp-2 mt-0.5">{s.body}</div>
                  </div>
                  <button
                    onClick={() => downloadSlide(s, idx)}
                    className="ml-2 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border border-white/[0.08] bg-bg-elevated text-text-tertiary hover:text-accent-cyan hover:border-cyan-400/30 transition-colors cursor-pointer"
                    title="Download slide as PNG"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

// ─── Queue View ─────────────────────────────────────────────────────
function QueueView({ onSelectPost }: { onSelectPost: (p: CalendarItem) => void }) {
  const { data, isLoading } = useQuery({ queryKey: ['queue'], queryFn: api.posterQueue });
  return (
    <Card innerGlow>
      <CardContent className="p-0">
        {isLoading ? <Skeleton className="h-64" /> : (
          <table className="w-full text-sm">
            <thead className="text-2xs uppercase tracking-wider text-text-tertiary border-b border-white/5">
              <tr>
                <th className="text-left p-3">Platform</th>
                <th className="text-left p-3">Title</th>
                <th className="text-left p-3">Scheduled</th>
                <th className="text-left p-3">Status</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((q) => (
                <tr
                  key={q.id}
                  onClick={() => onSelectPost({
                    id: q.id,
                    date: q.scheduledAt.slice(0, 10),
                    time: q.scheduledAt.slice(11, 16),
                    platform: q.platform,
                    title: q.title,
                    snippet: q.preview,
                    body: q.preview,
                    hashtags: [],
                    slides: [],
                    author: 'mkt-content',
                    status: (q.status === 'queued' || q.status === 'ready' || q.status === 'publishing'
                      ? 'scheduled'
                      : q.status === 'failed' ? 'draft'
                      : 'scheduled') as 'draft' | 'scheduled' | 'published',
                    createdAt: q.scheduledAt,
                  })}
                  className="border-b border-white/5 hover:bg-white/5 cursor-pointer"
                >
                  <td className="p-3">
                    <Badge tone={platformTone[q.platform] ?? 'default'} className="font-mono text-[10px]">
                      {q.platform}
                    </Badge>
                  </td>
                  <td className="p-3 text-text-primary">{q.title}</td>
                  <td className="p-3 font-mono text-2xs text-text-secondary">{q.scheduledAt.slice(0, 16).replace('T', ' ')}</td>
                  <td className="p-3">
                    <Badge tone={q.status === 'published' ? 'success' : q.status === 'failed' ? 'danger' : q.status === 'publishing' ? 'cyan' : 'default'} dot>
                      {q.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); }}>Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Style Lab View ─────────────────────────────────────────────────
function StyleLabView({ personality, setPersonality }: { personality: PersonalityTone; setPersonality: (p: PersonalityTone) => void }) {
  const { data } = useQuery({ queryKey: ['personalities'], queryFn: api.personalities });
  const active = data?.find((p) => p.id === personality) ?? data?.[0];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {data?.map((p) => {
          const Icon = (LucideIcons as any)[p.icon] || Sparkles;
          const isActive = personality === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setPersonality(p.id)}
              className={cn(
                'rounded-xl border p-3 text-left transition-all duration-200 ease-out-expo cursor-pointer',
                isActive
                  ? 'border-cyan-400 bg-cyan-500/10 shadow-glow-cyan'
                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:-translate-y-0.5'
              )}
            >
              <Icon className={cn('h-5 w-5 mb-2', isActive ? 'text-accent-cyan' : 'text-text-secondary')} />
              <div className="text-sm font-medium text-text-primary">{p.name}</div>
              <p className="text-2xs text-text-tertiary mt-0.5 line-clamp-2">{p.description}</p>
            </button>
          );
        })}
      </div>

      {active && (
        <Card innerGlow>
          <CardHeader>
            <CardTitle>Preview · {active.name}</CardTitle>
            <Badge tone="cyan">active</Badge>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-white/5 bg-white/5 p-4">
              <p className="text-sm text-text-primary italic">"{active.preview}"</p>
            </div>
            <p className="text-2xs text-text-tertiary mt-3">All content generated by agents will be styled in this tone.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function StudioPage() {
  return <ClientShell><StudioContent /></ClientShell>;
}
