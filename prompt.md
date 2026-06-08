Here is the hyper-detailed, production-grade prompt. Copy it into v0.dev or Lovable as-is.

---

PROMPT: Hermes Agent — Mission Control Dashboard (Full Build)

---

0. PROJECT VISION & SUCCESS CRITERIA

Build a single-page Next.js application titled Hermes Mission Control — ArkiloStudio. It is the primary interface for monitoring, controlling, and observing a multi-agent AI operating system. The aesthetic must be premium futuristic command center: think Starship Enterprise meets Linear/Stripe dashboard, but darker, more cyberpunk, and deeply data-rich.

Success criteria:
- David can open one page and instantly know: system health, agent statuses, active pipelines, credit burn, recent logs, and content studio output.
- Every Hermes subsystem (agents, pipelines, kanban, cron, skills, logs, credits, social studio, memory) has a dedicated, beautifully designed section.
- UI is responsive but primarily designed for desktop (1440px+).
- Typography is tight: headings crisp, body readable but compact. NO oversized fonts.
- Floating action buttons (FABs) provide fast actions from anywhere.
- Modals handle details without navigation noise.
- The app is structurally ready for backend wiring to Hermes SQLite/CLI endpoints.

---

1. DESIGN SYSTEM

1.1 Color Palette (Dark Futuristic)

Base surfaces (CSS custom properties):
- --bg-root: #04060a (near black with blue undertone)
- --bg-surface: #0a0e17 (sidebar, panels)
- --bg-elevated: #111827 (cards, modals)
- --bg-glass: rgba(17, 25, 40, 0.65) (glassmorphism overlays)
- --border-subtle: rgba(255, 255, 255, 0.06)
- --border-default: rgba(255, 255, 255, 0.10)
- --border-strong: rgba(255, 255, 255, 0.18)

Accent gradients (use for key actions, live indicators, active states):
- Primary glow: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 50%, #d946ef 100%)
- Success: #10b981 + glow rgba(16,185,129,0.25)
- Warning: #f59e0b + glow rgba(245,158,11,0.25)
- Danger: #ef4444 + glow rgba(239,68,68,0.25)
- Info: #3b82f6 + glow rgba(59,130,246,0.25)

Text hierarchy:
- --text-primary: #f8fafc
- --text-secondary: #94a3b8
- --text-tertiary: #64748b
- --text-accent: #67e8f9 (cyan tint for highlights)

1.2 Typography

Font stack: 'Inter', 'Geist', system-ui, -apple-system, sans-serif

Scale (compact, not oversized):
- Display (page titles): text-2xl font-semibold tracking-tight (24px)
- Section headers: text-lg font-semibold tracking-tight (18px)
- Card titles: text-base font-medium (16px)
- Body/UI: text-sm (14px)
- Small/meta: text-xs (12px)
- Tiny: text-[11px] (11px)
- Font weight range: 400–600 only. Avoid 700+ except for hero numbers.

Line heights: Tight but breathable. Headings leading-tight, body leading-relaxed.

1.3 Spacing & Layout

- Base unit: 4px grid.
- Page padding: p-6 (24px)
- Card padding: p-4 (16px) for dense data, p-5 (20px) for feature cards.
- Gaps: gap-3 (12px) for tight lists, gap-4 (16px) for cards, gap-6 (24px) for sections.
- Sidebar width: w-64 (256px). Collapsed: w-20.
- Topbar height: h-14 (56px).
- Max content width: max-w-[1600px] within main area.

1.4 Visual Effects

- Glassmorphism: Background blur backdrop-blur-xl, semi-transparent backgrounds, subtle white border border-white/5.
- Glow effects: Use shadow-[0_0_20px_rgba(...)] on live status indicators and primary buttons.
- Grid/dot patterns: Optional subtle radial gradient or dot-grid background on the root (background-image: radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 24px 24px).
- Borders: Rounded corners rounded-lg to rounded-xl.
- Shadows: Multi-layered: shadow-lg shadow-black/20 plus optional colored glow.

1.5 Iconography

- lucide-react for all icons. 

----
- Consistent sizing: h-4 w-4 for inline, h-5 w-5 for card headers, h-6 w-6 for navigation.

---

2. LAYOUT ARCHITECTURE

2.1 Shell Structure

┌──────────────────────────────────────────────────────┐
│  Topbar (h-14, glass, global status + search + user) │
├────┬─────────────────────────────────────────────────┤
│    │                                                  │
│ S  │  Main Content Area (scrollable, p-6)            │
│ I  │                                                  │
│ D  │  - Routing via URL hash or state:               │
│ E  │    #home, #health, #agents, #pipelines,         │
│ B  │    #kanban, #studio, #analytics, #cron,        │
│ A  │    #skills, #logs, #settings                   │
│ R  │                                                  │
│    │                                                  │
└────┴─────────────────────────────────────────────────┘
  FABs float above content bottom-right
  Modals render in portal with backdrop blur


2.2 Sidebar Navigation (collapsible)

- Logo at top: stylized Hermes wing/lightning mark + wordmark "HERMES" in tracking-[0.2em].
- Nav sections grouped:
  - Command Center (single): Home
  - System: Health, Logs, Settings
  - Agents: Agents & Domains, Pipelines, Kanban
  - Growth Studio: Social Content Studio, Analytics & Credits
  - Operations: Cron Jobs, Skills Library
  - Brain: Memory / Obsidian
- Each item: icon + label, active state with cyan left border + subtle bg highlight.
- Collapsed state shows only icons, tooltip on hover.

2.3 Topbar (Global)

- Left: breadcrumb / current page title in tight semibold.
- Center: global status indicator (pulsing dot) + one-line status text (e.g., "Gateway running · 3 cron jobs enabled").
- Right: Search bar (cmd+k style, expands on click), Notification bell with count badge, User avatar/initials (David).
- Search bar when focused: modal overlay with keyboard shortcuts cheat sheet.

2.4 Floating Action Buttons (FABs)

- Cluster in bottom-right, above content: fixed bottom-6 right-6 z-50 flex flex-col gap-3.
- Primary FAB: + Trigger Pipeline (gradient button with pulse ring animation).
- Secondary: Restart Gateway (outlined, colored by danger level).
- Tertiary: Run Health Check (smaller, ghost).
- Expandable: click primary FAB → radial menu or simple stack with spring animation.

---

3. PAGE SPECIFICATIONS (DETAILED)

---

3.1 HOME — Command Center

Layout: Grid-based command center, dense but breathable.

Top section — Global Status Bar (full width card, glass):
- 4 metric tiles in a row:
  1. Gateway Status: large pulsing dot + "Running" + PID number in mono.
  2. Platforms: minimal icons for Telegram/Discord with green check or red cross.
  3. Model: current model name + provider chip (e.g., "stepfun/step-3.7-flash:free" in mono).
  4. Credits: "$X.XX used · $Y remaining" with progress bar.
- Below metrics: horizontal rule, then "Quick Actions" pill buttons: Run Pipeline · Restart Gateway · Export Logs · Send Test Message.

Middle — Stats Grid (2×2 or 2×3 cards):
- Card 1: VPS at a glance — CPU cores, Load avg (1m/5m/15m), RAM bar, Disk usage bar. Mini sparkline for load history.
- Card 2: Agents today — total active agents, tasks completed, tasks failed, pie or donut chart (completed% vs failed%).
- Card 3: Active Pipelines — pipeline name, current step, progress bar with step labels underneath.
- Card 4: Credit Burn Rate — today's spend vs yesterday, line chart area.

Bottom — Recent Events Feed (half width) + Live Agent Activity (half width):
- Events feed: compact list, each row = timestamp (mono, tiny) + agent badge + task description + status dot. Scrollable, max height 320px.
- Activity panel: horizontal bar chart showing each agent's task count last 24h. Agents names on y-axis, bars cyan graded.

Color accents: Use cyan for completed, amber for pending, red for failed.

---
 
3.2 HEALTH — System & VPS

Split layout: 2 columns.

Left — VPS Health Panel:
- Big number cards: CPU Load (1m), RAM Usage (%), Disk Usage (%).
- Progress bars with gradient fills and percentage label inside or beside.
- Gauge visualization for RAM and Disk (semi-circle SVG or simple arc).
- Network I/O placeholder: bytes in/out.
- Uptime counter.
- "Run Health Check" button with loading state animation.

Right — Gateway & Services:
- Gateway card: PID, uptime, restart count, memory footprint.
- Discord connection card: guild name "Arkilo_Server", channel count (28), latency, last error (if any).
- Telegram connection card: chat ID, last message timestamp, connection state.
- SSL/TLS status (if applicable).
- Service dependencies list with pass/fail indicators.

Design details: Use status chips/badges (green dot + "Operational") at top of each card.

---

3.3 AGENTS & DOMAINS — Hierarchical Tree

Layout: Left 60% tree, right 40% detail panel.

Left — Tree View:
- Root: Orchestrator (icon: network/hierarchy).
- 6 domain folders with chevron expand/collapse:
  - Outreach (4 sub-agents: scraper, researcher, emailer, cold-call)
  - Marketing (4 sub-agents: trends, seo-strategist, content-creator, content-poster)
  - SEO (4 sub-agents: research-planner, keyword-specialist, optimization-agent, quality-control)
  - IPTV (3 sub-agents: group-finder, group-joiner, auto-poster)
  - Ads / Meta Ads (6 sub-agents: strategist, creative, campaign-manager, optimization, analytics, automation)
  - Dev (3 sub-agents: coding-agent, integrator, deployment-agent)
- Each agent node: icon + name + small status indicator (green = idle, yellow = working, gray = offline).
- Click node → detail panel slides in.
- Click domain → shows all children aggregated stats.

Right — Agent Detail Panel:
- Header: agent name, domain badge, status, last active timestamp.
- Stats: tasks today, success rate, avg duration, model used.
- Recent Tasks: list of last 10 tasks (description, status, time, credits).
- Logs: last 20 log entries filtered to this agent.
- "Send Command" input at bottom (mock; wired later to delegate_task).

Visual: Use indented tree lines, subtle hover backgrounds, monospace for IDs.

---

3.4 PIPELINES & WORKFLOWS

Layout: Pipeline cards stacked vertically, expandable.

Each pipeline card:
- Header: domain name, gradient left border, status badge (Idle/Running/Completed/Failed).
- Subtitle: "Outreach → Lead Scraper → Researcher → Emailer → Cold Call"
- Step indicators: horizontal stepper with circles and connecting lines. Each circle shows step number, icon, and status color.
  - Completed step: filled circle, green, checkmark.
  - Active step: pulsing circle, cyan, gradient border.
  - Pending step: empty circle, gray border.
- Progress percentage text.
- Click card → modal opens with full pipeline detail:
  - Step-by-step breakdown with descriptions from PIPELINE.md.
  - Input/output file placeholders (e.g., raw_inputs/leads.json, processed/enriched_leads.json).
  - Trigger button "Run Pipeline" with confirmation.
  - Last run timestamp + duration + result.

Cold Call / Vapi visualization (within Outreach pipeline):
- Special connector node showing Vapi integration status.
- Mock phone icon with "Connected" badge.
- Show call flow: Email Sent → Wait 1h → Vapi Call Initiated → Log Outcome.

Lead Scraping visualization (Outreach):
- Show source icons: Google Maps, LinkedIn, Apollo, directories.
- Flow: Source → Scraper → Enrichment → Segmentation.

---

3.5 KANBAN BOARD

Layout: Classic Kanban columns with compact, techy styling.

Columns: Ready | In Progress | Completed | Blocked

Cards:
- Compact height (~80px).
- Left colored stripe by priority: 0=gray, 1=amber, 2=red.
- Title in small font, truncated.
- Badge: assignee (agent name), workspace kind (scratch). 

--------

- Meta line: created time (relative, e.g., "2h ago"), priority number.
- Hover: lift + glow border.
- Click: opens detail modal with full title, body, creation metadata.

Column headers:
- Count badge (e.g., "Ready (28)") in muted gray circle.
- Overflow indicator if many cards (scrollable column with max height calc).

Styling: Borders 1px solid rgba(255,255,255,0.06), rounded corners, no heavy shadows — clean and flat with subtle depth.

---

3.6 SOCIAL CONTENT STUDIO

Layout: Tabbed interface within the page.

Tabs:
1. Content Calendar
2. Ideation Board
3. Carousel Generator
4. Media Library
5. Poster Queue
6. Style Lab

Content Calendar:
- Month grid (mini calendar) with post indicators on dates.
- Click date → right panel shows scheduled items for that day.
- Each item: platform icon, content snippet, time, status chip (draft/scheduled/published).
- "Schedule Post" FAB on calendar view.

Ideation Board:
- Masonry or grid of idea cards.
- Sources tagged: 🔥 Trending (from Marketing Trends Fetch), 🎯 Keywords (from SEO), 💡 Pain Points (from Outreach), 📈 Viral Patterns.
- Each card: title, source tags, short description, "Use in Post" button.

Carousel Generator:
- Input mode: text area for topic + file upload zone (drag/drop) for article/reel source.
- Sidebar controls: platform selector (IG/LinkedIn/TikTok), tone selector (kawaii/noir/hype/etc.), slide count (5–10).
- Output preview: horizontal scrollable strip of slide cards. Each card shows image placeholder + headline + body text.
- "Export" button downloads as mock JSON.

Media Library:
- Grid of square thumbnails with file names and metadata overlay on hover.
- Filter chips: All, Images, Video, Audio.
- Upload placeholder area with dashed border.

Poster Queue:
- Table or list rows: platform, content title, scheduled time, status.
- Inline actions: edit (opens modal), delete, toggle publish.

Style Lab (Humanizer):
- Grid of personality toggles: Kawaii, Noir, Hype, Surfer, Pirate, Shakespeare, Technical, Concise, Teacher, Uwu, Philosopher.
- Each toggle card: icon + name + short vibe description.
- Click to "apply" — shows preview snippet of content in that tone.

---

3.7 ANALYTICS & CREDITS

Layout: Tabbed (Credits | Tokens | Agent Leaderboard | Model Performance).

Credits tab:
- Big number: "Total Used: $X.XX" and "Remaining: $Y.YY".
- Daily bar chart: last 14 days spend.
- Limit indicator with warning zones (green < 80%, amber 80–95%, red > 95%).
- Model breakdown: primary model spend vs fallback model spend.

Tokens tab:
- Daily token consumption line chart.
- Per-agent stacked area chart.

Agent Leaderboard:
- Ranked table: Agent | Tasks Today | Success Rate | Avg Credits/Task | Trend.
- Medal icons for top 3.
- Sortable columns.

Model Performance:
- Success rate pie chart.
- Fallback trigger log: list of times fallback model was invoked (timestamp, reason).
- Empty response incident log.

---

3.8 CRON JOBS

Layout: Table with search/filter.

Columns:
- Job Name | Schedule | Last Run | Status | Next Run | Last Error | Actions

Row details:
- Schedule in human-readable format: "Daily at 08:00" or "1st of month at 03:00".
- Status chip: ✅ OK | ⚠️ Error | ⏸ Paused.
- Next run countdown (e.g., "in 3h 24m").
- Last error in red mono text if failed (e.g., "HTTP 404: No endpoints found for google/gemini-2.0-flash-exp:free").
- Actions: Run Now (button), Toggle Enable (switch), Edit (mock).

Visual: Compact rows, alternating subtle bg, action buttons appear on row hover.

---

3.9 SKILLS LIBRARY

Layout: Grid of skill cards with sidebar filters.

Filters (left sidebar within page):
- Category pills: All | Autonomous | Creative | Data | DevOps | Email | Gaming | GitHub | MCP | Media | MLOps | Notes | Productivity | Research | Smart Home | Social | Software. 


-----

- Search bar (fuzzy on name + description).
- Toggle: Show Installed Only (mock).

Skill Cards:
- Title in semibold.
- Category chip in tiny font, colored by category.
- Description in text-xs, truncated to 2 lines.
- Hover: lift + border glow in category color.

Stats bar at top: "96 skills · 22 categories · 18 active this week" (mock numbers).

---

3.10 LOGS & INSIGHTS

Layout: Split 30/70. Left = filters. Right = log table + detail drawer.

Filters:
- Date range: Last 24h | Last 7d | Last 30d | Custom.
- Agent multi-select dropdown.
- Status filter: All | Completed | Failed | Timeout.
- Model filter.
- Search by task description.

Log Table:
- Columns: Time (mono) | Agent (badge) | Task (text truncate) | Model (mono chip) | Status (dot + label) | Credits (right-aligned, mono).
- Row hover: highlight.
- Click row → detail drawer slides from right showing full log entry, linked artifacts, and any error stack.
- Virtual scrolling if many rows (mock first 100).

Error log viewer (separate tab):
- Severity badges: ERROR (red), WARN (amber), INFO (blue).
- Stack traces in mono, collapsible.

---

3.11 MEMORY / OBSIDIAN (Design Placeholder)

Layout: Vault-style dark UI preview.

Left — Vault Explorer (mock):
- Folder tree: Inbox, Projects, ArkiloStudio, Agents, Daily Notes, Templates.
- File list with markdown icons, modified dates.
- Graph view button (opens modal with mock knowledge graph canvas — nodes and edges styled in cyan/purple).

Right — Note Preview:
- Markdown rendered preview with Obsidian-like styling (callouts, code blocks, internal links in cyan).
- Backlinks panel on right edge.
- Tag pills at bottom.
- This page is DESIGN ONLY. Mark clearly in UI: "Memory integration — coming soon".

Obsidian integration note: Add a disabled settings toggle: "Connect Obsidian Vault" with path input placeholder /root/obsidian-vault.

---

3.12 SETTINGS

Tabs:
1. Model Config
2. Personality
3. Appearance
4. Integrations
5. System

Model Config tab:
- Primary Model selector (dropdown + custom input).
- Provider + Base URL fields.
- Fallback chain: add/remove/reorder fallback models.
- Api key management: masked values with reveal toggle, rotate button (mock).
- Retry setting slider.

Personality tab:
- Grid of personality cards (same as Style Lab in Studio, but with descriptions and "Set Active" buttons).
- Active personality highlighted with glow border.

Appearance tab:
- Theme: Dark (default), Midnight, Cyber (accent variations).
- Sidebar collapsed state toggle.
- Density: Comfortable / Compact.
- Animations toggle.
- Font scale slider (default 100%, range 80–120%).

Integrations tab:
- Toggles for Discord, Telegram, Slack, WhatsApp, etc.
- API key fields for each (masked).
- Webhook URL display + regenerate button.

System tab:
- CLI Path display: /usr/local/lib/hermes-agent/venv/bin/hermes (readonly, mono, selectable).
- Gateway restart instructions (readonly text).
- Update channel: Stable / Beta.
- Export config / import config buttons.

---

4. MODAL SPECIFICATIONS

Global modal behavior:
- Backdrop: bg-black/70 backdrop-blur-sm.
- Modal container: bg-[#111827] border border-white/10 rounded-xl shadow-2xl max-w-2xl w-full mx-4.
- Header: gradient bottom border or left accent stripe. Title + close button (X icon).
- Body: p-5 (20px), scrollable if tall.
- Footer: optional action buttons (Cancel / Confirm).
- Animation: fade in + slight scale (animate-in fade-in zoom-in-95).
- Trap focus for accessibility.

Common modals to implement:
- Pipeline Detail Modal (section 3.4).
- Agent Command Modal (section 3.3).
- Carousel Export Modal.
- Skill Detail Modal (full description + related skills).
- Log Entry Detail Modal.
- Confirm Action Modal (dangerous ops like restart gateway). 

____
- Schedule Post Modal (calendar picker + time + platform).
- Run Pipeline Confirmation Modal.

---

5. STATE MANAGEMENT & DATA FLOW

Use TanStack Query (React Query v5) for all server state. Even though first iteration is mock, structure it so backend wiring is trivial.

Query keys pattern:
- ['health'] → /api/health
- ['agents'] → /api/agents
- ['pipelines'] → /api/pipelines
- ['kanban'] → /api/kanban
- ['logs', filters] → /api/logs
- ['cron'] → /api/cron
- ['credits'] → /api/credits
- ['skills'] → /api/skills
- ['studio', 'calendar'] → /api/studio/calendar
- ['memory'] → /api/memory (future)

Mock data: Create a lib/mockData.ts exporting realistic JSON for all endpoints. Use lib/msw-handlers.ts with MSW (Mock Service Worker) to intercept fetch calls and return mock data with realistic delays (300–800ms).

---

6. API INTEGRATION ROADMAP (FUTURE WIRING)

When backend is ready, swap MSW handlers for real API routes under /app/api/**. The frontend never changes.

Backend endpoints contract (to be built by Dev agent):
- GET /api/health → { gateway: { pid, uptime, state }, vps: { cpu, ram, disk, load }, platforms: { telegram: {state}, discord: {state} } }
- GET /api/agents → { domains: [{ name, agents: [{ name, status, lastActive, tasksToday, model }] }] }
- GET /api/pipelines → { pipelines: [{ domain, steps: [{ name, status, input, output }] }] }
- GET /api/kanban → { tasks: [{ id, title, status, priority, assignee, created_at }] }
- GET /api/logs → { logs: [{ timestamp, agent, task, model, status, credits }] }
- GET /api/cron → { jobs: [{ id, name, schedule, lastRun, nextRun, status, lastError }] }
- GET /api/credits → { totalUsed, dailyUsed, limit, remaining, byModel }
- GET /api/skills → { skills: [{ name, category, description }] }
- POST /api/pipelines/run → trigger pipeline
- POST /api/gateway/restart → restart gateway
- POST /api/cron/run → run cron job now
- POST /api/studio/generate → invoke content generation skill
- GET /api/memory → Obsidian notes list / content

CLI integration pattern:
- API routes call the Hermes CLI at /usr/local/lib/hermes-agent/venv/bin/hermes via Node.js child_process.exec with JSON output parsing.
- Example: hermes cron list --json, hermes status --json, etc.
- Redis/SQLite reads via direct file access in server-side code.

---

7. TECHNICAL STACK

- Framework: Next.js 14+ (App Router), TypeScript strict mode.
- Styling: Tailwind CSS with custom config for the color palette above. Use CSS variables for theming.
- Components: shadcn/ui as base, heavily customized. Key components: Card, Table, Dialog (modal), Tabs, Dropdown, Tooltip, Toast (for notifications), Progress, Badge, Command (for search/cmd+k).
- Charts: Recharts for all data visualizations (bar, line, area, pie, donut). Use custom tooltips styled to match theme.
- State: TanStack Query v5 + Zustand for UI state (sidebar collapse, theme, active modals).
- Icons: lucide-react.
- Animations: Framer Motion for page transitions, modal entrance, FAB expansion, list stagger.
- Fonts: Next/font with Inter + Geist Mono (for code/timestamps).
- Date formatting: date-fns with custom compact formats.
- Virtualization: @tanstack/react-virtual for large log/kanban lists.

---

8. ANIMATION & INTERACTION DETAILS

- Page transitions: slight fade + 100ms stagger on cards.
- Card hover: translateY(-2px) + border color shift to white/20.
- Status dots: pulse animation (CSS keyframes) every 2s.
- FAB menu: spring animation, stagger children 50ms.
- Modal: backdrop fade-in 150ms, panel scale from 0.95 to 1.
- Loading skeletons: shimmer gradient on skeleton cards (same gradient as primary glow).
- Button hover: gradient shift + subtle glow.
- Tree expand: chevron rotate 0.2s ease. 

____

- Pipelines step animation: active step glows brighter every 1.5s pulse.
- Micro-interactions: click ripple on cards? Optional, keep subtle.

---

9. RESPONSIVE & ACCESSIBILITY

- Breakpoints: sm: 640px, md: 768px, lg: 1024px, xl: 1440px.
- Primary target: lg and xl.
- Sidebar collapses to icon rail below xl; becomes overlay drawer on md/sm with hamburger toggle.
- Tables become horizontally scrollable cards on sm.
- All interactive elements have focus-visible rings (cyan).
- Color contrast meets WCAG AA (light text on dark bg passes; accent colors on dark bg must also pass).
- Keyboard navigation: Tab order logical, Escape closes modals, Cmd+K opens search.
- ARIA labels on icon-only buttons.

---

10. DELIVERABLE FORMAT

Produce:

1. README.md with setup instructions.
2. Complete Next.js app in one friendly zip or GitHub-ready repo structure:
   - app/ with all pages and layouts.
   - components/ with reusable pieces.
   - lib/ with mock data, MSW handlers, utils, types.
   - styles/ with global CSS + Tailwind config.
3. All 12 sections fully implemented with working navigation, rich mock data, and functional interactions (modals open, tabs switch, charts render, modals submit mock actions).
4. Component storybook feel: each major component is self-contained and styled.

---

11. WIRING CHECKLIST (for later backend integration)

- [ ] Replace lib/mockData.ts with real fetches to /api/*
- [ ] Confirm CLI paths: /usr/local/lib/hermes-agent/venv/bin/hermes
- [ ] Add hermes cron list --json, hermes kanban list, hermes status parsing
- [ ] Wire SQLite reads: ~/.hermes/agent-logs.db, ~/.hermes/kanban.db
- [ ] Add auth gate if exposing outside localhost
- [ ] Add WebSocket or polling for live log updates
- [ ] Add file upload handlers for CSV drop workflow
- [ ] Ensure credit calculations match OpenRouter API response schema

---

12. AESTHETIC REFERENCE SUMMARY (for the AI builder)

Think: Arc browser sidebar + Linear command palette + Datadog log explorer + SpaceX mission control palette.

- Dark surfaces with cyan-purple gradient accents.
- Dense information but optically balanced through whitespace and typographic hierarchy.
- No cartoonish elements; everything feels engineered and precise.
- Glowing indicators for live systems.
- Monospace font for IDs, timestamps, models, paths — data that needs to be read accurately.
- Sans-serif for everything else — warm and geometric.
- Cards have subtle inner glow at top edge to suggest depth.
- Empty states show friendly icon + message + suggested action.
- Loading states use skeleton cards with shimmer, not spinners.

---

If you want, I can also provide the accompanying TypeScript type definitions and a sample lib/mockData.ts file content now, so the builder has exact data shapes to hook into. 