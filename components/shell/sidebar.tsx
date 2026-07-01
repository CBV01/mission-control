'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, MessageCircle, Activity, Network, GitBranch, KanbanSquare, Palette,
  BarChart3, Clock, Wrench, FileText, Brain, Settings, Zap,
  PanelLeftClose, PanelLeftOpen, ChevronDown, Users, PieChart, User, Mail, Phone
} from 'lucide-react';
import { useUIStore, type PageKey } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';

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
  // Leads routes
  leads: '/leads/summary',
  'leads-summary': '/leads/summary',
  'leads-list': '/leads',
  'leads-profile': '/leads/profile',
  'leads-cold-call': '/leads/cold-call',
  'leads-outreach-overview': '/leads/outreach/overview',
  'leads-outreach-templates': '/leads/outreach/templates',
  'leads-outreach-campaign': '/leads/outreach/campaign',
  'leads-outreach-outbox': '/leads/outreach/outbox',
  'leads-outreach-accounts': '/leads/outreach/accounts',
};

interface NavSubItem {
  id: PageKey;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  subItems?: { id: PageKey; label: string }[];
}

interface NavItem {
  id: PageKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: NavSubItem[];
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
      {
        id: 'leads',
        label: 'Leads',
        icon: Users,
        subItems: [
          { id: 'leads-summary', label: 'Summary', icon: PieChart },
          { id: 'leads-list', label: 'Leads', icon: Users },
          { id: 'leads-profile', label: 'Profile', icon: User },
          {
            id: 'leads-outreach-overview',
            label: 'Outreach',
            icon: Mail,
            subItems: [
              { id: 'leads-outreach-overview', label: 'Overview' },
              { id: 'leads-outreach-templates', label: 'Templates' },
              { id: 'leads-outreach-campaign', label: 'Campaign' },
              { id: 'leads-outreach-outbox', label: 'Outbox' },
              { id: 'leads-outreach-accounts', label: 'Accounts' },
            ],
          },
          { id: 'leads-cold-call', label: 'Cold-call', icon: Phone },
        ],
      },
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
  const pathname = usePathname();

  // Hover-expand while collapsed
  const [hoverExpand, setHoverExpand] = React.useState(false);
  const isCollapsed = sidebarCollapsed && !hoverExpand;

  // Track expanded state for nested menus
  const [expandedItems, setExpandedItems] = React.useState<Record<string, boolean>>({});

  // Derive active page from current pathname
  const currentPage: PageKey =
    (Object.entries(ROUTES).find(([, route]) => route === pathname)?.[0] as PageKey) ?? 'home';

  // Automatically expand sections depending on active route
  React.useEffect(() => {
    if (pathname.startsWith('/leads')) {
      setExpandedItems((prev) => ({ ...prev, leads: true }));
    }
    if (pathname.startsWith('/leads/outreach')) {
      setExpandedItems((prev) => ({ ...prev, outreach: true }));
    }
  }, [pathname]);

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
                  const isParentOfActive = item.subItems?.some(
                    (sub) => pathname === ROUTES[sub.id] || sub.subItems?.some((ss) => pathname === ROUTES[ss.id])
                  );
                  const isActive = pathname === ROUTES[item.id] || isParentOfActive;
                  const Icon = item.icon;
                  const hasSub = !!item.subItems;
                  const isOpen = expandedItems.leads && hasSub;

                  const linkItem = (
                    <Link
                      href={ROUTES[item.id]}
                      onClick={(e) => {
                        // Keep modifier keys functional for spawning new tabs natively
                        if (e.metaKey || e.ctrlKey || e.shiftKey || (e.button && e.button === 1)) {
                          return;
                        }
                        if (hasSub) {
                          e.preventDefault();
                          setExpandedItems((prev) => ({ ...prev, leads: !prev.leads }));
                        }
                        setPage(item.id);
                      }}
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
                        <>
                          <span className="truncate whitespace-nowrap flex-1 text-left">
                            {item.label}
                          </span>
                          {hasSub && (
                            <ChevronDown
                              className={cn(
                                'h-3.5 w-3.5 text-text-tertiary transition-transform duration-200',
                                isOpen && 'transform rotate-180 text-text-secondary'
                              )}
                            />
                          )}
                        </>
                      )}
                    </Link>
                  );

                  return (
                    <li key={item.id} className="flex flex-col">
                      {isCollapsed ? (
                        <Tooltip content={item.label} side="right">
                          {linkItem}
                        </Tooltip>
                      ) : (
                        linkItem
                      )}

                      {/* Level 1 Submenu */}
                      {!isCollapsed && hasSub && (
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.ul
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: 'easeInOut' }}
                              className="flex flex-col gap-0.5 overflow-hidden ml-5 border-l border-white/5 pl-3.5 mt-0.5"
                            >
                              {item.subItems?.map((subItem) => {
                                 const isSubActiveParent = subItem.subItems?.some((ss) => pathname === ROUTES[ss.id]);
                                 const isSubActive = pathname === ROUTES[subItem.id] || isSubActiveParent;
                                 const SubIcon = subItem.icon;
                                 const hasSubSub = !!subItem.subItems;
                                 const isSubOpen = expandedItems.outreach && hasSubSub;

                                return (
                                  <li key={subItem.id} className="flex flex-col">
                                    <Link
                                      href={ROUTES[subItem.id]}
                                      onClick={(e) => {
                                        if (e.metaKey || e.ctrlKey || e.shiftKey || (e.button && e.button === 1)) {
                                          return;
                                        }
                                        if (hasSubSub) {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setExpandedItems((prev) => ({ ...prev, outreach: !prev.outreach }));
                                        }
                                        setPage(subItem.id);
                                      }}
                                      className={cn(
                                        'group relative flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-all duration-200 ease-out-expo cursor-pointer',
                                        isSubActive
                                          ? 'text-text-primary'
                                          : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.02]'
                                      )}
                                    >
                                      {SubIcon && <SubIcon className={cn('h-3.5 w-3.5 flex-shrink-0', isSubActive ? 'text-accent-cyan/80' : 'text-text-tertiary group-hover:text-text-secondary')} />}
                                      <span className="truncate whitespace-nowrap flex-1 text-left">
                                        {subItem.label}
                                      </span>
                                      {hasSubSub && (
                                        <ChevronDown
                                          className={cn(
                                            'h-3 w-3 text-text-tertiary transition-transform duration-200',
                                            isSubOpen && 'transform rotate-180 text-text-secondary'
                                          )}
                                        />
                                      )}
                                    </Link>

                                    {/* Level 2 Submenu */}
                                    {hasSubSub && (
                                      <AnimatePresence initial={false}>
                                        {isSubOpen && (
                                          <motion.ul
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.15, ease: 'easeInOut' }}
                                            className="flex flex-col gap-0.5 overflow-hidden ml-4 border-l border-white/5 pl-2.5 mt-0.5"
                                          >
                                            {subItem.subItems?.map((subSubItem) => {
                                              const isSubSubActive = pathname === ROUTES[subSubItem.id];
                                              return (
                                                <li key={subSubItem.id}>
                                                  <Link
                                                    href={ROUTES[subSubItem.id]}
                                                    onClick={(e) => {
                                                      if (e.metaKey || e.ctrlKey || e.shiftKey || (e.button && e.button === 1)) {
                                                        return;
                                                      }
                                                      setPage(subSubItem.id);
                                                    }}
                                                    className={cn(
                                                      'relative flex w-full items-center gap-2 rounded px-2 py-1 text-xs font-medium transition-all duration-150 cursor-pointer',
                                                      isSubSubActive
                                                        ? 'text-accent-cyan font-semibold'
                                                        : 'text-text-tertiary hover:text-text-secondary hover:bg-white/[0.01]'
                                                    )}
                                                  >
                                                    {isSubSubActive && (
                                                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-accent-cyan" />
                                                    )}
                                                    <span className={cn('truncate whitespace-nowrap', isSubSubActive && 'pl-2 transition-all')}>
                                                      {subSubItem.label}
                                                    </span>
                                                  </Link>
                                                </li>
                                              );
                                            })}
                                          </motion.ul>
                                        )}
                                      </AnimatePresence>
                                    )}
                                  </li>
                                );
                              })}
                            </motion.ul>
                          )}
                        </AnimatePresence>
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
