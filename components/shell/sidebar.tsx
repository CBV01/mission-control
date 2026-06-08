'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Home, MessageCircle, Activity, Network, GitBranch, KanbanSquare, Palette,
  BarChart3, Clock, Wrench, FileText, Brain, Settings, Zap,
  PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import { useUIStore, type PageKey } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/tooltip';

// Map page keys → Next.js routes
const ROUTES: Record<PageKey, string> = {
  home: '/',
  chat: '/chat',
  health: '/health',
  agents: '/agents',
  pipelines: '/pipelines',
  kanban: '/kanban',
  studio: '/studio',
  analytics: '/analytics',
  cron: '/cron',
  skills: '/skills',
  logs: '/logs',
  memory: '/memory',
  settings: '/settings',
};

interface NavItem {
  id: PageKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Command Center',
    items: [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'chat', label: 'Chat', icon: MessageCircle },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'health', label: 'Health', icon: Activity },
      { id: 'logs', label: 'Logs', icon: FileText },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
  {
    label: 'Agents',
    items: [
      { id: 'agents', label: 'Agents & Domains', icon: Network },
      { id: 'pipelines', label: 'Pipelines', icon: GitBranch },
      { id: 'kanban', label: 'Kanban', icon: KanbanSquare },
    ],
  },
  {
    label: 'Growth Studio',
    items: [
      { id: 'studio', label: 'Social Studio', icon: Palette },
      { id: 'analytics', label: 'Analytics & Credits', icon: BarChart3 },
    ],
  },
  {
    label: 'Operations',
    items: [
      { id: 'cron', label: 'Cron Jobs', icon: Clock },
      { id: 'skills', label: 'Skills Library', icon: Wrench },
    ],
  },
  {
    label: 'Brain',
    items: [{ id: 'memory', label: 'Memory / Obsidian', icon: Brain }],
  },
];

export function Sidebar() {
  const { setPage, sidebarCollapsed, toggleSidebar } = useUIStore();
  const router = useRouter();
  const pathname = usePathname();

  // Hover-expand while collapsed
  const [hoverExpand, setHoverExpand] = React.useState(false);
  const isCollapsed = sidebarCollapsed && !hoverExpand;

  // Derive active page from current pathname
  const currentPage: PageKey =
    (Object.entries(ROUTES).find(([, route]) => route === pathname)?.[0] as PageKey) ?? 'home';

  const navigate = (id: PageKey) => {
    setPage(id);
    router.push(ROUTES[id]);
  };

  return (
    <aside
      onMouseEnter={() => sidebarCollapsed && setHoverExpand(true)}
      onMouseLeave={() => setHoverExpand(false)}
      className={cn(
        'sticky top-0 h-screen flex-shrink-0 border-r border-white/[0.06] bg-bg-surface/80 backdrop-blur-xl transition-[width,box-shadow] duration-300 ease-out-expo z-sticky overflow-hidden',
        isCollapsed ? 'w-20' : 'w-56',
        hoverExpand && 'shadow-2xl shadow-black/60'
      )}
      aria-label="Primary navigation"
    >
      <div className="flex h-full flex-col w-56"> {/* fixed inner width to keep content stable */}
        {/* Brand */}
        <button
          onClick={toggleSidebar}
          className="flex h-14 items-center gap-3 border-b border-white/5 px-4 cursor-pointer hover:bg-white/5 transition-colors flex-shrink-0"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-accent shadow-glow-cyan">
            <Zap className="h-4 w-4 text-white" fill="white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col items-start overflow-hidden">
              <span className="font-display text-xs font-semibold tracking-[0.15em] text-text-primary whitespace-nowrap">
                ARKILOSTUDIOS
              </span>
              <span className="text-[10px] uppercase tracking-widest text-text-tertiary whitespace-nowrap">
                Mission Control
              </span>
            </div>
          )}
        </button>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto p-3 scrollbar-hide">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-4">
              {!isCollapsed && (
                <div className="mb-1 px-3 text-[10px] font-medium uppercase tracking-widest text-text-tertiary whitespace-nowrap overflow-hidden">
                  {group.label}
                </div>
              )}
              <ul className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const isActive = currentPage === item.id;
                  const Icon = item.icon;
                  const button = (
                    <button
                      onClick={() => navigate(item.id)}
                      className={cn(
                        'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ease-out-expo cursor-pointer',
                        'focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface',
                        isActive
                          ? 'bg-white/5 text-text-primary'
                          : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {isActive && <span className="nav-active-indicator" aria-hidden />}
                      <Icon className={cn('h-4 w-4 flex-shrink-0', isActive ? 'text-accent-cyan' : 'text-text-tertiary group-hover:text-text-secondary')} />
                      {!isCollapsed && (
                        <span className="truncate whitespace-nowrap">
                          {item.label}
                        </span>
                      )}
                    </button>
                  );

                  return (
                    <li key={item.id}>
                      {isCollapsed ? (
                        <Tooltip content={item.label} side="right">
                          {button}
                        </Tooltip>
                      ) : (
                        button
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer + collapse toggle */}
        <div className="border-t border-white/5 p-3 flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            {!isCollapsed && (
              <>
                <span className="text-[10px] text-text-tertiary whitespace-nowrap">v0.1.0 · dev</span>
                <span className="font-mono text-accent-cyan text-[10px]">●</span>
              </>
            )}
            <button
              onClick={toggleSidebar}
              className={cn(
                'flex items-center justify-center h-7 w-7 rounded-md text-text-tertiary hover:bg-white/5 hover:text-text-primary transition-colors cursor-pointer',
                isCollapsed && 'mx-auto'
              )}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
