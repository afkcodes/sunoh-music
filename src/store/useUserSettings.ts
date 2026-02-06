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
  
  // Actions
  setLanguages: (languages: string[]) => void;
  toggleLanguage: (language: string) => void;
  setStreamingQuality: (quality: UserSettingsState['streamingQuality']) => void;
  setDownloadQuality: (quality: UserSettingsState['downloadQuality']) => void;
}

export const useUserSettings = create<UserSettingsState>()(
  persist(
    (set) => ({
      languages: ['hindi', 'english'],
      streamingQuality: 'High',
      downloadQuality: 'Ultra',

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
    }),
    {
      name: 'user-settings',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
