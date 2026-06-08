# Hermes Mission Control — ArkiloStudio

> Premium command center for monitoring, controlling, and observing a multi-agent AI operating system.

A single-page Next.js 14 dashboard with a cyberpunk-meets-Starship-Enterprise aesthetic. 12 fully designed pages, dark glassmorphism, real-time-feeling data, structurally ready for backend wiring to the Hermes CLI / SQLite.

![Status](https://img.shields.io/badge/status-mock--data-06b6d4?style=flat-square)
![Stack](https://img.shields.io/badge/stack-Next.js%2014%20%2B%20TS%20%2B%20Tailwind-8b5cf6?style=flat-square)
![License](https://img.shields.io/badge/license-Internal-d946ef?style=flat-square)

---

## ✨ Highlights

- **12 pages** — Home, Health, Agents, Pipelines, Kanban, Studio, Analytics, Cron, Skills, Logs, Memory, Settings
- **Dark cyberpunk design system** — cyan → violet → magenta gradient on near-black `#04060a`, glassmorphism, dot-grid background, glow effects
- **Recharts** data viz (area, bar, line, donut, pie) with custom dark tooltips
- **Framer Motion** page + modal animations
- **TanStack Query v5** for all server state (mocked; swap to real fetches in one place)
- **Zustand** for UI state (sidebar collapse, personality, theme) with localStorage persistence
- **Hash-based routing** for fast client navigation; no router round-trips
- **Floating Action Button** with expandable radial menu
- **A11y**: focus rings, ARIA labels, ESC closes modals, `prefers-reduced-motion` respected
- **Lucide** icons throughout (no emoji icons)

---

## 🚀 Quick Start

```bash
# 1. Install
npm install

# 2. Run dev server
npm run dev
# → http://localhost:3000

# 3. Production build
npm run build
npm start

# 4. Type check
npm run type-check
```

**Requirements:** Node.js 18.17+ and npm 9+.

---

## 📁 Project Structure

```
.
├── app/
│   ├── layout.tsx           # Root layout, fonts, providers
│   ├── page.tsx             # Home (Command Center)
│   ├── providers.tsx        # TanStack Query + Zustand hydration
│   ├── globals.css          # Design tokens, glassmorphism, animations
│   ├── health/page.tsx
│   ├── agents/page.tsx
│   ├── pipelines/page.tsx
│   ├── kanban/page.tsx
│   ├── studio/page.tsx      # 6 tabs: Calendar, Ideas, Carousel, Media, Queue, Style Lab
│   ├── analytics/page.tsx   # 4 tabs: Credits, Tokens, Leaderboard, Models
│   ├── cron/page.tsx
│   ├── skills/page.tsx
│   ├── logs/page.tsx
│   ├── memory/page.tsx
│   └── settings/page.tsx    # 5 tabs: Model, Personality, Appearance, Integrations, System
├── components/
│   ├── ui/                  # 11 primitives (Card, Button, Badge, Modal, Tabs, etc.)
│   └── shell/               # Sidebar, Topbar, FloatingActions, ClientShell
├── lib/
│   ├── types.ts             # All domain types
│   ├── mockData.ts          # Realistic mock data for all endpoints
│   ├── api.ts               # Mock API client (swap with real fetch here)
│   ├── store.ts             # Zustand UI store
│   └── utils.ts             # cn(), formatters, delay()
├── design-system/
│   └── hermes-mission-control/
│       ├── MASTER.md        # Engine-generated base
│       └── pages/
│           └── dashboard.md # Dashboard overrides (typography, accent, layout)
├── tailwind.config.ts       # Design tokens, animations, shadows
├── tsconfig.json
├── next.config.js
└── package.json
```

---

## 🎨 Design System

Authoritative reference: **`design-system/hermes-mission-control/pages/dashboard.md`** — overrides the engine's MASTER.md for this project.

### Color tokens (Tailwind)
| Token | Hex | Use |
|-------|-----|-----|
| `bg-root` | `#04060a` | App background |
| `bg-surface` | `#0a0e17` | Sidebar, panels |
| `bg-elevated` | `#111827` | Cards, modals |
| `accent-cyan` | `#06b6d4` | Primary accent |
| `accent-violet` | `#8b5cf6` | Mid accent |
| `accent-magenta` | `#d946ef` | Highlight |
| `text-primary` | `#f8fafc` | Main text (19.4:1 contrast) |
| `text-secondary` | `#94a3b8` | Muted text |
| `status-success/warning/danger/info` | standard | Status indicators |

### Gradients
```css
/* Tailwind */
bg-gradient-accent   /* cyan → violet → magenta */
bg-gradient-cyan     /* cyan → violet */
```

### Typography
- **Sans**: Inter (400/500/600)
- **Mono**: JetBrains Mono (400/500/600) — for IDs, timestamps, model names
- Compact scale: 24 / 18 / 16 / 14 / 12 / 11 px

### Effects
- Glassmorphism: `bg-bg-elevated/80 backdrop-blur-xl`
- Glow: `shadow-glow-cyan | shadow-glow-violet | shadow-glow-magenta`
- Dot grid background on root
- Rounded corners `rounded-lg` to `rounded-xl`
- Multi-layer shadows with colored glow accents

---

## 🔌 Wiring to Real Backend

All data flows through `lib/api.ts`. To swap mock data for real `/api/*` endpoints:

**1. Replace the `api` object in `lib/api.ts`:**
```ts
export const api = {
  health: () => fetch('/api/health').then(r => r.json()),
  agents: () => fetch('/api/agents').then(r => r.json()),
  // ... etc
};
```

**2. The shapes are already typed** (see `lib/types.ts`) and match the contracts in `prompt.md` section 6:
- `GET /api/health` → `HealthResponse`
- `GET /api/agents` → `AgentsResponse`
- `GET /api/pipelines` → `PipelinesResponse`
- `GET /api/kanban` → `KanbanResponse`
- `GET /api/logs` → `LogsResponse`
- `GET /api/cron` → `CronResponse`
- `GET /api/credits` → `CreditsResponse`
- `GET /api/skills` → `SkillsResponse`
- `GET /api/studio/calendar` → `StudioCalendarResponse`
- etc.

**3. POST endpoints** (for triggers, restarts) live in modals and FABs — wire those up under the same `api` object or as separate `api.triggerPipeline()` etc.

No component changes needed. The TanStack Query keys (`['health']`, `['agents']`, etc.) stay the same.

---

## 🧭 Navigation

- **Sidebar**: 7 nav groups (Command Center, System, Agents, Growth Studio, Operations, Brain)
- **Topbar**: breadcrumb, live status pulse + cron count, ⌘K search, notifications, user
- **FAB cluster** (bottom-right): Trigger Pipeline, Health Check, Restart Gateway

Hash routing: page state in URL hash (`#home`, `#agents`, etc.) — back/forward buttons work.

---

## ⌨️ Keyboard

| Key | Action |
|-----|--------|
| `Esc` | Close open modal |
| `⌘K` / `Ctrl+K` | Open search palette (placeholder — wire up `cmdk`) |
| `Tab` | Logical focus order (all interactive elements have focus rings) |

---

## ✅ Pre-Delivery Checklist (verified)

- [x] No emojis used as icons (lucide-react throughout)
- [x] All icons from one consistent set
- [x] `cursor-pointer` on all clickable elements
- [x] Hover states with `translateY(-0.5)` + border color shift (no scale → no layout shift)
- [x] Cyan focus rings on all interactive elements
- [x] `prefers-reduced-motion` reduces animations
- [x] Color is never the only indicator (icons + labels paired with status colors)
- [x] All form inputs have labels
- [x] Responsive grids (lg / md / sm breakpoints)
- [x] Sidebar collapses below lg with icon-rail + tooltips

---

## 🛠 Tech Stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 3.4 + custom design tokens |
| UI primitives | Hand-rolled (shadcn-style, themed) |
| Charts | Recharts 2.12 |
| State | TanStack Query v5 + Zustand 4 (with persist) |
| Animation | Framer Motion 11 |
| Icons | lucide-react |
| Date | date-fns |
| Fonts | Inter + JetBrains Mono via `next/font/google` |

---

## 📝 Spec Source

This project implements the spec in `prompt.md` (a 12-section detailed brief) with the design system from `design-system/hermes-mission-control/`. The `ui-ux-pro-max` skill was used to generate and override the base design system before implementation.

---

## 🔧 Wiring Checklist (from spec section 11)

- [ ] Replace `lib/api.ts` with real fetches to `/api/*`
- [ ] Confirm CLI paths: `/usr/local/lib/hermes-agent/venv/bin/hermes`
- [ ] Add `hermes cron list --json`, `hermes kanban list`, `hermes status` parsing
- [ ] Wire SQLite reads: `~/.hermes/agent-logs.db`, `~/.hermes/kanban.db`
- [ ] Add auth gate if exposing outside localhost
- [ ] Add WebSocket or polling for live log updates (currently 10–30s polling)
- [ ] Add file upload handlers for CSV drop workflow
- [ ] Ensure credit calculations match OpenRouter API response schema
- [ ] Wire `cmdk` for the search palette
- [ ] Add `@tanstack/react-virtual` to Logs + Kanban when row count >200

---

## 📜 License

Internal — ArkiloStudio.
