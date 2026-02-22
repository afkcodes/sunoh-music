import { AppState, AppStateStatus } from 'react-native';
import { AudioPro, AudioProEventType, type AudioProTrack } from 'react-native-audio-pro';
import { debugLogger } from '../../utils/debugLogger';

/**
 * Headless URL refresh logic for handling expired streaming URLs.
 * 
 * Strategy:
 * - Sliding Window: On track change, pre-refresh next and previous tracks
 * - Error Recovery: On playback error, refresh current track and retry, then skip if still fails
 * - Position Preservation: Save position on background, restore on foreground if reset
 * 
 * Required for providers like Gaana where streaming URLs expire after a period.
 */

export class URLRefreshLogic {
  private static instance: URLRefreshLogic;
  private subscription: any;
  private appStateSubscription: any;
  private lastActiveTimestamp: number = Date.now();
  private lastBackgroundTimestamp: number = 0;

  // Position preservation for background/foreground transitions
  private savedPositionBeforeBackground: number = 0;
  private savedTrackIdBeforeBackground: string | null = null;
  private positionCheckTimeout: any = null;

  // Error retry tracking
  private errorRetryCount: Map<string, number> = new Map();
  private readonly MAX_ERROR_RETRIES = 2;

  // Cache for tracking last refresh timestamps to avoid redundant API calls
  private lastRefreshMap: Map<string, number> = new Map();
  // 30 minutes throttle window
  private readonly REFRESH_THROTTLE_MS = 30 * 60 * 1000;
  // Stabilization window after app comes to foreground - ignore all refreshes
  private readonly FOREGROUND_STABILIZATION_MS = 5000;

  private constructor() { }

  static getInstance(): URLRefreshLogic {
    if (!URLRefreshLogic.instance) {
      URLRefreshLogic.instance = new URLRefreshLogic();
    }
    return URLRefreshLogic.instance;
  }

  /**
   * Refresh the stream URL for a track at a given index
   * @param index The track index in the queue
   * @param track The track object
   */
  public async refreshTrackUrl(index: number, track: AudioProTrack) {
    if (!track || !track.id) return;

    // Never update the currently playing track — replaceMediaItem resets position.
    // The sliding window already ensures adjacent tracks have fresh URLs, so on
    // error we just skip to next instead.
    const currentIndex = AudioPro.getCurrentMediaItemIndex();
    if (index === currentIndex) {
      if (__DEV__) console.log(`[URLRefresh] Skipping current track at index ${index}`);
      return;
    }

    const source = (track as any).source || 'saavn';
    const now = Date.now();
    const lastRefresh = this.lastRefreshMap.get(track.id) || 0;

    const hasNoUrl = !track.url || track.url === '';

    // throttling: skip if refreshed recently, unless URL is missing
    if (!hasNoUrl && (now - lastRefresh < this.REFRESH_THROTTLE_MS)) {
      if (__DEV__) {
        console.log(`[URLRefresh] Skipping refresh for ${track.title} (refreshed ${Math.round((now - lastRefresh) / 60000)}m ago)`);
      }
      return;
    }

    // Only proactive-refresh for Gaana tracks, unless URL is missing
    if (!hasNoUrl && source !== 'gaana') {
      return;
    }

    if (__DEV__) {
      console.log(`[URLRefresh] Fetching new URL for track ${index}: ${track.title} (source: ${source}, missingUrl: ${hasNoUrl})`);
    }

    try {
      const apiUrl = `https://api.sunoh.online/music/song/${track.id}/stream?provider=${source}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const json = await response.json();

      if (json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
        const links = json.data;
        let newUrl = links[0].link;

        const high = links.find((l: any) => l.quality === 'high' || l.quality === '320kbps');
        const medium = links.find((l: any) => l.quality === 'medium' || l.quality === '160kbps');

        if (high) newUrl = high.link;
        else if (medium) newUrl = medium.link;

        if (newUrl) {
          // Update last refresh timestamp even if URL is same (API call happened)
          this.lastRefreshMap.set(track.id, Date.now());

          if (newUrl !== track.url) {
            if (__DEV__) {
              console.log(`[URLRefresh] Updating track ${index} with new URL`);
            }
            debugLogger.log('URL_REFRESH', { index, title: track.title, source });
            AudioPro.updateTrack(index, {
              ...track,
              url: newUrl,
            });
          }
        }
      }
    } catch (error) {
      console.error(`[URLRefresh] Error fetching stream for ${track.id}:`, error);
    }
  }

  /**
   * Fetch a fresh URL for a track (used for error recovery on current track)
   * Returns the new URL or null if failed
   */
  private async fetchFreshUrl(track: AudioProTrack): Promise<string | null> {
    if (!track || !track.id) return null;

    const source = (track as any).source || 'saavn';

    if (__DEV__) {
      console.log(`[URLRefresh] Fetching fresh URL for: ${track.title} (source: ${source})`);
    }

    try {
      const apiUrl = `https://api.sunoh.online/music/song/${track.id}/stream?provider=${source}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const json = await response.json();

      if (json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
        const links = json.data;
        let newUrl = links[0].link;

        const high = links.find((l: any) => l.quality === 'high' || l.quality === '320kbps');
        const medium = links.find((l: any) => l.quality === 'medium' || l.quality === '160kbps');

        if (high) newUrl = high.link;
        else if (medium) newUrl = medium.link;

        if (newUrl) {
          this.lastRefreshMap.set(track.id, Date.now());
          return newUrl;
        }
      }
      return null;
    } catch (error) {
      console.error(`[URLRefresh] Error fetching stream for ${track.id}:`, error);
      return null;
    }
  }

  /**
   * Handle error recovery: Try to refresh current track and retry, skip to next if fails
   */
  private async handlePlaybackError(index: number, errorMessage: string) {
    const queue = await AudioPro.getMediaItems();
    if (index >= queue.length) return;

    const track = queue[index];
    if (!track) return;

    const trackId = track.id;
    const retryCount = this.errorRetryCount.get(trackId) || 0;

    if (__DEV__) {
      console.log(`[URLRefresh] Playback error at index ${index}: ${errorMessage}. Retry count: ${retryCount}/${this.MAX_ERROR_RETRIES}`);
    }
    debugLogger.log('URL_REFRESH', { event: 'playback_error', index, title: track.title, retryCount });

    // If we haven't exceeded max retries, try to refresh and replay current track
    if (retryCount < this.MAX_ERROR_RETRIES) {
      this.errorRetryCount.set(trackId, retryCount + 1);

      // Stop playback FIRST so Media3 stops retrying with the stale URL.
      // This prevents a race where Media3 retries the old URL while we're
      // fetching the fresh one, potentially putting the player in a deeper
      // error state by the time we call play().
      AudioPro.stop();

      const newUrl = await this.fetchFreshUrl(track);

      if (newUrl && newUrl !== track.url) {
        if (__DEV__) {
          console.log(`[URLRefresh] Got fresh URL for current track, updating and replaying`);
        }
        debugLogger.log('URL_REFRESH', { event: 'retry_with_fresh_url', index, title: track.title });

        // Update the track with fresh URL.
        // stop() already moved the player to STOPPED/IDLE so replaceMediaItem
        // is safe — no race with Media3's internal retry timer.
        AudioPro.updateTrack(index, {
          ...track,
          url: newUrl,
        });

        // Wait for the UI-thread updateTrack to settle before triggering play.
        // play(null) handles STATE_IDLE by calling prepare() then play().
        setTimeout(() => {
          AudioPro.play();
        }, 300);

        return;
      } else {
        if (__DEV__) {
          console.log(`[URLRefresh] Failed to get fresh URL, will skip to next`);
        }
      }
    } else {
      if (__DEV__) {
        console.log(`[URLRefresh] Max retries exceeded for ${track.title}, skipping to next`);
      }
      debugLogger.log('URL_REFRESH', { event: 'max_retries_exceeded', index, title: track.title });
    }

    // Clear retry count for this track (we're moving on)
    this.errorRetryCount.delete(trackId);

    // Skip to next track (but refresh it first if possible)
    const nextIndex = index + 1;
    if (nextIndex < queue.length) {
      const nextTrack = queue[nextIndex];
      if (nextTrack) {
        await this.refreshTrackUrl(nextIndex, nextTrack);
      }
    }
    AudioPro.seekToNextMediaItem();
  }

  /**
   * Handle app state changes for position preservation
   */
  private handleAppStateChange = async (nextState: AppStateStatus) => {
    if (nextState === 'background' || nextState === 'inactive') {
      // Save current position before going to background
      try {
        const progress = AudioPro.getTimings();
        const currentIndex = AudioPro.getCurrentMediaItemIndex();
        const queue = await AudioPro.getMediaItems();
        
        if (currentIndex >= 0 && currentIndex < queue.length) {
          this.savedPositionBeforeBackground = progress.position;
          this.savedTrackIdBeforeBackground = queue[currentIndex]?.id || null;
          
          if (__DEV__) {
            console.log(`[URLRefresh] Saved position before background: ${progress.position}ms for track ${this.savedTrackIdBeforeBackground}`);
          }
        }
      } catch (e) {
        console.warn('[URLRefresh] Failed to save position before background', e);
      }
      
      this.lastBackgroundTimestamp = Date.now();
    } else if (nextState === 'active') {
      this.lastActiveTimestamp = Date.now();
      
      // Check and restore position after a small delay (let native player settle)
      if (this.positionCheckTimeout) {
        clearTimeout(this.positionCheckTimeout);
      }
      
      this.positionCheckTimeout = setTimeout(async () => {
        await this.checkAndRestorePosition();
      }, 500);
    }
  };

  /**
   * Check if position was reset and restore it
   */
  private async checkAndRestorePosition() {
    if (!this.savedTrackIdBeforeBackground || this.savedPositionBeforeBackground <= 1000) {
      return; // Nothing meaningful to restore
    }

    try {
      const progress = AudioPro.getTimings();
      const currentIndex = AudioPro.getCurrentMediaItemIndex();
      const queue = await AudioPro.getMediaItems();

      if (currentIndex >= 0 && currentIndex < queue.length) {
        const currentTrackId = queue[currentIndex]?.id;

        // Only restore if same track and position was reset
        if (currentTrackId === this.savedTrackIdBeforeBackground && progress.position < 1000) {
          if (__DEV__) {
            console.log(`[URLRefresh] Position was reset to ${progress.position}ms, restoring to ${this.savedPositionBeforeBackground}ms`);
          }
          debugLogger.log('URL_REFRESH', { 
            event: 'position_restored', 
            from: progress.position, 
            to: this.savedPositionBeforeBackground 
          });

          AudioPro.seekTo(this.savedPositionBeforeBackground);
        }
      }
    } catch (e) {
      console.warn('[URLRefresh] Failed to check/restore position', e);
    }

    // Clear saved position
    this.savedPositionBeforeBackground = 0;
    this.savedTrackIdBeforeBackground = null;
  }

  /**
   * Initialize the URL refresh logic
   */
  initialize() {
    if (this.subscription) {
      return;
    }

    // Use the class method for AppState handling (position preservation)
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);

    this.subscription = AudioPro.addEventListener((event) => {
      if (event.type === AudioProEventType.TRACK_CHANGED) {
        // Clear error retry count when track changes successfully
        const { index } = event.payload || {};
        if (typeof index === 'number') {
          AudioPro.getMediaItems().then((queue) => {
            if (index >= 0 && index < queue.length) {
              const trackId = queue[index]?.id;
              if (trackId) {
                this.errorRetryCount.delete(trackId);
              }
            }
          });
        }

        // DEFENSE: Full stabilization check after app comes to foreground.
        // The issue is that when JS reloads or app wakes up, native events may fire
        // BEFORE the AppState listener updates lastActiveTimestamp. So we also check
        // if we recently came from background (within stabilization window).
        const now = Date.now();
        const timeSinceActive = now - this.lastActiveTimestamp;
        const timeSinceBackground = now - this.lastBackgroundTimestamp;
        const recentlyForegrounded = timeSinceActive < this.FOREGROUND_STABILIZATION_MS || 
                                      timeSinceBackground < this.FOREGROUND_STABILIZATION_MS;
        
        if (recentlyForegrounded) {
          debugLogger.log('SYSTEM', `URLRefresh: Ignoring TRACK_CHANGED (stabilization: active=${timeSinceActive}ms, bg=${timeSinceBackground}ms)`);
          return;
        }

        if (typeof index === 'number') {
          // Pre-refresh adjacent tracks (NOT current - that would reset position)
          // Current track is only refreshed on PLAYBACK_ERROR
          AudioPro.getMediaItems().then((queue) => {
            // Refresh NEXT track
            const nextIndex = index + 1;
            if (nextIndex < queue.length) {
              const nextTrack = queue[nextIndex];
              if (nextTrack) {
                if (__DEV__) console.log(`[URLRefresh] Proactively refreshing next track at index ${nextIndex}`);
                this.refreshTrackUrl(nextIndex, nextTrack);
              }
            }
            // Refresh PREVIOUS track
            const prevIndex = index - 1;
            if (prevIndex >= 0) {
              const prevTrack = queue[prevIndex];
              if (prevTrack) {
                if (__DEV__) console.log(`[URLRefresh] Proactively refreshing prev track at index ${prevIndex}`);
                this.refreshTrackUrl(prevIndex, prevTrack);
              }
            }
          });
        }
      } else if (event.type === AudioProEventType.PLAYBACK_ERROR) {
        // Error Recovery: Try to refresh current track and retry, skip if fails
        // Skip during startup stabilization window to avoid interfering with cold-start restore
        const nowErr = Date.now();
        const timeSinceActiveErr = nowErr - this.lastActiveTimestamp;
        const timeSinceBgErr = nowErr - this.lastBackgroundTimestamp;
        const startupStabilizing = timeSinceActiveErr < this.FOREGROUND_STABILIZATION_MS ||
                                    timeSinceBgErr < this.FOREGROUND_STABILIZATION_MS;
        if (startupStabilizing) {
          debugLogger.log('SYSTEM', `URLRefresh: Ignoring PLAYBACK_ERROR (stabilization: active=${timeSinceActiveErr}ms, bg=${timeSinceBgErr}ms)`);
          return;
        }

        const { index } = event.payload || {};
        const errorMessage = event.payload?.error || 'Unknown error';

        if (typeof index === 'number') {
          this.handlePlaybackError(index, errorMessage);
        }
      }
    });

    if (__DEV__) {
      console.log('[URLRefresh] Initialized (Optimized Sliding Window + Error Recovery + Position Preservation)');
    }
  }

  /**
   * Clean up the URL refresh logic
   */
  destroy() {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    if (this.positionCheckTimeout) {
      clearTimeout(this.positionCheckTimeout);
      this.positionCheckTimeout = null;
    }
  }
}

export const urlRefreshLogic = URLRefreshLogic.getInstance();
