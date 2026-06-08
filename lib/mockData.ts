import type {
  HealthResponse, AgentsResponse, PipelinesResponse, KanbanResponse,
  LogsResponse, CronResponse, CreditsResponse, AgentLeaderboardEntry,
  TokenUsage, SkillsResponse, StudioCalendarResponse, StudioIdeasResponse,
  MediaLibraryResponse, PosterQueueResponse, Personality, MemoryResponse,
  AppNotification,
} from './types';

// ─── HEALTH ──────────────────────────────────────────────────────
export const mockHealth: HealthResponse = {
  gateway: {
    pid: 48217,
    uptime: 86432,
    state: 'running',
    memoryMb: 248,
    restartCount: 3,
    memoryHistory: [232, 235, 240, 238, 245, 250, 248, 252, 247, 244, 246, 248, 251, 249, 246, 248, 245, 250, 253, 248, 246, 248, 247, 248],
  },
  vps: {
    cpu: {
      cores: 8,
      load1: 0.42,
      load5: 0.58,
      load15: 0.51,
      history: [0.3, 0.4, 0.5, 0.6, 0.45, 0.5, 0.55, 0.42, 0.48, 0.51, 0.42],
    },
    ram: { used: 6.2, total: 16, pct: 0.387 },
    disk: { used: 142, total: 500, pct: 0.284 },
    network: { bytesIn: 1_482_339_220, bytesOut: 842_193_011 },
    uptime: 1_209_443,
  },
  platforms: {
    telegram: {
      state: 'connected',
      lastMessageAt: '2026-06-05T15:48:12Z',
      chatId: '-1001234567890',
    },
    discord: {
      state: 'connected',
      guild: 'Arkilo_Server',
      channels: 28,
      latencyMs: 42,
      lastError: null,
      latencyHistory: [38, 41, 45, 42, 40, 43, 47, 44, 41, 39, 42, 45, 43, 40, 38, 42, 44, 46, 43, 41, 39, 42, 44, 42],
    },
  },
  model: {
    primary: 'stepfun/step-3.7-flash:free',
    provider: 'OpenRouter',
    fallback: 'google/gemini-2.0-flash-exp:free',
    callHistory: [12, 18, 15, 22, 19, 25, 28, 24, 21, 18, 23, 27, 30, 26, 22, 19, 24, 28, 32, 29, 25, 21, 18, 22],
  },
  credits: {
    used: 4.27,
    remaining: 95.73,
    limit: 100,
    dailyUsed: 0.62,
    dailyHistory: [
      { date: '2026-05-23', amount: 0.18 },
      { date: '2026-05-24', amount: 0.42 },
      { date: '2026-05-25', amount: 0.31 },
      { date: '2026-05-26', amount: 0.55 },
      { date: '2026-05-27', amount: 0.28 },
      { date: '2026-05-28', amount: 0.71 },
      { date: '2026-05-29', amount: 0.48 },
      { date: '2026-05-30', amount: 0.39 },
      { date: '2026-05-31', amount: 0.66 },
      { date: '2026-06-01', amount: 0.51 },
      { date: '2026-06-02', amount: 0.44 },
      { date: '2026-06-03', amount: 0.62 },
      { date: '2026-06-04', amount: 0.58 },
      { date: '2026-06-05', amount: 0.62 },
    ],
  },
};

// ─── AGENTS ──────────────────────────────────────────────────────
export const mockAgents: AgentsResponse = {
  domains: [
    {
      id: 'outreach',
      name: 'Outreach',
      icon: 'Send',
      description: 'Lead generation and cold outreach automation',
      agents: [
        { id: 'outreach-scraper', name: 'Lead Scraper', status: 'working', model: 'step-3.7-flash:free', lastActive: '2026-06-05T15:52:14Z', tasksToday: 24, successRate: 0.96, avgDurationMs: 4_200, avgCreditsPerTask: 0.003, description: 'Scrapes Google Maps, LinkedIn, Apollo for ICP-fit leads.' },
        { id: 'outreach-researcher', name: 'Researcher', status: 'idle', model: 'step-3.7-flash:free', lastActive: '2026-06-05T15:48:01Z', tasksToday: 18, successRate: 0.94, avgDurationMs: 6_800, avgCreditsPerTask: 0.005, description: 'Enriches lead data with company intel and contact verification.' },
        { id: 'outreach-emailer', name: 'Emailer', status: 'working', model: 'step-3.7-flash:free', lastActive: '2026-06-05T15:51:42Z', tasksToday: 31, successRate: 0.91, avgDurationMs: 2_100, avgCreditsPerTask: 0.002, description: 'Generates personalized cold emails with A/B variants.' },
        { id: 'outreach-coldcall', name: 'Cold Call', status: 'idle', model: 'step-3.7-flash:free', lastActive: '2026-06-05T14:22:08Z', tasksToday: 7, successRate: 0.78, avgDurationMs: 184_000, avgCreditsPerTask: 0.42, description: 'Initiates Vapi voice calls and logs outcomes.' },
      ],
    },
    {
      id: 'marketing',
      name: 'Marketing',
      icon: 'Megaphone',
      description: 'Content trends, SEO, and social posting',
      agents: [
        { id: 'mkt-trends', name: 'Trends Fetcher', status: 'working', model: 'step-3.7-flash:free', lastActive: '2026-06-05T15:50:30Z', tasksToday: 12, successRate: 0.99, avgDurationMs: 8_400, avgCreditsPerTask: 0.006, description: 'Pulls trending topics from X, Reddit, HackerNews.' },
        { id: 'mkt-seo', name: 'SEO Strategist', status: 'idle', model: 'step-3.7-flash:free', lastActive: '2026-06-05T15:30:12Z', tasksToday: 8, successRate: 0.92, avgDurationMs: 12_400, avgCreditsPerTask: 0.011, description: 'Keyword research and content gap analysis.' },
        { id: 'mkt-content', name: 'Content Creator', status: 'working', model: 'step-3.7-flash:free', lastActive: '2026-06-05T15:52:48Z', tasksToday: 22, successRate: 0.95, avgDurationMs: 18_200, avgCreditsPerTask: 0.018, description: 'Writes posts, threads, carousels in active personality tone.' },
        { id: 'mkt-poster', name: 'Content Poster', status: 'idle', model: 'step-3.7-flash:free', lastActive: '2026-06-05T15:42:01Z', tasksToday: 14, successRate: 0.88, avgDurationMs: 3_200, avgCreditsPerTask: 0.001, description: 'Schedules and publishes to IG, LinkedIn, TikTok, X.' },
      ],
    },
    {
      id: 'seo',
      name: 'SEO',
      icon: 'Search',
      description: 'Site optimization and content quality',
      agents: [
        { id: 'seo-planner', name: 'Research Planner', status: 'idle', model: 'step-3.7-flash:free', lastActive: '2026-06-05T15:20:00Z', tasksToday: 5, successRate: 0.96, avgDurationMs: 22_000, avgCreditsPerTask: 0.022, description: 'Plans keyword clusters and content calendar.' },
        { id: 'seo-keyword', name: 'Keyword Specialist', status: 'working', model: 'step-3.7-flash:free', lastActive: '2026-06-05T15:51:00Z', tasksToday: 9, successRate: 0.97, avgDurationMs: 5_600, avgCreditsPerTask: 0.004, description: 'Discovers long-tail keyword opportunities.' },
        { id: 'seo-opt', name: 'Optimization Agent', status: 'idle', model: 'step-3.7-flash:free', lastActive: '2026-06-05T14:55:00Z', tasksToday: 4, successRate: 0.93, avgDurationMs: 14_200, avgCreditsPerTask: 0.013, description: 'On-page SEO: meta, headers, schema, internal links.' },
        { id: 'seo-qc', name: 'Quality Control', status: 'working', model: 'step-3.7-flash:free', lastActive: '2026-06-05T15:52:30Z', tasksToday: 11, successRate: 0.94, avgDurationMs: 7_800, avgCreditsPerTask: 0.007, description: 'Reviews content for quality, originality, and SEO fit.' },
      ],
    },
    {
      id: 'iptv',
      name: 'IPTV',
      icon: 'Tv',
      description: 'Community automation for streaming services',
      agents: [
        { id: 'iptv-finder', name: 'Group Finder', status: 'working', model: 'step-3.7-flash:free', lastActive: '2026-06-05T15:50:00Z', tasksToday: 16, successRate: 0.86, avgDurationMs: 9_400, avgCreditsPerTask: 0.008, description: 'Discovers and evaluates target groups.' },
        { id: 'iptv-joiner', name: 'Group Joiner', status: 'idle', model: 'step-3.7-flash:free', lastActive: '2026-06-05T13:10:00Z', tasksToday: 3, successRate: 0.67, avgDurationMs: 32_000, avgCreditsPerTask: 0.024, description: 'Joins groups and warms up accounts.' },
        { id: 'iptv-poster', name: 'Auto Poster', status: 'idle', model: 'step-3.7-flash:free', lastActive: '2026-06-05T12:00:00Z', tasksToday: 0, successRate: 0, avgDurationMs: 0, avgCreditsPerTask: 0, description: 'Posts promotional content per rotation schedule.' },
      ],
    },
    {
      id: 'ads',
      name: 'Ads / Meta',
      icon: 'Target',
      description: 'Paid acquisition on Meta platforms',
      agents: [
        { id: 'ads-strategist', name: 'Strategist', status: 'idle', model: 'step-3.7-flash:free', lastActive: '2026-06-05T15:00:00Z', tasksToday: 6, successRate: 0.95, avgDurationMs: 28_000, avgCreditsPerTask: 0.026, description: 'Plans campaigns, audiences, and budgets.' },
        { id: 'ads-creative', name: 'Creative', status: 'working', model: 'step-3.7-flash:free', lastActive: '2026-06-05T15:48:00Z', tasksToday: 14, successRate: 0.92, avgDurationMs: 22_000, avgCreditsPerTask: 0.021, description: 'Generates ad copy and creative briefs.' },
        { id: 'ads-campaign', name: 'Campaign Manager', status: 'idle', model: 'step-3.7-flash:free', lastActive: '2026-06-05T15:30:00Z', tasksToday: 4, successRate: 0.97, avgDurationMs: 14_000, avgCreditsPerTask: 0.012, description: 'Launches and monitors ad sets.' },
        { id: 'ads-opt', name: 'Optimization', status: 'working', model: 'step-3.7-flash:free', lastActive: '2026-06-05T15:50:00Z', tasksToday: 9, successRate: 0.94, avgDurationMs: 8_400, avgCreditsPerTask: 0.008, description: 'Adjusts bids, audiences, and creative based on performance.' },
        { id: 'ads-analytics', name: 'Analytics', status: 'idle', model: 'step-3.7-flash:free', lastActive: '2026-06-05T14:50:00Z', tasksToday: 5, successRate: 0.99, avgDurationMs: 6_200, avgCreditsPerTask: 0.005, description: 'Pulls daily ROAS, CPA, and trend data.' },
        { id: 'ads-auto', name: 'Automation', status: 'idle', model: 'step-3.7-flash:free', lastActive: '2026-06-05T13:00:00Z', tasksToday: 0, successRate: 0, avgDurationMs: 0, avgCreditsPerTask: 0, description: 'Executes pre-approved rules (pause, scale, rotate).' },
      ],
    },
    {
      id: 'dev',
      name: 'Dev',
      icon: 'Code2',
      description: 'Coding, integration, and deployment',
      agents: [
        { id: 'dev-coding', name: 'Coding Agent', status: 'working', model: 'step-3.7-flash:free', lastActive: '2026-06-05T15:51:00Z', tasksToday: 11, successRate: 0.88, avgDurationMs: 42_000, avgCreditsPerTask: 0.038, description: 'Writes and edits code with full project context.' },
        { id: 'dev-integrator', name: 'Integrator', status: 'idle', model: 'step-3.7-flash:free', lastActive: '2026-06-05T15:30:00Z', tasksToday: 4, successRate: 0.92, avgDurationMs: 28_000, avgCreditsPerTask: 0.024, description: 'Wires components and verifies contracts.' },
        { id: 'dev-deploy', name: 'Deployment', status: 'idle', model: 'step-3.7-flash:free', lastActive: '2026-06-05T15:00:00Z', tasksToday: 2, successRate: 0.99, avgDurationMs: 18_000, avgCreditsPerTask: 0.014, description: 'Builds, tests, and ships to staging/prod.' },
      ],
    },
  ],
};

// ─── PIPELINES ───────────────────────────────────────────────────
export const mockPipelines: PipelinesResponse = {
  pipelines: [
    {
      id: 'pipe-outreach',
      domain: 'Outreach',
      name: 'Lead → Enrich → Email → Call',
      subtitle: 'Outreach → Lead Scraper → Researcher → Emailer → Cold Call',
      status: 'running',
      progress: 60,
      lastRun: '2026-06-05T15:48:00Z',
      lastDurationMs: 1_240_000,
      lastResult: 'success',
      steps: [
        { id: 's1', name: 'Lead Scraper', description: 'Scrape Google Maps + LinkedIn for ICP leads', status: 'completed', input: 'config/icp.yaml', output: 'raw_inputs/leads.json', startedAt: '2026-06-05T15:48:00Z', finishedAt: '2026-06-05T15:51:00Z' },
        { id: 's2', name: 'Researcher', description: 'Enrich with company intel and contact verification', status: 'completed', input: 'raw_inputs/leads.json', output: 'processed/enriched_leads.json', startedAt: '2026-06-05T15:51:00Z', finishedAt: '2026-06-05T15:53:00Z' },
        { id: 's3', name: 'Emailer', description: 'Generate personalized email + 2 A/B variants', status: 'active', input: 'processed/enriched_leads.json', output: 'outreach/emails/', startedAt: '2026-06-05T15:53:00Z' },
        { id: 's4', name: 'Cold Call', description: 'Wait 1h, then trigger Vapi call', status: 'pending' },
      ],
    },
    {
      id: 'pipe-seo',
      domain: 'SEO',
      name: 'Research → Optimize → Publish',
      subtitle: 'SEO → Research Planner → Keyword Specialist → Optimization → QC',
      status: 'idle',
      progress: 0,
      lastRun: '2026-06-04T08:00:00Z',
      lastDurationMs: 3_840_000,
      lastResult: 'success',
      steps: [
        { id: 's1', name: 'Research Planner', description: 'Plan keyword clusters and content calendar', status: 'pending' },
        { id: 's2', name: 'Keyword Specialist', description: 'Discover long-tail opportunities', status: 'pending' },
        { id: 's3', name: 'Optimization', description: 'On-page SEO: meta, headers, schema, links', status: 'pending' },
        { id: 's4', name: 'Quality Control', description: 'Review and gate content quality', status: 'pending' },
      ],
    },
    {
      id: 'pipe-content',
      domain: 'Marketing',
      name: 'Trend → Ideate → Create → Schedule',
      subtitle: 'Marketing → Trends → SEO → Content Creator → Poster',
      status: 'completed',
      progress: 100,
      lastRun: '2026-06-05T14:00:00Z',
      lastDurationMs: 1_840_000,
      lastResult: 'success',
      steps: [
        { id: 's1', name: 'Trends Fetcher', description: 'Pull trending topics from X, Reddit, HN', status: 'completed' },
        { id: 's2', name: 'SEO Strategist', description: 'Score trends against keyword data', status: 'completed' },
        { id: 's3', name: 'Content Creator', description: 'Write posts in active personality', status: 'completed' },
        { id: 's4', name: 'Content Poster', description: 'Schedule to IG, LinkedIn, TikTok, X', status: 'completed' },
      ],
    },
    {
      id: 'pipe-ads',
      domain: 'Ads',
      name: 'Strategize → Create → Launch → Optimize',
      subtitle: 'Ads → Strategist → Creative → Campaign Manager → Optimization',
      status: 'failed',
      progress: 50,
      lastRun: '2026-06-05T11:30:00Z',
      lastDurationMs: 480_000,
      lastResult: 'failure',
      steps: [
        { id: 's1', name: 'Strategist', description: 'Plan audiences, budgets, and angles', status: 'completed' },
        { id: 's2', name: 'Creative', description: 'Generate 5 ad variants per audience', status: 'completed' },
        { id: 's3', name: 'Campaign Manager', description: 'Launch ad sets', status: 'failed', error: 'Meta API: insufficient permissions for ad_account_act_manage' },
        { id: 's4', name: 'Optimization', description: 'Monitor and adjust', status: 'pending' },
      ],
    },
  ],
};

// ─── KANBAN ───────────────────────────────────────────────────────
const titles = [
  'Audit current OpenRouter credit usage',
  'Fix Telegram reconnect loop on gateway restart',
  'Write carousel: "5 underrated dev tools 2026"',
  'Research: Top 50 IPTV groups in EU',
  'Implement Kanban priority sorting',
  'Backfill Meta Ads creative briefs Q2',
  'Add Vapi call recording transcription',
  'Patch cron scheduler drift (3s offset)',
  'Test new Gemini Flash model for cold emailer',
  'Rotate Discord bot token (90d policy)',
  'Generate Q3 content calendar draft',
  'Set up Outbox SMTP for transactional mail',
  'Migrate logs DB to Postgres',
  'Build Studio carousel slide exporter',
  'Wire up credit alert at 80% threshold',
  'Add agent failure rate metric to leaderboard',
  'Refactor Skills library filters',
  'Document new Hermes CLI flags',
  'Push Memory/Obsidian integration v2',
  'Reduce IPTV poster rate-limit to 2/min',
  'Add: dark/cyber theme tokens to Tailwind',
  'Onboard Vapi voice cloning to Outreach',
  'Cleanup dead agents (3 offline >30d)',
  'A/B test cold email subject lines',
  'Hook up Sentry to gateway errors',
];

const assignees = [
  'dev-coding', 'outreach-emailer', 'mkt-content', 'iptv-finder',
  'dev-integrator', 'ads-creative', 'outreach-researcher', 'mkt-poster',
  'seo-keyword', 'ads-analytics', 'dev-deploy', 'mkt-trends',
];

const tagsPool = ['urgent', 'follow-up', 'research', 'bug', 'feature', 'chore', 'experimental', 'a11y', 'perf', 'security'];

function makeKanban(): KanbanResponse['tasks'] {
  const statuses: ('ready' | 'in_progress' | 'completed' | 'blocked')[] = ['ready', 'in_progress', 'completed', 'blocked'];
  const weights = [0.5, 0.25, 0.2, 0.05]; // distribution
  const list: KanbanResponse['tasks'] = [];
  for (let i = 0; i < titles.length; i++) {
    const r = Math.random();
    let acc = 0; let status: typeof statuses[number] = 'ready';
    for (let j = 0; j < weights.length; j++) { acc += weights[j]; if (r < acc) { status = statuses[j]; break; } }
    const hoursAgo = Math.floor(Math.random() * 96);
    const created = new Date(Date.now() - hoursAgo * 3600 * 1000).toISOString();
    list.push({
      id: `k${String(i + 1).padStart(3, '0')}`,
      title: titles[i],
      body: `Detailed description for "${titles[i]}". See linked docs and references.`,
      status,
      priority: (Math.floor(Math.random() * 3) as 0 | 1 | 2),
      assignee: assignees[i % assignees.length],
      workspace: 'scratch',
      createdAt: created,
      tags: [tagsPool[Math.floor(Math.random() * tagsPool.length)], tagsPool[(i + 3) % tagsPool.length]].filter((v, idx, arr) => arr.indexOf(v) === idx),
    });
  }
  return list;
}
export const mockKanban: KanbanResponse = { tasks: makeKanban() };

// ─── LOGS ─────────────────────────────────────────────────────────
const logTasks = [
  'Generate cold email for lead #247',
  'Scrape Google Maps: dentists in Austin',
  'Research company intel for Acme Corp',
  'Schedule carousel post: "5 dev tools"',
  'Optimize landing page meta tags',
  'Pull trending topics from HackerNews',
  'Enrich lead with Apollo data',
  'Launch Meta ad set: Lookalike-Aud-1',
  'Score trend vs keyword difficulty',
  'Transcribe Vapi call recording',
  'Run daily health check on VPS',
  'Rotate IPTV group: warm-up phase 2',
  'Generate ad creative variant C',
  'Post to LinkedIn: founder story',
  'Refresh Q3 content calendar',
  'Audit credit spend vs budget',
  'Index new Obsidian note',
  'Run keyword cluster: SaaS pricing',
  'Add agent: code-review-bot',
  'Compress logs older than 30d',
];

function makeLogs(): LogsResponse['logs'] {
  const agents = ['outreach-emailer', 'mkt-content', 'seo-keyword', 'ads-creative', 'dev-coding', 'iptv-finder', 'mkt-trends'];
  const models = ['step-3.7-flash:free', 'gemini-2.0-flash-exp:free', 'llama-3.3-70b:free'];
  const list: LogsResponse['logs'] = [];
  for (let i = 0; i < 80; i++) {
    const minsAgo = i * 3 + Math.floor(Math.random() * 3);
    const ts = new Date(Date.now() - minsAgo * 60 * 1000).toISOString();
    const r = Math.random();
    const status: ('completed' | 'failed' | 'timeout' | 'pending') = r < 0.82 ? 'completed' : r < 0.92 ? 'failed' : r < 0.97 ? 'timeout' : 'pending';
    list.push({
      id: `l${String(i + 1).padStart(4, '0')}`,
      timestamp: ts,
      agent: agents[Math.floor(Math.random() * agents.length)],
      task: logTasks[Math.floor(Math.random() * logTasks.length)],
      model: models[Math.floor(Math.random() * models.length)],
      status,
      credits: Math.round(Math.random() * 80) / 1000,
      durationMs: Math.floor(1000 + Math.random() * 42000),
      tokensIn: Math.floor(200 + Math.random() * 4000),
      tokensOut: Math.floor(100 + Math.random() * 2000),
      error: status === 'failed' ? 'HTTP 429: Rate limit exceeded (10 req/min)' : status === 'timeout' ? 'Gateway timeout after 30s' : undefined,
    });
  }
  return list;
}
export const mockLogs: LogsResponse = { logs: makeLogs() };

// ─── CRON ─────────────────────────────────────────────────────────
export const mockCron: CronResponse = {
  jobs: [
    {
      id: 'c1', name: 'Daily Health Check', schedule: 'Daily at 08:00', cron: '0 8 * * *',
      lastRun: '2026-06-05T08:00:00Z', nextRun: '2026-06-06T08:00:00Z', status: 'ok',
      lastError: null, enabled: true,
      description: 'VPS health snapshot + alert if any threshold breached.',
      agent: 'orchestrator',
      avgDurationMs: 1840,
      successRate: 0.99,
      owner: 'mkt-content',
      tags: ['health', 'monitoring'],
      runHistory: [
        { ts: '2026-06-05T08:00:00Z', durationMs: 1820, status: 'ok' },
        { ts: '2026-06-04T08:00:00Z', durationMs: 1910, status: 'ok' },
        { ts: '2026-06-03T08:00:00Z', durationMs: 1760, status: 'ok' },
        { ts: '2026-06-02T08:00:00Z', durationMs: 1880, status: 'ok' },
        { ts: '2026-06-01T08:00:00Z', durationMs: 1840, status: 'ok' },
        { ts: '2026-05-31T08:00:00Z', durationMs: 1820, status: 'ok' },
        { ts: '2026-05-30T08:00:00Z', durationMs: 1900, status: 'ok' },
      ],
    },
    {
      id: 'c2', name: 'Credit Budget Alert', schedule: 'Hourly', cron: '0 * * * *',
      lastRun: '2026-06-05T15:00:00Z', nextRun: '2026-06-05T16:00:00Z', status: 'ok',
      lastError: null, enabled: true,
      description: 'Check credit usage; alert at 80% / 95%.',
      agent: 'orchestrator',
      avgDurationMs: 240,
      successRate: 1,
      owner: 'mkt-content',
      tags: ['monitoring', 'alerts'],
      runHistory: [
        { ts: '2026-06-05T15:00:00Z', durationMs: 220, status: 'ok' },
        { ts: '2026-06-05T14:00:00Z', durationMs: 250, status: 'ok' },
        { ts: '2026-06-05T13:00:00Z', durationMs: 240, status: 'ok' },
        { ts: '2026-06-05T12:00:00Z', durationMs: 230, status: 'ok' },
        { ts: '2026-06-05T11:00:00Z', durationMs: 260, status: 'ok' },
        { ts: '2026-06-05T10:00:00Z', durationMs: 240, status: 'ok' },
        { ts: '2026-06-05T09:00:00Z', durationMs: 250, status: 'ok' },
      ],
    },
    {
      id: 'c3', name: 'Lead Scraper Sync', schedule: 'Every 4h', cron: '0 */4 * * *',
      lastRun: '2026-06-05T12:00:00Z', nextRun: '2026-06-05T16:00:00Z', status: 'ok',
      lastError: null, enabled: true,
      description: 'Run outreach lead scraper pipeline.',
      agent: 'outreach-scraper',
      avgDurationMs: 12400,
      successRate: 0.94,
      owner: 'outreach-emailer',
      tags: ['outreach', 'leads'],
      runHistory: [
        { ts: '2026-06-05T12:00:00Z', durationMs: 11800, status: 'ok' },
        { ts: '2026-06-05T08:00:00Z', durationMs: 13200, status: 'ok' },
        { ts: '2026-06-05T04:00:00Z', durationMs: 12100, status: 'ok' },
        { ts: '2026-06-05T00:00:00Z', durationMs: 14600, status: 'ok' },
        { ts: '2026-06-04T20:00:00Z', durationMs: 12200, status: 'ok' },
        { ts: '2026-06-04T16:00:00Z', durationMs: 12800, status: 'ok' },
        { ts: '2026-06-04T12:00:00Z', durationMs: 13500, status: 'ok' },
      ],
    },
    {
      id: 'c4', name: 'IPTV Group Warmup', schedule: 'Daily at 03:00', cron: '0 3 * * *',
      lastRun: '2026-06-05T03:00:00Z', nextRun: '2026-06-06T03:00:00Z', status: 'error',
      lastError: 'HTTP 404: No endpoints found for google/gemini-2.0-flash-exp:free', enabled: true,
      description: 'Daily warmup rotation across IPTV group inventory.',
      agent: 'iptv-finder',
      avgDurationMs: 8400,
      successRate: 0.62,
      owner: 'iptv-joiner',
      tags: ['iptv', 'warmup'],
      runHistory: [
        { ts: '2026-06-05T03:00:00Z', durationMs: 0, status: 'error' },
        { ts: '2026-06-04T03:00:00Z', durationMs: 9100, status: 'ok' },
        { ts: '2026-06-03T03:00:00Z', durationMs: 0, status: 'error' },
        { ts: '2026-06-02T03:00:00Z', durationMs: 8200, status: 'ok' },
        { ts: '2026-06-01T03:00:00Z', durationMs: 0, status: 'error' },
        { ts: '2026-05-31T03:00:00Z', durationMs: 8400, status: 'ok' },
        { ts: '2026-05-30T03:00:00Z', durationMs: 0, status: 'error' },
      ],
    },
    {
      id: 'c5', name: 'Content Calendar Refresh', schedule: 'Mondays at 09:00', cron: '0 9 * * 1',
      lastRun: '2026-06-02T09:00:00Z', nextRun: '2026-06-09T09:00:00Z', status: 'ok',
      lastError: null, enabled: true,
      description: 'Regenerate next 2 weeks of content ideas.',
      agent: 'mkt-trends',
      avgDurationMs: 48200,
      successRate: 0.92,
      owner: 'mkt-content',
      tags: ['content', 'planning'],
      runHistory: [
        { ts: '2026-06-02T09:00:00Z', durationMs: 51200, status: 'ok' },
        { ts: '2026-05-26T09:00:00Z', durationMs: 46800, status: 'ok' },
        { ts: '2026-05-19T09:00:00Z', durationMs: 47900, status: 'ok' },
        { ts: '2026-05-12T09:00:00Z', durationMs: 50100, status: 'ok' },
        { ts: '2026-05-05T09:00:00Z', durationMs: 0, status: 'error' },
        { ts: '2026-04-28T09:00:00Z', durationMs: 49200, status: 'ok' },
        { ts: '2026-04-21T09:00:00Z', durationMs: 48100, status: 'ok' },
      ],
    },
    {
      id: 'c6', name: 'Logs Vacuum', schedule: '1st of month at 02:00', cron: '0 2 1 * *',
      lastRun: '2026-06-01T02:00:00Z', nextRun: '2026-07-01T02:00:00Z', status: 'ok',
      lastError: null, enabled: true,
      description: 'Archive + compress logs older than 30d.',
      agent: 'dev-coding',
      avgDurationMs: 184200,
      successRate: 1,
      owner: 'dev-coding',
      tags: ['maintenance'],
      runHistory: [
        { ts: '2026-06-01T02:00:00Z', durationMs: 184200, status: 'ok' },
        { ts: '2026-05-01T02:00:00Z', durationMs: 178900, status: 'ok' },
        { ts: '2026-04-01T02:00:00Z', durationMs: 191400, status: 'ok' },
        { ts: '2026-03-01T02:00:00Z', durationMs: 188100, status: 'ok' },
        { ts: '2026-02-01T02:00:00Z', durationMs: 186700, status: 'ok' },
        { ts: '2026-01-01T02:00:00Z', durationMs: 184800, status: 'ok' },
      ],
    },
    {
      id: 'c7', name: 'Meta Ads Performance', schedule: 'Every 6h', cron: '0 */6 * * *',
      lastRun: '2026-06-05T12:00:00Z', nextRun: '2026-06-05T18:00:00Z', status: 'paused',
      lastError: null, enabled: false,
      description: 'Pull ROAS/CPA and adjust bid strategies.',
      agent: 'ads-analytics',
      avgDurationMs: 6800,
      successRate: 0.96,
      owner: 'ads-creative',
      tags: ['ads', 'analytics'],
      runHistory: [
        { ts: '2026-06-05T12:00:00Z', durationMs: 6800, status: 'ok' },
        { ts: '2026-06-05T06:00:00Z', durationMs: 7100, status: 'ok' },
        { ts: '2026-06-05T00:00:00Z', durationMs: 6900, status: 'ok' },
        { ts: '2026-06-04T18:00:00Z', durationMs: 6700, status: 'ok' },
      ],
    },
    {
      id: 'c8', name: 'Discord Bot Heartbeat', schedule: 'Every 5m', cron: '*/5 * * * *',
      lastRun: '2026-06-05T15:50:00Z', nextRun: '2026-06-05T15:55:00Z', status: 'ok',
      lastError: null, enabled: true,
      description: 'Verify Discord gateway is responsive.',
      agent: 'outreach-emailer',
      avgDurationMs: 320,
      successRate: 0.998,
      owner: 'mkt-content',
      tags: ['heartbeat', 'discord'],
      runHistory: [
        { ts: '2026-06-05T15:50:00Z', durationMs: 310, status: 'ok' },
        { ts: '2026-06-05T15:45:00Z', durationMs: 340, status: 'ok' },
        { ts: '2026-06-05T15:40:00Z', durationMs: 320, status: 'ok' },
        { ts: '2026-06-05T15:35:00Z', durationMs: 310, status: 'ok' },
        { ts: '2026-06-05T15:30:00Z', durationMs: 330, status: 'ok' },
        { ts: '2026-06-05T15:25:00Z', durationMs: 320, status: 'ok' },
        { ts: '2026-06-05T15:20:00Z', durationMs: 340, status: 'ok' },
      ],
    },
  ],
};

// ─── CREDITS / ANALYTICS ─────────────────────────────────────────
export const mockCredits: CreditsResponse = {
  totalUsed: 4.27,
  remaining: 95.73,
  limit: 100,
  dailyUsed: 0.62,
  dailyHistory: mockHealth.credits.dailyHistory,
  byModel: [
    { model: 'stepfun/step-3.7-flash:free', amount: 3.82, pct: 0.895 },
    { model: 'google/gemini-2.0-flash-exp:free', amount: 0.31, pct: 0.073 },
    { model: 'meta-llama/llama-3.3-70b:free', amount: 0.14, pct: 0.033 },
  ],
  fallbackTriggerLog: [
    { timestamp: '2026-06-05T14:22:08Z', model: 'gemini-2.0-flash-exp:free', reason: 'Primary 429 rate-limit' },
    { timestamp: '2026-06-05T11:30:00Z', model: 'gemini-2.0-flash-exp:free', reason: 'Primary model timeout >30s' },
    { timestamp: '2026-06-04T22:14:00Z', model: 'llama-3.3-70b:free', reason: 'Primary + fallback 1 unavailable' },
  ],
  emptyResponseIncidents: [
    { timestamp: '2026-06-05T09:12:00Z', agent: 'outreach-emailer', task: 'Generate cold email variant B' },
    { timestamp: '2026-06-04T18:30:00Z', agent: 'mkt-content', task: 'Score trend relevance' },
  ],
};

export const mockLeaderboard: AgentLeaderboardEntry[] = [
  { agent: 'outreach-emailer', tasks: 31, successRate: 0.91, avgCredits: 0.002, trend: 12 },
  { agent: 'outreach-scraper', tasks: 24, successRate: 0.96, avgCredits: 0.003, trend: 8 },
  { agent: 'mkt-content', tasks: 22, successRate: 0.95, avgCredits: 0.018, trend: -3 },
  { agent: 'ads-creative', tasks: 14, successRate: 0.92, avgCredits: 0.021, trend: 22 },
  { agent: 'mkt-poster', tasks: 14, successRate: 0.88, avgCredits: 0.001, trend: 4 },
  { agent: 'seo-qc', tasks: 11, successRate: 0.94, avgCredits: 0.007, trend: 0 },
  { agent: 'dev-coding', tasks: 11, successRate: 0.88, avgCredits: 0.038, trend: -8 },
  { agent: 'mkt-trends', tasks: 12, successRate: 0.99, avgCredits: 0.006, trend: 15 },
];

export const mockTokenUsage: TokenUsage[] = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(Date.now() - (13 - i) * 86400 * 1000);
  const agents = ['outreach', 'marketing', 'seo', 'ads', 'dev'];
  return agents.map((agent) => ({
    date: d.toISOString().slice(0, 10),
    agent,
    tokens: Math.floor(8000 + Math.random() * 30000 + (i * 1500)),
  }));
}).flat();

// ─── SKILLS ───────────────────────────────────────────────────────
export const mockSkills: SkillsResponse = {
  totalActive: 18,
  skills: [
    { id: 's1', name: 'Autonomous Browser', category: 'Autonomous', description: 'Headless browser for any web task.', installed: true, active: true, icon: 'Globe' },
    { id: 's2', name: 'Image Generation', category: 'Creative', description: 'Generate images from text prompts.', installed: true, active: true, icon: 'Image' },
    { id: 's3', name: 'Video Generation', category: 'Creative', description: 'Text/image to short-form video.', installed: true, active: false, icon: 'Video' },
    { id: 's4', name: 'Data Analyzer', category: 'Data', description: 'Parse CSV/JSON and surface insights.', installed: true, active: true, icon: 'BarChart3' },
    { id: 's5', name: 'Docker Helper', category: 'DevOps', description: 'Manage containers and compose.', installed: true, active: false, icon: 'Container' },
    { id: 's6', name: 'Email Sender', category: 'Email', description: 'SMTP transactional + bulk.', installed: true, active: true, icon: 'Mail' },
    { id: 's7', name: 'Chess Engine', category: 'Gaming', description: 'Play and analyze chess.', installed: false, active: false, icon: 'Crown' },
    { id: 's8', name: 'GitHub Manager', category: 'GitHub', description: 'Issues, PRs, releases.', installed: true, active: true, icon: 'Github' },
    { id: 's9', name: 'MCP Connector', category: 'MCP', description: 'Bridge to MCP servers.', installed: true, active: true, icon: 'Plug' },
    { id: 's10', name: 'Media Transcoder', category: 'Media', description: 'Convert and compress media.', installed: true, active: false, icon: 'Film' },
    { id: 's11', name: 'Model Trainer', category: 'MLOps', description: 'Fine-tune and evaluate models.', installed: true, active: false, icon: 'Brain' },
    { id: 's12', name: 'Note Taker', category: 'Notes', description: 'Capture and structure notes.', installed: true, active: true, icon: 'NotebookPen' },
    { id: 's13', name: 'Task Manager', category: 'Productivity', description: 'GTD-style task management.', installed: true, active: true, icon: 'CheckSquare' },
    { id: 's14', name: 'Deep Researcher', category: 'Research', description: 'Multi-source cited research.', installed: true, active: true, icon: 'Search' },
    { id: 's15', name: 'Home Assistant', category: 'Smart Home', description: 'Smart home control and routines.', installed: false, active: false, icon: 'Home' },
    { id: 's16', name: 'Social Poster', category: 'Social', description: 'IG, LinkedIn, TikTok, X, Threads.', installed: true, active: true, icon: 'Share2' },
    { id: 's17', name: 'Code Runner', category: 'Software', description: 'Sandboxed code execution.', installed: true, active: true, icon: 'Play' },
    { id: 's18', name: 'PDF Parser', category: 'Software', description: 'Extract text and tables from PDFs.', installed: true, active: true, icon: 'FileText' },
  ],
};

// ─── STUDIO ───────────────────────────────────────────────────────
export const mockCalendar: StudioCalendarResponse = {
  items: [
    {
      id: 'p1', date: '2026-06-05', time: '09:00', platform: 'linkedin', title: '5 underrate dev tools 2026',
      snippet: 'A carousel on developer productivity...', status: 'published', author: 'mkt-content',
      createdAt: '2026-06-04T15:00:00Z',
      body: 'After 6 months of running a 6-agent AI team, here are the 5 dev tools that actually moved the needle on my productivity. These are not the usual suspects — no VSCode, no GitHub, no Notion. Instead, tools that 10x specific bottlenecks in agent-driven workflows.',
      hashtags: ['DevTools', 'Productivity', 'AIEngineering', 'HermesOS', 'IndieHacker'],
      slides: [
        { index: 0, title: 'The Setup', body: 'A multi-agent system that runs 24/7. Here\'s the tooling that keeps it humming.', gradient: 'from-cyan-500/20 to-violet-500/20' },
        { index: 1, title: 'Tool 1: Inngest', body: 'Durable functions for agent workflows. No more cron drift, no more lost retries.', gradient: 'from-cyan-500/20 to-blue-500/20' },
        { index: 2, title: 'Tool 2: tmux + custom CLI', body: 'Headless terminal multiplexing. Agents spawn sessions, scripts run in parallel.', gradient: 'from-violet-500/20 to-magenta-500/20' },
        { index: 3, title: 'Tool 3: SQLite + Litestream', body: 'Embedded DB with S3 replication. Zero-ops, survives anything.', gradient: 'from-magenta-500/20 to-pink-500/20' },
        { index: 4, title: 'CTA', body: 'Full breakdown in the comments. What tools are in your stack?', gradient: 'from-amber-500/20 to-rose-500/20' },
      ],
    },
    {
      id: 'p2', date: '2026-06-05', time: '14:00', platform: 'instagram', title: 'Founder story #3',
      snippet: 'A thread-style carousel...', status: 'published', author: 'mkt-content',
      createdAt: '2026-06-04T12:00:00Z',
      body: 'The third installment of the founder story series. This week: the moment we almost shut it all down.',
      hashtags: ['FounderLife', 'StartupStory', 'BuildInPublic'],
      slides: [
        { index: 0, title: 'Hook', body: 'Six months ago, I almost shut down the whole company.', gradient: 'from-rose-500/20 to-amber-500/20' },
        { index: 1, title: 'Context', body: 'We were $4K in the red, our biggest customer had churned, and the team was burned out.', gradient: 'from-amber-500/20 to-rose-500/20' },
        { index: 2, title: 'The Pivot', body: 'Instead of shutting down, we cut scope to one thing and bet everything on it.', gradient: 'from-violet-500/20 to-rose-500/20' },
      ],
    },
    {
      id: 'p3', date: '2026-06-06', time: '10:00', platform: 'twitter', title: 'AI agent architecture post',
      snippet: 'Open thread on our multi-agent system...', status: 'scheduled', author: 'dev-coding',
      createdAt: '2026-06-05T10:00:00Z',
      body: 'Open thread: How we built a 6-agent AI team that runs 24/7 on a $20/month VPS. Architecture diagram, costs, failure modes, and the 3 things we got wrong first. (1/12)',
      hashtags: ['AI', 'Agents', 'BuildInPublic', 'OpenSource'],
      slides: [],
    },
    {
      id: 'p4', date: '2026-06-06', time: '16:00', platform: 'tiktok', title: 'Behind the scenes: Hermes CLI',
      snippet: '15s teaser...', status: 'draft', author: 'mkt-poster',
      createdAt: '2026-06-05T14:00:00Z',
      body: 'POV: you just woke up to find your AI team already shipped 47 features overnight.',
      hashtags: ['AItools', 'DevTok', 'BuildInPublic'],
      slides: [],
    },
    {
      id: 'p5', date: '2026-06-07', time: '09:00', platform: 'linkedin', title: 'OpenRouter cost optimization',
      snippet: 'How we cut model spend by 60%...', status: 'scheduled', author: 'mkt-content',
      createdAt: '2026-06-05T18:00:00Z',
      body: 'We were burning $4/day on OpenRouter. Here\'s the 4 changes that took us to $1.60/day — without sacrificing quality.',
      hashtags: ['OpenRouter', 'AIEngineering', 'CostOptimization', 'LLM'],
      slides: [
        { index: 0, title: 'The Problem', body: 'OpenRouter costs had become our second-biggest line item.', gradient: 'from-amber-500/20 to-rose-500/20' },
        { index: 1, title: 'Fix 1: Caching', body: 'Prompt caching cut repeat query costs by 80%.', gradient: 'from-cyan-500/20 to-violet-500/20' },
        { index: 2, title: 'Fix 2: Tiered models', body: 'Use cheap models for routing, expensive for synthesis.', gradient: 'from-violet-500/20 to-magenta-500/20' },
        { index: 3, title: 'Fix 3: Truncation', body: 'Stop sending the entire conversation history every call.', gradient: 'from-magenta-500/20 to-pink-500/20' },
        { index: 4, title: 'Results', body: '60% cost reduction. Same output quality. Same throughput.', gradient: 'from-emerald-500/20 to-cyan-500/20' },
      ],
    },
    {
      id: 'p6', date: '2026-06-08', time: '12:00', platform: 'instagram', title: 'Carousel: 10 cold email hooks',
      snippet: 'Swipe-style carousel...', status: 'draft', author: 'outreach-emailer',
      createdAt: '2026-06-05T20:00:00Z',
      body: '10 cold email openers that consistently get 40%+ reply rates. Tested across 8,000+ sends.',
      hashtags: ['ColdEmail', 'Outreach', 'Sales', 'B2B', 'Copywriting'],
      slides: [
        { index: 0, title: 'Hook 1: The Question', body: '"Saw your team just raised Series A — what\'s the next 6 months looking like?"', gradient: 'from-cyan-500/20 to-blue-500/20' },
        { index: 1, title: 'Hook 2: The Observation', body: '"Your last 3 LinkedIn posts all hit on remote work — clearly top of mind."', gradient: 'from-violet-500/20 to-rose-500/20' },
        { index: 2, title: 'Hook 3: The Referral', body: '"[Mutual connection] suggested I reach out about X."', gradient: 'from-magenta-500/20 to-rose-500/20' },
      ],
    },
  ],
};

export const mockIdeas: StudioIdeasResponse = {
  ideas: [
    {
      id: 'i1',
      title: 'Why "free" AI models are a tax on your time',
      description: 'Comparing latency, reliability, and hidden cost of free-tier models in production.',
      sources: ['trending', 'pain'],
      score: 92,
      angle: 'The "free" tier is free in the same way a Times Square billboard is "free" if you stand in front of it — you pay in attention, latency, and your own engineering hours.',
      outline: [
        'Open with a hot take: "free" models are not free in production',
        'Show 3 real numbers: latency, success rate, hidden retries',
        'Compare: $4/mo paid vs 30 hrs/mo engineering time',
        'Breakdown: when free is fine, when paid is mandatory',
        'CTA: tell us your model bill — we\'ll audit it',
      ],
      suggestedHashtags: ['AI', 'LLM', 'OpenRouter', 'AIEconomics', 'IndieHacker'],
      suggestedSlideCount: 6,
      references: [
        { title: 'OpenRouter pricing page', url: 'https://openrouter.ai/models' },
        { title: 'Latency vs cost tradeoff', url: 'https://arxiv.org/abs/2310.04408' },
      ],
    },
    {
      id: 'i2',
      title: 'The death of the cold email (and what replaces it)',
      description: 'Signal-based outreach in a world of inbox saturation.',
      sources: ['trending', 'keywords'],
      score: 88,
      angle: 'Cold email reply rates dropped from 8% to 1.2% over 5 years. The replacement isn\'t warmer email — it\'s signal-based outreach on platforms where intent already lives.',
      outline: [
        'Show the data: reply rates 2019 vs 2024',
        'Why volume no longer works',
        'The 3 signals that predict intent',
        'Signal-based outreach playbook',
        'Real example: 47% reply rate from signal-based',
      ],
      suggestedHashtags: ['ColdEmail', 'Outreach', 'B2BSales', 'GTM', 'Sales'],
      suggestedSlideCount: 5,
      references: [
        { title: 'Backlinko cold email study', url: 'https://backlinko.com/cold-email-study' },
      ],
    },
    {
      id: 'i3',
      title: 'I built a 6-agent AI team for $0.62/day',
      description: 'Showcase Hermes multi-agent architecture and cost.',
      sources: ['viral', 'pain'],
      score: 95,
      angle: 'The unglamorous math of running a real multi-agent system: $0.62/day in API costs. Show the cost breakdown, the failures, the wins.',
      outline: [
        'Hook: total cost of $0.62/day for 6 agents',
        'Architecture diagram of the agent graph',
        'Cost breakdown by agent',
        'The 3 things that broke first',
        'Open-source the prompt library',
        'CTA: what would YOUR agent team do?',
      ],
      suggestedHashtags: ['AI', 'Agents', 'BuildInPublic', 'OpenSource', 'AIAgents'],
      suggestedSlideCount: 7,
      references: [
        { title: 'ArkiloStudios Mission Control', url: 'https://github.com/arkilo/arkilo-mission-control' },
      ],
    },
    {
      id: 'i4',
      title: 'Obsidian + Hermes: a second brain that talks back',
      description: 'Walkthrough of memory integration.',
      sources: ['keywords'],
      score: 76,
      angle: 'Static notes are dead weight. With Hermes memory integration, your Obsidian vault becomes queryable, summarizable, and connected to your AI workflow.',
      outline: [
        'The problem: 2000 notes, no synthesis',
        'Hermes memory hook: bidirectional sync',
        'Live demo: "what did I decide about X last month?"',
        'The vault graph + AI',
        'Setup walkthrough',
      ],
      suggestedHashtags: ['Obsidian', 'PKM', 'NoteTaking', 'AI', 'Productivity'],
      suggestedSlideCount: 5,
      references: [
        { title: 'Obsidian + Hermes docs', url: 'https://docs.arkilo.studio/obsidian' },
      ],
    },
    {
      id: 'i5',
      title: '7 things I wish I knew about Vapi before integrating',
      description: 'Lessons from the Outreach cold-call pipeline.',
      sources: ['pain', 'trending'],
      score: 81,
      angle: 'Vapi is the best voice-AI platform but has 7 sharp edges that will bite you in production. Here they are, with the fixes.',
      outline: [
        'Latency on first turn is brutal — warm up the call',
        'Voicemail detection is hit-or-miss',
        'Cost spirals if you don\'t set a max duration',
        'Hangup detection on the agent side, not theirs',
        'Voices: pre-pick 3, not 30',
        'Transcript quality: ask for verbose_json',
        'Backup: have Twilio ready as failover',
      ],
      suggestedHashtags: ['Vapi', 'VoiceAI', 'ColdCall', 'AIEngineering', 'Integrations'],
      suggestedSlideCount: 7,
      references: [
        { title: 'Vapi docs', url: 'https://docs.vapi.ai' },
      ],
    },
  ],
};

export const mockMedia: MediaLibraryResponse = {
  assets: [
    { id: 'm1', name: 'hero-arkilo-dark.png', type: 'image', url: '/mock/hero-arkilo-dark.png', sizeKb: 412, createdAt: '2026-06-04T15:00:00Z', tags: ['hero', 'brand'] },
    { id: 'm2', name: 'carousel-dev-tools.mp4', type: 'video', url: '/mock/carousel-dev-tools.mp4', sizeKb: 8420, createdAt: '2026-06-04T18:30:00Z', tags: ['carousel', 'linkedin'] },
    { id: 'm3', name: 'founder-voice-note.mp3', type: 'audio', url: '/mock/founder-voice-note.mp3', sizeKb: 1840, createdAt: '2026-06-05T09:14:00Z', tags: ['voice', 'brand'] },
    { id: 'm4', name: 'cold-email-frame.png', type: 'image', url: '/mock/cold-email-frame.png', sizeKb: 224, createdAt: '2026-06-05T11:20:00Z', tags: ['outreach'] },
    { id: 'm5', name: 'openrouter-cost-chart.png', type: 'image', url: '/mock/openrouter-cost-chart.png', sizeKb: 318, createdAt: '2026-06-05T12:00:00Z', tags: ['data', 'linkedin'] },
  ],
};

export const mockPosterQueue: PosterQueueResponse = {
  items: [
    { id: 'q1', platform: 'linkedin', title: '5 underrated dev tools 2026', scheduledAt: '2026-06-06T10:00:00Z', status: 'ready', preview: 'Carousel draft ready for review' },
    { id: 'q2', platform: 'twitter', title: 'AI agent architecture thread', scheduledAt: '2026-06-06T16:00:00Z', status: 'queued', preview: 'Thread with 8 tweets' },
    { id: 'q3', platform: 'instagram', title: 'Founder story #4', scheduledAt: '2026-06-07T14:00:00Z', status: 'queued', preview: 'Story sequence (5 frames)' },
    { id: 'q4', platform: 'tiktok', title: 'Hermes CLI in 30s', scheduledAt: '2026-06-08T18:00:00Z', status: 'publishing', preview: '30s teaser' },
    { id: 'q5', platform: 'linkedin', title: 'Q3 content plan', scheduledAt: '2026-06-05T12:00:00Z', status: 'published', preview: 'Live post' },
  ],
};

export const mockPersonalities: Personality[] = [
  { id: 'kawaii', name: 'Kawaii', description: 'Cute, energetic, emoji-friendly.', icon: 'Sparkles', preview: 'omg bestie, look at this sick workflow ✨🌸' },
  { id: 'noir', name: 'Noir', description: 'Dark, terse, cinematic.', icon: 'Moon', preview: 'The model failed. The numbers don\'t lie. The fix is obvious.' },
  { id: 'hype', name: 'Hype', description: 'Loud, motivational, energetic.', icon: 'Flame', preview: 'LET\'S GOOO 🚀 we just crushed the deploy window' },
  { id: 'surfer', name: 'Surfer', description: 'Chill, laid-back, dude.', icon: 'Waves', preview: 'yeah man, the cron is just vibin\' at 09:00 daily' },
  { id: 'pirate', name: 'Pirate', description: 'Arrr, swashbuckling.', icon: 'Anchor', preview: 'Arrr, set the gates to high tide an\' hoist the credit limit!' },
  { id: 'shakespeare', name: 'Shakespeare', description: 'Iambic, dramatic, archaic.', icon: 'Scroll', preview: 'Hark! The gateway stirs once more from slumber.' },
  { id: 'technical', name: 'Technical', description: 'Precise, code-like, dry.', icon: 'Terminal', preview: 'gateway.state: running; pid: 48217; uptime: 86432s' },
  { id: 'concise', name: 'Concise', description: 'Short, direct, no fluff.', icon: 'Minus', preview: 'Cron OK. Credits 4%. Done.' },
  { id: 'teacher', name: 'Teacher', description: 'Patient, didactic, friendly.', icon: 'BookOpen', preview: 'Let\'s walk through what just happened here...' },
  { id: 'uwu', name: 'UwU', description: 'Soft, affectionate.', icon: 'Heart', preview: 'the wittwe agent did a big oweie uwu' },
  { id: 'philosopher', name: 'Philosopher', description: 'Reflective, questioning, deep.', icon: 'Brain', preview: 'If the agent succeeds without us, were we ever needed?' },
];

// ─── MEMORY (Obsidian) ───────────────────────────────────────────
export const mockMemory: MemoryResponse = {
  notes: [
    {
      id: 'n1', path: '/Inbox/2026-06-05.md', title: '2026-06-05', folder: 'Inbox',
      modified: '2026-06-05T15:30:00Z', tags: ['daily'],
      preview: 'Today: Gateway restart. New Gemini model.',
      backlinks: 3, links: ['n2', 'n3', 'n5'],
    },
    {
      id: 'n2', path: '/Projects/ArkiloStudio/Architecture.md', title: 'Hermes Architecture', folder: 'Projects/ArkiloStudio',
      modified: '2026-06-04T22:00:00Z', tags: ['arch', 'hermes'],
      preview: 'Multi-agent orchestrator with SQLite + CLI bridge. Routes incoming tasks to the right specialist.',
      backlinks: 12, links: ['n3', 'n4', 'n6', 'n7', 'n8', 'n9'],
    },
    {
      id: 'n3', path: '/Projects/ArkiloStudio/Pipelines.md', title: 'Pipelines', folder: 'Projects/ArkiloStudio',
      modified: '2026-06-03T18:00:00Z', tags: ['hermes', 'pipelines'],
      preview: 'Outreach, SEO, Marketing, Ads pipelines.',
      backlinks: 8, links: ['n2', 'n4', 'n5'],
    },
    {
      id: 'n4', path: '/Agents/Outreach.md', title: 'Outreach Agent Spec', folder: 'Agents',
      modified: '2026-06-02T11:00:00Z', tags: ['agents', 'outreach'],
      preview: 'Scraper → Researcher → Emailer → Cold Call.',
      backlinks: 5, links: ['n3', 'n6'],
    },
    {
      id: 'n5', path: '/Daily Notes/2026-06-04.md', title: '2026-06-04', folder: 'Daily Notes',
      modified: '2026-06-04T20:00:00Z', tags: ['daily'],
      preview: 'Cold email A/B test results: variant B +14%.',
      backlinks: 1, links: ['n1'],
    },
    {
      id: 'n6', path: '/Templates/Content Brief.md', title: 'Content Brief Template', folder: 'Templates',
      modified: '2026-05-28T14:00:00Z', tags: ['template', 'content'],
      preview: 'Hook → Tension → Payoff → CTA.',
      backlinks: 4, links: ['n2'],
    },
    {
      id: 'n7', path: '/Agents/Marketing.md', title: 'Marketing Agent Spec', folder: 'Agents',
      modified: '2026-06-01T16:00:00Z', tags: ['agents', 'marketing'],
      preview: 'Trends Fetcher → SEO Strategist → Content Creator → Poster.',
      backlinks: 6, links: ['n2', 'n3', 'n6'],
    },
    {
      id: 'n8', path: '/Agents/SEO.md', title: 'SEO Agent Spec', folder: 'Agents',
      modified: '2026-06-01T12:00:00Z', tags: ['agents', 'seo'],
      preview: 'Research Planner → Keyword Specialist → Optimizer → QC.',
      backlinks: 4, links: ['n2'],
    },
    {
      id: 'n9', path: '/Projects/ArkiloStudio/Model Stack.md', title: 'Model Stack', folder: 'Projects/ArkiloStudio',
      modified: '2026-05-30T18:00:00Z', tags: ['hermes', 'models'],
      preview: 'Primary: step-3.7-flash. Fallbacks: gemini, llama-3.3-70b.',
      backlinks: 3, links: ['n2', 'n10'],
    },
    {
      id: 'n10', path: '/Daily Notes/2026-06-03.md', title: '2026-06-03', folder: 'Daily Notes',
      modified: '2026-06-03T22:00:00Z', tags: ['daily'],
      preview: 'Shipped Model Stack. Switched to gemini as fallback 1.',
      backlinks: 2, links: ['n1', 'n9'],
    },
    {
      id: 'n11', path: '/Projects/ArkiloStudio/Roadmap.md', title: 'Q3 Roadmap', folder: 'Projects/ArkiloStudio',
      modified: '2026-06-02T15:00:00Z', tags: ['planning', 'roadmap'],
      preview: 'Memory integration, Studio v2, Vapi voice pipeline.',
      backlinks: 5, links: ['n2', 'n3', 'n7'],
    },
    {
      id: 'n12', path: '/Templates/Cold Email.md', title: 'Cold Email Template', folder: 'Templates',
      modified: '2026-05-25T10:00:00Z', tags: ['template', 'email'],
      preview: 'Subject hook → 1-line context → specific ask.',
      backlinks: 3, links: ['n4'],
    },
  ],
};

// ─── NOTIFICATIONS ─────────────────────────────────────────────────
let _notifCounter = 0;
const makeNotif = (level: AppNotification['level'], title: string, body: string, source: string, minsAgo: number, read = false, href?: string): AppNotification => {
  const t = new Date(Date.now() - minsAgo * 60_000);
  return {
    id: `notif-${++_notifCounter}`,
    level, title, body, source,
    timestamp: t.toISOString(),
    read,
    href,
  };
};

export const mockNotifications: { items: AppNotification[] } = {
  items: [
    makeNotif('error', 'Cron job failed', 'IPTV Group Warmup: HTTP 404 — no endpoints for gemini-2.0-flash-exp:free', 'cron', 2),
    makeNotif('success', 'Outreach campaign sent', '47 cold emails delivered · 12 replies queued for follow-up', 'outreach-emailer', 14, false, '/logs'),
    makeNotif('warning', 'Credit budget at 80%', '$80.00 of $100 used this cycle — auto-alert threshold', 'orchestrator', 38, false, '/analytics'),
    makeNotif('success', 'New content idea generated', 'Studio AI suggested 5 fresh post ideas for next week', 'mkt-content', 65, true, '/studio'),
    makeNotif('info', 'Gateway restarted', 'Hermes gateway came back online · 142 tasks resumed', 'orchestrator', 142, true),
    makeNotif('success', 'Lead scrape completed', '324 new leads from Apollo sync · 87% match score', 'outreach-scraper', 240, true),
    makeNotif('error', 'Pipeline halted', 'Ads · Meta Ads Performance: insufficient API permissions', 'ads-creative', 320, true),
  ],
};
