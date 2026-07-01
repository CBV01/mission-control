'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PersonalityTone } from './types';

export type PageKey =
  | 'home' | 'chat' | 'health' | 'agents' | 'pipelines' | 'kanban'
  | 'studio' | 'analytics' | 'cron' | 'skills' | 'logs'
  | 'memory' | 'settings'
  | 'leads' | 'leads-summary' | 'leads-list' | 'leads-profile'
  | 'leads-outreach-overview' | 'leads-outreach-templates'
  | 'leads-outreach-campaign' | 'leads-outreach-outbox'
  | 'leads-outreach-accounts' | 'leads-cold-call';

interface UIState {
  // Navigation
  currentPage: PageKey;
  setPage: (page: PageKey) => void;

  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Modals
  activeModal: string | null;
  modalData: unknown;
  openModal: (id: string, data?: unknown) => void;
  closeModal: () => void;

  // Personality (Style Lab / Settings)
  activePersonality: PersonalityTone;
  setPersonality: (p: PersonalityTone) => void;

  // Theme
  theme: 'dark' | 'midnight' | 'cyber';
  setTheme: (t: 'dark' | 'midnight' | 'cyber') => void;

  // Appearance
  fontScale: number;             // 0.8 .. 1.2
  setFontScale: (s: number) => void;
  density: 'comfortable' | 'compact';
  setDensity: (d: 'comfortable' | 'compact') => void;
  animations: boolean;
  setAnimations: (a: boolean) => void;
}

const THEME_VARS: Record<'dark' | 'midnight' | 'cyber', Record<string, string>> = {
  dark: {
    '--bg-root': '10 10 10',
    '--bg-surface': '15 15 16',
    '--bg-elevated': '23 23 23',
    '--text-primary': '250 250 250',
    '--text-secondary': '161 161 170',
    '--text-tertiary': '113 113 122',
  },
  midnight: {
    '--bg-root': '8 12 24',
    '--bg-surface': '13 19 36',
    '--bg-elevated': '20 28 48',
    '--text-primary': '241 245 249',
    '--text-secondary': '148 163 184',
    '--text-tertiary': '100 116 139',
  },
  cyber: {
    '--bg-root': '8 0 6',
    '--bg-surface': '20 4 14',
    '--bg-elevated': '34 8 24',
    '--text-primary': '255 240 250',
    '--text-secondary': '232 178 200',
    '--text-tertiary': '180 130 150',
  },
};

// Apply theme + font scale to <html> so all pages update instantly
function applyAppearance(theme: 'dark' | 'midnight' | 'cyber', fontScale: number) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const vars = THEME_VARS[theme];
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  root.style.fontSize = `${fontScale * 16}px`;
  root.dataset.theme = theme;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => {
      // Apply on store creation (after rehydration) and on every change
      const apply = () => {
        const s = get();
        applyAppearance(s.theme, s.fontScale);
      };
      return {
        currentPage: 'home',
        setPage: (page) => set({ currentPage: page }),

        sidebarCollapsed: false,
        toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

        activeModal: null,
        modalData: null,
        openModal: (id, data) => set({ activeModal: id, modalData: data }),
        closeModal: () => set({ activeModal: null, modalData: null }),

        activePersonality: 'concise',
        setPersonality: (p) => set({ activePersonality: p }),

        theme: 'dark',
        setTheme: (t) => { set({ theme: t }); apply(); },

        fontScale: 1,
        setFontScale: (s) => { set({ fontScale: s }); apply(); },

        density: 'comfortable',
        setDensity: (d) => set({ density: d }),

        animations: true,
        setAnimations: (a) => set({ animations: a }),

        // private apply hook
        __apply: apply,
      } as UIState & { __apply: () => void };
    },
    {
      name: 'hermes-ui',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        activePersonality: state.activePersonality,
        theme: state.theme,
        fontScale: state.fontScale,
        density: state.density,
        animations: state.animations,
      }),
      onRehydrateStorage: () => (state) => {
        // Apply appearance once after rehydration
        if (state) {
          applyAppearance(state.theme, state.fontScale);
        }
      },
    }
  )
);
