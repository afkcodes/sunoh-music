import { AudioPro, AudioProRepeatMode, AudioProState, AudioProTrack, useAudioPro } from 'react-native-audio-pro';
import { create } from 'zustand';
import { audioService } from '../services/audio/AudioService';

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

  // Actions
  play: (track?: AudioProTrack) => void;
  playQueue: (tracks: AudioProTrack[], startIndex?: number) => void;
  pause: () => void;
  resume: () => void;
  togglePlayPause: () => void;
  next: () => void;
  previous: () => void;
  seekTo: (time: number) => void;

  showMiniPlayer: () => void;
  hideMiniPlayer: () => void;

  setRepeatMode: (mode: AudioProRepeatMode) => void;
  setShuffleMode: (enabled: boolean) => void;

  syncQueue: () => void;
  setInitialized: (initialized: boolean) => void;
}

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
    queue: [],
    repeatMode: AudioProRepeatMode.OFF,
    shuffleMode: false,
    isInitialized: false,

    play: (track) => {
      audioService.play(track);
      if (track) {
        set({ minimized: false });
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
  const currentTrack = useAudioPro(selectTrack);
  const playerState = useAudioPro(selectState);

  return {
    ...appState,
    currentTrack,
    isPlaying: playerState === AudioProState.PLAYING,
  };
}
