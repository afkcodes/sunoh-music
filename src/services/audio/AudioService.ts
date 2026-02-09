import { AppState, AppStateStatus } from 'react-native';
import { AudioPro, AudioProContentType, AudioProEvent, AudioProEventType, AudioProRepeatMode, AudioProState, AudioProTrack } from 'react-native-audio-pro';
import { mmkv } from '../../store/storage';
import { urlRefreshLogic } from './URLRefreshLogic';

const STORAGE_KEYS = {
  QUEUE: 'audio_queue',
  CURRENT_INDEX: 'audio_current_index',
  POSITION: 'audio_position',
  REPEAT_MODE: 'audio_repeat_mode',
  SHUFFLE_MODE: 'audio_shuffle_mode',
  PLAYBACK_SPEED: 'audio_playback_speed',
  LAST_TRACK: 'audio_last_track',
};

/**
 * AudioService – the sole bridge between the app and react-native-audio-pro.
 *
 * Responsibilities:
 *  1. Configure the native player once.
 *  2. Persist / restore queue, position, and settings via MMKV.
 *  3. Provide a clean, fire-and-forget API for the rest of the app.
 *
 * It registers one `addEventListener` callback. The library's own internal
 * Zustand store already processes every event for UI state, so this listener
 * only handles persistence side-effects (no console.log spam, no state mgmt).
 */
class AudioService {
  private static instance: AudioService;
  private initialized = false;

  private constructor() {}

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  initialize(onInitialized?: () => void) {
    if (this.initialized) {
      onInitialized?.();
      return;
    }

    try {
      AudioPro.configure({
        progressIntervalMs: 1000,
        debug: __DEV__,
        contentType: AudioProContentType.MUSIC,
      });

      // Single listener – persistence only.
      AudioPro.addEventListener(this.handleAudioEvent);

      // Initialize URL refresh logic for expired stream URLs (Gaana)
      urlRefreshLogic.initialize();

      // Detect foreground returns after service death (swipe from recents).
      // The JS process can survive the swipe, so `initialized` stays true
      // and restoreState() wouldn't run again without this.
      AppState.addEventListener('change', this.handleAppStateChange);

      this.restoreState().finally(() => {
        this.initialized = true;
        onInitialized?.();
      });
    } catch (error) {
      console.error('Failed to initialize AudioService:', error);
      onInitialized?.();
    }
  }

  // ------------------------------------------------------------------
  // AppState – re-restore after service death
  // ------------------------------------------------------------------

  private isRestoring = false;

  private handleAppStateChange = (nextState: AppStateStatus) => {
    if (nextState !== 'active' || !this.initialized || this.isRestoring) return;

    const currentState = AudioPro.getState();
    // STOPPED = service was killed (emitted by handleBrowserDisconnected)
    // IDLE   = cold start or never initialized
    if (currentState === AudioProState.STOPPED || currentState === AudioProState.IDLE) {
      const hasPersistedQueue = mmkv.getString(STORAGE_KEYS.QUEUE);
      if (hasPersistedQueue) {
        if (__DEV__) console.log('[AudioService] Service died – re-restoring on foreground, state:', currentState);
        this.isRestoring = true;
        this.restoreState().finally(() => {
          this.isRestoring = false;
        });
      }
    }
  };

  // ------------------------------------------------------------------
  // Event handler – persistence side-effects only
  // ------------------------------------------------------------------

  private handleAudioEvent = (event: AudioProEvent) => {
    switch (event.type) {
      case AudioProEventType.TRACK_CHANGED:
        this.persistCurrentIndex();
        this.persistLastTrack(event.track);
        break;

      case AudioProEventType.PLAYBACK_SPEED_CHANGED:
        if (event.payload?.speed !== undefined) {
          mmkv.set(STORAGE_KEYS.PLAYBACK_SPEED, event.payload.speed);
        }
        break;

      case AudioProEventType.PROGRESS:
        // Persist position only when meaningful (> 1 s)
        if (event.payload?.position !== undefined && event.payload.position > 1000) {
          mmkv.set(STORAGE_KEYS.POSITION, event.payload.position);
        }
        break;

      case AudioProEventType.TRACK_ENDED:
        mmkv.remove(STORAGE_KEYS.POSITION);
        break;
    }
  };

  // ------------------------------------------------------------------
  // Persistence helpers
  // ------------------------------------------------------------------

  private async persistQueue() {
    try {
      const queue = await AudioPro.getQueue();
      mmkv.set(STORAGE_KEYS.QUEUE, JSON.stringify(queue));
    } catch (e) {
      console.warn('Failed to persist queue', e);
    }
  }

  private persistCurrentIndex() {
    const index = AudioPro.getActiveTrackIndex();
    mmkv.set(STORAGE_KEYS.CURRENT_INDEX, index);
  }

  private persistLastTrack(track: AudioProTrack | null) {
    if (track) {
      mmkv.set(STORAGE_KEYS.LAST_TRACK, JSON.stringify(track));
    }
  }

  // ------------------------------------------------------------------
  // Restoration  (#6 – removed fragile 100ms setTimeout,
  //               #12 – proper undefined checks for MMKV values)
  // ------------------------------------------------------------------

  private async restoreState(): Promise<void> {
    try {
      if (__DEV__) {
        console.log('[AudioService] Starting state restoration...');
      }
      
      // 1. Settings
      const repeatMode = mmkv.getString(STORAGE_KEYS.REPEAT_MODE) as AudioProRepeatMode | undefined;
      if (repeatMode) {
        AudioPro.setRepeatMode(repeatMode);
        if (__DEV__) console.log('[AudioService] Restored repeat mode:', repeatMode);
      }

      const shuffleMode = mmkv.getBoolean(STORAGE_KEYS.SHUFFLE_MODE);
      if (shuffleMode !== undefined) {
        AudioPro.setShuffleMode(shuffleMode);
        if (__DEV__) console.log('[AudioService] Restored shuffle mode:', shuffleMode);
      }

      const playbackSpeed = mmkv.getNumber(STORAGE_KEYS.PLAYBACK_SPEED);
      if (playbackSpeed !== undefined && playbackSpeed > 0) {
        AudioPro.setPlaybackSpeed(playbackSpeed);
        if (__DEV__) console.log('[AudioService] Restored playback speed:', playbackSpeed);
      }

      // 2. Queue + track position
      const queueJson = mmkv.getString(STORAGE_KEYS.QUEUE);
      if (!queueJson) { 
        if (__DEV__) console.log('[AudioService] No queue to restore');
        return; 
      }

      const queue = JSON.parse(queueJson) as AudioProTrack[];
      if (queue.length === 0) { 
        if (__DEV__) console.log('[AudioService] Queue is empty');
        return; 
      }

      if (__DEV__) console.log('[AudioService] Restoring queue with', queue.length, 'tracks');
      
      // addToQueue → skipTo/skipToWithSeek are all native calls that funnel
      // through ensureSession() on the native side, so ordering is guaranteed
      // without an arbitrary setTimeout.
      AudioPro.addToQueue(queue);

      const index = mmkv.getNumber(STORAGE_KEYS.CURRENT_INDEX);
      const position = mmkv.getNumber(STORAGE_KEYS.POSITION);

      if (index === undefined || index < 0 || index >= queue.length) {
        if (__DEV__) console.log('[AudioService] Invalid or missing index:', index);
        return;
      }

      if (__DEV__) console.log('[AudioService] Restoring to track index:', index, 'position:', position);

      if (position !== undefined && position > 0) {
        AudioPro.skipToWithSeek(index, position);
        if (__DEV__) console.log('[AudioService] Called skipToWithSeek with index:', index, 'position:', position);
      } else {
        AudioPro.skipTo(index);
        if (__DEV__) console.log('[AudioService] Called skipTo with index:', index);
      }
      
      // Give native side time to process and emit events
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Log final state for debugging
      if (__DEV__) {
        const finalState = AudioPro.getState();
        const finalTrack = AudioPro.getPlayingTrack();
        const finalTimings = AudioPro.getTimings();
        console.log('[AudioService] State restoration complete');
        console.log('[AudioService] Final state:', finalState);
        console.log('[AudioService] Final track:', finalTrack?.title);
        console.log('[AudioService] Final timings:', finalTimings);
      }
      
      // Never auto-start playback on restoration.
    } catch (e) {
      console.error('[AudioService] Failed to restore audio state:', e);
    }
  }

  // ------------------------------------------------------------------
  // Public API  (#2 – play(track) now skips to the added track,
  //              #7 – playQueue removed stop() race)
  // ------------------------------------------------------------------

  play(track?: AudioProTrack) {
    if (track) {
      AudioPro.addToQueue(track);
      // Skip to the newly appended track, then play
      AudioPro.getQueue().then((q) => {
        const targetIndex = q.length - 1;
        if (targetIndex >= 0) {
          AudioPro.skipTo(targetIndex);
        }
        AudioPro.play();
        this.persistQueue();
      });
    } else {
      AudioPro.play();
    }
  }

  playQueue(tracks: AudioProTrack[], startIndex: number = 0) {
    AudioPro.clearQueue();
    AudioPro.addToQueue(tracks);
    this.persistQueue();

    if (startIndex > 0) {
      AudioPro.skipTo(startIndex);
    }
    AudioPro.play();
  }

  pause() {
    AudioPro.pause();
  }

  stop() {
    AudioPro.stop();
    mmkv.remove(STORAGE_KEYS.POSITION);
  }

  next() {
    AudioPro.playNext();
  }

  previous() {
    AudioPro.playPrevious();
  }

  seekTo(time: number) {
    AudioPro.seekTo(time);
  }

  setVolume(volume: number) {
    AudioPro.setVolume(volume);
  }

  setRepeatMode(mode: AudioProRepeatMode) {
    AudioPro.setRepeatMode(mode);
    mmkv.set(STORAGE_KEYS.REPEAT_MODE, mode);
  }

  setShuffleMode(enabled: boolean) {
    AudioPro.setShuffleMode(enabled);
    mmkv.set(STORAGE_KEYS.SHUFFLE_MODE, enabled);
  }

  getQueue() {
    return AudioPro.getQueue();
  }

  addToQueue(tracks: AudioProTrack | AudioProTrack[]) {
    const tracksArray = Array.isArray(tracks) ? tracks : [tracks];
    AudioPro.addToQueue(tracksArray);
    this.persistQueue();
  }

  clearQueue() {
    AudioPro.clearQueue();
    mmkv.remove(STORAGE_KEYS.QUEUE);
    mmkv.remove(STORAGE_KEYS.CURRENT_INDEX);
    mmkv.remove(STORAGE_KEYS.POSITION);
  }
}

export const audioService = AudioService.getInstance();
