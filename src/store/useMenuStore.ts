import { create } from 'zustand';
import { Song } from '../types/album';

interface MenuState {
  visible: boolean;
  song: Song | null;
  showSongMenu: (song: Song) => void;
  hideSongMenu: () => void;
}

export const useMenuStore = create<MenuState>((set) => ({
  visible: false,
  song: null,
  showSongMenu: (song) => set({ visible: true, song }),
  hideSongMenu: () => set({ visible: false, song: null }),
}));
