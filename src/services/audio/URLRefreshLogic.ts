import { AudioPro, AudioProEventType, type AudioProTrack } from 'react-native-audio-pro';
import { debugLogger } from '../../utils/debugLogger';

/**
 * Headless URL refresh logic for handling expired streaming URLs.
 * 
 * Strategy:
 * - Sliding Window: On track change, pre-refresh next and previous tracks
 * - Error Recovery: On playback error, refresh current track and retry
 * 
 * Required for providers like Gaana where streaming URLs expire after a period.
 */

export class URLRefreshLogic {
  private static instance: URLRefreshLogic;
  private subscription: any;
  private lastActiveTimestamp: number = Date.now();
  private lastBackgroundTimestamp: number = 0;

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
   * Initialize the URL refresh logic
   */
  initialize() {
    if (this.subscription) {
      return;
    }

    const { AppState } = require('react-native');
    AppState.addEventListener('change', (nextState: string) => {
      if (nextState === 'active') {
        this.lastActiveTimestamp = Date.now();
      } else if (nextState === 'background') {
        this.lastBackgroundTimestamp = Date.now();
      }
    });

    this.subscription = AudioPro.addEventListener((event) => {
      if (event.type === AudioProEventType.TRACK_CHANGED) {
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

        const { index } = event.payload || {};
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
        // Error Recovery: Refresh the next track first, then skip to it.
        // We can't just skip blindly — the sliding window refresh from TRACK_CHANGED
        // may not have completed yet (the error fires almost instantly).
        const { index } = event.payload || {};
        const errorMessage = event.payload?.error || 'Unknown error';

        if (typeof index === 'number') {
          if (__DEV__) {
            console.log(`[URLRefresh] Playback error at index ${index}: ${errorMessage}. Refreshing next track then skipping.`);
          }
          debugLogger.log('URL_REFRESH', `Error at index ${index}, refreshing next then skipping`);

          AudioPro.getMediaItems().then(async (queue) => {
            const nextIndex = index + 1;
            if (nextIndex < queue.length) {
              const nextTrack = queue[nextIndex];
              if (nextTrack) {
                await this.refreshTrackUrl(nextIndex, nextTrack);
              }
            }
            AudioPro.seekToNextMediaItem();
          });
        }
      }
    });

    if (__DEV__) {
      console.log('[URLRefresh] Initialized (Optimized Sliding Window + Error Recovery)');
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
  }
}

export const urlRefreshLogic = URLRefreshLogic.getInstance();
