import { AudioPro, AudioProContentType, AudioProEvent, AudioProEventType, AudioProRepeatMode, AudioProTrack } from 'react-native-audio-pro';
import { mmkv } from '../../store/storage';

const STORAGE_KEYS = {
  QUEUE: 'audio_queue',
  CURRENT_INDEX: 'audio_current_index',
  POSITION: 'audio_position',
  REPEAT_MODE: 'audio_repeat_mode',
  SHUFFLE_MODE: 'audio_shuffle_mode',
  PLAYBACK_SPEED: 'audio_playback_speed',
  LAST_TRACK: 'audio_last_track',
};

class AudioService {
  private static instance: AudioService;
  private initialized = false;
  private pendingPosition: number | null = null;

  private constructor() {}

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  initialize() {
    if (this.initialized) return;

    // Configure AudioPro
    AudioPro.configure({
      progressIntervalMs: 500,
      debug: false, // Set to true if debugging is needed
      contentType: AudioProContentType.MUSIC,
      
    });

    // Listen to events
    AudioPro.addEventListener(this.handleAudioEvent);

    // Restore settings & queue
    this.restoreState();

    this.initialized = true;
  }

  private handleAudioEvent = (event: AudioProEvent) => {
    switch (event.type) {
      case AudioProEventType.TRACK_CHANGED:
        this.persistCurrentIndex();
        this.persistLastTrack(event.track);

        // If we have a pending seek from restoration, execute it now that the track is ready
        if (this.pendingPosition !== null) {
          const posToSeek = this.pendingPosition;
          this.pendingPosition = null; // Clear first to avoid double-seek if index changes again
          AudioPro.seekTo(posToSeek);
        }
        break;
      case AudioProEventType.PLAYBACK_SPEED_CHANGED:
        if (event.payload?.speed) {
            mmkv.set(STORAGE_KEYS.PLAYBACK_SPEED, event.payload.speed);
        }
        break;
      case AudioProEventType.PROGRESS:
        if (event.payload?.position !== undefined) {
          mmkv.set(STORAGE_KEYS.POSITION, event.payload.position);
        }
        break;
      case AudioProEventType.TRACK_ENDED:
        mmkv.remove(STORAGE_KEYS.POSITION);
        break;
    }
  };

  // --- Persistence ---

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

  private async restoreState() {
    try {
      // 1. Restore Settings
      const repeatMode = mmkv.getString(STORAGE_KEYS.REPEAT_MODE) as AudioProRepeatMode;
      if (repeatMode) AudioPro.setRepeatMode(repeatMode);

      const shuffleMode = mmkv.getBoolean(STORAGE_KEYS.SHUFFLE_MODE);
      if (shuffleMode !== undefined) AudioPro.setShuffleMode(shuffleMode);

      const playbackSpeed = mmkv.getNumber(STORAGE_KEYS.PLAYBACK_SPEED);
      if (playbackSpeed) AudioPro.setPlaybackSpeed(playbackSpeed);

      // 2. Restore Queue
      const queueJson = mmkv.getString(STORAGE_KEYS.QUEUE);
      if (queueJson) {
        const queue = JSON.parse(queueJson) as AudioProTrack[];
        if (queue.length > 0) {
            // Add to queue but don't play yet
            AudioPro.addToQueue(queue);
            
            // Restore index
            const index = mmkv.getNumber(STORAGE_KEYS.CURRENT_INDEX);
            if (index !== undefined && index >= 0 && index < queue.length) {
                // We use skipTo to set the index. 
                // Since we removed enginerBrowser?.play() from native skipTo, 
                // it will now naturally stay paused during restoration.
                AudioPro.skipTo(index);

                // Restore position
                const position = mmkv.getNumber(STORAGE_KEYS.POSITION);
                if (position && position > 0) {
                    // We store it as pending and seek once TRACK_CHANGED fires.
                    // This avoids calling seekTo before the player is ready.
                    this.pendingPosition = position;
                }
                
                AudioPro.skipTo(index);
            }
        }
      }
    } catch (e) {
      console.error('Failed to restore audio state', e);
    }
  }

  // --- Public API Passthrough ---

  play(track?: AudioProTrack) {
    if (track) {
      AudioPro.addToQueue(track);
      this.persistQueue(); // Persist queue since we added
      AudioPro.play(); 
    } else {
      AudioPro.play();
    }
  }

  playQueue(tracks: AudioProTrack[], startIndex: number = 0) {
      AudioPro.stop();
      AudioPro.clearQueue();
      AudioPro.addToQueue(tracks);
      
      // Persist immediately
      this.persistQueue();
      
      if (startIndex !== 0) {
          AudioPro.skipTo(startIndex);
      }
      AudioPro.play();
  }

  pause() {
    AudioPro.pause();
  }

  stop() {
    AudioPro.stop();
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

  clearQueue() {
      AudioPro.clearQueue();
      mmkv.remove(STORAGE_KEYS.QUEUE);
      mmkv.remove(STORAGE_KEYS.CURRENT_INDEX);
      mmkv.remove(STORAGE_KEYS.POSITION);
  }

}

export const audioService = AudioService.getInstance();
