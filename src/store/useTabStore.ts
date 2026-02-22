import { create } from 'zustand';

interface TabState {
  tabIndex: number;
  setTabIndex: (index: number) => void;
}

export const useTabStore = create<TabState>((set) => ({
  tabIndex: 0,
  setTabIndex: (index) => set({ tabIndex: index }),
}));
