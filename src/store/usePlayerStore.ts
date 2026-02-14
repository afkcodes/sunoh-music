import { AudioPro, AudioProRepeatMode, AudioProState, AudioProTrack, useAudioPro } from 'react-native-audio-pro';
import { create } from 'zustand';
import { audioService } from '../services/audio/AudioService';
import { mmkv } from './storage';

// ---------------------------------------------------------------------------
// App-only state – things the library doesn't track for us.
// Playback state (isPlaying, currentTrack, position, duration) comes from the
// library's `useAudioPro` hook — NO duplication here.
// ---------------------------------------------------------------------------

interface PlayerAppState {
  minimized: boolean;
  repeatMode: AudioProRepeatMode;
  shuffleMode: boolean;
  isInitialized: boolean;
  queue: AudioProTrack[];
  optimisticCurrentTrack: AudioProTrack | null;
  isFetching: boolean;
  radioId: string | null;
  radioProvider: 'saavn' | 'gaana' | 'unified' | null;

  // Actions
  play: (track?: AudioProTrack) => void;
  playQueue: (tracks: AudioProTrack[], startIndex?: number) => void;
  pause: () => void;
  resume: () => void;
  togglePlayPause: () => void;
  next: () => void;
  previous: () => void;
  seekTo: (time: number) => void;
  reorder: (fromIndex: number, toIndex: number) => void;
  skipToTrack: (index: number) => void;

  showMiniPlayer: () => void;
  hideMiniPlayer: () => void;

  setRepeatMode: (mode: AudioProRepeatMode) => void;
  setShuffleMode: (enabled: boolean) => void;
  toggleShuffle: () => void;

  syncQueue: () => void;
  playNext: (track: AudioProTrack) => void;
  addToQueue: (track: AudioProTrack) => void;
  setInitialized: (initialized: boolean) => void;
  setOptimisticCurrentTrack: (track: AudioProTrack | null) => void;
  setIsFetching: (isFetching: boolean) => void;
  setRadio: (radioId: string | null, provider: 'saavn' | 'gaana' | 'unified' | null) => void;
}

// ---------------------------------------------------------------------------
// Direct MMKV Read for Synchronous Hydraion
// (Avoids circular dependency or initialization timing issues with AudioService)
// ---------------------------------------------------------------------------
const STORAGE_KEYS = {
  QUEUE: 'audio_queue',
  CURRENT_INDEX: 'audio_current_index',
  POSITION: 'audio_position',
};

const getPersistedState = () => {
  try {
    const queueJson = mmkv.getString(STORAGE_KEYS.QUEUE);
    if (!queueJson) return null;

    const queue = JSON.parse(queueJson) as AudioProTrack[];
    const index = mmkv.getNumber(STORAGE_KEYS.CURRENT_INDEX) || 0;
    return { queue, index };
  } catch (e) {
    console.warn('Failed to hydrate player store:', e);
    return null;
  }
};

const persisted = getPersistedState();
const initialQueue = persisted?.queue || [];
const initialIndex = persisted?.index || 0;
// Only set optimistic track if we have a queue. 
const initialTrack = initialQueue.length > 0 && initialQueue[initialIndex] ? initialQueue[initialIndex] : null;

export const usePlayerStore = create<PlayerAppState>((set, get) => {

  // AudioPro is configured in index.js before App mounts.
  // Mark as initialized immediately since setup is already done.
  setTimeout(() => {
    get().setInitialized(true);
  }, 0);

  // NO addEventListener here – the library's internalStore already handles
  // event→state. AudioService handles event→persistence.

  return {
    minimized: true,
    queue: initialQueue,
    optimisticCurrentTrack: initialTrack,
    repeatMode: AudioProRepeatMode.OFF,
    shuffleMode: false,
    isInitialized: false,
    isFetching: false,
    radioId: null,
    radioProvider: null,

    play: (track) => {
      audioService.play(track);
      if (track) {
        set({ minimized: false, optimisticCurrentTrack: track });
      }
    },

    playQueue: (tracks, startIndex = 0) => {
      audioService.playQueue(tracks, startIndex);
      set({ queue: tracks, minimized: false });
    },

    pause: () => {
      audioService.pause();
    },

    resume: () => {
      audioService.play();
    },

    // #3 – optimistic: state now comes from internalStore which updates
    // immediately when the native event fires, so there's no lag.
    togglePlayPause: () => {
      const state = AudioPro.getPlaybackState();
      if (state === AudioProState.PLAYING) {
        audioService.pause();
      } else {
        audioService.play();
      }
    },

    next: () => audioService.next(),
    previous: () => audioService.previous(),
    seekTo: (time) => audioService.seekTo(time),
    reorder: (from, to) => {
      audioService.reorderMediaItem(from, to);
      get().syncQueue();
    },
    skipToTrack: (index) => audioService.skipToTrack(index),

    showMiniPlayer: () => set({ minimized: true }),
    hideMiniPlayer: () => set({ minimized: false }),

    setRepeatMode: (mode) => {
      audioService.setRepeatMode(mode);
      set({ repeatMode: mode });
    },

    setShuffleMode: (enabled) => {
      audioService.setShuffleModeEnabled(enabled);
      set({ shuffleMode: enabled });
    },

    toggleShuffle: () => {
      const { shuffleMode } = get();
      const newMode = !shuffleMode;
      audioService.setShuffleModeEnabled(newMode);
      set({ shuffleMode: newMode });
    },

    syncQueue: async () => {
      try {
        const queue = await audioService.getMediaItems();
        set({ queue });
      } catch (error) {
        console.warn('Failed to sync queue:', error);
      }
    },

    setInitialized: (initialized) => {
      set({ isInitialized: initialized });
      if (initialized) {
        get().syncQueue();
      }
    },

    setOptimisticCurrentTrack: (track) => set({ optimisticCurrentTrack: track }),

    playNext: (track) => {
      audioService.playNext(track);
      get().syncQueue();
    },

    addToQueue: (track) => {
      audioService.addToQueue(track);
      get().syncQueue();
    },
    setIsFetching: (isFetching) => set({ isFetching }),
    setRadio: (radioId, radioProvider) => set({ radioId, radioProvider }),
  };
});

// ---------------------------------------------------------------------------
// Re-export a convenience hook that merges app state + library playback state
// so consumers can still do `const { currentTrack, isPlaying, ... } = usePlayer();`
// ---------------------------------------------------------------------------

// Stable selectors – declared outside the hook so references never change.
const selectTrack = (s: { trackPlaying: AudioProTrack | null }) => s.trackPlaying;
const selectState = (s: { playerState: AudioProState }) => s.playerState;

export function usePlayer() {
  const appState = usePlayerStore();
  // Select primitives / stable refs individually – avoids creating a new
  // object each render which would break useSyncExternalStore's cache.
  const realCurrentTrack = useAudioPro(selectTrack);
  const playerState = useAudioPro(selectState);

  // Use the native track if available, otherwise fall back to the optimistic track
  // (This ensures the UI shows something immediately on launch)
  const currentTrack = realCurrentTrack || appState.optimisticCurrentTrack;

  // Once we have a real track from native, we can clear the optimistic one
  // to save memory/confusion, although keeping it doesn't hurt as `realCurrentTrack` takes precedence.
  // Using `useEffect` here might cause a re-render loop if we are not careful,
  // so we'll just rely on the fallback logic.

  return {
    ...appState,
    currentTrack,
    isPlaying: playerState === AudioProState.PLAYING,
    playerState,
  };
}
