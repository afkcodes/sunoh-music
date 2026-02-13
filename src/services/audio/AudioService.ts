import { AppState, AppStateStatus } from 'react-native';
import { AudioPro, AudioProEvent, AudioProEventType, AudioProRepeatMode, AudioProTrack } from 'react-native-audio-pro';
import { mmkv } from '../../store/storage';
import { debugLogger } from '../../utils/debugLogger';

const STORAGE_KEYS = {
  QUEUE: 'audio_queue',
  CURRENT_INDEX: 'audio_current_index',
  POSITION: 'audio_position',
  REPEAT_MODE: 'audio_repeat_mode',
  SHUFFLE_MODE: 'audio_shuffle_mode',
  PLAYBACK_SPEED: 'audio_playback_speed',
};

/**
 * AudioService – thin wrapper around react-native-audio-pro.
 *
 * Responsibilities:
 *  1. Persist queue, position, and settings via MMKV for cold start restoration.
 *  2. Provide a clean API for the rest of the app.
 *
 * Note: Configuration and restoration happen in index.js before App mounts.
 * This service only handles persistence and API delegation.
 */
class AudioService {
  private static instance: AudioService;
  private listenerAdded = false;

  private constructor() { }

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  /**
   * Start listening for events to persist state.
   * Called from index.js after configure().
   */
  startPersistence() {
    if (this.listenerAdded) return;
    this.listenerAdded = true;
    AudioPro.addEventListener(this.handleAudioEvent);
    AppState.addEventListener('change', this.handleAppStateChange);
    debugLogger.log('SYSTEM', 'Persistence started');
  }

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    debugLogger.log('APP_STATE', nextAppState);
  };

  private handleAudioEvent = (event: AudioProEvent) => {
    // Basic event info
    const logData: any = { type: event.type };

    // Add specific payload data we care about
    if (event.payload) {
      if (event.payload.position !== undefined) logData.position = event.payload.position;
      if (event.payload.state !== undefined) logData.state = event.payload.state;
      if (event.payload.index !== undefined) logData.index = event.payload.index;
      if (event.payload.speed !== undefined) logData.speed = event.payload.speed;
    }

    debugLogger.log('AUDIO_EVENT', logData);

    switch (event.type) {
      case AudioProEventType.TRACK_CHANGED:
        this.persistCurrentIndex();
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

  private async persistQueue() {
    try {
      const queue = await AudioPro.getMediaItems();
      mmkv.set(STORAGE_KEYS.QUEUE, JSON.stringify(queue));
    } catch (e) {
      console.warn('Failed to persist queue', e);
    }
  }

  private persistCurrentIndex() {
    const index = AudioPro.getCurrentMediaItemIndex();
    mmkv.set(STORAGE_KEYS.CURRENT_INDEX, index);
  }

  // ------------------------------------------------------------------
  // Static restoration helpers (called from index.js)
  // ------------------------------------------------------------------

  static getPersistedSettings() {
    return {
      repeatMode: mmkv.getString(STORAGE_KEYS.REPEAT_MODE) as AudioProRepeatMode | undefined,
      shuffleMode: mmkv.getBoolean(STORAGE_KEYS.SHUFFLE_MODE),
      playbackSpeed: mmkv.getNumber(STORAGE_KEYS.PLAYBACK_SPEED),
    };
  }

  static getPersistedQueue() {
    const queueJson = mmkv.getString(STORAGE_KEYS.QUEUE);
    if (!queueJson) return null;

    try {
      const queue = JSON.parse(queueJson) as AudioProTrack[];
      const index = mmkv.getNumber(STORAGE_KEYS.CURRENT_INDEX) || 0;
      const position = mmkv.getNumber(STORAGE_KEYS.POSITION) || 0;
      return { queue, index, position };
    } catch {
      return null;
    }
  }

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------

  play(track?: AudioProTrack) {
    if (track) {
      AudioPro.addMediaItems([track]);
      AudioPro.getMediaItems().then((q) => {
        const targetIndex = q.length - 1;
        if (targetIndex >= 0) {
          AudioPro.seekToMediaItem(targetIndex);
        }
        AudioPro.play();
        this.persistQueue();
      });
    } else {
      AudioPro.play();
    }
  }

  playQueue(tracks: AudioProTrack[], startIndex: number = 0) {
    AudioPro.clearMediaItems();
    AudioPro.addMediaItems(tracks);
    if (startIndex > 0) {
      AudioPro.seekToMediaItem(startIndex);
    }
    AudioPro.play();
    this.persistQueue();
  }


  playNext(track: AudioProTrack) {
    const currentIndex = AudioPro.getCurrentMediaItemIndex();
    // Insert after current index. If -1, inserts at 0.
    AudioPro.addMediaItemsAt(currentIndex + 1, [track]);
    this.persistQueue();
  }

  addToQueue(track: AudioProTrack) {
    AudioPro.addMediaItems([track]);
    this.persistQueue();
  }

  pause() {
    AudioPro.pause();
  }

  stop() {
    AudioPro.stop();
    mmkv.remove(STORAGE_KEYS.POSITION);
  }

  next() {
    AudioPro.seekToNextMediaItem();
  }

  previous() {
    AudioPro.seekToPreviousMediaItem();
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

  setShuffleModeEnabled(enabled: boolean) {
    AudioPro.setShuffleModeEnabled(enabled);
    mmkv.set(STORAGE_KEYS.SHUFFLE_MODE, enabled);
  }

  getMediaItems() {
    return AudioPro.getMediaItems();
  }

  addMediaItems(tracks: AudioProTrack | AudioProTrack[]) {
    const tracksArray = Array.isArray(tracks) ? tracks : [tracks];
    AudioPro.addMediaItems(tracksArray);
    this.persistQueue();
  }

  clearMediaItems() {
    AudioPro.clearMediaItems();
    mmkv.remove(STORAGE_KEYS.QUEUE);
    mmkv.remove(STORAGE_KEYS.CURRENT_INDEX);
    mmkv.remove(STORAGE_KEYS.POSITION);
  }

  reorderMediaItem(fromIndex: number, toIndex: number) {
    AudioPro.moveMediaItem(fromIndex, toIndex);
    this.persistQueue();
  }

  skipToTrack(index: number) {
    AudioPro.seekToMediaItem(index);
    AudioPro.play();
  }
}

export const audioService = AudioService.getInstance();
export { AudioService };
