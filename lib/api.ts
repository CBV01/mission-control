/**
 * Mock API client — returns data with realistic latency.
 * In production, swap these to real `fetch('/api/...')` calls.
 */

import { delay } from './utils';
import {
  mockHealth, mockAgents, mockPipelines, mockKanban, mockLogs,
  mockCron, mockCredits, mockLeaderboard, mockTokenUsage,
  mockSkills, mockCalendar, mockIdeas, mockMedia, mockPosterQueue,
  mockPersonalities, mockMemory, mockNotifications,
} from './mockData';

export const api = {
  health: () => delay(mockHealth),
  agents: () => delay(mockAgents),
  pipelines: () => delay(mockPipelines),
  kanban: () => delay(mockKanban),
  logs: () => delay(mockLogs),
  cron: () => delay(mockCron),
  credits: () => delay(mockCredits),
  leaderboard: () => delay(mockLeaderboard),
  tokens: () => delay(mockTokenUsage),
  skills: () => delay(mockSkills),
  calendar: () => delay(mockCalendar),
  ideas: () => delay(mockIdeas),
  media: () => delay(mockMedia),
  posterQueue: () => delay(mockPosterQueue),
  personalities: () => delay(mockPersonalities),
  memory: () => delay(mockMemory),
  notifications: () => delay(mockNotifications),
};
