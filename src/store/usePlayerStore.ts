import { create } from 'zustand';

export interface Track {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  url: string;
}

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  minimized: boolean;
  play: (track?: Track) => void;
  pause: () => void;
  resume: () => void;
  setTrack: (track: Track) => void;
  togglePlayPause: () => void;
  showMiniPlayer: () => void;
  hideMiniPlayer: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: {
    id: 'dummy-1',
    title: 'Move - Ye Ishq Ishq',
    artist: 'Dhurandhar',
    artwork: 'https://a10.gaanacdn.com/gn_img/albums/P7m3GNKqxo/m3G59a2Gbq/size_l_1765951390.jpg',
    url: ''
  },
  isPlaying: false,
  minimized: true,
  play: (track) => {
    if (track) {
      set({ currentTrack: track, isPlaying: true, minimized: true });
    } else {
      set({ isPlaying: true });
    }
  },
  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),
  setTrack: (track) => set({ currentTrack: track }),
  togglePlayPause: () => {
    const { isPlaying } = get();
    set({ isPlaying: !isPlaying });
  },
  showMiniPlayer: () => set({ minimized: true }),
  hideMiniPlayer: () => set({ minimized: false }), // Actually getting rid of it usually means null track
}));
