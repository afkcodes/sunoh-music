import { AudioPro, AudioProEventType, AudioProRepeatMode, AudioProState, AudioProTrack } from 'react-native-audio-pro';
import { create } from 'zustand';
import { audioService } from '../services/audio/AudioService';

interface PlayerState {
  currentTrack: AudioProTrack | null;
  isPlaying: boolean;
  minimized: boolean;
  queue: AudioProTrack[];
  repeatMode: AudioProRepeatMode;
  shuffleMode: boolean;
  
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
}

// Initialize audio service
audioService.initialize();

export const usePlayerStore = create<PlayerState>((set, get) => {
  
  // Subscribe to audio events to sync store
  AudioPro.addEventListener((event) => {
    switch (event.type) {
      case AudioProEventType.STATE_CHANGED:
        if (event.payload?.state) {
            set({ isPlaying: event.payload.state === AudioProState.PLAYING });
        }
        break;
      case AudioProEventType.TRACK_CHANGED:
        set({ currentTrack: event.track }); // track is on root
        break;
      // AudioProEventType doesn't have queue changed, so we rely on manual refresh/sync if needed
      // or assume the queue is managed by AudioService persistence.
      // If we need queue in UI, we should probably fetch it.
    }
  });

  return {
    currentTrack: null, // Initial state, will be updated by event or restore
    isPlaying: false,
    minimized: true,
    queue: [],
    repeatMode: AudioProRepeatMode.OFF,
    shuffleMode: false,

    play: (track) => {
      audioService.play(track);
      if (track) {
         set({ currentTrack: track, isPlaying: true, minimized: false });
      } else {
         set({ isPlaying: true });
      }
    },

    playQueue: (tracks, startIndex = 0) => {
        audioService.playQueue(tracks, startIndex);
        set({ 
            queue: tracks,
            currentTrack: tracks[startIndex],
            isPlaying: true,
            minimized: false 
        });
    },

    pause: () => {
      audioService.pause();
      set({ isPlaying: false });
    },

    resume: () => {
        audioService.play();
        set({ isPlaying: true });
    },

    togglePlayPause: () => {
      const { isPlaying } = get();
      if (isPlaying) {
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
        audioService.setShuffleMode(enabled);
        set({ shuffleMode: enabled });
    }
  };
});
