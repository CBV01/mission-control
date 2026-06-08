# Dashboard Pages Override — Hermes Mission Control

> **Overrides MASTER.md for ALL 12 dashboard pages** (Home, Health, Agents, Pipelines, Kanban, Studio, Analytics, Cron, Skills, Logs, Memory, Settings).
> Reasoning engine picked "real estate / Cinzel + Josefin Sans / Horizontal Scroll Journey" — wrong fit for a cyberpunk command-center dashboard. This file overrides typography, accent, and page pattern.

---

## 1. Typography Override

**Drop Cinzel + Josefin Sans.** Use this pairing instead:

| Role | Font | Weights | Why |
|------|------|---------|-----|
| **Sans (UI/Body)** | **Inter** | 400, 500, 600 | Crisp geometric, dense-readable at 14px, warm but precise |
| **Mono (Data/IDs/Timestamps)** | **JetBrains Mono** | 400, 500, 600 | Developer-grade legibility for PIDs, model names, paths, logs |
| **Display accent (optional)** | **Geist** | 500, 600 | Modern alternative if Inter feels too generic on hero numbers |

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Geist:wght@500;600&display=swap');
```

**Tailwind config:**
```js
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'monospace'],
  display: ['Geist', 'Inter', 'sans-serif'],
}
```

**Type scale (compact, per spec):**
- `text-2xl font-semibold tracking-tight` — page titles (24px)
- `text-lg font-semibold tracking-tight` — section headers (18px)
- `text-base font-medium` — card titles (16px)
- `text-sm` — body/UI (14px)
- `text-xs` — meta (12px)
- `text-[11px]` — tiny (11px)
- Weights: 400–600 only. Avoid 700+ except hero numbers.

---

## 2. Accent Gradient Override

**The MASTER.md green CTA (#22C55E) is wrong** — this is a cyan→violet→magenta brand.

```css
/* Replace --color-cta with gradient */
--accent-gradient: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 50%, #d946ef 100%);
--accent-cyan: #06b6d4;        /* primary accent */
--accent-violet: #8b5cf6;      /* mid */
--accent-magenta: #d946ef;     /* highlight */
--accent-cyan-glow: rgba(6, 182, 212, 0.25);
--accent-violet-glow: rgba(139, 92, 246, 0.25);
--accent-magenta-glow: rgba(217, 70, 239, 0.25);
```

Status colors (use these, NOT green as primary):
- Success: `#10b981` + glow `rgba(16,185,129,0.25)`
- Warning: `#f59e0b` + glow `rgba(245,158,11,0.25)`
- Danger: `#ef4444` + glow `rgba(239,68,68,0.25)`
- Info: `#3b82f6` + glow `rgba(59,130,246,0.25)`

---

## 3. Page Pattern Override

**Drop "Horizontal Scroll Journey"** (it's a landing-page pattern). For a dashboard:

**Pattern: Bento Grid Command Center**
- Top strip: global status metrics (4 tiles inline)
- Middle: 2×2 or 2×3 bento cards (VPS, agents, pipelines, credits)
- Bottom: split — events feed (left) + live activity chart (right)
- FABs bottom-right for global actions
- Modals for detail drill-down (no navigation noise)

**Why:** Bento gives high information density without clutter. Spec section 3.1 matches this exactly.

---

## 4. Style: HUD / Sci-Fi FUI × Glassmorphism

Blend two style profiles:
- **HUD/Sci-Fi FUI** (thin 1px lines, neon cyan on dark, monospace, technical markers, decorative brackets)
- **Glassmorphism** (backdrop-blur-xl, bg-glass rgba(17,25,40,0.65), subtle white/5 borders)

**Result:** "Starship Enterprise meets Linear/Stripe dashboard, but darker, more cyberpunk."

```css
--bg-root: #04060a;            /* near black + blue undertone */
--bg-surface: #0a0e17;         /* sidebar, panels */
--bg-elevated: #111827;        /* cards, modals */
--bg-glass: rgba(17, 25, 40, 0.65);
--border-subtle: rgba(255, 255, 255, 0.06);
--border-default: rgba(255, 255, 255, 0.10);
--border-strong: rgba(255, 255, 255, 0.18);
--text-primary: #f8fafc;
--text-secondary: #94a3b8;
--text-tertiary: #64748b;
--text-accent: #67e8f9;        /* cyan tint */
```

**Key effects (calibrated per spec):**
- `backdrop-blur-xl` + `bg-glass` on floating surfaces
- `shadow-[0_0_20px_rgba(6,182,212,0.25)]` on live indicators + primary CTAs
- Subtle dot-grid root background: `radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px) 0 0 / 24px 24px`
- Rounded corners `rounded-lg` to `rounded-xl`
- Multi-layer shadows: `shadow-lg shadow-black/20` + optional colored glow

---

## 5. Chart Recommendations (Recharts)

For Recharts on a dark cyberpunk surface:

| Use case | Chart type | Color treatment |
|----------|-----------|-----------------|
| Live system status (CPU, RAM, Disk) | **Area chart** with gradient fill, smooth curve | Cyan→transparent fill, cyan stroke |
| Credit burn (14d) | **Bar chart** stacked | Violet bars, magenta accent on today |
| Task completion ratio | **Donut** | Cyan completed, slate failed |
| Agent activity 24h | **Horizontal bar** | Cyan gradient, sorted desc |
| Pipeline progress | **Custom stepper** (not Recharts) | Pulsing cyan active, green check done |
| Forecast / trends | **Line with confidence band** | Solid cyan actual, dashed violet forecast |

**Tooltip:** Custom styled — `bg-elevated border border-white/10 backdrop-blur-xl text-xs`.

---

## 6. Animation Tokens (per spec section 8)

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--dur-fast: 150ms;     /* micro */
--dur-base: 200ms;     /* standard hovers */
--dur-slow: 300ms;     /* modals, drawers */
--dur-pulse: 1500ms;   /* status dots */
--dur-shimmer: 1800ms; /* skeleton loaders */
```

**Required behaviors:**
- Page transitions: fade + 100ms card stagger
- Card hover: `translateY(-2px)` + border shift to `white/20` (NO scale — prevents layout shift)
- Status dots: pulse keyframes every 1.5–2s
- FAB menu: spring stagger 50ms children
- Modal: backdrop fade 150ms, panel scale 0.95 → 1
- Pipeline active step: glow pulse every 1.5s
- ALWAYS check `prefers-reduced-motion` — disable pulses, fades, springs

---

## 7. Accessibility Checklist (CRITICAL priority)

- [ ] Focus rings visible: `focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-root`
- [ ] All clickable elements: `cursor-pointer`
- [ ] Hover state uses color/opacity (NOT scale)
- [ ] Icon-only buttons: `aria-label="Open pipeline detail"`
- [ ] Tab order matches visual order
- [ ] ESC closes modals, Cmd/Ctrl+K opens search palette
- [ ] All form inputs have `<label>` with `for`
- [ ] Color contrast: `#f8fafc` on `#04060a` = 19.4:1 (AAA). Cyan `#06b6d4` on `#04060a` = 10.1:1 (AAA). Magenta `#d946ef` on `#04060a` = 6.8:1 (AA Large only — use for ≥18px or bold)
- [ ] Color is never the ONLY indicator — pair with icon or text (e.g., failed = red dot + "Failed" label)
- [ ] `prefers-reduced-motion: reduce` → disable pulse, fade, spring, shimmer
- [ ] Min touch target 44×44px (mainly applies to FABs, kanban cards, table rows)
- [ ] Skeleton loaders match final content aspect ratio (no layout pop-in)

---

## 8. Iconography

- **Library:** `lucide-react` (per spec)
- **Sizing:** `h-4 w-4` inline, `h-5 w-5` card headers, `h-6 w-6` nav
- **NEVER** use emojis as icons (lucide handles status: `CheckCircle2`, `XCircle`, `AlertTriangle`, `Loader2`)

---

## 9. Stack-Specific Notes (Next.js 14 + shadcn/ui + Recharts + Framer Motion)

- Use **App Router** (`app/` directory) with `layout.tsx` setting `<body className={inter.className}>`
- shadcn `Dialog` (not `Alert`) for modals
- shadcn `Tabs` for Studio / Analytics / Settings tabbed sections
- shadcn `Command` for the cmd+k global search
- shadcn `Skeleton` for loading states (NOT spinners)
- TanStack Query v5 for all `/api/*` server state (even when mocked)
- Zustand for UI state (sidebar collapse, theme, active modals)
- Recharts `ResponsiveContainer` everywhere — never fixed pixel widths
- Framer Motion `AnimatePresence` for modal mount/unmount + page transitions
- `next/font` for Inter + JetBrains Mono (no Google Fonts CDN in prod)
- `@tanstack/react-virtual` for log table + kanban when row count >100
