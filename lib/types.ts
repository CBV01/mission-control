// Domain types for Hermes Mission Control.
// All shapes match the /api/* endpoint contracts in prompt.md section 6.

export type AgentStatus = 'idle' | 'working' | 'offline';
export type PipelineStatus = 'idle' | 'running' | 'completed' | 'failed';
export type TaskStatus = 'ready' | 'in_progress' | 'completed' | 'blocked';
export type TaskPriority = 0 | 1 | 2;
export type LogStatus = 'completed' | 'failed' | 'timeout' | 'pending';
export type CronStatus = 'ok' | 'error' | 'paused';
export type PostStatus = 'draft' | 'scheduled' | 'published';
export type Platform = 'telegram' | 'discord' | 'slack' | 'instagram' | 'linkedin' | 'tiktok' | 'twitter';
export type PersonalityTone =
  | 'kawaii' | 'noir' | 'hype' | 'surfer' | 'pirate'
  | 'shakespeare' | 'technical' | 'concise' | 'teacher' | 'uwu' | 'philosopher';

// ─── HEALTH ─────────────────────────────────────────────────────────
export interface HealthResponse {
  gateway: {
    pid: number;
    uptime: number;          // seconds
    state: 'running' | 'stopped' | 'restarting';
    memoryMb: number;
    restartCount: number;
    memoryHistory: number[]; // MB over last 24 samples
  };
  vps: {
    cpu: { cores: number; load1: number; load5: number; load15: number; history: number[] };
    ram: { used: number; total: number; pct: number };
    disk: { used: number; total: number; pct: number };
    network: { bytesIn: number; bytesOut: number };
    uptime: number;          // seconds
  };
  platforms: {
    telegram: { state: 'connected' | 'disconnected'; lastMessageAt: string | null; chatId: string };
    discord: { state: 'connected' | 'disconnected'; guild: string; channels: number; latencyMs: number; lastError: string | null; latencyHistory: number[] };
  };
  model: { primary: string; provider: string; fallback: string; callHistory: number[] };
  credits: { used: number; remaining: number; limit: number; dailyUsed: number; dailyHistory: { date: string; amount: number }[] };
}

// ─── AGENTS ─────────────────────────────────────────────────────────
export interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  model: string;
  lastActive: string;       // ISO
  tasksToday: number;
  successRate: number;       // 0..1
  avgDurationMs: number;
  avgCreditsPerTask: number;
  description: string;
}

export interface Domain {
  id: string;
  name: string;
  icon: string;             // lucide icon name
  description: string;
  agents: Agent[];
}

export interface AgentsResponse {
  domains: Domain[];
}

// ─── PIPELINES ──────────────────────────────────────────────────────
export interface PipelineStep {
  id: string;
  name: string;
  description: string;
  status: 'completed' | 'active' | 'pending' | 'failed';
  input?: string;
  output?: string;
  error?: string;
  startedAt?: string;
  finishedAt?: string;
}

export interface Pipeline {
  id: string;
  domain: string;
  name: string;
  subtitle: string;
  status: PipelineStatus;
  steps: PipelineStep[];
  progress: number;         // 0..100
  lastRun: string | null;
  lastDurationMs: number | null;
  lastResult: 'success' | 'failure' | null;
}

export interface PipelinesResponse {
  pipelines: Pipeline[];
}

// ─── KANBAN ─────────────────────────────────────────────────────────
export interface KanbanTask {
  id: string;
  title: string;
  body: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  workspace: string;
  createdAt: string;        // ISO
  tags: string[];
}

export interface KanbanResponse {
  tasks: KanbanTask[];
}

// ─── LOGS ───────────────────────────────────────────────────────────
export interface LogEntry {
  id: string;
  timestamp: string;
  agent: string;
  task: string;
  model: string;
  status: LogStatus;
  credits: number;
  durationMs: number;
  tokensIn: number;
  tokensOut: number;
  error?: string;
}

export interface LogsResponse {
  logs: LogEntry[];
}

// ─── CRON ───────────────────────────────────────────────────────────
export interface CronJob {
  id: string;
  name: string;
  schedule: string;         // human-readable
  cron: string;             // machine
  lastRun: string | null;
  nextRun: string;
  status: CronStatus;
  lastError: string | null;
  enabled: boolean;
  description: string;
  agent: string;            // which agent runs the job
  runHistory: { ts: string; durationMs: number; status: CronStatus }[]; // last 10 runs
  avgDurationMs: number;
  successRate: number;      // 0..1
  owner: string;            // who created it
  tags: string[];
}

export interface CronResponse {
  jobs: CronJob[];
}

// ─── CREDITS / ANALYTICS ────────────────────────────────────────────
export interface CreditByModel { model: string; amount: number; pct: number; }

export interface CreditsResponse {
  totalUsed: number;
  remaining: number;
  limit: number;
  dailyUsed: number;
  dailyHistory: { date: string; amount: number }[];
  byModel: CreditByModel[];
  fallbackTriggerLog: { timestamp: string; model: string; reason: string }[];
  emptyResponseIncidents: { timestamp: string; agent: string; task: string }[];
}

export interface AgentLeaderboardEntry {
  agent: string;
  tasks: number;
  successRate: number;
  avgCredits: number;
  trend: number;            // % change
}

export interface TokenUsage {
  date: string;
  tokens: number;
  agent: string;
}

// ─── SKILLS ─────────────────────────────────────────────────────────
export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  installed: boolean;
  active: boolean;
  icon: string;             // lucide name
}

export interface SkillsResponse {
  skills: Skill[];
  totalActive: number;
}

// ─── STUDIO ─────────────────────────────────────────────────────────
export interface CarouselSlide {
  index: number;
  title: string;
  body: string;
  gradient: string;         // e.g. "from-cyan-500/20 to-violet-500/20"
}

export interface CalendarItem {
  id: string;
  date: string;             // YYYY-MM-DD
  time: string;             // HH:MM
  platform: Platform;
  title: string;
  snippet: string;
  status: PostStatus;
  body: string;             // full post body
  hashtags: string[];
  slides: CarouselSlide[];
  author: string;
  createdAt: string;
}

export interface StudioCalendarResponse { items: CalendarItem[]; }

export interface IdeaCard {
  id: string;
  title: string;
  description: string;
  sources: ('trending' | 'keywords' | 'pain' | 'viral')[];
  score: number;            // 0..100
  angle: string;            // the unique hook/angle for this idea
  outline: string[];         // bullet points for the post outline
  suggestedHashtags: string[];
  suggestedSlideCount: number;
  references: { title: string; url: string }[];
}

export interface StudioIdeasResponse { ideas: IdeaCard[]; }

export interface MediaAsset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  sizeKb: number;
  createdAt: string;
  tags: string[];
}

export interface MediaLibraryResponse { assets: MediaAsset[]; }

export interface PosterQueueItem {
  id: string;
  platform: Platform;
  title: string;
  scheduledAt: string;
  status: 'queued' | 'ready' | 'publishing' | 'published' | 'failed';
  preview: string;
}

export interface PosterQueueResponse { items: PosterQueueItem[]; }

export interface Personality {
  id: PersonalityTone;
  name: string;
  description: string;
  icon: string;
  preview: string;
}

// ─── MEMORY ─────────────────────────────────────────────────────────
export interface ObsidianNote {
  id: string;
  path: string;
  title: string;
  folder: string;
  modified: string;
  tags: string[];
  preview: string;
  backlinks: number;
  links: string[];        // IDs of other notes this one links to via [[wikilink]]
}

export interface MemoryResponse { notes: ObsidianNote[]; }

// ─── NOTIFICATIONS ──────────────────────────────────────────────────
export type NotificationLevel = 'info' | 'success' | 'warning' | 'error';
export interface AppNotification {
  id: string;
  level: NotificationLevel;
  title: string;
  body: string;
  source: string;        // e.g. 'outreach-emailer', 'cron', 'studio'
  timestamp: string;
  read: boolean;
  href?: string;         // optional link to relevant page
}

export interface NotificationsResponse { items: AppNotification[]; }

// ─── SETTINGS ───────────────────────────────────────────────────────
export interface ModelConfig {
  primary: string;
  provider: string;
  baseUrl: string;
  fallbacks: string[];
  apiKeyMasked: string;
  retry: number;
}

export interface AppearanceConfig {
  theme: 'dark' | 'midnight' | 'cyber';
  density: 'comfortable' | 'compact';
  animations: boolean;
  fontScale: number;        // 0.8..1.2
  sidebarCollapsed: boolean;
}

export interface IntegrationsConfig {
  discord: { enabled: boolean; webhook: string };
  telegram: { enabled: boolean; botToken: string };
  slack: { enabled: boolean; webhook: string };
  whatsapp: { enabled: boolean };
  vapi: { enabled: boolean; apiKey: string };
}

export interface SystemConfig {
  cliPath: string;
  updateChannel: 'stable' | 'beta';
}

// ─── CHAT ───────────────────────────────────────────────────────────
export type ChatRole = 'user' | 'assistant' | 'system' | 'tool';
export type ChatTarget = 'orchestrator' | 'outreach' | 'marketing' | 'content' | 'analytics' | 'support' | 'memory';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  target: ChatTarget;
  content: string;
  timestamp: string;     // ISO
  status?: 'sending' | 'streaming' | 'done' | 'error';
  toolCalls?: { name: string; args: string; status: 'pending' | 'running' | 'done' | 'error' }[];
}

export interface TerminalLine {
  id: string;
  timestamp: string;     // ISO
  level: 'info' | 'success' | 'warn' | 'error' | 'debug';
  source: string;        // agent / system / tool name
  message: string;
}
