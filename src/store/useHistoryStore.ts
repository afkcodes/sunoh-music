import { create } from 'zustand';
import { appAnalytics } from '../services/analytics/AnalyticsService';
import { SaavnItem } from '../types/saavn';
import { mmkv } from './storage';

export interface HistoryItem {
  item: SaavnItem;
  timestamp: number;
  provider: 'saavn' | 'gaana' | 'spotify' | 'unified';
}

interface HistoryState {
  recentlyPlayed: HistoryItem[];
  addToHistory: (item: SaavnItem, provider: 'saavn' | 'gaana' | 'spotify' | 'unified') => void;
  clearHistory: () => void;
}

const HISTORY_KEY = 'app_playback_history';
const MAX_HISTORY = 30;

const getPersistedData = (): HistoryItem[] => {
  try {
    const json = mmkv.getString(HISTORY_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.warn(`Failed to load history data`, e);
    return [];
  }
};

export const useHistoryStore = create<HistoryState>((set, get) => ({
  recentlyPlayed: getPersistedData(),

  addToHistory: (item, provider) => {
    // Only add playable/navigable items that have reasonable artwork/title
    if (!item || !item.id) return;

    // Check if it's already in history
    const { recentlyPlayed } = get();
    const filteredHistory = recentlyPlayed.filter(i => i.item.id !== item.id);

    // Track analytics play
    appAnalytics.logSongPlay({
      id: item.id || item.token || 'unknown',
      title: item.title,
      artist: item.subTitle,
      provider: provider,
    });

    // Add to the top
    const newHistory = [
      { item, timestamp: Date.now(), provider },
      ...filteredHistory
    ].slice(0, MAX_HISTORY);

    set({ recentlyPlayed: newHistory });
    mmkv.set(HISTORY_KEY, JSON.stringify(newHistory));
  },

  clearHistory: () => {
    set({ recentlyPlayed: [] });
    mmkv.remove(HISTORY_KEY);
  }
}));
