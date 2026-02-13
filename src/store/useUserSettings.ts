import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mmkv } from './storage';

/**
 * MMKV Storage connector for Zustand persist middleware
 */
const mmkvStorage = {
  getItem: (name: string) => {
    return mmkv.getString(name) ?? null;
  },
  setItem: (name: string, value: string) => {
    mmkv.set(name, value);
  },
  removeItem: (name: string) => {
    mmkv.remove(name);
  },
};

interface UserSettingsState {
  languages: string[];
  streamingQuality: 'Low' | 'Medium' | 'High' | 'Ultra';
  downloadQuality: 'Low' | 'Medium' | 'High' | 'Ultra';
  skipSilence: boolean;
  gaplessPlayback: boolean;
  dynamicThemes: boolean;

  // Auto-Queue Settings
  autoQueueEnabled: boolean;
  autoQueueThreshold: number; // Number of songs remaining before fetching (1-5)

  // Actions
  setLanguages: (languages: string[]) => void;
  toggleLanguage: (language: string) => void;
  setStreamingQuality: (quality: UserSettingsState['streamingQuality']) => void;
  setDownloadQuality: (quality: UserSettingsState['downloadQuality']) => void;
  setSkipSilence: (enabled: boolean) => void;
  setGaplessPlayback: (enabled: boolean) => void;
  setDynamicThemes: (enabled: boolean) => void;
  setAutoQueueEnabled: (enabled: boolean) => void;
  setAutoQueueThreshold: (threshold: number) => void;
}

export const useUserSettings = create<UserSettingsState>()(
  persist(
    (set) => ({
      languages: ['hindi', 'english'],
      streamingQuality: 'High',
      downloadQuality: 'Ultra',
      skipSilence: false,
      gaplessPlayback: true,
      dynamicThemes: true,
      autoQueueEnabled: true, // Enabled by default
      autoQueueThreshold: 3, // Fetch when 3 songs remaining

      setLanguages: (languages) => set({ languages }),

      toggleLanguage: (language) => set((state) => {
        const isSelected = state.languages.includes(language);
        if (isSelected) {
          // Keep at least one language
          if (state.languages.length <= 1) return state;
          return { languages: state.languages.filter((l) => l !== language) };
        }
        return { languages: [...state.languages, language] };
      }),

      setStreamingQuality: (streamingQuality) => set({ streamingQuality }),
      setDownloadQuality: (downloadQuality) => set({ downloadQuality }),
      setSkipSilence: (skipSilence) => set({ skipSilence }),
      setGaplessPlayback: (gaplessPlayback) => set({ gaplessPlayback }),
      setDynamicThemes: (dynamicThemes) => set({ dynamicThemes }),
      setAutoQueueEnabled: (autoQueueEnabled) => set({ autoQueueEnabled }),
      setAutoQueueThreshold: (threshold) => {
        // Clamp threshold between 1 and 5
        const clampedThreshold = Math.max(1, Math.min(5, threshold));
        set({ autoQueueThreshold: clampedThreshold });
      },
    }),
    {
      name: 'user-settings',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
